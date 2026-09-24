const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const {
    punchIn,
    punchOut,
    startBreak,
    resumeBreak,
    startLunch,
    resumeLunch,
    getTodayAttendance,
    getAttendanceHistory,
} = require("../controllers/attendanceController");


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(auth);


// =====================================================
// PUNCH IN
// POST /api/attendance/punch-in
// =====================================================

router.post(
    "/punch-in",
    punchIn
);


// =====================================================
// PUNCH OUT
// POST /api/attendance/punch-out
// =====================================================

router.post(
    "/punch-out",
    punchOut
);


// =====================================================
// START BREAK
// POST /api/attendance/break/start
// =====================================================

router.post(
    "/break/start",
    startBreak
);


// =====================================================
// RESUME BREAK
// POST /api/attendance/break/resume
// =====================================================

router.post(
    "/break/resume",
    resumeBreak
);


// =====================================================
// START LUNCH
// POST /api/attendance/lunch/start
// =====================================================

router.post(
    "/lunch/start",
    startLunch
);


// =====================================================
// RESUME LUNCH
// POST /api/attendance/lunch/resume
// =====================================================

router.post(
    "/lunch/resume",
    resumeLunch
);


// =====================================================
// TODAY ATTENDANCE
// GET /api/attendance/today
// =====================================================

router.get(
    "/today",
    getTodayAttendance
);


// =====================================================
// ATTENDANCE HISTORY
// GET /api/attendance/history
// =====================================================

router.get(
    "/history",
    getAttendanceHistory
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;