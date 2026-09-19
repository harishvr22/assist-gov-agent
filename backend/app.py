"""
app.py — Flask backend for the Agentic Government Scheme Eligibility Assistant
==============================================================================

Run:
    python -m backend.app

Endpoints:
    POST /api/auth/register      — Register a citizen
    POST /api/auth/login         — Login a citizen
    POST /api/profile            — Create/update citizen profile
    POST /api/eligibility        — Run 8-agent LangGraph pipeline (alias: /api/check-eligibility)
    GET  /api/schemes            — List all schemes in database (supports search/filter)
    GET  /api/schemes/<id>       — Get details of a single scheme
    POST /api/save-scheme        — Bookmark a scheme
    GET  /api/saved-schemes      — List bookmarked schemes for a user
    GET  /api/notifications      — List alerts and scheme updates
    POST /api/chat               — Chatbot interface with RAG
    GET  /api/admin/stats        — System analytics for admin
    POST /api/admin/schemes      — Admin route to add a scheme
    DELETE /api/admin/schemes/<id> — Admin route to delete a scheme
    GET  /api/health             — Health check
"""

import sys
import os
# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import re
import time
import logging
from datetime import datetime, timedelta
import jwt
import bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from backend.validators import validate_profile
from backend.agents import scheme_assistant_app
from backend.db import db
from backend.agents.seed import seed_schemes

# ── Bootstrap ─────────────────────────────────────────────────────────────────
load_dotenv()
seed_schemes() # Automatically seeds if database/vector store are empty

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


# ── Response parser ───────────────────────────────────────────────────────────
def _parse_schemes_from_llm(llm_text: str, docs: list[str]) -> list[dict]:
    """
    Converts the LLM's free-text recommendations into structured scheme cards
    that match the frontend's expected schema.
    """
    sections = re.split(
        r"\n(?=\d+[\.\)]\s+|\*\*\d+[\.\)]|\#{1,3}\s+|\*\*[^*]+\*\*|(?:\d+\.\s+\*\*))",
        llm_text.strip(),
    )
    sections = [s.strip() for s in sections if len(s.strip()) > 15]

    url_map: dict[str, str] = {}
    for doc in docs:
        url_match = re.search(r"Apply(?:\s+at|\s+link)?[:\s]+([^\s,]+\.(?:gov\.in|org\.in|nic\.in|in|com))",
                              doc, re.IGNORECASE)
        name_match = re.search(r"Scheme Name: ([^\n]+)", doc, re.IGNORECASE)
        if url_match and name_match:
            key = name_match.group(1).strip().lower()
            url_map[key] = url_match.group(1).strip()

    schemes = []
    base_score = 95
    _SKIP_PATTERNS = (
        "namaste", "hello", "hi ", "great", "here are", "based on",
        "i've identified", "i have identified", "below are", "following are",
        "let me", "sure", "as a ", "you are", "good news", "i understand",
        "i'm here", "i am here", "please note", "all the best", "good luck",
        "hope this", "these are", "the following",
    )
    for i, section in enumerate(sections[:10]):
        lines = [l.strip() for l in section.splitlines() if l.strip()]
        if not lines:
            continue

        raw_name = re.sub(r"^[\d\.\*\#\s]+", "", lines[0]).rstrip(":").strip()
        raw_name = re.sub(r"\*+", "", raw_name).strip()
        if len(raw_name) < 4:
            continue
        if any(raw_name.lower().startswith(p) for p in _SKIP_PATTERNS):
            continue
        if len(raw_name) > 85 and re.search(
            r"\b(you|your|I|we|here|this|these|those|please)\b",
            raw_name, re.IGNORECASE
        ):
            continue

        # Extract Description / Reason
        description = ""
        for line in lines[1:]:
            clean = re.sub(r"\*+", "", line).strip()
            if len(clean) > 20 and not any(clean.lower().startswith(x) for x in ("required", "benefit", "document", "apply", "website")):
                description = clean
                break

        # Benefits
        benefits = []
        in_benefits = False
        for line in lines:
            lower = line.lower()
            if any(kw in lower for kw in ("benefit", "provides", "offers", "gives")):
                in_benefits = True
                continue
            if in_benefits and any(kw in lower for kw in ("required", "document", "apply", "where", "eligib")):
                in_benefits = False
            if in_benefits:
                clean = re.sub(r"^[-•*\d\.\s]+", "", line).strip()
                if clean and len(clean) > 5:
                    benefits.append(clean)

        # Required documents
        req_docs = []
        in_docs = False
        for line in lines:
            lower = line.lower()
            if any(kw in lower for kw in ("required document", "documents required", "documents needed", "required:", "checklist:")):
                in_docs = True
                continue
            if in_docs and any(kw in lower for kw in ("apply", "where", "website", "benefit", "link")):
                in_docs = False
            if in_docs:
                clean = re.sub(r"^[-•*\d\.\s]+", "", line).strip()
                if clean and len(clean) > 3:
                    req_docs.append(clean)

        # Apply URL
        apply_url = "#"
        url_in_section = re.search(
            r"(https?://[^\s]+|[\w]+\.(?:gov\.in|nic\.in|org\.in|com|net))",
            section, re.IGNORECASE,
        )
        if url_in_section:
            u = url_in_section.group(1)
            apply_url = u if u.startswith("http") else f"https://{u}"
        else:
            for key, url in url_map.items():
                if key in raw_name.lower():
                    apply_url = f"https://{url}" if not url.startswith("http") else url
                    break

        schemes.append({
            "name":               raw_name,
            "match_percent":      max(base_score - i * 6, 40),
            "description":        description or f"Matches your profile: {raw_name}",
            "benefits":           benefits or ["Direct scheme benefits apply according to guidelines."],
            "required_documents": req_docs or ["Aadhaar Card", "Bank account details", "Income Certificate"],
            "apply_url":          apply_url,
        })

    return schemes


