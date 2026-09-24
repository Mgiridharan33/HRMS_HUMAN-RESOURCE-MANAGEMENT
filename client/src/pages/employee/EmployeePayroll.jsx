import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    WalletCards,
    CalendarDays,
    IndianRupee,
    CheckCircle2,
    Clock3,
    Eye,
    RefreshCw,
    X,
    FileText,
    ArrowDownToLine,
    Building2,
    UserRound,
    BriefcaseBusiness,
    Mail,
    Phone,
    Hash,
    MapPin,
    Download,
    Printer,
} from "lucide-react";

import {
    getMyPayrolls,
    getMyPayrollById,
} from "../../services/employeePayrollApi";

import "./EmployeePayroll.css";


/* =========================================================
   MONTHS
========================================================= */

const MONTHS = [
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


/* =========================================================
   COMPANY INFORMATION
   Change these values according to your company.
========================================================= */

const COMPANY = {
    name: "YOUR COMPANY NAME",
    tagline: "Human Resource Management System",
    address: "Company Address, City, State, India",
    phone: "+91 00000 00000",
    email: "hr@company.com",
    website: "www.company.com",
};


/* =========================================================
   CURRENCY
========================================================= */

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


/* =========================================================
   NUMBER FORMAT
========================================================= */

const formatNumber = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-IN").format(number);
};


/* =========================================================
   MONTH YEAR
========================================================= */

const formatMonthYear = (
    month,
    year
) => {

    const index =
        Number(month) - 1;

    return `${MONTHS[index] || "Unknown"} ${year || ""}`;
};


/* =========================================================
   DATE
========================================================= */

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


/* =========================================================
   EMPLOYEE NAME
========================================================= */

const getEmployeeName = (
    payroll
) => {

    const employee =
        payroll?.employee ||
        payroll?.employeeId ||
        payroll?.user ||
        payroll?.employeeDetails ||
        null;

    if (
        employee &&
        typeof employee === "object"
    ) {

        const firstName =
            employee.firstName || "";

        const lastName =
            employee.lastName || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        if (fullName) {
            return fullName;
        }

        if (employee.name) {
            return employee.name;
        }
    }

    if (
        payroll?.employeeName
    ) {
        return payroll.employeeName;
    }

    return "Employee";
};


/* =========================================================
   EMPLOYEE DETAILS
========================================================= */

const getEmployeeDetails = (
    payroll
) => {

    const employee =
        payroll?.employee ||
        payroll?.employeeId ||
        payroll?.employeeDetails ||
        null;

    return {
        employeeId:
            employee?.employeeId ||
            payroll?.employeeCode ||
            payroll?.employeeIdNumber ||
            payroll?.employeeId ||
            "—",

        department:
            employee?.department ||
            payroll?.department ||
            "—",

        designation:
            employee?.designation ||
            payroll?.designation ||
            "—",

        email:
            employee?.email ||
            payroll?.email ||
            "—",

        phone:
            employee?.phone ||
            payroll?.phone ||
            "—",

        joiningDate:
            employee?.joiningDate ||
            payroll?.joiningDate ||
            null,

        employmentType:
            employee?.employmentType ||
            payroll?.employmentType ||
            "—",

        profileImage:
            employee?.profileImage ||
            payroll?.profileImage ||
            "",
    };
};


/* =========================================================
   COMPONENT
========================================================= */

