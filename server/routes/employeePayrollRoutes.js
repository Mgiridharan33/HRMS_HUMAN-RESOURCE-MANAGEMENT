const express = require("express");

const router =
    express.Router();


const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");


const {

    getMyPayroll,

    getMyPayrollById,

} =
    require(
        "../controllers/employeePayrollController"
    );


// =====================================================
// GET MY PAYROLL
// GET /api/employee/payroll
// =====================================================

router.get(

    "/",

    auth,

    authorizeRoles(
        "EMPLOYEE"
    ),

    getMyPayroll

);


// =====================================================
// GET SINGLE PAYROLL
// GET /api/employee/payroll/:id
// =====================================================

router.get(

    "/:id",

    auth,

    authorizeRoles(
        "EMPLOYEE"
    ),

    getMyPayrollById

);


module.exports =
    router;