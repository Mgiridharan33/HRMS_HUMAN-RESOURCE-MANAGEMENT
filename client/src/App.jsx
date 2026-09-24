import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";


/* =========================================================
   AUTH
========================================================= */

import Login from "./pages/auth/Login";


/* =========================================================
   ROUTE PROTECTION
========================================================= */

import RoleRoute from "./routes/RoleRoute";


/* =========================================================
   LAYOUTS
========================================================= */

import AdminLayout
    from "./components/layout/AdminLayout";

import HRLayout
    from "./layouts/HRLayout";

import EmployeeLayout
    from "./layouts/EmployeeLayout";


/* =========================================================
   SUPER ADMIN PAGES
========================================================= */

import SuperAdminDashboard
    from "./pages/superAdmin/Dashboard";

import HRManagement
    from "./pages/superAdmin/HRManagement";

import HRProfile
    from "./pages/superAdmin/HRProfile";

import HREdit
    from "./pages/superAdmin/HREdit";

import EmployeeManagement
    from "./pages/superAdmin/EmployeeManagement";

import EmployeeProfile
    from "./pages/superAdmin/EmployeeProfile";

import EmployeeEdit
    from "./pages/superAdmin/EmployeeEdit";

import SuperAdminAttendance
    from "./pages/superadmin/SuperAdminAttendance";

import SuperAdminleave
    from "./pages/superadmin/SuperAdminLeaveApplications";

import HRPersonalLeaveManagement
    from "./pages/superAdmin/HRPersonalLeaveManagement";

import SuperAdminPayrollManagement
    from "./pages/superAdmin/SuperAdminPayrollManagement";

import SuperAdminHRPayrollManagement
    from "./pages/superAdmin/HRPayroll";


/* =========================================================
   SALARY STRUCTURE
========================================================= */

import SalaryStructureManagement
    from "./pages/superAdmin/SalaryStructureManagement";

import HRSalaryStructureManagement
    from "./pages/superAdmin/HRSalaryStructure/HRSalaryStructureManagement";


/* =========================================================
   JOB MANAGEMENT
========================================================= */

import AdminJobManagement
    from "./pages/Admin/AdminJobManagement";

import AdminJobCreate
    from "./pages/Admin/AdminJobCreate";

import AdminJobEdit
    from "./pages/Admin/AdminJobEdit";

import AdminJobdashboard
    from "./pages/Admin/AdminDashboard";

import AdminAptitudeQuestionAssignment
    from "./pages/admin/AdminAptitudeQuestionAssignment";

import AdminVideoInterview from "./pages/Admin/AdminVideoInterview";

/* =========================================================
   CANDIDATE APPLICATIONS
========================================================= */

import JobApplications
    from "./pages/Admin/JobApplications";


/* =========================================================
   HR PAGES
========================================================= */

import HRDashboard
    from "./pages/hr/Dashboard";

import HREmployeeManagement
    from "./pages/hr/EmployeeManagement";

import HREmployeeProfile
    from "./pages/hr/EmployeeProfile";

import HREmployeeEdit
    from "./pages/hr/EmployeeEdit";

import HRAttendance
    from "./pages/hr/Attendance";

import Attendance
    from "./pages/hr/HRAttendance";

import HRLeave
    from "./pages/hr/HRLeave";

import HRPersonalLeave
    from "./pages/hr/HRPersonalLeave";

import HRPayrollManagement
    from "./pages/hr/HRPayrollManagement";

import HROwnPayroll
    from "./pages/hr/HRPayroll";

import HRReports
    from "./pages/hr/HRReports";

import HRJobApplications
    from "./pages/hr/HRJobApplications";

import HRInterview from "./pages/hr/HRInterview";

import HRVideoInterview from "./pages/hr/HRVideoInterview";
/* =========================================================
   EMPLOYEE PAGES
========================================================= */

import EmployeeDashboard
    from "./pages/employee/Dashboard";

import EmployeeProfilePage
    from "./pages/employee/Profile";

import EmployeeEditProfile
    from "./pages/employee/EditProfile";

import EmployeeAttendance
    from "./pages/employee/Attendance";

