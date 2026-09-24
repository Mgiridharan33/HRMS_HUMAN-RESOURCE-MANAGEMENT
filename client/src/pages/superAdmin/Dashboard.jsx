import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Users,
    UserRound,
    UserCheck,
    CalendarClock,
    TrendingUp,
    Clock3,
    UserX,
} from "lucide-react";

import StatCard
    from "../../components/dashboard/StatCard";

import RecentEmployees
    from "../../components/dashboard/RecentEmployees";

import hrApi
    from "../../services/hrApi";

import employeeApi
    from "../../services/employeeApi";

import superAdminAttendanceApi
    from "../../services/superAdminAttendanceApi";

import superAdminLeaveApi
    from "../../services/superAdminLeaveApi";


const Dashboard = () => {

    /*
    =====================================================
    STATE
    =====================================================
    */

    const [hrList, setHRList] =
        useState([]);

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [attendanceSummary, setAttendanceSummary] =
        useState(null);

    const [pendingLeave, setPendingLeave] =
        useState(0);


    /*
    =====================================================
    LOAD DASHBOARD DATA
    =====================================================
    */

    const loadDashboardData = async () => {

        try {

            setLoading(true);


            const results = await Promise.allSettled([

                hrApi.getAll(),

                employeeApi.getAll(),

                superAdminAttendanceApi.getSummary(),

                superAdminLeaveApi.getSummary(),

            ]);

            const [
                hrResult,
                employeeResult,
                attendanceResult,
                leaveResult,
            ] = results;

            const hrResponse =
                hrResult.status === "fulfilled"
                    ? hrResult.value
                    : null;

            const employeeResponse =
                employeeResult.status === "fulfilled"
                    ? employeeResult.value
                    : null;

            const attendanceResponse =
                attendanceResult.status === "fulfilled"
                    ? attendanceResult.value
                    : null;

            const leaveResponse =
                leaveResult.status === "fulfilled"
                    ? leaveResult.value
                    : null;


            /*
            =============================================
            HR DATA
            =============================================
            */

            if (hrResponse?.success) {

                setHRList(
                    hrResponse.hr || []
                );

            } else {

                setHRList([]);

            }


            /*
            =============================================
            EMPLOYEE DATA
            =============================================
            */

            if (
                employeeResponse?.success
            ) {

                setEmployees(
                    employeeResponse.employees ||
                    []
                );

            } else {

                setEmployees([]);

            }


            setAttendanceSummary(
                attendanceResponse?.summary || null
            );

            setPendingLeave(
                Number(
                    leaveResponse?.summary?.pending
                ) || 0
            );

        } catch (error) {

            console.error(
                "Dashboard data error:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadDashboardData();

    }, []);


    /*
    =====================================================
    HR STATISTICS
    =====================================================
    */

    const totalHR =
        hrList.length;


    const activeHR =
        hrList.filter(
            (hr) =>
                hr.isActive === true
        ).length;


    const inactiveHR =
        hrList.filter(
            (hr) =>
                hr.isActive !== true
        ).length;


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
    ATTENDANCE
    =====================================================

    If attendance is not implemented yet,
    we don't show fake numbers.

    */

    const presentToday =
        Number(
            attendanceSummary?.overall?.present
        ) || 0;

    const attendanceTotal =
        Number(
            attendanceSummary?.overall?.total
        ) || 0;

    const attendancePercentage =
        attendanceTotal > 0
            ? Math.round(
                  (
                      presentToday /
                      attendanceTotal
                  ) * 100
              )
            : 0;


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
    EMPLOYEE GROWTH
    =====================================================
    */

    const employeesThisMonth =
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

                    const date =
                        new Date(
                            employee.createdAt
                        );

                    return (
                        date.getMonth() ===
                            now.getMonth() &&
                        date.getFullYear() ===
                            now.getFullYear()
                    );

                }
            ).length;

        }, [employees]);


    /*
    =====================================================
    HR GROWTH
    =====================================================
    */

    const hrThisMonth =
        useMemo(() => {

            const now =
                new Date();

            return hrList.filter(
                (hr) => {

                    if (!hr.createdAt) {
                        return false;
                    }

                    const date =
                        new Date(
                            hr.createdAt
                        );

                    return (
                        date.getMonth() ===
                            now.getMonth() &&
                        date.getFullYear() ===
                            now.getFullYear()
                    );

                }
            ).length;

        }, [hrList]);


    /*
    =====================================================
    RECENT EMPLOYEES
    =====================================================
    */

    const recentEmployees =
        useMemo(() => {

            return [...employees]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                )
                .slice(0, 5);

        }, [employees]);


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="dashboard-loading-icon">

                    <Users size={25} />

                </div>

                <p>
                    Loading dashboard...
                </p>

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
                PAGE HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Here's what's happening
                        in your organization today.
                    </p>

                </div>


                <div className="dashboard-date">

                    <CalendarClock
                        size={18}
                    />

                    <span>
                        {currentDate}
                    </span>

                </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">


                {/* TOTAL HR */}

                <StatCard
                    title="Total HR"
                    value={totalHR}
                    description={
                        hrThisMonth > 0
                            ? `+${hrThisMonth} this month`
                            : "No new HR this month"
                    }
                    icon={Users}
                />


                {/* TOTAL EMPLOYEES */}

                <StatCard
                    title="Total Employees"
                    value={totalEmployees}
                    description={
                        employeesThisMonth > 0
                            ? `+${employeesThisMonth} this month`
                            : "No new employees this month"
                    }
                    icon={UserRound}
                />


                {/* ACTIVE EMPLOYEES */}

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
                              )}% active workforce`
                            : "No employees"
                    }
                    icon={UserCheck}
                />


                {/* INACTIVE EMPLOYEES */}

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

            </div>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="dashboard-main-grid">


                {/* =================================================
                    ATTENDANCE
                ================================================= */}

                <div className="attendance-card">

                    <div className="section-header">

                        <div>

                            <h3>
                                Attendance Overview
                            </h3>

                            <p>
                                Attendance data will
                                appear here once the
                                attendance module is enabled.
                            </p>

                        </div>


                        <TrendingUp
                            size={22}
                        />

                    </div>


                    <div className="attendance-chart">

                        <div className="dashboard-empty-chart">

                            <UserCheck
                                size={30}
                            />

                            <strong>
                                Attendance
                            </strong>

                            <span>
                                {presentToday} present
                                today
                            </span>

                            <small>
                                {attendancePercentage}%
                                attendance
                            </small>

                        </div>

                    </div>

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
                                HR Accounts
                            </span>

                            <strong>
                                {activeHR}
                            </strong>

                        </div>


                        <div className="status-item">

                            <span>
                                Pending Leave
                            </span>

                            <strong>
                                {pendingLeave}
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
    hrList={hrList}
/>


        </div>

    );
};


export default Dashboard;