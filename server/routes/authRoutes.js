const express = require("express");

const {
    login,
    logout,
    getMe,
} = require("../controllers/authController");

const auth =
    require("../middleware/auth");


const router =
    express.Router();


console.log(
    "AUTH CONTROLLER TYPES:",
    {
        login:
            typeof login,

        logout:
            typeof logout,

        getMe:
            typeof getMe,

        auth:
            typeof auth,
    }
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    logout
);


// =====================================================
// CURRENT USER
// =====================================================

router.get(
    "/me",
    auth,
    getMe
);


module.exports =
    router;