import unittest
from backend.agents.graph import (
    eligibility_agent,
    search_agent,
    fusion_agent,
    document_agent,
)

class TestLangGraphAgents(unittest.TestCase):
    def setUp(self):
        self.sample_profile = {
            "full_name": "Priya Sharma",
            "age": 22,
            "gender": "Female",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "annual_family_income": 150000,
            "occupation": "Student",
            "category": "OBC",
            "disability_status": "No"
        }

    def test_eligibility_agent(self):
        state = {
            "user_profile": self.sample_profile,
            "agent_logs": []
        }
        res = eligibility_agent(state)
        self.assertIn("eligible_categories", res)
        cats = res["eligible_categories"]
        self.assertIn("Student", cats)
        self.assertIn("Education", cats)
        self.assertIn("Women", cats)

    def test_fusion_agent(self):
        local_schemes = [{"scheme_name": "Scheme A", "id": 1}, {"scheme_name": "Scheme B", "id": 2}]
        web_schemes = [{"scheme_name": "Scheme B", "id": 3}, {"scheme_name": "Scheme C", "id": 4}]
        state = {
            "local_schemes": local_schemes,
            "web_schemes": web_schemes,
            "agent_logs": []
        }
        res = fusion_agent(state)
        self.assertIn("fused_schemes", res)
        fused = res["fused_schemes"]
        self.assertEqual(len(fused), 3) # Scheme B deduplicated

    def test_document_agent(self):
        evaluated = [
            {"scheme_name": "S1", "documents": ["Aadhaar Card", "Income Certificate"]},
            {"scheme_name": "S2", "documents": ["Aadhaar Card", "Community Certificate"]}
        ]
        state = {
            "evaluated_schemes": evaluated,
            "agent_logs": []
        }
        res = document_agent(state)
        self.assertIn("document_checklist", res)
        checklist = res["document_checklist"]
        self.assertEqual(len(checklist), 3)
        self.assertIn("Aadhaar Card", checklist)
        self.assertIn("Income Certificate", checklist)
        self.assertIn("Community Certificate", checklist)

if __name__ == "__main__":
    unittest.main()
