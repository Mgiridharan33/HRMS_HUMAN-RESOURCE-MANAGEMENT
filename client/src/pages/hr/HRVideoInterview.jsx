
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Eye,
    X,
    UserRound,
    Mail,
    Phone,
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    Video,
    ExternalLink,
    Send,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Copy,
    Check,
    FileText,
    ChevronDown,
} from "lucide-react";

import {
    getHRVideoInterviews,
    sendVideoInterviewToCandidate,
    cancelHRVideoInterview,
    associateHRVideoInterviewRecording,
} from "../../services/hrVideoInterviewApi";

import "./HRVideoInterview.css";
import { useAppPrompt } from "../../components/common/useAppPrompt";



/*
===========================================================
HELPERS
===========================================================
*/

const getId =
    (value) => {

        if (!value) {
            return "";
        }

        if (
            typeof value === "string"
        ) {
            return value;
        }

        return (
            value._id ||
            value.id ||
            ""
        );

    };



const getCandidateName =
    (candidate) => {

        if (!candidate) {
            return "Unknown Candidate";
        }

        if (
            candidate.name &&
            String(candidate.name).trim()
        ) {
            return candidate.name;
        }

        const fullName =
            [
                candidate.firstName,
                candidate.lastName,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();

        return (
            fullName ||
            "Unknown Candidate"
        );

    };



const getEmployeeName =
    (employee) => {

        if (!employee) {
            return "Not assigned";
        }

        if (
            employee.name &&
            String(employee.name).trim()
        ) {
            return employee.name;
        }

        return (
            [
                employee.firstName,
                employee.lastName,
            ]
                .filter(Boolean)
                .join(" ")
                .trim() ||
            "Assigned Employee"
        );

    };



const getJobTitle =
    (job) => {

        if (!job) {
            return "Job not available";
        }

        return (
            job.title ||
            job.designation ||
            "Job position"
        );

    };



const formatDate =
    (value) => {

        if (!value) {
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
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };



const formatDateTime =
    (value) => {

        if (!value) {
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

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };



const getTimeRange =
    (interview) => {

        const start =
            interview?.startTime ||
            "";

        const end =
            interview?.endTime ||
            "";

        if (
            start &&
            end
        ) {
            return `${start} - ${end}`;
        }

        if (start) {
            return start;
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
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );

            }

        }

        return "Time not available";

    };

const getStatusLabel =
    (status) => {

        const map = {

            Approved:
                "Approved",

            ScheduleApproved:
                "Approved",

            SentToHR:
                "Ready to Send",

            SentToCandidate:
                "Sent to Candidate",

            Completed:
                "Completed",

            SchedulePendingApproval:
                "Waiting for Admin",

            ScheduleRejected:
                "Schedule Rejected",

            Cancelled:
                "Cancelled",

            Rejected:
                "Rejected",

        };

        return (
            map[status] ||
            status ||
            "Unknown"
        );

    };



const getStatusClass =
    (status) => {

        if (
            [
                "Approved",
                "ScheduleApproved",
                "SentToHR",
            ].includes(status)
        ) {
            return "hr-video-status-ready";
        }

        if (
            status ===
            "SentToCandidate"
        ) {
            return "hr-video-status-sent";
        }

        if (
            status ===
            "Completed"
        ) {
            return "hr-video-status-completed";
        }

        if (
            [
                "ScheduleRejected",
                "Rejected",
                "Cancelled",
            ].includes(status)
        ) {
            return "hr-video-status-danger";
        }

        return "hr-video-status-pending";

    };



const getErrorMessage =
    (error) => {

        return (
            error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
        );

    };



/*
===========================================================
MAIN COMPONENT
===========================================================
*/

export default function HRVideoInterview() {

    const prompt = useAppPrompt();

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
        statusFilter,
        setStatusFilter,
    ] = useState("All");


    const [
        selectedInterview,
        setSelectedInterview,
    ] = useState(null);


    const [
        showDetails,
        setShowDetails,
    ] = useState(false);


    const [
        sendingId,
        setSendingId,
    ] = useState(null);


    const [
        cancellingId,
        setCancellingId,
    ] = useState(null);


    const [
        copied,
        setCopied,
    ] = useState(false);


    const [
        cancelModal,
        setCancelModal,
    ] = useState(false);


    const [
        cancelReason,
        setCancelReason,
    ] = useState("");



    /*
    =========================================================
    LOAD DATA
    =========================================================
    */

    const loadInterviews =
        useCallback(
            async (
                isRefresh = false
            ) => {

                try {

                    if (
                        isRefresh
                    ) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");

                    const data =
                        await getHRVideoInterviews();

                    const list =
                        Array.isArray(
                            data?.interviews
                        )
                            ? data.interviews
                            : [];

                    setInterviews(
                        list
                    );

                } catch (err) {

                    console.error(
                        "HR VIDEO INTERVIEW LOAD ERROR:",
                        err
                    );

                    setError(
                        getErrorMessage(
                            err
                        )
                    );

                    setInterviews([]);

                } finally {

                    setLoading(false);
                    setRefreshing(false);

                }

            },
            []
        );



    useEffect(
        () => {

            loadInterviews();

        },
        [
            loadInterviews,
        ]
    );



    /*
    =========================================================
    STATUS COUNTS
    =========================================================
    */

    const counts =
        useMemo(
            () => {

                const ready =
                    interviews.filter(
                        (item) =>
                            [
                                "Approved",
                                "ScheduleApproved",
                                "SentToHR",
                            ].includes(
                                item.status
                            )
                    ).length;


                const sent =
                    interviews.filter(
                        (item) =>
                            item.status ===
                            "SentToCandidate"
                    ).length;


                const completed =
                    interviews.filter(
                        (item) =>
                            item.status ===
                            "Completed"
                    ).length;


                return {
                    total:
                        interviews.length,
                    ready,
                    sent,
                    completed,
                };

            },
            [
                interviews,
            ]
        );



    /*
    =========================================================
    FILTER
    =========================================================
    */

    const filteredInterviews =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return interviews.filter(
                    (interview) => {

                        const candidate =
                            getCandidateName(
                                interview.candidate
                            )
                                .toLowerCase();


                        const email =
                            String(
                                interview
                                    ?.candidate
                                    ?.email ||
                                ""
                            )
                                .toLowerCase();


                        const job =
                            getJobTitle(
                                interview.job
                            )
                                .toLowerCase();


                        const employee =
                            getEmployeeName(
                                interview.assignedEmployee
                            )
                                .toLowerCase();


                        const status =
                            String(
                                interview.status ||
                                ""
                            )
                                .toLowerCase();


                        const matchesSearch =
                            !query ||
                            candidate.includes(
                                query
                            ) ||
                            email.includes(
                                query
                            ) ||
                            job.includes(
                                query
                            ) ||
                            employee.includes(
                                query
                            ) ||
                            status.includes(
                                query
                            );


                        let matchesStatus =
                            true;


                        if (
                            statusFilter ===
                            "Ready"
                        ) {

                            matchesStatus =
                                [
                                    "Approved",
                                    "ScheduleApproved",
                                    "SentToHR",
                                ].includes(
                                    interview.status
                                );

                        } else if (
                            statusFilter !==
                            "All"
                        ) {

                            matchesStatus =
                                interview.status ===
                                statusFilter;

                        }


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            },
            [
                interviews,
                search,
                statusFilter,
            ]
        );



    /*
    =========================================================
    OPEN DETAILS
    =========================================================
    */

    const openDetails =
        (interview) => {

            setSelectedInterview(
                interview
            );

            setShowDetails(
                true
            );

            setCopied(false);

        };



    const closeDetails =
        () => {

            setShowDetails(
                false
            );

            setSelectedInterview(
                null
            );

            setCopied(false);

        };



    /*
    =========================================================
    SEND TO CANDIDATE
    =========================================================
    */

    const handleSend =
        async (
            interview
        ) => {

            const id =
                getId(
                    interview
                );

            if (!id) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Send the video interview invitation to ${getCandidateName(
                        interview.candidate
                    )}?`
                );

            if (!confirmed) {
                return;
            }

            try {

                setSendingId(id);
                setError("");

                const data =
                    await sendVideoInterviewToCandidate(
                        id
                    );


                const updated =
                    data?.interview;


                if (
                    updated
                ) {

                    setInterviews(
                        (current) =>
                            current.map(
                                (item) =>
                                    getId(item) ===
                                    id
                                        ? updated
                                        : item
                            )
                    );


                    if (
                        selectedInterview &&
                        getId(
                            selectedInterview
                        ) === id
                    ) {

                        setSelectedInterview(
                            updated
                        );

                    }

                } else {

                    await loadInterviews(
                        true
                    );

                }

            } catch (err) {

                console.error(
                    "SEND VIDEO INTERVIEW ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err
                    )
                );

            } finally {

                setSendingId(
                    null
                );

            }

        };


    const handleAssociateRecording = async () => {

        if (!selectedInterview) {
            return;
        }

        const recordingUrl = await prompt({
            title: "Associate meeting recording",
            message: "Paste the Google Meet recording URL, or clear the field to remove it.",
            label: "Recording URL",
            defaultValue: selectedInterview.recordingUrl || "",
            placeholder: "https://meet.google.com/...",
            inputType: "url",
            submitLabel: "Save recording",
        });

        if (recordingUrl === null) {
            return;
        }

        try {

            const data =
                await associateHRVideoInterviewRecording(
                    getId(selectedInterview),
                    recordingUrl.trim()
                );

            if (data?.interview) {
                setSelectedInterview(data.interview);
                setInterviews(current =>
                    current.map(item =>
                        getId(item) === getId(data.interview)
                            ? data.interview
                            : item
                    )
                );
            }

        } catch (err) {

            setError(getErrorMessage(err));

        }

    };



    /*
    =========================================================
    CANCEL
    =========================================================
    */

    const openCancelModal =
        (interview) => {

            setSelectedInterview(
                interview
            );

            setCancelReason("");

            setCancelModal(
                true
            );

        };



    const closeCancelModal =
        () => {

            setCancelModal(
                false
            );

            setCancelReason("");

        };



    const handleCancel =
        async () => {

            if (
                !selectedInterview
            ) {
                return;
            }

            const id =
                getId(
                    selectedInterview
                );

            if (!id) {
                return;
            }

            try {

                setCancellingId(
                    id
                );

                setError("");

                const data =
                    await cancelHRVideoInterview(
                        id,
                        cancelReason
                    );


                const updated =
                    data?.interview;


                if (
                    updated
                ) {

                    setInterviews(
                        (current) =>
                            current.map(
                                (item) =>
                                    getId(item) ===
                                    id
                                        ? updated
                                        : item
                            )
                    );

                } else {

                    await loadInterviews(
                        true
                    );

                }

                closeCancelModal();

                closeDetails();

            } catch (err) {

                console.error(
                    "CANCEL VIDEO INTERVIEW ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err
                    )
                );

            } finally {

                setCancellingId(
                    null
                );

            }

        };



    /*
    =========================================================
    COPY LINK
    =========================================================
    */

    const copyMeetingLink =
        async (
            link
        ) => {

            if (!link) {
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
                    1500
                );

            } catch (err) {

                console.error(
                    "COPY LINK ERROR:",
                    err
                );

            }

        };



    /*
    =========================================================
    LOADING
    =========================================================
    */

    if (
        loading
    ) {

        return (
            <div className="hr-video-page">

                <div className="hr-video-loading">

                    <div className="hr-video-spinner" />

                    <h3>
                        Loading video interviews
                    </h3>

                    <p>
                        Checking admin-approved interview schedules...
                    </p>

                </div>

            </div>
        );

    }



    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <div className="hr-video-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-video-header">

                <div>

                    <div className="hr-video-title-row">

                        <div className="hr-video-title-icon">
                            <Video
                                size={22}
                            />
                        </div>

                        <div>

                            <h1>
                                Video Interviews
                            </h1>

                            <p>
                                Manage admin-approved candidate
                                video interviews
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-video-refresh-btn"
                    onClick={() =>
                        loadInterviews(true)
                    }
                    disabled={
                        refreshing
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "hr-video-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>



            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="hr-video-error">

                    <AlertCircle
                        size={18}
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
                        <X
                            size={16}
                        />
                    </button>

                </div>

            )}



            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hr-video-summary">

                <div className="hr-video-summary-card">

                    <div className="hr-video-summary-icon">
                        <Video
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Total Interviews
                        </span>

                        <strong>
                            {counts.total}
                        </strong>
                    </div>

                </div>


                <div className="hr-video-summary-card ready">

                    <div className="hr-video-summary-icon">
                        <UserCheck
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Ready to Send
                        </span>

                        <strong>
                            {counts.ready}
                        </strong>
                    </div>

                </div>


                <div className="hr-video-summary-card sent">

                    <div className="hr-video-summary-icon">
                        <Send
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Sent to Candidate
                        </span>

                        <strong>
                            {counts.sent}
                        </strong>
                    </div>

                </div>


                <div className="hr-video-summary-card completed">

                    <div className="hr-video-summary-icon">
                        <CheckCircle2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {counts.completed}
                        </strong>
                    </div>

                </div>

            </div>



            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="hr-video-toolbar">

                <div className="hr-video-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search candidate, email, job or employee..."
                        value={
                            search
                        }
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X
                                size={16}
                            />
                        </button>

                    )}

                </div>


                <div className="hr-video-filter">

                    <span>
                        Status
                    </span>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All
                        </option>

                        <option value="Ready">
                            Ready to Send
                        </option>

                        <option value="SentToCandidate">
                            Sent to Candidate
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                    </select>

                    <ChevronDown
                        size={16}
                    />

                </div>

            </div>



            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredInterviews.length === 0 ? (

                <div className="hr-video-empty">

                    <div className="hr-video-empty-icon">
                        <Video
                            size={30}
                        />
                    </div>

                    <h3>
                        No video interviews found
                    </h3>

                    <p>
                        {interviews.length === 0
                            ? "Admin-approved video interview schedules will appear here."
                            : "No interviews match your current search or filter."}
                    </p>

                    {(
                        search ||
                        statusFilter !==
                        "All"
                    ) && (

                        <button
                            type="button"
                            onClick={() => {

                                setSearch("");

                                setStatusFilter(
                                    "All"
                                );

                            }}
                        >
                            Clear Filters
                        </button>

                    )}

                </div>

            ) : (

                /* =================================================
                   TABLE
                ================================================= */

                <div className="hr-video-table-wrapper">

                    <table className="hr-video-table">

                        <thead>

                            <tr>

                                <th>
                                    Candidate
                                </th>

                                <th>
                                    Job
                                </th>

                                <th>
                                    Interviewer
                                </th>

                                <th>
                                    Schedule
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredInterviews.map(
                                (
                                    interview
                                ) => {

                                    const id =
                                        getId(
                                            interview
                                        );


                                    const canSend =
                                        [
                                            "Approved",
                                            "ScheduleApproved",
                                            "SentToHR",
                                        ].includes(
                                            interview.status
                                        );


                                    const completed =
                                        interview.status ===
                                        "Completed";


                                    return (

                                        <tr
                                            key={
                                                id
                                            }
                                        >

                                            {/* Candidate */}

                                            <td>

                                                <div className="hr-video-candidate">

                                                    <div className="hr-video-avatar">

                                                        {interview
                                                            ?.candidate
                                                            ?.profileImage ? (

                                                            <img
                                                                src={
                                                                    interview
                                                                        .candidate
                                                                        .profileImage
                                                                }
                                                                alt=""
                                                            />

                                                        ) : (

                                                            <UserRound
                                                                size={18}
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getCandidateName(
                                                                    interview.candidate
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                interview
                                                                    ?.candidate
                                                                    ?.email ||
                                                                "Email unavailable"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>



                                            {/* Job */}

                                            <td>

                                                <div className="hr-video-job">

                                                    <strong>
                                                        {
                                                            getJobTitle(
                                                                interview.job
                                                            )
                                                        }
                                                    </strong>

                                                    {interview
                                                        ?.job
                                                        ?.department && (

                                                        <span>
                                                            {
                                                                interview
                                                                    .job
                                                                    .department
                                                            }
                                                        </span>

                                                    )}

                                                </div>

                                            </td>



                                            {/* Employee */}

                                            <td>

                                                <div className="hr-video-interviewer">

                                                    <UserCheck
                                                        size={16}
                                                    />

                                                    <div>

                                                        <strong>
                                                            {
                                                                getEmployeeName(
                                                                    interview.assignedEmployee
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            Interview Employee
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>



                                            {/* Schedule */}

                                            <td>

                                                <div className="hr-video-schedule">

                                                    <div>

                                                        <CalendarDays
                                                            size={15}
                                                        />

                                                        <span>
                                                            {
                                                                formatDate(
                                                                    interview.scheduledAt ||
                                                                    interview.scheduledDate
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <Clock3
                                                            size={15}
                                                        />

                                                        <span>
                                                            {
                                                                getTimeRange(
                                                                    interview
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>



                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={`hr-video-status ${getStatusClass(
                                                        interview.status
                                                    )}`}
                                                >

                                                    <span className="hr-video-status-dot" />

                                                    {
                                                        getStatusLabel(
                                                            interview.status
                                                        )
                                                    }

                                                </span>

                                            </td>



                                            {/* Actions */}

                                            <td>

                                                <div className="hr-video-actions">

                                                    <button
                                                        type="button"
                                                        className="hr-video-action view"
                                                        title="View details"
                                                        onClick={() =>
                                                            openDetails(
                                                                interview
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                    </button>


                                                    {canSend && (

                                                        <button
                                                            type="button"
                                                            className="hr-video-action send"
                                                            title="Send to candidate"
                                                            onClick={() =>
                                                                handleSend(
                                                                    interview
                                                                )
                                                            }
                                                            disabled={
                                                                sendingId ===
                                                                id
                                                            }
                                                        >

                                                            {sendingId ===
                                                            id ? (

                                                                <RefreshCw
                                                                    size={16}
                                                                    className="hr-video-spin"
                                                                />

                                                            ) : (

                                                                <Send
                                                                    size={16}
                                                                />

                                                            )}

                                                        </button>

                                                    )}


                                                    {completed && (

                                                        <span className="hr-video-completed-icon">

                                                            <CheckCircle2
                                                                size={18}
                                                            />

                                                        </span>

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



            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {showDetails &&
                selectedInterview && (

                    <div
                        className="hr-video-modal-backdrop"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDetails();
                            }

                        }}
                    >

                        <div className="hr-video-modal">

                            <div className="hr-video-modal-header">

                                <div>

                                    <span>
                                        VIDEO INTERVIEW
                                    </span>

                                    <h2>
                                        Interview Details
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



                            <div className="hr-video-modal-body">

                                {/* Candidate */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <UserRound
                                            size={18}
                                        />

                                        <h3>
                                            Candidate
                                        </h3>

                                    </div>


                                    <div className="hr-video-candidate-detail">

                                        <div className="hr-video-large-avatar">

                                            {selectedInterview
                                                ?.candidate
                                                ?.profileImage ? (

                                                <img
                                                    src={
                                                        selectedInterview
                                                            .candidate
                                                            .profileImage
                                                    }
                                                    alt=""
                                                />

                                            ) : (

                                                <UserRound
                                                    size={28}
                                                />

                                            )}

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    getCandidateName(
                                                        selectedInterview.candidate
                                                    )
                                                }
                                            </h3>

                                            <div>

                                                <Mail
                                                    size={14}
                                                />

                                                <span>
                                                    {
                                                        selectedInterview
                                                            ?.candidate
                                                            ?.email ||
                                                        "Not available"
                                                    }
                                                </span>

                                            </div>


                                            {selectedInterview
                                                ?.candidate
                                                ?.phone && (

                                                <div>

                                                    <Phone
                                                        size={14}
                                                    />

                                                    <span>
                                                        {
                                                            selectedInterview
                                                                .candidate
                                                                .phone
                                                        }
                                                    </span>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </section>



                                {/* Job */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <BriefcaseBusiness
                                            size={18}
                                        />

                                        <h3>
                                            Job Information
                                        </h3>

                                    </div>


                                    <div className="hr-video-info-grid">

                                        <div>

                                            <span>
                                                Position
                                            </span>

                                            <strong>
                                                {
                                                    getJobTitle(
                                                        selectedInterview.job
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
                                                    selectedInterview
                                                        ?.job
                                                        ?.department ||
                                                    "Not available"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Designation
                                            </span>

                                            <strong>
                                                {
                                                    selectedInterview
                                                        ?.job
                                                        ?.designation ||
                                                    "Not available"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>



                                {/* Interviewer */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <UserCheck
                                            size={18}
                                        />

                                        <h3>
                                            Interviewer
                                        </h3>

                                    </div>


                                    <div className="hr-video-person-card">

                                        <div className="hr-video-person-icon">

                                            <UserRound
                                                size={20}
                                            />

                                        </div>


                                        <div>

                                            <strong>
                                                {
                                                    getEmployeeName(
                                                        selectedInterview.assignedEmployee
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    selectedInterview
                                                        ?.assignedEmployee
                                                        ?.email ||
                                                    "Email unavailable"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </section>



                                {/* Schedule */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <CalendarDays
                                            size={18}
                                        />

                                        <h3>
                                            Approved Schedule
                                        </h3>

                                    </div>


                                    <div className="hr-video-info-grid">

                                        <div>

                                            <span>
                                                Date
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedInterview.scheduledAt ||
                                                        selectedInterview.scheduledDate
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Time
                                            </span>

                                            <strong>
                                                {
                                                    getTimeRange(
                                                        selectedInterview
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Platform
                                            </span>

                                            <strong>
                                                {
                                                    selectedInterview
                                                        ?.meetingPlatform ||
                                                    "Google Meet"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>



                                {/* Meeting */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <Video
                                            size={18}
                                        />

                                        <h3>
                                            Meeting
                                        </h3>

                                    </div>


                                    <div className="hr-video-meeting-box">

                                        <div className="hr-video-link-row">

                                            <div className="hr-video-link-icon">

                                                <Video
                                                    size={18}
                                                />

                                            </div>


                                            <div className="hr-video-link-content">

                                                <span>
                                                    Meeting Link
                                                </span>

                                                <strong>
                                                    {
                                                        selectedInterview.meetingLink ||
                                                        "No meeting link"
                                                    }
                                                </strong>

                                            </div>


                                            {selectedInterview.meetingLink && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        copyMeetingLink(
                                                            selectedInterview.meetingLink
                                                        )
                                                    }
                                                    title="Copy meeting link"
                                                >

                                                    {copied ? (

                                                        <Check
                                                            size={17}
                                                        />

                                                    ) : (

                                                        <Copy
                                                            size={17}
                                                        />

                                                    )}

                                                </button>

                                            )}

                                        </div>


                                        {selectedInterview.meetingLink && (

                                            <a
                                                href={
                                                    selectedInterview.meetingLink
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hr-video-open-link"
                                            >

                                                <ExternalLink
                                                    size={16}
                                                />

                                                Open Meeting

                                            </a>

                                        )}

                                    </div>

                                </section>



                                {/* Recording */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <Video
                                            size={18}
                                        />

                                        <h3>
                                            Meeting Recording
                                        </h3>

                                    </div>

                                    {selectedInterview.recordingUrl ? (

                                        <a
                                            href={selectedInterview.recordingUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hr-video-open-link"
                                        >
                                            <ExternalLink size={16} />
                                            Watch Recording
                                        </a>

                                    ) : (

                                        <span>
                                            Recording not associated yet.
                                        </span>

                                    )}

                                    <button
                                        type="button"
                                        className="hr-video-secondary-btn"
                                        onClick={handleAssociateRecording}
                                    >
                                        {selectedInterview.recordingUrl
                                            ? "Replace Recording"
                                            : "Associate Recording"}
                                    </button>

                                </section>


                                {/* Notes */}

                                {selectedInterview
                                    .meetingNotes && (

                                    <section className="hr-video-detail-section">

                                        <div className="hr-video-section-title">

                                            <FileText
                                                size={18}
                                            />

                                            <h3>
                                                Interview Notes
                                            </h3>

                                        </div>


                                        <div className="hr-video-notes">

                                            {
                                                selectedInterview.meetingNotes
                                            }

                                        </div>

                                    </section>

                                )}


                                {selectedInterview.employeeReview && (

                                    <section className="hr-video-detail-section">

                                        <div className="hr-video-section-title">

                                            <CheckCircle2
                                                size={18}
                                            />

                                            <h3>
                                                Employee Feedback
                                            </h3>

                                        </div>

                                        <div className="hr-video-info-grid">

                                            <div>

                                                <span>
                                                    Performance Rating
                                                </span>

                                                <strong>
                                                    {selectedInterview.performanceRating ||
                                                        "Not provided"}
                                                    {selectedInterview.performanceRating
                                                        ? " / 5"
                                                        : ""}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Recommendation
                                                </span>

                                                <strong>
                                                    {selectedInterview.employeeRecommendation ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="hr-video-notes">

                                            {selectedInterview.employeeReview}

                                        </div>

                                    </section>

                                )}



                                {/* Approval */}

                                <section className="hr-video-detail-section">

                                    <div className="hr-video-section-title">

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Approval
                                        </h3>

                                    </div>


                                    <div className="hr-video-approval-box">

                                        <div>

                                            <span>
                                                Schedule Submitted
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedInterview.scheduleSubmittedAt
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Approved
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedInterview.scheduleApprovedAt
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Sent to Candidate
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedInterview.sentToCandidateAt
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>

                            </div>



                            {/* Modal Footer */}

                            <div className="hr-video-modal-footer">

                                <button
                                    type="button"
                                    className="hr-video-secondary-btn"
                                    onClick={
                                        closeDetails
                                    }
                                >
                                    Close
                                </button>


                                {[
                                    "Approved",
                                    "ScheduleApproved",
                                    "SentToHR",
                                ].includes(
                                    selectedInterview.status
                                ) && (

                                    <button
                                        type="button"
                                        className="hr-video-primary-btn"
                                        onClick={() =>
                                            handleSend(
                                                selectedInterview
                                            )
                                        }
                                        disabled={
                                            sendingId ===
                                            getId(
                                                selectedInterview
                                            )
                                        }
                                    >

                                        {sendingId ===
                                        getId(
                                            selectedInterview
                                        ) ? (

                                            <RefreshCw
                                                size={17}
                                                className="hr-video-spin"
                                            />

                                        ) : (

                                            <Send
                                                size={17}
                                            />

                                        )}

                                        Send to Candidate

                                    </button>

                                )}


                                {![
                                    "Completed",
                                    "Cancelled",
                                ].includes(
                                    selectedInterview.status
                                ) && (

                                    <button
                                        type="button"
                                        className="hr-video-danger-btn"
                                        onClick={() =>
                                            openCancelModal(
                                                selectedInterview
                                            )
                                        }
                                    >

                                        Cancel Interview

                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}



            {/* =================================================
                CANCEL MODAL
            ================================================= */}

            {cancelModal &&
                selectedInterview && (

                    <div className="hr-video-confirm-backdrop">

                        <div className="hr-video-confirm-modal">

                            <div className="hr-video-confirm-icon">
                                <AlertCircle
                                    size={24}
                                />
                            </div>

                            <h2>
                                Cancel Interview?
                            </h2>

                            <p>
                                This will cancel the video
                                interview for{" "}
                                <strong>
                                    {
                                        getCandidateName(
                                            selectedInterview.candidate
                                        )
                                    }
                                </strong>
                                .
                            </p>


                            <label>
                                Cancellation Reason
                            </label>

                            <textarea
                                value={
                                    cancelReason
                                }
                                onChange={(event) =>
                                    setCancelReason(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter cancellation reason..."
                                rows={4}
                            />


                            <div className="hr-video-confirm-actions">

                                <button
                                    type="button"
                                    onClick={
                                        closeCancelModal
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                >
                                    Keep Interview
                                </button>


                                <button
                                    type="button"
                                    className="danger"
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        cancellingId !==
                                        null
                                    }
                                >

                                    {cancellingId ? (

                                        <RefreshCw
                                            size={16}
                                            className="hr-video-spin"
                                        />

                                    ) : (

                                        <X
                                            size={16}
                                        />

                                    )}

                                    Cancel Interview

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );

}