def serialize_doc(doc):
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(cursor_or_list):
    return [serialize_doc(doc) for doc in cursor_or_list]


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "gov-scheme-eligibility-backend"})


JWT_SECRET = os.getenv("JWT_SECRET", "govassist_fallback_secret_key")

def get_current_user_from_request():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    try:
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        token = parts[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        return None


# ── Authentication ────────────────────────────────────────────────────────────
@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    pwd = str(data.get("pwd", "")).strip()
    age = data.get("age")
    gender = data.get("gender")
    state = data.get("state")
    occupation = data.get("occupation")
    education = data.get("education")
    income = data.get("income")

    if not name or not email or not pwd:
        return jsonify({"status": "error", "message": "Name, email, and password are required"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"status": "error", "message": "Email is already registered"}), 400

    # Hash password
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(pwd.encode('utf-8'), salt).decode('utf-8')

    user_doc = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "age": int(age) if age else None,
        "gender": gender or None,
        "state": state or None,
        "occupation": occupation or None,
        "education": education or None,
        "income": income or None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = db.users.insert_one(user_doc)
    if hasattr(result, "inserted_id"):
        user_id = str(result.inserted_id)
    elif isinstance(result, dict) and "_id" in result:
        user_id = str(result["_id"])
    else:
        user_id = str(user_doc.get("_id", ""))

    token = jwt.encode(
        {"id": user_id, "email": email, "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )

    user_res = {
        "id": user_id,
        "name": name,
        "email": email,
        "age": user_doc["age"],
        "gender": user_doc["gender"],
        "state": user_doc["state"],
        "occupation": user_doc["occupation"],
        "education": user_doc["education"],
        "income": user_doc["income"],
        "annual_family_income": user_doc.get("annual_family_income"),
        "category": user_doc.get("category"),
        "disability_status": user_doc.get("disability_status"),
        "created_at": user_doc["created_at"]
    }

    return jsonify({
        "status": "success",
        "message": "Registration successful",
        "user": user_res,
        "token": token
    }), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    pwd = str(data.get("pwd", "")).strip()

    if not email or not pwd:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400

    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    password_hash = user.get("password_hash") or ""
    if not password_hash or not bcrypt.checkpw(pwd.encode('utf-8'), password_hash.encode('utf-8')):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    user_id = str(user.get("_id") or user.get("id"))
    token = jwt.encode(
        {"id": user_id, "email": email, "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )

    user_res = {
        "id": user_id,
        "name": user.get("name"),
        "email": email,
        "age": user.get("age"),
        "gender": user.get("gender"),
        "state": user.get("state"),
        "occupation": user.get("occupation"),
        "education": user.get("education"),
        "income": user.get("income"),
        "annual_family_income": user.get("annual_family_income"),
        "category": user.get("category"),
        "disability_status": user.get("disability_status"),
        "created_at": user.get("created_at")
    }

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": user_res,
        "token": token
    }), 200


@app.get("/api/auth/me")
def me():
    payload = get_current_user_from_request()
    if not payload:
        return jsonify({"status": "error", "message": "Access token missing or invalid"}), 401

    user_id = payload.get("id")
    user = None
    try:
        from bson import ObjectId
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = db.users.find_one({"_id": user_id})
    if not user:
        user = db.users.find_one({"id": user_id})

    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    user_res = {
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "state": user.get("state"),
        "occupation": user.get("occupation"),
        "education": user.get("education"),
        "income": user.get("income"),
        "annual_family_income": user.get("annual_family_income"),
        "category": user.get("category"),
        "disability_status": user.get("disability_status"),
        "created_at": user.get("created_at")
    }

    return jsonify({
        "status": "success",
        "user": user_res
    }), 200


# ── Profile ───────────────────────────────────────────────────────────────────
@app.post("/api/profile")
def update_profile():
    payload = get_current_user_from_request()
    user_id = payload.get("id") if payload else None
    
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    
    user = None
    if user_id:
        try:
            from bson import ObjectId
            user = db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            pass
        if not user:
            user = db.users.find_one({"_id": user_id})
    elif email:
        user = db.users.find_one({"email": email})
        
    if not user:
        return jsonify({"status": "error", "message": "User not found or unauthorized"}), 404

    profile_data = data.get("profile", {})
    if not profile_data:
        profile_data = data

    profile, errors = validate_profile(profile_data)
    if errors:
        return jsonify({"status": "error", "message": "Validation failed.", "errors": errors}), 422

    user_key = {"_id": user["_id"]}
    db.users.update_one(user_key, {"$set": {
        "age": profile["age"],
        "gender": profile["gender"],
        "state": profile["state"],
        "district": profile["district"],
        "annual_family_income": profile["annual_family_income"],
        "occupation": profile["occupation"],
        "category": profile["category"],
        "disability_status": profile["disability_status"]
    }})

    return jsonify({"status": "success", "profile": profile}), 200


# ── Eligibility (LangGraph Multi-Agent RAG Pipeline) ───────────────────────────
@app.post("/api/eligibility")
@app.post("/api/check-eligibility")
def check_eligibility():
    start_ms = time.time()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"status": "error", "message": "Request body must be valid JSON"}), 400

    # Read profile and validate
    profile, errors = validate_profile(data)
    if errors:
        return jsonify({"status": "error", "message": "Validation failed.", "errors": errors}), 422

    # Natural-language query formulation
    user_query = (
        f"What schemes is a {profile['age']}-year-old {profile['gender'].lower()} "
        f"{profile['occupation'].lower()} from {profile['state']} eligible for?"
    )

    try:
        initial_state = {
            "user_profile":        profile,
            "user_query":          user_query,
            "eligible_categories": [],
            "local_schemes":       [],
            "web_schemes":         [],
            "fused_schemes":       [],
            "retrieved_documents": [],
            "evaluated_schemes":   [],
            "document_checklist":  [],
            "final_response":      "",
            "agent_logs":          [],
        }
        result = scheme_assistant_app.invoke(initial_state)

        # Log query for analytics
        db.queries.insert_one({
            "type": "eligibility",
            "timestamp": time.time(),
            "profile": profile,
            "result_count": len(result.get("evaluated_schemes", []))
        })

    except Exception as exc:
        logger.exception("LangGraph multi-agent pipeline error")
        return jsonify({"status": "error", "message": f"Pipeline error: {exc}"}), 500

    schemes = _parse_schemes_from_llm(
        result["final_response"],
        result["retrieved_documents"],
    )
    if not schemes and result.get("evaluated_schemes"):
        for s in result["evaluated_schemes"]:
            schemes.append({
                "name":               s.get("scheme_name", "Government Scheme"),
                "match_percent":      92,
                "description":        s.get("reason", s.get("benefits", "Eligible under demographic profile criteria.")),
                "benefits":           [s.get("benefits")] if isinstance(s.get("benefits"), str) else (s.get("benefits") or ["Direct scheme benefits apply."]),
                "required_documents": s.get("documents") or ["Aadhaar Card", "Income Certificate"],
                "apply_url":          s.get("apply_url", "#")
            })

    # Compile the status of the 8 agents
    agent_status = {
        "eligibility_agent":    "complete",
        "search_agent":         "complete",
        "web_retrieval_agent":  "complete",
        "fusion_agent":         "complete",
        "rag_agent":            "complete",
        "llm_agent":            "complete",
        "document_agent":       "complete",
        "recommendation_agent": "complete",
    }

    elapsed_ms = round((time.time() - start_ms) * 1000)

    # Insert default notifications occasionally
    if len(schemes) > 0:
        db.notifications.update_one(
            {"title": "New Eligible Schemes Found"},
            {"$set": {
                "title": "New Eligible Schemes Found",
                "message": f"Based on your profile, you match {len(schemes)} schemes! Review them on your dashboard.",
                "timestamp": time.time(),
                "read": False
            }},
            upsert=True
        )

    return jsonify({
        "status": "success",
        "processing_time_ms": elapsed_ms,
        "agent_status": agent_status,
        "agent_logs": result["agent_logs"],
        "schemes": schemes,
        "llm_full_response": result["final_response"],
        "document_checklist": result.get("document_checklist", []),
        "meta": {
            "detected_categories": result["eligible_categories"],
            "retrieved_sources": result["retrieved_documents"],
            "schemes_returned": len(schemes),
        }
    }), 200


# ── Scheme Catalog Discovery ──────────────────────────────────────────────────
@app.get("/api/schemes")
def get_schemes():
    category = request.args.get("category", "").strip()
    state = request.args.get("state", "").strip()
    search = request.args.get("search", "").strip()

    query = {}
    if category:
        query["category"] = category
    if state:
        query["state"] = state

    schemes = list(db.schemes.find(query))

    # Basic text search if needed
    if search:
        search_lower = search.lower()
        schemes = [
            s for s in schemes
            if search_lower in s.get("scheme_name", "").lower() or
               search_lower in s.get("benefits", "").lower()
        ]

    schemes_list = serialize_docs(schemes)
    return jsonify({
        "total": len(schemes_list),
        "schemes": schemes_list
    })


@app.get("/api/schemes/<id>")
def get_scheme_by_id(id):
    scheme = db.schemes.find_one({"scheme_id": id})
    if not scheme:
        return jsonify({"status": "error", "message": "Scheme not found"}), 404
    return jsonify(serialize_doc(scheme)), 200


# ── Saved Schemes ─────────────────────────────────────────────────────────────
@app.post("/api/save-scheme")
def save_scheme():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "") or data.get("email", "")).strip()
    scheme_id = str(data.get("scheme_id", "")).strip()

    if not username or not scheme_id:
        return jsonify({"status": "error", "message": "Username or email and scheme_id are required"}), 400

    bookmark = {"username": username, "scheme_id": scheme_id}
    # Check if already bookmarked
    if db.saved_schemes.find_one(bookmark):
        # Unbookmark (toggle behaviour)
        db.saved_schemes.delete_one(bookmark)
        return jsonify({"status": "success", "saved": False, "message": "Scheme removed from bookmarks"}), 200
    
    db.saved_schemes.insert_one(bookmark)
    return jsonify({"status": "success", "saved": True, "message": "Scheme added to bookmarks"}), 200


