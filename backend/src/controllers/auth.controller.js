// backend/src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const supabase = require("../config/supabaseClient");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ==============================
// SIGNUP / REGISTER
// ==============================
exports.register = async (req, res) => {
  try {
    const { voterId, name, email, password, aadharNo, gender, mobileNo } = req.body || {};

    if (!name || !password) {
      return res.status(400).json({ error: "Name and password are required" });
    }

    const finalVoterId = (voterId && voterId.trim()) ? voterId.trim() : `voter_${Date.now()}`;
    const finalEmail = (email && email.trim()) ? email.trim() : `${finalVoterId}@voting.app`;
    const finalAadhar = (aadharNo && aadharNo.trim()) ? aadharNo.trim() : `AADHAAR-${Date.now()}`;
    const finalGender = (gender && ['male', 'female', 'other'].includes(gender.toLowerCase())) ? gender.toLowerCase() : 'other';
    const finalMobile = (mobileNo && mobileNo.trim()) ? mobileNo.trim() : `99${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Check if user already exists
    const existingUser = await User.findByPk(finalVoterId);
    if (existingUser) {
      return res.status(400).json({ error: "User with this Voter ID already exists" });
    }

    // Create user in primary SQL DB
    const newUser = await User.create({
      voterId: finalVoterId,
      name,
      email: finalEmail,
      password,
      aadharNo: finalAadhar,
      gender: finalGender,
      mobileNo: finalMobile,
      role: 'voter'
    });

    // Also sync to Supabase Cloud Database (Users table)
    try {
      await supabase.from('Users').upsert([{
        voterId: finalVoterId,
        name,
        email: finalEmail,
        aadharNo: finalAadhar,
        gender: finalGender,
        mobileNo: finalMobile,
        role: 'voter'
      }]);
      console.log(`✅ Synced user ${finalVoterId} to Supabase`);
    } catch (supaErr) {
      console.warn("Supabase sync warning:", supaErr.message);
    }

    const token = jwt.sign(
      { id: newUser.voterId, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.voterId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message || "Failed to register user" });
  }
};

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
      return res.status(404).json({ error: "User not found. Please sign up." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.voterId, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
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

// ==============================
// ISSUE TOKEN
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
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};