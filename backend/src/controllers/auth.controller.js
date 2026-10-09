// backend/src/controllers/auth.controller.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "admin123";

// Simple in-memory nonce store for Web3 Wallet Sign-in
const nonceMap = new Map();

// ==============================
// VOTER LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { voterId, password, walletAddress, walletSignature } = req.body;

    if (!voterId || !password) {
      return res.status(400).json({ error: "voterId and password required" });
    }

    const user = await User.findByPk(voterId);

    if (!user) {
      return res.status(404).json({ error: "Voter account not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Optional Web3 signature verification if provided
    if (walletAddress && walletSignature) {
      const expectedNonce = nonceMap.get(walletAddress.toLowerCase());
      const messageToVerify = expectedNonce
        ? `Sign in to voteIn System\nNonce: ${expectedNonce}`
        : `voteIn Cryptographic Verification for ${voterId}`;

      try {
        const recoveredAddress = ethers.verifyMessage(messageToVerify, walletSignature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(401).json({ error: "Wallet signature verification failed" });
        }
      } catch (sigErr) {
        console.warn("Signature recovery notice:", sigErr.message);
      }
    }

    const token = jwt.sign(
      { id: user.voterId, role: user.role, walletAddress },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.voterId,
        name: user.name,
        role: user.role,
        walletAddress
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==============================
// ADMINISTRATOR LOGIN
// ==============================
exports.adminLogin = async (req, res) => {
  try {
    const { username, secretKey, walletAddress } = req.body;

    if (!username || !secretKey) {
      return res.status(400).json({ error: "Administrator username and secret key required" });
    }

    // Check admin record in DB or compare against secure admin secret key
    const adminUser = await User.findOne({
      where: {
        voterId: username,
        role: 'admin'
      }
    });

    let isValid = false;

    if (adminUser) {
      isValid = await bcrypt.compare(secretKey, adminUser.password);
    } else {
      // Secure fallback verification against server environment admin key
      isValid = (secretKey === ADMIN_SECRET_KEY && (username === 'admin' || username === 'admin1'));
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid administrator credentials or secret key" });
    }

    const token = jwt.sign(
      { id: username, role: "admin", walletAddress },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: username,
        role: "admin",
        walletAddress
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Administrator authentication failed" });
  }
};

// ==============================
// GET NONCE FOR SIWE
// ==============================
exports.getNonce = (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress required" });
  }

  const nonce = Math.floor(Math.random() * 1000000).toString();
  nonceMap.set(walletAddress.toLowerCase(), nonce);

  return res.json({ nonce, message: `Sign in to voteIn System\nNonce: ${nonce}` });
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