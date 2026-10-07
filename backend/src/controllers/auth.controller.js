// backend/src/controllers/auth.controller.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { voterId, password } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({ error: "voterId and password required" });
    }

    const user = await User.findByPk(voterId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.voterId, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.voterId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.signup = async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { voterId, name, email, mobileNo, gender, password } = body;
  const normalizedVoterId = typeof voterId === "string" ? voterId.trim().toUpperCase() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedMobile = typeof mobileNo === "string" ? mobileNo.trim() : "";
  const allowedGenders = ["male", "female", "other"];

  if (!normalizedVoterId || !normalizedName || !normalizedEmail || !normalizedMobile || !gender || !password) {
    return res.status(400).json({ error: "Complete all required fields." });
  }
  if (!/^[A-Z0-9_-]{3,50}$/.test(normalizedVoterId)) {
    return res.status(400).json({ error: "Account ID must be 3–50 letters, numbers, hyphens, or underscores." });
  }
  if (normalizedName.length > 50 || normalizedMobile.length > 15) {
    return res.status(400).json({ error: "One or more fields are too long." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(normalizedEmail) || normalizedEmail.length > 100) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  const mobileDigits = normalizedMobile.replace(/\D/g, "");
  if (!/^[+()\d -]{7,15}$/.test(normalizedMobile) || mobileDigits.length < 7) {
    return res.status(400).json({ error: "Enter a valid phone number." });
  }
  if (!allowedGenders.includes(gender)) {
    return res.status(400).json({ error: "Select a valid option for gender." });
  }
  if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ error: "Password must be between 8 and 72 characters." });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { voterId: normalizedVoterId },
          { email: normalizedEmail },
          { mobileNo: normalizedMobile }
        ]
      }
    });
    if (existingUser) {
      return res.status(409).json({ error: "That account ID, email, or phone number is already registered." });
    }

    const user = await User.create({
      voterId: normalizedVoterId,
      name: normalizedName,
      email: normalizedEmail,
      mobileNo: normalizedMobile,
      gender,
      role: "voter",
      aadharNo: `PRACTICE-${crypto.randomUUID()}`,
      password
    });

    const token = jwt.sign(
      { id: user.voterId, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(201).json({
      success: true,
      token,
      user: { id: user.voterId, name: user.name, role: user.role }
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Please check your account details and try again." });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "That account ID, email, or phone number is already registered." });
    }
    console.error("Account signup failed:", error);
    return res.status(500).json({ error: "Could not create the account. Please try again." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["voterId", "name", "role", "mobileNo"]
    });
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }
    return res.status(200).json({
      user: {
        id: user.voterId,
        name: user.name,
        role: user.role,
        mobileNo: user.mobileNo
      }
    });
  } catch (error) {
    console.error("Account profile lookup failed:", error);
    return res.status(500).json({ error: "Could not load account details." });
  }
};

// ==============================
// ISSUE TOKEN (for verified voter)
// ==============================
exports.issueToken = async (req, res) => {
  try {
    const { voterId } = req.body;

    if (!voterId) {
      return res.status(400).json({ error: "voterId required" });
    }

    const token = jwt.sign(
      { id: voterId, role: "voter" },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};