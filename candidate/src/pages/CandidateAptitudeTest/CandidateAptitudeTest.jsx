import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Award,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Loader2,
    RefreshCw,
    Send,
    ShieldCheck,
    Trophy,
    XCircle,
} from "lucide-react";

import api from "../../services/api";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import "../CandidateAptitudeTest/css/CandidateAptitudeTest.css";


// =========================================================
// HELPERS
// =========================================================

const formatTime = (seconds) => {
    const safeSeconds =
        Math.max(
            0,
            Number(seconds) || 0
        );

    const minutes =
        Math.floor(
            safeSeconds / 60
        );

    const remainingSeconds =
        safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};


const getErrorMessage = (
    error,
    fallback
) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};


const getCandidateName = (
    test
) => {
    return (
        test?.jobApplication?.candidateName ||
        test?.candidate?.name ||
        "Candidate"
    );
};


const getJobTitle = (
    test
) => {
    return (
        test?.jobApplication?.jobTitle ||
        test?.job?.title ||
        "Aptitude Test"
    );
};


const getQuestionId = (
    question
) => {
    return String(
        question?._id ||
        question?.id ||
        ""
    );
};


// =========================================================
// COMPONENT
// =========================================================

const CandidateAptitudeTest = () => {

    const {
        candidate,
        isAuthenticated,
    } = useCandidateAuth();


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        tests,
        setTests,
    ] = useState([]);


    // =====================================================
    // ACTIVE TEST
    // =====================================================

    const [
        activeAttempt,
        setActiveAttempt,
    ] = useState(null);


    const [
        activeAssignment,
        setActiveAssignment,
    ] = useState(null);


    const [
        questions,
        setQuestions,
    ] = useState([]);


    const [
        answers,
        setAnswers,
    ] = useState({});


    const [
        currentQuestion,
        setCurrentQuestion,
    ] = useState(0);


    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(0);


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    const [
        submittedResult,
        setSubmittedResult,
    ] = useState(null);


    const [
        resultLoading,
        setResultLoading,
    ] = useState(false);


    const [
        showSubmitModal,
        setShowSubmitModal,
    ] = useState(false);


    const [
        autoSubmitting,
        setAutoSubmitting,
    ] = useState(false);


    // =====================================================
    // LOAD TESTS
    // =====================================================

    const loadTests = useCallback(
        async (
            showRefresh = false
        ) => {

            try {

                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response =
                    await api.get(
                        "/candidate/aptitude-tests"
                    );

                const data =
                    response?.data || {};

                if (
                    data.success
                ) {

                    setTests(
                        Array.isArray(
                            data.tests
                        )
                            ? data.tests
                            : []
                    );

                } else {

                    throw new Error(
                        data.message ||
                        "Failed to load aptitude tests"
                    );

                }

            } catch (err) {

                console.error(
                    "CANDIDATE APTITUDE TESTS LOAD ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load aptitude tests"
                    )
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }
        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        if (
            isAuthenticated === false
        ) {
            setLoading(false);
            return;
        }

        loadTests();

    }, [
        isAuthenticated,
        loadTests,
    ]);


    // =====================================================
    // AVAILABLE TESTS
    // =====================================================

    const availableTests =
        useMemo(
            () =>
                tests.filter(
                    (test) =>
                        test?.attempt?.status !==
                        "Submitted"
                ),
            [tests]
        );


    // =====================================================
    // COMPLETED TESTS
    // =====================================================

    const completedTests =
        useMemo(
            () =>
                tests.filter(
                    (test) =>
                        test?.attempt?.status ===
                        "Submitted"
                ),
            [tests]
        );


    // =====================================================
    // START TEST
    // =====================================================

    const handleStartTest =
        useCallback(
            async (test) => {

                if (
                    !test?._id
                ) {
                    return;
                }

                try {

                    setError("");

                    setLoading(true);

                    const response =
                        await api.post(
                            `/candidate/aptitude-tests/${test._id}/start`
                        );

                    const data =
                        response?.data || {};

                    if (
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to start aptitude test"
                        );

                    }

                    const attempt =
                        {
                            _id:
                                data.attemptId,

                            assignment:
                                data.assignmentId,

                            startedAt:
                                data.startedAt,

                            expiresAt:
                                data.expiresAt,

                            status:
                                "Started",

                            totalQuestions:
                                data.totalQuestions,
                        };


                    setActiveAttempt(
                        attempt
                    );


                    setActiveAssignment(
                        test
                    );


                    setQuestions(
                        Array.isArray(
                            data.questions
                        )
                            ? data.questions
                            : []
                    );


                    setAnswers({});


                    setCurrentQuestion(0);


                    const expires =
                        new Date(
                            data.expiresAt
                        ).getTime();


                    const now =
                        Date.now();


                    setRemainingSeconds(
                        Math.max(
                            0,
                            Math.ceil(
                                (
                                    expires -
                                    now
                                ) / 1000
                            )
                        )
                    );


                    setSubmittedResult(
                        null
                    );


                } catch (err) {

                    console.error(
                        "START APTITUDE TEST ERROR:",
                        err
                    );


                    setError(
                        getErrorMessage(
                            err,
                            "Unable to start aptitude test"
                        )
                    );


                    /*
                     * If backend says an attempt already exists,
                     * refresh the test list so the candidate sees
                     * the latest DB state.
                     */

                    await loadTests(
                        true
                    );

                } finally {

                    setLoading(false);

                }

            },
            [loadTests]
        );


    // =====================================================
    // LOAD EXISTING ATTEMPT RESULT
    // =====================================================

    const handleViewResult =
        useCallback(
            async (
                attemptId
            ) => {

                if (!attemptId) {
                    return;
                }

                try {

                    setResultLoading(
                        true
                    );

                    setError("");

                    const response =
                        await api.get(
                            `/candidate/aptitude-tests/attempt/${attemptId}`
                        );

                    const data =
                        response?.data || {};

                    if (
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load result"
                        );

                    }

                    if (
                        data.submitted &&
                        data.result
                    ) {

                        setSubmittedResult(
                            data.result
                        );

                    }

                } catch (err) {

                    console.error(
                        "LOAD APTITUDE RESULT ERROR:",
                        err
                    );

                    setError(
                        getErrorMessage(
                            err,
                            "Unable to load aptitude result"
                        )
                    );

                } finally {

                    setResultLoading(
                        false
                    );

                }
            },
            []
        );


    // =====================================================
    // RESTORE SUBMITTED RESULT
    // =====================================================

    const handleCompletedTestClick =
        useCallback(
            async (test) => {

                const attemptId =
                    test?.attempt?._id;

                if (!attemptId) {
                    return;
                }

                setActiveAssignment(
                    test
                );

                await handleViewResult(
                    attemptId
                );

            },
            [handleViewResult]
        );


    // =====================================================
    // SELECT ANSWER
    // =====================================================

    const handleAnswer =
        useCallback(
            (
                questionId,
                selectedOption
            ) => {

                setAnswers(
                    (previous) => ({
                        ...previous,
                        [String(
                            questionId
                        )]:
                            selectedOption,
                    })
                );

            },
            []
        );


    // =====================================================
    // NAVIGATION
    // =====================================================

    const goToPrevious =
        useCallback(
            () => {

                setCurrentQuestion(
                    (previous) =>
                        Math.max(
                            0,
                            previous - 1
                        )
                );

            },
            []
        );


    const goToNext =
        useCallback(
            () => {

                setCurrentQuestion(
                    (previous) =>
                        Math.min(
                            questions.length - 1,
                            previous + 1
                        )
                );

            },
            [questions.length]
        );


    const goToQuestion =
        useCallback(
            (index) => {

                if (
                    index < 0 ||
                    index >= questions.length
                ) {
                    return;
                }

                setCurrentQuestion(
                    index
                );

            },
            [questions.length]
        );


    // =====================================================
    // SUBMIT TEST
    // =====================================================

    const submitTest =
        useCallback(
            async (
                automatic = false
            ) => {

                if (
                    submitting ||
                    !activeAttempt?._id
                ) {
                    return;
                }

                try {

                    setSubmitting(
                        true
                    );


                    if (automatic) {

                        setAutoSubmitting(
                            true
                        );

                    }


                    setError("");


                    const formattedAnswers =
                        questions.map(
                            (question) => {

                                const questionId =
                                    getQuestionId(
                                        question
                                    );

                                return {

                                    questionId,

                                    selectedOption:
                                        answers[
                                            questionId
                                        ] || "",

                                };

                            }
                        );


                    const response =
                        await api.post(
                            `/candidate/aptitude-tests/${activeAttempt._id}/submit`,
                            {
                                answers:
                                    formattedAnswers,
                            }
                        );


                    const data =
                        response?.data || {};


                    if (
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Failed to submit aptitude test"
                        );

                    }


                    setSubmittedResult(
                        data.result
                    );


                    setActiveAttempt(
                        (previous) => {

                            if (
                                !previous
                            ) {
                                return previous;
                            }

                            return {

                                ...previous,

                                status:
                                    "Submitted",

                                submittedAt:
                                    data.result
                                        ?.submittedAt,

                            };

                        }
                    );


                    setShowSubmitModal(
                        false
                    );


                    /*
                     * Refresh only after the candidate has
                     * submitted. No polling is used.
                     */

                    await loadTests(
                        true
                    );


                } catch (err) {

                    console.error(
                        "SUBMIT APTITUDE TEST ERROR:",
                        err
                    );


                    setError(
                        getErrorMessage(
                            err,
                            "Failed to submit aptitude test"
                        )
                    );

                } finally {

                    setSubmitting(
                        false
                    );

                    setAutoSubmitting(
                        false
                    );

                }

            },
            [
                submitting,
                activeAttempt,
                questions,
                answers,
                loadTests,
            ]
        );


    // =====================================================
    // TIMER
    //
    // Uses a single timeout chain rather than
    // setInterval/setInterval polling.
    // =====================================================

    useEffect(() => {

        if (
            !activeAttempt ||
            activeAttempt.status !==
            "Started" ||
            !activeAttempt.expiresAt
        ) {
            return;
        }


        const updateTimer =
            () => {

                const expires =
                    new Date(
                        activeAttempt.expiresAt
                    ).getTime();


                const seconds =
                    Math.max(
                        0,
                        Math.ceil(
                            (
                                expires -
                                Date.now()
                            ) / 1000
                        )
                    );


                setRemainingSeconds(
                    seconds
                );


                if (
                    seconds <= 0
                ) {

                    if (
                        !submitting
                    ) {

                        submitTest(
                            true
                        );

                    }

                    return;

                }


                const timeout =
                    setTimeout(
                        updateTimer,
                        1000
                    );


                return () => {
                    clearTimeout(
                        timeout
                    );
                };

            };


        const cleanup =
            updateTimer();


        return () => {

            if (
                typeof cleanup ===
                "function"
            ) {
                cleanup();
            }

        };

    }, [
        activeAttempt,
        submitting,
        submitTest,
    ]);


    // =====================================================
    // RESET ACTIVE TEST
    // =====================================================

    const closeTest =
        useCallback(
            () => {

                setActiveAttempt(
                    null
                );

                setActiveAssignment(
                    null
                );

                setQuestions([]);

                setAnswers({});

                setCurrentQuestion(
                    0
                );

                setRemainingSeconds(
                    0
                );

                setSubmittedResult(
                    null
                );

                setError("");

            },
            []
        );


    // =====================================================
    // CURRENT QUESTION
    // =====================================================

    const currentQuestionData =
        questions[
            currentQuestion
        ];


    // =====================================================
    // ANSWERED COUNT
    // =====================================================

    const answeredCount =
        useMemo(
            () =>
                questions.filter(
                    (question) =>
                        Boolean(
                            answers[
                                getQuestionId(
                                    question
                                )
                            ]
                        )
                ).length,
            [questions, answers]
        );


    const unansweredCount =
        Math.max(
            0,
            questions.length -
            answeredCount
        );


    // =====================================================
    // PROGRESS
    // =====================================================

    const questionProgress =
        questions.length > 0
            ? (
                (
                    currentQuestion +
                    1
                ) /
                questions.length
            ) *
            100
            : 0;


    // =====================================================
    // TIMER CLASS
    // =====================================================

    const timerClass =
        remainingSeconds <= 60
            ? "aptitude-timer danger"
            : remainingSeconds <= 300
                ? "aptitude-timer warning"
                : "aptitude-timer";


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading &&
        !activeAttempt &&
        !submittedResult
    ) {

        return (
            <div className="candidate-aptitude-page">

                <div className="aptitude-loading-card">

                    <Loader2
                        size={34}
                        className="spin"
                    />

                    <h2>
                        Loading aptitude tests
                    </h2>

                    <p>
                        Please wait while we load
                        your available tests.
                    </p>

                </div>

            </div>
        );

    }


    // =====================================================
    // ACTIVE TEST SCREEN
    // =====================================================

    if (
        activeAttempt &&
        activeAttempt.status ===
        "Started"
    ) {

        return (
            <div className="candidate-aptitude-page">

                <div className="aptitude-test-wrapper">

                    {/* HEADER */}

                    <div className="aptitude-test-header">

                        <div>

                            <button
                                type="button"
                                className="aptitude-back-button"
                                onClick={() => {
                                    if (
                                        submitting
                                    ) {
                                        return;
                                    }

                                    closeTest();
                                }}
                                disabled={
                                    submitting
                                }
                            >

                                <ArrowLeft
                                    size={18}
                                />

                                Exit Test

                            </button>

                            <h1>
                                {getJobTitle(
                                    activeAssignment
                                )}
                            </h1>

                            <p>
                                Aptitude Assessment
                            </p>

                        </div>


                        <div
                            className={
                                timerClass
                            }
                        >

                            <Clock3
                                size={20}
                            />

                            <div>

                                <span>
                                    Time Remaining
                                </span>

                                <strong>
                                    {formatTime(
                                        remainingSeconds
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* AUTO SUBMIT */}

                    {autoSubmitting && (

                        <div className="aptitude-auto-submit">

                            <Loader2
                                size={18}
                                className="spin"
                            />

                            Time expired.
                            Submitting your
                            answers...

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="aptitude-error">

                            <AlertCircle
                                size={19}
                            />

                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                            >
                                ×
                            </button>

                        </div>

                    )}


                    {/* TEST BODY */}

                    <div className="aptitude-test-layout">

                        {/* QUESTION NAV */}

                        <aside className="aptitude-question-sidebar">

                            <div className="sidebar-summary">

                                <div>

                                    <span>
                                        Questions
                                    </span>

                                    <strong>
                                        {questions.length}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Answered
                                    </span>

                                    <strong>
                                        {answeredCount}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Remaining
                                    </span>

                                    <strong>
                                        {unansweredCount}
                                    </strong>

                                </div>

                            </div>


                            <div className="question-grid">

                                {questions.map(
                                    (
                                        question,
                                        index
                                    ) => {

                                        const id =
                                            getQuestionId(
                                                question
                                            );

                                        const answered =
                                            Boolean(
                                                answers[id]
                                            );

                                        return (

                                            <button
                                                key={
                                                    id ||
                                                    index
                                                }
                                                type="button"
                                                className={`
                                                    question-number
                                                    ${
                                                        index ===
                                                        currentQuestion
                                                            ? "active"
                                                            : ""
                                                    }
                                                    ${
                                                        answered
                                                            ? "answered"
                                                            : ""
                                                    }
                                                `}
                                                onClick={() =>
                                                    goToQuestion(
                                                        index
                                                    )
                                                }
                                            >

                                                {index + 1}

                                            </button>

                                        );

                                    }
                                )}

                            </div>


                            <div className="question-legend">

                                <div>

                                    <span className="legend-box current" />

                                    Current

                                </div>

                                <div>

                                    <span className="legend-box answered" />

                                    Answered

                                </div>

                                <div>

                                    <span className="legend-box unanswered" />

                                    Unanswered

                                </div>

                            </div>

                        </aside>


                        {/* QUESTION */}

                        <main className="aptitude-question-area">

                            <div className="question-progress">

                                <div>

                                    Question{" "}

                                    <strong>
                                        {currentQuestion + 1}
                                    </strong>

                                    {" "}of{" "}

                                    <strong>
                                        {questions.length}
                                    </strong>

                                </div>


                                <span>
                                    {Math.round(
                                        questionProgress
                                    )}
                                    %
                                </span>

                            </div>


                            <div className="question-progress-track">

                                <div
                                    style={{
                                        width:
                                            `${questionProgress}%`,
                                    }}
                                />

                            </div>


                            {currentQuestionData ? (

                                <div className="aptitude-question-card">

                                    <div className="question-card-top">

                                        <span className="question-label">

                                            Question{" "}
                                            {currentQuestion + 1}

                                        </span>


                                        <span className="question-marks">

                                            {Number(
                                                currentQuestionData.marks
                                            ) || 1}{" "}
                                            mark

                                        </span>

                                    </div>


                                    <h2>
                                        {
                                            currentQuestionData.question
                                        }
                                    </h2>


                                    <div className="aptitude-options">

                                        {(
                                            Array.isArray(
                                                currentQuestionData.options
                                            )
                                                ? currentQuestionData.options
                                                : []
                                        ).map(
                                            (
                                                option,
                                                index
                                            ) => {

                                                /*
                                                 * Supports both:
                                                 *
                                                 * ["A", "B", "C"]
                                                 *
                                                 * and:
                                                 *
                                                 * [
                                                 *   {
                                                 *      label: "A",
                                                 *      text: "..."
                                                 *   }
                                                 * ]
                                                 */

                                                const optionValue =
                                                    typeof option ===
                                                    "object"
                                                        ? (
                                                            option?.value ??
                                                            option?.label ??
                                                            option?.text ??
                                                            ""
                                                        )
                                                        : String(
                                                            option
                                                        );


                                                const optionLabel =
                                                    typeof option ===
                                                    "object"
                                                        ? (
                                                            option?.text ??
                                                            option?.label ??
                                                            option?.value ??
                                                            ""
                                                        )
                                                        : String(
                                                            option
                                                        );


                                                const selected =
                                                    answers[
                                                        getQuestionId(
                                                            currentQuestionData
                                                        )
                                                    ] ===
                                                    optionValue;


                                                return (

                                                    <button
                                                        key={
                                                            `${getQuestionId(
                                                                currentQuestionData
                                                            )}-${index}`
                                                        }
                                                        type="button"
                                                        className={`
                                                            aptitude-option
                                                            ${
                                                                selected
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        `}
                                                        onClick={() =>
                                                            handleAnswer(
                                                                getQuestionId(
                                                                    currentQuestionData
                                                                ),
                                                                optionValue
                                                            )
                                                        }
                                                        disabled={
                                                            submitting
                                                        }
                                                    >

                                                        <span className="option-letter">

                                                            {String.fromCharCode(
                                                                65 +
                                                                index
                                                            )}

                                                        </span>


                                                        <span className="option-text">

                                                            {
                                                                optionLabel
                                                            }

                                                        </span>


                                                        {selected && (

                                                            <CheckCircle2
                                                                size={20}
                                                                className="option-check"
                                                            />

                                                        )}

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>


                                    <div className="question-navigation">

                                        <button
                                            type="button"
                                            className="aptitude-secondary-button"
                                            onClick={
                                                goToPrevious
                                            }
                                            disabled={
                                                currentQuestion ===
                                                0 ||
                                                submitting
                                            }
                                        >

                                            <ArrowLeft
                                                size={18}
                                            />

                                            Previous

                                        </button>


                                        {currentQuestion <
                                            questions.length -
                                            1 ? (

                                            <button
                                                type="button"
                                                className="aptitude-primary-button"
                                                onClick={
                                                    goToNext
                                                }
                                                disabled={
                                                    submitting
                                                }
                                            >

                                                Next

                                                <ArrowRight
                                                    size={18}
                                                />

                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                className="aptitude-submit-button"
                                                onClick={() =>
                                                    setShowSubmitModal(
                                                        true
                                                    )
                                                }
                                                disabled={
                                                    submitting
                                                }
                                            >

                                                <Send
                                                    size={18}
                                                />

                                                Submit Test

                                            </button>

                                        )}

                                    </div>

                                </div>

                            ) : (

                                <div className="aptitude-empty-card">

                                    <FileQuestion
                                        size={40}
                                    />

                                    <h3>
                                        No questions available
                                    </h3>

                                </div>

                            )}

                        </main>

                    </div>

                </div>


                {/* SUBMIT MODAL */}

                {showSubmitModal && (

                    <div className="aptitude-modal-overlay">

                        <div className="aptitude-confirm-modal">

                            <div className="modal-icon">

                                <Send
                                    size={24}
                                />

                            </div>


                            <h2>
                                Submit aptitude test?
                            </h2>


                            <p>
                                You have answered{" "}
                                <strong>
                                    {answeredCount}
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {questions.length}
                                </strong>{" "}
                                questions.
                            </p>


                            {unansweredCount > 0 && (

                                <div className="modal-warning">

                                    <AlertCircle
                                        size={18}
                                    />

                                    <span>
                                        {unansweredCount}{" "}
                                        question
                                        {unansweredCount !== 1
                                            ? "s"
                                            : ""}{" "}
                                        remain unanswered.
                                    </span>

                                </div>

                            )}


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="aptitude-secondary-button"
                                    onClick={() =>
                                        setShowSubmitModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Continue Test
                                </button>


                                <button
                                    type="button"
                                    className="aptitude-submit-button"
                                    onClick={() =>
                                        submitTest(
                                            false
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting ? (

                                        <>
                                            <Loader2
                                                size={18}
                                                className="spin"
                                            />

                                            Submitting...

                                        </>

                                    ) : (

                                        <>
                                            <Send
                                                size={18}
                                            />

                                            Submit Test
                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>
        );

    }


    // =====================================================
    // RESULT SCREEN
    // =====================================================

    if (
        submittedResult
    ) {

        const percentage =
            Number(
                submittedResult.percentage
            ) || 0;


        return (
            <div className="candidate-aptitude-page">

                <div className="aptitude-result-page">

                    <div className="result-success-icon">

                        <CheckCircle2
                            size={48}
                        />

                    </div>


                    <span className="result-eyebrow">
                        Test Submitted
                    </span>


                    <h1>
                        Aptitude Test Completed
                    </h1>


                    <p>
                        Your aptitude test has been
                        submitted successfully.
                    </p>


                    <div className="result-score-card">

                        <div className="result-score-circle">

                            <Trophy
                                size={28}
                            />

                            <strong>
                                {percentage}%
                            </strong>

                            <span>
                                Score
                            </span>

                        </div>


                        <div className="result-stat-grid">

                            <div>

                                <FileQuestion
                                    size={20}
                                />

                                <span>
                                    Total Questions
                                </span>

                                <strong>
                                    {
                                        submittedResult.totalQuestions
                                    }
                                </strong>

                            </div>


                            <div>

                                <CheckCircle2
                                    size={20}
                                />

                                <span>
                                    Answered
                                </span>

                                <strong>
                                    {
                                        submittedResult.answeredQuestions
                                    }
                                </strong>

                            </div>


                            <div>

                                <Award
                                    size={20}
                                />

                                <span>
                                    Correct
                                </span>

                                <strong>
                                    {
                                        submittedResult.correctAnswers
                                    }
                                </strong>

                            </div>


                            <div>

                                <XCircle
                                    size={20}
                                />

                                <span>
                                    Wrong
                                </span>

                                <strong>
                                    {
                                        submittedResult.wrongAnswers
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="result-notice">

                        <ShieldCheck
                            size={20}
                        />

                        <span>
                            Your result has been recorded.
                            The final assessment status may
                            be reviewed by the HR team.
                        </span>

                    </div>


                    <button
                        type="button"
                        className="aptitude-primary-button result-back-button"
                        onClick={() => {
                            closeTest();
                            loadTests(
                                true
                            );
                        }}
                    >

                        <ArrowLeft
                            size={18}
                        />

                        Back to Aptitude Tests

                    </button>

                </div>

            </div>
        );

    }


    // =====================================================
    // MAIN TEST LIST
    // =====================================================

    return (
        <div className="candidate-aptitude-page">

            <div className="candidate-aptitude-container">

                {/* HEADER */}

                <div className="candidate-aptitude-heading">

                    <div>

                        <span className="page-eyebrow">
                            Candidate Assessment
                        </span>

                        <h1>
                            Aptitude Tests
                        </h1>

                        <p>
                            Complete the aptitude assessments
                            assigned to you by the HR team.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="aptitude-refresh-button"
                        onClick={() =>
                            loadTests(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={18}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="aptitude-error">

                        <AlertCircle
                            size={19}
                        />

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* SECURITY NOTICE */}

                <div className="candidate-assessment-notice">

                    <div className="notice-icon">

                        <ShieldCheck
                            size={22}
                        />

                    </div>

                    <div>

                        <strong>
                            Assessment Instructions
                        </strong>

                        <p>
                            Once you start a test, the timer
                            begins immediately. Make sure you
                            have enough time and a stable
                            internet connection before starting.
                        </p>

                    </div>

                </div>


                {/* AVAILABLE TESTS */}

                <section className="aptitude-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Assigned Tests
                            </h2>

                            <span>
                                {availableTests.length}{" "}
                                available
                            </span>

                        </div>

                    </div>


                    {availableTests.length === 0 ? (

                        <div className="aptitude-empty-list">

                            <div className="empty-icon">

                                <FileQuestion
                                    size={32}
                                />

                            </div>

                            <h3>
                                No aptitude tests available
                            </h3>

                            <p>
                                You don't have any pending
                                aptitude assessments right now.
                            </p>

                        </div>

                    ) : (

                        <div className="aptitude-test-cards">

                            {availableTests.map(
                                (test) => {

                                    const attempt =
                                        test?.attempt;


                                    const started =
                                        attempt?.status ===
                                        "Started";


                                    const expired =
                                        attempt?.status ===
                                        "Expired";


                                    return (

                                        <article
                                            key={
                                                test._id
                                            }
                                            className="aptitude-test-card"
                                        >

                                            <div className="test-card-top">

                                                <div className="test-icon">

                                                    <FileQuestion
                                                        size={23}
                                                    />

                                                </div>


                                                <span
                                                    className={
                                                        started
                                                            ? "test-status in-progress"
                                                            : expired
                                                                ? "test-status expired"
                                                                : "test-status pending"
                                                    }
                                                >

                                                    {started
                                                        ? "In Progress"
                                                        : expired
                                                            ? "Expired"
                                                            : "Pending"}

                                                </span>

                                            </div>


                                            <h3>
                                                {getJobTitle(
                                                    test
                                                )}
                                            </h3>


                                            <p className="test-candidate-name">
                                                {getCandidateName(
                                                    test
                                                )}
                                            </p>


                                            <div className="test-meta">

                                                <div>

                                                    <FileQuestion
                                                        size={16}
                                                    />

                                                    <span>
                                                        {
                                                            test.requiredQuestionCount ||
                                                            attempt?.totalQuestions ||
                                                            0
                                                        }{" "}
                                                        Questions
                                                    </span>

                                                </div>


                                                <div>

                                                    <Clock3
                                                        size={16}
                                                    />

                                                    <span>
                                                        {
                                                            test.durationMinutes ||
                                                            30
                                                        }{" "}
                                                        Minutes
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="test-card-footer">

                                                {started ? (

                                                    <button
                                                        type="button"
                                                        className="aptitude-primary-button"
                                                        onClick={() => {
                                                            setError(
                                                                "This test has already been started. Please complete the active attempt."
                                                            );
                                                        }}
                                                    >

                                                        Test In Progress

                                                    </button>

                                                ) : expired ? (

                                                    <button
                                                        type="button"
                                                        className="aptitude-disabled-button"
                                                        disabled
                                                    >
                                                        Test Expired
                                                    </button>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        className="aptitude-primary-button"
                                                        onClick={() =>
                                                            handleStartTest(
                                                                test
                                                            )
                                                        }
                                                    >

                                                        Start Test

                                                        <ArrowRight
                                                            size={18}
                                                        />

                                                    </button>

                                                )}

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* COMPLETED TESTS */}

                {completedTests.length > 0 && (

                    <section className="aptitude-section completed-section">

                        <div className="section-heading">

                            <div>

                                <h2>
                                    Completed Tests
                                </h2>

                                <span>
                                    {completedTests.length}{" "}
                                    completed
                                </span>

                            </div>

                        </div>


                        <div className="aptitude-completed-list">

                            {completedTests.map(
                                (test) => {

                                    const attempt =
                                        test?.attempt;


                                    return (

                                        <div
                                            key={
                                                test._id
                                            }
                                            className="completed-test-row"
                                        >

                                            <div className="completed-test-info">

                                                <div className="completed-icon">

                                                    <CheckCircle2
                                                        size={21}
                                                    />

                                                </div>


                                                <div>

                                                    <h3>
                                                        {getJobTitle(
                                                            test
                                                        )}
                                                    </h3>

                                                    <p>
                                                        Submitted{" "}
                                                        {attempt?.submittedAt
                                                            ? new Date(
                                                                attempt.submittedAt
                                                            ).toLocaleString()
                                                            : ""}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="completed-score">

                                                <strong>
                                                    {
                                                        attempt?.percentage ??
                                                        0
                                                    }%
                                                </strong>

                                                <span>
                                                    {
                                                        attempt?.correctAnswers ??
                                                        0
                                                    } /{" "}
                                                    {
                                                        attempt?.totalQuestions ??
                                                        0
                                                    } correct
                                                </span>

                                            </div>


                                            <button
                                                type="button"
                                                className="aptitude-outline-button"
                                                onClick={() =>
                                                    handleCompletedTestClick(
                                                        test
                                                    )
                                                }
                                                disabled={
                                                    resultLoading
                                                }
                                            >

                                                {resultLoading ? (

                                                    <Loader2
                                                        size={17}
                                                        className="spin"
                                                    />

                                                ) : (

                                                    "View Result"

                                                )}

                                            </button>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </section>

                )}

            </div>

        </div>
    );
};


export default CandidateAptitudeTest;