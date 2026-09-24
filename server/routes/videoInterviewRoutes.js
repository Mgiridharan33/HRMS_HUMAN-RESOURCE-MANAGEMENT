const express = require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");

const candidateAuth =
    require("../middleware/candidateAuth");

const {

    getVideoInterviewEmployees,

    getVideoInterviewEligibleApplications,

    assignVideoInterviewEmployee,

    getEmployeeVideoInterviews,

    getEmployeeVideoInterviewById,

    scheduleVideoInterview,

    getAdminVideoInterviews,

    approveVideoInterview,

    rejectVideoInterview,

    getHRVideoInterviews,

    sendVideoInterviewToCandidate,

    getCandidateVideoInterviews,

    getCandidateVideoInterviewById,

    completeVideoInterview,

    cancelVideoInterview,

    associateVideoInterviewRecording,

} = require(
    "../controllers/VideoInterviewController");


// ============================================================
// ADMIN
// ============================================================


// Get employees who can conduct interviews

router.get(
    "/admin/employees",
    auth,
    getVideoInterviewEmployees
);


// Get candidates who completed aptitude

router.get(
    "/admin/eligible-applications",
    auth,
    getVideoInterviewEligibleApplications
);


// Get all video interviews

router.get(
    "/admin/interviews",
    auth,
    getAdminVideoInterviews
);


// Assign employee to candidate

router.post(
    "/admin/assign",
    auth,
    assignVideoInterviewEmployee
);


// Approve employee-created schedule

router.patch(
    "/admin/:id/approve",
    auth,
    approveVideoInterview
);


// Reject employee-created schedule

router.patch(
    "/admin/:id/reject",
    auth,
    rejectVideoInterview
);


// ============================================================
// EMPLOYEE
// ============================================================


// Get interviews assigned to logged-in employee

router.get(
    "/employee/my",
    auth,
    getEmployeeVideoInterviews
);


// Get one assigned interview

router.get(
    "/employee/:id",
    auth,
    getEmployeeVideoInterviewById
);


// Employee creates schedule + meeting link

router.patch(
    "/employee/:id/schedule",
    auth,
    scheduleVideoInterview
);


// Employee marks meeting completed

router.patch(
    "/employee/:id/complete",
    auth,
    authorizeRoles("EMPLOYEE"),
    completeVideoInterview
);


// ============================================================
// HR
// ============================================================


// HR gets approved interviews

router.get(
    "/hr/my",
    auth,
    getHRVideoInterviews
);


// HR sends approved interview to candidate

router.patch(
    "/hr/:id/send",
    auth,
    sendVideoInterviewToCandidate
);


// ============================================================
// CANDIDATE
// ============================================================


// Candidate gets scheduled interviews

router.get(
    "/candidate/my",
    candidateAuth,
    getCandidateVideoInterviews
);


// Candidate gets one interview

router.get(
    "/candidate/:id",
    candidateAuth,
    getCandidateVideoInterviewById
);


// ============================================================
// COMMON
// ============================================================


// Admin / HR / assigned employee

// can cancel interview

router.patch(
    "/:id/cancel",
    auth,
    cancelVideoInterview
);


router.patch(
    "/:id/recording",
    auth,
    associateVideoInterviewRecording
);


module.exports =
    router;