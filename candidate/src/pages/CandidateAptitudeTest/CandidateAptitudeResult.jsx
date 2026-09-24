import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    ArrowLeft,
    Award,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Trophy,
    XCircle,
} from "lucide-react";

import api from "../../services/api";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import "./css/CandidateAptitudeResult.css";


/* =========================================================
   HELPERS
========================================================= */

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


const formatDateTime = (
    value
) => {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    );

};


const getJobTitle = (
    result
) => {

    return (
        result?.jobApplication?.jobTitle ||
        result?.job?.title ||
        result?.assignment?.jobTitle ||
        "Aptitude Assessment"
    );

};


const getOptionLetter = (
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const normalized =
        String(value)
            .trim()
            .toUpperCase();

    if (
        [
            "A",
            "B",
            "C",
            "D",
        ].includes(normalized)
    ) {
        return normalized;
    }

    const number =
        Number(value);

    if (
        Number.isInteger(number) &&
        number >= 0 &&
        number <= 3
    ) {

        return String.fromCharCode(
            65 + number
        );

    }

    return normalized;

};


const getOptionText = (
    result,
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Not answered";
    }

    if (
        result?.selectedOptionText &&
        value === result.selectedOption
    ) {
        return result.selectedOptionText;
    }

    const options =
        Array.isArray(
            result?.options
        )
            ? result.options
            : [];

    const number =
        Number(value);

    if (
        Number.isInteger(number) &&
        options[number]
    ) {
        return options[number];
    }

    const letter =
        String(value)
            .trim()
            .toUpperCase();

    const index =
        {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
        }[letter];

    if (
        index !== undefined &&
        options[index]
    ) {
        return options[index];
    }

    return String(value);

};


/* =========================================================
   COMPONENT
========================================================= */

