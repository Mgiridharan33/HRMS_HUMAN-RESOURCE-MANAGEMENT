const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
    getEmployees,
    viewReport,
    downloadReport,
} = require("../controllers/hrReportsController");

// =====================================================
// HR REPORT ROUTES
// =====================================================

// Get ALL employees
router.get(
    "/employees",
    auth,
    getEmployees
);

// View report
router.get(
    "/view",
    auth,
    viewReport
);

// Download report
router.get(
    "/download",
    auth,
    downloadReport
);

module.exports = router;