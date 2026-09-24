const HRAttendance = require("../models/HRAttendance");

/*
=====================================================
DATE HELPERS
=====================================================
*/

const getStartOfToday = () => {
    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
    );
};

const getEndOfToday = () => {
    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
    );
};


/*
=====================================================
FIND TODAY ATTENDANCE
=====================================================
*/

const findTodayAttendance = async (hrId) => {

    const startOfDay = getStartOfToday();
    const endOfDay = getEndOfToday();

    return await HRAttendance.findOne({
        hr: hrId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    });
};


/*
=====================================================
CALCULATE COMPLETED BREAK SECONDS
=====================================================
*/

const getCompletedBreakSeconds = (attendance) => {

    let total = 0;

    if (!attendance?.breaks) {
        return 0;
    }

    attendance.breaks.forEach((item) => {

        if (item.start && item.end) {

            const start =
                new Date(item.start).getTime();

            const end =
                new Date(item.end).getTime();

            if (end > start) {

                total += Math.floor(
                    (end - start) / 1000
                );
            }
        }
    });

    return Math.max(0, total);
};


/*
=====================================================
GET COMPLETED LUNCH SECONDS
=====================================================
*/

const getCompletedLunchSeconds = (attendance) => {

    if (
        !attendance?.lunch?.start ||
        !attendance?.lunch?.end
    ) {
        return 0;
    }

    const start =
        new Date(
            attendance.lunch.start
        ).getTime();

    const end =
        new Date(
            attendance.lunch.end
        ).getTime();

    if (end <= start) {
        return 0;
    }

    return Math.floor(
        (end - start) / 1000
    );
};


/*
=====================================================
GET ACTIVE BREAK SECONDS
=====================================================
*/

const getActiveBreakSeconds = (attendance, now) => {

    if (!attendance?.breaks) {
        return 0;
    }

    let total = 0;

    attendance.breaks.forEach((item) => {

        if (
            item.start &&
            !item.end
        ) {

            const start =
                new Date(item.start).getTime();

            const current =
                now.getTime();

            if (current > start) {

                total += Math.floor(
                    (current - start) / 1000
                );
            }
        }
    });

    return Math.max(0, total);
};


/*
=====================================================
GET ACTIVE LUNCH SECONDS
=====================================================
*/

const getActiveLunchSeconds = (
    attendance,
    now
) => {

    if (
        !attendance?.lunch?.start ||
        attendance?.lunch?.end
    ) {
        return 0;
    }

    const start =
        new Date(
            attendance.lunch.start
        ).getTime();

    const current =
        now.getTime();

    if (current <= start) {
        return 0;
    }

    return Math.floor(
        (current - start) / 1000
    );
};


/*
=====================================================
CALCULATE LIVE WORKING SECONDS

IMPORTANT:

Gross time
-
completed breaks
-
completed lunch
-
active break
-
active lunch

=====================================================
*/

const calculateLiveWorkingSeconds = (
    attendance
) => {

    if (!attendance?.punchIn) {
        return 0;
    }

    const punchIn =
        new Date(
            attendance.punchIn
        ).getTime();

    const now =
        attendance.punchOut
            ? new Date(
                attendance.punchOut
            )
            : new Date();

    const currentTime =
        now.getTime();

    if (currentTime <= punchIn) {
        return 0;
    }

    /*
    ================================================
    GROSS TIME
    ================================================
    */

    let workingSeconds =
        Math.floor(
            (currentTime - punchIn) / 1000
        );


    /*
    ================================================
    COMPLETED BREAKS
    ================================================
    */

    const completedBreakSeconds =
        getCompletedBreakSeconds(
            attendance
        );

    workingSeconds -=
        completedBreakSeconds;


    /*
    ================================================
    COMPLETED LUNCH
    ================================================
    */

    const completedLunchSeconds =
        getCompletedLunchSeconds(
            attendance
        );

    workingSeconds -=
        completedLunchSeconds;


    /*
    ================================================
    ACTIVE BREAK

    This is the important part.

    While break is active, subtract:

    current time - break start
    ================================================
    */

    const activeBreakSeconds =
        attendance.punchOut
            ? 0
            : getActiveBreakSeconds(
                attendance,
                new Date()
            );

    workingSeconds -=
        activeBreakSeconds;


    /*
    ================================================
    ACTIVE LUNCH
    ================================================
    */

    const activeLunchSeconds =
        attendance.punchOut
            ? 0
            : getActiveLunchSeconds(
                attendance,
                new Date()
            );

    workingSeconds -=
        activeLunchSeconds;


    return Math.max(
        0,
        workingSeconds
    );
};


