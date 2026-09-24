import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Eye,
    X,
    CheckCircle2,
    Clock3,
    Users,
    BriefcaseBusiness,
    UserRound,
    Mail,
    Phone,
    FileText,
    CalendarDays,
    ChevronDown,
    Trash2,
    ExternalLink,
    AlertCircle,
    Send,
    UserCheck,
    UserPlus,
    Save,
    UserRoundCheck,
    RotateCcw,
} from "lucide-react";

import {
    getAdminApplications,
    getAdminApplicationSummary,
    updateAdminApplicationStatus,
    updateAdminApplicationNotes,
    sendAdminApplicationToHR,
    removeAdminApplicationFromHR,
    deleteAdminApplication,
} from "../../services/adminJobApplicationApi";

import "../Admin/css/JobApplications.css";


const DEFAULT_SUMMARY = {
    total: 0,
    Pending: 0,
    Shortlisted: 0,
    Interview: 0,
    Selected: 0,
    Rejected: 0,
    Withdrawn: 0,
};


const STATUSES = [
    "Pending",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
    "Withdrawn",
];


const JobApplications = () => {

    // =========================================================
    // APPLICATIONS
    // =========================================================

    const [
        applications,
        setApplications,
    ] = useState([]);


    // =========================================================
    // SUMMARY
    // =========================================================

    const [
        summary,
        setSummary,
    ] = useState(DEFAULT_SUMMARY);


    // =========================================================
    // LOADING
    // =========================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    // =========================================================
    // ERROR
    // =========================================================

    const [
        error,
        setError,
    ] = useState("");


    // =========================================================
    // FILTER
    // =========================================================

    const [
        search,
        setSearch,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");


    const [
        hrFilter,
        setHrFilter,
    ] = useState("All");


    // =========================================================
    // SELECTED APPLICATION
    // =========================================================

    const [
        selectedApplication,
        setSelectedApplication,
    ] = useState(null);


    // =========================================================
    // ACTION STATES
    // =========================================================

    const [
        sendingToHR,
        setSendingToHR,
    ] = useState(false);


    const [
        removingFromHR,
        setRemovingFromHR,
    ] = useState(false);


    const [
        updatingStatus,
        setUpdatingStatus,
    ] = useState(false);


    const [
        savingNotes,
        setSavingNotes,
    ] = useState(false);


    // =========================================================
    // ADMIN NOTES
    // =========================================================

    const [
        adminNotes,
        setAdminNotes,
    ] = useState("");


    // =========================================================
    // LOAD APPLICATIONS
    // =========================================================

    const loadApplications = useCallback(
        async (
            showLoader = true
        ) => {

            try {

                if (showLoader) {

                    setLoading(true);

                } else {

                    setRefreshing(true);

                }

                setError("");


                const [
                    applicationResponse,
                    summaryResponse,
                ] = await Promise.all([

                    getAdminApplications({

                        status:
                            statusFilter === "All"
                                ? ""
                                : statusFilter,

                        search:
                            search.trim(),

                        hr:
                            hrFilter === "All"
                                ? ""
                                : hrFilter,

                    }),

                    getAdminApplicationSummary(),

                ]);


                setApplications(
                    Array.isArray(
                        applicationResponse?.applications
                    )
                        ? applicationResponse.applications
                        : []
                );


                setSummary(
                    applicationResponse?.summary ||
                    summaryResponse?.summary ||
                    DEFAULT_SUMMARY
                );

            } catch (requestError) {

                console.error(
                    "LOAD ADMIN APPLICATIONS ERROR:",
                    requestError
                );


                setError(
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Unable to load applications"
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            statusFilter,
            search,
            hrFilter,
        ]
    );


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadApplications();

    }, [
        loadApplications,
    ]);


    // =========================================================
    // OPEN APPLICATION
    // =========================================================

    const openApplication = (
        application
    ) => {

        setSelectedApplication(
            application
        );


        setAdminNotes(
            application?.adminNotes ||
            ""
        );

    };


    // =========================================================
    // CLOSE APPLICATION
    // =========================================================

    const closeApplication = () => {

        setSelectedApplication(null);

        setAdminNotes("");

        setSendingToHR(false);

        setRemovingFromHR(false);

        setUpdatingStatus(false);

        setSavingNotes(false);

    };


    // =========================================================
    // UPDATE APPLICATION IN LOCAL STATE
    // =========================================================

    const updateApplicationLocally = (
        updatedApplication
    ) => {

        if (!updatedApplication?._id) {

            return;

        }


        setApplications(
            previous =>
                previous.map(
                    application =>
                        String(application._id) ===
                        String(updatedApplication._id)
                            ? updatedApplication
                            : application
                )
        );


        setSelectedApplication(
            updatedApplication
        );

    };


    // =========================================================
    // SEND APPLICATION TO HR
    // =========================================================

    const handleSendToHR = async () => {

        if (
            !selectedApplication?._id ||
            sendingToHR
        ) {

            return;

        }


        if (
            selectedApplication.sentToHR
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "Send this application to HR?\n\nAll active HR users will be able to see this application. The first HR who accepts it will become responsible for the application."
            );


        if (!confirmed) {

            return;

        }


        try {

            setSendingToHR(true);


            const response =
                await sendAdminApplicationToHR(
                    selectedApplication._id
                );


            if (
                response?.success
            ) {

                updateApplicationLocally(
                    response.application
                );

            } else {

                throw new Error(
                    response?.message ||
                    "Failed to send application to HR"
                );

            }

        } catch (requestError) {

            console.error(
                "SEND APPLICATION TO HR ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to send application to HR"
            );

        } finally {

            setSendingToHR(false);

        }

    };


    // =========================================================
    // REMOVE APPLICATION FROM HR
    // =========================================================

    const handleRemoveFromHR = async () => {

        if (
            !selectedApplication?._id ||
            removingFromHR
        ) {

            return;

        }


        /*
        Do not allow removing an already accepted
        application from the HR workflow.
        */

        if (
            selectedApplication.acceptedByHR ||
            selectedApplication.assignedHR
        ) {

            alert(
                "This application has already been accepted by HR and cannot be removed from the HR workflow."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Remove this application from the HR queue?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setRemovingFromHR(true);


            const response =
                await removeAdminApplicationFromHR(
                    selectedApplication._id
                );


            if (
                response?.success
            ) {

                updateApplicationLocally(
                    response.application
                );

            } else {

                throw new Error(
                    response?.message ||
                    "Failed to remove application from HR"
                );

            }

        } catch (requestError) {

            console.error(
                "REMOVE APPLICATION FROM HR ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to remove application from HR"
            );

        } finally {

            setRemovingFromHR(false);

        }

    };


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    const handleStatusChange = async (
        status
    ) => {

        if (
            !selectedApplication?._id ||
            updatingStatus
        ) {

            return;

        }


        if (
            selectedApplication.status === status
        ) {

            return;

        }


        try {

            setUpdatingStatus(true);


            const response =
                await updateAdminApplicationStatus(
                    selectedApplication._id,
                    status,
                    selectedApplication.adminNotes || ""
                );


            if (
                response?.success
            ) {

                updateApplicationLocally(
                    response.application
                );


                /*
                Reload summary from backend so
                counts always remain authoritative.
                */

                try {

                    const summaryResponse =
                        await getAdminApplicationSummary();


                    if (
                        summaryResponse?.summary
                    ) {

                        setSummary(
                            summaryResponse.summary
                        );

                    }

                } catch (summaryError) {

                    console.warn(
                        "SUMMARY REFRESH ERROR:",
                        summaryError
                    );

                }

            } else {

                throw new Error(
                    response?.message ||
                    "Failed to update application status"
                );

            }

        } catch (requestError) {

            console.error(
                "UPDATE STATUS ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to update application status"
            );

        } finally {

            setUpdatingStatus(false);

        }

    };


    // =========================================================
    // SAVE NOTES
    // =========================================================

    const handleSaveNotes = async () => {

        if (
            !selectedApplication?._id ||
            savingNotes
        ) {

            return;

        }


        try {

            setSavingNotes(true);


            const response =
                await updateAdminApplicationNotes(
                    selectedApplication._id,
                    adminNotes
                );


            if (
                response?.success
            ) {

                updateApplicationLocally(
                    response.application
                );

            } else {

                throw new Error(
                    response?.message ||
                    "Failed to save notes"
                );

            }

        } catch (requestError) {

            console.error(
                "SAVE NOTES ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to save notes"
            );

        } finally {

            setSavingNotes(false);

        }

    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        application
    ) => {

        if (
            !application?._id
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                `Delete application from ${application.candidateName || "this candidate"}?`
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteAdminApplication(
                application._id
            );


            setApplications(
                previous =>
                    previous.filter(
                        item =>
                            String(item._id) !==
                            String(application._id)
                    )
            );


            setSelectedApplication(null);


            /*
            Refresh summary from backend.
            */

            try {

                const summaryResponse =
                    await getAdminApplicationSummary();


                if (
                    summaryResponse?.summary
                ) {

                    setSummary(
                        summaryResponse.summary
                    );

                }

            } catch (summaryError) {

                console.warn(
                    "DELETE SUMMARY REFRESH ERROR:",
                    summaryError
                );

            }

        } catch (requestError) {

            console.error(
                "DELETE APPLICATION ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to delete application"
            );

        }

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "-";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "-";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =========================================================
    // FORMAT DATE + TIME
    // =========================================================

    const formatDateTime = (
        date
    ) => {

        if (!date) {

            return "-";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "-";

        }


        return parsedDate.toLocaleString(
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


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {

        return String(
            status || "Pending"
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    };


    // =========================================================
    // HR ACCEPTED NAME
    // =========================================================

    const getAcceptedHRName = (
        application
    ) => {

        const hr =
            application?.acceptedByHR ||
            application?.assignedHR;


        if (!hr) {

            return "Not Accepted";

        }


        if (
            typeof hr === "object"
        ) {

            return (
                hr.name ||
                hr.fullName ||
                hr.email ||
                "HR"
            );

        }


        return "HR Accepted";

    };


    // =========================================================
    // HR ACCEPTED EMAIL
    // =========================================================

    const getAcceptedHREmail = (
        application
    ) => {

        const hr =
            application?.acceptedByHR ||
            application?.assignedHR;


        if (
            typeof hr === "object"
        ) {

            return hr.email || "";

        }


        return "";

    };


    // =========================================================
    // HR STATUS
    // =========================================================

    const getHRStatus = (
        application
    ) => {

        if (
            application?.acceptedByHR ||
            application?.assignedHR
        ) {

            return "Accepted by HR";

        }


        if (
            application?.sentToHR
        ) {

            return "Waiting for HR";

        }


        return "Not Sent";

    };


    // =========================================================
    // HR STATUS CLASS
    // =========================================================

    const getHRStatusClass = (
        application
    ) => {

        if (
            application?.acceptedByHR ||
            application?.assignedHR
        ) {

            return "accepted";

        }


        if (
            application?.sentToHR
        ) {

            return "sent";

        }


        return "not-sent";

    };


    // =========================================================
    // CAN SEND TO HR
    // =========================================================

    const canSendToHR = (
        application
    ) => {

        return Boolean(
            application &&
            !application.sentToHR &&
            !application.acceptedByHR &&
            !application.assignedHR
        );

    };


    // =========================================================
    // CAN REMOVE FROM HR
    // =========================================================

    const canRemoveFromHR = (
        application
    ) => {

        return Boolean(
            application?.sentToHR &&
            !application.acceptedByHR &&
            !application.assignedHR
        );

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-job-applications">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="applications-page-header">

                <div>

                    <span className="page-eyebrow">
                        RECRUITMENT
                    </span>

                    <h1>
                        Job Applications
                    </h1>

                    <p>
                        Review candidate applications and
                        send them to HR for processing.
                    </p>

                </div>


                <button
                    type="button"
                    className="refresh-button"
                    onClick={() =>
                        loadApplications(false)
                    }
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

                    Refresh

                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="applications-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <section className="application-summary-grid">

                <div className="application-summary-card">

                    <div className="summary-icon">

                        <Users
                            size={21}
                        />

                    </div>

                    <span>
                        Total Applications
                    </span>

                    <strong>
                        {summary.total || 0}
                    </strong>

                </div>


                <div className="application-summary-card">

                    <div className="summary-icon pending">

                        <Clock3
                            size={21}
                        />

                    </div>

                    <span>
                        Pending
                    </span>

                    <strong>
                        {summary.Pending || 0}
                    </strong>

                </div>


                <div className="application-summary-card">

                    <div className="summary-icon shortlisted">

                        <CheckCircle2
                            size={21}
                        />

                    </div>

                    <span>
                        Shortlisted
                    </span>

                    <strong>
                        {summary.Shortlisted || 0}
                    </strong>

                </div>


                <div className="application-summary-card">

                    <div className="summary-icon interview">

                        <CalendarDays
                            size={21}
                        />

                    </div>

                    <span>
                        Interview
                    </span>

                    <strong>
                        {summary.Interview || 0}
                    </strong>

                </div>


                <div className="application-summary-card">

                    <div className="summary-icon selected">

                        <CheckCircle2
                            size={21}
                        />

                    </div>

                    <span>
                        Selected
                    </span>

                    <strong>
                        {summary.Selected || 0}
                    </strong>

                </div>

            </section>


            {/* =====================================================
                FILTERS
            ===================================================== */}

            <section className="applications-toolbar">

                <div className="application-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search candidate, email, job..."
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
                        >

                            <X
                                size={16}
                            />

                        </button>

                    )}

                </div>


                <div className="status-filter">

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

                            {STATUSES.map(
                                status => (

                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>

                                )
                            )}

                        </select>

                        <ChevronDown
                            size={16}
                        />

                    </div>

                </div>


                <div className="status-filter">

                    <span>
                        HR
                    </span>

                    <div>

                        <select
                            value={hrFilter}
                            onChange={(event) =>
                                setHrFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All HR
                            </option>

                            <option value="not-sent">
                                Not Sent to HR
                            </option>

                            <option value="waiting">
                                Waiting for HR
                            </option>

                            <option value="accepted">
                                Accepted by HR
                            </option>

                        </select>

                        <ChevronDown
                            size={16}
                        />

                    </div>

                </div>

            </section>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <section className="applications-table-card">

                <div className="applications-table-header">

                    <div>

                        <h2>
                            Candidate Applications
                        </h2>

                        <span>
                            {applications.length}
                            {" "}
                            application(s)
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="applications-loading">

                        <RefreshCw
                            size={30}
                            className="spin"
                        />

                        <p>
                            Loading applications...
                        </p>

                    </div>

                ) : applications.length === 0 ? (

                    <div className="applications-empty">

                        <div className="empty-icon">

                            <FileText
                                size={30}
                            />

                        </div>

                        <h3>
                            No applications found
                        </h3>

                        <p>
                            Candidate applications will
                            appear here after candidates
                            apply for jobs.
                        </p>

                    </div>

                ) : (

                    <div className="applications-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Candidate
                                    </th>

                                    <th>
                                        Job
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        Applied
                                    </th>

                                    <th>
                                        HR Workflow
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {applications.map(
                                    application => (

                                        <tr
                                            key={
                                                application._id
                                            }
                                        >

                                            {/* =================================
                                                CANDIDATE
                                            ================================= */}

                                            <td>

                                                <div className="candidate-table-cell">

                                                    <div className="candidate-table-avatar">

                                                        {application.candidateProfileImage ? (

                                                            <img
                                                                src={
                                                                    application.candidateProfileImage
                                                                }
                                                                alt={
                                                                    application.candidateName ||
                                                                    "Candidate"
                                                                }
                                                            />

                                                        ) : (

                                                            <UserRound
                                                                size={19}
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                application.candidateName ||
                                                                "Unknown Candidate"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                application.candidateEmail ||
                                                                "No email"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =================================
                                                JOB
                                            ================================= */}

                                            <td>

                                                <div className="job-table-cell">

                                                    <BriefcaseBusiness
                                                        size={17}
                                                    />

                                                    <div>

                                                        <strong>
                                                            {
                                                                application.jobTitle ||
                                                                "Unknown Job"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                application.jobDepartment ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* =================================
                                                CONTACT
                                            ================================= */}

                                            <td>

                                                <div className="contact-table-cell">

                                                    <span>

                                                        <Mail
                                                            size={14}
                                                        />

                                                        {
                                                            application.candidateEmail ||
                                                            "—"
                                                        }

                                                    </span>


                                                    {application.candidatePhone && (

                                                        <span>

                                                            <Phone
                                                                size={14}
                                                            />

                                                            {
                                                                application.candidatePhone
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* =================================
                                                APPLIED
                                            ================================= */}

                                            <td>

                                                <span className="date-cell">

                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    {
                                                        formatDate(
                                                            application.createdAt
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* =================================
                                                HR WORKFLOW
                                            ================================= */}

                                            <td>

                                                <div className="assigned-hr-cell">

                                                    {application.acceptedByHR ||
                                                    application.assignedHR ? (

                                                        <>

                                                            <UserRoundCheck
                                                                size={15}
                                                            />

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        getAcceptedHRName(
                                                                            application
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Accepted
                                                                </span>

                                                            </div>

                                                        </>

                                                    ) : application.sentToHR ? (

                                                        <>

                                                            <Send
                                                                size={15}
                                                            />

                                                            <div>

                                                                <strong>
                                                                    Waiting for HR
                                                                </strong>

                                                                <span>
                                                                    Sent
                                                                </span>

                                                            </div>

                                                        </>

                                                    ) : (

                                                        <>

                                                            <UserPlus
                                                                size={15}
                                                            />

                                                            <div>

                                                                <strong>
                                                                    Not Sent
                                                                </strong>

                                                                <span>
                                                                    Admin action required
                                                                </span>

                                                            </div>

                                                        </>

                                                    )}

                                                </div>

                                            </td>


                                            {/* =================================
                                                STATUS
                                            ================================= */}

                                            <td>

                                                <span
                                                    className={`application-status ${getStatusClass(
                                                        application.status
                                                    )}`}
                                                >

                                                    {
                                                        application.status ||
                                                        "Pending"
                                                    }

                                                </span>

                                            </td>


                                            {/* =================================
                                                ACTION
                                            ================================= */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-application-button"
                                                    onClick={() =>
                                                        openApplication(
                                                            application
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={16}
                                                    />

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            {selectedApplication && (

                <div
                    className="application-modal-overlay"
                    onClick={
                        closeApplication
                    }
                >

                    <div
                        className="application-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =============================================
                            MODAL HEADER
                        ============================================= */}

                        <div className="application-modal-header">

                            <div>

                                <span>
                                    APPLICATION DETAILS
                                </span>

                                <h2>
                                    {
                                        selectedApplication.candidateName
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeApplication
                                }
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <div className="application-modal-body">

                            {/* =========================================
                                HR WORKFLOW
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <Send
                                        size={18}
                                    />

                                    HR Recruitment Workflow

                                </h3>


                                <div className="hr-assignment-box">

                                    {/* =================================
                                        NOT SENT
                                    ================================= */}

                                    {!selectedApplication.sentToHR &&
                                    !selectedApplication.acceptedByHR &&
                                    !selectedApplication.assignedHR && (

                                        <>

                                            <div className="hr-assignment-info">

                                                <span>
                                                    Current HR Status
                                                </span>

                                                <strong>
                                                    Not Sent to HR
                                                </strong>

                                                <small>
                                                    This application is currently
                                                    under Super Admin control.
                                                </small>

                                            </div>


                                            <button
                                                type="button"
                                                className="assign-hr-button"
                                                onClick={
                                                    handleSendToHR
                                                }
                                                disabled={
                                                    sendingToHR
                                                }
                                            >

                                                {sendingToHR ? (

                                                    <>

                                                        <RefreshCw
                                                            size={16}
                                                            className="spin"
                                                        />

                                                        Sending...

                                                    </>

                                                ) : (

                                                    <>

                                                        <Send
                                                            size={16}
                                                        />

                                                        Send to HR

                                                    </>

                                                )}

                                            </button>

                                        </>

                                    )}


                                    {/* =================================
                                        SENT / WAITING
                                    ================================= */}

                                    {selectedApplication.sentToHR &&
                                    !selectedApplication.acceptedByHR &&
                                    !selectedApplication.assignedHR && (

                                        <>

                                            <div className="hr-assignment-info">

                                                <span>
                                                    Current HR Status
                                                </span>

                                                <strong>
                                                    Waiting for HR Acceptance
                                                </strong>

                                                <small>
                                                    This application is visible
                                                    to all active HR users.
                                                    The first HR to accept it
                                                    will become responsible.
                                                </small>

                                            </div>


                                            <div className="hr-assignment-controls">

                                                <button
                                                    type="button"
                                                    className="assign-hr-button"
                                                    onClick={
                                                        handleRemoveFromHR
                                                    }
                                                    disabled={
                                                        removingFromHR
                                                    }
                                                >

                                                    {removingFromHR ? (

                                                        <>

                                                            <RefreshCw
                                                                size={16}
                                                                className="spin"
                                                            />

                                                            Removing...

                                                        </>

                                                    ) : (

                                                        <>

                                                            <RotateCcw
                                                                size={16}
                                                            />

                                                            Remove from HR

                                                        </>

                                                    )}

                                                </button>

                                            </div>

                                        </>

                                    )}


                                    {/* =================================
                                        ACCEPTED
                                    ================================= */}

                                    {(selectedApplication.acceptedByHR ||
                                    selectedApplication.assignedHR) && (

                                        <>

                                            <div className="hr-assignment-info">

                                                <span>
                                                    Accepted By HR
                                                </span>

                                                <strong>
                                                    {
                                                        getAcceptedHRName(
                                                            selectedApplication
                                                        )
                                                    }
                                                </strong>

                                                {getAcceptedHREmail(
                                                    selectedApplication
                                                ) && (

                                                    <small>
                                                        {
                                                            getAcceptedHREmail(
                                                                selectedApplication
                                                            )
                                                        }
                                                    </small>

                                                )}

                                            </div>


                                            <div className="hr-assignment-warning">

                                                <UserCheck
                                                    size={15}
                                                />

                                                This application has been
                                                accepted by HR and is now
                                                locked to the accepting HR.

                                            </div>

                                        </>

                                    )}

                                </div>

                            </section>


                            {/* =========================================
                                CANDIDATE INFORMATION
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <UserRound
                                        size={18}
                                    />

                                    Candidate Information

                                </h3>


                                <div className="detail-grid">

                                    <div>

                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateName ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateEmail ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidatePhone ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Education
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateEducation ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Experience
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateExperience ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Address
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateAddress ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =========================================
                                JOB INFORMATION
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <BriefcaseBusiness
                                        size={18}
                                    />

                                    Job Information

                                </h3>


                                <div className="detail-grid">

                                    <div>

                                        <span>
                                            Position
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.jobTitle ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Department
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.jobDepartment ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Location
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.jobLocation ||
                                                "—"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =========================================
                                RESUME
                            ========================================= */}

                            {selectedApplication.candidateResume && (

                                <section className="application-detail-section">

                                    <h3>

                                        <FileText
                                            size={18}
                                        />

                                        Resume

                                    </h3>


                                    <a
                                        href={
                                            selectedApplication.candidateResume
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="resume-view-button"
                                    >

                                        <ExternalLink
                                            size={16}
                                        />

                                        View Candidate Resume

                                    </a>

                                </section>

                            )}


                            {/* =========================================
                                SKILLS
                            ========================================= */}

                            {Array.isArray(
                                selectedApplication.candidateSkills
                            ) &&
                            selectedApplication.candidateSkills.length > 0 && (

                                <section className="application-detail-section">

                                    <h3>

                                        <CheckCircle2
                                            size={18}
                                        />

                                        Skills

                                    </h3>


                                    <div className="application-skills">

                                        {selectedApplication.candidateSkills.map(
                                            (
                                                skill,
                                                index
                                            ) => (

                                                <span
                                                    key={
                                                        `${skill}-${index}`
                                                    }
                                                >

                                                    {skill}

                                                </span>

                                            )
                                        )}

                                    </div>

                                </section>

                            )}


                            {/* =========================================
                                COVER LETTER
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <FileText
                                        size={18}
                                    />

                                    Cover Letter

                                </h3>


                                <div className="cover-letter-box">

                                    {
                                        selectedApplication.coverLetter ||
                                        "No cover letter provided."
                                    }

                                </div>

                            </section>


                            {/* =========================================
                                ADDITIONAL MESSAGE
                            ========================================= */}

                            {selectedApplication.additionalMessage && (

                                <section className="application-detail-section">

                                    <h3>

                                        Additional Message

                                    </h3>


                                    <div className="cover-letter-box">

                                        {
                                            selectedApplication.additionalMessage
                                        }

                                    </div>

                                </section>

                            )}


                            {/* =========================================
                                STATUS
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <Clock3
                                        size={18}
                                    />

                                    Application Status

                                </h3>


                                <div className="status-management">

                                    {STATUSES.map(
                                        status => (

                                            <button
                                                type="button"
                                                key={status}
                                                disabled={
                                                    updatingStatus
                                                }
                                                className={
                                                    selectedApplication.status ===
                                                    status
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        status
                                                    )
                                                }
                                            >

                                                {status}

                                            </button>

                                        )
                                    )}

                                </div>

                            </section>


                            {/* =========================================
                                ADMIN NOTES
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    <FileText
                                        size={18}
                                    />

                                    Admin Notes

                                </h3>


                                <textarea
                                    value={
                                        adminNotes
                                    }
                                    onChange={(event) =>
                                        setAdminNotes(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Add internal notes about this candidate..."
                                />


                                <button
                                    type="button"
                                    className="save-notes-button"
                                    onClick={
                                        handleSaveNotes
                                    }
                                    disabled={
                                        savingNotes
                                    }
                                >

                                    {savingNotes ? (

                                        <RefreshCw
                                            size={16}
                                            className="spin"
                                        />

                                    ) : (

                                        <Save
                                            size={16}
                                        />

                                    )}

                                    {savingNotes
                                        ? "Saving..."
                                        : "Save Notes"
                                    }

                                </button>

                            </section>


                            {/* =========================================
                                APPLICATION META
                            ========================================= */}

                            <section className="application-detail-section">

                                <h3>

                                    Application Information

                                </h3>


                                <div className="detail-grid">

                                    <div>

                                        <span>
                                            Applied On
                                        </span>

                                        <strong>
                                            {
                                                formatDateTime(
                                                    selectedApplication.createdAt
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Last Updated
                                        </span>

                                        <strong>
                                            {
                                                formatDateTime(
                                                    selectedApplication.updatedAt
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Sent to HR
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.sentToHR
                                                    ? formatDateTime(
                                                        selectedApplication.sentToHRAt
                                                    )
                                                    : "Not sent"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            HR Status
                                        </span>

                                        <strong>
                                            {
                                                getHRStatus(
                                                    selectedApplication
                                                )
                                            }
                                        </strong>

                                    </div>


                                    {(selectedApplication.acceptedByHR ||
                                    selectedApplication.assignedHR) && (

                                        <div>

                                            <span>
                                                Accepted By
                                            </span>

                                            <strong>
                                                {
                                                    getAcceptedHRName(
                                                        selectedApplication
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    )}


                                    {selectedApplication.acceptedByHRAt && (

                                        <div>

                                            <span>
                                                HR Accepted On
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedApplication.acceptedByHRAt
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    )}

                                </div>

                            </section>

                        </div>


                        {/* =============================================
                            MODAL FOOTER
                        ============================================= */}

                        <div className="application-modal-footer">

                            <button
                                type="button"
                                className="delete-application-button"
                                onClick={() =>
                                    handleDelete(
                                        selectedApplication
                                    )
                                }
                            >

                                <Trash2
                                    size={16}
                                />

                                Delete Application

                            </button>


                            <button
                                type="button"
                                className="close-modal-button"
                                onClick={
                                    closeApplication
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


export default JobApplications;