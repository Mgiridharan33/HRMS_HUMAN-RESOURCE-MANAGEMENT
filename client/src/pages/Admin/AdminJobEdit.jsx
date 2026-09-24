import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    DollarSign,
    FileText,
    Loader2,
    MapPin,
    Save,
    Trash2,
    Users,
    X,
} from "lucide-react";

import api from "../../services/api";

import "./css/AdminJobEditJob.css";


// =========================================================
// CONSTANTS
// =========================================================

const EMPLOYMENT_TYPES = [
    "Full Time",
    "Part Time",
    "Contract",
    "Internship",
    "Temporary",
];

const JOB_STATUSES = [
    "Draft",
    "Published",
    "Closed",
];


// =========================================================
// EMPTY FORM
// =========================================================

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

    isActive: true,
};


// =========================================================
// HELPERS
// =========================================================

const normalizeArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item ?? "").trim())
            .filter(Boolean);
    }

    /*
     * Also support comma-separated strings.
     * This makes the page safer if the backend
     * returns strings instead of arrays.
     */
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};


// =========================================================
// FORMAT DATE
// =========================================================

const formatDateForInput = (value) => {
    if (!value) {
        return "";
    }

    /*
     * If backend already returns YYYY-MM-DD,
     * use it directly.
     */
    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    /*
     * Use local date instead of UTC so that
     * the date input doesn't shift by one day.
     */
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =========================================================
// GET JOB FROM RESPONSE
// =========================================================

const extractJobFromResponse = (response) => {
    const data = response?.data;

    if (!data) {
        return null;
    }

    /*
     * Support all common response formats:
     *
     * {
     *   job: {...}
     * }
     *
     * {
     *   data: {...}
     * }
     *
     * {...}
     */

    if (
        data.job &&
        typeof data.job === "object"
    ) {
        return data.job;
    }

    if (
        data.data &&
        typeof data.data === "object" &&
        !Array.isArray(data.data)
    ) {
        return data.data;
    }

    if (
        data._id ||
        data.id ||
        data.title
    ) {
        return data;
    }

    return null;
};


// =========================================================
// MAP JOB TO FORM
// =========================================================

const mapJobToForm = (job) => {
    return {
        title:
            job?.title ??
            "",

        department:
            job?.department ??
            "",

        designation:
            job?.designation ??
            "",

        location:
            job?.location ??
            "",

        employmentType:
            job?.employmentType ||
            "Full Time",

        description:
            job?.description ??
            "",

        requirements:
            normalizeArray(
                job?.requirements
            ),

        responsibilities:
            normalizeArray(
                job?.responsibilities
            ),

        skills:
            normalizeArray(
                job?.skills
            ),

        experience:
            job?.experience ??
            "",

        salaryMin:
            job?.salaryMin ??
            "",

        salaryMax:
            job?.salaryMax ??
            "",

        salaryCurrency:
            job?.salaryCurrency ||
            "INR",

        vacancies:
            job?.vacancies ??
            1,

        applicationDeadline:
            formatDateForInput(
                job?.applicationDeadline
            ),

        status:
            job?.status ||
            "Draft",

        isActive:
            job?.isActive !== false,
    };
};


// =========================================================
// COMPONENT
// =========================================================

const AdminJobEdit = () => {

    const {
        id,
    } = useParams();

    const navigate =
        useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [
        form,
        setForm,
    ] = useState(
        EMPTY_FORM
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    const [
        closing,
        setClosing,
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
        jobCreatedAt,
        setJobCreatedAt,
    ] = useState(null);

    const [
        jobUpdatedAt,
        setJobUpdatedAt,
    ] = useState(null);


    // =====================================================
    // JOB ID VALIDATION
    // =====================================================

    /*
     * MongoDB ObjectId validation.
     *
     * This prevents:
     *
     * /api/admin/jobs/undefined
     * /api/admin/jobs/null
     * /api/admin/jobs/:id
     *
     * from being sent to the backend.
     */

    const isValidMongoId = (value) => {
        return (
            typeof value === "string" &&
            /^[a-fA-F0-9]{24}$/.test(
                value.trim()
            )
        );
    };


    // =====================================================
    // FETCH JOB
    // =====================================================

    useEffect(() => {

        let mounted = true;

        const fetchJob = async () => {

            /*
             * IMPORTANT:
             *
             * Your route is:
             *
             * jobs/:id/edit
             *
             * Therefore `id` should contain the
             * actual MongoDB _id.
             */

            if (!id) {

                setLoading(false);

                setError(
                    "Job ID is missing from the URL."
                );

                return;
            }


            if (!isValidMongoId(id)) {

                setLoading(false);

                setError(
                    `Invalid job ID: "${id}". Please open the edit page using a valid job ID.`
                );

                console.error(
                    "ADMIN JOB EDIT: INVALID JOB ID:",
                    id
                );

                return;
            }


            try {

                setLoading(true);
                setError("");
                setSuccess("");


                console.log(
                    "ADMIN JOB EDIT: FETCHING JOB:",
                    id
                );


                const response =
                    await api.get(
                        `/admin/jobs/${encodeURIComponent(id)}`
                    );


                console.log(
                    "ADMIN JOB EDIT: FETCH RESPONSE:",
                    response?.data
                );


                const job =
                    extractJobFromResponse(
                        response
                    );


                if (!job) {

                    throw new Error(
                        "Job information was not returned by the server."
                    );

                }


                if (!mounted) {
                    return;
                }


                setForm(
                    mapJobToForm(
                        job
                    )
                );


                setJobCreatedAt(
                    job.createdAt ??
                    null
                );


                setJobUpdatedAt(
                    job.updatedAt ??
                    null
                );

            } catch (err) {

                console.error(
                    "FETCH JOB ERROR:",
                    err
                );


                if (!mounted) {
                    return;
                }


                const backendMessage =
                    err?.response?.data?.message;


                const backendError =
                    err?.response?.data?.error;


                let message =
                    backendMessage ||
                    backendError ||
                    err?.message ||
                    "Failed to load job.";


                /*
                 * Make the common 400 case clearer.
                 */

                if (
                    err?.response?.status === 400
                ) {

                    message =
                        backendMessage ||
                        "The server rejected this job ID. Make sure the URL contains the actual MongoDB job _id.";

                }


                setError(
                    message
                );

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };


        fetchJob();


        return () => {
            mounted = false;
        };

    }, [id]);


    // =====================================================
    // BASIC INPUT HANDLER
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            })
        );


        setError("");
        setSuccess("");

    };


    // =====================================================
    // ARRAY FIELD HELPERS
    // =====================================================

    const addArrayItem = (
        field
    ) => {

        setForm(
            (previous) => ({
                ...previous,

                [field]: [
                    ...(previous[field] || []),
                    "",
                ],
            })
        );

    };


    const updateArrayItem = (
        field,
        index,
        value
    ) => {

        setForm(
            (previous) => {

                const updated = [
                    ...(previous[field] || []),
                ];


                updated[index] =
                    value;


                return {
                    ...previous,
                    [field]: updated,
                };

            }
        );


        setError("");
        setSuccess("");

    };


    const removeArrayItem = (
        field,
        index
    ) => {

        setForm(
            (previous) => {

                const updated = [
                    ...(previous[field] || []),
                ];


                updated.splice(
                    index,
                    1
                );


                return {
                    ...previous,
                    [field]: updated,
                };

            }
        );

    };


    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        if (!form.title.trim()) {

            return "Job title is required.";

        }


        if (!form.description.trim()) {

            return "Job description is required.";

        }


        const salaryMin =
            form.salaryMin === "" ||
            form.salaryMin === null
                ? null
                : Number(
                    form.salaryMin
                );


        const salaryMax =
            form.salaryMax === "" ||
            form.salaryMax === null
                ? null
                : Number(
                    form.salaryMax
                );


        if (
            salaryMin !== null &&
            Number.isNaN(salaryMin)
        ) {

            return (
                "Minimum salary must be a valid number."
            );

        }


        if (
            salaryMax !== null &&
            Number.isNaN(salaryMax)
        ) {

            return (
                "Maximum salary must be a valid number."
            );

        }


        if (
            salaryMin !== null &&
            salaryMin < 0
        ) {

            return (
                "Minimum salary cannot be negative."
            );

        }


        if (
            salaryMax !== null &&
            salaryMax < 0
        ) {

            return (
                "Maximum salary cannot be negative."
            );

        }


        if (
            salaryMin !== null &&
            salaryMax !== null &&
            salaryMin > salaryMax
        ) {

            return (
                "Minimum salary cannot be greater than maximum salary."
            );

        }


        const vacancies =
            Number(
                form.vacancies
            );


        if (
            !Number.isInteger(
                vacancies
            ) ||
            vacancies < 1
        ) {

            return (
                "Vacancies must be at least 1."
            );

        }


        if (
            form.applicationDeadline
        ) {

            const deadline =
                new Date(
                    `${form.applicationDeadline}T00:00:00`
                );


            if (
                Number.isNaN(
                    deadline.getTime()
                )
            ) {

                return (
                    "Invalid application deadline."
                );

            }

        }


        if (
            !JOB_STATUSES.includes(
                form.status
            )
        ) {

            return (
                "Invalid job status."
            );

        }


        if (
            !EMPLOYMENT_TYPES.includes(
                form.employmentType
            )
        ) {

            return (
                "Invalid employment type."
            );

        }


        return null;

    };


    // =====================================================
    // BUILD PAYLOAD
    // =====================================================

    const buildPayload = () => {

        return {

            title:
                form.title.trim(),

            department:
                form.department.trim(),

            designation:
                form.designation.trim(),

            location:
                form.location.trim(),

            employmentType:
                form.employmentType,

            description:
                form.description.trim(),

            requirements:
                normalizeArray(
                    form.requirements
                ),

            responsibilities:
                normalizeArray(
                    form.responsibilities
                ),

            skills:
                normalizeArray(
                    form.skills
                ),

            experience:
                form.experience.trim(),

            salaryMin:
                form.salaryMin === "" ||
                form.salaryMin === null
                    ? null
                    : Number(
                        form.salaryMin
                    ),

            salaryMax:
                form.salaryMax === "" ||
                form.salaryMax === null
                    ? null
                    : Number(
                        form.salaryMax
                    ),

            salaryCurrency:
                form.salaryCurrency.trim() ||
                "INR",

            vacancies:
                Number(
                    form.vacancies
                ),

            applicationDeadline:
                form.applicationDeadline ||
                null,

            status:
                form.status,

            isActive:
                Boolean(
                    form.isActive
                ),

        };

    };


    // =====================================================
    // UPDATE JOB
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setError("");
        setSuccess("");


        if (!isValidMongoId(id)) {

            setError(
                "Cannot update this job because the job ID is invalid."
            );

            return;
        }


        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });


            return;

        }


        try {

            setSaving(true);


            const payload =
                buildPayload();


            console.log(
                "ADMIN JOB EDIT: UPDATE ID:",
                id
            );


            console.log(
                "ADMIN JOB EDIT: UPDATE PAYLOAD:",
                payload
            );


            const response =
                await api.put(
                    `/admin/jobs/${encodeURIComponent(id)}`,
                    payload
                );


            console.log(
                "ADMIN JOB EDIT: UPDATE RESPONSE:",
                response?.data
            );


            const updatedJob =
                extractJobFromResponse(
                    response
                );


            if (updatedJob) {

                setForm(
                    mapJobToForm(
                        updatedJob
                    )
                );


                setJobCreatedAt(
                    updatedJob.createdAt ??
                    jobCreatedAt
                );


                setJobUpdatedAt(
                    updatedJob.updatedAt ??
                    new Date().toISOString()
                );

            } else {

                setJobUpdatedAt(
                    new Date().toISOString()
                );

            }


            setSuccess(
                response?.data?.message ||
                "Job updated successfully."
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } catch (err) {

            console.error(
                "UPDATE JOB ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to update job."
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // CLOSE JOB
    // =====================================================

    const handleCloseJob = async () => {

        if (!isValidMongoId(id)) {

            setError(
                "Cannot close this job because the job ID is invalid."
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to close this job? Applications will no longer be accepted."
            );


        if (!confirmed) {
            return;
        }


        try {

            setClosing(true);

            setError("");
            setSuccess("");


            const response =
                await api.patch(
                    `/admin/jobs/${encodeURIComponent(id)}/close`
                );


            console.log(
                "CLOSE JOB RESPONSE:",
                response?.data
            );


            const closedJob =
                extractJobFromResponse(
                    response
                );


            setForm(
                (previous) => ({
                    ...previous,

                    status:
                        closedJob?.status ||
                        "Closed",

                    isActive:
                        closedJob?.isActive ??
                        false,
                })
            );


            setSuccess(
                response?.data?.message ||
                "Job closed successfully."
            );


            setJobUpdatedAt(
                closedJob?.updatedAt ||
                new Date().toISOString()
            );

        } catch (err) {

            console.error(
                "CLOSE JOB ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to close job."
            );

        } finally {

            setClosing(false);

        }

    };


    // =====================================================
    // DELETE JOB
    // =====================================================

    const handleDeleteJob = async () => {

        if (!isValidMongoId(id)) {

            setError(
                "Cannot delete this job because the job ID is invalid."
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to permanently delete this job? This action cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeleting(true);

            setError("");
            setSuccess("");


            const response =
                await api.delete(
                    `/admin/jobs/${encodeURIComponent(id)}`
                );


            window.alert(
                response?.data?.message ||
                "Job deleted successfully."
            );


            navigate(
                "/super-admin/jobs",
                {
                    replace: true,
                }
            );

        } catch (err) {

            console.error(
                "DELETE JOB ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to delete job."
            );


            setDeleting(false);

        }

    };


    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {

        navigate(
            "/super-admin/jobs"
        );

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-job-edit-page">

                <div className="admin-job-edit-loading">

                    <Loader2
                        size={34}
                        className="spin"
                    />

                    <p>
                        Loading job...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-job-edit-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-job-edit-header">

                <div className="admin-job-edit-header-left">

                    <button
                        type="button"
                        className="admin-job-back-button"
                        onClick={handleBack}
                    >

                        <ArrowLeft
                            size={19}
                        />

                    </button>


                    <div>

                        <div className="admin-job-breadcrumb">

                            Admin

                            <span>
                                /
                            </span>

                            Jobs

                            <span>
                                /
                            </span>

                            Edit

                        </div>


                        <h1>
                            Edit Job
                        </h1>


                        <p>
                            Update job information,
                            requirements and
                            publishing status.
                        </p>

                    </div>

                </div>


                <div className="admin-job-header-actions">

                    <button
                        type="button"
                        className="admin-job-secondary-button"
                        onClick={handleBack}
                        disabled={
                            saving ||
                            deleting ||
                            closing
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="admin-job-primary-button"
                        onClick={() =>
                            document
                                .getElementById(
                                    "admin-job-edit-form"
                                )
                                ?.requestSubmit()
                        }
                        disabled={
                            saving ||
                            deleting ||
                            closing
                        }
                    >

                        {saving ? (

                            <Loader2
                                size={18}
                                className="spin"
                            />

                        ) : (

                            <Save
                                size={18}
                            />

                        )}

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </div>


            {/* =================================================
                INVALID ID INFORMATION
            ================================================= */}

            {!isValidMongoId(id) && (

                <div className="admin-job-alert admin-job-alert-error">

                    <X
                        size={19}
                    />

                    <span>
                        Invalid job ID in the URL:
                        {" "}
                        <strong>
                            {id || "missing"}
                        </strong>
                    </span>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Back
                    </button>

                </div>

            )}


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="admin-job-alert admin-job-alert-error">

                    <X
                        size={19}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Close error"
                    >
                        <X
                            size={16}
                        />
                    </button>

                </div>

            )}


            {success && (

                <div className="admin-job-alert admin-job-alert-success">

                    <CheckCircle2
                        size={19}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        aria-label="Close success"
                    >
                        <X
                            size={16}
                        />
                    </button>

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
                id="admin-job-edit-form"
                className="admin-job-edit-form"
                onSubmit={handleSubmit}
            >


                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <BriefcaseBusiness
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                Core information
                                about this job.
                            </p>

                        </div>

                    </div>


                    <div className="admin-job-form-grid">


                        <div className="admin-job-field admin-job-field-full">

                            <label>
                                Job Title
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. MERN Stack Developer"
                                required
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                placeholder="e.g. Engineering"
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Designation
                            </label>

                            <input
                                type="text"
                                name="designation"
                                value={form.designation}
                                onChange={handleChange}
                                placeholder="e.g. Software Developer"
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Location
                            </label>

                            <div className="admin-job-input-icon">

                                <MapPin
                                    size={17}
                                />

                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Madurai"
                                />

                            </div>

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Employment Type
                            </label>

                            <div className="admin-job-select-wrapper">

                                <select
                                    name="employmentType"
                                    value={
                                        form.employmentType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    {EMPLOYMENT_TYPES.map(
                                        (type) => (

                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>

                                        )
                                    )}

                                </select>

                                <ChevronDown
                                    size={17}
                                />

                            </div>

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Experience
                            </label>

                            <input
                                type="text"
                                name="experience"
                                value={form.experience}
                                onChange={handleChange}
                                placeholder="e.g. 1-3 years"
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Vacancies
                            </label>

                            <div className="admin-job-input-icon">

                                <Users
                                    size={17}
                                />

                                <input
                                    type="number"
                                    name="vacancies"
                                    min="1"
                                    step="1"
                                    value={
                                        form.vacancies
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <FileText
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Job Description
                            </h2>

                            <p>
                                Describe the role and
                                what the candidate will do.
                            </p>

                        </div>

                    </div>


                    <div className="admin-job-field">

                        <label>
                            Description
                            <span>*</span>
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter the complete job description..."
                            rows={8}
                            required
                        />

                    </div>

                </section>


                {/* =================================================
                    REQUIREMENTS
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <CheckCircle2
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Requirements
                            </h2>

                            <p>
                                Add the qualifications
                                required for this position.
                            </p>

                        </div>

                    </div>


                    <DynamicList
                        title="Requirements"
                        field="requirements"
                        values={
                            form.requirements
                        }
                        addItem={
                            addArrayItem
                        }
                        updateItem={
                            updateArrayItem
                        }
                        removeItem={
                            removeArrayItem
                        }
                        placeholder="e.g. Strong knowledge of React"
                    />

                </section>


                {/* =================================================
                    RESPONSIBILITIES
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <BriefcaseBusiness
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Responsibilities
                            </h2>

                            <p>
                                Add the main responsibilities
                                for this position.
                            </p>

                        </div>

                    </div>


                    <DynamicList
                        title="Responsibilities"
                        field="responsibilities"
                        values={
                            form.responsibilities
                        }
                        addItem={
                            addArrayItem
                        }
                        updateItem={
                            updateArrayItem
                        }
                        removeItem={
                            removeArrayItem
                        }
                        placeholder="e.g. Build and maintain React applications"
                    />

                </section>


                {/* =================================================
                    SKILLS
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <CheckCircle2
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Skills
                            </h2>

                            <p>
                                Add technical and
                                professional skills.
                            </p>

                        </div>

                    </div>


                    <DynamicList
                        title="Skills"
                        field="skills"
                        values={
                            form.skills
                        }
                        addItem={
                            addArrayItem
                        }
                        updateItem={
                            updateArrayItem
                        }
                        removeItem={
                            removeArrayItem
                        }
                        placeholder="e.g. JavaScript"
                    />

                </section>


                {/* =================================================
                    SALARY
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <DollarSign
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Compensation
                            </h2>

                            <p>
                                Configure the salary
                                range for this job.
                            </p>

                        </div>

                    </div>


                    <div className="admin-job-form-grid">


                        <div className="admin-job-field">

                            <label>
                                Minimum Salary
                            </label>

                            <input
                                type="number"
                                name="salaryMin"
                                min="0"
                                step="0.01"
                                value={
                                    form.salaryMin
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. 300000"
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Maximum Salary
                            </label>

                            <input
                                type="number"
                                name="salaryMax"
                                min="0"
                                step="0.01"
                                value={
                                    form.salaryMax
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. 600000"
                            />

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Currency
                            </label>

                            <input
                                type="text"
                                name="salaryCurrency"
                                value={
                                    form.salaryCurrency
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="INR"
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PUBLISHING
                ================================================= */}

                <section className="admin-job-section">

                    <div className="admin-job-section-header">

                        <div className="admin-job-section-icon">

                            <CalendarDays
                                size={21}
                            />

                        </div>

                        <div>

                            <h2>
                                Publishing
                            </h2>

                            <p>
                                Control the visibility
                                and application deadline.
                            </p>

                        </div>

                    </div>


                    <div className="admin-job-form-grid">


                        <div className="admin-job-field">

                            <label>
                                Application Deadline
                            </label>

                            <div className="admin-job-input-icon">

                                <CalendarDays
                                    size={17}
                                />

                                <input
                                    type="date"
                                    name="applicationDeadline"
                                    value={
                                        form.applicationDeadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>


                        <div className="admin-job-field">

                            <label>
                                Status
                            </label>

                            <div className="admin-job-select-wrapper">

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    {JOB_STATUSES.map(
                                        (status) => (

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
                                    size={17}
                                />

                            </div>

                        </div>


                        <div className="admin-job-field admin-job-toggle-field">

                            <label>
                                Job Active
                            </label>

                            <label className="admin-job-switch">

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={
                                        form.isActive
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span className="admin-job-switch-slider" />

                            </label>

                            <small>
                                {form.isActive
                                    ? "This job is active."
                                    : "This job is inactive."
                                }
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    JOB META
                ================================================= */}

                <section className="admin-job-meta-section">

                    <div className="admin-job-meta-item">

                        <Clock3
                            size={17}
                        />

                        <div>

                            <span>
                                Created
                            </span>

                            <strong>
                                {jobCreatedAt
                                    ? new Date(
                                        jobCreatedAt
                                    ).toLocaleString()
                                    : "—"}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-job-meta-item">

                        <Clock3
                            size={17}
                        />

                        <div>

                            <span>
                                Last Updated
                            </span>

                            <strong>
                                {jobUpdatedAt
                                    ? new Date(
                                        jobUpdatedAt
                                    ).toLocaleString()
                                    : "—"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    DANGER ZONE
                ================================================= */}

                <section className="admin-job-danger-zone">

                    <div>

                        <h2>
                            Job Actions
                        </h2>

                        <p>
                            Closing prevents new
                            applications. Deleting
                            permanently removes this job.
                        </p>

                    </div>


                    <div className="admin-job-danger-actions">


                        {form.status !== "Closed" && (

                            <button
                                type="button"
                                className="admin-job-close-button"
                                onClick={
                                    handleCloseJob
                                }
                                disabled={
                                    closing ||
                                    saving ||
                                    deleting
                                }
                            >

                                {closing ? (

                                    <Loader2
                                        size={17}
                                        className="spin"
                                    />

                                ) : (

                                    <X
                                        size={17}
                                    />

                                )}

                                {closing
                                    ? "Closing..."
                                    : "Close Job"}

                            </button>

                        )}


                        <button
                            type="button"
                            className="admin-job-delete-button"
                            onClick={
                                handleDeleteJob
                            }
                            disabled={
                                deleting ||
                                saving ||
                                closing
                            }
                        >

                            {deleting ? (

                                <Loader2
                                    size={17}
                                    className="spin"
                                />

                            ) : (

                                <Trash2
                                    size={17}
                                />

                            )}

                            {deleting
                                ? "Deleting..."
                                : "Delete Job"}

                        </button>

                    </div>

                </section>


                {/* =================================================
                    BOTTOM ACTIONS
                ================================================= */}

                <div className="admin-job-bottom-actions">

                    <button
                        type="button"
                        className="admin-job-secondary-button"
                        onClick={
                            handleBack
                        }
                        disabled={
                            saving ||
                            deleting ||
                            closing
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="admin-job-primary-button"
                        disabled={
                            saving ||
                            deleting ||
                            closing ||
                            !isValidMongoId(id)
                        }
                    >

                        {saving ? (

                            <Loader2
                                size={18}
                                className="spin"
                            />

                        ) : (

                            <Save
                                size={18}
                            />

                        )}

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>

    );

};


// =========================================================
// DYNAMIC LIST COMPONENT
// =========================================================

const DynamicList = ({
    title,
    field,
    values,
    addItem,
    updateItem,
    removeItem,
    placeholder,
}) => {

    return (

        <div className="admin-job-dynamic-list">

            <div className="admin-job-list-header">

                <h3>
                    {title}
                </h3>


                <button
                    type="button"
                    className="admin-job-add-button"
                    onClick={() =>
                        addItem(field)
                    }
                >
                    + Add
                </button>

            </div>


            {values.length === 0 ? (

                <div className="admin-job-empty-list">

                    <p>
                        No {title.toLowerCase()} added.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            addItem(field)
                        }
                    >
                        Add {title}
                    </button>

                </div>

            ) : (

                <div className="admin-job-list-items">

                    {values.map(
                        (
                            item,
                            index
                        ) => (

                            <div
                                className="admin-job-list-item"
                                key={`${field}-${index}`}
                            >

                                <span className="admin-job-list-number">
                                    {index + 1}
                                </span>


                                <input
                                    type="text"
                                    value={item}
                                    onChange={(event) =>
                                        updateItem(
                                            field,
                                            index,
                                            event.target.value
                                        )
                                    }
                                    placeholder={
                                        placeholder
                                    }
                                />


                                <button
                                    type="button"
                                    className="admin-job-remove-item"
                                    onClick={() =>
                                        removeItem(
                                            field,
                                            index
                                        )
                                    }
                                    aria-label={`Remove ${title} ${index + 1}`}
                                >

                                    <X
                                        size={17}
                                    />

                                </button>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );

};


export default AdminJobEdit;