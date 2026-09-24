const express = require("express");

const router =
    express.Router();


const {

    registerCandidate,

    loginCandidate,

    getCurrentCandidate,

    updateCandidateProfile,

    logoutCandidate,

} = require(
    "../controllers/candidateController"
);


const candidateAuth =
    require(
        "../middleware/candidateAuth"
    );


// =========================================================
// PUBLIC
// =========================================================

router.post(
    "/register",
    registerCandidate
);


router.post(
    "/login",
    loginCandidate
);


// =========================================================
// PROTECTED
// =========================================================

router.get(
    "/me",
    candidateAuth,
    getCurrentCandidate
);


// =========================================================
// UPDATE PROFILE
// =========================================================

router.put(
    "/profile",
    candidateAuth,
    updateCandidateProfile
);


// =========================================================
// LOGOUT
// =========================================================

router.post(
    "/logout",
    candidateAuth,
    logoutCandidate
);


module.exports = router;