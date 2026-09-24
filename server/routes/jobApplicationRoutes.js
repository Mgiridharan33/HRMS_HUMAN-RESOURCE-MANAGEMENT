const express = require("express");

const router =
    express.Router();


const {
    applyForJob,
    getMyApplications,
    getMyApplicationById,
} =
    require(
        "../controllers/jobApplicationController"
    );


const candidateAuth =
    require(
        "../middleware/candidateAuth"
    );


// =========================================================
// APPLY
// POST /api/job-applications
// =========================================================

router.post(
    "/",
    candidateAuth,
    applyForJob
);


// =========================================================
// MY APPLICATIONS
// GET /api/job-applications/my
// =========================================================

router.get(
    "/my",
    candidateAuth,
    getMyApplications
);


// =========================================================
// SINGLE APPLICATION
// GET /api/job-applications/:id
// =========================================================

router.get(
    "/:id",
    candidateAuth,
    getMyApplicationById
);


module.exports =
    router;