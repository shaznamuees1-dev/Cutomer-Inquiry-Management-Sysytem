
const express = require("express");
const { login } = require("../controllers/authController");

// Create a router for authentication endpoints.
const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

module.exports = router;
