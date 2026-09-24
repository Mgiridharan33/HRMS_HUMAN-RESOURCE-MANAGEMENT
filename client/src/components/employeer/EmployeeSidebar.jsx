import {
    LayoutDashboard,
    UserCircle,
    CalendarCheck,
    CalendarDays,
    WalletCards,
    FileText,
    Megaphone,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
     Brain, 
     Video,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import { useState } from "react";

import "./EmployeeSidebar.css";


const EmployeeSidebar = () => {

    const navigate = useNavigate();

    const [collapsed, setCollapsed] =
        useState(false);


    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/", {
            replace: true,
        });

    };


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const mainNavigation = [

        {
            label: "Dashboard",
            path: "/employee/dashboard",
            icon: LayoutDashboard,
        },

    ];


    const employeeNavigation = [

        {
            label: "My Profile",
            path: "/employee/profile",
            icon: UserCircle,
        },

        {
            label: "Attendance",
            path: "/employee/attendance",
            icon: CalendarCheck,
        },

     {
    label: "Leave",
    icon: CalendarDays,
    path: "/employee/leave",
},

        {
    label: "Aptitude",
    icon:  Brain,
    path: "/employee/aptitude-questions",
},

            {
    label: "Video Interview",
    icon:  Video,
    path: "/employee/video-interview",
},
   
     

    ];


    const payrollNavigation = [

        {
            label: "Payroll",
            path: "/employee/payroll",
            icon: WalletCards,
        },

        {
            label: "Documents",
            path: "/employee/documents",
            icon: FileText,
        },

    ];


    const companyNavigation = [

        {
            label: "Announcements",
            path: "/employee/announcements",
            icon: Megaphone,
        },

    ];


    /* =====================================================
       RENDER NAVIGATION
    ===================================================== */

    const renderNavigation = (items) => {

        return items.map((item) => {

            const Icon = item.icon;

            return (

                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `employee-sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                    title={
                        collapsed
                            ? item.label
                            : ""
                    }
                >

                    <Icon size={19} />

                    {!collapsed && (

                        <span>
                            {item.label}
                        </span>

                    )}

                </NavLink>

            );

        });

    };


    return (

        <aside
            className={
                collapsed
                    ? "employee-sidebar collapsed"
                    : "employee-sidebar"
            }
        >

            {/* =================================================
               LOGO
            ================================================= */}

            <div className="employee-sidebar-logo">

                <div className="employee-logo-icon">
                    HR
                </div>


                {!collapsed && (

                    <div className="employee-logo-content">

                        <strong>
                            HRMS
                        </strong>

                        <span>
                            Employee Portal
                        </span>

                    </div>

                )}

            </div>


            {/* =================================================
               COLLAPSE BUTTON
            ================================================= */}

            <button
                type="button"
                className="employee-sidebar-collapse"
                onClick={() =>
                    setCollapsed(
                        !collapsed
                    )
                }
                title={
                    collapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                }
            >

                {collapsed ? (

                    <ChevronRight size={17} />

                ) : (

                    <ChevronLeft size={17} />

                )}

            </button>


            {/* =================================================
               NAVIGATION
            ================================================= */}

            <div className="employee-sidebar-navigation">


                {/* MAIN */}

                <div className="employee-sidebar-section">

                    {!collapsed && (

                        <div className="employee-sidebar-section-title">
                            MAIN
                        </div>

                    )}

                    {renderNavigation(
                        mainNavigation
                    )}

                </div>


                {/* MY WORK */}

                <div className="employee-sidebar-section">

                    {!collapsed && (

                        <div className="employee-sidebar-section-title">
                            MY WORK
                        </div>

                    )}

                    {renderNavigation(
                        employeeNavigation
                    )}

                </div>


                {/* PAYROLL */}

                <div className="employee-sidebar-section">

                    {!collapsed && (

                        <div className="employee-sidebar-section-title">
                            PAYROLL & DOCUMENTS
                        </div>

                    )}

                    {renderNavigation(
                        payrollNavigation
                    )}

                </div>


                {/* COMPANY */}

                <div className="employee-sidebar-section">

                    {!collapsed && (

                        <div className="employee-sidebar-section-title">
                            COMPANY
                        </div>

                    )}

                    {renderNavigation(
                        companyNavigation
                    )}

                </div>

            </div>


            {/* =================================================
               BOTTOM
            ================================================= */}

            <div className="employee-sidebar-bottom">

                <NavLink
                    to="/employee/settings"
                    className={({ isActive }) =>
                        `employee-sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                    title={
                        collapsed
                            ? "Settings"
                            : ""
                    }
                >

                    <Settings size={19} />

                    {!collapsed && (

                        <span>
                            Settings
                        </span>

                    )}

                </NavLink>


                <button
                    type="button"
                    className="employee-sidebar-link logout"
                    onClick={
                        handleLogout
                    }
                    title={
                        collapsed
                            ? "Logout"
                            : ""
                    }
                >

                    <LogOut size={19} />

                    {!collapsed && (

                        <span>
                            Logout
                        </span>

                    )}

                </button>

            </div>

        </aside>

    );

};


export default EmployeeSidebar;