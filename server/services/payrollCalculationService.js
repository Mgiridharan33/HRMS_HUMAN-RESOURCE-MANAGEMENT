const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const SalaryStructure = require("../models/SalaryStructure");


// =====================================================
// DATE HELPERS
// =====================================================

const startOfMonth = (year, month) => {

    return new Date(
        year,
        month - 1,
        1,
        0,
        0,
        0,
        0
    );
};


const endOfMonth = (year, month) => {

    return new Date(
        year,
        month,
        0,
        23,
        59,
        59,
        999
    );
};


// =====================================================
// DAYS IN MONTH
// =====================================================

const getDaysInMonth = (
    year,
    month
) => {

    return new Date(
        year,
        month,
        0
    ).getDate();
};


// =====================================================
// ROUND MONEY
// =====================================================

const roundMoney = (value) => {

    return Math.round(
        (Number(value) || 0) * 100
    ) / 100;
};


// =====================================================
// GET EMPLOYEE
// =====================================================

const getEmployee = async (
    employeeId
) => {

    if (
        !employeeId ||
        !mongoose.Types.ObjectId.isValid(
            employeeId
        )
    ) {

        throw new Error(
            "Invalid employee ID."
        );
    }


    const employee =
        await Employee.findById(
            employeeId
        );


    if (!employee) {

        throw new Error(
            "Employee not found."
        );
    }


    if (
        employee.isActive === false
    ) {

        throw new Error(
            "Employee account is inactive."
        );
    }


    return employee;
};


// =====================================================
// GET SALARY STRUCTURE
// =====================================================

const getSalaryStructure = async (
    employeeId
) => {

    const salary =
        await SalaryStructure.findOne({

            employee:
                employeeId,

            isActive:
                true,

        })
        .sort({
            effectiveFrom: -1,
            createdAt: -1,
        });


    if (!salary) {

        throw new Error(
            "Active salary structure not found for this employee."
        );
    }


    return salary;
};


// =====================================================
// GET ATTENDANCE
// =====================================================

const getAttendance = async (
    employeeId,
    year,
    month
) => {

    const fromDate =
        startOfMonth(
            year,
            month
        );

    const toDate =
        endOfMonth(
            year,
            month
        );


    return Attendance.find({

        employee:
            employeeId,

        date: {
            $gte:
                fromDate,

            $lte:
                toDate,
        },

    })
    .sort({
        date: 1,
    });
};


// =====================================================
// GET APPROVED LEAVES
// =====================================================

const getApprovedLeaves = async (
    employeeId,
    year,
    month
) => {

    const fromDate =
        startOfMonth(
            year,
            month
        );

    const toDate =
        endOfMonth(
            year,
            month
        );


    return Leave.find({

        employee:
            employeeId,

        status:
            "Approved",

        startDate: {
            $lte:
                toDate,
        },

        endDate: {
            $gte:
                fromDate,
        },

    });
};


// =====================================================
// CALCULATE LEAVE DAYS IN PAYROLL MONTH
// =====================================================