const EmployeePayroll = () => {

    const [payrolls, setPayrolls] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [selectedPayroll, setSelectedPayroll] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);


    /* =====================================================
       LOAD PAYROLL
    ===================================================== */

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

                const response =
                    await getMyPayrolls();

                const payrollData =
                    Array.isArray(
                        response?.payrolls
                    )
                        ? response.payrolls
                        : [];

                setPayrolls(
                    payrollData
                );

            } catch (err) {

                console.error(
                    "EMPLOYEE PAYROLL ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load payroll."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        []
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadPayrolls();

    }, [loadPayrolls]);


    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary = useMemo(() => {

        const paidPayrolls =
            payrolls.filter(
                payroll =>
                    String(
                        payroll.status
                    ).toUpperCase() === "PAID"
            );

        const approvedPayrolls =
            payrolls.filter(
                payroll =>
                    String(
                        payroll.status
                    ).toUpperCase() === "APPROVED"
            );

        const totalNet =
            payrolls.reduce(
                (
                    total,
                    payroll
                ) =>
                    total +
                    Number(
                        payroll.netSalary || 0
                    ),
                0
            );

        const totalPaid =
            paidPayrolls.reduce(
                (
                    total,
                    payroll
                ) =>
                    total +
                    Number(
                        payroll.netSalary || 0
                    ),
                0
            );

        return {
            total: payrolls.length,
            paid: paidPayrolls.length,
            approved: approvedPayrolls.length,
            totalNet,
            totalPaid,
        };

    }, [payrolls]);


    /* =====================================================
       VIEW PAYROLL
    ===================================================== */

    const handleViewPayroll = async (
        payroll
    ) => {

        try {

            setDetailsLoading(true);

            setSelectedPayroll(null);

            const response =
                await getMyPayrollById(
                    payroll._id
                );

            setSelectedPayroll(
                response?.payroll ||
                null
            );

        } catch (err) {

            console.error(
                "PAYROLL DETAILS ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load payroll details."
            );

        } finally {

            setDetailsLoading(false);

        }

    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {

        setSelectedPayroll(null);

    };


    /* =====================================================
       PRINT PAYSLIP
    ===================================================== */

    const handlePrint = () => {

        window.print();

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="employee-payroll-page">

                <div className="employee-payroll-loading">

                    <div className="employee-payroll-loading-icon">

                        <RefreshCw
                            size={22}
                            className="employee-payroll-spin"
                        />

                    </div>

                    <span>
                        Loading your payroll...
                    </span>

                </div>

            </div>

        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div className="employee-payroll-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="employee-payroll-header">

                <div className="employee-payroll-header-left">

                    <div className="employee-payroll-title-icon">

                        <WalletCards
                            size={24}
                        />

                    </div>

                    <div>

                        <h1>
                            My Payroll
                        </h1>

                        <p>
                            View your salary,
                            deductions and
                            payment history.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="employee-payroll-refresh"
                    onClick={() =>
                        loadPayrolls(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "employee-payroll-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="employee-payroll-error">

                    <div>
                        {error}
                    </div>

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

            <div className="employee-payroll-summary">


                <div className="employee-payroll-summary-card">

                    <div className="employee-payroll-summary-icon">

                        <FileText
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Payroll Records
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div className="employee-payroll-summary-card">

                    <div className="employee-payroll-summary-icon">

                        <Clock3
                            size={21}
                        />

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


                <div className="employee-payroll-summary-card">

                    <div className="employee-payroll-summary-icon">

                        <CheckCircle2
                            size={21}
                        />

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


                <div className="employee-payroll-summary-card">

                    <div className="employee-payroll-summary-icon">

                        <IndianRupee
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Total Net Salary
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.totalNet
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                SALARY HISTORY
            ================================================= */}

            <div className="employee-payroll-card">

                <div className="employee-payroll-card-header">

                    <div>

                        <h2>
                            Salary History
                        </h2>

                        <p>
                            Your approved and
                            paid salary records.
                        </p>

                    </div>

                    <div className="employee-payroll-record-count">

                        {payrolls.length}
                        {" "}
                        Records

                    </div>

                </div>


                {payrolls.length === 0 ? (

                    <div className="employee-payroll-empty">

                        <div className="employee-payroll-empty-icon">

                            <WalletCards
                                size={28}
                            />

                        </div>

                        <h3>
                            No payroll available
                        </h3>

                        <p>
                            Your approved payroll
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="employee-payroll-table-wrapper">

                        <table className="employee-payroll-table">

                            <thead>

                                <tr>

                                    <th>
                                        Payroll Period
                                    </th>

                                    <th>
                                        Gross Salary
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
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {payrolls.map(
                                    payroll => {

                                        const status =
                                            String(
                                                payroll.status ||
                                                ""
                                            ).toUpperCase();

                                        return (

                                            <tr
                                                key={
                                                    payroll._id
                                                }
                                            >

                                                <td>

                                                    <div className="employee-payroll-period">

                                                        <div className="employee-payroll-period-icon">

                                                            <CalendarDays
                                                                size={16}
                                                            />

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {formatMonthYear(
                                                                    payroll.month,
                                                                    payroll.year
                                                                )}
                                                            </strong>

                                                            <span>
                                                                Salary Period
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>
                                                    {formatCurrency(
                                                        payroll.grossSalary
                                                    )}
                                                </td>


                                                <td>
                                                    {formatCurrency(
                                                        payroll.totalDeductions
                                                    )}
                                                </td>


                                                <td>

                                                    <strong className="employee-payroll-net">

                                                        {formatCurrency(
                                                            payroll.netSalary
                                                        )}

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `employee-payroll-status ${
                                                                status ===
                                                                "PAID"
                                                                    ? "paid"
                                                                    : "approved"
                                                            }`
                                                        }
                                                    >

                                                        {status ===
                                                        "PAID" ? (

                                                            <>
                                                                <CheckCircle2
                                                                    size={14}
                                                                />

                                                                Paid
                                                            </>

                                                        ) : (

                                                            <>
                                                                <Clock3
                                                                    size={14}
                                                                />

                                                                Approved
                                                            </>

                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="employee-payroll-view-button"
                                                        onClick={() =>
                                                            handleViewPayroll(
                                                                payroll
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                        View Payslip

                                                    </button>

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
                PAYSLIP MODAL
            ================================================= */}

            {(detailsLoading ||
                selectedPayroll) && (

                <div
                    className="employee-payroll-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="employee-payroll-modal">


                        {detailsLoading ? (

                            <div className="employee-payroll-modal-loading">

                                <RefreshCw
                                    size={26}
                                    className="employee-payroll-spin"
                                />

                                <span>
                                    Preparing payslip...
                                </span>

                            </div>

                        ) : (

                            <>

                                {/* =================================================
                                    MODAL TOOLBAR
                                ================================================= */}

                                <div className="employee-payroll-modal-toolbar">

                                    <div>

                                        <span>
                                            Payslip Preview
                                        </span>

                                        <small>
                                            Official salary statement
                                        </small>

                                    </div>

                                    <div className="employee-payroll-toolbar-actions">

                                        <button
                                            type="button"
                                            onClick={
                                                handlePrint
                                            }
                                            title="Print / Save PDF"
                                        >

                                            <Printer
                                                size={17}
                                            />

                                            Print

                                        </button>

                                        <button
                                            type="button"
                                            className="employee-payroll-toolbar-close"
                                            onClick={
                                                closeModal
                                            }
                                            title="Close"
                                        >

                                            <X
                                                size={19}
                                            />

                                        </button>

                                    </div>

                                </div>


                                {/* =================================================
                                    PROFESSIONAL PAYSLIP
                                ================================================= */}

                                <div
                                    id="employee-payslip"
                                    className="employee-payslip"
                                >


                                    {/* =============================================
                                        COMPANY HEADER
                                    ============================================= */}

                                    <div className="employee-payslip-company-header">

                                        <div className="employee-payslip-company-brand">

                                            <div className="employee-payslip-company-logo">

                                                <Building2
                                                    size={27}
                                                />

                                            </div>

                                            <div>

                                                <h1>
                                                    {COMPANY.name}
                                                </h1>

                                                <p>
                                                    {COMPANY.tagline}
                                                </p>

                                            </div>

                                        </div>


                                        <div className="employee-payslip-document-info">

                                            <strong>
                                                PAYSLIP
                                            </strong>

                                            <span>
                                                Salary Statement
                                            </span>

                                            <small>
                                                {formatMonthYear(
                                                    selectedPayroll.month,
                                                    selectedPayroll.year
                                                )}
                                            </small>

                                        </div>

                                    </div>


                                    {/* =============================================
                                        COMPANY CONTACT
                                    ============================================= */}

                                    <div className="employee-payslip-company-contact">

                                        <span>
                                            {COMPANY.address}
                                        </span>

                                        <span>
                                            {COMPANY.phone}
                                        </span>

                                        <span>
                                            {COMPANY.email}
                                        </span>

                                        <span>
                                            {COMPANY.website}
                                        </span>

                                    </div>


                                    {/* =============================================
                                        EMPLOYEE INFORMATION
                                    ============================================= */}

                                    {(() => {

                                        const employee =
                                            getEmployeeDetails(
                                                selectedPayroll
                                            );

                                        const employeeName =
                                            getEmployeeName(
                                                selectedPayroll
                                            );

                                        return (

                                            <div className="employee-payslip-employee-section">

                                                <div className="employee-payslip-section-title">

                                                    <span>
                                                        Employee Information
                                                    </span>

                                                </div>


                                                <div className="employee-payslip-employee-content">


                                                    <div className="employee-payslip-profile">

                                                        {employee.profileImage ? (

                                                            <img
                                                                src={
                                                                    employee.profileImage
                                                                }
                                                                alt={
                                                                    employeeName
                                                                }
                                                            />

                                                        ) : (

                                                            <div className="employee-payslip-profile-placeholder">

                                                                <UserRound
                                                                    size={26}
                                                                />

                                                            </div>

                                                        )}

                                                    </div>


                                                    <div className="employee-payslip-employee-main">

                                                        <h2>
                                                            {employeeName}
                                                        </h2>

                                                        <p>
                                                            {employee.designation}
                                                        </p>

                                                    </div>


                                                    <div className="employee-payslip-info-grid">


                                                        <div>

                                                            <span>
                                                                <Hash size={13} />
                                                                Employee ID
                                                            </span>

                                                            <strong>
                                                                {employee.employeeId}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                <Building2 size={13} />
                                                                Department
                                                            </span>

                                                            <strong>
                                                                {employee.department}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                <BriefcaseBusiness size={13} />
                                                                Employment
                                                            </span>

                                                            <strong>
                                                                {employee.employmentType}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                <CalendarDays size={13} />
                                                                Joining Date
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    employee.joiningDate
                                                                )}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                <Mail size={13} />
                                                                Email
                                                            </span>

                                                            <strong>
                                                                {employee.email}
                                                            </strong>

                                                        </div>


                                                        <div>

                                                            <span>
                                                                <Phone size={13} />
                                                                Phone
                                                            </span>

                                                            <strong>
                                                                {employee.phone}
                                                            </strong>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    })()}


                                    {/* =============================================
                                        PAY PERIOD
                                    ============================================= */}

                                    <div className="employee-payslip-period-bar">

                                        <div>

                                            <span>
                                                Pay Period
                                            </span>

                                            <strong>
                                                {formatMonthYear(
                                                    selectedPayroll.month,
                                                    selectedPayroll.year
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Payment Status
                                            </span>

                                            <strong
                                                className={
                                                    String(
                                                        selectedPayroll.status
                                                    ).toUpperCase() ===
                                                    "PAID"
                                                        ? "paid"
                                                        : "approved"
                                                }
                                            >

                                                {String(
                                                    selectedPayroll.status ||
                                                    "APPROVED"
                                                ).toUpperCase()}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Payslip ID
                                            </span>

                                            <strong>
                                                {selectedPayroll._id
                                                    ? String(
                                                        selectedPayroll._id
                                                    ).slice(-10).toUpperCase()
                                                    : "—"}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* =============================================
                                        SALARY SUMMARY
                                    ============================================= */}

                                    <div className="employee-payslip-net-summary">

                                        <div>

                                            <span>
                                                Net Salary
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.netSalary
                                                )}
                                            </strong>

                                            <small>
                                                Amount credited / payable
                                            </small>

                                        </div>


                                        <div className="employee-payslip-summary-side">

                                            <div>

                                                <span>
                                                    Gross Earnings
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        selectedPayroll.grossSalary
                                                    )}
                                                </strong>

                                            </div>

                                            <div>

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


                                    {/* =============================================
                                        EARNINGS & DEDUCTIONS
                                    ============================================= */}

                                    <div className="employee-payslip-two-column">


                                        {/* =========================================
                                            EARNINGS
                                        ========================================= */}

                                        <div className="employee-payslip-salary-card">

                                            <div className="employee-payslip-salary-card-header">

                                                <div>

                                                    <h3>
                                                        Earnings
                                                    </h3>

                                                    <span>
                                                        Salary components
                                                    </span>

                                                </div>

                                                <IndianRupee
                                                    size={19}
                                                />

                                            </div>


                                            <div className="employee-payslip-line-list">


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


                                                <div>
                                                    <span>
                                                        Overtime
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            selectedPayroll.overtimeAmount
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="employee-payslip-card-total">

                                                <span>
                                                    Gross Earnings
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        selectedPayroll.grossSalary
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* =========================================
                                            DEDUCTIONS
                                        ========================================= */}

                                        <div className="employee-payslip-salary-card">

                                            <div className="employee-payslip-salary-card-header">

                                                <div>

                                                    <h3>
                                                        Deductions
                                                    </h3>

                                                    <span>
                                                        Statutory & other deductions
                                                    </span>

                                                </div>

                                                <FileText
                                                    size={19}
                                                />

                                            </div>


                                            <div className="employee-payslip-line-list">


                                                <div>
                                                    <span>
                                                        Provident Fund (PF)
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

                                            </div>


                                            <div className="employee-payslip-card-total deduction-total">

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


                                    {/* =============================================
                                        ATTENDANCE
                                    ============================================= */}

                                    <div className="employee-payslip-attendance">

                                        <div className="employee-payslip-section-title">

                                            <span>
                                                Attendance Summary
                                            </span>

                                        </div>


                                        <div className="employee-payslip-attendance-grid">


                                            <div>

                                                <span>
                                                    Working Days
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.workingDays
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Present Days
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.presentDays
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Paid Leave
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.paidLeaveDays
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Unpaid Leave
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.unpaidLeaveDays
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Absent Days
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.absentDays
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Overtime Hours
                                                </span>

                                                <strong>
                                                    {formatNumber(
                                                        selectedPayroll.overtimeHours
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* =============================================
                                        PAYMENT INFORMATION
                                    ============================================= */}

                                    {String(
                                        selectedPayroll.status
                                    ).toUpperCase() === "PAID" && (

                                        <div className="employee-payslip-payment-section">

                                            <div className="employee-payslip-section-title">

                                                <span>
                                                    Payment Information
                                                </span>

                                            </div>


                                            <div className="employee-payslip-payment-grid">


                                                <div>

                                                    <span>
                                                        Payment Method
                                                    </span>

                                                    <strong>
                                                        {
                                                            selectedPayroll.paymentMethod ||
                                                            "—"
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
                                                            "—"
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Paid On
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


                                    {/* =============================================
                                        FINAL NET
                                    ============================================= */}

                                    <div className="employee-payslip-final-total">

                                        <div>

                                            <span>
                                                NET PAY
                                            </span>

                                            <small>
                                                Gross Earnings − Total Deductions
                                            </small>

                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.netSalary
                                            )}
                                        </strong>

                                    </div>


                                    {/* =============================================
                                        DECLARATION
                                    ============================================= */}

                                    <div className="employee-payslip-footer">

                                        <div>

                                            <p>
                                                This is a system-generated
                                                payslip and does not require
                                                a physical signature.
                                            </p>

                                            <span>
                                                Generated on{" "}
                                                {formatDate(
                                                    new Date()
                                                )}
                                            </span>

                                        </div>


                                        <div className="employee-payslip-signature">

                                            <div>
                                                Authorized Signatory
                                            </div>

                                            <span>
                                                {COMPANY.name}
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    MODAL FOOTER
                                ================================================= */}

                                <div className="employee-payroll-modal-footer">

                                    <button
                                        type="button"
                                        className="employee-payroll-secondary-button"
                                        onClick={
                                            closeModal
                                        }
                                    >

                                        <X
                                            size={17}
                                        />

                                        Close

                                    </button>


                                    <button
                                        type="button"
                                        className="employee-payroll-primary-button"
                                        onClick={
                                            handlePrint
                                        }
                                    >

                                        <ArrowDownToLine
                                            size={17}
                                        />

                                        Print / Save as PDF

                                    </button>

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

};


export default EmployeePayroll;

