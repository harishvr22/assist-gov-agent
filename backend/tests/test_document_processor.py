import os
import unittest
from backend.document_processor import processor

class TestDocumentProcessor(unittest.TestCase):
    def test_clean_text_and_chunking(self):
        raw_text = "This is paragraph 1.\n\nThis is paragraph 2 with policy rules.\n\nThis is paragraph 3."
        cleaned = processor.clean_text(raw_text)
        self.assertIn("paragraph 1", cleaned)

        chunks = processor.chunk_text(cleaned, chunk_size=50, chunk_overlap=10)
        self.assertGreater(len(chunks), 0)

    def test_text_file_processing(self):
        # Create temporary text policy document
        temp_txt = os.path.join(os.path.dirname(__file__), "temp_sample_policy.txt")
        with open(temp_txt, "w") as f:
            f.write("Scheme Name: Sample Scholarship Policy\n\nBeneficiaries: Students with income below 200000.")

        try:
            res = processor.process_and_index_document(
                file_path=temp_txt,
                scheme_name="Sample Scholarship Policy",
                category="Student",
                state="Tamil Nadu"
            )
            self.assertEqual(res["status"], "success")
            self.assertEqual(res["scheme_name"], "Sample Scholarship Policy")
            self.assertGreater(res["passages_indexed"], 0)
        finally:
            if os.path.exists(temp_txt):
                os.remove(temp_txt)

if __name__ == "__main__":
    unittest.main()
