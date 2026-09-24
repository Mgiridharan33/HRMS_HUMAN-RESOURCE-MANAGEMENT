import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Users,
    UserCheck,
    UserX,
    CalendarClock,
    TrendingUp,
    Clock3,
    RefreshCw,
    Coffee,
    Utensils,
    LogIn,
    LogOut,
} from "lucide-react";

import StatCard
    from "../../components/dashboard/StatCard";

import RecentEmployees
    from "../../components/dashboard/RecentEmployees";

import employeeApi
    from "../../services/employeeApi";

import api
    from "../../services/api";
    
import "./Dashboard.css";

const Dashboard = () => {

    /*
    =====================================================
    STATE
    =====================================================
    */

    const [employees, setEmployees] =
        useState([]);

    const [attendance, setAttendance] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [attendanceLoading, setAttendanceLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [attendanceError, setAttendanceError] =
        useState("");


    /*
    =====================================================
    GET TODAY DATE
    =====================================================
    */

    const getTodayDate = () => {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    };


    /*
    =====================================================
    FORMAT TIME
    =====================================================
    */

    const formatTime = (value) => {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
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
    EMPLOYEE NAME
    =====================================================
    */

    const getEmployeeName = (
        employee
    ) => {

        if (!employee) {
            return "Unknown Employee";
        }


        if (employee.name) {
            return employee.name;
        }


        const fullName =
            `${employee.firstName || ""} ${employee.lastName || ""}`
                .trim();


        return (
            fullName ||
            employee.employeeId ||
            "Unknown Employee"
        );
    };


    /*
    =====================================================
    LOAD EMPLOYEES
    =====================================================
    */

    const loadEmployees = async () => {

        try {

            setError("");

            const response =
                await employeeApi.getAll();


            if (
                response?.success
            ) {

                setEmployees(
                    response.employees || []
                );

            } else {

                setEmployees([]);

                setError(
                    response?.message ||
                    "Failed to load employees"
                );
            }

        } catch (error) {

            console.error(
                "HR Dashboard employees error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load employees"
            );

            setEmployees([]);

        }
    };


    /*
    =====================================================
    LOAD TODAY'S REAL ATTENDANCE
    =====================================================
    */

    const loadTodayAttendance = async (
        showRefresh = false
    ) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            }

            setAttendanceLoading(true);

            setAttendanceError("");


            const today =
                getTodayDate();


            /*
            =================================================
            IMPORTANT

            This is the same HR endpoint used by
            HRAttendance.jsx.

            We are NOT using:

            /attendance/today

            because that endpoint belongs to
            the logged-in employee.

            =================================================
            */

            const response =
                await api.get(
                    "/hr-attendance",
                    {
                        params: {
                            date: today,
                        },
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

                setAttendanceError(
                    response.data?.message ||
                    "Failed to load today's attendance"
                );
            }

        } catch (error) {

            console.error(
                "HR DASHBOARD ATTENDANCE ERROR:",
                error
            );

            setAttendance([]);

            setAttendanceError(
                error.response?.data?.message ||
                "Failed to load today's attendance"
            );

        } finally {

            setAttendanceLoading(false);
            setRefreshing(false);

        }
    };


    /*
    =====================================================
    LOAD DASHBOARD DATA
    =====================================================
    */

    const loadDashboard = async (
        showRefresh = false
    ) => {

        if (showRefresh) {
            setRefreshing(true);
        }

        await Promise.all([
            loadEmployees(),
            loadTodayAttendance(showRefresh),
        ]);

        setLoading(false);
        setRefreshing(false);
    };


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(() => {

        loadDashboard();

    }, []);


    /*
    =====================================================
    EMPLOYEE STATISTICS
    =====================================================
    */

    const totalEmployees =
        employees.length;


    const activeEmployees =
        employees.filter(
            (employee) =>
                employee.isActive === true
        ).length;


    const inactiveEmployees =
        employees.filter(
            (employee) =>
                employee.isActive !== true
        ).length;


    /*
    =====================================================
    NEW EMPLOYEES THIS MONTH
    =====================================================
    */

    const newEmployeesThisMonth =
        useMemo(() => {

            const now =
                new Date();


            return employees.filter(
                (employee) => {

                    if (
                        !employee.createdAt
                    ) {
                        return false;
                    }


                    const createdAt =
                        new Date(
                            employee.createdAt
                        );


                    return (
                        createdAt.getMonth() ===
                            now.getMonth() &&

                        createdAt.getFullYear() ===
                            now.getFullYear()
                    );

                }
            ).length;

        }, [
            employees,
        ]);


    /*
    =====================================================
    REAL ATTENDANCE STATISTICS
    =====================================================

    Only records actually stored in Attendance
    collection are counted.

    =====================================================
    */

    const attendanceStats =
        useMemo(() => {

            const present =
                attendance.filter(
                    (record) =>
                        record.status ===
                            "Present" ||
                        record.status ===
                            "Completed"
                ).length;


            const completed =
                attendance.filter(
                    (record) =>
                        record.status ===
                        "Completed"
                ).length;


            const currentlyPresent =
                attendance.filter(
                    (record) =>
                        record.status ===
                        "Present"
                ).length;


            const absent =
                attendance.filter(
                    (record) =>
                        record.status ===
                        "Absent"
                ).length;


            const halfDay =
                attendance.filter(
                    (record) =>
                        record.status ===
                        "Half Day"
                ).length;


            const leave =
                attendance.filter(
                    (record) =>
                        record.status ===
                        "Leave"
                ).length;


            const totalRecords =
                attendance.length;


            /*
            =============================================
            ATTENDANCE PERCENTAGE

            Based on real stored attendance records
            versus total employees.

            =============================================
            */

            const percentage =
                totalEmployees > 0
                    ? Math.round(
                          (
                              present /
                              totalEmployees
                          ) * 100
                      )
                    : 0;


            return {
                present,
                completed,
                currentlyPresent,
                absent,
                halfDay,
                leave,
                totalRecords,
                percentage,
            };

        }, [
            attendance,
            totalEmployees,
        ]);


    /*
    =====================================================
    PRESENT TODAY
    =====================================================
    */

    const presentToday =
        attendanceStats.present;


    /*
    =====================================================
    ATTENDANCE PERCENTAGE
    =====================================================
    */

    const attendancePercentage =
        attendanceStats.percentage;


    /*
    =====================================================
    PENDING LEAVE

    Attendance schema does not contain leave requests.

    Therefore do NOT create fake pending leave data.

    =====================================================
    */

    const pendingLeave = 0;


    /*
    =====================================================
    CURRENT DATE
    =====================================================
    */

    const currentDate =
        useMemo(() => {

            return new Date().toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            );

        }, []);


    /*
    =====================================================
    TODAY ATTENDANCE RECORDS

    Sort:
    1. Present
    2. Completed
    3. Other statuses

    Within each group, latest punch-in first.
    =====================================================
    */

    const todayAttendance =
        useMemo(() => {

            const statusOrder = {
                Present: 1,
                Completed: 2,
                "Half Day": 3,
                Leave: 4,
                Absent: 5,
            };


            return [...attendance].sort(
                (a, b) => {

                    const statusA =
                        statusOrder[
                            a.status
                        ] || 99;

                    const statusB =
                        statusOrder[
                            b.status
                        ] || 99;


                    if (
                        statusA !==
                        statusB
                    ) {
                        return (
                            statusA -
                            statusB
                        );
                    }


                    return (
                        new Date(
                            b.punchIn || 0
                        ) -
                        new Date(
                            a.punchIn || 0
                        )
                    );

                }
            );

        }, [
            attendance,
        ]);


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div className="dashboard-loading">

                <RefreshCw
                    size={26}
                    className="spin"
                />

                <span>
                    Loading HR dashboard...
                </span>

            </div>

        );

    }


    /*
    =====================================================
    DASHBOARD
    =====================================================
    */

    return (

        <div className="dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        HR Dashboard
                    </h1>

                    <p>
                        Manage your employees
                        and HR activities.
                    </p>

                </div>


                <div className="dashboard-header-right">

                    <div className="dashboard-date">

                        <CalendarClock
                            size={18}
                        />

                        <span>
                            {currentDate}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="dashboard-refresh-btn"
                        onClick={() =>
                            loadDashboard(true)
                        }
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>

            </div>


            {/* =================================================
                EMPLOYEE ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadEmployees()
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                ATTENDANCE ERROR
            ================================================= */}

            {attendanceError && (

                <div className="dashboard-error">

                    <span>
                        {attendanceError}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            loadTodayAttendance()
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">


                {/* TOTAL EMPLOYEES */}

                <StatCard
                    title="Total Employees"
                    value={totalEmployees}
                    description={
                        newEmployeesThisMonth > 0
                            ? `+${newEmployeesThisMonth} this month`
                            : "No new employees this month"
                    }
                    icon={Users}
                />


                {/* ACTIVE */}

                <StatCard
                    title="Active Employees"
                    value={activeEmployees}
                    description={
                        totalEmployees > 0
                            ? `${Math.round(
                                  (
                                      activeEmployees /
                                      totalEmployees
                                  ) * 100
                              )}% of workforce`
                            : "No employees"
                    }
                    icon={UserCheck}
                />


                {/* INACTIVE */}

                <StatCard
                    title="Inactive Employees"
                    value={inactiveEmployees}
                    description={
                        totalEmployees > 0
                            ? `${Math.round(
                                  (
                                      inactiveEmployees /
                                      totalEmployees
                                  ) * 100
                              )}% of workforce`
                            : "No inactive employees"
                    }
                    icon={UserX}
                />


                {/* PENDING LEAVE */}

                <StatCard
                    title="Pending Leave"
                    value={pendingLeave}
                    description="No leave request data"
                    icon={Clock3}
                />

            </div>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="dashboard-main-grid">


                {/* =================================================
                    REAL ATTENDANCE OVERVIEW
                ================================================= */}

                <div className="attendance-card">

                    <div className="section-header">

                        <div>

                            <h3>
                                Attendance Overview
                            </h3>

                            <p>
                                Today's stored employee
                                attendance
                            </p>

                        </div>


                        <TrendingUp
                            size={22}
                        />

                    </div>


                    {attendanceLoading ? (

                        <div className="dashboard-attendance-loading">

                            <RefreshCw
                                size={24}
                                className="spin"
                            />

                            <span>
                                Loading attendance...
                            </span>

                        </div>

                    ) : attendance.length === 0 ? (

                        /*
                        =========================================
                        NO STORED DATA

                        IMPORTANT:
                        We do not show fake attendance.
                        =========================================
                        */

                        <div className="dashboard-empty-chart">

                            <UserCheck
                                size={30}
                            />

                            <strong>
                                No attendance recorded today
                            </strong>

                            <span>
                                No employee attendance
                                document is stored for today.
                            </span>

                            <small>
                                Attendance: 0%
                            </small>

                        </div>

                    ) : (

                        <>

                            {/* =================================
                                ATTENDANCE SUMMARY
                            ================================= */}

                            <div className="dashboard-attendance-summary">

                                <div className="dashboard-attendance-stat">

                                    <span>
                                        Present
                                    </span>

                                    <strong>
                                        {
                                            attendanceStats.present
                                        }
                                    </strong>

                                </div>


                                <div className="dashboard-attendance-stat">

                                    <span>
                                        Working
                                    </span>

                                    <strong>
                                        {
                                            attendanceStats.currentlyPresent
                                        }
                                    </strong>

                                </div>


                                <div className="dashboard-attendance-stat">

                                    <span>
                                        Completed
                                    </span>

                                    <strong>
                                        {
                                            attendanceStats.completed
                                        }
                                    </strong>

                                </div>


                                <div className="dashboard-attendance-stat">

                                    <span>
                                        Attendance
                                    </span>

                                    <strong>
                                        {attendancePercentage}%
                                    </strong>

                                </div>

                            </div>


                            {/* =================================
                                REAL EMPLOYEE ATTENDANCE LIST
                            ================================= */}

                            <div className="dashboard-attendance-list">

                                {todayAttendance.map(
                                    (record) => {

                                        const employee =
                                            record.employee ||
                                            {};

                                        const employeeName =
                                            getEmployeeName(
                                                employee
                                            );


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

                                            <div
                                                className="dashboard-attendance-row"
                                                key={
                                                    record._id
                                                }
                                            >

                                                {/* EMPLOYEE */}

                                                <div className="dashboard-attendance-employee">

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

                                                        <div className="dashboard-attendance-avatar">

                                                            {employeeName
                                                                .charAt(0)
                                                                .toUpperCase()}

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
                                                                employee.employeeId ||
                                                                employee._id ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>


                                                {/* PUNCH IN */}

                                                <div className="dashboard-attendance-time">

                                                    <small>
                                                        Punch In
                                                    </small>

                                                    <span>

                                                        <LogIn
                                                            size={14}
                                                        />

                                                        {
                                                            formatTime(
                                                                record.punchIn
                                                            )
                                                        }

                                                    </span>

                                                </div>


                                                {/* PUNCH OUT */}

                                                <div className="dashboard-attendance-time">

                                                    <small>
                                                        Punch Out
                                                    </small>

                                                    <span>

                                                        <LogOut
                                                            size={14}
                                                        />

                                                        {
                                                            formatTime(
                                                                record.punchOut
                                                            )
                                                        }

                                                    </span>

                                                </div>


                                                {/* BREAK */}

                                                <div className="dashboard-attendance-time">

                                                    <small>
                                                        Break
                                                    </small>

                                                    <span>

                                                        <Coffee
                                                            size={14}
                                                        />

                                                        {
                                                            breakMinutes >
                                                            0
                                                                ? `${breakMinutes} min`
                                                                : "—"
                                                        }

                                                    </span>

                                                </div>


                                                {/* LUNCH */}

                                                <div className="dashboard-attendance-time">

                                                    <small>
                                                        Lunch
                                                    </small>

                                                    <span>

                                                        <Utensils
                                                            size={14}
                                                        />

                                                        {
                                                            lunchMinutes >
                                                            0
                                                                ? `${lunchMinutes} min`
                                                                : "—"
                                                        }

                                                    </span>

                                                </div>


                                                {/* WORKING HOURS */}

                                                <div className="dashboard-attendance-time">

                                                    <small>
                                                        Working
                                                    </small>

                                                    <strong>
                                                        {
                                                            formatDuration(
                                                                record.totalWorkingSeconds,
                                                                record.totalWorkingMinutes
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                {/* STATUS */}

                                                <span
                                                    className={`dashboard-attendance-status ${
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

                                                    {
                                                        record.status ||
                                                        "Present"
                                                    }

                                                </span>

                                            </div>

                                        );

                                    }
                                )}

                            </div>


                            {/* =================================
                                STORED RECORD COUNT
                            ================================= */}

                            <div className="dashboard-attendance-footer">

                                <span>
                                    Showing{" "}
                                    <strong>
                                        {
                                            attendance.length
                                        }
                                    </strong>{" "}
                                    stored attendance record
                                    {attendance.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    for today.
                                </span>

                            </div>

                        </>

                    )}

                </div>


                {/* =================================================
                    EMPLOYEE STATUS
                ================================================= */}

                <div className="quick-stats-card">

                    <div className="section-header">

                        <div>

                            <h3>
                                Employee Status
                            </h3>

                            <p>
                                Current workforce
                            </p>

                        </div>

                    </div>


                    <div className="status-list">


                        <div className="status-item">

                            <span>
                                Active
                            </span>

                            <strong>
                                {activeEmployees}
                            </strong>

                        </div>


                        <div className="status-item">

                            <span>
                                Inactive
                            </span>

                            <strong>
                                {inactiveEmployees}
                            </strong>

                        </div>


                        <div className="status-item">

                            <span>
                                Total
                            </span>

                            <strong>
                                {totalEmployees}
                            </strong>

                        </div>


                        <div className="status-item">

                            <span>
                                New This Month
                            </span>

                            <strong>
                                {newEmployeesThisMonth}
                            </strong>

                        </div>


                        {/* REAL ATTENDANCE */}

                        <div className="status-item">

                            <span>
                                Attendance Records
                            </span>

                            <strong>
                                {
                                    attendanceStats.totalRecords
                                }
                            </strong>

                        </div>


                        <div className="status-item">

                            <span>
                                Present Today
                            </span>

                            <strong>
                                {
                                    attendanceStats.present
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT EMPLOYEES
            ================================================= */}

            <RecentEmployees
                employees={employees}
            />

        </div>

    );
};


export default Dashboard;