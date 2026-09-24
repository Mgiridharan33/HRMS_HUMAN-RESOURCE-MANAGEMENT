const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");


// =====================================================
// HELPER: GET CURRENT EMPLOYEE
// =====================================================

const getCurrentEmployee = async (req) => {

    if (
        !req.user ||
        !req.user._id ||
        req.userType !== "EMPLOYEE"
    ) {
        return null;
    }

    const employee =
        await Employee.findById(req.user._id);

    return employee;
};


// =====================================================
// HELPER: GET TODAY DATE
// =====================================================

const getTodayDate = () => {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
};


// =====================================================
// HELPER: CALCULATE MINUTES
// =====================================================

const getMinutes = (start, end) => {

    if (!start || !end) {
        return 0;
    }

    return Math.floor(
        (
            new Date(end) -
            new Date(start)
        ) / 60000
    );
};


// =====================================================
// PUNCH IN
// POST /api/attendance/punch-in
// =====================================================

const punchIn = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);

        if (!employee) {

            return res.status(404).json({
                success: false,
                message:
                    "Employee account not found",
            });
        }


        if (!employee.isActive) {

            return res.status(403).json({
                success: false,
                message:
                    "Employee account is inactive",
            });
        }


        const today =
            getTodayDate();


        let attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        // =============================================
        // ALREADY PUNCHED IN
        // =============================================

        if (
            attendance &&
            attendance.punchIn
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched in today",

                attendance,

            });
        }


        // =============================================
        // CREATE ATTENDANCE
        // =============================================

        if (!attendance) {

            attendance =
                new Attendance({

                    employee:
                        employee._id,

                    date:
                        today,

                    status:
                        "Present",

                    punchIn:
                        new Date(),

                    punchOut:
                        null,

                    breaks:
                        [],

                    lunch:
                        {
                            start: null,
                            end: null,
                            totalMinutes: 0,
                        },

                    totalBreakMinutes:
                        0,

                    totalWorkingMinutes:
                        0,

                });

        } else {

            attendance.punchIn =
                new Date();

            attendance.status =
                "Present";
        }


        await attendance.save();


        return res.status(200).json({

            success: true,

            message:
                "Punched in successfully",

            attendance,

        });

    } catch (error) {

        console.error(
            "PUNCH IN ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to punch in",

            error:
                error.message,

        });
    }
};


// =====================================================
// PUNCH OUT
// POST /api/attendance/punch-out
// =====================================================

const punchOut = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        if (!attendance) {

            return res.status(400).json({

                success: false,

                message:
                    "You have not punched in today",

            });
        }


        if (!attendance.punchIn) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in first",

            });
        }


        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched out today",

                attendance,

            });
        }


        // =============================================
        // CHECK ACTIVE BREAK
        // =============================================

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
                    "Please resume your break before punching out",

            });
        }


        // =============================================
        // CHECK ACTIVE LUNCH
        // =============================================

        if (
            attendance.lunch &&
            attendance.lunch.start &&
            !attendance.lunch.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume lunch before punching out",

            });
        }


        // =============================================
        // PUNCH OUT
        // =============================================

        attendance.punchOut =
            new Date();


        // =============================================
        // TOTAL ELAPSED TIME
        // =============================================

        const totalElapsedMinutes =
            getMinutes(
                attendance.punchIn,
                attendance.punchOut
            );


        // =============================================
        // TOTAL WORKING TIME
        // =============================================

        attendance.totalWorkingMinutes =
            Math.max(

                0,

                totalElapsedMinutes -

                (
                    attendance.totalBreakMinutes ||
                    0
                ) -

                (
                    attendance.lunch?.totalMinutes ||
                    0
                )

            );


        attendance.status =
            "Completed";


        await attendance.save();


        return res.status(200).json({

            success: true,

            message:
                "Punched out successfully",

            attendance,

        });

    } catch (error) {

        console.error(
            "PUNCH OUT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to punch out",

            error:
                error.message,

        });
    }
};


// =====================================================
// START BREAK
// POST /api/attendance/break/start
// =====================================================

const startBreak = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        if (
            !attendance ||
            !attendance.punchIn
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in first",

            });
        }


        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched out",

            });
        }


        // =============================================
        // CHECK EXISTING ACTIVE BREAK
        // =============================================

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
                    "You are already on break",

            });
        }


        // =============================================
        // CHECK LUNCH
        // =============================================

        if (
            attendance.lunch &&
            attendance.lunch.start &&
            !attendance.lunch.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please resume your break before starting lunch",

            });
        }


        // =============================================
        // START BREAK
        // =============================================

        if (!Array.isArray(attendance.breaks)) {

            attendance.breaks = [];
        }


        attendance.breaks.push({

            start:
                new Date(),

            end:
                null,

            durationMinutes:
                0,

        });


        await attendance.save();


        return res.status(200).json({

            success: true,

            message:
                "Break started",

            attendance,

        });

    } catch (error) {

        console.error(
            "START BREAK ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to start break",

            error:
                error.message,

        });
    }
};


