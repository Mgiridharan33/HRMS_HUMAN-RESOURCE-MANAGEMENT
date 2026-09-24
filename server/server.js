const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();


// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");


// =====================================================
// ROUTES
// =====================================================
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hrRoutes = require("./routes/hrRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const hrAttendanceRoutes = require("./routes/hrAttendanceRoutes");
const hrPersonalAttendanceRoutes = require("./routes/hrPersonalAttendanceRoutes");
const superAdminAttendanceRoutes = require("./routes/superAdminAttendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const hrLeaveRoutes = require("./routes/hrLeaveRoutes");
const superAdminLeaveRoutes = require("./routes/superAdminLeaveRoutes");
const hrpersonalLeaveRoutes = require("./routes/hrpersonalLeaveRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const salaryStructureRoutes = require("./routes/salaryStructureRoutes");
const employeePayrollRoutes = require("./routes/employeePayrollRoutes");
const hrPayrollRoutes = require("./routes/hrPayrollRoutes");
const hrSalaryStructureRoutes = require("./routes/hrSalaryStructureRoutes");
const hrReportRoutes = require("./routes/hrReportRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const adminJobRoutes = require("./routes/adminJobRoutes");
const adminJobApplicationRoutes = require("./routes/adminJobApplicationRoutes");
const hrJobApplicationRoutes = require("./routes/hrJobApplicationRoutes");
const aptitudeQuestionAssignmentRoutes = require("./routes/aptitudeQuestionRoutes");
const employeeAptitudeQuestionRoutes = require("./routes/employeeAptitudeQuestionRoutes");
const hrAptitudeTestRoutes = require("./routes/hrAptitudeTestRoutes");
const candidateAptitudeTestRoutes = require("./routes/candidateAptitudeTestRoutes");
const videoInterviewRoutes = require("./routes/videoInterviewRoutes");
const videoInterviewEmployeeRoutes = require("./routes/videoInterviewEmployeeRoutes");
// =====================================================
// CANDIDATE ROUTES
// =====================================================

const candidateRoutes = require("./routes/candidateRoutes");


// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// SECURITY
// =====================================================

app.use(
    helmet()
);


// =====================================================
// LOGGER
// =====================================================

app.use(
    morgan("dev")
);


// =====================================================
// CORS
// =====================================================
//
// Existing HRMS frontend:
// http://localhost:5173
//
// Candidate frontend:
// http://localhost:5174
//
// Previous possible frontend:
// http://localhost:5175
//
// Credentials are enabled because authentication
// uses HTTP-only cookies.
// =====================================================

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",

    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
];


app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header.
            //
            // Useful for:
            // - Postman
            // - Server-to-server requests
            // - Health checks
            //
            if (!origin) {
                return callback(null, true);
            }


            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }


            console.error(
                "CORS BLOCKED ORIGIN:",
                origin
            );


            return callback(
                new Error(
                    `CORS not allowed for origin: ${origin}`
                )
            );
        },


        credentials: true,


        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],


        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ],


        optionsSuccessStatus: 204,
    })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.json({
        limit: "10mb",
    })
);


app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);


// =====================================================
// COOKIE
// =====================================================

app.use(
    cookieParser()
);


// =====================================================
// ROOT HEALTH CHECK
// =====================================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({
            success: true,
            message: "HRMS API is running",
        });
    }
);


// =====================================================
// AUTH
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================================
// ADMIN
// =====================================================

app.use(
    "/api/admin",
    adminRoutes
);


// =====================================================
// HR
// =====================================================

app.use(
    "/api/hr",
    hrJobApplicationRoutes
);


app.use(
    "/api/hr",
    hrAptitudeTestRoutes
);


app.use(
    "/api/hr",
    hrRoutes
);


// =====================================================
// EMPLOYEES
// =====================================================

app.use(
    "/api/employees",
    employeeRoutes
);


// =====================================================
// ATTENDANCE
// =====================================================

app.use(
    "/api/attendance",
    attendanceRoutes
);


// =====================================================
// HR ATTENDANCE
// =====================================================

app.use(
    "/api/hr-attendance",
    hrAttendanceRoutes
);


// =====================================================
// HR PERSONAL ATTENDANCE
// =====================================================

app.use(
    "/api/hr-personal-attendance",
    hrPersonalAttendanceRoutes
);


