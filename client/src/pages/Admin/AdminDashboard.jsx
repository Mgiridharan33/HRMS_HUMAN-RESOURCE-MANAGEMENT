import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    AlertCircle,
    ArrowRight,
    Ban,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronRight,
    Clock3,
    ExternalLink,
    LayoutDashboard,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import api from "../../services/api";
import "./css/AdminJobDashboard.css"

// =========================================================
// CONSTANTS
// =========================================================

const BASE_PATH = "/super-admin";

const STATUS_FILTERS = [
    "All",
    "Published",
    "Draft",
    "Closed",
];


// =========================================================
// HELPERS
// =========================================================

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


const formatSalary = (job) => {

    const min = job?.salaryMin;
    const max = job?.salaryMax;

    const currency =
        job?.salaryCurrency || "INR";

    if (
        (min === null || min === undefined) &&
        (max === null || max === undefined)
    ) {
        return "Not specified";
    }

    const formatter =
        new Intl.NumberFormat(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        );

    if (
        min !== null &&
        min !== undefined &&
        max !== null &&
        max !== undefined
    ) {
        return `${currency} ${formatter.format(min)} - ${formatter.format(max)}`;
    }

    if (
        min !== null &&
        min !== undefined
    ) {
        return `${currency} ${formatter.format(min)}+`;
    }

    return `${currency} ${formatter.format(max)}`;
};


const getStatusClass = (status) => {

    switch (status) {

        case "Published":
            return "published";

        case "Draft":
            return "draft";

        case "Closed":
            return "closed";

        default:
            return "default";
    }
};


// =========================================================
// COMPONENT
// =========================================================

