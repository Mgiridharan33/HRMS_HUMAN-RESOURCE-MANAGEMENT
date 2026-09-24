import {
    CalendarCheck,
    Clock3,
    Coffee,
    Utensils,
    RefreshCw,
    Search,
    Users,
    Download,
    X,
    FileSpreadsheet,
    FileText,
    FileDown,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Loader2,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import api from "../../services/api";

import "./Attendance.css";


const HRAttendance = () => {

    /*
    =====================================================
    STATE
    =====================================================
    */

    const [attendance, setAttendance] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [date, setDate] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");


    /*
    =====================================================
    EXPORT STATE
    =====================================================
    */

    const [showExport, setShowExport] =
        useState(false);

    const [exportCategory, setExportCategory] =
        useState("All Employees");

    const [exportDateType, setExportDateType] =
        useState("Current Filter");

    const [exportSpecificDate, setExportSpecificDate] =
        useState("");

    const [exportFromDate, setExportFromDate] =
        useState("");

    const [exportToDate, setExportToDate] =
        useState("");

    const [exportFormat, setExportFormat] =
        useState("xlsx");

    const [exporting, setExporting] =
        useState(false);

    const [exportError, setExportError] =
        useState("");


    /*
    =====================================================
    FORMAT TIME
    =====================================================
    */

    const formatTime = (value) => {

        if (!value) {
            return "—";
        }

        const parsedDate =
            new Date(value);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }
        );
    };


    /*
    =====================================================
    FORMAT DATE
    =====================================================
    */

    const formatDate = (value) => {

        if (!value) {
            return "—";
        }

        const parsedDate =
            new Date(value);

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


    /*
    =====================================================
    FORMAT DURATION
    =====================================================
    */

    const formatDuration = (
        seconds,
        minutes
    ) => {

        if (
            Number(seconds) > 0
        ) {

            const safeSeconds =
                Number(seconds);

            const hours =
                Math.floor(
                    safeSeconds / 3600
                );

            const mins =
                Math.floor(
                    (
                        safeSeconds % 3600
                    ) / 60
                );

            return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
        }

        if (
            Number(minutes) > 0
        ) {

            const safeMinutes =
                Number(minutes);

            const hours =
                Math.floor(
                    safeMinutes / 60
                );

            const mins =
                safeMinutes % 60;

            return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
        }

        return "—";
    };


    /*
    =====================================================
    LOAD ATTENDANCE
    =====================================================
    */

    const loadAttendance = async (
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

            if (date) {
                params.date = date;
            }

            if (
                statusFilter !== "All"
            ) {
                params.status =
                    statusFilter;
            }

            const response =
                await api.get(
                    "/hr-attendance",
                    {
                        params,
                    }
                );

            if (
                response.data?.success
            ) {

                setAttendance(
                    response.data.attendance ||
                    []
                );

            } else {

                setAttendance([]);

                setError(
                    response.data?.message ||
                    "Failed to load attendance"
                );
            }

        } catch (error) {

            console.error(
                "HR ATTENDANCE ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load employee attendance"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    /*
    =====================================================
    INITIAL LOAD / FILTER LOAD
    =====================================================
    */

    useEffect(() => {

        loadAttendance();

    }, [
        date,
        statusFilter,
    ]);


    /*
    =====================================================
    SEARCH FILTER
    =====================================================
    */

    const filteredAttendance =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            if (!searchValue) {
                return attendance;
            }

            return attendance.filter(
                (record) => {

                    const employee =
                        record.employee || {};

                    const name =
                        employee.name ||
                        `${employee.firstName || ""} ${employee.lastName || ""}`;

                    return (
                        name
                            .toLowerCase()
                            .includes(searchValue) ||

                        String(
                            employee.employeeId ||
                            ""
                        )
                            .toLowerCase()
                            .includes(searchValue) ||

                        String(
                            employee.email ||
                            ""
                        )
                            .toLowerCase()
                            .includes(searchValue) ||

                        String(
                            employee.department ||
                            ""
                        )
                            .toLowerCase()
                            .includes(searchValue)
                    );
                }
            );

        }, [
            attendance,
            search,
        ]);


    /*
    =====================================================
    SUMMARY
    =====================================================
    */

    const summary =
        useMemo(() => {

            const present =
                attendance.filter(
                    item =>
                        item.status ===
                        "Present"
                ).length;

            const completed =
                attendance.filter(
                    item =>
                        item.status ===
                        "Completed"
                ).length;

            const absent =
                attendance.filter(
                    item =>
                        item.status ===
                        "Absent"
                ).length;

            const total =
                attendance.length;

            return {
                total,
                present,
                completed,
                absent,
            };

        }, [
            attendance,
        ]);


    /*
    =====================================================
    EXPORT CATEGORY OPTIONS
    =====================================================
    */

    const exportCategories = [
        {
            value: "All Employees",
            label: "All Employees",
            description:
                "Attendance records of all employees",
            icon: Users,
        },
        {
            value: "Present",
            label: "Present",
            description:
                "Employees marked as present",
            icon: CheckCircle2,
        },
        {
            value: "Completed",
            label: "Completed",
            description:
                "Completed attendance records",
            icon: Clock3,
        },
        {
            value: "Absent",
            label: "Absent",
            description:
                "Employees marked as absent",
            icon: Users,
        },
        {
            value: "Half Day",
            label: "Half Day",
            description:
                "Half-day attendance records",
            icon: CalendarCheck,
        },
        {
            value: "Leave",
            label: "Leave",
            description:
                "Attendance records marked as leave",
            icon: CalendarDays,
        },
    ];


    /*
    =====================================================
    EXPORT FORMAT OPTIONS
    =====================================================
    */

    const exportFormats = [
        {
            value: "xlsx",
            label: "Excel",
            extension: ".xlsx",
            description:
                "Best for editing and analysis",
            icon: FileSpreadsheet,
        },
        {
            value: "pdf",
            label: "PDF",
            extension: ".pdf",
            description:
                "Printable attendance report",
            icon: FileText,
        },
        {
            value: "csv",
            label: "CSV",
            extension: ".csv",
            description:
                "Lightweight spreadsheet data",
            icon: FileDown,
        },
    ];


    /*
    =====================================================
    OPEN EXPORT CENTER
    =====================================================
    */

    const openExportCenter = () => {

        setExportError("");

        setExportCategory(
            statusFilter !== "All"
                ? statusFilter
                : "All Employees"
        );

        setExportDateType(
            date
                ? "Current Filter"
                : "Current Filter"
        );

        setExportSpecificDate(
            date || ""
        );

        setExportFromDate("");

        setExportToDate("");

        setExportFormat("xlsx");

        setShowExport(true);
    };


    /*
    =====================================================
    CLOSE EXPORT CENTER
    =====================================================
    */

    const closeExportCenter = () => {

        if (exporting) {
            return;
        }

        setShowExport(false);

        setExportError("");
    };


    /*
    =====================================================
    GET EXPORT DATE PARAMETERS
    =====================================================
    */

    const getExportDateParams = () => {

        if (
            exportDateType ===
            "Specific Date"
        ) {

            return {
                date:
                    exportSpecificDate,
            };
        }

        if (
            exportDateType ===
            "Date Range"
        ) {

            return {
                fromDate:
                    exportFromDate,

                toDate:
                    exportToDate,
            };
        }

        if (
            exportDateType ===
            "Current Filter"
        ) {

            return {
                date,
            };
        }

        return {};
    };


    /*
    =====================================================
    EXPORT RECORD COUNT
    =====================================================
    */

    const exportRecordCount =
        useMemo(() => {

            let records =
                attendance;

            /*
            -------------------------------
            CATEGORY
            -------------------------------
            */

            if (
                exportCategory !==
                "All Employees"
            ) {

                records =
                    records.filter(
                        item =>
                            String(
                                item.status ||
                                ""
                            ).toLowerCase() ===
                            String(
                                exportCategory
                            ).toLowerCase()
                    );
            }

            /*
            -------------------------------
            SPECIFIC DATE
            -------------------------------
            */

            if (
                exportDateType ===
                "Specific Date" &&
                exportSpecificDate
            ) {

                records =
                    records.filter(
                        item => {

                            if (!item.date) {
                                return false;
                            }

                            const recordDate =
                                new Date(
                                    item.date
                                )
                                    .toISOString()
                                    .split("T")[0];

                            return (
                                recordDate ===
                                exportSpecificDate
                            );
                        }
                    );
            }

            /*
            -------------------------------
            DATE RANGE
            -------------------------------
            */

            if (
                exportDateType ===
                "Date Range" &&
                exportFromDate &&
                exportToDate
            ) {

                const from =
                    new Date(
                        `${exportFromDate}T00:00:00`
                    );

                const to =
                    new Date(
                        `${exportToDate}T23:59:59`
                    );

                records =
                    records.filter(
                        item => {

                            if (!item.date) {
                                return false;
                            }

                            const recordDate =
                                new Date(
                                    item.date
                                );

                            return (
                                recordDate >=
                                from &&
                                recordDate <=
                                to
                            );
                        }
                    );
            }

            return records.length;

        }, [
            attendance,
            exportCategory,
            exportDateType,
            exportSpecificDate,
            exportFromDate,
            exportToDate,
        ]);


    /*
    =====================================================
    VALIDATE EXPORT
    =====================================================
    */

    const validateExport = () => {

        if (
            exportDateType ===
            "Specific Date"
        ) {

            if (!exportSpecificDate) {

                setExportError(
                    "Please select a specific date."
                );

                return false;
            }
        }

        if (
            exportDateType ===
            "Date Range"
        ) {

            if (
                !exportFromDate ||
                !exportToDate
            ) {

                setExportError(
                    "Please select both From Date and To Date."
                );

                return false;
            }

            if (
                exportFromDate >
                exportToDate
            ) {

                setExportError(
                    "From Date cannot be later than To Date."
                );

                return false;
            }
        }

        setExportError("");

        return true;
    };


    /*
    =====================================================
    DOWNLOAD ATTENDANCE
    =====================================================
    */

    const downloadAttendance = async () => {

        if (!validateExport()) {
            return;
        }

        try {

            setExporting(true);

            setExportError("");

            const dateParams =
                getExportDateParams();

            const params = {
                ...dateParams,
                status:
                    exportCategory ===
                    "All Employees"
                        ? "All"
                        : exportCategory,
                format:
                    exportFormat,
            };


            /*
            ---------------------------------------------
            REQUEST FILE FROM BACKEND
            ---------------------------------------------
            */

            const response =
                await api.get(
                    "/hr-attendance/download",
                    {
                        params,
                        responseType: "blob",
                    }
                );


            /*
            ---------------------------------------------
            GET FILE TYPE
            ---------------------------------------------
            */

            let extension =
                exportFormat;

            if (
                exportFormat ===
                "xlsx"
            ) {
                extension = "xlsx";
            }

            if (
                exportFormat ===
                "pdf"
            ) {
                extension = "pdf";
            }

            if (
                exportFormat ===
                "csv"
            ) {
                extension = "csv";
            }


            /*
            ---------------------------------------------
            BUILD FILENAME
            ---------------------------------------------
            */

            const today =
                new Date();

            const stamp =
                today
                    .toISOString()
                    .split("T")[0];

            let dateLabel =
                "attendance";

            if (
                exportDateType ===
                "Specific Date" &&
                exportSpecificDate
            ) {

                dateLabel =
                    exportSpecificDate;
            }

            if (
                exportDateType ===
                "Date Range" &&
                exportFromDate &&
                exportToDate
            ) {

                dateLabel =
                    `${exportFromDate}_to_${exportToDate}`;
            }

            const safeCategory =
                exportCategory
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );

            const filename =
                `HR_Attendance_${safeCategory}_${dateLabel}_${stamp}.${extension}`;


            /*
            ---------------------------------------------
            CREATE DOWNLOAD URL
            ---------------------------------------------
            */

            const blob =
                new Blob(
                    [
                        response.data,
                    ],
                    {
                        type:
                            response.headers?.[
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

            link.href = url;

            link.download =
                filename;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );


            /*
            ---------------------------------------------
            CLOSE EXPORT CENTER
            ---------------------------------------------
            */

            setShowExport(false);

        } catch (error) {

            console.error(
                "HR ATTENDANCE DOWNLOAD ERROR:",
                error
            );

            /*
            ---------------------------------------------
            TRY TO READ BACKEND ERROR
            ---------------------------------------------
            */

            let message =
                "Failed to download attendance report.";

            try {

                if (
                    error.response?.data
                    instanceof Blob
                ) {

                    const text =
                        await error.response.data.text();

                    const parsed =
                        JSON.parse(text);

                    message =
                        parsed.message ||
                        message;
                } else {

                    message =
                        error.response?.data?.message ||
                        message;
                }

            } catch {
                // Keep default error
            }

            setExportError(
                message
            );

        } finally {

            setExporting(false);
        }
    };


    /*
    =====================================================
    SELECTED FORMAT
    =====================================================
    */

    const selectedFormat =
        exportFormats.find(
            item =>
                item.value ===
                exportFormat
        ) ||
        exportFormats[0];


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div className="hr-attendance-loading">

                <RefreshCw
                    size={22}
                    className="hr-attendance-spinner"
                />

                <span>
                    Loading employee attendance...
                </span>

            </div>

        );
    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="hr-attendance-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-attendance-header">

                <div>

                    <h1>
                        Employee Attendance
                    </h1>

                    <p>
                        View attendance records
                        of all employees.
                    </p>

                </div>


                <div className="hr-attendance-header-actions">

                    {/* REFRESH */}

                    <button
                        type="button"
                        className="hr-attendance-refresh"
                        onClick={() =>
                            loadAttendance(true)
                        }
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={18}
                            className={
                                refreshing
                                    ? "hr-attendance-spinner"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>


                    {/* DOWNLOAD */}

                    <button
                        type="button"
                        className="hr-attendance-download-btn"
                        onClick={
                            openExportCenter
                        }
                    >

                        <Download
                            size={18}
                        />

                        Download

                    </button>

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hr-attendance-summary">


                <div className="hr-summary-card">

                    <Users size={22} />

                    <div>

                        <span>
                            Total Records
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <CalendarCheck size={22} />

                    <div>

                        <span>
                            Present
                        </span>

                        <strong>
                            {summary.present}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <Clock3 size={22} />

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {summary.completed}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <Users size={22} />

                    <div>

                        <span>
                            Absent
                        </span>

                        <strong>
                            {summary.absent}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="hr-attendance-filter-card">


                <div className="hr-attendance-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search employee, ID, department..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="hr-attendance-filter">

                    <label>
                        Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            setDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="hr-attendance-filter">

                    <label>
                        Status
                    </label>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All
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


                <button
                    type="button"
                    className="hr-clear-filter"
                    onClick={() => {

                        setSearch("");
                        setDate("");
                        setStatusFilter("All");

                    }}
                >

                    Clear

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="hr-attendance-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadAttendance()
                        }
                    >

                        Try Again

                    </button>

                </div>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="hr-attendance-card">

                <div className="hr-attendance-card-header">

                    <div>

                        <h2>
                            Attendance Records
                        </h2>

                        <p>
                            {filteredAttendance.length}
                            {" "}
                            employee attendance
                            record
                            {filteredAttendance.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>

                </div>


                <div className="hr-attendance-table-wrapper">

                    <table className="hr-attendance-table">

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    ID
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
                                    Working Hours
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredAttendance.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="10"
                                        className="hr-attendance-empty"
                                    >

                                        No attendance
                                        records found.

                                    </td>

                                </tr>

                            ) : (

                                filteredAttendance.map(
                                    (record) => {

                                        const employee =
                                            record.employee ||
                                            {};

                                        const employeeName =
                                            employee.name ||
                                            `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                                            "Unknown Employee";

                                        const breakMinutes =
                                            Number(
                                                record.totalBreakMinutes
                                            ) ||
                                            (
                                                record.breaks?.reduce(
                                                    (
                                                        total,
                                                        item
                                                    ) =>
                                                        total +
                                                        (
                                                            Number(
                                                                item?.durationMinutes
                                                            ) || 0
                                                        ),
                                                    0
                                                ) || 0
                                            );

                                        const lunchMinutes =
                                            Number(
                                                record.lunch?.totalMinutes
                                            ) || 0;

                                        return (

                                            <tr
                                                key={
                                                    record._id
                                                }
                                            >

                                                {/* EMPLOYEE */}

                                                <td>

                                                    <div className="hr-employee-cell">

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

                                                            <div className="hr-employee-avatar">

                                                                {employeeName
                                                                    .charAt(0)
                                                                    .toUpperCase()}

                                                            </div>

                                                        )}

                                                        <div>

                                                            <strong>
                                                                {employeeName}
                                                            </strong>

                                                            <span>
                                                                {employee.email ||
                                                                    "—"}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* ID */}

                                                <td>

                                                    {employee.employeeId ||
                                                        employee._id ||
                                                        "—"}

                                                </td>


                                                {/* DEPARTMENT */}

                                                <td>

                                                    {employee.department ||
                                                        "—"}

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {formatDate(
                                                        record.date
                                                    )}

                                                </td>


                                                {/* PUNCH IN */}

                                                <td>

                                                    {formatTime(
                                                        record.punchIn
                                                    )}

                                                </td>


                                                {/* PUNCH OUT */}

                                                <td>

                                                    {formatTime(
                                                        record.punchOut
                                                    )}

                                                </td>


                                                {/* BREAK */}

                                                <td>

                                                    <div className="hr-time-cell">

                                                        <Coffee
                                                            size={15}
                                                        />

                                                        <span>
                                                            {breakMinutes > 0
                                                                ? `${breakMinutes} min`
                                                                : "—"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* LUNCH */}

                                                <td>

                                                    <div className="hr-time-cell">

                                                        <Utensils
                                                            size={15}
                                                        />

                                                        <span>
                                                            {lunchMinutes > 0
                                                                ? `${lunchMinutes} min`
                                                                : "—"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* WORKING */}

                                                <td>

                                                    <strong>
                                                        {formatDuration(
                                                            record.totalWorkingSeconds,
                                                            record.totalWorkingMinutes
                                                        )}
                                                    </strong>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`hr-status ${
                                                            String(
                                                                record.status ||
                                                                "Present"
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )
                                                        }`}
                                                    >

                                                        {record.status ||
                                                            "Present"}

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                EXPORT CENTER OVERLAY
            ================================================= */}

            {showExport && (

                <div
                    className="hr-export-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeExportCenter();
                        }

                    }}
                >

                    <div className="hr-export-modal">


                        {/* =================================================
                            EXPORT HEADER
                        ================================================= */}

                        <div className="hr-export-header">

                            <div className="hr-export-title">

                                <div className="hr-export-title-icon">

                                    <Download
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h2>
                                        Export Attendance
                                    </h2>

                                    <p>
                                        Choose what attendance
                                        data and format to
                                        download.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="hr-export-close"
                                onClick={
                                    closeExportCenter
                                }
                                disabled={exporting}
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        {/* =================================================
                            EXPORT BODY
                        ================================================= */}

                        <div className="hr-export-body">


                            {/* =================================================
                                01 DATA
                            ================================================= */}

                            <div className="hr-export-section">

                                <div className="hr-export-section-heading">

                                    <span>
                                        01
                                    </span>

                                    <div>

                                        <h3>
                                            Data
                                        </h3>

                                        <p>
                                            Select which
                                            attendance records
                                            to include.
                                        </p>

                                    </div>

                                </div>


                                <div className="hr-export-category-grid">

                                    {exportCategories.map(
                                        (category) => {

                                            const Icon =
                                                category.icon;

                                            const selected =
                                                exportCategory ===
                                                category.value;

                                            return (

                                                <button
                                                    type="button"
                                                    key={
                                                        category.value
                                                    }
                                                    className={`hr-export-category ${
                                                        selected
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setExportCategory(
                                                            category.value
                                                        )
                                                    }
                                                >

                                                    <div className="hr-export-option-icon">

                                                        <Icon
                                                            size={19}
                                                        />

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                category.label
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                category.description
                                                            }
                                                        </span>

                                                    </div>

                                                    {selected && (

                                                        <CheckCircle2
                                                            size={18}
                                                            className="hr-export-selected-icon"
                                                        />

                                                    )}

                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                02 DATE
                            ================================================= */}

                            <div className="hr-export-section">

                                <div className="hr-export-section-heading">

                                    <span>
                                        02
                                    </span>

                                    <div>

                                        <h3>
                                            Date
                                        </h3>

                                        <p>
                                            Choose the attendance
                                            period.
                                        </p>

                                    </div>

                                </div>


                                <div className="hr-export-date-types">


                                    {/* CURRENT FILTER */}

                                    <button
                                        type="button"
                                        className={`hr-export-date-option ${
                                            exportDateType ===
                                            "Current Filter"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setExportDateType(
                                                "Current Filter"
                                            )
                                        }
                                    >

                                        <CalendarDays
                                            size={19}
                                        />

                                        <div>

                                            <strong>
                                                Current Filter
                                            </strong>

                                            <span>
                                                Use the current
                                                table date filter
                                            </span>

                                        </div>

                                        {exportDateType ===
                                            "Current Filter" && (

                                            <CheckCircle2
                                                size={18}
                                            />

                                        )}

                                    </button>


                                    {/* SPECIFIC DATE */}

                                    <button
                                        type="button"
                                        className={`hr-export-date-option ${
                                            exportDateType ===
                                            "Specific Date"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setExportDateType(
                                                "Specific Date"
                                            )
                                        }
                                    >

                                        <CalendarCheck
                                            size={19}
                                        />

                                        <div>

                                            <strong>
                                                Specific Date
                                            </strong>

                                            <span>
                                                Download one
                                                attendance date
                                            </span>

                                        </div>

                                        {exportDateType ===
                                            "Specific Date" && (

                                            <CheckCircle2
                                                size={18}
                                            />

                                        )}

                                    </button>


                                    {/* DATE RANGE */}

                                    <button
                                        type="button"
                                        className={`hr-export-date-option ${
                                            exportDateType ===
                                            "Date Range"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setExportDateType(
                                                "Date Range"
                                            )
                                        }
                                    >

                                        <CalendarDays
                                            size={19}
                                        />

                                        <div>

                                            <strong>
                                                Date Range
                                            </strong>

                                            <span>
                                                From date to
                                                date
                                            </span>

                                        </div>

                                        {exportDateType ===
                                            "Date Range" && (

                                            <CheckCircle2
                                                size={18}
                                            />

                                        )}

                                    </button>

                                </div>


                                {/* SPECIFIC DATE INPUT */}

                                {exportDateType ===
                                    "Specific Date" && (

                                    <div className="hr-export-date-input">

                                        <label>
                                            Attendance Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                exportSpecificDate
                                            }
                                            onChange={(event) =>
                                                setExportSpecificDate(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>

                                )}


                                {/* DATE RANGE INPUT */}

                                {exportDateType ===
                                    "Date Range" && (

                                    <div className="hr-export-range-inputs">

                                        <div>

                                            <label>
                                                From Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    exportFromDate
                                                }
                                                onChange={(event) =>
                                                    setExportFromDate(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="hr-export-range-arrow">

                                            <ChevronRight
                                                size={20}
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                To Date
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    exportToDate
                                                }
                                                min={
                                                    exportFromDate ||
                                                    undefined
                                                }
                                                onChange={(event) =>
                                                    setExportToDate(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* =================================================
                                03 FORMAT
                            ================================================= */}

                            <div className="hr-export-section">

                                <div className="hr-export-section-heading">

                                    <span>
                                        03
                                    </span>

                                    <div>

                                        <h3>
                                            File Format
                                        </h3>

                                        <p>
                                            Choose the file type
                                            for your report.
                                        </p>

                                    </div>

                                </div>


                                <div className="hr-export-format-grid">

                                    {exportFormats.map(
                                        (format) => {

                                            const Icon =
                                                format.icon;

                                            const selected =
                                                exportFormat ===
                                                format.value;

                                            return (

                                                <button
                                                    type="button"
                                                    key={
                                                        format.value
                                                    }
                                                    className={`hr-export-format ${
                                                        selected
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setExportFormat(
                                                            format.value
                                                        )
                                                    }
                                                >

                                                    <div className="hr-export-format-icon">

                                                        <Icon
                                                            size={21}
                                                        />

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                format.label
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                format.extension
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                format.description
                                                            }
                                                        </small>

                                                    </div>

                                                    {selected && (

                                                        <CheckCircle2
                                                            size={18}
                                                        />

                                                    )}

                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                EXPORT PREVIEW
                            ================================================= */}

                            <div className="hr-export-preview">

                                <div className="hr-export-preview-header">

                                    <div>

                                        <span>
                                            EXPORT PREVIEW
                                        </span>

                                        <strong>
                                            Attendance Report
                                        </strong>

                                    </div>

                                    <FileSpreadsheet
                                        size={20}
                                    />

                                </div>


                                <div className="hr-export-preview-grid">

                                    <div>

                                        <span>
                                            Records
                                        </span>

                                        <strong>
                                            {exportRecordCount}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            {exportCategory}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Date
                                        </span>

                                        <strong>

                                            {exportDateType ===
                                                "Current Filter"
                                                ? (
                                                    date ||
                                                    "Current table filter"
                                                )
                                                : exportDateType ===
                                                    "Specific Date"
                                                    ? (
                                                        exportSpecificDate ||
                                                        "Select date"
                                                    )
                                                    : (
                                                        exportFromDate &&
                                                        exportToDate
                                                            ? `${exportFromDate} → ${exportToDate}`
                                                            : "Select range"
                                                    )}

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Format
                                        </span>

                                        <strong>
                                            {
                                                selectedFormat.label
                                            }
                                            {" "}
                                            {
                                                selectedFormat.extension
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                EXPORT ERROR
                            ================================================= */}

                            {exportError && (

                                <div className="hr-export-error">

                                    <span>
                                        {exportError}
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            EXPORT FOOTER
                        ================================================= */}

                        <div className="hr-export-footer">

                            <button
                                type="button"
                                className="hr-export-cancel"
                                onClick={
                                    closeExportCenter
                                }
                                disabled={exporting}
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="hr-export-download"
                                onClick={
                                    downloadAttendance
                                }
                                disabled={
                                    exporting
                                }
                            >

                                {exporting ? (

                                    <>

                                        <Loader2
                                            size={18}
                                            className="hr-attendance-spinner"
                                        />

                                        Preparing...

                                    </>

                                ) : (

                                    <>

                                        <Download
                                            size={18}
                                        />

                                        Download{" "}
                                        {
                                            selectedFormat.label
                                        }

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


export default HRAttendance;