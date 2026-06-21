"""
backend/db.py
-------------
Unified database wrapper supporting MongoDB (local/Atlas) or a JSON-based
local file fallback (local_db.json) if MongoDB is unavailable.

Usage:
    from backend.db import db
    db.users.insert_one({"username": "harish", ...})
    user = db.users.find_one({"username": "harish"})
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

# Fallback JSON file path
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "local_db.json")

class LocalCollection:
    """Mock PyMongo Collection storing data in a local JSON file."""
    def __init__(self, db_instance: 'LocalDatabase', name: str):
        self.db_instance = db_instance
        self.name = name

    def _get_data(self) -> List[Dict[str, Any]]:
        return self.db_instance._read_db().setdefault(self.name, [])

    def _save_data(self, data: List[Dict[str, Any]]) -> None:
        db_data = self.db_instance._read_db()
        db_data[self.name] = data
        self.db_instance._write_db(db_data)

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        data = self._get_data()
        for doc in data:
            if self._matches(doc, query):
                return doc.copy()
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        data = self._get_data()
        if not query:
            return [doc.copy() for doc in data]
        return [doc.copy() for doc in data if self._matches(doc, query)]

    def insert_one(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        data = self._get_data()
        # Generate an ID if not present
        if "_id" not in doc:
            import uuid
            doc["_id"] = str(uuid.uuid4())
        data.append(doc)
        self._save_data(data)
        return doc

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False) -> bool:
        data = self._get_data()
        updated = False
        
        set_fields = update.get("$set", update)
        
        for doc in data:
            if self._matches(doc, query):
                for k, v in set_fields.items():
                    doc[k] = v
                updated = True
                break
                
        if not updated and upsert:
            new_doc = query.copy()
            for k, v in set_fields.items():
                new_doc[k] = v
            self.insert_one(new_doc)
            return True
            
        if updated:
            self._save_data(data)
        return updated

    def delete_one(self, query: Dict[str, Any]) -> bool:
        data = self._get_data()
        for idx, doc in enumerate(data):
            if self._matches(doc, query):
                data.pop(idx)
                self._save_data(data)
                return True
        return False

    def delete_many(self, query: Dict[str, Any]) -> int:
        data = self._get_data()
        original_len = len(data)
        filtered_data = [doc for doc in data if not self._matches(doc, query)]
        self._save_data(filtered_data)
        return original_len - len(filtered_data)

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for key, val in query.items():
            if key not in doc:
                return False
            doc_val = doc[key]
            if isinstance(val, dict):
                if "$in" in val:
                    if doc_val not in val["$in"]:
                        return False
                elif "$eq" in val:
                    if doc_val != val["$eq"]:
                        return False
            elif doc_val != val:
                return False
        return True


class LocalDatabase:
    """Mock PyMongo Database."""
    def __init__(self):
        if not os.path.exists(LOCAL_DB_PATH):
            with open(LOCAL_DB_PATH, "w") as f:
                json.dump({}, f)

    def _read_db(self) -> Dict[str, Any]:
        try:
            with open(LOCAL_DB_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_db(self, data: Dict[str, Any]) -> None:
        try:
            with open(LOCAL_DB_PATH, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error("Failed to write to local db: %s", e)

    def __getattr__(self, name: str) -> LocalCollection:
        return LocalCollection(self, name)


class DatabaseWrapper:
    """Dynamically routes calls to PyMongo or LocalDatabase fallback."""
    def __init__(self):
        self._db = None
        self._is_mongo = False
        self._connect()

    def _connect(self):
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGO_DB", "government_scheme_assistant")
        
        try:
            import pymongo
            client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            client.server_info()
            self._db = client[db_name]
            self._is_mongo = True
            logger.info("Connected successfully to MongoDB at %s", mongo_uri)
        except Exception as e:
            logger.warning("MongoDB connection failed (%s). Falling back to local JSON database at %s", e, LOCAL_DB_PATH)
            self._db = LocalDatabase()
            self._is_mongo = False

    @property
    def is_mongo(self) -> bool:
        return self._is_mongo

    @property
    def users(self):
        return self._db.users

    @property
    def schemes(self):
        return self._db.schemes

    @property
    def queries(self):
        return self._db.queries

    @property
    def saved_schemes(self):
        return self._db.saved_schemes

    @property
    def notifications(self):
        return self._db.notifications


# Singleton instance
db = DatabaseWrapper()
