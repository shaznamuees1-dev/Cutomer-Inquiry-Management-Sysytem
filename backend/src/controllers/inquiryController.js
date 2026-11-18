
const pool = require("../config/db");

// Create a new customer inquiry.
async function createInquiry(req, res) {
  const {
    customer_name,
    contact,
    subject,
    description,
  } = req.body || {};

  // Check required fields and maximum lengths.
  const fields = [
    { name: "customer_name", value: customer_name, max: 100 },
    { name: "contact", value: contact, max: 255 },
    { name: "subject", value: subject, max: 200 },
    { name: "description", value: description, max: 5000 },
  ];

  for (const field of fields) {
    if (
      typeof field.value !== "string" ||
      !field.value.trim() ||
      field.value.trim().length > field.max
    ) {
      return res.status(400).json({
        message: `Invalid ${field.name}`,
      });
    }
  }

  try {
    // Ownership comes from the authenticated token,
    // never from user-provided request data.
    const result = await pool.query(
      `INSERT INTO inquiries
       (customer_name, contact, subject, description, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customer_name.trim(),
        contact.trim(),
        subject.trim(),
        description.trim(),
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Inquiry created successfully",
      inquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Create inquiry failed:", error.message);

    return res.status(500).json({
      message: "Unable to create inquiry",
    });
  }
}


// Get inquiries belonging to the logged-in staff member.

async function getInquiries(req, res) {
  // Read optional search and status filters from the URL.
  const { search = "", status = "" } = req.query;

  // Reject invalid query parameter types.
  if (
    typeof search !== "string" ||
    typeof status !== "string"
  ) {
    return res.status(400).json({
      message: "Invalid search or status filter",
    });
  }

  // Only allow supported inquiry statuses.
  const allowedStatuses = ["New", "In Progress", "Resolved"];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status filter",
    });
  }

  if (search.length > 200) {
    return res.status(400).json({
      message: "Search text is too long",
    });
  }

  try {
    // Use parameterized SQL to avoid SQL injection.
    // Always restrict results to the authenticated owner.
    const result = await pool.query(
      `SELECT id, customer_name, contact, subject,
              description, status, owner_id,
              created_at, updated_at
       FROM inquiries
       WHERE owner_id = $1
         AND (
           $2::text = ''
           OR customer_name ILIKE '%' || $2::text || '%'
           OR contact ILIKE '%' || $2::text || '%'
           OR subject ILIKE '%' || $2::text || '%'
         )
         AND (
           $3::text = ''
           OR status = $3::text
         )
       ORDER BY created_at DESC, id DESC`,
      [req.user.id, search.trim(), status]
    );

    return res.status(200).json({
      inquiries: result.rows,
    });
  } catch (error) {
    console.error("Get inquiries failed:", error.message);

    return res.status(500).json({
      message: "Unable to fetch inquiries",
    });
  }
}


// Get one inquiry belonging to the logged-in staff member.
async function getInquiryById(req, res) {
  const id = Number(req.params.id);

  // Reject invalid IDs before querying the database.
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid inquiry ID",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, customer_name, contact, subject,
              description, status, owner_id,
              created_at, updated_at
       FROM inquiries
       WHERE id = $1 AND owner_id = $2`,
      [id, req.user.id]
    );

    // Return the same response for missing and unauthorized IDs.
    // This avoids revealing whether another staff member's inquiry exists.
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      inquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Get inquiry failed:", error.message);

    return res.status(500).json({
      message: "Unable to fetch inquiry",
    });
  }
}



async function updateInquiryStatus(req, res) {
  const id = Number(req.params.id);
  const { status, expected_updated_at } = req.body || {};

  // Validate the inquiry ID.
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid inquiry ID",
    });
  }

  // Validate the requested status.
  const allowedStatuses = ["New", "In Progress", "Resolved"];

  if (
    typeof status !== "string" ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      message: "Invalid inquiry status",
    });
  }

  // Require the timestamp from the inquiry the user viewed.
  if (
    typeof expected_updated_at !== "string" ||
    !Number.isFinite(Date.parse(expected_updated_at))
  ) {
    return res.status(400).json({
      message: "Valid expected_updated_at is required",
    });
  }

  const transitions = {
    New: ["In Progress"],
    "In Progress": ["Resolved"],
    Resolved: ["In Progress"],
  };

  try {
    // Update only when:
    // 1. The inquiry belongs to the logged-in staff member.
    // 2. Its timestamp still matches the version the user viewed.
    // 3. The status transition is allowed.
    const result = await pool.query(
      `UPDATE inquiries
       SET status = $1, updated_at = NOW()
       WHERE id = $2
         AND owner_id = $3
         AND date_trunc('milliseconds', updated_at) =
         date_trunc('milliseconds', $4::timestamptz)
         AND (
           (status = 'New' AND $1 = 'In Progress')
           OR (status = 'In Progress' AND $1 = 'Resolved')
           OR (status = 'Resolved' AND $1 = 'In Progress')
         )
       RETURNING *`,
      [status, id, req.user.id, expected_updated_at]
    );

    if (result.rows.length > 0) {
      return res.status(200).json({
        message: "Inquiry status updated successfully",
        inquiry: result.rows[0],
      });
    }

    // Find the current inquiry without exposing other staff's data.
    const existing = await pool.query(
      `SELECT status, updated_at
       FROM inquiries
       WHERE id = $1 AND owner_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    // Detect an outdated version before checking the transition.
    if (
      existing.rows[0].updated_at.getTime() !==
      new Date(expected_updated_at).getTime()
    ) {
      return res.status(409).json({
        message: "Inquiry was updated elsewhere. Refresh and try again.",
      });
    }

    if (!transitions[existing.rows[0].status].includes(status)) {
      return res.status(409).json({
        message: "Invalid status transition",
      });
    }

    return res.status(409).json({
      message: "Inquiry changed. Refresh and try again.",
    });
  } catch (error) {
    console.error("Update inquiry status failed:", error.message);

    return res.status(500).json({
      message: "Unable to update inquiry status",
    });
  }
}



module.exports = { createInquiry, getInquiries, getInquiryById, updateInquiryStatus };
