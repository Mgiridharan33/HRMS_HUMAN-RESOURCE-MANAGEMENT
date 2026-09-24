import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BriefcaseBusiness,
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    Eye,
    X,
    CheckCircle2,
    Clock3,
    XCircle,
    MapPin,
    Users,
    CalendarDays,
    IndianRupee,
    Building2,
    Briefcase,
    ChevronDown,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";

import {
    createAdminJob,
    getAdminJobs,
    updateAdminJob,
    deleteAdminJob,
    closeAdminJob,
} from "../../services/adminJobApi";

import "../../pages/Admin/css/AdminJobManagement.css";


const EMPTY_FORM = {

    title: "",

    department: "",

    designation: "",

    location: "",

    employmentType: "Full Time",

    description: "",

    requirements: [],

    responsibilities: [],

    skills: [],

    experience: "",

    salaryMin: "",

    salaryMax: "",

    salaryCurrency: "INR",

    vacancies: 1,

    applicationDeadline: "",

    status: "Draft",

};


const EMPLOYMENT_TYPES = [

    "Full Time",
    "Part Time",
    "Contract",
    "Internship",
    "Temporary",

];


const STATUS_OPTIONS = [

    "All",
    "Draft",
    "Published",
    "Closed",

];


const AdminJobManagement = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [showModal, setShowModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [editingJob, setEditingJob] =
        useState(null);

    const [viewingJob, setViewingJob] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);


    // =========================================================
    // FETCH JOBS
    // =========================================================

    const loadJobs = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getAdminJobs();

                setJobs(
                    response?.jobs || []
                );

            } catch (err) {

                console.error(
                    "LOAD ADMIN JOBS ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load jobs"
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    useEffect(() => {

        loadJobs();

    }, [loadJobs]);


    // =========================================================
    // FILTER JOBS
    // =========================================================

    const filteredJobs = useMemo(() => {

        const keyword =
            search
                .trim()
                .toLowerCase();

        return jobs.filter(
            (job) => {

                const matchesSearch =
                    !keyword ||
                    job.title
                        ?.toLowerCase()
                        .includes(keyword) ||
                    job.department
                        ?.toLowerCase()
                        .includes(keyword) ||
                    job.designation
                        ?.toLowerCase()
                        .includes(keyword) ||
                    job.location
                        ?.toLowerCase()
                        .includes(keyword);

                const matchesStatus =
                    statusFilter === "All" ||
                    job.status === statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    }, [
        jobs,
        search,
        statusFilter,
    ]);


    // =========================================================
    // SUMMARY
    // =========================================================

    const summary = useMemo(() => {

        return {

            total: jobs.length,

            published:
                jobs.filter(
                    job =>
                        job.status ===
                        "Published"
                ).length,

            draft:
                jobs.filter(
                    job =>
                        job.status ===
                        "Draft"
                ).length,

            closed:
                jobs.filter(
                    job =>
                        job.status ===
                        "Closed"
                ).length,

        };

    }, [jobs]);


    // =========================================================
    // FORM HELPERS
    // =========================================================

    const updateField = (
        field,
        value
    ) => {

        setForm(
            previous => ({
                ...previous,
                [field]: value,
            })
        );

    };


    const updateArrayField = (
        field,
        value
    ) => {

        const items =
            value
                .split("\n")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);

        updateField(
            field,
            items
        );

    };


    // =========================================================
    // OPEN CREATE
    // =========================================================

    const handleCreate = () => {

        setEditingJob(null);

        setForm(
            EMPTY_FORM
        );

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    // =========================================================
    // OPEN EDIT
    // =========================================================

    const handleEdit = (
        job
    ) => {

        setEditingJob(job);

        setForm({

            title:
                job.title || "",

            department:
                job.department || "",

            designation:
                job.designation || "",

            location:
                job.location || "",

            employmentType:
                job.employmentType ||
                "Full Time",

            description:
                job.description || "",

            requirements:
                job.requirements || [],

            responsibilities:
                job.responsibilities || [],

            skills:
                job.skills || [],

            experience:
                job.experience || "",

            salaryMin:
                job.salaryMin ??
                "",

            salaryMax:
                job.salaryMax ??
                "",

            salaryCurrency:
                job.salaryCurrency ||
                "INR",

            vacancies:
                job.vacancies ||
                1,

            applicationDeadline:
                job.applicationDeadline
                    ? new Date(
                        job.applicationDeadline
                    )
                        .toISOString()
                        .slice(0, 10)
                    : "",

            status:
                job.status ||
                "Draft",

        });

        setError("");

        setSuccess("");

        setShowModal(true);

    };


    // =========================================================
    // VIEW JOB
    // =========================================================

    const handleView = (
        job
    ) => {

        setViewingJob(job);

        setShowViewModal(true);

    };


    // =========================================================
    // CLOSE MODALS
    // =========================================================

    const closeModal = () => {

        if (saving) return;

        setShowModal(false);

        setEditingJob(null);

        setForm(
            EMPTY_FORM
        );

    };


    const closeViewModal = () => {

        setShowViewModal(false);

        setViewingJob(null);

    };


    // =========================================================
    // SAVE JOB
    // =========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        try {

            setSaving(true);

            setError("");

            setSuccess("");


            const payload = {

                ...form,

                salaryMin:
                    form.salaryMin === ""
                        ? null
                        : Number(
                            form.salaryMin
                        ),

                salaryMax:
                    form.salaryMax === ""
                        ? null
                        : Number(
                            form.salaryMax
                        ),

                vacancies:
                    Number(
                        form.vacancies
                    ),

                requirements:
                    Array.isArray(
                        form.requirements
                    )
                        ? form.requirements
                        : [],

                responsibilities:
                    Array.isArray(
                        form.responsibilities
                    )
                        ? form.responsibilities
                        : [],

                skills:
                    Array.isArray(
                        form.skills
                    )
                        ? form.skills
                        : [],

                applicationDeadline:
                    form.applicationDeadline ||
                    null,

            };


            if (editingJob) {

                const response =
                    await updateAdminJob(
                        editingJob._id,
                        payload
                    );

                setSuccess(
                    response?.message ||
                    "Job updated successfully"
                );

            } else {

                const response =
                    await createAdminJob(
                        payload
                    );

                setSuccess(
                    response?.message ||
                    "Job created successfully"
                );

            }


            await loadJobs();

            setShowModal(false);

            setEditingJob(null);

            setForm(
                EMPTY_FORM
            );

        } catch (err) {

            console.error(
                "SAVE JOB ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to save job"
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // DELETE JOB
    // =========================================================

    const handleDelete = async (
        job
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${job.title}"? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            setSuccess("");

            await deleteAdminJob(
                job._id
            );

            setSuccess(
                "Job deleted successfully"
            );

            await loadJobs();

        } catch (err) {

            console.error(
                "DELETE JOB ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to delete job"
            );

        }

    };


    // =========================================================
    // CLOSE JOB
    // =========================================================

    const handleClose = async (
        job
    ) => {

        const confirmed =
            window.confirm(
                `Close "${job.title}"?`
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");

            setSuccess("");

            const response =
                await closeAdminJob(
                    job._id
                );

            setSuccess(
                response?.message ||
                "Job closed successfully"
            );

            await loadJobs();

        } catch (err) {

            console.error(
                "CLOSE JOB ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to close job"
            );

        }

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "No deadline";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =========================================================
    // FORMAT SALARY
    // =========================================================

    const formatSalary = (
        job
    ) => {

        if (
            job.salaryMin === null &&
            job.salaryMax === null
        ) {

            return "Not specified";

        }

        const currency =
            job.salaryCurrency ||
            "INR";

        const formatter =
            new Intl.NumberFormat(
                "en-IN",
                {
                    maximumFractionDigits: 0,
                }
            );


        if (
            job.salaryMin !== null &&
            job.salaryMax !== null
        ) {

            return `${currency} ${formatter.format(
                job.salaryMin
            )} - ${formatter.format(
                job.salaryMax
            )}`;

        }


        if (
            job.salaryMin !== null
        ) {

            return `${currency} ${formatter.format(
                job.salaryMin
            )}+`;

        }


        return `${currency} ${formatter.format(
            job.salaryMax
        )}`;

    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {

        if (
            status ===
            "Published"
        ) {
            return "status-published";
        }

        if (
            status ===
            "Closed"
        ) {
            return "status-closed";
        }

        return "status-draft";

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-job-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="admin-job-header">

                <div>

                    <div className="admin-job-title-row">

                        <div className="admin-job-title-icon">

                            <BriefcaseBusiness
                                size={24}
                            />

                        </div>

                        <div>

                            <h1>
                                Job Management
                            </h1>

                            <p>
                                Create, publish and manage
                                all company job openings.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="admin-job-header-actions">

                    <button
                        type="button"
                        className="job-refresh-button"
                        onClick={loadJobs}
                        disabled={loading}
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="job-create-button"
                        onClick={handleCreate}
                    >

                        <Plus
                            size={18}
                        />

                        Create Job

                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="job-alert job-alert-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {success && (

                <div className="job-alert job-alert-success">

                    <CheckCircle2
                        size={18}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="job-summary-grid">

                <div className="job-summary-card">

                    <div className="job-summary-icon">
                        <Briefcase
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Total Jobs
                        </span>

                        <strong>
                            {summary.total}
                        </strong>
                    </div>

                </div>


                <div className="job-summary-card">

                    <div className="job-summary-icon published">
                        <CheckCircle2
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Published
                        </span>

                        <strong>
                            {summary.published}
                        </strong>
                    </div>

                </div>


                <div className="job-summary-card">

                    <div className="job-summary-icon draft">
                        <Clock3
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Draft
                        </span>

                        <strong>
                            {summary.draft}
                        </strong>
                    </div>

                </div>


                <div className="job-summary-card">

                    <div className="job-summary-icon closed">
                        <XCircle
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Closed
                        </span>

                        <strong>
                            {summary.closed}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="job-filter-panel">

                <div className="job-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search jobs, department, location..."
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


                <div className="job-status-filter">

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        {STATUS_OPTIONS.map(
                            status => (

                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </option>

                            )
                        )}

                    </select>

                    <ChevronDown
                        size={16}
                    />

                </div>

            </div>


            {/* =================================================
                JOB TABLE
            ================================================= */}

            <div className="job-table-card">

                <div className="job-table-header">

                    <div>

                        <h2>
                            Job Openings
                        </h2>

                        <span>
                            {filteredJobs.length}
                            {" "}
                            job
                            {filteredJobs.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="job-loading">

                        <Loader2
                            size={28}
                            className="spin"
                        />

                        <p>
                            Loading jobs...
                        </p>

                    </div>

                ) : filteredJobs.length === 0 ? (

                    <div className="job-empty">

                        <BriefcaseBusiness
                            size={42}
                        />

                        <h3>
                            No jobs found
                        </h3>

                        <p>
                            Create your first job opening
                            to start receiving applications.
                        </p>

                        <button
                            type="button"
                            onClick={handleCreate}
                        >
                            <Plus size={17} />
                            Create Job
                        </button>

                    </div>

                ) : (

                    <div className="job-table-wrapper">

                        <table className="job-table">

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
                                        Type
                                    </th>

                                    <th>
                                        Vacancies
                                    </th>

                                    <th>
                                        Deadline
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredJobs.map(
                                    job => (

                                        <tr
                                            key={
                                                job._id
                                            }
                                        >

                                            <td>

                                                <div className="job-name-cell">

                                                    <div className="job-row-icon">
                                                        <BriefcaseBusiness
                                                            size={18}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {job.title}
                                                        </strong>

                                                        {job.designation && (

                                                            <span>
                                                                {job.designation}
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="table-info">

                                                    <Building2
                                                        size={15}
                                                    />

                                                    {job.department ||
                                                        "—"}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="table-info">

                                                    <MapPin
                                                        size={15}
                                                    />

                                                    {job.location ||
                                                        "—"}

                                                </div>

                                            </td>


                                            <td>

                                                {job.employmentType ||
                                                    "—"}

                                            </td>


                                            <td>

                                                <div className="table-info">

                                                    <Users
                                                        size={15}
                                                    />

                                                    {job.vacancies}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="table-info">

                                                    <CalendarDays
                                                        size={15}
                                                    />

                                                    {formatDate(
                                                        job.applicationDeadline
                                                    )}

                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={`job-status-badge ${getStatusClass(
                                                        job.status
                                                    )}`}
                                                >

                                                    {job.status}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="job-actions">

                                                    <button
                                                        type="button"
                                                        className="job-action view"
                                                        title="View"
                                                        onClick={() =>
                                                            handleView(
                                                                job
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={16}
                                                        />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="job-action edit"
                                                        title="Edit"
                                                        onClick={() =>
                                                            handleEdit(
                                                                job
                                                            )
                                                        }
                                                    >
                                                        <Edit3
                                                            size={16}
                                                        />
                                                    </button>


                                                    {job.status !==
                                                        "Closed" && (

                                                        <button
                                                            type="button"
                                                            className="job-action close"
                                                            title="Close"
                                                            onClick={() =>
                                                                handleClose(
                                                                    job
                                                                )
                                                            }
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>

                                                    )}


                                                    <button
                                                        type="button"
                                                        className="job-action delete"
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                job
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={16}
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="job-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="job-modal">

                        <div className="job-modal-header">

                            <div>

                                <span>
                                    {editingJob
                                        ? "EDIT JOB"
                                        : "NEW JOB"}
                                </span>

                                <h2>
                                    {editingJob
                                        ? "Edit Job"
                                        : "Create Job"}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="job-form-body">


                                {/* BASIC */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <BriefcaseBusiness
                                            size={18}
                                        />

                                        <h3>
                                            Basic Information
                                        </h3>

                                    </div>


                                    <div className="job-form-grid">

                                        <label className="job-form-field full">

                                            <span>
                                                Job Title *
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.title
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "title",
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                placeholder="e.g. MERN Stack Developer"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Department
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.department
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "department",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. Engineering"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Designation
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.designation
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "designation",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. Software Developer"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Location
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.location
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "location",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. Chennai"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Employment Type
                                            </span>

                                            <select
                                                value={
                                                    form.employmentType
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "employmentType",
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                {EMPLOYMENT_TYPES.map(
                                                    type => (

                                                        <option
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {type}
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Experience
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.experience
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "experience",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. 0-2 years"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Vacancies
                                            </span>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    form.vacancies
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "vacancies",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Application Deadline
                                            </span>

                                            <input
                                                type="date"
                                                value={
                                                    form.applicationDeadline
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "applicationDeadline",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </label>

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <FileTextIcon />

                                        <h3>
                                            Job Description
                                        </h3>

                                    </div>


                                    <label className="job-form-field">

                                        <span>
                                            Description *
                                        </span>

                                        <textarea
                                            rows="6"
                                            value={
                                                form.description
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "description",
                                                    event.target.value
                                                )
                                            }
                                            required
                                            placeholder="Describe the role..."
                                        />

                                    </label>

                                </div>


                                {/* RESPONSIBILITIES */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Responsibilities
                                        </h3>

                                    </div>


                                    <label className="job-form-field">

                                        <span>
                                            One item per line
                                        </span>

                                        <textarea
                                            rows="5"
                                            value={
                                                form.responsibilities.join(
                                                    "\n"
                                                )
                                            }
                                            onChange={(event) =>
                                                updateArrayField(
                                                    "responsibilities",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                "Build web applications\nWork with development team\nMaintain production systems"
                                            }
                                        />

                                    </label>

                                </div>


                                {/* REQUIREMENTS */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Requirements
                                        </h3>

                                    </div>


                                    <label className="job-form-field">

                                        <span>
                                            One item per line
                                        </span>

                                        <textarea
                                            rows="5"
                                            value={
                                                form.requirements.join(
                                                    "\n"
                                                )
                                            }
                                            onChange={(event) =>
                                                updateArrayField(
                                                    "requirements",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                "Bachelor's degree\nJavaScript knowledge\nReact experience"
                                            }
                                        />

                                    </label>

                                </div>


                                {/* SKILLS */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <Briefcase
                                            size={18}
                                        />

                                        <h3>
                                            Skills
                                        </h3>

                                    </div>


                                    <label className="job-form-field">

                                        <span>
                                            One skill per line
                                        </span>

                                        <textarea
                                            rows="4"
                                            value={
                                                form.skills.join(
                                                    "\n"
                                                )
                                            }
                                            onChange={(event) =>
                                                updateArrayField(
                                                    "skills",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                "React\nNode.js\nMongoDB\nExpress"
                                            }
                                        />

                                    </label>

                                </div>


                                {/* SALARY */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <IndianRupee
                                            size={18}
                                        />

                                        <h3>
                                            Salary
                                        </h3>

                                    </div>


                                    <div className="job-form-grid">

                                        <label className="job-form-field">

                                            <span>
                                                Currency
                                            </span>

                                            <input
                                                type="text"
                                                value={
                                                    form.salaryCurrency
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "salaryCurrency",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Minimum Salary
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form.salaryMin
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "salaryMin",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. 300000"
                                            />

                                        </label>


                                        <label className="job-form-field">

                                            <span>
                                                Maximum Salary
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    form.salaryMax
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "salaryMax",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="e.g. 600000"
                                            />

                                        </label>

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div className="job-form-section">

                                    <div className="job-form-section-title">

                                        <CheckCircle2
                                            size={18}
                                        />

                                        <h3>
                                            Publishing
                                        </h3>

                                    </div>


                                    <label className="job-form-field">

                                        <span>
                                            Status
                                        </span>

                                        <select
                                            value={
                                                form.status
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "status",
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="Draft">
                                                Draft
                                            </option>

                                            <option value="Published">
                                                Published
                                            </option>

                                            <option value="Closed">
                                                Closed
                                            </option>

                                        </select>

                                    </label>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="job-modal-footer">

                                <button
                                    type="button"
                                    className="job-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="job-save-button"
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <>

                                            <Loader2
                                                size={17}
                                                className="spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        <>

                                            <Save
                                                size={17}
                                            />

                                            {editingJob
                                                ? "Update Job"
                                                : "Create Job"}

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {showViewModal &&
                viewingJob && (

                <div
                    className="job-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeViewModal();
                        }

                    }}
                >

                    <div className="job-view-modal">

                        <div className="job-modal-header">

                            <div>

                                <span>
                                    JOB DETAILS
                                </span>

                                <h2>
                                    {viewingJob.title}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeViewModal
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="job-view-body">

                            <div className="job-view-meta">

                                <div>
                                    <Building2
                                        size={17}
                                    />
                                    <span>
                                        {viewingJob.department ||
                                            "Department not specified"}
                                    </span>
                                </div>

                                <div>
                                    <MapPin
                                        size={17}
                                    />
                                    <span>
                                        {viewingJob.location ||
                                            "Location not specified"}
                                    </span>
                                </div>

                                <div>
                                    <Briefcase
                                        size={17}
                                    />
                                    <span>
                                        {viewingJob.employmentType}
                                    </span>
                                </div>

                                <div>
                                    <Users
                                        size={17}
                                    />
                                    <span>
                                        {viewingJob.vacancies}
                                        {" "}
                                        vacancies
                                    </span>
                                </div>

                                <div>
                                    <CalendarDays
                                        size={17}
                                    />
                                    <span>
                                        Deadline:
                                        {" "}
                                        {formatDate(
                                            viewingJob.applicationDeadline
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <IndianRupee
                                        size={17}
                                    />
                                    <span>
                                        {formatSalary(
                                            viewingJob
                                        )}
                                    </span>
                                </div>

                            </div>


                            <div className="job-view-status">

                                <span
                                    className={`job-status-badge ${getStatusClass(
                                        viewingJob.status
                                    )}`}
                                >
                                    {viewingJob.status}
                                </span>

                            </div>


                            <JobViewSection
                                title="Description"
                                content={
                                    viewingJob.description
                                }
                            />


                            <JobViewList
                                title="Responsibilities"
                                items={
                                    viewingJob.responsibilities
                                }
                            />


                            <JobViewList
                                title="Requirements"
                                items={
                                    viewingJob.requirements
                                }
                            />


                            <JobViewList
                                title="Skills"
                                items={
                                    viewingJob.skills
                                }
                                tags
                            />

                        </div>


                        <div className="job-modal-footer">

                            <button
                                type="button"
                                className="job-cancel-button"
                                onClick={
                                    closeViewModal
                                }
                            >
                                Close
                            </button>


                            <button
                                type="button"
                                className="job-save-button"
                                onClick={() => {

                                    closeViewModal();

                                    handleEdit(
                                        viewingJob
                                    );

                                }}
                            >

                                <Edit3
                                    size={17}
                                />

                                Edit Job

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};


// =========================================================
// VIEW SECTION
// =========================================================

const JobViewSection = ({
    title,
    content,
}) => {

    if (!content) {
        return null;
    }

    return (

        <section className="job-view-section">

            <h3>
                {title}
            </h3>

            <p>
                {content}
            </p>

        </section>

    );

};


// =========================================================
// VIEW LIST
// =========================================================

const JobViewList = ({
    title,
    items = [],
    tags = false,
}) => {

    if (!items.length) {
        return null;
    }

    return (

        <section className="job-view-section">

            <h3>
                {title}
            </h3>


            {tags ? (

                <div className="job-view-tags">

                    {items.map(
                        (
                            item,
                            index
                        ) => (

                            <span
                                key={
                                    `${item}-${index}`
                                }
                            >
                                {item}
                            </span>

                        )
                    )}

                </div>

            ) : (

                <ul>

                    {items.map(
                        (
                            item,
                            index
                        ) => (

                            <li
                                key={
                                    `${item}-${index}`
                                }
                            >
                                {item}
                            </li>

                        )
                    )}

                </ul>

            )}

        </section>

    );

};


// =========================================================
// FILE TEXT ICON
// =========================================================

const FileTextIcon = () => (

    <div className="inline-form-icon">
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >

            <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />

            <polyline
                points="14 2 14 8 20 8"
            />

            <line
                x1="16"
                y1="13"
                x2="8"
                y2="13"
            />

            <line
                x1="16"
                y1="17"
                x2="8"
                y2="17"
            />

            <polyline
                points="10 9 9 9 8 9"
            />

        </svg>
    </div>

);


export default AdminJobManagement;