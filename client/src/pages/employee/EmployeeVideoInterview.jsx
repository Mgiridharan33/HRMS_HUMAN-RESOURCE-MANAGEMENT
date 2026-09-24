import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Video,
    CalendarDays,
    Clock3,
    UserRound,
    BriefcaseBusiness,
    ExternalLink,
    X,
    CheckCircle2,
    AlertCircle,
    Send,
} from "lucide-react";

import {
    getEmployeeVideoInterviews,
    scheduleVideoInterview,
    updateVideoInterviewSchedule,
    completeVideoInterview,
} from "../../services/EmployeeVideoInterviewApi";

import "./EmployeeVideoInterview.css";


const DEFAULT_FORM = {

    scheduledDate: "",

    startTime: "",

    endTime: "",

    meetingLink: "",

    meetingPlatform: "Google Meet",

    meetingNotes: "",

};


const EmployeeVideoInterview = () => {

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
        showModal,
        setShowModal,
    ] = useState(false);


    const [
        form,
        setForm,
    ] = useState(
        DEFAULT_FORM
    );


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        showReviewModal,
        setShowReviewModal,
    ] = useState(false);


    const [
        reviewForm,
        setReviewForm,
    ] = useState({
        employeeReview: "",
        performanceRating: "",
        employeeRecommendation: "",
    });


    const [
        submittingReview,
        setSubmittingReview,
    ] = useState(false);


    // ========================================================
    // LOAD
    // ========================================================

    const loadInterviews =
        useCallback(
            async (
                showLoading = true
            ) => {

                try {

                    if (
                        showLoading
                    ) {

                        setLoading(true);

                    } else {

                        setRefreshing(true);

                    }


                    setError("");


                    const response =
                        await getEmployeeVideoInterviews();


                    setInterviews(
                        Array.isArray(
                            response?.interviews
                        )
                            ? response.interviews
                            : []
                    );

                } catch (error) {

                    console.error(
                        "EMPLOYEE VIDEO INTERVIEW LOAD ERROR:",
                        error
                    );


                    setError(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Failed to load video interviews"
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);

                }

            },
            []
        );


    useEffect(() => {

        loadInterviews();

    }, [
        loadInterviews,
    ]);


    // ========================================================
    // FILTER
    // ========================================================

    const filteredInterviews =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            return interviews.filter(
                interview => {

                    const candidate =
                        interview.candidate;


                    const job =
                        interview.job;


                    const candidateName =
                        candidate?.name ||
                        [
                            candidate?.firstName,
                            candidate?.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ");


                    const matchesSearch =
                        !keyword ||
                        candidateName
                            .toLowerCase()
                            .includes(keyword) ||
                        candidate?.email
                            ?.toLowerCase()
                            .includes(keyword) ||
                        job?.title
                            ?.toLowerCase()
                            .includes(keyword);


                    const matchesStatus =
                        statusFilter === "All" ||
                        interview.status ===
                            statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            interviews,
            search,
            statusFilter,
        ]);


    // ========================================================
    // OPEN SCHEDULE
    // ========================================================

    const openSchedule =
        (interview) => {

            setSelectedInterview(
                interview
            );


            setForm({

                scheduledDate:
                    interview.scheduledDate
                        ? new Date(
                            interview.scheduledDate
                        )
                            .toISOString()
                            .split("T")[0]
                        : "",

                startTime:
                    interview.startTime ||
                    "",

                endTime:
                    interview.endTime ||
                    "",

                meetingLink:
                    interview.meetingLink ||
                    "",

                meetingPlatform:
                    interview.meetingPlatform ||
                    "Google Meet",

                meetingNotes:
                    interview.meetingNotes ||
                    "",

            });


            setShowModal(true);

        };


    // ========================================================
    // CLOSE
    // ========================================================

    const closeModal =
        () => {

            if (saving) {

                return;

            }


            setShowModal(false);

            setSelectedInterview(null);

            setForm(
                DEFAULT_FORM
            );

        };


    // ========================================================
    // FORM
    // ========================================================

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setForm(
                previous => ({

                    ...previous,

                    [name]:
                        value,

                })
            );

        };


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !selectedInterview?._id
            ) {

                return;

            }


            if (
                !form.scheduledDate ||
                !form.startTime ||
                !form.endTime
            ) {

                alert(
                    "Please select date, start time and end time."
                );

                return;

            }


            if (
                !form.meetingLink.trim()
            ) {

                alert(
                    "Please enter the meeting link."
                );

                return;

            }


            if (
                form.endTime <=
                form.startTime
            ) {

                alert(
                    "End time must be after start time."
                );

                return;

            }


            try {

                setSaving(true);


                const isUpdate =
                    [
                        "SchedulePendingApproval",
                        "ScheduleRejected",
                    ].includes(
                        selectedInterview.status
                    );


                let response;


                if (
                    isUpdate
                ) {

                    response =
                        await updateVideoInterviewSchedule({

                            interviewId:
                                selectedInterview._id,

                            ...form,

                        });

                } else {

                    response =
                        await scheduleVideoInterview({

                            interviewId:
                                selectedInterview._id,

                            ...form,

                        });

                }


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        "Failed to submit schedule"
                    );

                }


                setShowModal(false);

                setSelectedInterview(null);


                await loadInterviews(
                    false
                );


                alert(
                    "Interview schedule submitted to admin for approval."
                );

            } catch (error) {

                console.error(
                    "SCHEDULE VIDEO INTERVIEW ERROR:",
                    error
                );


                alert(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to schedule interview"
                );

            } finally {

                setSaving(false);

            }

        };


    const openReview = (
        interview
    ) => {

        setSelectedInterview(interview);

        setReviewForm({
            employeeReview: interview.employeeReview || "",
            performanceRating: interview.performanceRating || "",
            employeeRecommendation:
                interview.employeeRecommendation || "",
        });

        setShowReviewModal(true);

    };


    const closeReview = () => {

        if (submittingReview) {
            return;
        }

        setShowReviewModal(false);
        setSelectedInterview(null);

    };


    const handleComplete = async (
        event
    ) => {

        event.preventDefault();

        if (!selectedInterview?._id) {
            return;
        }

        if (!reviewForm.employeeReview.trim()) {
            alert("Please enter the candidate performance review.");
            return;
        }

        try {

            setSubmittingReview(true);

            const response = await completeVideoInterview({
                interviewId: selectedInterview._id,
                ...reviewForm,
            });

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    "Failed to complete interview"
                );
            }

            setShowReviewModal(false);
            setSelectedInterview(null);
            await loadInterviews(false);
            alert("Interview completed and review sent to HR and Admin.");

        } catch (requestError) {

            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to submit interview review"
            );

        } finally {

            setSubmittingReview(false);

        }

    };


    // ========================================================
    // NAME
    // ========================================================

    const getCandidateName =
        (candidate) => {

            return (
                candidate?.name ||
                [
                    candidate?.firstName,
                    candidate?.lastName,
                ]
                    .filter(Boolean)
                    .join(" ") ||
                "Candidate"
            );

        };


    // ========================================================
    // STATUS LABEL
    // ========================================================

    const getStatusLabel =
        (status) => {

            const labels = {

                PendingSchedule:
                    "Pending Schedule",

                SchedulePendingApproval:
                    "Waiting for Admin",

                ScheduleApproved:
                    "Schedule Approved",

                ScheduleRejected:
                    "Schedule Rejected",

                SentToHR:
                    "Sent to HR",

                SentToCandidate:
                    "Sent to Candidate",

                MeetingStarted:
                    "Meeting Started",

                Completed:
                    "Completed",

                Cancelled:
                    "Cancelled",

            };


            return (
                labels[status] ||
                status ||
                "Unknown"
            );

        };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="employee-video-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-video-header">

                <div>

                    <span className="employee-video-eyebrow">

                        VIDEO INTERVIEW

                    </span>


                    <h1>

                        Interview Meetings

                    </h1>


                    <p>

                        Schedule video interviews assigned to you
                        and submit them to Admin for approval.

                    </p>

                </div>


                <button
                    className="employee-video-refresh"
                    onClick={() =>
                        loadInterviews(false)
                    }
                    disabled={
                        refreshing
                    }
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "employee-video-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="employee-video-error">

                    <AlertCircle
                        size={18}
                    />

                    {error}

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="employee-video-summary">

                <div>

                    <span>
                        Total Assigned
                    </span>

                    <strong>
                        {interviews.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Pending Schedule
                    </span>

                    <strong>
                        {
                            interviews.filter(
                                item =>
                                    item.status ===
                                    "PendingSchedule"
                            ).length
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Waiting Approval
                    </span>

                    <strong>
                        {
                            interviews.filter(
                                item =>
                                    item.status ===
                                    "SchedulePendingApproval"
                            ).length
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Approved
                    </span>

                    <strong>
                        {
                            interviews.filter(
                                item =>
                                    item.status ===
                                    "ScheduleApproved"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="employee-video-toolbar">

                <div className="employee-video-search">

                    <Search
                        size={17}
                    />

                    <input
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search candidate or job..."
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={event =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="All">
                        All Status
                    </option>

                    <option value="PendingSchedule">
                        Pending Schedule
                    </option>

                    <option value="SchedulePendingApproval">
                        Waiting Approval
                    </option>

                    <option value="ScheduleApproved">
                        Approved
                    </option>

                    <option value="ScheduleRejected">
                        Rejected
                    </option>

                    <option value="SentToHR">
                        Sent To HR
                    </option>

                    <option value="SentToCandidate">
                        Sent To Candidate
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="employee-video-card">

                {loading ? (

                    <div className="employee-video-loading">

                        <RefreshCw
                            size={25}
                            className="employee-video-spin"
                        />

                        <p>
                            Loading assigned interviews...
                        </p>

                    </div>

                ) : filteredInterviews.length === 0 ? (

                    <div className="employee-video-empty">

                        <div>

                            <Video
                                size={30}
                            />

                        </div>

                        <h3>
                            No video interviews
                        </h3>

                        <p>
                            No interviews are currently assigned to you.
                        </p>

                    </div>

                ) : (

                    <div className="employee-video-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        CANDIDATE
                                    </th>

                                    <th>
                                        JOB
                                    </th>

                                    <th>
                                        HR
                                    </th>

                                    <th>
                                        SCHEDULE
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredInterviews.map(
                                    interview => {

                                        const candidate =
                                            interview.candidate;

                                        const candidateName =
                                            getCandidateName(
                                                candidate
                                            );


                                        return (

                                            <tr
                                                key={
                                                    interview._id
                                                }
                                            >

                                                <td>

                                                    <div className="employee-video-candidate">

                                                        <div className="employee-video-avatar">

                                                            {candidate?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        candidate.profileImage
                                                                    }
                                                                    alt={
                                                                        candidateName
                                                                    }
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
                                                                    candidateName
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    candidate?.email ||
                                                                    "No email"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="employee-video-job">

                                                        <BriefcaseBusiness
                                                            size={15}
                                                        />

                                                        <span>
                                                            {
                                                                interview.job?.title ||
                                                                "Job"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="employee-video-hr">

                                                        {interview.assignedHR?.name ||
                                                            "HR"}

                                                    </div>

                                                </td>


                                                <td>

                                                    {interview.scheduledDate ? (

                                                        <div className="employee-video-schedule">

                                                            <span>

                                                                <CalendarDays
                                                                    size={13}
                                                                />

                                                                {new Date(
                                                                    interview.scheduledDate
                                                                ).toLocaleDateString(
                                                                    "en-IN"
                                                                )}

                                                            </span>


                                                            <span>

                                                                <Clock3
                                                                    size={13}
                                                                />

                                                                {
                                                                    interview.startTime
                                                                }

                                                                {" - "}

                                                                {
                                                                    interview.endTime
                                                                }

                                                            </span>

                                                        </div>

                                                    ) : (

                                                        <span className="employee-video-not-scheduled">

                                                            Not scheduled

                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `employee-video-status ${String(
                                                                interview.status ||
                                                                ""
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /[^a-z0-9]+/g,
                                                                    "-"
                                                                )}`
                                                        }
                                                    >

                                                        {
                                                            getStatusLabel(
                                                                interview.status
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {[
                                                        "PendingSchedule",
                                                        "ScheduleRejected",
                                                        "SchedulePendingApproval",
                                                    ].includes(
                                                        interview.status
                                                    ) ? (

                                                        <button
                                                            className="employee-video-action"
                                                            onClick={() =>
                                                                openSchedule(
                                                                    interview
                                                                )
                                                            }
                                                        >

                                                            <CalendarDays
                                                                size={15}
                                                            />

                                                            {
                                                                interview.status ===
                                                                "PendingSchedule"
                                                                    ? "Schedule"
                                                                    : "Update"
                                                            }

                                                        </button>

                                                    ) : interview.status ===
                                                        "SentToCandidate" ? (

                                                        <div className="employee-video-actions">

                                                            {interview.meetingLink && (

                                                                <a
                                                                    className="employee-video-action employee-video-join"
                                                                    href={
                                                                        interview.meetingLink
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >

                                                                    <ExternalLink
                                                                        size={15}
                                                                    />

                                                                    Join Meet

                                                                </a>

                                                            )}

                                                            <button
                                                                className="employee-video-action"
                                                                onClick={() =>
                                                                    openReview(
                                                                        interview
                                                                    )
                                                                }
                                                            >

                                                                <CheckCircle2
                                                                    size={15}
                                                                />

                                                                Complete & Review

                                                            </button>

                                                        </div>

                                                    ) : interview.meetingLink ? (

                                                        <a
                                                            className="employee-video-action"
                                                            href={
                                                                interview.meetingLink
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >

                                                            <ExternalLink
                                                                size={15}
                                                            />

                                                            Open Meeting

                                                        </a>

                                                    ) : (

                                                        <span className="employee-video-muted">

                                                            No action

                                                        </span>

                                                    )}

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


            {/* =================================================
                SCHEDULE MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="employee-video-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="employee-video-modal">

                        <div className="employee-video-modal-header">

                            <div>

                                <span>
                                    VIDEO INTERVIEW
                                </span>

                                <h2>
                                    Schedule Interview
                                </h2>

                                <p>
                                    Create the meeting schedule and submit it
                                    to Admin for approval.
                                </p>

                            </div>


                            <button
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="employee-video-modal-body">

                                {/* Candidate */}

                                <div className="employee-video-candidate-box">

                                    <div className="employee-video-avatar">

                                        <UserRound
                                            size={20}
                                        />

                                    </div>


                                    <div>

                                        <strong>

                                            {
                                                getCandidateName(
                                                    selectedInterview?.candidate
                                                )
                                            }

                                        </strong>

                                        <span>

                                            {
                                                selectedInterview?.candidate?.email ||
                                                "Candidate"
                                            }

                                        </span>

                                    </div>

                                </div>


                                {/* Date */}

                                <div className="employee-video-form-grid">

                                    <label>

                                        Interview Date

                                        <div className="employee-video-input">

                                            <CalendarDays
                                                size={16}
                                            />

                                            <input
                                                type="date"
                                                name="scheduledDate"
                                                value={
                                                    form.scheduledDate
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                    </label>


                                    <label>

                                        Start Time

                                        <div className="employee-video-input">

                                            <Clock3
                                                size={16}
                                            />

                                            <input
                                                type="time"
                                                name="startTime"
                                                value={
                                                    form.startTime
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                    </label>


                                    <label>

                                        End Time

                                        <div className="employee-video-input">

                                            <Clock3
                                                size={16}
                                            />

                                            <input
                                                type="time"
                                                name="endTime"
                                                value={
                                                    form.endTime
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>

                                    </label>

                                </div>


                                {/* Platform */}

                                <label className="employee-video-form-label">

                                    Meeting Platform

                                    <select
                                        name="meetingPlatform"
                                        value={
                                            form.meetingPlatform
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option>
                                            Google Meet
                                        </option>

                                        <option>
                                            Microsoft Teams
                                        </option>

                                        <option>
                                            Zoom
                                        </option>

                                        <option>
                                            Other
                                        </option>

                                    </select>

                                </label>


                                {/* Link */}

                                <label className="employee-video-form-label">

                                    Meeting Link

                                    <div className="employee-video-input">

                                        <Video
                                            size={16}
                                        />

                                        <input
                                            type="url"
                                            name="meetingLink"
                                            value={
                                                form.meetingLink
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="https://meet.google.com/..."
                                            required
                                        />

                                    </div>

                                </label>


                                {/* Notes */}

                                <label className="employee-video-form-label">

                                    Interview Notes

                                    <textarea
                                        name="meetingNotes"
                                        value={
                                            form.meetingNotes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional instructions or notes for the interview..."
                                        rows={4}
                                    />

                                </label>


                                <div className="employee-video-info-box">

                                    <AlertCircle
                                        size={17}
                                    />

                                    <span>
                                        After submission, the schedule will
                                        remain hidden from the candidate until
                                        Admin approves it and sends it to HR.
                                    </span>

                                </div>

                            </div>


                            <div className="employee-video-modal-footer">

                                <button
                                    type="button"
                                    className="employee-video-cancel"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="employee-video-submit"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <RefreshCw
                                            size={16}
                                            className="employee-video-spin"
                                        />

                                    ) : (

                                        <Send
                                            size={16}
                                        />

                                    )}

                                    {saving
                                        ? "Submitting..."
                                        : "Submit for Approval"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {showReviewModal && selectedInterview && (

                <div
                    className="employee-video-modal-overlay"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            closeReview();
                        }
                    }}
                >

                    <div className="employee-video-modal">

                        <div className="employee-video-modal-header">

                            <div>
                                <span>VIDEO INTERVIEW REVIEW</span>
                                <h2>
                                    {getCandidateName(
                                        selectedInterview.candidate
                                    )}
                                </h2>
                                <p>
                                    Record the candidate performance and send
                                    your review to HR and Admin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeReview}
                                disabled={submittingReview}
                                aria-label="Close review"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form onSubmit={handleComplete}>

                            <div className="employee-video-modal-body">

                                <label className="employee-video-form-label">
                                    Performance Rating

                                    <select
                                        value={reviewForm.performanceRating}
                                        onChange={event =>
                                            setReviewForm(previous => ({
                                                ...previous,
                                                performanceRating:
                                                    event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">
                                            Select rating
                                        </option>
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Good</option>
                                        <option value="3">3 - Average</option>
                                        <option value="2">2 - Below Average</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </label>

                                <label className="employee-video-form-label">
                                    Recommendation

                                    <select
                                        value={reviewForm.employeeRecommendation}
                                        onChange={event =>
                                            setReviewForm(previous => ({
                                                ...previous,
                                                employeeRecommendation:
                                                    event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">
                                            Select recommendation
                                        </option>
                                        <option value="Strongly Recommend">
                                            Strongly Recommend
                                        </option>
                                        <option value="Recommend">Recommend</option>
                                        <option value="Hold">Hold</option>
                                        <option value="Do Not Recommend">
                                            Do Not Recommend
                                        </option>
                                    </select>
                                </label>

                                <label className="employee-video-form-label">
                                    Candidate Performance Review

                                    <textarea
                                        value={reviewForm.employeeReview}
                                        onChange={event =>
                                            setReviewForm(previous => ({
                                                ...previous,
                                                employeeReview:
                                                    event.target.value,
                                            }))
                                        }
                                        placeholder="Describe communication, technical ability, strengths, concerns, and overall performance..."
                                        rows={7}
                                        required
                                    />
                                </label>

                            </div>

                            <div className="employee-video-modal-footer">

                                <button
                                    type="button"
                                    className="employee-video-cancel"
                                    onClick={closeReview}
                                    disabled={submittingReview}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="employee-video-submit"
                                    disabled={submittingReview}
                                >
                                    {submittingReview
                                        ? "Sending Review..."
                                        : "Complete & Send Review"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


export default EmployeeVideoInterview;