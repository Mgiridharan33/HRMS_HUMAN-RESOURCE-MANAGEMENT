const Attendance = require("../models/Attendance");

const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


// =====================================================
// HELPERS
// =====================================================

const getEmployeeName = (employee) => {

    if (!employee) {
        return "Unknown Employee";
    }

    if (employee.name) {
        return employee.name;
    }

    const name =
        `${employee.firstName || ""} ${employee.lastName || ""}`
            .trim();

    return name || "Unknown Employee";
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (value) => {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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


// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (value) => {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }
    );
};


// =====================================================
// FORMAT WORKING DURATION
// =====================================================

const formatDuration = (
    seconds,
    minutes
) => {

    if (Number(seconds) > 0) {

        const safeSeconds =
            Number(seconds);

        const hours =
            Math.floor(
                safeSeconds / 3600
            );

        const mins =
            Math.floor(
                (safeSeconds % 3600) / 60
            );

        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }


    if (Number(minutes) > 0) {

        const safeMinutes =
            Number(minutes);

        const hours =
            Math.floor(
                safeMinutes / 60
            );

        const mins =
            safeMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }


    return "—";
};


// =====================================================
// GET BREAK MINUTES
// =====================================================

const getBreakMinutes = (record) => {

    if (
        Number(record.totalBreakMinutes) > 0
    ) {

        return Number(
            record.totalBreakMinutes
        );
    }


    return (
        record.breaks?.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    (
                        Number(
                            item?.durationMinutes
                        ) || 0
                    )
                );

            },
            0
        ) || 0
    );
};


// =====================================================
// GET LUNCH MINUTES
// =====================================================

const getLunchMinutes = (record) => {

    return (
        Number(
            record.lunch?.totalMinutes
        ) || 0
    );
};


// =====================================================
// BUILD ATTENDANCE QUERY
// =====================================================

const buildAttendanceQuery = ({
    date,
    fromDate,
    toDate,
    status,
    employeeId,
}) => {

    const query = {};


    // =================================================
    // EMPLOYEE
    // =================================================

    if (employeeId) {

        query.employee =
            employeeId;
    }


    // =================================================
    // STATUS
    // =================================================

    if (
        status &&
        String(status).toLowerCase() !== "all"
    ) {

        query.status =
            status;
    }


    // =================================================
    // SINGLE DATE
    // =================================================

    if (date) {

        const start =
            new Date(
                `${date}T00:00:00.000`
            );

        const end =
            new Date(
                `${date}T23:59:59.999`
            );


        if (
            !Number.isNaN(
                start.getTime()
            ) &&
            !Number.isNaN(
                end.getTime()
            )
        ) {

            query.date = {
                $gte: start,
                $lte: end,
            };
        }
    }


    // =================================================
    // DATE RANGE
    // =================================================

    else if (
        fromDate ||
        toDate
    ) {

        query.date = {};


        if (fromDate) {

            const start =
                new Date(
                    `${fromDate}T00:00:00.000`
                );


            if (
                !Number.isNaN(
                    start.getTime()
                )
            ) {

                query.date.$gte =
                    start;
            }
        }


        if (toDate) {

            const end =
                new Date(
                    `${toDate}T23:59:59.999`
                );


            if (
                !Number.isNaN(
                    end.getTime()
                )
            ) {

                query.date.$lte =
                    end;
            }
        }
    }


    return query;
};


// =====================================================
// GET ALL EMPLOYEE ATTENDANCE
//
// GET /api/hr-attendance
//
// Examples:
//
// /api/hr-attendance
//
// /api/hr-attendance?date=2026-08-13
//
// /api/hr-attendance?status=Present
//
// /api/hr-attendance?fromDate=2026-08-01&toDate=2026-08-13
//
// /api/hr-attendance?employeeId=EMP001
// =====================================================

