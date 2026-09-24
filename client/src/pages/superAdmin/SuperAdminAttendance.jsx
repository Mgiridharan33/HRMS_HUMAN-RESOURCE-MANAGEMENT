import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Coffee,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    Loader2,
    LogIn,
    LogOut,
    Search,
    UserCheck,
    UserRound,
    Users,
    Utensils,
    X,
    BriefcaseBusiness,
    RefreshCw,
    FileDown,
    ChevronDown,
} from "lucide-react";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import superAdminAttendanceApi
    from "../../services/superAdminAttendanceApi";

import "./SuperAdminAttendance.css";


// =====================================================
// HELPERS
// =====================================================

const pad = (value) =>
    String(value).padStart(2, "0");


const formatDate = (date) => {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const formatDateForFile = (date) => {

    if (!date) {
        return "";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    return [
        d.getFullYear(),
        pad(d.getMonth() + 1),
        pad(d.getDate()),
    ].join("-");
};


const formatTime = (date) => {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }
    );
};


const formatDuration = (
    seconds = 0
) => {

    const total =
        Math.max(
            0,
            Number(seconds) || 0
        );

    const hours =
        Math.floor(
            total / 3600
        );

    const minutes =
        Math.floor(
            (total % 3600) / 60
        );

    const remainingSeconds =
        total % 60;

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};


const formatMinutes = (
    minutes = 0
) => {

    const total =
        Math.max(
            0,
            Number(minutes) || 0
        );

    const hours =
        Math.floor(
            total / 60
        );

    const mins =
        total % 60;

    return `${hours}h ${mins}m`;
};


const getName = (item) => {

    if (
        item.attendanceType ===
        "HR"
    ) {
        return (
            item.hr?.name ||
            "Unknown HR"
        );
    }

    return (
        `${item.employee?.firstName || ""} ${
            item.employee?.lastName || ""
        }`.trim() ||
        "Unknown Employee"
    );
};


const getEmail = (item) => {

    if (
        item.attendanceType ===
        "HR"
    ) {
        return item.hr?.email || "-";
    }

    return item.employee?.email || "-";
};


const getDepartment = (item) => {

    if (
        item.attendanceType ===
        "HR"
    ) {
        return "HR";
    }

    return (
        item.employee?.department ||
        "-"
    );
};


const getEmployeeId = (item) => {

    if (
        item.attendanceType ===
        "HR"
    ) {
        return "HR";
    }

    return (
        item.employee?.employeeId ||
        "-"
    );
};


const getProfileImage = (item) => {

    if (
        item.attendanceType ===
        "HR"
    ) {
        return item.hr?.profileImage || "";
    }

    return item.employee?.profileImage || "";
};


// =====================================================
// STATUS
// =====================================================

const getStateLabel = (
    state
) => {

    switch (state) {

        case "WORKING":
            return "Working";

        case "BREAK":
            return "On Break";

        case "LUNCH":
            return "Lunch";

        case "COMPLETED":
            return "Completed";

        default:
            return "Not Started";
    }
};


const getStateClass = (
    state
) => {

    switch (state) {

        case "WORKING":
            return "working";

        case "BREAK":
            return "break";

        case "LUNCH":
            return "lunch";

        case "COMPLETED":
            return "completed";

        default:
            return "not-started";
    }
};


// =====================================================
// COMPONENT
// =====================================================