/*
=====================================================
ATTACH LIVE CALCULATED VALUES
=====================================================
*/

const attachLiveWorkingTime = (
    attendance
) => {

    if (!attendance) {
        return attendance;
    }

    const workingSeconds =
        calculateLiveWorkingSeconds(
            attendance
        );

    /*
    Convert Mongoose document
    to plain object.
    */

    const data =
        attendance.toObject
            ? attendance.toObject()
            : attendance;

    data.liveWorkingSeconds =
        workingSeconds;

    data.liveWorkingMinutes =
        Math.floor(
            workingSeconds / 60
        );

    data.liveWorkingHours =
        Math.floor(
            workingSeconds / 3600
        );

    data.liveWorkingRemainingMinutes =
        Math.floor(
            (workingSeconds % 3600) / 60
        );

    data.liveWorkingRemainingSeconds =
        workingSeconds % 60;

    /*
    ================================================
    CURRENT STATE
    ================================================
    */

    const activeBreak =
        data.breaks?.find(
            (item) =>
                item.start &&
                !item.end
        );

    const activeLunch =
        data.lunch?.start &&
        !data.lunch?.end;

    if (data.punchOut) {

        data.currentWorkState =
            "COMPLETED";

    } else if (activeLunch) {

        data.currentWorkState =
            "LUNCH";

    } else if (activeBreak) {

        data.currentWorkState =
            "BREAK";

    } else if (data.punchIn) {

        data.currentWorkState =
            "WORKING";

    } else {

        data.currentWorkState =
            "NOT_STARTED";
    }

    return data;
};


/*
=====================================================
GET TODAY
=====================================================

GET /api/hr-personal-attendance/today
=====================================================
*/

const getTodayAttendance = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(200).json({

                success: true,

                attendance: null,

                message:
                    "No attendance record for today",
            });
        }

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        const result =
            attachLiveWorkingTime(
                attendance
            );

        return res.status(200).json({

            success: true,

            attendance: result,
        });

    } catch (error) {

        console.error(
            "GET HR TODAY ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load today's attendance",
        });
    }
};


/*
=====================================================
GET HISTORY
=====================================================

GET /api/hr-personal-attendance/history
=====================================================
*/

const getAttendanceHistory = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await HRAttendance.find({
                hr: hrId,
            })
                .populate(
                    "hr",
                    "name email role profileImage phone"
                )
                .sort({
                    date: -1,
                });

        const result =
            attendance.map(
                (item) =>
                    attachLiveWorkingTime(item)
            );

        return res.status(200).json({

            success: true,

            attendance: result,
        });

    } catch (error) {

        console.error(
            "GET HR ATTENDANCE HISTORY ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load attendance history",
        });
    }
};


/*
=====================================================
PUNCH IN

POST /api/hr-personal-attendance/punch-in
=====================================================
*/

