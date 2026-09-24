const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {
    getHRAptitudeTests,
    getHRAptitudeTestById,
    sendAptitudeTestToCandidate,
    getHRSubmittedAptitudeTests,
    getHRSubmittedAptitudeTestById,
} =
    require(
        "../controllers/hrAptitudeTestController"
    );


router.get(
    "/aptitude-tests",
    auth,
    getHRAptitudeTests
);


// =========================================================
// RESULTS MUST COME BEFORE /:id
// =========================================================

router.get(
    "/aptitude-tests/results",
    auth,
    getHRSubmittedAptitudeTests
);

router.get(
    "/aptitude-tests/results/:id",
    auth,
    getHRSubmittedAptitudeTestById
);


// =========================================================
// SINGLE TEST
// =========================================================

router.get(
    "/aptitude-tests/:id",
    auth,
    getHRAptitudeTestById
);


// =========================================================
// SEND TEST
// =========================================================

router.patch(
    "/aptitude-tests/:id/send",
    auth,
    sendAptitudeTestToCandidate
);


module.exports =
    router;