const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middleware/auth");

const {

    getMyAssignments,

    getMyAssignmentById,

    createQuestion,

    updateQuestion,

    deleteQuestion,

    submitQuestions,

} =
    require(
        "../controllers/employeeAptitudeQuestionController"
    );


// =========================================================
// EMPLOYEE APTITUDE ASSIGNMENTS
// =========================================================


// GET MY ASSIGNMENTS
//
// GET
// /api/employee/aptitude-question-assignments

router.get(
    "/aptitude-question-assignments",
    auth,
    getMyAssignments
);


// GET SINGLE ASSIGNMENT
//
// GET
// /api/employee/aptitude-question-assignments/:id

router.get(
    "/aptitude-question-assignments/:id",
    auth,
    getMyAssignmentById
);


// CREATE QUESTION
//
// POST
// /api/employee/aptitude-question-assignments/:id/questions

router.post(
    "/aptitude-question-assignments/:id/questions",
    auth,
    createQuestion
);


// UPDATE QUESTION
//
// PATCH
// /api/employee/aptitude-question-assignments/:id/questions/:questionId

router.patch(
    "/aptitude-question-assignments/:id/questions/:questionId",
    auth,
    updateQuestion
);


// DELETE QUESTION
//
// DELETE
// /api/employee/aptitude-question-assignments/:id/questions/:questionId

router.delete(
    "/aptitude-question-assignments/:id/questions/:questionId",
    auth,
    deleteQuestion
);


// SUBMIT QUESTIONS
//
// POST
// /api/employee/aptitude-question-assignments/:id/submit

router.post(
    "/aptitude-question-assignments/:id/submit",
    auth,
    submitQuestions
);


module.exports =
    router;