const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {

    assignEmployeeForQuestions,

    getAllQuestionAssignments,

    getQuestionAssignmentById,

    getQuestionEmployees,

    getAssignmentQuestionsForAdmin,

    approveQuestionAssignment,

    rejectQuestionAssignment,

    getAptitudeEligibleApplications,

    getReusableQuestionAssignments,

    getReusableQuestions,

    reuseExistingQuestions,

} =
    require(
        "../controllers/aptitudeQuestionAssignmentController"
    );

// =========================================================
// ADMIN APTITUDE QUESTION ASSIGNMENTS
// =========================================================


// GET ACTIVE EMPLOYEES
//
// GET
// /api/admin/aptitude-question-assignments/employees

router.get(
    "/aptitude-question-assignments/employees",
    auth,
    getQuestionEmployees
);


// GET ALL ASSIGNMENTS
//
// GET
// /api/admin/aptitude-question-assignments

router.get(
    "/aptitude-question-assignments",
    auth,
    getAllQuestionAssignments
);


router.get(
    "/aptitude-question-assignments/applications",
    auth,
    getAptitudeEligibleApplications
);


router.get(
    "/aptitude-question-assignments/reusable-question-sets",
    auth,
    getReusableQuestionAssignments
);


router.post(
    "/aptitude-question-assignments/reuse-questions",
    auth,
    reuseExistingQuestions
);


router.get(
    "/aptitude-question-assignments/reusable/:assignmentId/questions",
    auth,
    getReusableQuestions
);


router.get(
    "/aptitude-question-assignments/reusable/:jobId",
    auth,
    getReusableQuestionAssignments
);


// GET SINGLE ASSIGNMENT
//
// GET
// /api/admin/aptitude-question-assignments/:id

router.get(
    "/aptitude-question-assignments/:id",
    auth,
    getQuestionAssignmentById
);


// CREATE ASSIGNMENT
//
// POST
// /api/admin/aptitude-question-assignments

router.post(
    "/aptitude-question-assignments",
    auth,
    assignEmployeeForQuestions
);


// =========================================================
// GET QUESTIONS FOR ADMIN REVIEW
//
// GET
// /api/admin/aptitude-question-assignments/:id/questions
// =========================================================

router.get(
    "/aptitude-question-assignments/:id/questions",
    auth,
    getAssignmentQuestionsForAdmin
);


// =========================================================
// APPROVE QUESTIONS
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/approve
// =========================================================

router.patch(
    "/aptitude-question-assignments/:id/approve",
    auth,
    approveQuestionAssignment
);


// =========================================================
// REJECT QUESTIONS
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/reject
// =========================================================

router.patch(
    "/aptitude-question-assignments/:id/reject",
    auth,
    rejectQuestionAssignment
);

module.exports =
    router;