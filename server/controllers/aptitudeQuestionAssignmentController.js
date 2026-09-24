const mongoose = require("mongoose");

const JobApplication =
    require("../models/JobApplication");

const Employee =
    require("../models/Employee");

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


const getUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId ||
        null
    );

};


const getUserRole = (req) => {

    return String(
        req.user?.role ||
        req.userType ||
        ""
    )
        .trim()
        .toUpperCase();

};


// =========================================================
// ENSURE SUPER ADMIN
// =========================================================

const ensureSuperAdmin = (req, res) => {

    const role =
        getUserRole(req);


    if (role !== "SUPER_ADMIN") {

        res.status(403).json({

            success: false,

            message:
                "Super Admin access is required",

        });

        return false;

    }


    return true;

};


// =========================================================
// NORMALIZE OBJECT ID
// =========================================================

const objectIdString = (value) => {

    if (!value) {

        return "";

    }

    if (
        typeof value === "object" &&
        value._id
    ) {

        return String(value._id);

    }

    return String(value);

};


// =========================================================
// POPULATE ASSIGNMENT
// =========================================================

const populateAssignment = (query) => {

    return query

        // Job application
        .populate(
            "jobApplication",
            "candidateName candidateEmail candidatePhone jobTitle jobDepartment jobLocation status acceptedByHR acceptedByHRAt"
        )

        // Candidate
        .populate(
            "candidate",
            "name email phone profileImage resume"
        )

        // Job
        .populate(
            "job",
            "title department designation location employmentType"
        )

        // HR
        .populate(
            "assignedHR",
            "name email phone profileImage role"
        )

        // Employee
        .populate(
            "assignedEmployee",
            "employeeId firstName lastName email department designation profileImage isActive role"
        )

        // Admin
        .populate(
            "assignedBy",
            "name email role"
        )

        // Verification admin
        .populate(
            "verifiedBy",
            "name email role"
        )

        // Original assignment when reusing questions
        .populate(
            "sourceAssignment",
            "jobApplication candidate job requiredQuestionCount questionCount status questionSource createdAt"
        );

};


// =========================================================
// GET APPLICATIONS ELIGIBLE FOR APTITUDE ASSIGNMENT
//
// GET
// /api/admin/aptitude-question-assignments/applications
//
// Shows applications:
// - sent to HR
// - accepted by HR
// =========================================================

const getAptitudeEligibleApplications = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const {
            search = "",
        } = req.query;


        const applications =
            await JobApplication.find({

                sentToHR: true,

                acceptedByHR: {
                    $ne: null,
                },

            })

                .populate(
                    "candidate",
                    "name email phone profileImage resume skills education experience address"
                )

                .populate(
                    "job",
                    "title department designation location employmentType salaryMin salaryMax salaryCurrency"
                )

                .populate(
                    "acceptedByHR",
                    "name email phone profileImage role"
                )

                .sort({

                    acceptedByHRAt: -1,

                    createdAt: -1,

                })

                .lean();


        let filtered =
            applications;


        if (
            search &&
            String(search).trim()
        ) {

            const safeSearch =
                String(search)
                    .trim()
                    .toLowerCase();


            filtered =
                applications.filter(
                    (application) => {

                        const candidateName =
                            String(
                                application.candidateName ||
                                application.candidate?.name ||
                                ""
                            ).toLowerCase();


                        const candidateEmail =
                            String(
                                application.candidateEmail ||
                                application.candidate?.email ||
                                ""
                            ).toLowerCase();


                        const jobTitle =
                            String(
                                application.jobTitle ||
                                application.job?.title ||
                                ""
                            ).toLowerCase();


                        const department =
                            String(
                                application.jobDepartment ||
                                application.job?.department ||
                                ""
                            ).toLowerCase();


                        return (

                            candidateName.includes(
                                safeSearch
                            ) ||

                            candidateEmail.includes(
                                safeSearch
                            ) ||

                            jobTitle.includes(
                                safeSearch
                            ) ||

                            department.includes(
                                safeSearch
                            )

                        );

                    }
                );

        }


        return res.status(200).json({

            success: true,

            count:
                filtered.length,

            applications:
                filtered,

        });

    } catch (error) {

        console.error(
            "GET APTITUDE ELIGIBLE APPLICATIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude eligible applications",

        });

    }

};


