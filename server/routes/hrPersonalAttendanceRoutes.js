const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const {
    getTodayAttendance,
    getAttendanceHistory,
    punchIn,
    punchOut,
    startBreak,
    resumeBreak,
    startLunch,
    resumeLunch,
} = require("../controllers/hrPersonalAttendanceController");


router.use(auth);

router.use(
    authorizeRoles("HR")
);


router.get(
    "/today",
    getTodayAttendance
);

router.get(
    "/history",
    getAttendanceHistory
);

router.post(
    "/punch-in",
    punchIn
);

router.post(
    "/punch-out",
    punchOut
);

router.post(
    "/break/start",
    startBreak
);

router.post(
    "/break/resume",
    resumeBreak
);

router.post(
    "/lunch/start",
    startLunch
);

router.post(
    "/lunch/resume",
    resumeLunch
);


module.exports = router;