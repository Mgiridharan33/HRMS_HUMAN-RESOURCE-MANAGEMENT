import {
    CalendarCheck,
    CalendarDays,
    Clock3,
    FileText,
    Wallet,
    Bell,
    UserRound,
    ArrowRight,
    RefreshCw,
    Coffee,
    Utensils,
    CheckCircle2,
    XCircle,
    Hourglass,
    Loader2,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import api from "../../services/api";

import "./Dashboard.css";


const EmployeeDashboard = () => {

    const navigate = useNavigate();

    const {
        user,
        loading: authLoading,
    } = useAuth();


    /*
    =====================================================
    STABLE USER ID
    =====================================================
    */

    const userId =
        user?._id ||
        user?.id ||
        null;


    /*
    =====================================================
    REFS
    =====================================================
    */

    const refreshingRef =
        useRef(false);


    /*
    =====================================================
    STATE
    =====================================================
    */

    const [todayAttendance, setTodayAttendance] =
        useState(null);

    const [attendanceHistory, setAttendanceHistory] =
        useState([]);

    const [attendanceLoading, setAttendanceLoading] =
        useState(true);

    const [attendanceError, setAttendanceError] =
        useState("");

    const [currentTime, setCurrentTime] =
        useState(new Date());


    /*
    =====================================================
    LEAVE DATA
    =====================================================
    */

    const [leaveRequests, setLeaveRequests] =
        useState([]);

    const [leaveLoading, setLeaveLoading] =
        useState(true);

    const [leaveError, setLeaveError] =
        useState("");


    /*
    =====================================================
    LIVE CLOCK
    =====================================================
    */

    useEffect(() => {

        const timer =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 1000);


        return () => {

            clearInterval(
                timer
            );

        };

    }, []);


    /*
    =====================================================
    LOAD TODAY ATTENDANCE
    =====================================================
    */

    const loadTodayAttendance = async () => {

        try {

            const response =
                await api.get(
                    "/attendance/today"
                );


            if (
                response.data?.success
            ) {

                setTodayAttendance(
                    response.data.attendance ||
                    null
                );

                setAttendanceError("");

            } else {

                setTodayAttendance(
                    null
                );

                setAttendanceError(
                    response.data?.message ||
                    ""
                );

            }

        } catch (error) {

            console.error(
                "DASHBOARD TODAY ATTENDANCE ERROR:",
                error
            );


            /*
            Do not destroy existing attendance
            data just because a background refresh
            failed.
            */

            setAttendanceError(
                error.response?.data?.message ||
                "Unable to load today's attendance."
            );

        }

    };


    /*
    =====================================================
    LOAD ATTENDANCE HISTORY
    =====================================================
    */

    const loadAttendanceHistory = async () => {

        try {

            const response =
                await api.get(
                    "/attendance/history"
                );


            if (
                response.data?.success
            ) {

                setAttendanceHistory(
                    Array.isArray(
                        response.data.attendance
                    )
                        ? response.data.attendance
                        : []
                );

            }

        } catch (error) {

            console.error(
                "DASHBOARD ATTENDANCE HISTORY ERROR:",
                error
            );

        }

    };


    /*
    =====================================================
    LOAD MY LEAVE REQUESTS
    =====================================================
    */

    const loadLeaveRequests = async () => {

        try {

            setLeaveError("");

            setLeaveLoading(true);


            const response =
                await api.get(
                    "/leave/my-leaves"
                );


            if (
                response.data?.success
            ) {

                setLeaveRequests(
                    Array.isArray(
                        response.data.leaves
                    )
                        ? response.data.leaves
                        : []
                );

            } else {

                setLeaveRequests([]);

                setLeaveError(
                    response.data?.message ||
                    "Unable to load leave requests."
                );

            }

        } catch (error) {

            console.error(
                "DASHBOARD LEAVE ERROR:",
                error
            );


            /*
            Do not crash the dashboard
            if leave API fails.
            */

            setLeaveError(
                error.response?.data?.message ||
                "Unable to load leave requests."
            );

        } finally {

            setLeaveLoading(false);

        }

    };


    /*
    =====================================================
    REFRESH ALL DASHBOARD DATA
    =====================================================
    */

    const refreshDashboard = async () => {

        /*
        Prevent multiple refreshes from running
        at the same time.
        */

        if (
            !userId ||
            refreshingRef.current
        ) {

            return;

        }


        refreshingRef.current = true;


        try {

            await Promise.all([
                loadTodayAttendance(),
                loadAttendanceHistory(),
                loadLeaveRequests(),
            ]);

        } catch (error) {

            console.error(
                "DASHBOARD REFRESH ERROR:",
                error
            );

        } finally {

            refreshingRef.current = false;

        }

    };


    /*
    =====================================================
    INITIAL LOAD + AUTO REFRESH
    =====================================================
    */

    useEffect(() => {

        if (
            authLoading ||
            !userId
        ) {

            return;

        }


        let mounted = true;


        const initialLoad =
            async () => {

                if (!mounted) {
                    return;
                }


                setAttendanceLoading(
                    true
                );

                setAttendanceError("");


                try {

                    await refreshDashboard();

                } catch (error) {

                    console.error(
                        "INITIAL DASHBOARD LOAD ERROR:",
                        error
                    );

                } finally {

                    if (mounted) {

                        setAttendanceLoading(
                            false
                        );

                    }

                }

            };


        initialLoad();


        /*
        =================================================
        REFRESH DATABASE DATA EVERY 30 SECONDS
        =================================================
        */

        const refreshTimer =
            setInterval(() => {

                if (mounted) {

                    refreshDashboard();

                }

            }, 30000);


        return () => {

            mounted = false;

            clearInterval(
                refreshTimer
            );

        };


    }, [
        authLoading,
        userId,
    ]);


    /*
    =====================================================
    EMPLOYEE DATA
    =====================================================
    */

    const employee = {

        firstName:
            user?.firstName || "",

        lastName:
            user?.lastName || "",

        employeeId:
            user?.employeeId || "—",

        designation:
            user?.designation || "—",

        department:
            user?.department || "—",

        email:
            user?.email || "—",

        phone:
            user?.phone || "—",

        profileImage:
            user?.profileImage || "",

        employmentType:
            user?.employmentType || "—",

        joiningDate:
            user?.joiningDate || null,

    };


    /*
    =====================================================
    FULL NAME
    =====================================================
    */

    const fullName =
        `${employee.firstName} ${employee.lastName}`
            .trim();


    /*
    =====================================================
    INITIALS
    =====================================================
    */

    const initials =
        fullName
            .split(" ")
            .filter(Boolean)
            .map(
                (name) =>
                    name.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


    /*
    =====================================================
    FORMAT TIME
    =====================================================
    */

    const formatTime = (date) => {

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


        return parsedDate
            .toLocaleTimeString(
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
    FORMAT SHORT TIME
    =====================================================
    */

    const formatShortTime = (date) => {

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


        return parsedDate
            .toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

    };


    /*
    =====================================================
    FORMAT DATE
    =====================================================
    */

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


        return parsedDate
            .toLocaleDateString(
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

    const formatDuration = (minutes) => {

        const safeMinutes =
            Math.max(
                0,
                Number(minutes) || 0
            );


        const hours =
            Math.floor(
                safeMinutes / 60
            );


        const remainingMinutes =
            safeMinutes % 60;


        return `${hours}h ${remainingMinutes}m`;

    };


    /*
    =====================================================
    GET ACTIVE BREAK
    =====================================================
    */

    const activeBreak =
        useMemo(() => {

            if (
                !todayAttendance?.breaks?.length
            ) {

                return null;

            }


            return todayAttendance.breaks.find(
                (item) =>
                    item?.start &&
                    !item?.end
            ) || null;

        }, [
            todayAttendance,
        ]);


    /*
    =====================================================
    GET ACTIVE LUNCH
    =====================================================
    */

    const activeLunch =
        useMemo(() => {

            if (
                !todayAttendance?.lunch?.start
            ) {

                return false;

            }


            return (
                !todayAttendance.lunch.end
            );

        }, [
            todayAttendance,
        ]);


    /*
    =====================================================
    CALCULATE LIVE WORKING MINUTES
    =====================================================
    */

    const liveWorkingMinutes =
        useMemo(() => {

            if (
                !todayAttendance?.punchIn
            ) {

                return 0;

            }


            const punchIn =
                new Date(
                    todayAttendance.punchIn
                );


            if (
                Number.isNaN(
                    punchIn.getTime()
                )
            ) {

                return 0;

            }


            const endTime =
                todayAttendance.punchOut
                    ? new Date(
                        todayAttendance.punchOut
                    )
                    : currentTime;


            let totalMinutes =
                Math.floor(
                    (
                        endTime -
                        punchIn
                    ) / 60000
                );


            /*
            =================================================
            SUBTRACT BREAK TIME
            =================================================
            */

            const breaks =
                Array.isArray(
                    todayAttendance.breaks
                )
                    ? todayAttendance.breaks
                    : [];


            breaks.forEach(
                (item) => {

                    if (!item?.start) {
                        return;
                    }


                    const breakStart =
                        new Date(
                            item.start
                        );


                    const breakEnd =
                        item.end
                            ? new Date(
                                item.end
                            )
                            : currentTime;


                    if (
                        breakEnd >
                        breakStart
                    ) {

                        totalMinutes -=
                            Math.floor(
                                (
                                    breakEnd -
                                    breakStart
                                ) / 60000
                            );

                    }

                }
            );


            /*
            =================================================
            SUBTRACT LUNCH TIME
            =================================================
            */

            if (
                todayAttendance.lunch?.start
            ) {

                const lunchStart =
                    new Date(
                        todayAttendance.lunch.start
                    );


                const lunchEnd =
                    todayAttendance.lunch.end
                        ? new Date(
                            todayAttendance.lunch.end
                        )
                        : currentTime;


                if (
                    lunchEnd >
                    lunchStart
                ) {

                    totalMinutes -=
                        Math.floor(
                            (
                                lunchEnd -
                                lunchStart
                            ) / 60000
                        );

                }

            }


            return Math.max(
                0,
                totalMinutes
            );


        }, [
            todayAttendance,
            currentTime,
        ]);


    /*
    =====================================================
    TODAY STATUS
    =====================================================
    */

    const todayStatus =
        useMemo(() => {

            if (
                !todayAttendance
            ) {

                return {
                    key: "NOT_STARTED",
                    label: "Not Started",
                };

            }


            if (
                todayAttendance.punchOut
            ) {

                return {
                    key: "COMPLETED",
                    label: "Completed",
                };

            }


            if (
                activeLunch
            ) {

                return {
                    key: "LUNCH",
                    label: "Lunch Break",
                };

            }


            if (
                activeBreak
            ) {

                return {
                    key: "BREAK",
                    label: "On Break",
                };

            }


            if (
                todayAttendance.punchIn
            ) {

                return {
                    key: "WORKING",
                    label: "Working",
                };

            }


            return {
                key: "NOT_STARTED",
                label: "Not Started",
            };


        }, [
            todayAttendance,
            activeBreak,
            activeLunch,
        ]);


    /*
    =====================================================
    MONTHLY ATTENDANCE
    =====================================================
    */

    const monthlyAttendance =
        useMemo(() => {

            const now =
                new Date();


            const currentMonth =
                now.getMonth();


            const currentYear =
                now.getFullYear();


            const currentMonthRecords =
                attendanceHistory.filter(
                    (record) => {

                        if (!record?.date) {
                            return false;
                        }


                        const recordDate =
                            new Date(
                                record.date
                            );


                        if (
                            Number.isNaN(
                                recordDate.getTime()
                            )
                        ) {

                            return false;

                        }


                        return (
                            recordDate.getMonth() ===
                                currentMonth &&
                            recordDate.getFullYear() ===
                                currentYear
                        );

                    }
                );


            const presentDays =
                currentMonthRecords.filter(
                    (record) => {

                        const status =
                            String(
                                record?.status ||
                                ""
                            ).toLowerCase();


                        return (
                            status === "present" ||
                            status === "completed"
                        );

                    }
                ).length;


            /*
            =================================================
            WORKING DAYS
            =================================================
            */

            let workingDays = 0;


            const today =
                now.getDate();


            for (
                let day = 1;
                day <= today;
                day++
            ) {

                const date =
                    new Date(
                        currentYear,
                        currentMonth,
                        day
                    );


                const dayOfWeek =
                    date.getDay();


                /*
                Sunday excluded.
                */

                if (
                    dayOfWeek !== 0
                ) {

                    workingDays++;

                }

            }


            const percentage =
                workingDays > 0
                    ? Math.min(
                        100,
                        (
                            presentDays /
                            workingDays
                        ) * 100
                    )
                    : 0;


            return {

                presentDays,

                totalDays:
                    workingDays,

                percentage:
                    Number(
                        percentage.toFixed(1)
                    ),

            };


        }, [
            attendanceHistory,
            currentTime,
        ]);


    /*
    =====================================================
    LEAVE SUMMARY
    =====================================================
    */

    const leave =
        useMemo(() => {

            const pending =
                leaveRequests.filter(
                    (item) =>
                        String(
                            item?.status || ""
                        ).toLowerCase() ===
                        "pending"
                ).length;


            const approved =
                leaveRequests.filter(
                    (item) =>
                        String(
                            item?.status || ""
                        ).toLowerCase() ===
                        "approved"
                );


            const cancelled =
                leaveRequests.filter(
                    (item) =>
                        String(
                            item?.status || ""
                        ).toLowerCase() ===
                        "cancelled"
                );


            const used =
                approved.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            Number(
                                item?.totalDays ||
                                0
                            )
                        );

                    },
                    0
                );


            const available =
                Number(
                    user?.leaveBalance ??
                    12
                );


            return {

                available,

                used,

                pending,

                approved,

                cancelled,

            };


        }, [
            leaveRequests,
            user,
        ]);


    /*
    =====================================================
    ANNOUNCEMENTS
    =====================================================
    */

    const announcements =
        useMemo(() => {

            if (
                !Array.isArray(
                    leaveRequests
                )
            ) {

                return [];

            }


            return leaveRequests
                .filter(
                    (leaveRequest) => {

                        const status =
                            String(
                                leaveRequest?.status ||
                                ""
                            ).toLowerCase();


                        return (
                            status === "approved" ||
                            status === "cancelled" ||
                            status === "pending"
                        );

                    }
                )
                .sort(
                    (a, b) => {

                        const dateA =
                            new Date(
                                a?.updatedAt ||
                                a?.cancelledAt ||
                                a?.approvedAt ||
                                a?.createdAt ||
                                a?.startDate ||
                                0
                            ).getTime();


                        const dateB =
                            new Date(
                                b?.updatedAt ||
                                b?.cancelledAt ||
                                b?.approvedAt ||
                                b?.createdAt ||
                                b?.startDate ||
                                0
                            ).getTime();


                        return (
                            dateB -
                            dateA
                        );

                    }
                )
                .slice(
                    0,
                    5
                )
                .map(
                    (leaveRequest) => {

                        const status =
                            String(
                                leaveRequest?.status ||
                                ""
                            ).toLowerCase();


                        const leaveType =
                            leaveRequest?.leaveType ||
                            "Leave";


                        const totalDays =
                            Number(
                                leaveRequest?.totalDays ||
                                0
                            );


                        const dateText =
                            leaveRequest?.startDate
                                ? `${formatDate(
                                    leaveRequest.startDate
                                )}${
                                    leaveRequest?.endDate
                                        ? ` - ${formatDate(
                                            leaveRequest.endDate
                                        )}`
                                        : ""
                                }`
                                : "Date not available";


                        /*
                        =================================================
                        APPROVED
                        =================================================
                        */

                        if (
                            status === "approved"
                        ) {

                            return {

                                id:
                                    `approved-${leaveRequest?._id}`,

                                type:
                                    "approved",

                                icon:
                                    CheckCircle2,

                                title:
                                    "Leave Request Approved",

                                message:
                                    `Your ${leaveType} leave request has been approved.`,

                                detail:
                                    `${dateText} • ${totalDays} ${
                                        totalDays === 1
                                            ? "day"
                                            : "days"
                                    }`,

                                date:
                                    leaveRequest?.approvedAt ||
                                    leaveRequest?.updatedAt ||
                                    leaveRequest?.createdAt,

                            };

                        }


                        /*
                        =================================================
                        CANCELLED
                        =================================================
                        */

                        if (
                            status === "cancelled"
                        ) {

                            return {

                                id:
                                    `cancelled-${leaveRequest?._id}`,

                                type:
                                    "cancelled",

                                icon:
                                    XCircle,

                                title:
                                    "Leave Request Cancelled",

                                message:
                                    `Your ${leaveType} leave request has been cancelled.`,

                                detail:
                                    leaveRequest?.cancellationReason
                                        ? `Reason: ${leaveRequest.cancellationReason}`
                                        : "No cancellation reason provided.",

                                date:
                                    leaveRequest?.cancelledAt ||
                                    leaveRequest?.updatedAt ||
                                    leaveRequest?.createdAt,

                            };

                        }


                        /*
                        =================================================
                        PENDING
                        =================================================
                        */

                        return {

                            id:
                                `pending-${leaveRequest?._id}`,

                            type:
                                "pending",

                            icon:
                                Hourglass,

                            title:
                                "Leave Request Pending",

                            message:
                                `Your ${leaveType} leave request is waiting for HR approval.`,

                            detail:
                                `${dateText} • ${totalDays} ${
                                    totalDays === 1
                                        ? "day"
                                        : "days"
                                }`,

                            date:
                                leaveRequest?.updatedAt ||
                                leaveRequest?.createdAt,

                        };

                    }
                );


        }, [
            leaveRequests,
        ]);


    /*
    =====================================================
    PAYROLL
    =====================================================
    */

    const payroll = {

        month:
            currentTime.toLocaleDateString(
                "en-IN",
                {
                    month: "long",
                    year: "numeric",
                }
            ),

        status:
            "Processed",

    };


    /*
    =====================================================
    AUTH LOADING
    =====================================================
    */

    if (
        authLoading
    ) {

        return (

            <div className="employee-dashboard-loading">

                <RefreshCw
                    size={22}
                    className="dashboard-loading-icon"
                />

                Loading your dashboard...

            </div>

        );

    }


    /*
    =====================================================
    NO USER
    =====================================================
    */

    if (!user) {

        return (

            <div className="employee-dashboard-loading">

                Please login to continue.

            </div>

        );

    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="employee-dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-dashboard-header">

                <div>

                    <h1>

                        Welcome back,{" "}

                        {employee.firstName ||
                            "Employee"}

                        {" "}👋

                    </h1>


                    <p>

                        Here's what's happening
                        with your work today.

                    </p>

                </div>


                <button
                    type="button"
                    className="employee-profile-button"
                    onClick={() =>
                        navigate(
                            "/employee/profile"
                        )
                    }
                >

                    <UserRound
                        size={17}
                    />

                    My Profile

                </button>

            </div>


            {/* =================================================
                ATTENDANCE ERROR
            ================================================= */}

            {attendanceError && (

                <div className="employee-dashboard-error">

                    {attendanceError}

                </div>

            )}


            {/* =================================================
                LEAVE ERROR
            ================================================= */}

            {leaveError && (

                <div className="employee-dashboard-error">

                    {leaveError}

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="employee-dashboard-stats">


                {/* ATTENDANCE */}

                <div className="employee-dashboard-stat-card">

                    <div className="employee-stat-top">

                        <div className="employee-stat-icon blue">

                            <CalendarCheck
                                size={21}
                            />

                        </div>

                        <span>
                            Attendance
                        </span>

                    </div>


                    <div className="employee-stat-value">

                        <strong>

                            {monthlyAttendance.percentage}%

                        </strong>

                        <span>
                            This Month
                        </span>

                    </div>


                    <p>

                        {monthlyAttendance.presentDays}
                        {" "}of{" "}
                        {monthlyAttendance.totalDays}
                        {" "}working days

                    </p>

                </div>


                {/* LEAVE */}

                <div className="employee-dashboard-stat-card">

                    <div className="employee-stat-top">

                        <div className="employee-stat-icon green">

                            <CalendarDays
                                size={21}
                            />

                        </div>

                        <span>
                            Leave Balance
                        </span>

                    </div>


                    <div className="employee-stat-value">

                        <strong>
                            {leave.available}
                        </strong>

                        <span>
                            Days Available
                        </span>

                    </div>


                    <p>

                        {leave.used} used ·{" "}
                        {leave.pending} pending

                    </p>

                </div>


                {/* PAYROLL */}

                <div className="employee-dashboard-stat-card">

                    <div className="employee-stat-top">

                        <div className="employee-stat-icon purple">

                            <Wallet
                                size={21}
                            />

                        </div>

                        <span>
                            Payroll
                        </span>

                    </div>


                    <div className="employee-stat-value">

                        <strong>
                            {payroll.status}
                        </strong>

                        <span>
                            {payroll.month}
                        </span>

                    </div>


                    <p>
                        Salary processed successfully
                    </p>

                </div>


                {/* WORK HOURS */}

                <div className="employee-dashboard-stat-card">

                    <div className="employee-stat-top">

                        <div className="employee-stat-icon orange">

                            <Clock3
                                size={21}
                            />

                        </div>

                        <span>
                            Work Hours
                        </span>

                    </div>


                    <div className="employee-stat-value">

                        <strong>

                            {formatDuration(
                                liveWorkingMinutes
                            )}

                        </strong>

                        <span>
                            Today
                        </span>

                    </div>


                    <p>

                        {todayStatus.key ===
                            "WORKING"
                            ? "Working time is running"
                            : todayStatus.key ===
                                "BREAK"
                                ? "Currently on break"
                                : todayStatus.key ===
                                    "LUNCH"
                                    ? "Currently at lunch"
                                    : todayStatus.key ===
                                        "COMPLETED"
                                        ? "Work completed"
                                        : "Punch in to start"}

                    </p>

                </div>

            </div>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="employee-dashboard-content">


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <div className="employee-dashboard-card">

                    <div className="employee-card-header">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Access your frequently used features.
                            </p>

                        </div>

                    </div>


                    <div className="employee-quick-actions">


                        {/* ATTENDANCE */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/attendance"
                                )
                            }
                        >

                            <CalendarCheck
                                size={20}
                            />

                            <span>

                                <strong>
                                    Attendance
                                </strong>

                                <small>
                                    Punch in, punch out & breaks
                                </small>

                            </span>

                            <ArrowRight
                                size={17}
                            />

                        </button>


                        {/* LEAVE */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/leave"
                                )
                            }
                        >

                            <CalendarDays
                                size={20}
                            />

                            <span>

                                <strong>
                                    Apply Leave
                                </strong>

                                <small>
                                    Submit leave request
                                </small>

                            </span>

                            <ArrowRight
                                size={17}
                            />

                        </button>


                        {/* PAYROLL */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/payroll"
                                )
                            }
                        >

                            <Wallet
                                size={20}
                            />

                            <span>

                                <strong>
                                    Payroll
                                </strong>

                                <small>
                                    View salary details
                                </small>

                            </span>

                            <ArrowRight
                                size={17}
                            />

                        </button>


                        {/* DOCUMENTS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/employee/documents"
                                )
                            }
                        >

                            <FileText
                                size={20}
                            />

                            <span>

                                <strong>
                                    Documents
                                </strong>

                                <small>
                                    View your documents
                                </small>

                            </span>

                            <ArrowRight
                                size={17}
                            />

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ANNOUNCEMENTS
                ================================================= */}

                <div className="employee-dashboard-card">

                    <div className="employee-card-header">

                        <div>

                            <h2>
                                Announcements
                            </h2>

                            <p>
                                Your latest leave and HR updates.
                            </p>

                        </div>


                        <Bell
                            size={20}
                        />

                    </div>


                    <div className="employee-announcements">

                        {leaveLoading ? (

                            <div className="employee-announcements-loading">

                                <Loader2
                                    size={20}
                                    className="hr-leave-spin"
                                />

                                Loading announcements...

                            </div>

                        ) : announcements.length === 0 ? (

                            <div className="employee-announcements-empty">

                                <Bell
                                    size={25}
                                />

                                <strong>
                                    No new announcements
                                </strong>

                                <span>
                                    Your leave updates will appear here.
                                </span>

                            </div>

                        ) : (

                            announcements.map(
                                (announcement) => {

                                    const Icon =
                                        announcement.icon;

                                    return (

                                        <div
                                            key={
                                                announcement.id
                                            }
                                            className={
                                                `employee-announcement employee-announcement-${announcement.type}`
                                            }
                                        >

                                            <div className="announcement-icon">

                                                <Icon
                                                    size={17}
                                                />

                                            </div>


                                            <div className="employee-announcement-content">

                                                <strong>
                                                    {
                                                        announcement.title
                                                    }
                                                </strong>


                                                <span>
                                                    {
                                                        announcement.message
                                                    }
                                                </span>


                                                <small>
                                                    {
                                                        announcement.detail
                                                    }
                                                </small>


                                                <small className="employee-announcement-date">

                                                    {formatDate(
                                                        announcement.date
                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    );

                                }
                            )

                        )}

                    </div>


                    {/* VIEW LEAVE */}

                    <button
                        type="button"
                        className="employee-announcements-view-all"
                        onClick={() =>
                            navigate(
                                "/employee/leave"
                            )
                        }
                    >

                        <CalendarDays
                            size={16}
                        />

                        View My Leave Requests

                        <ArrowRight
                            size={15}
                        />

                    </button>

                </div>

            </div>


            {/* =================================================
                TODAY'S ATTENDANCE
            ================================================= */}

            <div className="employee-dashboard-card employee-today-card">

                <div className="employee-card-header">

                    <div>

                        <h2>
                            Today's Attendance
                        </h2>

                        <p>
                            Live attendance information from the database.
                        </p>

                    </div>


                    <span
                        className={`attendance-badge attendance-badge-${todayStatus.key.toLowerCase()}`}
                    >

                        {todayStatus.label}

                    </span>

                </div>


                {/* =================================================
                    ATTENDANCE DETAILS
                ================================================= */}

                <div className="employee-attendance-details">


                    {/* CHECK IN */}

                    <div>

                        <span>
                            Check In
                        </span>

                        <strong>

                            {formatShortTime(
                                todayAttendance?.punchIn
                            )}

                        </strong>

                    </div>


                    {/* CHECK OUT */}

                    <div>

                        <span>
                            Check Out
                        </span>

                        <strong>

                            {formatShortTime(
                                todayAttendance?.punchOut
                            )}

                        </strong>

                    </div>


                    {/* WORKING TIME */}

                    <div>

                        <span>
                            Working Time
                        </span>

                        <strong>

                            {formatDuration(
                                liveWorkingMinutes
                            )}

                        </strong>

                    </div>


                    {/* STATUS */}

                    <div>

                        <span>
                            Status
                        </span>

                        <strong
                            className={
                                todayStatus.key ===
                                    "WORKING"
                                    ? "status-present"
                                    : todayStatus.key ===
                                        "BREAK"
                                        ? "status-break"
                                        : todayStatus.key ===
                                            "LUNCH"
                                            ? "status-lunch"
                                            : todayStatus.key ===
                                                "COMPLETED"
                                                ? "status-completed"
                                                : "status-not-started"
                            }
                        >

                            {todayStatus.label}

                        </strong>

                    </div>

                </div>


                {/* =================================================
                    LIVE BREAK / LUNCH / TIME
                ================================================= */}

                <div className="employee-live-attendance-extra">


                    {/* BREAK */}

                    <div className="employee-live-attendance-item">

                        <div className="employee-live-attendance-icon">

                            <Coffee
                                size={17}
                            />

                        </div>


                        <div>

                            <span>
                                Break
                            </span>

                            <strong>

                                {activeBreak
                                    ? "Currently On Break"
                                    : todayAttendance?.breaks?.length
                                        ? `${todayAttendance.breaks.length} break${
                                            todayAttendance.breaks.length > 1
                                                ? "s"
                                                : ""
                                        } taken`
                                        : "No break taken"}

                            </strong>

                        </div>

                    </div>


                    {/* LUNCH */}

                    <div className="employee-live-attendance-item">

                        <div className="employee-live-attendance-icon">

                            <Utensils
                                size={17}
                            />

                        </div>


                        <div>

                            <span>
                                Lunch
                            </span>

                            <strong>

                                {activeLunch
                                    ? "Currently At Lunch"
                                    : todayAttendance?.lunch?.totalMinutes
                                        ? `${todayAttendance.lunch.totalMinutes} minutes`
                                        : "No lunch taken"}

                            </strong>

                        </div>

                    </div>


                    {/* CURRENT TIME */}

                    <div className="employee-live-attendance-item">

                        <div className="employee-live-attendance-icon">

                            <Clock3
                                size={17}
                            />

                        </div>


                        <div>

                            <span>
                                Current Time
                            </span>

                            <strong>

                                {formatTime(
                                    currentTime
                                )}

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ATTENDANCE PAGE BUTTON
                ================================================= */}

                <div className="employee-attendance-action">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/employee/attendance"
                            )
                        }
                    >

                        <CalendarCheck
                            size={17}
                        />

                        Open Attendance

                        <ArrowRight
                            size={16}
                        />

                    </button>

                </div>

            </div>


        </div>

    );

};


export default EmployeeDashboard;