const CandidateAptitudeResult = ({
    attemptId,
    onBack,
}) => {

    const {
        isAuthenticated,
    } = useCandidateAuth();


    /* =====================================================
       STATE
    ===================================================== */

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
        result,
        setResult,
    ] = useState(null);


    /* =====================================================
       LOAD RESULT
    ===================================================== */

    const loadResult =
        useCallback(
            async (
                showRefresh = false
            ) => {

                if (!attemptId) {

                    setError(
                        "Aptitude test attempt ID is missing."
                    );

                    setLoading(false);

                    return;

                }


                try {

                    if (
                        showRefresh
                    ) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }


                    setError("");


                    const response =
                        await api.get(
                            `/candidate/aptitude-tests/attempt/${attemptId}`
                        );


                    const data =
                        response?.data ||
                        {};


                    if (
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to load aptitude result"
                        );

                    }


                    if (
                        !data.submitted
                    ) {

                        setResult(
                            null
                        );

                        setError(
                            "This aptitude test has not been submitted yet."
                        );

                        return;

                    }


                    setResult(
                        data.result ||
                        null
                    );

                } catch (err) {

                    console.error(
                        "CANDIDATE APTITUDE RESULT LOAD ERROR:",
                        err
                    );


                    setError(
                        getErrorMessage(
                            err,
                            "Unable to load aptitude result"
                        )
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            [attemptId]
        );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        if (
            isAuthenticated === false
        ) {

            setLoading(false);

            return;

        }


        loadResult();

    }, [
        isAuthenticated,
        loadResult,
    ]);


    /* =====================================================
       STATS
    ===================================================== */

    const stats =
        useMemo(
            () => {

                if (!result) {

                    return {

                        total: 0,
                        answered: 0,
                        unanswered: 0,
                        correct: 0,
                        wrong: 0,
                        percentage: 0,
                        score: 0,
                        totalMarks: 0,

                    };

                }


                return {

                    total:
                        Number(
                            result.totalQuestions
                        ) || 0,

                    answered:
                        Number(
                            result.answeredQuestions
                        ) || 0,

                    unanswered:
                        Number(
                            result.unansweredQuestions
                        ) || 0,

                    correct:
                        Number(
                            result.correctAnswers
                        ) || 0,

                    wrong:
                        Number(
                            result.wrongAnswers
                        ) || 0,

                    percentage:
                        Number(
                            result.percentage
                        ) || 0,

                    score:
                        Number(
                            result.score
                        ) || 0,

                    totalMarks:
                        Number(
                            result.totalMarks
                        ) || 0,

                };

            },
            [result]
        );


    /* =====================================================
       LOADING
    ===================================================== */

    if (
        loading
    ) {

        return (

            <div className="candidate-aptitude-result-page">

                <div className="aptitude-result-loading">

                    <Loader2
                        size={38}
                        className="spin"
                    />

                    <h2>
                        Loading your result
                    </h2>

                    <p>
                        Please wait while we retrieve
                        your aptitude test result.
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (
        error ||
        !result
    ) {

        return (

            <div className="candidate-aptitude-result-page">

                <div className="aptitude-result-error-card">

                    <div className="result-error-icon">

                        <AlertCircle
                            size={32}
                        />

                    </div>


                    <h2>
                        Unable to load result
                    </h2>


                    <p>
                        {error ||
                            "No aptitude result was found."}
                    </p>


                    <div className="result-error-actions">

                        <button
                            type="button"
                            className="result-secondary-button"
                            onClick={() =>
                                loadResult(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    refreshing
                                        ? "spin"
                                        : ""
                                }
                            />

                            Try Again

                        </button>


                        {onBack && (

                            <button
                                type="button"
                                className="result-primary-button"
                                onClick={
                                    onBack
                                }
                            >

                                <ArrowLeft
                                    size={17}
                                />

                                Back to Aptitude Tests

                            </button>

                        )}

                    </div>

                </div>

            </div>

        );

    }


    /* =====================================================
       RESULT PAGE
    ===================================================== */

    return (

        <div className="candidate-aptitude-result-page">

            <div className="candidate-aptitude-result-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="result-page-header">

                    <div>

                        {onBack && (

                            <button
                                type="button"
                                className="result-back-button"
                                onClick={
                                    onBack
                                }
                            >

                                <ArrowLeft
                                    size={18}
                                />

                                Back to Aptitude Tests

                            </button>

                        )}


                        <span className="result-page-eyebrow">
                            Candidate Assessment
                        </span>


                        <h1>
                            Aptitude Test Result
                        </h1>


                        <p>
                            Review your aptitude assessment
                            performance and test status.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="result-refresh-button"
                        onClick={() =>
                            loadResult(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </header>


                {/* =================================================
                    TEST SUMMARY
                ================================================= */}

                <section className="result-summary-card">

                    <div className="result-summary-left">

                        <div className="result-main-icon">

                            <Trophy
                                size={30}
                            />

                        </div>


                        <div>

                            <span className="result-status-label">
                                Test Status
                            </span>


                            <h2>
                                {getJobTitle(
                                    result
                                )}
                            </h2>


                            <div className="result-status-row">

                                <span className="result-status submitted">

                                    <CheckCircle2
                                        size={16}
                                    />

                                    Submitted

                                </span>


                                <span className="result-submitted-date">

                                    Submitted{" "}
                                    {formatDateTime(
                                        result.submittedAt
                                    )}

                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="result-publication-status">

                        <ShieldCheck
                            size={19}
                        />

                        <div>

                            <strong>
                                Result Status
                            </strong>

                            <span>
                                {result.resultPublished
                                    ? "Result published"
                                    : "Submitted — HR review pending"}
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SCORE
                ================================================= */}

                <section className="result-score-section">

                    <div className="result-score-main">

                        <div className="result-score-circle">

                            <Trophy
                                size={30}
                            />

                            <strong>
                                {stats.percentage}%
                            </strong>

                            <span>
                                Overall Score
                            </span>

                        </div>


                        <div className="result-score-details">

                            <span>
                                Marks Obtained
                            </span>

                            <strong>
                                {stats.score}
                                {" / "}
                                {stats.totalMarks}
                            </strong>


                            <div className="result-score-progress">

                                <div
                                    style={{
                                        width:
                                            `${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    stats.percentage
                                                )
                                            )}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>


                    <div className="result-stat-grid">

                        <div className="result-stat-card">

                            <FileQuestion
                                size={21}
                            />

                            <span>
                                Total Questions
                            </span>

                            <strong>
                                {stats.total}
                            </strong>

                        </div>


                        <div className="result-stat-card">

                            <CheckCircle2
                                size={21}
                            />

                            <span>
                                Correct
                            </span>

                            <strong>
                                {stats.correct}
                            </strong>

                        </div>


                        <div className="result-stat-card">

                            <XCircle
                                size={21}
                            />

                            <span>
                                Wrong
                            </span>

                            <strong>
                                {stats.wrong}
                            </strong>

                        </div>


                        <div className="result-stat-card">

                            <Clock3
                                size={21}
                            />

                            <span>
                                Unanswered
                            </span>

                            <strong>
                                {stats.unanswered}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TEST INFORMATION
                ================================================= */}

                <section className="result-information-card">

                    <div className="result-section-title">

                        <div className="result-title-icon">

                            <Award
                                size={20}
                            />

                        </div>

                        <div>

                            <h2>
                                Test Information
                            </h2>

                            <p>
                                Details about your aptitude
                                assessment.
                            </p>

                        </div>

                    </div>


                    <div className="result-information-grid">

                        <div>

                            <span>
                                Test Status
                            </span>

                            <strong className="status-text submitted">
                                Submitted
                            </strong>

                        </div>


                        <div>

                            <span>
                                Started At
                            </span>

                            <strong>
                                {formatDateTime(
                                    result.startedAt
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Submitted At
                            </span>

                            <strong>
                                {formatDateTime(
                                    result.submittedAt
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Attempt ID
                            </span>

                            <strong className="attempt-id">
                                {String(
                                    result.attemptId
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    QUESTION RESULTS
                ================================================= */}

                <section className="result-questions-section">

                    <div className="result-section-header">

                        <div>

                            <span className="result-section-eyebrow">
                                Assessment Review
                            </span>

                            <h2>
                                Question Results
                            </h2>

                            <p>
                                Review your answers and the
                                correct answers for each question.
                            </p>

                        </div>

                    </div>


                    <div className="result-question-list">

                        {(
                            Array.isArray(
                                result.questionResults
                            )
                                ? result.questionResults
                                : []
                        ).map(
                            (
                                question,
                                index
                            ) => {

                                const correct =
                                    Boolean(
                                        question.isCorrect
                                    );


                                const answered =
                                    Boolean(
                                        question.answered
                                    );


                                return (

                                    <article
                                        key={
                                            question.questionId ||
                                            index
                                        }
                                        className={`result-question-card ${
                                            correct
                                                ? "correct"
                                                : answered
                                                    ? "wrong"
                                                    : "unanswered"
                                        }`}
                                    >

                                        <div className="result-question-header">

                                            <div className="result-question-number">

                                                Q
                                                {index + 1}

                                            </div>


                                            <div className="result-question-status">

                                                {correct ? (

                                                    <span className="question-result-status correct">

                                                        <CheckCircle2
                                                            size={16}
                                                        />

                                                        Correct

                                                    </span>

                                                ) : answered ? (

                                                    <span className="question-result-status wrong">

                                                        <XCircle
                                                            size={16}
                                                        />

                                                        Wrong

                                                    </span>

                                                ) : (

                                                    <span className="question-result-status unanswered">

                                                        <Clock3
                                                            size={16}
                                                        />

                                                        Not Answered

                                                    </span>

                                                )}


                                                <span className="question-mark">

                                                    {question.marks || 0}
                                                    {" "}
                                                    mark

                                                </span>

                                            </div>

                                        </div>


                                        <h3>
                                            {question.question}
                                        </h3>


                                        <div className="result-answer-grid">

                                            <div className="answer-box candidate-answer">

                                                <span>
                                                    Your Answer
                                                </span>


                                                {answered ? (

                                                    <div className="answer-value">

                                                        <strong>
                                                            {getOptionLetter(
                                                                question.selectedAnswer ??
                                                                question.selectedOption
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {
                                                                question.selectedOptionText ||
                                                                getOptionText(
                                                                    question,
                                                                    question.selectedOption
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                ) : (

                                                    <div className="answer-empty">
                                                        Not answered
                                                    </div>

                                                )}

                                            </div>


                                            <div className="answer-box correct-answer">

                                                <span>
                                                    Correct Answer
                                                </span>


                                                <div className="answer-value">

                                                    <strong>
                                                        {getOptionLetter(
                                                            question.correctAnswer ??
                                                            question.correctOption
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            question.correctOptionText ||
                                                            getOptionText(
                                                                question,
                                                                question.correctOption
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                </section>


                {/* =================================================
                    FOOTER NOTICE
                ================================================= */}

                <div className="result-footer-notice">

                    <ShieldCheck
                        size={20}
                    />

                    <div>

                        <strong>
                            Assessment Result Recorded
                        </strong>

                        <p>
                            Your aptitude test submission has
                            been securely recorded. The HR team
                            can review your assessment result.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default CandidateAptitudeResult;