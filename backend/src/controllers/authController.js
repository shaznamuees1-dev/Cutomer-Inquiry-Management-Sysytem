
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Handle staff login requests.
async function login(req, res) {
  try {
    // Read the email and password sent by the frontend.
    const { email, password } = req.body || {};

    // Reject missing or incorrectly typed inputs.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find the staff account using its email address.
    const result = await pool.query(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    // Reject unknown users or incorrect passwords.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Ensure the JWT signing secret is configured.
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate a signed token that expires after one hour.
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the token and safe staff information.
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "Unable to process login"
    });
  }
}

module.exports = { login };
