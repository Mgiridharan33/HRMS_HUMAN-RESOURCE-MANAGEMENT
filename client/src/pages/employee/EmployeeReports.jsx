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
    Clock3,
    CalendarCheck,
    WalletCards,
    IndianRupee,
    FileSpreadsheet,
    FileDown,
    X,
    CheckCircle2,
    AlertCircle,
    Search,
} from "lucide-react";

import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import "./EmployeeReports.css";


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
// REPORT TYPES
// =====================================================

const REPORT_TYPES = {
    leave: {
        label: "Leave Report",
        icon: CalendarCheck,
        description:
            "View your leave applications, leave status and leave history.",
    },

    attendance: {
        label: "Attendance Report",
        icon: Clock3,
        description:
            "View your attendance, working hours and attendance history.",
    },

    salary: {
        label: "Salary Report",
        icon: WalletCards,
        description:
            "View your payroll and salary information.",
    },

    payslip: {
        label: "Payslip",
        icon: FileText,
        description:
            "View your available payroll records and download them.",
    },
};


// =====================================================
// HELPERS
// =====================================================

const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatDateForFile = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return String(date);
    }

    return parsed.toISOString().split("T")[0];
};


const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(number);
};


const getToday = () => {
    const date = new Date();

    return date.toISOString().split("T")[0];
};


const getFirstDayOfMonth = () => {
    const date = new Date();

    date.setDate(1);

    return date.toISOString().split("T")[0];
};


const getResponseArray = (data, keys = []) => {
    if (Array.isArray(data)) {
        return data;
    }

    for (const key of keys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
};


const getEmployeeFromResponse = (data) => {
    return (
        data?.employee ||
        data?.user ||
        data?.employeeData ||
        null
    );
};


const getFullName = (employee) => {
    if (!employee) {
        return "Employee";
    }

    if (employee.name) {
        return employee.name;
    }

    if (employee.fullName) {
        return employee.fullName;
    }

    const name = [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || "Employee";
};


const getStatusClass = (status) => {
    return String(status || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
};


const getNumeric = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            Number.isFinite(Number(value))
        ) {
            return Number(value);
        }
    }

    return 0;
};


const getDateValue = (item) => {
    return (
        item?.date ||
        item?.attendanceDate ||
        item?.fromDate ||
        item?.startDate ||
        item?.payrollDate ||
        item?.paymentDate ||
        item?.monthDate ||
        item?.createdAt ||
        null
    );
};


const isDateInsideRange = (
    date,
    fromDate,
    toDate
) => {
    if (!date) {
        return true;
    }

    const current = new Date(date);

    if (Number.isNaN(current.getTime())) {
        return true;
    }

    const from = new Date(
        `${fromDate}T00:00:00`
    );

    const to = new Date(
        `${toDate}T23:59:59`
    );

    return (
        current >= from &&
        current <= to
    );
};


// =====================================================
// COMPONENT
// =====================================================

