const mongoose =
    require("mongoose");

const AptitudeQuestionAssignment =
    require("../models/AptitudeQuestionAssignment");

const AptitudeQuestion =
    require("../models/AptitudeQuestion");

const AptitudeTestAttempt =
    require("../models/AptitudeTestAttempt");

const JobApplication =
    require("../models/JobApplication");


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
        req.userType ||
        req.user?.role ||
        ""
    )
        .trim()
        .toUpperCase();

};


const ensureHR = (req, res) => {

    if (
        getUserRole(req) !== "HR"
    ) {

        res.status(403).json({

            success: false,

            message:
                "HR access is required",

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
            [
                "candidate",
                "candidateName",
                "candidateEmail",
                "candidatePhone",
                "candidateProfileImage",
                "candidateResume",
                "candidateSkills",
                "candidateEducation",
                "candidateExperience",
                "job",
                "jobTitle",
                "jobDepartment",
                "jobLocation",
                "status",
                "acceptedByHR",
                "acceptedByHRAt",
            ].join(" ")
        )

        .populate(
            "candidate",
            [
                "name",
                "email",
                "phone",
                "profileImage",
                "resume",
                "skills",
                "education",
                "experience",
                "address",
            ].join(" ")
        )

        .populate(
            "job",
            [
                "title",
                "department",
                "designation",
                "location",
                "employmentType",
                "salaryMin",
                "salaryMax",
                "salaryCurrency",
            ].join(" ")
        )

        .populate(
            "assignedEmployee",
            [
                "employeeId",
                "firstName",
                "lastName",
                "email",
                "department",
                "designation",
                "profileImage",
            ].join(" ")
        )

        .populate(
            "assignedHR",
            [
                "name",
                "email",
                "phone",
                "profileImage",
                "role",
            ].join(" ")
        )

        .populate(
            "assignedBy",
            [
                "name",
                "email",
                "role",
            ].join(" ")
        )

        .populate(
            "verifiedBy",
            [
                "name",
                "email",
                "role",
            ].join(" ")
        );

};


// =========================================================
// GET HR APTITUDE TESTS
//
// GET
// /api/hr/aptitude-tests
//
// These are tests already approved by Admin
// and sent to this HR.
// =========================================================

const getHRAptitudeTests = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }


        const hrId =
            getUserId(req);


        if (!hrId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated HR user not found",

            });

        }


        const {
            search = "",
        } = req.query;


        const query = {

            assignedHR:
                hrId,

            status:
                "SentToHR",

        };


        // =====================================================
        // NORMAL QUERY
        // =====================================================

        let assignments =
            await populateAssignment(

                AptitudeQuestionAssignment
                    .find(query)
                    .sort({
                        sentToHRAt: -1,
                        createdAt: -1,
                    })
                    .lean()

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
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );


            const regex =
                new RegExp(
                    safeSearch,
                    "i"
                );


            assignments =
                assignments.filter(
                    (assignment) => {

                        const application =
                            assignment.jobApplication;


                        if (!application) {
                            return false;
                        }


                        const searchableText = [

                            application.candidateName,

                            application.candidateEmail,

                            application.candidatePhone,

                            application.jobTitle,

                            application.jobDepartment,

                        ]
                            .filter(Boolean)
                            .join(" ");


                        return regex.test(
                            searchableText
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
            "GET HR APTITUDE TESTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR aptitude tests",

        });

    }

};


// =========================================================
// GET SINGLE HR APTITUDE TEST
//
// GET
// /api/hr/aptitude-tests/:id
// =========================================================

const getHRAptitudeTestById = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }


        const hrId =
            getUserId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid aptitude test assignment ID",

            });

        }


        const assignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findOne({

                    _id:
                        id,

                    assignedHR:
                        hrId,

                    status:
                        "SentToHR",

                })

            );


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude test not found or not assigned to you",

            });

        }


        // =====================================================
        // QUESTIONS
        //
        // DO NOT SEND CORRECT ANSWERS TO HR UI
        // =====================================================

        const questions =
            await AptitudeQuestion.find({

                assignment:
                    assignment._id,

            })

            .select(
                [
                    "_id",
                    "question",
                    "options",
                    "marks",
                    "createdAt",
                ].join(" ")
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

        });

    } catch (error) {

        console.error(
            "GET HR APTITUDE TEST BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude test",

        });

    }

};


// =========================================================
// SEND TEST TO CANDIDATE
//
// PATCH
// /api/hr/aptitude-tests/:id/send
// =========================================================