const calculateLeaveDays = (
    leave,
    year,
    month
) => {

    const monthStart =
        startOfMonth(
            year,
            month
        );

    const monthEnd =
        endOfMonth(
            year,
            month
        );


    const leaveStart =
        new Date(
            leave.startDate
        );

    const leaveEnd =
        new Date(
            leave.endDate
        );


    const effectiveStart =
        leaveStart > monthStart
            ? leaveStart
            : monthStart;

    const effectiveEnd =
        leaveEnd < monthEnd
            ? leaveEnd
            : monthEnd;


    effectiveStart.setHours(
        0,
        0,
        0,
        0
    );

    effectiveEnd.setHours(
        0,
        0,
        0,
        0
    );


    if (
        effectiveEnd <
        effectiveStart
    ) {

        return 0;
    }


    const difference =
        effectiveEnd.getTime() -
        effectiveStart.getTime();


    return (
        Math.floor(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1
    );
};


// =====================================================
// CALCULATE ATTENDANCE SUMMARY
// =====================================================

const calculateAttendanceSummary = (
    attendance,
    totalDays
) => {

    let presentDays = 0;

    let absentDays = 0;

    let halfDays = 0;

    let leaveDays = 0;


    attendance.forEach(
        (record) => {

            const status =
                String(
                    record.status || ""
                ).trim();


            if (
                status ===
                "Present"
            ) {

                presentDays += 1;

            } else if (
                status ===
                "Absent"
            ) {

                absentDays += 1;

            } else if (
                status ===
                "Half Day"
            ) {

                halfDays += 1;

            } else if (
                status ===
                "Leave"
            ) {

                leaveDays += 1;
            }
        }
    );


    return {

        totalDays,

        presentDays,

        absentDays,

        halfDays,

        leaveDays,

    };
};


// =====================================================
// GET NUMERIC VALUE
// =====================================================

const numberValue = (
    object,
    ...keys
) => {

    for (
        const key of keys
    ) {

        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null
        ) {

            const value =
                Number(
                    object[key]
                );


            if (
                !Number.isNaN(
                    value
                )
            ) {

                return value;
            }
        }
    }


    return 0;
};


// =====================================================
// CALCULATE SALARY COMPONENTS
// =====================================================

const calculateSalaryComponents = (
    salary
) => {

    const basic =
        numberValue(
            salary,
            "basicSalary",
            "basic"
        );


    const hra =
        numberValue(
            salary,
            "hra",
            "HRA"
        );


    const allowances =
        numberValue(
            salary,
            "allowances",
            "totalAllowances"
        );


    const transportAllowance =
        numberValue(
            salary,
            "transportAllowance"
        );


    const medicalAllowance =
        numberValue(
            salary,
            "medicalAllowance"
        );


    const otherAllowance =
        numberValue(
            salary,
            "otherAllowance"
        );


    const bonus =
        numberValue(
            salary,
            "bonus"
        );


    const overtime =
        numberValue(
            salary,
            "overtime"
        );


    const totalAllowances =
        allowances +
        transportAllowance +
        medicalAllowance +
        otherAllowance;


    const grossSalary =
        basic +
        hra +
        totalAllowances +
        bonus +
        overtime;


    const pf =
        numberValue(
            salary,
            "pf",
            "providentFund"
        );


    const esi =
        numberValue(
            salary,
            "esi"
        );


    const professionalTax =
        numberValue(
            salary,
            "professionalTax"
        );


    const tds =
        numberValue(
            salary,
            "tds"
        );


    const otherDeductions =
        numberValue(
            salary,
            "otherDeductions"
        );


    return {

        basic,

        hra,

        allowances:
            totalAllowances,

        bonus,

        overtime,

        grossSalary:
            roundMoney(
                grossSalary
            ),

        pf,

        esi,

        professionalTax,

        tds,

        otherDeductions,

    };
};


// =====================================================
// MAIN PAYROLL CALCULATION
// =====================================================