const punchIn = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        let attendance =
            await findTodayAttendance(
                hrId
            );

        /*
        ================================================
        ALREADY PUNCHED IN
        ================================================
        */

        if (
            attendance?.punchIn &&
            !attendance?.punchOut
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched in today.",

                attendance:
                    attachLiveWorkingTime(
                        attendance
                    ),
            });
        }


        /*
        ================================================
        COMPLETED ATTENDANCE
        ================================================
        */

        if (
            attendance?.punchOut
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Today's attendance is already completed.",

                attendance:
                    attachLiveWorkingTime(
                        attendance
                    ),
            });
        }


        /*
        ================================================
        CREATE ATTENDANCE
        ================================================
        */

        if (!attendance) {

            attendance =
                new HRAttendance({

                    hr: hrId,

                    date:
                        getStartOfToday(),

                    punchIn:
                        new Date(),

                    punchOut:
                        null,

                    breaks: [],

                    lunch: {

                        start: null,

                        end: null,

                        totalMinutes: 0,
                    },

                    totalBreakMinutes: 0,

                    totalLunchMinutes: 0,

                    totalWorkingMinutes: 0,

                    totalWorkingSeconds: 0,

                    status:
                        "Present",
                });

        } else {

            attendance.punchIn =
                new Date();

            attendance.punchOut =
                null;

            attendance.breaks = [];

            attendance.lunch = {

                start: null,

                end: null,

                totalMinutes: 0,
            };

            attendance.totalBreakMinutes =
                0;

            attendance.totalLunchMinutes =
                0;

            attendance.totalWorkingMinutes =
                0;

            attendance.totalWorkingSeconds =
                0;

            attendance.status =
                "Present";
        }


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Punched in successfully.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR PUNCH IN ERROR:",
            error
        );

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Attendance record already exists for today.",
            });
        }

        return res.status(500).json({

            success: false,

            message:
                "Failed to punch in.",
        });
    }
};


/*
=====================================================
START BREAK

POST /api/hr-personal-attendance/break/start
=====================================================
*/

const startBreak = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before starting a break.",
            });
        }

        if (!attendance.punchIn) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before starting a break.",
            });
        }

        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "Attendance has already been completed.",
            });
        }


        /*
        ================================================
        ACTIVE BREAK
        ================================================
        */

        const activeBreak =
            attendance.breaks?.find(
                (item) =>
                    item.start &&
                    !item.end
            );

        if (activeBreak) {

            return res.status(400).json({

                success: false,

                message:
                    "A break is already active.",
            });
        }


        /*
        ================================================
        ACTIVE LUNCH
        ================================================
        */

        if (
            attendance.lunch?.start &&
            !attendance.lunch?.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume from lunch before starting a break.",
            });
        }


        /*
        ================================================
        START BREAK
        ================================================
        */

        attendance.breaks.push({

            start:
                new Date(),

            end:
                null,

            durationMinutes:
                0,
        });


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Break started successfully.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR BREAK START ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to start break.",
        });
    }
};


/*
=====================================================
RESUME BREAK

POST /api/hr-personal-attendance/break/resume
=====================================================
*/

const resumeBreak = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "Today's attendance record was not found.",
            });
        }

        const activeBreak =
            attendance.breaks?.find(
                (item) =>
                    item.start &&
                    !item.end
            );

        if (!activeBreak) {

            return res.status(400).json({

                success: false,

                message:
                    "There is no active break.",
            });
        }


        /*
        ================================================
        END BREAK
        ================================================
        */

        const endTime =
            new Date();

        const startTime =
            new Date(
                activeBreak.start
            );

        const durationMinutes =
            Math.max(
                0,
                Math.floor(
                    (
                        endTime -
                        startTime
                    ) / 60000
                )
            );

        activeBreak.end =
            endTime;

        activeBreak.durationMinutes =
            durationMinutes;


        /*
        ================================================
        RECALCULATE TOTAL BREAK
        ================================================
        */

        attendance.totalBreakMinutes =
            attendance.breaks.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        (
                            Number(
                                item.durationMinutes
                            ) || 0
                        )
                    );
                },
                0
            );


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Break completed. You are back to work.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR BREAK RESUME ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to resume from break.",
        });
    }
};


/*
=====================================================
START LUNCH

POST /api/hr-personal-attendance/lunch/start
=====================================================
*/

const startLunch = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before starting lunch.",
            });
        }

        if (!attendance.punchIn) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before starting lunch.",
            });
        }

        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "Attendance has already been completed.",
            });
        }


        /*
        ================================================
        ACTIVE BREAK
        ================================================
        */

        const activeBreak =
            attendance.breaks?.find(
                (item) =>
                    item.start &&
                    !item.end
            );

        if (activeBreak) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume your break before starting lunch.",
            });
        }


        /*
        ================================================
        ACTIVE LUNCH
        ================================================
        */

        if (
            attendance.lunch?.start &&
            !attendance.lunch?.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch is already active.",
            });
        }


        /*
        ================================================
        PREVIOUS LUNCH
        ================================================
        */

        if (
            attendance.lunch?.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch has already been completed today.",
            });
        }


        /*
        ================================================
        START LUNCH
        ================================================
        */

        attendance.lunch.start =
            new Date();

        attendance.lunch.end =
            null;

        attendance.lunch.totalMinutes =
            0;


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Lunch started successfully.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR LUNCH START ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to start lunch.",
        });
    }
};


