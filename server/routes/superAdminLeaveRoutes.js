const express = require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    getAllLeavesForSuperAdmin,
    getLeaveDetailsForSuperAdmin,
} =
    require(
        "../controllers/superAdminLeaveController"
    );


// GET /api/super-admin/leaves

router.get(
    "/",
    auth,
    getAllLeavesForSuperAdmin
);


// GET /api/super-admin/leaves/:id

router.get(
    "/:id",
    auth,
    getLeaveDetailsForSuperAdmin
);


module.exports =
    router;