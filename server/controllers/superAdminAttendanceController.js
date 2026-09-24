const Attendance = require("../models/Attendance");
const HRAttendance = require("../models/HRAttendance");
const Employee = require("../models/Employee");
const User = require("../models/User");

// =====================================================
// DATE HELPERS
// =====================================================

const getStartOfDay = (date) => {

    const d = date
        ? new Date(date)
        : new Date();

    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        0,
        0,
        0,
        0
    );
};


const getEndOfDay = (date) => {

    const d = date
        ? new Date(date)
        : new Date();

    return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59,
        999
    );
};


// =====================================================
// CALCULATE EMPLOYEE LIVE WORKING SECONDS
// =====================================================

const calculateEmployeeWorkingSeconds = (
    attendance
) => {

    if (!attendance?.punchIn) {
        return 0;
    }

    const punchIn =
        new Date(
            attendance.punchIn
        ).getTime();

    const end =
        attendance.punchOut
            ? new Date(
                attendance.punchOut
            ).getTime()
            : Date.now();

    if (end <= punchIn) {
        return 0;
    }

    let seconds =
        Math.floor(
            (end - punchIn) / 1000
        );


    // Completed breaks
    if (attendance.breaks) {

        attendance.breaks.forEach(
            (item) => {

                if (
                    item.start &&
                    item.end
                ) {

                    const start =
                        new Date(
                            item.start
                        ).getTime();

                    const finish =
                        new Date(
                            item.end
                        ).getTime();

                    if (finish > start) {

                        seconds -=
                            Math.floor(
                                (
                                    finish -
                                    start
                                ) / 1000
                            );
                    }
                }

                // Active break
                else if (
                    item.start &&
                    !item.end &&
                    !attendance.punchOut
                ) {

                    const start =
                        new Date(
                            item.start
                        ).getTime();

                    seconds -=
                        Math.floor(
                            (
                                Date.now() -
                                start
                            ) / 1000
                        );
                }
            }
        );
    }


    // Lunch
    if (
        attendance.lunch?.start
    ) {

        if (
            attendance.lunch.end
        ) {

            const start =
                new Date(
                    attendance.lunch.start
                ).getTime();

            const end =
                new Date(
                    attendance.lunch.end
                ).getTime();

            if (end > start) {

                seconds -=
                    Math.floor(
                        (
                            end -
                            start
                        ) / 1000
                    );
            }

        } else if (
            !attendance.punchOut
        ) {

            const start =
                new Date(
                    attendance.lunch.start
                ).getTime();

            seconds -=
                Math.floor(
                    (
                        Date.now() -
                        start
                    ) / 1000
                );
        }
    }


    return Math.max(
        0,
        seconds
    );
};


// =====================================================
// GET CURRENT STATE
// =====================================================

const getCurrentState = (
    attendance
) => {

    if (!attendance) {
        return "NOT_STARTED";
    }

    if (attendance.punchOut) {
        return "COMPLETED";
    }

    const activeLunch =
        attendance.lunch?.start &&
        !attendance.lunch?.end;

    if (activeLunch) {
        return "LUNCH";
    }

    const activeBreak =
        attendance.breaks?.some(
            (item) =>
                item.start &&
                !item.end
        );

    if (activeBreak) {
        return "BREAK";
    }

    if (attendance.punchIn) {
        return "WORKING";
    }

    return "NOT_STARTED";
};


// =====================================================
// FORMAT EMPLOYEE ATTENDANCE
// =====================================================

const formatEmployeeAttendance = (
    attendance
) => {

    const data =
        attendance.toObject
            ? attendance.toObject()
            : attendance;

    const workingSeconds =
        calculateEmployeeWorkingSeconds(
            data
        );

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

    data.currentWorkState =
        getCurrentState(data);

    data.attendanceType =
        "EMPLOYEE";

    return data;
};


// =====================================================
// FORMAT HR ATTENDANCE
// =====================================================

