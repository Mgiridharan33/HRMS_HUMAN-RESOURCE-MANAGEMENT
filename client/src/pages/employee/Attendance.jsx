import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarCheck,
    Clock3,
    Coffee,
    LogIn,
    LogOut,
    Utensils,
    Play,
    Pause,
    RefreshCw,
} from "lucide-react";

import {
    useAuth,
} from "../../context/AuthContext";

import api from "../../services/api";

import "./Attendance.css";


/*
=========================================================
EMPLOYEE PERSONAL ATTENDANCE
=========================================================
*/

const EmployeeAttendance = () => {

    const {
        user,
        loading: authLoading,
    } = useAuth();


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

    const [actionLoading, setActionLoading] =
        useState("");

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [currentTime, setCurrentTime] =
        useState(new Date());


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

            clearInterval(timer);

        };

    }, []);


    /*
    =====================================================
    FORMAT TIME
    =====================================================
    */

    const formatTime = useCallback((date) => {

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


        return parsedDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            }
        );

    }, []);


    /*
    =====================================================
    FORMAT SHORT TIME
    =====================================================
    */

    const formatShortTime = useCallback((date) => {

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


        return parsedDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );

    }, []);


    /*
    =====================================================
    FORMAT DATE
    =====================================================
    */

    const formatDate = useCallback((date) => {

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

    }, []);


    /*
    =====================================================
    FORMAT DURATION
    =====================================================
    */

    const formatDuration = useCallback((seconds) => {

        const safeSeconds =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );


        const hours =
            Math.floor(
                safeSeconds / 3600
            );


        const minutes =
            Math.floor(
                (
                    safeSeconds % 3600
                ) / 60
            );


        const remainingSeconds =
            safeSeconds % 60;


        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remainingSeconds).padStart(2, "0")}`
        );

    }, []);


    /*
    =====================================================
    CALCULATE INTERVAL SECONDS
    =====================================================

    Safely calculates:

        end - start

    Never returns a negative number.
    =====================================================
    */

    const getIntervalSeconds = useCallback(
        (start, end) => {

            if (!start) {
                return 0;
            }


            const startTime =
                new Date(start);


            const endTime =
                end
                    ? new Date(end)
                    : new Date();


            if (
                Number.isNaN(
                    startTime.getTime()
                ) ||
                Number.isNaN(
                    endTime.getTime()
                )
            ) {
                return 0;
            }


            if (
                endTime <= startTime
            ) {
                return 0;
            }


            return Math.floor(
                (
                    endTime -
                    startTime
                ) / 1000
            );

        },
        []
    );


    /*
    =====================================================
    CALCULATE BREAK SECONDS
    =====================================================
    */

    const calculateBreakSeconds = useCallback(
        (
            attendanceRecord,
            calculationEnd
        ) => {

            if (
                !attendanceRecord?.breaks?.length
            ) {
                return 0;
            }


            let totalSeconds = 0;


            attendanceRecord.breaks.forEach(
                (item) => {

                    if (!item?.start) {
                        return;
                    }


                    const start =
                        new Date(
                            item.start
                        );


                    const end =
                        item.end
                            ? new Date(item.end)
                            : calculationEnd;


                    if (
                        Number.isNaN(
                            start.getTime()
                        ) ||
                        Number.isNaN(
                            end.getTime()
                        )
                    ) {
                        return;
                    }


                    if (
                        end <= start
                    ) {
                        return;
                    }


                    totalSeconds +=
                        Math.floor(
                            (
                                end -
                                start
                            ) / 1000
                        );

                }
            );


            return Math.max(
                0,
                totalSeconds
            );

        },
        []
    );


    /*
    =====================================================
    CALCULATE LUNCH SECONDS
    =====================================================
    */

    const calculateLunchSeconds = useCallback(
        (
            attendanceRecord,
            calculationEnd
        ) => {

            if (
                !attendanceRecord?.lunch?.start
            ) {
                return 0;
            }


            const start =
                new Date(
                    attendanceRecord.lunch.start
                );


            const end =
                attendanceRecord.lunch.end
                    ? new Date(
                        attendanceRecord.lunch.end
                    )
                    : calculationEnd;


            if (
                Number.isNaN(
                    start.getTime()
                ) ||
                Number.isNaN(
                    end.getTime()
                )
            ) {
                return 0;
            }


            if (
                end <= start
            ) {
                return 0;
            }


            return Math.max(
                0,
                Math.floor(
                    (
                        end -
                        start
                    ) / 1000
                )
            );

        },
        []
    );


    /*
    =====================================================
    CALCULATE NET WORKING SECONDS
    =====================================================

    IMPORTANT:

    Gross:
        punchIn → punchOut/current time

    Minus:
        break time

    Minus:
        lunch time

    Result:
        REAL WORKING TIME
    =====================================================
    */

    const calculateWorkingSeconds = useCallback(
        (
            attendanceRecord,
            now = new Date()
        ) => {

            if (
                !attendanceRecord?.punchIn
            ) {
                return 0;
            }


            const punchIn =
                new Date(
                    attendanceRecord.punchIn
                );


            if (
                Number.isNaN(
                    punchIn.getTime()
                )
            ) {
                return 0;
            }


            /*
            ---------------------------------------------
            END TIME
            ---------------------------------------------
            */

            let calculationEnd =
                now;


            /*
            If punched out, FREEZE the timer.
            */

            if (
                attendanceRecord.punchOut
            ) {

                const punchOut =
                    new Date(
                        attendanceRecord.punchOut
                    );


                if (
                    !Number.isNaN(
                        punchOut.getTime()
                    )
                ) {

                    calculationEnd =
                        punchOut;

                }

            }


            /*
            ---------------------------------------------
            PROTECTION
            ---------------------------------------------
            */

            if (
                calculationEnd <= punchIn
            ) {
                return 0;
            }


            /*
            ---------------------------------------------
            GROSS WORKING TIME
            ---------------------------------------------
            */

            const grossSeconds =
                Math.floor(
                    (
                        calculationEnd -
                        punchIn
                    ) / 1000
                );


            /*
            ---------------------------------------------
            BREAK TIME
            ---------------------------------------------
            */

            const breakSeconds =
                calculateBreakSeconds(
                    attendanceRecord,
                    calculationEnd
                );


            /*
            ---------------------------------------------
            LUNCH TIME
            ---------------------------------------------
            */

            const lunchSeconds =
                calculateLunchSeconds(
                    attendanceRecord,
                    calculationEnd
                );


            /*
            ---------------------------------------------
            NET WORKING TIME
            ---------------------------------------------
            */

            const netWorkingSeconds =
                grossSeconds -
                breakSeconds -
                lunchSeconds;


            /*
            Never allow negative time.
            */

            return Math.max(
                0,
                netWorkingSeconds
            );

        },
        [
            calculateBreakSeconds,
            calculateLunchSeconds,
        ]
    );


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
                            "/attendance/today"
                        );


                    if (
                        response.data?.success
                    ) {

                        setAttendance(
                            response.data.attendance ||
                            null
                        );

                    } else {

                        setAttendance(null);

                    }

                } catch (error) {

                    console.error(
                        "LOAD TODAY ATTENDANCE ERROR:",
                        error
                    );


                    setError(
                        error.response?.data?.message ||
                        "Failed to load today's attendance."
                    );

                }

            },
            []
        );


    /*
    =====================================================
    LOAD ATTENDANCE HISTORY
    =====================================================
    */

    const loadAttendanceHistory =
        useCallback(
            async () => {

                try {

                    const response =
                        await api.get(
                            "/attendance/history"
                        );


                    if (
                        response.data?.success
                    ) {

                        setHistory(
                            Array.isArray(
                                response.data.attendance
                            )
                                ? response.data.attendance
                                : []
                        );

                    } else {

                        setHistory([]);

                    }

                } catch (error) {

                    console.error(
                        "LOAD ATTENDANCE HISTORY ERROR:",
                        error
                    );

                }

            },
            []
        );


    /*
    =====================================================
    LOAD ALL DATA
    =====================================================
    */

    const loadData =
        useCallback(
            async () => {

                if (
                    authLoading ||
                    !user
                ) {
                    return;
                }


                try {

                    setLoading(true);

                    setError("");


                    await Promise.all([
                        loadTodayAttendance(),
                        loadAttendanceHistory(),
                    ]);

                } catch (error) {

                    console.error(
                        "LOAD ATTENDANCE DATA ERROR:",
                        error
                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                authLoading,
                user,
                loadTodayAttendance,
                loadAttendanceHistory,
            ]
        );


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(() => {

        if (
            authLoading ||
            !user
        ) {
            return;
        }


        loadData();

    }, [
        authLoading,
        user,
        loadData,
    ]);


    /*
    =====================================================
    AUTO REFRESH

    Database refresh every 30 seconds.
    =====================================================
    */

    useEffect(() => {

        if (
            authLoading ||
            !user
        ) {
            return;
        }


        const refreshTimer =
            setInterval(() => {

                loadTodayAttendance();

                loadAttendanceHistory();

            }, 30000);


        return () => {

            clearInterval(
                refreshTimer
            );

        };

    }, [
        authLoading,
        user,
        loadTodayAttendance,
        loadAttendanceHistory,
    ]);


    /*
    =====================================================
    ACTIVE BREAK
    =====================================================
    */

    const activeBreak =
        useMemo(() => {

            if (
                !attendance?.breaks?.length
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
    LAST BREAK
    =====================================================
    */

    const lastBreak =
        useMemo(() => {

            if (
                !attendance?.breaks?.length
            ) {
                return null;
            }


            return (
                attendance.breaks[
                    attendance.breaks.length - 1
                ] || null
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
        useMemo(() => {

            return Boolean(
                attendance?.lunch?.start &&
                !attendance?.lunch?.end
            );

        }, [
            attendance,
        ]);


    /*
    =====================================================
    TOTAL BREAK SECONDS
    =====================================================
    */

    const totalBreakSeconds =
        useMemo(() => {

            return calculateBreakSeconds(
                attendance,
                currentTime
            );

        }, [
            attendance,
            currentTime,
            calculateBreakSeconds,
        ]);


    /*
    =====================================================
    TOTAL BREAK MINUTES
    =====================================================
    */

    const totalBreakMinutes =
        Math.floor(
            totalBreakSeconds / 60
        );


    /*
    =====================================================
    TOTAL LUNCH SECONDS
    =====================================================
    */

    const totalLunchSeconds =
        useMemo(() => {

            return calculateLunchSeconds(
                attendance,
                currentTime
            );

        }, [
            attendance,
            currentTime,
            calculateLunchSeconds,
        ]);


    /*
    =====================================================
    TOTAL LUNCH MINUTES
    =====================================================
    */

    const totalLunchMinutes =
        Math.floor(
            totalLunchSeconds / 60
        );


    /*
    =====================================================
    LIVE WORKING TIME
    =====================================================
    */

    const workingSeconds =
        useMemo(() => {

            return calculateWorkingSeconds(
                attendance,
                currentTime
            );

        }, [
            attendance,
            currentTime,
            calculateWorkingSeconds,
        ]);


    /*
    =====================================================
    STATUS
    =====================================================
    */

    const status =
        useMemo(() => {

            if (!attendance) {

                return "NOT_STARTED";

            }


            if (
                attendance.punchOut
            ) {

                return "COMPLETED";

            }


            if (
                activeLunch
            ) {

                return "LUNCH";

            }


            if (
                activeBreak
            ) {

                return "BREAK";

            }


            if (
                attendance.punchIn
            ) {

                return "WORKING";

            }


            return "NOT_STARTED";

        }, [
            attendance,
            activeBreak,
            activeLunch,
        ]);


    /*
    =====================================================
    STATUS LABEL
    =====================================================
    */

    const getStatusLabel = () => {

        switch (status) {

            case "WORKING":
                return "Working";

            case "BREAK":
                return "On Break";

            case "LUNCH":
                return "Lunch Break";

            case "COMPLETED":
                return "Day Completed";

            default:
                return "Not Started";

        }

    };


    /*
    =====================================================
    BUTTON CONDITIONS
    =====================================================
    */

    const canPunchIn =
        !attendance?.punchIn;


    const canPunchOut =
        Boolean(
            attendance?.punchIn &&
            !attendance?.punchOut &&
            status === "WORKING"
        );


    const canStartBreak =
        Boolean(
            attendance?.punchIn &&
            !attendance?.punchOut &&
            status === "WORKING" &&
            !activeBreak &&
            !activeLunch
        );


    const canResumeBreak =
        Boolean(
            attendance?.punchIn &&
            !attendance?.punchOut &&
            activeBreak &&
            status === "BREAK"
        );


    const canStartLunch =
        Boolean(
            attendance?.punchIn &&
            !attendance?.punchOut &&
            status === "WORKING" &&
            !activeBreak &&
            !activeLunch
        );


    const canResumeLunch =
        Boolean(
            attendance?.punchIn &&
            !attendance?.punchOut &&
            activeLunch &&
            status === "LUNCH"
        );


    /*
    =====================================================
    ATTENDANCE ACTION
    =====================================================
    */

    const handleAttendanceAction =
        async (action) => {

            if (
                actionLoading
            ) {
                return;
            }


            let endpoint = "";


            switch (action) {

                case "punch-in":

                    endpoint =
                        "/attendance/punch-in";

                    break;


                case "punch-out":

                    endpoint =
                        "/attendance/punch-out";

                    break;


                case "break-start":

                    endpoint =
                        "/attendance/break/start";

                    break;


                case "break-resume":

                    endpoint =
                        "/attendance/break/resume";

                    break;


                case "lunch-start":

                    endpoint =
                        "/attendance/lunch/start";

                    break;


                case "lunch-resume":

                    endpoint =
                        "/attendance/lunch/resume";

                    break;


                default:

                    return;

            }


            try {

                setActionLoading(
                    action
                );

                setError("");

                setSuccessMessage("");


                const response =
                    await api.post(
                        endpoint
                    );


                if (
                    response.data?.success
                ) {

                    /*
                    Immediately use backend attendance.
                    */

                    if (
                        response.data?.attendance
                    ) {

                        setAttendance(
                            response.data.attendance
                        );

                    } else {

                        /*
                        Fallback refresh.
                        */

                        await loadTodayAttendance();

                    }


                    /*
                    Refresh history after action.
                    */

                    await loadAttendanceHistory();


                    setSuccessMessage(
                        response.data.message ||
                        "Attendance updated successfully."
                    );

                } else {

                    setError(
                        response.data?.message ||
                        "Attendance action failed."
                    );

                }

            } catch (error) {

                console.error(
                    "ATTENDANCE ACTION ERROR:",
                    error
                );


                /*
                If backend returns updated
                attendance together with an error,
                preserve it.
                */

                if (
                    error.response?.data?.attendance
                ) {

                    setAttendance(
                        error.response.data.attendance
                    );

                }


                setError(
                    error.response?.data?.message ||
                    "Attendance action failed."
                );

            } finally {

                setActionLoading("");

            }

        };


    /*
    =====================================================
    CLEAR SUCCESS MESSAGE
    =====================================================
    */

    useEffect(() => {

        if (
            !successMessage
        ) {
            return;
        }


        const timer =
            setTimeout(() => {

                setSuccessMessage("");

            }, 4000);


        return () => {

            clearTimeout(timer);

        };

    }, [
        successMessage,
    ]);


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (
        authLoading ||
        loading
    ) {

        return (

            <div className="employee-attendance-loading">

                <RefreshCw
                    size={22}
                    className="attendance-loading-icon"
                />

                <span>
                    Loading attendance...
                </span>

            </div>

        );

    }


    /*
    =====================================================
    USER CHECK
    =====================================================
    */

    if (!user) {

        return (

            <div className="employee-attendance-loading">

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

        <div className="employee-attendance-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-attendance-header">

                <div>

                    <h1>
                        Attendance
                    </h1>

                    <p>
                        Track your working hours,
                        breaks and daily attendance.
                    </p>

                </div>


                <div className="attendance-current-time">

                    <Clock3
                        size={18}
                    />

                    <span>
                        {formatTime(
                            currentTime
                        )}
                    </span>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="attendance-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => {

                            setError("");

                            loadData();

                        }}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (

                <div className="attendance-success">

                    <CalendarCheck
                        size={18}
                    />

                    <span>
                        {successMessage}
                    </span>

                </div>

            )}


            {/* =================================================
                TODAY MAIN CARD
            ================================================= */}

            <div className="attendance-main-card">


                {/* =================================================
                    TOP
                ================================================= */}

                <div className="attendance-main-top">

                    <div>

                        <span className="attendance-date">

                            {currentTime.toLocaleDateString(
                                "en-IN",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            )}

                        </span>


                        <h2>
                            Today's Attendance
                        </h2>

                    </div>


                    <span
                        className={
                            `attendance-status attendance-status-${status.toLowerCase()}`
                        }
                    >

                        {getStatusLabel()}

                    </span>

                </div>


                {/* =================================================
                    WORK TIMER
                ================================================= */}

                <div className="attendance-work-timer">

                    <span>
                        Net Working Time
                    </span>


                    <strong>
                        {formatDuration(
                            workingSeconds
                        )}
                    </strong>


                    <small>

                        {status === "WORKING"

                            ? "Your work timer is running"

                            : status === "BREAK"

                                ? "Break time is excluded from working time"

                                : status === "LUNCH"

                                    ? "Lunch time is excluded from working time"

                                    : status === "COMPLETED"

                                        ? "Today's work is completed"

                                        : "Punch in to start working"

                        }

                    </small>

                </div>


                {/* =================================================
                    PUNCH BUTTONS
                ================================================= */}

                <div className="attendance-punch-section">


                    {/* PUNCH IN */}

                    {canPunchIn && (

                        <button
                            type="button"
                            className="attendance-punch-button punch-in"
                            onClick={() =>
                                handleAttendanceAction(
                                    "punch-in"
                                )
                            }
                            disabled={
                                Boolean(actionLoading)
                            }
                        >

                            {actionLoading === "punch-in" ? (

                                <RefreshCw
                                    size={23}
                                    className="attendance-button-spinner"
                                />

                            ) : (

                                <LogIn
                                    size={23}
                                />

                            )}


                            <span>

                                {actionLoading === "punch-in"
                                    ? "Punching In..."
                                    : "Punch In"}

                            </span>

                        </button>

                    )}


                    {/* PUNCH OUT */}

                    {canPunchOut && (

                        <button
                            type="button"
                            className="attendance-punch-button punch-out"
                            onClick={() =>
                                handleAttendanceAction(
                                    "punch-out"
                                )
                            }
                            disabled={
                                Boolean(actionLoading)
                            }
                        >

                            {actionLoading === "punch-out" ? (

                                <RefreshCw
                                    size={23}
                                    className="attendance-button-spinner"
                                />

                            ) : (

                                <LogOut
                                    size={23}
                                />

                            )}


                            <span>

                                {actionLoading === "punch-out"
                                    ? "Punching Out..."
                                    : "Punch Out"}

                            </span>

                        </button>

                    )}


                    {/* COMPLETED */}

                    {attendance?.punchOut && (

                        <div className="attendance-completed-message">

                            <CalendarCheck
                                size={22}
                            />

                            <span>
                                Attendance completed
                                for today.
                            </span>

                        </div>

                    )}

                </div>


                {/* =================================================
                    BREAK / LUNCH
                ================================================= */}

                {attendance?.punchIn &&
                    !attendance?.punchOut && (

                        <div className="attendance-pause-section">


                            {/* BREAK */}

                            <div
                                className={
                                    `attendance-pause-card ${
                                        status === "BREAK"
                                            ? "pause-active"
                                            : ""
                                    }`
                                }
                            >

                                <div className="attendance-pause-icon break-icon">

                                    <Coffee
                                        size={22}
                                    />

                                </div>


                                <div className="attendance-pause-info">

                                    <h3>
                                        Tea / Break
                                    </h3>


                                    <p>

                                        {status === "BREAK"

                                            ? "Your break is currently active"

                                            : lastBreak?.end

                                                ? `Last break ended at ${formatTime(
                                                    lastBreak.end
                                                )}`

                                                : attendance?.breaks?.length

                                                    ? `${attendance.breaks.length} break${
                                                        attendance.breaks.length > 1
                                                            ? "s"
                                                            : ""
                                                    } taken`

                                                    : "Take a short break"

                                        }

                                    </p>

                                </div>


                                {status === "BREAK" ? (

                                    <button
                                        type="button"
                                        className="attendance-pause-button resume"
                                        onClick={() =>
                                            handleAttendanceAction(
                                                "break-resume"
                                            )
                                        }
                                        disabled={
                                            Boolean(actionLoading) ||
                                            !canResumeBreak
                                        }
                                    >

                                        {actionLoading === "break-resume" ? (

                                            <RefreshCw
                                                size={17}
                                                className="attendance-button-spinner"
                                            />

                                        ) : (

                                            <Play
                                                size={17}
                                            />

                                        )}

                                        {actionLoading === "break-resume"
                                            ? "Resuming..."
                                            : "Resume"}

                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className="attendance-pause-button break"
                                        onClick={() =>
                                            handleAttendanceAction(
                                                "break-start"
                                            )
                                        }
                                        disabled={
                                            Boolean(actionLoading) ||
                                            !canStartBreak
                                        }
                                    >

                                        {actionLoading === "break-start" ? (

                                            <RefreshCw
                                                size={17}
                                                className="attendance-button-spinner"
                                            />

                                        ) : (

                                            <Pause
                                                size={17}
                                            />

                                        )}

                                        {actionLoading === "break-start"
                                            ? "Starting..."
                                            : "Break"}

                                    </button>

                                )}

                            </div>


                            {/* LUNCH */}

                            <div
                                className={
                                    `attendance-pause-card ${
                                        status === "LUNCH"
                                            ? "pause-active"
                                            : ""
                                    }`
                                }
                            >

                                <div className="attendance-pause-icon lunch-icon">

                                    <Utensils
                                        size={22}
                                    />

                                </div>


                                <div className="attendance-pause-info">

                                    <h3>
                                        Lunch
                                    </h3>


                                    <p>

                                        {status === "LUNCH"

                                            ? "Your lunch break is active"

                                            : attendance?.lunch?.end

                                                ? `Lunch ended at ${formatTime(
                                                    attendance.lunch.end
                                                )}`

                                                : attendance?.lunch?.start

                                                    ? "Lunch completed"

                                                    : "Take your lunch break"

                                        }

                                    </p>

                                </div>


                                {status === "LUNCH" ? (

                                    <button
                                        type="button"
                                        className="attendance-pause-button resume"
                                        onClick={() =>
                                            handleAttendanceAction(
                                                "lunch-resume"
                                            )
                                        }
                                        disabled={
                                            Boolean(actionLoading) ||
                                            !canResumeLunch
                                        }
                                    >

                                        {actionLoading === "lunch-resume" ? (

                                            <RefreshCw
                                                size={17}
                                                className="attendance-button-spinner"
                                            />

                                        ) : (

                                            <Play
                                                size={17}
                                            />

                                        )}

                                        {actionLoading === "lunch-resume"
                                            ? "Resuming..."
                                            : "Resume"}

                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className="attendance-pause-button lunch"
                                        onClick={() =>
                                            handleAttendanceAction(
                                                "lunch-start"
                                            )
                                        }
                                        disabled={
                                            Boolean(actionLoading) ||
                                            !canStartLunch
                                        }
                                    >

                                        {actionLoading === "lunch-start" ? (

                                            <RefreshCw
                                                size={17}
                                                className="attendance-button-spinner"
                                            />

                                        ) : (

                                            <Pause
                                                size={17}
                                            />

                                        )}

                                        {actionLoading === "lunch-start"
                                            ? "Starting..."
                                            : "Lunch"}

                                    </button>

                                )}

                            </div>

                        </div>

                    )}

            </div>


            {/* =================================================
                TODAY SUMMARY
            ================================================= */}

            <div className="attendance-details-card">

                <div className="attendance-card-title">

                    <div>

                        <h2>
                            Today's Details
                        </h2>

                        <p>
                            Your punch and break timings.
                        </p>

                    </div>


                    <Clock3
                        size={20}
                    />

                </div>


                <div className="attendance-details-grid">


                    <div className="attendance-detail">

                        <span>
                            Punch In
                        </span>

                        <strong>
                            {formatTime(
                                attendance?.punchIn
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Punch Out
                        </span>

                        <strong>
                            {formatTime(
                                attendance?.punchOut
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Last Break Start
                        </span>

                        <strong>
                            {formatTime(
                                lastBreak?.start
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Last Break End
                        </span>

                        <strong>
                            {formatTime(
                                lastBreak?.end
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Lunch Start
                        </span>

                        <strong>
                            {formatTime(
                                attendance?.lunch?.start
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Lunch End
                        </span>

                        <strong>
                            {formatTime(
                                attendance?.lunch?.end
                            )}
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Break Time
                        </span>

                        <strong>
                            {totalBreakMinutes} min
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Lunch Time
                        </span>

                        <strong>
                            {totalLunchMinutes} min
                        </strong>

                    </div>


                    <div className="attendance-detail">

                        <span>
                            Net Working Time
                        </span>

                        <strong>
                            {formatDuration(
                                workingSeconds
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                BREAK HISTORY
            ================================================= */}

            {attendance?.breaks?.length > 0 && (

                <div className="attendance-details-card">

                    <div className="attendance-card-title">

                        <div>

                            <h2>
                                Break History
                            </h2>

                            <p>
                                Today's tea and short breaks.
                            </p>

                        </div>


                        <Coffee
                            size={20}
                        />

                    </div>


                    <div className="attendance-break-history">

                        {attendance.breaks.map(
                            (item, index) => {

                                const breakSeconds =
                                    getIntervalSeconds(
                                        item.start,
                                        item.end ||
                                        currentTime
                                    );


                                return (

                                    <div
                                        key={
                                            item._id ||
                                            `${item.start}-${index}`
                                        }
                                        className="attendance-break-history-item"
                                    >

                                        <div className="attendance-break-number">

                                            {index + 1}

                                        </div>


                                        <div>

                                            <span>
                                                Break {index + 1}
                                            </span>

                                            <strong>

                                                {formatShortTime(
                                                    item.start
                                                )}

                                                {" → "}

                                                {item.end
                                                    ? formatShortTime(
                                                        item.end
                                                    )
                                                    : "Active"}

                                            </strong>

                                        </div>


                                        <small>

                                            {item.end

                                                ? `${Math.floor(
                                                    breakSeconds / 60
                                                )} min`

                                                : "Active"

                                            }

                                        </small>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                ATTENDANCE HISTORY
            ================================================= */}

            <div className="attendance-history-card">

                <div className="attendance-card-title">

                    <div>

                        <h2>
                            Attendance History
                        </h2>

                        <p>
                            Your recent attendance records.
                        </p>

                    </div>


                    <CalendarCheck
                        size={20}
                    />

                </div>


                <div className="attendance-history-table-wrapper">

                    <table className="attendance-history-table">

                        <thead>

                            <tr>

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
                                    Breaks
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

                            {history.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="attendance-empty"
                                    >

                                        No attendance records found.

                                    </td>

                                </tr>

                            ) : (

                                history.map(
                                    (record) => {

                                        /*
                                        -----------------------------------------
                                        HISTORY BREAK TIME
                                        -----------------------------------------
                                        */

                                        const recordBreakSeconds =
                                            calculateBreakSeconds(
                                                record,
                                                record.punchOut
                                                    ? new Date(
                                                        record.punchOut
                                                    )
                                                    : new Date(
                                                        record.date ||
                                                        record.createdAt
                                                    )
                                            );


                                        /*
                                        -----------------------------------------
                                        HISTORY LUNCH TIME
                                        -----------------------------------------
                                        */

                                        const recordLunchSeconds =
                                            calculateLunchSeconds(
                                                record,
                                                record.punchOut
                                                    ? new Date(
                                                        record.punchOut
                                                    )
                                                    : new Date(
                                                        record.date ||
                                                        record.createdAt
                                                    )
                                            );


                                        /*
                                        -----------------------------------------
                                        HISTORY WORKING TIME
                                        -----------------------------------------

                                        IMPORTANT:

                                        Do NOT trust
                                        record.totalWorkingSeconds
                                        for display.

                                        Recalculate it from:

                                        Punch In
                                        -
                                        Punch Out
                                        -
                                        Breaks
                                        -
                                        Lunch
                                        -----------------------------------------
                                        */

                                        const recordWorkingSeconds =
                                            calculateWorkingSeconds(
                                                record,
                                                record.punchOut
                                                    ? new Date(
                                                        record.punchOut
                                                    )
                                                    : new Date(
                                                        record.date ||
                                                        record.createdAt
                                                    )
                                            );


                                        const recordBreakMinutes =
                                            Math.floor(
                                                recordBreakSeconds / 60
                                            );


                                        const recordLunchMinutes =
                                            Math.floor(
                                                recordLunchSeconds / 60
                                            );


                                        return (

                                            <tr
                                                key={
                                                    record._id
                                                }
                                            >

                                                <td>

                                                    {formatDate(
                                                        record.date ||
                                                        record.createdAt
                                                    )}

                                                </td>


                                                <td>

                                                    {formatShortTime(
                                                        record.punchIn
                                                    )}

                                                </td>


                                                <td>

                                                    {formatShortTime(
                                                        record.punchOut
                                                    )}

                                                </td>


                                                <td>

                                                    {recordWorkingSeconds > 0

                                                        ? formatDuration(
                                                            recordWorkingSeconds
                                                        )

                                                        : "—"

                                                    }

                                                </td>


                                                <td>

                                                    {recordBreakMinutes > 0

                                                        ? `${recordBreakMinutes} min`

                                                        : "—"

                                                    }

                                                </td>


                                                <td>

                                                    {recordLunchMinutes > 0

                                                        ? `${recordLunchMinutes} min`

                                                        : "—"

                                                    }

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `history-status ${
                                                                record.status
                                                                    ? String(
                                                                        record.status
                                                                    )
                                                                        .toLowerCase()
                                                                        .replace(
                                                                            /\s+/g,
                                                                            "-"
                                                                        )
                                                                    : "present"
                                                            }`
                                                        }
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

        </div>

    );

};


export default EmployeeAttendance;