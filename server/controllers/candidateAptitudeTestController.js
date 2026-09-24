const mongoose = require("mongoose");

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


const normalizeAnswer = (
    value,
    options = []
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    // =====================================================
    // NUMBER
    // =====================================================

    if (
        typeof value === "number"
    ) {

        if (
            Number.isInteger(value) &&
            value >= 0 &&
            value <= 3
        ) {

            return value;

        }

        return null;

    }


    // =====================================================
    // STRING
    // =====================================================

    const answer =
        String(value)
            .trim()
            .toUpperCase();


    if (!answer) {

        return null;

    }


    // =====================================================
    // LETTER
    // =====================================================

    const letterMap = {

        A: 0,

        B: 1,

        C: 2,

        D: 3,

    };


    if (
        Object.prototype.hasOwnProperty.call(
            letterMap,
            answer
        )
    ) {

        return letterMap[answer];

    }


    // =====================================================
    // NUMBER STRING
    // =====================================================

    if (
        /^[0-3]$/.test(answer)
    ) {

        return Number(answer);

    }


    // Accept the option text when the candidate UI submits
    // the selected value instead of its numeric index.
    if (Array.isArray(options)) {

        const optionIndex =
            options.findIndex(
                (option) =>
                    String(option)
                        .trim()
                        .toUpperCase() === answer
            );


        if (optionIndex >= 0) {

            return optionIndex;

        }

    }


    return null;

};


// =========================================================
// CONVERT INDEX TO LETTER
// =========================================================

const answerToLetter = (value) => {

    const normalized =
        normalizeAnswer(value);


    if (
        normalized === null
    ) {

        return null;

    }


    return [
        "A",
        "B",
        "C",
        "D",
    ][normalized];

};


// =========================================================
// GET OPTION TEXT
// =========================================================

const getOptionText = (
    options,
    answer
) => {

    const normalized =
        normalizeAnswer(answer);


    if (
        normalized === null
    ) {

        return null;

    }


    if (
        !Array.isArray(options)
    ) {

        return null;

    }


    return (
        options[normalized] ||
        null
    );

};


// =========================================================
// GET CANDIDATE ID
// =========================================================

const getCandidateId = (req) => {

    return (

        req.user?._id ||

        req.user?.id ||

        req.user?.userId ||

        req.candidate?._id ||

        req.candidate?.id ||

        null

    );

};


// =========================================================
// GET USER ROLE
// =========================================================

const getUserRole = (req) => {

    return String(

        req.user?.role ||

        req.userType ||

        req.candidate?.role ||

        "CANDIDATE"

    )
        .trim()
        .toUpperCase();

};


// =========================================================
// ENSURE CANDIDATE
// =========================================================

const ensureCandidate = (
    req,
    res
) => {

    const role =
        getUserRole(req);


    if (
        role !== "CANDIDATE"
    ) {

        res.status(403).json({

            success: false,

            message:
                "Candidate access is required",

        });

        return false;

    }


    return true;

};


// =========================================================
// GET CANDIDATE APTITUDE TESTS
//
// GET
// /api/candidate/aptitude-tests
// =========================================================

