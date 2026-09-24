import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Wallet,
    Users,
    IndianRupee,
    CheckCircle2,
    Clock3,
    XCircle,
    Search,
    RefreshCw,
    Plus,
    Eye,
    Trash2,
    Ban,
    CreditCard,
    X,
    UserRound,
    Mail,
    CalendarDays,
    Building2,
    BriefcaseBusiness,
    FileText,
    ArrowDownToLine,
    Banknote,
    CircleDollarSign,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from "lucide-react";

import "./HRPayroll.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


// =====================================================
// HELPERS
// =====================================================

const getErrorMessage = (error, fallback) => {

    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
};


const formatCurrency = (value) => {

    const amount = Number(value || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


const formatNumber = (value) => {

    return Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    );
};


const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
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


const getMonthName = (month) => {

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return months[
        Number(month) - 1
    ] || "-";
};


const getInitials = (name) => {

    if (!name) {
        return "HR";
    }

    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((item) =>
            item.charAt(0).toUpperCase()
        )
        .join("");
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const HRPayroll = () => {

    // =================================================
    // DATA
    // =================================================

    const [payrolls, setPayrolls] =
        useState([]);

    const [hrUsers, setHrUsers] =
        useState([]);


    // =================================================
    // LOADING
    // =================================================

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);


    // =================================================
    // ERROR / SUCCESS
    // =================================================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =================================================
    // FILTERS
    // =================================================

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [monthFilter, setMonthFilter] =
        useState("ALL");

    const [yearFilter, setYearFilter] =
        useState("ALL");


    // =================================================
    // MODALS
    // =================================================

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [showPaymentModal, setShowPaymentModal] =
        useState(false);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [showCancelModal, setShowCancelModal] =
        useState(false);


    // =================================================
    // SELECTED PAYROLL
    // =================================================

    const [selectedPayroll, setSelectedPayroll] =
        useState(null);


    // =================================================
    // CREATE FORM
    // =================================================

    const currentDate =
        new Date();

    const [createForm, setCreateForm] =
        useState({

            hr: "",

            month:
                currentDate.getMonth() + 1,

            year:
                currentDate.getFullYear(),
        });


    // =================================================
    // PAYMENT FORM
    // =================================================

    const [paymentForm, setPaymentForm] =
        useState({

            paymentMethod:
                "BANK_TRANSFER",

            paymentReference:
                "",

            notes:
                "",
        });


    // =================================================
    // DELETE/CANCEL
    // =================================================

    const [actionLoading, setActionLoading] =
        useState(false);


    // =================================================
    // PAGINATION
    // =================================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 8;


    // =================================================
    // LOAD PAYROLLS
    // =================================================

    const loadPayrolls = useCallback(
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

                const params = {};


                if (
                    search.trim()
                ) {

                    params.search =
                        search.trim();
                }


                if (
                    statusFilter !== "ALL"
                ) {

                    params.status =
                        statusFilter;
                }


                if (
                    monthFilter !== "ALL"
                ) {

                    params.month =
                        monthFilter;
                }


                if (
                    yearFilter !== "ALL"
                ) {

                    params.year =
                        yearFilter;
                }


                const response =
                    await api.get(
                        "/hr-payroll",
                        {
                            params,
                        }
                    );


                if (
                    response.data?.success
                ) {

                    setPayrolls(
                        Array.isArray(
                            response.data.payrolls
                        )
                            ? response.data.payrolls
                            : []
                    );

                } else {

                    setPayrolls([]);
                }

            } catch (err) {

                console.error(
                    "LOAD HR PAYROLL ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load HR payroll."
                    )
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
    // LOAD HR USERS
    // =================================================

    const loadHRUsers = useCallback(
        async () => {

            try {

                const response =
                    await api.get(
                        "/hr-salary-structures/hr-users"
                    );


                if (
                    response.data?.success
                ) {

                    setHrUsers(
                        Array.isArray(
                            response.data.hrUsers
                        )
                            ? response.data.hrUsers
                            : []
                    );
                }

            } catch (err) {

                console.error(
                    "LOAD HR USERS ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load HR users."
                    )
                );
            }

        },
        []
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadHRUsers();

    }, [
        loadHRUsers,
    ]);


    useEffect(() => {

        const timer =
            setTimeout(() => {

                loadPayrolls();

            }, 300);

        return () =>
            clearTimeout(timer);

    }, [
        loadPayrolls,
    ]);


    // =================================================
    // CLEAR ALERTS
    // =================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer =
            setTimeout(() => {

                setSuccess("");

            }, 4000);

        return () =>
            clearTimeout(timer);

    }, [
        success,
    ]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary =
        useMemo(() => {

            return {

                total:
                    payrolls.length,

                draft:
                    payrolls.filter(
                        (item) =>
                            item.status ===
                            "DRAFT"
                    ).length,

                paid:
                    payrolls.filter(
                        (item) =>
                            item.status ===
                            "PAID"
                    ).length,

                cancelled:
                    payrolls.filter(
                        (item) =>
                            item.status ===
                            "CANCELLED"
                    ).length,

                gross:
                    payrolls.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.grossSalary ||
                                0
                            ),
                        0
                    ),

                deductions:
                    payrolls.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.totalDeductions ||
                                0
                            ),
                        0
                    ),

                net:
                    payrolls.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.netSalary ||
                                0
                            ),
                        0
                    ),
            };

        }, [
            payrolls,
        ]);


    // =================================================
    // PAGINATION
    // =================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                payrolls.length /
                itemsPerPage
            )
        );


    const paginatedPayrolls =
        useMemo(() => {

            const start =
                (currentPage - 1) *
                itemsPerPage;

            return payrolls.slice(
                start,
                start + itemsPerPage
            );

        }, [
            payrolls,
            currentPage,
        ]);


    useEffect(() => {

        if (
            currentPage >
            totalPages
        ) {

            setCurrentPage(
                totalPages
            );
        }

    }, [
        currentPage,
        totalPages,
    ]);


    // =================================================
    // RESET PAGE WHEN FILTER CHANGES
    // =================================================

    useEffect(() => {

        setCurrentPage(1);

    }, [
        search,
        statusFilter,
        monthFilter,
        yearFilter,
    ]);


    // =================================================
    // CREATE PAYROLL
    // =================================================

    const handleCreatePayroll =
        async (event) => {

            event.preventDefault();

            try {

                setSaving(true);
                setError("");

                if (!createForm.hr) {

                    setError(
                        "Please select an HR."
                    );

                    return;
                }


                const response =
                    await api.post(
                        "/hr-payroll",
                        {
                            hr:
                                createForm.hr,

                            month:
                                Number(
                                    createForm.month
                                ),

                            year:
                                Number(
                                    createForm.year
                                ),
                        }
                    );


                if (
                    response.data?.success
                ) {

                    setSuccess(
                        "HR payroll created successfully."
                    );

                    setShowCreateModal(
                        false
                    );

                    setCreateForm({

                        hr: "",

                        month:
                            currentDate.getMonth() + 1,

                        year:
                            currentDate.getFullYear(),
                    });

                    await loadPayrolls(
                        true
                    );
                }

            } catch (err) {

                console.error(
                    "CREATE HR PAYROLL ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to create HR payroll."
                    )
                );

            } finally {

                setSaving(false);
            }
        };


    // =================================================
    // OPEN VIEW
    // =================================================

    const openView =
        async (payroll) => {

            try {

                setError("");

                const response =
                    await api.get(
                        `/hr-payroll/${payroll._id}`
                    );


                if (
                    response.data?.success
                ) {

                    setSelectedPayroll(
                        response.data.payroll
                    );

                } else {

                    setSelectedPayroll(
                        payroll
                    );
                }

            } catch (err) {

                console.error(
                    "VIEW HR PAYROLL ERROR:",
                    err
                );

                setSelectedPayroll(
                    payroll
                );

            } finally {

                setShowViewModal(
                    true
                );
            }
        };


    // =================================================
    // OPEN PAYMENT
    // =================================================

    const openPayment =
        (payroll) => {

            setSelectedPayroll(
                payroll
            );

            setPaymentForm({

                paymentMethod:
                    "BANK_TRANSFER",

                paymentReference:
                    "",

                notes:
                    "",
            });

            setShowPaymentModal(
                true
            );
        };


    // =================================================
    // PAY PAYROLL
    // =================================================

    const handlePayPayroll =
        async (event) => {

            event.preventDefault();

            if (
                !selectedPayroll?._id
            ) {
                return;
            }


            try {

                setActionLoading(true);
                setError("");

                const response =
                    await api.put(
                        `/hr-payroll/${selectedPayroll._id}/pay`,
                        paymentForm
                    );


                if (
                    response.data?.success
                ) {

                    setSuccess(
                        "HR payroll paid successfully."
                    );

                    setShowPaymentModal(
                        false
                    );

                    setSelectedPayroll(
                        null
                    );

                    await loadPayrolls(
                        true
                    );
                }

            } catch (err) {

                console.error(
                    "PAY HR PAYROLL ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to process payroll payment."
                    )
                );

            } finally {

                setActionLoading(false);
            }
        };


    // =================================================
    // CANCEL PAYROLL
    // =================================================

    const handleCancelPayroll =
        async () => {

            if (
                !selectedPayroll?._id
            ) {
                return;
            }


            try {

                setActionLoading(true);
                setError("");

                const response =
                    await api.put(
                        `/hr-payroll/${selectedPayroll._id}/cancel`
                    );


                if (
                    response.data?.success
                ) {

                    setSuccess(
                        "HR payroll cancelled successfully."
                    );

                    setShowCancelModal(
                        false
                    );

                    setSelectedPayroll(
                        null
                    );

                    await loadPayrolls(
                        true
                    );
                }

            } catch (err) {

                console.error(
                    "CANCEL HR PAYROLL ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to cancel HR payroll."
                    )
                );

            } finally {

                setActionLoading(false);
            }
        };


    // =================================================
    // DELETE PAYROLL
    // =================================================

    const handleDeletePayroll =
        async () => {

            if (
                !selectedPayroll?._id
            ) {
                return;
            }


            try {

                setActionLoading(true);
                setError("");

                const response =
                    await api.delete(
                        `/hr-payroll/${selectedPayroll._id}`
                    );


                if (
                    response.data?.success
                ) {

                    setSuccess(
                        "HR payroll deleted successfully."
                    );

                    setShowDeleteModal(
                        false
                    );

                    setSelectedPayroll(
                        null
                    );

                    await loadPayrolls(
                        true
                    );
                }

            } catch (err) {

                console.error(
                    "DELETE HR PAYROLL ERROR:",
                    err
                );

                setError(
                    getErrorMessage(
                        err,
                        "Failed to delete HR payroll."
                    )
                );

            } finally {

                setActionLoading(false);
            }
        };


    // =================================================
    // STATUS CLASS
    // =================================================

    const getStatusClass =
        (status) => {

            switch (status) {

                case "PAID":
                    return "paid";

                case "CANCELLED":
                    return "cancelled";

                default:
                    return "draft";
            }
        };


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
                            <Wallet size={24} />
                        </div>

                        <div>

                            <h1>
                                HR Payroll
                            </h1>

                            <p>
                                Create, manage and pay HR payroll
                            </p>

                        </div>

                    </div>

                </div>


                <div className="hr-payroll-header-actions">

                    <button
                        type="button"
                        className="hr-payroll-refresh-btn"
                        onClick={() =>
                            loadPayrolls(true)
                        }
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "hr-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="hr-payroll-primary-btn"
                        onClick={() =>
                            setShowCreateModal(true)
                        }
                    >

                        <Plus size={18} />

                        Create HR Payroll

                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="hr-payroll-alert error">

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


            {success && (

                <div className="hr-payroll-alert success">

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


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="hr-payroll-summary-grid">

                <div className="hr-payroll-summary-card">

                    <div className="summary-icon blue">
                        <Wallet size={21} />
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
                        <Clock3 size={21} />
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

                    <div className="summary-icon green">
                        <CheckCircle2 size={21} />
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
                        <XCircle size={21} />
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

                <div className="financial-card">

                    <div className="financial-card-icon">
                        <IndianRupee size={18} />
                    </div>

                    <div>

                        <span>
                            Gross Payroll
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.gross
                            )}
                        </strong>

                    </div>

                </div>


                <div className="financial-card">

                    <div className="financial-card-icon">
                        <ArrowDownToLine size={18} />
                    </div>

                    <div>

                        <span>
                            Total Deductions
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.deductions
                            )}
                        </strong>

                    </div>

                </div>


                <div className="financial-card">

                    <div className="financial-card-icon">
                        <CircleDollarSign size={18} />
                    </div>

                    <div>

                        <span>
                            Net Payroll
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.net
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="hr-payroll-filter-card">

                <div className="hr-payroll-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search HR name or email..."
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
                            <X size={16} />
                        </button>

                    )}

                </div>


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="DRAFT">
                        Draft
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

                    <option value="ALL">
                        All Months
                    </option>

                    {Array.from(
                        {
                            length: 12,
                        },
                        (_, index) => (

                            <option
                                key={index + 1}
                                value={index + 1}
                            >
                                {getMonthName(
                                    index + 1
                                )}
                            </option>

                        )
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

                    <option value="ALL">
                        All Years
                    </option>

                    {[
                        currentDate.getFullYear() - 2,
                        currentDate.getFullYear() - 1,
                        currentDate.getFullYear(),
                        currentDate.getFullYear() + 1,
                        currentDate.getFullYear() + 2,
                    ].map((year) => (

                        <option
                            key={year}
                            value={year}
                        >
                            {year}
                        </option>

                    ))}

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

                        <span>
                            {payrolls.length} payroll
                            {payrolls.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="hr-payroll-loading">

                        <div className="loading-spinner" />

                        <p>
                            Loading HR payroll...
                        </p>

                    </div>

                ) : payrolls.length === 0 ? (

                    <div className="hr-payroll-empty">

                        <div className="empty-icon">
                            <Wallet size={28} />
                        </div>

                        <h3>
                            No HR payroll found
                        </h3>

                        <p>
                            Create a payroll record to
                            get started.
                        </p>

                        <button
                            type="button"
                            className="hr-payroll-primary-btn"
                            onClick={() =>
                                setShowCreateModal(true)
                            }
                        >

                            <Plus size={17} />

                            Create Payroll

                        </button>

                    </div>

                ) : (

                    <>

                        <div className="hr-payroll-table-wrapper">

                            <table className="hr-payroll-table">

                                <thead>

                                    <tr>

                                        <th>
                                            HR
                                        </th>

                                        <th>
                                            Payroll Period
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

                                    {paginatedPayrolls.map(
                                        (payroll) => {

                                            const hr =
                                                payroll.hr;

                                            return (

                                                <tr
                                                    key={
                                                        payroll._id
                                                    }
                                                >

                                                    {/* HR */}

                                                    <td>

                                                        <div className="hr-payroll-user">

                                                            <div className="hr-avatar">

                                                                {hr?.profileImage ? (

                                                                    <img
                                                                        src={
                                                                            hr.profileImage
                                                                        }
                                                                        alt={
                                                                            hr.name ||
                                                                            "HR"
                                                                        }
                                                                    />

                                                                ) : (

                                                                    getInitials(
                                                                        hr?.name
                                                                    )

                                                                )}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        hr?.name ||
                                                                        "Unknown HR"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        hr?.email ||
                                                                        "-"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* PERIOD */}

                                                    <td>

                                                        <div className="period-cell">

                                                            <strong>
                                                                {
                                                                    getMonthName(
                                                                        payroll.month
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    payroll.year
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* GROSS */}

                                                    <td>

                                                        <span className="money-text">

                                                            {
                                                                formatCurrency(
                                                                    payroll.grossSalary
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* DEDUCTIONS */}

                                                    <td>

                                                        <span className="deduction-text">

                                                            {
                                                                formatCurrency(
                                                                    payroll.totalDeductions
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* NET */}

                                                    <td>

                                                        <strong className="net-text">

                                                            {
                                                                formatCurrency(
                                                                    payroll.netSalary
                                                                )
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={`payroll-status ${getStatusClass(
                                                                payroll.status
                                                            )}`}
                                                        >

                                                            {payroll.status ===
                                                                "PAID" && (
                                                                <CheckCircle2
                                                                    size={14}
                                                                />
                                                            )}

                                                            {payroll.status ===
                                                                "DRAFT" && (
                                                                <Clock3
                                                                    size={14}
                                                                />
                                                            )}

                                                            {payroll.status ===
                                                                "CANCELLED" && (
                                                                <XCircle
                                                                    size={14}
                                                                />
                                                            )}

                                                            {
                                                                payroll.status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="hr-payroll-actions">

                                                            <button
                                                                type="button"
                                                                className="table-action view"
                                                                title="View"
                                                                onClick={() =>
                                                                    openView(
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
                                                                    className="table-action pay"
                                                                    title="Pay Payroll"
                                                                    onClick={() =>
                                                                        openPayment(
                                                                            payroll
                                                                        )
                                                                    }
                                                                >
                                                                    <CreditCard
                                                                        size={16}
                                                                    />
                                                                </button>

                                                            )}


                                                            {payroll.status ===
                                                                "DRAFT" && (

                                                                <button
                                                                    type="button"
                                                                    className="table-action cancel"
                                                                    title="Cancel"
                                                                    onClick={() => {

                                                                        setSelectedPayroll(
                                                                            payroll
                                                                        );

                                                                        setShowCancelModal(
                                                                            true
                                                                        );

                                                                    }}
                                                                >
                                                                    <Ban
                                                                        size={16}
                                                                    />
                                                                </button>

                                                            )}


                                                            {payroll.status !==
                                                                "PAID" && (

                                                                <button
                                                                    type="button"
                                                                    className="table-action delete"
                                                                    title="Delete"
                                                                    onClick={() => {

                                                                        setSelectedPayroll(
                                                                            payroll
                                                                        );

                                                                        setShowDeleteModal(
                                                                            true
                                                                        );

                                                                    }}
                                                                >
                                                                    <Trash2
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


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        <div className="hr-payroll-pagination">

                            <span>

                                Showing{" "}

                                <strong>
                                    {
                                        payrolls.length === 0
                                            ? 0
                                            : (
                                                (currentPage - 1) *
                                                itemsPerPage
                                            ) + 1
                                    }
                                </strong>

                                {" "}to{" "}

                                <strong>
                                    {Math.min(
                                        currentPage *
                                        itemsPerPage,
                                        payrolls.length
                                    )}
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {payrolls.length}
                                </strong>

                            </span>


                            <div className="pagination-buttons">

                                <button
                                    type="button"
                                    disabled={
                                        currentPage <= 1
                                    }
                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
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
                                            (page) =>
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
                CREATE MODAL
            ================================================= */}

            {showCreateModal && (

                <div
                    className="hr-payroll-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setShowCreateModal(
                                false
                            );
                        }

                    }}
                >

                    <div className="hr-payroll-modal create-modal">

                        <div className="modal-header">

                            <div>

                                <div className="modal-icon blue">
                                    <Wallet size={21} />
                                </div>

                                <div>

                                    <h2>
                                        Create HR Payroll
                                    </h2>

                                    <p>
                                        Generate payroll from the
                                        active salary structure
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateModal(
                                        false
                                    )
                                }
                            >
                                <X size={19} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCreatePayroll
                            }
                        >

                            <div className="modal-body">

                                <div className="form-group">

                                    <label>
                                        Select HR
                                        <span>*</span>
                                    </label>

                                    <div className="select-with-icon">

                                        <UserRound
                                            size={17}
                                        />

                                        <select
                                            value={
                                                createForm.hr
                                            }
                                            onChange={(event) =>
                                                setCreateForm(
                                                    (prev) => ({
                                                        ...prev,
                                                        hr:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select HR employee
                                            </option>

                                            {hrUsers
                                                .filter(
                                                    (hr) =>
                                                        hr.isActive !==
                                                        false
                                                )
                                                .map(
                                                    (hr) => (

                                                        <option
                                                            key={
                                                                hr._id
                                                            }
                                                            value={
                                                                hr._id
                                                            }
                                                        >
                                                            {
                                                                hr.name
                                                            }
                                                            {" — "}
                                                            {
                                                                hr.email
                                                            }
                                                        </option>

                                                    )
                                                )}

                                        </select>

                                    </div>


                                    {hrUsers.length === 0 && (

                                        <small className="form-warning">
                                            No HR users available.
                                            Create an active HR user
                                            first.
                                        </small>

                                    )}

                                </div>


                                <div className="form-grid-2">

                                    <div className="form-group">

                                        <label>
                                            Month
                                            <span>*</span>
                                        </label>

                                        <div className="select-with-icon">

                                            <CalendarDays
                                                size={17}
                                            />

                                            <select
                                                value={
                                                    createForm.month
                                                }
                                                onChange={(event) =>
                                                    setCreateForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            month:
                                                                event.target.value,
                                                        })
                                                    )
                                                }
                                                required
                                            >

                                                {Array.from(
                                                    {
                                                        length: 12,
                                                    },
                                                    (
                                                        _,
                                                        index
                                                    ) => (

                                                        <option
                                                            key={
                                                                index + 1
                                                            }
                                                            value={
                                                                index + 1
                                                            }
                                                        >
                                                            {
                                                                getMonthName(
                                                                    index + 1
                                                                )
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Year
                                            <span>*</span>
                                        </label>

                                        <div className="select-with-icon">

                                            <CalendarDays
                                                size={17}
                                            />

                                            <select
                                                value={
                                                    createForm.year
                                                }
                                                onChange={(event) =>
                                                    setCreateForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            year:
                                                                event.target.value,
                                                        })
                                                    )
                                                }
                                                required
                                            >

                                                {[
                                                    currentDate.getFullYear() - 2,
                                                    currentDate.getFullYear() - 1,
                                                    currentDate.getFullYear(),
                                                    currentDate.getFullYear() + 1,
                                                    currentDate.getFullYear() + 2,
                                                ].map(
                                                    (year) => (

                                                        <option
                                                            key={
                                                                year
                                                            }
                                                            value={
                                                                year
                                                            }
                                                        >
                                                            {
                                                                year
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>

                                </div>


                                <div className="create-info-box">

                                    <AlertCircle
                                        size={18}
                                    />

                                    <div>

                                        <strong>
                                            Payroll calculation
                                        </strong>

                                        <p>
                                            The payroll will use the
                                            selected HR's active salary
                                            structure. Gross salary,
                                            PF, ESI, TDS and other
                                            deductions are calculated
                                            by the backend.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="modal-secondary-btn"
                                    onClick={() =>
                                        setShowCreateModal(
                                            false
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="modal-primary-btn"
                                    disabled={
                                        saving ||
                                        hrUsers.length === 0
                                    }
                                >

                                    {saving ? (

                                        <>
                                            <span className="button-spinner" />
                                            Creating...
                                        </>

                                    ) : (

                                        <>
                                            <Plus size={17} />
                                            Create Payroll
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {showViewModal &&
                selectedPayroll && (

                    <div
                        className="hr-payroll-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                setShowViewModal(
                                    false
                                );
                            }

                        }}
                    >

                        <div className="hr-payroll-modal view-modal">

                            <div className="modal-header">

                                <div>

                                    <div className="modal-icon blue">
                                        <FileText size={21} />
                                    </div>

                                    <div>

                                        <h2>
                                            HR Payroll Details
                                        </h2>

                                        <p>
                                            Payroll breakdown and payment
                                            information
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>


                            <div className="modal-body">

                                {/* HR PROFILE */}

                                <div className="payroll-profile-card">

                                    <div className="hr-avatar large">

                                        {selectedPayroll.hr?.profileImage ? (

                                            <img
                                                src={
                                                    selectedPayroll.hr
                                                        .profileImage
                                                }
                                                alt={
                                                    selectedPayroll.hr
                                                        .name ||
                                                    "HR"
                                                }
                                            />

                                        ) : (

                                            getInitials(
                                                selectedPayroll.hr?.name
                                            )

                                        )}

                                    </div>


                                    <div className="profile-info">

                                        <h3>
                                            {
                                                selectedPayroll.hr?.name ||
                                                "Unknown HR"
                                            }
                                        </h3>

                                        <span>

                                            <Mail
                                                size={14}
                                            />

                                            {
                                                selectedPayroll.hr?.email ||
                                                "-"
                                            }

                                        </span>

                                        <span>

                                            <CalendarDays
                                                size={14}
                                            />

                                            {
                                                getMonthName(
                                                    selectedPayroll.month
                                                )
                                            }
                                            {" "}
                                            {
                                                selectedPayroll.year
                                            }

                                        </span>

                                    </div>


                                    <span
                                        className={`payroll-status ${getStatusClass(
                                            selectedPayroll.status
                                        )}`}
                                    >
                                        {
                                            selectedPayroll.status
                                        }
                                    </span>

                                </div>


                                {/* EARNINGS */}

                                <div className="breakdown-section">

                                    <div className="breakdown-heading">

                                        <div className="heading-icon green">
                                            <Banknote size={17} />
                                        </div>

                                        <h3>
                                            Earnings
                                        </h3>

                                    </div>


                                    <div className="breakdown-grid">

                                        <BreakdownItem
                                            label="Basic Salary"
                                            value={
                                                selectedPayroll.basicSalary
                                            }
                                        />

                                        <BreakdownItem
                                            label="HRA"
                                            value={
                                                selectedPayroll.hra
                                            }
                                        />

                                        <BreakdownItem
                                            label="DA"
                                            value={
                                                selectedPayroll.da
                                            }
                                        />

                                        <BreakdownItem
                                            label="Conveyance"
                                            value={
                                                selectedPayroll.conveyanceAllowance
                                            }
                                        />

                                        <BreakdownItem
                                            label="Medical"
                                            value={
                                                selectedPayroll.medicalAllowance
                                            }
                                        />

                                        <BreakdownItem
                                            label="Special Allowance"
                                            value={
                                                selectedPayroll.specialAllowance
                                            }
                                        />

                                        <BreakdownItem
                                            label="Other Allowance"
                                            value={
                                                selectedPayroll.otherAllowance
                                            }
                                        />

                                        <BreakdownItem
                                            label="Bonus"
                                            value={
                                                selectedPayroll.bonus
                                            }
                                        />

                                        <BreakdownItem
                                            label="Incentive"
                                            value={
                                                selectedPayroll.incentive
                                            }
                                        />

                                    </div>


                                    <div className="total-row gross">

                                        <span>
                                            Gross Salary
                                        </span>

                                        <strong>
                                            {
                                                formatCurrency(
                                                    selectedPayroll.grossSalary
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* DEDUCTIONS */}

                                <div className="breakdown-section">

                                    <div className="breakdown-heading">

                                        <div className="heading-icon red">
                                            <ArrowDownToLine
                                                size={17}
                                            />
                                        </div>

                                        <h3>
                                            Deductions
                                        </h3>

                                    </div>


                                    <div className="breakdown-grid">

                                        <BreakdownItem
                                            label="PF"
                                            value={
                                                selectedPayroll.pfAmount
                                            }
                                            deduction
                                        />

                                        <BreakdownItem
                                            label="ESI"
                                            value={
                                                selectedPayroll.esiAmount
                                            }
                                            deduction
                                        />

                                        <BreakdownItem
                                            label="Professional Tax"
                                            value={
                                                selectedPayroll.professionalTax
                                            }
                                            deduction
                                        />

                                        <BreakdownItem
                                            label="TDS"
                                            value={
                                                selectedPayroll.tdsAmount
                                            }
                                            deduction
                                        />

                                        <BreakdownItem
                                            label="Loan Deduction"
                                            value={
                                                selectedPayroll.loanDeduction
                                            }
                                            deduction
                                        />

                                        <BreakdownItem
                                            label="Other Deduction"
                                            value={
                                                selectedPayroll.otherDeduction
                                            }
                                            deduction
                                        />

                                    </div>


                                    <div className="total-row deduction">

                                        <span>
                                            Total Deductions
                                        </span>

                                        <strong>
                                            {
                                                formatCurrency(
                                                    selectedPayroll.totalDeductions
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* NET */}

                                <div className="net-salary-box">

                                    <div>

                                        <span>
                                            Net Salary
                                        </span>

                                        <small>
                                            Gross salary minus total
                                            deductions
                                        </small>

                                    </div>

                                    <strong>
                                        {
                                            formatCurrency(
                                                selectedPayroll.netSalary
                                            )
                                        }
                                    </strong>

                                </div>


                                {/* ATTENDANCE */}

                                <div className="attendance-summary">

                                    <div className="attendance-item">

                                        <span>
                                            Working Days
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    selectedPayroll.workingDays
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="attendance-item">

                                        <span>
                                            Present Days
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    selectedPayroll.presentDays
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="attendance-item">

                                        <span>
                                            Paid Leave
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    selectedPayroll.paidLeaveDays
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="attendance-item">

                                        <span>
                                            Unpaid Leave
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    selectedPayroll.unpaidLeaveDays
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="attendance-item">

                                        <span>
                                            Absent
                                        </span>

                                        <strong>
                                            {
                                                formatNumber(
                                                    selectedPayroll.absentDays
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* PAYMENT DETAILS */}

                                {selectedPayroll.status ===
                                    "PAID" && (

                                    <div className="payment-info-card">

                                        <div className="payment-info-heading">

                                            <CreditCard
                                                size={18}
                                            />

                                            <h3>
                                                Payment Information
                                            </h3>

                                        </div>


                                        <div className="payment-info-grid">

                                            <div>

                                                <span>
                                                    Payment Method
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.paymentMethod ||
                                                        "-"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Payment Reference
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.paymentReference ||
                                                        "-"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Paid Date
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            selectedPayroll.paidAt
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Paid By
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.paidBy?.name ||
                                                        "-"
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {selectedPayroll.notes && (

                                    <div className="notes-box">

                                        <FileText size={17} />

                                        <div>

                                            <strong>
                                                Notes
                                            </strong>

                                            <p>
                                                {
                                                    selectedPayroll.notes
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </div>


                            <div className="modal-footer">

                                {selectedPayroll.status ===
                                    "DRAFT" && (

                                    <>

                                        <button
                                            type="button"
                                            className="modal-danger-outline-btn"
                                            onClick={() => {

                                                setShowViewModal(
                                                    false
                                                );

                                                setShowCancelModal(
                                                    true
                                                );

                                            }}
                                        >

                                            <Ban size={16} />

                                            Cancel Payroll

                                        </button>


                                        <button
                                            type="button"
                                            className="modal-primary-btn"
                                            onClick={() => {

                                                setShowViewModal(
                                                    false
                                                );

                                                openPayment(
                                                    selectedPayroll
                                                );

                                            }}
                                        >

                                            <CreditCard
                                                size={16}
                                            />

                                            Pay Payroll

                                        </button>

                                    </>

                                )}


                                {selectedPayroll.status !==
                                    "PAID" && (

                                    <button
                                        type="button"
                                        className="modal-delete-btn"
                                        onClick={() => {

                                            setShowViewModal(
                                                false
                                            );

                                            setShowDeleteModal(
                                                true
                                            );

                                        }}
                                    >

                                        <Trash2
                                            size={16}
                                        />

                                        Delete

                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                )}


            {/* =================================================
                PAYMENT MODAL
            ================================================= */}

            {showPaymentModal &&
                selectedPayroll && (

                    <div
                        className="hr-payroll-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                setShowPaymentModal(
                                    false
                                );
                            }

                        }}
                    >

                        <div className="hr-payroll-modal payment-modal">

                            <div className="modal-header">

                                <div>

                                    <div className="modal-icon green">
                                        <CreditCard size={21} />
                                    </div>

                                    <div>

                                        <h2>
                                            Pay HR Payroll
                                        </h2>

                                        <p>
                                            Complete the payment for this
                                            payroll
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPaymentModal(
                                            false
                                        )
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handlePayPayroll
                                }
                            >

                                <div className="modal-body">

                                    <div className="payment-summary">

                                        <div>

                                            <span>
                                                HR
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.hr?.name ||
                                                    "-"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Period
                                            </span>

                                            <strong>
                                                {
                                                    getMonthName(
                                                        selectedPayroll.month
                                                    )
                                                }
                                                {" "}
                                                {
                                                    selectedPayroll.year
                                                }
                                            </strong>

                                        </div>


                                        <div className="payment-net">

                                            <span>
                                                Net Payable
                                            </span>

                                            <strong>
                                                {
                                                    formatCurrency(
                                                        selectedPayroll.netSalary
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Payment Method
                                            <span>*</span>
                                        </label>

                                        <div className="select-with-icon">

                                            <CreditCard
                                                size={17}
                                            />

                                            <select
                                                value={
                                                    paymentForm.paymentMethod
                                                }
                                                onChange={(event) =>
                                                    setPaymentForm(
                                                        (prev) => ({
                                                            ...prev,
                                                            paymentMethod:
                                                                event.target.value,
                                                        })
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

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Payment Reference
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Transaction ID / cheque number..."
                                            value={
                                                paymentForm.paymentReference
                                            }
                                            onChange={(event) =>
                                                setPaymentForm(
                                                    (prev) => ({
                                                        ...prev,
                                                        paymentReference:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Notes
                                        </label>

                                        <textarea
                                            rows="4"
                                            placeholder="Add payment notes..."
                                            value={
                                                paymentForm.notes
                                            }
                                            onChange={(event) =>
                                                setPaymentForm(
                                                    (prev) => ({
                                                        ...prev,
                                                        notes:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                        />

                                    </div>


                                    <div className="payment-warning">

                                        <AlertCircle
                                            size={18}
                                        />

                                        <p>
                                            Once paid, this payroll
                                            status will change from
                                            <strong> DRAFT </strong>
                                            to
                                            <strong> PAID</strong>.
                                            Paid payroll cannot be
                                            cancelled or deleted.
                                        </p>

                                    </div>

                                </div>


                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="modal-secondary-btn"
                                        onClick={() =>
                                            setShowPaymentModal(
                                                false
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="modal-success-btn"
                                        disabled={
                                            actionLoading
                                        }
                                    >

                                        {actionLoading ? (

                                            <>
                                                <span className="button-spinner" />
                                                Processing...
                                            </>

                                        ) : (

                                            <>
                                                <CreditCard
                                                    size={17}
                                                />

                                                Pay{" "}
                                                {
                                                    formatCurrency(
                                                        selectedPayroll.netSalary
                                                    )
                                                }

                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


            {/* =================================================
                CANCEL MODAL
            ================================================= */}

            {showCancelModal &&
                selectedPayroll && (

                    <ConfirmationModal

                        title="Cancel HR Payroll?"

                        message={
                            `Are you sure you want to cancel the ${getMonthName(
                                selectedPayroll.month
                            )} ${selectedPayroll.year} payroll for ${
                                selectedPayroll.hr?.name ||
                                "this HR"
                            }?`
                        }

                        confirmText="Cancel Payroll"

                        icon={
                            <Ban size={22} />
                        }

                        danger

                        loading={
                            actionLoading
                        }

                        onClose={() =>
                            setShowCancelModal(
                                false
                            )
                        }

                        onConfirm={
                            handleCancelPayroll
                        }

                    />

                )}


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {showDeleteModal &&
                selectedPayroll && (

                    <ConfirmationModal

                        title="Delete HR Payroll?"

                        message={
                            `This will permanently delete the ${getMonthName(
                                selectedPayroll.month
                            )} ${selectedPayroll.year} payroll for ${
                                selectedPayroll.hr?.name ||
                                "this HR"
                            }. This action cannot be undone.`
                        }

                        confirmText="Delete Payroll"

                        icon={
                            <Trash2 size={22} />
                        }

                        danger

                        loading={
                            actionLoading
                        }

                        onClose={() =>
                            setShowDeleteModal(
                                false
                            )
                        }

                        onConfirm={
                            handleDeletePayroll
                        }

                    />

                )}

        </div>

    );
};


// =====================================================
// BREAKDOWN ITEM
// =====================================================

const BreakdownItem = ({
    label,
    value,
    deduction = false,
}) => {

    return (

        <div className="breakdown-item">

            <span>
                {label}
            </span>

            <strong
                className={
                    deduction
                        ? "deduction-value"
                        : ""
                }
            >
                {deduction ? "-" : ""}
                {formatCurrency(value)}
            </strong>

        </div>

    );
};


// =====================================================
// CONFIRMATION MODAL
// =====================================================

const ConfirmationModal = ({
    title,
    message,
    confirmText,
    icon,
    danger = false,
    loading = false,
    onClose,
    onConfirm,
}) => {

    return (

        <div
            className="hr-payroll-modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose();
                }

            }}
        >

            <div className="hr-payroll-confirm-modal">

                <div
                    className={`confirmation-icon ${
                        danger
                            ? "danger"
                            : ""
                    }`}
                >
                    {icon}
                </div>


                <h2>
                    {title}
                </h2>


                <p>
                    {message}
                </p>


                <div className="confirmation-actions">

                    <button
                        type="button"
                        className="modal-secondary-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Keep It
                    </button>


                    <button
                        type="button"
                        className="modal-danger-btn"
                        onClick={onConfirm}
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <span className="button-spinner" />
                                Processing...
                            </>

                        ) : (

                            <>
                                {icon}
                                {confirmText}
                            </>

                        )}

                    </button>

                </div>

            </div>

        </div>

    );
};


export default HRPayroll;