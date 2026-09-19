"""
intent_classifier.py
--------------------
Zero-shot intent classification and entity extraction module for the Government Scheme Assistant.
Classifies citizen queries into explicit intent categories:
  - ELIGIBILITY_DISCOVERY
  - ELIGIBILITY_CHECKING
  - SCHOLARSHIP_SEARCH
  - BENEFIT_SEARCH
  - DOCUMENT_QUERY
  - APPLICATION_GUIDANCE
  - GENERAL_QUERY
"""

import re
from typing import Dict, Any

INTENT_PATTERNS = {
    "SCHOLARSHIP_SEARCH": [r"\bscholarship\b", r"\bstipend\b", r"\bstudent loan\b", r"\beducation support\b", r"\bfee concession\b"],
    "DOCUMENT_QUERY": [r"\bdocument[s]?\b", r"\bcertificate[s]?\b", r"\bproof\b", r"\bchecklist\b", r"\baadhaar\b"],
    "APPLICATION_GUIDANCE": [r"\bhow to apply\b", r"\bwhere to apply\b", r"\bapplication link\b", r"\bportal\b", r"\bwebsite\b"],
    "BENEFIT_SEARCH": [r"\bamount\b", r"\bmoney\b", r"\bcash\b", r"\bsubsidy\b", r"\bpension\b", r"\bfinancial help\b"],
    "ELIGIBILITY_CHECKING": [r"\bam i eligible\b", r"\bdo i qualify\b", r"\beligibility criteria\b", r"\bage limit\b", r"\bincome cap\b"],
    "ELIGIBILITY_DISCOVERY": [r"\bwhat scheme[s]?\b", r"\bfind scheme[s]?\b", r"\brecommend\b", r"\bsuggest\b", r"\bavailable for me\b"],
}

def classify_intent(message: str) -> Dict[str, Any]:
    """
    Classifies the user query into intent categories and extracts entities.
    """
    cleaned = message.strip().lower()
    
    detected_intents = []
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, cleaned):
                detected_intents.append(intent)
                break

    primary_intent = detected_intents[0] if detected_intents else "GENERAL_QUERY"

    # Extract entities (e.g., states, age, occupation keywords)
    entities = {}
    if "student" in cleaned:
        entities["occupation"] = "Student"
    elif "farmer" in cleaned:
        entities["occupation"] = "Farmer"
    elif "senior" in cleaned or "pension" in cleaned:
        entities["occupation"] = "Senior Citizen"

    return {
        "primary_intent": primary_intent,
        "all_detected_intents": detected_intents or ["GENERAL_QUERY"],
        "confidence": 0.95 if detected_intents else 0.70,
        "entities": entities
    }
