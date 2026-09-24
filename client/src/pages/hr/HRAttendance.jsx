import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Coffee,
    Loader2,
    LogIn,
    LogOut,
    Play,
    RefreshCw,
    Timer,
    Utensils,
    UserRound,
    XCircle,
} from "lucide-react";

import api from "../../services/api";

import "./HRAttendance.css";


/*
=========================================================
HR PERSONAL ATTENDANCE
=========================================================
*/

const HRPersonalAttendance = () => {

    /*
    =====================================================
    STATE
    =====================================================
    */

    const [attendance, setAttendance] =
        useState(null);

    const [history, setHistory] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [currentTime, setCurrentTime] =
        useState(new Date());


    /*
    =====================================================
    LIVE CLOCK
    =====================================================
    */

    useEffect(() => {

        const timer = setInterval(() => {

            setCurrentTime(new Date());

        }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    /*
    =====================================================
    FORMAT TIME
    =====================================================
    */

    const formatTime = (date) => {

        if (!date) {
            return "--:--";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "--:--";
        }

        return value.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
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
            return "--";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "--";
        }

        return value.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
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
            return "--";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "--";
        }

        return value.toLocaleDateString(
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
    FORMAT DAY
    =====================================================
    */

    const formatDay = (date) => {

        if (!date) {
            return "--";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "--";
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
            }
        );
    };


    /*
    =====================================================
    FORMAT WORKING TIME
    =====================================================
    */

    const formatWorkingTime = (
        totalSeconds = 0
    ) => {

        const seconds =
            Math.max(
                0,
                Math.floor(
                    Number(totalSeconds) || 0
                )
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );


        const remainingSeconds =
            seconds % 60;


        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remainingSeconds).padStart(2, "0")}`
        );
    };


    /*
    =====================================================
    FORMAT MINUTES
    =====================================================
    */

    const formatMinutes = (
        minutes = 0
    ) => {

        const value =
            Math.max(
                0,
                Math.floor(
                    Number(minutes) || 0
                )
            );


        const hours =
            Math.floor(
                value / 60
            );


        const mins =
            value % 60;


        if (hours > 0) {

            return `${hours}h ${mins}m`;

        }


        return `${mins}m`;
    };


    /*
    =====================================================
    LOAD TODAY ATTENDANCE
    =====================================================
    */

    const loadTodayAttendance =
        useCallback(
            async () => {

                try {

                    const response =
                        await api.get(
                            "/hr-personal-attendance/today"
                        );


                    if (
                        response.data?.success
                    ) {

                        setAttendance(
                            response.data?.attendance ||
                            null
                        );

                    } else {

                        setAttendance(null);

                    }

                } catch (err) {

                    console.error(
                        "HR PERSONAL ATTENDANCE TODAY ERROR:",
                        err
                    );


                    setError(
                        err.response?.data?.message ||
                        "Failed to load today's attendance."
                    );

                }

            },
            []
        );


    /*
    =====================================================
    LOAD HISTORY
    =====================================================
    */

    const loadHistory =
        useCallback(
            async () => {

                setHistoryLoading(true);


                try {

                    const response =
                        await api.get(
                            "/hr-personal-attendance/history"
                        );


                    if (
                        response.data?.success
                    ) {

                        setHistory(
                            Array.isArray(
                                response.data?.attendance
                            )
                                ? response.data.attendance
                                : []
                        );

                    } else {

                        setHistory([]);

                    }

                } catch (err) {

                    console.error(
                        "HR PERSONAL ATTENDANCE HISTORY ERROR:",
                        err
                    );


                    setError(
                        err.response?.data?.message ||
                        "Failed to load attendance history."
                    );

                } finally {

                    setHistoryLoading(false);

                }

            },
            []
        );


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(() => {

        const loadPage =
            async () => {

                setLoading(true);

                setError("");

                await Promise.all([
                    loadTodayAttendance(),
                    loadHistory(),
                ]);

                setLoading(false);

            };


        loadPage();

    }, [
        loadTodayAttendance,
        loadHistory,
    ]);


    /*
    =====================================================
    REFRESH
    =====================================================
    */

    const refreshAttendance =
        async () => {

            setError("");

            setSuccess("");

            setLoading(true);


            await Promise.all([
                loadTodayAttendance(),
                loadHistory(),
            ]);


            setLoading(false);

        };


    /*
    =====================================================
    API ACTION
    =====================================================
    */

    const performAction =
        async (
            action,
            endpoint,
            successMessage
        ) => {

            if (actionLoading) {
                return;
            }


            setActionLoading(action);

            setError("");

            setSuccess("");


            try {

                const response =
                    await api.post(
                        endpoint
                    );


                if (
                    response.data?.success
                ) {

                    /*
                    =====================================
                    UPDATE ATTENDANCE
                    =====================================
                    */

                    if (
                        response.data?.attendance
                    ) {

                        setAttendance(
                            response.data.attendance
                        );

                    }


                    /*
                    =====================================
                    SUCCESS MESSAGE
                    =====================================
                    */

                    setSuccess(
                        response.data?.message ||
                        successMessage
                    );


                    /*
                    =====================================
                    REFRESH HISTORY
                    =====================================
                    */

                    await loadHistory();

                } else {

                    setError(
                        response.data?.message ||
                        "Attendance action failed."
                    );

                }

            } catch (err) {

                console.error(
                    `${action} ERROR:`,
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Attendance action failed."
                );


                if (
                    err.response?.data?.attendance
                ) {

                    setAttendance(
                        err.response.data.attendance
                    );

                }

            } finally {

                setActionLoading("");

            }

        };


    /*
    =====================================================
    PUNCH IN
    =====================================================
    */

    const handlePunchIn = () => {

        performAction(
            "punch-in",
            "/hr-personal-attendance/punch-in",
            "Punched in successfully."
        );

    };


    /*
    =====================================================
    PUNCH OUT
    =====================================================
    */

    const handlePunchOut = () => {

        performAction(
            "punch-out",
            "/hr-personal-attendance/punch-out",
            "Punched out successfully."
        );

    };


    /*
    =====================================================
    START BREAK
    =====================================================
    */

    const handleStartBreak = () => {

        performAction(
            "break-start",
            "/hr-personal-attendance/break/start",
            "Break started successfully."
        );

    };


    /*
    =====================================================
    RESUME BREAK
    =====================================================
    */

    const handleResumeBreak = () => {

        performAction(
            "break-resume",
            "/hr-personal-attendance/break/resume",
            "Break completed."
        );

    };


    /*
    =====================================================
    START LUNCH
    =====================================================
    */

    const handleStartLunch = () => {

        performAction(
            "lunch-start",
            "/hr-personal-attendance/lunch/start",
            "Lunch started successfully."
        );

    };


    /*
    =====================================================
    RESUME LUNCH
    =====================================================
    */

    const handleResumeLunch = () => {

        performAction(
            "lunch-resume",
            "/hr-personal-attendance/lunch/resume",
            "Lunch completed."
        );

    };


    /*
    =====================================================
    ACTIVE BREAK
    =====================================================
    */

    const activeBreak =
        useMemo(() => {

            if (
                !Array.isArray(
                    attendance?.breaks
                )
            ) {
                return null;
            }


            return (
                attendance.breaks.find(
                    (item) =>
                        item?.start &&
                        !item?.end
                ) || null
            );

        }, [
            attendance,
        ]);


    /*
    =====================================================
    ACTIVE LUNCH
    =====================================================
    */

    const activeLunch =
        Boolean(
            attendance?.lunch?.start &&
            !attendance?.lunch?.end
        );


    /*
    =====================================================
    COMPLETED LUNCH
    =====================================================
    */

    const lunchCompleted =
        Boolean(
            attendance?.lunch?.start &&
            attendance?.lunch?.end
        );


    /*
    =====================================================
    ATTENDANCE COMPLETED
    =====================================================
    */

    const attendanceCompleted =
        Boolean(
            attendance?.punchIn &&
            attendance?.punchOut
        );


    /*
    =====================================================
    PUNCHED IN
    =====================================================
    */

    const isPunchedIn =
        Boolean(
            attendance?.punchIn
        );


    /*
    =====================================================
    CAN START BREAK
    =====================================================
    */

    const canStartBreak =
        isPunchedIn &&
        !attendance?.punchOut &&
        !activeBreak &&
        !activeLunch;


    /*
    =====================================================
    CAN RESUME BREAK
    =====================================================
    */

    const canResumeBreak =
        Boolean(activeBreak);


    /*
    =====================================================
    CAN START LUNCH
    =====================================================
    */

    const canStartLunch =
        isPunchedIn &&
        !attendance?.punchOut &&
        !activeBreak &&
        !activeLunch &&
        !lunchCompleted;


    /*
    =====================================================
    CAN RESUME LUNCH
    =====================================================
    */

    const canResumeLunch =
        activeLunch;


    /*
    =====================================================
    LIVE WORKING SECONDS
    =====================================================

    IMPORTANT FIX:

    Old logic:

        punchIn -> currentTime

    That incorrectly counts break/lunch.

    New logic:

        gross elapsed time
        - completed breaks
        - completed lunch
        - currently active break
        - currently active lunch

    Therefore the timer actually STOPS during
    break and lunch.
    =====================================================
    */

    const workingSeconds =
        useMemo(() => {

            /*
            =============================================
            NO ATTENDANCE
            =============================================
            */

            if (
                !attendance?.punchIn
            ) {

                return 0;

            }


            const punchInTime =
                new Date(
                    attendance.punchIn
                );


            if (
                Number.isNaN(
                    punchInTime.getTime()
                )
            ) {

                return 0;

            }


            /*
            =============================================
            IF PUNCHED OUT

            Backend already calculated final value.
            Use backend value.
            =============================================
            */

            if (
                attendance.punchOut
            ) {

                return Math.max(
                    0,
                    Number(
                        attendance.totalWorkingSeconds
                    ) || 0
                );

            }


            /*
            =============================================
            GROSS WORKING TIME

            Punch In -> NOW
            =============================================
            */

            const now =
                currentTime;


            let elapsedSeconds =
                Math.floor(
                    (
                        now.getTime() -
                        punchInTime.getTime()
                    ) / 1000
                );


            elapsedSeconds =
                Math.max(
                    0,
                    elapsedSeconds
                );


            /*
            =============================================
            SUBTRACT COMPLETED BREAKS

            These have already finished.
            =============================================
            */

            let completedBreakSeconds = 0;


            if (
                Array.isArray(
                    attendance.breaks
                )
            ) {

                attendance.breaks.forEach(
                    (item) => {

                        if (
                            item?.start &&
                            item?.end
                        ) {

                            const start =
                                new Date(
                                    item.start
                                );

                            const end =
                                new Date(
                                    item.end
                                );


                            if (
                                !Number.isNaN(
                                    start.getTime()
                                ) &&
                                !Number.isNaN(
                                    end.getTime()
                                ) &&
                                end > start
                            ) {

                                completedBreakSeconds +=
                                    Math.floor(
                                        (
                                            end.getTime() -
                                            start.getTime()
                                        ) / 1000
                                    );

                            }

                        }

                    }
                );

            }


            /*
            =============================================
            SUBTRACT COMPLETED LUNCH

            Lunch has already finished.
            =============================================
            */

            let completedLunchSeconds = 0;


            if (
                attendance?.lunch?.start &&
                attendance?.lunch?.end
            ) {

                const lunchStart =
                    new Date(
                        attendance.lunch.start
                    );

                const lunchEnd =
                    new Date(
                        attendance.lunch.end
                    );


                if (
                    !Number.isNaN(
                        lunchStart.getTime()
                    ) &&
                    !Number.isNaN(
                        lunchEnd.getTime()
                    ) &&
                    lunchEnd > lunchStart
                ) {

                    completedLunchSeconds =
                        Math.floor(
                            (
                                lunchEnd.getTime() -
                                lunchStart.getTime()
                            ) / 1000
                        );

                }

            }


            /*
            =============================================
            SUBTRACT ACTIVE BREAK

            This is the important part.

            If break started at 10:30 and current time
            is 10:45, remove those 15 minutes immediately.
            =============================================
            */

            let activeBreakSeconds = 0;


            if (
                activeBreak?.start
            ) {

                const breakStart =
                    new Date(
                        activeBreak.start
                    );


                if (
                    !Number.isNaN(
                        breakStart.getTime()
                    )
                ) {

                    activeBreakSeconds =
                        Math.floor(
                            (
                                now.getTime() -
                                breakStart.getTime()
                            ) / 1000
                        );

                    activeBreakSeconds =
                        Math.max(
                            0,
                            activeBreakSeconds
                        );

                }

            }


            /*
            =============================================
            SUBTRACT ACTIVE LUNCH

            If lunch started at 1:00 PM and current
            time is 1:30 PM, remove those 30 minutes.
            =============================================
            */

            let activeLunchSeconds = 0;


            if (
                activeLunch &&
                attendance?.lunch?.start
            ) {

                const lunchStart =
                    new Date(
                        attendance.lunch.start
                    );


                if (
                    !Number.isNaN(
                        lunchStart.getTime()
                    )
                ) {

                    activeLunchSeconds =
                        Math.floor(
                            (
                                now.getTime() -
                                lunchStart.getTime()
                            ) / 1000
                        );

                    activeLunchSeconds =
                        Math.max(
                            0,
                            activeLunchSeconds
                        );

                }

            }


            /*
            =============================================
            FINAL LIVE WORKING TIME
            =============================================
            */

            const totalExcludedSeconds =
                completedBreakSeconds +
                completedLunchSeconds +
                activeBreakSeconds +
                activeLunchSeconds;


            const finalWorkingSeconds =
                elapsedSeconds -
                totalExcludedSeconds;


            return Math.max(
                0,
                finalWorkingSeconds
            );

        }, [
            attendance,
            activeBreak,
            activeLunch,
            currentTime,
        ]);


    /*
    =====================================================
    BREAK MINUTES
    =====================================================
    */

    const breakMinutes =
        useMemo(() => {

            let total =
                Number(
                    attendance?.totalBreakMinutes
                ) || 0;


            /*
            Add currently active break
            to the displayed break total.
            */

            if (
                activeBreak?.start
            ) {

                const start =
                    new Date(
                        activeBreak.start
                    );


                const now =
                    currentTime;


                if (
                    !Number.isNaN(
                        start.getTime()
                    )
                ) {

                    const activeMinutes =
                        Math.floor(
                            (
                                now.getTime() -
                                start.getTime()
                            ) / 60000
                        );


                    total += Math.max(
                        0,
                        activeMinutes
                    );

                }

            }


            return Math.max(
                0,
                total
            );

        }, [
            attendance,
            activeBreak,
            currentTime,
        ]);


    /*
    =====================================================
    LUNCH MINUTES
    =====================================================
    */

    const lunchMinutes =
        useMemo(() => {

            let total =
                Number(
                    attendance?.totalLunchMinutes
                ) || 0;


            /*
            Add currently active lunch
            to displayed lunch time.
            */

            if (
                activeLunch &&
                attendance?.lunch?.start
            ) {

                const start =
                    new Date(
                        attendance.lunch.start
                    );


                const now =
                    currentTime;


                if (
                    !Number.isNaN(
                        start.getTime()
                    )
                ) {

                    const activeMinutes =
                        Math.floor(
                            (
                                now.getTime() -
                                start.getTime()
                            ) / 60000
                        );


                    total += Math.max(
                        0,
                        activeMinutes
                    );

                }

            }


            return Math.max(
                0,
                total
            );

        }, [
            attendance,
            activeLunch,
            currentTime,
        ]);


    /*
    =====================================================
    HR USER
    =====================================================
    */

    const hrUser =
        attendance?.hr || null;


    /*
    =====================================================
    INITIAL LOADING
    =====================================================
    */

    if (loading) {

        return (

            <div className="hr-personal-attendance-page">

                <div className="hr-personal-attendance-loading">

                    <Loader2
                        size={28}
                        className="hr-personal-spinner"
                    />

                    <span>
                        Loading attendance...
                    </span>

                </div>

            </div>

        );

    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="hr-personal-attendance-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-personal-header">

                <div>

                    <div className="hr-personal-title-row">

                        <CalendarDays
                            size={26}
                        />

                        <h1>
                            My Attendance
                        </h1>

                    </div>


                    <p>
                        Manage your daily HR attendance,
                        breaks and working hours.
                    </p>

                </div>


                <button
                    type="button"
                    className="hr-personal-refresh"
                    onClick={
                        refreshAttendance
                    }
                    disabled={
                        loading ||
                        historyLoading ||
                        Boolean(actionLoading)
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            historyLoading
                                ? "hr-personal-refresh-spin"
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

                <div className="hr-personal-message hr-personal-error">

                    <XCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        Close
                    </button>

                </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

                <div className="hr-personal-message hr-personal-success">

                    <CheckCircle2
                        size={18}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        Close
                    </button>

                </div>

            )}


            {/* =================================================
                TOP SECTION
            ================================================= */}

            <div className="hr-personal-top-grid">

                {/* =================================================
                    PROFILE
                ================================================= */}

                <div className="hr-personal-profile-card">

                    <div className="hr-personal-profile-image">

                        {hrUser?.profileImage ? (

                            <img
                                src={
                                    hrUser.profileImage
                                }
                                alt={
                                    hrUser?.name ||
                                    "HR"
                                }
                            />

                        ) : (

                            <UserRound
                                size={34}
                            />

                        )}

                    </div>


                    <div className="hr-personal-profile-info">

                        <h2>
                            {hrUser?.name ||
                                "HR"}
                        </h2>

                        <p>
                            {hrUser?.email ||
                                ""}
                        </p>

                        <span>
                            {hrUser?.role ||
                                "HR"}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    CLOCK
                ================================================= */}

                <div className="hr-personal-clock-card">

                    <Clock3
                        size={28}
                    />

                    <div>

                        <span>
                            Today
                        </span>

                        <strong>
                            {currentTime.toLocaleDateString(
                                "en-IN",
                                {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                }
                            )}
                        </strong>

                        <small>
                            {formatTime(
                                currentTime
                            )}
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hr-personal-summary">

                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <LogIn size={20} />
                    </div>

                    <span>
                        Punch In
                    </span>

                    <strong>
                        {formatTime(
                            attendance?.punchIn
                        )}
                    </strong>

                </div>


                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <LogOut size={20} />
                    </div>

                    <span>
                        Punch Out
                    </span>

                    <strong>
                        {formatTime(
                            attendance?.punchOut
                        )}
                    </strong>

                </div>


                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <Timer size={20} />
                    </div>

                    <span>
                        Working Time
                    </span>

                    <strong className={
                        activeBreak ||
                        activeLunch
                            ? "hr-working-paused"
                            : ""
                    }>
                        {formatWorkingTime(
                            workingSeconds
                        )}
                    </strong>

                    {activeBreak && (
                        <small className="hr-working-state">
                            Break paused
                        </small>
                    )}

                    {activeLunch && (
                        <small className="hr-working-state">
                            Lunch paused
                        </small>
                    )}

                </div>


                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <Coffee size={20} />
                    </div>

                    <span>
                        Break
                    </span>

                    <strong>
                        {formatMinutes(
                            breakMinutes
                        )}
                    </strong>

                </div>


                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <Utensils size={20} />
                    </div>

                    <span>
                        Lunch
                    </span>

                    <strong>
                        {formatMinutes(
                            lunchMinutes
                        )}
                    </strong>

                </div>


                <div className="hr-personal-summary-card">

                    <div className="hr-personal-summary-icon">
                        <CheckCircle2 size={20} />
                    </div>

                    <span>
                        Status
                    </span>

                    <strong
                        className={
                            attendance?.status
                                ? "hr-status-value"
                                : "hr-status-value neutral"
                        }
                    >
                        {activeBreak
                            ? "On Break"
                            : activeLunch
                                ? "On Lunch"
                                : attendance?.status ||
                                  "Not Started"}
                    </strong>

                </div>

            </div>


            {/* =================================================
                PUNCH ACTIONS
            ================================================= */}

            <div className="hr-personal-action-card">

                <div className="hr-personal-section-heading">

                    <div>

                        <h2>
                            Attendance Actions
                        </h2>

                        <p>
                            Record your working hours
                            for today.
                        </p>

                    </div>

                </div>


                <div className="hr-personal-action-grid">

                    {/* =================================================
                        PUNCH IN
                    ================================================= */}

                    <button
                        type="button"
                        className="hr-personal-action punch-in"
                        onClick={
                            handlePunchIn
                        }
                        disabled={
                            isPunchedIn ||
                            Boolean(
                                attendance?.punchOut
                            ) ||
                            Boolean(actionLoading)
                        }
                    >

                        {actionLoading ===
                        "punch-in" ? (

                            <Loader2
                                size={22}
                                className="hr-personal-button-spinner"
                            />

                        ) : (

                            <LogIn size={22} />

                        )}

                        <div>

                            <strong>
                                Punch In
                            </strong>

                            <span>
                                {isPunchedIn
                                    ? "Already punched in"
                                    : "Start your work day"}
                            </span>

                        </div>

                    </button>


                    {/* =================================================
                        PUNCH OUT
                    ================================================= */}

                    <button
                        type="button"
                        className="hr-personal-action punch-out"
                        onClick={
                            handlePunchOut
                        }
                        disabled={
                            !isPunchedIn ||
                            Boolean(
                                attendance?.punchOut
                            ) ||
                            Boolean(activeBreak) ||
                            activeLunch ||
                            Boolean(actionLoading)
                        }
                    >

                        {actionLoading ===
                        "punch-out" ? (

                            <Loader2
                                size={22}
                                className="hr-personal-button-spinner"
                            />

                        ) : (

                            <LogOut size={22} />

                        )}

                        <div>

                            <strong>
                                Punch Out
                            </strong>

                            <span>
                                {attendance?.punchOut
                                    ? "Attendance completed"
                                    : activeBreak
                                        ? "Resume break first"
                                        : activeLunch
                                            ? "Resume lunch first"
                                            : "End your work day"}
                            </span>

                        </div>

                    </button>

                </div>

            </div>


            {/* =================================================
                BREAK + LUNCH
            ================================================= */}

            <div className="hr-personal-break-grid">

                {/* =================================================
                    BREAK
                ================================================= */}

                <div className="hr-personal-control-card">

                    <div className="hr-personal-control-header">

                        <div className="hr-personal-control-icon">

                            <Coffee size={22} />

                        </div>

                        <div>

                            <h3>
                                Break
                            </h3>

                            <p>
                                Take and resume work
                                breaks.
                            </p>

                        </div>

                    </div>


                    <div className="hr-personal-control-status">

                        {activeBreak ? (

                            <span className="active">
                                Break is active
                            </span>

                        ) : (

                            <span>
                                {breakMinutes > 0
                                    ? `${formatMinutes(
                                        breakMinutes
                                    )} used`
                                    : "No break taken"}
                            </span>

                        )}

                    </div>


                    <div className="hr-personal-control-buttons">

                        {activeBreak ? (

                            <button
                                type="button"
                                className="hr-blue-button"
                                onClick={
                                    handleResumeBreak
                                }
                                disabled={
                                    Boolean(
                                        actionLoading
                                    )
                                }
                            >

                                {actionLoading ===
                                "break-resume" ? (

                                    <Loader2
                                        size={18}
                                        className="hr-personal-button-spinner"
                                    />

                                ) : (

                                    <Play size={18} />

                                )}

                                Resume Work

                            </button>

                        ) : (

                            <button
                                type="button"
                                className="hr-blue-button"
                                onClick={
                                    handleStartBreak
                                }
                                disabled={
                                    !canStartBreak ||
                                    Boolean(
                                        actionLoading
                                    )
                                }
                            >

                                {actionLoading ===
                                "break-start" ? (

                                    <Loader2
                                        size={18}
                                        className="hr-personal-button-spinner"
                                    />

                                ) : (

                                    <Coffee size={18} />

                                )}

                                Start Break

                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    LUNCH
                ================================================= */}

                <div className="hr-personal-control-card">

                    <div className="hr-personal-control-header">

                        <div className="hr-personal-control-icon">

                            <Utensils size={22} />

                        </div>

                        <div>

                            <h3>
                                Lunch
                            </h3>

                            <p>
                                Start and resume your
                                lunch break.
                            </p>

                        </div>

                    </div>


                    <div className="hr-personal-control-status">

                        {activeLunch ? (

                            <span className="active">
                                Lunch is active
                            </span>

                        ) : lunchCompleted ? (

                            <span>
                                Lunch completed
                            </span>

                        ) : (

                            <span>
                                {lunchMinutes > 0
                                    ? `${formatMinutes(
                                        lunchMinutes
                                    )} used`
                                    : "No lunch taken"}
                            </span>

                        )}

                    </div>


                    <div className="hr-personal-control-buttons">

                        {activeLunch ? (

                            <button
                                type="button"
                                className="hr-blue-button"
                                onClick={
                                    handleResumeLunch
                                }
                                disabled={
                                    Boolean(
                                        actionLoading
                                    )
                                }
                            >

                                {actionLoading ===
                                "lunch-resume" ? (

                                    <Loader2
                                        size={18}
                                        className="hr-personal-button-spinner"
                                    />

                                ) : (

                                    <Play size={18} />

                                )}

                                Resume Work

                            </button>

                        ) : (

                            <button
                                type="button"
                                className="hr-blue-button"
                                onClick={
                                    handleStartLunch
                                }
                                disabled={
                                    !canStartLunch ||
                                    Boolean(
                                        actionLoading
                                    )
                                }
                            >

                                {actionLoading ===
                                "lunch-start" ? (

                                    <Loader2
                                        size={18}
                                        className="hr-personal-button-spinner"
                                    />

                                ) : (

                                    <Utensils size={18} />

                                )}

                                Start Lunch

                            </button>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                TODAY DETAILS
            ================================================= */}

            <div className="hr-personal-details-card">

                <div className="hr-personal-section-heading">

                    <div>

                        <h2>
                            Today's Details
                        </h2>

                        <p>
                            Complete attendance information
                            for today.
                        </p>

                    </div>

                </div>


                {!attendance ? (

                    <div className="hr-personal-empty">

                        <Clock3 size={35} />

                        <h3>
                            Attendance not started
                        </h3>

                        <p>
                            Punch in to start recording
                            your attendance.
                        </p>

                    </div>

                ) : (

                    <div className="hr-personal-detail-grid">

                        <div className="hr-personal-detail-item">

                            <span>
                                Date
                            </span>

                            <strong>
                                {formatDate(
                                    attendance.date
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Punch In
                            </span>

                            <strong>
                                {formatTime(
                                    attendance.punchIn
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Punch Out
                            </span>

                            <strong>
                                {formatTime(
                                    attendance.punchOut
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Working Time
                            </span>

                            <strong>
                                {formatWorkingTime(
                                    workingSeconds
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Total Break
                            </span>

                            <strong>
                                {formatMinutes(
                                    breakMinutes
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Total Lunch
                            </span>

                            <strong>
                                {formatMinutes(
                                    lunchMinutes
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                {activeBreak
                                    ? "On Break"
                                    : activeLunch
                                        ? "On Lunch"
                                        : attendance.status ||
                                          "Present"}
                            </strong>

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                BREAK HISTORY
            ================================================= */}

            {attendance?.breaks?.length > 0 && (

                <div className="hr-personal-details-card">

                    <div className="hr-personal-section-heading">

                        <div>

                            <h2>
                                Today's Breaks
                            </h2>

                            <p>
                                Break start, resume and
                                duration details.
                            </p>

                        </div>

                    </div>


                    <div className="hr-personal-break-list">

                        {attendance.breaks.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    className="hr-personal-break-row"
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

                                            {formatShortTime(
                                                item.start
                                            )}

                                            {" - "}

                                            {item.end
                                                ? formatShortTime(
                                                    item.end
                                                )
                                                : "Active"}

                                        </strong>

                                    </div>


                                    <span
                                        className={
                                            item.end
                                                ? "hr-break-completed"
                                                : "hr-break-active"
                                        }
                                    >

                                        {item.end
                                            ? formatMinutes(
                                                item.durationMinutes
                                            )
                                            : activeBreak?.start
                                                ? formatMinutes(
                                                    Math.floor(
                                                        (
                                                            currentTime -
                                                            new Date(
                                                                item.start
                                                            )
                                                        ) / 60000
                                                    )
                                                )
                                                : "Active"}

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                LUNCH DETAILS
            ================================================= */}

            {attendance?.lunch?.start && (

                <div className="hr-personal-details-card">

                    <div className="hr-personal-section-heading">

                        <div>

                            <h2>
                                Today's Lunch
                            </h2>

                            <p>
                                Lunch start, resume and
                                duration details.
                            </p>

                        </div>

                    </div>


                    <div className="hr-personal-detail-grid">

                        <div className="hr-personal-detail-item">

                            <span>
                                Lunch Start
                            </span>

                            <strong>
                                {formatTime(
                                    attendance.lunch.start
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Lunch End
                            </span>

                            <strong>
                                {formatTime(
                                    attendance.lunch.end
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Lunch Duration
                            </span>

                            <strong>
                                {formatMinutes(
                                    lunchMinutes
                                )}
                            </strong>

                        </div>


                        <div className="hr-personal-detail-item">

                            <span>
                                Lunch Status
                            </span>

                            <strong>
                                {activeLunch
                                    ? "Active"
                                    : "Completed"}
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                ATTENDANCE HISTORY
            ================================================= */}

            <div className="hr-personal-history-card">

                <div className="hr-personal-section-heading">

                    <div>

                        <h2>
                            Attendance History
                        </h2>

                        <p>
                            Your previously recorded HR
                            attendance.
                        </p>

                    </div>

                </div>


                {historyLoading ? (

                    <div className="hr-personal-history-loading">

                        <Loader2
                            size={22}
                            className="hr-personal-spinner"
                        />

                        Loading history...

                    </div>

                ) : history.length === 0 ? (

                    <div className="hr-personal-empty">

                        <CalendarDays size={35} />

                        <h3>
                            No attendance history
                        </h3>

                        <p>
                            Your completed attendance
                            records will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="hr-personal-history-wrapper">

                        <table className="hr-personal-history-table">

                            <thead>

                                <tr>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Day
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
                                        Lunch
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {history.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                item._id ||
                                                index
                                            }
                                        >

                                            <td>
                                                {formatDate(
                                                    item.date
                                                )}
                                            </td>

                                            <td>
                                                {formatDay(
                                                    item.date
                                                )}
                                            </td>

                                            <td>
                                                {formatShortTime(
                                                    item.punchIn
                                                )}
                                            </td>

                                            <td>
                                                {formatShortTime(
                                                    item.punchOut
                                                )}
                                            </td>

                                            <td>
                                                {formatWorkingTime(
                                                    item.totalWorkingSeconds
                                                )}
                                            </td>

                                            <td>
                                                {formatMinutes(
                                                    item.totalBreakMinutes
                                                )}
                                            </td>

                                            <td>
                                                {formatMinutes(
                                                    item.totalLunchMinutes
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        `hr-personal-status ${
                                                            String(
                                                                item.status ||
                                                                ""
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\s+/g,
                                                                    "-"
                                                                )
                                                        }`
                                                    }
                                                >

                                                    {item.status ||
                                                        "Present"}

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                COMPLETED MESSAGE
            ================================================= */}

            {attendanceCompleted && (

                <div className="hr-personal-completed-banner">

                    <CheckCircle2 size={21} />

                    <div>

                        <strong>
                            Today's attendance is completed
                        </strong>

                        <span>
                            You punched out at{" "}
                            {formatTime(
                                attendance.punchOut
                            )}
                            .
                        </span>

                    </div>

                </div>

            )}

        </div>

    );

};


export default HRPersonalAttendance;