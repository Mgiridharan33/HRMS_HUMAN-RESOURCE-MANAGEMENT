import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FileText,
    CalendarDays,
    Download,
    Eye,
    RefreshCw,
    Users,
    UserRound,
    ClipboardList,
    Clock3,
    WalletCards,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    IndianRupee,
    BadgeIndianRupee,
    CalendarCheck,
    Mail,
    Building2,
    BriefcaseBusiness,
} from "lucide-react";

import hrReportApi from "../../services/hrReportsApi";

import "./HRReports.css";

// =====================================================
// CONSTANTS
// =====================================================

const REPORT_TYPES = {
    MY_LEAVE: "my_leave",
    EMPLOYEE_LEAVE: "employee_leave",

    MY_ATTENDANCE: "my_attendance",
    EMPLOYEE_ATTENDANCE:
        "employee_attendance",

    MY_SALARY: "my_salary",
    EMPLOYEE_SALARY:
        "employee_salary",
};

const REPORT_OPTIONS = [
    {
        id: REPORT_TYPES.MY_LEAVE,
        title: "My Leave",
        description:
            "View your own leave history",
        icon: CalendarCheck,
    },

    {
        id: REPORT_TYPES.EMPLOYEE_LEAVE,
        title: "Employee Leave",
        description:
            "View leave details of all employees",
        icon: Users,
    },

    {
        id: REPORT_TYPES.MY_ATTENDANCE,
        title: "My Attendance",
        description:
            "View your attendance",
        icon: Clock3,
    },

    {
        id:
            REPORT_TYPES.EMPLOYEE_ATTENDANCE,
        title: "Employee Attendance",
        description:
            "View attendance of all employees",
        icon: ClipboardList,
    },

    {
        id: REPORT_TYPES.MY_SALARY,
        title: "My Salary",
        description:
            "View your salary and payslip",
        icon: WalletCards,
    },

    {
        id:
            REPORT_TYPES.EMPLOYEE_SALARY,
        title: "Employee Salary",
        description:
            "View salary of all employees",
        icon: BadgeIndianRupee,
    },
];

const PAGE_SIZE = 10;

// =====================================================
// HELPERS
// =====================================================

const formatDate = (
    date
) => {
    if (!date) {
        return "-";
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }

    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const formatTime = (
    value
) => {
    if (!value) {
        return "-";
    }

    const parsed =
        new Date(value);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "-";
    }

    return parsed.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

const formatCurrency = (
    amount
) => {
    const value =
        Number(amount || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }
    ).format(value);
};

const formatMinutes = (
    minutes
) => {
    const value =
        Number(minutes || 0);

    const hours =
        Math.floor(
            value / 60
        );

    const mins =
        value % 60;

    return `${hours}h ${mins}m`;
};