/*
=====================================================
RESUME LUNCH

POST /api/hr-personal-attendance/lunch/resume
=====================================================
*/

const resumeLunch = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "Today's attendance record was not found.",
            });
        }

        if (
            !attendance.lunch?.start ||
            attendance.lunch?.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "There is no active lunch.",
            });
        }


        /*
        ================================================
        END LUNCH
        ================================================
        */

        const endTime =
            new Date();

        const startTime =
            new Date(
                attendance.lunch.start
            );

        const durationMinutes =
            Math.max(
                0,
                Math.floor(
                    (
                        endTime -
                        startTime
                    ) / 60000
                )
            );

        attendance.lunch.end =
            endTime;

        attendance.lunch.totalMinutes =
            durationMinutes;

        attendance.totalLunchMinutes =
            durationMinutes;


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Lunch completed. You are back to work.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR LUNCH RESUME ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to resume from lunch.",
        });
    }
};


/*
=====================================================
PUNCH OUT

POST /api/hr-personal-attendance/punch-out
=====================================================
*/

const punchOut = async (
    req,
    res
) => {

    try {

        const hrId =
            req.user._id;

        const attendance =
            await findTodayAttendance(
                hrId
            );

        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before punching out.",
            });
        }

        if (!attendance.punchIn) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in before punching out.",
            });
        }

        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched out today.",
            });
        }


        /*
        ================================================
        ACTIVE BREAK
        ================================================
        */

        const activeBreak =
            attendance.breaks?.find(
                (item) =>
                    item.start &&
                    !item.end
            );

        if (activeBreak) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume your break before punching out.",
            });
        }


        /*
        ================================================
        ACTIVE LUNCH
        ================================================
        */

        if (
            attendance.lunch?.start &&
            !attendance.lunch?.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume from lunch before punching out.",
            });
        }


        /*
        ================================================
        PUNCH OUT
        ================================================
        */

        attendance.punchOut =
            new Date();


        /*
        ================================================
        FINAL WORKING SECONDS
        ================================================
        */

        const finalWorkingSeconds =
            calculateLiveWorkingSeconds(
                attendance
            );

        attendance.totalWorkingSeconds =
            finalWorkingSeconds;

        attendance.totalWorkingMinutes =
            Math.floor(
                finalWorkingSeconds / 60
            );


        /*
        ================================================
        FINAL BREAK TOTAL
        ================================================
        */

        attendance.totalBreakMinutes =
            attendance.breaks.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        (
                            Number(
                                item.durationMinutes
                            ) || 0
                        )
                    );
                },
                0
            );


        /*
        ================================================
        FINAL LUNCH TOTAL
        ================================================
        */

        if (
            attendance.lunch?.start &&
            attendance.lunch?.end
        ) {

            const lunchSeconds =
                getCompletedLunchSeconds(
                    attendance
                );

            attendance.totalLunchMinutes =
                Math.floor(
                    lunchSeconds / 60
                );

            attendance.lunch.totalMinutes =
                Math.floor(
                    lunchSeconds / 60
                );
        }


        attendance.status =
            "Completed";


        await attendance.save();

        await attendance.populate(
            "hr",
            "name email role profileImage phone"
        );

        return res.status(200).json({

            success: true,

            message:
                "Punched out successfully. Attendance completed for today.",

            attendance:
                attachLiveWorkingTime(
                    attendance
                ),
        });

    } catch (error) {

        console.error(
            "HR PUNCH OUT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to punch out.",
        });
    }
};


/*
=====================================================
EXPORT
=====================================================
*/

module.exports = {

    getTodayAttendance,

    getAttendanceHistory,

    punchIn,

    punchOut,

    startBreak,

    resumeBreak,

    startLunch,

    resumeLunch,

};