// =========================================================
// GET EXISTING QUESTION SETS FOR A JOB
//
// GET
// /api/admin/aptitude-question-assignments/reusable/:jobId
//
// IMPORTANT:
//
// Only aptitude assignments belonging to THIS job are returned.
//
// A new job with no previous approved question assignment
// returns an empty array.
//
// =========================================================

const getReusableQuestionAssignments = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const jobId =
            req.params.jobId ||
            req.query.jobId;

        const excludeApplicationId =
            req.query.excludeApplicationId;


        if (
            !jobId ||
            !isValidObjectId(jobId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid job ID is required",

            });

        }


        // =====================================================
        // FIND PREVIOUS APPROVED / SENT QUESTION ASSIGNMENTS
        //
        // ONLY SAME JOB
        // =====================================================

        const assignments =
            await AptitudeQuestionAssignment.find({

                job:
                    jobId,

                status: {
                    $in: [
                        "Approved",
                        "SentToHR",
                    ],
                },

            })

                .populate(
                    "jobApplication",
                    "candidateName candidateEmail jobTitle acceptedByHRAt"
                )

                .populate(
                    "candidate",
                    "name email"
                )

                .populate(
                    "assignedEmployee",
                    "employeeId firstName lastName email department designation"
                )

                .sort({

                    createdAt: -1,

                })

                .lean();


        // =====================================================
        // VERIFY THAT ACTUAL QUESTIONS EXIST
        // =====================================================

        const reusableSets = [];


        for (
            const assignment
            of assignments
        ) {

            const questionCount =
                await AptitudeQuestion.countDocuments({

                    assignment:
                        assignment._id,

                });


            if (
                questionCount < 1
            ) {

                continue;

            }


            reusableSets.push({

                _id:
                    assignment._id,

                job:
                    assignment.job,

                jobApplication:
                    assignment.jobApplication,

                candidate:
                    assignment.candidate,

                assignedEmployee:
                    assignment.assignedEmployee,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

                questionCount,

                status:
                    assignment.status,

                createdAt:
                    assignment.createdAt,

            });

        }


        return res.status(200).json({

            success: true,

            hasReusableQuestions:
                reusableSets.length > 0,

            count:
                reusableSets.length,

            assignments:
                reusableSets,

        });

    } catch (error) {

        console.error(
            "GET REUSABLE APTITUDE QUESTION ASSIGNMENTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load reusable aptitude question sets",

        });

    }

};


// =========================================================
// GET QUESTIONS FROM A REUSABLE QUESTION SET
//
// GET
// /api/admin/aptitude-question-assignments/reusable/:assignmentId/questions
//
// ADMIN ONLY
// =========================================================

const getReusableQuestions = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const {
            assignmentId,
        } = req.params;


        if (
            !assignmentId ||
            !isValidObjectId(
                assignmentId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid assignment ID is required",

            });

        }


        // =====================================================
        // FIND SOURCE ASSIGNMENT
        // =====================================================

        const assignment =
            await AptitudeQuestionAssignment.findById(
                assignmentId
            )

                .populate(
                    "job",
                    "title department designation location employmentType"
                )

                .populate(
                    "jobApplication",
                    "candidateName candidateEmail jobTitle"
                )

                .populate(
                    "assignedEmployee",
                    "employeeId firstName lastName email department designation"
                );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Source aptitude assignment not found",

            });

        }


        // =====================================================
        // ONLY APPROVED / SENT TO HR CAN BE REUSED
        // =====================================================

        if (
            ![
                "Approved",
                "SentToHR",
            ].includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only approved aptitude questions can be reused",

            });

        }


        const questions =
            await AptitudeQuestion.find({

                assignment:
                    assignment._id,

            })

                .sort({

                    createdAt: 1,

                })

                .lean();


        if (
            questions.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "No questions found in this question set",

            });

        }


        return res.status(200).json({

            success: true,

            assignment,

            questions,

            questionCount:
                questions.length,

        });

    } catch (error) {

        console.error(
            "GET REUSABLE APTITUDE QUESTIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load reusable aptitude questions",

        });

    }

};


