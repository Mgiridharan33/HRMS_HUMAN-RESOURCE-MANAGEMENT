const mongoose = require("mongoose");

const AptitudeQuestionAssignment =
    require("../models/AptitudeQuestionAssignment");

const AptitudeQuestion =
    require("../models/AptitudeQuestion");


// =========================================================
// HELPERS
// =========================================================

const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(id);

};


// =========================================================
// GET LOGGED-IN EMPLOYEE ID
// =========================================================

const getEmployeeId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId ||
        null
    );

};


// =========================================================
// GET ROLE
// =========================================================

const getUserRole = (req) => {

    return String(
        req.userType ||
        req.user?.role ||
        ""
    )
        .trim()
        .toUpperCase();

};


// =========================================================
// ENSURE EMPLOYEE
// =========================================================

const ensureEmployee = (req, res) => {

    const role =
        getUserRole(req);


    if (role !== "EMPLOYEE") {

        res.status(403).json({

            success: false,

            message:
                "Employee access is required",

        });

        return false;

    }


    return true;

};


// =========================================================
// POPULATE ASSIGNMENT
// =========================================================

const populateAssignment = (query) => {

    return query

        .populate(
            "jobApplication",
            "candidateName candidateEmail candidatePhone jobTitle jobDepartment jobLocation status acceptedByHR"
        )

        .populate(
            "candidate",
            "name email phone profileImage"
        )

        .populate(
            "job",
            "title department designation location employmentType"
        )

        .populate(
            "assignedHR",
            "name email phone profileImage role"
        )

        .populate(
            "assignedEmployee",
            "employeeId firstName lastName email department designation profileImage role"
        );

};


// =========================================================
// UPDATE QUESTION COUNT
//
// Always calculate from DB instead of trusting the frontend.
// =========================================================

const refreshQuestionCount = async (
    assignmentId
) => {

    const count =
        await AptitudeQuestion.countDocuments({

            assignment:
                assignmentId,

        });


    await AptitudeQuestionAssignment.updateOne(

        {
            _id:
                assignmentId,
        },

        {
            $set: {
                questionCount:
                    count,
            },
        }

    );


    return count;

};


// =========================================================
// GET MY ASSIGNMENTS
//
// GET
// /api/employee/aptitude-question-assignments
// =========================================================

const getMyAssignments = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        if (
            !employeeId ||
            !isValidObjectId(
                String(employeeId)
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated employee not found",

            });

        }


        const assignments =
            await AptitudeQuestionAssignment
                .find({

                    assignedEmployee:
                        employeeId,

                })
                .sort({
                    createdAt: -1,
                })
                .populate(
                    "jobApplication",
                    "candidateName candidateEmail candidatePhone jobTitle jobDepartment jobLocation status"
                )
                .populate(
                    "candidate",
                    "name email phone profileImage"
                )
                .populate(
                    "job",
                    "title department designation location employmentType"
                )
                .populate(
                    "assignedHR",
                    "name email role"
                )
                .lean();


        return res.status(200).json({

            success: true,

            count:
                assignments.length,

            assignments,

        });

    } catch (error) {

        console.error(
            "GET EMPLOYEE APTITUDE ASSIGNMENTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude question assignments",

        });

    }

};


// =========================================================
// GET SINGLE ASSIGNMENT
//
// GET
// /api/employee/aptitude-question-assignments/:id
// =========================================================

const getMyAssignmentById = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        const assignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findOne({

                    _id:
                        id,

                    assignedEmployee:
                        employeeId,

                })

            );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Assignment not found or not assigned to you",

            });

        }


        const questions =
            await AptitudeQuestion
                .find({

                    assignment:
                        assignment._id,

                    createdByEmployee:
                        employeeId,

                })
                .sort({
                    createdAt: 1,
                })
                .lean();


        const realCount =
            questions.length;


        // Keep assignment counter synchronized.
        if (
            assignment.questionCount !==
            realCount
        ) {

            await AptitudeQuestionAssignment.updateOne(

                {
                    _id:
                        assignment._id,
                },

                {
                    $set: {
                        questionCount:
                            realCount,
                    },
                }

            );

            assignment.questionCount =
                realCount;

        }


        return res.status(200).json({

            success: true,

            assignment,

            questions,

            questionCount:
                realCount,

            requiredQuestionCount:
                assignment.requiredQuestionCount,

        });

    } catch (error) {

        console.error(
            "GET EMPLOYEE APTITUDE ASSIGNMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude question assignment",

        });

    }

};


// =========================================================
// CREATE QUESTION
//
// POST
// /api/employee/aptitude-question-assignments/:id/questions
// =========================================================

