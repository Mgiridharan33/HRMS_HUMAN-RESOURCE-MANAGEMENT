import {
    useEffect,
    useState,
} from "react";

import {
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    Eye,
    FileText,
    Loader2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    getMyApplications,
} from "../../services/jobApplicationApi";

import "../../Styles/CandidateApplications.css";


const CandidateApplications = () => {

    const navigate =
        useNavigate();


    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD
    // =========================================================

    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getMyApplications();


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    "Unable to load applications"
                );

            }


            setApplications(
                Array.isArray(
                    response.applications
                )
                    ? response.applications
                    : []
            );

        } catch (error) {

            console.error(
                "LOAD APPLICATIONS ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load applications"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadApplications();

    }, []);


    // =========================================================
    // DATE
    // =========================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
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
    // STATUS
    // =========================================================

    const getStatusClass = (
        status
    ) => {

        const normalized =
            String(
                status || ""
            )
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


        return `application-status status-${normalized}`;

    };


    // =========================================================
    // JOB NAME
    // =========================================================

    const getJobTitle = (
        application
    ) => {

        if (
            typeof application.job ===
            "object"
        ) {

            return (
                application.job.title ||
                "Job"
            );

        }


        return (
            application.jobTitle ||
            "Job Application"
        );

    };


    return (

        <div className="candidate-applications">

            <div className="applications-header">

                <div>

                    <span>
                        APPLICATION TRACKER
                    </span>

                    <h1>
                        My Applications
                    </h1>

                    <p>
                        Track the jobs you have
                        applied for and monitor
                        their progress.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={
                        loadApplications
                    }
                    disabled={
                        loading
                    }
                >

                    <RefreshCw
                        size={17}
                    />

                    Refresh

                </button>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="applications-state">

                    <Loader2
                        size={30}
                        className="spin"
                    />

                    <p>
                        Loading applications...
                    </p>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (

                <div className="applications-state">

                    <AlertCircle
                        size={34}
                    />

                    <h3>
                        Unable to load applications
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            loadApplications
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                applications.length === 0 && (

                <div className="applications-state">

                    <FileText
                        size={42}
                    />

                    <h3>
                        No Applications Yet
                    </h3>

                    <p>
                        You have not applied for
                        any jobs yet.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/jobs")
                        }
                    >
                        Browse Jobs
                    </button>

                </div>

            )}


            {/* =================================================
                APPLICATIONS
            ================================================= */}

            {!loading &&
                !error &&
                applications.length > 0 && (

                <div className="applications-list">

                    {applications.map(
                        (
                            application
                        ) => (

                        <article
                            className="application-card"
                            key={
                                application._id
                            }
                        >

                            <div className="application-icon">

                                <BriefcaseBusiness
                                    size={23}
                                />

                            </div>


                            <div className="application-main">

                                <div className="application-top">

                                    <div>

                                        <h2>
                                            {getJobTitle(
                                                application
                                            )}
                                        </h2>

                                        <span>
                                            Application ID:{" "}
                                            {String(
                                                application._id
                                            ).slice(
                                                -8
                                            )}
                                        </span>

                                    </div>


                                    <span
                                        className={
                                            getStatusClass(
                                                application.status
                                            )
                                        }
                                    >
                                        {application.status ||
                                            "Pending"}
                                    </span>

                                </div>


                                <div className="application-meta">

                                    <span>

                                        <CalendarDays
                                            size={15}
                                        />

                                        Applied{" "}

                                        {formatDate(
                                            application.createdAt
                                        )}

                                    </span>


                                    {application.updatedAt && (

                                        <span>

                                            <Clock3
                                                size={15}
                                            />

                                            Updated{" "}

                                            {formatDate(
                                                application.updatedAt
                                            )}

                                        </span>

                                    )}

                                </div>

                            </div>


                            <button
                                type="button"
                                className="view-application"
                                onClick={() =>
                                    navigate(
                                        `/applications/${application._id}`
                                    )
                                }
                            >

                                <Eye
                                    size={17}
                                />

                                View

                            </button>

                        </article>

                    ))}

                </div>

            )}

        </div>

    );

};


export default CandidateApplications;