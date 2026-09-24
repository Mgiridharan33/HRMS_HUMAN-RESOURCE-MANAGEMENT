import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    WalletCards,
    IndianRupee,
    CheckCircle2,
    Clock3,
    XCircle,
    Search,
    RefreshCw,
    Eye,
    Download,
    Printer,
    CalendarDays,
    UserRound,
    Mail,
    BriefcaseBusiness,
    Building2,
    FileText,
    X,
    ArrowDownToLine,
} from "lucide-react";

import axios from "axios";

import "./HRPayroll.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const hrPayrollApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});


// =====================================================
// HELPERS
// =====================================================

const MONTHS = [
    "",
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


const formatCurrency = (value) => {

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


const formatNumber = (value) => {

    return new Intl.NumberFormat(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    ).format(Number(value || 0));
};


const formatDate = (value) => {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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


const getMonthName = (month) => {

    return MONTHS[
        Number(month)
    ] || "—";
};


const getStatusClass = (status) => {

    switch (
        String(status || "")
            .toUpperCase()
    ) {

        case "PAID":
            return "paid";

        case "CANCELLED":
            return "cancelled";

        case "DRAFT":
        default:
            return "draft";
    }
};


// =====================================================
// COMPONENT
// =====================================================

const HRPayroll = () => {

    // =================================================
    // STATE
    // =================================================

    const [payrolls, setPayrolls] =
        useState([]);

    const [summary, setSummary] =
        useState({
            total: 0,
            draft: 0,
            paid: 0,
            cancelled: 0,
            gross: 0,
            deductions: 0,
            net: 0,
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [month, setMonth] =
        useState("");

    const [year, setYear] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [selectedPayroll, setSelectedPayroll] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(false);


    // =================================================
    // YEARS
    // =================================================

    const years = useMemo(() => {

        const currentYear =
            new Date().getFullYear();

        return Array.from(
            {
                length: 7,
            },
            (_, index) =>
                currentYear - index
        );

    }, []);


    // =================================================
    // LOAD PAYROLL
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


                if (search.trim()) {

                    params.search =
                        search.trim();
                }


                if (month) {

                    params.month =
                        month;
                }


                if (year) {

                    params.year =
                        year;
                }


                if (status) {

                    params.status =
                        status;
                }


                const response =
                    await hrPayrollApi.get(
                        "/hr-payroll",
                        {
                            params,
                        }
                    );


                const data =
                    response?.data || {};


                setPayrolls(
                    Array.isArray(
                        data.payrolls
                    )
                        ? data.payrolls
                        : []
                );


                setSummary(
                    data.summary || {
                        total: 0,
                        draft: 0,
                        paid: 0,
                        cancelled: 0,
                        gross: 0,
                        deductions: 0,
                        net: 0,
                    }
                );

            } catch (err) {

                console.error(
                    "HR PAYROLL LOAD ERROR:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    "Failed to load payroll records."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }

        },
        [
            search,
            month,
            year,
            status,
        ]
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadPayrolls();

    }, [loadPayrolls]);


    // =================================================
    // VIEW PAYROLL
    // =================================================

    const handleView =
        async (payroll) => {

            try {

                setShowDetails(true);
                setSelectedPayroll(payroll);


                if (!payroll?._id) {
                    return;
                }


                const response =
                    await hrPayrollApi.get(
                        `/hr-payroll/${payroll._id}`
                    );


                if (
                    response?.data?.payroll
                ) {

                    setSelectedPayroll(
                        response.data.payroll
                    );
                }

            } catch (err) {

                console.error(
                    "PAYROLL DETAILS ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load payroll details."
                );
            }
        };


    // =================================================
    // CLOSE DETAILS
    // =================================================

    const closeDetails = () => {

        setShowDetails(false);
        setSelectedPayroll(null);
    };


    // =================================================
    // RESET FILTERS
    // =================================================

    const resetFilters = () => {

        setSearch("");
        setMonth("");
        setYear("");
        setStatus("");
    };


    // =================================================
    // PRINT PAYSLIP
    // =================================================

    const printPayslip =
        (payroll) => {

            if (!payroll) {
                return;
            }


            const hr =
                payroll.hr || {};


            const html = `
                <!DOCTYPE html>

                <html>

                <head>

                    <title>
                        Payslip -
                        ${getMonthName(payroll.month)}
                        ${payroll.year}
                    </title>

                    <style>

                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 30px;
                            font-family:
                                Arial,
                                Helvetica,
                                sans-serif;
                            color: #172033;
                            background: #ffffff;
                        }

                        .payslip {
                            max-width: 850px;
                            margin: auto;
                            border: 1px solid #dbe3ef;
                            border-radius: 12px;
                            overflow: hidden;
                        }

                        .header {
                            padding: 25px;
                            background: #2563eb;
                            color: white;
                        }

                        .header h1 {
                            margin: 0 0 6px;
                            font-size: 26px;
                        }

                        .header p {
                            margin: 0;
                            opacity: .9;
                        }

                        .section {
                            padding: 22px 25px;
                            border-bottom: 1px solid #e5eaf2;
                        }

                        .section-title {
                            margin: 0 0 15px;
                            font-size: 15px;
                            color: #2563eb;
                            text-transform: uppercase;
                            letter-spacing: .5px;
                        }

                        .grid {
                            display: grid;
                            grid-template-columns:
                                repeat(2, 1fr);
                            gap: 12px;
                        }

                        .row {
                            display: flex;
                            justify-content:
                                space-between;
                            padding: 9px 0;
                            border-bottom:
                                1px dashed #e5eaf2;
                        }

                        .label {
                            color: #64748b;
                        }

                        .value {
                            font-weight: 600;
                        }

                        .total {
                            display: flex;
                            justify-content:
                                space-between;
                            padding: 18px 25px;
                            background: #eff6ff;
                            font-size: 18px;
                            font-weight: 700;
                            color: #1d4ed8;
                        }

                        .footer {
                            padding: 18px 25px;
                            color: #64748b;
                            font-size: 12px;
                            text-align: center;
                        }

                        @media print {

                            body {
                                padding: 0;
                            }

                            .payslip {
                                border: 0;
                            }

                        }

                    </style>

                </head>

                <body>

                    <div class="payslip">

                        <div class="header">

                            <h1>
                                HRMS Payslip
                            </h1>

                            <p>
                                ${getMonthName(payroll.month)}
                                ${payroll.year}
                            </p>

                        </div>


                        <div class="section">

                            <h2 class="section-title">
                                Employee Information
                            </h2>

                            <div class="grid">

                                <div>
                                    <strong>
                                        Name
                                    </strong>
                                    <br />
                                    ${hr.name || "—"}
                                </div>

                                <div>
                                    <strong>
                                        Email
                                    </strong>
                                    <br />
                                    ${hr.email || "—"}
                                </div>

                                <div>
                                    <strong>
                                        Role
                                    </strong>
                                    <br />
                                    ${hr.role || "HR"}
                                </div>

                                <div>
                                    <strong>
                                        Payroll Period
                                    </strong>
                                    <br />
                                    ${getMonthName(payroll.month)}
                                    ${payroll.year}
                                </div>

                            </div>

                        </div>


                        <div class="section">

                            <h2 class="section-title">
                                Earnings
                            </h2>

                            <div class="row">
                                <span class="label">
                                    Basic Salary
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.basicSalary)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    HRA
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.hra)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    DA
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.da)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Conveyance
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.conveyanceAllowance)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Medical
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.medicalAllowance)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Special Allowance
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.specialAllowance)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Other Allowance
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.otherAllowance)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Bonus
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.bonus)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Incentive
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.incentive)}
                                </span>
                            </div>

                            <div class="row">
                                <strong>
                                    Gross Salary
                                </strong>
                                <strong>
                                    ${formatCurrency(payroll.grossSalary)}
                                </strong>
                            </div>

                        </div>


                        <div class="section">

                            <h2 class="section-title">
                                Deductions
                            </h2>

                            <div class="row">
                                <span class="label">
                                    PF
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.pfAmount)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    ESI
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.esiAmount)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Professional Tax
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.professionalTax)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    TDS
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.tdsAmount)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Loan Deduction
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.loanDeduction)}
                                </span>
                            </div>

                            <div class="row">
                                <span class="label">
                                    Other Deduction
                                </span>
                                <span class="value">
                                    ${formatCurrency(payroll.otherDeduction)}
                                </span>
                            </div>

                            <div class="row">
                                <strong>
                                    Total Deductions
                                </strong>
                                <strong>
                                    ${formatCurrency(payroll.totalDeductions)}
                                </strong>
                            </div>

                        </div>


                        <div class="total">

                            <span>
                                Net Salary
                            </span>

                            <span>
                                ${formatCurrency(payroll.netSalary)}
                            </span>

                        </div>


                        <div class="footer">

                            Generated from HRMS Payroll Management

                        </div>

                    </div>

                    <script>

                        window.onload = function () {
                            window.print();
                        };

                    </script>

                </body>

                </html>
            `;


            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=1000,height=800"
                );


            if (!printWindow) {

                alert(
                    "Please allow pop-ups to print the payslip."
                );

                return;
            }


            printWindow.document.open();

            printWindow.document.write(
                html
            );

            printWindow.document.close();
        };


    // =================================================
    // DOWNLOAD PAYSLIP
    // =================================================

    const downloadPayslip =
        (payroll) => {

            if (!payroll) {
                return;
            }


            const hr =
                payroll.hr || {};


            const rows = [

                [
                    "Employee Name",
                    hr.name || "—",
                ],

                [
                    "Email",
                    hr.email || "—",
                ],

                [
                    "Role",
                    hr.role || "HR",
                ],

                [
                    "Payroll Month",
                    `${getMonthName(payroll.month)} ${payroll.year}`,
                ],

                [
                    "Status",
                    payroll.status || "—",
                ],

                [
                    "Basic Salary",
                    formatCurrency(payroll.basicSalary),
                ],

                [
                    "HRA",
                    formatCurrency(payroll.hra),
                ],

                [
                    "DA",
                    formatCurrency(payroll.da),
                ],

                [
                    "Conveyance",
                    formatCurrency(payroll.conveyanceAllowance),
                ],

                [
                    "Medical Allowance",
                    formatCurrency(payroll.medicalAllowance),
                ],

                [
                    "Special Allowance",
                    formatCurrency(payroll.specialAllowance),
                ],

                [
                    "Other Allowance",
                    formatCurrency(payroll.otherAllowance),
                ],

                [
                    "Bonus",
                    formatCurrency(payroll.bonus),
                ],

                [
                    "Incentive",
                    formatCurrency(payroll.incentive),
                ],

                [
                    "Gross Salary",
                    formatCurrency(payroll.grossSalary),
                ],

                [
                    "PF",
                    formatCurrency(payroll.pfAmount),
                ],

                [
                    "ESI",
                    formatCurrency(payroll.esiAmount),
                ],

                [
                    "Professional Tax",
                    formatCurrency(payroll.professionalTax),
                ],

                [
                    "TDS",
                    formatCurrency(payroll.tdsAmount),
                ],

                [
                    "Loan Deduction",
                    formatCurrency(payroll.loanDeduction),
                ],

                [
                    "Other Deduction",
                    formatCurrency(payroll.otherDeduction),
                ],

                [
                    "Total Deductions",
                    formatCurrency(payroll.totalDeductions),
                ],

                [
                    "Net Salary",
                    formatCurrency(payroll.netSalary),
                ],

            ];


            const csv = rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(value)
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`
                            )
                            .join(",")
                )
                .join("\n");


            const blob =
                new Blob(
                    [
                        csv,
                    ],
                    {
                        type:
                            "text/csv;charset=utf-8;",
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href = url;


            anchor.download =
                `Payslip-${getMonthName(
                    payroll.month
                )}-${payroll.year}.csv`;


            document.body.appendChild(
                anchor
            );


            anchor.click();


            document.body.removeChild(
                anchor
            );


            URL.revokeObjectURL(
                url
            );
        };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="hr-payroll-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="hr-payroll-header">

                <div>

                    <div className="hr-payroll-title-row">

                        <div className="hr-payroll-title-icon">

                            <WalletCards size={23} />

                        </div>

                        <div>

                            <h1>
                                My Payroll
                            </h1>

                            <p>
                                View your salary, payroll
                                history and payslips.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-payroll-refresh"
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

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="hr-payroll-error">

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
                SUMMARY CARDS
            ================================================= */}

            <div className="hr-payroll-summary">

                <div className="payroll-summary-card">

                    <div className="summary-icon blue">

                        <WalletCards size={20} />

                    </div>

                    <div>

                        <span>
                            Total Payroll
                        </span>

                        <strong>
                            {summary.total || 0}
                        </strong>

                    </div>

                </div>


                <div className="payroll-summary-card">

                    <div className="summary-icon orange">

                        <Clock3 size={20} />

                    </div>

                    <div>

                        <span>
                            Draft
                        </span>

                        <strong>
                            {summary.draft || 0}
                        </strong>

                    </div>

                </div>


                <div className="payroll-summary-card">

                    <div className="summary-icon green">

                        <CheckCircle2 size={20} />

                    </div>

                    <div>

                        <span>
                            Paid
                        </span>

                        <strong>
                            {summary.paid || 0}
                        </strong>

                    </div>

                </div>


                <div className="payroll-summary-card">

                    <div className="summary-icon red">

                        <XCircle size={20} />

                    </div>

                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {summary.cancelled || 0}
                        </strong>

                    </div>

                </div>


                <div className="payroll-summary-card wide">

                    <div className="summary-icon purple">

                        <IndianRupee size={20} />

                    </div>

                    <div>

                        <span>
                            Net Salary
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

                <div className="filter-search">

                    <Search size={18} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search payroll..."
                    />

                </div>


                <div className="filter-select">

                    <CalendarDays size={17} />

                    <select
                        value={month}
                        onChange={(event) =>
                            setMonth(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Months
                        </option>

                        {MONTHS
                            .slice(1)
                            .map(
                                (
                                    monthName,
                                    index
                                ) => (

                                    <option
                                        key={monthName}
                                        value={
                                            index + 1
                                        }
                                    >
                                        {monthName}
                                    </option>

                                )
                            )}

                    </select>

                </div>


                <div className="filter-select">

                    <CalendarDays size={17} />

                    <select
                        value={year}
                        onChange={(event) =>
                            setYear(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Years
                        </option>

                        {years.map(
                            item => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="filter-select">

                    <WalletCards size={17} />

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
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

                        <option value="PAID">
                            Paid
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>

                    </select>

                </div>


                <button
                    type="button"
                    className="clear-filter-button"
                    onClick={resetFilters}
                >
                    Clear
                </button>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="hr-payroll-table-card">

                <div className="table-card-header">

                    <div>

                        <h2>
                            Payroll History
                        </h2>

                        <p>
                            Your payroll records
                        </p>

                    </div>

                    <div className="record-count">

                        {payrolls.length}
                        {" "}
                        Records

                    </div>

                </div>


                {loading ? (

                    <div className="payroll-loading">

                        <RefreshCw
                            size={24}
                            className="hr-spin"
                        />

                        <span>
                            Loading payroll...
                        </span>

                    </div>

                ) : payrolls.length === 0 ? (

                    <div className="payroll-empty">

                        <div className="empty-icon">

                            <WalletCards size={28} />

                        </div>

                        <h3>
                            No Payroll Records
                        </h3>

                        <p>
                            Payroll records will appear
                            here when they are created.
                        </p>

                    </div>

                ) : (

                    <div className="payroll-table-wrapper">

                        <table className="hr-payroll-table">

                            <thead>

                                <tr>

                                    <th>
                                        Payroll Period
                                    </th>

                                    <th>
                                        HR
                                    </th>

                                    <th>
                                        Working Days
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

                                {payrolls.map(
                                    payroll => {

                                        const hr =
                                            payroll.hr ||
                                            {};

                                        return (

                                            <tr
                                                key={
                                                    payroll._id
                                                }
                                            >

                                                <td>

                                                    <div className="period-cell">

                                                        <strong>
                                                            {getMonthName(
                                                                payroll.month
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {payroll.year}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="employee-cell">

                                                        <div className="employee-avatar">

                                                            {hr.profileImage ? (

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

                                                                <UserRound
                                                                    size={17}
                                                                />

                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    hr.name ||
                                                                    "HR"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    hr.email ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="days-cell">

                                                        <strong>
                                                            {formatNumber(
                                                                payroll.presentDays
                                                            )}
                                                        </strong>

                                                        <span>
                                                            /
                                                            {" "}
                                                            {formatNumber(
                                                                payroll.workingDays
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <strong className="money-text">
                                                        {formatCurrency(
                                                            payroll.grossSalary
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong className="deduction-text">
                                                        {formatCurrency(
                                                            payroll.totalDeductions
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong className="net-text">
                                                        {formatCurrency(
                                                            payroll.netSalary
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `payroll-status ${getStatusClass(
                                                                payroll.status
                                                            )}`
                                                        }
                                                    >

                                                        {payroll.status ===
                                                        "PAID" ? (
                                                            <CheckCircle2
                                                                size={14}
                                                            />
                                                        ) : payroll.status ===
                                                        "CANCELLED" ? (
                                                            <XCircle
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <Clock3
                                                                size={14}
                                                            />
                                                        )}

                                                        {payroll.status ||
                                                            "DRAFT"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="icon-action view"
                                                            title="View Payroll"
                                                            onClick={() =>
                                                                handleView(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={17}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="icon-action download"
                                                            title="Download Payslip"
                                                            onClick={() =>
                                                                downloadPayslip(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Download
                                                                size={17}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="icon-action print"
                                                            title="Print Payslip"
                                                            onClick={() =>
                                                                printPayslip(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Printer
                                                                size={17}
                                                            />

                                                        </button>

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
                DETAILS MODAL
            ================================================= */}

            {showDetails &&
                selectedPayroll && (

                    <div
                        className="payroll-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                closeDetails();
                            }

                        }}
                    >

                        <div className="payroll-details-modal">

                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <div>

                                    <div className="modal-title-icon">

                                        <FileText size={20} />

                                    </div>

                                    <div>

                                        <h2>
                                            Payroll Details
                                        </h2>

                                        <p>
                                            {
                                                getMonthName(
                                                    selectedPayroll.month
                                                )
                                            }
                                            {" "}
                                            {
                                                selectedPayroll.year
                                            }
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeDetails
                                    }
                                >

                                    <X size={19} />

                                </button>

                            </div>


                            {/* EMPLOYEE */}

                            <div className="modal-profile-card">

                                <div className="modal-profile-avatar">

                                    {selectedPayroll.hr
                                        ?.profileImage ? (

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

                                        <UserRound
                                            size={25}
                                        />

                                    )}

                                </div>


                                <div className="modal-profile-info">

                                    <h3>
                                        {
                                            selectedPayroll.hr
                                                ?.name ||
                                            "HR"
                                        }
                                    </h3>

                                    <p>

                                        <Mail size={14} />

                                        {
                                            selectedPayroll.hr
                                                ?.email ||
                                            "—"
                                        }

                                    </p>

                                </div>


                                <span
                                    className={
                                        `payroll-status large ${getStatusClass(
                                            selectedPayroll.status
                                        )}`
                                    }
                                >

                                    {selectedPayroll.status}

                                </span>

                            </div>


                            {/* WORKING DAYS */}

                            <div className="detail-section">

                                <div className="detail-section-heading">

                                    <CalendarDays
                                        size={18}
                                    />

                                    <h3>
                                        Attendance Summary
                                    </h3>

                                </div>


                                <div className="detail-grid">

                                    <div className="detail-item">

                                        <span>
                                            Working Days
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.workingDays
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-item">

                                        <span>
                                            Present Days
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.presentDays
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-item">

                                        <span>
                                            Paid Leave
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.paidLeaveDays
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-item">

                                        <span>
                                            Unpaid Leave
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.unpaidLeaveDays
                                            }
                                        </strong>

                                    </div>


                                    <div className="detail-item">

                                        <span>
                                            Absent Days
                                        </span>

                                        <strong>
                                            {
                                                selectedPayroll.absentDays
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* EARNINGS */}

                            <div className="detail-section">

                                <div className="detail-section-heading">

                                    <ArrowDownToLine
                                        size={18}
                                    />

                                    <h3>
                                        Earnings
                                    </h3>

                                </div>


                                <div className="salary-lines">

                                    <div>
                                        <span>
                                            Basic Salary
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.basicSalary
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            HRA
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.hra
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            DA
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.da
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Conveyance Allowance
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.conveyanceAllowance
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Medical Allowance
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.medicalAllowance
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Special Allowance
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.specialAllowance
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Other Allowance
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.otherAllowance
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Bonus
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.bonus
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Incentive
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.incentive
                                            )}
                                        </strong>
                                    </div>


                                    <div className="salary-total earnings">

                                        <span>
                                            Gross Salary
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.grossSalary
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* DEDUCTIONS */}

                            <div className="detail-section">

                                <div className="detail-section-heading">

                                    <IndianRupee
                                        size={18}
                                    />

                                    <h3>
                                        Deductions
                                    </h3>

                                </div>


                                <div className="salary-lines">

                                    <div>
                                        <span>
                                            PF
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.pfAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            ESI
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.esiAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Professional Tax
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.professionalTax
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            TDS
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.tdsAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Loan Deduction
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.loanDeduction
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Other Deduction
                                        </span>
                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.otherDeduction
                                            )}
                                        </strong>
                                    </div>


                                    <div className="salary-total deductions">

                                        <span>
                                            Total Deductions
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.totalDeductions
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* NET */}

                            <div className="net-salary-box">

                                <div>

                                    <span>
                                        Net Salary
                                    </span>

                                    <small>
                                        Final payable amount
                                    </small>

                                </div>

                                <strong>
                                    {formatCurrency(
                                        selectedPayroll.netSalary
                                    )}
                                </strong>

                            </div>


                            {/* PAYMENT */}

                            {selectedPayroll.status ===
                                "PAID" && (

                                <div className="payment-info">

                                    <div className="detail-section-heading">

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Payment Information
                                        </h3>

                                    </div>


                                    <div className="detail-grid">

                                        <div className="detail-item">

                                            <span>
                                                Payment Method
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll
                                                        .paymentMethod ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>


                                        <div className="detail-item">

                                            <span>
                                                Payment Reference
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll
                                                        .paymentReference ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>


                                        <div className="detail-item">

                                            <span>
                                                Paid Date
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedPayroll.paidAt
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* NOTES */}

                            {selectedPayroll.notes && (

                                <div className="payroll-notes">

                                    <strong>
                                        Notes
                                    </strong>

                                    <p>
                                        {
                                            selectedPayroll.notes
                                        }
                                    </p>

                                </div>

                            )}


                            {/* MODAL ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-modal-button"
                                    onClick={() =>
                                        printPayslip(
                                            selectedPayroll
                                        )
                                    }
                                >

                                    <Printer size={17} />

                                    Print Payslip

                                </button>


                                <button
                                    type="button"
                                    className="primary-modal-button"
                                    onClick={() =>
                                        downloadPayslip(
                                            selectedPayroll
                                        )
                                    }
                                >

                                    <Download size={17} />

                                    Download Payslip

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};


export default HRPayroll;