// =====================================================
// SUPER ADMIN ATTENDANCE
// =====================================================

app.use(
    "/api/superadmin-attendance",
    superAdminAttendanceRoutes
);


// =====================================================
// EMPLOYEE LEAVE
// =====================================================

app.use(
    "/api/leave",
    leaveRoutes
);


// =====================================================
// HR LEAVE
// =====================================================

app.use(
    "/api/hr-leaves",
    hrLeaveRoutes
);


// =====================================================
// HR PERSONAL LEAVE
// =====================================================

app.use(
    "/api/hr-personal-leaves",
    hrpersonalLeaveRoutes
);


// =====================================================
// SUPER ADMIN LEAVE
// =====================================================

app.use(
    "/api/super-admin/leaves",
    superAdminLeaveRoutes
);


// =====================================================
// PAYROLL
// =====================================================
//
// /api/payroll + router.post("/")
//
// becomes:
//
// POST /api/payroll
// =====================================================

app.use(
    "/api/payroll",
    payrollRoutes
);


app.use(
    "/api/hr-payroll",
    hrPayrollRoutes
);


// =====================================================
// HR REPORTS
// =====================================================

app.use(
    "/api/hr-reports",
    hrReportRoutes
);


// =====================================================
// SALARY STRUCTURES
// =====================================================

app.use(
    "/api/salary-structures",
    salaryStructureRoutes
);


app.use(
    "/api/hr-salary-structures",
    hrSalaryStructureRoutes
);


// =====================================================
// EMPLOYEE PAYROLL
// =====================================================

app.use(
    "/api/employee/payroll",
    employeePayrollRoutes
);


// =====================================================
// CANDIDATE
// =====================================================

app.use(
    "/api/candidates",
    candidateRoutes
);

app.use(
    "/api/job-applications",
    jobApplicationRoutes
);

app.use(
    "/api/jobs",
    jobRoutes
);


app.use(
    "/api/admin/jobs",
    adminJobRoutes
);

app.use(
    "/api/admin/job-applications",
    adminJobApplicationRoutes
);

app.use(
    "/api/admin",
    aptitudeQuestionAssignmentRoutes
);

app.use(
    "/api/employee",
    employeeAptitudeQuestionRoutes
);

app.use(
    "/api/candidate",
    candidateAptitudeTestRoutes
);

app.use(
    "/api/video-interviews",
    videoInterviewRoutes
);

app.use(
    "/api/video-interviews",
    videoInterviewEmployeeRoutes
);
// =====================================================
// PAYROLL ROUTE DEBUG
// =====================================================

app.get(
    "/api/payroll-server-test",
    (req, res) => {

        return res.status(200).json({
            success: true,
            message:
                "Payroll endpoint is mounted in server.js",
        });
    }
);


// =====================================================
// CANDIDATE SERVER TEST
// =====================================================
//
// Use:
// GET http://localhost:5000/api/candidate-server-test
//
// This is only a backend connectivity test.
// =====================================================

app.get(
    "/api/candidate-server-test",
    (req, res) => {

        return res.status(200).json({
            success: true,
            message:
                "Candidate endpoint is mounted in server.js",
        });
    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        console.error(
            "ROUTE NOT FOUND:",
            req.method,
            req.originalUrl
        );


        return res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`,
        });
    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "GLOBAL ERROR:",
            err
        );


        return res
            .status(err.status || 500)
            .json({
                success: false,

                message:
                    err.message ||
                    "Internal server error",

                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? err.stack
                        : undefined,
            });
    }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            `HRMS Server running on port ${PORT}`
        );

        console.log(
            "Allowed frontend origins:"
        );

        console.log(
            " - http://localhost:5173"
        );

        console.log(
            " - http://localhost:5174"
        );

        console.log(
            " - http://localhost:5175"
        );

        console.log(
            "Candidate API:"
        );

        console.log(
            " - /api/candidates"
        );

        console.log(
            "Payroll route:"
        );

        console.log(
            " - /api/payroll"
        );

        console.log(
            "Payroll test:"
        );

        console.log(
            " - /api/payroll-server-test"
        );

        console.log(
            "Candidate test:"
        );

        console.log(
            " - /api/candidate-server-test"
        );

        console.log(
            "======================================"
        );
    }
);