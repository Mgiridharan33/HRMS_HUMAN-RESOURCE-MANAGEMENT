const express =
    require("express");

const router =
    express.Router();


// IMPORTANT:
// Replace this with your EXISTING candidate auth middleware.

const candidateAuth =
    require("../middleware/candidateAuth");


const {

    getCandidateAptitudeTests,

    startCandidateAptitudeTest,

    submitCandidateAptitudeTest,

} =
    require(
        "../controllers/candidateAptitudeTestController"
    );


// =========================================================
// GET AVAILABLE TESTS
// =========================================================

router.get(
    "/aptitude-tests",
    candidateAuth,
    getCandidateAptitudeTests
);


// =========================================================
// START TEST
// =========================================================

router.post(
    "/aptitude-tests/:id/start",
    candidateAuth,
    startCandidateAptitudeTest
);


// =========================================================
// SUBMIT TEST
// =========================================================

router.post(
    "/aptitude-tests/:id/submit",
    candidateAuth,
    submitCandidateAptitudeTest
);


module.exports =
    router;