const createQuestion = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        // =====================================================
        // FIND ASSIGNMENT BELONGING TO THIS EMPLOYEE
        // =====================================================

        const assignment =
            await AptitudeQuestionAssignment.findOne({

                _id:
                    id,

                assignedEmployee:
                    employeeId,

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Assignment not found or not assigned to you",

            });

        }


        // =====================================================
        // CHECK ASSIGNMENT STATUS
        // =====================================================

        const editableStatuses = [

            "Assigned",

            "InProgress",

            "Rejected",

            "Resubmitted",

        ];


        if (
            !editableStatuses.includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Questions cannot be added while this assignment is in its current status",

                status:
                    assignment.status,

            });

        }


        // =====================================================
        // CHECK CURRENT COUNT
        // =====================================================

        const currentCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

            });


        // =====================================================
        // DO NOT ALLOW MORE THAN REQUIRED
        // =====================================================

        if (
            currentCount >=
            assignment.requiredQuestionCount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `You have already reached the required ${assignment.requiredQuestionCount} questions`,

                questionCount:
                    currentCount,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

            });

        }


        // =====================================================
        // REQUEST BODY
        // =====================================================

        const {

            question,

            options,

            correctAnswer,

            marks = 1,

            explanation = "",

        } = req.body;


        // =====================================================
        // QUESTION TEXT
        // =====================================================

        if (
            !question ||
            !String(question).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Question text is required",

            });

        }


        // =====================================================
        // OPTIONS
        // =====================================================

        if (
            !Array.isArray(options) ||
            options.length !== 4
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Exactly 4 options are required",

            });

        }


        const cleanedOptions =
            options.map(
                (option) =>
                    String(
                        option || ""
                    ).trim()
            );


        if (
            cleanedOptions.some(
                (option) =>
                    !option
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All four options are required",

            });

        }


        // =====================================================
        // CORRECT ANSWER
        // =====================================================

        const answerIndex =
            Number(
                correctAnswer
            );


        if (
            !Number.isInteger(
                answerIndex
            ) ||
            answerIndex < 0 ||
            answerIndex > 3
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Correct answer must be between 0 and 3",

            });

        }


        // =====================================================
        // MARKS
        // =====================================================

        const questionMarks =
            Number(marks);


        if (
            !Number.isFinite(
                questionMarks
            ) ||
            questionMarks <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Marks must be greater than zero",

            });

        }


        // =====================================================
        // CREATE
        // =====================================================

        const newQuestion =
            await AptitudeQuestion.create({

                assignment:
                    assignment._id,

                job:
                    assignment.job,

                createdBy:
                    employeeId,

                createdByEmployee:
                    employeeId,

                question:
                    String(
                        question
                    ).trim(),

                options:
                    cleanedOptions,

                correctAnswer:
                    answerIndex,

                marks:
                    questionMarks,

                explanation:
                    String(
                        explanation || ""
                    ).trim(),

            });


        // =====================================================
        // UPDATE COUNT
        // =====================================================

        const newCount =
            await refreshQuestionCount(
                assignment._id
            );


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        if (
            assignment.status ===
                "Assigned" ||
            assignment.status ===
                "Rejected"
        ) {

            assignment.status =
                "InProgress";

            await assignment.save();

        }


        return res.status(201).json({

            success: true,

            message:
                "Aptitude question created successfully",

            question:
                newQuestion,

            questionCount:
                newCount,

            requiredQuestionCount:
                assignment.requiredQuestionCount,

            canSubmit:
                newCount ===
                assignment.requiredQuestionCount,

        });

    } catch (error) {

        console.error(
            "CREATE EMPLOYEE APTITUDE QUESTION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create aptitude question",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// UPDATE QUESTION
//
// PATCH
// /api/employee/aptitude-question-assignments/:id/questions/:questionId
// =========================================================

const updateQuestion = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        const {
            id,
            questionId,
        } = req.params;


        if (
            !isValidObjectId(id) ||
            !isValidObjectId(questionId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment or question ID",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findOne({

                _id:
                    id,

                assignedEmployee:
                    employeeId,

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Assignment not found or not assigned to you",

            });

        }


        const editableStatuses = [

            "Assigned",

            "InProgress",

            "Rejected",

            "Resubmitted",

        ];


        if (
            !editableStatuses.includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This assignment cannot be edited now",

            });

        }


        const question =
            await AptitudeQuestion.findOne({

                _id:
                    questionId,

                assignment:
                    assignment._id,

                createdByEmployee:
                    employeeId,

            });


        if (!question) {

            return res.status(404).json({

                success: false,

                message:
                    "Question not found",

            });

        }


        const {

            question: questionText,

            options,

            correctAnswer,

            marks,

            explanation,

        } = req.body;


        // =====================================================
        // QUESTION
        // =====================================================

        if (
            questionText !== undefined
        ) {

            if (
                !String(
                    questionText
                ).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Question text cannot be empty",

                });

            }


            question.question =
                String(
                    questionText
                ).trim();

        }


        // =====================================================
        // OPTIONS
        // =====================================================

        if (
            options !== undefined
        ) {

            if (
                !Array.isArray(options) ||
                options.length !== 4
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Exactly 4 options are required",

                });

            }


            const cleanedOptions =
                options.map(
                    (option) =>
                        String(
                            option || ""
                        ).trim()
                );


            if (
                cleanedOptions.some(
                    (option) =>
                        !option
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "All four options are required",

                });

            }


            question.options =
                cleanedOptions;

        }


        // =====================================================
        // CORRECT ANSWER
        // =====================================================

        if (
            correctAnswer !== undefined
        ) {

            const answerIndex =
                Number(
                    correctAnswer
                );


            if (
                !Number.isInteger(
                    answerIndex
                ) ||
                answerIndex < 0 ||
                answerIndex > 3
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Correct answer must be between 0 and 3",

                });

            }


            question.correctAnswer =
                answerIndex;

        }


        // =====================================================
        // MARKS
        // =====================================================

        if (
            marks !== undefined
        ) {

            const questionMarks =
                Number(marks);


            if (
                !Number.isFinite(
                    questionMarks
                ) ||
                questionMarks <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Marks must be greater than zero",

                });

            }


            question.marks =
                questionMarks;

        }


        // =====================================================
        // EXPLANATION
        // =====================================================

        if (
            explanation !== undefined
        ) {

            question.explanation =
                String(
                    explanation || ""
                ).trim();

        }


        await question.save();


        return res.status(200).json({

            success: true,

            message:
                "Question updated successfully",

            question,

        });

    } catch (error) {

        console.error(
            "UPDATE EMPLOYEE APTITUDE QUESTION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update aptitude question",

        });

    }

};


