import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DB_PATH || "database.sqlite";
const db = new DatabaseSync(path.resolve(dbPath));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    state TEXT,
    occupation TEXT,
    education TEXT,
    income TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const getByEmailStmt = db.prepare("SELECT * FROM users WHERE email = ?");
const getByIdStmt = db.prepare("SELECT * FROM users WHERE id = ?");
const insertUserStmt = db.prepare(`
  INSERT INTO users (name, email, password_hash, age, gender, state, occupation, education, income)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export function getUserByEmail(email) {
  const row = getByEmailStmt.get(email);
  if (!row) return null;
  // Convert prototype-less object to standard JS object
  return { ...row };
}

export function getUserById(id) {
  const row = getByIdStmt.get(id);
  if (!row) return null;
  return { ...row };
}

export function createUser({ name, email, passwordHash, age, gender, state, occupation, education, income }) {
  try {
    const result = insertUserStmt.run(
      name,
      email,
      passwordHash,
      age ? parseInt(age, 10) : null,
      gender || null,
      state || null,
      occupation || null,
      education || null,
      income || null
    );
    return result.lastInsertRowid;
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      throw new Error("Email already registered");
    }
    throw error;
  }
}