@app.get("/api/saved-schemes")
def get_saved_schemes():
    username = request.args.get("username", "").strip() or request.args.get("email", "").strip()
    if not username:
        return jsonify({"status": "error", "message": "Username or email is required"}), 400

    bookmarks = db.saved_schemes.find({"username": username})
    saved_ids = [b["scheme_id"] for b in bookmarks]

    # Fetch corresponding scheme details
    schemes = db.schemes.find({"scheme_id": {"$in": saved_ids}})
    return jsonify({"schemes": serialize_docs(schemes)}), 200


# ── Notifications ─────────────────────────────────────────────────────────────
@app.get("/api/notifications")
def get_notifications():
    # Return notifications list, inserting a default one if empty
    notifs = list(db.notifications.find())
    if not notifs:
        default_notif = {
            "title": "Welcome to Scheme Assistant",
            "message": "Update your profile to discover eligible schemes and track required documents.",
            "timestamp": time.time(),
            "read": False
        }
        db.notifications.insert_one(default_notif)
        notifs = [default_notif]
        
    return jsonify({"notifications": serialize_docs(notifs)}), 200


# ── RAG Chatbot ───────────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    username = str(data.get("username", "anonymous")).strip()
    profile = data.get("profile", {})

    if not message:
        return jsonify({"status": "error", "message": "Message cannot be empty"}), 400

    # 1. Classify User Intent & Entities
    from backend.intent_classifier import classify_intent
    intent_data = classify_intent(message)

    # 2. Fetch Multi-Turn Conversation History for Session
    history_docs = db.queries.find({"type": "chat", "username": username})
    past_messages = []
    for h in history_docs[-6:]: # Last 3 turns
        past_messages.append(f"User: {h.get('message')}\nAssistant: {h.get('reply')}")
    history_str = "\n".join(past_messages) if past_messages else "No previous conversation turns."

    # 3. Query vector database for RAG context
    try:
        import chromadb
        _CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
        client = chromadb.PersistentClient(path=_CHROMA_PATH)
        col = client.get_or_create_collection(name="gov_schemes")
        results = col.query(query_texts=[message], n_results=3)
        context_docs = results["documents"][0] if results.get("documents") else []
        context_str = "\n---\n".join(context_docs)
    except Exception:
        context_str = "No specific guidelines available in vector store."

    # 4. Invoke Gemini with Multi-Turn Memory & Intent Context
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain.prompts import PromptTemplate
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )
        
        prompt = PromptTemplate.from_template(
            "You are a helpful GovTech assistant.\n"
            "Detected Intent: {primary_intent} (Confidence: {confidence})\n"
            "Help the citizen answer their questions using the provided context details and conversation history.\n\n"
            "Citizen Profile details: {profile}\n\n"
            "Multi-Turn Conversation History:\n{history}\n\n"
            "ChromaDB Scheme Context Guidelines:\n{context}\n\n"
            "User Message: {message}\n\n"
            "Explain in clear, simple paragraphs. Support Hindi/Tamil translations or simple English definitions if asked."
        )
        
        chain = prompt | llm
        response = chain.invoke({
            "primary_intent": intent_data["primary_intent"],
            "confidence": intent_data["confidence"],
            "profile": str(profile),
            "history": history_str,
            "context": context_str,
            "message": message
        })
        reply = response.content
    except Exception as e:
        reply = f"I'm sorry, I encountered an issue querying the AI service: {e}"

    # Log query and persist multi-turn history
    db.queries.insert_one({
        "type": "chat",
        "username": username,
        "timestamp": time.time(),
        "intent": intent_data["primary_intent"],
        "message": message,
        "reply": reply
    })

    return jsonify({
        "reply": reply,
        "intent": intent_data
    }), 200


