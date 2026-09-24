import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    RefreshCw,
    Search,
    Send,
    X,
    XCircle,
    Eye,
    AlertCircle,
} from "lucide-react";

import {
    applyHRPersonalLeave,
    getMyHRPersonalLeaves,
} from "../../services/hrpersonalLeaveApi";

import "./HRPersonalLeave.css";


// =====================================================
// CONSTANTS
// =====================================================

const INITIAL_FORM = {
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
};


const LEAVE_TYPES = [
    "Casual Leave",
    "Sick Leave",
    "Earned Leave",
    "Emergency Leave",
    "Personal Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Other",
];


// =====================================================
// HELPERS
// =====================================================

const getLeaveId = (leave) => {

    return (
        leave?._id ||
        leave?.id ||
        ""
    );
};


const getStatus = (leave) => {

    return String(
        leave?.status || "Pending"
    ).toLowerCase();
};


const formatDate = (date) => {

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


const formatDateInput = (date) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    const year =
        parsedDate.getFullYear();

    const month =
        String(
            parsedDate.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            parsedDate.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const calculateDays = (
    fromDate,
    toDate
) => {

    if (
        !fromDate ||
        !toDate
    ) {
        return 0;
    }

    const start =
        new Date(
            `${fromDate}T00:00:00`
        );

    const end =
        new Date(
            `${toDate}T00:00:00`
        );

    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    if (difference < 0) {
        return 0;
    }

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
};


const getStatusLabel = (
    status
) => {

    switch (status) {

        case "approved":
            return "Approved";

        case "cancelled":
            return "Cancelled";

        case "pending":
            return "Pending";

        default:
            return status
                ? String(status)
                    .charAt(0)
                    .toUpperCase() +
                    String(status)
                        .slice(1)
                : "Pending";
    }
};


// =====================================================
// COMPONENT
// =====================================================

const HRPersonalLeave = () => {

    // =================================================
    // STATE
    // =================================================

    const [
        leaves,
        setLeaves,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        form,
        setForm,
    ] = useState(
        INITIAL_FORM
    );

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    const [
        selectedLeave,
        setSelectedLeave,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    const [
        formError,
        setFormError,
    ] = useState("");


    // =================================================
    // LOAD LEAVES
    // =================================================

    const loadLeaves = useCallback(
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
                    await getMyHRPersonalLeaves();


                const receivedLeaves =
                    Array.isArray(
                        response?.leaves
                    )
                        ? response.leaves
                        : Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];


                setLeaves(
                    receivedLeaves
                );

            } catch (err) {

                console.error(
                    "Load HR personal leaves error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load your leave applications."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }

        },
        []
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadLeaves();

    }, [
        loadLeaves,
    ]);


    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setFormError("");
        setError("");
        setSuccess("");
    };


    // =================================================
    // TOTAL DAYS
    // =================================================

    const totalDays = useMemo(
        () => {

            return calculateDays(
                form.fromDate,
                form.toDate
            );

        },
        [
            form.fromDate,
            form.toDate,
        ]
    );


    // =================================================
    // TODAY
    // =================================================

    const today = useMemo(
        () => {

            const date =
                new Date();

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    date.getDate()
                ).padStart(2, "0");

            return `${year}-${month}-${day}`;

        },
        []
    );


    // =================================================
    // VALIDATE FORM
    // =================================================

    const validateForm = () => {

        if (!form.leaveType) {

            setFormError(
                "Please select a leave type."
            );

            return false;
        }


        if (!form.fromDate) {

            setFormError(
                "Please select the start date."
            );

            return false;
        }


        if (!form.toDate) {

            setFormError(
                "Please select the end date."
            );

            return false;
        }


        if (
            form.toDate <
            form.fromDate
        ) {

            setFormError(
                "End date cannot be before start date."
            );

            return false;
        }


        if (totalDays <= 0) {

            setFormError(
                "Please select a valid leave date range."
            );

            return false;
        }


        if (
            !form.reason.trim()
        ) {

            setFormError(
                "Please enter the reason for your leave."
            );

            return false;
        }


        if (
            form.reason.trim().length <
            5
        ) {

            setFormError(
                "Leave reason should contain at least 5 characters."
            );

            return false;
        }


        return true;
    };


    // =================================================
    // SUBMIT LEAVE
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setSuccess("");
        setError("");
        setFormError("");


        if (!validateForm()) {
            return;
        }


        try {

            setSubmitting(true);


            const response =
                await applyHRPersonalLeave({

                    leaveType:
                        form.leaveType.trim(),

                    fromDate:
                        form.fromDate,

                    toDate:
                        form.toDate,

                    reason:
                        form.reason.trim(),

                });


            setSuccess(
                response?.message ||
                "Leave application submitted successfully."
            );


            setForm(
                INITIAL_FORM
            );


            await loadLeaves(
                true
            );


        } catch (err) {

            console.error(
                "Apply HR personal leave error:",
                err
            );


            setFormError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to submit leave application."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // =================================================
    // RESET FORM
    // =================================================

    const handleReset = () => {

        setForm(
            INITIAL_FORM
        );

        setFormError("");
        setError("");
        setSuccess("");
    };


    // =================================================
    // FILTER LEAVES
    // =================================================

    const filteredLeaves = useMemo(
        () => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return leaves.filter(
                (leave) => {

                    const leaveType =
                        String(
                            leave?.leaveType ||
                            ""
                        ).toLowerCase();

                    const reason =
                        String(
                            leave?.reason ||
                            ""
                        ).toLowerCase();

                    const status =
                        getStatus(
                            leave
                        );

                    const matchesSearch =
                        !searchValue ||
                        leaveType.includes(
                            searchValue
                        ) ||
                        reason.includes(
                            searchValue
                        );


                    const matchesStatus =
                        statusFilter ===
                        "All" ||
                        status ===
                        statusFilter.toLowerCase();


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        },
        [
            leaves,
            search,
            statusFilter,
        ]
    );


    // =================================================
    // STATISTICS
    // =================================================

    const statistics = useMemo(
        () => {

            const pending =
                leaves.filter(
                    (leave) =>
                        getStatus(
                            leave
                        ) === "pending"
                ).length;


            const approved =
                leaves.filter(
                    (leave) =>
                        getStatus(
                            leave
                        ) === "approved"
                ).length;


            const cancelled =
                leaves.filter(
                    (leave) =>
                        getStatus(
                            leave
                        ) === "cancelled"
                ).length;


            const totalDays =
                leaves.reduce(
                    (
                        total,
                        leave
                    ) => {

                        const days =
                            Number(
                                leave?.totalDays
                            ) || 0;

                        return (
                            total + days
                        );

                    },
                    0
                );


            return {
                total:
                    leaves.length,

                pending,

                approved,

                cancelled,

                totalDays,
            };

        },
        [
            leaves,
        ]
    );


    // =================================================
    // OPEN DETAILS
    // =================================================

    const handleViewDetails = (
        leave
    ) => {

        setSelectedLeave(
            leave
        );
    };


    // =================================================
    // CLOSE DETAILS
    // =================================================

    const closeDetails = () => {

        setSelectedLeave(
            null
        );
    };


    // =================================================
    // RENDER
    // =================================================

    return (
        <div className="hr-personal-leave-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="hr-personal-leave-header">

                <div>

                    <div className="hr-personal-leave-header-icon">
                        <CalendarDays
                            size={24}
                        />
                    </div>

                    <div>

                        <h1>
                            Personal Leave
                        </h1>

                        <p>
                            Apply for leave and track
                            your applications sent to
                            Super Admin.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-personal-leave-refresh-btn"
                    onClick={() =>
                        loadLeaves(true)
                    }
                    disabled={
                        loading ||
                        refreshing
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "hr-personal-leave-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (

                <div className="hr-personal-leave-alert success">

                    <CheckCircle2
                        size={19}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="hr-personal-leave-alert error">

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
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="hr-personal-leave-stats">


                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon total">
                        <FileText
                            size={21}
                        />
                    </div>

                    <div>

                        <span>
                            Total Applications
                        </span>

                        <strong>
                            {statistics.total}
                        </strong>

                    </div>

                </div>


                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon pending">
                        <Clock3
                            size={21}
                        />
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {statistics.pending}
                        </strong>

                    </div>

                </div>


                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon approved">
                        <CheckCircle2
                            size={21}
                        />
                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <strong>
                            {statistics.approved}
                        </strong>

                    </div>

                </div>


                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon cancelled">
                        <XCircle
                            size={21}
                        />
                    </div>

                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {statistics.cancelled}
                        </strong>

                    </div>

                </div>


                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon days">
                        <CalendarDays
                            size={21}
                        />
                    </div>

                    <div>

                        <span>
                            Total Days
                        </span>

                        <strong>
                            {statistics.totalDays}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="hr-personal-leave-content">


                {/* =================================================
                    APPLY FORM
                ================================================= */}

                <section className="hr-personal-leave-form-card">

                    <div className="hr-personal-leave-card-header">

                        <div>

                            <h2>
                                Apply for Leave
                            </h2>

                            <p>
                                Submit your personal leave
                                request to Super Admin.
                            </p>

                        </div>

                        <div className="hr-personal-leave-card-header-icon">

                            <Send
                                size={20}
                            />

                        </div>

                    </div>


                    {formError && (

                        <div className="hr-personal-leave-form-error">

                            <AlertCircle
                                size={17}
                            />

                            <span>
                                {formError}
                            </span>

                        </div>

                    )}


                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="hr-personal-leave-form"
                    >


                        {/* LEAVE TYPE */}

                        <div className="hr-personal-leave-form-group">

                            <label htmlFor="leaveType">

                                Leave Type

                                <span>
                                    *
                                </span>

                            </label>

                            <select
                                id="leaveType"
                                name="leaveType"
                                value={
                                    form.leaveType
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    submitting
                                }
                            >

                                <option value="">
                                    Select leave type
                                </option>

                                {LEAVE_TYPES.map(
                                    (type) => (

                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* DATE ROW */}

                        <div className="hr-personal-leave-date-row">


                            {/* FROM DATE */}

                            <div className="hr-personal-leave-form-group">

                                <label htmlFor="fromDate">

                                    From Date

                                    <span>
                                        *
                                    </span>

                                </label>

                                <div className="hr-personal-leave-input-icon">

                                    <CalendarDays
                                        size={17}
                                    />

                                    <input
                                        id="fromDate"
                                        type="date"
                                        name="fromDate"
                                        value={
                                            form.fromDate
                                        }
                                        min={today}
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            submitting
                                        }
                                    />

                                </div>

                            </div>


                            {/* TO DATE */}

                            <div className="hr-personal-leave-form-group">

                                <label htmlFor="toDate">

                                    To Date

                                    <span>
                                        *
                                    </span>

                                </label>

                                <div className="hr-personal-leave-input-icon">

                                    <CalendarDays
                                        size={17}
                                    />

                                    <input
                                        id="toDate"
                                        type="date"
                                        name="toDate"
                                        value={
                                            form.toDate
                                        }
                                        min={
                                            form.fromDate ||
                                            today
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            submitting
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* TOTAL DAYS */}

                        <div className="hr-personal-leave-days-preview">

                            <div>

                                <CalendarDays
                                    size={18}
                                />

                                <span>
                                    Requested Leave
                                </span>

                            </div>

                            <strong>
                                {totalDays > 0
                                    ? `${totalDays} ${
                                        totalDays === 1
                                            ? "day"
                                            : "days"
                                    }`
                                    : "0 days"}
                            </strong>

                        </div>


                        {/* REASON */}

                        <div className="hr-personal-leave-form-group">

                            <label htmlFor="reason">

                                Reason

                                <span>
                                    *
                                </span>

                            </label>

                            <textarea
                                id="reason"
                                name="reason"
                                value={
                                    form.reason
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter the reason for your leave..."
                                rows={5}
                                maxLength={1000}
                                disabled={
                                    submitting
                                }
                            />

                            <div className="hr-personal-leave-character-count">

                                {form.reason.length}
                                /1000

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="hr-personal-leave-form-actions">

                            <button
                                type="button"
                                className="hr-personal-leave-reset-btn"
                                onClick={
                                    handleReset
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Reset
                            </button>


                            <button
                                type="submit"
                                className="hr-personal-leave-submit-btn"
                                disabled={
                                    submitting
                                }
                            >

                                {submitting ? (

                                    <>
                                        <RefreshCw
                                            size={17}
                                            className="hr-personal-leave-spin"
                                        />

                                        Submitting...

                                    </>

                                ) : (

                                    <>
                                        <Send
                                            size={17}
                                        />

                                        Submit Leave

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    APPLICATION HISTORY
                ================================================= */}

                <section className="hr-personal-leave-history-card">

                    <div className="hr-personal-leave-card-header">

                        <div>

                            <h2>
                                My Leave Applications
                            </h2>

                            <p>
                                Track the status of your
                                leave requests.
                            </p>

                        </div>

                        <div className="hr-personal-leave-card-header-icon">

                            <FileText
                                size={20}
                            />

                        </div>

                    </div>


                    {/* FILTERS */}

                    <div className="hr-personal-leave-filters">

                        <div className="hr-personal-leave-search">

                            <Search
                                size={17}
                            />

                            <input
                                type="text"
                                placeholder="Search leave type or reason..."
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
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
                                        size={15}
                                    />
                                </button>

                            )}

                        </div>


                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="hr-personal-leave-status-filter"
                        >

                            <option value="All">
                                All Status
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>

                        </select>

                    </div>


                    {/* TABLE */}

                    <div className="hr-personal-leave-table-wrapper">

                        {loading ? (

                            <div className="hr-personal-leave-loading">

                                <RefreshCw
                                    size={25}
                                    className="hr-personal-leave-spin"
                                />

                                <p>
                                    Loading your leave applications...
                                </p>

                            </div>

                        ) : filteredLeaves.length === 0 ? (

                            <div className="hr-personal-leave-empty">

                                <div className="hr-personal-leave-empty-icon">

                                    <FileText
                                        size={28}
                                    />

                                </div>

                                <h3>
                                    No leave applications found
                                </h3>

                                <p>
                                    {leaves.length === 0
                                        ? "You haven't submitted any leave applications yet."
                                        : "No applications match your current search or filter."}
                                </p>

                            </div>

                        ) : (

                            <table className="hr-personal-leave-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Leave Type
                                        </th>

                                        <th>
                                            From
                                        </th>

                                        <th>
                                            To
                                        </th>

                                        <th>
                                            Days
                                        </th>

                                        <th>
                                            Reason
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Applied
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredLeaves.map(
                                        (leave) => {

                                            const id =
                                                getLeaveId(
                                                    leave
                                                );

                                            const status =
                                                getStatus(
                                                    leave
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        id
                                                    }
                                                >

                                                    <td>

                                                        <div className="hr-personal-leave-type-cell">

                                                            <div className="hr-personal-leave-type-icon">

                                                                <CalendarDays
                                                                    size={16}
                                                                />

                                                            </div>

                                                            <span>
                                                                {
                                                                    leave?.leaveType ||
                                                                    "-"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                leave?.fromDate
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                leave?.toDate
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                leave?.totalDays ||
                                                                calculateDays(
                                                                    formatDateInput(
                                                                        leave?.fromDate
                                                                    ),
                                                                    formatDateInput(
                                                                        leave?.toDate
                                                                    )
                                                                )
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className="hr-personal-leave-reason-cell"
                                                            title={
                                                                leave?.reason ||
                                                                ""
                                                            }
                                                        >
                                                            {
                                                                leave?.reason ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`hr-personal-leave-status ${status}`}
                                                        >

                                                            {status === "pending" && (
                                                                <Clock3
                                                                    size={14}
                                                                />
                                                            )}

                                                            {status === "approved" && (
                                                                <CheckCircle2
                                                                    size={14}
                                                                />
                                                            )}

                                                            {status === "cancelled" && (
                                                                <XCircle
                                                                    size={14}
                                                                />
                                                            )}

                                                            {
                                                                getStatusLabel(
                                                                    status
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                leave?.createdAt
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="hr-personal-leave-view-btn"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    leave
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={15}
                                                            />

                                                            View

                                                        </button>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>


                    {/* RESULT COUNT */}

                    {!loading &&
                        filteredLeaves.length >
                        0 && (

                            <div className="hr-personal-leave-table-footer">

                                Showing{" "}
                                <strong>
                                    {
                                        filteredLeaves.length
                                    }
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {
                                        leaves.length
                                    }
                                </strong>{" "}
                                applications

                            </div>

                        )}

                </section>

            </div>


            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedLeave && (

                <div
                    className="hr-personal-leave-modal-overlay"
                    onClick={
                        closeDetails
                    }
                >

                    <div
                        className="hr-personal-leave-modal"
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="hr-personal-leave-modal-header">

                            <div>

                                <h2>
                                    Leave Application
                                </h2>

                                <p>
                                    Application details
                                </p>

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


                        {/* MODAL BODY */}

                        <div className="hr-personal-leave-modal-body">


                            {/* STATUS */}

                            <div className="hr-personal-leave-modal-status-row">

                                <span>
                                    Current Status
                                </span>

                                <span
                                    className={`hr-personal-leave-status ${getStatus(
                                        selectedLeave
                                    )}`}
                                >

                                    {getStatus(
                                        selectedLeave
                                    ) === "pending" && (
                                        <Clock3
                                            size={14}
                                        />
                                    )}

                                    {getStatus(
                                        selectedLeave
                                    ) === "approved" && (
                                        <CheckCircle2
                                            size={14}
                                        />
                                    )}

                                    {getStatus(
                                        selectedLeave
                                    ) === "cancelled" && (
                                        <XCircle
                                            size={14}
                                        />
                                    )}

                                    {
                                        getStatusLabel(
                                            getStatus(
                                                selectedLeave
                                            )
                                        )
                                    }

                                </span>

                            </div>


                            {/* DETAILS GRID */}

                            <div className="hr-personal-leave-details-grid">

                                <div className="hr-personal-leave-detail-item">

                                    <span>
                                        Leave Type
                                    </span>

                                    <strong>
                                        {
                                            selectedLeave?.leaveType ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div className="hr-personal-leave-detail-item">

                                    <span>
                                        Total Days
                                    </span>

                                    <strong>
                                        {
                                            selectedLeave?.totalDays ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div className="hr-personal-leave-detail-item">

                                    <span>
                                        From Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedLeave?.fromDate
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="hr-personal-leave-detail-item">

                                    <span>
                                        To Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedLeave?.toDate
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="hr-personal-leave-detail-item">

                                    <span>
                                        Applied On
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                selectedLeave?.createdAt
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* REASON */}

                            <div className="hr-personal-leave-detail-block">

                                <span>
                                    Reason
                                </span>

                                <p>
                                    {
                                        selectedLeave?.reason ||
                                        "No reason provided."
                                    }
                                </p>

                            </div>


                            {/* ADMIN REMARK */}

                            {selectedLeave?.adminRemark && (

                                <div className="hr-personal-leave-admin-remark">

                                    <div>

                                        <FileText
                                            size={17}
                                        />

                                        <span>
                                            Super Admin Remark
                                        </span>

                                    </div>

                                    <p>
                                        {
                                            selectedLeave.adminRemark
                                        }
                                    </p>

                                </div>

                            )}


                            {/* APPROVED */}

                            {selectedLeave?.approvedAt && (

                                <div className="hr-personal-leave-action-info approved">

                                    <CheckCircle2
                                        size={17}
                                    />

                                    <span>
                                        Approved on{" "}
                                        {
                                            formatDate(
                                                selectedLeave.approvedAt
                                            )
                                        }
                                    </span>

                                </div>

                            )}


                            {/* CANCELLED */}

                            {selectedLeave?.cancelledAt && (

                                <div className="hr-personal-leave-action-info cancelled">

                                    <XCircle
                                        size={17}
                                    />

                                    <span>
                                        Cancelled on{" "}
                                        {
                                            formatDate(
                                                selectedLeave.cancelledAt
                                            )
                                        }
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="hr-personal-leave-modal-footer">

                            <button
                                type="button"
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


export default HRPersonalLeave;