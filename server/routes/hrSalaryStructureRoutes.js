const express = require("express");

const router =
    express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {

    getHRUsers,

    createHRSalaryStructure,

    getAllHRSalaryStructures,

    getHRSalaryStructureByHR,

    getHRSalaryStructureById,

    updateHRSalaryStructure,

    activateHRSalaryStructure,

    deactivateHRSalaryStructure,

    deleteHRSalaryStructure,

} =
    require(
        "../controllers/hrSalaryStructureController"
    );


// =====================================================
// MIDDLEWARE
// =====================================================

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");


// =====================================================
// GET HR USERS
// IMPORTANT:
// This route must come BEFORE /:id
// =====================================================

router.get(

    "/hr-users",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    getHRUsers
);


// =====================================================
// GET ALL HR SALARY STRUCTURES
// GET /api/hr-salary-structures
// =====================================================

router.get(

    "/",

    auth,

    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),

    getAllHRSalaryStructures
);


// =====================================================
// GET HR SALARY STRUCTURE BY HR
// GET /api/hr-salary-structures/hr/:hrId
// =====================================================

router.get(

    "/hr/:hrId",

    auth,

    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),

    getHRSalaryStructureByHR
);


// =====================================================
// CREATE
// POST /api/hr-salary-structures
// =====================================================

router.post(

    "/",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    createHRSalaryStructure
);


// =====================================================
// GET BY ID
// GET /api/hr-salary-structures/:id
// =====================================================

router.get(

    "/:id",

    auth,

    authorizeRoles(
        "SUPER_ADMIN",
        "HR"
    ),

    getHRSalaryStructureById
);


// =====================================================
// UPDATE
// PUT /api/hr-salary-structures/:id
// =====================================================

router.put(

    "/:id",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    updateHRSalaryStructure
);


// =====================================================
// ACTIVATE
// PUT /api/hr-salary-structures/:id/activate
// =====================================================

router.put(

    "/:id/activate",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    activateHRSalaryStructure
);


// =====================================================
// DEACTIVATE
// PUT /api/hr-salary-structures/:id/deactivate
// =====================================================

router.put(

    "/:id/deactivate",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    deactivateHRSalaryStructure
);


// =====================================================
// DELETE
// DELETE /api/hr-salary-structures/:id
// =====================================================

router.delete(

    "/:id",

    auth,

    authorizeRoles(
        "SUPER_ADMIN"
    ),

    deleteHRSalaryStructure
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
    router;