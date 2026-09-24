import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Search,
    RefreshCw,
    Eye,
    CheckCircle2,
    CreditCard,
    XCircle,
    Clock3,
    WalletCards,
    Users,
    IndianRupee,
    FileText,
    X,
    Loader2,
    AlertCircle,
    CalendarDays,
    UserRound,
    Building2,
    BriefcaseBusiness,
} from "lucide-react";

import "./HRPayrollManagement.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// HELPERS
// =====================================================

const formatMoney = (value) => {

    const number = Number(value || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(number);
};


const formatMonthYear = (
    month,
    year
) => {

    if (!month || !year) {
        return "-";
    }

    const date =
        new Date(
            Number(year),
            Number(month) - 1,
            1
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric",
        }
    );
};


const getEmployeeName = (
    employee
) => {

    if (!employee) {
        return "Unknown Employee";
    }

    return [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ") ||
        employee.name ||
        "Unknown Employee";
};


const getInitials = (
    employee
) => {

    const name =
        getEmployeeName(employee);

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            item =>
                item.charAt(0).toUpperCase()
        )
        .join("");
};


// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG = {

    DRAFT: {
        label: "Draft",
        className: "status-draft",
    },

    APPROVED: {
        label: "Approved",
        className: "status-approved",
    },

    PAID: {
        label: "Paid",
        className: "status-paid",
    },

    CANCELLED: {
        label: "Cancelled",
        className: "status-cancelled",
    },
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const PayrollManagement = () => {

    // =================================================
    // STATE
    // =================================================

    const [
        payrolls,
        setPayrolls,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState({
        total: 0,
        draft: 0,
        approved: 0,
        paid: 0,
        cancelled: 0,
        gross: 0,
        deductions: 0,
        net: 0,
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
        success,
        setSuccess,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("");

    const [
        monthFilter,
        setMonthFilter,
    ] = useState("");

    const [
        yearFilter,
        setYearFilter,
    ] = useState("");

    const [
        selectedPayroll,
        setSelectedPayroll,
    ] = useState(null);

    const [
        paymentPayroll,
        setPaymentPayroll,
    ] = useState(null);

    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState("BANK_TRANSFER");

    const [
        paymentReference,
        setPaymentReference,
    ] = useState("");

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);


    // =================================================
    // LOAD PAYROLL
    // =================================================

    const loadPayroll = useCallback(
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
                    await axios.get(
                        `${API_URL}/payroll`,
                        {
                            params: {
                                search:
                                    search.trim() ||
                                    undefined,

                                status:
                                    statusFilter ||
                                    undefined,

                                month:
                                    monthFilter ||
                                    undefined,

                                year:
                                    yearFilter ||
                                    undefined,
                            },

                            withCredentials: true,
                        }
                    );


                if (
                    response.data?.success
                ) {

                    setPayrolls(
                        response.data.payrolls ||
                        []
                    );

                    setSummary(
                        response.data.summary ||
                        {
                            total: 0,
                            draft: 0,
                            approved: 0,
                            paid: 0,
                            cancelled: 0,
                            gross: 0,
                            deductions: 0,
                            net: 0,
                        }
                    );

                } else {

                    setError(
                        response.data?.message ||
                        "Failed to load payroll."
                    );
                }

            } catch (err) {

                console.error(
                    "LOAD HR PAYROLL ERROR:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load payroll data."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }

        },
        [
            search,
            statusFilter,
            monthFilter,
            yearFilter,
        ]
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadPayroll();

    }, [loadPayroll]);


    // =================================================
    // AUTO CLEAR MESSAGES
    // =================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer =
            setTimeout(
                () => {
                    setSuccess("");
                },
                3500
            );

        return () => {
            clearTimeout(timer);
        };

    }, [success]);


    // =================================================
    // APPROVE PAYROLL
    // =================================================

    const handleApprove = async (
        payroll
    ) => {

        if (
            !window.confirm(
                `Approve payroll for ${getEmployeeName(
                    payroll.employee
                )}?`
            )
        ) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");

            const response =
                await axios.put(
                    `${API_URL}/payroll/${payroll._id}/approve`,
                    {},
                    {
                        withCredentials: true,
                    }
                );


            if (
                response.data?.success
            ) {

                setSuccess(
                    "Payroll approved successfully."
                );

                setSelectedPayroll(null);

                await loadPayroll(true);

            } else {

                setError(
                    response.data?.message ||
                    "Failed to approve payroll."
                );
            }

        } catch (err) {

            console.error(
                "APPROVE PAYROLL ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to approve payroll."
            );

        } finally {

            setActionLoading(false);
        }
    };


    // =================================================
    // OPEN PAYMENT MODAL
    // =================================================

    const openPaymentModal = (
        payroll
    ) => {

        setPaymentPayroll(
            payroll
        );

        setPaymentMethod(
            "BANK_TRANSFER"
        );

        setPaymentReference("");
        setError("");
    };


    // =================================================
    // PAY PAYROLL
    // =================================================

    const handlePayment = async (
        event
    ) => {

        event.preventDefault();

        if (!paymentPayroll) {
            return;
        }


        try {

            setActionLoading(true);
            setError("");

            const response =
                await axios.put(
                    `${API_URL}/payroll/${paymentPayroll._id}/pay`,
                    {
                        paymentMethod,
                        paymentReference,
                    },
                    {
                        withCredentials: true,
                    }
                );


            if (
                response.data?.success
            ) {

                setSuccess(
                    "Payroll payment processed successfully."
                );

                setPaymentPayroll(null);

                setSelectedPayroll(null);

                await loadPayroll(true);

            } else {

                setError(
                    response.data?.message ||
                    "Failed to process payment."
                );
            }

        } catch (err) {

            console.error(
                "PAYROLL PAYMENT ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to process payroll payment."
            );

        } finally {

            setActionLoading(false);
        }
    };


    // =================================================
    // CANCEL PAYROLL
    // =================================================

    const handleCancel = async (
        payroll
    ) => {

        if (
            !window.confirm(
                `Cancel payroll for ${getEmployeeName(
                    payroll.employee
                )}?`
            )
        ) {
            return;
        }


        try {

            setActionLoading(true);
            setError("");

            const response =
                await axios.put(
                    `${API_URL}/payroll/${payroll._id}/cancel`,
                    {},
                    {
                        withCredentials: true,
                    }
                );


            if (
                response.data?.success
            ) {

                setSuccess(
                    "Payroll cancelled successfully."
                );

                setSelectedPayroll(null);

                await loadPayroll(true);

            } else {

                setError(
                    response.data?.message ||
                    "Failed to cancel payroll."
                );
            }

        } catch (err) {

            console.error(
                "CANCEL PAYROLL ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to cancel payroll."
            );

        } finally {

            setActionLoading(false);
        }
    };


    // =================================================
    // FILTERED PAYROLLS
    // =================================================

    const visiblePayrolls =
        useMemo(
            () => payrolls,
            [payrolls]
        );


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="hr-payroll-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-payroll-header">

                <div>

                    <div className="hr-payroll-title-row">

                        <div className="hr-payroll-title-icon">

                            <WalletCards
                                size={25}
                            />

                        </div>

                        <div>

                            <h1>
                                Payroll Management
                            </h1>

                            <p>
                                Review, approve and process employee payroll.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-payroll-refresh-btn"
                    onClick={() =>
                        loadPayroll(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "hr-payroll-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div className="hr-payroll-alert success">

                    <CheckCircle2
                        size={19}
                    />

                    <span>
                        {success}
                    </span>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="hr-payroll-alert error">

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
                        <X
                            size={17}
                        />
                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hr-payroll-summary-grid">


                <div className="hr-payroll-summary-card">

                    <div className="summary-icon blue">
                        <Users size={20} />
                    </div>

                    <div>

                        <span>
                            Total Payroll
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div className="hr-payroll-summary-card">

                    <div className="summary-icon orange">
                        <Clock3 size={20} />
                    </div>

                    <div>

                        <span>
                            Draft
                        </span>

                        <strong>
                            {summary.draft}
                        </strong>

                    </div>

                </div>


                <div className="hr-payroll-summary-card">

                    <div className="summary-icon purple">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <strong>
                            {summary.approved}
                        </strong>

                    </div>

                </div>


                <div className="hr-payroll-summary-card">

                    <div className="summary-icon green">
                        <CreditCard size={20} />
                    </div>

                    <div>

                        <span>
                            Paid
                        </span>

                        <strong>
                            {summary.paid}
                        </strong>

                    </div>

                </div>


                <div className="hr-payroll-summary-card">

                    <div className="summary-icon red">
                        <XCircle size={20} />
                    </div>

                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {summary.cancelled}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                FINANCIAL SUMMARY
            ================================================= */}

            <div className="hr-payroll-financial-grid">

                <div>

                    <span>
                        Total Gross
                    </span>

                    <strong>
                        {formatMoney(
                            summary.gross
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Total Deductions
                    </span>

                    <strong>
                        {formatMoney(
                            summary.deductions
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Total Net Salary
                    </span>

                    <strong>
                        {formatMoney(
                            summary.net
                        )}
                    </strong>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="hr-payroll-filter-card">

                <div className="hr-payroll-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search employee name, ID or email..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


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

                    <option value="DRAFT">
                        Draft
                    </option>

                    <option value="APPROVED">
                        Approved
                    </option>

                    <option value="PAID">
                        Paid
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                </select>


                <select
                    value={monthFilter}
                    onChange={(event) =>
                        setMonthFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="">
                        All Months
                    </option>

                    {Array.from(
                        { length: 12 },
                        (_, index) => {

                            const month =
                                index + 1;

                            return (
                                <option
                                    key={month}
                                    value={month}
                                >
                                    {new Date(
                                        2000,
                                        index,
                                        1
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            month: "long",
                                        }
                                    )}
                                </option>
                            );
                        }
                    )}

                </select>


                <select
                    value={yearFilter}
                    onChange={(event) =>
                        setYearFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="">
                        All Years
                    </option>

                    {[
                        2026,
                        2027,
                        2028,
                        2029,
                        2030,
                    ].map(
                        year => (

                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="hr-payroll-table-card">

                <div className="hr-payroll-table-header">

                    <div>

                        <h2>
                            Payroll Records
                        </h2>

                        <p>
                            {visiblePayrolls.length} payroll record
                            {visiblePayrolls.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="hr-payroll-loading">

                        <Loader2
                            size={30}
                            className="hr-payroll-spin"
                        />

                        <span>
                            Loading payroll...
                        </span>

                    </div>

                ) : visiblePayrolls.length === 0 ? (

                    <div className="hr-payroll-empty">

                        <FileText
                            size={42}
                        />

                        <h3>
                            No payroll records found
                        </h3>

                        <p>
                            Payroll generated by Super Admin
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="hr-payroll-table-wrapper">

                        <table className="hr-payroll-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Period
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                    <th>
                                        Gross
                                    </th>

                                    <th>
                                        Deductions
                                    </th>

                                    <th>
                                        Net Salary
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

                                {visiblePayrolls.map(
                                    payroll => {

                                        const employee =
                                            payroll.employee;

                                        const status =
                                            STATUS_CONFIG[
                                                payroll.status
                                            ] ||
                                            STATUS_CONFIG.DRAFT;


                                        return (

                                            <tr
                                                key={
                                                    payroll._id
                                                }
                                            >

                                                {/* EMPLOYEE */}

                                                <td>

                                                    <div className="hr-payroll-employee">

                                                        <div className="employee-avatar">

                                                            {employee?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        employee.profileImage
                                                                    }
                                                                    alt={
                                                                        getEmployeeName(
                                                                            employee
                                                                        )
                                                                    }
                                                                />

                                                            ) : (

                                                                getInitials(
                                                                    employee
                                                                )

                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {getEmployeeName(
                                                                    employee
                                                                )}
                                                            </strong>

                                                            <span>
                                                                {employee?.employeeId ||
                                                                    "-"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* PERIOD */}

                                                <td>

                                                    <div className="payroll-period">

                                                        <CalendarDays
                                                            size={15}
                                                        />

                                                        {formatMonthYear(
                                                            payroll.month,
                                                            payroll.year
                                                        )}

                                                    </div>

                                                </td>


                                                {/* ATTENDANCE */}

                                                <td>

                                                    <div className="attendance-mini">

                                                        <strong>
                                                            {
                                                                payroll.presentDays
                                                            }
                                                        </strong>

                                                        <span>
                                                            /{" "}
                                                            {
                                                                payroll.workingDays
                                                            }{" "}
                                                            days
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* GROSS */}

                                                <td>

                                                    <strong>
                                                        {formatMoney(
                                                            payroll.grossSalary
                                                        )}
                                                    </strong>

                                                </td>


                                                {/* DEDUCTIONS */}

                                                <td>

                                                    <span className="deduction-value">
                                                        {formatMoney(
                                                            payroll.totalDeductions
                                                        )}
                                                    </span>

                                                </td>


                                                {/* NET */}

                                                <td>

                                                    <strong className="net-value">
                                                        {formatMoney(
                                                            payroll.netSalary
                                                        )}
                                                    </strong>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`hr-payroll-status ${status.className}`}
                                                    >

                                                        <span />

                                                        {status.label}

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="hr-payroll-actions">

                                                        <button
                                                            type="button"
                                                            className="action-view"
                                                            title="View Payroll"
                                                            onClick={() =>
                                                                setSelectedPayroll(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                        </button>


                                                        {payroll.status ===
                                                            "DRAFT" && (

                                                            <button
                                                                type="button"
                                                                className="action-approve"
                                                                title="Approve Payroll"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        payroll
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >

                                                                <CheckCircle2
                                                                    size={16}
                                                                />

                                                            </button>

                                                        )}


                                                        {payroll.status ===
                                                            "APPROVED" && (

                                                            <button
                                                                type="button"
                                                                className="action-pay"
                                                                title="Process Payment"
                                                                onClick={() =>
                                                                    openPaymentModal(
                                                                        payroll
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >

                                                                <CreditCard
                                                                    size={16}
                                                                />

                                                            </button>

                                                        )}


                                                        {payroll.status !==
                                                            "PAID" &&
                                                            payroll.status !==
                                                            "CANCELLED" && (

                                                            <button
                                                                type="button"
                                                                className="action-cancel"
                                                                title="Cancel Payroll"
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        payroll
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >

                                                                <XCircle
                                                                    size={16}
                                                                />

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
                PAYROLL DETAILS MODAL
            ================================================= */}

            {selectedPayroll && (

                <div
                    className="hr-payroll-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedPayroll(null);
                        }

                    }}
                >

                    <div className="hr-payroll-modal">

                        <div className="hr-payroll-modal-header">

                            <div>

                                <h2>
                                    Payroll Details
                                </h2>

                                <p>
                                    {formatMonthYear(
                                        selectedPayroll.month,
                                        selectedPayroll.year
                                    )}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedPayroll(null)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* EMPLOYEE */}

                        <div className="payroll-detail-employee">

                            <div className="employee-avatar large">

                                {selectedPayroll.employee?.profileImage ? (

                                    <img
                                        src={
                                            selectedPayroll.employee.profileImage
                                        }
                                        alt=""
                                    />

                                ) : (

                                    getInitials(
                                        selectedPayroll.employee
                                    )

                                )}

                            </div>

                            <div>

                                <h3>
                                    {getEmployeeName(
                                        selectedPayroll.employee
                                    )}
                                </h3>

                                <p>
                                    {selectedPayroll.employee?.employeeId ||
                                        "-"}
                                </p>

                            </div>

                        </div>


                        {/* EMPLOYEE INFO */}

                        <div className="payroll-detail-info-grid">

                            <div>

                                <span>
                                    <Building2 size={15} />
                                    Department
                                </span>

                                <strong>
                                    {selectedPayroll.employee?.department ||
                                        "-"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    <BriefcaseBusiness size={15} />
                                    Designation
                                </span>

                                <strong>
                                    {selectedPayroll.employee?.designation ||
                                        "-"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    <UserRound size={15} />
                                    Email
                                </span>

                                <strong>
                                    {selectedPayroll.employee?.email ||
                                        "-"}
                                </strong>

                            </div>

                        </div>


                        {/* ATTENDANCE */}

                        <div className="payroll-detail-section">

                            <h3>
                                Attendance
                            </h3>

                            <div className="detail-grid">

                                <div>
                                    <span>
                                        Working Days
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.workingDays
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Present Days
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.presentDays
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Paid Leave
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.paidLeaveDays
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Unpaid Leave
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.unpaidLeaveDays
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Absent
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.absentDays
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Overtime
                                    </span>
                                    <strong>
                                        {
                                            selectedPayroll.overtimeHours
                                        }{" "}
                                        hrs
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* EARNINGS */}

                        <div className="payroll-detail-section">

                            <h3>
                                Earnings
                            </h3>

                            <div className="salary-lines">

                                <div>
                                    <span>
                                        Basic Salary
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.basicSalary
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        HRA
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.hra
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        DA
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.da
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Conveyance
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.conveyanceAllowance
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Medical
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.medicalAllowance
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Special Allowance
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.specialAllowance
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Other Allowance
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.otherAllowance
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Bonus
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.bonus
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Incentive
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.incentive
                                        )}
                                    </strong>
                                </div>

                                <div className="salary-total">

                                    <span>
                                        Gross Salary
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.grossSalary
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* DEDUCTIONS */}

                        <div className="payroll-detail-section">

                            <h3>
                                Deductions
                            </h3>

                            <div className="salary-lines">

                                <div>
                                    <span>
                                        PF
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.pfAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        ESI
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.esiAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Professional Tax
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.professionalTax
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        TDS
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.tdsAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Loan
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.loanDeduction
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Other Deduction
                                    </span>
                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.otherDeduction
                                        )}
                                    </strong>
                                </div>

                                <div className="salary-total deduction-total">

                                    <span>
                                        Total Deductions
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            selectedPayroll.totalDeductions
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* NET */}

                        <div className="payroll-net-box">

                            <div>

                                <span>
                                    Net Salary
                                </span>

                                <strong>
                                    {formatMoney(
                                        selectedPayroll.netSalary
                                    )}
                                </strong>

                            </div>

                            <span
                                className={`hr-payroll-status ${
                                    (
                                        STATUS_CONFIG[
                                            selectedPayroll.status
                                        ] ||
                                        STATUS_CONFIG.DRAFT
                                    ).className
                                }`}
                            >

                                <span />

                                {
                                    (
                                        STATUS_CONFIG[
                                            selectedPayroll.status
                                        ] ||
                                        STATUS_CONFIG.DRAFT
                                    ).label
                                }

                            </span>

                        </div>


                        {/* MODAL ACTIONS */}

                        <div className="hr-payroll-modal-actions">

                            {selectedPayroll.status ===
                                "DRAFT" && (

                                <button
                                    type="button"
                                    className="modal-approve-btn"
                                    onClick={() =>
                                        handleApprove(
                                            selectedPayroll
                                        )
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >

                                    <CheckCircle2
                                        size={17}
                                    />

                                    Approve Payroll

                                </button>

                            )}


                            {selectedPayroll.status ===
                                "APPROVED" && (

                                <button
                                    type="button"
                                    className="modal-pay-btn"
                                    onClick={() => {

                                        setPaymentPayroll(
                                            selectedPayroll
                                        );

                                        setSelectedPayroll(
                                            null
                                        );

                                    }}
                                    disabled={
                                        actionLoading
                                    }
                                >

                                    <CreditCard
                                        size={17}
                                    />

                                    Process Payment

                                </button>

                            )}

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setSelectedPayroll(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                PAYMENT MODAL
            ================================================= */}

            {paymentPayroll && (

                <div
                    className="hr-payroll-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setPaymentPayroll(null);
                        }

                    }}
                >

                    <form
                        className="hr-payment-modal"
                        onSubmit={
                            handlePayment
                        }
                    >

                        <div className="hr-payroll-modal-header">

                            <div>

                                <h2>
                                    Process Payment
                                </h2>

                                <p>
                                    {
                                        getEmployeeName(
                                            paymentPayroll.employee
                                        )
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPaymentPayroll(null)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="payment-summary">

                            <span>
                                Net Salary
                            </span>

                            <strong>
                                {formatMoney(
                                    paymentPayroll.netSalary
                                )}
                            </strong>

                        </div>


                        <div className="payment-form-group">

                            <label>
                                Payment Method
                            </label>

                            <select
                                value={
                                    paymentMethod
                                }
                                onChange={(event) =>
                                    setPaymentMethod(
                                        event.target.value
                                    )
                                }
                                required
                            >

                                <option value="BANK_TRANSFER">
                                    Bank Transfer
                                </option>

                                <option value="CASH">
                                    Cash
                                </option>

                                <option value="CHEQUE">
                                    Cheque
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div className="payment-form-group">

                            <label>
                                Payment Reference
                            </label>

                            <input
                                type="text"
                                placeholder="Transaction / cheque reference"
                                value={
                                    paymentReference
                                }
                                onChange={(event) =>
                                    setPaymentReference(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="payment-warning">

                            <AlertCircle
                                size={18}
                            />

                            <p>
                                After payment is processed,
                                this payroll will permanently
                                move to <strong>PAID</strong>.
                            </p>

                        </div>


                        <div className="hr-payroll-modal-actions">

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setPaymentPayroll(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="modal-pay-btn"
                                disabled={
                                    actionLoading
                                }
                            >

                                {actionLoading ? (

                                    <Loader2
                                        size={17}
                                        className="hr-payroll-spin"
                                    />

                                ) : (

                                    <CreditCard
                                        size={17}
                                    />

                                )}

                                {actionLoading
                                    ? "Processing..."
                                    : "Confirm Payment"}

                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>
    );
};


export default PayrollManagement;