const sendAptitudeTestToCandidate = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }


        const hrId =
            getUserId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid aptitude test assignment ID",

            });

        }


        // =====================================================
        // FIND ASSIGNMENT
        // =====================================================

        const assignment =
            await AptitudeQuestionAssignment.findOne({

                _id:
                    id,

                assignedHR:
                    hrId,

                status:
                    "SentToHR",

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude test not found or not assigned to you",

            });

        }


        // =====================================================
        // FIND APPLICATION
        // =====================================================

        const application =
            await JobApplication.findById(
                assignment.jobApplication
            );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Candidate application not found",

            });

        }


        // =====================================================
        // SECURITY
        // =====================================================

        if (
            String(
                application.acceptedByHR
            ) !==
            String(hrId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not the HR assigned to this candidate",

            });

        }


        // =====================================================
        // QUESTIONS
        // =====================================================

        const questionCount =
            await AptitudeQuestion.countDocuments({

                assignment:
                    assignment._id,

            });


        if (
            questionCount !==
            Number(
                assignment.requiredQuestionCount
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "The aptitude question set is incomplete",

                questionCount,

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

            });

        }


        // =====================================================
        // SEND
        // =====================================================

        const now =
            new Date();


        assignment.status =
            "SentToCandidate";


        assignment.sentToCandidateAt =
            now;


        await assignment.save();


        // =====================================================
        // APPLICATION → INTERVIEW
        // =====================================================

        if (
            application.status !==
            "Interview"
        ) {

            application.status =
                "Interview";


            application.reviewedBy =
                hrId;


            application.reviewedAt =
                now;


            await application.save();

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        const updatedAssignment =
            await populateAssignment(

                AptitudeQuestionAssignment.findById(
                    assignment._id
                )

            );


        return res.status(200).json({

            success: true,

            message:
                "Aptitude test sent to candidate successfully",

            assignment:
                updatedAssignment,

        });

    } catch (error) {

        console.error(
            "SEND APTITUDE TEST TO CANDIDATE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to send aptitude test to candidate",

        });

    }

};


// =========================================================
// GET HR SUBMITTED APTITUDE TESTS
//
// GET
// /api/hr/aptitude-tests/results
//
// Only submitted/completed tests belonging to
// the logged-in HR.
//
// =========================================================

const getHRSubmittedAptitudeTests = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }


        const hrId =
            getUserId(req);


        if (!hrId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated HR user not found",

            });

        }


        const {
            search = "",
        } = req.query;


        // =====================================================
        // FIND ASSIGNMENTS
        //
        // Candidate already submitted the test.
        // =====================================================

        const assignments =
            await AptitudeQuestionAssignment.find({

                assignedHR:
                    hrId,

                status:
                    "Completed",

            })

            .populate(

                "jobApplication",

                [
                    "candidate",
                    "candidateName",
                    "candidateEmail",
                    "candidatePhone",
                    "candidateProfileImage",
                    "jobTitle",
                    "jobDepartment",
                    "jobLocation",
                    "status",
                ].join(" ")

            )

            .populate(

                "candidate",

                [
                    "name",
                    "email",
                    "phone",
                    "profileImage",
                ].join(" ")

            )

            .populate(

                "assignedHR",

                [
                    "name",
                    "email",
                    "role",
                ].join(" ")

            )

            .sort({

                candidateSubmittedAt:
                    -1,

            })

            .lean();


        // =====================================================
        // SEARCH
        // =====================================================

        let filtered =
            assignments;


        if (
            search &&
            String(search).trim()
        ) {

            const regex =
                new RegExp(

                    String(search)
                        .trim()
                        .replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        ),

                    "i"

                );


            filtered =
                assignments.filter(
                    (assignment) => {

                        const app =
                            assignment.jobApplication;


                        const text = [

                            app?.candidateName,

                            app?.candidateEmail,

                            app?.candidatePhone,

                            app?.jobTitle,

                            app?.jobDepartment,

                        ]
                            .filter(Boolean)
                            .join(" ");


                        return regex.test(
                            text
                        );

                    }
                );

        }


        // =====================================================
        // GET ATTEMPTS
        // =====================================================

        const assignmentIds =
            filtered.map(
                (assignment) =>
                    assignment._id
            );


        const attempts =
            await AptitudeTestAttempt.find({

                assignment: {

                    $in:
                        assignmentIds,

                },

                candidateSubmittedAt:
                    undefined,

            });


        /*
         * The above query should not be used for the
         * actual result lookup because candidateSubmittedAt
         * belongs to Assignment in your current flow.
         *
         * We therefore fetch by assignment below.
         */


        const actualAttempts =
            await AptitudeTestAttempt.find({

                assignment: {

                    $in:
                        assignmentIds,

                },

                status:
                    "Submitted",

            })

            .select(

                [
                    "_id",
                    "assignment",
                    "candidate",
                    "jobApplication",
                    "assignedHR",
                    "totalQuestions",
                    "answeredQuestions",
                    "correctAnswers",
                    "wrongAnswers",
                    "score",
                    "percentage",
                    "status",
                    "startedAt",
                    "submittedAt",
                    "resultPublished",
                ].join(" ")

            )

            .sort({

                submittedAt:
                    -1,

            })

            .lean();


        const attemptMap =
            new Map();


        actualAttempts.forEach(
            (attempt) => {

                attemptMap.set(

                    String(
                        attempt.assignment
                    ),

                    attempt

                );

            }
        );


        // =====================================================
        // BUILD RESPONSE
        // =====================================================

        const results =
            filtered.map(
                (assignment) => {

                    return {

                        assignment,

                        attempt:

                            attemptMap.get(

                                String(
                                    assignment._id
                                )

                            ) || null,

                    };

                }
            );


        return res.status(200).json({

            success: true,

            count:
                results.length,

            results,

        });

    } catch (error) {

        console.error(
            "GET HR SUBMITTED APTITUDE TESTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude test results",

        });

    }

};


