import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    ArrowRight,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Users,
    WalletCards,
    Loader2,
    AlertCircle,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getPublishedJobById,
} from "../../services/jobApi";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import "../../Styles/CandidateJobDetails.css";


const CandidateJobDetails = () => {

    const {
        id,
    } = useParams();

    const navigate = useNavigate();

    const {
        candidate,
    } = useCandidateAuth();


    const [
        job,
        setJob,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");


    // =========================================================
    // LOAD JOB
    // =========================================================

    useEffect(() => {

        let mounted = true;


        const loadJob = async () => {

            if (!id) {

                if (mounted) {

                    setError(
                        "Invalid job ID."
                    );

                    setLoading(false);

                }

                return;

            }


            try {

                setLoading(true);

                setError("");


                console.log(
                    "CANDIDATE JOB DETAILS ID:",
                    id
                );


                const response =
                    await getPublishedJobById(
                        id
                    );


                console.log(
                    "CANDIDATE JOB DETAILS RESPONSE:",
                    response
                );


                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to load job"
                    );

                }


                if (!response.job) {

                    throw new Error(
                        "Job information was not returned by the server."
                    );

                }


                if (mounted) {

                    setJob(
                        response.job
                    );

                }

            } catch (error) {

                console.error(
                    "LOAD JOB DETAILS ERROR:",
                    error
                );


                if (mounted) {

                    setError(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Unable to load job"
                    );

                }

            } finally {

                if (mounted) {

                    setLoading(false);

                }

            }

        };


        loadJob();


        return () => {

            mounted = false;

        };

    }, [id]);


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Open until filled";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Open until filled";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );

    };


    // =========================================================
    // FORMAT SALARY
    // =========================================================

    const formatSalary = () => {

        if (!job) {

            return "Salary not disclosed";

        }


        const {
            salaryMin,
            salaryMax,
            salaryCurrency = "INR",
        } = job;


        if (
            salaryMin === null ||
            salaryMin === undefined
        ) {

            if (
                salaryMax === null ||
                salaryMax === undefined
            ) {

                return "Salary not disclosed";

            }

        }


        let formatter;


        try {

            formatter =
                new Intl.NumberFormat(
                    "en-IN",
                    {
                        style: "currency",
                        currency: salaryCurrency,
                        maximumFractionDigits: 0,
                    }
                );

        } catch {

            formatter =
                new Intl.NumberFormat(
                    "en-IN",
                    {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                    }
                );

        }


        if (
            salaryMin !== null &&
            salaryMin !== undefined &&
            salaryMax !== null &&
            salaryMax !== undefined
        ) {

            return `${formatter.format(
                salaryMin
            )} - ${formatter.format(
                salaryMax
            )}`;

        }


        if (
            salaryMin !== null &&
            salaryMin !== undefined
        ) {

            return `From ${formatter.format(
                salaryMin
            )}`;

        }


        return `Up to ${formatter.format(
            salaryMax
        )}`;

    };


    // =========================================================
    // APPLY
    // =========================================================

    const handleApply = () => {

        console.log(
            "APPLY BUTTON CLICKED"
        );

        console.log(
            "JOB ID:",
            id
        );

        console.log(
            "CANDIDATE:",
            candidate
        );


        // -----------------------------------------------------
        // NOT LOGGED IN
        // -----------------------------------------------------

        if (!candidate) {

            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/jobs/${id}/apply`,
                    },
                }
            );

            return;

        }


        // -----------------------------------------------------
        // VALID JOB ID
        // -----------------------------------------------------

        if (!id) {

            setError(
                "Invalid job ID."
            );

            return;

        }


        // -----------------------------------------------------
        // GO TO APPLICATION PAGE
        // -----------------------------------------------------

        navigate(
            `/jobs/${id}/apply`
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="job-details-state">

                <Loader2
                    size={32}
                    className="spin"
                />

                <p>
                    Loading job details...
                </p>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error || !job) {

        return (

            <div className="job-details-state">

                <AlertCircle
                    size={35}
                />

                <h3>
                    Job Not Available
                </h3>

                <p>
                    {error ||
                        "This job could not be found."}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/jobs")
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Jobs

                </button>

            </div>

        );

    }


    return (

        <div className="candidate-job-details">

            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                className="back-jobs-button"
                onClick={() =>
                    navigate("/jobs")
                }
            >

                <ArrowLeft
                    size={17}
                />

                Back to Jobs

            </button>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="job-details-hero">

                <div className="job-details-hero-icon">

                    <BriefcaseBusiness
                        size={30}
                    />

                </div>


                <div className="job-details-hero-content">

                    <span>
                        {job.department ||
                            "Career Opportunity"}
                    </span>

                    <h1>
                        {job.title}
                    </h1>


                    <div className="job-details-meta">

                        {job.location && (

                            <span>

                                <MapPin
                                    size={16}
                                />

                                {job.location}

                            </span>

                        )}


                        {job.employmentType && (

                            <span>

                                <Clock3
                                    size={16}
                                />

                                {job.employmentType}

                            </span>

                        )}


                        {job.designation && (

                            <span>

                                <BriefcaseBusiness
                                    size={16}
                                />

                                {job.designation}

                            </span>

                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="job-details-layout">

                <main className="job-details-main">


                    {/* DESCRIPTION */}

                    <section className="job-details-section">

                        <h2>
                            Job Description
                        </h2>

                        <p className="job-long-text">
                            {job.description ||
                                "No job description provided."}
                        </p>

                    </section>


                    {/* RESPONSIBILITIES */}

                    {Array.isArray(
                        job.responsibilities
                    ) &&
                        job.responsibilities.length > 0 && (

                            <section className="job-details-section">

                                <h2>
                                    Responsibilities
                                </h2>

                                <ul className="job-bullet-list">

                                    {job.responsibilities.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <li
                                                key={index}
                                            >

                                                <CheckCircle2
                                                    size={17}
                                                />

                                                <span>
                                                    {item}
                                                </span>

                                            </li>

                                        )
                                    )}

                                </ul>

                            </section>

                        )}


                    {/* REQUIREMENTS */}

                    {Array.isArray(
                        job.requirements
                    ) &&
                        job.requirements.length > 0 && (

                            <section className="job-details-section">

                                <h2>
                                    Requirements
                                </h2>

                                <ul className="job-bullet-list">

                                    {job.requirements.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <li
                                                key={index}
                                            >

                                                <CheckCircle2
                                                    size={17}
                                                />

                                                <span>
                                                    {item}
                                                </span>

                                            </li>

                                        )
                                    )}

                                </ul>

                            </section>

                        )}


                    {/* SKILLS */}

                    {Array.isArray(
                        job.skills
                    ) &&
                        job.skills.length > 0 && (

                            <section className="job-details-section">

                                <h2>
                                    Required Skills
                                </h2>

                                <div className="details-skills">

                                    {job.skills.map(
                                        (
                                            skill,
                                            index
                                        ) => (

                                            <span
                                                key={index}
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )}

                                </div>

                            </section>

                        )}

                </main>


                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside className="job-details-sidebar">


                    {/* APPLY */}

                    <div className="apply-card">

                        <h2>
                            Interested in this role?
                        </h2>

                        <p>
                            Submit your application
                            and our recruitment team
                            will review your profile.
                        </p>


                        <button
                            type="button"
                            onClick={handleApply}
                        >

                            Apply Now

                            <ArrowRight
                                size={18}
                            />

                        </button>

                    </div>


                    {/* JOB INFORMATION */}

                    <div className="job-info-card">

                        <h3>
                            Job Information
                        </h3>


                        <div className="job-info-row">

                            <WalletCards
                                size={18}
                            />

                            <div>

                                <span>
                                    Salary
                                </span>

                                <strong>
                                    {formatSalary()}
                                </strong>

                            </div>

                        </div>


                        <div className="job-info-row">

                            <Users
                                size={18}
                            />

                            <div>

                                <span>
                                    Vacancies
                                </span>

                                <strong>
                                    {job.vacancies || 1}
                                </strong>

                            </div>

                        </div>


                        <div className="job-info-row">

                            <CalendarDays
                                size={18}
                            />

                            <div>

                                <span>
                                    Application Deadline
                                </span>

                                <strong>
                                    {formatDate(
                                        job.applicationDeadline
                                    )}
                                </strong>

                            </div>

                        </div>


                        {job.experience && (

                            <div className="job-info-row">

                                <BriefcaseBusiness
                                    size={18}
                                />

                                <div>

                                    <span>
                                        Experience
                                    </span>

                                    <strong>
                                        {job.experience}
                                    </strong>

                                </div>

                            </div>

                        )}

                    </div>

                </aside>

            </div>

        </div>

    );

};


export default CandidateJobDetails;