const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const HRAttendance = require("../models/HRAttendance");
const Payroll = require("../models/Payroll");
const HRPayroll = require("../models/HRPayroll");
const HRPersonalLeave = require("../models/HRPersonalLeave");

const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

// =====================================================
// COMMON HELPERS
// =====================================================

const isHR = (req) => {
    return (
        String(req.userType || "").toUpperCase() ===
        "HR"
    );
};

// =====================================================
// DATE RANGE HELPER
// =====================================================

const applyDateRange = (
    filter,
    field,
    fromDate,
    toDate
) => {
    if (!fromDate && !toDate) {
        return;
    }

    const range = {};

    // -------------------------------------------------
    // FROM DATE
    // -------------------------------------------------

    if (fromDate) {
        const startDate = new Date(
            `${fromDate}T00:00:00.000`
        );

        if (!Number.isNaN(startDate.getTime())) {
            range.$gte = startDate;
        }
    }

    // -------------------------------------------------
    // TO DATE
    // Include complete selected day
    // -------------------------------------------------

    if (toDate) {
        const endDate = new Date(
            `${toDate}T23:59:59.999`
        );

        if (!Number.isNaN(endDate.getTime())) {
            range.$lte = endDate;
        }
    }

    if (Object.keys(range).length > 0) {
        filter[field] = range;
    }
};

// =====================================================
// EMPLOYEE POPULATION
// =====================================================

const employeePopulate = {
    path: "employee",
    select:
        "_id employeeId firstName lastName email department designation profileImage isActive reportingHR",
};

// =====================================================
// GET ALL EMPLOYEES
// =====================================================
//
// IMPORTANT:
//
// This intentionally returns ALL employees.
// HR is allowed to view all employee records.
//
// =====================================================

const getEmployees = async (req, res) => {
    try {
        if (!isHR(req)) {
            return res.status(403).json({
                success: false,
                message: "HR access required",
            });
        }

        const employees = await Employee.find({})
            .select(
                "_id employeeId firstName lastName email department designation profileImage isActive reportingHR"
            )
            .sort({
                firstName: 1,
                lastName: 1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: employees.length,
            employees,
        });
    } catch (error) {
        console.error(
            "HR REPORT EMPLOYEE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load all employees",
            error: error.message,
        });
    }
};

// =====================================================
// GET EMPLOYEE IDS
// =====================================================
//
// No HR restriction here.
// Every HR can report on every employee.
//
// If employeeId is empty:
//     return ALL employee IDs
//
// If employeeId exists:
//     return ONLY selected employee
//
// =====================================================

const getSelectedEmployeeIds = async (
    employeeId
) => {
    // =================================================
    // ALL EMPLOYEES
    // =================================================

    if (!employeeId) {
        const employees =
            await Employee.find({})
                .select("_id")
                .lean();

        return {
            employeeIds:
                employees.map(
                    (employee) =>
                        employee._id
                ),
            employee: null,
        };
    }

    // =================================================
    // SINGLE EMPLOYEE
    // =================================================

    const employee =
        await Employee.findById(
            employeeId
        ).lean();

    if (!employee) {
        const error =
            new Error(
                "Employee not found"
            );

        error.statusCode = 404;

        throw error;
    }

    return {
        employeeIds: [
            employee._id,
        ],
        employee,
    };
};

// =====================================================
// VIEW REPORT
// =====================================================

