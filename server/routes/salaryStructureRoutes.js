const express = require("express");

const router =
    express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    createSalaryStructure,
    getAllSalaryStructures,
    getSalaryStructureByEmployee,
    getSalaryStructureById,
    updateSalaryStructure,
    activateSalaryStructure,
    deactivateSalaryStructure,
    deleteSalaryStructure,
} =
    require(
        "../controllers/salaryStructureController"
    );


// =====================================================
// MIDDLEWARE
// =====================================================

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");


// =====================================================
// CREATE
// =====================================================

router.post(
    "/",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    createSalaryStructure
);


// =====================================================
// GET ALL
// =====================================================

router.get(
    "/",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getAllSalaryStructures
);


// =====================================================
// GET BY EMPLOYEE
// IMPORTANT: BEFORE /:id
// =====================================================

router.get(
    "/employee/:employeeId",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getSalaryStructureByEmployee
);


// =====================================================
// GET BY ID
// =====================================================

router.get(
    "/:id",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    getSalaryStructureById
);


// =====================================================
// UPDATE
// =====================================================

router.put(
    "/:id",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    updateSalaryStructure
);


// =====================================================
// ACTIVATE
// =====================================================

router.put(
    "/:id/activate",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    activateSalaryStructure
);


// =====================================================
// DEACTIVATE
// =====================================================

router.put(
    "/:id/deactivate",
    auth,
    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),
    deactivateSalaryStructure
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
    deleteSalaryStructure
);


module.exports =
    router;