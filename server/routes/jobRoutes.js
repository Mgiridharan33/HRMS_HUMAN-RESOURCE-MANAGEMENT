const express = require("express");

const router =
    express.Router();


const {
    getPublishedJobs,
    getPublishedJobById,
} = require(
    "../controllers/jobController"
);


// =========================================================
// PUBLIC / CANDIDATE JOB ROUTES
// =========================================================


// GET /api/jobs
// Get all currently published jobs

router.get(
    "/",
    getPublishedJobs
);


// GET /api/jobs/:id
// Get one published job

router.get(
    "/:id",
    getPublishedJobById
);


module.exports = router;