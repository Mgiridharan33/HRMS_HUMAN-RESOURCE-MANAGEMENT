import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Video,
    CalendarDays,
    Clock3,
    UserRound,
    BriefcaseBusiness,
    ExternalLink,
    CheckCircle2,
    CircleAlert,
    RefreshCw,
    Search,
    X,
    Mail,
    Building2,
    FileText,
    ChevronRight,
    MonitorPlay,
    History,
    CalendarCheck2,
    Copy,
    Check,
} from "lucide-react";

import {
    getCandidateVideoInterviews,
    getCandidateVideoInterviewById,
} from "../../services/candidateVideoInterviewApi";

import "./CandidateVideoInterview.css";


/*
=========================================================
HELPERS
=========================================================
*/


const getCandidateName = (
    candidate
) => {

    if (
        !candidate
    ) {

        return "Candidate";

    }

    if (
        candidate.name
    ) {

        return candidate.name;

    }

    return [
        candidate.firstName,
        candidate.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Candidate";

};


const getPersonName = (
    person
) => {

    if (
        !person
    ) {

        return "Not assigned";

    }

    if (
        person.name
    ) {

        return person.name;

    }

    return [
        person.firstName,
        person.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Not assigned";

};


const getJobTitle = (
    job
) => {

    if (
        !job
    ) {

        return "Video Interview";

    }

    return (
        job.title ||
        job.designation ||
        "Video Interview"
    );

};


const formatDate = (
    value
) => {

    if (
        !value
    ) {

        return "Not scheduled";

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid date";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );

};


const formatDateLong = (
    value
) => {

    if (
        !value
    ) {

        return "Not scheduled";

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not scheduled";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );

};


const formatTime = (
    value
) => {

    if (
        !value
    ) {

        return "";

    }

    /*
     * startTime/endTime are stored as strings,
     * normally "10:00", "11:00".
     */

    const text =
        String(value)
            .trim();

    if (
        !text
    ) {

        return "";

    }

    const parts =
        text.split(":");

    if (
        parts.length < 2
    ) {

        return text;

    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {

        return text;

    }

    const date =
        new Date();

    date.setHours(
        hours,
        minutes,
        0,
        0
    );

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );

};


const formatScheduledTime = (
    interview
) => {

    if (
        interview?.startTime &&
        interview?.endTime
    ) {

        return `${formatTime(
            interview.startTime
        )} - ${formatTime(
            interview.endTime
        )}`;

    }

    if (
        interview?.startTime
    ) {

        return formatTime(
            interview.startTime
        );

    }

    if (
        interview?.scheduledAt
    ) {

        const date =
            new Date(
                interview.scheduledAt
            );

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit",
                }
            );

        }

    }

    return "Time not available";

};


const getStatusLabel = (
    status
) => {

    switch (
        status
    ) {

        case "SentToCandidate":
            return "Upcoming";

        case "Completed":
            return "Completed";

        case "MeetingStarted":
            return "Meeting Started";

        default:
            return status || "Unknown";

    }

};


const getStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "SentToCandidate":
            return "upcoming";

        case "Completed":
            return "completed";

        case "MeetingStarted":
            return "started";

        default:
            return "default";

    }

};


const isMeetingPast = (
    interview
) => {

    if (
        !interview
    ) {

        return false;

    }

    const endTime =
        interview.endTime;

    const scheduledDate =
        interview.scheduledDate;

    if (
        !scheduledDate ||
        !endTime
    ) {

        return false;

    }

    const dateText =
        new Date(
            scheduledDate
        );

    if (
        Number.isNaN(
            dateText.getTime()
        )
    ) {

        return false;

    }

    const timeParts =
        String(endTime)
            .split(":");

    if (
        timeParts.length < 2
    ) {

        return false;

    }

    dateText.setHours(
        Number(timeParts[0]),
        Number(timeParts[1]),
        0,
        0
    );

    return (
        dateText.getTime() <
        Date.now()
    );

};


