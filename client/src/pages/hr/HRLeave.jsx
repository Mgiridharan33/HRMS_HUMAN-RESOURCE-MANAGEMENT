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
    Loader2,
    RefreshCw,
    Search,
    Users,
    X,
    XCircle,
    Eye,
    Mail,
    Phone,
    BriefcaseBusiness,
} from "lucide-react";

import hrLeaveApi from "../../services/hrLeaveApi";

import "./HRLeave.css";


// =====================================================
// HELPERS
// =====================================================

const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


// =====================================================
// EMPLOYEE NAME
// =====================================================

const getEmployeeName = (employee) => {

    if (!employee) {
        return "Unknown Employee";
    }

    if (
        typeof employee === "object" &&
        employee.name &&
        String(employee.name).trim()
    ) {
        return String(employee.name).trim();
    }

    const firstName =
        employee?.firstName || "";

    const lastName =
        employee?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    if (fullName) {
        return fullName;
    }

    return "Unknown Employee";
};


// =====================================================
// EMPLOYEE EMAIL
// =====================================================

const getEmployeeEmail = (employee) => {

    if (
        employee &&
        typeof employee === "object" &&
        employee.email
    ) {
        return String(employee.email);
    }

    return "-";
};


// =====================================================
// EMPLOYEE PHONE
// =====================================================

const getEmployeePhone = (employee) => {

    if (
        employee &&
        typeof employee === "object" &&
        employee.phone
    ) {
        return String(employee.phone);
    }

    return "No phone number";
};


// =====================================================
// EMPLOYEE ROLE
// =====================================================

const getEmployeeRole = (employee) => {

    if (
        employee &&
        typeof employee === "object" &&
        employee.role
    ) {
        return String(employee.role);
    }

    return "Employee";
};


// =====================================================
// INITIALS
// =====================================================

const getInitials = (employee) => {

    const name =
        getEmployeeName(employee);

    if (
        !name ||
        name === "Unknown Employee"
    ) {
        return "U";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        `${parts[0][0]}${parts[parts.length - 1][0]}`
    ).toUpperCase();
};


// =====================================================
// STATUS CLASS
// =====================================================

const getStatusClass = (status) => {

    switch (status) {

        case "Approved":
            return "approved";

        case "Cancelled":
            return "cancelled";

        case "Pending":
        default:
            return "pending";
    }
};


// =====================================================
// COMPONENT
// =====================================================