const formatHRAttendance = (
    attendance
) => {

    const data =
        attendance.toObject
            ? attendance.toObject()
            : attendance;

    let workingSeconds = 0;

    if (data.punchIn) {

        const start =
            new Date(
                data.punchIn
            ).getTime();

        const end =
            data.punchOut
                ? new Date(
                    data.punchOut
                ).getTime()
                : Date.now();

        workingSeconds =
            Math.max(
                0,
                Math.floor(
                    (
                        end -
                        start
                    ) / 1000
                )
            );
    }


    // Completed breaks
    if (data.breaks) {

        data.breaks.forEach(
            (item) => {

                if (
                    item.start &&
                    item.end
                ) {

                    const start =
                        new Date(
                            item.start
                        ).getTime();

                    const end =
                        new Date(
                            item.end
                        ).getTime();

                    workingSeconds -=
                        Math.floor(
                            (
                                end -
                                start
                            ) / 1000
                        );
                }

                else if (
                    item.start &&
                    !item.end &&
                    !data.punchOut
                ) {

                    workingSeconds -=
                        Math.floor(
                            (
                                Date.now() -
                                new Date(
                                    item.start
                                ).getTime()
                            ) / 1000
                        );
                }
            }
        );
    }


    // Lunch
    if (
        data.lunch?.start
    ) {

        if (
            data.lunch.end
        ) {

            workingSeconds -=
                Math.floor(
                    (
                        new Date(
                            data.lunch.end
                        ).getTime() -
                        new Date(
                            data.lunch.start
                        ).getTime()
                    ) / 1000
                );

        } else if (
            !data.punchOut
        ) {

            workingSeconds -=
                Math.floor(
                    (
                        Date.now() -
                        new Date(
                            data.lunch.start
                        ).getTime()
                    ) / 1000
                );
        }
    }


    workingSeconds =
        Math.max(
            0,
            workingSeconds
        );


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


    data.currentWorkState =
        getCurrentState(data);

    data.attendanceType =
        "HR";

    return data;
};


// =====================================================
// GET ALL ATTENDANCE
//
// GET /api/superadmin-attendance
// =====================================================

