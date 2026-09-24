import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// =====================================================
// MONTHS
// =====================================================

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {

    const amount =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


const formatDate = (value) => {

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

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const getMonthName = (month) => {

    const index =
        Number(month) - 1;

    return (
        MONTHS[index] ||
        "—"
    );
};


const getEmployeeName = (payroll) => {

    if (
        payroll?.employeeName
    ) {
        return payroll.employeeName;
    }

    const employee =
        payroll?.employee;

    if (
        employee?.firstName ||
        employee?.lastName
    ) {

        return `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();
    }

    if (
        employee?.name
    ) {
        return employee.name;
    }

    return "Unknown Employee";
};


const getEmployeeId = (payroll) => {

    if (
        payroll?.employeeId
    ) {
        return payroll.employeeId;
    }

    if (
        payroll?.employee?.employeeId
    ) {
        return payroll.employee.employeeId;
    }

    return "—";
};


// =====================================================
// DOWNLOAD PAYSLIP
// =====================================================

export const downloadPayrollPayslip = (
    payroll
) => {

    if (!payroll) {

        throw new Error(
            "Payroll information is unavailable."
        );
    }


    // =================================================
    // DOCUMENT
    // =================================================

    const doc =
        new jsPDF(
            {
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            }
        );


    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();


    const margin =
        14;


    // =================================================
    // HEADER
    // =================================================

    doc.setFillColor(
        25,
        35,
        55
    );

    doc.rect(
        0,
        0,
        pageWidth,
        34,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        20
    );

    doc.text(
        "PAYSLIP",
        margin,
        15
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        9
    );

    doc.text(
        "Employee Payroll Statement",
        margin,
        22
    );


    // =================================================
    // PAYROLL PERIOD
    // =================================================

    const periodText =
        `${getMonthName(
            payroll.month
        )} ${payroll.year}`;


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        11
    );

    doc.text(
        periodText,
        pageWidth - margin,
        15,
        {
            align: "right",
        }
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        8
    );

    doc.text(
        `Generated: ${formatDate(
            new Date()
        )}`,
        pageWidth - margin,
        22,
        {
            align: "right",
        }
    );


    // =================================================
    // EMPLOYEE INFORMATION
    // =================================================

    autoTable(
        doc,
        {
            startY: 42,

            theme: "grid",

            head: [
                [
                    "Employee Information",
                    "",
                ],
            ],

            body: [
                [
                    "Employee Name",
                    getEmployeeName(
                        payroll
                    ),
                ],
                [
                    "Employee ID",
                    getEmployeeId(
                        payroll
                    ),
                ],
                [
                    "Department",
                    payroll.department ||
                    payroll.employee?.department ||
                    "—",
                ],
                [
                    "Designation",
                    payroll.designation ||
                    payroll.employee?.designation ||
                    "—",
                ],
                [
                    "Payroll Period",
                    periodText,
                ],
                [
                    "Period Start",
                    formatDate(
                        payroll.periodStart
                    ),
                ],
                [
                    "Period End",
                    formatDate(
                        payroll.periodEnd
                    ),
                ],
            ],

            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [
                    220,
                    224,
                    230,
                ],
            },

            headStyles: {
                fillColor: [
                    40,
                    55,
                    80,
                ],
                textColor: [
                    255,
                    255,
                    255,
                ],
                fontStyle: "bold",
            },

            columnStyles: {
                0: {
                    cellWidth: 48,
                    fontStyle: "bold",
                },

                1: {
                    cellWidth: 130,
                },
            },
        }
    );


    // =================================================
    // ATTENDANCE
    // =================================================

    let currentY =
        doc.lastAutoTable.finalY + 8;


    doc.setTextColor(
        30,
        35,
        45
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        12
    );

    doc.text(
        "Attendance Summary",
        margin,
        currentY
    );


    currentY += 3;


    autoTable(
        doc,
        {
            startY: currentY,

            theme: "grid",

            head: [
                [
                    "Working Days",
                    "Present",
                    "Absent",
                    "Half Days",
                    "Leave",
                    "Paid Leave",
                    "Unpaid Leave",
                    "Overtime",
                ],
            ],

            body: [
                [
                    payroll.workingDays ?? 0,
                    payroll.presentDays ?? 0,
                    payroll.absentDays ?? 0,
                    payroll.halfDays ?? 0,
                    payroll.leaveDays ?? 0,
                    payroll.paidLeaveDays ?? 0,
                    payroll.unpaidLeaveDays ?? 0,
                    `${Number(
                        payroll.overtimeHours || 0
                    ).toFixed(2)} hrs`,
                ],
            ],

            styles: {
                fontSize: 7.5,
                cellPadding: 2.5,
                halign: "center",
            },

            headStyles: {
                fillColor: [
                    65,
                    75,
                    95,
                ],
                textColor: [
                    255,
                    255,
                    255,
                ],
                fontStyle: "bold",
            },
        }
    );


    // =================================================
    // EARNINGS + DEDUCTIONS
    // =================================================

    currentY =
        doc.lastAutoTable.finalY + 8;


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        12
    );

    doc.text(
        "Salary Details",
        margin,
        currentY
    );


    currentY += 3;


    autoTable(
        doc,
        {
            startY: currentY,

            theme: "grid",

            head: [
                [
                    "Earnings",
                    "Amount",
                    "Deductions",
                    "Amount",
                ],
            ],

            body: [
                [
                    "Basic Salary",
                    formatCurrency(
                        payroll.basicSalary
                    ),
                    "PF",
                    formatCurrency(
                        payroll.pf
                    ),
                ],

                [
                    "HRA",
                    formatCurrency(
                        payroll.hra
                    ),
                    "ESI",
                    formatCurrency(
                        payroll.esi
                    ),
                ],

                [
                    "DA",
                    formatCurrency(
                        payroll.da
                    ),
                    "Professional Tax",
                    formatCurrency(
                        payroll.professionalTax
                    ),
                ],

                [
                    "TA / Conveyance",
                    formatCurrency(
                        payroll.ta
                    ),
                    "TDS",
                    formatCurrency(
                        payroll.tds
                    ),
                ],

                [
                    "Other Allowances",
                    formatCurrency(
                        payroll.otherAllowances
                    ),
                    "Attendance Deduction",
                    formatCurrency(
                        payroll.attendanceDeduction
                    ),
                ],

                [
                    "Bonus",
                    formatCurrency(
                        payroll.bonus
                    ),
                    "Unpaid Leave Deduction",
                    formatCurrency(
                        payroll.unpaidLeaveDeduction
                    ),
                ],

                [
                    "Overtime",
                    formatCurrency(
                        payroll.overtimeAmount
                    ),
                    "Other Deductions",
                    formatCurrency(
                        payroll.otherDeductions
                    ),
                ],

                [
                    "Gross Salary",
                    formatCurrency(
                        payroll.grossSalary
                    ),
                    "Total Deductions",
                    formatCurrency(
                        payroll.totalDeductions
                    ),
                ],
            ],

            styles: {
                fontSize: 8.5,
                cellPadding: 3,
            },

            headStyles: {
                fillColor: [
                    40,
                    55,
                    80,
                ],
                textColor: [
                    255,
                    255,
                    255,
                ],
                fontStyle: "bold",
            },

            columnStyles: {

                0: {
                    cellWidth: 52,
                },

                1: {
                    cellWidth: 42,
                    halign: "right",
                },

                2: {
                    cellWidth: 58,
                },

                3: {
                    cellWidth: 42,
                    halign: "right",
                },
            },

            didParseCell: (
                data
            ) => {

                if (
                    data.row.index === 7
                ) {

                    data.cell.styles.fontStyle =
                        "bold";
                }
            },
        }
    );


    // =================================================
    // NET SALARY
    // =================================================

    currentY =
        doc.lastAutoTable.finalY + 9;


    doc.setFillColor(
        240,
        244,
        248
    );


    doc.roundedRect(
        margin,
        currentY,
        pageWidth -
            margin * 2,
        23,
        3,
        3,
        "F"
    );


    doc.setTextColor(
        35,
        45,
        60
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        11
    );

    doc.text(
        "NET SALARY",
        margin + 6,
        currentY + 9
    );


    doc.setFontSize(
        17
    );

    doc.text(
        formatCurrency(
            payroll.netSalary
        ),
        pageWidth - margin - 6,
        currentY + 12,
        {
            align: "right",
        }
    );


    // =================================================
    // PAYMENT INFORMATION
    // =================================================

    currentY += 33;


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        12
    );

    doc.text(
        "Payment Information",
        margin,
        currentY
    );


    currentY += 3;


    autoTable(
        doc,
        {
            startY: currentY,

            theme: "grid",

            body: [
                [
                    "Status",
                    payroll.status ||
                    "—",
                ],

                [
                    "Payment Method",
                    payroll.paymentMethod ||
                    "—",
                ],

                [
                    "Payment Reference",
                    payroll.paymentReference ||
                    "—",
                ],

                [
                    "Paid Date",
                    formatDate(
                        payroll.paidAt
                    ),
                ],
            ],

            styles: {
                fontSize: 9,
                cellPadding: 3,
            },

            columnStyles: {
                0: {
                    cellWidth: 48,
                    fontStyle: "bold",
                },

                1: {
                    cellWidth: 130,
                },
            },
        }
    );


    // =================================================
    // NOTES
    // =================================================

    if (
        payroll.notes
    ) {

        currentY =
            doc.lastAutoTable.finalY + 8;


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(
            10
        );

        doc.text(
            "Notes",
            margin,
            currentY
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(
            8.5
        );


        const noteLines =
            doc.splitTextToSize(
                String(
                    payroll.notes
                ),
                pageWidth -
                    margin * 2
            );


        doc.text(
            noteLines,
            margin,
            currentY + 6
        );
    }


    // =================================================
    // FOOTER
    // =================================================

    doc.setDrawColor(
        220,
        224,
        230
    );


    doc.line(
        margin,
        pageHeight - 20,
        pageWidth - margin,
        pageHeight - 20
    );


    doc.setTextColor(
        110,
        115,
        125
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(
        7.5
    );


    doc.text(
        "This is a computer-generated payslip and does not require a signature.",
        margin,
        pageHeight - 14
    );


    doc.text(
        `Payroll ID: ${
            payroll._id || "—"
        }`,
        pageWidth - margin,
        pageHeight - 14,
        {
            align: "right",
        }
    );


    // =================================================
    // FILE NAME
    // =================================================

    const employeeName =
        getEmployeeName(
            payroll
        )
            .replace(
                /[^a-zA-Z0-9]+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );


    const fileName =
        `Payslip_${employeeName}_${getMonthName(
            payroll.month
        )}_${payroll.year}.pdf`;


    // =================================================
    // SAVE
    // =================================================

    doc.save(
        fileName
    );
};