// =========================================================
// ASSIGN EMPLOYEE FOR NEW QUESTIONS
//
// POST
// /api/admin/aptitude-question-assignments
//
// BODY:
//
// {
//     jobApplicationId,
//     employeeId,
//     requiredQuestionCount
// }
//
// This endpoint is ONLY for creating NEW questions.
// =========================================================

const assignEmployeeForQuestions = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const adminId =
            getUserId(req);


        if (
            !adminId ||
            !isValidObjectId(
                String(adminId)
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated Super Admin not found",

            });

        }


        const {

            jobApplicationId,

            employeeId,

            requiredQuestionCount,

        } = req.body;


        // =====================================================
        // VALIDATE APPLICATION
        // =====================================================

        if (
            !jobApplicationId ||
            !isValidObjectId(
                String(jobApplicationId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid job application ID is required",

            });

        }


        // =====================================================
        // VALIDATE EMPLOYEE
        // =====================================================

        if (
            !employeeId ||
            !isValidObjectId(
                String(employeeId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid employee ID is required",

            });

        }


        const questionCount =
            Number(
                requiredQuestionCount
            );


        if (
            !Number.isInteger(
                questionCount
            ) ||
            questionCount < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Required question count must be a positive whole number",

            });

        }


        // =====================================================
        // FIND APPLICATION
        // =====================================================

        const application =
            await JobApplication.findById(
                jobApplicationId
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Job application not found",

            });

        }


        // =====================================================
        // HR MUST ACCEPT
        // =====================================================

        if (
            !application.acceptedByHR
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Aptitude questions can only be assigned after an HR accepts the application",

            });

        }


        // =====================================================
        // FIND EMPLOYEE
        // =====================================================

        const employee =
            await Employee.findById(
                employeeId
            )
                .select("-password");


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found",

            });

        }


        // =====================================================
        // EMPLOYEE ACTIVE
        // =====================================================

        if (
            employee.isActive === false
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected employee is inactive",

            });

        }


        // =====================================================
        // EMPLOYEE ROLE
        // =====================================================

        if (
            String(
                employee.role || ""
            )
                .trim()
                .toUpperCase() !==
            "EMPLOYEE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected user is not an employee",

            });

        }


        // =====================================================
        // CHECK EXISTING ASSIGNMENT FOR THIS APPLICATION
        // =====================================================

        const existingAssignment =
            await AptitudeQuestionAssignment.findOne({

                jobApplication:
                    application._id,

                status: {
                    $in: [
                        "Assigned",
                        "InProgress",
                        "Submitted",
                        "AdminReview",
                        "Rejected",
                        "Resubmitted",
                        "Approved",
                        "SentToHR",
                    ],
                },

            });


        if (existingAssignment) {

            return res.status(409).json({

                success: false,

                message:
                    "An aptitude question assignment already exists for this application",

                assignment:
                    existingAssignment._id,

            });

        }


        // =====================================================
        // CREATE NEW QUESTION ASSIGNMENT
        // =====================================================

        const assignmentData = {

            jobApplication:
                application._id,

            candidate:
                application.candidate,

            job:
                application.job,

            assignedHR:
                application.acceptedByHR,

            assignedEmployee:
                employee._id,

            assignedBy:
                adminId,

            requiredQuestionCount:
                questionCount,

            questionCount:
                0,

            status:
                "Assigned",

        };


        // These fields are supported after adding them
        // to AptitudeQuestionAssignment schema.
        assignmentData.questionSource =
            "New";

        assignmentData.sourceAssignment =
            null;


        const assignment =
            await AptitudeQuestionAssignment.create(
                assignmentData
            );


        const populatedAssignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findById(
                    assignment._id
                )

            );


        return res.status(201).json({

            success: true,

            message:
                "Employee assigned successfully to create new aptitude questions",

            assignment:
                populatedAssignment,

        });

    } catch (error) {

        console.error(
            "ASSIGN APTITUDE QUESTION EMPLOYEE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to assign employee for aptitude questions",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// REUSE EXISTING QUESTIONS
//
// POST
// /api/admin/aptitude-question-assignments/reuse
//
// BODY:
//
// {
//     jobApplicationId,
//     sourceAssignmentId
// }
//
// IMPORTANT:
//
// sourceAssignment.job MUST equal
// application.job.
//
// This prevents using questions from another job.
// =========================================================

const reuseExistingQuestions = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const adminId =
            getUserId(req);


        if (
            !adminId ||
            !isValidObjectId(
                String(adminId)
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated Super Admin not found",

            });

        }


        const {

            jobApplicationId,

            sourceAssignmentId,

        } = req.body;


        // =====================================================
        // VALIDATE APPLICATION
        // =====================================================

        if (
            !jobApplicationId ||
            !isValidObjectId(
                String(jobApplicationId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid job application ID is required",

            });

        }


        // =====================================================
        // VALIDATE SOURCE ASSIGNMENT
        // =====================================================

        if (
            !sourceAssignmentId ||
            !isValidObjectId(
                String(sourceAssignmentId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid source assignment ID is required",

            });

        }


        // =====================================================
        // FIND APPLICATION
        // =====================================================

        const application =
            await JobApplication.findById(
                jobApplicationId
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Job application not found",

            });

        }


        // =====================================================
        // HR MUST ACCEPT
        // =====================================================

        if (
            !application.acceptedByHR
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Aptitude questions can only be used after an HR accepts the application",

            });

        }


        // =====================================================
        // FIND SOURCE ASSIGNMENT
        // =====================================================

        const sourceAssignment =
            await AptitudeQuestionAssignment.findById(
                sourceAssignmentId
            );


        if (!sourceAssignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Source aptitude question assignment not found",

            });

        }


        // =====================================================
        // ONLY APPROVED / SENT TO HR
        // =====================================================

        if (
            ![
                "Approved",
                "SentToHR",
            ].includes(
                sourceAssignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only approved aptitude questions can be reused",

            });

        }


        // =====================================================
        // CRITICAL SECURITY CHECK
        //
        // SAME JOB ONLY
        // =====================================================

        if (
            objectIdString(
                sourceAssignment.job
            ) !==
            objectIdString(
                application.job
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Questions from another job cannot be reused. Existing questions are available only for the same job opening.",

            });

        }


        // =====================================================
        // DON'T REUSE QUESTIONS FOR SAME APPLICATION TWICE
        // =====================================================

        const existingAssignment =
            await AptitudeQuestionAssignment.findOne({

                jobApplication:
                    application._id,

                status: {
                    $in: [
                        "Assigned",
                        "InProgress",
                        "Submitted",
                        "AdminReview",
                        "Rejected",
                        "Resubmitted",
                        "Approved",
                        "SentToHR",
                    ],
                },

            });


        if (existingAssignment) {

            return res.status(409).json({

                success: false,

                message:
                    "An aptitude question assignment already exists for this application",

                assignment:
                    existingAssignment._id,

            });

        }


        // =====================================================
        // LOAD SOURCE QUESTIONS
        // =====================================================

        const sourceQuestions =
            await AptitudeQuestion.find({

                assignment:
                    sourceAssignment._id,

            })
                .sort({
                    createdAt: 1,
                })
                .lean();


        if (
            sourceQuestions.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "The selected question set does not contain any questions",

            });

        }


        // =====================================================
        // VERIFY QUESTION COUNT
        // =====================================================

        if (
            sourceQuestions.length !==
            sourceAssignment.requiredQuestionCount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "The selected question set is incomplete and cannot be reused",

                questionCount:
                    sourceQuestions.length,

                requiredQuestionCount:
                    sourceAssignment.requiredQuestionCount,

            });

        }


        // =====================================================
        // CREATE NEW ASSIGNMENT
        //
        // No employee is required because the questions
        // have already been created and approved.
        // =====================================================

        const assignmentData = {

            jobApplication:
                application._id,

            candidate:
                application.candidate,

            job:
                application.job,

            assignedHR:
                application.acceptedByHR,

            assignedEmployee:
                null,

            assignedBy:
                adminId,

            requiredQuestionCount:
                sourceQuestions.length,

            questionCount:
                sourceQuestions.length,

            status:
                "SentToHR",

        };


        assignmentData.questionSource =
            "Existing";

        assignmentData.sourceAssignment =
            sourceAssignment._id;


        const newAssignment =
            await AptitudeQuestionAssignment.create(
                assignmentData
            );
        // New candidate
        //      ↓
        // New assignment
        //      ↓
        // New copied questions
        //
        // Both remain independent.
        // =====================================================

        const questionDocuments =
            sourceQuestions.map(
                (
                    question
                ) => {

                    const copiedQuestion = {

                        assignment:
                            newAssignment._id,

                        job:
                            newAssignment.job,

                        question:
                            question.question,

                        options:
                            Array.isArray(
                                question.options
                            )
                                ? [
                                    ...question.options,
                                ]
                                : [],

                        correctAnswer:
                            question.correctAnswer,

                        marks:
                            question.marks,

                    };


                    // Preserve optional fields if your
                    // AptitudeQuestion schema contains them.

                    if (
                        question.category !==
                        undefined
                    ) {

                        copiedQuestion.category =
                            question.category;

                    }


                    if (
                        question.difficulty !==
                        undefined
                    ) {

                        copiedQuestion.difficulty =
                            question.difficulty;

                    }


                    if (
                        question.questionType !==
                        undefined
                    ) {

                        copiedQuestion.questionType =
                            question.questionType;

                    }


                    if (
                        question.explanation !==
                        undefined
                    ) {

                        copiedQuestion.explanation =
                            question.explanation;

                    }


                    // Because this is an existing approved
                    // question set, keep the original
                    // employee as the historical creator
                    // if your schema supports this field.

                    if (
                        question.createdByEmployee
                    ) {

                        copiedQuestion.createdByEmployee =
                            question.createdByEmployee;

                    }


                    return copiedQuestion;

                }
            );


        await AptitudeQuestion.insertMany(
            questionDocuments
        );


        // =====================================================
        // UPDATE COUNT
        // =====================================================

        newAssignment.questionCount =
            questionDocuments.length;


        await newAssignment.save();


        // =====================================================
        // RETURN COMPLETE ASSIGNMENT
        // =====================================================

        const populatedAssignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findById(
                    newAssignment._id
                )

            );


        return res.status(201).json({

            success: true,

            message:
                "Existing aptitude questions copied successfully and sent to the assigned HR",

            assignment:
                populatedAssignment,

            questionCount:
                questionDocuments.length,

            sourceAssignment:
                sourceAssignment._id,

        });

    } catch (error) {

        console.error(
            "REUSE EXISTING APTITUDE QUESTIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to reuse existing aptitude questions",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET ALL ASSIGNMENTS FOR ADMIN
//
// GET
// /api/admin/aptitude-question-assignments
// =========================================================

const getAllQuestionAssignments = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const {

            status = "",

            search = "",

        } = req.query;


        const query = {};


        // =====================================================
        // STATUS FILTER
        // =====================================================

        if (
            status &&
            status !== "All"
        ) {

            const allowedStatuses = [

                "Assigned",
                "InProgress",
                "Submitted",
                "AdminReview",
                "Rejected",
                "Resubmitted",
                "Approved",
                "SentToHR",

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid assignment status",

                });

            }


            query.status =
                status;

        }


        // =====================================================
        // FETCH
        // =====================================================

        let assignments =
            await populateAssignment(

                AptitudeQuestionAssignment
                    .find(query)
                    .sort({
                        createdAt: -1,
                    })

            );


        // =====================================================
        // SEARCH
        // =====================================================

        if (
            search &&
            String(search).trim()
        ) {

            const safeSearch =
                String(search)
                    .trim()
                    .toLowerCase();


            assignments =
                assignments.filter(
                    (assignment) => {

                        const candidateName =
                            String(
                                assignment
                                    .candidate
                                    ?.name ||
                                assignment
                                    .jobApplication
                                    ?.candidateName ||
                                ""
                            ).toLowerCase();


                        const candidateEmail =
                            String(
                                assignment
                                    .candidate
                                    ?.email ||
                                assignment
                                    .jobApplication
                                    ?.candidateEmail ||
                                ""
                            ).toLowerCase();


                        const jobTitle =
                            String(
                                assignment
                                    .job
                                    ?.title ||
                                assignment
                                    .jobApplication
                                    ?.jobTitle ||
                                ""
                            ).toLowerCase();


                        const employeeName =
                            String(
                                (
                                    assignment
                                        .assignedEmployee
                                        ?.firstName ||
                                    ""
                                ) +
                                " " +
                                (
                                    assignment
                                        .assignedEmployee
                                        ?.lastName ||
                                    ""
                                )
                            ).toLowerCase();


                        return (

                            candidateName.includes(
                                safeSearch
                            ) ||

                            candidateEmail.includes(
                                safeSearch
                            ) ||

                            jobTitle.includes(
                                safeSearch
                            ) ||

                            employeeName.includes(
                                safeSearch
                            )

                        );

                    }
                );

        }


        return res.status(200).json({

            success: true,

            count:
                assignments.length,

            assignments,

        });

    } catch (error) {

        console.error(
            "GET APTITUDE QUESTION ASSIGNMENTS ERROR:",
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
// /api/admin/aptitude-question-assignments/:id
// =========================================================

const getQuestionAssignmentById = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


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

                AptitudeQuestionAssignment.findById(
                    id
                )

            );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude question assignment not found",

            });

        }


        const questionCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

            });


        return res.status(200).json({

            success: true,

            assignment,

            questionCount,

            questionSource:
                assignment.questionSource ||
                "New",

            sourceAssignment:
                assignment.sourceAssignment ||
                null,

        });

    } catch (error) {

        console.error(
            "GET APTITUDE QUESTION ASSIGNMENT ERROR:",
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
// GET ACTIVE EMPLOYEES
//
// GET
// /api/admin/aptitude-question-assignments/employees
// =========================================================

const getQuestionEmployees = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const employees =
            await Employee.find({

                isActive: true,

                role: "EMPLOYEE",

            })

                .select(
                    "employeeId firstName lastName email department designation profileImage"
                )

                .sort({

                    firstName: 1,

                    lastName: 1,

                })

                .lean();


        return res.status(200).json({

            success: true,

            count:
                employees.length,

            employees,

        });

    } catch (error) {

        console.error(
            "GET APTITUDE QUESTION EMPLOYEES ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load employees",

        });

    }

};


