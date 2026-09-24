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
    XCircle,
    Search,
    RefreshCw,
    Eye,
    X,
    UserRound,
    Building2,
    BriefcaseBusiness,
    Mail,
    Phone,
    FileText,
    CalendarCheck2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import api from "../../services/api";

import "./SuperAdminLeaveApplications.css";


// =====================================================
// CONSTANTS
// =====================================================

const API_URL = "/super-admin/leaves";

const PAGE_SIZE = 10;


// =====================================================
// HELPERS
// =====================================================

const getEmployeeName = (leave) => {
    if (
        leave?.employeeName &&
        String(leave.employeeName).trim()
    ) {
        return String(
            leave.employeeName
        ).trim();
    }

    const employee = leave?.employee;

    if (!employee) {
        return "Unknown Employee";
    }

    const name =
        `${employee.firstName || ""} ${employee.lastName || ""}`
            .trim();

    if (name) {
        return name;
    }

    if (employee.name) {
        return employee.name;
    }

    if (employee.email) {
        return employee.email;
    }

    return "Unknown Employee";
};


const getEmployeeCode = (leave) => {
    if (
        leave?.empCode &&
        String(leave.empCode).trim()
    ) {
        return String(
            leave.empCode
        ).trim();
    }

    return (
        leave?.employee?.employeeId ||
        "—"
    );
};


const getPersonName = (person) => {
    if (!person) {
        return "—";
    }

    if (
        person.name &&
        String(person.name).trim()
    ) {
        return String(
            person.name
        ).trim();
    }

    const name =
        `${person.firstName || ""} ${person.lastName || ""}`
            .trim();

    if (name) {
        return name;
    }

    if (person.email) {
        return person.email;
    }

    return "—";
};


const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
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


const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
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


const getInitials = (name) => {
    if (!name) {
        return "U";
    }

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "U";
    }

    if (parts.length === 1) {
        return parts[0]
            .charAt(0)
            .toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1]
            .charAt(0)
    ).toUpperCase();
};


const getStatusClass = (status) => {
    switch (
        String(status || "")
            .toLowerCase()
    ) {
        case "approved":
            return "approved";

        case "cancelled":
            return "cancelled";

        case "pending":
        default:
            return "pending";
    }
};


const extractErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong."
    );
};


// =====================================================
// COMPONENT
// =====================================================

