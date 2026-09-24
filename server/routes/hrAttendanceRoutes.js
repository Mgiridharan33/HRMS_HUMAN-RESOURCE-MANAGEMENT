const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");

const {
    getAllEmployeeAttendance,
    downloadHRAttendance,
} = require("../controllers/hrAttendanceController");


/*
=====================================================
AUTHENTICATION
=====================================================
*/

router.use(auth);


/*
=====================================================
HR + SUPER ADMIN
=====================================================
*/

router.use(
    authorizeRoles(
        "HR",
        "SUPER_ADMIN"
    )
);


/*
=====================================================
GET ALL EMPLOYEE ATTENDANCE

GET /api/hr-attendance
=====================================================
*/

router.get(
    "/",
    getAllEmployeeAttendance
);


/*
=====================================================
DOWNLOAD HR ATTENDANCE

GET /api/hr-attendance/download

Examples:

/api/hr-attendance/download
?fromDate=2026-08-12
&toDate=2026-08-13
&status=All
&format=pdf


Formats:

xlsx
csv
pdf
=====================================================
*/

router.get(
    "/download",
    downloadHRAttendance
);


module.exports = router;