import unittest
from backend.validators import validate_profile, INDIAN_STATES_UTS, VALID_GENDERS, VALID_OCCUPATIONS

class TestValidators(unittest.TestCase):
    def setUp(self):
        self.valid_profile = {
            "full_name": "Ramesh Kumar",
            "age": "25",
            "gender": "Male",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "annual_family_income": "180000",
            "occupation": "Student",
            "category": "OBC",
            "disability_status": "No"
        }

    def test_valid_profile(self):
        cleaned, errors = validate_profile(self.valid_profile)
        self.assertEqual(errors, {})
        self.assertEqual(cleaned["full_name"], "Ramesh Kumar")
        self.assertEqual(cleaned["age"], 25)
        self.assertEqual(cleaned["gender"], "Male")
        self.assertEqual(cleaned["state"], "Tamil Nadu")
        self.assertEqual(cleaned["annual_family_income"], 180000)
        self.assertEqual(cleaned["occupation"], "Student")

    def test_invalid_age(self):
        invalid = self.valid_profile.copy()
        invalid["age"] = "150"
        cleaned, errors = validate_profile(invalid)
        self.assertIn("age", errors)

        invalid["age"] = "-5"
        cleaned, errors = validate_profile(invalid)
        self.assertIn("age", errors)

    def test_invalid_state(self):
        invalid = self.valid_profile.copy()
        invalid["state"] = "Fictional State"
        cleaned, errors = validate_profile(invalid)
        self.assertIn("state", errors)

    def test_invalid_gender(self):
        invalid = self.valid_profile.copy()
        invalid["gender"] = "UnknownGender"
        cleaned, errors = validate_profile(invalid)
        self.assertIn("gender", errors)

    def test_invalid_income(self):
        invalid = self.valid_profile.copy()
        invalid["annual_family_income"] = "-100"
        cleaned, errors = validate_profile(invalid)
        self.assertIn("annual_family_income", errors)

if __name__ == "__main__":
    unittest.main()
