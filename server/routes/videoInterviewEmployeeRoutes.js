const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {

    getEmployeeVideoInterviews,

    getEmployeeVideoInterviewById,

    scheduleVideoInterview,

    updateVideoInterviewSchedule,

} =
    require(
        "../controllers/videoInterviewEmployeeController"
    );


// ============================================================
// EMPLOYEE VIDEO INTERVIEWS
// ============================================================

router.get(
    "/employee",
    auth,
    getEmployeeVideoInterviews
);


// ============================================================
// SINGLE INTERVIEW
// ============================================================

router.get(
    "/employee/:interviewId",
    auth,
    getEmployeeVideoInterviewById
);


// ============================================================
// SCHEDULE
// ============================================================

router.post(
    "/:interviewId/schedule",
    auth,
    scheduleVideoInterview
);


// ============================================================
// UPDATE SCHEDULE
// ============================================================

router.put(
    "/:interviewId/schedule",
    auth,
    updateVideoInterviewSchedule
);


module.exports =
    router;