
const express = require("express");

// Import authentication middleware.
const authenticate = require("../middleware/authenticate");

// Import inquiry controller functions.
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
} = require("../controllers/inquiryController");

// Create an Express router.
const router = express.Router();

// Protect all inquiry routes with JWT authentication.
router.use(authenticate);

// GET /api/inquiries - List staff inquiries.
router.get("/", getInquiries);

// GET /api/inquiries/:id - View one inquiry.
router.get("/:id", getInquiryById);

// POST /api/inquiries - Create an inquiry.
router.post("/", createInquiry);

// PATCH /api/inquiries/:id/status - Update inquiry status.
router.patch("/:id/status", updateInquiryStatus);

module.exports = router;