const viewReport = async (
    req,
    res
) => {
    try {
        // =================================================
        // HR ACCESS
        // =================================================

        if (!isHR(req)) {
            return res.status(403).json({
                success: false,
                message:
                    "HR access required",
            });
        }

        // =================================================
        // QUERY
        // =================================================

        const {
            reportType,
            fromDate,
            toDate,
            employeeId,
            month,
            year,
        } = req.query;

        if (!reportType) {
            return res.status(400).json({
                success: false,
                message:
                    "reportType is required",
            });
        }

        const hrId =
            req.user._id;

        // =================================================
        // MY LEAVE
        // =================================================

        if (
            reportType ===
            "my_leave"
        ) {
            const filter = {
                hr: hrId,
            };

            applyDateRange(
                filter,
                "fromDate",
                fromDate,
                toDate
            );

            const records =
                await HRPersonalLeave.find(
                    filter
                )
                    .sort({
                        fromDate: -1,
                    })
                    .lean();

            const approved =
                records.filter(
                    (record) =>
                        String(
                            record.status ||
                                ""
                        ).toLowerCase() ===
                        "approved"
                ).length;

            const pending =
                records.filter(
                    (record) =>
                        String(
                            record.status ||
                                ""
                        ).toLowerCase() ===
                        "pending"
                ).length;

            const rejected =
                records.filter(
                    (record) =>
                        String(
                            record.status ||
                                ""
                        ).toLowerCase() ===
                        "rejected"
                ).length;

            return res.status(200).json({
                success: true,
                reportType,
                data: records,
                summary: {
                    totalRecords:
                        records.length,
                    approved,
                    pending,
                    rejected,
                },
            });
        }

        // =================================================
        // MY ATTENDANCE
        // =================================================

        if (
            reportType ===
            "my_attendance"
        ) {
            const filter = {
                hr: hrId,
            };

            applyDateRange(
                filter,
                "date",
                fromDate,
                toDate
            );

            const records =
                await HRAttendance.find(
                    filter
                )
                    .sort({
                        date: -1,
                    })
                    .lean();

            return res.status(200).json({
                success: true,
                reportType,
                data: records,
                summary: {
                    totalRecords:
                        records.length,
                },
            });
        }

        // =================================================
        // EMPLOYEE REPORTS
        // =================================================

        if (
            reportType ===
                "employee_leave" ||
            reportType ===
                "employee_attendance" ||
            reportType ===
                "employee_salary" ||
            reportType ===
                "employee_payslip"
        ) {
            const {
                employeeIds,
                employee,
            } =
                await getSelectedEmployeeIds(
                    employeeId
                );

            // =============================================
            // EMPLOYEE LEAVE
            // =============================================

            if (
                reportType ===
                "employee_leave"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                applyDateRange(
                    filter,
                    "startDate",
                    fromDate,
                    toDate
                );

                const records =
                    await Leave.find(
                        filter
                    )
                        .populate(
                            employeePopulate
                        )
                        .sort({
                            startDate: -1,
                        })
                        .lean();

                const approved =
                    records.filter(
                        (record) =>
                            String(
                                record.status ||
                                    ""
                            ).toLowerCase() ===
                            "approved"
                    ).length;

                const pending =
                    records.filter(
                        (record) =>
                            String(
                                record.status ||
                                    ""
                            ).toLowerCase() ===
                            "pending"
                    ).length;

                const rejected =
                    records.filter(
                        (record) =>
                            String(
                                record.status ||
                                    ""
                            ).toLowerCase() ===
                            "rejected"
                    ).length;

                return res.status(200).json({
                    success: true,
                    reportType,
                    employee:
                        employee ||
                        null,
                    data: records,
                    summary: {
                        totalRecords:
                            records.length,
                        approved,
                        pending,
                        rejected,
                    },
                });
            }

            // =============================================
            // EMPLOYEE ATTENDANCE
            // =============================================

            if (
                reportType ===
                "employee_attendance"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                applyDateRange(
                    filter,
                    "date",
                    fromDate,
                    toDate
                );

                const records =
                    await Attendance.find(
                        filter
                    )
                        .populate(
                            employeePopulate
                        )
                        .sort({
                            date: -1,
                        })
                        .lean();

                return res.status(200).json({
                    success: true,
                    reportType,
                    employee:
                        employee ||
                        null,
                    data: records,
                    summary: {
                        totalRecords:
                            records.length,
                    },
                });
            }

            // =============================================
            // EMPLOYEE SALARY
            // =============================================

            if (
                reportType ===
                "employee_salary"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                if (month) {
                    filter.month =
                        Number(month);
                }

                if (year) {
                    filter.year =
                        Number(year);
                }

                const records =
                    await Payroll.find(
                        filter
                    )
                        .populate(
                            employeePopulate
                        )
                        .populate(
                            "salaryStructure"
                        )
                        .sort({
                            year: -1,
                            month: -1,
                        })
                        .lean();

                const netSalary =
                    records.reduce(
                        (
                            total,
                            record
                        ) =>
                            total +
                            Number(
                                record.netSalary ||
                                    0
                            ),
                        0
                    );

                const grossSalary =
                    records.reduce(
                        (
                            total,
                            record
                        ) =>
                            total +
                            Number(
                                record.grossSalary ||
                                    0
                            ),
                        0
                    );

                const deductions =
                    records.reduce(
                        (
                            total,
                            record
                        ) =>
                            total +
                            Number(
                                record.totalDeductions ||
                                    0
                            ),
                        0
                    );

                return res.status(200).json({
                    success: true,
                    reportType,
                    employee:
                        employee ||
                        null,
                    data: records,
                    summary: {
                        totalRecords:
                            records.length,
                        grossSalary,
                        deductions,
                        netSalary,
                    },
                });
            }

            // =============================================
            // EMPLOYEE PAYSLIP
            // =============================================

            if (
                reportType ===
                "employee_payslip"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                if (month) {
                    filter.month =
                        Number(month);
                }

                if (year) {
                    filter.year =
                        Number(year);
                }

                const record =
                    await Payroll.findOne(
                        filter
                    )
                        .populate(
                            employeePopulate
                        )
                        .populate(
                            "salaryStructure"
                        )
                        .sort({
                            year: -1,
                            month: -1,
                        })
                        .lean();

                return res.status(200).json({
                    success: true,
                    reportType,
                    employee:
                        employee ||
                        null,
                    data:
                        record ||
                        null,
                    summary: {
                        totalRecords:
                            record ? 1 : 0,
                    },
                });
            }
        }

        // =================================================
        // MY SALARY / MY PAYSLIP
        // =================================================

        if (
            reportType ===
                "my_salary" ||
            reportType ===
                "my_payslip"
        ) {
            const filter = {
                hr: hrId,
            };

            if (month) {
                filter.month =
                    Number(month);
            }

            if (year) {
                filter.year =
                    Number(year);
            }

            const records =
                await HRPayroll.find(
                    filter
                )
                    .populate(
                        "salaryStructure"
                    )
                    .sort({
                        year: -1,
                        month: -1,
                    })
                    .lean();

            const netSalary =
                records.reduce(
                    (
                        total,
                        record
                    ) =>
                        total +
                        Number(
                            record.netSalary ||
                                0
                        ),
                    0
                );

            const grossSalary =
                records.reduce(
                    (
                        total,
                        record
                    ) =>
                        total +
                        Number(
                            record.grossSalary ||
                                0
                        ),
                    0
                );

            const deductions =
                records.reduce(
                    (
                        total,
                        record
                    ) =>
                        total +
                        Number(
                            record.totalDeductions ||
                                0
                        ),
                    0
                );

            return res.status(200).json({
                success: true,
                reportType,
                data:
                    reportType ===
                    "my_payslip"
                        ? records[0] ||
                          null
                        : records,
                summary: {
                    totalRecords:
                        records.length,
                    grossSalary,
                    deductions,
                    netSalary,
                },
            });
        }

        // =================================================
        // INVALID
        // =================================================

        return res.status(400).json({
            success: false,
            message:
                "Invalid report type",
        });
    } catch (error) {
        console.error(
            "HR REPORT ERROR:",
            error
        );

        return res.status(
            error.statusCode ||
                500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to generate report",
            error: error.message,
        });
    }
};

