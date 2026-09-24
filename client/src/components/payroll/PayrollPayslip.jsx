import {
    CalendarDays,
    CheckCircle2,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Printer,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

import "./css/PayrollPayslip.css"
// =====================================================
// MONTHS
// =====================================================

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const getMonthName = (month) => {
    const found = MONTHS.find(
        (item) => item.value === Number(month)
    );

    return found?.label || "—";
};


const getEmployeeName = (payroll) => {
    if (payroll?.employeeName) {
        return payroll.employeeName;
    }

    const employee = payroll?.employee;

    if (
        employee?.firstName ||
        employee?.lastName
    ) {
        return `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();
    }

    if (employee?.name) {
        return employee.name;
    }

    return "Unknown Employee";
};


const getEmployeeId = (payroll) => {
    if (payroll?.employeeId) {
        return payroll.employeeId;
    }

    if (payroll?.employee?.employeeId) {
        return payroll.employee.employeeId;
    }

    if (payroll?.employee?.empCode) {
        return payroll.employee.empCode;
    }

    return "—";
};


// =====================================================
// NUMBER TO WORDS
// =====================================================

const numberToWords = (number) => {

    const num = Math.floor(
        Number(number) || 0
    );

    if (num === 0) {
        return "Zero Rupees Only";
    }

    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];

    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];


    const twoDigits = (n) => {
        if (n < 20) {
            return ones[n];
        }

        return `${tens[Math.floor(n / 10)]}${
            n % 10 ? ` ${ones[n % 10]}` : ""
        }`;
    };


    const threeDigits = (n) => {
        if (n < 100) {
            return twoDigits(n);
        }

        return `${ones[Math.floor(n / 100)]} Hundred${
            n % 100
                ? ` ${twoDigits(n % 100)}`
                : ""
        }`;
    };


    let result = "";


    const crore = Math.floor(num / 10000000);

    if (crore) {
        result += `${threeDigits(crore)} Crore `;
    }


    const lakh = Math.floor(
        (num % 10000000) / 100000
    );

    if (lakh) {
        result += `${twoDigits(lakh)} Lakh `;
    }


    const thousand = Math.floor(
        (num % 100000) / 1000
    );

    if (thousand) {
        result += `${twoDigits(thousand)} Thousand `;
    }


    const remainder = num % 1000;

    if (remainder) {
        result += threeDigits(remainder);
    }


    return `${result.trim()} Rupees Only`;
};


// =====================================================
// STATUS
// =====================================================

const StatusBadge = ({ status }) => {

    const normalized =
        String(status || "").toLowerCase();


    if (normalized === "paid") {
        return (
            <span className="payslip-status payslip-status-paid">
                <CheckCircle2 size={14} />
                Paid
            </span>
        );
    }


    if (normalized === "approved") {
        return (
            <span className="payslip-status payslip-status-approved">
                <CheckCircle2 size={14} />
                Approved
            </span>
        );
    }


    if (normalized === "cancelled") {
        return (
            <span className="payslip-status payslip-status-cancelled">
                <XCircle size={14} />
                Cancelled
            </span>
        );
    }


    return (
        <span className="payslip-status payslip-status-draft">
            Draft
        </span>
    );
};


// =====================================================
// ROW
// =====================================================

const MoneyRow = ({
    label,
    value,
    bold = false,
}) => {

    return (
        <div
            className={
                bold
                    ? "payslip-money-row payslip-money-row-total"
                    : "payslip-money-row"
            }
        >
            <span>{label}</span>

            <strong>
                {formatCurrency(value)}
            </strong>
        </div>
    );
};


// =====================================================
// COMPONENT
// =====================================================

const PayrollPayslip = ({
    payroll,
    isOpen,
    onClose,
    onPrint,
    onDownload,
}) => {

    if (!isOpen || !payroll) {
        return null;
    }


    // =================================================
    // BASIC DATA
    // =================================================

    const employeeName =
        getEmployeeName(payroll);

    const employeeId =
        getEmployeeId(payroll);

    const monthName =
        getMonthName(payroll.month);

    const grossSalary =
        Number(payroll.grossSalary) || 0;

    const totalDeductions =
        Number(payroll.totalDeductions) || 0;

    const netSalary =
        Number(payroll.netSalary) || 0;

    const payslipNumber =
        payroll.payslipNumber ||
        payroll.payrollNumber ||
        payroll.referenceNumber ||
        `PAY-${payroll.year || "0000"}-${String(
            payroll.month || 0
        ).padStart(2, "0")}-${String(
            payroll._id || "000000"
        ).slice(-6).toUpperCase()}`;


    // =================================================
    // PRINT
    // =================================================

    const handlePrint = () => {

        if (typeof onPrint === "function") {
            onPrint(payroll);
            return;
        }

        window.print();
    };


    // =================================================
    // DOWNLOAD
    // =================================================

    const handleDownload = () => {

        if (typeof onDownload === "function") {
            onDownload(payroll);
            return;
        }

        window.print();
    };


    // =================================================
    // RENDER
    // =================================================

    return (
        <div
            className="payslip-modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose?.();
                }

            }}
        >

            <div
                className="payslip-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >

                {/* =================================================
                    MODAL TOOLBAR
                ================================================= */}

                <div className="payslip-modal-toolbar">

                    <div className="payslip-toolbar-left">

                        <div className="payslip-toolbar-icon">
                            <FileText size={20} />
                        </div>

                        <div>
                            <h2>
                                Payroll Payslip
                            </h2>

                            <p>
                                {employeeName}
                                {" • "}
                                {monthName} {payroll.year}
                            </p>
                        </div>

                    </div>


                    <div className="payslip-toolbar-actions">

                        <button
                            type="button"
                            onClick={handlePrint}
                        >
                            <Printer size={17} />
                            Print
                        </button>


                        <button
                            type="button"
                            onClick={handleDownload}
                        >
                            <Download size={17} />
                            Download PDF
                        </button>


                        <button
                            type="button"
                            className="payslip-close-btn"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                    </div>

                </div>


                {/* =================================================
                    A4 PAYSLIP
                ================================================= */}

                <div
                    className="payslip-document"
                    id="payroll-payslip-document"
                >

                    {/* =================================================
                        COMPANY HEADER
                    ================================================= */}

                    <header className="payslip-company-header">

                        <div className="payslip-company-brand">

                            <div className="payslip-company-logo">
                                <DollarSign size={26} />
                            </div>

                            <div>
                                <h1>HRMS</h1>

                                <p>
                                    Human Resource Management System
                                </p>

                                {payroll.companyName && (
                                    <small>
                                        {payroll.companyName}
                                    </small>
                                )}
                            </div>

                        </div>


                        <div className="payslip-header-right">

                            <div className="payslip-document-label">
                                SALARY SLIP
                            </div>

                            <div className="payslip-period-label">
                                {monthName} {payroll.year}
                            </div>

                            <div className="payslip-number">
                                Payslip No:{" "}
                                <strong>
                                    {payslipNumber}
                                </strong>
                            </div>

                        </div>

                    </header>


                    <div className="payslip-divider" />


                    {/* =================================================
                        EMPLOYEE INFORMATION
                    ================================================= */}

                    <section className="payslip-card">

                        <div className="payslip-card-title">

                            <UserRound size={16} />

                            <h3>
                                Employee Information
                            </h3>

                        </div>


                        <div className="payslip-info-grid">

                            <div>
                                <span>
                                    Employee Name
                                </span>

                                <strong>
                                    {employeeName}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Employee ID
                                </span>

                                <strong>
                                    {employeeId}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Department
                                </span>

                                <strong>
                                    {payroll.department || "—"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Designation
                                </span>

                                <strong>
                                    {payroll.designation || "—"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Joining Date
                                </span>

                                <strong>
                                    {formatDate(
                                        payroll.joiningDate
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    PAN / Tax ID
                                </span>

                                <strong>
                                    {payroll.panNumber || "—"}
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        PAYROLL PERIOD
                    ================================================= */}

                    <section className="payslip-card">

                        <div className="payslip-card-title">

                            <CalendarDays size={16} />

                            <h3>
                                Payroll Period
                            </h3>

                        </div>


                        <div className="payslip-info-grid">

                            <div>
                                <span>
                                    Salary Month
                                </span>

                                <strong>
                                    {monthName}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Salary Year
                                </span>

                                <strong>
                                    {payroll.year || "—"}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Period Start
                                </span>

                                <strong>
                                    {formatDate(
                                        payroll.periodStart
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Period End
                                </span>

                                <strong>
                                    {formatDate(
                                        payroll.periodEnd
                                    )}
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        ATTENDANCE
                    ================================================= */}

                    <section className="payslip-card">

                        <div className="payslip-card-title">

                            <CalendarDays size={16} />

                            <h3>
                                Attendance Summary
                            </h3>

                        </div>


                        <div className="payslip-attendance-grid">

                            <div>
                                <span>
                                    Working Days
                                </span>

                                <strong>
                                    {payroll.workingDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Present Days
                                </span>

                                <strong>
                                    {payroll.presentDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Absent Days
                                </span>

                                <strong>
                                    {payroll.absentDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Half Days
                                </span>

                                <strong>
                                    {payroll.halfDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Leave Days
                                </span>

                                <strong>
                                    {payroll.leaveDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Unpaid Leave
                                </span>

                                <strong>
                                    {payroll.unpaidLeaveDays ?? 0}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Overtime
                                </span>

                                <strong>
                                    {Number(
                                        payroll.overtimeHours || 0
                                    ).toFixed(2)} hrs
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        EARNINGS + DEDUCTIONS
                    ================================================= */}

                    <div className="payslip-financial-grid">

                        {/* ================================
                            EARNINGS
                        ================================= */}

                        <section className="payslip-financial-card">

                            <div className="payslip-financial-title">

                                <DollarSign size={17} />

                                <h3>
                                    Earnings
                                </h3>

                            </div>


                            <div className="payslip-money-list">

                                <MoneyRow
                                    label="Basic Salary"
                                    value={payroll.basicSalary}
                                />

                                <MoneyRow
                                    label="House Rent Allowance"
                                    value={payroll.hra}
                                />

                                <MoneyRow
                                    label="Dearness Allowance"
                                    value={payroll.da}
                                />

                                <MoneyRow
                                    label="Travel / Conveyance"
                                    value={payroll.ta}
                                />

                                <MoneyRow
                                    label="Other Allowances"
                                    value={
                                        payroll.otherAllowances
                                    }
                                />

                                <MoneyRow
                                    label="Bonus"
                                    value={payroll.bonus}
                                />

                                <MoneyRow
                                    label="Overtime"
                                    value={
                                        payroll.overtimeAmount
                                    }
                                />

                                <MoneyRow
                                    label="Gross Salary"
                                    value={grossSalary}
                                    bold
                                />

                            </div>

                        </section>


                        {/* ================================
                            DEDUCTIONS
                        ================================= */}

                        <section className="payslip-financial-card">

                            <div className="payslip-financial-title">

                                <CreditCard size={17} />

                                <h3>
                                    Deductions
                                </h3>

                            </div>


                            <div className="payslip-money-list">

                                <MoneyRow
                                    label="Provident Fund"
                                    value={payroll.pf}
                                />

                                <MoneyRow
                                    label="ESI"
                                    value={payroll.esi}
                                />

                                <MoneyRow
                                    label="Professional Tax"
                                    value={
                                        payroll.professionalTax
                                    }
                                />

                                <MoneyRow
                                    label="TDS"
                                    value={payroll.tds}
                                />

                                <MoneyRow
                                    label="Attendance Deduction"
                                    value={
                                        payroll.attendanceDeduction
                                    }
                                />

                                <MoneyRow
                                    label="Unpaid Leave Deduction"
                                    value={
                                        payroll.unpaidLeaveDeduction
                                    }
                                />

                                <MoneyRow
                                    label="Other Deductions"
                                    value={
                                        payroll.otherDeductions
                                    }
                                />

                                <MoneyRow
                                    label="Total Deductions"
                                    value={totalDeductions}
                                    bold
                                />

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        NET SALARY
                    ================================================= */}

                    <section className="payslip-net-card">

                        <div>

                            <span>
                                NET SALARY PAYABLE
                            </span>

                            <strong>
                                {formatCurrency(netSalary)}
                            </strong>

                            <small>
                                {numberToWords(netSalary)}
                            </small>

                        </div>


                        <StatusBadge
                            status={payroll.status}
                        />

                    </section>


                    {/* =================================================
                        PAYMENT INFORMATION
                    ================================================= */}

                    {String(payroll.status).toLowerCase() === "paid" && (

                        <section className="payslip-card">

                            <div className="payslip-card-title">

                                <CreditCard size={16} />

                                <h3>
                                    Payment Information
                                </h3>

                            </div>


                            <div className="payslip-info-grid">

                                <div>
                                    <span>
                                        Payment Method
                                    </span>

                                    <strong>
                                        {payroll.paymentMethod || "—"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Payment Reference
                                    </span>

                                    <strong>
                                        {payroll.paymentReference || "—"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Payment Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            payroll.paidAt
                                        )}
                                    </strong>
                                </div>

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        DECLARATION
                    ================================================= */}

                    <div className="payslip-declaration">

                        <strong>
                            Declaration
                        </strong>

                        <p>
                            This payslip is system generated and
                            does not require a physical signature.
                            The information contained in this
                            document is based on the payroll records
                            maintained by the organization.
                        </p>

                    </div>


                    {/* =================================================
                        SIGNATURES
                    ================================================= */}

                    <div className="payslip-signature-grid">

                        <div>
                            <div className="payslip-signature-line" />

                            <span>
                                Employee Signature
                            </span>
                        </div>


                        <div>
                            <div className="payslip-signature-line" />

                            <span>
                                Authorized Signatory
                            </span>
                        </div>

                    </div>


                    {/* =================================================
                        DOCUMENT FOOTER
                    ================================================= */}

                    <footer className="payslip-document-footer">

                        <span>
                            Generated on {formatDate(new Date())}
                        </span>

                        <span>
                            HRMS Payroll System
                        </span>

                    </footer>

                </div>


                {/* =================================================
                    MODAL FOOTER
                ================================================= */}

                <div className="payslip-modal-footer">

                    <button
                        type="button"
                        className="payroll-btn payroll-btn-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>


                    <button
                        type="button"
                        className="payroll-btn payroll-btn-secondary"
                        onClick={handlePrint}
                    >
                        <Printer size={17} />
                        Print Payslip
                    </button>


                    <button
                        type="button"
                        className="payroll-btn payroll-btn-primary"
                        onClick={handleDownload}
                    >
                        <Download size={17} />
                        Download PDF
                    </button>

                </div>

            </div>

        </div>
    );
};


export default PayrollPayslip;