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
    CheckCircle2,
    Clock3,
    UserCheck,
    X,
    FileText,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

import {
    getHRApplications,
    getHRApplicationSummary,
    acceptHRApplication,
    updateHRApplicationStatus,
    updateHRApplicationNotes,
    sendJobConfirmation,
} from "../../services/hrJobApplicationApi";

import "./HRJobApplications.css";
import { useAppPrompt } from "../../components/common/useAppPrompt";


const STATUS_OPTIONS = [

    "All",

    "Pending",

    "Shortlisted",

    "Interview",

    "Selected",

    "Rejected",

    "Withdrawn",

];


const HRJobApplications = () => {

    const prompt = useAppPrompt();

    const [
        applications,
        setApplications,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState({

        total: 0,

        Pending: 0,

        Shortlisted: 0,

        Interview: 0,

        Selected: 0,

        Rejected: 0,

        Withdrawn: 0,

    });

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
        status,
        setStatus,
    ] = useState("All");

    const [
        selectedApplication,
        setSelectedApplication,
    ] = useState(null);

    const [
        acceptingId,
        setAcceptingId,
    ] = useState(null);

    const [
        updatingId,
        setUpdatingId,
    ] = useState(null);

    const [
        notes,
        setNotes,
    ] = useState("");

    const [
        savingNotes,
        setSavingNotes,
    ] = useState(false);

    const [
        sendingConfirmationId,
        setSendingConfirmationId,
    ] = useState(null);

    const [
        notification,
        setNotification,
    ] = useState(null);

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const pageSize = 10;


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications =
        useCallback(
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

                    const response =
                        await getHRApplications({

                            status:
                                status === "All"
                                    ? ""
                                    : status,

                            search,

                        });


                    setApplications(
                        Array.isArray(
                            response?.applications
                        )
                            ? response.applications
                            : []
                    );

                } catch (err) {

                    console.error(
                        "LOAD HR APPLICATIONS ERROR:",
                        err
                    );

                    setError(
                        err?.response?.data?.message ||
                        "Failed to load HR applications"
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);

                }

            },
            [
                status,
                search,
            ]
        );


    // =====================================================
    // LOAD SUMMARY
    // =====================================================

    const loadSummary =
        useCallback(
            async () => {

                try {

                    const response =
                        await getHRApplicationSummary();


                    if (
                        response?.summary
                    ) {

                        setSummary(
                            response.summary
                        );

                    }

                } catch (err) {

                    console.error(
                        "LOAD HR SUMMARY ERROR:",
                        err
                    );

                }

            },
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(
        () => {

            loadApplications();

        },
        [
            loadApplications,
        ]
    );


    useEffect(
        () => {

            loadSummary();

        },
        [
            loadSummary,
        ]
    );


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh =
        async () => {

            await Promise.all([

                loadApplications(false),

                loadSummary(),

            ]);

        };


    // =====================================================
    // ACCEPT
    // =====================================================

    const handleAccept =
        async (
            application
        ) => {

            if (!application?._id) {

                return;

            }


            const confirmed =
                window.confirm(
                    "Accept this application?"
                );


            if (!confirmed) {

                return;

            }


            try {

                setAcceptingId(
                    application._id
                );

                setError("");


                const response =
                    await acceptHRApplication(
                        application._id
                    );


                const updated =
                    response?.application;


                if (updated) {

                    setApplications(
                        previous =>
                            previous.map(
                                item =>
                                    item._id ===
                                    updated._id
                                        ? updated
                                        : item
                            )
                    );


                    setSelectedApplication(
                        updated
                    );

                }


                await loadSummary();

                await loadApplications(false);

            } catch (err) {

                console.error(
                    "ACCEPT APPLICATION ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to accept application"
                );

            } finally {

                setAcceptingId(null);

            }

        };


    // =====================================================
    // STATUS
    // =====================================================

    const handleStatusChange =
        async (
            application,
            newStatus
        ) => {

            if (
                !application?._id ||
                !newStatus
            ) {

                return;

            }


            try {

                setUpdatingId(
                    application._id
                );

                setError("");


                const response =
                    await updateHRApplicationStatus(

                        application._id,

                        newStatus

                    );


                const updated =
                    response?.application;


                if (updated) {

                    setApplications(
                        previous =>
                            previous.map(
                                item =>
                                    item._id ===
                                    updated._id
                                        ? updated
                                        : item
                            )
                    );


                    setSelectedApplication(
                        updated
                    );

                }


                await loadSummary();

            } catch (err) {

                console.error(
                    "UPDATE STATUS ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to update application status"
                );

            } finally {

                setUpdatingId(null);

            }

        };


    const handleSendConfirmation = async () => {

        if (!selectedApplication?._id) {
            return;
        }

        const joiningDate = await prompt({
            title: "Confirmation email",
            message: "Add an expected joining date for the selected candidate.",
            label: "Expected joining date (optional)",
            inputType: "date",
            submitLabel: "Continue",
        });

        if (joiningDate === null) {
            return;
        }

        const message = await prompt({
            title: "Confirmation email message",
            message: "Review or edit the message before sending it to the candidate.",
            label: "Email message (optional)",
            defaultValue: "We are pleased to confirm that you have been selected for the position.",
            multiline: true,
            submitLabel: "Send email",
        });

        if (message === null) {
            return;
        }

        try {

            setSendingConfirmationId(selectedApplication._id);
            setError("");

            await sendJobConfirmation(
                selectedApplication._id,
                {
                    joiningDate,
                    message,
                }
            );

            setNotification({
                type: "success",
                title: "Confirmation email sent",
                message: `The confirmation email was sent to ${getCandidateEmail(
                    selectedApplication
                )}.`,
            });

            await loadApplications(false);

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to send confirmation email"
            );

        } finally {

            setSendingConfirmationId(null);

        }

    };


    // =====================================================
    // OPEN APPLICATION
    // =====================================================

    const openApplication =
        (
            application
        ) => {

            setSelectedApplication(
                application
            );

            setNotes(
                application?.hrNotes ||
                ""
            );

        };


    // =====================================================
    // SAVE NOTES
    // =====================================================

    const handleSaveNotes =
        async () => {

            if (
                !selectedApplication?._id
            ) {

                return;

            }


            try {

                setSavingNotes(true);

                setError("");


                const response =
                    await updateHRApplicationNotes(

                        selectedApplication._id,

                        notes

                    );


                const updated =
                    response?.application;


                if (updated) {

                    setSelectedApplication(
                        updated
                    );


                    setApplications(
                        previous =>
                            previous.map(
                                item =>
                                    item._id ===
                                    updated._id
                                        ? updated
                                        : item
                            )
                    );

                }

            } catch (err) {

                console.error(
                    "SAVE HR NOTES ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to save notes"
                );

            } finally {

                setSavingNotes(false);

            }

        };


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                applications.length /
                pageSize
            )
        );


    const paginatedApplications =
        useMemo(
            () => {

                const start =
                    (
                        currentPage -
                        1
                    ) *
                    pageSize;


                return applications.slice(

                    start,

                    start +
                    pageSize

                );

            },
            [
                applications,
                currentPage,
            ]
        );


    useEffect(
        () => {

            setCurrentPage(1);

        },
        [
            status,
            search,
        ]
    );


    // =====================================================
    // HELPERS
    // =====================================================

    const isAcceptedByHR =
        application =>
            Boolean(
                application?.acceptedByHR
            );


    const getCandidateName =
        application =>
            application?.candidateName ||
            application?.candidate?.name ||
            "Unknown Candidate";


    const getCandidateEmail =
        application =>
            application?.candidateEmail ||
            application?.candidate?.email ||
            "—";


    const getJobTitle =
        application =>
            application?.jobTitle ||
            application?.job?.title ||
            "Unknown Job";


    const getDepartment =
        application =>
            application?.jobDepartment ||
            application?.job?.department ||
            "—";


    return (

        <div className="hr-job-applications">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-job-header">

                <div>

                    <h1>
                        Job Applications
                    </h1>

                    <p>
                        Review and process applications
                        sent by Super Admin.
                    </p>

                </div>


                <button
                    type="button"
                    className="hr-refresh-btn"
                    onClick={
                        handleRefresh
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

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="hr-error">

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
                SUMMARY
            ================================================= */}

            <div className="hr-summary-grid">

                <SummaryCard
                    label="Total"
                    value={
                        summary.total
                    }
                    icon={
                        <FileText />
                    }
                />

                <SummaryCard
                    label="Pending"
                    value={
                        summary.Pending
                    }
                    icon={
                        <Clock3 />
                    }
                />

                <SummaryCard
                    label="Shortlisted"
                    value={
                        summary.Shortlisted
                    }
                    icon={
                        <UserCheck />
                    }
                />

                <SummaryCard
                    label="Interview"
                    value={
                        summary.Interview
                    }
                    icon={
                        <UserCheck />
                    }
                />

                <SummaryCard
                    label="Selected"
                    value={
                        summary.Selected
                    }
                    icon={
                        <CheckCircle2 />
                    }
                />

                <SummaryCard
                    label="Rejected"
                    value={
                        summary.Rejected
                    }
                    icon={
                        <X />
                    }
                />

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="hr-filters">

                <div className="hr-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search candidate or job..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={event =>
                        setStatus(
                            event.target.value
                        )
                    }
                >

                    {STATUS_OPTIONS.map(
                        option => (

                            <option
                                key={option}
                                value={option}
                            >
                                {option}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="hr-table-card">

                {loading ? (

                    <div className="hr-loading">

                        Loading applications...

                    </div>

                ) : paginatedApplications.length === 0 ? (

                    <div className="hr-empty">

                        <FileText
                            size={42}
                        />

                        <h3>
                            No applications found
                        </h3>

                        <p>
                            Applications sent by
                            Super Admin will appear
                            here.
                        </p>

                    </div>

                ) : (

                    <div className="hr-table-wrapper">

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
                                        Department
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        HR State
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {paginatedApplications.map(
                                    application => {

                                        const accepted =
                                            isAcceptedByHR(
                                                application
                                            );


                                        return (

                                            <tr
                                                key={
                                                    application._id
                                                }
                                            >

                                                <td>

                                                    <div className="candidate-cell">

                                                        <div className="candidate-avatar">

                                                            {(
                                                                application
                                                                    ?.candidateProfileImage ||
                                                                application
                                                                    ?.candidate
                                                                    ?.profileImage
                                                            ) ? (

                                                                <img
                                                                    src={
                                                                        application
                                                                            .candidateProfileImage ||
                                                                        application
                                                                            ?.candidate
                                                                            ?.profileImage
                                                                    }
                                                                    alt=""
                                                                />

                                                            ) : (

                                                                getCandidateName(
                                                                    application
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()

                                                            )}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    getCandidateName(
                                                                        application
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    getCandidateEmail(
                                                                        application
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            getJobTitle(
                                                                application
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        getDepartment(
                                                            application
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <span
                                                        className={`status-badge status-${String(
                                                            application.status
                                                        ).toLowerCase()}`}
                                                    >
                                                        {
                                                            application.status
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {accepted ? (

                                                        <span className="hr-state accepted">

                                                            <CheckCircle2
                                                                size={15}
                                                            />

                                                            Accepted

                                                        </span>

                                                    ) : (

                                                        <span className="hr-state waiting">

                                                            <Clock3
                                                                size={15}
                                                            />

                                                            Waiting

                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="view-btn"
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


                                                        {!accepted && (

                                                            <button
                                                                type="button"
                                                                className="accept-btn"
                                                                disabled={
                                                                    acceptingId ===
                                                                    application._id
                                                                }
                                                                onClick={() =>
                                                                    handleAccept(
                                                                        application
                                                                    )
                                                                }
                                                            >

                                                                <CheckCircle2
                                                                    size={16}
                                                                />

                                                                {
                                                                    acceptingId ===
                                                                    application._id
                                                                        ? "Accepting..."
                                                                        : "Accept"
                                                                }

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


            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
                applications.length > 0 && (

                    <div className="hr-pagination">

                        <button
                            type="button"
                            disabled={
                                currentPage === 1
                            }
                            onClick={() =>
                                setCurrentPage(
                                    page =>
                                        Math.max(
                                            1,
                                            page - 1
                                        )
                                )
                            }
                        >

                            <ChevronLeft
                                size={17}
                            />

                        </button>


                        <span>

                            Page{" "}

                            {currentPage}

                            {" "}of{" "}

                            {totalPages}

                        </span>


                        <button
                            type="button"
                            disabled={
                                currentPage ===
                                totalPages
                            }
                            onClick={() =>
                                setCurrentPage(
                                    page =>
                                        Math.min(
                                            totalPages,
                                            page + 1
                                        )
                                )
                            }
                        >

                            <ChevronRight
                                size={17}
                            />

                        </button>

                    </div>

                )}


            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {selectedApplication && (

                <div
                    className="hr-modal-backdrop"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setSelectedApplication(
                                null
                            );

                        }

                    }}
                >

                    <div className="hr-modal">

                        <div className="hr-modal-header">

                            <div>

                                <h2>
                                    Application Details
                                </h2>

                                <p>
                                    {
                                        getCandidateName(
                                            selectedApplication
                                        )
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedApplication(
                                        null
                                    )
                                }
                            >

                                <X />

                            </button>

                        </div>


                        <div className="hr-modal-body">

                            {/* Candidate */}

                            <section>

                                <h3>
                                    Candidate
                                </h3>

                                <div className="detail-grid">

                                    <Detail
                                        label="Name"
                                        value={
                                            getCandidateName(
                                                selectedApplication
                                            )
                                        }
                                    />

                                    <Detail
                                        label="Email"
                                        value={
                                            getCandidateEmail(
                                                selectedApplication
                                            )
                                        }
                                    />

                                    <Detail
                                        label="Phone"
                                        value={
                                            selectedApplication
                                                ?.candidatePhone ||
                                            selectedApplication
                                                ?.candidate
                                                ?.phone ||
                                            "—"
                                        }
                                    />

                                    <Detail
                                        label="Experience"
                                        value={
                                            selectedApplication
                                                ?.candidateExperience ||
                                            selectedApplication
                                                ?.candidate
                                                ?.experience ||
                                            "—"
                                        }
                                    />

                                    <Detail
                                        label="Education"
                                        value={
                                            selectedApplication
                                                ?.candidateEducation ||
                                            selectedApplication
                                                ?.candidate
                                                ?.education ||
                                            "—"
                                        }
                                    />

                                </div>

                            </section>


                            {/* Job */}

                            <section>

                                <h3>
                                    Job
                                </h3>

                                <div className="detail-grid">

                                    <Detail
                                        label="Position"
                                        value={
                                            getJobTitle(
                                                selectedApplication
                                            )
                                        }
                                    />

                                    <Detail
                                        label="Department"
                                        value={
                                            getDepartment(
                                                selectedApplication
                                            )
                                        }
                                    />

                                    <Detail
                                        label="Location"
                                        value={
                                            selectedApplication
                                                ?.jobLocation ||
                                            selectedApplication
                                                ?.job
                                                ?.location ||
                                            "—"
                                        }
                                    />

                                </div>

                            </section>


                            {/* HR PROCESS */}

                            <section>

                                <h3>
                                    HR Processing
                                </h3>


                                {!selectedApplication.acceptedByHR ? (

                                    <div className="waiting-box">

                                        <Clock3
                                            size={20}
                                        />

                                        <div>

                                            <strong>
                                                Waiting for acceptance
                                            </strong>

                                            <p>
                                                Accept this application
                                                before processing its
                                                recruitment status.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    <>

                                        <div className="accepted-box">

                                            <CheckCircle2
                                                size={20}
                                            />

                                            <div>

                                                <strong>
                                                    Application accepted
                                                </strong>

                                                <p>
                                                    This application is
                                                    assigned to the HR
                                                    who accepted it.
                                                </p>

                                            </div>

                                        </div>


                                        <label>

                                            Application Status

                                            <select
                                                value={
                                                    selectedApplication.status ||
                                                    "Pending"
                                                }
                                                disabled={
                                                    updatingId ===
                                                    selectedApplication._id
                                                }
                                                onChange={event =>
                                                    handleStatusChange(
                                                        selectedApplication,
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                {STATUS_OPTIONS
                                                    .filter(
                                                        item =>
                                                            item !==
                                                            "All"
                                                    )
                                                    .map(
                                                        item => (

                                                            <option
                                                                key={
                                                                    item
                                                                }
                                                                value={
                                                                    item
                                                                }
                                                            >
                                                                {
                                                                    item
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                            </select>

                                        </label>


                                        {selectedApplication.status ===
                                            "Selected" && (

                                            <div className="confirmation-email-box">

                                                <div>

                                                    <strong>
                                                        Job confirmation email
                                                    </strong>

                                                    <p>
                                                        Send the selection confirmation to {getCandidateEmail(
                                                            selectedApplication
                                                        )}.
                                                    </p>

                                                    {selectedApplication.confirmationEmailSentAt && (

                                                        <small>
                                                            Last sent: {new Date(
                                                                selectedApplication.confirmationEmailSentAt
                                                            ).toLocaleString()}
                                                        </small>

                                                    )}

                                                </div>

                                                <button
                                                    type="button"
                                                    className="save-notes-btn"
                                                    disabled={
                                                        sendingConfirmationId ===
                                                        selectedApplication._id
                                                    }
                                                    onClick={
                                                        handleSendConfirmation
                                                    }
                                                >
                                                    {sendingConfirmationId ===
                                                    selectedApplication._id
                                                        ? "Sending..."
                                                        : selectedApplication.confirmationEmailSentAt
                                                            ? "Resend Confirmation"
                                                            : "Send Confirmation Email"}
                                                </button>

                                            </div>

                                        )}


                                        <label>

                                            HR Notes

                                            <textarea
                                                value={
                                                    notes
                                                }
                                                onChange={event =>
                                                    setNotes(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Add your recruitment notes..."
                                                rows={5}
                                            />

                                        </label>


                                        <button
                                            type="button"
                                            className="save-notes-btn"
                                            disabled={
                                                savingNotes
                                            }
                                            onClick={
                                                handleSaveNotes
                                            }
                                        >

                                            {
                                                savingNotes
                                                    ? "Saving..."
                                                    : "Save Notes"
                                            }

                                        </button>

                                    </>

                                )}

                            </section>

                        </div>

                    </div>

                </div>

            )}


            {notification && (

                <div
                    className="hr-notification-backdrop"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setNotification(null);

                        }

                    }}
                >

                    <div
                        className={
                            `hr-notification-modal ${notification.type}`
                        }
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="hr-notification-title"
                    >

                        <div className="hr-notification-icon">

                            {notification.type === "success" ? (

                                <CheckCircle2 size={22} />

                            ) : (

                                <AlertCircle size={22} />

                            )}

                        </div>

                        <div className="hr-notification-content">

                            <h2 id="hr-notification-title">
                                {notification.title}
                            </h2>

                            <p>
                                {notification.message}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="hr-notification-close"
                            aria-label="Close notification"
                            onClick={() =>
                                setNotification(null)
                            }
                        >
                            <X size={18} />
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

};


// =========================================================
// SUMMARY CARD
// =========================================================

const SummaryCard = ({
    label,
    value,
    icon,
}) => {

    return (

        <div className="hr-summary-card">

            <div className="summary-icon">

                {icon}

            </div>

            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value || 0}
                </strong>

            </div>

        </div>

    );

};


// =========================================================
// DETAIL
// =========================================================

const Detail = ({
    label,
    value,
}) => {

    return (

        <div className="detail-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "—"}
            </strong>

        </div>

    );

};


export default HRJobApplications;