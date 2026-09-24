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
    CheckCircle2,
    XCircle,
    Clock3,
    CalendarDays,
    UserRound,
    Mail,
    BriefcaseBusiness,
    MessageSquareText,
    FileText,
    Filter,
    AlertCircle,
} from "lucide-react";

import {
    getAllHRPersonalLeaves,
    approveHRPersonalLeave,
    cancelHRPersonalLeave,
} from "../../services/hrpersonalLeaveApi";

import "./HRPersonalLeaveManagement.css";


// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "—";
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


const getHRName = (hr) => {

    if (!hr) {
        return "Unknown HR";
    }

    if (hr.name) {
        return hr.name;
    }

    const fullName = [
        hr.firstName,
        hr.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    return fullName || "Unknown HR";
};


const getHRInitials = (hr) => {

    const name =
        getHRName(hr);

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "HR";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
};


const normalizeStatus = (
    status
) => {

    return String(
        status || "Pending"
    ).trim();
};


const getStatusClass = (
    status
) => {

    const normalized =
        normalizeStatus(
            status
        ).toLowerCase();

    if (
        normalized ===
        "approved"
    ) {
        return "approved";
    }

    if (
        normalized ===
        "cancelled"
    ) {
        return "cancelled";
    }

    return "pending";
};


const getLeaveId = (
    leave
) => {

    return (
        leave?._id ||
        leave?.id ||
        ""
    );
};


// ============================================================
// COMPONENT
// ============================================================

const HRPersonalLeaveManagement = () => {

    // ========================================================
    // STATE
    // ========================================================

    const [
        leaves,
        setLeaves,
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
        leaveTypeFilter,
        setLeaveTypeFilter,
    ] = useState("All");

    const [
        selectedLeave,
        setSelectedLeave,
    ] = useState(null);

    const [
        actionType,
        setActionType,
    ] = useState("");

    const [
        actionLeave,
        setActionLeave,
    ] = useState(null);

    const [
        adminRemark,
        setAdminRemark,
    ] = useState("");

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        actionError,
        setActionError,
    ] = useState("");


    // ========================================================
    // LOAD DATA
    // ========================================================

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
                    await getAllHRPersonalLeaves();


                const receivedLeaves =
                    response?.leaves ||
                    response?.data?.leaves ||
                    [];


                setLeaves(
                    Array.isArray(
                        receivedLeaves
                    )
                        ? receivedLeaves
                        : []
                );

            } catch (err) {

                console.error(
                    "Load HR personal leaves error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load HR personal leave applications."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);
            }

        },
        []
    );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadLeaves();

    }, [
        loadLeaves,
    ]);


    // ========================================================
    // LEAVE TYPES
    // ========================================================

    const leaveTypes =
        useMemo(() => {

            const types =
                leaves
                    .map(
                        (leave) =>
                            leave?.leaveType
                    )
                    .filter(Boolean);

            return [
                "All",
                ...Array.from(
                    new Set(types)
                ),
            ];

        }, [
            leaves,
        ]);


    // ========================================================
    // FILTERED LEAVES
    // ========================================================

    const filteredLeaves =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return leaves.filter(
                (leave) => {

                    const hr =
                        leave?.hr;

                    const hrName =
                        getHRName(
                            hr
                        ).toLowerCase();

                    const email =
                        String(
                            hr?.email || ""
                        ).toLowerCase();

                    const leaveType =
                        String(
                            leave?.leaveType || ""
                        ).toLowerCase();

                    const reason =
                        String(
                            leave?.reason || ""
                        ).toLowerCase();

                    const status =
                        normalizeStatus(
                            leave?.status
                        );


                    const matchesSearch =
                        !searchValue ||
                        hrName.includes(
                            searchValue
                        ) ||
                        email.includes(
                            searchValue
                        ) ||
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
                        statusFilter;


                    const matchesLeaveType =
                        leaveTypeFilter ===
                        "All" ||
                        leave?.leaveType ===
                        leaveTypeFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesLeaveType
                    );
                }
            );

        }, [
            leaves,
            search,
            statusFilter,
            leaveTypeFilter,
        ]);


    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics =
        useMemo(() => {

            const total =
                leaves.length;

            const pending =
                leaves.filter(
                    (leave) =>
                        normalizeStatus(
                            leave?.status
                        ) === "Pending"
                ).length;

            const approved =
                leaves.filter(
                    (leave) =>
                        normalizeStatus(
                            leave?.status
                        ) === "Approved"
                ).length;

            const cancelled =
                leaves.filter(
                    (leave) =>
                        normalizeStatus(
                            leave?.status
                        ) === "Cancelled"
                ).length;


            return {
                total,
                pending,
                approved,
                cancelled,
            };

        }, [
            leaves,
        ]);


    // ========================================================
    // OPEN DETAILS
    // ========================================================

    const handleView =
        (leave) => {

            setSelectedLeave(
                leave
            );
        };


    // ========================================================
    // CLOSE DETAILS
    // ========================================================

    const closeDetails =
        () => {

            setSelectedLeave(
                null
            );
        };


    // ========================================================
    // OPEN ACTION MODAL
    // ========================================================

    const openAction =
        (
            leave,
            type
        ) => {

            setActionLeave(
                leave
            );

            setActionType(
                type
            );

            setAdminRemark(
                ""
            );

            setActionError(
                ""
            );
        };


    // ========================================================
    // CLOSE ACTION MODAL
    // ========================================================

    const closeAction =
        () => {

            if (actionLoading) {
                return;
            }

            setActionLeave(
                null
            );

            setActionType(
                ""
            );

            setAdminRemark(
                ""
            );

            setActionError(
                ""
            );
        };


    // ========================================================
    // SUBMIT ACTION
    // ========================================================

    const handleAction =
        async () => {

            if (!actionLeave) {
                return;
            }

            const leaveId =
                getLeaveId(
                    actionLeave
                );


            if (!leaveId) {

                setActionError(
                    "Leave application ID is missing."
                );

                return;
            }


            try {

                setActionLoading(
                    true
                );

                setActionError(
                    ""
                );


                let response;


                if (
                    actionType ===
                    "approve"
                ) {

                    response =
                        await approveHRPersonalLeave(
                            leaveId,
                            adminRemark
                        );

                } else if (
                    actionType ===
                    "cancel"
                ) {

                    response =
                        await cancelHRPersonalLeave(
                            leaveId,
                            adminRemark
                        );

                } else {

                    return;
                }


                const updatedLeave =
                    response?.leave ||
                    response?.data?.leave;


                if (updatedLeave) {

                    setLeaves(
                        (currentLeaves) =>
                            currentLeaves.map(
                                (leave) =>
                                    getLeaveId(
                                        leave
                                    ) ===
                                    leaveId
                                        ? updatedLeave
                                        : leave
                            )
                    );

                } else {

                    await loadLeaves(
                        true
                    );
                }


                closeAction();

                setSelectedLeave(
                    null
                );

            } catch (err) {

                console.error(
                    "HR personal leave action error:",
                    err
                );

                setActionError(
                    err?.response?.data?.message ||
                    "Failed to update leave application."
                );

            } finally {

                setActionLoading(
                    false
                );
            }
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="hr-personal-leave-admin-page">

                <div className="hr-personal-leave-admin-loading">

                    <RefreshCw
                        size={28}
                        className="hr-personal-leave-spin"
                    />

                    <span>
                        Loading HR personal leave applications...
                    </span>

                </div>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="hr-personal-leave-admin-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="hr-personal-leave-admin-header">

                <div>

                    <div className="hr-personal-leave-admin-eyebrow">

                        <FileText
                            size={16}
                        />

                        HR MANAGEMENT

                    </div>


                    <h1>
                        HR Personal Leave
                    </h1>


                    <p>
                        Review and manage personal leave applications submitted by HR.
                    </p>

                </div>


                <button
                    type="button"
                    className="hr-personal-leave-refresh-button"
                    onClick={() =>
                        loadLeaves(true)
                    }
                    disabled={refreshing}
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


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="hr-personal-leave-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="hr-personal-leave-stat-grid">

                <div className="hr-personal-leave-stat-card">

                    <div className="hr-personal-leave-stat-icon total">

                        <FileText
                            size={20}
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
                            size={20}
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
                            size={20}
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
                            size={20}
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

            </div>


            {/* ==================================================
                FILTER BAR
            ================================================== */}

            <div className="hr-personal-leave-filter-card">

                <div className="hr-personal-leave-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search HR name, email, leave type or reason..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="hr-personal-leave-filter">

                    <Filter
                        size={16}
                    />

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


                <div className="hr-personal-leave-filter">

                    <CalendarDays
                        size={16}
                    />

                    <select
                        value={
                            leaveTypeFilter
                        }
                        onChange={(event) =>
                            setLeaveTypeFilter(
                                event.target.value
                            )
                        }
                    >

                        {leaveTypes.map(
                            (type) => (

                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type === "All"
                                        ? "All Leave Types"
                                        : type}
                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="hr-personal-leave-table-card">

                <div className="hr-personal-leave-table-header">

                    <div>

                        <h2>
                            Leave Applications
                        </h2>

                        <span>
                            {filteredLeaves.length} application
                            {filteredLeaves.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                {filteredLeaves.length === 0 ? (

                    <div className="hr-personal-leave-empty">

                        <FileText
                            size={42}
                        />

                        <h3>
                            No leave applications found
                        </h3>

                        <p>
                            No HR personal leave applications match your current filters.
                        </p>

                    </div>

                ) : (

                    <div className="hr-personal-leave-table-wrapper">

                        <table className="hr-personal-leave-table">

                            <thead>

                                <tr>

                                    <th>
                                        HR
                                    </th>

                                    <th>
                                        Leave Type
                                    </th>

                                    <th>
                                        Leave Period
                                    </th>

                                    <th>
                                        Days
                                    </th>

                                    <th>
                                        Applied On
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

                                {filteredLeaves.map(
                                    (leave) => {

                                        const leaveId =
                                            getLeaveId(
                                                leave
                                            );

                                        const hr =
                                            leave?.hr;

                                        const status =
                                            normalizeStatus(
                                                leave?.status
                                            );

                                        const statusClass =
                                            getStatusClass(
                                                status
                                            );


                                        return (

                                            <tr
                                                key={
                                                    leaveId
                                                }
                                            >

                                                {/* HR */}

                                                <td>

                                                    <div className="hr-personal-leave-user">

                                                        <div className="hr-personal-leave-avatar">

                                                            {getHRInitials(
                                                                hr
                                                            )}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {getHRName(
                                                                    hr
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {hr?.email ||
                                                                    "No email"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* LEAVE TYPE */}

                                                <td>

                                                    <span className="hr-personal-leave-type">

                                                        {leave?.leaveType ||
                                                            "—"}

                                                    </span>

                                                </td>


                                                {/* PERIOD */}

                                                <td>

                                                    <div className="hr-personal-leave-period">

                                                        <span>
                                                            {formatDate(
                                                                leave?.fromDate
                                                            )}
                                                        </span>

                                                        <span>
                                                            →
                                                        </span>

                                                        <span>
                                                            {formatDate(
                                                                leave?.toDate
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* DAYS */}

                                                <td>

                                                    <strong>
                                                        {leave?.totalDays ??
                                                            "—"}
                                                    </strong>

                                                </td>


                                                {/* APPLIED */}

                                                <td>

                                                    {formatDate(
                                                        leave?.createdAt
                                                    )}

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `hr-personal-leave-status ${statusClass}`
                                                        }
                                                    >

                                                        {statusClass ===
                                                        "approved" ? (

                                                            <CheckCircle2
                                                                size={14}
                                                            />

                                                        ) : statusClass ===
                                                          "cancelled" ? (

                                                            <XCircle
                                                                size={14}
                                                            />

                                                        ) : (

                                                            <Clock3
                                                                size={14}
                                                            />

                                                        )}

                                                        {status}

                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <div className="hr-personal-leave-actions">

                                                        <button
                                                            type="button"
                                                            className="hr-personal-leave-view-button"
                                                            onClick={() =>
                                                                handleView(
                                                                    leave
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View

                                                        </button>


                                                        {status ===
                                                            "Pending" && (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="hr-personal-leave-approve-button"
                                                                    onClick={() =>
                                                                        openAction(
                                                                            leave,
                                                                            "approve"
                                                                        )
                                                                    }
                                                                >

                                                                    <CheckCircle2
                                                                        size={15}
                                                                    />

                                                                    Approve

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="hr-personal-leave-cancel-button"
                                                                    onClick={() =>
                                                                        openAction(
                                                                            leave,
                                                                            "cancel"
                                                                        )
                                                                    }
                                                                >

                                                                    <XCircle
                                                                        size={15}
                                                                    />

                                                                    Cancel

                                                                </button>

                                                            </>

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


            {/* ==================================================
                DETAILS MODAL
            ================================================== */}

            {selectedLeave && (

                <div
                    className="hr-personal-leave-modal-overlay"
                    onMouseDown={closeDetails}
                >

                    <div
                        className="hr-personal-leave-details-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="hr-personal-leave-modal-header">

                            <div>

                                <span>
                                    HR PERSONAL LEAVE
                                </span>

                                <h2>
                                    Leave Application Details
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


                        <div className="hr-personal-leave-details-body">

                            {/* HR INFO */}

                            <div className="hr-personal-leave-detail-section">

                                <div className="hr-personal-leave-detail-section-title">

                                    <UserRound
                                        size={17}
                                    />

                                    HR Information

                                </div>


                                <div className="hr-personal-leave-info-grid">

                                    <div>

                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {getHRName(
                                                selectedLeave?.hr
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {selectedLeave?.hr?.email ||
                                                "—"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Role
                                        </span>

                                        <strong>
                                            {selectedLeave?.hr?.role ||
                                                "HR"}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* LEAVE INFO */}

                            <div className="hr-personal-leave-detail-section">

                                <div className="hr-personal-leave-detail-section-title">

                                    <CalendarDays
                                        size={17}
                                    />

                                    Leave Information

                                </div>


                                <div className="hr-personal-leave-info-grid">

                                    <div>

                                        <span>
                                            Leave Type
                                        </span>

                                        <strong>
                                            {selectedLeave?.leaveType ||
                                                "—"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            From
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedLeave?.fromDate
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            To
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedLeave?.toDate
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Total Days
                                        </span>

                                        <strong>
                                            {selectedLeave?.totalDays ??
                                                "—"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Applied On
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedLeave?.createdAt
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>

                                            <span
                                                className={
                                                    `hr-personal-leave-status ${getStatusClass(
                                                        selectedLeave?.status
                                                    )}`
                                                }
                                            >

                                                {normalizeStatus(
                                                    selectedLeave?.status
                                                )}

                                            </span>

                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* REASON */}

                            <div className="hr-personal-leave-detail-section">

                                <div className="hr-personal-leave-detail-section-title">

                                    <MessageSquareText
                                        size={17}
                                    />

                                    HR Reason

                                </div>


                                <div className="hr-personal-leave-reason-box">

                                    {selectedLeave?.reason ||
                                        "No reason provided."}

                                </div>

                            </div>


                            {/* ADMIN RESPONSE */}

                            <div className="hr-personal-leave-detail-section">

                                <div className="hr-personal-leave-detail-section-title">

                                    <BriefcaseBusiness
                                        size={17}
                                    />

                                    Super Admin Review

                                </div>


                                <div className="hr-personal-leave-info-grid">

                                    <div>

                                        <span>
                                            Reviewed By
                                        </span>

                                        <strong>
                                            {selectedLeave?.reviewedBy
                                                ? getHRName(
                                                      selectedLeave.reviewedBy
                                                  )
                                                : "Not reviewed yet"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Reviewed At
                                        </span>

                                        <strong>
                                            {selectedLeave?.reviewedAt
                                                ? formatDate(
                                                      selectedLeave.reviewedAt
                                                  )
                                                : "Not reviewed yet"}
                                        </strong>

                                    </div>

                                </div>


                                <div className="hr-personal-leave-admin-remark-box">

                                    <span>
                                        Admin Remark
                                    </span>

                                    <p>
                                        {selectedLeave?.adminRemark ||
                                            "No admin remark."}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* MODAL ACTIONS */}

                        {normalizeStatus(
                            selectedLeave?.status
                        ) === "Pending" && (

                            <div className="hr-personal-leave-details-footer">

                                <button
                                    type="button"
                                    className="hr-personal-leave-cancel-button large"
                                    onClick={() => {

                                        openAction(
                                            selectedLeave,
                                            "cancel"
                                        );

                                        closeDetails();

                                    }}
                                >

                                    <XCircle
                                        size={17}
                                    />

                                    Cancel Leave

                                </button>


                                <button
                                    type="button"
                                    className="hr-personal-leave-approve-button large"
                                    onClick={() => {

                                        openAction(
                                            selectedLeave,
                                            "approve"
                                        );

                                        closeDetails();

                                    }}
                                >

                                    <CheckCircle2
                                        size={17}
                                    />

                                    Approve Leave

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ==================================================
                ACTION CONFIRMATION MODAL
            ================================================== */}

            {actionLeave && (

                <div className="hr-personal-leave-modal-overlay">

                    <div className="hr-personal-leave-action-modal">

                        <div className="hr-personal-leave-action-icon">

                            {actionType ===
                            "approve" ? (

                                <CheckCircle2
                                    size={28}
                                />

                            ) : (

                                <XCircle
                                    size={28}
                                />

                            )}

                        </div>


                        <h2>

                            {actionType ===
                            "approve"
                                ? "Approve Leave Application?"
                                : "Cancel Leave Application?"}

                        </h2>


                        <p>

                            {actionType ===
                            "approve"
                                ? `You are approving ${getHRName(
                                      actionLeave?.hr
                                  )}'s personal leave application.`
                                : `You are cancelling ${getHRName(
                                      actionLeave?.hr
                                  )}'s personal leave application.`}

                        </p>


                        <div className="hr-personal-leave-action-summary">

                            <div>

                                <span>
                                    Leave Type
                                </span>

                                <strong>
                                    {actionLeave?.leaveType ||
                                        "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Period
                                </span>

                                <strong>
                                    {formatDate(
                                        actionLeave?.fromDate
                                    )}{" "}
                                    →{" "}
                                    {formatDate(
                                        actionLeave?.toDate
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div className="hr-personal-leave-remark-field">

                            <label>
                                Admin Remark
                                <span>
                                    Optional
                                </span>
                            </label>

                            <textarea
                                rows={4}
                                placeholder="Add a remark for the HR employee..."
                                value={
                                    adminRemark
                                }
                                onChange={(event) =>
                                    setAdminRemark(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {actionError && (

                            <div className="hr-personal-leave-action-error">

                                <AlertCircle
                                    size={16}
                                />

                                {actionError}

                            </div>

                        )}


                        <div className="hr-personal-leave-action-footer">

                            <button
                                type="button"
                                className="hr-personal-leave-secondary-button"
                                onClick={
                                    closeAction
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                Back
                            </button>


                            <button
                                type="button"
                                className={
                                    actionType ===
                                    "approve"
                                        ? "hr-personal-leave-confirm-approve"
                                        : "hr-personal-leave-confirm-cancel"
                                }
                                onClick={
                                    handleAction
                                }
                                disabled={
                                    actionLoading
                                }
                            >

                                {actionLoading ? (

                                    <>

                                        <RefreshCw
                                            size={16}
                                            className="hr-personal-leave-spin"
                                        />

                                        Processing...

                                    </>

                                ) : actionType ===
                                  "approve" ? (

                                    <>

                                        <CheckCircle2
                                            size={16}
                                        />

                                        Approve Leave

                                    </>

                                ) : (

                                    <>

                                        <XCircle
                                            size={16}
                                        />

                                        Cancel Leave

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default HRPersonalLeaveManagement;