const express = require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    getAllLeavesForHR,
    approveLeave,
    cancelLeave,
} =
    require("../controllers/leaveController");


// =====================================================
// GET ALL HR LEAVES
// GET /api/hr-leaves
// =====================================================

router.get(
    "/",
    auth,
    getAllLeavesForHR
);


// =====================================================
// APPROVE
// PUT /api/hr-leaves/:leaveId/approve
// =====================================================

router.put(
    "/:leaveId/approve",
    auth,
    approveLeave
);


// =====================================================
// CANCEL
// PUT /api/hr-leaves/:leaveId/cancel
// =====================================================

router.put(
    "/:leaveId/cancel",
    auth,
    cancelLeave
);


module.exports =
    router;