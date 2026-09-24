const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLER
// =====================================================

const {
    createHRPayroll,
    getAllHRPayroll,
    getHRPayrollById,
    payHRPayroll,
    cancelHRPayroll,
    deleteHRPayroll,
} = require("../controllers/hrownPayrollcontroller");

// =====================================================
// MIDDLEWARE
// =====================================================

const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

// =====================================================
// CREATE HR PAYROLL
//
// POST /api/hr-payroll
//
// SUPER ADMIN ONLY
// =====================================================

router.post(
    "/",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    createHRPayroll
);

// =====================================================
// GET ALL HR PAYROLL
//
// GET /api/hr-payroll
//
// SUPER ADMIN
// HR → ONLY THEIR OWN PAYROLL
// =====================================================

router.get(
    "/",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getAllHRPayroll
);

// =====================================================
// GET SINGLE HR PAYROLL
//
// GET /api/hr-payroll/:id
//
// SUPER ADMIN
// HR → ONLY THEIR OWN PAYROLL
// =====================================================

router.get(
    "/:id",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getHRPayrollById
);

// =====================================================
// PAY HR PAYROLL
//
// PUT /api/hr-payroll/:id/pay
//
// SUPER ADMIN ONLY
// =====================================================

router.put(
    "/:id/pay",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    payHRPayroll
);

// =====================================================
// CANCEL HR PAYROLL
//
// PUT /api/hr-payroll/:id/cancel
//
// SUPER ADMIN ONLY
// =====================================================

router.put(
    "/:id/cancel",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    cancelHRPayroll
);

// =====================================================
// DELETE HR PAYROLL
//
// DELETE /api/hr-payroll/:id
//
// SUPER ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN"),
    deleteHRPayroll
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;