// =========================================================
// GET ASSIGNMENT QUESTIONS FOR ADMIN
//
// GET
// /api/admin/aptitude-question-assignments/:id/questions
// =========================================================

const getAssignmentQuestionsForAdmin = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const {
            id,
        } = req.params;


        if (!isValidObjectId(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findById(
                id
            )

                .populate(
                    "jobApplication",
                    "candidateName candidateEmail candidatePhone jobTitle jobDepartment jobLocation status acceptedByHR acceptedByHRAt"
                )

                .populate(
                    "candidate",
                    "name email phone profileImage resume"
                )

                .populate(
                    "job",
                    "title department designation location employmentType"
                )

                .populate(
                    "assignedEmployee",
                    "employeeId firstName lastName email department designation profileImage"
                )

                .populate(
                    "assignedHR",
                    "name email phone profileImage role"
                )

                .populate(
                    "assignedBy",
                    "name email role"
                )

                .populate(
                    "sourceAssignment",
                    "jobApplication candidate job requiredQuestionCount questionCount status questionSource createdAt"
                );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude question assignment not found",

            });

        }


        const questions =
            await AptitudeQuestion.find({

                assignment:
                    assignment._id,

            })

                .populate(
                    "createdByEmployee",
                    "employeeId firstName lastName email department designation"
                )

                .sort({

                    createdAt: 1,

                })

                .lean();


        return res.status(200).json({

            success: true,

            assignment,

            questions,

            questionCount:
                questions.length,

            requiredQuestionCount:
                assignment.requiredQuestionCount,

            canVerify:
                questions.length ===
                assignment.requiredQuestionCount,

            questionSource:
                assignment.questionSource ||
                "New",

            sourceAssignment:
                assignment.sourceAssignment ||
                null,

        });

    } catch (error) {

        console.error(
            "GET ADMIN APTITUDE QUESTIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude questions",

        });

    }

};