// =====================================================
// DOWNLOAD DATA
// =====================================================

const getDownloadData =
    async (req) => {
        const {
            reportType,
            fromDate,
            toDate,
            employeeId,
            month,
            year,
        } = req.query;

        const hrId =
            req.user._id;

        // =================================================
        // MY LEAVE
        // =================================================

        if (
            reportType ===
            "my_leave"
        ) {
            const filter = {
                hr: hrId,
            };

            applyDateRange(
                filter,
                "fromDate",
                fromDate,
                toDate
            );

            const records =
                await HRPersonalLeave.find(
                    filter
                )
                    .sort({
                        fromDate: -1,
                    })
                    .lean();

            return {
                title:
                    "My Leave Report",

                columns: [
                    "Leave Type",
                    "From Date",
                    "To Date",
                    "Days",
                    "Status",
                    "Reason",
                ],

                rows: records.map(
                    (record) => [
                        record.leaveType ||
                            "-",

                        record.fromDate ||
                            "",

                        record.toDate ||
                            "",

                        record.totalDays ??
                            "-",

                        record.status ||
                            "-",

                        record.reason ||
                            "-",
                    ]
                ),
            };
        }

        // =================================================
        // MY ATTENDANCE
        // =================================================

        if (
            reportType ===
            "my_attendance"
        ) {
            const filter = {
                hr: hrId,
            };

            applyDateRange(
                filter,
                "date",
                fromDate,
                toDate
            );

            const records =
                await HRAttendance.find(
                    filter
                )
                    .sort({
                        date: -1,
                    })
                    .lean();

            return {
                title:
                    "My Attendance Report",

                columns: [
                    "Date",
                    "Punch In",
                    "Punch Out",
                    "Working Minutes",
                    "Break Minutes",
                    "Status",
                ],

                rows: records.map(
                    (record) => [
                        record.date ||
                            "",

                        record.punchIn ||
                            "",

                        record.punchOut ||
                            "",

                        record.totalWorkingMinutes ??
                            0,

                        record.totalBreakMinutes ??
                            0,

                        record.status ||
                            "-",
                    ]
                ),
            };
        }

        // =================================================
        // EMPLOYEE REPORTS
        // =================================================

        if (
            reportType ===
                "employee_leave" ||
            reportType ===
                "employee_attendance" ||
            reportType ===
                "employee_salary"
        ) {
            const {
                employeeIds,
            } =
                await getSelectedEmployeeIds(
                    employeeId
                );

            // =============================================
            // EMPLOYEE LEAVE
            // =============================================

            if (
                reportType ===
                "employee_leave"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                applyDateRange(
                    filter,
                    "startDate",
                    fromDate,
                    toDate
                );

                const records =
                    await Leave.find(
                        filter
                    )
                        .populate({
                            path:
                                "employee",
                            select:
                                "_id employeeId firstName lastName email department designation profileImage",
                        })
                        .sort({
                            startDate: -1,
                        })
                        .lean();

                return {
                    title:
                        "Employee Leave Report",

                    columns: [
                        "Employee",
                        "Employee ID",
                        "Email",
                        "Department",
                        "Designation",
                        "Leave Type",
                        "From Date",
                        "To Date",
                        "Days",
                        "Status",
                    ],

                    rows: records.map(
                        (record) => [
                            getEmployeeName(
                                record.employee
                            ),

                            record
                                .employee
                                ?.employeeId ||
                                "-",

                            record
                                .employee
                                ?.email ||
                                "-",

                            getDepartmentName(
                                record
                                    .employee
                                    ?.department
                            ),

                            getDesignationName(
                                record
                                    .employee
                                    ?.designation
                            ),

                            record.leaveType ||
                                "-",

                            record.startDate ||
                                "",

                            record.endDate ||
                                "",

                            record.totalDays ??
                                "-",

                            record.status ||
                                "-",
                        ]
                    ),
                };
            }

            // =============================================
            // EMPLOYEE ATTENDANCE
            // =============================================

            if (
                reportType ===
                "employee_attendance"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                applyDateRange(
                    filter,
                    "date",
                    fromDate,
                    toDate
                );

                const records =
                    await Attendance.find(
                        filter
                    )
                        .populate({
                            path:
                                "employee",
                            select:
                                "_id employeeId firstName lastName email department designation profileImage",
                        })
                        .sort({
                            date: -1,
                        })
                        .lean();

                return {
                    title:
                        "Employee Attendance Report",

                    columns: [
                        "Employee",
                        "Employee ID",
                        "Email",
                        "Department",
                        "Designation",
                        "Date",
                        "Punch In",
                        "Punch Out",
                        "Working Minutes",
                        "Break Minutes",
                        "Status",
                    ],

                    rows: records.map(
                        (record) => [
                            getEmployeeName(
                                record.employee
                            ),

                            record
                                .employee
                                ?.employeeId ||
                                "-",

                            record
                                .employee
                                ?.email ||
                                "-",

                            getDepartmentName(
                                record
                                    .employee
                                    ?.department
                            ),

                            getDesignationName(
                                record
                                    .employee
                                    ?.designation
                            ),

                            record.date ||
                                "",

                            record.punchIn ||
                                "",

                            record.punchOut ||
                                "",

                            record.totalWorkingMinutes ??
                                0,

                            record.totalBreakMinutes ??
                                0,

                            record.status ||
                                "-",
                        ]
                    ),
                };
            }

            // =============================================
            // EMPLOYEE SALARY
            // =============================================

            if (
                reportType ===
                "employee_salary"
            ) {
                const filter = {
                    employee: {
                        $in: employeeIds,
                    },
                };

                if (month) {
                    filter.month =
                        Number(month);
                }

                if (year) {
                    filter.year =
                        Number(year);
                }

                const records =
                    await Payroll.find(
                        filter
                    )
                        .populate({
                            path:
                                "employee",
                            select:
                                "_id employeeId firstName lastName email department designation profileImage",
                        })
                        .populate(
                            "salaryStructure"
                        )
                        .sort({
                            year: -1,
                            month: -1,
                        })
                        .lean();

                return {
                    title:
                        "Employee Salary Report",

                    columns: [
                        "Employee",
                        "Employee ID",
                        "Email",
                        "Department",
                        "Designation",
                        "Month",
                        "Year",
                        "Gross Salary",
                        "Deductions",
                        "Net Salary",
                        "Status",
                    ],

                    rows: records.map(
                        (record) => [
                            getEmployeeName(
                                record.employee
                            ),

                            record
                                .employee
                                ?.employeeId ||
                                "-",

                            record
                                .employee
                                ?.email ||
                                "-",

                            getDepartmentName(
                                record
                                    .employee
                                    ?.department
                            ),

                            getDesignationName(
                                record
                                    .employee
                                    ?.designation
                            ),

                            record.month ||
                                "-",

                            record.year ||
                                "-",

                            record.grossSalary ??
                                0,

                            record.totalDeductions ??
                                0,

                            record.netSalary ??
                                0,

                            record.status ||
                                "-",
                        ]
                    ),
                };
            }
        }

        // =================================================
        // MY SALARY
        // =================================================

        if (
            reportType ===
                "my_salary" ||
            reportType ===
                "my_payslip"
        ) {
            const filter = {
                hr: hrId,
            };

            if (month) {
                filter.month =
                    Number(month);
            }

            if (year) {
                filter.year =
                    Number(year);
            }

            let records =
                await HRPayroll.find(
                    filter
                )
                    .populate(
                        "salaryStructure"
                    )
                    .sort({
                        year: -1,
                        month: -1,
                    })
                    .lean();

            if (
                reportType ===
                "my_payslip"
            ) {
                records =
                    records.slice(0, 1);
            }

            return {
                title:
                    reportType ===
                    "my_payslip"
                        ? "My Payslip"
                        : "My Salary Report",

                columns: [
                    "Month",
                    "Year",
                    "Gross Salary",
                    "Deductions",
                    "Net Salary",
                    "Status",
                ],

                rows: records.map(
                    (record) => [
                        record.month ||
                            "-",

                        record.year ||
                            "-",

                        record.grossSalary ??
                            0,

                        record.totalDeductions ??
                            0,

                        record.netSalary ??
                            0,

                        record.status ||
                            "-",
                    ]
                ),
            };
        }

        const error =
            new Error(
                "Invalid report type"
            );

        error.statusCode = 400;

        throw error;
    };

