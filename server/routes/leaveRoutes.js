const express = require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    applyLeave,
    getMyLeaves,
} =
    require("../controllers/leaveController");


// =====================================================
// APPLY LEAVE
// POST /api/leave/apply
// =====================================================

router.post(
    "/apply",
    auth,
    applyLeave
);


// =====================================================
// MY LEAVES
// GET /api/leave/my-leaves
// =====================================================

router.get(
    "/my-leaves",
    auth,
    getMyLeaves
);


module.exports = router;