const SuperAdminLeavePage = () => {

    // =================================================
    // DATA
    // =================================================

    const [
        leaves,
        setLeaves,
    ] = useState([]);

    const [
        selectedLeave,
        setSelectedLeave,
    ] = useState(null);


    // =================================================
    // SUMMARY
    // =================================================

    const [
        summary,
        setSummary,
    ] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
    });


    // =================================================
    // LOADING
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
        detailsLoading,
        setDetailsLoading,
    ] = useState(false);


    // =================================================
    // ERROR
    // =================================================

    const [
        error,
        setError,
    ] = useState("");


    // =================================================
    // FILTERS
    // =================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("");

    const [
        leaveTypeFilter,
        setLeaveTypeFilter,
    ] = useState("");

    const [
        fromDate,
        setFromDate,
    ] = useState("");

    const [
        toDate,
        setToDate,
    ] = useState("");


    // =================================================
    // PAGINATION
    // =================================================

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);


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


                // =========================================
                // BUILD QUERY
                // =========================================

                const params = {};


                if (statusFilter) {
                    params.status =
                        statusFilter;
                }


                if (leaveTypeFilter) {
                    params.leaveType =
                        leaveTypeFilter;
                }


                if (fromDate) {
                    params.fromDate =
                        fromDate;
                }


                if (toDate) {
                    params.toDate =
                        toDate;
                }


                if (search.trim()) {
                    params.search =
                        search.trim();
                }


                // =========================================
                // API REQUEST
                // =========================================

                const response =
                    await api.get(
                        API_URL,
                        {
                            params,
                        }
                    );

                const data =
                    response?.data || {};


                // =========================================
                // LEAVES
                // =========================================

                const loadedLeaves =
                    Array.isArray(
                        data.leaves
                    )
                        ? data.leaves
                        : [];

                setLeaves(
                    loadedLeaves
                );


                // =========================================
                // SUMMARY
                // =========================================

                if (data.summary) {

                    setSummary({
                        total:
                            Number(
                                data.summary.total
                            ) || 0,

                        pending:
                            Number(
                                data.summary.pending
                            ) || 0,

                        approved:
                            Number(
                                data.summary.approved
                            ) || 0,

                        cancelled:
                            Number(
                                data.summary.cancelled
                            ) || 0,
                    });

                } else {

                    setSummary({
                        total:
                            loadedLeaves.length,

                        pending:
                            loadedLeaves.filter(
                                item =>
                                    String(
                                        item.status || ""
                                    ).toLowerCase() ===
                                    "pending"
                            ).length,

                        approved:
                            loadedLeaves.filter(
                                item =>
                                    String(
                                        item.status || ""
                                    ).toLowerCase() ===
                                    "approved"
                            ).length,

                        cancelled:
                            loadedLeaves.filter(
                                item =>
                                    String(
                                        item.status || ""
                                    ).toLowerCase() ===
                                    "cancelled"
                            ).length,
                    });
                }

            } catch (err) {

                console.error(
                    "SUPER ADMIN LEAVE LOAD ERROR:",
                    err
                );

                setError(
                    extractErrorMessage(
                        err
                    )
                );

                setLeaves([]);

            } finally {

                setLoading(false);

                setRefreshing(false);
            }
        },
        [
            search,
            statusFilter,
            leaveTypeFilter,
            fromDate,
            toDate,
        ]
    );


    // =================================================
    // INITIAL LOAD / FILTER LOAD
    // =================================================

    useEffect(() => {

        const timer =
            setTimeout(
                () => {
                    loadLeaves();
                },
                search.trim()
                    ? 350
                    : 0
            );

        return () => {
            clearTimeout(timer);
        };

    }, [
        loadLeaves,
    ]);


    // =================================================
    // RESET PAGE WHEN FILTER CHANGES
    // =================================================

    useEffect(() => {

        setCurrentPage(1);

    }, [
        search,
        statusFilter,
        leaveTypeFilter,
        fromDate,
        toDate,
    ]);


    // =================================================
    // UNIQUE LEAVE TYPES
    // =================================================

    const leaveTypes =
        useMemo(
            () => {

                const types =
                    leaves
                        .map(
                            item =>
                                item?.leaveType
                        )
                        .filter(Boolean)
                        .map(
                            type =>
                                String(type)
                                    .trim()
                        );

                return [
                    ...new Set(types),
                ].sort();

            },
            [
                leaves,
            ]
        );


    // =================================================
    // PAGINATION
    // =================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                leaves.length /
                PAGE_SIZE
            )
        );


    const paginatedLeaves =
        useMemo(
            () => {

                const start =
                    (
                        currentPage -
                        1
                    ) *
                    PAGE_SIZE;

                return leaves.slice(
                    start,
                    start + PAGE_SIZE
                );

            },
            [
                leaves,
                currentPage,
            ]
        );


    // =================================================
    // OPEN DETAILS
    // =================================================

    const openDetails = async (
        leave
    ) => {

        if (!leave?._id) {
            return;
        }

        try {

            setDetailsLoading(true);

            setSelectedLeave(
                leave
            );


            const response =
                await api.get(
                    `${API_URL}/${leave._id}`
                );


            if (
                response?.data?.leave
            ) {

                setSelectedLeave(
                    response.data.leave
                );
            }

        } catch (err) {

            console.error(
                "SUPER ADMIN LEAVE DETAILS ERROR:",
                err
            );

        } finally {

            setDetailsLoading(false);
        }
    };


    // =================================================
    // CLOSE DETAILS
    // =================================================

    const closeDetails = () => {

        setSelectedLeave(null);

    };


    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters = () => {

        setSearch("");

        setStatusFilter("");

        setLeaveTypeFilter("");

        setFromDate("");

        setToDate("");

        setCurrentPage(1);
    };


    // =================================================
    // SUMMARY CARDS
    // =================================================

    const summaryCards = [

        {
            key: "total",

            label:
                "Total Applications",

            value:
                summary.total,

            icon:
                <FileText size={22} />,

            className:
                "total",
        },

        {
            key: "pending",

            label:
                "Pending",

            value:
                summary.pending,

            icon:
                <Clock3 size={22} />,

            className:
                "pending",
        },

        {
            key: "approved",

            label:
                "Approved",

            value:
                summary.approved,

            icon:
                <CheckCircle2 size={22} />,

            className:
                "approved",
        },

        {
            key: "cancelled",

            label:
                "Cancelled",

            value:
                summary.cancelled,

            icon:
                <XCircle size={22} />,

            className:
                "cancelled",
        },
    ];


    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className="super-admin-leave-page"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="super-admin-leave-header"
            >

                <div>

                    <div
                        className="super-admin-leave-title-row"
                    >

                        <div
                            className="super-admin-leave-title-icon"
                        >

                            <CalendarCheck2
                                size={26}
                            />

                        </div>

                        <div>

                            <h1>
                                Leave Applications
                            </h1>

                            <p>
                                Review employee leave
                                applications and
                                application status.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="super-admin-leave-refresh-btn"
                    onClick={() =>
                        loadLeaves(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "is-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
                className="super-admin-leave-summary-grid"
            >

                {summaryCards.map(
                    card => (

                        <div
                            key={card.key}
                            className={
                                `super-admin-leave-summary-card ${card.className}`
                            }
                        >

                            <div
                                className="super-admin-leave-summary-icon"
                            >
                                {card.icon}
                            </div>

                            <div
                                className="super-admin-leave-summary-content"
                            >

                                <span>
                                    {card.label}
                                </span>

                                <strong>
                                    {card.value}
                                </strong>

                            </div>

                        </div>

                    )
                )}

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div
                className="super-admin-leave-filters-card"
            >

                <div
                    className="super-admin-leave-filter-top"
                >

                    <div>

                        <h2>
                            Leave Applications
                        </h2>

                        <span>
                            {leaves.length} application
                            {leaves.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                <div
                    className="super-admin-leave-filters"
                >

                    {/* SEARCH */}

                    <div
                        className="super-admin-leave-search"
                    >

                        <Search
                            size={18}
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search employee, ID, leave type..."
                        />

                    </div>


                    {/* STATUS */}

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
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


                    {/* LEAVE TYPE */}

                    <select
                        value={leaveTypeFilter}
                        onChange={(event) =>
                            setLeaveTypeFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Leave Types
                        </option>

                        {leaveTypes.map(
                            type => (

                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </option>

                            )
                        )}

                    </select>


                    {/* FROM DATE */}

                    <div
                        className="super-admin-leave-date-input"
                    >

                        <CalendarDays
                            size={17}
                        />

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(event) =>
                                setFromDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* TO DATE */}

                    <div
                        className="super-admin-leave-date-input"
                    >

                        <CalendarDays
                            size={17}
                        />

                        <input
                            type="date"
                            value={toDate}
                            onChange={(event) =>
                                setToDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* CLEAR */}

                    <button
                        type="button"
                        className="super-admin-leave-clear-btn"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="super-admin-leave-error"
                >

                    <AlertCircle
                        size={19}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadLeaves(true)
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

            <div
                className="super-admin-leave-table-card"
            >

                {loading ? (

                    <div
                        className="super-admin-leave-loading"
                    >

                        <RefreshCw
                            size={30}
                            className="is-spinning"
                        />

                        <span>
                            Loading leave applications...
                        </span>

                    </div>

                ) : paginatedLeaves.length === 0 ? (

                    <div
                        className="super-admin-leave-empty"
                    >

                        <div
                            className="super-admin-leave-empty-icon"
                        >

                            <FileText
                                size={30}
                            />

                        </div>

                        <h3>
                            No leave applications found
                        </h3>

                        <p>
                            There are no leave applications
                            matching your current filters.
                        </p>

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear Filters
                        </button>

                    </div>

                ) : (

                    <>

                        <div
                            className="super-admin-leave-table-wrapper"
                        >

                            <table
                                className="super-admin-leave-table"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Employee
                                        </th>

                                        <th>
                                            Leave
                                        </th>

                                        <th>
                                            Duration
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

                                    {paginatedLeaves.map(
                                        leave => {

                                            const employeeName =
                                                getEmployeeName(
                                                    leave
                                                );

                                            const employee =
                                                leave.employee;

                                            return (

                                                <tr
                                                    key={
                                                        leave._id
                                                    }
                                                >

                                                    {/* EMPLOYEE */}

                                                    <td>

                                                        <div
                                                            className="super-admin-leave-employee"
                                                        >

                                                            {employee?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        employee.profileImage
                                                                    }
                                                                    alt={
                                                                        employeeName
                                                                    }
                                                                />

                                                            ) : (

                                                                <div
                                                                    className="super-admin-leave-avatar"
                                                                >

                                                                    {
                                                                        getInitials(
                                                                            employeeName
                                                                        )
                                                                    }

                                                                </div>

                                                            )}

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        employeeName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getEmployeeCode(
                                                                            leave
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* LEAVE */}

                                                    <td>

                                                        <div
                                                            className="super-admin-leave-type-cell"
                                                        >

                                                            <strong>
                                                                {
                                                                    leave.leaveType ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    employee?.department ||
                                                                    "Department not specified"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* DURATION */}

                                                    <td>

                                                        <div
                                                            className="super-admin-leave-duration"
                                                        >

                                                            <strong>

                                                                {
                                                                    leave.totalDays ||
                                                                    0
                                                                }{" "}

                                                                day

                                                                {
                                                                    Number(
                                                                        leave.totalDays
                                                                    ) !== 1
                                                                        ? "s"
                                                                        : ""
                                                                }

                                                            </strong>

                                                            <span>

                                                                {
                                                                    formatDate(
                                                                        leave.startDate
                                                                    )
                                                                }

                                                                {" - "}

                                                                {
                                                                    formatDate(
                                                                        leave.endDate
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* REASON */}

                                                    <td>

                                                        <div
                                                            className="super-admin-leave-reason-cell"
                                                            title={
                                                                leave.reason ||
                                                                ""
                                                            }
                                                        >

                                                            {
                                                                leave.reason ||
                                                                "No reason provided"
                                                            }

                                                        </div>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={
                                                                `super-admin-leave-status ${getStatusClass(
                                                                    leave.status
                                                                )}`
                                                            }
                                                        >

                                                            {String(
                                                                leave.status ||
                                                                "Pending"
                                                            ).toLowerCase() ===
                                                            "approved" ? (

                                                                <CheckCircle2
                                                                    size={14}
                                                                />

                                                            ) : String(
                                                                leave.status ||
                                                                "Pending"
                                                            ).toLowerCase() ===
                                                              "cancelled" ? (

                                                                <XCircle
                                                                    size={14}
                                                                />

                                                            ) : (

                                                                <Clock3
                                                                    size={14}
                                                                />

                                                            )}

                                                            {
                                                                leave.status ||
                                                                "Pending"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* APPLIED */}

                                                    <td>

                                                        <span
                                                            className="super-admin-leave-created-date"
                                                        >

                                                            {
                                                                formatDate(
                                                                    leave.createdAt
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="super-admin-leave-view-btn"
                                                            onClick={() =>
                                                                openDetails(
                                                                    leave
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

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        <div
                            className="super-admin-leave-pagination"
                        >

                            <span>

                                Showing{" "}

                                {
                                    leaves.length === 0
                                        ? 0
                                        : (
                                            (
                                                currentPage -
                                                1
                                            ) *
                                            PAGE_SIZE
                                        ) + 1
                                }

                                {" - "}

                                {
                                    Math.min(
                                        currentPage *
                                        PAGE_SIZE,
                                        leaves.length
                                    )
                                }

                                {" "}of{" "}

                                {
                                    leaves.length
                                }

                            </span>


                            <div
                                className="super-admin-leave-pagination-buttons"
                            >

                                <button
                                    type="button"
                                    disabled={
                                        currentPage <= 1
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

                                    {currentPage}

                                    {" / "}

                                    {totalPages}

                                </span>


                                <button
                                    type="button"
                                    disabled={
                                        currentPage >=
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

                        </div>

                    </>

                )}

            </div>


            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            {selectedLeave && (

                <div
                    className="super-admin-leave-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetails();
                        }

                    }}
                >

                    <div
                        className="super-admin-leave-modal"
                    >

                        {/* MODAL HEADER */}

                        <div
                            className="super-admin-leave-modal-header"
                        >

                            <div>

                                <span>
                                    Leave Application
                                </span>

                                <h2>
                                    Application Details
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="super-admin-leave-modal-close"
                                onClick={
                                    closeDetails
                                }
                            >

                                <X
                                    size={21}
                                />

                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div
                            className="super-admin-leave-modal-body"
                        >

                            {detailsLoading && (

                                <div
                                    className="super-admin-leave-detail-loading"
                                >

                                    <RefreshCw
                                        size={20}
                                        className="is-spinning"
                                    />

                                    Updating details...

                                </div>

                            )}


                            {/* STATUS */}

                            <div
                                className="super-admin-leave-detail-status-row"
                            >

                                <div>

                                    <span>
                                        Application Status
                                    </span>

                                    <strong
                                        className={
                                            `super-admin-leave-status large ${getStatusClass(
                                                selectedLeave.status
                                            )}`
                                        }
                                    >

                                        {String(
                                            selectedLeave.status ||
                                            "Pending"
                                        ).toLowerCase() ===
                                        "approved" ? (

                                            <CheckCircle2
                                                size={16}
                                            />

                                        ) : String(
                                            selectedLeave.status ||
                                            "Pending"
                                        ).toLowerCase() ===
                                          "cancelled" ? (

                                            <XCircle
                                                size={16}
                                            />

                                        ) : (

                                            <Clock3
                                                size={16}
                                            />

                                        )}

                                        {
                                            selectedLeave.status ||
                                            "Pending"
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Application ID
                                    </span>

                                    <strong>
                                        {
                                            selectedLeave._id ||
                                            "—"
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* EMPLOYEE */}

                            <section
                                className="super-admin-leave-detail-section"
                            >

                                <div
                                    className="super-admin-leave-section-title"
                                >

                                    <UserRound
                                        size={18}
                                    />

                                    <h3>
                                        Employee Information
                                    </h3>

                                </div>


                                <div
                                    className="super-admin-leave-employee-profile"
                                >

                                    {selectedLeave.employee?.profileImage ? (

                                        <img
                                            src={
                                                selectedLeave.employee.profileImage
                                            }
                                            alt={
                                                getEmployeeName(
                                                    selectedLeave
                                                )
                                            }
                                        />

                                    ) : (

                                        <div
                                            className="super-admin-leave-avatar large"
                                        >

                                            {
                                                getInitials(
                                                    getEmployeeName(
                                                        selectedLeave
                                                    )
                                                )
                                            }

                                        </div>

                                    )}


                                    <div>

                                        <h4>
                                            {
                                                getEmployeeName(
                                                    selectedLeave
                                                )
                                            }
                                        </h4>

                                        <span>
                                            {
                                                getEmployeeCode(
                                                    selectedLeave
                                                )
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className="super-admin-leave-info-grid"
                                >

                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <Mail
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    selectedLeave.employee?.email ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <Phone
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {
                                                    selectedLeave.employee?.phone ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <Building2
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Department
                                            </span>

                                            <strong>
                                                {
                                                    selectedLeave.employee?.department ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <BriefcaseBusiness
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Designation
                                            </span>

                                            <strong>
                                                {
                                                    selectedLeave.employee?.designation ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* LEAVE DETAILS */}

                            <section
                                className="super-admin-leave-detail-section"
                            >

                                <div
                                    className="super-admin-leave-section-title"
                                >

                                    <CalendarDays
                                        size={18}
                                    />

                                    <h3>
                                        Leave Details
                                    </h3>

                                </div>


                                <div
                                    className="super-admin-leave-info-grid"
                                >

                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <FileText
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Leave Type
                                            </span>

                                            <strong>
                                                {
                                                    selectedLeave.leaveType ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <CalendarDays
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Start Date
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedLeave.startDate
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <CalendarDays
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                End Date
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedLeave.endDate
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className="super-admin-leave-info-item"
                                    >

                                        <CalendarCheck2
                                            size={17}
                                        />

                                        <div>

                                            <span>
                                                Total Days
                                            </span>

                                            <strong>

                                                {
                                                    selectedLeave.totalDays ||
                                                    0
                                                }

                                                {" "}

                                                day

                                                {
                                                    Number(
                                                        selectedLeave.totalDays
                                                    ) !== 1
                                                        ? "s"
                                                        : ""
                                                }

                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className="super-admin-leave-reason-box"
                                >

                                    <span>
                                        Employee Reason
                                    </span>

                                    <p>
                                        {
                                            selectedLeave.reason ||
                                            "No reason provided."
                                        }
                                    </p>

                                </div>

                            </section>


                            {/* APPROVAL */}

                            {(
                                selectedLeave.approvedBy ||
                                selectedLeave.approvedAt
                            ) && (

                                <section
                                    className="super-admin-leave-detail-section"
                                >

                                    <div
                                        className="super-admin-leave-section-title"
                                    >

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Approval Information
                                        </h3>

                                    </div>


                                    <div
                                        className="super-admin-leave-review-meta"
                                    >

                                        <div>

                                            <span>
                                                Approved By
                                            </span>

                                            <strong>
                                                {
                                                    getPersonName(
                                                        selectedLeave.approvedBy
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Approved At
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedLeave.approvedAt
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>

                            )}


                            {/* CANCELLATION */}

                            {(
                                selectedLeave.cancelledBy ||
                                selectedLeave.cancelledAt ||
                                selectedLeave.cancellationReason
                            ) && (

                                <section
                                    className="super-admin-leave-detail-section"
                                >

                                    <div
                                        className="super-admin-leave-section-title"
                                    >

                                        <XCircle
                                            size={18}
                                        />

                                        <h3>
                                            Cancellation Information
                                        </h3>

                                    </div>


                                    <div
                                        className="super-admin-leave-review-meta"
                                    >

                                        <div>

                                            <span>
                                                Cancelled By
                                            </span>

                                            <strong>
                                                {
                                                    getPersonName(
                                                        selectedLeave.cancelledBy
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Cancelled At
                                            </span>

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        selectedLeave.cancelledAt
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {selectedLeave.cancellationReason && (

                                        <div
                                            className="super-admin-leave-cancellation-box"
                                        >

                                            <span>
                                                Cancellation Reason
                                            </span>

                                            <p>
                                                {
                                                    selectedLeave.cancellationReason
                                                }
                                            </p>

                                        </div>

                                    )}

                                </section>

                            )}


                            {/* APPLICATION TIMELINE */}

                            <section
                                className="super-admin-leave-detail-section"
                            >

                                <div
                                    className="super-admin-leave-section-title"
                                >

                                    <Clock3
                                        size={18}
                                    />

                                    <h3>
                                        Application Timeline
                                    </h3>

                                </div>


                                <div
                                    className="super-admin-leave-timeline"
                                >

                                    <div
                                        className="super-admin-leave-timeline-item"
                                    >

                                        <span />

                                        <div>

                                            <strong>
                                                Application Submitted
                                            </strong>

                                            <small>
                                                {
                                                    formatDateTime(
                                                        selectedLeave.createdAt
                                                    )
                                                }
                                            </small>

                                        </div>

                                    </div>


                                    {selectedLeave.approvedAt && (

                                        <div
                                            className="super-admin-leave-timeline-item"
                                        >

                                            <span />

                                            <div>

                                                <strong>
                                                    Leave Approved
                                                </strong>

                                                <small>
                                                    {
                                                        formatDateTime(
                                                            selectedLeave.approvedAt
                                                        )
                                                    }
                                                </small>

                                            </div>

                                        </div>

                                    )}


                                    {selectedLeave.cancelledAt && (

                                        <div
                                            className="super-admin-leave-timeline-item"
                                        >

                                            <span />

                                            <div>

                                                <strong>
                                                    Leave Cancelled
                                                </strong>

                                                <small>
                                                    {
                                                        formatDateTime(
                                                            selectedLeave.cancelledAt
                                                        )
                                                    }
                                                </small>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </section>

                        </div>


                        {/* MODAL FOOTER */}

                        <div
                            className="super-admin-leave-modal-footer"
                        >

                            <span>
                                Created{" "}
                                {
                                    formatDateTime(
                                        selectedLeave.createdAt
                                    )
                                }
                            </span>


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


export default SuperAdminLeavePage;