// =====================================================
// EMPLOYEE NAME HELPER
// =====================================================

const getEmployeeName = (
    employee
) => {
    if (!employee) {
        return "-";
    }

    if (
        typeof employee ===
        "string"
    ) {
        return employee;
    }

    return [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
        employee.name ||
        employee.employeeId ||
        "-";
};

// =====================================================
// DEPARTMENT HELPER
// =====================================================

const getDepartmentName = (
    department
) => {
    if (!department) {
        return "-";
    }

    if (
        typeof department ===
        "string"
    ) {
        return department;
    }

    return (
        department.name ||
        department.title ||
        department.departmentName ||
        department._id ||
        "-"
    );
};

// =====================================================
// DESIGNATION HELPER
// =====================================================

const getDesignationName = (
    designation
) => {
    if (!designation) {
        return "-";
    }

    if (
        typeof designation ===
        "string"
    ) {
        return designation;
    }

    return (
        designation.name ||
        designation.title ||
        designation.designationName ||
        designation._id ||
        "-"
    );
};

// =====================================================
// CSV
// =====================================================

const escapeCSV = (
    value
) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const text =
        String(value)
            .replace(
                /\r?\n|\r/g,
                " "
            );

    if (
        text.includes(",") ||
        text.includes('"')
    ) {
        return `"${text.replace(
            /"/g,
            '""'
        )}"`;
    }

    return text;
};