// =========================================================
// GET HR SUBMITTED TEST BY ID
//
// GET
// /api/hr/aptitude-tests/results/:id
//
// :id = AptitudeTestAttempt ID
//
// =========================================================

const getHRSubmittedAptitudeTestById = async (
    req,
    res
) => {

    try {

        if (!ensureHR(req, res)) {
            return;
        }


        const hrId =
            getUserId(req);


        const {
            id,
        } = req.params;


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid aptitude test attempt ID",

            });

        }


        // =====================================================
        // FIND ATTEMPT
        // =====================================================

        const attempt =
            await AptitudeTestAttempt.findOne({

                _id:
                    id,

                assignedHR:
                    hrId,

                status:
                    "Submitted",

            })

            .populate(

                "candidate",

                [
                    "name",
                    "email",
                    "phone",
                    "profileImage",
                    "resume",
                    "skills",
                    "education",
                    "experience",
                ].join(" ")

            )

            .populate(

                "jobApplication",

                [
                    "candidateName",
                    "candidateEmail",
                    "candidatePhone",
                    "candidateProfileImage",
                    "candidateResume",
                    "candidateSkills",
                    "candidateEducation",
                    "candidateExperience",
                    "jobTitle",
                    "jobDepartment",
                    "jobLocation",
                    "status",
                ].join(" ")

            )

            .lean();


        if (!attempt) {

            return res.status(404).json({

                success: false,

                message:
                    "Submitted aptitude test not found or not assigned to you",

            });

        }


        // =====================================================
        // GET QUESTIONS
        //
        // HR can see correct answers here because this
        // is the result/review screen.
        // =====================================================

        const questions =
            await AptitudeQuestion.find({

                assignment:
                    attempt.assignment,

            })

            .select(

                [
                    "_id",
                    "question",
                    "options",
                    "correctAnswer",
                    "marks",
                ].join(" ")

            )

            .sort({

                createdAt:
                    1,

            })

            .lean();


        // =====================================================
        // MAP ANSWERS
        // =====================================================

        const answerMap =
            new Map();


        (attempt.answers || [])
            .forEach(
                (answer) => {

                    answerMap.set(

                        String(
                            answer.question
                        ),

                        answer

                    );

                }
            );


        // =====================================================
        // BUILD QUESTION RESULT
        // =====================================================

        const questionResults =
            questions.map(
                (question) => {

                    const answer =
                        answerMap.get(

                            String(
                                question._id
                            )

                        );


                    return {

                        questionId:
                            question._id,

                        question:
                            question.question,

                        options:
                            question.options,

                        correctAnswer:
                            question.correctAnswer,

                        selectedOption:
                            answer?.selectedOption ||
                            "",

                        isCorrect:
                            answer?.isCorrect ||
                            false,

                        marks:
                            question.marks,

                    };

                }
            );


        return res.status(200).json({

            success: true,

            attempt: {

                _id:
                    attempt._id,

                assignment:
                    attempt.assignment,

                candidate:
                    attempt.candidate,

                jobApplication:
                    attempt.jobApplication,

                totalQuestions:
                    attempt.totalQuestions,

                answeredQuestions:
                    attempt.answeredQuestions,

                correctAnswers:
                    attempt.correctAnswers,

                wrongAnswers:
                    attempt.wrongAnswers,

                score:
                    attempt.score,

                percentage:
                    attempt.percentage,

                status:
                    attempt.status,

                startedAt:
                    attempt.startedAt,

                submittedAt:
                    attempt.submittedAt,

                resultPublished:
                    attempt.resultPublished,

            },

            questions:
                questionResults,

        });

    } catch (error) {

        console.error(
            "GET HR SUBMITTED APTITUDE TEST BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude test result",

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    getHRAptitudeTests,

    getHRAptitudeTestById,

    sendAptitudeTestToCandidate,

    getHRSubmittedAptitudeTests,

    getHRSubmittedAptitudeTestById,

};