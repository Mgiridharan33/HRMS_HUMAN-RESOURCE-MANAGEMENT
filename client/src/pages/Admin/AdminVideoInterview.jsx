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
    Users,
    UserPlus,
    UserCheck,
    CheckCircle2,
    Clock3,
    AlertCircle,
    Video,
    ExternalLink,
    ChevronDown,
    Award,
    FileText,
    UserCog,
} from "lucide-react";

import {
    getVideoInterviewEmployees,
    getVideoInterviewEligibleApplications,
    assignVideoInterviewEmployee,
    approveVideoInterview,
    rejectVideoInterview,
        associateVideoInterviewRecording,
} from "../../services/videoInterviewApi";

import "../Admin/css/AdminVideoInterview.css";
import { useAppPrompt } from "../../components/common/useAppPrompt";


const DEFAULT_SUMMARY = {
    total: 0,
    unassigned: 0,
    assigned: 0,
    scheduled: 0,
    completed: 0,
};


// =========================================================
// HELPERS
// =========================================================

const getCandidateName = (candidate) => {

    if (!candidate) {
        return "Unknown Candidate";
    }

    if (candidate.name) {
        return candidate.name;
    }

    return [
        candidate.firstName,
        candidate.lastName,
    ]
        .filter(Boolean)
        .join(" ") || "Unknown Candidate";
};


const getEmployeeName = (employee) => {

    if (!employee) {
        return "Unknown Employee";
    }

    if (employee.name) {
        return employee.name;
    }

    return [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ") || "Unknown Employee";
};


const getJobName = (application) => {

    if (!application) {
        return "Unknown Job";
    }

    const job = application.job;

    if (!job) {
        return "Unknown Job";
    }

    if (typeof job === "string") {
        return job;
    }

    return (
        job.title ||
        job.name ||
        "Unknown Job"
    );
};


const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "—";
    }

    return value.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


// =========================================================
// COMPONENT
// =========================================================

