import {
    useMemo,
} from "react";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import {
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    LogOut,
    Search,
    UserRound,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import "./Dashboard.css";


const CandidateDashboard = () => {

    const {
        candidate,
        logout,
    } = useCandidateAuth();

    const navigate =
        useNavigate();


    // =========================================================
    // ROUTES
    // =========================================================

    const routes = {

        dashboard: "/dashboard",

        profile: "/profile",

        jobs: "/jobs",

        applications: "/applications",

        login: "/login",

    };


    // =========================================================
    // CANDIDATE NAME
    // =========================================================

    const candidateName = useMemo(() => {

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

    }, [candidate]);


    // =========================================================
    // INITIAL
    // =========================================================

    const candidateInitial =
        candidateName
            .charAt(0)
            .toUpperCase();


    // =========================================================
    // PROFILE COMPLETION
    // =========================================================

    const profileCompletionPercentage =
        useMemo(() => {

            if (!candidate) {
                return 0;
            }


            const fields = [

                Boolean(
                    String(
                        candidate.name || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.email || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.phone || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.address || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.education || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.experience || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.resume || ""
                    ).trim()
                ),

                Boolean(
                    String(
                        candidate.profileImage || ""
                    ).trim()
                ),

                Array.isArray(
                    candidate.skills
                ) &&
                candidate.skills.some(
                    skill =>
                        String(
                            skill || ""
                        ).trim()
                ),

            ];


            const completed =
                fields.filter(
                    Boolean
                ).length;


            return Math.round(
                (
                    completed /
                    fields.length
                ) * 100
            );

        }, [candidate]);


    const profileComplete =
        profileCompletionPercentage === 100;


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
                    routes.login,
                    {
                        replace: true,
                    }
                );

            }

        };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const goTo =
        (path) => {

            navigate(path);

        };


    // =========================================================
    // QUICK ACCESS
    // =========================================================

    const dashboardCards = [

        {
            title: "Find Jobs",

            description:
                "Browse published jobs and discover positions that match your skills and experience.",

            icon: Search,

            path: routes.jobs,

        },

        {
            title: "My Profile",

            description:
                "Manage your personal information, education, skills, resume and experience.",

            icon: UserRound,

            path: routes.profile,

        },

        {
            title: "My Applications",

            description:
                "View your submitted applications and track their current status.",

            icon: FileText,

            path: routes.applications,

        },

    ];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="candidate-dashboard">


            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="dashboard-header">

                <div className="dashboard-header-left">

                    <div className="dashboard-breadcrumb">

                        <span>
                            Candidate Portal
                        </span>

                        <span>
                            /
                        </span>

                        <strong>
                            Dashboard
                        </strong>

                    </div>


                    <h1>
                        Candidate Dashboard
                    </h1>


                    <p>
                        Welcome back,{" "}

                        <strong>
                            {candidateName}
                        </strong>
                    </p>

                </div>


                <div className="dashboard-header-right">

                    <button
                        type="button"
                        className="header-profile"
                        onClick={() =>
                            goTo(
                                routes.profile
                            )
                        }
                    >

                        <div className="header-profile-avatar">

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


                        <div className="header-profile-details">

                            <strong>
                                {candidateName}
                            </strong>

                            <span>
                                Candidate
                            </span>

                        </div>

                    </button>


                    <button
                        type="button"
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                    >

                        <LogOut
                            size={17}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </header>


            {/* =====================================================
                CONTENT
            ====================================================== */}

            <main className="dashboard-content">


                {/* =================================================
                    WELCOME
                ================================================= */}

                <section className="welcome-card">

                    <div className="welcome-decoration welcome-decoration-one" />

                    <div className="welcome-decoration welcome-decoration-two" />


                    <div className="welcome-card-content">

                        <span className="welcome-label">
                            WELCOME BACK
                        </span>


                        <h2>
                            Hello, {candidateName}
                        </h2>


                        <p>
                            {candidate?.email ||
                                "Manage your candidate account and discover your next career opportunity."}
                        </p>


                        <div className="welcome-meta">

                            <span>

                                <CheckCircle2
                                    size={15}
                                />

                                Candidate Account

                            </span>


                            <span>

                                <BriefcaseBusiness
                                    size={15}
                                />

                                Job Seeker

                            </span>

                        </div>

                    </div>


                    <div className="welcome-card-action">

                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    routes.profile
                                )
                            }
                        >

                            <UserRound
                                size={17}
                            />

                            View Profile

                            <ArrowRight
                                size={17}
                            />

                        </button>

                    </div>

                </section>


                {/* =================================================
                    PROFILE STATUS
                ================================================= */}

                <section className="profile-status-card">

                    <div className="profile-status-left">

                        <div
                            className={`profile-status-icon ${
                                profileComplete
                                    ? "profile-status-complete"
                                    : "profile-status-pending"
                            }`}
                        >

                            {profileComplete ? (

                                <CheckCircle2
                                    size={22}
                                />

                            ) : (

                                <Clock3
                                    size={22}
                                />

                            )}

                        </div>


                        <div className="profile-status-information">

                            <div className="profile-status-title-row">

                                <h3>
                                    Profile Status
                                </h3>


                                <span
                                    className={`status-badge ${
                                        profileComplete
                                            ? "complete"
                                            : "pending"
                                    }`}
                                >

                                    {profileComplete
                                        ? "Complete"
                                        : "Incomplete"}

                                </span>

                            </div>


                            <p>

                                {profileComplete

                                    ? "Your candidate profile is complete. You are ready to apply for available jobs."

                                    : `Your profile is ${profileCompletionPercentage}% complete. Complete your profile to improve your application.`

                                }

                            </p>


                            <div className="profile-progress">

                                <div className="profile-progress-track">

                                    <div
                                        className="profile-progress-bar"
                                        style={{
                                            width:
                                                `${profileCompletionPercentage}%`,
                                        }}
                                    />

                                </div>


                                <strong>
                                    {
                                        profileCompletionPercentage
                                    }%
                                </strong>

                            </div>

                        </div>

                    </div>


                    {!profileComplete && (

                        <button
                            type="button"
                            className="complete-profile-button"
                            onClick={() =>
                                goTo(
                                    routes.profile
                                )
                            }
                        >

                            Complete Profile

                            <ArrowRight
                                size={17}
                            />

                        </button>

                    )}

                </section>


                {/* =================================================
                    JOB SEARCH
                ================================================= */}

                <section className="job-search-card">

                    <div className="job-search-content">

                        <div className="job-search-icon">

                            <BriefcaseBusiness
                                size={25}
                            />

                        </div>


                        <div className="job-search-text">

                            <span>
                                FIND YOUR NEXT OPPORTUNITY
                            </span>

                            <h2>
                                Explore Available Jobs
                            </h2>

                            <p>
                                Browse currently published positions
                                and submit your application directly
                                through the candidate portal.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="job-search-button"
                        onClick={() =>
                            goTo(
                                routes.jobs
                            )
                        }
                    >

                        <Search
                            size={18}
                        />

                        Browse Jobs

                        <ArrowRight
                            size={18}
                        />

                    </button>

                </section>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section className="dashboard-summary">


                    <button
                        type="button"
                        className="summary-card"
                        onClick={() =>
                            goTo(
                                routes.applications
                            )
                        }
                    >

                        <div className="summary-card-icon">

                            <FileText
                                size={21}
                            />

                        </div>


                        <div className="summary-card-content">

                            <span>
                                Applications
                            </span>

                            <strong>
                                0
                            </strong>

                            <small>
                                View applications
                            </small>

                        </div>


                        <ArrowRight
                            size={17}
                            className="summary-card-arrow"
                        />

                    </button>


                    <button
                        type="button"
                        className="summary-card"
                        onClick={() =>
                            goTo(
                                routes.jobs
                            )
                        }
                    >

                        <div className="summary-card-icon">

                            <BriefcaseBusiness
                                size={21}
                            />

                        </div>


                        <div className="summary-card-content">

                            <span>
                                Job Opportunities
                            </span>

                            <strong>
                                Explore
                            </strong>

                            <small>
                                Find matching jobs
                            </small>

                        </div>


                        <ArrowRight
                            size={17}
                            className="summary-card-arrow"
                        />

                    </button>


                    <button
                        type="button"
                        className="summary-card"
                        onClick={() =>
                            goTo(
                                routes.profile
                            )
                        }
                    >

                        <div
                            className={`summary-card-icon ${
                                profileComplete
                                    ? "summary-icon-complete"
                                    : "summary-icon-pending"
                            }`}
                        >

                            {profileComplete ? (

                                <CheckCircle2
                                    size={21}
                                />

                            ) : (

                                <Clock3
                                    size={21}
                                />

                            )}

                        </div>


                        <div className="summary-card-content">

                            <span>
                                Profile
                            </span>

                            <strong>
                                {
                                    profileCompletionPercentage
                                }%
                            </strong>

                            <small>
                                Profile completion
                            </small>

                        </div>


                        <ArrowRight
                            size={17}
                            className="summary-card-arrow"
                        />

                    </button>

                </section>


                {/* =================================================
                    QUICK ACCESS
                ================================================= */}

                <section className="dashboard-section-header">

                    <div>

                        <span>
                            QUICK ACCESS
                        </span>

                        <h2>
                            Manage Your Career
                        </h2>

                    </div>

                </section>


                <section className="dashboard-grid">

                    {dashboardCards.map(
                        (card) => {

                            const Icon =
                                card.icon;


                            return (

                                <button
                                    type="button"
                                    key={
                                        card.title
                                    }
                                    className="dashboard-card"
                                    onClick={() =>
                                        goTo(
                                            card.path
                                        )
                                    }
                                >

                                    <div className="dashboard-card-top">

                                        <div className="dashboard-card-icon">

                                            <Icon
                                                size={24}
                                            />

                                        </div>


                                        <span className="dashboard-card-arrow">

                                            <ArrowRight
                                                size={18}
                                            />

                                        </span>

                                    </div>


                                    <h3>
                                        {
                                            card.title
                                        }
                                    </h3>


                                    <p>
                                        {
                                            card.description
                                        }
                                    </p>


                                    <span className="dashboard-card-link">

                                        Open

                                        <ArrowRight
                                            size={14}
                                        />

                                    </span>

                                </button>

                            );

                        }
                    )}

                </section>


                {/* =================================================
                    APPLICATIONS
                ================================================= */}

                <section className="upcoming-interview-card">

                    <div className="upcoming-interview-header">

                        <div>

                            <span>
                                APPLICATIONS
                            </span>

                            <h2>
                                Track Your Applications
                            </h2>

                        </div>


                        <div className="upcoming-header-icon">

                            <FileText
                                size={22}
                            />

                        </div>

                    </div>


                    <div className="no-interview">

                        <div className="no-interview-icon">

                            <BriefcaseBusiness
                                size={31}
                            />

                        </div>


                        <h3>
                            No application activity yet
                        </h3>


                        <p>
                            Once you apply for a job,
                            your application status
                            will appear here.
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                goTo(
                                    routes.applications
                                )
                            }
                        >

                            View Applications

                            <ArrowRight
                                size={16}
                            />

                        </button>

                    </div>

                </section>


                {/* =================================================
                    CTA
                ================================================= */}

                <section className="dashboard-application-cta">

                    <div className="cta-content">

                        <span>
                            READY FOR YOUR NEXT OPPORTUNITY?
                        </span>

                        <h2>
                            Find a job that matches your skills.
                        </h2>

                        <p>
                            Explore currently published positions
                            and submit your application through
                            the candidate portal.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            goTo(
                                routes.jobs
                            )
                        }
                    >

                        <BriefcaseBusiness
                            size={18}
                        />

                        Find Jobs

                        <ArrowRight
                            size={18}
                        />

                    </button>

                </section>

            </main>

        </div>

    );

};


export default CandidateDashboard;