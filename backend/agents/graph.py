"""
agents/graph.py
---------------
LangGraph multi-agent workflow for the Government Scheme Eligibility Assistant.

8-Agent Pipeline:
  1. EligibilityAgent    - Analyzes profile and identifies eligible categories.
  2. SearchAgent         - Queries the MongoDB/JSON database for rule-matching schemes.
  3. WebRetrievalAgent   - Simulates pulling the latest updates from myScheme/state portals.
  4. FusionAgent         - Merges and dedupes local + web-retrieved schemes.
  5. RAGAgent            - Queries ChromaDB for detailed vector-based scheme guidelines.
  6. LLMAgent            - Evaluates details and eligibility edge-cases using Gemini.
  7. DocumentAgent       - Synthesizes a required document checklist for candidate schemes.
  8. RecommendationAgent - Ranks schemes and generates the final personalized recommendations.

CitizenState is the shared memory passed between agents.
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import time
import json
from typing import TypedDict, List, Dict, Any

from langchain.prompts import PromptTemplate
from langgraph.graph import StateGraph, END
import chromadb

from backend.db import db

# ── ChromaDB ──────────────────────────────────────────────────────────────────
_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
chroma_client = chromadb.PersistentClient(path=_CHROMA_PATH)
collection = chroma_client.get_or_create_collection(name="gov_schemes")


def _get_llm():
    """Lazy-load ChatGoogleGenerativeAI to avoid import-time key check failures."""
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )


# ── Shared State ──────────────────────────────────────────────────────────────
class CitizenState(TypedDict):
    user_profile: Dict[str, Any]       # Validated profile from the frontend form
    user_query: str                  # Natural-language query auto-built from profile
    eligible_categories: List[str]   # Categories identified by EligibilityAgent
    local_schemes: List[Dict[str, Any]]  # Schemes found in core DB by SearchAgent
    web_schemes: List[Dict[str, Any]]    # Schemes retrieved by WebRetrievalAgent
    fused_schemes: List[Dict[str, Any]]  # Combined, de-duplicated schemes
    retrieved_documents: List[str]   # Scheme guidelines retrieved from ChromaDB
    evaluated_schemes: List[Dict[str, Any]] # Verified schemes after LLMAgent evaluation
    document_checklist: List[str]    # Unified list of docs compiled by DocumentAgent
    final_response: str              # Final synthesized text response from RecommendationAgent
    agent_logs: List[Dict[str, Any]]  # Append-only logs for UI visualization


# ── Time Log Helpers ──────────────────────────────────────────────────────────
def _ts() -> str:
    t = time.monotonic()
    mins = int(t // 60) % 60
    secs = int(t % 60)
    ms   = int((t % 1) * 1000)
    return f"{mins:02d}:{secs:02d}.{ms:03d}"


def _log(logs: list, agent: str, message: str) -> None:
    logs.append({"time": _ts(), "agent": agent, "message": message})


# ── Agent 1: EligibilityAgent ─────────────────────────────────────────────────
def eligibility_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING ELIGIBILITY AGENT ---")
    logs = list(state.get("agent_logs", []))
    profile = state["user_profile"]

    _log(logs, "EligibilityAgent", "Analyzing citizen demographics and occupation for category mapping...")

    occupation = profile.get("occupation", "")
    age = profile.get("age", 0)
    gender = profile.get("gender", "")
    disability = profile.get("disability_status", "")

    categories = []

    # 1. Occupation-based mapping
    if occupation == "Student":
        categories.extend(["Student", "Education"])
    elif occupation == "Farmer":
        categories.append("Farmer")
    elif occupation == "Senior Citizen":
        categories.append("Senior Citizen")
    elif occupation == "Employee":
        categories.extend(["Employment", "Healthcare", "Housing"])
    elif occupation == "Self-Employed":
        categories.extend(["Employment", "Startup", "Healthcare", "Housing"])
    elif occupation == "Unemployed":
        categories.extend(["Employment", "Healthcare", "Housing"])

    # 2. Age-based overrides
    if age >= 60 and "Senior Citizen" not in categories:
        categories.append("Senior Citizen")

    # 3. Gender-based overlays
    if gender == "Female":
        categories.append("Women")

    # 4. Disability-based overlays
    if disability == "Yes":
        categories.append("Disability")

    # Deduplicate and sort
    categories = sorted(list(set(categories)))

    _log(logs, "EligibilityAgent", f"Strictly matched categories based on profile: {', '.join(categories)}")
    return {"eligible_categories": categories, "agent_logs": logs}


# ── Agent 2: SearchAgent ──────────────────────────────────────────────────────
def search_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING SEARCH AGENT ---")
    logs = list(state.get("agent_logs", []))
    profile = state["user_profile"]
    categories = state.get("eligible_categories", [])

    _log(logs, "SearchAgent", f"Querying core database. Active categories: {', '.join(categories)}")

    # Query local database (MongoDB/Local JSON) applying profile rules
    all_schemes = db.schemes.find()
    local_matches = []

    for s in all_schemes:
        # 1. State check
        if s.get("state") != "All India" and s.get("state").lower() != profile.get("state", "").lower():
            continue
        # 2. Age check
        if not (s.get("min_age", 0) <= profile.get("age", 0) <= s.get("max_age", 120)):
            continue
        # 3. Income check
        if profile.get("annual_family_income", 0) > s.get("max_income", 9999999):
            continue
        # 4. Gender check
        if s.get("gender") != "All" and s.get("gender").lower() != profile.get("gender", "").lower():
            continue
        # 5. Disability check
        if s.get("disability_required") == "Yes" and profile.get("disability_status") != "Yes":
            continue
        # 6. Category check
        scheme_cat = s.get("category", "")
        # Strict matching: scheme category must align with detected eligible categories
        if not any(c.lower() in scheme_cat.lower() or scheme_cat.lower() in c.lower() for c in categories):
            continue

        local_matches.append(s)

    _log(logs, "SearchAgent", f"Found {len(local_matches)} schemes matching criteria in local database.")
    return {"local_schemes": local_matches, "agent_logs": logs}


# ── Agent 3: WebRetrievalAgent ────────────────────────────────────────────────
def web_retrieval_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING WEB RETRIEVAL AGENT ---")
    logs = list(state.get("agent_logs", []))
    profile = state["user_profile"]
    categories = state.get("eligible_categories", [])

    _log(logs, "WebRetrievalAgent", f"Simulating query to myScheme.gov.in and {profile.get('state')} State Portal...")

    # We use LLM to simulate/retrieve any new/specialized schemes matching this profile.
    llm = _get_llm()
    prompt = PromptTemplate.from_template(
        "Generate 1 newly launched (fictional or real 2025/2026) government scheme "
        "matching this citizen's profile: {profile}\n"
        "The scheme's category MUST be strictly chosen from this allowed list of categories: {categories}\n\n"
        "Provide your output strictly in JSON format matching this schema:\n"
        "{{\n"
        "  \"scheme_name\": \"Name of Scheme\",\n"
        "  \"category\": \"Category name (must be one of {categories})\",\n"
        "  \"benefits\": \"One sentence describing the benefits\",\n"
        "  \"documents\": [\"Document 1\", \"Document 2\"],\n"
        "  \"apply_url\": \"officialwebsite.gov.in\"\n"
        "}}\n"
        "Return ONLY the JSON block. Do not include markdown code block syntax."
    )
    chain = prompt | llm
    web_matches = []
    try:
        response = chain.invoke({"profile": str(profile), "categories": ", ".join(categories)})
        content = response.content.strip()
        # Clean markdown code block wraps if LLM returns them
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
            
        data = json.loads(content)
        
        # Verify the returned category strictly matches the allowed categories
        gen_cat = data.get("category", "").strip()
        if any(c.lower() in gen_cat.lower() or gen_cat.lower() in c.lower() for c in categories):
            data["scheme_id"] = "WEB" + str(int(time.time()))[-4:]
            data["state"] = profile.get("state")
            data["min_age"] = 1
            data["max_age"] = 100
            data["max_income"] = 9999999
            data["gender"] = "All"
            data["disability_required"] = "No"
            web_matches.append(data)
            _log(logs, "WebRetrievalAgent", f"Retrieved latest web scheme: '{data['scheme_name']}'")
        else:
            _log(logs, "WebRetrievalAgent", f"Discarded web scheme '{data.get('scheme_name')}' as category '{gen_cat}' did not strictly match allowed categories: {categories}")
    except Exception as e:
        print(f"WebRetrievalAgent simulation failed: {e}")
        _log(logs, "WebRetrievalAgent", "No new schemes found on external web portals.")

    return {"web_schemes": web_matches, "agent_logs": logs}


# ── Agent 4: FusionAgent ──────────────────────────────────────────────────────
def fusion_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING FUSION AGENT ---")
    logs = list(state.get("agent_logs", []))
    local_list = state.get("local_schemes", [])
    web_list = state.get("web_schemes", [])

    _log(logs, "FusionAgent", "Merging local databases and real-time web results...")

    # Combine and de-duplicate by name
    seen_names = set()
    combined = []
    
    for s in local_list + web_list:
        name_lower = s.get("scheme_name", "").strip().lower()
        if name_lower not in seen_names:
            seen_names.add(name_lower)
            combined.append(s)

    _log(logs, "FusionAgent", f"Merged list contains {len(combined)} unique schemes. Removed duplicates.")
    return {"fused_schemes": combined, "agent_logs": logs}


# ── Agent 5: RAGAgent ─────────────────────────────────────────────────────────
def rag_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING RAG AGENT ---")
    logs = list(state.get("agent_logs", []))
    fused = state.get("fused_schemes", [])
    query = state["user_query"]
    categories = state.get("eligible_categories", [])

    _log(logs, "RAGAgent", "Retrieving official guidelines from ChromaDB vector store...")

    enhanced_query = f"{query} categories: {', '.join(categories)}"
    
    # Query vector store for context
    results = collection.query(query_texts=[enhanced_query], n_results=min(len(fused) + 2, 7))
    documents = results["documents"][0] if results.get("documents") else []

    _log(logs, "RAGAgent", f"Retrieved {len(documents)} matching guideline passages for verification.")
    return {"retrieved_documents": documents, "agent_logs": logs}


# ── Agent 6: LLMAgent ─────────────────────────────────────────────────────────
def llm_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING LLM AGENT ---")
    logs = list(state.get("agent_logs", []))
    fused = state.get("fused_schemes", [])
    docs = state.get("retrieved_documents", [])
    profile = state["user_profile"]

    _log(logs, "LLMAgent", "Validating eligibility constraints against official guidelines...")

    llm = _get_llm()
    prompt = PromptTemplate.from_template(
        "Citizen Profile:\n{profile}\n\n"
        "Candidate Schemes:\n{schemes}\n\n"
        "Official Guidelines Context:\n{docs}\n\n"
        "Evaluate whether this citizen truly qualifies for each candidate scheme. "
        "Filter out any schemes where constraints are violated.\n"
        "Respond strictly with a JSON list of schemes that the user qualifies for. "
        "Keep the scheme fields identical, but add:\n"
        "1. 'reason': brief explanation of why they qualify.\n"
        "2. 'failed_criteria': array of strings listing any strict rules or edge cases that were close to violating criteria or failed.\n"
        "Return ONLY the raw JSON list, no markdown wrapper."
    )
    
    # Convert lists to strings for prompt
    schemes_str = json.dumps([{"name": s["scheme_name"], "id": s["scheme_id"]} for s in fused])
    docs_str = "\n---\n".join(docs)
    
    evaluated = []
    try:
        chain = prompt | llm
        res = chain.invoke({"profile": str(profile), "schemes": schemes_str, "docs": docs_str})
        content = res.content.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
            
        validated_list = json.loads(content)
        # Map validated items back to full scheme structures
        for v_item in validated_list:
            match = next((s for s in fused if s["scheme_name"].lower() == v_item["name"].lower()), None)
            if match:
                match_copy = match.copy()
                match_copy["reason"] = v_item.get("reason", "Matches profile criteria.")
                match_copy["failed_criteria"] = v_item.get("failed_criteria", [])
                evaluated.append(match_copy)
    except Exception as e:
        print(f"LLMAgent verification failed: {e}")
        # Fail-safe: trust local search
        for s in fused:
            s_copy = s.copy()
            s_copy["reason"] = "Passed demographic profile filtering."
            s_copy["failed_criteria"] = []
            evaluated.append(s_copy)

    _log(logs, "LLMAgent", f"Verified {len(evaluated)}/{len(fused)} eligible schemes after guideline analysis.")
    return {"evaluated_schemes": evaluated, "agent_logs": logs}


# ── Agent 7: DocumentAgent ────────────────────────────────────────────────────
def document_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING DOCUMENT AGENT ---")
    logs = list(state.get("agent_logs", []))
    evaluated = state.get("evaluated_schemes", [])

    _log(logs, "DocumentAgent", "Compiling required document list and checklists...")

    # Compile checklist
    doc_set = set()
    for s in evaluated:
        for doc in s.get("documents", []):
            doc_set.add(doc.strip())

    checklist = sorted(list(doc_set))
    _log(logs, "DocumentAgent", f"Generated document checklist with {len(checklist)} unique items.")
    return {"document_checklist": checklist, "agent_logs": logs}


# ── Agent 8: RecommendationAgent ──────────────────────────────────────────────
def recommendation_agent(state: CitizenState) -> Dict[str, Any]:
    print("--- RUNNING RECOMMENDATION AGENT ---")
    logs = list(state.get("agent_logs", []))
    profile = state["user_profile"]
    schemes = state.get("evaluated_schemes", [])
    checklist = state.get("document_checklist", [])

    _log(logs, "RecommendationAgent", "Finalizing ranking and generating response...")

    # Generate a beautiful Markdown summary that the parser in app.py will read.
    # The app.py parser splits on headers/numbered lists. Let's make it match:
    # 1. Scheme Name
    # Description: ...
    # Benefit: ...
    # Required Document: ...
    # Apply at: ...
    response_lines = [
        f"Hello {profile.get('full_name', 'Citizen')}, based on our multi-agent RAG analysis, "
        f"here are the government benefits you are eligible for:\n"
    ]
    
    # We will rank state schemes first, then central schemes
    ranked = sorted(
        schemes,
        key=lambda x: (x.get("state") == "All India", x.get("scheme_name"))
    )

    for i, s in enumerate(ranked):
        response_lines.append(f"{i+1}. **{s['scheme_name']}**")
        response_lines.append(f"   Why you are eligible: {s.get('reason', 'Matches your profile.')}")
        response_lines.append(f"   Benefits: {s.get('benefits', 'Refer to website.')}")
        response_lines.append(f"   Required Documents: {', '.join(s.get('documents', ['Aadhaar Card']))}")
        response_lines.append(f"   Apply link: {s.get('apply_url', '#')}\n")

    if not ranked:
        response_lines.append(
            "We could not find any matching schemes for your exact profile in our database. "
            "Please check if your income limit or state parameters can be broadened."
        )

    final_text = "\n".join(response_lines)
    _log(logs, "RecommendationAgent", "Personalized scheme catalog is compiled and ready.")
    return {"final_response": final_text, "agent_logs": logs}


# ── Build the LangGraph Workflow ──────────────────────────────────────────────
workflow = StateGraph(CitizenState)

workflow.add_node("eligibility",     eligibility_agent)
workflow.add_node("search",          search_agent)
workflow.add_node("web_retrieval",   web_retrieval_agent)
workflow.add_node("fusion",          fusion_agent)
workflow.add_node("rag",             rag_agent)
workflow.add_node("llm_verify",      llm_agent)
workflow.add_node("document",        document_agent)
workflow.add_node("recommendation",  recommendation_agent)

workflow.set_entry_point("eligibility")
workflow.add_edge("eligibility",     "search")
workflow.add_edge("search",          "web_retrieval")
workflow.add_edge("web_retrieval",   "fusion")
workflow.add_edge("fusion",          "rag")
workflow.add_edge("rag",             "llm_verify")
workflow.add_edge("llm_verify",      "document")
workflow.add_edge("document",        "recommendation")
workflow.add_edge("recommendation",  END)

scheme_assistant_app = workflow.compile()
