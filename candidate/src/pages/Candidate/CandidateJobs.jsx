import {
    useEffect,
    useState,
} from "react";

import {
    BriefcaseBusiness,
    MapPin,
    Clock3,
    Search,
    ArrowRight,
    Loader2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getPublishedJobs,
} from "../../services/jobApi";

import "../../Styles/CandidateJobs.css";


const CandidateJobs = () => {

    const navigate =
        useNavigate();


    const [jobs, setJobs] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");


    // =========================================================
    // LOAD JOBS
    // =========================================================

    const loadJobs = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getPublishedJobs();


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to load jobs"
                );

            }


            setJobs(
                Array.isArray(
                    response.jobs
                )
                    ? response.jobs
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD JOBS ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load jobs"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadJobs();

    }, []);


    // =========================================================
    // FILTER
    // =========================================================

    const filteredJobs =
        jobs.filter((job) => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            if (!keyword) {
                return true;
            }


            return (

                String(
                    job.title || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(
                    job.department || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(
                    job.designation || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(
                    job.location || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                (
                    Array.isArray(
                        job.skills
                    )
                        ? job.skills
                        : []
                )
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)

            );

        });


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "Open until filled";
        }


        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

    };


    // =========================================================
    // SALARY
    // =========================================================

    const formatSalary = (
        job
    ) => {

        const min =
            job.salaryMin;

        const max =
            job.salaryMax;


        if (
            min === null ||
            min === undefined
        ) {

            if (
                max === null ||
                max === undefined
            ) {

                return "Salary not disclosed";

            }

        }


        const currency =
            job.salaryCurrency ||
            "INR";


        const formatter =
            new Intl.NumberFormat(
                "en-IN",
                {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                }
            );


        if (
            min !== null &&
            min !== undefined &&
            max !== null &&
            max !== undefined
        ) {

            return `${formatter.format(min)} - ${formatter.format(max)}`;

        }


        if (
            min !== null &&
            min !== undefined
        ) {

            return `From ${formatter.format(min)}`;

        }


        return `Up to ${formatter.format(max)}`;

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="candidate-jobs">

            <div className="candidate-jobs-header">

                <div>

                    <span className="page-eyebrow">
                        CAREER OPPORTUNITIES
                    </span>

                    <h1>
                        Find Your Next Job
                    </h1>

                    <p>
                        Explore our latest openings
                        and find a role that matches
                        your skills and experience.
                    </p>

                </div>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="jobs-search">

                <Search
                    size={19}
                />

                <input
                    type="text"
                    placeholder="Search jobs, departments, skills or locations..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="jobs-state">

                    <Loader2
                        size={30}
                        className="spin"
                    />

                    <p>
                        Loading available jobs...
                    </p>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (

                <div className="jobs-state jobs-error">

                    <AlertCircle
                        size={30}
                    />

                    <h3>
                        Unable to load jobs
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadJobs}
                    >

                        <RefreshCw
                            size={17}
                        />

                        Try Again

                    </button>

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                filteredJobs.length === 0 && (

                <div className="jobs-state">

                    <BriefcaseBusiness
                        size={40}
                    />

                    <h3>
                        No jobs found
                    </h3>

                    <p>
                        {search
                            ? "Try another search keyword."
                            : "There are currently no published jobs available."
                        }
                    </p>

                </div>

            )}


            {/* =================================================
                JOBS
            ================================================= */}

            {!loading &&
                !error &&
                filteredJobs.length > 0 && (

                <div className="jobs-list">

                    {filteredJobs.map(
                        (job) => (

                        <article
                            className="job-card"
                            key={job._id}
                        >

                            <div className="job-card-main">

                                <div className="job-icon">

                                    <BriefcaseBusiness
                                        size={25}
                                    />

                                </div>


                                <div className="job-card-content">

                                    <h2>
                                        {job.title}
                                    </h2>

                                    <div className="job-meta">

                                        {job.department && (

                                            <span>
                                                {job.department}
                                            </span>

                                        )}

                                        {job.location && (

                                            <span>

                                                <MapPin
                                                    size={15}
                                                />

                                                {job.location}

                                            </span>

                                        )}

                                        {job.employmentType && (

                                            <span>

                                                <Clock3
                                                    size={15}
                                                />

                                                {job.employmentType}

                                            </span>

                                        )}

                                    </div>


                                    <p className="job-description">

                                        {job.description?.length >
                                        180

                                            ? `${job.description.substring(
                                                0,
                                                180
                                            )}...`

                                            : job.description}

                                    </p>


                                    {Array.isArray(
                                        job.skills
                                    ) &&
                                        job.skills.length > 0 && (

                                        <div className="job-skills">

                                            {job.skills
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                    <span
                                                        key={`${skill}-${index}`}
                                                    >
                                                        {skill}
                                                    </span>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            </div>


                            <div className="job-card-side">

                                <strong>
                                    {formatSalary(
                                        job
                                    )}
                                </strong>


                                <span className="job-deadline">

                                    Deadline:{" "}

                                    {formatDate(
                                        job.applicationDeadline
                                    )}

                                </span>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/jobs/${job._id}`
                                        )
                                    }
                                >

                                    View Job

                                    <ArrowRight
                                        size={17}
                                    />

                                </button>

                            </div>

                        </article>

                        )
                    )}

                </div>

            )}

        </div>

    );

};


export default CandidateJobs;