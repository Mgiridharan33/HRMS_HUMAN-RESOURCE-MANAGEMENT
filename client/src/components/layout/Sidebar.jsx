import {
    useEffect,
    useState,
} from "react";


import {
    LayoutDashboard,
    Users,
    UserRound,
    CalendarCheck,
    CalendarDays,
    Wallet,
    Megaphone,
    BarChart3,
    Settings,
    LogOut,
    ShieldCheck,
    FileText,
    BriefcaseBusiness,
    ChevronDown,
     Brain, 
     Video,
} from "lucide-react";


import {
    NavLink,
    useLocation,
} from "react-router-dom";


import {
    useAuth,
} from "../../context/AuthContext";


const Sidebar = () => {

    const {
        logout,
    } = useAuth();


    const location =
        useLocation();


    /* =========================================================
       APPLICATION MENU STATE
    ========================================================= */

    const isApplicationSection =
        location.pathname.startsWith(
            "/super-admin/applications"
        ) ||
        location.pathname.startsWith(
            "/super-admin/jobs"
        ) ||
        location.pathname.startsWith(
            "/super-admin/job/"
        );


    const [
        applicationsOpen,
        setApplicationsOpen,
    ] = useState(
        isApplicationSection
    );


    /* =========================================================
       KEEP APPLICATION MENU OPEN WHEN ROUTE CHANGES
    ========================================================= */

    useEffect(() => {

        if (
            isApplicationSection
        ) {

            setApplicationsOpen(
                true
            );

        }

    }, [
        isApplicationSection,
    ]);


    /* =========================================================
       MAIN MENU
    ========================================================= */

    const menuItems = [

        {
            title: "Dashboard",
            icon: LayoutDashboard,
            path: "/super-admin/dashboard",
        },

        {
            title: "HR Management",
            icon: Users,
            path: "/super-admin/hr",
        },

        {
            title: "Employees",
            icon: UserRound,
            path: "/super-admin/employees",
        },

        {
            title: "Attendance",
            icon: CalendarCheck,
            path: "/super-admin/attendance",
        },

        {
            title: "Leave",
            icon: CalendarDays,
            path: "/super-admin/leave",
        },

        {
            title: "HR Leave Request",
            icon: CalendarDays,
            path: "/super-admin/hr/leave",
        },

        {
            title: "Payroll",
            icon: Wallet,
            path: "/super-admin/payroll",
        },

        {
            title: "Salary Structure",
            icon: Wallet,
            path: "/super-admin/salary-structures",
        },

        {
            title: "HR Payroll",
            icon: Wallet,
            path: "/super-admin/hr/payroll",
        },

        {
            title: "HR Salary Structure",
            icon: Wallet,
            path: "/super-admin/hr/salary-structures",
        },

        {
            title: "Announcements",
            icon: Megaphone,
            path: "/super-admin/announcements",
        },

        {
            title: "Reports",
            icon: BarChart3,
            path: "/super-admin/reports",
        },

        {
            title: "Settings",
            icon: Settings,
            path: "/super-admin/settings",
        },

         {
            title: "Apditude Interview Assesment",
            icon:  Brain,
            path: "aptitude-question-assignments",
        },
          {
            title: "Video Interview Assesment",
            icon: Video,
            path: "/super-admin/aptitude-video-interview",
        },


    ];


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <aside className="admin-sidebar">


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="sidebar-logo">

                <div className="sidebar-logo-icon">

                    <ShieldCheck
                        size={25}
                        strokeWidth={2.2}
                    />

                </div>


                <div className="sidebar-logo-content">

                    <h2>
                        HRMS
                    </h2>

                    <span>
                        Admin Team
                    </span>

                </div>

            </div>


            {/* =================================================
                SECTION TITLE
            ================================================= */}

            <div className="sidebar-section-title">

                MAIN MENU

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-nav">


                {/* =================================================
                    NORMAL MENU ITEMS
                ================================================= */}

                {menuItems.map(
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
                                    `sidebar-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <span className="sidebar-link-icon">

                                    <Icon
                                        size={19}
                                        strokeWidth={2}
                                    />

                                </span>


                                <span className="sidebar-link-text">

                                    {
                                        item.title
                                    }

                                </span>

                            </NavLink>

                        );

                    }
                )}


                {/* =================================================
                    APPLICATIONS GROUP
                ================================================= */}

                <div className="sidebar-menu-group">


                    {/* =================================================
                        APPLICATION HEADER
                    ================================================= */}

                    <button
                        type="button"

                        className={`
                            sidebar-link
                            sidebar-dropdown-button
                            ${
                                isApplicationSection
                                    ? "active"
                                    : ""
                            }
                        `}

                        onClick={() =>
                            setApplicationsOpen(
                                previous =>
                                    !previous
                            )
                        }
                    >

                        <span className="sidebar-link-icon">

                            <BriefcaseBusiness
                                size={19}
                                strokeWidth={2}
                            />

                        </span>


                        <span className="sidebar-link-text">

                            Applications

                        </span>


                        <ChevronDown
                            size={17}

                            className={`
                                sidebar-dropdown-arrow
                                ${
                                    applicationsOpen
                                        ? "open"
                                        : ""
                                }
                            `}
                        />

                    </button>


                    {/* =================================================
                        APPLICATION SUBMENU
                    ================================================= */}

                    {applicationsOpen && (

                        <div className="sidebar-submenu">


                            {/* =================================================
                                1. CANDIDATE APPLICATIONS

                                /super-admin/applications
                            ================================================= */}

                            <NavLink
                                to="/super-admin/applications"

                                className={({
                                    isActive,
                                }) =>
                                    `
                                    sidebar-submenu-link
                                    ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }
                                    `
                                }
                            >

                                <span className="sidebar-submenu-dot" />


                                <Users
                                    size={16}
                                />


                                <span>

                                    Candidate Applications

                                </span>

                            </NavLink>


                            {/* =================================================
                                2. CREATE JOB

                                /super-admin/jobs/create
                            ================================================= */}

                            <NavLink
                                to="/super-admin/jobs/create"

                                className={({
                                    isActive,
                                }) =>
                                    `
                                    sidebar-submenu-link
                                    ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }
                                    `
                                }
                            >

                                <span className="sidebar-submenu-dot" />


                                <FileText
                                    size={16}
                                />


                                <span>

                                    Create Job

                                </span>

                            </NavLink>


                            {/* =================================================
                                3. MANAGE JOBS

                                /super-admin/jobs
                            ================================================= */}

                            <NavLink
                                to="/super-admin/jobs"

                                className={({
                                    isActive,
                                }) =>
                                    `
                                    sidebar-submenu-link
                                    ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }
                                    `
                                }
                            >

                                <span className="sidebar-submenu-dot" />


                                <BriefcaseBusiness
                                    size={16}
                                />


                                <span>

                                    Manage Jobs

                                </span>

                            </NavLink>


                            {/* =================================================
                                4. JOB DASHBOARD
                            ================================================= */}

                            <NavLink
                                to="/super-admin/job/dashboard"

                                className={({
                                    isActive,
                                }) =>
                                    `
                                    sidebar-submenu-link
                                    ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }
                                    `
                                }
                            >

                                <span className="sidebar-submenu-dot" />


                                <BarChart3
                                    size={16}
                                />


                                <span>

                                    Job Dashboard

                                </span>

                            </NavLink>


                        </div>

                    )}

                </div>


            </nav>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <div className="sidebar-bottom">

                <button
                    type="button"

                    className="logout-button"

                    onClick={
                        logout
                    }
                >

                    <span className="logout-icon">

                        <LogOut
                            size={19}
                            strokeWidth={2}
                        />

                    </span>


                    <span className="logout-text">

                        Logout

                    </span>

                </button>

            </div>


        </aside>

    );

};


export default Sidebar;