import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    FileText,
    GraduationCap,
    MapPin,
    Plus,
    Save,
    Trash2,
    Users,
    X,
} from "lucide-react";

import api from "../../services/api";

import "./css/AdminJobCreate.css";

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


const INITIAL_FORM = {
    title: "",
    department: "",
    designation: "",
    location: "",
    employmentType: "Full Time",

    description: "",

    requirements: [
        "",
    ],

    responsibilities: [
        "",
    ],

    skills: [
        "",
    ],

    experience: "",

    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "INR",

    vacancies: 1,

    applicationDeadline: "",

    status: "Draft",
};


const AdminJobCreate = () => {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [
        form,
        setForm,
    ] = useState(INITIAL_FORM);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    // =========================================================
    // BASIC INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));


        if (error) {
            setError("");
        }


        if (success) {
            setSuccess("");
        }

    };


    // =========================================================
    // ARRAY FIELD CHANGE
    // =========================================================

    const handleArrayChange = (
        field,
        index,
        value
    ) => {

        setForm((previous) => {

            const updated = [
                ...previous[field],
            ];

            updated[index] = value;


            return {
                ...previous,
                [field]: updated,
            };

        });


        if (error) {
            setError("");
        }

    };


    // =========================================================
    // ADD ARRAY ITEM
    // =========================================================

    const addArrayItem = (field) => {

        setForm((previous) => ({
            ...previous,

            [field]: [
                ...previous[field],
                "",
            ],

        }));

    };


    // =========================================================
    // REMOVE ARRAY ITEM
    // =========================================================

    const removeArrayItem = (
        field,
        index
    ) => {

        setForm((previous) => {

            const updated = [
                ...previous[field],
            ];


            if (updated.length === 1) {

                updated[0] = "";

            } else {

                updated.splice(
                    index,
                    1
                );

            }


            return {
                ...previous,
                [field]: updated,
            };

        });

    };


    // =========================================================
    // NORMALIZE ARRAY
    // =========================================================

    const normalizeArray = (items) => {

        return items
            .map((item) =>
                String(item).trim()
            )
            .filter(Boolean);

    };


    // =========================================================
    // VALIDATE FORM
    // =========================================================

    const validateForm = () => {

        if (
            !form.title.trim()
        ) {

            return "Job title is required";

        }


        if (
            !form.description.trim()
        ) {

            return "Job description is required";

        }


        if (
            form.salaryMin !== "" &&
            Number.isNaN(
                Number(form.salaryMin)
            )
        ) {

            return "Invalid minimum salary";

        }


        if (
            form.salaryMax !== "" &&
            Number.isNaN(
                Number(form.salaryMax)
            )
        ) {

            return "Invalid maximum salary";

        }


        if (
            form.salaryMin !== "" &&
            form.salaryMax !== "" &&
            Number(form.salaryMin) >
            Number(form.salaryMax)
        ) {

            return (
                "Minimum salary cannot be greater than maximum salary"
            );

        }


        const vacancies =
            Number(form.vacancies);


        if (
            !Number.isInteger(vacancies) ||
            vacancies < 1
        ) {

            return "Vacancies must be at least 1";

        }


        if (
            form.applicationDeadline
        ) {

            const deadline =
                new Date(
                    form.applicationDeadline
                );


            if (
                Number.isNaN(
                    deadline.getTime()
                )
            ) {

                return "Invalid application deadline";

            }

        }


        return "";

    };


    // =========================================================
    // BUILD PAYLOAD
    // =========================================================

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
                form.salaryMin === ""
                    ? null
                    : Number(form.salaryMin),

            salaryMax:
                form.salaryMax === ""
                    ? null
                    : Number(form.salaryMax),

            salaryCurrency:
                form.salaryCurrency.trim() ||
                "INR",

            vacancies:
                Number(form.vacancies),

            applicationDeadline:
                form.applicationDeadline ||
                null,

            status:
                form.status,

        };

    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError("");
        setSuccess("");


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

            setLoading(true);


            const payload =
                buildPayload();


            const response =
                await api.post(
                    "/admin/jobs",
                    payload
                );


            if (
                response.data?.success
            ) {

                setSuccess(
                    response.data?.message ||
                    "Job created successfully"
                );


                const createdJob =
                    response.data?.job;


                /*
                 * Give the success message a moment
                 * before navigating.
                 */

                setTimeout(() => {

                    if (createdJob?._id) {

                        navigate(
                            "/super-admin/jobs",
                            {
                                state: {
                                    success:
                                        "Job created successfully",
                                    jobId:
                                        createdJob._id,
                                },
                            }
                        );

                    } else {

                        navigate(
                            "/super-admin/jobs"
                        );

                    }

                }, 700);

            } else {

                throw new Error(
                    response.data?.message ||
                    "Failed to create job"
                );

            }

        } catch (err) {

            console.error(
                "CREATE ADMIN JOB ERROR:",
                err
            );


            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to create job";


            setError(message);


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {

        navigate(
            "/super-admin/jobs"
        );

    };


    // =========================================================
    // RENDER ARRAY FIELD
    // =========================================================

    const renderArrayField = (
        field,
        title,
        description,
        placeholder,
        Icon
    ) => {

        return (
            <div className="job-form-section">

                <div className="job-section-heading">

                    <div className="job-section-heading-icon">

                        <Icon
                            size={19}
                        />

                    </div>

                    <div>

                        <h2>
                            {title}
                        </h2>

                        <p>
                            {description}
                        </p>

                    </div>

                </div>


                <div className="job-array-list">

                    {form[field].map(
                        (
                            item,
                            index
                        ) => (

                            <div
                                className="job-array-row"
                                key={`${field}-${index}`}
                            >

                                <div className="job-array-number">
                                    {index + 1}
                                </div>


                                <input
                                    type="text"
                                    value={item}
                                    placeholder={placeholder}
                                    onChange={(event) =>
                                        handleArrayChange(
                                            field,
                                            index,
                                            event.target.value
                                        )
                                    }
                                />


                                <button
                                    type="button"
                                    className="job-array-remove"
                                    onClick={() =>
                                        removeArrayItem(
                                            field,
                                            index
                                        )
                                    }
                                    title="Remove"
                                >

                                    <Trash2
                                        size={17}
                                    />

                                </button>

                            </div>

                        )
                    )}

                </div>


                <button
                    type="button"
                    className="job-add-item-button"
                    onClick={() =>
                        addArrayItem(field)
                    }
                >

                    <Plus
                        size={17}
                    />

                    Add {title.replace(/s$/, "")}

                </button>

            </div>
        );

    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="admin-job-create-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="admin-job-create-header">

                <div className="admin-job-create-header-left">

                    <button
                        type="button"
                        className="job-back-button"
                        onClick={handleCancel}
                    >

                        <ArrowLeft
                            size={19}
                        />

                        Back to Jobs

                    </button>


                    <div className="job-page-title">

                        <div className="job-page-title-icon">

                            <BriefcaseBusiness
                                size={25}
                            />

                        </div>


                        <div>

                            <h1>
                                Create New Job
                            </h1>

                            <p>
                                Create and publish a new job opportunity.
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="job-alert job-alert-error">

                    <div className="job-alert-icon">

                        <X
                            size={19}
                        />

                    </div>


                    <div>

                        <strong>
                            Unable to create job
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>

            )}


            {success && (

                <div className="job-alert job-alert-success">

                    <div className="job-alert-icon">

                        <CheckCircle2
                            size={19}
                        />

                    </div>


                    <div>

                        <strong>
                            Success
                        </strong>

                        <p>
                            {success}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
                className="admin-job-form"
                onSubmit={handleSubmit}
            >


                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <section className="job-form-section">

                    <div className="job-section-heading">

                        <div className="job-section-heading-icon">

                            <BriefcaseBusiness
                                size={19}
                            />

                        </div>


                        <div>

                            <h2>
                                Basic Information
                            </h2>

                            <p>
                                Enter the main information about this position.
                            </p>

                        </div>

                    </div>


                    <div className="job-form-grid">


                        {/* TITLE */}

                        <div className="job-form-group job-form-full">

                            <label htmlFor="title">

                                Job Title

                                <span>
                                    *
                                </span>

                            </label>


                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. MERN Stack Developer"
                                required
                            />

                        </div>


                        {/* DEPARTMENT */}

                        <div className="job-form-group">

                            <label htmlFor="department">
                                Department
                            </label>


                            <div className="job-input-with-icon">

                                <Building2
                                    size={18}
                                />

                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={form.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Engineering"
                                />

                            </div>

                        </div>


                        {/* DESIGNATION */}

                        <div className="job-form-group">

                            <label htmlFor="designation">
                                Designation
                            </label>


                            <input
                                id="designation"
                                name="designation"
                                type="text"
                                value={form.designation}
                                onChange={handleChange}
                                placeholder="e.g. Software Developer"
                            />

                        </div>


                        {/* LOCATION */}

                        <div className="job-form-group">

                            <label htmlFor="location">
                                Location
                            </label>


                            <div className="job-input-with-icon">

                                <MapPin
                                    size={18}
                                />

                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Chennai / Remote"
                                />

                            </div>

                        </div>


                        {/* EMPLOYMENT TYPE */}

                        <div className="job-form-group">

                            <label htmlFor="employmentType">
                                Employment Type
                            </label>


                            <div className="job-select-wrapper">

                                <select
                                    id="employmentType"
                                    name="employmentType"
                                    value={form.employmentType}
                                    onChange={handleChange}
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
                                    size={18}
                                />

                            </div>

                        </div>


                        {/* EXPERIENCE */}

                        <div className="job-form-group">

                            <label htmlFor="experience">
                                Experience
                            </label>


                            <div className="job-input-with-icon">

                                <GraduationCap
                                    size={18}
                                />

                                <input
                                    id="experience"
                                    name="experience"
                                    type="text"
                                    value={form.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 1-3 years"
                                />

                            </div>

                        </div>


                        {/* VACANCIES */}

                        <div className="job-form-group">

                            <label htmlFor="vacancies">

                                Vacancies

                                <span>
                                    *
                                </span>

                            </label>


                            <div className="job-input-with-icon">

                                <Users
                                    size={18}
                                />

                                <input
                                    id="vacancies"
                                    name="vacancies"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.vacancies}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <section className="job-form-section">

                    <div className="job-section-heading">

                        <div className="job-section-heading-icon">

                            <FileText
                                size={19}
                            />

                        </div>


                        <div>

                            <h2>
                                Job Description
                            </h2>

                            <p>
                                Explain the role and what the successful candidate will do.
                            </p>

                        </div>

                    </div>


                    <div className="job-form-group">

                        <label htmlFor="description">

                            Description

                            <span>
                                *
                            </span>

                        </label>


                        <textarea
                            id="description"
                            name="description"
                            rows="8"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the role, team, goals and expectations..."
                            required
                        />

                        <div className="job-character-count">

                            {form.description.length}
                            {" "}
                            characters

                        </div>

                    </div>

                </section>


                {/* =================================================
                    REQUIREMENTS
                ================================================= */}

                {renderArrayField(
                    "requirements",
                    "Requirements",
                    "List the qualifications and requirements candidates should have.",
                    "e.g. Strong knowledge of JavaScript",
                    GraduationCap
                )}


                {/* =================================================
                    RESPONSIBILITIES
                ================================================= */}

                {renderArrayField(
                    "responsibilities",
                    "Responsibilities",
                    "List the primary responsibilities for this position.",
                    "e.g. Build and maintain React applications",
                    CheckCircle2
                )}


                {/* =================================================
                    SKILLS
                ================================================= */}

                {renderArrayField(
                    "skills",
                    "Skills",
                    "Add the technical and professional skills required.",
                    "e.g. React.js",
                    BriefcaseBusiness
                )}


                {/* =================================================
                    SALARY
                ================================================= */}

                <section className="job-form-section">

                    <div className="job-section-heading">

                        <div className="job-section-heading-icon">

                            <CircleDollarSign
                                size={19}
                            />

                        </div>


                        <div>

                            <h2>
                                Salary & Compensation
                            </h2>

                            <p>
                                Define the salary range shown to candidates.
                            </p>

                        </div>

                    </div>


                    <div className="job-form-grid">


                        {/* CURRENCY */}

                        <div className="job-form-group">

                            <label htmlFor="salaryCurrency">
                                Currency
                            </label>


                            <input
                                id="salaryCurrency"
                                name="salaryCurrency"
                                type="text"
                                value={form.salaryCurrency}
                                onChange={handleChange}
                                placeholder="INR"
                                maxLength="10"
                            />

                        </div>


                        {/* MIN */}

                        <div className="job-form-group">

                            <label htmlFor="salaryMin">
                                Minimum Salary
                            </label>


                            <div className="job-input-with-icon">

                                <CircleDollarSign
                                    size={18}
                                />

                                <input
                                    id="salaryMin"
                                    name="salaryMin"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                    placeholder="e.g. 300000"
                                />

                            </div>

                        </div>


                        {/* MAX */}

                        <div className="job-form-group">

                            <label htmlFor="salaryMax">
                                Maximum Salary
                            </label>


                            <div className="job-input-with-icon">

                                <CircleDollarSign
                                    size={18}
                                />

                                <input
                                    id="salaryMax"
                                    name="salaryMax"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                    placeholder="e.g. 600000"
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PUBLISHING
                ================================================= */}

                <section className="job-form-section">

                    <div className="job-section-heading">

                        <div className="job-section-heading-icon">

                            <CalendarDays
                                size={19}
                            />

                        </div>


                        <div>

                            <h2>
                                Publishing Settings
                            </h2>

                            <p>
                                Choose when and how this job should be available.
                            </p>

                        </div>

                    </div>


                    <div className="job-form-grid">


                        {/* DEADLINE */}

                        <div className="job-form-group">

                            <label htmlFor="applicationDeadline">
                                Application Deadline
                            </label>


                            <div className="job-input-with-icon">

                                <CalendarDays
                                    size={18}
                                />

                                <input
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    type="date"
                                    value={form.applicationDeadline}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* STATUS */}

                        <div className="job-form-group">

                            <label htmlFor="status">
                                Job Status
                            </label>


                            <div className="job-select-wrapper">

                                <select
                                    id="status"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
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
                                    size={18}
                                />

                            </div>

                        </div>

                    </div>


                    {/* STATUS INFO */}

                    <div className="job-status-info">

                        {form.status === "Published" ? (

                            <>

                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    This job will be visible to candidates immediately after creation.
                                </span>

                            </>

                        ) : form.status === "Closed" ? (

                            <>

                                <X
                                    size={18}
                                />

                                <span>
                                    This job will be created as closed and will not accept applications.
                                </span>

                            </>

                        ) : (

                            <>

                                <FileText
                                    size={18}
                                />

                                <span>
                                    Draft jobs are saved but are not visible to candidates.
                                </span>

                            </>

                        )}

                    </div>

                </section>


                {/* =================================================
                    FORM ACTIONS
                ================================================= */}

                <div className="admin-job-form-actions">

                    <button
                        type="button"
                        className="job-cancel-button"
                        onClick={handleCancel}
                        disabled={loading}
                    >

                        <X
                            size={18}
                        />

                        Cancel

                    </button>


                    <button
                        type="submit"
                        className="job-submit-button"
                        disabled={loading}
                    >

                        {loading ? (

                            <>

                                <span className="job-loading-spinner" />

                                Creating...

                            </>

                        ) : (

                            <>

                                <Save
                                    size={18}
                                />

                                Create Job

                            </>

                        )}

                    </button>

                </div>

            </form>

        </div>
    );

};


export default AdminJobCreate;