const getAllEmployeeAttendance = async (
    req,
    res
) => {

    try {

        const {
            date,
            fromDate,
            toDate,
            status,
            employeeId,
        } = req.query;


        // =================================================
        // BUILD QUERY
        // =================================================

        const query =
            buildAttendanceQuery({
                date,
                fromDate,
                toDate,
                status,
                employeeId,
            });


        // =================================================
        // GET RECORDS
        // =================================================

        const attendance =
            await Attendance
                .find(query)
                .populate(
                    "employee",
                    [
                        "employeeId",
                        "name",
                        "firstName",
                        "lastName",
                        "email",
                        "department",
                        "designation",
                        "profileImage",
                    ].join(" ")
                )
                .sort({
                    date: -1,
                    createdAt: -1,
                })
                .lean();


        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            count:
                attendance.length,

            attendance,

        });

    } catch (error) {

        console.error(
            "GET ALL EMPLOYEE ATTENDANCE ERROR:",
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
// GET EXPORT RECORDS
// =====================================================

const getExportRecords = async ({
    date,
    fromDate,
    toDate,
    status,
    employeeId,
}) => {

    const query =
        buildAttendanceQuery({
            date,
            fromDate,
            toDate,
            status,
            employeeId,
        });


    const records =
        await Attendance
            .find(query)
            .populate({
                path: "employee",
                select:
                    "name firstName lastName employeeId email department designation profileImage",
            })
            .sort({
                date: 1,
                createdAt: 1,
            })
            .lean();


    return records;
};


// =====================================================
// DOWNLOAD HR ATTENDANCE
//
// GET /api/hr-attendance/download
//
// Examples:
//
// /api/hr-attendance/download?fromDate=2026-08-12&toDate=2026-08-13&status=All&format=xlsx
//
// /api/hr-attendance/download?fromDate=2026-08-12&toDate=2026-08-13&status=Present&format=csv
//
// /api/hr-attendance/download?date=2026-08-13&status=All&format=pdf
// =====================================================

const downloadHRAttendance = async (
    req,
    res
) => {

    try {

        const {
            fromDate,
            toDate,
            date,
            status = "All",
            employeeId,
            format = "xlsx",
        } = req.query;


        // =================================================
        // FORMAT
        // =================================================

        const selectedFormat =
            String(format)
                .trim()
                .toLowerCase();


        if (
            ![
                "xlsx",
                "csv",
                "pdf",
            ].includes(
                selectedFormat
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid export format. Please select xlsx, csv or pdf.",

            });
        }


        // =================================================
        // DATE VALIDATION
        // =================================================

        if (
            fromDate &&
            toDate &&
            fromDate > toDate
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "From Date cannot be later than To Date.",

            });
        }


        // =================================================
        // GET RECORDS
        // =================================================

        const records =
            await getExportRecords({
                date,
                fromDate,
                toDate,
                status,
                employeeId,
            });


        // =================================================
        // NO DATA
        // =================================================

        if (!records.length) {

            return res.status(404).json({

                success: false,

                message:
                    "No attendance records found for the selected filters.",

            });
        }


        // =================================================
        // XLSX EXPORT
        // =================================================

        if (
            selectedFormat === "xlsx"
        ) {

            const workbook =
                new ExcelJS.Workbook();


            const worksheet =
                workbook.addWorksheet(
                    "Attendance"
                );


            // -------------------------------------------------
            // COLUMNS
            // -------------------------------------------------

            worksheet.columns = [

                {
                    header: "Employee",
                    key: "employee",
                    width: 28,
                },

                {
                    header: "Employee ID",
                    key: "employeeId",
                    width: 18,
                },

                {
                    header: "Email",
                    key: "email",
                    width: 30,
                },

                {
                    header: "Department",
                    key: "department",
                    width: 20,
                },

                {
                    header: "Date",
                    key: "date",
                    width: 18,
                },

                {
                    header: "Punch In",
                    key: "punchIn",
                    width: 18,
                },

                {
                    header: "Punch Out",
                    key: "punchOut",
                    width: 18,
                },

                {
                    header: "Break",
                    key: "break",
                    width: 14,
                },

                {
                    header: "Lunch",
                    key: "lunch",
                    width: 14,
                },

                {
                    header: "Working Hours",
                    key: "workingHours",
                    width: 18,
                },

                {
                    header: "Status",
                    key: "status",
                    width: 16,
                },

            ];


            // -------------------------------------------------
            // ROWS
            // -------------------------------------------------

            records.forEach(
                (record) => {

                    const employee =
                        record.employee ||
                        {};


                    worksheet.addRow({

                        employee:
                            getEmployeeName(
                                employee
                            ),

                        employeeId:
                            employee.employeeId ||
                            employee._id ||
                            "—",

                        email:
                            employee.email ||
                            "—",

                        department:
                            employee.department ||
                            "—",

                        date:
                            formatDate(
                                record.date
                            ),

                        punchIn:
                            formatTime(
                                record.punchIn
                            ),

                        punchOut:
                            formatTime(
                                record.punchOut
                            ),

                        break:
                            `${getBreakMinutes(record)} min`,

                        lunch:
                            `${getLunchMinutes(record)} min`,

                        workingHours:
                            formatDuration(
                                record.totalWorkingSeconds,
                                record.totalWorkingMinutes
                            ),

                        status:
                            record.status ||
                            "Present",

                    });
                }
            );


            // -------------------------------------------------
            // HEADER
            // -------------------------------------------------

            const headerRow =
                worksheet.getRow(1);


            headerRow.font = {
                bold: true,
            };


            headerRow.alignment = {
                vertical: "middle",
                horizontal: "center",
            };


            headerRow.height =
                24;


            // -------------------------------------------------
            // AUTO FILTER
            // -------------------------------------------------

            worksheet.autoFilter = {
                from: "A1",
                to: "K1",
            };


            // -------------------------------------------------
            // FREEZE
            // -------------------------------------------------

            worksheet.views = [
                {
                    state: "frozen",
                    ySplit: 1,
                },
            ];


            // -------------------------------------------------
            // FILENAME
            // -------------------------------------------------

            const filename =
                `HR_Attendance_${fromDate || date || "all"}_${toDate || ""}.xlsx`;


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );


            await workbook.xlsx.write(
                res
            );


            return res.end();
        }


        // =================================================
        // CSV EXPORT
        // =================================================

        if (
            selectedFormat === "csv"
        ) {

            const headers = [

                "Employee",
                "Employee ID",
                "Email",
                "Department",
                "Date",
                "Punch In",
                "Punch Out",
                "Break",
                "Lunch",
                "Working Hours",
                "Status",

            ];


            // -------------------------------------------------
            // ESCAPE CSV
            // -------------------------------------------------

            const escapeCsv = (
                value
            ) => {

                const text =
                    String(
                        value ?? ""
                    );


                return `"${text.replace(
                    /"/g,
                    '""'
                )}"`;
            };


            // -------------------------------------------------
            // ROWS
            // -------------------------------------------------

            const rows =
                records.map(
                    (record) => {

                        const employee =
                            record.employee ||
                            {};


                        return [

                            getEmployeeName(
                                employee
                            ),

                            employee.employeeId ||
                                employee._id ||
                                "—",

                            employee.email ||
                                "—",

                            employee.department ||
                                "—",

                            formatDate(
                                record.date
                            ),

                            formatTime(
                                record.punchIn
                            ),

                            formatTime(
                                record.punchOut
                            ),

                            `${getBreakMinutes(record)} min`,

                            `${getLunchMinutes(record)} min`,

                            formatDuration(
                                record.totalWorkingSeconds,
                                record.totalWorkingMinutes
                            ),

                            record.status ||
                                "Present",

                        ]
                            .map(
                                escapeCsv
                            )
                            .join(",");

                    }
                );


            const csv =
                [
                    headers
                        .map(
                            escapeCsv
                        )
                        .join(","),

                    ...rows,

                ].join("\n");


            // -------------------------------------------------
            // FILENAME
            // -------------------------------------------------

            const filename =
                `HR_Attendance_${fromDate || date || "all"}_${toDate || ""}.csv`;


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            res.setHeader(
                "Content-Type",
                "text/csv; charset=utf-8"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );


            return res.send(
                "\uFEFF" + csv
            );
        }


        // =================================================
        // PDF EXPORT
        // =================================================

        if (
            selectedFormat === "pdf"
        ) {

            const filename =
                `HR_Attendance_${fromDate || date || "all"}_${toDate || ""}.pdf`;


            // -------------------------------------------------
            // RESPONSE HEADERS
            // -------------------------------------------------

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
            );


            // -------------------------------------------------
            // PDF
            // -------------------------------------------------

            const doc =
                new PDFDocument({
                    size: "A4",
                    layout: "landscape",
                    margin: 25,
                });


            doc.pipe(res);


            // -------------------------------------------------
            // TITLE
            // -------------------------------------------------

            doc
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(
                    "HR Attendance Report",
                    {
                        align: "center",
                    }
                );


            doc
                .moveDown(0.3)
                .fontSize(9)
                .font("Helvetica")
                .text(
                    `Total Records: ${records.length}`,
                    {
                        align: "center",
                    }
                );


            // -------------------------------------------------
            // PERIOD
            // -------------------------------------------------

            if (
                fromDate &&
                toDate
            ) {

                doc
                    .fontSize(9)
                    .text(
                        `Period: ${fromDate} to ${toDate}`,
                        {
                            align: "center",
                        }
                    );

            } else if (date) {

                doc
                    .fontSize(9)
                    .text(
                        `Date: ${date}`,
                        {
                            align: "center",
                        }
                    );

            } else {

                doc
                    .fontSize(9)
                    .text(
                        "Period: All Attendance Records",
                        {
                            align: "center",
                        }
                    );
            }


            doc.moveDown(1);


            // -------------------------------------------------
            // TABLE COLUMNS
            // -------------------------------------------------

            const columns = [

                {
                    title: "Employee",
                    width: 120,
                },

                {
                    title: "ID",
                    width: 70,
                },

                {
                    title: "Department",
                    width: 75,
                },

                {
                    title: "Date",
                    width: 70,
                },

                {
                    title: "Punch In",
                    width: 60,
                },

                {
                    title: "Punch Out",
                    width: 60,
                },

                {
                    title: "Break",
                    width: 50,
                },

                {
                    title: "Lunch",
                    width: 50,
                },

                {
                    title: "Working",
                    width: 65,
                },

                {
                    title: "Status",
                    width: 65,
                },

            ];


            const rowHeight =
                25;


            let x =
                doc.page.margins.left;


            let y =
                doc.y;


            // -------------------------------------------------
            // DRAW HEADER FUNCTION
            // -------------------------------------------------

            const drawHeader = () => {

                x =
                    doc.page.margins.left;


                doc.font(
                    "Helvetica-Bold"
                );


                columns.forEach(
                    (column) => {

                        doc
                            .rect(
                                x,
                                y,
                                column.width,
                                rowHeight
                            )
                            .stroke();


                        doc
                            .fontSize(7)
                            .text(
                                column.title,
                                x + 3,
                                y + 8,
                                {
                                    width:
                                        column.width - 6,

                                    align:
                                        "center",
                                }
                            );


                        x +=
                            column.width;
                    }
                );


                y +=
                    rowHeight;


                doc.font(
                    "Helvetica"
                );
            };


            // -------------------------------------------------
            // FIRST HEADER
            // -------------------------------------------------

            drawHeader();


            // -------------------------------------------------
            // DATA ROWS
            // -------------------------------------------------

            records.forEach(
                (record) => {

                    // -----------------------------------------
                    // NEW PAGE
                    // -----------------------------------------

                    if (
                        y + rowHeight >
                        doc.page.height -
                        doc.page.margins.bottom -
                        20
                    ) {

                        doc.addPage({
                            size: "A4",
                            layout: "landscape",
                            margin: 25,
                        });


                        y =
                            doc.page.margins.top;


                        drawHeader();
                    }


                    const employee =
                        record.employee ||
                        {};


                    const values = [

                        getEmployeeName(
                            employee
                        ),

                        employee.employeeId ||
                            employee._id ||
                            "—",

                        employee.department ||
                            "—",

                        formatDate(
                            record.date
                        ),

                        formatTime(
                            record.punchIn
                        ),

                        formatTime(
                            record.punchOut
                        ),

                        `${getBreakMinutes(record)}m`,

                        `${getLunchMinutes(record)}m`,

                        formatDuration(
                            record.totalWorkingSeconds,
                            record.totalWorkingMinutes
                        ),

                        record.status ||
                            "Present",

                    ];


                    x =
                        doc.page.margins.left;


                    values.forEach(
                        (
                            value,
                            index
                        ) => {

                            const column =
                                columns[index];


                            doc
                                .rect(
                                    x,
                                    y,
                                    column.width,
                                    rowHeight
                                )
                                .stroke();


                            doc
                                .fontSize(6.5)
                                .font(
                                    "Helvetica"
                                )
                                .text(
                                    String(
                                        value
                                    ),
                                    x + 3,
                                    y + 8,
                                    {
                                        width:
                                            column.width - 6,

                                        align:
                                            "center",

                                        ellipsis:
                                            true,
                                    }
                                );


                            x +=
                                column.width;
                        }
                    );


                    y +=
                        rowHeight;
                }
            );


            // -------------------------------------------------
            // FOOTER
            // -------------------------------------------------

            doc
                .fontSize(7)
                .font("Helvetica")
                .text(
                    `Generated on ${new Date().toLocaleString("en-IN")}`,
                    doc.page.margins.left,
                    doc.page.height -
                    doc.page.margins.bottom +
                    5
                );


            // -------------------------------------------------
            // END PDF
            // -------------------------------------------------

            doc.end();

            return;
        }


    } catch (error) {

        console.error(
            "HR ATTENDANCE EXPORT ERROR:",
            error
        );


        if (
            !res.headersSent
        ) {

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to export attendance.",

            });
        }
    }
};


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports = {

    getAllEmployeeAttendance,

    downloadHRAttendance,

};