// =====================================================
// RESUME FROM BREAK
// POST /api/attendance/break/resume
// =====================================================

const resumeBreak = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        if (!attendance) {

            return res.status(404).json({

                success: false,

                message:
                    "Today's attendance not found",

            });
        }


        // =============================================
        // FIND ACTIVE BREAK
        // =============================================

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
                    "No active break found",

            });
        }


        // =============================================
        // END BREAK
        // =============================================

        activeBreak.end =
            new Date();


        activeBreak.durationMinutes =
            getMinutes(
                activeBreak.start,
                activeBreak.end
            );


        // =============================================
        // RECALCULATE BREAK TIME
        // =============================================

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


        return res.status(200).json({

            success: true,

            message:
                "Break resumed",

            attendance,

        });

    } catch (error) {

        console.error(
            "RESUME BREAK ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to resume break",

            error:
                error.message,

        });
    }
};


// =====================================================
// START LUNCH
// POST /api/attendance/lunch/start
// =====================================================

const startLunch = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        if (
            !attendance ||
            !attendance.punchIn
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please punch in first",

            });
        }


        if (attendance.punchOut) {

            return res.status(400).json({

                success: false,

                message:
                    "You have already punched out",

            });
        }


        // =============================================
        // CHECK ACTIVE BREAK
        // =============================================

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
                    "Please resume your break before starting lunch",

            });
        }


        // =============================================
        // CHECK ACTIVE LUNCH
        // =============================================

        if (
            attendance.lunch &&
            attendance.lunch.start &&
            !attendance.lunch.end
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch is already active",

            });
        }


        // =============================================
        // START LUNCH
        // =============================================

        attendance.lunch = {

            start:
                new Date(),

            end:
                null,

            totalMinutes:
                0,

        };


        await attendance.save();


        return res.status(200).json({

            success: true,

            message:
                "Lunch started",

            attendance,

        });

    } catch (error) {

        console.error(
            "START LUNCH ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to start lunch",

            error:
                error.message,

        });
    }
};


// =====================================================
// RESUME FROM LUNCH
// POST /api/attendance/lunch/resume
// =====================================================

const resumeLunch = async (req, res) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            });


        if (!attendance) {

            return res.status(404).json({

                success: false,

                message:
                    "Today's attendance not found",

            });
        }


        if (
            !attendance.lunch ||
            !attendance.lunch.start
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch has not started",

            });
        }


        if (attendance.lunch.end) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch has already been resumed",

            });
        }


        // =============================================
        // END LUNCH
        // =============================================

        attendance.lunch.end =
            new Date();


        attendance.lunch.totalMinutes =
            getMinutes(
                attendance.lunch.start,
                attendance.lunch.end
            );


        await attendance.save();


        return res.status(200).json({

            success: true,

            message:
                "Lunch resumed",

            attendance,

        });

    } catch (error) {

        console.error(
            "RESUME LUNCH ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to resume lunch",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET TODAY ATTENDANCE
// GET /api/attendance/today
// =====================================================

const getTodayAttendance = async (
    req,
    res
) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const today =
            getTodayDate();


        const attendance =
            await Attendance.findOne({

                employee:
                    employee._id,

                date:
                    today,

            }).populate(
                "employee",
                "employeeId firstName lastName email department designation profileImage"
            );


        return res.status(200).json({

            success: true,

            attendance:
                attendance || null,

        });

    } catch (error) {

        console.error(
            "GET TODAY ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch today's attendance",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET ATTENDANCE HISTORY
// GET /api/attendance/history
// =====================================================

const getAttendanceHistory = async (
    req,
    res
) => {

    try {

        const employee =
            await getCurrentEmployee(req);


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee account not found",

            });
        }


        const attendance =
            await Attendance.find({

                employee:
                    employee._id,

            })
                .sort({
                    date: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                attendance.length,

            attendance,

        });

    } catch (error) {

        console.error(
            "GET ATTENDANCE HISTORY ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch attendance history",

            error:
                error.message,

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    punchIn,

    punchOut,

    startBreak,

    resumeBreak,

    startLunch,

    resumeLunch,

    getTodayAttendance,

    getAttendanceHistory,

};