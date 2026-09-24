const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {

    getHRApplications,

    getHRApplicationSummary,

    getHRApplicationById,

    acceptHRApplication,

    updateHRApplicationStatus,

    updateHRApplicationNotes,

    sendJobConfirmation,

} =
    require(
        "../controllers/hrJobApplicationController"
    );


// =========================================================
// HR JOB APPLICATIONS
// =========================================================

// GET
// /api/hr/job-applications

router.get(
    "/job-applications",
    auth,
    getHRApplications
);


// GET
// /api/hr/job-applications/summary

router.get(
    "/job-applications/summary",
    auth,
    getHRApplicationSummary
);


// GET
// /api/hr/job-applications/:id

router.get(
    "/job-applications/:id",
    auth,
    getHRApplicationById
);


// PATCH
// /api/hr/job-applications/:id/accept

router.patch(
    "/job-applications/:id/accept",
    auth,
    acceptHRApplication
);


// PATCH
// /api/hr/job-applications/:id/status

router.patch(
    "/job-applications/:id/status",
    auth,
    updateHRApplicationStatus
);


// PATCH
// /api/hr/job-applications/:id/notes

router.patch(
    "/job-applications/:id/notes",
    auth,
    updateHRApplicationNotes
);


router.post(
    "/job-applications/:id/confirmation-email",
    auth,
    sendJobConfirmation
);


module.exports =
    router;