const EmployeeReports = () => {

    // =================================================
    // STATE
    // =================================================

    const [reportType, setReportType] =
        useState("leave");

    const [fromDate, setFromDate] =
        useState(getFirstDayOfMonth());

    const [toDate, setToDate] =
        useState(getToday());

    const [fileFormat, setFileFormat] =
        useState("pdf");

    const [reportData, setReportData] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [downloadLoading, setDownloadLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showPreview, setShowPreview] =
        useState(false);


    // =================================================
    // CURRENT REPORT
    // =================================================

    const currentReport =
        REPORT_TYPES[reportType];


    // =================================================
    // DATE VALIDATION
    // =================================================

    const validateDates = useCallback(() => {

        if (!fromDate || !toDate) {
            setError(
                "Please select both From Date and To Date."
            );

            return false;
        }

        if (
            new Date(fromDate) >
            new Date(toDate)
        ) {
            setError(
                "From Date cannot be greater than To Date."
            );

            return false;
        }

        return true;

    }, [
        fromDate,
        toDate,
    ]);


    // =================================================
    // LOAD LEAVE REPORT
    // EXISTING API
    // GET /api/leave/my-leaves
    // =================================================

    const loadLeaveReport = useCallback(
        async () => {

            const response =
                await api.get(
                    "/leave/my-leaves"
                );

            const rawLeaves =
                getResponseArray(
                    response.data,
                    [
                        "leaves",
                        "data",
                        "records",
                        "leaveRequests",
                    ]
                );

            const filteredLeaves =
                rawLeaves.filter((item) => {

                    const date =
                        item.fromDate ||
                        item.startDate ||
                        item.createdAt;

                    return isDateInsideRange(
                        date,
                        fromDate,
                        toDate
                    );
                });


            let approved = 0;
            let pending = 0;
            let rejected = 0;
            let cancelled = 0;
            let totalDays = 0;


            filteredLeaves.forEach((item) => {

                const status =
                    String(
                        item.status || ""
                    ).toLowerCase();


                if (
                    status === "approved" ||
                    status === "approve"
                ) {
                    approved++;
                }

                else if (
                    status === "pending"
                ) {
                    pending++;
                }

                else if (
                    status === "rejected"
                ) {
                    rejected++;
                }

                else if (
                    status === "cancelled" ||
                    status === "canceled"
                ) {
                    cancelled++;
                }


                totalDays += getNumeric(
                    item.totalDays,
                    item.days,
                    item.numberOfDays
                );
            });


            return {
                employee:
                    getEmployeeFromResponse(
                        response.data
                    ),

                summary: {
                    totalLeaves:
                        filteredLeaves.length,

                    approved,

                    pending,

                    rejected,

                    cancelled,

                    totalDays,
                },

                data: filteredLeaves,
            };
        },
        [
            fromDate,
            toDate,
        ]
    );


    // =================================================
    // LOAD ATTENDANCE REPORT
    // EXISTING API
    // GET /api/attendance/history
    // =================================================

    const loadAttendanceReport = useCallback(
        async () => {

            const response =
                await api.get(
                    "/attendance/history",
                    {
                        params: {
                            fromDate,
                            toDate,
                        },
                    }
                );


            const records =
                getResponseArray(
                    response.data,
                    [
                        "attendance",
                        "records",
                        "history",
                        "data",
                    ]
                );


            const filtered =
                records.filter((item) => {

                    const date =
                        item.date ||
                        item.attendanceDate ||
                        item.createdAt;

                    return isDateInsideRange(
                        date,
                        fromDate,
                        toDate
                    );
                });


            let present = 0;
            let absent = 0;
            let late = 0;
            let workingDays = 0;


            filtered.forEach((item) => {

                const status =
                    String(
                        item.status || ""
                    ).toLowerCase();


                if (
                    status === "present" ||
                    status === "late"
                ) {
                    present++;
                }

                if (
                    status === "absent"
                ) {
                    absent++;
                }

                if (
                    status === "late"
                ) {
                    late++;
                }

                workingDays++;
            });


            return {
                employee:
                    getEmployeeFromResponse(
                        response.data
                    ),

                summary: {
                    present,
                    absent,
                    late,
                    workingDays,
                },

                data: filtered,
            };
        },
        [
            fromDate,
            toDate,
        ]
    );


    // =================================================
    // LOAD PAYROLL REPORT
    // EXISTING API
    // GET /api/employee/payroll
    // =================================================

    const loadPayrollReport = useCallback(
        async () => {

            const response =
                await api.get(
                    "/employee/payroll",
                    {
                        params: {
                            fromDate,
                            toDate,
                        },
                    }
                );


            const records =
                getResponseArray(
                    response.data,
                    [
                        "payroll",
                        "payrolls",
                        "records",
                        "data",
                    ]
                );


            const filtered =
                records.filter((item) => {

                    const date =
                        item.payrollDate ||
                        item.paymentDate ||
                        item.monthDate ||
                        item.createdAt;

                    return isDateInsideRange(
                        date,
                        fromDate,
                        toDate
                    );
                });


            let grossSalary = 0;
            let deductions = 0;
            let netSalary = 0;


            filtered.forEach((item) => {

                grossSalary += getNumeric(
                    item.grossSalary,
                    item.grossPay,
                    item.gross
                );

                deductions += getNumeric(
                    item.totalDeductions,
                    item.deductions,
                    item.deduction
                );

                netSalary += getNumeric(
                    item.netSalary,
                    item.netPay,
                    item.net
                );
            });


            return {
                employee:
                    getEmployeeFromResponse(
                        response.data
                    ),

                summary: {
                    grossSalary,
                    deductions,
                    netSalary,
                    records:
                        filtered.length,
                },

                data: filtered,
            };
        },
        [
            fromDate,
            toDate,
        ]
    );


    // =================================================
    // LOAD REPORT
    // =================================================

    const loadReport = useCallback(
        async () => {

            if (!validateDates()) {
                return;
            }


            try {

                setLoading(true);
                setError("");


                let result;


                if (
                    reportType === "leave"
                ) {
                    result =
                        await loadLeaveReport();
                }

                else if (
                    reportType === "attendance"
                ) {
                    result =
                        await loadAttendanceReport();
                }

                else {
                    result =
                        await loadPayrollReport();
                }


                setReportData(result);

            }

            catch (err) {

                console.error(
                    "EMPLOYEE REPORT ERROR:",
                    err
                );

                setReportData(null);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load the selected report."
                );

            }

            finally {

                setLoading(false);

            }

        },
        [
            validateDates,
            reportType,
            loadLeaveReport,
            loadAttendanceReport,
            loadPayrollReport,
        ]
    );


    // =================================================
    // LOAD WHEN REPORT TYPE CHANGES
    // =================================================

    useEffect(() => {

        loadReport();

    }, [reportType]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary = useMemo(() => {

        if (!reportData) {
            return [];
        }


        if (
            reportType === "leave"
        ) {

            return [

                {
                    label:
                        "Total Applications",

                    value:
                        reportData.summary
                            ?.totalLeaves || 0,

                    icon:
                        FileText,
                },

                {
                    label:
                        "Approved",

                    value:
                        reportData.summary
                            ?.approved || 0,

                    icon:
                        CheckCircle2,
                },

                {
                    label:
                        "Pending",

                    value:
                        reportData.summary
                            ?.pending || 0,

                    icon:
                        Clock3,
                },

                {
                    label:
                        "Total Days",

                    value:
                        reportData.summary
                            ?.totalDays || 0,

                    icon:
                        CalendarDays,
                },

            ];
        }


        if (
            reportType === "attendance"
        ) {

            return [

                {
                    label:
                        "Present",

                    value:
                        reportData.summary
                            ?.present || 0,

                    icon:
                        CheckCircle2,
                },

                {
                    label:
                        "Absent",

                    value:
                        reportData.summary
                            ?.absent || 0,

                    icon:
                        AlertCircle,
                },

                {
                    label:
                        "Late",

                    value:
                        reportData.summary
                            ?.late || 0,

                    icon:
                        Clock3,
                },

                {
                    label:
                        "Working Days",

                    value:
                        reportData.summary
                            ?.workingDays || 0,

                    icon:
                        CalendarDays,
                },

            ];
        }


        return [

            {
                label:
                    "Gross Salary",

                value:
                    formatCurrency(
                        reportData.summary
                            ?.grossSalary
                    ),

                icon:
                    IndianRupee,
            },

            {
                label:
                    "Deductions",

                value:
                    formatCurrency(
                        reportData.summary
                            ?.deductions
                    ),

                icon:
                    FileText,
            },

            {
                label:
                    "Net Salary",

                value:
                    formatCurrency(
                        reportData.summary
                            ?.netSalary
                    ),

                icon:
                    WalletCards,
            },

            {
                label:
                    "Payroll Records",

                value:
                    reportData.summary
                        ?.records || 0,

                icon:
                    CalendarDays,
            },

        ];

    }, [
        reportData,
        reportType,
    ]);


    // =================================================
    // TABLE COLUMNS
    // =================================================

    const columns = useMemo(() => {

        if (
            reportType === "leave"
        ) {

            return [
                "Leave Type",
                "From",
                "To",
                "Days",
                "Reason",
                "Status",
            ];
        }


        if (
            reportType === "attendance"
        ) {

            return [
                "Date",
                "Check In",
                "Check Out",
                "Working Hours",
                "Status",
            ];
        }


        return [
            "Month",
            "Basic Salary",
            "Gross Salary",
            "Deductions",
            "Net Salary",
            "Status",
        ];

    }, [reportType]);


    // =================================================
    // EXPORT HEADERS + ROWS
    // =================================================

    const getExportData = useCallback(() => {

        const rows =
            reportData?.data || [];


        if (
            reportType === "leave"
        ) {

            return {
                headers: [
                    "Leave Type",
                    "From Date",
                    "To Date",
                    "Days",
                    "Reason",
                    "Status",
                ],

                rows: rows.map((item) => [

                    item.leaveType ||
                    item.type ||
                    "-",

                    formatDate(
                        item.fromDate ||
                        item.startDate
                    ),

                    formatDate(
                        item.toDate ||
                        item.endDate
                    ),

                    item.totalDays ||
                    item.days ||
                    item.numberOfDays ||
                    0,

                    item.reason ||
                    "-",

                    item.status ||
                    "-",

                ]),
            };
        }


        if (
            reportType === "attendance"
        ) {

            return {

                headers: [
                    "Date",
                    "Check In",
                    "Check Out",
                    "Working Hours",
                    "Status",
                ],

                rows: rows.map((item) => [

                    formatDate(
                        item.date ||
                        item.attendanceDate
                    ),

                    item.checkIn ||
                    item.punchIn ||
                    "-",

                    item.checkOut ||
                    item.punchOut ||
                    "-",

                    item.workingHours ||
                    item.totalHours ||
                    "-",

                    item.status ||
                    "-",

                ]),
            };
        }


        return {

            headers: [
                "Month",
                "Basic Salary",
                "Gross Salary",
                "Deductions",
                "Net Salary",
                "Status",
            ],

            rows: rows.map((item) => [

                item.month ||
                item.payrollMonth ||
                item.monthName ||
                "-",

                getNumeric(
                    item.basicSalary
                ),

                getNumeric(
                    item.grossSalary,
                    item.grossPay,
                    item.gross
                ),

                getNumeric(
                    item.totalDeductions,
                    item.deductions,
                    item.deduction
                ),

                getNumeric(
                    item.netSalary,
                    item.netPay,
                    item.net
                ),

                item.status ||
                "-",

            ]),
        };

    }, [
        reportData,
        reportType,
    ]);


    // =================================================
    // CREATE EXCEL XLSX
    // =================================================

    const downloadExcel = useCallback(() => {

        const rows =
            reportData?.data || [];


        if (!rows.length) {

            setError(
                "There is no report data available to export."
            );

            return;
        }


        try {

            setDownloadLoading(true);
            setError("");


            const employee =
                reportData?.employee || {};


            const exportData =
                getExportData();


            // -----------------------------------------
            // WORKSHEET DATA
            // -----------------------------------------

            const worksheetData = [

                [
                    "EMPLOYEE REPORT",
                ],

                [],

                [
                    "Report Type",
                    currentReport.label,
                ],

                [
                    "Employee Name",
                    getFullName(employee),
                ],

                [
                    "Employee ID",
                    employee.employeeId ||
                    employee.empId ||
                    "-",
                ],

                [
                    "Department",
                    employee.department ||
                    "-",
                ],

                [
                    "Designation",
                    employee.designation ||
                    "-",
                ],

                [
                    "From Date",
                    formatDate(fromDate),
                ],

                [
                    "To Date",
                    formatDate(toDate),
                ],

                [],

                [
                    "SUMMARY",
                ],

            ];


            summary.forEach((item) => {

                worksheetData.push([
                    item.label,
                    item.value,
                ]);

            });


            worksheetData.push([]);

            worksheetData.push(
                exportData.headers
            );


            exportData.rows.forEach((row) => {

                worksheetData.push(row);

            });


            // -----------------------------------------
            // CREATE WORKSHEET
            // -----------------------------------------

            const worksheet =
                XLSX.utils.aoa_to_sheet(
                    worksheetData
                );


            // -----------------------------------------
            // COLUMN WIDTH
            // -----------------------------------------

            worksheet["!cols"] = [
                {
                    wch: 22,
                },
                {
                    wch: 22,
                },
                {
                    wch: 18,
                },
                {
                    wch: 18,
                },
                {
                    wch: 20,
                },
                {
                    wch: 20,
                },
            ];


            // -----------------------------------------
            // MERGE TITLE
            // -----------------------------------------

            worksheet["!merges"] = [
                {
                    s: {
                        r: 0,
                        c: 0,
                    },
                    e: {
                        r: 0,
                        c: 5,
                    },
                },
            ];


            // -----------------------------------------
            // WORKBOOK
            // -----------------------------------------

            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                reportType === "leave"
                    ? "Leave Report"
                    : reportType === "attendance"
                        ? "Attendance Report"
                        : "Payroll Report"
            );


            // -----------------------------------------
            // DOWNLOAD REAL XLSX
            // -----------------------------------------

            const fileName =
                `employee-${reportType}-report-${formatDateForFile(
                    fromDate
                )}-to-${formatDateForFile(
                    toDate
                )}.xlsx`;


            XLSX.writeFile(
                workbook,
                fileName
            );

        }

        catch (err) {

            console.error(
                "EXCEL EXPORT ERROR:",
                err
            );

            setError(
                "Unable to generate Excel report."
            );

        }

        finally {

            setDownloadLoading(false);

        }

    }, [
        reportData,
        getExportData,
        currentReport,
        fromDate,
        toDate,
        reportType,
        summary,
    ]);


    // =================================================
    // CREATE REAL PDF
    // =================================================

    const downloadPDF = useCallback(() => {

        const rows =
            reportData?.data || [];


        if (!rows.length) {

            setError(
                "There is no report data available to export."
            );

            return;
        }


        try {

            setDownloadLoading(true);
            setError("");


            const employee =
                reportData?.employee || {};


            const exportData =
                getExportData();


            // -----------------------------------------
            // CREATE PDF
            // -----------------------------------------

            const doc =
                new jsPDF({
                    orientation:
                        "landscape",
                    unit: "mm",
                    format: "a4",
                });


            const pageWidth =
                doc.internal.pageSize
                    .getWidth();


            // -----------------------------------------
            // TITLE
            // -----------------------------------------

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(18);

            doc.text(
                "EMPLOYEE REPORT",
                pageWidth / 2,
                15,
                {
                    align: "center",
                }
            );


            doc.setFontSize(12);

            doc.text(
                currentReport.label,
                pageWidth / 2,
                23,
                {
                    align: "center",
                }
            );


            // -----------------------------------------
            // EMPLOYEE INFORMATION
            // -----------------------------------------

            doc.setFontSize(9);

            doc.setFont(
                "helvetica",
                "normal"
            );


            const employeeName =
                getFullName(employee);


            const employeeId =
                employee.employeeId ||
                employee.empId ||
                "-";


            const department =
                employee.department ||
                "-";


            const designation =
                employee.designation ||
                "-";


            doc.text(
                `Employee Name: ${employeeName}`,
                14,
                34
            );


            doc.text(
                `Employee ID: ${employeeId}`,
                14,
                40
            );


            doc.text(
                `Department: ${department}`,
                14,
                46
            );


            doc.text(
                `Designation: ${designation}`,
                14,
                52
            );


            doc.text(
                `From: ${formatDate(fromDate)}`,
                pageWidth - 85,
                34
            );


            doc.text(
                `To: ${formatDate(toDate)}`,
                pageWidth - 85,
                40
            );


            doc.text(
                `Generated: ${formatDate(
                    new Date()
                )}`,
                pageWidth - 85,
                46
            );


            // -----------------------------------------
            // SUMMARY
            // -----------------------------------------

            let summaryY = 62;


            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(10);

            doc.text(
                "SUMMARY",
                14,
                summaryY
            );


            summaryY += 5;


            const summaryHeaders = [
                "Metric",
                "Value",
            ];


            const summaryRows =
                summary.map((item) => [
                    item.label,
                    String(item.value),
                ]);


            autoTable(
                doc,
                {
                    startY: summaryY,

                    head: [
                        summaryHeaders,
                    ],

                    body:
                        summaryRows,

                    theme:
                        "grid",

                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                    },

                    headStyles: {
                        fontStyle:
                            "bold",
                    },

                    margin: {
                        left: 14,
                        right: 14,
                    },

                    tableWidth:
                        90,
                }
            );


            // -----------------------------------------
            // REPORT TABLE
            // -----------------------------------------

            const finalY =
                doc.lastAutoTable?.finalY ||
                85;


            autoTable(
                doc,
                {
                    startY:
                        finalY + 10,

                    head: [
                        exportData.headers,
                    ],

                    body:
                        exportData.rows,

                    theme:
                        "grid",

                    styles: {
                        fontSize: 8,
                        cellPadding: 3,
                        overflow:
                            "linebreak",
                    },

                    headStyles: {
                        fontStyle:
                            "bold",
                    },

                    alternateRowStyles: {
                        fillColor: [
                            248,
                            250,
                            252,
                        ],
                    },

                    margin: {
                        top: 10,
                        left: 10,
                        right: 10,
                        bottom: 15,
                    },

                    didDrawPage: () => {

                        const pageHeight =
                            doc.internal
                                .pageSize
                                .getHeight();


                        doc.setFontSize(
                            7
                        );

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );


                        doc.text(
                            `Employee Reports • ${currentReport.label}`,
                            10,
                            pageHeight - 8
                        );


                        doc.text(
                            `Page ${doc.internal.getNumberOfPages()}`,
                            pageWidth - 25,
                            pageHeight - 8
                        );

                    },
                }
            );


            // -----------------------------------------
            // FILE NAME
            // -----------------------------------------

            const fileName =
                `employee-${reportType}-report-${formatDateForFile(
                    fromDate
                )}-to-${formatDateForFile(
                    toDate
                )}.pdf`;


            // -----------------------------------------
            // SAVE REAL PDF
            // -----------------------------------------

            doc.save(
                fileName
            );

        }

        catch (err) {

            console.error(
                "PDF EXPORT ERROR:",
                err
            );

            setError(
                "Unable to generate PDF report."
            );

        }

        finally {

            setDownloadLoading(false);

        }

    }, [
        reportData,
        getExportData,
        currentReport,
        fromDate,
        toDate,
        reportType,
        summary,
    ]);


    // =================================================
    // MAIN DOWNLOAD
    // =================================================

    const downloadReport = useCallback(() => {

        if (!reportData) {

            setError(
                "Please load the report before downloading."
            );

            return;
        }


        if (
            !reportData.data ||
            !reportData.data.length
        ) {

            setError(
                "There is no report data available to download."
            );

            return;
        }


        if (
            fileFormat === "pdf"
        ) {

            downloadPDF();

            return;
        }


        if (
            fileFormat === "xlsx"
        ) {

            downloadExcel();

            return;
        }

    }, [
        reportData,
        fileFormat,
        downloadPDF,
        downloadExcel,
    ]);


    // =================================================
    // RESET
    // =================================================

    const resetFilters = () => {

        setFromDate(
            getFirstDayOfMonth()
        );

        setToDate(
            getToday()
        );

        setReportData(null);
        setError("");

    };


    // =================================================
    // TABLE ROW RENDER
    // =================================================

    const renderRow = (
        item,
        index
    ) => {

        const key =
            item._id ||
            item.id ||
            index;


        // ---------------------------------------------
        // LEAVE
        // ---------------------------------------------

        if (
            reportType === "leave"
        ) {

            return (
                <tr key={key}>

                    <td>
                        <span className="report-primary-text">
                            {
                                item.leaveType ||
                                item.type ||
                                "-"
                            }
                        </span>
                    </td>

                    <td>
                        {
                            formatDate(
                                item.fromDate ||
                                item.startDate
                            )
                        }
                    </td>

                    <td>
                        {
                            formatDate(
                                item.toDate ||
                                item.endDate
                            )
                        }
                    </td>

                    <td>
                        {
                            item.totalDays ||
                            item.days ||
                            item.numberOfDays ||
                            "-"
                        }
                    </td>

                    <td className="reason-cell">
                        {
                            item.reason ||
                            "-"
                        }
                    </td>

                    <td>
                        <span
                            className={`report-status ${getStatusClass(
                                item.status
                            )}`}
                        >
                            {
                                item.status ||
                                "-"
                            }
                        </span>
                    </td>

                </tr>
            );
        }


        // ---------------------------------------------
        // ATTENDANCE
        // ---------------------------------------------

        if (
            reportType === "attendance"
        ) {

            return (
                <tr key={key}>

                    <td>
                        {
                            formatDate(
                                item.date ||
                                item.attendanceDate
                            )
                        }
                    </td>

                    <td>
                        {
                            item.checkIn ||
                            item.punchIn ||
                            "-"
                        }
                    </td>

                    <td>
                        {
                            item.checkOut ||
                            item.punchOut ||
                            "-"
                        }
                    </td>

                    <td>
                        {
                            item.workingHours ||
                            item.totalHours ||
                            "-"
                        }
                    </td>

                    <td>
                        <span
                            className={`report-status ${getStatusClass(
                                item.status
                            )}`}
                        >
                            {
                                item.status ||
                                "-"
                            }
                        </span>
                    </td>

                </tr>
            );
        }


        // ---------------------------------------------
        // SALARY / PAYSLIP
        // ---------------------------------------------

        return (
            <tr key={key}>

                <td>
                    {
                        item.month ||
                        item.payrollMonth ||
                        item.monthName ||
                        "-"
                    }
                </td>

                <td>
                    {
                        formatCurrency(
                            item.basicSalary
                        )
                    }
                </td>

                <td>
                    {
                        formatCurrency(
                            getNumeric(
                                item.grossSalary,
                                item.grossPay,
                                item.gross
                            )
                        )
                    }
                </td>

                <td>
                    {
                        formatCurrency(
                            getNumeric(
                                item.totalDeductions,
                                item.deductions,
                                item.deduction
                            )
                        )
                    }
                </td>

                <td className="salary-value">
                    {
                        formatCurrency(
                            getNumeric(
                                item.netSalary,
                                item.netPay,
                                item.net
                            )
                        )
                    }
                </td>

                <td>
                    <span
                        className={`report-status ${getStatusClass(
                            item.status
                        )}`}
                    >
                        {
                            item.status ||
                            "-"
                        }
                    </span>
                </td>

            </tr>
        );
    };


    // =================================================
    // ROWS
    // =================================================

    const rows =
        reportData?.data || [];


    // =================================================
    // EMPLOYEE
    // =================================================

    const employee =
        reportData?.employee;


    // =================================================
    // JSX
    // =================================================

    return (
        <div className="employee-reports-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="reports-page-header">

                <div className="reports-title-row">

                    <div className="reports-title-icon">
                        <FileText size={23} />
                    </div>

                    <div>

                        <h1>
                            Employee Reports
                        </h1>

                        <p>
                            View your leave,
                            attendance and payroll
                            information.
                        </p>

                    </div>

                </div>


                <button
                    className="reports-refresh-btn"
                    onClick={loadReport}
                    disabled={loading}
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =========================================
                REPORT TYPES
            ========================================= */}

            <div className="report-type-grid">

                {Object.entries(
                    REPORT_TYPES
                ).map(
                    ([
                        key,
                        report,
                    ]) => {

                        const Icon =
                            report.icon;

                        const active =
                            reportType === key;

                        return (
                            <button
                                key={key}
                                className={`report-type-card ${
                                    active
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => {

                                    setReportType(
                                        key
                                    );

                                    setReportData(
                                        null
                                    );

                                    setError("");

                                }}
                            >

                                <div className="report-type-icon">
                                    <Icon size={21} />
                                </div>

                                <div className="report-type-content">

                                    <h3>
                                        {
                                            report.label
                                        }
                                    </h3>

                                    <p>
                                        {
                                            report.description
                                        }
                                    </p>

                                </div>

                                {active && (
                                    <CheckCircle2
                                        className="report-active-check"
                                        size={19}
                                    />
                                )}

                            </button>
                        );
                    }
                )}

            </div>


            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="report-filter-card">

                <div className="filter-card-heading">

                    <div>

                        <h2>
                            Report Filters
                        </h2>

                        <p>
                            Select the date range
                            and download format.
                        </p>

                    </div>


                    <button
                        className="reset-filter-btn"
                        onClick={
                            resetFilters
                        }
                    >
                        Reset
                    </button>

                </div>


                <div className="report-filter-grid">

                    <div className="report-field">

                        <label>
                            <CalendarDays
                                size={15}
                            />

                            From Date
                        </label>

                        <input
                            type="date"
                            value={
                                fromDate
                            }
                            max={
                                toDate
                            }
                            onChange={(e) =>
                                setFromDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="report-field">

                        <label>
                            <CalendarDays
                                size={15}
                            />

                            To Date
                        </label>

                        <input
                            type="date"
                            value={
                                toDate
                            }
                            min={
                                fromDate
                            }
                            max={
                                getToday()
                            }
                            onChange={(e) =>
                                setToDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="report-field">

                        <label>
                            <FileDown
                                size={15}
                            />

                            Download Format
                        </label>

                        <select
                            value={
                                fileFormat
                            }
                            onChange={(e) =>
                                setFileFormat(
                                    e.target.value
                                )
                            }
                        >

                            <option value="pdf">
                                PDF
                            </option>

                            <option value="xlsx">
                                Excel (.xlsx)
                            </option>

                        </select>

                    </div>


                    <div className="report-filter-actions">

                        <button
                            className="view-report-btn"
                            onClick={
                                loadReport
                            }
                            disabled={
                                loading
                            }
                        >

                            <Eye size={17} />

                            {
                                loading
                                    ? "Loading..."
                                    : "View Report"
                            }

                        </button>


                        <button
                            className="download-report-btn"
                            onClick={
                                downloadReport
                            }
                            disabled={
                                downloadLoading ||
                                !reportData ||
                                rows.length === 0
                            }
                        >

                            <Download
                                size={17}
                            />

                            {
                                downloadLoading
                                    ? "Preparing..."
                                    : "Download"
                            }

                        </button>

                    </div>

                </div>

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="report-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =========================================
                SUMMARY
            ========================================= */}

            {reportData && (

                <div className="report-summary-grid">

                    {summary.map(
                        (
                            item,
                            index
                        ) => {

                            const Icon =
                                item.icon;

                            return (
                                <div
                                    className="report-summary-card"
                                    key={
                                        index
                                    }
                                >

                                    <div className="summary-icon">
                                        <Icon
                                            size={20}
                                        />
                                    </div>

                                    <div>

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                        <strong>
                                            {
                                                item.value
                                            }
                                        </strong>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}


            {/* =========================================
                REPORT PREVIEW
            ========================================= */}

            <div className="report-preview-card">

                <div className="report-preview-header">

                    <div>

                        <h2>
                            {
                                currentReport.label
                            }
                        </h2>

                        <p>
                            {
                                formatDate(
                                    fromDate
                                )
                            }

                            {" — "}

                            {
                                formatDate(
                                    toDate
                                )
                            }
                        </p>

                    </div>


                    <div className="preview-actions">

                        <button
                            className="preview-btn"
                            onClick={() =>
                                setShowPreview(
                                    true
                                )
                            }
                            disabled={
                                !reportData ||
                                rows.length === 0
                            }
                        >

                            <Eye size={16} />

                            Preview

                        </button>


                        <button
                            className="download-small-btn"
                            onClick={
                                downloadReport
                            }
                            disabled={
                                !reportData ||
                                rows.length === 0 ||
                                downloadLoading
                            }
                        >

                            <Download
                                size={16}
                            />

                            Download

                        </button>

                    </div>

                </div>


                {/* =====================================
                    EMPLOYEE INFO
                ===================================== */}

                {employee && (

                    <div className="employee-report-info">

                        <div className="employee-avatar">

                            {employee.profileImage ? (

                                <img
                                    src={
                                        employee.profileImage
                                    }
                                    alt={
                                        getFullName(
                                            employee
                                        )
                                    }
                                />

                            ) : (

                                <Users
                                    size={23}
                                />

                            )}

                        </div>


                        <div>

                            <strong>
                                {
                                    getFullName(
                                        employee
                                    )
                                }
                            </strong>

                            <span>
                                {
                                    employee.employeeId ||
                                    employee.empId ||
                                    "-"
                                }
                            </span>

                        </div>


                        <div className="employee-info-item">

                            <span>
                                Department
                            </span>

                            <strong>
                                {
                                    employee.department ||
                                    "-"
                                }
                            </strong>

                        </div>


                        <div className="employee-info-item">

                            <span>
                                Designation
                            </span>

                            <strong>
                                {
                                    employee.designation ||
                                    "-"
                                }
                            </strong>

                        </div>

                    </div>

                )}


                {/* =====================================
                    TABLE
                ===================================== */}

                <div className="report-table-wrapper">

                    {loading ? (

                        <div className="report-loading">

                            <RefreshCw
                                size={25}
                                className="spin"
                            />

                            <p>
                                Loading report...
                            </p>

                        </div>

                    ) : rows.length === 0 ? (

                        <div className="report-empty">

                            <div className="empty-icon">
                                <Search
                                    size={23}
                                />
                            </div>

                            <h3>
                                No report data found
                            </h3>

                            <p>
                                There are no records
                                available for the
                                selected date range.
                            </p>

                        </div>

                    ) : (

                        <table className="employee-report-table">

                            <thead>

                                <tr>

                                    {columns.map(
                                        (
                                            column
                                        ) => (
                                            <th
                                                key={
                                                    column
                                                }
                                            >
                                                {
                                                    column
                                                }
                                            </th>
                                        )
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {rows.map(
                                    renderRow
                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>


            {/* =========================================
                DOWNLOAD CENTER
            ========================================= */}

            <div className="download-center">

                <div className="download-center-header">

                    <div className="download-center-icon">
                        <Download
                            size={21}
                        />
                    </div>

                    <div>

                        <h2>
                            Download Center
                        </h2>

                        <p>
                            Generate a real PDF or
                            Excel file from the
                            selected report.
                        </p>

                    </div>

                </div>


                <div className="download-options">

                    {/* PDF */}

                    <button
                        type="button"
                        className={`format-card ${
                            fileFormat ===
                            "pdf"
                                ? "selected"
                                : ""
                        }`}
                        onClick={() =>
                            setFileFormat(
                                "pdf"
                            )
                        }
                    >

                        <div className="format-icon pdf">
                            <FileText
                                size={22}
                            />
                        </div>

                        <div>

                            <strong>
                                PDF Report
                            </strong>

                            <span>
                                Real PDF document
                                for printing
                                and sharing
                            </span>

                        </div>

                        <div className="format-radio">

                            {fileFormat ===
                                "pdf" && (

                                <CheckCircle2
                                    size={19}
                                />

                            )}

                        </div>

                    </button>


                    {/* EXCEL */}

                    <button
                        type="button"
                        className={`format-card ${
                            fileFormat ===
                            "xlsx"
                                ? "selected"
                                : ""
                        }`}
                        onClick={() =>
                            setFileFormat(
                                "xlsx"
                            )
                        }
                    >

                        <div className="format-icon excel">
                            <FileSpreadsheet
                                size={22}
                            />
                        </div>

                        <div>

                            <strong>
                                Excel Report
                            </strong>

                            <span>
                                Real .xlsx file
                                for data
                                analysis
                            </span>

                        </div>

                        <div className="format-radio">

                            {fileFormat ===
                                "xlsx" && (

                                <CheckCircle2
                                    size={19}
                                />

                            )}

                        </div>

                    </button>


                    {/* MAIN DOWNLOAD */}

                    <button
                        type="button"
                        className="main-download-btn"
                        onClick={
                            downloadReport
                        }
                        disabled={
                            downloadLoading ||
                            !reportData ||
                            rows.length === 0
                        }
                    >

                        <Download
                            size={18}
                        />

                        {
                            downloadLoading
                                ? "Generating..."
                                : `Download ${
                                      fileFormat ===
                                      "pdf"
                                          ? "PDF"
                                          : "Excel"
                                  }`
                        }

                    </button>

                </div>

            </div>


            {/* =========================================
                PREVIEW MODAL
            ========================================= */}

            {showPreview && (

                <div
                    className="report-modal-overlay"
                    onClick={() =>
                        setShowPreview(
                            false
                        )
                    }
                >

                    <div
                        className="report-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="report-modal-header">

                            <div>

                                <h2>
                                    {
                                        currentReport.label
                                    }
                                </h2>

                                <p>

                                    {
                                        formatDate(
                                            fromDate
                                        )
                                    }

                                    {" — "}

                                    {
                                        formatDate(
                                            toDate
                                        )
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPreview(
                                        false
                                    )
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="report-modal-body">

                            {employee && (

                                <div className="modal-employee">

                                    <div>

                                        <strong>
                                            {
                                                getFullName(
                                                    employee
                                                )
                                            }
                                        </strong>

                                        <span>
                                            Employee ID:{" "}
                                            {
                                                employee.employeeId ||
                                                employee.empId ||
                                                "-"
                                            }
                                        </span>

                                    </div>

                                    <div>

                                        <span>
                                            Department
                                        </span>

                                        <strong>
                                            {
                                                employee.department ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Designation
                                        </span>

                                        <strong>
                                            {
                                                employee.designation ||
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )}


                            <div className="modal-table-wrapper">

                                <table className="employee-report-table">

                                    <thead>

                                        <tr>

                                            {columns.map(
                                                (
                                                    column
                                                ) => (
                                                    <th
                                                        key={
                                                            column
                                                        }
                                                    >
                                                        {
                                                            column
                                                        }
                                                    </th>
                                                )
                                            )}

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {rows.map(
                                            renderRow
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        <div className="report-modal-footer">

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setShowPreview(
                                        false
                                    )
                                }
                            >
                                Close
                            </button>


                            <button
                                type="button"
                                className="modal-download-btn"
                                onClick={
                                    downloadReport
                                }
                                disabled={
                                    downloadLoading
                                }
                            >

                                <Download
                                    size={17}
                                />

                                {
                                    downloadLoading
                                        ? "Generating..."
                                        : `Download ${
                                              fileFormat ===
                                              "pdf"
                                                  ? "PDF"
                                                  : "Excel"
                                          }`
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default EmployeeReports;