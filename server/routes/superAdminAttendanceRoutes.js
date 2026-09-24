const express = require("express");

const router = express.Router();

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");

const {
    getAllAttendance,
    getTodaySummary,
    getEmployeeAttendance,
    getHRAttendance,
    getEmployees,
    getHRList,
} =
    require(
        "../controllers/superAdminAttendanceController"
    );


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(auth);


// =====================================================
// SUPER ADMIN ONLY
// =====================================================

router.use(
    authorizeRoles("SUPER_ADMIN")
);


// =====================================================
// TODAY SUMMARY
// GET /api/superadmin-attendance/summary
// =====================================================

router.get(
    "/summary",
    getTodaySummary
);


// =====================================================
// ALL ATTENDANCE
// GET /api/superadmin-attendance
// =====================================================

router.get(
    "/",
    getAllAttendance
);


// =====================================================
// EMPLOYEE LIST
// GET /api/superadmin-attendance/employees
// =====================================================

router.get(
    "/employees",
    getEmployees
);


// =====================================================
// HR LIST
// GET /api/superadmin-attendance/hr
// =====================================================

router.get(
    "/hr",
    getHRList
);


// =====================================================
// SINGLE EMPLOYEE ATTENDANCE
// =====================================================

router.get(
    "/employees/:employeeId",
    getEmployeeAttendance
);


// =====================================================
// SINGLE HR ATTENDANCE
// =====================================================

router.get(
    "/hr/:hrId",
    getHRAttendance
);
    

module.exports = router;