const getEmployeeName = (
    employee
) => {
    if (!employee) {
        return "-";
    }

    if (
        typeof employee ===
        "string"
    ) {
        return employee;
    }

    return [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
        employee.name ||
        employee.employeeId ||
        "-";
};

const getDepartmentName = (
    department
) => {
    if (!department) {
        return "-";
    }

    if (
        typeof department ===
        "string"
    ) {
        return department;
    }

    return (
        department.name ||
        department.title ||
        department.departmentName ||
        "-"
    );
};

const getDesignationName = (
    designation
) => {
    if (!designation) {
        return "-";
    }

    if (
        typeof designation ===
        "string"
    ) {
        return designation;
    }

    return (
        designation.name ||
        designation.title ||
        designation.designationName ||
        "-"
    );
};

// =====================================================
// COMPONENT
// =====================================================

const HRReports = () => {
    // =================================================
    // FILTERS
    // =================================================

    const [
        reportType,
        setReportType,
    ] = useState(
        REPORT_TYPES.MY_LEAVE
    );

    const [
        fromDate,
        setFromDate,
    ] = useState("");

    const [
        toDate,
        setToDate,
    ] = useState("");

    const [
        employeeId,
        setEmployeeId,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        downloadFormat,
        setDownloadFormat,
    ] = useState("pdf");

    // =================================================
    // DATA
    // =================================================

    const [
        employees,
        setEmployees,
    ] = useState([]);

    const [
        reportData,
        setReportData,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState({});

    // =================================================
    // STATES
    // =================================================

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        employeeLoading,
        setEmployeeLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const [
        selectedRecord,
        setSelectedRecord,
    ] = useState(null);

    const [
        showViewModal,
        setShowViewModal,
    ] = useState(false);

    // =================================================
    // CURRENT OPTION
    // =================================================

    const currentOption =
        useMemo(
            () =>
                REPORT_OPTIONS.find(
                    (option) =>
                        option.id ===
                        reportType
                ),
            [reportType]
        );

    // =================================================
    // EMPLOYEE FILTER
    // =================================================

    const showEmployeeFilter =
        reportType ===
            REPORT_TYPES.EMPLOYEE_LEAVE ||
        reportType ===
            REPORT_TYPES.EMPLOYEE_ATTENDANCE ||
        reportType ===
            REPORT_TYPES.EMPLOYEE_SALARY;

    // =================================================
    // LOAD ALL EMPLOYEES
    // =================================================

    const loadEmployees =
        useCallback(
            async () => {
                try {
                    setEmployeeLoading(
                        true
                    );

                    const response =
                        await hrReportApi.getEmployees();

                    const list =
                        response?.employees ||
                        response?.data ||
                        [];

                    setEmployees(
                        Array.isArray(
                            list
                        )
                            ? list
                            : []
                    );
                } catch (error) {
                    console.error(
                        "LOAD EMPLOYEES ERROR:",
                        error
                    );

                    setEmployees([]);
                } finally {
                    setEmployeeLoading(
                        false
                    );
                }
            },
            []
        );

    // =================================================
    // LOAD REPORT
    // =================================================

    const loadReport =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");

                    const response =
                        await hrReportApi.getReport(
                            {
                                reportType,

                                fromDate:
                                    fromDate ||
                                    "",

                                toDate:
                                    toDate ||
                                    "",

                                employeeId:
                                    employeeId ||
                                    "",
                            }
                        );

                    let records =
                        response?.data;

                    // -------------------------------------------------
                    // my_payslip / employee_payslip can return object
                    // -------------------------------------------------

                    if (
                        !Array.isArray(
                            records
                        )
                    ) {
                        records =
                            records
                                ? [records]
                                : [];
                    }

                    setReportData(
                        records
                    );

                    setSummary(
                        response?.summary ||
                            {}
                    );

                    setCurrentPage(
                        1
                    );
                } catch (error) {
                    console.error(
                        "HR REPORT ERROR:",
                        error
                    );

                    setError(
                        error?.response
                            ?.data
                            ?.message ||
                            "Unable to load report."
                    );

                    setReportData(
                        []
                    );

                    setSummary({});
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [
                reportType,
                fromDate,
                toDate,
                employeeId,
            ]
        );

    // =================================================
    // INITIAL EMPLOYEES
    // =================================================

    useEffect(
        () => {
            loadEmployees();
        },
        [
            loadEmployees,
        ]
    );

    // =================================================
    // REPORT LOAD
    // =================================================

    useEffect(
        () => {
            loadReport();
        },
        [
            loadReport,
        ]
    );

    // =================================================
    // FILTER SEARCH
    // =================================================

    const filteredData =
        useMemo(
            () => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return reportData;
                }

                return reportData.filter(
                    (record) => {
                        const text =
                            JSON.stringify(
                                record
                            ).toLowerCase();

                        return text.includes(
                            query
                        );
                    }
                );
            },
            [
                reportData,
                search,
            ]
        );

    // =================================================
    // PAGINATION
    // =================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredData.length /
                    PAGE_SIZE
            )
        );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );

    const paginatedData =
        filteredData.slice(
            (
                safeCurrentPage -
                1
            ) * PAGE_SIZE,

            safeCurrentPage *
                PAGE_SIZE
        );

    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters =
        () => {
            setFromDate("");
            setToDate("");
            setEmployeeId("");
            setSearch("");
            setCurrentPage(1);
        };

    // =================================================
    // CHANGE REPORT
    // =================================================

    const handleReportChange =
        (type) => {
            setReportType(
                type
            );

            setEmployeeId("");
            setSearch("");
            setCurrentPage(1);
            setError("");
        };

    // =================================================
    // VIEW
    // =================================================

    const handleView =
        (record) => {
            setSelectedRecord(
                record
            );

            setShowViewModal(
                true
            );
        };

    // =================================================
    // DOWNLOAD
    // =================================================

    const handleDownload =
        async () => {
            try {
                setLoading(
                    true
                );

                setError("");

                const response =
                    await hrReportApi.downloadReport(
                        {
                            reportType,

                            fromDate:
                                fromDate ||
                                "",

                            toDate:
                                toDate ||
                                "",

                            employeeId:
                                employeeId ||
                                "",

                            format:
                                downloadFormat,
                        }
                    );

                const blob =
                    new Blob(
                        [
                            response.data,
                        ],
                        {
                            type:
                                response
                                    .headers[
                                    "content-type"
                                ] ||
                                "application/octet-stream",
                        }
                    );

                const url =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    url;

                const extension =
                    downloadFormat ===
                    "excel"
                        ? "xlsx"
                        : downloadFormat;

                link.download =
                    `hr-${reportType}-${Date.now()}.${extension}`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );
            } catch (error) {
                console.error(
                    "DOWNLOAD REPORT ERROR:",
                    error
                );

                setError(
                    error?.response
                        ?.data
                        ?.message ||
                        "Unable to download report."
                );
            } finally {
                setLoading(
                    false
                );
            }
        };

    // =================================================
    // RENDER
    // =================================================

    return (
        <div className="hr-reports-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-reports-header">

                <div>
                    <div className="hr-reports-title-row">

                        <div className="hr-reports-title-icon">
                            <FileText
                                size={23}
                            />
                        </div>

                        <div>
                            <h1>
                                HR Reports
                            </h1>

                            <p>
                                View and download
                                HR and employee
                                reports
                            </p>
                        </div>

                    </div>
                </div>

                <button
                    type="button"
                    className="hr-report-refresh-btn"
                    onClick={
                        loadReport
                    }
                    disabled={
                        loading
                    }
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "hr-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

            </div>

            {/* =================================================
                REPORT CATEGORIES
            ================================================= */}

            <div className="hr-report-category-grid">

                {REPORT_OPTIONS.map(
                    (option) => {
                        const Icon =
                            option.icon;

                        const active =
                            reportType ===
                            option.id;

                        return (
                            <button
                                key={
                                    option.id
                                }
                                type="button"
                                className={
                                    `hr-report-category-card ${
                                        active
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleReportChange(
                                        option.id
                                    )
                                }
                            >
                                <div className="hr-report-category-icon">
                                    <Icon
                                        size={21}
                                    />
                                </div>

                                <div className="hr-report-category-content">
                                    <strong>
                                        {
                                            option.title
                                        }
                                    </strong>

                                    <span>
                                        {
                                            option.description
                                        }
                                    </span>
                                </div>
                            </button>
                        );
                    }
                )}

            </div>

            {/* =================================================
                FILTER PANEL
            ================================================= */}

            <section className="hr-report-filter-panel">

                <div className="hr-report-filter-heading">

                    <div>

                        <div className="hr-report-section-icon">
                            <CalendarDays
                                size={18}
                            />
                        </div>

                        <div>
                            <h2>
                                Report Filters
                            </h2>

                            <p>
                                Select dates and
                                employee
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="hr-report-clear-btn"
                        onClick={
                            clearFilters
                        }
                    >
                        <X
                            size={16}
                        />

                        Clear
                    </button>

                </div>

                <div className="hr-report-filter-grid">

                    {/* FROM DATE */}

                    <div className="hr-report-field">

                        <label>
                            From Date
                        </label>

                        <div className="hr-report-input-wrap">

                            <CalendarDays
                                size={17}
                            />

                            <input
                                type="date"
                                value={
                                    fromDate
                                }
                                onChange={(e) =>
                                    setFromDate(
                                        e.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* TO DATE */}

                    <div className="hr-report-field">

                        <label>
                            To Date
                        </label>

                        <div className="hr-report-input-wrap">

                            <CalendarDays
                                size={17}
                            />

                            <input
                                type="date"
                                value={
                                    toDate
                                }
                                onChange={(e) =>
                                    setToDate(
                                        e.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* ALL EMPLOYEES */}

                    {showEmployeeFilter && (
                        <div className="hr-report-field">

                            <label>
                                Employee
                            </label>

                            <div className="hr-report-input-wrap">

                                <Users
                                    size={17}
                                />

                                <select
                                    value={
                                        employeeId
                                    }
                                    onChange={(e) =>
                                        setEmployeeId(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        employeeLoading
                                    }
                                >

                                    <option value="">
                                        All Employees
                                    </option>

                                    {employees.map(
                                        (
                                            employee
                                        ) => (
                                            <option
                                                key={
                                                    employee._id
                                                }
                                                value={
                                                    employee._id
                                                }
                                            >
                                                {
                                                    getEmployeeName(
                                                        employee
                                                    )
                                                }

                                                {" - "}

                                                {
                                                    employee.employeeId ||
                                                    "No ID"
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>
                    )}

                    {/* SEARCH */}

                    <div className="hr-report-field">

                        <label>
                            Search
                        </label>

                        <div className="hr-report-input-wrap">

                            <Search
                                size={17}
                            />

                            <input
                                type="text"
                                placeholder="Search report..."
                                value={
                                    search
                                }
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hr-report-summary-grid">

                <SummaryCard
                    icon={FileText}
                    title="Total Records"
                    value={
                        summary.totalRecords ??
                        filteredData.length
                    }
                />

                <SummaryCard
                    icon={CheckCircle2}
                    title="Approved"
                    value={
                        summary.approved ??
                        summary.approvedCount ??
                        "-"
                    }
                />

                <SummaryCard
                    icon={Clock3}
                    title="Pending"
                    value={
                        summary.pending ??
                        summary.pendingCount ??
                        "-"
                    }
                />

                <SummaryCard
                    icon={IndianRupee}
                    title="Net Salary"
                    value={
                        summary.netSalary !==
                        undefined
                            ? formatCurrency(
                                  summary.netSalary
                              )
                            : "-"
                    }
                />

            </div>

            {/* =================================================
                REPORT CONTENT
            ================================================= */}

            <section className="hr-report-content-card">

                <div className="hr-report-content-header">

                    <div>
                        <h2>
                            {
                                currentOption?.title
                            }{" "}
                            Report
                        </h2>

                        <p>
                            {
                                filteredData.length
                            }{" "}
                            records found
                        </p>
                    </div>

                    <div className="hr-report-download-controls">

                        <select
                            value={
                                downloadFormat
                            }
                            onChange={(e) =>
                                setDownloadFormat(
                                    e.target
                                        .value
                                )
                            }
                        >
                            <option value="pdf">
                                PDF
                            </option>

                            <option value="excel">
                                Excel
                            </option>

                            <option value="csv">
                                CSV
                            </option>
                        </select>

                        <button
                            type="button"
                            className="hr-report-download-btn"
                            onClick={
                                handleDownload
                            }
                            disabled={
                                loading
                            }
                        >
                            <Download
                                size={17}
                            />

                            Download
                        </button>

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="hr-report-error">

                        <AlertCircle
                            size={18}
                        />

                        {error}

                    </div>
                )}

                {/* TABLE */}

                <div className="hr-report-table-wrapper">

                    {loading ? (
                        <div className="hr-report-loading">

                            <RefreshCw
                                size={25}
                                className="hr-spin"
                            />

                            <span>
                                Loading report...
                            </span>

                        </div>
                    ) : paginatedData.length ===
                      0 ? (
                        <div className="hr-report-empty">

                            <FileText
                                size={42}
                            />

                            <h3>
                                No report data
                            </h3>

                            <p>
                                Try changing
                                the filters
                                or date range.
                            </p>

                        </div>
                    ) : (
                        <ReportTable
                            type={
                                reportType
                            }
                            records={
                                paginatedData
                            }
                            onView={
                                handleView
                            }
                        />
                    )}

                </div>

                {/* PAGINATION */}

                {filteredData.length >
                    0 && (
                    <div className="hr-report-pagination">

                        <span>
                            Showing{" "}
                            {(
                                (
                                    safeCurrentPage -
                                    1
                                ) *
                                    PAGE_SIZE
                            ) + 1}
                            {" - "}
                            {Math.min(
                                safeCurrentPage *
                                    PAGE_SIZE,
                                filteredData.length
                            )}
                            {" of "}
                            {
                                filteredData.length
                            }
                        </span>

                        <div>

                            <button
                                type="button"
                                disabled={
                                    safeCurrentPage <=
                                    1
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            page
                                        ) =>
                                            Math.max(
                                                1,
                                                page -
                                                    1
                                            )
                                    )
                                }
                            >
                                <ChevronLeft
                                    size={17}
                                />
                            </button>

                            <strong>
                                {
                                    safeCurrentPage
                                }
                                {" / "}
                                {
                                    totalPages
                                }
                            </strong>

                            <button
                                type="button"
                                disabled={
                                    safeCurrentPage >=
                                    totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            page
                                        ) =>
                                            Math.min(
                                                totalPages,
                                                page +
                                                    1
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
                )}

            </section>

            {/* =================================================
                MODAL
            ================================================= */}

            {showViewModal && (
                <ReportViewModal
                    type={
                        reportType
                    }
                    record={
                        selectedRecord
                    }
                    onClose={() => {
                        setShowViewModal(
                            false
                        );

                        setSelectedRecord(
                            null
                        );
                    }}
                />
            )}

        </div>
    );
};

// =====================================================
// SUMMARY CARD
// =====================================================

const SummaryCard = ({
    icon: Icon,
    title,
    value,
}) => {
    return (
        <div className="hr-report-summary-card">

            <div className="hr-report-summary-icon">
                <Icon
                    size={20}
                />
            </div>

            <div>
                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>
            </div>

        </div>
    );
};

// =====================================================
// EMPLOYEE CELL
// =====================================================

const EmployeeCell = ({
    employee,
}) => {
    return (
        <div className="hr-report-employee-cell">

            <div className="hr-report-avatar">

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
                    <UserRound
                        size={15}
                    />
                )}

            </div>

            <div>

                <strong>
                    {
                        getEmployeeName(
                            employee
                        )
                    }
                </strong>

                <span>
                    {
                        employee?.email ||
                        "-"
                    }
                </span>

            </div>

        </div>
    );
};

// =====================================================
// TABLE
// =====================================================

const ReportTable = ({
    type,
    records,
    onView,
}) => {

    // =================================================
    // EMPLOYEE LEAVE
    // =================================================

    if (
        type ===
            REPORT_TYPES.MY_LEAVE ||
        type ===
            REPORT_TYPES.EMPLOYEE_LEAVE
    ) {
        return (
            <table className="hr-report-table">

                <thead>
                    <tr>

                        {type ===
                            REPORT_TYPES.EMPLOYEE_LEAVE && (
                            <>
                                <th>
                                    Employee
                                </th>

                                <th>
                                    Employee ID
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Designation
                                </th>
                            </>
                        )}

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
                            Status
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>
                </thead>

                <tbody>

                    {records.map(
                        (
                            record
                        ) => (
                            <tr
                                key={
                                    record._id
                                }
                            >

                                {type ===
                                    REPORT_TYPES.EMPLOYEE_LEAVE && (
                                    <>
                                        <td>
                                            <EmployeeCell
                                                employee={
                                                    record.employee
                                                }
                                            />
                                        </td>

                                        <td>
                                            {
                                                record
                                                    .employee
                                                    ?.employeeId ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {
                                                getDepartmentName(
                                                    record
                                                        .employee
                                                        ?.department
                                                )
                                            }
                                        </td>

                                        <td>
                                            {
                                                getDesignationName(
                                                    record
                                                        .employee
                                                        ?.designation
                                                )
                                            }
                                        </td>
                                    </>
                                )}

                                <td>
                                    {
                                        record.leaveType ||
                                        "-"
                                    }
                                </td>

                                <td>
                                    {formatDate(
                                        record.startDate ||
                                            record.fromDate
                                    )}
                                </td>

                                <td>
                                    {formatDate(
                                        record.endDate ||
                                            record.toDate
                                    )}
                                </td>

                                <td>
                                    {
                                        record.totalDays ??
                                        "-"
                                    }
                                </td>

                                <td>
                                    <StatusBadge
                                        status={
                                            record.status
                                        }
                                    />
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className="hr-report-view-btn"
                                        onClick={() =>
                                            onView(
                                                record
                                            )
                                        }
                                    >
                                        <Eye
                                            size={
                                                16
                                            }
                                        />

                                        View
                                    </button>
                                </td>

                            </tr>
                        )
                    )}

                </tbody>

            </table>
        );
    }

    // =================================================
    // ATTENDANCE
    // =================================================

    if (
        type ===
            REPORT_TYPES.MY_ATTENDANCE ||
        type ===
            REPORT_TYPES.EMPLOYEE_ATTENDANCE
    ) {
        return (
            <table className="hr-report-table">

                <thead>

                    <tr>

                        {type ===
                            REPORT_TYPES.EMPLOYEE_ATTENDANCE && (
                            <>
                                <th>
                                    Employee
                                </th>

                                <th>
                                    Employee ID
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Designation
                                </th>
                            </>
                        )}

                        <th>
                            Date
                        </th>

                        <th>
                            Punch In
                        </th>

                        <th>
                            Punch Out
                        </th>

                        <th>
                            Working Time
                        </th>

                        <th>
                            Break
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

                    {records.map(
                        (
                            record
                        ) => (
                            <tr
                                key={
                                    record._id
                                }
                            >

                                {type ===
                                    REPORT_TYPES.EMPLOYEE_ATTENDANCE && (
                                    <>
                                        <td>
                                            <EmployeeCell
                                                employee={
                                                    record.employee
                                                }
                                            />
                                        </td>

                                        <td>
                                            {
                                                record
                                                    .employee
                                                    ?.employeeId ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {
                                                getDepartmentName(
                                                    record
                                                        .employee
                                                        ?.department
                                                )
                                            }
                                        </td>

                                        <td>
                                            {
                                                getDesignationName(
                                                    record
                                                        .employee
                                                        ?.designation
                                                )
                                            }
                                        </td>
                                    </>
                                )}

                                <td>
                                    {formatDate(
                                        record.date
                                    )}
                                </td>

                                <td>
                                    {formatTime(
                                        record.punchIn
                                    )}
                                </td>

                                <td>
                                    {formatTime(
                                        record.punchOut
                                    )}
                                </td>

                                <td>
                                    {formatMinutes(
                                        record.totalWorkingMinutes
                                    )}
                                </td>

                                <td>
                                    {formatMinutes(
                                        record.totalBreakMinutes
                                    )}
                                </td>

                                <td>
                                    <StatusBadge
                                        status={
                                            record.status
                                        }
                                    />
                                </td>

                                <td>
                                    <button
                                        type="button"
                                        className="hr-report-view-btn"
                                        onClick={() =>
                                            onView(
                                                record
                                            )
                                        }
                                    >
                                        <Eye
                                            size={
                                                16
                                            }
                                        />

                                        View
                                    </button>
                                </td>

                            </tr>
                        )
                    )}

                </tbody>

            </table>
        );
    }

    // =================================================
    // SALARY
    // =================================================

    return (
        <table className="hr-report-table">

            <thead>

                <tr>

                    {type ===
                        REPORT_TYPES.EMPLOYEE_SALARY && (
                        <>
                            <th>
                                Employee
                            </th>

                            <th>
                                Employee ID
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Designation
                            </th>
                        </>
                    )}

                    <th>
                        Month
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

                {records.map(
                    (
                        record
                    ) => (
                        <tr
                            key={
                                record._id
                            }
                        >

                            {type ===
                                REPORT_TYPES.EMPLOYEE_SALARY && (
                                <>
                                    <td>
                                        <EmployeeCell
                                            employee={
                                                record.employee
                                            }
                                        />
                                    </td>

                                    <td>
                                        {
                                            record
                                                .employee
                                                ?.employeeId ||
                                            "-"
                                        }
                                    </td>

                                    <td>
                                        {
                                            getDepartmentName(
                                                record
                                                    .employee
                                                    ?.department
                                            )
                                        }
                                    </td>

                                    <td>
                                        {
                                            getDesignationName(
                                                record
                                                    .employee
                                                    ?.designation
                                            )
                                        }
                                    </td>
                                </>
                            )}

                            <td>
                                {record.month
                                    ? `${String(
                                          record.month
                                      ).padStart(
                                          2,
                                          "0"
                                      )}/${record.year}`
                                    : "-"}
                            </td>

                            <td>
                                {formatCurrency(
                                    record.grossSalary
                                )}
                            </td>

                            <td>
                                {formatCurrency(
                                    record.totalDeductions
                                )}
                            </td>

                            <td>
                                <strong className="hr-report-net-salary">
                                    {formatCurrency(
                                        record.netSalary
                                    )}
                                </strong>
                            </td>

                            <td>
                                <StatusBadge
                                    status={
                                        record.status
                                    }
                                />
                            </td>

                            <td>
                                <button
                                    type="button"
                                    className="hr-report-view-btn"
                                    onClick={() =>
                                        onView(
                                            record
                                        )
                                    }
                                >
                                    <Eye
                                        size={
                                            16
                                        }
                                    />

                                    Payslip
                                </button>
                            </td>

                        </tr>
                    )
                )}

            </tbody>

        </table>
    );
};

// =====================================================
// STATUS
// =====================================================

const StatusBadge = ({
    status,
}) => {
    const value =
        String(
            status ||
                "Unknown"
        );

    const normalized =
        value
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );

    return (
        <span
            className={
                `hr-report-status ${normalized}`
            }
        >
            {value}
        </span>
    );
};

// =====================================================
// VIEW MODAL
// =====================================================

const ReportViewModal = ({
    type,
    record,
    onClose,
}) => {
    if (!record) {
        return null;
    }

    const isSalary =
        type ===
            REPORT_TYPES.MY_SALARY ||
        type ===
            REPORT_TYPES.EMPLOYEE_SALARY;

    const employee =
        record.employee;

    return (
        <div
            className="hr-report-modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            <div className="hr-report-modal">

                <div className="hr-report-modal-header">

                    <div>

                        <div className="hr-report-modal-icon">
                            {isSalary ? (
                                <WalletCards
                                    size={
                                        20
                                    }
                                />
                            ) : (
                                <FileText
                                    size={
                                        20
                                    }
                                />
                            )}
                        </div>

                        <div>

                            <h2>
                                {isSalary
                                    ? "Payslip Details"
                                    : "Report Details"}
                            </h2>

                            <p>
                                Detailed report information
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                    >
                        <X
                            size={19}
                        />
                    </button>

                </div>

                {/* =================================================
                    EMPLOYEE SUMMARY
                ================================================= */}

                {employee && (
                    <div className="hr-report-modal-employee">

                        <div className="hr-report-avatar">

                            {employee.profileImage ? (
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
                                <UserRound
                                    size={
                                        18
                                    }
                                />
                            )}

                        </div>

                        <div>

                            <strong>
                                {
                                    getEmployeeName(
                                        employee
                                    )
                                }
                            </strong>

                            <span>
                                {
                                    employee.employeeId ||
                                    "-"
                                }
                            </span>

                        </div>

                    </div>
                )}

                <div className="hr-report-modal-body">

                    {Object.entries(
                        record
                    ).map(
                        (
                            [
                                key,
                                value,
                            ]
                        ) => {

                            if (
                                [
                                    "_id",
                                    "__v",
                                ].includes(
                                    key
                                )
                            ) {
                                return null;
                            }

                            let displayValue =
                                value;

                            // -----------------------------------------
                            // OBJECT
                            // -----------------------------------------

                            if (
                                value &&
                                typeof value ===
                                    "object" &&
                                !Array.isArray(
                                    value
                                )
                            ) {
                                if (
                                    key ===
                                    "employee"
                                ) {
                                    displayValue =
                                        getEmployeeName(
                                            value
                                        );
                                } else {
                                    displayValue =
                                        JSON.stringify(
                                            value
                                        );
                                }
                            }

                            // -----------------------------------------
                            // ARRAY
                            // -----------------------------------------

                            if (
                                Array.isArray(
                                    value
                                )
                            ) {
                                displayValue =
                                    `${value.length} items`;
                            }

                            // -----------------------------------------
                            // DATE
                            // -----------------------------------------

                            if (
                                key
                                    .toLowerCase()
                                    .includes(
                                        "date"
                                    ) ||
                                key ===
                                    "createdAt" ||
                                key ===
                                    "updatedAt"
                            ) {
                                displayValue =
                                    formatDate(
                                        value
                                    );
                            }

                            return (
                                <div
                                    className="hr-report-detail-row"
                                    key={
                                        key
                                    }
                                >

                                    <span>
                                        {key
                                            .replace(
                                                /([A-Z])/g,
                                                " $1"
                                            )
                                            .replace(
                                                /^./,
                                                (
                                                    char
                                                ) =>
                                                    char.toUpperCase()
                                            )}
                                    </span>

                                    <strong>
                                        {String(
                                            displayValue ??
                                                "-"
                                        )}
                                    </strong>

                                </div>
                            );
                        }
                    )}

                </div>

                <div className="hr-report-modal-footer">

                    <button
                        type="button"
                        className="hr-report-modal-close"
                        onClick={
                            onClose
                        }
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
};

export default HRReports;