const AdminDashboard = () => {

    const navigate = useNavigate();


    // =====================================================
    // JOB STATE
    // =====================================================

    const [
        jobs,
        setJobs,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    const [
        closingJobId,
        setClosingJobId,
    ] = useState(null);


    // =====================================================
    // FETCH JOBS
    // =====================================================

    const fetchJobs = useCallback(
        async (showLoader = true) => {

            try {

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");

                const response =
                    await api.get(
                        "/super-admin/jobs"
                    );

                const data =
                    response?.data;

                setJobs(
                    Array.isArray(data?.jobs)
                        ? data.jobs
                        : []
                );

            } catch (err) {

                console.error(
                    "ADMIN DASHBOARD JOB FETCH ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load jobs."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }

        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchJobs();

    }, [fetchJobs]);


    // =====================================================
    // CLOSE JOB
    // =====================================================

    const handleCloseJob = async (job) => {

        if (!job?._id) {
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to close "${job.title}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setClosingJobId(job._id);

            setError("");
            setSuccess("");

            const response =
                await api.patch(
                    `/admin/jobs/${job._id}/close`
                );

            setSuccess(
                response?.data?.message ||
                "Job closed successfully."
            );

            await fetchJobs(false);

        } catch (err) {

            console.error(
                "CLOSE JOB ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to close job."
            );

        } finally {

            setClosingJobId(null);

        }
    };


    // =====================================================
    // JOB STATISTICS
    // =====================================================

    const statistics = useMemo(() => {

        const total =
            jobs.length;

        const published =
            jobs.filter(
                (job) =>
                    job.status === "Published"
            ).length;

        const drafts =
            jobs.filter(
                (job) =>
                    job.status === "Draft"
            ).length;

        const closed =
            jobs.filter(
                (job) =>
                    job.status === "Closed"
            ).length;

        const totalVacancies =
            jobs.reduce(
                (totalValue, job) =>
                    totalValue +
                    (
                        Number(job.vacancies) || 0
                    ),
                0
            );

        return {
            total,
            published,
            drafts,
            closed,
            totalVacancies,
        };

    }, [jobs]);


    // =====================================================
    // FILTERED JOBS
    // =====================================================

    const filteredJobs = useMemo(() => {

        const normalizedSearch =
            search
                .trim()
                .toLowerCase();

        return jobs.filter((job) => {

            const matchesStatus =
                statusFilter === "All" ||
                job.status === statusFilter;

            if (!matchesStatus) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                job.title,
                job.department,
                job.designation,
                job.location,
                job.employmentType,
                job.experience,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );
        });

    }, [
        jobs,
        search,
        statusFilter,
    ]);


    // =====================================================
    // RECENT JOBS
    // =====================================================

    const recentJobs = useMemo(() => {

        return [...jobs]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            )
            .slice(0, 5);

    }, [jobs]);


    // =====================================================
    // ALERTS
    // =====================================================

    const clearAlerts = () => {

        setError("");
        setSuccess("");

    };


    // =====================================================
    // SCROLL TO JOBS
    // =====================================================

    const scrollToJobs = (filter = "All") => {

        setStatusFilter(filter);

        setTimeout(() => {

            document
                .getElementById(
                    "admin-all-jobs"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }, 50);
    };


    // =====================================================
    // JOB MODULES ONLY
    // =====================================================

    const jobModules = [

        {
            title: "Job Management",
            description:
                "View, search, edit, publish and close all job postings.",
            icon: BriefcaseBusiness,
            path:
                `${BASE_PATH}/jobs`,
            className:
                "jobs",
        },

        {
            title: "Create New Job",
            description:
                "Create a new job vacancy with requirements, salary and deadline.",
            icon: Plus,
            path:
                `${BASE_PATH}/jobs/create`,
            className:
                "create",
        },

        {
            title: "Job Dashboard",
            description:
                "Open the complete recruitment and job management dashboard.",
            icon: LayoutDashboard,
            path:
                `${BASE_PATH}/job/dashboard`,
            className:
                "dashboard",
        },

    ];


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="admin-dashboard-header">

                <div className="admin-dashboard-header-content">

                    <div>

                        <div className="admin-dashboard-eyebrow">

                            <ShieldCheck size={17} />

                            Super Admin · Recruitment

                        </div>


                        <h1>
                            Recruitment Dashboard
                        </h1>


                        <p>
                            Manage job postings,
                            vacancies and recruitment
                            activities from one place.
                        </p>

                    </div>


                    <div className="admin-dashboard-header-actions">

                        <button
                            type="button"
                            className="admin-dashboard-refresh-button"
                            onClick={() =>
                                fetchJobs(false)
                            }
                            disabled={
                                refreshing ||
                                loading
                            }
                        >

                            {refreshing ? (

                                <Loader2
                                    size={18}
                                    className="admin-dashboard-spin"
                                />

                            ) : (

                                <RefreshCw
                                    size={18}
                                />

                            )}

                            Refresh

                        </button>


                        <button
                            type="button"
                            className="admin-dashboard-create-button"
                            onClick={() =>
                                navigate(
                                    `${BASE_PATH}/jobs/create`
                                )
                            }
                        >

                            <Plus size={19} />

                            Create Job

                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                ALERTS
            ================================================= */}

            {(error || success) && (

                <div
                    className={
                        error
                            ? "admin-dashboard-alert error"
                            : "admin-dashboard-alert success"
                    }
                >

                    {error ? (

                        <AlertCircle size={19} />

                    ) : (

                        <CheckCircle2 size={19} />

                    )}


                    <span>
                        {error || success}
                    </span>


                    <button
                        type="button"
                        onClick={clearAlerts}
                    >

                        <X size={17} />

                    </button>

                </div>

            )}


            <main className="admin-dashboard-content">

                {/* =================================================
                    JOB CONTROL CENTER
                ================================================= */}

                <section className="admin-dashboard-section">

                    <div className="admin-dashboard-section-heading">

                        <div>

                            <h2>
                                Recruitment Control Center
                            </h2>

                            <p>
                                Manage all recruitment and
                                job posting operations.
                            </p>

                        </div>

                    </div>


                    <div className="admin-dashboard-management-grid">

                        {jobModules.map((module) => {

                            const Icon =
                                module.icon;

                            return (

                                <button
                                    type="button"
                                    key={module.title}
                                    className={`admin-dashboard-management-card ${module.className}`}
                                    onClick={() =>
                                        navigate(
                                            module.path
                                        )
                                    }
                                >

                                    <div className="admin-dashboard-management-icon">

                                        <Icon size={24} />

                                    </div>


                                    <div className="admin-dashboard-management-content">

                                        <h3>
                                            {module.title}
                                        </h3>

                                        <p>
                                            {
                                                module.description
                                            }
                                        </p>

                                    </div>


                                    <ArrowRight
                                        size={19}
                                        className="admin-dashboard-management-arrow"
                                    />

                                </button>

                            );

                        })}

                    </div>

                </section>


                {/* =================================================
                    JOB STATISTICS
                ================================================= */}

                <section className="admin-dashboard-statistics">

                    {/* TOTAL */}

                    <button
                        type="button"
                        className="admin-dashboard-stat-card"
                        onClick={() =>
                            scrollToJobs("All")
                        }
                    >

                        <div className="admin-dashboard-stat-icon total">

                            <BriefcaseBusiness size={21} />

                        </div>


                        <div className="admin-dashboard-stat-info">

                            <span>
                                Total Jobs
                            </span>

                            <strong>
                                {statistics.total}
                            </strong>

                        </div>


                        <ChevronRight size={18} />

                    </button>


                    {/* PUBLISHED */}

                    <button
                        type="button"
                        className="admin-dashboard-stat-card"
                        onClick={() =>
                            scrollToJobs("Published")
                        }
                    >

                        <div className="admin-dashboard-stat-icon published">

                            <CheckCircle2 size={21} />

                        </div>


                        <div className="admin-dashboard-stat-info">

                            <span>
                                Published
                            </span>

                            <strong>
                                {statistics.published}
                            </strong>

                        </div>


                        <ChevronRight size={18} />

                    </button>


                    {/* DRAFT */}

                    <button
                        type="button"
                        className="admin-dashboard-stat-card"
                        onClick={() =>
                            scrollToJobs("Draft")
                        }
                    >

                        <div className="admin-dashboard-stat-icon draft">

                            <Clock3 size={21} />

                        </div>


                        <div className="admin-dashboard-stat-info">

                            <span>
                                Drafts
                            </span>

                            <strong>
                                {statistics.drafts}
                            </strong>

                        </div>


                        <ChevronRight size={18} />

                    </button>


                    {/* CLOSED */}

                    <button
                        type="button"
                        className="admin-dashboard-stat-card"
                        onClick={() =>
                            scrollToJobs("Closed")
                        }
                    >

                        <div className="admin-dashboard-stat-icon closed">

                            <Ban size={21} />

                        </div>


                        <div className="admin-dashboard-stat-info">

                            <span>
                                Closed
                            </span>

                            <strong>
                                {statistics.closed}
                            </strong>

                        </div>


                        <ChevronRight size={18} />

                    </button>


                    {/* VACANCIES */}

                    <div className="admin-dashboard-stat-card">

                        <div className="admin-dashboard-stat-icon vacancies">

                            <Users size={21} />

                        </div>


                        <div className="admin-dashboard-stat-info">

                            <span>
                                Total Vacancies
                            </span>

                            <strong>
                                {statistics.totalVacancies}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RECENT JOBS
                ================================================= */}

                <section className="admin-dashboard-section">

                    <div className="admin-dashboard-section-heading">

                        <div>

                            <h2>
                                Recent Jobs
                            </h2>

                            <p>
                                Recently created job
                                postings.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="admin-dashboard-view-all"
                            onClick={() =>
                                navigate(
                                    `${BASE_PATH}/jobs`
                                )
                            }
                        >

                            View All Jobs

                            <ArrowRight size={17} />

                        </button>

                    </div>


                    {loading ? (

                        <div className="admin-dashboard-loading">

                            <Loader2
                                size={30}
                                className="admin-dashboard-spin"
                            />

                            <p>
                                Loading jobs...
                            </p>

                        </div>

                    ) : recentJobs.length === 0 ? (

                        <div className="admin-dashboard-empty">

                            <div className="admin-dashboard-empty-icon">

                                <BriefcaseBusiness size={28} />

                            </div>


                            <h3>
                                No jobs yet
                            </h3>


                            <p>
                                Create your first job
                                posting to get started.
                            </p>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `${BASE_PATH}/jobs/create`
                                    )
                                }
                            >

                                <Plus size={17} />

                                Create Job

                            </button>

                        </div>

                    ) : (

                        <div className="admin-dashboard-recent-jobs">

                            {recentJobs.map((job) => (

                                <div
                                    className="admin-dashboard-job-row"
                                    key={job._id}
                                >

                                    <div className="admin-dashboard-job-main">

                                        <div className="admin-dashboard-job-icon">

                                            <BriefcaseBusiness size={20} />

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    job.title ||
                                                    "Untitled Job"
                                                }
                                            </h3>


                                            <div className="admin-dashboard-job-meta">

                                                {job.department && (

                                                    <span>

                                                        {job.department}

                                                    </span>

                                                )}


                                                {job.location && (

                                                    <span>

                                                        <MapPin size={14} />

                                                        {
                                                            job.location
                                                        }

                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>


                                    <div className="admin-dashboard-job-details">

                                        <span
                                            className={`admin-dashboard-status ${getStatusClass(
                                                job.status
                                            )}`}
                                        >

                                            {
                                                job.status ||
                                                "Draft"
                                            }

                                        </span>


                                        <span className="admin-dashboard-job-vacancies">

                                            <Users size={14} />

                                            {
                                                job.vacancies ||
                                                0
                                            }

                                            {" "}
                                            vacancies

                                        </span>


                                        <span className="admin-dashboard-job-date">

                                            {
                                                formatDate(
                                                    job.createdAt
                                                )
                                            }

                                        </span>

                                    </div>


                                    <div className="admin-dashboard-job-actions">

                                        {/* VIEW */}

                                        <button
                                            type="button"
                                            title="View Job"
                                            onClick={() =>
                                                navigate(
                                                    `${BASE_PATH}/jobs/${job._id}`
                                                )
                                            }
                                        >

                                            <ExternalLink size={17} />

                                        </button>


                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            title="Edit Job"
                                            onClick={() =>
                                                navigate(
                                                    `${BASE_PATH}/jobs/${job._id}/edit`
                                                )
                                            }
                                        >

                                            <Pencil size={17} />

                                        </button>


                                        {/* CLOSE */}

                                        {job.status !== "Closed" && (

                                            <button
                                                type="button"
                                                title="Close Job"
                                                onClick={() =>
                                                    handleCloseJob(job)
                                                }
                                                disabled={
                                                    closingJobId ===
                                                    job._id
                                                }
                                            >

                                                {closingJobId ===
                                                job._id ? (

                                                    <Loader2
                                                        size={17}
                                                        className="admin-dashboard-spin"
                                                    />

                                                ) : (

                                                    <X size={17} />

                                                )}

                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* =================================================
                    ALL JOBS
                ================================================= */}

                <section
                    id="admin-all-jobs"
                    className="admin-dashboard-section admin-dashboard-all-jobs"
                >

                    <div className="admin-dashboard-section-heading">

                        <div>

                            <h2>
                                All Job Postings
                            </h2>

                            <p>
                                Search and manage every
                                job in the recruitment
                                system.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="admin-dashboard-create-small"
                            onClick={() =>
                                navigate(
                                    `${BASE_PATH}/jobs/create`
                                )
                            }
                        >

                            <Plus size={17} />

                            New Job

                        </button>

                    </div>


                    {/* =================================================
                        SEARCH + FILTER
                    ================================================= */}

                    <div className="admin-dashboard-filters">

                        <div className="admin-dashboard-search">

                            <Search size={18} />


                            <input
                                type="text"
                                placeholder="Search jobs by title, department, location..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >

                                    <X size={16} />

                                </button>

                            )}

                        </div>


                        <div className="admin-dashboard-status-filters">

                            {STATUS_FILTERS.map(
                                (status) => (

                                    <button
                                        type="button"
                                        key={status}
                                        className={
                                            statusFilter === status
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setStatusFilter(
                                                status
                                            )
                                        }
                                    >

                                        {status}

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* RESULT INFO */}

                    <div className="admin-dashboard-result-info">

                        Showing{" "}

                        <strong>
                            {filteredJobs.length}
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {jobs.length}
                        </strong>

                        {" "}jobs

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="admin-dashboard-loading">

                            <Loader2
                                size={30}
                                className="admin-dashboard-spin"
                            />

                            <p>
                                Loading jobs...
                            </p>

                        </div>

                    ) : filteredJobs.length === 0 ? (

                        <div className="admin-dashboard-no-results">

                            <Search size={28} />

                            <h3>
                                No jobs found
                            </h3>

                            <p>
                                Try changing your
                                search or status filter.
                            </p>


                            <button
                                type="button"
                                onClick={() => {

                                    setSearch("");

                                    setStatusFilter(
                                        "All"
                                    );

                                }}
                            >

                                Clear Filters

                            </button>

                        </div>

                    ) : (

                        <div className="admin-dashboard-table-wrapper">

                            <table className="admin-dashboard-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Job
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Employment
                                        </th>

                                        <th>
                                            Vacancies
                                        </th>

                                        <th>
                                            Salary
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Deadline
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredJobs.map(
                                        (job) => (

                                            <tr
                                                key={
                                                    job._id
                                                }
                                            >

                                                {/* JOB */}

                                                <td>

                                                    <div className="admin-dashboard-table-job">

                                                        <div className="admin-dashboard-table-job-icon">

                                                            <BriefcaseBusiness
                                                                size={17}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    job.title ||
                                                                    "Untitled Job"
                                                                }
                                                            </strong>


                                                            {job.designation && (

                                                                <span>
                                                                    {
                                                                        job.designation
                                                                    }
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* DEPARTMENT */}

                                                <td>

                                                    {
                                                        job.department ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* LOCATION */}

                                                <td>

                                                    <span className="admin-dashboard-location">

                                                        {job.location && (

                                                            <MapPin
                                                                size={14}
                                                            />

                                                        )}

                                                        {
                                                            job.location ||
                                                            "—"
                                                        }

                                                    </span>

                                                </td>


                                                {/* EMPLOYMENT */}

                                                <td>

                                                    {
                                                        job.employmentType ||
                                                        "—"
                                                    }

                                                </td>


                                                {/* VACANCIES */}

                                                <td>

                                                    <span className="admin-dashboard-vacancy-cell">

                                                        <Users
                                                            size={14}
                                                        />

                                                        {
                                                            job.vacancies ||
                                                            0
                                                        }

                                                    </span>

                                                </td>


                                                {/* SALARY */}

                                                <td>

                                                    <span className="admin-dashboard-salary">

                                                        {
                                                            formatSalary(
                                                                job
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`admin-dashboard-status ${getStatusClass(
                                                            job.status
                                                        )}`}
                                                    >

                                                        {
                                                            job.status ||
                                                            "Draft"
                                                        }

                                                    </span>

                                                </td>


                                                {/* DEADLINE */}

                                                <td>

                                                    {
                                                        job.applicationDeadline
                                                            ? formatDate(
                                                                job.applicationDeadline
                                                            )
                                                            : "No deadline"
                                                    }

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="admin-dashboard-table-actions">

                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            title="View"
                                                            onClick={() =>
                                                                navigate(
                                                                    `${BASE_PATH}/jobs/${job._id}`
                                                                )
                                                            }
                                                        >

                                                            <ExternalLink
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                navigate(
                                                                    `${BASE_PATH}/jobs/${job._id}/edit`
                                                                )
                                                            }
                                                        >

                                                            <Pencil
                                                                size={16}
                                                            />

                                                        </button>


                                                        {/* CLOSE */}

                                                        {job.status !==
                                                            "Closed" && (

                                                            <button
                                                                type="button"
                                                                title="Close"
                                                                onClick={() =>
                                                                    handleCloseJob(
                                                                        job
                                                                    )
                                                                }
                                                                disabled={
                                                                    closingJobId ===
                                                                    job._id
                                                                }
                                                            >

                                                                {closingJobId ===
                                                                job._id ? (

                                                                    <Loader2
                                                                        size={16}
                                                                        className="admin-dashboard-spin"
                                                                    />

                                                                ) : (

                                                                    <X
                                                                        size={16}
                                                                    />

                                                                )}

                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    QUICK LINKS - JOBS ONLY
                ================================================= */}

                <section className="admin-dashboard-quick-links">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `${BASE_PATH}/jobs`
                            )
                        }
                    >

                        <BriefcaseBusiness size={19} />

                        <span>
                            Full Job Management
                        </span>

                        <ExternalLink size={16} />

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `${BASE_PATH}/jobs/create`
                            )
                        }
                    >

                        <Plus size={19} />

                        <span>
                            Create New Job
                        </span>

                        <ExternalLink size={16} />

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `${BASE_PATH}/job/dashboard`
                            )
                        }
                    >

                        <LayoutDashboard size={19} />

                        <span>
                            Recruitment Dashboard
                        </span>

                        <ExternalLink size={16} />

                    </button>

                </section>

            </main>

        </div>

    );
};


export default AdminDashboard;