const getInitials = (
    name
) => {

    if (
        !name
    ) {

        return "C";

    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            part =>
                part
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

};


/*
=========================================================
MAIN COMPONENT
=========================================================
*/

const CandidateVideoInterviews = () => {

    const [
        interviews,
        setInterviews,
    ] = useState([]);

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
        search,
        setSearch,
    ] = useState("");

    const [
        activeTab,
        setActiveTab,
    ] = useState("upcoming");

    const [
        selectedInterview,
        setSelectedInterview,
    ] = useState(null);

    const [
        detailLoading,
        setDetailLoading,
    ] = useState(false);

    const [
        copied,
        setCopied,
    ] = useState(false);


    /*
    =====================================================
    LOAD INTERVIEWS
    =====================================================
    */

    const loadInterviews =
        useCallback(
            async (
                showRefresh = false
            ) => {

                try {

                    if (
                        showRefresh
                    ) {

                        setRefreshing(
                            true
                        );

                    } else {

                        setLoading(
                            true
                        );

                    }

                    setError("");

                    const response =
                        await getCandidateVideoInterviews();

                    const data =
                        Array.isArray(
                            response?.interviews
                        )
                            ? response.interviews
                            : Array.isArray(response)
                                ? response
                            : [];

                    setInterviews(
                        data
                    );

                } catch (
                    requestError
                ) {

                    console.error(
                        "CANDIDATE VIDEO INTERVIEWS LOAD ERROR:",
                        requestError
                    );

                    const message =
                        requestError?.response
                            ?.data
                            ?.message ||
                        requestError?.message ||
                        "Failed to load video interviews.";

                    setError(
                        message
                    );

                } finally {

                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );

                }

            },
            []
        );


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(
        () => {

            loadInterviews();

        },
        [
            loadInterviews,
        ]
    );


    /*
    =====================================================
    FILTER
    =====================================================
    */

    const filteredInterviews =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();

                let result =
                    interviews.filter(
                        interview => {

                            if (
                                activeTab ===
                                "upcoming"
                            ) {

                                return (
                                    interview.status ===
                                    "SentToCandidate" ||
                                    interview.status ===
                                    "MeetingStarted"
                                );

                            }

                            if (
                                activeTab ===
                                "completed"
                            ) {

                                return (
                                    interview.status ===
                                    "Completed"
                                );

                            }

                            return true;

                        }
                    );


                if (
                    query
                ) {

                    result =
                        result.filter(
                            interview => {

                                const candidate =
                                    getCandidateName(
                                        interview.candidate
                                    );

                                const job =
                                    getJobTitle(
                                        interview.job
                                    );

                                const hr =
                                    getPersonName(
                                        interview.assignedHR
                                    );

                                const employee =
                                    getPersonName(
                                        interview.assignedEmployee
                                    );

                                return [
                                    candidate,
                                    job,
                                    hr,
                                    employee,
                                    interview.meetingPlatform,
                                    interview.status,
                                ]
                                    .join(" ")
                                    .toLowerCase()
                                    .includes(
                                        query
                                    );

                            }
                        );

                }

                return result;

            },
            [
                interviews,
                activeTab,
                search,
            ]
        );


    /*
    =====================================================
    COUNTS
    =====================================================
    */

    const upcomingCount =
        useMemo(
            () =>
                interviews.filter(
                    item =>
                        item.status ===
                        "SentToCandidate" ||
                        item.status ===
                        "MeetingStarted"
                ).length,
            [
                interviews,
            ]
        );


    const completedCount =
        useMemo(
            () =>
                interviews.filter(
                    item =>
                        item.status ===
                        "Completed"
                ).length,
            [
                interviews,
            ]
        );


    /*
    =====================================================
    OPEN DETAILS
    =====================================================
    */

    const openInterview =
        async (
            interview
        ) => {

            if (
                !interview?._id
            ) {

                return;

            }

            setSelectedInterview(
                interview
            );

            setCopied(
                false
            );

            try {

                setDetailLoading(
                    true
                );

                const response =
                    await getCandidateVideoInterviewById(
                        interview._id
                    );

                if (
                    response?.interview
                ) {

                    setSelectedInterview(
                        response.interview
                    );

                }

            } catch (
                requestError
            ) {

                console.error(
                    "LOAD VIDEO INTERVIEW DETAILS ERROR:",
                    requestError
                );

            } finally {

                setDetailLoading(
                    false
                );

            }

        };


    /*
    =====================================================
    CLOSE DETAILS
    =====================================================
    */

    const closeDetails =
        () => {

            setSelectedInterview(
                null
            );

            setCopied(
                false
            );

        };


    /*
    =====================================================
    JOIN MEETING
    =====================================================
    */

    const joinMeeting =
        (
            interview
        ) => {

            const link =
                String(
                    interview?.meetingLink ||
                    ""
                ).trim();

            if (
                !link
            ) {

                return;

            }

            window.open(
                link,
                "_blank",
                "noopener,noreferrer"
            );

        };


    /*
    =====================================================
    COPY MEETING LINK
    =====================================================
    */

    const copyMeetingLink =
        async (
            interview
        ) => {

            const link =
                String(
                    interview?.meetingLink ||
                    ""
                ).trim();

            if (
                !link
            ) {

                return;

            }

            try {

                await navigator.clipboard.writeText(
                    link
                );

                setCopied(
                    true
                );

                setTimeout(
                    () => {
                        setCopied(
                            false
                        );
                    },
                    1800
                );

            } catch (
                copyError
            ) {

                console.error(
                    "COPY MEETING LINK ERROR:",
                    copyError
                );

            }

        };


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="candidate-video-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="candidate-video-header">

                <div className="candidate-video-header-left">

                    <div className="candidate-video-header-icon">

                        <Video
                            size={25}
                        />

                    </div>

                    <div>

                        <h1>
                            Video Interviews
                        </h1>

                        <p>
                            View your scheduled interviews
                            and join your meeting when it is time.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="candidate-video-refresh-btn"
                    onClick={() =>
                        loadInterviews(
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
                                ? "candidate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </section>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="candidate-video-summary">

                <div className="candidate-video-summary-card">

                    <div className="candidate-video-summary-icon upcoming-icon">

                        <CalendarCheck2
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Upcoming
                        </span>

                        <strong>
                            {upcomingCount}
                        </strong>

                    </div>

                </div>


                <div className="candidate-video-summary-card">

                    <div className="candidate-video-summary-icon completed-icon">

                        <CheckCircle2
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedCount}
                        </strong>

                    </div>

                </div>


                <div className="candidate-video-summary-card">

                    <div className="candidate-video-summary-icon total-icon">

                        <Video
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Total Interviews
                        </span>

                        <strong>
                            {interviews.length}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="candidate-video-toolbar">

                <div className="candidate-video-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "upcoming"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "upcoming"
                            )
                        }
                    >

                        Upcoming

                        <span>
                            {upcomingCount}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "completed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "completed"
                            )
                        }
                    >

                        Completed

                        <span>
                            {completedCount}
                        </span>

                    </button>

                </div>


                <div className="candidate-video-search">

                    <Search
                        size={17}
                    />

                    <input
                        type="text"
                        placeholder="Search interviews..."
                        value={
                            search
                        }
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch(
                                    ""
                                )
                            }
                        >

                            <X
                                size={15}
                            />

                        </button>

                    )}

                </div>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="candidate-video-error">

                    <CircleAlert
                        size={19}
                    />

                    <div>

                        <strong>
                            Unable to load interviews
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadInterviews()
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="candidate-video-loading-grid">

                    {[1, 2, 3].map(
                        number => (

                            <div
                                className="candidate-video-skeleton-card"
                                key={number}
                            >

                                <div className="skeleton-line large" />

                                <div className="skeleton-line medium" />

                                <div className="skeleton-line small" />

                                <div className="skeleton-line medium" />

                            </div>

                        )
                    )}

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                filteredInterviews.length === 0 && (

                    <div className="candidate-video-empty">

                        <div className="candidate-video-empty-icon">

                            <Video
                                size={34}
                            />

                        </div>

                        <h2>

                            {activeTab === "upcoming"
                                ? "No upcoming video interviews"
                                : "No completed interviews"}

                        </h2>

                        <p>

                            {activeTab === "upcoming"
                                ? "When HR sends an approved video interview to you, it will appear here."
                                : "Your completed video interviews will appear here."}

                        </p>

                        {search && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                Clear Search
                            </button>

                        )}

                    </div>

                )}


            {/* =================================================
                INTERVIEW GRID
            ================================================= */}

            {!loading &&
                filteredInterviews.length > 0 && (

                    <section className="candidate-video-grid">

                        {filteredInterviews.map(
                            interview => {

                                const candidateName =
                                    getCandidateName(
                                        interview.candidate
                                    );

                                const jobTitle =
                                    getJobTitle(
                                        interview.job
                                    );

                                const hrName =
                                    getPersonName(
                                        interview.assignedHR
                                    );

                                const employeeName =
                                    getPersonName(
                                        interview.assignedEmployee
                                    );

                                const status =
                                    interview.status;

                                const completed =
                                    status ===
                                    "Completed";

                                return (

                                    <article
                                        className={
                                            `candidate-video-card ${
                                                completed
                                                    ? "is-completed"
                                                    : ""
                                            }`
                                        }
                                        key={
                                            interview._id
                                        }
                                    >

                                        {/* CARD TOP */}

                                        <div className="candidate-video-card-top">

                                            <div className="candidate-video-job-icon">

                                                <Video
                                                    size={21}
                                                />

                                            </div>

                                            <span
                                                className={
                                                    `candidate-video-status ${getStatusClass(
                                                        status
                                                    )}`
                                                }
                                            >

                                                {status ===
                                                    "Completed" && (
                                                    <CheckCircle2
                                                        size={13}
                                                    />
                                                )}

                                                {status ===
                                                    "SentToCandidate" && (
                                                    <CalendarCheck2
                                                        size={13}
                                                    />
                                                )}

                                                {getStatusLabel(
                                                    status
                                                )}

                                            </span>

                                        </div>


                                        {/* JOB */}

                                        <div className="candidate-video-card-job">

                                            <h2>
                                                {jobTitle}
                                            </h2>

                                            {interview.job?.department && (

                                                <span>

                                                    <Building2
                                                        size={14}
                                                    />

                                                    {
                                                        interview.job.department
                                                    }

                                                </span>

                                            )}

                                        </div>


                                        {/* DATE */}

                                        <div className="candidate-video-card-date">

                                            <div className="candidate-video-date-icon">

                                                <CalendarDays
                                                    size={18}
                                                />

                                            </div>

                                            <div>

                                                <span>
                                                    Interview Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        interview.scheduledDate ||
                                                        interview.scheduledAt
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* TIME */}

                                        <div className="candidate-video-info-row">

                                            <div>

                                                <Clock3
                                                    size={16}
                                                />

                                                <span>
                                                    {formatScheduledTime(
                                                        interview
                                                    )}
                                                </span>

                                            </div>

                                            <div>

                                                <MonitorPlay
                                                    size={16}
                                                />

                                                <span>
                                                    {
                                                        interview.meetingPlatform ||
                                                        "Google Meet"
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {/* PEOPLE */}

                                        <div className="candidate-video-people">

                                            <div>

                                                <UserRound
                                                    size={16}
                                                />

                                                <div>

                                                    <span>
                                                        HR
                                                    </span>

                                                    <strong>
                                                        {hrName}
                                                    </strong>

                                                </div>

                                            </div>


                                            <div>

                                                <BriefcaseBusiness
                                                    size={16}
                                                />

                                                <div>

                                                    <span>
                                                        Interviewer
                                                    </span>

                                                    <strong>
                                                        {employeeName}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="candidate-video-card-actions">

                                            <button
                                                type="button"
                                                className="candidate-video-details-btn"
                                                onClick={() =>
                                                    openInterview(
                                                        interview
                                                    )
                                                }
                                            >

                                                View Details

                                                <ChevronRight
                                                    size={16}
                                                />

                                            </button>


                                            {!completed &&
                                                interview.meetingLink && (

                                                    <button
                                                        type="button"
                                                        className="candidate-video-join-btn"
                                                        onClick={() =>
                                                            joinMeeting(
                                                                interview
                                                            )
                                                        }
                                                    >

                                                        <Video
                                                            size={16}
                                                        />

                                                        Join Meeting

                                                    </button>

                                                )}

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </section>

                )}


            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {selectedInterview && (

                <div
                    className="candidate-video-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeDetails();

                        }

                    }}
                >

                    <div className="candidate-video-modal">

                        {/* MODAL HEADER */}

                        <div className="candidate-video-modal-header">

                            <div>

                                <span>
                                    Video Interview
                                </span>

                                <h2>
                                    {getJobTitle(
                                        selectedInterview.job
                                    )}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeDetails
                                }
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        {/* LOADING */}

                        {detailLoading && (

                            <div className="candidate-video-modal-loading">

                                <RefreshCw
                                    size={24}
                                    className="candidate-spin"
                                />

                                Loading interview details...

                            </div>

                        )}


                        {/* DETAILS */}

                        {!detailLoading && (

                            <div className="candidate-video-modal-content">

                                {/* STATUS */}

                                <div className="candidate-video-modal-status-row">

                                    <span
                                        className={
                                            `candidate-video-status large ${getStatusClass(
                                                selectedInterview.status
                                            )}`
                                        }
                                    >

                                        {getStatusLabel(
                                            selectedInterview.status
                                        )}

                                    </span>

                                    {selectedInterview.sentToCandidateAt && (

                                        <span className="candidate-video-sent-text">

                                            Sent to you on{" "}

                                            {formatDate(
                                                selectedInterview.sentToCandidateAt
                                            )}

                                        </span>

                                    )}

                                </div>


                                {/* SCHEDULE BOX */}

                                <div className="candidate-video-schedule-box">

                                    <div className="candidate-video-schedule-main">

                                        <CalendarDays
                                            size={22}
                                        />

                                        <div>

                                            <span>
                                                Interview Date
                                            </span>

                                            <strong>
                                                {formatDateLong(
                                                    selectedInterview.scheduledDate ||
                                                    selectedInterview.scheduledAt
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="candidate-video-schedule-main">

                                        <Clock3
                                            size={22}
                                        />

                                        <div>

                                            <span>
                                                Interview Time
                                            </span>

                                            <strong>
                                                {formatScheduledTime(
                                                    selectedInterview
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* MEETING */}

                                <div className="candidate-video-detail-section">

                                    <div className="candidate-video-section-title">

                                        <MonitorPlay
                                            size={18}
                                        />

                                        <h3>
                                            Meeting Information
                                        </h3>

                                    </div>


                                    <div className="candidate-video-detail-list">

                                        <div>

                                            <span>
                                                Platform
                                            </span>

                                            <strong>
                                                {
                                                    selectedInterview.meetingPlatform ||
                                                    "Google Meet"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Meeting Link
                                            </span>

                                            <div className="candidate-video-link-row">

                                                <strong>
                                                    {selectedInterview.meetingLink
                                                        ? "Meeting link available"
                                                        : "Meeting link unavailable"}
                                                </strong>

                                                {selectedInterview.meetingLink && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyMeetingLink(
                                                                selectedInterview
                                                            )
                                                        }
                                                        title="Copy meeting link"
                                                    >

                                                        {copied ? (
                                                            <Check
                                                                size={15}
                                                            />
                                                        ) : (
                                                            <Copy
                                                                size={15}
                                                            />
                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* PEOPLE */}

                                <div className="candidate-video-detail-section">

                                    <div className="candidate-video-section-title">

                                        <UserRound
                                            size={18}
                                        />

                                        <h3>
                                            Interview Team
                                        </h3>

                                    </div>


                                    <div className="candidate-video-team-grid">

                                        <div className="candidate-video-team-card">

                                            <div className="candidate-video-team-avatar">

                                                {getInitials(
                                                    getPersonName(
                                                        selectedInterview.assignedHR
                                                    )
                                                )}

                                            </div>

                                            <div>

                                                <span>
                                                    HR Contact
                                                </span>

                                                <strong>
                                                    {getPersonName(
                                                        selectedInterview.assignedHR
                                                    )}
                                                </strong>

                                                {selectedInterview.assignedHR?.email && (

                                                    <small>

                                                        <Mail
                                                            size={12}
                                                        />

                                                        {
                                                            selectedInterview.assignedHR.email
                                                        }

                                                    </small>

                                                )}

                                            </div>

                                        </div>


                                        <div className="candidate-video-team-card">

                                            <div className="candidate-video-team-avatar">

                                                {getInitials(
                                                    getPersonName(
                                                        selectedInterview.assignedEmployee
                                                    )
                                                )}

                                            </div>

                                            <div>

                                                <span>
                                                    Interviewer
                                                </span>

                                                <strong>
                                                    {getPersonName(
                                                        selectedInterview.assignedEmployee
                                                    )}
                                                </strong>

                                                {selectedInterview.assignedEmployee?.email && (

                                                    <small>

                                                        <Mail
                                                            size={12}
                                                        />

                                                        {
                                                            selectedInterview.assignedEmployee.email
                                                        }

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* NOTES */}

                                {selectedInterview.meetingNotes && (

                                    <div className="candidate-video-detail-section">

                                        <div className="candidate-video-section-title">

                                            <FileText
                                                size={18}
                                            />

                                            <h3>
                                                Interview Notes
                                            </h3>

                                        </div>

                                        <div className="candidate-video-notes">

                                            {
                                                selectedInterview.meetingNotes
                                            }

                                        </div>

                                    </div>

                                )}


                                {/* JOIN */}

                                {selectedInterview.status ===
                                    "SentToCandidate" && (

                                    <div className="candidate-video-modal-join-area">

                                        {isMeetingPast(
                                            selectedInterview
                                        ) ? (

                                            <div className="candidate-video-past-message">

                                                <CircleAlert
                                                    size={18}
                                                />

                                                The scheduled interview
                                                time has passed.

                                            </div>

                                        ) : selectedInterview.meetingLink ? (

                                            <button
                                                type="button"
                                                className="candidate-video-modal-join"
                                                onClick={() =>
                                                    joinMeeting(
                                                        selectedInterview
                                                    )
                                                }
                                            >

                                                <Video
                                                    size={19}
                                                />

                                                Join Video Interview

                                                <ExternalLink
                                                    size={16}
                                                />

                                            </button>

                                        ) : (

                                            <div className="candidate-video-past-message">

                                                <CircleAlert
                                                    size={18}
                                                />

                                                Meeting link is not available yet.

                                            </div>

                                        )}

                                    </div>

                                )}


                                {selectedInterview.status ===
                                    "Completed" && (

                                    <div className="candidate-video-completed-message">

                                        <CheckCircle2
                                            size={19}
                                        />

                                        This video interview has been
                                        completed.

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

};


export default CandidateVideoInterviews;