const express = require("express");

const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
    updateEmployeeProfile,
} = require("../controllers/employeeController");

const auth =
    require("../middleware/auth");

const authorizeRoles =
    require("../middleware/role");


const router =
    express.Router();


// =====================================================
// DEBUG
// =====================================================

console.log(
    "EMPLOYEE CONTROLLER TYPES:",
    {
        createEmployee:
            typeof createEmployee,

        getAllEmployees:
            typeof getAllEmployees,

        getEmployeeById:
            typeof getEmployeeById,

        updateEmployee:
            typeof updateEmployee,

        toggleEmployeeStatus:
            typeof toggleEmployeeStatus,

        deleteEmployee:
            typeof deleteEmployee,

    }
);


// =====================================================
// CREATE
// POST /api/employees
// =====================================================

router.post(
    "/",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    createEmployee
);


// =====================================================
// GET ALL
// GET /api/employees
// =====================================================

router.get(
    "/",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    getAllEmployees
);

router.put(
    "/profile",
    auth,
    authorizeRoles("EMPLOYEE"),
    updateEmployeeProfile
);


// =====================================================
// GET ONE
// GET /api/employees/:id
// =====================================================

router.get(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    getEmployeeById
);


// =====================================================
// UPDATE
// PUT /api/employees/:id
// =====================================================

router.put(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    updateEmployee
);


// =====================================================
// STATUS
// PATCH /api/employees/:id/status
// =====================================================

router.patch(
    "/:id/status",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    toggleEmployeeStatus
);


// =====================================================
// DELETE
// DELETE /api/employees/:id
// =====================================================

router.delete(
    "/:id",
    auth,
    authorizeRoles("SUPER_ADMIN", "HR"),
    deleteEmployee
);


module.exports = router;