const createCSV = (
    columns,
    rows
) => {
    const header =
        columns
            .map(
                escapeCSV
            )
            .join(",");

    const body =
        rows
            .map(
                (row) =>
                    row
                        .map(
                            escapeCSV
                        )
                        .join(",")
            )
            .join("\n");

    return `${header}\n${body}`;
};

// =====================================================
// PDF
// =====================================================

const createPDF = (
    title,
    columns,
    rows
) => {
    return new Promise(
        (
            resolve,
            reject
        ) => {
            const doc =
                new PDFDocument({
                    margin: 30,
                    size: "A4",
                    layout:
                        "landscape",
                });

            const chunks = [];

            doc.on(
                "data",
                (chunk) =>
                    chunks.push(
                        chunk
                    )
            );

            doc.on(
                "end",
                () =>
                    resolve(
                        Buffer.concat(
                            chunks
                        )
                    )
            );

            doc.on(
                "error",
                reject
            );

            doc.fontSize(18)
                .font(
                    "Helvetica-Bold"
                )
                .fillColor(
                    "#111111"
                )
                .text(title);

            doc.moveDown(
                0.4
            );

            doc.fontSize(9)
                .font("Helvetica")
                .fillColor(
                    "#666666"
                )
                .text(
                    `Generated on ${new Date().toLocaleString(
                        "en-IN"
                    )}`
                );

            doc.moveDown();

            const usableWidth =
                doc.page.width -
                doc.page.margins
                    .left -
                doc.page.margins
                    .right;

            const columnWidth =
                usableWidth /
                Math.max(
                    columns.length,
                    1
                );

            const drawRow = (
                values,
                isHeader = false
            ) => {
                if (
                    doc.y >
                    doc.page.height -
                        60
                ) {
                    doc.addPage();
                    doc.y =
                        doc.page
                            .margins
                            .top;
                }

                const startY =
                    doc.y;

                values.forEach(
                    (
                        value,
                        index
                    ) => {
                        const x =
                            doc.page
                                .margins
                                .left +
                            index *
                                columnWidth;

                        doc.font(
                            isHeader
                                ? "Helvetica-Bold"
                                : "Helvetica"
                        )
                            .fontSize(
                                7
                            )
                            .fillColor(
                                "#111111"
                            )
                            .text(
                                String(
                                    value ??
                                        ""
                                ),
                                x,
                                startY,
                                {
                                    width:
                                        columnWidth -
                                        4,
                                    height:
                                        30,
                                    ellipsis:
                                        true,
                                }
                            );
                    }
                );

                doc.y =
                    startY +
                    25;

                doc.moveTo(
                    doc.page
                        .margins
                        .left,
                    doc.y
                )
                    .lineTo(
                        doc.page
                            .width -
                            doc.page
                                .margins
                                .right,
                        doc.y
                    )
                    .strokeColor(
                        "#dddddd"
                    )
                    .stroke();

                doc.moveDown(
                    0.3
                );
            };

            drawRow(
                columns,
                true
            );

            rows.forEach(
                (row) =>
                    drawRow(row)
            );

            doc.end();
        }
    );
};

