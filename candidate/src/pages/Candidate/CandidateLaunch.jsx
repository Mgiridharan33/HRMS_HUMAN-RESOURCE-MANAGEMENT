import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Globe2,
    HeartHandshake,
    Loader2,
    MapPin,
    Menu,
    Rocket,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import "../../Styles/CandidateLaunch.css";


/*
=========================================================
API CONFIGURATION
=========================================================
*/

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


/*
=========================================================
HELPERS
=========================================================
*/

const getJobId = (job) => {
    return (
        job?._id ||
        job?.id ||
        job?.jobId
    );
};


const getJobTitle = (job) => {
    return (
        job?.title ||
        job?.jobTitle ||
        job?.position ||
        "Untitled Position"
    );
};


const getDepartment = (job) => {
    return (
        job?.department?.name ||
        job?.department ||
        job?.departmentName ||
        "General"
    );
};


const getLocation = (job) => {
    if (typeof job?.location === "string") {
        return job.location;
    }

    if (job?.location?.city) {
        return job.location.city;
    }

    return (
        job?.jobLocation ||
        job?.locationName ||
        "Multiple Locations"
    );
};


const getEmploymentType = (job) => {
    return (
        job?.employmentType ||
        job?.jobType ||
        job?.type ||
        "Full Time"
    );
};


const getPostedDate = (job) => {
    return (
        job?.publishedAt ||
        job?.announcedAt ||
        job?.createdAt ||
        job?.postedAt
    );
};