// =========================================================
// APPROVE APTITUDE QUESTIONS
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/approve
// =========================================================

const approveQuestionAssignment = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const adminId =
            getUserId(req);


        const {
            id,
        } = req.params;


        if (!isValidObjectId(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findById(
                id
            );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude question assignment not found",

            });

        }


        // =====================================================
        // EXISTING QUESTIONS DO NOT NEED RE-APPROVAL
        // =====================================================

        if (
            assignment.questionSource ===
            "Existing"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This assignment uses an already approved question set and does not require employee question approval",

            });

        }


        // =====================================================
        // ONLY SUBMITTED / RESUBMITTED
        // =====================================================

        if (
            ![
                "Submitted",
                "Resubmitted",
            ].includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only submitted questions can be approved",

                status:
                    assignment.status,

            });

        }


        const questionCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

            });


        if (
            questionCount !==
            assignment.requiredQuestionCount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Cannot approve. Assignment requires exactly ${assignment.requiredQuestionCount} questions`,

                questionCount,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

            });

        }


        // =====================================================
        // APPROVE
        // =====================================================

        assignment.questionCount =
            questionCount;

        assignment.status =
            "Approved";

        assignment.verifiedBy =
            adminId;

        assignment.verifiedAt =
            new Date();

        assignment.rejectionReason =
            "";


        await assignment.save();


        // =====================================================
        // SEND TO HR
        // =====================================================

        assignment.status =
            "SentToHR";

        assignment.sentToHRAt =
            new Date();


        await assignment.save();


        const updatedAssignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findById(
                    assignment._id
                )

            );


        return res.status(200).json({

            success: true,

            message:
                "Aptitude questions approved and sent to assigned HR",

            assignment:
                updatedAssignment,

        });

    } catch (error) {

        console.error(
            "APPROVE APTITUDE QUESTION ASSIGNMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to approve aptitude questions",

        });

    }

};


// =========================================================
// REJECT APTITUDE QUESTIONS
//
// PATCH
// /api/admin/aptitude-question-assignments/:id/reject
// =========================================================

const rejectQuestionAssignment = async (
    req,
    res
) => {

    try {

        if (!ensureSuperAdmin(req, res)) {

            return;

        }


        const adminId =
            getUserId(req);


        const {
            id,
        } = req.params;


        const {
            rejectionReason = "",
        } = req.body;


        if (!isValidObjectId(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid assignment ID",

            });

        }


        const reason =
            String(
                rejectionReason || ""
            ).trim();


        if (!reason) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required",

            });

        }


        const assignment =
            await AptitudeQuestionAssignment.findById(
                id
            );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude question assignment not found",

            });

        }


        // =====================================================
        // EXISTING QUESTION SET CANNOT BE REJECTED
        // =====================================================

        if (
            assignment.questionSource ===
            "Existing"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Existing approved questions cannot be rejected because they were already verified",

            });

        }


        if (
            ![
                "Submitted",
                "Resubmitted",
            ].includes(
                assignment.status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Only submitted questions can be rejected",

                status:
                    assignment.status,

            });

        }


        const questionCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

            });


        if (
            questionCount !==
            assignment.requiredQuestionCount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Question count does not match the assignment requirement",

                questionCount,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

            });

        }


        assignment.status =
            "Rejected";

        assignment.verifiedBy =
            adminId;

        assignment.verifiedAt =
            new Date();

        assignment.rejectionReason =
            reason;

        assignment.submittedAt =
            null;


        await assignment.save();


        const updatedAssignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findById(
                    assignment._id
                )

            );


        return res.status(200).json({

            success: true,

            message:
                "Aptitude questions rejected and returned to employee",

            assignment:
                updatedAssignment,

        });

    } catch (error) {

        console.error(
            "REJECT APTITUDE QUESTION ASSIGNMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to reject aptitude questions",

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    // Existing
    assignEmployeeForQuestions,

    getAllQuestionAssignments,

    getQuestionAssignmentById,

    getQuestionEmployees,

    getAssignmentQuestionsForAdmin,

    approveQuestionAssignment,

    rejectQuestionAssignment,

    getAptitudeEligibleApplications,


    // NEW
    getReusableQuestionAssignments,

    getReusableQuestions,

    reuseExistingQuestions,

};