// =====================================================
// EXCEL
// =====================================================

const createExcel = async (
    title,
    columns,
    rows
) => {
    const workbook =
        new ExcelJS.Workbook();

    workbook.creator =
        "HRMS";

    workbook.created =
        new Date();

    const worksheet =
        workbook.addWorksheet(
            "HR Report"
        );

    // -------------------------------------------------
    // TITLE
    // -------------------------------------------------

    worksheet.mergeCells(
        1,
        1,
        1,
        Math.max(
            columns.length,
            1
        )
    );

    const titleCell =
        worksheet.getCell(
            1,
            1
        );

    titleCell.value =
        title;

    titleCell.font = {
        bold: true,
        size: 16,
    };

    titleCell.alignment = {
        horizontal:
            "center",
        vertical:
            "middle",
    };

    worksheet.getRow(
        1
    ).height = 28;

    // -------------------------------------------------
    // HEADER
    // -------------------------------------------------

    worksheet.addRow(
        columns
    );

    const headerRow =
        worksheet.getRow(2);

    headerRow.font = {
        bold: true,
    };

    headerRow.alignment = {
        horizontal:
            "center",
        vertical:
            "middle",
    };

    // -------------------------------------------------
    // DATA
    // -------------------------------------------------

    rows.forEach(
        (row) => {
            worksheet.addRow(
                row
            );
        }
    );

    // -------------------------------------------------
    // COLUMN WIDTH
    // -------------------------------------------------

    worksheet.columns =
        columns.map(
            (column) => ({
                header:
                    column,
                width:
                    Math.max(
                        15,
                        Math.min(
                            35,
                            column.length +
                                8
                        )
                    ),
            })
        );

    // -------------------------------------------------
    // FREEZE HEADER
    // -------------------------------------------------

    worksheet.views = [
        {
            state: "frozen",
            ySplit: 2,
        },
    ];

    return workbook.xlsx.writeBuffer();
};

