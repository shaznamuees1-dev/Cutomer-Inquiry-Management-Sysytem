
// Import Express to create our backend API.
const express = require("express");

// Import CORS to allow requests from our React frontend.
const cors = require("cors");

// Load environment variables from the .env file.
require("dotenv").config();

// Import our PostgreSQL connection pool.
const pool = require("./config/db");

// Import authentication routes.
const authRoutes = require("./routes/authRoutes");

//Register the inquiry routes
const inquiryRoutes = require("./routes/inquiryRoutes");

// Import middleware to protect private API endpoints.
const authenticate = require("./middleware/authenticate");

// Create our Express application.
const app = express();

// Allow requests from our React development server.
app.use(cors({
  origin: "http://localhost:5173"
}));

// Allow Express to read incoming JSON request bodies.
app.use(express.json());

// Register authentication endpoints.
app.use("/api/auth", authRoutes);

// Register protected inquiry routes.
app.use("/api/inquiries", inquiryRoutes);

// Health-check endpoint to verify the backend is running.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Coffee Ninja API is running"
  });
});

// Database health-check endpoint.
app.get("/api/health/db", async (req, res) => {
  try {
    // Ask PostgreSQL which database we are connected to.
    const result = await pool.query(
      "SELECT current_database() AS database_name"
    );

    // Return a successful response if the query works.
    res.status(200).json({
      status: "success",
      message: "PostgreSQL connection successful",
      database: result.rows[0].database_name
    });

  } catch (error) {
    // Log the error on the backend for debugging.
    console.error("Database connection failed:", error.message);

    // Return a safe error message to the frontend.
    res.status(503).json({
      status: "error",
      message: "Database connection unavailable"
    });
  }
});

// Protected endpoint to test JWT authentication.
// Only requests with a valid JWT can access this route.
app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Authenticated successfully",
    userId: req.user.id
  });
});

// Define the backend port.
const PORT = process.env.PORT || 5000;

// Start the Express server.
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
