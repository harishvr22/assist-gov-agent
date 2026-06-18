import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserByEmail, getUserById, createUser } from "./database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "govassist_fallback_secret_key";

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = payload;
    next();
  });
}

// Routes

// 1. User Registration
app.post("/api/auth/register", async (req, res) => {
  const { name, email, pwd, age, gender, state, occupation, education, income } = req.body;

  if (!name || !email || !pwd) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const existing = getUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(pwd, salt);

    // Save user
    const userId = createUser({
      name,
      email: email.toLowerCase(),
      passwordHash,
      age,
      gender,
      state,
      occupation,
      education,
      income,
    });

    const user = getUserById(userId);
    // Exclude password hash from response
    const { password_hash, ...userResponse } = user;

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// 2. User Login
app.post("/api/auth/login", async (req, res) => {
  const { email, pwd } = req.body;

  if (!email || !pwd) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(pwd, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { password_hash, ...userResponse } = user;

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 3. Get Current User Profile (Protected)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password_hash, ...userResponse } = user;
    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`GovAssist Auth Server running on port ${PORT}`);
});