const formatDate = (date) => {
    if (!date) {
        return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Recently";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const getDescription = (job) => {
    return (
        job?.shortDescription ||
        job?.description ||
        job?.summary ||
        "Join our team and build meaningful products while growing your career with us."
    );
};


/*
=========================================================
COMPONENT
=========================================================
*/

const CandidateLaunch = () => {
    const navigate = useNavigate();

    const [
        jobs,
        setJobs,
    ] = useState([]);

    const [
        loadingJobs,
        setLoadingJobs,
    ] = useState(true);

    const [
        jobsError,
        setJobsError,
    ] = useState("");

    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");

    const [
        mobileMenuOpen,
        setMobileMenuOpen,
    ] = useState(false);

    const [
        activeSection,
        setActiveSection,
    ] = useState("home");


    /*
    =====================================================
    LOAD ANNOUNCED JOBS
    =====================================================
    */

    useEffect(() => {
        let mounted = true;

        const loadJobs = async () => {
            try {
                setLoadingJobs(true);
                setJobsError("");

                /*
                 * If your backend already has a public jobs endpoint,
                 * you can replace this URL with that endpoint.
                 *
                 * Example:
                 * /api/jobs/public
                 * /api/jobs/announced
                 */

                const response = await fetch(
                    `${API_BASE_URL}/jobs`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load jobs (${response.status})`
                    );
                }

                const data = await response.json();

                if (!mounted) {
                    return;
                }

                /*
                 * Support common backend response structures:
                 *
                 * [
                 *   ...
                 * ]
                 *
                 * {
                 *   jobs: [...]
                 * }
                 *
                 * {
                 *   data: [...]
                 * }
                 */

                let receivedJobs = [];

                if (Array.isArray(data)) {
                    receivedJobs = data;
                } else if (Array.isArray(data?.jobs)) {
                    receivedJobs = data.jobs;
                } else if (Array.isArray(data?.data)) {
                    receivedJobs = data.data;
                } else if (
                    Array.isArray(data?.results)
                ) {
                    receivedJobs = data.results;
                }

                /*
                 * Only show announced / published / active jobs.
                 *
                 * If your backend does not have a status field,
                 * the job is allowed through.
                 */

                const announcedJobs =
                    receivedJobs.filter((job) => {
                        const status = String(
                            job?.status ||
                            job?.jobStatus ||
                            job?.publicationStatus ||
                            ""
                        ).toLowerCase();

                        if (!status) {
                            return true;
                        }

                        return [
                            "published",
                            "announced",
                            "active",
                            "open",
                            "opened",
                        ].includes(status);
                    });

                setJobs(announcedJobs);
            } catch (error) {
                console.error(
                    "Candidate Launch: Failed to load jobs:",
                    error
                );

                if (!mounted) {
                    return;
                }

                setJobs([]);
                setJobsError(
                    "Unable to load current openings right now."
                );
            } finally {
                if (mounted) {
                    setLoadingJobs(false);
                }
            }
        };

        loadJobs();

        return () => {
            mounted = false;
        };
    }, []);


    /*
    =====================================================
    NAVIGATION
    =====================================================
    */

 const goToLogin = () => {
    navigate("/login");
};


 const goToRegister = () => {
    navigate("/register");
};

const handleJobClick = (job) => {

    const jobId = getJobId(job);

    if (!jobId) {
        navigate("/login");
        return;
    }

    navigate(
        `/login?jobId=${encodeURIComponent(jobId)}`
    );
};
  /*
    =====================================================
    SEARCH
    =====================================================
    */

    const filteredJobs = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
            return jobs;
        }

        return jobs.filter((job) => {
            const title =
                getJobTitle(job).toLowerCase();

            const department =
                getDepartment(job).toLowerCase();

            const location =
                getLocation(job).toLowerCase();

            return (
                title.includes(search) ||
                department.includes(search) ||
                location.includes(search)
            );
        });
    }, [
        jobs,
        searchTerm,
    ]);


    /*
    =====================================================
    SECTION NAVIGATION
    =====================================================
    */

    const scrollToSection = (sectionId) => {
        setMobileMenuOpen(false);

        const element =
            document.getElementById(sectionId);

        if (!element) {
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setActiveSection(sectionId);
    };


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (
        <div className="candidate-launch">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="candidate-launch-header">

                <div className="candidate-launch-header-inner">

                    <button
                        type="button"
                        className="candidate-launch-logo"
                        onClick={() =>
                            scrollToSection("home")
                        }
                    >
                        <span className="candidate-launch-logo-mark">
                            <Rocket size={21} />
                        </span>

                        <span className="candidate-launch-logo-text">
                            <strong>YourCompany</strong>
                            <small>CAREERS</small>
                        </span>
                    </button>


                    <nav
                        className={
                            `candidate-launch-nav ${
                                mobileMenuOpen
                                    ? "is-open"
                                    : ""
                            }`
                        }
                    >
                        <button
                            type="button"
                            className={
                                activeSection === "home"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                scrollToSection("home")
                            }
                        >
                            Home
                        </button>

                        <button
                            type="button"
                            className={
                                activeSection === "jobs"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                scrollToSection("jobs")
                            }
                        >
                            Careers
                        </button>

                        <button
                            type="button"
                            className={
                                activeSection === "about"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                scrollToSection("about")
                            }
                        >
                            About Us
                        </button>

                        <button
                            type="button"
                            className={
                                activeSection === "culture"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                scrollToSection("culture")
                            }
                        >
                            Life at Us
                        </button>

                        <div className="candidate-launch-mobile-actions">

                            <button
                                type="button"
                                className="launch-login-btn mobile"
                                onClick={goToLogin}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                className="launch-register-btn mobile"
                                onClick={goToRegister}
                            >
                                Register
                            </button>

                        </div>
                    </nav>


                    <div className="candidate-launch-header-actions">

                        <button
                            type="button"
                            className="launch-login-btn"
                            onClick={goToLogin}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className="launch-register-btn"
                            onClick={goToRegister}
                        >
                            Register
                        </button>

                    </div>


                    <button
                        type="button"
                        className="candidate-launch-menu-btn"
                        onClick={() =>
                            setMobileMenuOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        aria-label="Toggle navigation"
                    >
                        {mobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <main>

                <section
                    id="home"
                    className="candidate-launch-hero"
                >

                    <div className="candidate-launch-hero-pattern" />

                    <div className="candidate-launch-hero-inner">

                        <div className="candidate-launch-hero-content">

                            <div className="launch-eyebrow">
                                <Sparkles size={16} />
                                <span>
                                    Discover your next opportunity
                                </span>
                            </div>


                            <h1>
                                Build your
                                <span>
                                    future with us.
                                </span>
                            </h1>


                            <p>
                                Join a team of passionate
                                people solving meaningful
                                problems, building innovative
                                products and creating an
                                impact that matters.
                            </p>


                            <div className="candidate-launch-hero-actions">

                                <button
                                    type="button"
                                    className="launch-primary-btn"
                                    onClick={() =>
                                        scrollToSection(
                                            "jobs"
                                        )
                                    }
                                >
                                    Explore Opportunities
                                    <ArrowRight
                                        size={18}
                                    />
                                </button>


                                <button
                                    type="button"
                                    className="launch-secondary-btn"
                                    onClick={goToRegister}
                                >
                                    Create Candidate Account
                                </button>

                            </div>


                            <div className="candidate-launch-hero-trust">

                                <div className="hero-trust-item">
                                    <CheckCircle2 size={17} />
                                    <span>
                                        Growth focused
                                    </span>
                                </div>

                                <div className="hero-trust-item">
                                    <CheckCircle2 size={17} />
                                    <span>
                                        People first
                                    </span>
                                </div>

                                <div className="hero-trust-item">
                                    <CheckCircle2 size={17} />
                                    <span>
                                        Innovative culture
                                    </span>
                                </div>

                            </div>

                        </div>


                        <div className="candidate-launch-hero-visual">

                            <div className="hero-visual-main">

                                <div className="hero-visual-top">

                                    <span className="hero-visual-label">
                                        CAREER JOURNEY
                                    </span>

                                    <span className="hero-visual-icon">
                                        <Rocket size={20} />
                                    </span>

                                </div>


                                <div className="hero-visual-title">
                                    Find work that
                                    <br />
                                    <strong>
                                        moves you forward.
                                    </strong>
                                </div>


                                <div className="hero-stat-grid">

                                    <div className="hero-stat-card">
                                        <Users size={19} />
                                        <strong>
                                            People
                                        </strong>
                                        <span>
                                            First culture
                                        </span>
                                    </div>

                                    <div className="hero-stat-card">
                                        <Globe2 size={19} />
                                        <strong>
                                            Impact
                                        </strong>
                                        <span>
                                            Beyond boundaries
                                        </span>
                                    </div>

                                </div>

                            </div>


                            <div className="hero-floating-card hero-floating-one">

                                <span className="hero-floating-icon">
                                    <BriefcaseBusiness
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>
                                        New opportunities
                                    </strong>

                                    <small>
                                        Explore open roles
                                    </small>
                                </div>

                            </div>


                            <div className="hero-floating-card hero-floating-two">

                                <span className="hero-floating-icon">
                                    <HeartHandshake
                                        size={18}
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Grow together
                                    </strong>

                                    <small>
                                        Learn. Build. Lead.
                                    </small>
                                </div>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="hero-scroll"
                        onClick={() =>
                            scrollToSection("jobs")
                        }
                    >
                        <span>
                            Explore jobs
                        </span>
                        <ChevronDown size={18} />
                    </button>

                </section>


                {/* =================================================
                    JOBS
                ================================================= */}

                <section
                    id="jobs"
                    className="candidate-launch-jobs-section"
                >

                    <div className="candidate-launch-section-inner">

                        <div className="launch-section-heading">

                            <div>
                                <span className="section-overline">
                                    CAREER OPPORTUNITIES
                                </span>

                                <h2>
                                    Find your next role
                                </h2>

                                <p>
                                    Explore our latest
                                    announced opportunities
                                    and discover where you
                                    can make an impact.
                                </p>
                            </div>


                            <div className="jobs-count">

                                <BriefcaseBusiness
                                    size={18}
                                />

                                <span>
                                    {jobs.length}{" "}
                                    {jobs.length === 1
                                        ? "Opening"
                                        : "Openings"}
                                </span>

                            </div>

                        </div>


                        <div className="jobs-search">

                            <Search size={19} />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by job title, department or location..."
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    className="jobs-search-clear"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                >
                                    <X size={17} />
                                </button>
                            )}

                        </div>


                        {loadingJobs ? (

                            <div className="jobs-state">

                                <Loader2
                                    size={30}
                                    className="jobs-loading-icon"
                                />

                                <h3>
                                    Finding opportunities...
                                </h3>

                                <p>
                                    Please wait while we
                                    load our latest jobs.
                                </p>

                            </div>

                        ) : jobsError ? (

                            <div className="jobs-state jobs-error">

                                <div className="jobs-state-icon">
                                    <BriefcaseBusiness
                                        size={25}
                                    />
                                </div>

                                <h3>
                                    Jobs are temporarily
                                    unavailable
                                </h3>

                                <p>
                                    {jobsError}
                                </p>

                                <button
                                    type="button"
                                    className="launch-primary-btn"
                                    onClick={() =>
                                        window.location.reload()
                                    }
                                >
                                    Refresh
                                </button>

                            </div>

                        ) : filteredJobs.length === 0 ? (

                            <div className="jobs-state">

                                <div className="jobs-state-icon">
                                    <Search size={25} />
                                </div>

                                <h3>
                                    No openings found
                                </h3>

                                <p>
                                    {searchTerm
                                        ? "Try another search term."
                                        : "There are no announced openings at the moment. Please check back soon."}
                                </p>

                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="launch-secondary-btn"
                                        onClick={() =>
                                            setSearchTerm("")
                                        }
                                    >
                                        Clear Search
                                    </button>
                                )}

                            </div>

                        ) : (

                            <div className="candidate-launch-job-list">

                                {filteredJobs.map(
                                    (job) => {

                                        const jobId =
                                            getJobId(job);

                                        return (
                                            <article
                                                key={
                                                    jobId ||
                                                    getJobTitle(
                                                        job
                                                    )
                                                }
                                                className="candidate-launch-job-card"
                                                onClick={() =>
                                                    handleJobClick(
                                                        job
                                                    )
                                                }
                                            >

                                                <div className="job-card-main">

                                                    <div className="job-card-icon">
                                                        <BriefcaseBusiness
                                                            size={22}
                                                        />
                                                    </div>


                                                    <div className="job-card-content">

                                                        <div className="job-card-title-row">

                                                            <h3>
                                                                {getJobTitle(
                                                                    job
                                                                )}
                                                            </h3>

                                                            <span className="job-new-badge">
                                                                Open
                                                            </span>

                                                        </div>


                                                        <div className="job-card-meta">

                                                            <span>
                                                                <Building2
                                                                    size={15}
                                                                />
                                                                {
                                                                    getDepartment(
                                                                        job
                                                                    )
                                                                }
                                                            </span>

                                                            <span>
                                                                <MapPin
                                                                    size={15}
                                                                />
                                                                {
                                                                    getLocation(
                                                                        job
                                                                    )
                                                                }
                                                            </span>

                                                            <span>
                                                                <Clock3
                                                                    size={15}
                                                                />
                                                                {
                                                                    getEmploymentType(
                                                                        job
                                                                    )
                                                                }
                                                            </span>

                                                        </div>


                                                        <p className="job-card-description">
                                                            {
                                                                getDescription(
                                                                    job
                                                                )
                                                            }
                                                        </p>


                                                        <div className="job-card-posted">

                                                            Posted{" "}
                                                            {
                                                                formatDate(
                                                                    getPostedDate(
                                                                        job
                                                                    )
                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="job-card-action">

                                                    <span>
                                                        View & Apply
                                                    </span>

                                                    <ArrowRight
                                                        size={19}
                                                    />

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    ABOUT
                ================================================= */}

                <section
                    id="about"
                    className="candidate-launch-about-section"
                >

                    <div className="candidate-launch-section-inner">

                        <div className="about-grid">

                            <div className="about-content">

                                <span className="section-overline">
                                    WHO WE ARE
                                </span>

                                <h2>
                                    More than a workplace.
                                    <br />
                                    <span>
                                        A place to grow.
                                    </span>
                                </h2>

                                <p>
                                    We believe great products
                                    are built by great people.
                                    Our teams bring together
                                    different perspectives,
                                    skills and experiences to
                                    solve real-world challenges.
                                </p>

                                <p>
                                    Whether you are beginning
                                    your career or looking for
                                    your next big challenge,
                                    we provide an environment
                                    where you can learn, take
                                    ownership and make a
                                    meaningful contribution.
                                </p>


                                <button
                                    type="button"
                                    className="about-link-btn"
                                    onClick={() =>
                                        scrollToSection(
                                            "culture"
                                        )
                                    }
                                >
                                    Discover our culture
                                    <ArrowRight
                                        size={18}
                                    />
                                </button>

                            </div>


                            <div className="about-feature-grid">

                                <div className="about-feature-card">

                                    <div className="about-feature-icon">
                                        <Rocket size={21} />
                                    </div>

                                    <h3>
                                        Innovation
                                    </h3>

                                    <p>
                                        Turn ambitious ideas
                                        into products and
                                        experiences that matter.
                                    </p>

                                </div>


                                <div className="about-feature-card">

                                    <div className="about-feature-icon">
                                        <Users size={21} />
                                    </div>

                                    <h3>
                                        Collaboration
                                    </h3>

                                    <p>
                                        Work with talented
                                        people who believe in
                                        sharing and learning.
                                    </p>

                                </div>


                                <div className="about-feature-card">

                                    <div className="about-feature-icon">
                                        <ShieldCheck size={21} />
                                    </div>

                                    <h3>
                                        Trust
                                    </h3>

                                    <p>
                                        Own your work, speak
                                        openly and make an
                                        impact.
                                    </p>

                                </div>


                                <div className="about-feature-card">

                                    <div className="about-feature-icon">
                                        <HeartHandshake
                                            size={21}
                                        />
                                    </div>

                                    <h3>
                                        People First
                                    </h3>

                                    <p>
                                        Your growth and
                                        wellbeing are part
                                        of our success.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CULTURE
                ================================================= */}

                <section
                    id="culture"
                    className="candidate-launch-culture-section"
                >

                    <div className="candidate-launch-section-inner">

                        <div className="culture-heading">

                            <span className="section-overline">
                                LIFE AT YOURCOMPANY
                            </span>

                            <h2>
                                Come for the opportunity.
                                <br />
                                <span>
                                    Stay for the people.
                                </span>
                            </h2>

                            <p>
                                We are building a workplace
                                where people can do their
                                best work while being
                                themselves.
                            </p>

                        </div>


                        <div className="culture-grid">

                            <div className="culture-card culture-card-large">

                                <div className="culture-card-number">
                                    01
                                </div>

                                <h3>
                                    Learn continuously
                                </h3>

                                <p>
                                    Take on new challenges,
                                    learn from experienced
                                    teammates and continuously
                                    build your skills.
                                </p>

                            </div>


                            <div className="culture-card">

                                <div className="culture-card-number">
                                    02
                                </div>

                                <h3>
                                    Make an impact
                                </h3>

                                <p>
                                    Your ideas matter. Take
                                    ownership and help shape
                                    what we build next.
                                </p>

                            </div>


                            <div className="culture-card">

                                <div className="culture-card-number">
                                    03
                                </div>

                                <h3>
                                    Grow together
                                </h3>

                                <p>
                                    Work alongside people
                                    who support your growth
                                    and celebrate success
                                    together.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    CTA
                ================================================= */}

                <section className="candidate-launch-cta">

                    <div className="candidate-launch-section-inner">

                        <div className="candidate-launch-cta-box">

                            <div>

                                <span className="section-overline">
                                    YOUR NEXT CHAPTER
                                </span>

                                <h2>
                                    Ready to build
                                    something great?
                                </h2>

                                <p>
                                    Create your candidate
                                    account and take the
                                    first step toward your
                                    next opportunity.
                                </p>

                            </div>


                            <div className="candidate-launch-cta-actions">

                                <button
                                    type="button"
                                    className="launch-white-btn"
                                    onClick={goToRegister}
                                >
                                    Create Account
                                    <ArrowRight
                                        size={18}
                                    />
                                </button>

                                <button
                                    type="button"
                                    className="launch-outline-white-btn"
                                    onClick={goToLogin}
                                >
                                    Candidate Login
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="candidate-launch-footer">

                <div className="candidate-launch-footer-inner">

                    <div className="footer-company">

                        <div className="candidate-launch-logo footer-logo">

                            <span className="candidate-launch-logo-mark">
                                <Rocket size={20} />
                            </span>

                            <span className="candidate-launch-logo-text">
                                <strong>
                                    YourCompany
                                </strong>

                                <small>
                                    CAREERS
                                </small>
                            </span>

                        </div>

                        <p>
                            Building better products,
                            stronger teams and meaningful
                            careers.
                        </p>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Careers
                        </h4>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection(
                                    "jobs"
                                )
                            }
                        >
                            Open Positions
                        </button>

                        <button
                            type="button"
                            onClick={goToRegister}
                        >
                            Register
                        </button>

                        <button
                            type="button"
                            onClick={goToLogin}
                        >
                            Login
                        </button>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Company
                        </h4>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection(
                                    "about"
                                )
                            }
                        >
                            About Us
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                scrollToSection(
                                    "culture"
                                )
                            }
                        >
                            Our Culture
                        </button>

                    </div>


                    <div className="footer-column">

                        <h4>
                            Connect
                        </h4>

                        <span>
                            <Globe2 size={15} />
                            YourCompany
                        </span>

                        <span>
                            <HeartHandshake size={15} />
                            People & Culture
                        </span>

                    </div>

                </div>


                <div className="candidate-launch-footer-bottom">

                    <span>
                        © {new Date().getFullYear()}{" "}
                        YourCompany. All rights reserved.
                    </span>

                    <span>
                        Careers Portal
                    </span>

                </div>

            </footer>

        </div>
    );
};


export default CandidateLaunch;