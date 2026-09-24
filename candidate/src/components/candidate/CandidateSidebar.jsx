import React from "react";

import {
    LayoutDashboard,
    BriefcaseBusiness,
    FileText,
    UserRound,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Video,
} from "lucide-react";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import "./CandidateSidebar.css";


const CandidateSidebar = ({
    collapsed = false,
    onToggle,
    onNavigate,
}) => {

    const navigate =
        useNavigate();

    const {
        candidate,
        logout,
    } = useCandidateAuth();


    // =========================================================
    // MENU
    // =========================================================

    const menuItems = [

        {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
            end: true,
        },

        {
            label: "Find Jobs",
            path: "/jobs",
            icon: BriefcaseBusiness,
            end: true,
        },

        {
            label: "My Applications",
            path: "/applications",
            icon: FileText,
            end: true,
        },

        {
            label: "My Profile",
            path: "/profile",
            icon: UserRound,
            end: true,
        },
          {
            label: "Aptitude Test",
            path: "aptitude-test",
            icon: UserRound,
            end: true,
        },
         {
            label: "Meet Interview ",
            path: "aptitude-candidate/video-interviews",
            icon: Video,
            end: true,
        },
        {
            label: "Result",
            path: "aptitude-result/:attemptId",
            icon: UserRound,
            end: true,
        },

       

    ];


    // =========================================================
    // CANDIDATE NAME
    // =========================================================

    const getCandidateName = () => {

        if (!candidate) {
            return "Candidate";
        }

        return (
            candidate.name ||
            candidate.fullName ||
            `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() ||
            candidate.email?.split("@")[0] ||
            "Candidate"
        );

    };


    const candidateName =
        getCandidateName();


    // =========================================================
    // INITIAL
    // =========================================================

    const candidateInitial =
        candidateName
            .charAt(0)
            .toUpperCase();


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout =
        async () => {

            try {

                await logout();

            } catch (error) {

                console.error(
                    "Candidate logout error:",
                    error
                );

            } finally {

                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

            }

        };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const handleNavigation = () => {

        if (
            typeof onNavigate ===
            "function"
        ) {

            onNavigate();

        }

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <aside
            className={`candidate-sidebar ${
                collapsed
                    ? "candidate-sidebar-collapsed"
                    : ""
            }`}
        >

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="candidate-sidebar-header">

                <button
                    type="button"
                    className="candidate-brand"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                    title={
                        collapsed
                            ? "Candidate Portal"
                            : undefined
                    }
                >

                    <div className="candidate-brand-icon">

                        <BriefcaseBusiness
                            size={21}
                        />

                    </div>


                    {!collapsed && (

                        <div className="candidate-brand-text">

                            <strong>
                                Candidate
                            </strong>

                            <span>
                                Career Portal
                            </span>

                        </div>

                    )}

                </button>


                {typeof onToggle === "function" && (

                    <button
                        type="button"
                        className="candidate-sidebar-toggle"
                        onClick={onToggle}
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >

                        {collapsed ? (

                            <ChevronRight
                                size={18}
                            />

                        ) : (

                            <ChevronLeft
                                size={18}
                            />

                        )}

                    </button>

                )}

            </div>


            {/* =====================================================
                PROFILE
            ====================================================== */}

            <button
                type="button"
                className="candidate-sidebar-profile"
                onClick={() => {
                    navigate("/profile");
                    handleNavigation();
                }}
                title={
                    collapsed
                        ? candidateName
                        : undefined
                }
            >

                <div className="candidate-avatar">

                    {candidate?.profileImage ? (

                        <img
                            src={
                                candidate.profileImage
                            }
                            alt={
                                candidateName
                            }
                        />

                    ) : (

                        <span>
                            {candidateInitial}
                        </span>

                    )}

                </div>


                {!collapsed && (

                    <div className="candidate-profile-info">

                        <strong>
                            {candidateName}
                        </strong>

                        <span>
                            Candidate
                        </span>

                    </div>

                )}

            </button>


            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <nav className="candidate-sidebar-nav">

                <div className="candidate-nav-section">

                    {!collapsed && (

                        <span className="candidate-nav-heading">
                            MAIN MENU
                        </span>

                    )}


                    {menuItems.map(
                        (item) => {

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
                                    end={
                                        item.end
                                    }
                                    onClick={
                                        handleNavigation
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        `candidate-nav-link ${
                                            isActive
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    title={
                                        collapsed
                                            ? item.label
                                            : undefined
                                    }
                                >

                                    <span className="candidate-nav-icon">

                                        <Icon
                                            size={20}
                                        />

                                    </span>


                                    {!collapsed && (

                                        <span className="candidate-nav-label">

                                            {
                                                item.label
                                            }

                                        </span>

                                    )}

                                </NavLink>

                            );

                        }
                    )}

                </div>

            </nav>


            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div className="candidate-sidebar-footer">

                <button
                    type="button"
                    className="candidate-logout-button"
                    onClick={
                        handleLogout
                    }
                    title={
                        collapsed
                            ? "Logout"
                            : undefined
                    }
                >

                    <span className="candidate-logout-icon">

                        <LogOut
                            size={20}
                        />

                    </span>


                    {!collapsed && (

                        <span className="candidate-logout-text">
                            Logout
                        </span>

                    )}

                </button>

            </div>

        </aside>

    );

};


export default CandidateSidebar;