import EmployeeLeave
    from "./pages/employee/EmployeeLeave";

import EmployeeDocuments
    from "./pages/employee/EmployeeReports";

import EmployeeAnnouncements
    from "./pages/employee/Announcements";

import EmployeeSettings
    from "./pages/employee/Settings";

import EmployeePayroll
    from "./pages/employee/EmployeePayroll";

import EmployeeAptitudeQuestions from "./pages/employee/EmployeeAptitudeQuestions";

import EmployeeVideoInterview from "./pages/employee/EmployeeVideoInterview";


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =================================================
                    PUBLIC
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                {/* =================================================
                    SUPER ADMIN
                ================================================= */}

                <Route
                    path="/super-admin"

                    element={

                        <RoleRoute
                            allowedRoles={[
                                "SUPER_ADMIN",
                            ]}
                        >

                            <AdminLayout />

                        </RoleRoute>

                    }
                >

                    {/* =================================================
                        DEFAULT
                    ================================================= */}

                    <Route
                        index
                        element={
                            <Navigate
                                to="dashboard"
                                replace
                            />
                        }
                    />


                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        path="dashboard"
                        element={
                            <SuperAdminDashboard />
                        }
                    />


                    {/* =================================================
                        CANDIDATE APPLICATIONS

                        URL:
                        /super-admin/applications
                    ================================================= */}

                    <Route
                        path="applications"
                        element={
                            <JobApplications />
                        }
                    />


                    {/* =================================================
                        JOB MANAGEMENT

                        URL:
                        /super-admin/jobs
                    ================================================= */}

                    <Route
                        path="jobs"
                        element={
                            <AdminJobManagement />
                        }
                    />


                    {/* =================================================
                        CREATE JOB

                        URL:
                        /super-admin/jobs/create
                    ================================================= */}

                    <Route
                        path="jobs/create"
                        element={
                            <AdminJobCreate />
                        }
                    />


                    {/* =================================================
                        EDIT JOB

                        URL:
                        /super-admin/jobs/:id/edit

                        IMPORTANT:
                        :id is a dynamic route parameter.
                        Do NOT use /jobs/:id/edit directly
                        as a sidebar navigation URL.
                    ================================================= */}

                    <Route
                        path="jobs/:id/edit"
                        element={
                            <AdminJobEdit />
                        }
                    />


                    {/* =================================================
                        JOB DASHBOARD

                        URL:
                        /super-admin/job/dashboard
                    ================================================= */}

                    <Route
                        path="job/dashboard"
                        element={
                            <AdminJobdashboard />
                        }
                    />

                    <Route
                        path="aptitude-question-assignments"
                        element={
                            <AdminAptitudeQuestionAssignment />
                        }
                    />

                        <Route
                        path="aptitude-video-interview"
                        element={
                            <AdminVideoInterview/>
                        }
                        />

                    <Route
                        path="video-interviews"
                        element={
                            <AdminVideoInterview />
                        }
                    />

                    {/* =================================================
                        HR MANAGEMENT
                    ================================================= */}

                    <Route
                        path="hr"
                        element={
                            <HRManagement />
                        }
                    />


                    {/* =================================================
                        HR PROFILE

                        URL:
                        /super-admin/hr/:id
                    ================================================= */}

                    <Route
                        path="hr/:id"
                        element={
                            <HRProfile />
                        }
                    />


                    {/* =================================================
                        HR EDIT

                        URL:
                        /super-admin/hr/:id/edit
                    ================================================= */}

                    <Route
                        path="hr/:id/edit"
                        element={
                            <HREdit />
                        }
                    />


                    {/* =================================================
                        EMPLOYEE MANAGEMENT
                    ================================================= */}

                    <Route
                        path="employees"
                        element={
                            <EmployeeManagement />
                        }
                    />


                    {/* =================================================
                        EMPLOYEE PROFILE
                    ================================================= */}

                    <Route
                        path="employees/:id"
                        element={
                            <EmployeeProfile />
                        }
                    />


                    {/* =================================================
                        EMPLOYEE EDIT
                    ================================================= */}

                    <Route
                        path="employees/:id/edit"
                        element={
                            <EmployeeEdit />
                        }
                    />


                    {/* =================================================
                        DEPARTMENTS
                    ================================================= */}

                    <Route
                        path="departments"
                        element={
                            <div>
                                Departments
                            </div>
                        }
                    />


                    {/* =================================================
                        DESIGNATIONS
                    ================================================= */}

                    <Route
                        path="designations"
                        element={
                            <div>
                                Designations
                            </div>
                        }
                    />


                    {/* =================================================
                        ATTENDANCE
                    ================================================= */}

                    <Route
                        path="attendance"
                        element={
                            <SuperAdminAttendance />
                        }
                    />


                    {/* =================================================
                        LEAVE
                    ================================================= */}

                    <Route
                        path="leave"
                        element={
                            <SuperAdminleave />
                        }
                    />


                    {/* =================================================
                        HR PERSONAL LEAVE MANAGEMENT
                    ================================================= */}

                    <Route
                        path="hr/leave"
                        element={
                            <HRPersonalLeaveManagement />
                        }
                    />


                    {/* =================================================
                        SALARY STRUCTURE
                    ================================================= */}

                    <Route
                        path="salary-structures"
                        element={
                            <SalaryStructureManagement />
                        }
                    />


                    {/* =================================================
                        HR SALARY STRUCTURE
                    ================================================= */}

                    <Route
                        path="hr/salary-structures"
                        element={
                            <HRSalaryStructureManagement />
                        }
                    />


                    {/* =================================================
                        PAYROLL
                    ================================================= */}

                    <Route
                        path="payroll"
                        element={
                            <SuperAdminPayrollManagement />
                        }
                    />


                    {/* =================================================
                        HR PAYROLL
                    ================================================= */}

                    <Route
                        path="hr/payroll"
                        element={
                            <SuperAdminHRPayrollManagement />
                        }
                    />


                    {/* =================================================
                        ANNOUNCEMENTS
                    ================================================= */}

                    <Route
                        path="announcements"
                        element={
                            <div>
                                Announcements
                            </div>
                        }
                    />


                    {/* =================================================
                        REPORTS
                    ================================================= */}

                    <Route
                        path="reports"
                        element={
                            <div>
                                Reports
                            </div>
                        }
                    />


                    {/* =================================================
                        SETTINGS
                    ================================================= */}

                    <Route
                        path="settings"
                        element={
                            <div>
                                Settings
                            </div>
                        }
                    />

                </Route>


                {/* =================================================
                    HR
                ================================================= */}

                <Route
                    path="/hr"

                    element={

                        <RoleRoute
                            allowedRoles={[
                                "HR",
                            ]}
                        >

                            <HRLayout />

                        </RoleRoute>

                    }
                >

                    {/* =================================================
                        DEFAULT
                    ================================================= */}

                    <Route
                        index
                        element={
                            <Navigate
                                to="dashboard"
                                replace
                            />
                        }
                    />


                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        path="dashboard"
                        element={
                            <HRDashboard />
                        }
                    />


                        <Route
                            path="applications"
                            element={
                                <HRJobApplications />
                            }
                        />

                        <Route
                        path="/hr/interviews"
                        element={
                            <HRInterview />
                        }
                    />

                    <Route
                        path="/hr/video-interviews"
                        element={
                            <HRVideoInterview />
                        }
                    />
                    
                    {/* =================================================
                        EMPLOYEES
                    ================================================= */}

                    <Route
                        path="employees"
                        element={
                            <HREmployeeManagement />
                        }
                    />


                    {/* =================================================
                        EMPLOYEE PROFILE
                    ================================================= */}

                    <Route
                        path="employees/:id"
                        element={
                            <HREmployeeProfile />
                        }
                    />


                    {/* =================================================
                        EMPLOYEE EDIT
                    ================================================= */}

                    <Route
                        path="employees/:id/edit"
                        element={
                            <HREmployeeEdit />
                        }
                    />


                    {/* =================================================
                        DEPARTMENTS
                    ================================================= */}

                    <Route
                        path="departments"
                        element={
                            <div>
                                HR Departments
                            </div>
                        }
                    />


                    {/* =================================================
                        ATTENDANCE
                    ================================================= */}

                    <Route
                        path="attendance"
                        element={
                            <HRAttendance />
                        }
                    />


                    {/* =================================================
                        PERSONAL ATTENDANCE
                    ================================================= */}

                    <Route
                        path="my-attendance"
                        element={
                            <Attendance />
                        }
                    />


                    {/* =================================================
                        LEAVE
                    ================================================= */}

                    <Route
                        path="leave"
                        element={
                            <HRLeave />
                        }
                    />


                    {/* =================================================
                        PERSONAL LEAVE
                    ================================================= */}

                    <Route
                        path="leave/personal"
                        element={
                            <HRPersonalLeave />
                        }
                    />


                    {/* =================================================
                        HR PAYROLL
                    ================================================= */}

                    <Route
                        path="payroll"
                        element={
                            <HRPayrollManagement />
                        }
                    />


                    {/* =================================================
                        HR OWN PAYROLL
                    ================================================= */}

                    <Route
                        path="mypayroll"
                        element={
                            <HROwnPayroll />
                        }
                    />


                    {/* =================================================
                        HR REPORTS
                    ================================================= */}

                    <Route
                        path="reports"
                        element={
                            <HRReports />
                        }
                    />


                    {/* =================================================
                        HR PROFILE
                    ================================================= */}

                    <Route
                        path="profile"
                        element={
                            <div>
                                HR Profile
                            </div>
                        }
                    />


                    {/* =================================================
                        HR SETTINGS
                    ================================================= */}

                    <Route
                        path="settings"
                        element={
                            <div>
                                HR Settings
                            </div>
                        }
                    />

                </Route>


                {/* =================================================
                    EMPLOYEE
                ================================================= */}

                <Route
                    path="/employee"

                    element={

                        <RoleRoute
                            allowedRoles={[
                                "EMPLOYEE",
                            ]}
                        >

                            <EmployeeLayout />

                        </RoleRoute>

                    }
                >

                    {/* =================================================
                        DEFAULT
                    ================================================= */}

                    <Route
                        index
                        element={
                            <Navigate
                                to="dashboard"
                                replace
                            />
                        }
                    />


                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Route
                        path="dashboard"
                        element={
                            <EmployeeDashboard />
                        }
                    />
                   <Route
                        path="/employee/aptitude-questions"
                        element={
                            <EmployeeAptitudeQuestions />
                        }
                    />

                    <Route
                        path="/employee/video-interview"
                        element={
                            <EmployeeVideoInterview/>
                        }
                    />


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <Route
                        path="profile"
                        element={
                            <EmployeeProfilePage />
                        }
                    />


                    {/* =================================================
                        EDIT PROFILE
                    ================================================= */}

                    <Route
                        path="profile/edit"
                        element={
                            <EmployeeEditProfile />
                        }
                    />


                    {/* =================================================
                        ATTENDANCE
                    ================================================= */}

                    <Route
                        path="attendance"
                        element={
                            <EmployeeAttendance />
                        }
                    />


                    {/* =================================================
                        LEAVE
                    ================================================= */}

                    <Route
                        path="leave"
                        element={
                            <EmployeeLeave />
                        }
                    />


                    {/* =================================================
                        PAYROLL
                    ================================================= */}

                    <Route
                        path="payroll"
                        element={
                            <EmployeePayroll />
                        }
                    />


                    {/* =================================================
                        DOCUMENTS
                    ================================================= */}

                    <Route
                        path="documents"
                        element={
                            <EmployeeDocuments />
                        }
                    />


                    {/* =================================================
                        ANNOUNCEMENTS
                    ================================================= */}

                    <Route
                        path="announcements"
                        element={
                            <EmployeeAnnouncements />
                        }
                    />


                    {/* =================================================
                        SETTINGS
                    ================================================= */}

                    <Route
                        path="settings"
                        element={
                            <EmployeeSettings />
                        }
                    />


                    {/* =================================================
                        BACKWARD COMPATIBILITY
                    ================================================= */}

                    <Route
                        path="edit-profile"
                        element={
                            <EmployeeEditProfile />
                        }
                    />

                </Route>


                {/* =================================================
                    404
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;