const getCandidateAptitudeTests = async (
    req,
    res
) => {

    try {

        if (
            !ensureCandidate(
                req,
                res
            )
        ) {

            return;

        }


        const candidateId =
            getCandidateId(req);


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication not found",

            });

        }


        if (
            !isValidObjectId(
                String(candidateId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid candidate ID",

            });

        }


        // =====================================================
        // GET TEST ASSIGNMENTS
        // =====================================================

        const assignments =
            await AptitudeQuestionAssignment.find({

                candidate:
                    candidateId,

                status:
                    "SentToCandidate",

            })

            .populate(

                "jobApplication",

                [
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

            .sort({

                sentToCandidateAt:
                    -1,

                createdAt:
                    -1,

            })

            .lean();


        if (
            assignments.length === 0
        ) {

            return res.status(200).json({

                success: true,

                count: 0,

                tests: [],

            });

        }


        // =====================================================
        // GET ATTEMPTS
        // =====================================================

        const assignmentIds =
            assignments.map(
                (assignment) =>
                    assignment._id
            );


        const attempts =
            await AptitudeTestAttempt.find({

                candidate:
                    candidateId,

                assignment: {

                    $in:
                        assignmentIds,

                },

            })

            .select(

                [
                    "assignment",
                    "status",
                    "score",
                    "percentage",
                    "totalQuestions",
                    "answeredQuestions",
                    "correctAnswers",
                    "wrongAnswers",
                    "startedAt",
                    "submittedAt",
                    "expiresAt",
                    "resultPublished",
                ].join(" ")

            )

            .lean();


        const attemptMap =
            new Map();


        attempts.forEach(
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
        // BUILD TEST RESPONSE
        // =====================================================

        const tests =
            assignments.map(
                (assignment) => {

                    const attempt =
                        attemptMap.get(

                            String(
                                assignment._id
                            )

                        );


                    return {

                        ...assignment,

                        attempt:
                            attempt ||
                            null,

                        canStart:
                            !attempt,

                        isStarted:
                            attempt?.status ===
                            "Started",

                        isSubmitted:
                            attempt?.status ===
                            "Submitted",

                        isExpired:
                            attempt?.status ===
                            "Expired",

                        score:
                            attempt?.score ??
                            null,

                        percentage:
                            attempt?.percentage ??
                            null,

                    };

                }
            );


        return res.status(200).json({

            success: true,

            count:
                tests.length,

            tests,

        });

    } catch (error) {

        console.error(
            "GET CANDIDATE APTITUDE TESTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude tests",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// START APTITUDE TEST
//
// POST
// /api/candidate/aptitude-tests/:id/start
//
// :id = AptitudeQuestionAssignment ID
// =========================================================

const startCandidateAptitudeTest = async (
    req,
    res
) => {

    try {

        if (
            !ensureCandidate(
                req,
                res
            )
        ) {

            return;

        }


        const candidateId =
            getCandidateId(req);


        const {
            id,
        } = req.params;


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication not found",

            });

        }


        if (
            !isValidObjectId(
                String(candidateId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid candidate ID",

            });

        }


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

                candidate:
                    candidateId,

                status:
                    "SentToCandidate",

            });


        if (!assignment) {

            return res.status(404).json({

                success: false,

                message:
                    "Aptitude test is not available",

            });

        }


        // =====================================================
        // FIND APPLICATION
        // =====================================================

        if (
            !assignment.jobApplication
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Candidate application is missing",

            });

        }


        const application =
            await JobApplication.findById(

                assignment.jobApplication

            )

            .select(

                [
                    "_id",
                    "candidate",
                    "job",
                    "acceptedByHR",
                    "status",
                ].join(" ")

            )

            .lean();


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Candidate application not found",

            });

        }


        if (
            String(
                application.candidate
            ) !==
            String(
                candidateId
            )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "This test does not belong to you",

            });

        }


        // =====================================================
        // CHECK EXISTING ATTEMPT
        // =====================================================

        const existingAttempt =
            await AptitudeTestAttempt.findOne({

                assignment:
                    assignment._id,

                candidate:
                    candidateId,

            });


        if (existingAttempt) {

            return res.status(409).json({

                success: false,

                message:
                    "You have already started or completed this test",

                attempt:
                    existingAttempt,

            });

        }


        // =====================================================
        // GET QUESTIONS
        //
        // IMPORTANT:
        // correctAnswer is NOT selected.
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
                ].join(" ")

            )

            .sort({

                createdAt:
                    1,

            })

            .lean();


        if (
            questions.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No questions are available for this test",

            });

        }


        // =====================================================
        // VERIFY QUESTION COUNT
        // =====================================================

        if (

            Number(
                assignment.requiredQuestionCount
            ) > 0 &&

            questions.length !==
            Number(
                assignment.requiredQuestionCount
            )

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This aptitude test is incomplete",

                requiredQuestionCount:
                    assignment.requiredQuestionCount,

                actualQuestionCount:
                    questions.length,

            });

        }


        // =====================================================
        // DURATION
        // =====================================================

        const durationMinutes =
            Number(
                assignment.durationMinutes
            ) > 0

                ? Number(
                    assignment.durationMinutes
                )

                : 30;


        const startedAt =
            new Date();


        const expiresAt =
            new Date(

                startedAt.getTime() +

                durationMinutes *
                60 *
                1000

            );


        // =====================================================
        // CREATE ATTEMPT
        // =====================================================

        const attempt =
            await AptitudeTestAttempt.create({

                assignment:
                    assignment._id,

                jobApplication:
                    assignment.jobApplication,

                candidate:
                    candidateId,

                assignedHR:
                    assignment.assignedHR,

                totalQuestions:
                    questions.length,

                answeredQuestions:
                    0,

                correctAnswers:
                    0,

                wrongAnswers:
                    0,

                score:
                    0,

                percentage:
                    0,

                answers: [],

                status:
                    "Started",

                startedAt,

                expiresAt,

                resultPublished:
                    false,

            });


        return res.status(201).json({

            success: true,

            message:
                "Aptitude test started successfully",

            attemptId:
                attempt._id,

            assignmentId:
                assignment._id,

            startedAt,

            expiresAt,

            durationMinutes,

            totalQuestions:
                questions.length,

            questions,

        });

    } catch (error) {

        console.error(
            "START CANDIDATE APTITUDE TEST ERROR:",
            error
        );


        if (
            error?.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "You have already started this test",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to start aptitude test",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// SUBMIT APTITUDE TEST
//
// POST
// /api/candidate/aptitude-tests/:id/submit
//
// :id = AptitudeTestAttempt ID
//
// BODY:
//
// {
//     answers: [
//         {
//             questionId: "...",
//             selectedOption: "A"
//         }
//     ]
// }
//
// =========================================================

const submitCandidateAptitudeTest = async (
    req,
    res
) => {

    try {

        if (
            !ensureCandidate(
                req,
                res
            )
        ) {

            return;

        }


        const candidateId =
            getCandidateId(req);


        const {
            id,
        } = req.params;


        const {
            answers = [],
        } = req.body;


        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication not found",

            });

        }


        if (
            !isValidObjectId(
                String(candidateId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid candidate ID",

            });

        }


        if (
            !isValidObjectId(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid aptitude test attempt ID",

            });

        }


        if (
            !Array.isArray(answers)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Answers must be an array",

            });

        }


        // =====================================================
        // FIND ACTIVE ATTEMPT
        // =====================================================

        const attempt =
            await AptitudeTestAttempt.findOne({

                _id:
                    id,

                candidate:
                    candidateId,

                status:
                    "Started",

            });


        if (!attempt) {

            return res.status(404).json({

                success: false,

                message:
                    "Active aptitude test attempt not found",

            });

        }


        // =====================================================
        // CHECK EXPIRY
        // =====================================================

        const now =
            new Date();


        if (

            attempt.expiresAt &&

            now >
            attempt.expiresAt

        ) {

            attempt.status =
                "Expired";

            attempt.submittedAt =
                now;

            await attempt.save();


            return res.status(400).json({

                success: false,

                message:
                    "The aptitude test time has expired",

                expired:
                    true,

            });

        }


        // =====================================================
        // GET QUESTIONS
        //
        // correctAnswer IS fetched only on backend.
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


        if (
            questions.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No questions found for this test",

            });

        }


        // =====================================================
        // MAP SUBMITTED ANSWERS
        //
        // IMPORTANT:
        //
        // Every answer is normalized to:
        //
        // 0 / 1 / 2 / 3
        //
        // This makes:
        //
        // "A"
        // 0
        // "0"
        //
        // all equal.
        // =====================================================

        const submittedAnswerMap =
            new Map();


        answers.forEach(
            (answer) => {

                const questionId =
                    answer?.questionId ||
                    answer?.question ||
                    answer?.id;

                const submittedValue =
                    answer?.selectedOption ??
                    answer?.selectedAnswer ??
                    answer?.answer;


                if (!questionId) {

                    return;

                }


                if (
                    !isValidObjectId(
                        String(
                            questionId
                        )
                    )
                ) {

                    return;

                }


                // =================================================
                // Preserve the raw value until the matching question
                // is available, so option text can be resolved safely.
                // =================================================

                submittedAnswerMap.set(

                    String(
                        questionId
                    ),

                    submittedValue

                );

            }
        );


        // =====================================================
        // CALCULATE RESULT
        // =====================================================

        let correctAnswers =
            0;

        let wrongAnswers =
            0;

        let answeredQuestions =
            0;

        let totalMarks =
            0;

        let obtainedMarks =
            0;


        // =====================================================
        // FINAL ANSWERS
        // =====================================================

        const finalAnswers =
            questions.map(
                (question) => {

                    const questionId =
                        String(
                            question._id
                        );


                    const submittedValue =
                        submittedAnswerMap.get(
                            questionId
                        );


                    const selectedOption =
                        normalizeAnswer(
                            submittedValue,
                            question.options
                        );


                    const hasAnswer =
                        selectedOption !==
                        undefined &&
                        selectedOption !==
                        null;


                    // =================================================
                    // MARKS
                    // =================================================

                    const marks =
                        Number(
                            question.marks
                        ) >= 0

                            ? Number(
                                question.marks
                            )

                            : 1;


                    totalMarks +=
                        marks;


                    // =================================================
                    // NORMALIZE DATABASE CORRECT ANSWER
                    // =================================================

                    const correctAnswer =
                        normalizeAnswer(
                            question.correctAnswer
                        );


                    // =================================================
                    // COMPARE
                    //
                    // THIS IS THE IMPORTANT FIX.
                    //
                    // Both values are numbers:
                    //
                    // candidate: 0
                    // correct:   0
                    //
                    // candidate: "A" -> 0
                    // correct:   0
                    //
                    // => TRUE
                    // =================================================

                    const isCorrect =

                        hasAnswer &&

                        correctAnswer !== null &&

                        selectedOption ===
                        correctAnswer;


                    // =================================================
                    // COUNTS
                    // =================================================

                    if (
                        hasAnswer
                    ) {

                        answeredQuestions++;

                    }


                    if (
                        isCorrect
                    ) {

                        correctAnswers++;

                        obtainedMarks +=
                            marks;

                    }

                    else if (
                        hasAnswer
                    ) {

                        wrongAnswers++;

                    }


                    // =================================================
                    // SAVE ANSWER
                    //
                    // Your schema currently uses String.
                    // Therefore store the normalized option
                    // as a string:
                    //
                    // "0"
                    // "1"
                    // "2"
                    // "3"
                    // =================================================

                    return {

                        question:
                            question._id,

                        selectedOption:
                            hasAnswer

                                ? String(
                                    selectedOption
                                )

                                : "",

                        isCorrect:
                            Boolean(
                                isCorrect
                            ),

                        answeredAt:
                            hasAnswer
                                ? now
                                : null,

                    };

                }
            );


        // =====================================================
        // UNANSWERED
        // =====================================================

        const unansweredQuestions =
            Math.max(

                questions.length -
                answeredQuestions,

                0

            );


        // =====================================================
        // PERCENTAGE
        // =====================================================

        const percentage =
            totalMarks > 0

                ? Number(

                    (
                        (
                            obtainedMarks /
                            totalMarks
                        ) *
                        100
                    ).toFixed(2)

                )

                : 0;


        // =====================================================
        // SAVE ATTEMPT
        // =====================================================

        attempt.answers =
            finalAnswers;


        attempt.totalQuestions =
            questions.length;


        attempt.answeredQuestions =
            answeredQuestions;


        attempt.correctAnswers =
            correctAnswers;


        attempt.wrongAnswers =
            wrongAnswers;


        attempt.score =
            obtainedMarks;


        attempt.percentage =
            percentage;


        attempt.status =
            "Submitted";


        attempt.submittedAt =
            now;


        attempt.resultPublished =
            false;


        await attempt.save();


        // =====================================================
        // UPDATE ASSIGNMENT
        // =====================================================

        await AptitudeQuestionAssignment.findByIdAndUpdate(

            attempt.assignment,

            {

                $set: {

                    status:
                        "Completed",

                    candidateSubmittedAt:
                        now,

                },

            }

        );


        // =====================================================
        // BUILD QUESTION RESULTS
        //
        // This response is useful for immediately displaying
        // the result page after submission.
        // =====================================================

        const questionResults =
            questions.map(
                (question) => {

                    const savedAnswer =
                        finalAnswers.find(

                            (answer) =>

                                String(
                                    answer.question
                                ) ===
                                String(
                                    question._id
                                )

                        );


                    const selected =
                        savedAnswer
                            ?.selectedOption;


                    const normalizedSelected =
                        normalizeAnswer(
                            selected
                        );


                    const normalizedCorrect =
                        normalizeAnswer(
                            question.correctAnswer
                        );


                    return {

                        questionId:
                            question._id,

                        question:
                            question.question,

                        options:
                            question.options,

                        marks:
                            Number(
                                question.marks
                            ) >= 0

                                ? Number(
                                    question.marks
                                )

                                : 1,

                        selectedOption:
                            normalizedSelected !== null

                                ? normalizedSelected

                                : null,

                        selectedAnswer:
                            answerToLetter(
                                normalizedSelected
                            ),

                        selectedOptionText:
                            getOptionText(
                                question.options,
                                normalizedSelected
                            ),

                        correctOption:
                            normalizedCorrect,

                        correctAnswer:
                            answerToLetter(
                                normalizedCorrect
                            ),

                        correctOptionText:
                            getOptionText(
                                question.options,
                                normalizedCorrect
                            ),

                        isCorrect:
                            Boolean(
                                savedAnswer?.isCorrect
                            ),

                        answered:
                            normalizedSelected !==
                            null,

                    };

                }
            );


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message:
                "Aptitude test submitted successfully",

            result: {

                attemptId:
                    attempt._id,

                assignmentId:
                    attempt.assignment,

                totalQuestions:
                    questions.length,

                answeredQuestions:
                    answeredQuestions,

                unansweredQuestions:
                    unansweredQuestions,

                correctAnswers:
                    correctAnswers,

                wrongAnswers:
                    wrongAnswers,

                score:
                    obtainedMarks,

                totalMarks:
                    totalMarks,

                percentage:
                    percentage,

                submittedAt:
                    now,

                questionResults,

            },

        });

    } catch (error) {

        console.error(
            "SUBMIT CANDIDATE APTITUDE TEST ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit aptitude test",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET CANDIDATE TEST RESULT
//
// GET
// /api/candidate/aptitude-tests/attempt/:id
//
// IMPORTANT:
//
// Before submission:
// correct answer is NOT returned.
//
// After submission:
// full result is returned, including:
//
// - candidate selected answer
// - correct answer
// - option text
// - isCorrect
// - marks
// =========================================================

const getCandidateAptitudeTestResult = async (
    req,
    res
) => {

    try {

        if (
            !ensureCandidate(
                req,
                res
            )
        ) {

            return;

        }


        const candidateId =
            getCandidateId(req);


        const {
            id,
        } = req.params;


        if (
            !candidateId
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication not found",

            });

        }


        if (
            !isValidObjectId(
                String(candidateId)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid candidate ID",

            });

        }


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

                candidate:
                    candidateId,

            })

            .populate(

                "assignment",

                [
                    "requiredQuestionCount",
                    "durationMinutes",
                    "status",
                    "sentToCandidateAt",
                    "candidateSubmittedAt",
                ].join(" ")

            )

            .populate(

                "jobApplication",

                [
                    "candidateName",
                    "candidateEmail",
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
                    "Test attempt not found",

            });

        }


        // =====================================================
        // NOT SUBMITTED
        // =====================================================

        if (
            attempt.status !==
            "Submitted"
        ) {

            return res.status(200).json({

                success: true,

                submitted:
                    false,

                attempt: {

                    _id:
                        attempt._id,

                    assignment:
                        attempt.assignment,

                    status:
                        attempt.status,

                    startedAt:
                        attempt.startedAt,

                    expiresAt:
                        attempt.expiresAt,

                    submittedAt:
                        attempt.submittedAt,

                },

            });

        }


        // =====================================================
        // GET QUESTIONS
        //
        // We need correctAnswer to construct the
        // question-by-question result.
        // =====================================================

        const questions =
            await AptitudeQuestion.find({

                assignment:
                    attempt.assignment?._id ||
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
        // MAP SAVED ANSWERS
        // =====================================================

        const answerMap =
            new Map();


        if (
            Array.isArray(
                attempt.answers
            )
        ) {

            attempt.answers.forEach(
                (answer) => {

                    if (
                        answer?.question
                    ) {

                        answerMap.set(

                            String(
                                answer.question
                            ),

                            answer

                        );

                    }

                }
            );

        }


        // =====================================================
        // BUILD COMPLETE QUESTION RESULT
        // =====================================================

        const questionResults =
            questions.map(
                (question) => {

                    const savedAnswer =
                        answerMap.get(

                            String(
                                question._id
                            )

                        );


                    const selectedOption =
                        normalizeAnswer(

                            savedAnswer
                                ?.selectedOption,

                            question.options

                        );


                    const correctAnswer =
                        normalizeAnswer(

                            question.correctAnswer

                        );


                    const isCorrect =

                        selectedOption !==
                        null &&

                        correctAnswer !==
                        null &&

                        selectedOption ===
                        correctAnswer;


                    const marks =
                        Number(
                            question.marks
                        ) >= 0

                            ? Number(
                                question.marks
                            )

                            : 1;


                    return {

                        questionId:
                            question._id,

                        question:
                            question.question,

                        options:
                            question.options,

                        marks:
                            marks,

                        selectedOption:
                            selectedOption,

                        selectedAnswer:
                            answerToLetter(
                                selectedOption
                            ),

                        selectedOptionText:
                            getOptionText(
                                question.options,
                                selectedOption
                            ),

                        correctOption:
                            correctAnswer,

                        correctAnswer:
                            answerToLetter(
                                correctAnswer
                            ),

                        correctOptionText:
                            getOptionText(
                                question.options,
                                correctAnswer
                            ),

                        isCorrect:
                            Boolean(
                                isCorrect
                            ),

                        answered:
                            selectedOption !==
                            null,

                        answeredAt:
                            savedAnswer
                                ?.answeredAt ||
                            null,

                    };

                }
            );


        // =====================================================
        // RECALCULATE FROM QUESTIONS
        //
        // This makes the result page reliable even if some
        // old attempt documents contain incorrect summary
        // values.
        // =====================================================

        let calculatedTotalMarks =
            0;

        let calculatedScore =
            0;

        let calculatedCorrect =
            0;

        let calculatedWrong =
            0;

        let calculatedAnswered =
            0;


        questionResults.forEach(
            (result) => {

                calculatedTotalMarks +=
                    result.marks;


                if (
                    result.answered
                ) {

                    calculatedAnswered++;

                }


                if (
                    result.isCorrect
                ) {

                    calculatedCorrect++;

                    calculatedScore +=
                        result.marks;

                }

                else if (
                    result.answered
                ) {

                    calculatedWrong++;

                }

            }
        );


        const calculatedUnanswered =
            Math.max(

                questionResults.length -
                calculatedAnswered,

                0

            );


        const calculatedPercentage =
            calculatedTotalMarks > 0

                ? Number(

                    (
                        (
                            calculatedScore /
                            calculatedTotalMarks
                        ) *
                        100
                    ).toFixed(2)

                )

                : 0;


        // =====================================================
        // FINAL RESULT
        // =====================================================

        return res.status(200).json({

            success: true,

            submitted:
                true,

            result: {

                attemptId:
                    attempt._id,

                assignmentId:
                    attempt.assignment?._id ||
                    attempt.assignment,

                totalQuestions:
                    questionResults.length,

                answeredQuestions:
                    calculatedAnswered,

                unansweredQuestions:
                    calculatedUnanswered,

                correctAnswers:
                    calculatedCorrect,

                wrongAnswers:
                    calculatedWrong,

                score:
                    calculatedScore,

                totalMarks:
                    calculatedTotalMarks,

                percentage:
                    calculatedPercentage,

                submittedAt:
                    attempt.submittedAt,

                startedAt:
                    attempt.startedAt,

                expiresAt:
                    attempt.expiresAt,

                resultPublished:
                    attempt.resultPublished,

                questionResults,

            },

        });

    } catch (error) {

        console.error(
            "GET CANDIDATE APTITUDE TEST RESULT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load aptitude test result",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    getCandidateAptitudeTests,

    startCandidateAptitudeTest,

    submitCandidateAptitudeTest,

    getCandidateAptitudeTestResult,

};