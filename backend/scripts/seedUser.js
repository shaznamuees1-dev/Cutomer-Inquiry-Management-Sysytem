
const bcrypt = require("bcryptjs");

// Load environment variables before importing the database pool.
require("dotenv").config();

const pool = require("../src/config/db");

async function seedUser() {
  try {
    // Read the test employee's details from environment variables.
    const name = process.env.SEED_USER_NAME;
    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;

    // Reject missing configuration instead of inserting invalid data.
    if (!name || !email || !password) {
      throw new Error("Missing seed user environment variables");
    }

    // Require a reasonably strong test account password.
    if (password.length < 12) {
      throw new Error("Seed user password must be at least 12 characters");
    }

    // Hash the password before storing it.
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert the employee only if the email does not already exist.
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email`,
      [name, email.trim().toLowerCase(), passwordHash]
    );

    if (result.rowCount === 0) {
      console.log("Staff account already exists. No changes made.");
    } else {
      console.log("Staff account created:", result.rows[0]);
    }
  } catch (error) {
    console.error("Failed to seed staff account:", error.message);
    process.exitCode = 1;
  } finally {
    // Close database connections so the script can exit.
    await pool.end();
  }
}

seedUser();
