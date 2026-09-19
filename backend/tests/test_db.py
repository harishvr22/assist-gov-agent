import unittest
from backend.db import db, LocalDatabase, LocalCollection

class TestDatabaseWrapper(unittest.TestCase):
    def test_db_wrapper_initialization(self):
        self.assertIsNotNone(db)
        self.assertTrue(hasattr(db, "users"))
        self.assertTrue(hasattr(db, "schemes"))
        self.assertTrue(hasattr(db, "queries"))
        self.assertTrue(hasattr(db, "saved_schemes"))
        self.assertTrue(hasattr(db, "notifications"))

    def test_local_collection_crud(self):
        # Test local collection fallback mechanisms
        local_db = LocalDatabase()
        test_col = LocalCollection(local_db, "test_collection")
        
        # 1. Insert
        inserted = test_col.insert_one({"name": "Test Scheme", "category": "Test", "code": 999})
        self.assertIn("_id", inserted)
        
        # 2. Find one
        found = test_col.find_one({"code": 999})
        self.assertIsNotNone(found)
        self.assertEqual(found["name"], "Test Scheme")
        
        # 3. Update
        test_col.update_one({"code": 999}, {"$set": {"name": "Updated Test Scheme"}})
        updated = test_col.find_one({"code": 999})
        self.assertEqual(updated["name"], "Updated Test Scheme")
        
        # 4. Delete
        deleted = test_col.delete_one({"code": 999})
        self.assertTrue(deleted)
        self.assertIsNone(test_col.find_one({"code": 999}))

if __name__ == "__main__":
    unittest.main()
