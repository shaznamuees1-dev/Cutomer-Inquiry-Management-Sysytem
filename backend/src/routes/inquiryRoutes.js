
const express = require("express");

// Import the authentication middleware.
const authenticate = require("../middleware/authenticate");

// Create an Express router.
const router = express.Router();

// Protect every route in this router.
// Requests without a valid JWT will be rejected.
router.use(authenticate);

// Temporary route to confirm authentication works.
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Inquiry API is protected",
    staffId: req.user.id
  });
});

module.exports = router;