// =========================================================
// DELETE QUESTION
//
// DELETE
// /api/employee/aptitude-question-assignments/:id/questions/:questionId
// =========================================================

const deleteQuestion = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        const {
            id,
            questionId,
        } = req.params;


        if (
            !isValidObjectId(id) ||
            !isValidObjectId(questionId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment or question ID",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findOne({

                _id:
                    id,

                assignedEmployee:
                    employeeId,

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Assignment not found or not assigned to you",

            });

        }


        const editableStatuses = [

            "Assigned",

            "InProgress",

            "Rejected",

            "Resubmitted",

        ];


        if (
            !editableStatuses.includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Questions cannot be deleted in the current assignment status",

            });

        }


        const question =
            await AptitudeQuestion.findOneAndDelete({

                _id:
                    questionId,

                assignment:
                    assignment._id,

                createdByEmployee:
                    employeeId,

            });


        if (!question) {

            return res.status(404).json({

                success: false,

                message:
                    "Question not found",

            });

        }


        const newCount =
            await refreshQuestionCount(
                assignment._id
            );


        return res.status(200).json({

            success: true,

            message:
                "Question deleted successfully",

            questionCount:
                newCount,

            requiredQuestionCount:
                assignment.requiredQuestionCount,

            canSubmit:
                newCount ===
                assignment.requiredQuestionCount,

        });

    } catch (error) {

        console.error(
            "DELETE EMPLOYEE APTITUDE QUESTION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete aptitude question",

        });

    }

};


// =========================================================
// SUBMIT QUESTIONS
//
// POST
// /api/employee/aptitude-question-assignments/:id/submit
//
// IMPORTANT:
//
// The backend calculates the real question count.
//
// Frontend cannot bypass this.
// =========================================================

const submitQuestions = async (
    req,
    res
) => {

    try {

        if (!ensureEmployee(req, res)) {

            return;

        }


        const employeeId =
            getEmployeeId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findOne({

                _id:
                    id,

                assignedEmployee:
                    employeeId,

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Assignment not found or not assigned to you",

            });

        }


        // =====================================================
        // ALLOWED SUBMISSION STATUS
        // =====================================================

        const allowedStatuses = [

            "Assigned",

            "InProgress",

            "Rejected",

            "Resubmitted",

        ];


        if (
            !allowedStatuses.includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This assignment cannot be submitted in its current status",

                status:
                    assignment.status,

            });

        }


        // =====================================================
        // REAL DATABASE COUNT
        // =====================================================

        const actualQuestionCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

                createdByEmployee:
                    employeeId,

            });


        // =====================================================
        // SYNCHRONIZE COUNTER
        // =====================================================

        assignment.questionCount =
            actualQuestionCount;


        // =====================================================
        // EXACT COUNT CHECK
        // =====================================================

        if (
            actualQuestionCount !==
            assignment.requiredQuestionCount
        ) {

            await assignment.save();


            return res.status(400).json({

                success: false,

                message:
                    `You must create exactly ${assignment.requiredQuestionCount} questions before submitting`,

                questionCount:
                    actualQuestionCount,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

                canSubmit:
                    false,

            });

        }


        // =====================================================
        // SUBMIT
        // =====================================================

        assignment.status =
            "Submitted";


        assignment.submittedAt =
            new Date();


        assignment.rejectionReason =
            "";


        await assignment.save();


        return res.status(200).json({

            success: true,

            message:
                "Questions submitted successfully for Admin verification",

            assignment,

            questionCount:
                actualQuestionCount,

            requiredQuestionCount:
                assignment.requiredQuestionCount,

        });

    } catch (error) {

        console.error(
            "SUBMIT EMPLOYEE APTITUDE QUESTIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit aptitude questions",

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    getMyAssignments,

    getMyAssignmentById,

    createQuestion,

    updateQuestion,

    deleteQuestion,

    submitQuestions,

};