// =====================================================
// DOWNLOAD REPORT
// =====================================================

const downloadReport =
    async (
        req,
        res
    ) => {
        try {
            if (!isHR(req)) {
                return res
                    .status(403)
                    .json({
                        success:
                            false,
                        message:
                            "HR access required",
                    });
            }

            const {
                reportType,
                format = "pdf",
            } = req.query;

            if (!reportType) {
                return res
                    .status(400)
                    .json({
                        success:
                            false,
                        message:
                            "reportType is required",
                    });
            }

            const normalizedFormat =
                String(
                    format
                ).toLowerCase();

            if (
                ![
                    "pdf",
                    "excel",
                    "xlsx",
                    "csv",
                ].includes(
                    normalizedFormat
                )
            ) {
                return res
                    .status(400)
                    .json({
                        success:
                            false,
                        message:
                            "Supported formats are pdf, excel and csv",
                    });
            }

            const report =
                await getDownloadData(
                    req
                );

            // =============================================
            // CSV
            // =============================================

            if (
                normalizedFormat ===
                "csv"
            ) {
                const csv =
                    createCSV(
                        report.columns,
                        report.rows
                    );

                res.setHeader(
                    "Content-Type",
                    "text/csv; charset=utf-8"
                );

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="hr-${reportType}-${Date.now()}.csv"`
                );

                return res.send(
                    csv
                );
            }

            // =============================================
            // EXCEL
            // =============================================

            if (
                normalizedFormat ===
                    "excel" ||
                normalizedFormat ===
                    "xlsx"
            ) {
                const buffer =
                    await createExcel(
                        report.title,
                        report.columns,
                        report.rows
                    );

                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );

                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="hr-${reportType}-${Date.now()}.xlsx"`
                );

                return res.send(
                    buffer
                );
            }

            // =============================================
            // PDF
            // =============================================

            const buffer =
                await createPDF(
                    report.title,
                    report.columns,
                    report.rows
                );

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="hr-${reportType}-${Date.now()}.pdf"`
            );

            return res.send(
                buffer
            );
        } catch (error) {
            console.error(
                "HR REPORT DOWNLOAD ERROR:",
                error
            );

            return res
                .status(
                    error.statusCode ||
                        500
                )
                .json({
                    success:
                        false,
                    message:
                        error.message ||
                        "Failed to download report",
                    error:
                        error.message,
                });
        }
    };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getEmployees,
    viewReport,
    downloadReport,
};