# ── Admin Dashboard Analytics ─────────────────────────────────────────────────
@app.get("/api/admin/stats")
def get_admin_stats():
    total_schemes = db.schemes.count_documents({})
    total_users = db.users.count_documents({})
    total_searches = db.queries.count_documents({})

    # Calculate category counts
    all_schemes = db.schemes.find()
    category_counts = {}
    for s in all_schemes:
        cat = s.get("category", "General")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return jsonify({
        "total_schemes": total_schemes,
        "total_users": total_users,
        "total_searches": total_searches,
        "category_counts": category_counts,
        "popular_schemes": [
            {"name": "PM Kisan Samman Nidhi", "searches": 48},
            {"name": "Sukanya Samriddhi Yojana", "searches": 39},
            {"name": "Tamil Nadu Free Laptop Scheme", "searches": 32},
            {"name": "Ayushman Bharat PM-JAY", "searches": 28}
        ]
    }), 200


@app.post("/api/admin/schemes")
def admin_add_scheme():
    data = request.get_json(silent=True) or {}
    name = str(data.get("scheme_name", "")).strip()
    category = str(data.get("category", "")).strip()
    state = str(data.get("state", "All India")).strip()
    min_age = int(data.get("min_age", 1))
    max_age = int(data.get("max_age", 100))
    max_income = int(data.get("max_income", 9999999))
    gender = str(data.get("gender", "All")).strip()
    disability = str(data.get("disability_required", "No")).strip()
    benefits = str(data.get("benefits", "")).strip()
    documents = data.get("documents", [])
    apply_url = str(data.get("apply_url", "#")).strip()

    if not name or not category or not benefits:
        return jsonify({"status": "error", "message": "Name, Category, and Benefits are required"}), 400

    # Auto generate ID
    scheme_id = "SCH" + str(int(time.time()))[-3:]

    scheme_doc = {
        "scheme_id": scheme_id,
        "scheme_name": name,
        "category": category,
        "state": state,
        "min_age": min_age,
        "max_age": max_age,
        "max_income": max_income,
        "gender": gender,
        "disability_required": disability,
        "benefits": benefits,
        "documents": documents,
        "apply_url": apply_url
    }

    # Add to core DB
    db.schemes.insert_one(scheme_doc)

    # Add to ChromaDB
    try:
        import chromadb
        _CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
        client = chromadb.PersistentClient(path=_CHROMA_PATH)
        col = client.get_or_create_collection(name="gov_schemes")
        
        doc_str = (
            f"Scheme Name: {name}\n"
            f"Category: {category}\n"
            f"State: {state}\n"
            f"Benefits: {benefits}\n"
            f"Eligibility Rules: Age limits {min_age} to {max_age}; "
            f"Max Family Income is ₹{max_income:,}; Applicable to gender: {gender}; "
            f"Disability Required: {disability}.\n"
            f"Required Documents: {', '.join(documents)}.\n"
            f"Apply Link: {apply_url}"
        )
        col.add(documents=[doc_str], ids=[scheme_id])
    except Exception as e:
        logger.error("Failed to add new scheme to ChromaDB: %s", e)

    # Insert notification about new scheme
    db.notifications.insert_one({
        "title": "New Scheme Added",
        "message": f"'{name}' has been added to the catalog under {category} category.",
        "timestamp": time.time(),
        "read": False
    })

    return jsonify({"status": "success", "scheme_id": scheme_id}), 201


