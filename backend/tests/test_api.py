import unittest
import json
from backend.app import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "ok")

    def test_schemes_endpoint(self):
        response = self.client.get('/api/schemes')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("schemes", data)
        self.assertIn("total", data)

    def test_notifications_endpoint(self):
        response = self.client.get('/api/notifications')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("notifications", data)

    def test_check_eligibility_validation_error(self):
        # Empty body should return 400 or 422 error
        response = self.client.post('/api/check-eligibility',
                                   data=json.dumps({}),
                                   content_type='application/json')
        self.assertIn(response.status_code, [400, 422])
        data = json.loads(response.data)
    def test_parse_schemes_from_llm(self):
        from backend.app import _parse_schemes_from_llm
        llm_text = (
            "Here are the government benefits you qualify for:\n\n"
            "1. **PM Vidya Lakshmi Education Loan**\n"
            "   Why you are eligible: Student status matched.\n"
            "   Benefits: Education loan up to Rs 10 Lakh.\n"
            "   Required Documents: Aadhaar Card, Income Certificate\n"
            "   Apply link: vidyalakshmi.co.in\n\n"
            "2. **Post-Matric Scholarship (OBC)**\n"
            "   Why you are eligible: OBC category verified.\n"
            "   Benefits: Rs 48,000 annual scholarship.\n"
            "   Required Documents: Income Certificate, Caste Certificate\n"
            "   Apply link: scholarships.gov.in\n"
        )
        schemes = _parse_schemes_from_llm(llm_text, [])
        self.assertGreaterEqual(len(schemes), 2)
        self.assertEqual(schemes[0]["name"], "PM Vidya Lakshmi Education Loan")
        self.assertEqual(schemes[1]["name"], "Post-Matric Scholarship (OBC)")

if __name__ == "__main__":
    unittest.main()