const calculatePayroll = async ({
    employeeId,
    year,
    month,
}) => {

    // -------------------------------------------------
    // VALIDATE MONTH
    // -------------------------------------------------

    if (
        !Number.isInteger(
            Number(year)
        ) ||
        !Number.isInteger(
            Number(month)
        ) ||
        Number(month) < 1 ||
        Number(month) > 12
    ) {

        throw new Error(
            "Valid payroll year and month are required."
        );
    }


    year =
        Number(year);

    month =
        Number(month);


    // -------------------------------------------------
    // EMPLOYEE
    // -------------------------------------------------

    const employee =
        await getEmployee(
            employeeId
        );


    // -------------------------------------------------
    // SALARY
    // -------------------------------------------------

    const salary =
        await getSalaryStructure(
            employee._id
        );


    // -------------------------------------------------
    // ATTENDANCE
    // -------------------------------------------------

    const attendance =
        await getAttendance(
            employee._id,
            year,
            month
        );


    // -------------------------------------------------
    // LEAVE
    // -------------------------------------------------

    const approvedLeaves =
        await getApprovedLeaves(
            employee._id,
            year,
            month
        );


    // -------------------------------------------------
    // DAYS
    // -------------------------------------------------

    const totalDays =
        getDaysInMonth(
            year,
            month
        );


    // -------------------------------------------------
    // ATTENDANCE SUMMARY
    // -------------------------------------------------

    const attendanceSummary =
        calculateAttendanceSummary(
            attendance,
            totalDays
        );


    // -------------------------------------------------
    // APPROVED LEAVE DAYS
    // -------------------------------------------------

    let paidLeaveDays = 0;


    approvedLeaves.forEach(
        (leave) => {

            paidLeaveDays +=
                calculateLeaveDays(
                    leave,
                    year,
                    month
                );
        }
    );


    // -------------------------------------------------
    // PREVENT EXCESS LEAVE
    // -------------------------------------------------

    paidLeaveDays =
        Math.min(
            paidLeaveDays,
            totalDays
        );


    // -------------------------------------------------
    // LOP DAYS
    // -------------------------------------------------

    const effectivePresentDays =
        attendanceSummary.presentDays +
        (
            attendanceSummary.halfDays *
            0.5
        );


    const lopDays =
        Math.max(

            0,

            totalDays -
            effectivePresentDays -
            paidLeaveDays

        );


    // -------------------------------------------------
    // SALARY COMPONENTS
    // -------------------------------------------------

    const components =
        calculateSalaryComponents(
            salary
        );


    // -------------------------------------------------
    // PER DAY SALARY
    // -------------------------------------------------

    const monthlyGross =
        components.grossSalary;


    const perDaySalary =
        monthlyGross /
        totalDays;


    // -------------------------------------------------
    // LOSS OF PAY
    // -------------------------------------------------

    const lossOfPay =
        roundMoney(
            perDaySalary *
            lopDays
        );


    // -------------------------------------------------
    // ADJUSTED GROSS
    // -------------------------------------------------

    const adjustedGrossSalary =
        roundMoney(
            Math.max(
                0,
                monthlyGross -
                lossOfPay
            )
        );


    // -------------------------------------------------
    // DEDUCTIONS
    // -------------------------------------------------

    const totalDeductions =
        roundMoney(

            components.pf +
            components.esi +
            components.professionalTax +
            components.tds +
            components.otherDeductions +
            lossOfPay

        );


    // -------------------------------------------------
    // NET SALARY
    // -------------------------------------------------

    const netSalary =
        roundMoney(

            Math.max(
                0,
                adjustedGrossSalary -
                (
                    components.pf +
                    components.esi +
                    components.professionalTax +
                    components.tds +
                    components.otherDeductions
                )
            )
        );


    // -------------------------------------------------
    // RESULT
    // -------------------------------------------------

    return {

        employee: {
            id:
                employee._id,

            employeeId:
                employee.employeeId,

            name:
                `${employee.firstName || ""} ${employee.lastName || ""}`
                    .trim(),

            email:
                employee.email,

            department:
                employee.department,

            designation:
                employee.designation,
        },


        payrollPeriod: {

            year,

            month,

            totalDays,

        },


        attendance: {

            ...attendanceSummary,

            paidLeaveDays,

            lopDays,

        },


        earnings: {

            basic:
                components.basic,

            hra:
                components.hra,

            allowances:
                components.allowances,

            bonus:
                components.bonus,

            overtime:
                components.overtime,

            grossSalary:
                components.grossSalary,

            adjustedGrossSalary,

        },


        deductions: {

            pf:
                components.pf,

            esi:
                components.esi,

            professionalTax:
                components.professionalTax,

            tds:
                components.tds,

            otherDeductions:
                components.otherDeductions,

            lossOfPay,

            totalDeductions,

        },


        netSalary,

    };
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    calculatePayroll,

    getDaysInMonth,

    startOfMonth,

    endOfMonth,

    roundMoney,

};