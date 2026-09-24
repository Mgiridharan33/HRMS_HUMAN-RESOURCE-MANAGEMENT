import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ClipboardCheck,
    BarChart3,
    UserCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    WalletCards,
    BriefcaseBusiness,
    Video,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useState,
} from "react";


const HRSidebar = () => {

    const navigate = useNavigate();

    const [
        collapsed,
        setCollapsed,
    ] = useState(false);


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate(
            "/",
            {
                replace: true,
            }
        );

    };


    // =====================================================
    // MAIN NAVIGATION
    // =====================================================

    const mainNavigation = [

        {
            label: "Dashboard",

            path: "/hr/dashboard",

            icon: LayoutDashboard,
        },

    ];


    // =====================================================
    // EMPLOYEE NAVIGATION
    // =====================================================

    const employeeNavigation = [

        {
            label: "Employees",

            path: "/hr/employees",

            icon: Users,
        },

    ];


    // =====================================================
    // RECRUITMENT NAVIGATION
    // =====================================================

    const recruitmentNavigation = [

        {
            label: "Job Applications",

            path: "/hr/applications",

            icon: BriefcaseBusiness,
        },

        {
                label: "Interviews",
                path: "/hr/interviews",
                icon: ClipboardCheck,
            },

                { 
                 label: "Meet Interview",
                path: "/hr/video-interviews",
                icon: Video,
            },


    ];


    // =====================================================
    // ATTENDANCE NAVIGATION
    // =====================================================

    const attendanceNavigation = [

        {
            label: "Employee Attendance",

            path: "/hr/attendance",

            icon: Users,
        },

        {
            label: "My Attendance",

            path: "/hr/my-attendance",

            icon: UserCheck,
        },

    ];


    // =====================================================
    // LEAVE NAVIGATION
    // =====================================================

    const leaveNavigation = [

        {
            label: "Leave Requests",

            path: "/hr/leave",

            icon: CalendarDays,
        },

        {
            label: "My Leave",

            path: "/hr/leave/personal",

            icon: CalendarDays,
        },

    ];


    // =====================================================
    // PAYROLL NAVIGATION
    // =====================================================

    const payrollNavigation = [

        {
            label: "Payroll",

            path: "/hr/payroll",

            icon: WalletCards,
        },

        {
            label: "My Payroll",

            path: "/hr/mypayroll",

            icon: WalletCards,
        },

    ];


    // =====================================================
    // REPORT NAVIGATION
    // =====================================================

    const reportNavigation = [

        {
            label: "Reports",

            path: "/hr/reports",

            icon: BarChart3,
        },

    ];


    // =====================================================
    // RENDER NAVIGATION
    // =====================================================

    const renderNavigation = (
        items
    ) => {

        return items.map(
            (
                item
            ) => {

                const Icon =
                    item.icon;

                return (

                    <NavLink
                        key={
                            item.path
                        }
                        to={
                            item.path
                        }
                        className={({
                            isActive,
                        }) =>
                            `hr-sidebar-link ${
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

                        <Icon
                            size={19}
                        />

                        {!collapsed && (

                            <span>
                                {
                                    item.label
                                }
                            </span>

                        )}

                    </NavLink>

                );

            }
        );

    };


    // =====================================================
    // SIDEBAR SECTION
    // =====================================================

    const renderSection = (
        title,
        items
    ) => {

        return (

            <div
                className="hr-sidebar-section"
            >

                {!collapsed && (

                    <div
                        className={
                            "hr-sidebar-section-title"
                        }
                    >
                        {
                            title
                        }
                    </div>

                )}

                {renderNavigation(
                    items
                )}

            </div>

        );

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <aside
            className={
                collapsed
                    ? "hr-sidebar collapsed"
                    : "hr-sidebar"
            }
        >

            {/* =================================================
                LOGO
            ================================================= */}

            <div
                className="hr-sidebar-logo"
            >

                <div
                    className="hr-logo-icon"
                >
                    HR
                </div>


                {!collapsed && (

                    <div
                        className="hr-logo-content"
                    >

                        <strong>
                            HRMS
                        </strong>

                        <span>
                            Human Resources
                        </span>

                    </div>

                )}

            </div>


            {/* =================================================
                COLLAPSE BUTTON
            ================================================= */}

            <button
                type="button"
                className="hr-sidebar-collapse"
                onClick={() =>
                    setCollapsed(
                        previous =>
                            !previous
                    )
                }
                title={
                    collapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                }
            >

                {collapsed ? (

                    <ChevronRight
                        size={17}
                    />

                ) : (

                    <ChevronLeft
                        size={17}
                    />

                )}

            </button>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div
                className="hr-sidebar-navigation"
            >

                {/* =================================================
                    MAIN
                ================================================= */}

                {renderSection(
                    "MAIN",
                    mainNavigation
                )}


                {/* =================================================
                    EMPLOYEE MANAGEMENT
                ================================================= */}

                {renderSection(
                    "EMPLOYEE MANAGEMENT",
                    employeeNavigation
                )}


                {/* =================================================
                    RECRUITMENT
                ================================================= */}

                {renderSection(
                    "RECRUITMENT",
                    recruitmentNavigation
                )}


                {/* =================================================
                    ATTENDANCE
                ================================================= */}

                {renderSection(
                    "ATTENDANCE",
                    attendanceNavigation
                )}


                {/* =================================================
                    LEAVE
                ================================================= */}

                {renderSection(
                    "LEAVE",
                    leaveNavigation
                )}


                {/* =================================================
                    PAYROLL
                ================================================= */}

                {renderSection(
                    "PAYROLL",
                    payrollNavigation
                )}


                {/* =================================================
                    REPORTS
                ================================================= */}

                {renderSection(
                    "REPORTS",
                    reportNavigation
                )}

            </div>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <div
                className="hr-sidebar-bottom"
            >

                {/* =================================================
                    MY PROFILE
                ================================================= */}

                <NavLink
                    to="/hr/profile"
                    className={({
                        isActive,
                    }) =>
                        `hr-sidebar-link ${
                            isActive
                                ? "active"
                                : ""
                        }`
                    }
                    title={
                        collapsed
                            ? "My Profile"
                            : ""
                    }
                >

                    <UserCircle
                        size={19}
                    />

                    {!collapsed && (

                        <span>
                            My Profile
                        </span>

                    )}

                </NavLink>


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <NavLink
                    to="/hr/settings"
                    className={({
                        isActive,
                    }) =>
                        `hr-sidebar-link ${
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

                    <Settings
                        size={19}
                    />

                    {!collapsed && (

                        <span>
                            Settings
                        </span>

                    )}

                </NavLink>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
                    className="hr-sidebar-link logout"
                    onClick={
                        handleLogout
                    }
                    title={
                        collapsed
                            ? "Logout"
                            : ""
                    }
                >

                    <LogOut
                        size={19}
                    />

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


export default HRSidebar;