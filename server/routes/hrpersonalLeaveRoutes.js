const express = require("express");

const router = express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    applyHRPersonalLeave,
    getMyHRPersonalLeaves,
    getAllHRPersonalLeaves,
    approveHRPersonalLeave,
    cancelHRPersonalLeave,
} = require("../controllers/hrpersonalLeaveController");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

// IMPORTANT:
// Use the SAME middleware that your existing working
// protected routes use.
//
// If your existing route has:
// const protect = require("../middleware/auth");
//
// keep this exactly as below.

const protect = require("../middleware/auth");


// =====================================================
// HR PERSONAL LEAVE
// =====================================================


// -----------------------------------------------------
// HR APPLY LEAVE
// POST /api/hr-personal-leaves
// -----------------------------------------------------

router.post(
    "/",
    protect,
    applyHRPersonalLeave
);


// -----------------------------------------------------
// HR GET OWN LEAVES
// GET /api/hr-personal-leaves/my
// -----------------------------------------------------

router.get(
    "/my",
    protect,
    getMyHRPersonalLeaves
);


// -----------------------------------------------------
// SUPER ADMIN GET ALL HR PERSONAL LEAVES
// GET /api/hr-personal-leaves
// -----------------------------------------------------

router.get(
    "/",
    protect,
    getAllHRPersonalLeaves
);


// -----------------------------------------------------
// SUPER ADMIN APPROVE
// PATCH /api/hr-personal-leaves/:id/approve
// -----------------------------------------------------

router.patch(
    "/:id/approve",
    protect,
    approveHRPersonalLeave
);


// -----------------------------------------------------
// SUPER ADMIN CANCEL
// PATCH /api/hr-personal-leaves/:id/cancel
// -----------------------------------------------------

router.patch(
    "/:id/cancel",
    protect,
    cancelHRPersonalLeave
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;