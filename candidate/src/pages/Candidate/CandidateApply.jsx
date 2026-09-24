import {
    useEffect,
    useState,
} from "react";


import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    FileText,
    Loader2,
    Send,
    AlertCircle,
} from "lucide-react";


import {
    useNavigate,
    useParams,
} from "react-router-dom";


import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";


import {
    getPublishedJobById,
} from "../../services/jobApi";


import {
    applyForJob,
} from "../../services/jobApplicationApi";


import "../../Styles/CandidateApply.css";


const CandidateApply = () => {

    const {
        id,
    } = useParams();


    const navigate =
        useNavigate();


    const {
        candidate,
    } = useCandidateAuth();


    const [job, setJob] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [submitting, setSubmitting] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState(false);


    const [form, setForm] =
        useState({

            coverLetter: "",

            expectedSalary: "",

            noticePeriod: "",

            additionalMessage: "",

        });


    // =========================================================
    // LOAD JOB
    // =========================================================

    useEffect(() => {

        const loadJob = async () => {

            try {

                setLoading(true);

                setError("");


                if (!id) {

                    throw new Error(
                        "Job ID is missing"
                    );

                }


                console.log(
                    "Loading application job:",
                    id
                );


                const response =
                    await getPublishedJobById(
                        id
                    );


                console.log(
                    "JOB RESPONSE:",
                    response
                );


                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to load job"
                    );

                }


                const loadedJob =
                    response.job ||
                    response.data;


                if (!loadedJob) {

                    throw new Error(
                        "Job data not found"
                    );

                }


                setJob(
                    loadedJob
                );

            } catch (error) {

                console.error(
                    "LOAD APPLY JOB ERROR:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load job"
                );

            } finally {

                setLoading(false);

            }

        };


        loadJob();

    }, [id]);


    // =========================================================
    // INPUT
    // =========================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value,

            })
        );


        setError("");

    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (submitting) {
                return;
            }


            setError("");


            // =================================================
            // AUTH
            // =================================================

            if (!candidate) {

                setError(
                    "Candidate authentication is required. Please login again."
                );

                return;

            }


            // =================================================
            // JOB
            // =================================================

            if (!id) {

                setError(
                    "Job ID is missing."
                );

                return;

            }


            // =================================================
            // RESUME
            // =================================================

            if (
                !candidate.resume ||
                !String(
                    candidate.resume
                ).trim()
            ) {

                setError(
                    "Please upload your resume in your profile before applying."
                );

                return;

            }


            // =================================================
            // PHONE
            // =================================================

            if (
                !candidate.phone ||
                !String(
                    candidate.phone
                ).trim()
            ) {

                setError(
                    "Please add your phone number to your profile before applying."
                );

                return;

            }


            // =================================================
            // SKILLS
            // =================================================

            if (
                !Array.isArray(
                    candidate.skills
                ) ||
                candidate.skills.length === 0
            ) {

                setError(
                    "Please add at least one skill to your profile before applying."
                );

                return;

            }


            // =================================================
            // EDUCATION
            // =================================================

            if (
                !candidate.education ||
                !String(
                    candidate.education
                ).trim()
            ) {

                setError(
                    "Please add your education to your profile before applying."
                );

                return;

            }


            try {

                setSubmitting(true);


                // =================================================
                // IMPORTANT:
                // Backend expects jobId
                // =================================================

                const payload = {

                    jobId:
                        id,

                    coverLetter:
                        form.coverLetter.trim(),

                    expectedSalary:
                        form.expectedSalary
                            ? Number(
                                form.expectedSalary
                            )
                            : undefined,

                    noticePeriod:
                        form.noticePeriod.trim(),

                    additionalMessage:
                        form.additionalMessage.trim(),

                };


                console.log(
                    "================================"
                );

                console.log(
                    "SUBMIT APPLICATION"
                );

                console.log(
                    "JOB ID:",
                    id
                );

                console.log(
                    "PAYLOAD:",
                    payload
                );

                console.log(
                    "================================"
                );


                const response =
                    await applyForJob(
                        payload
                    );


                console.log(
                    "APPLICATION RESPONSE:",
                    response
                );


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        "Application failed"
                    );

                }


                setSuccess(
                    true
                );

            } catch (error) {

                console.error(
                    "APPLY JOB ERROR:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to submit application."
                );

            } finally {

                setSubmitting(false);

            }

        };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="candidate-apply-state">

                <Loader2
                    size={32}
                    className="spin"
                />

                <p>
                    Preparing application...
                </p>

            </div>

        );

    }


    // =========================================================
    // JOB ERROR
    // =========================================================

    if (!job) {

        return (

            <div className="candidate-apply-state">

                <AlertCircle
                    size={35}
                />

                <h3>
                    Job unavailable
                </h3>

                <p>
                    {error ||
                        "This job could not be loaded."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/jobs"
                        )
                    }
                >
                    Back to Jobs
                </button>

            </div>

        );

    }


    // =========================================================
    // SUCCESS
    // =========================================================

    if (success) {

        return (

            <div className="application-success-page">

                <div className="application-success-card">

                    <div className="success-icon">

                        <CheckCircle2
                            size={42}
                        />

                    </div>


                    <h1>
                        Application Submitted
                    </h1>


                    <p>

                        Your application for{" "}

                        <strong>
                            {job.title ||
                                job.jobTitle}
                        </strong>

                        {" "}has been successfully
                        submitted to our recruitment
                        team.

                    </p>


                    <div className="success-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/applications"
                                )
                            }
                        >

                            View My Applications

                            <ArrowRight
                                size={17}
                            />

                        </button>


                        <button
                            type="button"
                            className="secondary-success-button"
                            onClick={() =>
                                navigate(
                                    "/jobs"
                                )
                            }
                        >

                            Browse More Jobs

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // =========================================================
    // FORM
    // =========================================================

    return (

        <div className="candidate-apply">


            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                className="apply-back"
                onClick={() =>
                    navigate(
                        `/jobs/${id}`
                    )
                }
            >

                <ArrowLeft
                    size={17}
                />

                Back to Job

            </button>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="apply-header">

                <span>
                    JOB APPLICATION
                </span>

                <h1>
                    Apply for{" "}
                    {job.title ||
                        job.jobTitle}
                </h1>

                <p>
                    Review your profile information
                    and submit your application.
                </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="apply-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
                className="application-layout"
                onSubmit={
                    handleSubmit
                }
            >

                <main>


                    {/* =================================================
                        POSITION
                    ================================================= */}

                    <section className="apply-section">

                        <div className="apply-section-title">

                            <BriefcaseBusiness
                                size={20}
                            />

                            <div>

                                <h2>
                                    Position
                                </h2>

                                <p>
                                    You are applying for this role.
                                </p>

                            </div>

                        </div>


                        <div className="selected-job">

                            <strong>
                                {job.title ||
                                    job.jobTitle}
                            </strong>

                            <span>
                                {job.department ||
                                    "Company"}
                            </span>

                            {job.location && (

                                <span>
                                    {job.location}
                                </span>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                        CANDIDATE
                    ================================================= */}

                    <section className="apply-section">

                        <div className="apply-section-title">

                            <FileText
                                size={20}
                            />

                            <div>

                                <h2>
                                    Candidate Information
                                </h2>

                                <p>
                                    This information comes
                                    from your candidate profile.
                                </p>

                            </div>

                        </div>


                        <div className="candidate-info-grid">


                            <div>

                                <label>
                                    Full Name
                                </label>

                                <input
                                    value={
                                        candidate?.name ||
                                        ""
                                    }
                                    disabled
                                />

                            </div>


                            <div>

                                <label>
                                    Email
                                </label>

                                <input
                                    value={
                                        candidate?.email ||
                                        ""
                                    }
                                    disabled
                                />

                            </div>


                            <div>

                                <label>
                                    Phone
                                </label>

                                <input
                                    value={
                                        candidate?.phone ||
                                        ""
                                    }
                                    disabled
                                />

                            </div>


                            <div>

                                <label>
                                    Resume
                                </label>

                                <div className="resume-status">

                                    <CheckCircle2
                                        size={17}
                                    />

                                    <span>
                                        Resume uploaded
                                    </span>

                                    <a
                                        href={
                                            candidate?.resume
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View
                                    </a>

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="edit-profile-link"
                            onClick={() =>
                                navigate(
                                    "/profile"
                                )
                            }
                        >
                            Edit Profile
                        </button>

                    </section>


                    {/* =================================================
                        APPLICATION DETAILS
                    ================================================= */}

                    <section className="apply-section">

                        <div className="apply-section-title">

                            <Send
                                size={20}
                            />

                            <div>

                                <h2>
                                    Application Details
                                </h2>

                                <p>
                                    Add information specific
                                    to this application.
                                </p>

                            </div>

                        </div>


                        <div className="application-form-fields">


                            <div>

                                <label>
                                    Cover Letter
                                </label>

                                <textarea
                                    name="coverLetter"
                                    value={
                                        form.coverLetter
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Tell us why you are interested in this position..."
                                    rows={7}
                                />

                            </div>


                            <div className="candidate-info-grid">

                                <div>

                                    <label>
                                        Expected Salary
                                    </label>

                                    <input
                                        name="expectedSalary"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 500000"
                                        value={
                                            form.expectedSalary
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>


                                <div>

                                    <label>
                                        Notice Period
                                    </label>

                                    <input
                                        name="noticePeriod"
                                        placeholder="e.g. 30 days"
                                        value={
                                            form.noticePeriod
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            <div>

                                <label>
                                    Additional Message
                                </label>

                                <textarea
                                    name="additionalMessage"
                                    value={
                                        form.additionalMessage
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Anything else you would like the recruitment team to know..."
                                    rows={5}
                                />

                            </div>

                        </div>

                    </section>

                </main>


                {/* =================================================
                    SUBMIT SIDEBAR
                ================================================= */}

                <aside className="apply-sidebar">

                    <div className="submit-application-card">

                        <h2>
                            Ready to Apply?
                        </h2>

                        <p>
                            Make sure your profile and
                            resume are up to date before
                            submitting.
                        </p>


                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                        >

                            {submitting ? (

                                <>

                                    <Loader2
                                        size={18}
                                        className="spin"
                                    />

                                    Submitting...

                                </>

                            ) : (

                                <>

                                    Submit Application

                                    <ArrowRight
                                        size={18}
                                    />

                                </>

                            )}

                        </button>

                    </div>


                    <div className="application-note">

                        <CheckCircle2
                            size={18}
                        />

                        <p>
                            Your application will be
                            sent to the recruitment team
                            for review.
                        </p>

                    </div>

                </aside>

            </form>

        </div>

    );

};


export default CandidateApply;