const getAllAttendance = async (
    req,
    res
) => {

    try {

        const {
            date,
            startDate,
            endDate,
            type = "all",
            status,
            department,
            search,
        } = req.query;


        // =================================================
        // DATE FILTER
        // =================================================

        let dateFilter = {};

        if (date) {

            dateFilter = {
                date: {
                    $gte:
                        getStartOfDay(date),

                    $lte:
                        getEndOfDay(date),
                },
            };

        } else if (
            startDate ||
            endDate
        ) {

            dateFilter = {
                date: {
                    ...(startDate && {
                        $gte:
                            getStartOfDay(
                                startDate
                            ),
                    }),

                    ...(endDate && {
                        $lte:
                            getEndOfDay(
                                endDate
                            ),
                    }),
                },
            };
        }


        // =================================================
        // EMPLOYEE ATTENDANCE
        // =================================================

        let employeeAttendance = [];


        if (
            type === "all" ||
            type === "employee"
        ) {

            employeeAttendance =
                await Attendance.find(
                    dateFilter
                )
                    .populate(
                        "employee",
                        "employeeId firstName lastName email department designation profileImage phone isActive"
                    )
                    .sort({
                        date: -1,
                        createdAt: -1,
                    });


            employeeAttendance =
                employeeAttendance
                    .filter(
                        (item) => {

                            const employee =
                                item.employee;

                            if (!employee) {
                                return false;
                            }


                            // Department
                            if (
                                department &&
                                employee.department !==
                                    department
                            ) {
                                return false;
                            }


                            // Search
                            if (search) {

                                const keyword =
                                    search
                                        .toLowerCase()
                                        .trim();

                                const name =
                                    `${employee.firstName} ${employee.lastName}`
                                        .toLowerCase();

                                const employeeId =
                                    (
                                        employee.employeeId ||
                                        ""
                                    )
                                        .toLowerCase();

                                const email =
                                    (
                                        employee.email ||
                                        ""
                                    )
                                        .toLowerCase();

                                if (
                                    !name.includes(
                                        keyword
                                    ) &&
                                    !employeeId.includes(
                                        keyword
                                    ) &&
                                    !email.includes(
                                        keyword
                                    )
                                ) {
                                    return false;
                                }
                            }


                            // Status
                            if (
                                status &&
                                item.status !==
                                    status
                            ) {
                                return false;
                            }

                            return true;
                        }
                    )
                    .map(
                        formatEmployeeAttendance
                    );
        }


        // =================================================
        // HR ATTENDANCE
        // =================================================

        let hrAttendance = [];


        if (
            type === "all" ||
            type === "hr"
        ) {

            hrAttendance =
                await HRAttendance.find(
                    dateFilter
                )
                    .populate(
                        "hr",
                        "name email role profileImage phone isActive"
                    )
                    .sort({
                        date: -1,
                        createdAt: -1,
                    });


            hrAttendance =
                hrAttendance
                    .filter(
                        (item) => {

                            const hr =
                                item.hr;

                            if (!hr) {
                                return false;
                            }


                            // Search
                            if (search) {

                                const keyword =
                                    search
                                        .toLowerCase()
                                        .trim();

                                const name =
                                    (
                                        hr.name ||
                                        ""
                                    )
                                        .toLowerCase();

                                const email =
                                    (
                                        hr.email ||
                                        ""
                                    )
                                        .toLowerCase();

                                if (
                                    !name.includes(
                                        keyword
                                    ) &&
                                    !email.includes(
                                        keyword
                                    )
                                ) {
                                    return false;
                                }
                            }


                            if (
                                status &&
                                item.status !==
                                    status
                            ) {
                                return false;
                            }

                            return true;
                        }
                    )
                    .map(
                        formatHRAttendance
                    );
        }


        // =================================================
        // COMBINE
        // =================================================

        const combined = [
            ...employeeAttendance,
            ...hrAttendance,
        ].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                combined.length,

            employeeCount:
                employeeAttendance.length,

            hrCount:
                hrAttendance.length,

            attendance:
                combined,

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load attendance data",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET TODAY SUMMARY
//
// GET /api/superadmin-attendance/summary
// =====================================================

const getTodaySummary = async (
    req,
    res
) => {

    try {

        const startOfDay =
            getStartOfDay();

        const endOfDay =
            getEndOfDay();


        // =================================================
        // EMPLOYEE ATTENDANCE
        // =================================================

        const employeeAttendance =
            await Attendance.find({

                date: {
                    $gte:
                        startOfDay,

                    $lte:
                        endOfDay,
                },

            });


        // =================================================
        // HR ATTENDANCE
        // =================================================

        const hrAttendance =
            await HRAttendance.find({

                date: {
                    $gte:
                        startOfDay,

                    $lte:
                        endOfDay,
                },

            });


        // =================================================
        // TOTAL COUNTS
        // =================================================

        const totalEmployees =
            await Employee.countDocuments({
                isActive: true,
            });


        const totalHR =
            await User.countDocuments({
                role: "HR",
                isActive: true,
            });


        // =================================================
        // PRESENT
        // =================================================

        const employeePresent =
            employeeAttendance.filter(
                (item) =>
                    item.punchIn
            ).length;


        const hrPresent =
            hrAttendance.filter(
                (item) =>
                    item.punchIn
            ).length;


        // =================================================
        // ABSENT
        // =================================================

        const employeeAbsent =
            Math.max(
                0,
                totalEmployees -
                employeePresent
            );


        const hrAbsent =
            Math.max(
                0,
                totalHR -
                hrPresent
            );


        // =================================================
        // COMPLETED
        // =================================================

        const employeeCompleted =
            employeeAttendance.filter(
                (item) =>
                    item.punchOut
            ).length;


        const hrCompleted =
            hrAttendance.filter(
                (item) =>
                    item.punchOut
            ).length;


        // =================================================
        // CURRENTLY WORKING
        // =================================================

        const employeeWorking =
            employeeAttendance.filter(
                (item) =>
                    item.punchIn &&
                    !item.punchOut
            ).length;


        const hrWorking =
            hrAttendance.filter(
                (item) =>
                    item.punchIn &&
                    !item.punchOut
            ).length;


        return res.status(200).json({

            success: true,

            summary: {

                employees: {

                    total:
                        totalEmployees,

                    present:
                        employeePresent,

                    absent:
                        employeeAbsent,

                    working:
                        employeeWorking,

                    completed:
                        employeeCompleted,
                },


                hr: {

                    total:
                        totalHR,

                    present:
                        hrPresent,

                    absent:
                        hrAbsent,

                    working:
                        hrWorking,

                    completed:
                        hrCompleted,
                },


                overall: {

                    total:
                        totalEmployees +
                        totalHR,

                    present:
                        employeePresent +
                        hrPresent,

                    absent:
                        employeeAbsent +
                        hrAbsent,

                    working:
                        employeeWorking +
                        hrWorking,

                    completed:
                        employeeCompleted +
                        hrCompleted,
                },
            },

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN ATTENDANCE SUMMARY ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load attendance summary",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET EMPLOYEE ATTENDANCE
//
// GET /api/superadmin-attendance/employees/:employeeId
// =====================================================

const getEmployeeAttendance = async (
    req,
    res
) => {

    try {

        const {
            employeeId,
        } = req.params;


        const {
            startDate,
            endDate,
        } = req.query;


        const employee =
            await Employee.findById(
                employeeId
            )
                .select(
                    "-password"
                );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found",

            });
        }


        const filter = {

            employee:
                employeeId,
        };


        if (
            startDate ||
            endDate
        ) {

            filter.date = {

                ...(startDate && {
                    $gte:
                        getStartOfDay(
                            startDate
                        ),
                }),

                ...(endDate && {
                    $lte:
                        getEndOfDay(
                            endDate
                        ),
                }),
            };
        }


        const attendance =
            await Attendance.find(
                filter
            )
                .sort({
                    date: -1,
                });


        return res.status(200).json({

            success: true,

            employee,

            count:
                attendance.length,

            attendance:
                attendance.map(
                    formatEmployeeAttendance
                ),

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN EMPLOYEE ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load employee attendance",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET HR ATTENDANCE
//
// GET /api/superadmin-attendance/hr/:hrId
// =====================================================

const getHRAttendance = async (
    req,
    res
) => {

    try {

        const {
            hrId,
        } = req.params;


        const hr =
            await User.findOne({

                _id:
                    hrId,

                role:
                    "HR",

            })
                .select(
                    "-password"
                );


        if (!hr) {

            return res.status(404).json({

                success: false,

                message:
                    "HR not found",

            });
        }


        const {
            startDate,
            endDate,
        } = req.query;


        const filter = {

            hr:
                hrId,
        };


        if (
            startDate ||
            endDate
        ) {

            filter.date = {

                ...(startDate && {
                    $gte:
                        getStartOfDay(
                            startDate
                        ),
                }),

                ...(endDate && {
                    $lte:
                        getEndOfDay(
                            endDate
                        ),
                }),
            };
        }


        const attendance =
            await HRAttendance.find(
                filter
            )
                .sort({
                    date: -1,
                });


        return res.status(200).json({

            success: true,

            hr,

            count:
                attendance.length,

            attendance:
                attendance.map(
                    formatHRAttendance
                ),

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN HR ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR attendance",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET ALL ACTIVE EMPLOYEES
//
// GET /api/superadmin-attendance/employees
// =====================================================

const getEmployees = async (
    req,
    res
) => {

    try {

        const employees =
            await Employee.find({

                isActive:
                    true,

            })
                .select(
                    "employeeId firstName lastName email department designation profileImage"
                )
                .sort({
                    firstName: 1,
                });


        return res.status(200).json({

            success: true,

            count:
                employees.length,

            employees,

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN EMPLOYEE LIST ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load employees",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET ALL ACTIVE HR
//
// GET /api/superadmin-attendance/hr
// =====================================================

const getHRList = async (
    req,
    res
) => {

    try {

        const hr =
            await User.find({

                role:
                    "HR",

                isActive:
                    true,

            })
                .select(
                    "name email role profileImage phone"
                )
                .sort({
                    name: 1,
                });


        return res.status(200).json({

            success: true,

            count:
                hr.length,

            hr,

        });

    } catch (error) {

        console.error(
            "SUPER ADMIN HR LIST ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load HR list",

            error:
                error.message,

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAllAttendance,

    getTodaySummary,

    getEmployeeAttendance,

    getHRAttendance,

    getEmployees,

    getHRList,

};