const express = require("express");

const router =
    express.Router();


const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    closeJob,
} = require(
    "../controllers/adminJobController"
);

const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");


// =========================================================
// SUPER ADMIN AUTH MIDDLEWARE
// =========================================================
//
// Replace these with your EXISTING Super Admin middleware.
//
// Example:
//
// const protect = require("../middleware/authMiddleware");
// const superAdminOnly = require("../middleware/superAdminOnly");
//
// =========================================================


// const protect = require("../middleware/authMiddleware");
// const superAdminOnly = require("../middleware/superAdminOnly");


// =========================================================
// SUPER ADMIN JOB MANAGEMENT
// =========================================================


// GET /api/admin/jobs

router.get(
    "/",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    getAllJobs
);


// GET /api/admin/jobs/:id

router.get(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    getJobById
);


// POST /api/admin/jobs

router.post(
    "/",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    createJob
);


// PUT /api/admin/jobs/:id

router.put(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    updateJob
);


// DELETE /api/admin/jobs/:id

router.delete(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    deleteJob
);


// PATCH /api/admin/jobs/:id/close

router.patch(
    "/:id/close",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    closeJob
);


module.exports = router;