@app.delete("/api/admin/schemes/<id>")
def admin_delete_scheme(id):
    # Find scheme name
    scheme = db.schemes.find_one({"scheme_id": id})
    if not scheme:
        return jsonify({"status": "error", "message": "Scheme not found"}), 404

    # Delete from core DB
    db.schemes.delete_one({"scheme_id": id})

    # Delete from ChromaDB
    try:
        import chromadb
        _CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
        client = chromadb.PersistentClient(path=_CHROMA_PATH)
        col = client.get_or_create_collection(name="gov_schemes")
        col.delete(ids=[id])
    except Exception as e:
        logger.error("Failed to delete scheme from ChromaDB: %s", e)

    return jsonify({"status": "success", "message": f"Scheme '{scheme.get('scheme_name')}' deleted successfully"}), 200


@app.post("/api/admin/upload-pdf")
def admin_upload_pdf():
    """Uploads and indexes a policy PDF document into ChromaDB."""
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No PDF file provided in request"}), 400

    file = request.files["file"]
    scheme_name = request.form.get("scheme_name", "").strip() or file.filename.replace(".pdf", "").replace("_", " ")
    category = request.form.get("category", "General").strip()
    state = request.form.get("state", "All India").strip()

    if not file.filename.endswith(".pdf") and not file.filename.endswith(".txt"):
        return jsonify({"status": "error", "message": "File must be a PDF or TXT policy document"}), 400

    # Save temp file
    temp_dir = os.path.join(os.path.dirname(__file__), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        from backend.document_processor import processor
        res = processor.process_and_index_document(
            file_path=temp_path,
            scheme_name=scheme_name,
            category=category,
            state=state
        )
        return jsonify({"status": "success", "data": res}), 201
    except Exception as e:
        logger.exception("PDF processing error")
        return jsonify({"status": "error", "message": f"Document ingestion failed: {e}"}), 500
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