const AdminVideoInterview = () => {

    const prompt = useAppPrompt();

    // =====================================================
    // DATA
    // =====================================================

    const [
        applications,
        setApplications,
    ] = useState([]);


    const [
        employees,
        setEmployees,
    ] = useState([]);


    // =====================================================
    // UI
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
        loadingEmployees,
        setLoadingEmployees,
    ] = useState(false);


    const [
        assigning,
        setAssigning,
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


    // =====================================================
    // SELECTED CANDIDATE
    // =====================================================

    const [
        selectedApplication,
        setSelectedApplication,
    ] = useState(null);


    const [
        selectedEmployee,
        setSelectedEmployee,
    ] = useState("");


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications = useCallback(
        async (showLoader = true) => {

            try {

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const response =
                    await getVideoInterviewEligibleApplications();


                setApplications(
                    Array.isArray(
                        response?.applications
                    )
                        ? response.applications
                        : []
                );

            } catch (requestError) {

                console.error(
                    "LOAD VIDEO INTERVIEW APPLICATIONS ERROR:",
                    requestError
                );

                setError(
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Failed to load video interview candidates"
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

        loadApplications();

    }, [
        loadApplications,
    ]);


    // =====================================================
    // LOAD EMPLOYEES
    // =====================================================

    const loadEmployees = async () => {

        try {

            setLoadingEmployees(true);

            const response =
                await getVideoInterviewEmployees();


            setEmployees(
                Array.isArray(
                    response?.employees
                )
                    ? response.employees
                    : []
            );

        } catch (requestError) {

            console.error(
                "LOAD VIDEO INTERVIEW EMPLOYEES ERROR:",
                requestError
            );

            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to load employees"
            );

        } finally {

            setLoadingEmployees(false);

        }

    };


    // =====================================================
    // FILTER APPLICATIONS
    // =====================================================

    const filteredApplications =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return applications.filter(
                item => {

                    const candidateName =
                        getCandidateName(
                            item.candidate
                        ).toLowerCase();


                    const candidateEmail =
                        String(
                            item.candidate?.email ||
                            ""
                        ).toLowerCase();


                    const jobName =
                        getJobName(
                            item.jobApplication
                        ).toLowerCase();


                    const matchesSearch =
                        !searchValue ||
                        candidateName.includes(
                            searchValue
                        ) ||
                        candidateEmail.includes(
                            searchValue
                        ) ||
                        jobName.includes(
                            searchValue
                        );


                    if (!matchesSearch) {
                        return false;
                    }


                    const interview =
                        item.videoInterview;


                    if (
                        statusFilter ===
                        "Unassigned"
                    ) {

                        return !interview;

                    }


                    if (
                        statusFilter ===
                        "Assigned"
                    ) {

                        return (
                            interview &&
                            interview.status ===
                            "PendingSchedule"
                        );

                    }


                    if (
                        statusFilter ===
                        "Scheduled"
                    ) {

                        return (
                            interview &&
                            interview.status ===
                            "Scheduled"
                        );

                    }


                    if (
                        statusFilter ===
                        "Completed"
                    ) {

                        return (
                            interview &&
                            interview.status ===
                            "Completed"
                        );

                    }


                    return true;

                }
            );

        }, [
            applications,
            search,
            statusFilter,
        ]);


    // =====================================================
    // SUMMARY
    // =====================================================

    const summary =
        useMemo(() => {

            const value = {
                ...DEFAULT_SUMMARY,
            };


            value.total =
                applications.length;


            applications.forEach(
                item => {

                    const interview =
                        item.videoInterview;


                    if (!interview) {

                        value.unassigned++;

                        return;

                    }


                    if (
                        interview.status ===
                        "PendingSchedule"
                    ) {

                        value.assigned++;

                    }


                    if (
                        interview.status ===
                        "Scheduled"
                    ) {

                        value.scheduled++;

                    }


                    if (
                        interview.status ===
                        "Completed"
                    ) {

                        value.completed++;

                    }

                }
            );


            return value;

        }, [
            applications,
        ]);


    // =====================================================
    // OPEN ASSIGN MODAL
    // =====================================================

    const openAssignModal = async (
        application
    ) => {

        setSelectedApplication(
            application
        );

        setSelectedEmployee("");

        await loadEmployees();

    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {

        if (assigning) {
            return;
        }

        setSelectedApplication(null);
        setSelectedEmployee("");

    };


    // =====================================================
    // ASSIGN EMPLOYEE
    // =====================================================

    const handleAssignEmployee = async () => {

        if (
            !selectedApplication?._id &&
            !selectedApplication?.jobApplication?._id
        ) {

            alert(
                "Invalid job application"
            );

            return;

        }


        if (!selectedEmployee) {

            alert(
                "Please select an employee"
            );

            return;

        }


        const jobApplicationId =
            selectedApplication.jobApplication?._id ||
            selectedApplication._id;


        const employee =
            employees.find(
                item =>
                    String(item._id) ===
                    String(selectedEmployee)
            );


        if (!employee) {

            alert(
                "Selected employee not found"
            );

            return;

        }


        const candidateName =
            getCandidateName(
                selectedApplication.candidate
            );


        const employeeName =
            getEmployeeName(
                employee
            );


        const confirmed =
            window.confirm(
                `Assign ${employeeName} for the video interview of ${candidateName}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setAssigning(true);


            const response =
                await assignVideoInterviewEmployee({

                    jobApplicationId,

                    employeeId:
                        selectedEmployee,

                });


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to assign employee"
                );

            }


            closeModal();


            await loadApplications(false);


            alert(
                "Employee assigned successfully. The employee can now schedule the interview."
            );

        } catch (requestError) {

            console.error(
                "ASSIGN VIDEO INTERVIEW EMPLOYEE ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to assign employee"
            );

        } finally {

            setAssigning(false);

        }

    };


    // =====================================================
    // APPROVE / REJECT SCHEDULE
    // =====================================================

    const handleApproveSchedule = async (
        interviewId
    ) => {

        if (!window.confirm("Approve this interview schedule and send it to HR?")) {
            return;
        }


        try {

            await approveVideoInterview(interviewId);

            await loadApplications(false);

            alert("Interview schedule approved and sent to HR.");

        } catch (requestError) {

            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to approve interview schedule"
            );

        }

    };


    const handleRejectSchedule = async (
        interviewId
    ) => {

        const rejectionReason = await prompt({
            title: "Reject interview schedule",
            message: "Provide a reason for rejecting this schedule.",
            label: "Rejection reason",
            defaultValue: "Please submit a corrected interview schedule.",
            multiline: true,
            submitLabel: "Reject schedule",
        });


        if (rejectionReason === null) {
            return;
        }


        try {

            await rejectVideoInterview({
                interviewId,
                rejectionReason,
            });

            await loadApplications(false);

            alert("Interview schedule rejected.");

        } catch (requestError) {

            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to reject interview schedule"
            );

        }

    };

        const handleAssociateRecording = async (
            interview
        ) => {

            const recordingUrl = await prompt({
                title: "Associate meeting recording",
                message: "Paste the Google Meet recording URL, or clear the field to remove it.",
                label: "Recording URL",
                defaultValue: interview.recordingUrl || "",
                placeholder: "https://meet.google.com/...",
                inputType: "url",
                submitLabel: "Save recording",
            });

            if (recordingUrl === null) {
                return;
            }

            try {

                await associateVideoInterviewRecording({
                    interviewId: interview._id,
                    recordingUrl: recordingUrl.trim(),
                });

                await loadApplications(false);
                alert(
                    recordingUrl.trim()
                        ? "Recording associated with interview."
                        : "Recording removed from interview."
                );

            } catch (requestError) {

                alert(
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Failed to associate recording"
                );

            }

        };


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        loadApplications(false);

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-video-interview-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="video-interview-page-header">

                <div>

                    <span className="video-interview-eyebrow">
                        RECRUITMENT · VIDEO INTERVIEW
                    </span>

                    <h1>
                        Video Interview Management
                    </h1>

                    <p>
                        Assign an employee to conduct the candidate's
                        video interview after the aptitude test.
                    </p>

                </div>


                <button
                    type="button"
                    className="video-interview-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "video-interview-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="video-interview-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="video-interview-summary-grid">

                <div className="video-interview-summary-card">

                    <div className="video-summary-icon total">

                        <Users
                            size={19}
                        />

                    </div>

                    <span>
                        Aptitude Completed
                    </span>

                    <strong>
                        {summary.total}
                    </strong>

                </div>


                <div className="video-interview-summary-card">

                    <div className="video-summary-icon unassigned">

                        <UserPlus
                            size={19}
                        />

                    </div>

                    <span>
                        Awaiting Assignment
                    </span>

                    <strong>
                        {summary.unassigned}
                    </strong>

                </div>


                <div className="video-interview-summary-card">

                    <div className="video-summary-icon assigned">

                        <UserCheck
                            size={19}
                        />

                    </div>

                    <span>
                        Employee Assigned
                    </span>

                    <strong>
                        {summary.assigned}
                    </strong>

                </div>


                <div className="video-interview-summary-card">

                    <div className="video-summary-icon scheduled">

                        <CalendarDays
                            size={19}
                        />

                    </div>

                    <span>
                        Scheduled
                    </span>

                    <strong>
                        {summary.scheduled}
                    </strong>

                </div>


                <div className="video-interview-summary-card">

                    <div className="video-summary-icon completed">

                        <CheckCircle2
                            size={19}
                        />

                    </div>

                    <span>
                        Completed
                    </span>

                    <strong>
                        {summary.completed}
                    </strong>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="video-interview-toolbar">

                <div className="video-interview-search">

                    <Search
                        size={17}
                    />

                    <input
                        type="text"
                        placeholder="Search candidate, email or job..."
                        value={search}
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
                            aria-label="Clear search"
                        >

                            <X
                                size={15}
                            />

                        </button>

                    )}

                </div>


                <div className="video-interview-filter">

                    <span>
                        Status
                    </span>

                    <div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Unassigned">
                                Awaiting Assignment
                            </option>

                            <option value="Assigned">
                                Employee Assigned
                            </option>

                            <option value="Scheduled">
                                Scheduled
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                        </select>

                        <ChevronDown
                            size={15}
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="video-interview-table-card">

                <div className="video-interview-table-header">

                    <div>

                        <h2>
                            Eligible Candidates
                        </h2>

                        <span>
                            Candidates with completed and published aptitude results
                        </span>

                    </div>

                    <strong>
                        {filteredApplications.length}
                    </strong>

                </div>


                {loading ? (

                    <div className="video-interview-loading">

                        <RefreshCw
                            size={25}
                            className="video-interview-spin"
                        />

                        <p>
                            Loading eligible candidates...
                        </p>

                    </div>

                ) : filteredApplications.length === 0 ? (

                    <div className="video-interview-empty">

                        <div>

                            <Video
                                size={27}
                            />

                        </div>

                        <h3>
                            No candidates found
                        </h3>

                        <p>
                            Candidates will appear here after
                            their aptitude result is published.
                        </p>

                    </div>

                ) : (

                    <div className="video-interview-table-wrapper">

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
                                        APTITUDE RESULT
                                    </th>

                                    <th>
                                        COMPLETED
                                    </th>

                                    <th>
                                        VIDEO INTERVIEW
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredApplications.map(
                                    item => {

                                        const candidate =
                                            item.candidate;


                                        const interview =
                                            item.videoInterview;


                                        const candidateName =
                                            getCandidateName(
                                                candidate
                                            );


                                        const jobName =
                                            getJobName(
                                                item.jobApplication
                                            );


                                        const isAssigned =
                                            Boolean(
                                                interview
                                            );


                                        return (

                                            <tr
                                                key={
                                                    item.jobApplication?._id ||
                                                    item.aptitudeAttempt
                                                }
                                            >

                                                {/* CANDIDATE */}

                                                <td>

                                                    <div className="video-candidate-cell">

                                                        <div className="video-candidate-avatar">

                                                            {candidate?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        candidate.profileImage
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
                                                                {candidateName}
                                                            </strong>

                                                            <span>
                                                                {candidate?.email ||
                                                                    "No email"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* JOB */}

                                                <td>

                                                    <div className="video-job-cell">

                                                        <BriefcaseBusiness
                                                            size={16}
                                                        />

                                                        <div>

                                                            <strong>
                                                                {jobName}
                                                            </strong>

                                                            <span>
                                                                {item.jobApplication?.job?.department ||
                                                                    "—"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* APTITUDE */}

                                                <td>

                                                    <div className="video-result-cell">

                                                        <strong>
                                                            {item.percentage ?? 0}%
                                                        </strong>

                                                        <span>
                                                            {item.correctAnswers ?? 0}
                                                            {" / "}
                                                            {item.totalQuestions ?? 0}
                                                            {" correct"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    <span className="video-date-cell">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {formatDate(
                                                            item.submittedAt
                                                        )}

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {interview ? (

                                                        <div className="video-status-cell">

                                                            <span
                                                                className={
                                                                    `video-status ${String(
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

                                                                {interview.status ===
                                                                    "PendingSchedule"
                                                                    ? "Employee Assigned"
                                                                    : interview.status}

                                                            </span>


                                                            {interview.assignedEmployee && (

                                                                <small>

                                                                    <UserCog
                                                                        size={12}
                                                                    />

                                                                    {getEmployeeName(
                                                                        interview.assignedEmployee
                                                                    )}

                                                                </small>

                                                            )}


                                                            {interview.status ===
                                                                "SchedulePendingApproval" &&
                                                                interview.scheduledDate && (

                                                                <small>

                                                                    <CalendarDays
                                                                        size={12}
                                                                    />

                                                                    {formatDate(
                                                                        interview.scheduledDate
                                                                    )}

                                                                    {interview.startTime
                                                                        ? ` · ${interview.startTime}`
                                                                        : ""}

                                                                </small>

                                                            )}

                                                        </div>

                                                    ) : (

                                                        <span className="video-status unassigned">

                                                            Awaiting Assignment

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    {!isAssigned ? (

                                                        <button
                                                            type="button"
                                                            className="video-assign-button"
                                                            onClick={() =>
                                                                openAssignModal(
                                                                    item
                                                                )
                                                            }
                                                        >

                                                            <UserPlus
                                                                size={15}
                                                            />

                                                            Assign Employee

                                                        </button>

                                                    ) : interview.status ===
                                                        "SchedulePendingApproval" ? (

                                                        <div className="video-interview-action-group">

                                                            <button
                                                                type="button"
                                                                className="video-confirm-assign-button"
                                                                onClick={() =>
                                                                    handleApproveSchedule(
                                                                        interview._id
                                                                    )
                                                                }
                                                            >

                                                                Approve & Send HR

                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="video-cancel-button"
                                                                onClick={() =>
                                                                    handleRejectSchedule(
                                                                        interview._id
                                                                    )
                                                                }
                                                            >

                                                                Reject

                                                            </button>

                                                        </div>

                                                    ) : (

                                                            <div className="video-interview-action-group">

                                                                <button
                                                                    type="button"
                                                                    className="video-view-button"
                                                                    onClick={() => {
                                                                        setSelectedApplication(
                                                                            item
                                                                        );
                                                                        setSelectedEmployee("");
                                                                    }}
                                                                >

                                                                    <Eye
                                                                        size={15}
                                                                    />

                                                                    View

                                                                </button>

                                                                {interview.recordingUrl && (

                                                                    <a
                                                                        className="video-view-button"
                                                                        href={interview.recordingUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >

                                                                        <ExternalLink
                                                                            size={15}
                                                                        />

                                                                        Watch Recording

                                                                    </a>

                                                                )}

                                                            </div>

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
                ASSIGN MODAL
            ================================================= */}

            {selectedApplication && (

                <div
                    className="video-interview-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="video-interview-modal">

                        <div className="video-interview-modal-header">

                            <div>

                                <span>
                                    VIDEO INTERVIEW ASSIGNMENT
                                </span>

                                <h2>
                                    {getCandidateName(
                                        selectedApplication.candidate
                                    )}
                                </h2>

                                <p>
                                    Assign an employee who will conduct
                                    and schedule this interview.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={assigning}
                                aria-label="Close"
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        <div className="video-interview-modal-body">

                            {/* CANDIDATE INFO */}

                            <div className="video-candidate-detail-card">

                                <div className="video-detail-avatar">

                                    {selectedApplication.candidate?.profileImage ? (

                                        <img
                                            src={
                                                selectedApplication
                                                    .candidate
                                                    .profileImage
                                            }
                                            alt=""
                                        />

                                    ) : (

                                        <UserRound
                                            size={25}
                                        />

                                    )}

                                </div>


                                <div className="video-detail-main">

                                    <h3>
                                        {getCandidateName(
                                            selectedApplication.candidate
                                        )}
                                    </h3>

                                    <div className="video-detail-meta">

                                        <span>

                                            <Mail
                                                size={14}
                                            />

                                            {selectedApplication.candidate?.email ||
                                                "No email"}

                                        </span>


                                        <span>

                                            <Phone
                                                size={14}
                                            />

                                            {selectedApplication.candidate?.phone ||
                                                "No phone"}

                                        </span>


                                        <span>

                                            <BriefcaseBusiness
                                                size={14}
                                            />

                                            {getJobName(
                                                selectedApplication.jobApplication
                                            )}

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* APTITUDE RESULT */}

                            <div className="video-aptitude-result-card">

                                <div className="video-result-icon">

                                    <Award
                                        size={21}
                                    />

                                </div>

                                <div>

                                    <span>
                                        APTITUDE RESULT
                                    </span>

                                    <strong>
                                        {selectedApplication.percentage ?? 0}%
                                    </strong>

                                </div>


                                <div className="video-result-stat">

                                    <span>
                                        Correct
                                    </span>

                                    <strong>
                                        {selectedApplication.correctAnswers ?? 0}
                                    </strong>

                                </div>


                                <div className="video-result-stat">

                                    <span>
                                        Wrong
                                    </span>

                                    <strong>
                                        {selectedApplication.wrongAnswers ?? 0}
                                    </strong>

                                </div>


                                <div className="video-result-stat">

                                    <span>
                                        Questions
                                    </span>

                                    <strong>
                                        {selectedApplication.totalQuestions ?? 0}
                                    </strong>

                                </div>

                            </div>


                            {selectedApplication.videoInterview?.employeeReview && (

                                <div className="video-assign-section">

                                    <div className="video-section-heading">

                                        <div className="video-section-heading-icon">

                                            <FileText
                                                size={18}
                                            />

                                        </div>

                                        <div>

                                            <h3>
                                                Employee Feedback
                                            </h3>

                                            <p>
                                                Interview review submitted by the assigned employee.
                                            </p>

                                        </div>

                                    </div>

                                    <div className="video-detail-meta">

                                        <span>
                                            Rating: {
                                                selectedApplication.videoInterview.performanceRating ||
                                                "Not provided"
                                            }
                                            {selectedApplication.videoInterview.performanceRating
                                                ? " / 5"
                                                : ""}
                                        </span>

                                        <span>
                                            Recommendation: {
                                                selectedApplication.videoInterview.employeeRecommendation ||
                                                "Not provided"
                                            }
                                        </span>

                                    </div>

                                    <div className="video-interview-notes">

                                        {selectedApplication.videoInterview.employeeReview}

                                    </div>

                                </div>

                            )}


                            {selectedApplication.videoInterview && (

                                <div className="video-assign-section">

                                    <div className="video-section-heading">

                                        <div className="video-section-heading-icon">

                                            <Video
                                                size={18}
                                            />

                                        </div>

                                        <div>

                                            <h3>
                                                Meeting Recording
                                            </h3>

                                            <p>
                                                Associate the Google Meet recording after the interview.
                                            </p>

                                        </div>

                                    </div>

                                    {selectedApplication.videoInterview.recordingUrl && (

                                        <a
                                            className="video-view-button"
                                            href={selectedApplication.videoInterview.recordingUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink size={15} />
                                            Watch Recording
                                        </a>

                                    )}

                                    <button
                                        type="button"
                                        className="video-confirm-assign-button"
                                        onClick={() =>
                                            handleAssociateRecording(
                                                selectedApplication.videoInterview
                                            )
                                        }
                                    >
                                        {selectedApplication.videoInterview.recordingUrl
                                            ? "Replace Recording"
                                            : "Associate Recording"}
                                    </button>

                                </div>

                            )}


                            {/* EMPLOYEE */}

                            {!selectedApplication.videoInterview ? (

                                <div className="video-assign-section">

                                    <div className="video-section-heading">

                                        <div className="video-section-heading-icon">

                                            <UserPlus
                                                size={18}
                                            />

                                        </div>

                                        <div>

                                            <h3>
                                                Assign Interview Employee
                                            </h3>

                                            <p>
                                                This employee will conduct the
                                                video interview and create the
                                                meeting schedule.
                                            </p>

                                        </div>

                                    </div>


                                    <label className="video-employee-label">

                                        Select Employee


                                        <div className="video-employee-select">

                                            <select
                                                value={
                                                    selectedEmployee
                                                }
                                                onChange={(event) =>
                                                    setSelectedEmployee(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    loadingEmployees ||
                                                    assigning
                                                }
                                            >

                                                <option value="">
                                                    {loadingEmployees
                                                        ? "Loading employees..."
                                                        : "Select an employee"
                                                    }
                                                </option>


                                                {employees.map(
                                                    employee => (

                                                        <option
                                                            key={
                                                                employee._id
                                                            }
                                                            value={
                                                                employee._id
                                                            }
                                                        >

                                                            {getEmployeeName(
                                                                employee
                                                            )}

                                                            {employee.employeeId
                                                                ? ` (${employee.employeeId})`
                                                                : ""
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>


                                            <ChevronDown
                                                size={16}
                                            />

                                        </div>

                                    </label>


                                    {selectedEmployee && (

                                        <div className="video-selected-employee">

                                            <div className="video-selected-employee-icon">

                                                <UserCheck
                                                    size={19}
                                                />

                                            </div>


                                            <div>

                                                <strong>
                                                    {
                                                        getEmployeeName(
                                                            employees.find(
                                                                employee =>
                                                                    String(
                                                                        employee._id
                                                                    ) ===
                                                                    String(
                                                                        selectedEmployee
                                                                    )
                                                            )
                                                        )
                                                    }
                                                </strong>

                                                <span>

                                                    {
                                                        employees.find(
                                                            employee =>
                                                                String(
                                                                    employee._id
                                                                ) ===
                                                                String(
                                                                    selectedEmployee
                                                                )
                                                        )?.email ||
                                                        "Employee"
                                                    }

                                                </span>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div className="video-assigned-success">

                                    <div className="video-success-icon">

                                        <CheckCircle2
                                            size={22}
                                        />

                                    </div>

                                    <div>

                                        <strong>
                                            Employee already assigned
                                        </strong>

                                        <span>
                                            The assigned employee can now
                                            schedule the interview.
                                        </span>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* FOOTER */}

                        <div className="video-interview-modal-footer">

                            <button
                                type="button"
                                className="video-cancel-button"
                                onClick={closeModal}
                                disabled={assigning}
                            >
                                Close
                            </button>


                            {!selectedApplication.videoInterview && (

                                <button
                                    type="button"
                                    className="video-confirm-assign-button"
                                    onClick={
                                        handleAssignEmployee
                                    }
                                    disabled={
                                        assigning ||
                                        loadingEmployees ||
                                        !selectedEmployee
                                    }
                                >

                                    {assigning ? (

                                        <>
                                            <RefreshCw
                                                size={15}
                                                className="video-interview-spin"
                                            />

                                            Assigning...
                                        </>

                                    ) : (

                                        <>
                                            <UserPlus
                                                size={15}
                                            />

                                            Assign Employee
                                        </>

                                    )}

                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminVideoInterview;