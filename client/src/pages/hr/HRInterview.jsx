import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Send,
    Eye,
    X,
    UserRound,
    Mail,
    Phone,
    BriefcaseBusiness,
    MapPin,
    Clock3,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Award,
    Target,
    CircleHelp,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    LoaderCircle,
    ClipboardCheck,
    Users,
    BarChart3,
} from "lucide-react";

import {
    getHRAptitudeTests,
    getHRAptitudeTestById,
    sendAptitudeTestToCandidate,
    getHRSubmittedAptitudeTests,
    getHRSubmittedAptitudeTestById,
} from "../../services/hrAptitudeTestApi";

import "./HRInterview.css";


/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        return value;
    }

    if (value._id) {
        return String(value._id);
    }

    if (value.id) {
        return String(value.id);
    }

    return "";
};


const safeArray = (value) => {
    return Array.isArray(value) ? value : [];
};


const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


const formatShortDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const normalizeText = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
};


const getCandidateName = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const candidate =
        assignment?.candidate ||
        application?.candidate ||
        {};

    return (
        normalizeText(application?.candidateName) ||
        normalizeText(candidate?.name) ||
        [
            candidate?.firstName,
            candidate?.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Candidate"
    );
};


const getCandidateEmail = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const candidate =
        assignment?.candidate ||
        application?.candidate ||
        {};

    return (
        normalizeText(application?.candidateEmail) ||
        normalizeText(candidate?.email) ||
        "—"
    );
};


const getCandidatePhone = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const candidate =
        assignment?.candidate ||
        application?.candidate ||
        {};

    return (
        normalizeText(application?.candidatePhone) ||
        normalizeText(candidate?.phone) ||
        "—"
    );
};


const getCandidateImage = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const candidate =
        assignment?.candidate ||
        application?.candidate ||
        {};

    return (
        normalizeText(application?.candidateProfileImage) ||
        normalizeText(candidate?.profileImage) ||
        ""
    );
};


const getCandidateResume = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const candidate =
        assignment?.candidate ||
        application?.candidate ||
        {};

    return (
        normalizeText(application?.candidateResume) ||
        normalizeText(candidate?.resume) ||
        ""
    );
};


const getJobTitle = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const job =
        assignment?.jobApplication?.job ||
        assignment?.job ||
        {};

    return (
        normalizeText(application?.jobTitle) ||
        normalizeText(job?.title) ||
        "Job position"
    );
};


const getJobDepartment = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const job =
        assignment?.jobApplication?.job ||
        assignment?.job ||
        {};

    return (
        normalizeText(application?.jobDepartment) ||
        normalizeText(job?.department) ||
        "—"
    );
};


const getJobLocation = (assignment) => {
    const application =
        assignment?.jobApplication || {};

    const job =
        assignment?.jobApplication?.job ||
        assignment?.job ||
        {};

    return (
        normalizeText(application?.jobLocation) ||
        normalizeText(job?.location) ||
        "—"
    );
};


const getApplicationId = (assignment) => {
    return (
        getId(assignment?.jobApplication) ||
        getId(assignment?.applicationId)
    );
};


const getAssignmentId = (assignment) => {
    return getId(assignment);
};


const getAttemptId = (attempt) => {
    return getId(attempt);
};


const getStatusLabel = (status) => {
    const value = normalizeText(status);

    if (!value) {
        return "Unknown";
    }

    switch (value) {
        case "SentToHR":
            return "Received";

        case "SentToCandidate":
            return "Sent to Candidate";

        case "InProgress":
            return "In Progress";

        case "Submitted":
            return "Submitted";

        case "Completed":
            return "Completed";

        case "Approved":
            return "Approved";

        case "Rejected":
            return "Rejected";

        default:
            return value;
    }
};


const getStatusClass = (status) => {
    const value = normalizeText(status);

    switch (value) {
        case "SentToHR":
            return "status-received";

        case "SentToCandidate":
            return "status-sent";

        case "InProgress":
            return "status-progress";

        case "Submitted":
        case "Completed":
            return "status-completed";

        case "Approved":
            return "status-approved";

        case "Rejected":
            return "status-rejected";

        default:
            return "status-default";
    }
};


/*
=========================================================
RESULT NORMALIZER

The backend result API returns:

{
    assignment,
    attempt
}

This helper makes the frontend tolerant of populated /
unpopulated jobApplication and candidate references.
=========================================================
*/

const normalizeResult = (item) => {
    if (!item) {
        return null;
    }

    const assignment =
        item.assignment || {};

    const attempt =
        item.attempt || null;

    return {
        assignment,
        attempt,
        id:
            getAttemptId(attempt) ||
            getAssignmentId(assignment),
        candidateName:
            getCandidateName(assignment),
        candidateEmail:
            getCandidateEmail(assignment),
        candidatePhone:
            getCandidatePhone(assignment),
        jobTitle:
            getJobTitle(assignment),
        jobDepartment:
            getJobDepartment(assignment),
        jobLocation:
            getJobLocation(assignment),
        percentage:
            Number(attempt?.percentage || 0),
        score:
            Number(attempt?.score || 0),
        status:
            attempt?.status ||
            assignment?.status ||
            "Unknown",
        submittedAt:
            attempt?.submittedAt ||
            assignment?.candidateSubmittedAt ||
            null,
    };
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const HRInterview = () => {

    const [activeTab, setActiveTab] =
        useState("assigned");


    const [assignedTests, setAssignedTests] =
        useState([]);

    const [submittedResults, setSubmittedResults] =
        useState([]);


    const [search, setSearch] =
        useState("");


    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);


    const [error, setError] =
        useState("");


    const [selectedAssignment, setSelectedAssignment] =
        useState(null);

    const [selectedResult, setSelectedResult] =
        useState(null);


    const [detailLoading, setDetailLoading] =
        useState(false);

    const [detailError, setDetailError] =
        useState("");


    const [sendingId, setSendingId] =
        useState("");


    const [successMessage, setSuccessMessage] =
        useState("");


    const [expandedQuestions, setExpandedQuestions] =
        useState({});


    /* =====================================================
       LOAD ASSIGNED TESTS
    ===================================================== */

    const loadAssignedTests = useCallback(
        async ({
            silent = false,
        } = {}) => {

            try {

                if (!silent) {
                    setLoading(true);
                }

                setError("");

                const response =
                    await getHRAptitudeTests({
                        search: "",
                    });


                const data =
                    response?.assignments ||
                    response?.data?.assignments ||
                    [];


                setAssignedTests(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "HR INTERVIEW LOAD ASSIGNED TESTS:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load aptitude tests"
                );

            } finally {

                if (!silent) {
                    setLoading(false);
                }

            }

        },
        []
    );


    /* =====================================================
       LOAD RESULTS
    ===================================================== */

    const loadSubmittedResults = useCallback(
        async ({
            silent = false,
        } = {}) => {

            try {

                if (!silent) {
                    setLoading(true);
                }

                setError("");

                const response =
                    await getHRSubmittedAptitudeTests({
                        search: "",
                    });


                const data =
                    response?.results ||
                    response?.data?.results ||
                    [];


                const normalized =
                    Array.isArray(data)
                        ? data
                            .map(normalizeResult)
                            .filter(Boolean)
                        : [];


                setSubmittedResults(
                    normalized
                );

            } catch (err) {

                console.error(
                    "HR INTERVIEW LOAD RESULTS:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load aptitude test results"
                );

            } finally {

                if (!silent) {
                    setLoading(false);
                }

            }

        },
        []
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            await Promise.all([
                loadAssignedTests({
                    silent: true,
                }),
                loadSubmittedResults({
                    silent: true,
                }),
            ]);

            setLoading(false);

        };

        load();

    }, [
        loadAssignedTests,
        loadSubmittedResults,
    ]);


    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = async () => {

        try {

            setRefreshing(true);
            setError("");

            await Promise.all([
                loadAssignedTests({
                    silent: true,
                }),
                loadSubmittedResults({
                    silent: true,
                }),
            ]);

        } catch (err) {

            console.error(err);

        } finally {

            setRefreshing(false);

        }

    };


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredAssignedTests =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return assignedTests;
            }

            return assignedTests.filter(
                (assignment) => {

                    const text = [

                        getCandidateName(
                            assignment
                        ),

                        getCandidateEmail(
                            assignment
                        ),

                        getCandidatePhone(
                            assignment
                        ),

                        getJobTitle(
                            assignment
                        ),

                        getJobDepartment(
                            assignment
                        ),

                        getJobLocation(
                            assignment
                        ),

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(value);

                }
            );

        }, [
            assignedTests,
            search,
        ]);


    const filteredResults =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return submittedResults;
            }

            return submittedResults.filter(
                (result) => {

                    const text = [

                        result.candidateName,

                        result.candidateEmail,

                        result.candidatePhone,

                        result.jobTitle,

                        result.jobDepartment,

                        result.jobLocation,

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(value);

                }
            );

        }, [
            submittedResults,
            search,
        ]);


    /* =====================================================
       STATS
    ===================================================== */

    const stats =
        useMemo(() => {

            const assigned =
                assignedTests.length;

            const sent =
                assignedTests.filter(
                    (item) =>
                        item?.status ===
                        "SentToCandidate"
                ).length;

            const results =
                submittedResults.length;

            const average =
                results > 0
                    ? submittedResults.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item?.percentage ||
                                0
                            ),
                        0
                    ) / results
                    : 0;


            return {
                assigned,
                sent,
                results,
                average:
                    Math.round(
                        average * 10
                    ) / 10,
            };

        }, [
            assignedTests,
            submittedResults,
        ]);


    /* =====================================================
       OPEN ASSIGNMENT
    ===================================================== */

    const openAssignment =
        async (assignment) => {

            const id =
                getAssignmentId(
                    assignment
                );


            if (!id) {

                setDetailError(
                    "Invalid aptitude assignment ID"
                );

                return;
            }


            try {

                setDetailLoading(true);
                setDetailError("");

                setSelectedAssignment(
                    assignment
                );


                const response =
                    await getHRAptitudeTestById(
                        id
                    );


                const detail =
                    response?.assignment ||
                    response?.data?.assignment ||
                    assignment;


                const questions =
                    response?.questions ||
                    response?.data?.questions ||
                    [];


                setSelectedAssignment({
                    ...detail,

                    _questions:
                        Array.isArray(
                            questions
                        )
                            ? questions
                            : [],
                });

            } catch (err) {

                console.error(
                    "OPEN HR APTITUDE TEST:",
                    err
                );


                /*
                IMPORTANT:

                Do not replace the whole page with
                "This job application no longer exists".

                The assignment already contains snapshot
                information. Keep it visible.
                */

                setSelectedAssignment({
                    ...assignment,

                    _questions:
                        assignment?._questions ||
                        [],
                });


                setDetailError(
                    err?.response?.data?.message ||
                    "Unable to load additional test details"
                );

            } finally {

                setDetailLoading(false);

            }

        };


    /* =====================================================
       OPEN RESULT
    ===================================================== */

    const openResult =
        async (result) => {

            const attemptId =
                getAttemptId(
                    result?.attempt
                );


            if (!attemptId) {

                setDetailError(
                    "Candidate result is not available yet"
                );

                setSelectedResult(
                    result
                );

                return;
            }


            try {

                setDetailLoading(true);
                setDetailError("");

                setSelectedResult(
                    result
                );


                const response =
                    await getHRSubmittedAptitudeTestById(
                        attemptId
                    );


                const attempt =
                    response?.attempt ||
                    response?.data?.attempt ||
                    result?.attempt ||
                    null;


                const questions =
                    response?.questions ||
                    response?.data?.questions ||
                    [];


                setSelectedResult({

                    ...result,

                    attempt,

                    questions:
                        Array.isArray(
                            questions
                        )
                            ? questions
                            : [],

                });

            } catch (err) {

                console.error(
                    "OPEN HR APTITUDE RESULT:",
                    err
                );


                /*
                Keep list data visible even when
                detailed request fails.
                */

                setSelectedResult(
                    result
                );


                setDetailError(
                    err?.response?.data?.message ||
                    "Unable to load candidate result"
                );

            } finally {

                setDetailLoading(false);

            }

        };


    /* =====================================================
       CLOSE MODALS
    ===================================================== */

    const closeDetails = () => {

        setSelectedAssignment(null);

        setSelectedResult(null);

        setDetailError("");

        setExpandedQuestions({});

    };


    /* =====================================================
       SEND TEST
    ===================================================== */

    const handleSendTest =
        async (assignment) => {

            const id =
                getAssignmentId(
                    assignment
                );


            if (!id) {

                setError(
                    "Invalid aptitude assignment ID"
                );

                return;

            }


            const candidateName =
                getCandidateName(
                    assignment
                );


            try {

                setSendingId(id);

                setError("");

                setSuccessMessage("");


                await sendAptitudeTestToCandidate(
                    id
                );


                setSuccessMessage(
                    `Aptitude test sent to ${candidateName}`
                );


                /*
                Reload database data immediately.

                No setInterval/setTimeout is used.
                */

                await loadAssignedTests({
                    silent: true,
                });


                await loadSubmittedResults({
                    silent: true,
                });


            } catch (err) {

                console.error(
                    "SEND APTITUDE TEST:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to send aptitude test"
                );

            } finally {

                setSendingId("");

            }

        };


    /* =====================================================
       QUESTION TOGGLE
    ===================================================== */

    const toggleQuestion =
        (questionId) => {

            setExpandedQuestions(
                (previous) => ({
                    ...previous,

                    [questionId]:
                        !previous[
                            questionId
                        ],

                })
            );

        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="hr-interview-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-interview-header">

                <div className="hr-interview-title">

                    <div className="hr-interview-title-icon">
                        <ClipboardCheck
                            size={24}
                        />
                    </div>

                    <div>
                        <h1>
                            Aptitude & Interview
                        </h1>

                        <p>
                            Review aptitude assignments,
                            send tests to candidates,
                            and evaluate submitted results.
                        </p>
                    </div>

                </div>


                <button
                    type="button"
                    className="hr-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
                <div className="hr-alert success">

                    <CheckCircle2 size={18} />

                    <span>
                        {successMessage}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="hr-alert error">

                    <AlertCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="hr-interview-stats">

                <div className="hr-stat-card">

                    <div className="hr-stat-icon">
                        <Users size={20} />
                    </div>

                    <div>
                        <span>
                            Assigned Tests
                        </span>

                        <strong>
                            {stats.assigned}
                        </strong>
                    </div>

                </div>


                <div className="hr-stat-card">

                    <div className="hr-stat-icon">
                        <Send size={20} />
                    </div>

                    <div>
                        <span>
                            Sent to Candidates
                        </span>

                        <strong>
                            {stats.sent}
                        </strong>
                    </div>

                </div>


                <div className="hr-stat-card">

                    <div className="hr-stat-icon">
                        <BarChart3 size={20} />
                    </div>

                    <div>
                        <span>
                            Submitted Results
                        </span>

                        <strong>
                            {stats.results}
                        </strong>
                    </div>

                </div>


                <div className="hr-stat-card">

                    <div className="hr-stat-icon">
                        <Award size={20} />
                    </div>

                    <div>
                        <span>
                            Average Score
                        </span>

                        <strong>
                            {stats.average}%
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="hr-interview-toolbar">

                <div className="hr-interview-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "assigned"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("assigned")
                        }
                    >

                        <ClipboardCheck
                            size={17}
                        />

                        Assigned Tests

                        <span>
                            {assignedTests.length}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "results"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("results")
                        }
                    >

                        <Award
                            size={17}
                        />

                        Candidate Results

                        <span>
                            {submittedResults.length}
                        </span>

                    </button>

                </div>


                <div className="hr-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder={
                            activeTab === "results"
                                ? "Search candidate or job..."
                                : "Search candidate or job..."
                        }
                    />


                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X size={16} />
                        </button>
                    )}

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            {loading ? (

                <div className="hr-empty-state">

                    <LoaderCircle
                        size={34}
                        className="spin"
                    />

                    <h3>
                        Loading aptitude tests...
                    </h3>

                    <p>
                        Please wait while the latest
                        database records are loaded.
                    </p>

                </div>

            ) : activeTab === "assigned" ? (

                /* =================================================
                   ASSIGNED TABLE
                ================================================= */

                <div className="hr-table-card">

                    <div className="hr-table-header">

                        <div>
                            <h2>
                                Aptitude Assignments
                            </h2>

                            <p>
                                Tests received by you from
                                the aptitude workflow.
                            </p>
                        </div>

                        <span className="record-count">
                            {filteredAssignedTests.length}
                            {" "}
                            records
                        </span>

                    </div>


                    {filteredAssignedTests.length === 0 ? (

                        <div className="hr-empty-state compact">

                            <ClipboardCheck
                                size={34}
                            />

                            <h3>
                                No aptitude assignments
                            </h3>

                            <p>
                                There are no aptitude tests
                                matching your search.
                            </p>

                        </div>

                    ) : (

                        <div className="hr-table-wrapper">

                            <table className="hr-interview-table">

                                <thead>
                                    <tr>

                                        <th>
                                            Candidate
                                        </th>

                                        <th>
                                            Job
                                        </th>

                                        <th>
                                            Questions
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Received
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>

                                    {filteredAssignedTests.map(
                                        (assignment) => {

                                            const id =
                                                getAssignmentId(
                                                    assignment
                                                );


                                            const image =
                                                getCandidateImage(
                                                    assignment
                                                );


                                            const isSent =
                                                assignment?.status ===
                                                "SentToCandidate";


                                            return (
                                                <tr
                                                    key={id}
                                                >

                                                    <td>

                                                        <div className="candidate-cell">

                                                            {image ? (

                                                                <img
                                                                    src={image}
                                                                    alt=""
                                                                    className="candidate-avatar"
                                                                />

                                                            ) : (

                                                                <div className="candidate-avatar fallback">
                                                                    <UserRound
                                                                        size={18}
                                                                    />
                                                                </div>

                                                            )}


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        getCandidateName(
                                                                            assignment
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getCandidateEmail(
                                                                            assignment
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="job-cell">

                                                            <strong>
                                                                {
                                                                    getJobTitle(
                                                                        assignment
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    getJobDepartment(
                                                                        assignment
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="question-count">

                                                            <CircleHelp
                                                                size={16}
                                                            />

                                                            {
                                                                assignment?.questionCount ??
                                                                assignment?.requiredQuestionCount ??
                                                                0
                                                            }

                                                            /
                                                            {
                                                                assignment?.requiredQuestionCount ??
                                                                0
                                                            }

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                assignment?.status
                                                            )}`}
                                                        >
                                                            {
                                                                getStatusLabel(
                                                                    assignment?.status
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="date-cell">

                                                            <CalendarDays
                                                                size={15}
                                                            />

                                                            {
                                                                formatShortDate(
                                                                    assignment?.sentToHRAt ||
                                                                    assignment?.createdAt
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                type="button"
                                                                className="icon-action view"
                                                                title="View assignment"
                                                                onClick={() =>
                                                                    openAssignment(
                                                                        assignment
                                                                    )
                                                                }
                                                            >

                                                                <Eye
                                                                    size={17}
                                                                />

                                                            </button>


                                                            {!isSent && (
                                                                <button
                                                                    type="button"
                                                                    className="send-action"
                                                                    disabled={
                                                                        sendingId ===
                                                                        id
                                                                    }
                                                                    onClick={() =>
                                                                        handleSendTest(
                                                                            assignment
                                                                        )
                                                                    }
                                                                >

                                                                    {sendingId ===
                                                                    id ? (

                                                                        <LoaderCircle
                                                                            size={16}
                                                                            className="spin"
                                                                        />

                                                                    ) : (

                                                                        <Send
                                                                            size={16}
                                                                        />

                                                                    )}

                                                                    {sendingId ===
                                                                    id
                                                                        ? "Sending..."
                                                                        : "Send"}

                                                                </button>
                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>
                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            ) : (

                /* =================================================
                   RESULTS TABLE
                ================================================= */

                <div className="hr-table-card">

                    <div className="hr-table-header">

                        <div>
                            <h2>
                                Candidate Aptitude Results
                            </h2>

                            <p>
                                Review submitted answers,
                                scores, and question-wise results.
                            </p>
                        </div>

                        <span className="record-count">
                            {filteredResults.length}
                            {" "}
                            results
                        </span>

                    </div>


                    {filteredResults.length === 0 ? (

                        <div className="hr-empty-state compact">

                            <Award
                                size={36}
                            />

                            <h3>
                                No submitted results
                            </h3>

                            <p>
                                No candidate aptitude results
                                are currently available from
                                the server.
                            </p>

                        </div>

                    ) : (

                        <div className="hr-table-wrapper">

                            <table className="hr-interview-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Candidate
                                        </th>

                                        <th>
                                            Job
                                        </th>

                                        <th>
                                            Score
                                        </th>

                                        <th>
                                            Correct
                                        </th>

                                        <th>
                                            Answered
                                        </th>

                                        <th>
                                            Submitted
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredResults.map(
                                        (result) => {

                                            const attempt =
                                                result?.attempt ||
                                                {};

                                            const assignment =
                                                result?.assignment ||
                                                {};


                                            const attemptId =
                                                getAttemptId(
                                                    attempt
                                                );


                                            const image =
                                                getCandidateImage(
                                                    assignment
                                                );


                                            return (
                                                <tr
                                                    key={
                                                        attemptId ||
                                                        getAssignmentId(
                                                            assignment
                                                        )
                                                    }
                                                >

                                                    <td>

                                                        <div className="candidate-cell">

                                                            {image ? (

                                                                <img
                                                                    src={image}
                                                                    alt=""
                                                                    className="candidate-avatar"
                                                                />

                                                            ) : (

                                                                <div className="candidate-avatar fallback">
                                                                    <UserRound
                                                                        size={18}
                                                                    />
                                                                </div>

                                                            )}


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        result.candidateName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        result.candidateEmail
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="job-cell">

                                                            <strong>
                                                                {
                                                                    result.jobTitle
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    result.jobDepartment
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="score-cell">

                                                            <strong>
                                                                {
                                                                    Number(
                                                                        attempt.percentage ||
                                                                        0
                                                                    )
                                                                }%
                                                            </strong>

                                                            <span>
                                                                {
                                                                    Number(
                                                                        attempt.score ||
                                                                        0
                                                                    )
                                                                } marks
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="correct-count">

                                                            <CheckCircle2
                                                                size={16}
                                                            />

                                                            {
                                                                Number(
                                                                    attempt.correctAnswers ||
                                                                    0
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        {
                                                            Number(
                                                                attempt.answeredQuestions ||
                                                                0
                                                            )
                                                        }

                                                        /
                                                        {
                                                            Number(
                                                                attempt.totalQuestions ||
                                                                0
                                                            )
                                                        }

                                                    </td>


                                                    <td>

                                                        <span className="date-cell">

                                                            <Clock3
                                                                size={15}
                                                            />

                                                            {
                                                                formatShortDate(
                                                                    attempt.submittedAt
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="view-result-button"
                                                            onClick={() =>
                                                                openResult(
                                                                    result
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View Result

                                                        </button>

                                                    </td>

                                                </tr>
                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}


            {/* =================================================
                ASSIGNMENT MODAL
            ================================================= */}

            {selectedAssignment && (
                <div
                    className="hr-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails();
                        }

                    }}
                >

                    <div className="hr-modal assignment-modal">

                        <div className="hr-modal-header">

                            <div>

                                <span className="modal-eyebrow">
                                    Aptitude Assignment
                                </span>

                                <h2>
                                    Candidate Details
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeDetails
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {detailLoading ? (

                            <div className="modal-loading">

                                <LoaderCircle
                                    size={30}
                                    className="spin"
                                />

                                <span>
                                    Loading test details...
                                </span>

                            </div>

                        ) : (

                            <div className="modal-body">

                                {detailError && (
                                    <div className="modal-warning">

                                        <AlertCircle
                                            size={17}
                                        />

                                        <span>
                                            {detailError}
                                        </span>

                                    </div>
                                )}


                                {/* =====================================
                                    CANDIDATE
                                ===================================== */}

                                <section className="detail-section">

                                    <div className="section-heading">

                                        <UserRound
                                            size={18}
                                        />

                                        <h3>
                                            Candidate
                                        </h3>

                                    </div>


                                    <div className="candidate-detail-card">

                                        {getCandidateImage(
                                            selectedAssignment
                                        ) ? (

                                            <img
                                                src={getCandidateImage(
                                                    selectedAssignment
                                                )}
                                                alt=""
                                                className="large-candidate-avatar"
                                            />

                                        ) : (

                                            <div className="large-candidate-avatar fallback">
                                                <UserRound
                                                    size={28}
                                                />
                                            </div>

                                        )}


                                        <div className="candidate-detail-main">

                                            <h3>
                                                {
                                                    getCandidateName(
                                                        selectedAssignment
                                                    )
                                                }
                                            </h3>

                                            <div className="detail-contact">

                                                <span>
                                                    <Mail size={15} />

                                                    {
                                                        getCandidateEmail(
                                                            selectedAssignment
                                                        )
                                                    }
                                                </span>


                                                <span>
                                                    <Phone size={15} />

                                                    {
                                                        getCandidatePhone(
                                                            selectedAssignment
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* =====================================
                                    JOB
                                ===================================== */}

                                <section className="detail-section">

                                    <div className="section-heading">

                                        <BriefcaseBusiness
                                            size={18}
                                        />

                                        <h3>
                                            Job
                                        </h3>

                                    </div>


                                    <div className="job-detail-grid">

                                        <div>
                                            <span>
                                                Position
                                            </span>

                                            <strong>
                                                {
                                                    getJobTitle(
                                                        selectedAssignment
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Department
                                            </span>

                                            <strong>
                                                {
                                                    getJobDepartment(
                                                        selectedAssignment
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {
                                                    getJobLocation(
                                                        selectedAssignment
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Application
                                            </span>

                                            <strong>
                                                {getApplicationId(
                                                    selectedAssignment
                                                ) || "Application record"}
                                            </strong>
                                        </div>

                                    </div>

                                </section>


                                {/* =====================================
                                    TEST
                                ===================================== */}

                                <section className="detail-section">

                                    <div className="section-heading">

                                        <CircleHelp
                                            size={18}
                                        />

                                        <h3>
                                            Aptitude Test
                                        </h3>

                                    </div>


                                    <div className="test-summary-grid">

                                        <div className="summary-box">

                                            <span>
                                                Required Questions
                                            </span>

                                            <strong>
                                                {
                                                    selectedAssignment?.requiredQuestionCount ??
                                                    0
                                                }
                                            </strong>

                                        </div>


                                        <div className="summary-box">

                                            <span>
                                                Created Questions
                                            </span>

                                            <strong>
                                                {
                                                    selectedAssignment?.questionCount ??
                                                    selectedAssignment?._questions?.length ??
                                                    0
                                                }
                                            </strong>

                                        </div>


                                        <div className="summary-box">

                                            <span>
                                                Question Source
                                            </span>

                                            <strong>
                                                {
                                                    selectedAssignment?.questionSource ||
                                                    "New"
                                                }
                                            </strong>

                                        </div>


                                        <div className="summary-box">

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                {
                                                    getStatusLabel(
                                                        selectedAssignment?.status
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>


                                {/* =====================================
                                    QUESTIONS
                                ===================================== */}

                                {safeArray(
                                    selectedAssignment?._questions
                                ).length > 0 && (

                                    <section className="detail-section">

                                        <div className="section-heading">

                                            <FileText
                                                size={18}
                                            />

                                            <h3>
                                                Questions
                                            </h3>

                                        </div>


                                        <div className="question-list">

                                            {selectedAssignment._questions.map(
                                                (
                                                    question,
                                                    index
                                                ) => {

                                                    const questionId =
                                                        getId(
                                                            question
                                                        ) ||
                                                        `question-${index}`;


                                                    return (
                                                        <div
                                                            className="question-card"
                                                            key={
                                                                questionId
                                                            }
                                                        >

                                                            <button
                                                                type="button"
                                                                className="question-header"
                                                                onClick={() =>
                                                                    toggleQuestion(
                                                                        questionId
                                                                    )
                                                                }
                                                            >

                                                                <div className="question-title">

                                                                    <span className="question-number">
                                                                        {index + 1}
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            question?.question ||
                                                                            "Question unavailable"
                                                                        }
                                                                    </span>

                                                                </div>


                                                                {expandedQuestions[
                                                                    questionId
                                                                ] ? (

                                                                    <ChevronUp
                                                                        size={18}
                                                                    />

                                                                ) : (

                                                                    <ChevronDown
                                                                        size={18}
                                                                    />

                                                                )}

                                                            </button>


                                                            {expandedQuestions[
                                                                questionId
                                                            ] && (

                                                                <div className="question-content">

                                                                    <div className="options-list">

                                                                        {safeArray(
                                                                            question?.options
                                                                        ).map(
                                                                            (
                                                                                option,
                                                                                optionIndex
                                                                            ) => (

                                                                                <div
                                                                                    className="option-item"
                                                                                    key={
                                                                                        optionIndex
                                                                                    }
                                                                                >

                                                                                    <span className="option-letter">
                                                                                        {String.fromCharCode(
                                                                                            65 +
                                                                                            optionIndex
                                                                                        )}
                                                                                    </span>

                                                                                    <span>
                                                                                        {
                                                                                            typeof option ===
                                                                                            "string"
                                                                                                ? option
                                                                                                : option?.text ||
                                                                                                  option?.label ||
                                                                                                  ""
                                                                                        }
                                                                                    </span>

                                                                                </div>

                                                                            )
                                                                        )}

                                                                    </div>


                                                                    <div className="question-marks">

                                                                        <Award
                                                                            size={15}
                                                                        />

                                                                        {
                                                                            question?.marks ??
                                                                            0
                                                                        }

                                                                        marks

                                                                    </div>

                                                                </div>

                                                            )}

                                                        </div>
                                                    );

                                                }
                                            )}

                                        </div>

                                    </section>

                                )}

                            </div>

                        )}


                        <div className="hr-modal-footer">

                            {selectedAssignment?.status !==
                                "SentToCandidate" && (

                                <button
                                    type="button"
                                    className="primary-modal-button"
                                    disabled={
                                        sendingId ===
                                        getAssignmentId(
                                            selectedAssignment
                                        )
                                    }
                                    onClick={() =>
                                        handleSendTest(
                                            selectedAssignment
                                        )
                                    }
                                >

                                    <Send size={17} />

                                    Send to Candidate

                                </button>

                            )}


                            <button
                                type="button"
                                className="secondary-modal-button"
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                RESULT MODAL
            ================================================= */}

            {selectedResult && (
                <div
                    className="hr-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails();
                        }

                    }}
                >

                    <div className="hr-modal result-modal">

                        <div className="hr-modal-header">

                            <div>

                                <span className="modal-eyebrow">
                                    Aptitude Result
                                </span>

                                <h2>
                                    Candidate Performance
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeDetails
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {detailLoading ? (

                            <div className="modal-loading">

                                <LoaderCircle
                                    size={30}
                                    className="spin"
                                />

                                <span>
                                    Loading candidate answers...
                                </span>

                            </div>

                        ) : (

                            <div className="modal-body">

                                {detailError && (
                                    <div className="modal-warning">

                                        <AlertCircle
                                            size={17}
                                        />

                                        <span>
                                            {detailError}
                                        </span>

                                    </div>
                                )}


                                {/* =====================================
                                    CANDIDATE HEADER
                                ===================================== */}

                                <div className="result-candidate-header">

                                    {getCandidateImage(
                                        selectedResult.assignment
                                    ) ? (

                                        <img
                                            src={getCandidateImage(
                                                selectedResult.assignment
                                            )}
                                            alt=""
                                            className="large-candidate-avatar"
                                        />

                                    ) : (

                                        <div className="large-candidate-avatar fallback">
                                            <UserRound
                                                size={28}
                                            />
                                        </div>

                                    )}


                                    <div>

                                        <h3>
                                            {
                                                selectedResult.candidateName ||
                                                getCandidateName(
                                                    selectedResult.assignment
                                                )
                                            }
                                        </h3>

                                        <p>
                                            {
                                                selectedResult.candidateEmail ||
                                                getCandidateEmail(
                                                    selectedResult.assignment
                                                )
                                            }
                                        </p>

                                        <span>
                                            {
                                                getJobTitle(
                                                    selectedResult.assignment
                                                )
                                            }
                                        </span>

                                    </div>

                                </div>


                                {/* =====================================
                                    SCORE CARDS
                                ===================================== */}

                                <div className="result-score-grid">

                                    <div className="result-score-card primary">

                                        <div className="result-score-icon">
                                            <Target
                                                size={21}
                                            />
                                        </div>

                                        <span>
                                            Percentage
                                        </span>

                                        <strong>
                                            {
                                                Number(
                                                    selectedResult?.attempt?.percentage ||
                                                    0
                                                )
                                            }%
                                        </strong>

                                    </div>


                                    <div className="result-score-card">

                                        <div className="result-score-icon">
                                            <Award
                                                size={21}
                                            />
                                        </div>

                                        <span>
                                            Score
                                        </span>

                                        <strong>
                                            {
                                                Number(
                                                    selectedResult?.attempt?.score ||
                                                    0
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="result-score-card">

                                        <div className="result-score-icon success-icon">
                                            <CheckCircle2
                                                size={21}
                                            />
                                        </div>

                                        <span>
                                            Correct
                                        </span>

                                        <strong>
                                            {
                                                Number(
                                                    selectedResult?.attempt?.correctAnswers ||
                                                    0
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="result-score-card">

                                        <div className="result-score-icon danger-icon">
                                            <XCircle
                                                size={21}
                                            />
                                        </div>

                                        <span>
                                            Wrong
                                        </span>

                                        <strong>
                                            {
                                                Number(
                                                    selectedResult?.attempt?.wrongAnswers ||
                                                    0
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* =====================================
                                    ATTEMPT INFORMATION
                                ===================================== */}

                                <div className="attempt-info">

                                    <div>

                                        <Clock3
                                            size={16}
                                        />

                                        <span>
                                            Started
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedResult?.attempt?.startedAt
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <CheckCircle2
                                            size={16}
                                        />

                                        <span>
                                            Submitted
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    selectedResult?.attempt?.submittedAt
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <CircleHelp
                                            size={16}
                                        />

                                        <span>
                                            Answered
                                        </span>

                                        <strong>
                                            {
                                                Number(
                                                    selectedResult?.attempt?.answeredQuestions ||
                                                    0
                                                )
                                            }
                                            /
                                            {
                                                Number(
                                                    selectedResult?.attempt?.totalQuestions ||
                                                    0
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* =====================================
                                    QUESTIONS + ANSWERS
                                ===================================== */}

                                <section className="detail-section">

                                    <div className="section-heading">

                                        <FileText
                                            size={18}
                                        />

                                        <h3>
                                            Candidate Answers
                                        </h3>

                                        <span className="section-count">

                                            {
                                                safeArray(
                                                    selectedResult?.questions
                                                ).length
                                            }

                                            {" "}
                                            questions

                                        </span>

                                    </div>


                                    {safeArray(
                                        selectedResult?.questions
                                    ).length === 0 ? (

                                        <div className="no-answers">

                                            <AlertCircle
                                                size={28}
                                            />

                                            <h3>
                                                Answer details unavailable
                                            </h3>

                                            <p>
                                                The server returned the
                                                candidate result, but no
                                                question-wise answer data
                                                was returned for this attempt.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="result-question-list">

                                            {selectedResult.questions.map(
                                                (
                                                    question,
                                                    index
                                                ) => {

                                                    const questionId =
                                                        getId(
                                                            question?.questionId
                                                        ) ||
                                                        `result-question-${index}`;


                                                    const selected =
                                                        normalizeText(
                                                            question?.selectedOption
                                                        );


                                                    const correct =
                                                        normalizeText(
                                                            question?.correctAnswer
                                                        );


                                                    const isCorrect =
                                                        Boolean(
                                                            question?.isCorrect
                                                        );


                                                    return (
                                                        <div
                                                            className={`result-question-card ${
                                                                isCorrect
                                                                    ? "answer-correct"
                                                                    : "answer-wrong"
                                                            }`}
                                                            key={
                                                                questionId
                                                            }
                                                        >

                                                            <div className="result-question-top">

                                                                <div className="result-question-number">
                                                                    {index + 1}
                                                                </div>

                                                                <div className="result-question-text">

                                                                    <h4>
                                                                        {
                                                                            question?.question ||
                                                                            "Question unavailable"
                                                                        }
                                                                    </h4>

                                                                    <span>
                                                                        {
                                                                            question?.marks ??
                                                                            0
                                                                        }
                                                                        {" "}
                                                                        marks
                                                                    </span>

                                                                </div>


                                                                <div className="answer-status">

                                                                    {isCorrect ? (

                                                                        <>
                                                                            <CheckCircle2
                                                                                size={18}
                                                                            />

                                                                            Correct
                                                                        </>

                                                                    ) : (

                                                                        <>
                                                                            <XCircle
                                                                                size={18}
                                                                            />

                                                                            Incorrect
                                                                        </>

                                                                    )}

                                                                </div>

                                                            </div>


                                                            <div className="answer-comparison">

                                                                <div
                                                                    className={
                                                                        `answer-box ${
                                                                            isCorrect
                                                                                ? "selected-correct"
                                                                                : "selected-wrong"
                                                                        }`
                                                                    }
                                                                >

                                                                    <span>
                                                                        Candidate Answer
                                                                    </span>

                                                                    <strong>

                                                                        {selected
                                                                            ? selected
                                                                            : "Not answered"}

                                                                    </strong>

                                                                </div>


                                                                <div className="answer-box correct-answer">

                                                                    <span>
                                                                        Correct Answer
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            correct ||
                                                                            "Not available"
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            </div>


                                                            {safeArray(
                                                                question?.options
                                                            ).length > 0 && (

                                                                <div className="result-options">

                                                                    {question.options.map(
                                                                        (
                                                                            option,
                                                                            optionIndex
                                                                        ) => {

                                                                            const optionText =
                                                                                typeof option ===
                                                                                "string"
                                                                                    ? option
                                                                                    : option?.text ||
                                                                                      option?.label ||
                                                                                      "";


                                                                            const isSelected =
                                                                                optionText ===
                                                                                selected;


                                                                            const isCorrectOption =
                                                                                optionText ===
                                                                                correct;


                                                                            return (
                                                                                <div
                                                                                    className={`result-option ${
                                                                                        isSelected
                                                                                            ? "is-selected"
                                                                                            : ""
                                                                                    } ${
                                                                                        isCorrectOption
                                                                                            ? "is-correct"
                                                                                            : ""
                                                                                    }`}
                                                                                    key={
                                                                                        optionIndex
                                                                                    }
                                                                                >

                                                                                    <span className="option-letter">
                                                                                        {String.fromCharCode(
                                                                                            65 +
                                                                                            optionIndex
                                                                                        )}
                                                                                    </span>

                                                                                    <span>
                                                                                        {
                                                                                            optionText
                                                                                        }
                                                                                    </span>


                                                                                    {isSelected && (
                                                                                        <small>
                                                                                            Candidate
                                                                                        </small>
                                                                                    )}


                                                                                    {isCorrectOption && (
                                                                                        <small>
                                                                                            Correct
                                                                                        </small>
                                                                                    )}

                                                                                </div>
                                                                            );

                                                                        }
                                                                    )}

                                                                </div>

                                                            )}

                                                        </div>
                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </section>

                            </div>

                        )}


                        <div className="hr-modal-footer">

                            <button
                                type="button"
                                className="secondary-modal-button"
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};


export default HRInterview;