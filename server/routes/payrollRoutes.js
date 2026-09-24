const express = require("express");

const router =
    express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    createPayroll,

    getAllPayroll,

    getPayrollById,

    approvePayroll,

    payPayroll,

    cancelPayroll,

    deletePayroll,

} =
    require(
        "../controllers/payrollController"
    );


// =====================================================
// MIDDLEWARE
// =====================================================

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");


// =====================================================
// CREATE PAYROLL
// POST /api/payroll
// =====================================================

router.post(
    "/",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    createPayroll
);


// =====================================================
// GET PAYROLL
// GET /api/payroll
// =====================================================

router.get(
    "/",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getAllPayroll
);


// =====================================================
// GET SINGLE PAYROLL
// GET /api/payroll/:id
// =====================================================

router.get(
    "/:id",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getPayrollById
);


// =====================================================
// APPROVE
// PUT /api/payroll/:id/approve
// =====================================================

router.put(
    "/:id/approve",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    approvePayroll
);


// =====================================================
// PAY
// PUT /api/payroll/:id/pay
// =====================================================

router.put(
    "/:id/pay",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    payPayroll
);


// =====================================================
// CANCEL
// PUT /api/payroll/:id/cancel
// =====================================================

router.put(
    "/:id/cancel",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    cancelPayroll
);


// =====================================================
// DELETE
// =====================================================

router.delete(
    "/:id",
    auth,
    authorizeRoles(
        "SUPER_ADMIN"
    ),
    deletePayroll
);


module.exports =
    router;