const SuperAdminAttendance = () => {

    // =================================================
    // DATA
    // =================================================

    const [
        attendance,
        setAttendance,
    ] = useState([]);

    const [
        summary,
        setSummary,
    ] = useState(null);


    // =================================================
    // UI
    // =================================================

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        summaryLoading,
        setSummaryLoading,
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
        activeTab,
        setActiveTab,
    ] = useState("all");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        department,
        setDepartment,
    ] = useState("");

    const [
        status,
        setStatus,
    ] = useState("");

    const [
        selectedDate,
        setSelectedDate,
    ] = useState("");

    const [
        startDate,
        setStartDate,
    ] = useState("");

    const [
        endDate,
        setEndDate,
    ] = useState("");


    // =================================================
    // DETAILS MODAL
    // =================================================

    const [
        selectedAttendance,
        setSelectedAttendance,
    ] = useState(null);

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);


    // =================================================
    // EXPORT MODAL
    // =================================================

    const [
        exportOpen,
        setExportOpen,
    ] = useState(false);

    const [
        exportCategory,
        setExportCategory,
    ] = useState("filtered");

    const [
        exportDateType,
        setExportDateType,
    ] = useState("current");

    const [
        exportSpecificDate,
        setExportSpecificDate,
    ] = useState("");

    const [
        exportStartDate,
        setExportStartDate,
    ] = useState("");

    const [
        exportEndDate,
        setExportEndDate,
    ] = useState("");

    const [
        exportFormat,
        setExportFormat,
    ] = useState("excel");

    const [
        exporting,
        setExporting,
    ] = useState(false);


    // =================================================
    // DEPARTMENTS
    // =================================================

    const departments =
        useMemo(() => {

            const values =
                attendance
                    .filter(
                        (item) =>
                            item.attendanceType ===
                            "EMPLOYEE"
                    )
                    .map(
                        (item) =>
                            item.employee?.department
                    )
                    .filter(Boolean);

            return [
                ...new Set(values),
            ].sort();

        }, [attendance]);


    // =================================================
    // LOAD SUMMARY
    // =================================================

    const loadSummary =
        useCallback(
            async () => {

                try {

                    setSummaryLoading(
                        true
                    );

                    const result =
                        await superAdminAttendanceApi
                            .getSummary();

                    if (
                        result?.success
                    ) {

                        setSummary(
                            result.summary
                        );
                    }

                } catch (err) {

                    console.error(
                        "SUMMARY ERROR:",
                        err
                    );

                } finally {

                    setSummaryLoading(
                        false
                    );
                }

            },
            []
        );


    // =================================================
    // LOAD ATTENDANCE
    // =================================================

    const loadAttendance =
        useCallback(
            async (
                showLoader = true
            ) => {

                try {

                    if (
                        showLoader
                    ) {
                        setLoading(true);
                    } else {
                        setRefreshing(true);
                    }

                    setError("");

                    const params = {};


                    if (
                        activeTab !==
                        "all"
                    ) {

                        params.type =
                            activeTab;
                    }


                    if (search.trim()) {

                        params.search =
                            search.trim();
                    }


                    if (department) {

                        params.department =
                            department;
                    }


                    if (status) {

                        params.status =
                            status;
                    }


                    if (selectedDate) {

                        params.date =
                            selectedDate;

                    } else {

                        if (
                            startDate
                        ) {

                            params.startDate =
                                startDate;
                        }

                        if (
                            endDate
                        ) {

                            params.endDate =
                                endDate;
                        }
                    }


                    const result =
                        await superAdminAttendanceApi
                            .getAttendance(
                                params
                            );


                    if (
                        result?.success
                    ) {

                        setAttendance(
                            result.attendance ||
                            []
                        );

                    } else {

                        setError(
                            result?.message ||
                            "Failed to load attendance"
                        );
                    }

                } catch (err) {

                    console.error(
                        "ATTENDANCE ERROR:",
                        err
                    );

                    setError(
                        err?.response?.data?.message ||
                        "Failed to load attendance data"
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }

            },
            [
                activeTab,
                search,
                department,
                status,
                selectedDate,
                startDate,
                endDate,
            ]
        );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadSummary();

    }, [
        loadSummary,
    ]);


    useEffect(() => {

        loadAttendance();

    }, [
        loadAttendance,
    ]);


    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh =
        async () => {

            await Promise.all([
                loadSummary(),
                loadAttendance(false),
            ]);
        };


    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters =
        () => {

            setSearch("");
            setDepartment("");
            setStatus("");
            setSelectedDate("");
            setStartDate("");
            setEndDate("");
        };


    // =================================================
    // DETAILS
    // =================================================

    const openDetails =
        (item) => {

            setSelectedAttendance(
                item
            );

            setModalOpen(true);
        };


    const closeModal =
        () => {

            setModalOpen(false);

            setTimeout(() => {

                setSelectedAttendance(
                    null
                );

            }, 200);
        };


    // =================================================
    // EXPORT MODAL
    // =================================================

    const openExport =
        () => {

            setExportCategory(
                "filtered"
            );

            setExportDateType(
                "current"
            );

            setExportSpecificDate(
                selectedDate || ""
            );

            setExportStartDate(
                startDate || ""
            );

            setExportEndDate(
                endDate || ""
            );

            setExportFormat(
                "excel"
            );

            setExportOpen(true);
        };


    const closeExport =
        () => {

            if (exporting) {
                return;
            }

            setExportOpen(false);
        };


    // =================================================
    // EXPORT CATEGORY
    // =================================================

    const getExportCategoryData =
        useCallback(
            () => {

                let data = [
                    ...attendance,
                ];


                switch (
                    exportCategory
                ) {

                    case "employees":

                        data =
                            data.filter(
                                (item) =>
                                    item.attendanceType ===
                                    "EMPLOYEE"
                            );

                        break;


                    case "hr":

                        data =
                            data.filter(
                                (item) =>
                                    item.attendanceType ===
                                    "HR"
                            );

                        break;


                    case "present":

                        data =
                            data.filter(
                                (item) =>
                                    String(
                                        item.status ||
                                        ""
                                    ).toLowerCase() ===
                                    "present"
                            );

                        break;


                    case "absent":

                        data =
                            data.filter(
                                (item) =>
                                    String(
                                        item.status ||
                                        ""
                                    ).toLowerCase() ===
                                    "absent"
                            );

                        break;


                    case "working":

                        data =
                            data.filter(
                                (item) =>
                                    item.currentWorkState ===
                                    "WORKING"
                            );

                        break;


                    case "completed":

                        data =
                            data.filter(
                                (item) =>
                                    String(
                                        item.status ||
                                        ""
                                    ).toLowerCase() ===
                                    "completed"
                            );

                        break;


                    case "filtered":

                    default:

                        break;
                }


                // -------------------------------------
                // EXPORT DATE FILTER
                // -------------------------------------

                if (
                    exportDateType ===
                    "specific" &&
                    exportSpecificDate
                ) {

                    data =
                        data.filter(
                            (item) => {

                                const itemDate =
                                    formatDateForFile(
                                        item.date
                                    );

                                return (
                                    itemDate ===
                                    exportSpecificDate
                                );
                            }
                        );
                }


                if (
                    exportDateType ===
                    "range"
                ) {

                    if (
                        exportStartDate
                    ) {

                        data =
                            data.filter(
                                (item) =>
                                    formatDateForFile(
                                        item.date
                                    ) >=
                                    exportStartDate
                            );
                    }


                    if (
                        exportEndDate
                    ) {

                        data =
                            data.filter(
                                (item) =>
                                    formatDateForFile(
                                        item.date
                                    ) <=
                                    exportEndDate
                            );
                    }
                }


                return data;

            },
            [
                attendance,
                exportCategory,
                exportDateType,
                exportSpecificDate,
                exportStartDate,
                exportEndDate,
            ]
        );


    const exportPreviewData =
        useMemo(
            () =>
                getExportCategoryData(),
            [
                getExportCategoryData,
            ]
        );


    // =================================================
    // EXPORT NAME
    // =================================================

    const getExportCategoryLabel =
        () => {

            switch (
                exportCategory
            ) {

                case "employees":
                    return "Employees";

                case "hr":
                    return "HR";

                case "present":
                    return "Present";

                case "absent":
                    return "Absent";

                case "working":
                    return "Working";

                case "completed":
                    return "Completed";

                default:
                    return "Attendance";
            }
        };


    const getExportDateLabel =
        () => {

            if (
                exportDateType ===
                "specific"
            ) {

                return (
                    exportSpecificDate ||
                    "Selected-Date"
                );
            }


            if (
                exportDateType ===
                "range"
            ) {

                return `${exportStartDate || "Start"}-to-${exportEndDate || "End"}`;
            }


            if (
                selectedDate
            ) {

                return selectedDate;
            }


            if (
                startDate ||
                endDate
            ) {

                return `${startDate || "Start"}-to-${endDate || "End"}`;
            }


            return "Current";
        };


    // =================================================
    // EXPORT ROWS
    // =================================================

    const createExportRows =
        (data) => {

            return data.map(
                (item) => {

                    const lunchMinutes =
                        item.lunch?.totalMinutes ||
                        item.totalLunchMinutes ||
                        0;


                    return {

                        Type:
                            item.attendanceType ===
                            "HR"
                                ? "HR"
                                : "Employee",

                        Name:
                            getName(item),

                        "Employee ID":
                            getEmployeeId(item),

                        Email:
                            getEmail(item),

                        Department:
                            getDepartment(item),

                        Date:
                            formatDate(item.date),

                        "Punch In":
                            formatTime(
                                item.punchIn
                            ),

                        "Punch Out":
                            formatTime(
                                item.punchOut
                            ),

                        "Break":
                            formatMinutes(
                                item.totalBreakMinutes
                            ),

                        "Lunch":
                            formatMinutes(
                                lunchMinutes
                            ),

                        "Working Time":
                            formatDuration(
                                item.liveWorkingSeconds
                            ),

                        State:
                            getStateLabel(
                                item.currentWorkState
                            ),

                        Status:
                            item.status ||
                            "-",
                    };
                }
            );
        };


    // =================================================
    // CSV EXPORT
    // =================================================

    const exportCSV =
        (data) => {

            const rows =
                createExportRows(
                    data
                );


            const headers = [
                "Type",
                "Name",
                "Employee ID",
                "Email",
                "Department",
                "Date",
                "Punch In",
                "Punch Out",
                "Break",
                "Lunch",
                "Working Time",
                "State",
                "Status",
            ];


            const csvRows = [
                headers,
                ...rows.map(
                    (row) =>
                        headers.map(
                            (header) =>
                                row[header]
                        )
                ),
            ];


            const csv =
                csvRows
                    .map(
                        (row) =>
                            row
                                .map(
                                    (value) =>
                                        `"${String(
                                            value ??
                                            ""
                                        ).replace(
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
                        "\ufeff",
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


            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                `attendance-${getExportCategoryLabel()}-${getExportDateLabel()}.csv`
                    .replace(
                        /\s+/g,
                        "-"
                    )
                    .toLowerCase();

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            URL.revokeObjectURL(
                url
            );
        };


    // =================================================
    // EXCEL EXPORT
    // =================================================

    const exportExcel =
        (data) => {

            const rows =
                createExportRows(
                    data
                );


            const worksheet =
                XLSX.utils.json_to_sheet(
                    rows
                );


            worksheet["!cols"] = [
                { wch: 12 },
                { wch: 24 },
                { wch: 16 },
                { wch: 30 },
                { wch: 20 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 14 },
                { wch: 14 },
                { wch: 18 },
                { wch: 16 },
                { wch: 14 },
            ];


            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Attendance"
            );


            // Summary sheet
            const summaryRows = [
                {
                    "Report":
                        "Super Admin Attendance Report",
                },
                {
                    "Category":
                        getExportCategoryLabel(),
                },
                {
                    "Date":
                        getExportDateLabel(),
                },
                {
                    "Total Records":
                        data.length,
                },
                {
                    "Generated":
                        new Date().toLocaleString(
                            "en-IN"
                        ),
                },
            ];


            const summarySheet =
                XLSX.utils.json_to_sheet(
                    summaryRows
                );


            summarySheet["!cols"] = [
                { wch: 25 },
                { wch: 40 },
            ];


            XLSX.utils.book_append_sheet(
                workbook,
                summarySheet,
                "Report Info"
            );


            XLSX.writeFile(
                workbook,
                `attendance-${getExportCategoryLabel()}-${getExportDateLabel()}`
                    .replace(
                        /\s+/g,
                        "-"
                    )
                    .toLowerCase() +
                    ".xlsx"
            );
        };


    // =================================================
    // PDF EXPORT
    // =================================================

    const exportPDF =
        (data) => {

            const doc =
                new jsPDF({
                    orientation:
                        "landscape",
                    unit:
                        "mm",
                    format:
                        "a4",
                });


            const category =
                getExportCategoryLabel();

            const dateLabel =
                getExportDateLabel();


            // -----------------------------------------
            // TITLE
            // -----------------------------------------

            doc.setFontSize(
                18
            );

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "HRMS Attendance Report",
                14,
                15
            );


            doc.setFontSize(
                9
            );

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Category: ${category}`,
                14,
                22
            );


            doc.text(
                `Date: ${dateLabel}`,
                14,
                27
            );


            doc.text(
                `Total Records: ${data.length}`,
                14,
                32
            );


            doc.text(
                `Generated: ${new Date().toLocaleString("en-IN")}`,
                220,
                15
            );


            // -----------------------------------------
            // TABLE
            // -----------------------------------------

            const rows =
                data.map(
                    (item) => [

                        item.attendanceType ===
                        "HR"
                            ? "HR"
                            : "Employee",

                        getName(item),

                        getEmployeeId(item),

                        getDepartment(item),

                        formatDate(
                            item.date
                        ),

                        formatTime(
                            item.punchIn
                        ),

                        formatTime(
                            item.punchOut
                        ),

                        formatMinutes(
                            item.totalBreakMinutes
                        ),

                        formatMinutes(
                            item.lunch?.totalMinutes ||
                            item.totalLunchMinutes ||
                            0
                        ),

                        formatDuration(
                            item.liveWorkingSeconds
                        ),

                        getStateLabel(
                            item.currentWorkState
                        ),

                        item.status ||
                            "-",
                    ]
                );


            autoTable(
                doc,
                {
                    startY: 38,

                    head: [[
                        "Type",
                        "Name",
                        "ID",
                        "Department",
                        "Date",
                        "Punch In",
                        "Punch Out",
                        "Break",
                        "Lunch",
                        "Working",
                        "State",
                        "Status",
                    ]],

                    body: rows,

                    theme:
                        "grid",

                    styles: {
                        font:
                            "helvetica",
                        fontSize:
                            7,
                        cellPadding:
                            2,
                    },

                    headStyles: {
                        fontSize:
                            7,
                        fontStyle:
                            "bold",
                    },

                    alternateRowStyles: {
                        fillColor:
                            [
                                247,
                                249,
                                252,
                            ],
                    },

                    margin: {
                        left:
                            10,
                        right:
                            10,
                    },

                    didDrawPage:
                        (data) => {

                            const page =
                                doc.internal.getNumberOfPages();

                            doc.setFontSize(
                                7
                            );

                            doc.text(
                                `Page ${page}`,
                                270,
                                200
                            );
                        },
                }
            );


            doc.save(
                `attendance-${category}-${dateLabel}`
                    .replace(
                        /\s+/g,
                        "-"
                    )
                    .toLowerCase() +
                    ".pdf"
            );
        };


    // =================================================
    // START EXPORT
    // =================================================

    const handleExport =
        async () => {

            const data =
                exportPreviewData;


            if (
                !data.length
            ) {

                return;
            }


            try {

                setExporting(
                    true
                );


                // Small delay gives UI time
                // to show exporting state.
                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            250
                        )
                );


                if (
                    exportFormat ===
                    "csv"
                ) {

                    exportCSV(
                        data
                    );
                }


                if (
                    exportFormat ===
                    "excel"
                ) {

                    exportExcel(
                        data
                    );
                }


                if (
                    exportFormat ===
                    "pdf"
                ) {

                    exportPDF(
                        data
                    );
                }


                setExportOpen(
                    false
                );

            } catch (err) {

                console.error(
                    "EXPORT ERROR:",
                    err
                );

                alert(
                    "Unable to generate export file."
                );

            } finally {

                setExporting(
                    false
                );
            }
        };


    // =================================================
    // SUMMARY
    // =================================================

    const overall =
        summary?.overall || {};

    const employees =
        summary?.employees || {};

    const hr =
        summary?.hr || {};


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="superadmin-attendance-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="superadmin-attendance-header">

                <div className="attendance-title-row">

                    <div className="attendance-title-icon">

                        <Clock3 size={23} />

                    </div>

                    <div>

                        <h1>
                            Attendance
                        </h1>

                        <p>
                            Monitor employee and HR attendance
                        </p>

                    </div>

                </div>


                <div className="attendance-header-actions">

                    <button
                        type="button"
                        className="attendance-refresh-button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="attendance-export-button"
                        onClick={
                            openExport
                        }
                        disabled={
                            !attendance.length
                        }
                    >

                        <Download size={17} />

                        Export

                    </button>

                </div>

            </div>


            {/* =========================================
                SUMMARY
            ========================================= */}

            <div className="attendance-summary-grid">

                <div className="attendance-summary-card overall">

                    <div className="summary-card-top">

                        <div className="summary-card-icon">
                            <Users size={21} />
                        </div>

                        <span>
                            Overall
                        </span>

                    </div>

                    <div className="summary-card-value">

                        {summaryLoading
                            ? "—"
                            : overall.total || 0}

                    </div>

                    <div className="summary-card-meta">

                        <span>
                            {overall.present || 0} present
                        </span>

                        <span>
                            {overall.absent || 0} absent
                        </span>

                    </div>

                </div>


                <div className="attendance-summary-card present">

                    <div className="summary-card-top">

                        <div className="summary-card-icon">
                            <UserCheck size={21} />
                        </div>

                        <span>
                            Present
                        </span>

                    </div>

                    <div className="summary-card-value">

                        {summaryLoading
                            ? "—"
                            : overall.present || 0}

                    </div>

                    <div className="summary-card-meta">

                        <span>
                            Currently working
                        </span>

                        <strong>
                            {overall.working || 0}
                        </strong>

                    </div>

                </div>


                <div className="attendance-summary-card employees">

                    <div className="summary-card-top">

                        <div className="summary-card-icon">
                            <BriefcaseBusiness size={21} />
                        </div>

                        <span>
                            Employees
                        </span>

                    </div>

                    <div className="summary-card-value">

                        {summaryLoading
                            ? "—"
                            : employees.total || 0}

                    </div>

                    <div className="summary-card-meta">

                        <span>
                            {employees.present || 0} present
                        </span>

                        <span>
                            {employees.absent || 0} absent
                        </span>

                    </div>

                </div>


                <div className="attendance-summary-card hr">

                    <div className="summary-card-top">

                        <div className="summary-card-icon">
                            <UserRound size={21} />
                        </div>

                        <span>
                            HR
                        </span>

                    </div>

                    <div className="summary-card-value">

                        {summaryLoading
                            ? "—"
                            : hr.total || 0}

                    </div>

                    <div className="summary-card-meta">

                        <span>
                            {hr.present || 0} present
                        </span>

                        <span>
                            {hr.absent || 0} absent
                        </span>

                    </div>

                </div>

            </div>


            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="attendance-filter-panel">

                <div className="attendance-filter-title">

                    <Filter size={17} />

                    <span>
                        Attendance Filters
                    </span>

                </div>


                <div className="attendance-filter-grid">

                    <div className="attendance-filter-field search-field">

                        <label>
                            Search
                        </label>

                        <div className="attendance-input-wrapper">

                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Name, ID or email..."
                                value={
                                    search
                                }
                                onChange={
                                    (e) =>
                                        setSearch(
                                            e.target.value
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
                                    <X size={15} />
                                </button>

                            )}

                        </div>

                    </div>


                    <div className="attendance-filter-field">

                        <label>
                            Specific Date
                        </label>

                        <div className="attendance-date-wrapper">

                            <CalendarDays size={16} />

                            <input
                                type="date"
                                value={
                                    selectedDate
                                }
                                onChange={
                                    (e) => {

                                        setSelectedDate(
                                            e.target.value
                                        );

                                        if (
                                            e.target.value
                                        ) {

                                            setStartDate(
                                                ""
                                            );

                                            setEndDate(
                                                ""
                                            );
                                        }
                                    }
                                }
                            />

                        </div>

                    </div>


                    <div className="attendance-filter-field">

                        <label>
                            From
                        </label>

                        <input
                            className="attendance-date-input"
                            type="date"
                            value={
                                startDate
                            }
                            onChange={
                                (e) => {

                                    setStartDate(
                                        e.target.value
                                    );

                                    setSelectedDate(
                                        ""
                                    );
                                }
                            }
                        />

                    </div>


                    <div className="attendance-filter-field">

                        <label>
                            To
                        </label>

                        <input
                            className="attendance-date-input"
                            type="date"
                            value={
                                endDate
                            }
                            onChange={
                                (e) => {

                                    setEndDate(
                                        e.target.value
                                    );

                                    setSelectedDate(
                                        ""
                                    );
                                }
                            }
                        />

                    </div>


                    <div className="attendance-filter-field">

                        <label>
                            Department
                        </label>

                        <select
                            value={
                                department
                            }
                            onChange={
                                (e) =>
                                    setDepartment(
                                        e.target.value
                                    )
                            }
                        >

                            <option value="">
                                All Departments
                            </option>

                            {departments.map(
                                (item) => (

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


                    <div className="attendance-filter-field">

                        <label>
                            Status
                        </label>

                        <select
                            value={
                                status
                            }
                            onChange={
                                (e) =>
                                    setStatus(
                                        e.target.value
                                    )
                            }
                        >

                            <option value="">
                                All Status
                            </option>

                            <option value="Present">
                                Present
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Absent">
                                Absent
                            </option>

                            <option value="Half Day">
                                Half Day
                            </option>

                            <option value="Leave">
                                Leave
                            </option>

                        </select>

                    </div>

                </div>


                <div className="attendance-filter-footer">

                    <div className="attendance-result-count">

                        <Activity size={15} />

                        {attendance.length} records found

                    </div>


                    <button
                        type="button"
                        className="clear-filters-button"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear Filters
                    </button>

                </div>

            </div>


            {/* =========================================
                TABS
            ========================================= */}

            <div className="attendance-tabs-container">

                <div className="attendance-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "all"
                            )
                        }
                    >

                        <Users size={17} />

                        All

                        <span>
                            {overall.total || 0}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab ===
                            "employee"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "employee"
                            )
                        }
                    >

                        <BriefcaseBusiness
                            size={17}
                        />

                        Employees

                        <span>
                            {employees.total || 0}
                        </span>

                    </button>


                    <button
                        type="button"
                        className={
                            activeTab ===
                            "hr"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "hr"
                            )
                        }
                    >

                        <UserRound size={17} />

                        HR

                        <span>
                            {hr.total || 0}
                        </span>

                    </button>

                </div>

            </div>


            {/* =========================================
                TABLE
            ========================================= */}

            <div className="attendance-table-card">

                <div className="attendance-table-header">

                    <div>

                        <h2>
                            Attendance Records
                        </h2>

                        <p>
                            Employee and HR attendance activity
                        </p>

                    </div>

                    <div className="table-live-indicator">

                        <span></span>

                        Live data

                    </div>

                </div>


                {loading ? (

                    <div className="attendance-loading">

                        <Loader2
                            size={30}
                            className="spin"
                        />

                        <span>
                            Loading attendance...
                        </span>

                    </div>

                ) : error ? (

                    <div className="attendance-error">

                        <Activity size={30} />

                        <h3>
                            Unable to load attendance
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                loadAttendance()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                ) : attendance.length === 0 ? (

                    <div className="attendance-empty">

                        <Clock3 size={42} />

                        <h3>
                            No attendance records
                        </h3>

                        <p>
                            No records match your current filters.
                        </p>

                    </div>

                ) : (

                    <div className="attendance-table-scroll">

                        <table className="attendance-table">

                            <thead>

                                <tr>

                                    <th>
                                        Person
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Department
                                    </th>

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
                                        Break
                                    </th>

                                    <th>
                                        Lunch
                                    </th>

                                    <th>
                                        Working Time
                                    </th>

                                    <th>
                                        State
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

                                {attendance.map(
                                    (item) => {

                                        const name =
                                            getName(
                                                item
                                            );

                                        const image =
                                            getProfileImage(
                                                item
                                            );

                                        const state =
                                            item.currentWorkState ||
                                            "NOT_STARTED";


                                        return (

                                            <tr
                                                key={
                                                    item._id
                                                }
                                            >

                                                <td>

                                                    <div className="attendance-person">

                                                        {image ? (

                                                            <img
                                                                src={
                                                                    image
                                                                }
                                                                alt={
                                                                    name
                                                                }
                                                            />

                                                        ) : (

                                                            <div className="attendance-avatar-placeholder">

                                                                <UserRound
                                                                    size={18}
                                                                />

                                                            </div>

                                                        )}


                                                        <div>

                                                            <strong>
                                                                {name}
                                                            </strong>

                                                            <span>
                                                                {getEmployeeId(
                                                                    item
                                                                )}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `person-type ${
                                                                item.attendanceType ===
                                                                "HR"
                                                                    ? "hr"
                                                                    : "employee"
                                                            }`
                                                        }
                                                    >

                                                        {item.attendanceType ===
                                                        "HR"
                                                            ? "HR"
                                                            : "Employee"}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="department-text">

                                                        {getDepartment(
                                                            item
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="date-text">

                                                        {formatDate(
                                                            item.date
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="time-cell">

                                                        <LogIn
                                                            size={14}
                                                        />

                                                        {formatTime(
                                                            item.punchIn
                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="time-cell">

                                                        <LogOut
                                                            size={14}
                                                        />

                                                        {formatTime(
                                                            item.punchOut
                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="duration-cell">

                                                        <Coffee
                                                            size={14}
                                                        />

                                                        {formatMinutes(
                                                            item.totalBreakMinutes
                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="duration-cell">

                                                        <Utensils
                                                            size={14}
                                                        />

                                                        {formatMinutes(
                                                            item.lunch?.totalMinutes ||
                                                            item.totalLunchMinutes ||
                                                            0
                                                        )}

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="working-time">

                                                        <Clock3
                                                            size={14}
                                                        />

                                                        <strong>
                                                            {formatDuration(
                                                                item.liveWorkingSeconds
                                                            )}
                                                        </strong>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `state-badge ${getStateClass(
                                                                state
                                                            )}`
                                                        }
                                                    >

                                                        <span className="state-dot"></span>

                                                        {getStateLabel(
                                                            state
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `attendance-status ${String(
                                                                item.status ||
                                                                ""
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )}`
                                                        }
                                                    >
                                                        {item.status ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="view-attendance-button"
                                                        onClick={() =>
                                                            openDetails(
                                                                item
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

                )}

            </div>


            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            {modalOpen &&
                selectedAttendance && (

                    <div
                        className="attendance-modal-overlay"
                        onMouseDown={
                            (e) => {

                                if (
                                    e.target ===
                                    e.currentTarget
                                ) {
                                    closeModal();
                                }
                            }
                        }
                    >

                        <div className="attendance-details-modal">

                            <div className="attendance-modal-header">

                                <div className="modal-person">

                                    {getProfileImage(
                                        selectedAttendance
                                    ) ? (

                                        <img
                                            src={
                                                getProfileImage(
                                                    selectedAttendance
                                                )
                                            }
                                            alt={
                                                getName(
                                                    selectedAttendance
                                                )
                                            }
                                        />

                                    ) : (

                                        <div className="modal-avatar-placeholder">

                                            <UserRound
                                                size={24}
                                            />

                                        </div>

                                    )}


                                    <div>

                                        <h2>
                                            {getName(
                                                selectedAttendance
                                            )}
                                        </h2>

                                        <p>
                                            {getEmail(
                                                selectedAttendance
                                            )}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="modal-close-button"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </div>


                            <div className="modal-person-meta">

                                <span
                                    className={
                                        `person-type ${
                                            selectedAttendance.attendanceType ===
                                            "HR"
                                                ? "hr"
                                                : "employee"
                                        }`
                                    }
                                >
                                    {
                                        selectedAttendance.attendanceType ===
                                        "HR"
                                            ? "HR"
                                            : "Employee"
                                    }
                                </span>

                                <span>
                                    {getEmployeeId(
                                        selectedAttendance
                                    )}
                                </span>

                                <span>
                                    {getDepartment(
                                        selectedAttendance
                                    )}
                                </span>

                                <span>
                                    {formatDate(
                                        selectedAttendance.date
                                    )}
                                </span>

                            </div>


                            <div className="modal-current-state">

                                <div>

                                    <span>
                                        Current State
                                    </span>

                                    <strong>
                                        {getStateLabel(
                                            selectedAttendance.currentWorkState
                                        )}
                                    </strong>

                                </div>

                                <span
                                    className={
                                        `state-badge ${getStateClass(
                                            selectedAttendance.currentWorkState
                                        )}`
                                    }
                                >

                                    <span className="state-dot"></span>

                                    {getStateLabel(
                                        selectedAttendance.currentWorkState
                                    )}

                                </span>

                            </div>


                            <div className="modal-time-grid">

                                <div className="modal-time-card">

                                    <div className="modal-time-icon">
                                        <LogIn size={17} />
                                    </div>

                                    <span>
                                        Punch In
                                    </span>

                                    <strong>
                                        {formatTime(
                                            selectedAttendance.punchIn
                                        )}
                                    </strong>

                                </div>


                                <div className="modal-time-card">

                                    <div className="modal-time-icon">
                                        <LogOut size={17} />
                                    </div>

                                    <span>
                                        Punch Out
                                    </span>

                                    <strong>
                                        {formatTime(
                                            selectedAttendance.punchOut
                                        )}
                                    </strong>

                                </div>


                                <div className="modal-time-card">

                                    <div className="modal-time-icon">
                                        <Coffee size={17} />
                                    </div>

                                    <span>
                                        Break
                                    </span>

                                    <strong>
                                        {formatMinutes(
                                            selectedAttendance.totalBreakMinutes
                                        )}
                                    </strong>

                                </div>


                                <div className="modal-time-card">

                                    <div className="modal-time-icon">
                                        <Utensils size={17} />
                                    </div>

                                    <span>
                                        Lunch
                                    </span>

                                    <strong>
                                        {formatMinutes(
                                            selectedAttendance.lunch?.totalMinutes ||
                                            selectedAttendance.totalLunchMinutes ||
                                            0
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div className="modal-working-card">

                                <div className="modal-working-left">

                                    <div className="modal-working-icon">
                                        <Clock3 size={20} />
                                    </div>

                                    <div>

                                        <span>
                                            Total Working Time
                                        </span>

                                        <strong>
                                            {formatDuration(
                                                selectedAttendance.liveWorkingSeconds
                                            )}
                                        </strong>

                                    </div>

                                </div>

                                <CheckCircle2
                                    size={22}
                                />

                            </div>


                            <div className="modal-section">

                                <div className="modal-section-title">

                                    <Coffee size={16} />

                                    Break Details

                                </div>


                                {selectedAttendance.breaks?.length ? (

                                    <div className="break-list">

                                        {selectedAttendance.breaks.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    className="break-item"
                                                    key={
                                                        item._id ||
                                                        index
                                                    }
                                                >

                                                    <div>

                                                        <span>
                                                            Break {index + 1}
                                                        </span>

                                                        <strong>
                                                            {formatTime(
                                                                item.start
                                                            )}
                                                            {" "}
                                                            —
                                                            {" "}
                                                            {formatTime(
                                                                item.end
                                                            )}
                                                        </strong>

                                                    </div>

                                                    <b>
                                                        {formatMinutes(
                                                            item.durationMinutes
                                                        )}
                                                    </b>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <p className="modal-empty-text">
                                        No breaks recorded.
                                    </p>

                                )}

                            </div>


                            <div className="modal-section">

                                <div className="modal-section-title">

                                    <Utensils size={16} />

                                    Lunch Details

                                </div>


                                <div className="lunch-detail-row">

                                    <div>

                                        <span>
                                            Start
                                        </span>

                                        <strong>
                                            {formatTime(
                                                selectedAttendance.lunch?.start
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            End
                                        </span>

                                        <strong>
                                            {formatTime(
                                                selectedAttendance.lunch?.end
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {formatMinutes(
                                                selectedAttendance.lunch?.totalMinutes ||
                                                selectedAttendance.totalLunchMinutes ||
                                                0
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}


            {/* =====================================================
                EXPORT CENTER
            ===================================================== */}

            {exportOpen && (

                <div
                    className="export-modal-overlay"
                    onMouseDown={
                        (e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                closeExport();
                            }
                        }
                    }
                >

                    <div className="export-modal">

                        {/* HEADER */}

                        <div className="export-modal-header">

                            <div className="export-modal-title">

                                <div className="export-modal-icon">

                                    <FileDown
                                        size={21}
                                    />

                                </div>

                                <div>

                                    <h2>
                                        Export Attendance
                                    </h2>

                                    <p>
                                        Choose what data and format to download
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="export-close-button"
                                onClick={
                                    closeExport
                                }
                                disabled={
                                    exporting
                                }
                            >
                                <X size={19} />
                            </button>

                        </div>


                        {/* BODY */}

                        <div className="export-modal-body">

                            {/* CATEGORY */}

                            <div className="export-section">

                                <div className="export-section-heading">

                                    <span className="export-step">
                                        01
                                    </span>

                                    <div>

                                        <strong>
                                            Data Category
                                        </strong>

                                        <span>
                                            Select which attendance records to include
                                        </span>

                                    </div>

                                </div>


                                <div className="export-category-grid">

                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "filtered"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "filtered"
                                            )
                                        }
                                    >

                                        <Users size={19} />

                                        <strong>
                                            Current Records
                                        </strong>

                                        <span>
                                            Use current filters
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "employees"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "employees"
                                            )
                                        }
                                    >

                                        <BriefcaseBusiness size={19} />

                                        <strong>
                                            Employees
                                        </strong>

                                        <span>
                                            Employee attendance
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "hr"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "hr"
                                            )
                                        }
                                    >

                                        <UserRound size={19} />

                                        <strong>
                                            HR
                                        </strong>

                                        <span>
                                            HR attendance
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "present"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "present"
                                            )
                                        }
                                    >

                                        <UserCheck size={19} />

                                        <strong>
                                            Present
                                        </strong>

                                        <span>
                                            Present records
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "absent"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "absent"
                                            )
                                        }
                                    >

                                        <CalendarDays size={19} />

                                        <strong>
                                            Absent
                                        </strong>

                                        <span>
                                            Absent records
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "working"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "working"
                                            )
                                        }
                                    >

                                        <Activity size={19} />

                                        <strong>
                                            Working
                                        </strong>

                                        <span>
                                            Currently working
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-category-card ${
                                                exportCategory ===
                                                "completed"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportCategory(
                                                "completed"
                                            )
                                        }
                                    >

                                        <CheckCircle2 size={19} />

                                        <strong>
                                            Completed
                                        </strong>

                                        <span>
                                            Completed records
                                        </span>

                                    </button>

                                </div>

                            </div>


                            {/* DATE */}

                            <div className="export-section">

                                <div className="export-section-heading">

                                    <span className="export-step">
                                        02
                                    </span>

                                    <div>

                                        <strong>
                                            Date
                                        </strong>

                                        <span>
                                            Choose the attendance period
                                        </span>

                                    </div>

                                </div>


                                <div className="export-date-options">

                                    <button
                                        type="button"
                                        className={
                                            `export-date-option ${
                                                exportDateType ===
                                                "current"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportDateType(
                                                "current"
                                            )
                                        }
                                    >

                                        <span>
                                            Current Filter
                                        </span>

                                        <small>
                                            {selectedDate ||
                                                startDate ||
                                                endDate
                                                ? "Use current page date"
                                                : "All currently loaded dates"}
                                        </small>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-date-option ${
                                                exportDateType ===
                                                "specific"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportDateType(
                                                "specific"
                                            )
                                        }
                                    >

                                        <span>
                                            Specific Date
                                        </span>

                                        <small>
                                            Export one day
                                        </small>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-date-option ${
                                                exportDateType ===
                                                "range"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportDateType(
                                                "range"
                                            )
                                        }
                                    >

                                        <span>
                                            Date Range
                                        </span>

                                        <small>
                                            Export between dates
                                        </small>

                                    </button>

                                </div>


                                {exportDateType ===
                                    "specific" && (

                                    <div className="export-date-input-area">

                                        <CalendarDays
                                            size={17}
                                        />

                                        <input
                                            type="date"
                                            value={
                                                exportSpecificDate
                                            }
                                            onChange={
                                                (e) =>
                                                    setExportSpecificDate(
                                                        e.target.value
                                                    )
                                            }
                                        />

                                    </div>

                                )}


                                {exportDateType ===
                                    "range" && (

                                    <div className="export-range-grid">

                                        <div>

                                            <label>
                                                From
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    exportStartDate
                                                }
                                                onChange={
                                                    (e) =>
                                                        setExportStartDate(
                                                            e.target.value
                                                        )
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                To
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    exportEndDate
                                                }
                                                onChange={
                                                    (e) =>
                                                        setExportEndDate(
                                                            e.target.value
                                                        )
                                                }
                                            />

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* FORMAT */}

                            <div className="export-section">

                                <div className="export-section-heading">

                                    <span className="export-step">
                                        03
                                    </span>

                                    <div>

                                        <strong>
                                            File Format
                                        </strong>

                                        <span>
                                            Choose the file type for your report
                                        </span>

                                    </div>

                                </div>


                                <div className="export-format-grid">

                                    <button
                                        type="button"
                                        className={
                                            `export-format-card ${
                                                exportFormat ===
                                                "excel"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportFormat(
                                                "excel"
                                            )
                                        }
                                    >

                                        <div className="format-icon excel">

                                            <FileSpreadsheet
                                                size={24}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                Excel
                                            </strong>

                                            <span>
                                                .xlsx spreadsheet
                                            </span>

                                        </div>

                                        <span className="format-radio">
                                            {exportFormat ===
                                                "excel"
                                                ? "✓"
                                                : ""}
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-format-card ${
                                                exportFormat ===
                                                "pdf"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportFormat(
                                                "pdf"
                                            )
                                        }
                                    >

                                        <div className="format-icon pdf">

                                            <FileText
                                                size={24}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                PDF
                                            </strong>

                                            <span>
                                                Printable report
                                            </span>

                                        </div>

                                        <span className="format-radio">
                                            {exportFormat ===
                                                "pdf"
                                                ? "✓"
                                                : ""}
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            `export-format-card ${
                                                exportFormat ===
                                                "csv"
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            setExportFormat(
                                                "csv"
                                            )
                                        }
                                    >

                                        <div className="format-icon csv">

                                            <FileDown
                                                size={24}
                                            />

                                        </div>

                                        <div>

                                            <strong>
                                                CSV
                                            </strong>

                                            <span>
                                                .csv data file
                                            </span>

                                        </div>

                                        <span className="format-radio">
                                            {exportFormat ===
                                                "csv"
                                                ? "✓"
                                                : ""}
                                        </span>

                                    </button>

                                </div>

                            </div>


                            {/* PREVIEW */}

                            <div className="export-preview">

                                <div>

                                    <span>
                                        Records to export
                                    </span>

                                    <strong>
                                        {exportPreviewData.length}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {getExportCategoryLabel()}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {getExportDateLabel()}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Format
                                    </span>

                                    <strong>
                                        {exportFormat.toUpperCase()}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="export-modal-footer">

                            <button
                                type="button"
                                className="export-cancel-button"
                                onClick={
                                    closeExport
                                }
                                disabled={
                                    exporting
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="export-download-button"
                                onClick={
                                    handleExport
                                }
                                disabled={
                                    exporting ||
                                    !exportPreviewData.length
                                }
                            >

                                {exporting ? (

                                    <>
                                        <Loader2
                                            size={17}
                                            className="spin"
                                        />

                                        Generating...

                                    </>

                                ) : (

                                    <>
                                        <Download
                                            size={17}
                                        />

                                        Download{" "}
                                        {exportFormat.toUpperCase()}
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


export default SuperAdminAttendance;