const HRLeave = () => {

    // =================================================
    // DATA
    // =================================================

    const [
        leaves,
        setLeaves,
    ] = useState([]);


    // =================================================
    // UI STATE
    // =================================================

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        actionLoading,
        setActionLoading,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");


    // =================================================
    // FILTER STATE
    // =================================================

    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    const [
        leaveTypeFilter,
        setLeaveTypeFilter,
    ] = useState("All");


    // =================================================
    // MODALS
    // =================================================

    const [
        selectedLeave,
        setSelectedLeave,
    ] = useState(null);

    const [
        cancelModal,
        setCancelModal,
    ] = useState(null);

    const [
        cancellationReason,
        setCancellationReason,
    ] = useState("");


    // =================================================
    // LOAD LEAVES
    // =================================================

    const loadLeaves = useCallback(
        async (showLoader = true) => {

            try {

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const result =
                    await hrLeaveApi.getAllLeaves();

                if (result?.success) {

                    const receivedLeaves =
                        Array.isArray(result?.leaves)
                            ? result.leaves
                            : [];

                    setLeaves(
                        receivedLeaves
                    );

                } else {

                    setLeaves([]);

                    setError(
                        result?.message ||
                        "Failed to load leave requests."
                    );
                }

            } catch (err) {

                console.error(
                    "GET HR LEAVES ERROR:",
                    err
                );

                setLeaves([]);

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load leave requests."
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

        loadLeaves(true);

    }, [loadLeaves]);


    // =================================================
    // AUTO HIDE SUCCESS
    // =================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer =
            setTimeout(() => {
                setSuccess("");
            }, 4000);

        return () => {
            clearTimeout(timer);
        };

    }, [success]);


    // =================================================
    // LEAVE TYPES
    // =================================================

    const leaveTypes = useMemo(() => {

        const types =
            leaves
                .map(
                    (leave) =>
                        leave?.leaveType
                )
                .filter(Boolean);

        return [
            ...new Set(types),
        ];

    }, [leaves]);


    // =================================================
    // FILTERED LEAVES
    // =================================================

    const filteredLeaves = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();

        return leaves.filter((leave) => {

            const employee =
                leave?.employee;

            const employeeName =
                getEmployeeName(
                    employee
                ).toLowerCase();

            const employeeEmail =
                getEmployeeEmail(
                    employee
                ).toLowerCase();

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


            const matchesSearch =
                !search ||
                employeeName.includes(search) ||
                employeeEmail.includes(search) ||
                leaveType.includes(search) ||
                reason.includes(search);


            const matchesStatus =
                statusFilter === "All" ||
                leave?.status === statusFilter;


            const matchesLeaveType =
                leaveTypeFilter === "All" ||
                leave?.leaveType === leaveTypeFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesLeaveType
            );
        });

    }, [
        leaves,
        searchTerm,
        statusFilter,
        leaveTypeFilter,
    ]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary = useMemo(() => {

        const total =
            leaves.length;

        const pending =
            leaves.filter(
                (leave) =>
                    leave?.status ===
                    "Pending"
            ).length;

        const approved =
            leaves.filter(
                (leave) =>
                    leave?.status ===
                    "Approved"
            ).length;

        const cancelled =
            leaves.filter(
                (leave) =>
                    leave?.status ===
                    "Cancelled"
            ).length;

        const totalDays =
            leaves.reduce(
                (
                    totalValue,
                    leave
                ) => {

                    return (
                        totalValue +
                        Number(
                            leave?.totalDays ||
                            0
                        )
                    );

                },
                0
            );

        return {
            total,
            pending,
            approved,
            cancelled,
            totalDays,
        };

    }, [leaves]);


    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh = async () => {

        setSuccess("");
        setError("");

        await loadLeaves(false);
    };


    // =================================================
    // APPROVE LEAVE
    // =================================================

    const handleApprove = async (leaveId) => {

        if (!leaveId) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to approve this leave request?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `approve-${leaveId}`
            );

            setError("");
            setSuccess("");

            const result =
                await hrLeaveApi.approveLeave(
                    leaveId
                );

            if (result?.success) {

                setSuccess(
                    result.message ||
                    "Leave approved successfully."
                );

                if (result?.leave) {

                    setLeaves(
                        (previous) =>
                            previous.map(
                                (leave) =>
                                    leave?._id ===
                                    leaveId
                                        ? result.leave
                                        : leave
                            )
                    );

                    if (
                        selectedLeave?._id ===
                        leaveId
                    ) {

                        setSelectedLeave(
                            result.leave
                        );
                    }

                } else {

                    await loadLeaves(false);
                }

            } else {

                setError(
                    result?.message ||
                    "Failed to approve leave."
                );
            }

        } catch (err) {

            console.error(
                "APPROVE LEAVE ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to approve leave request."
            );

        } finally {

            setActionLoading("");
        }
    };


    // =================================================
    // OPEN CANCEL MODAL
    // =================================================

    const openCancelModal = (leave) => {

        if (!leave?._id) {
            return;
        }

        setCancellationReason("");

        setCancelModal(
            leave
        );

        setError("");
        setSuccess("");
    };


    // =================================================
    // CLOSE CANCEL MODAL
    // =================================================

    const closeCancelModal = () => {

        if (actionLoading) {
            return;
        }

        setCancelModal(null);
        setCancellationReason("");
    };


    // =================================================
    // CANCEL LEAVE
    // =================================================

    const handleCancelLeave = async (event) => {

        event.preventDefault();

        if (!cancelModal?._id) {

            setError(
                "Leave request ID is missing."
            );

            return;
        }

        const cleanReason =
            String(
                cancellationReason || ""
            ).trim();


        // VALIDATION

        if (!cleanReason) {

            setError(
                "Cancellation reason is required."
            );

            return;
        }

        if (cleanReason.length < 3) {

            setError(
                "Cancellation reason must contain at least 3 characters."
            );

            return;
        }

        if (cleanReason.length > 500) {

            setError(
                "Cancellation reason cannot exceed 500 characters."
            );

            return;
        }


        // CONFIRM

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this leave request?"
            );

        if (!confirmed) {
            return;
        }


        const leaveId =
            cancelModal._id;


        try {

            setActionLoading(
                `cancel-${leaveId}`
            );

            setError("");
            setSuccess("");


            const result =
                await hrLeaveApi.cancelLeave(
                    leaveId,
                    cleanReason
                );


            if (result?.success) {

                setSuccess(
                    result.message ||
                    "Leave cancelled successfully."
                );


                if (result?.leave) {

                    setLeaves(
                        (previous) =>
                            previous.map(
                                (leave) =>
                                    leave?._id ===
                                    leaveId
                                        ? result.leave
                                        : leave
                            )
                    );


                    if (
                        selectedLeave?._id ===
                        leaveId
                    ) {

                        setSelectedLeave(
                            result.leave
                        );
                    }

                } else {

                    await loadLeaves(false);
                }


                setCancelModal(null);
                setCancellationReason("");

            } else {

                setError(
                    result?.message ||
                    "Failed to cancel leave request."
                );
            }

        } catch (err) {

            console.error(
                "CANCEL LEAVE ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to cancel leave request."
            );

        } finally {

            setActionLoading("");
        }
    };


    // =================================================
    // DETAILS
    // =================================================

    const openDetails = (leave) => {

        setSelectedLeave(
            leave
        );

        setError("");
    };


    // =================================================
    // CLOSE DETAILS
    // =================================================

    const closeDetails = () => {

        if (actionLoading) {
            return;
        }

        setSelectedLeave(null);
    };


    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters = () => {

        setSearchTerm("");
        setStatusFilter("All");
        setLeaveTypeFilter("All");
    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="hr-leave-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-leave-header">

                <div className="hr-leave-title">

                    <div className="hr-leave-title-icon">
                        <CalendarDays size={24} />
                    </div>

                    <div>

                        <h1>
                            Leave Management
                        </h1>

                        <p>
                            Review and manage employee leave requests
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-leave-refresh"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "hr-leave-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {success && (

                <div className="hr-leave-alert success">

                    <CheckCircle2 size={18} />

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


            {error && (

                <div className="hr-leave-alert error">

                    <XCircle size={18} />

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

            <div className="hr-leave-summary">

                <div className="hr-leave-summary-card">

                    <div className="hr-leave-summary-icon">
                        <FileText size={20} />
                    </div>

                    <div>
                        <span>Total Requests</span>
                        <strong>
                            {summary.total}
                        </strong>
                    </div>

                </div>


                <div className="hr-leave-summary-card">

                    <div className="hr-leave-summary-icon pending">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>
                            {summary.pending}
                        </strong>
                    </div>

                </div>


                <div className="hr-leave-summary-card">

                    <div className="hr-leave-summary-icon approved">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Approved</span>
                        <strong>
                            {summary.approved}
                        </strong>
                    </div>

                </div>


                <div className="hr-leave-summary-card">

                    <div className="hr-leave-summary-icon cancelled">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Cancelled</span>
                        <strong>
                            {summary.cancelled}
                        </strong>
                    </div>

                </div>


                <div className="hr-leave-summary-card">

                    <div className="hr-leave-summary-icon days">
                        <CalendarDays size={20} />
                    </div>

                    <div>
                        <span>Leave Days</span>
                        <strong>
                            {summary.totalDays}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <section className="hr-leave-filter-card">

                <div className="hr-leave-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search employee name, email, leave type or reason..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                    {searchTerm && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearchTerm("")
                            }
                        >
                            <X size={15} />
                        </button>

                    )}

                </div>


                <div className="hr-leave-filter">

                    <label>
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
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


                <div className="hr-leave-filter">

                    <label>
                        Leave Type
                    </label>

                    <select
                        value={leaveTypeFilter}
                        onChange={(event) =>
                            setLeaveTypeFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Types
                        </option>

                        {leaveTypes.map(
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

            </section>


            {/* =================================================
                TABLE
            ================================================= */}

            <section className="hr-leave-table-card">

                <div className="hr-leave-table-header">

                    <div>

                        <h2>
                            Employee Leave Requests
                        </h2>

                        <p>
                            {filteredLeaves.length} of{" "}
                            {leaves.length} requests
                        </p>

                    </div>

                    <div className="hr-leave-table-header-count">

                        <Users size={16} />

                        {leaves.length}

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div className="hr-leave-loading">

                        <Loader2
                            size={32}
                            className="hr-leave-spin"
                        />

                        <span>
                            Loading leave requests...
                        </span>

                    </div>

                ) : filteredLeaves.length === 0 ? (

                    <div className="hr-leave-empty">

                        <FileText size={45} />

                        <h3>
                            No leave requests found
                        </h3>

                        <p>
                            {leaves.length === 0
                                ? "There are no employee leave requests yet."
                                : "No leave requests match your current filters."
                            }
                        </p>

                        {(searchTerm ||
                            statusFilter !== "All" ||
                            leaveTypeFilter !== "All") && (

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>

                        )}

                    </div>

                ) : (

                    <div className="hr-leave-table-wrapper">

                        <table className="hr-leave-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

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
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredLeaves.map(
                                    (leave) => {

                                        const employee =
                                            leave?.employee;

                                        const employeeName =
                                            getEmployeeName(
                                                employee
                                            );

                                        const employeeEmail =
                                            getEmployeeEmail(
                                                employee
                                            );

                                        const status =
                                            leave?.status ||
                                            "Pending";

                                        const statusClass =
                                            getStatusClass(
                                                status
                                            );

                                        const isApproving =
                                            actionLoading ===
                                            `approve-${leave._id}`;

                                        const isCancelling =
                                            actionLoading ===
                                            `cancel-${leave._id}`;


                                        return (

                                            <tr
                                                key={
                                                    leave?._id
                                                }
                                            >


                                                {/* EMPLOYEE */}

                                                <td>

                                                    <div className="hr-leave-employee">

                                                        <div className="hr-leave-avatar">

                                                            {employee?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        employee.profileImage
                                                                    }
                                                                    alt={
                                                                        employeeName
                                                                    }
                                                                    onError={(
                                                                        event
                                                                    ) => {

                                                                        event.currentTarget.style.display =
                                                                            "none";

                                                                        const fallback =
                                                                            event.currentTarget
                                                                                .parentElement
                                                                                ?.querySelector(
                                                                                    ".hr-leave-avatar-fallback"
                                                                                );

                                                                        if (
                                                                            fallback
                                                                        ) {

                                                                            fallback.style.display =
                                                                                "flex";
                                                                        }

                                                                    }}
                                                                />

                                                            ) : null}


                                                            <span
                                                                className="hr-leave-avatar-fallback"
                                                                style={{
                                                                    display:
                                                                        employee?.profileImage
                                                                            ? "none"
                                                                            : "flex",
                                                                }}
                                                            >
                                                                {getInitials(
                                                                    employee
                                                                )}
                                                            </span>

                                                        </div>


                                                        <div className="hr-leave-employee-info">

                                                            <strong>
                                                                {employeeName}
                                                            </strong>

                                                            <span>
                                                                <Mail size={12} />

                                                                {employeeEmail}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* LEAVE TYPE */}

                                                <td>

                                                    <span className="hr-leave-type">
                                                        {leave?.leaveType || "-"}
                                                    </span>

                                                </td>


                                                {/* FROM */}

                                                <td>
                                                    {formatDate(
                                                        leave?.startDate
                                                    )}
                                                </td>


                                                {/* TO */}

                                                <td>
                                                    {formatDate(
                                                        leave?.endDate
                                                    )}
                                                </td>


                                                {/* DAYS */}

                                                <td>

                                                    <strong className="hr-leave-days">
                                                        {leave?.totalDays || 0}
                                                    </strong>

                                                </td>


                                                {/* REASON */}

                                                <td>

                                                    <div
                                                        className="hr-leave-reason"
                                                        title={
                                                            leave?.reason || ""
                                                        }
                                                    >
                                                        {leave?.reason || "-"}
                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `hr-leave-status ${statusClass}`
                                                        }
                                                    >

                                                        {status === "Approved" && (
                                                            <CheckCircle2 size={13} />
                                                        )}

                                                        {status === "Cancelled" && (
                                                            <XCircle size={13} />
                                                        )}

                                                        {status === "Pending" && (
                                                            <Clock3 size={13} />
                                                        )}

                                                        {status}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="hr-leave-actions">

                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            className="hr-leave-action view"
                                                            title="View details"
                                                            onClick={() =>
                                                                openDetails(
                                                                    leave
                                                                )
                                                            }
                                                        >
                                                            <Eye size={16} />
                                                        </button>


                                                        {/* APPROVE */}

                                                        {status === "Pending" && (

                                                            <button
                                                                type="button"
                                                                className="hr-leave-action approve"
                                                                title="Approve leave"
                                                                disabled={
                                                                    Boolean(
                                                                        actionLoading
                                                                    )
                                                                }
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        leave._id
                                                                    )
                                                                }
                                                            >

                                                                {isApproving ? (

                                                                    <Loader2
                                                                        size={16}
                                                                        className="hr-leave-spin"
                                                                    />

                                                                ) : (

                                                                    <CheckCircle2
                                                                        size={16}
                                                                    />

                                                                )}

                                                            </button>

                                                        )}


                                                        {/* CANCEL */}

                                                        {status === "Pending" && (

                                                            <button
                                                                type="button"
                                                                className="hr-leave-action cancel"
                                                                title="Cancel leave"
                                                                disabled={
                                                                    Boolean(
                                                                        actionLoading
                                                                    )
                                                                }
                                                                onClick={() =>
                                                                    openCancelModal(
                                                                        leave
                                                                    )
                                                                }
                                                            >

                                                                {isCancelling ? (

                                                                    <Loader2
                                                                        size={16}
                                                                        className="hr-leave-spin"
                                                                    />

                                                                ) : (

                                                                    <XCircle
                                                                        size={16}
                                                                    />

                                                                )}

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

            </section>


            {/* =================================================
                DETAILS MODAL
                NO HR RESPONSE SECTION
            ================================================= */}

            {selectedLeave && (

                <div
                    className="hr-leave-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails();
                        }

                    }}
                >

                    <div className="hr-leave-modal">


                        {/* HEADER */}

                        <div className="hr-leave-modal-header">

                            <div>

                                <h2>
                                    Leave Request Details
                                </h2>

                                <p>
                                    Complete information about this request
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeDetails
                                }
                            >
                                <X size={19} />
                            </button>

                        </div>


                        {/* EMPLOYEE */}

                        <div className="hr-leave-detail-employee">

                            <div className="hr-leave-detail-avatar">

                                {selectedLeave.employee?.profileImage ? (

                                    <img
                                        src={
                                            selectedLeave.employee.profileImage
                                        }
                                        alt={
                                            getEmployeeName(
                                                selectedLeave.employee
                                            )
                                        }
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                "none";

                                            const fallback =
                                                event.currentTarget
                                                    .parentElement
                                                    ?.querySelector(
                                                        ".hr-leave-detail-avatar-fallback"
                                                    );

                                            if (fallback) {

                                                fallback.style.display =
                                                    "flex";
                                            }

                                        }}
                                    />

                                ) : null}


                                <span
                                    className="hr-leave-detail-avatar-fallback"
                                    style={{
                                        display:
                                            selectedLeave.employee?.profileImage
                                                ? "none"
                                                : "flex",
                                    }}
                                >
                                    {getInitials(
                                        selectedLeave.employee
                                    )}
                                </span>

                            </div>


                            <div className="hr-leave-detail-employee-info">

                                <h3>
                                    {getEmployeeName(
                                        selectedLeave.employee
                                    )}
                                </h3>

                                <p>
                                    <Mail size={14} />

                                    {getEmployeeEmail(
                                        selectedLeave.employee
                                    )}
                                </p>

                                <span>
                                    <Phone size={14} />

                                    {getEmployeePhone(
                                        selectedLeave.employee
                                    )}
                                </span>

                            </div>

                        </div>


                        {/* EMPLOYEE META */}

                        <div className="hr-leave-detail-meta">

                            <div>

                                <BriefcaseBusiness size={15} />

                                <span>
                                    {getEmployeeRole(
                                        selectedLeave.employee
                                    )}
                                </span>

                            </div>


                            {selectedLeave.employee?.isActive !== undefined && (

                                <div>

                                    <span
                                        className={
                                            selectedLeave.employee.isActive
                                                ? "hr-leave-active-dot"
                                                : "hr-leave-inactive-dot"
                                        }
                                    />

                                    <span>

                                        {selectedLeave.employee.isActive
                                            ? "Active Employee"
                                            : "Inactive Employee"}

                                    </span>

                                </div>

                            )}

                        </div>


                        {/* STATUS */}

                        <div className="hr-leave-detail-status-row">

                            <span>
                                Current Status
                            </span>

                            <span
                                className={
                                    `hr-leave-status ${getStatusClass(
                                        selectedLeave.status
                                    )}`
                                }
                            >

                                {selectedLeave.status === "Approved" && (
                                    <CheckCircle2 size={13} />
                                )}

                                {selectedLeave.status === "Cancelled" && (
                                    <XCircle size={13} />
                                )}

                                {selectedLeave.status === "Pending" && (
                                    <Clock3 size={13} />
                                )}

                                {selectedLeave.status || "Pending"}

                            </span>

                        </div>


                        {/* DETAILS GRID */}

                        <div className="hr-leave-details-grid">

                            <div>

                                <span>
                                    Leave Type
                                </span>

                                <strong>
                                    {selectedLeave.leaveType || "-"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total Days
                                </span>

                                <strong>
                                    {selectedLeave.totalDays || 0}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Start Date
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedLeave.startDate
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    End Date
                                </span>

                                <strong>
                                    {formatDate(
                                        selectedLeave.endDate
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* REASON */}

                        <div className="hr-leave-detail-section">

                            <h4>
                                Employee Reason
                            </h4>

                            <p>
                                {selectedLeave.reason ||
                                    "No reason provided."}
                            </p>

                        </div>


                        {/* =================================================
                            CANCELLED REASON
                            ONLY THE ORIGINAL CANCELLATION REASON
                            NO HR RESPONSE DETAILS
                        ================================================= */}

                        {selectedLeave.status === "Cancelled" &&
                            selectedLeave.cancellationReason && (

                                <div className="hr-leave-detail-section">

                                    <h4>
                                        Cancellation Reason
                                    </h4>

                                    <p>
                                        {selectedLeave.cancellationReason}
                                    </p>

                                </div>

                            )}


                        {/* PENDING ACTIONS */}

                        {selectedLeave.status === "Pending" && (

                            <div className="hr-leave-modal-actions">

                                <button
                                    type="button"
                                    className="hr-leave-modal-approve"
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                    onClick={() =>
                                        handleApprove(
                                            selectedLeave._id
                                        )
                                    }
                                >

                                    {actionLoading ===
                                        `approve-${selectedLeave._id}` ? (

                                        <Loader2
                                            size={17}
                                            className="hr-leave-spin"
                                        />

                                    ) : (

                                        <CheckCircle2
                                            size={17}
                                        />

                                    )}

                                    Approve Leave

                                </button>


                                <button
                                    type="button"
                                    className="hr-leave-modal-cancel"
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                    onClick={() =>
                                        openCancelModal(
                                            selectedLeave
                                        )
                                    }
                                >

                                    <XCircle size={17} />

                                    Cancel Leave

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                CANCEL MODAL
            ================================================= */}

            {cancelModal && (

                <div
                    className="hr-leave-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !actionLoading
                        ) {
                            closeCancelModal();
                        }

                    }}
                >

                    <div className="hr-leave-cancel-modal">


                        {/* HEADER */}

                        <div className="hr-leave-cancel-header">

                            <div className="hr-leave-cancel-icon">
                                <XCircle size={22} />
                            </div>

                            <div>

                                <h2>
                                    Cancel Leave Request
                                </h2>

                                <p>
                                    This action will mark the request as cancelled.
                                </p>

                            </div>

                            <button
                                type="button"
                                disabled={
                                    Boolean(
                                        actionLoading
                                    )
                                }
                                onClick={
                                    closeCancelModal
                                }
                            >
                                <X size={18} />
                            </button>

                        </div>


                        {/* EMPLOYEE */}

                        <div className="hr-leave-cancel-employee">

                            <div className="hr-leave-cancel-avatar">

                                {cancelModal.employee?.profileImage ? (

                                    <img
                                        src={
                                            cancelModal.employee.profileImage
                                        }
                                        alt={
                                            getEmployeeName(
                                                cancelModal.employee
                                            )
                                        }
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                "none";

                                            const parent =
                                                event.currentTarget.parentElement;

                                            if (parent) {

                                                parent.innerHTML =
                                                    `<span>${getInitials(
                                                        cancelModal.employee
                                                    )}</span>`;
                                            }

                                        }}
                                    />

                                ) : (

                                    <span>
                                        {getInitials(
                                            cancelModal.employee
                                        )}
                                    </span>

                                )}

                            </div>


                            <div>

                                <strong>
                                    {getEmployeeName(
                                        cancelModal.employee
                                    )}
                                </strong>

                                <span>
                                    {getEmployeeEmail(
                                        cancelModal.employee
                                    )}
                                </span>

                                <small>

                                    {cancelModal.leaveType}

                                    {" • "}

                                    {cancelModal.totalDays}

                                    {" "}

                                    {Number(
                                        cancelModal.totalDays
                                    ) === 1
                                        ? "Day"
                                        : "Days"}

                                </small>

                            </div>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleCancelLeave
                            }
                        >

                            <div className="hr-leave-cancel-field">

                                <div className="hr-leave-cancel-label">

                                    <label>
                                        Cancellation Reason
                                    </label>

                                    <span>
                                        {cancellationReason.length}/500
                                    </span>

                                </div>

                                <textarea
                                    rows={5}
                                    maxLength={500}
                                    autoFocus
                                    placeholder="Enter the reason for cancelling this leave request..."
                                    value={
                                        cancellationReason
                                    }
                                    onChange={(event) =>
                                        setCancellationReason(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="hr-leave-cancel-actions">

                                <button
                                    type="button"
                                    className="hr-leave-cancel-back"
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                    onClick={
                                        closeCancelModal
                                    }
                                >
                                    Keep Request
                                </button>


                                <button
                                    type="submit"
                                    className="hr-leave-cancel-confirm"
                                    disabled={
                                        Boolean(
                                            actionLoading
                                        )
                                    }
                                >

                                    {actionLoading ===
                                        `cancel-${cancelModal._id}` ? (

                                        <>
                                            <Loader2
                                                size={17}
                                                className="hr-leave-spin"
                                            />

                                            Cancelling...
                                        </>

                                    ) : (

                                        <>
                                            <XCircle size={17} />

                                            Cancel Leave
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default HRLeave;