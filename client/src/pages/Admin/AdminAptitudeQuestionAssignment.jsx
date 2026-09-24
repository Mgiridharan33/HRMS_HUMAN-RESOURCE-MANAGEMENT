import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    RefreshCw,
    Eye,
    X,
    UserRound,
    Mail,
    Phone,
    BriefcaseBusiness,
    CalendarDays,
    Users,
    UserPlus,
    UserCheck,
    Clock3,
    CheckCircle2,
    AlertCircle,
    FileText,
    Send,
    Check,
    XCircle,
    ChevronDown,
    Copy,
    Plus,
    Database,
} from "lucide-react";

import {
    getAptitudeEligibleApplications,
    getAptitudeEmployees,
    getAptitudeAssignments,
    assignEmployeeForAptitude,
    getAssignmentQuestionsForAdmin,
    approveAptitudeAssignment,
    rejectAptitudeAssignment,
    getReusableAptitudeQuestionSets,
    reuseAptitudeQuestions,
} from "../../services/aptitudeQuestionAssignmentApi";

import "../Admin/css/AdminAptitudeQuestionAssignment.css";


const DEFAULT_SUMMARY = {
    total: 0,
    unassigned: 0,
    assigned: 0,
    inProgress: 0,
    submitted: 0,
    rejected: 0,
    approved: 0,
    sentToHR: 0,
};


const AdminAptitudeQuestionAssignment = () => {

    // =========================================================
    // DATA
    // =========================================================

    const [
        applications,
        setApplications,
    ] = useState([]);

    const [
        assignments,
        setAssignments,
    ] = useState([]);

    const [
        employees,
        setEmployees,
    ] = useState([]);

    const [
        reusableQuestionSets,
        setReusableQuestionSets,
    ] = useState([]);


    // =========================================================
    // UI
    // =========================================================

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
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    const [
        selectedApplication,
        setSelectedApplication,
    ] = useState(null);

    const [
        selectedAssignment,
        setSelectedAssignment,
    ] = useState(null);

    const [
        questions,
        setQuestions,
    ] = useState([]);

    const [
        selectedEmployee,
        setSelectedEmployee,
    ] = useState("");

    const [
        questionCount,
        setQuestionCount,
    ] = useState(20);

    const [
        loadingEmployees,
        setLoadingEmployees,
    ] = useState(false);

    const [
        assigning,
        setAssigning,
    ] = useState(false);

    const [
        loadingQuestions,
        setLoadingQuestions,
    ] = useState(false);

    const [
        processing,
        setProcessing,
    ] = useState(false);

    const [
        rejectionReason,
        setRejectionReason,
    ] = useState("");


    // =========================================================
    // QUESTION SOURCE
    // =========================================================

    /*
     * null
     *      Nothing selected yet
     *
     * "new"
     *      Create new questions
     *
     * "existing"
     *      Reuse existing questions
     */

    const [
        questionMode,
        setQuestionMode,
    ] = useState(null);


    const [
        selectedReusableSet,
        setSelectedReusableSet,
    ] = useState("");

    const [
        loadingReusableSets,
        setLoadingReusableSets,
    ] = useState(false);

    const [
        reusing,
        setReusing,
    ] = useState(false);


    // =========================================================
    // LOAD MAIN DATA
    // =========================================================

    const loadData = useCallback(
        async (
            showLoader = true
        ) => {

            try {

                if (showLoader) {

                    setLoading(true);

                } else {

                    setRefreshing(true);

                }

                setError("");


                const [
                    applicationResponse,
                    assignmentResponse,
                ] = await Promise.all([

                    getAptitudeEligibleApplications({
                        search:
                            search.trim(),
                    }),

                    getAptitudeAssignments(),

                ]);


                setApplications(
                    Array.isArray(
                        applicationResponse?.applications
                    )
                        ? applicationResponse.applications
                        : []
                );


                setAssignments(
                    Array.isArray(
                        assignmentResponse?.assignments
                    )
                        ? assignmentResponse.assignments
                        : []
                );

            } catch (requestError) {

                console.error(
                    "LOAD ADMIN APTITUDE DATA ERROR:",
                    requestError
                );


                setError(
                    requestError?.response?.data?.message ||
                    requestError?.message ||
                    "Unable to load aptitude assignment data"
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [
            search,
        ]
    );


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadData();

    }, [
        loadData,
    ]);


    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

    const loadEmployees = async () => {

        try {

            setLoadingEmployees(true);


            const response =
                await getAptitudeEmployees();


            setEmployees(
                Array.isArray(
                    response?.employees
                )
                    ? response.employees
                    : []
            );

        } catch (requestError) {

            console.error(
                "LOAD APTITUDE EMPLOYEES ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                "Failed to load employees"
            );

        } finally {

            setLoadingEmployees(false);

        }

    };


    // =========================================================
    // GET APPLICATION JOB ID
    // =========================================================

    const getApplicationJobId = (
        application
    ) => {

        if (!application) {

            return null;

        }


        if (
            typeof application.job ===
            "object"
        ) {

            return (
                application.job?._id ||
                null
            );

        }


        return (
            application.job ||
            null
        );

    };


    // =========================================================
    // LOAD REUSABLE QUESTION SETS
    // =========================================================

    const loadReusableQuestionSets = async (
        application
    ) => {

        const jobId =
            getApplicationJobId(
                application
            );


        if (!jobId) {

            setReusableQuestionSets([]);

            setQuestionMode("new");

            return;

        }


        try {

            setLoadingReusableSets(true);


            const response =
                await getReusableAptitudeQuestionSets({

                    jobId,

                    excludeApplicationId:
                        application._id,

                });


            const sets =
                Array.isArray(
                    response?.questionSets
                )
                    ? response.questionSets
                    : Array.isArray(
                        response?.sets
                    )
                        ? response.sets
                        : [];


            setReusableQuestionSets(
                sets
            );


            /*
             * IMPORTANT:
             *
             * Brand-new job or job without
             * approved previous questions.
             *
             * Only NEW QUESTIONS is available.
             */

            if (
                sets.length === 0
            ) {

                setQuestionMode("new");

            } else {

                /*
                 * Do not automatically select
                 * existing questions.
                 *
                 * Admin must explicitly choose.
                 */

                setQuestionMode(null);

            }

        } catch (requestError) {

            console.error(
                "LOAD REUSABLE APTITUDE QUESTIONS ERROR:",
                requestError
            );


            /*
             * If reusable-question endpoint
             * fails, safely fall back to
             * creating new questions.
             */

            setReusableQuestionSets([]);

            setQuestionMode("new");

        } finally {

            setLoadingReusableSets(false);

        }

    };


    // =========================================================
    // ASSIGNMENT MAP
    // =========================================================

    const assignmentMap =
        useMemo(() => {

            const map =
                new Map();


            assignments.forEach(
                assignment => {

                    if (
                        assignment?.jobApplication
                    ) {

                        const id =
                            typeof assignment.jobApplication ===
                            "object"
                                ? assignment.jobApplication._id
                                : assignment.jobApplication;


                        if (id) {

                            map.set(
                                String(id),
                                assignment
                            );

                        }

                    }

                }
            );


            return map;

        }, [
            assignments,
        ]);


    // =========================================================
    // DISPLAY APPLICATIONS
    // =========================================================

    const displayApplications =
        useMemo(() => {

            let result =
                applications.map(
                    application => ({

                        ...application,

                        aptitudeAssignment:
                            assignmentMap.get(
                                String(
                                    application._id
                                )
                            ) || null,

                    })
                );


            if (
                statusFilter !== "All"
            ) {

                result =
                    result.filter(
                        application => {

                            const assignment =
                                application.aptitudeAssignment;


                            if (
                                statusFilter ===
                                "Unassigned"
                            ) {

                                return !assignment;

                            }


                            return (
                                assignment?.status ===
                                statusFilter
                            );

                        }
                    );

            }


            return result;

        }, [
            applications,
            assignmentMap,
            statusFilter,
        ]);


    // =========================================================
    // SUMMARY
    // =========================================================

    const summary =
        useMemo(() => {

            const value = {
                ...DEFAULT_SUMMARY,
            };


            value.total =
                applications.length;


            applications.forEach(
                application => {

                    const assignment =
                        assignmentMap.get(
                            String(
                                application._id
                            )
                        );


                    if (!assignment) {

                        value.unassigned++;

                        return;

                    }


                    switch (
                        assignment.status
                    ) {

                        case "Assigned":

                            value.assigned++;

                            break;


                        case "InProgress":

                            value.inProgress++;

                            break;


                        case "Submitted":

                            value.submitted++;

                            break;


                        case "Rejected":

                            value.rejected++;

                            break;


                        case "Approved":

                            value.approved++;

                            break;


                        case "SentToHR":

                            value.sentToHR++;

                            break;


                        default:

                            break;

                    }

                }
            );


            return value;

        }, [
            applications,
            assignmentMap,
        ]);


    // =========================================================
    // OPEN APPLICATION
    // =========================================================

    const openApplication = async (
        application
    ) => {

        setSelectedApplication(
            application
        );


        setSelectedAssignment(
            application.aptitudeAssignment ||
            null
        );


        setQuestions([]);

        setRejectionReason("");

        setSelectedEmployee("");

        setSelectedReusableSet("");

        setReusableQuestionSets([]);

        setQuestionMode(null);


        if (
            application.aptitudeAssignment
        ) {

            await loadQuestions(
                application.aptitudeAssignment._id
            );

            return;

        }


        /*
         * Application has no assignment.
         *
         * Load employees and reusable
         * question sets.
         */

        await Promise.all([

            loadEmployees(),

            loadReusableQuestionSets(
                application
            ),

        ]);

    };


    // =========================================================
    // LOAD ASSIGNMENT QUESTIONS
    // =========================================================

    const loadQuestions = async (
        assignmentId
    ) => {

        if (!assignmentId) {

            return;

        }


        try {

            setLoadingQuestions(true);


            const response =
                await getAssignmentQuestionsForAdmin(
                    assignmentId
                );


            setQuestions(
                Array.isArray(
                    response?.questions
                )
                    ? response.questions
                    : []
            );

        } catch (requestError) {

            console.error(
                "LOAD ADMIN APTITUDE QUESTIONS ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                "Failed to load questions"
            );

        } finally {

            setLoadingQuestions(false);

        }

    };


    // =========================================================
    // SELECT NEW QUESTION MODE
    // =========================================================

    const selectNewQuestionMode = () => {

        setQuestionMode("new");

        setSelectedReusableSet("");

    };


    // =========================================================
    // SELECT EXISTING QUESTION MODE
    // =========================================================

    const selectExistingQuestionMode = () => {

        if (
            reusableQuestionSets.length === 0
        ) {

            alert(
                "No reusable aptitude question set is available for this job."
            );

            return;

        }


        setQuestionMode("existing");

    };


    // =========================================================
    // ASSIGN EMPLOYEE FOR NEW QUESTIONS
    // =========================================================

    const handleAssignEmployee = async () => {

        if (
            !selectedApplication?._id
        ) {

            return;

        }


        if (
            questionMode !== "new"
        ) {

            alert(
                "Please select Create New Questions first."
            );

            return;

        }


        if (
            !selectedEmployee
        ) {

            alert(
                "Please select an employee"
            );

            return;

        }


        const count =
            Number(
                questionCount
            );


        if (
            !Number.isInteger(count) ||
            count < 1
        ) {

            alert(
                "Enter a valid question count"
            );

            return;

        }


        const confirmed =
            window.confirm(
                `Create NEW aptitude questions for this candidate?\n\nEmployee: ${getEmployeeName(
                    employees.find(
                        employee =>
                            String(employee._id) ===
                            String(selectedEmployee)
                    )
                )}\n\nRequired questions: ${count}`
            );


        if (!confirmed) {

            return;

        }


        try {

            setAssigning(true);


            const response =
                await assignEmployeeForAptitude({

                    jobApplicationId:
                        selectedApplication._id,

                    employeeId:
                        selectedEmployee,

                    requiredQuestionCount:
                        count,

                });


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to assign employee"
                );

            }


            setSelectedAssignment(
                response.assignment
            );


            setSelectedEmployee("");

            setQuestionMode(null);

            setSelectedReusableSet("");


            await loadData(false);


            alert(
                "Employee assigned successfully. New aptitude questions can now be created."
            );

        } catch (requestError) {

            console.error(
                "ASSIGN APTITUDE EMPLOYEE ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to assign employee"
            );

        } finally {

            setAssigning(false);

        }

    };


    // =========================================================
    // REUSE EXISTING QUESTIONS
    // =========================================================

    const handleReuseExistingQuestions = async () => {

        if (
            !selectedApplication?._id
        ) {

            return;

        }


        if (
            questionMode !== "existing"
        ) {

            alert(
                "Please select Use Existing Questions first."
            );

            return;

        }


        if (
            !selectedReusableSet
        ) {

            alert(
                "Please select an existing question set"
            );

            return;

        }


        /*
         * Employee is required by the
         * current backend API.
         */

        if (
            !selectedEmployee
        ) {

            alert(
                "Please select an employee before reusing the questions."
            );

            return;

        }


        const selectedSet =
            reusableQuestionSets.find(
                item =>
                    String(item._id) ===
                    String(selectedReusableSet)
            );


        if (!selectedSet) {

            alert(
                "Selected question set could not be found"
            );

            return;

        }


        const count =
            Number(
                selectedSet.questionCount ||
                selectedSet.questions?.length ||
                0
            );


        const confirmed =
            window.confirm(
                `Use the existing aptitude question set?\n\nQuestions: ${count}\n\nThe original question set will remain unchanged. A new assignment will be created for this candidate.`
            );


        if (!confirmed) {

            return;

        }


        try {

            setReusing(true);


            const response =
                await reuseAptitudeQuestions({

                    jobApplicationId:
                        selectedApplication._id,

                    sourceAssignmentId:
                        selectedReusableSet,

                    employeeId:
                        selectedEmployee,

                });


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to reuse questions"
                );

            }


            const newAssignment =
                response.assignment;


            setSelectedAssignment(
                newAssignment
            );


            setSelectedReusableSet("");

            setSelectedEmployee("");

            setQuestionMode(null);


            await loadData(false);


            if (
                newAssignment?._id
            ) {

                await loadQuestions(
                    newAssignment._id
                );

            }


            alert(
                "Existing aptitude questions reused successfully."
            );

        } catch (requestError) {

            console.error(
                "REUSE APTITUDE QUESTIONS ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to reuse aptitude questions"
            );

        } finally {

            setReusing(false);

        }

    };


    // =========================================================
    // APPROVE
    // =========================================================

    const handleApprove = async () => {

        if (
            !selectedAssignment?._id ||
            processing
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "Approve these aptitude questions and send them to the accepted HR?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setProcessing(true);


            const response =
                await approveAptitudeAssignment(
                    selectedAssignment._id
                );


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to approve questions"
                );

            }


            setSelectedAssignment(
                response.assignment
            );


            await loadData(false);


            alert(
                "Questions approved and sent to HR"
            );

        } catch (requestError) {

            console.error(
                "APPROVE APTITUDE ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to approve questions"
            );

        } finally {

            setProcessing(false);

        }

    };


    // =========================================================
    // REJECT
    // =========================================================

    const handleReject = async () => {

        if (
            !selectedAssignment?._id ||
            processing
        ) {

            return;

        }


        const reason =
            rejectionReason.trim();


        if (!reason) {

            alert(
                "Please enter a rejection reason"
            );

            return;

        }


        try {

            setProcessing(true);


            const response =
                await rejectAptitudeAssignment(
                    selectedAssignment._id,
                    reason
                );


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to reject questions"
                );

            }


            setSelectedAssignment(
                response.assignment
            );


            setRejectionReason("");


            await loadData(false);


            alert(
                "Questions rejected and returned to employee"
            );

        } catch (requestError) {

            console.error(
                "REJECT APTITUDE ERROR:",
                requestError
            );


            alert(
                requestError?.response?.data?.message ||
                requestError?.message ||
                "Failed to reject questions"
            );

        } finally {

            setProcessing(false);

        }

    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        setSelectedApplication(null);

        setSelectedAssignment(null);

        setQuestions([]);

        setSelectedEmployee("");

        setSelectedReusableSet("");

        setReusableQuestionSets([]);

        setQuestionMode(null);

        setRejectionReason("");

        setProcessing(false);

        setAssigning(false);

        setReusing(false);

    };


    // =========================================================
    // HELPERS
    // =========================================================

    const formatDate = (
        value
    ) => {

        if (!value) {

            return "-";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

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


    const formatDateTime = (
        value
    ) => {

        if (!value) {

            return "-";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    const getCandidateName = (
        application
    ) => {

        return (
            application?.candidateName ||
            application?.candidate?.name ||
            "Unknown Candidate"
        );

    };


    const getCandidateEmail = (
        application
    ) => {

        return (
            application?.candidateEmail ||
            application?.candidate?.email ||
            "No email"
        );

    };


    const getJobTitle = (
        application
    ) => {

        return (
            application?.jobTitle ||
            application?.job?.title ||
            "Unknown Job"
        );

    };


    const getEmployeeName = (
        employee
    ) => {

        if (!employee) {

            return "Not Assigned";

        }


        const name =
            [
                employee.firstName,
                employee.lastName,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();


        return (
            name ||
            employee.name ||
            employee.email ||
            "Employee"
        );

    };


    const getAssignmentStatus = (
        application
    ) => {

        const assignment =
            application?.aptitudeAssignment;


        if (!assignment) {

            return {
                text: "Not Assigned",
                className: "unassigned",
            };

        }


        return {

            text:
                assignment.status ||
                "Assigned",

            className:
                String(
                    assignment.status ||
                    "Assigned"
                )
                    .toLowerCase()
                    .replace(
                        /[^a-z]+/g,
                        "-"
                    ),

        };

    };


    const getReusableSetEmployee = (
        questionSet
    ) => {

        return (
            questionSet?.assignedEmployee ||
            questionSet?.employee ||
            questionSet?.createdByEmployee ||
            null
        );

    };


    const getReusableSetJob = (
        questionSet
    ) => {

        return (
            questionSet?.job?.title ||
            questionSet?.jobTitle ||
            getJobTitle(
                selectedApplication
            )
        );

    };


    const getQuestionText = (
        question
    ) => {

        return (
            question?.question ||
            question?.questionText ||
            question?.text ||
            "Question"
        );

    };


    const getQuestionCorrectAnswer = (
        question
    ) => {

        if (
            typeof question?.correctAnswer ===
            "number"
        ) {

            return question.correctAnswer;

        }


        if (
            typeof question?.correctOption ===
            "number"
        ) {

            return question.correctOption;

        }


        return null;

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-aptitude-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="aptitude-page-header">

                <div>

                    <span className="aptitude-eyebrow">
                        RECRUITMENT • APTITUDE
                    </span>

                    <h1>
                        Aptitude Question Assignment
                    </h1>

                    <p>
                        Assign employees to create new aptitude
                        questions or reuse an approved question set
                        from an existing application for the same job.
                    </p>

                </div>


                <button
                    type="button"
                    className="aptitude-refresh-button"
                    onClick={() =>
                        loadData(false)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "aptitude-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="aptitude-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <section className="aptitude-summary-grid">

                <div className="aptitude-summary-card">

                    <div className="aptitude-summary-icon">
                        <Users size={21} />
                    </div>

                    <span>
                        HR Accepted
                    </span>

                    <strong>
                        {summary.total}
                    </strong>

                </div>


                <div className="aptitude-summary-card">

                    <div className="aptitude-summary-icon unassigned">
                        <UserPlus size={21} />
                    </div>

                    <span>
                        Need Assignment
                    </span>

                    <strong>
                        {summary.unassigned}
                    </strong>

                </div>


                <div className="aptitude-summary-card">

                    <div className="aptitude-summary-icon progress">
                        <Clock3 size={21} />
                    </div>

                    <span>
                        In Progress
                    </span>

                    <strong>
                        {summary.inProgress}
                    </strong>

                </div>


                <div className="aptitude-summary-card">

                    <div className="aptitude-summary-icon submitted">
                        <FileText size={21} />
                    </div>

                    <span>
                        Submitted
                    </span>

                    <strong>
                        {summary.submitted}
                    </strong>

                </div>


                <div className="aptitude-summary-card">

                    <div className="aptitude-summary-icon approved">
                        <CheckCircle2 size={21} />
                    </div>

                    <span>
                        Sent to HR
                    </span>

                    <strong>
                        {summary.sentToHR}
                    </strong>

                </div>

            </section>


            {/* =====================================================
                TOOLBAR
            ===================================================== */}

            <section className="aptitude-toolbar">

                <div className="aptitude-search">

                    <Search size={18} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search candidate, email, job..."
                    />


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >

                            <X size={15} />

                        </button>

                    )}

                </div>


                <div className="aptitude-filter">

                    <span>
                        Assignment
                    </span>

                    <div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Unassigned">
                                Not Assigned
                            </option>

                            <option value="Assigned">
                                Assigned
                            </option>

                            <option value="InProgress">
                                In Progress
                            </option>

                            <option value="Submitted">
                                Submitted
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>

                            <option value="SentToHR">
                                Sent to HR
                            </option>

                        </select>

                        <ChevronDown size={15} />

                    </div>

                </div>

            </section>


            {/* =====================================================
                APPLICATION TABLE
            ===================================================== */}

            <section className="aptitude-table-card">

                <div className="aptitude-table-header">

                    <div>

                        <h2>
                            HR Accepted Candidate Applications
                        </h2>

                        <span>
                            {displayApplications.length}
                            {" "}
                            candidate(s)
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="aptitude-loading">

                        <RefreshCw
                            size={30}
                            className="aptitude-spin"
                        />

                        <p>
                            Loading accepted applications...
                        </p>

                    </div>

                ) : displayApplications.length === 0 ? (

                    <div className="aptitude-empty">

                        <div>
                            <Users size={30} />
                        </div>

                        <h3>
                            No HR-accepted applications
                        </h3>

                        <p>
                            Candidates will appear here after
                            HR accepts their applications.
                        </p>

                    </div>

                ) : (

                    <div className="aptitude-table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Candidate
                                    </th>

                                    <th>
                                        Job
                                    </th>

                                    <th>
                                        Contact
                                    </th>

                                    <th>
                                        HR
                                    </th>

                                    <th>
                                        Accepted
                                    </th>

                                    <th>
                                        Question Workflow
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {displayApplications.map(
                                    application => {

                                        const status =
                                            getAssignmentStatus(
                                                application
                                            );


                                        const assignment =
                                            application.aptitudeAssignment;


                                        return (

                                            <tr
                                                key={
                                                    application._id
                                                }
                                            >

                                                {/* Candidate */}

                                                <td>

                                                    <div className="aptitude-candidate-cell">

                                                        <div className="aptitude-avatar">

                                                            {
                                                                application.candidateProfileImage ||
                                                                application.candidate?.profileImage
                                                                    ? (

                                                                        <img
                                                                            src={
                                                                                application.candidateProfileImage ||
                                                                                application.candidate?.profileImage
                                                                            }
                                                                            alt=""
                                                                        />

                                                                    ) : (

                                                                        <UserRound
                                                                            size={19}
                                                                        />

                                                                    )
                                                            }

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    getCandidateName(
                                                                        application
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    getCandidateEmail(
                                                                        application
                                                                    )
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Job */}

                                                <td>

                                                    <div className="aptitude-job-cell">

                                                        <BriefcaseBusiness
                                                            size={17}
                                                        />

                                                        <div>

                                                            <strong>
                                                                {
                                                                    getJobTitle(
                                                                        application
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    application.jobDepartment ||
                                                                    application.job?.department ||
                                                                    "—"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Contact */}

                                                <td>

                                                    <div className="aptitude-contact-cell">

                                                        <span>

                                                            <Mail
                                                                size={13}
                                                            />

                                                            {
                                                                getCandidateEmail(
                                                                    application
                                                                )
                                                            }

                                                        </span>


                                                        {application.candidatePhone && (

                                                            <span>

                                                                <Phone
                                                                    size={13}
                                                                />

                                                                {
                                                                    application.candidatePhone
                                                                }

                                                            </span>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* HR */}

                                                <td>

                                                    <div className="aptitude-hr-cell">

                                                        <UserCheck
                                                            size={15}
                                                        />

                                                        <div>

                                                            <strong>
                                                                {
                                                                    application.acceptedByHR?.name ||
                                                                    "HR"
                                                                }
                                                            </strong>

                                                            <span>
                                                                Accepted
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Accepted */}

                                                <td>

                                                    <span className="aptitude-date-cell">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {
                                                            formatDate(
                                                                application.acceptedByHRAt
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                {/* Workflow */}

                                                <td>

                                                    <div className="aptitude-status-cell">

                                                        <span
                                                            className={`aptitude-status ${status.className}`}
                                                        >
                                                            {
                                                                status.text
                                                            }
                                                        </span>


                                                        {assignment?.assignedEmployee && (

                                                            <small>

                                                                <UserCheck
                                                                    size={12}
                                                                />

                                                                {
                                                                    getEmployeeName(
                                                                        assignment.assignedEmployee
                                                                    )
                                                                }

                                                            </small>

                                                        )}


                                                        {assignment?.questionSource ===
                                                            "Reused" && (

                                                            <small>

                                                                <Copy
                                                                    size={12}
                                                                />

                                                                Existing Questions

                                                            </small>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* Action */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="aptitude-view-button"
                                                        onClick={() =>
                                                            openApplication(
                                                                application
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =====================================================
                MODAL
            ===================================================== */}

            {selectedApplication && (

                <div
                    className="aptitude-modal-overlay"
                    onClick={
                        closeModal
                    }
                >

                    <div
                        className="aptitude-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="aptitude-modal-header">

                            <div>

                                <span>
                                    APTITUDE WORKFLOW
                                </span>

                                <h2>
                                    {
                                        getCandidateName(
                                            selectedApplication
                                        )
                                    }
                                </h2>

                                <p>
                                    {
                                        getJobTitle(
                                            selectedApplication
                                        )
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <div className="aptitude-modal-body">

                            {/* =================================================
                                CANDIDATE INFORMATION
                            ================================================= */}

                            <section className="aptitude-detail-section">

                                <h3>

                                    <UserRound size={18} />

                                    Candidate Information

                                </h3>


                                <div className="aptitude-detail-grid">

                                    <div>

                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {
                                                getCandidateName(
                                                    selectedApplication
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                getCandidateEmail(
                                                    selectedApplication
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidatePhone ||
                                                selectedApplication.candidate?.phone ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Education
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateEducation ||
                                                selectedApplication.candidate?.education ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Experience
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.candidateExperience ||
                                                selectedApplication.candidate?.experience ||
                                                "Not provided"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Department
                                        </span>

                                        <strong>
                                            {
                                                selectedApplication.jobDepartment ||
                                                selectedApplication.job?.department ||
                                                "—"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =================================================
                                HR INFORMATION
                            ================================================= */}

                            <section className="aptitude-detail-section">

                                <h3>

                                    <UserCheck size={18} />

                                    Accepted HR

                                </h3>


                                <div className="aptitude-hr-detail">

                                    <strong>
                                        {
                                            selectedApplication.acceptedByHR?.name ||
                                            "HR"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            selectedApplication.acceptedByHR?.email ||
                                            ""
                                        }
                                    </span>

                                </div>

                            </section>


                            {/* =================================================
                                NO ASSIGNMENT
                            ================================================= */}

                            {!selectedAssignment && (

                                <>

                                    {/* =============================================
                                        QUESTION SOURCE
                                    ============================================= */}

                                    <section className="aptitude-assignment-section">

                                        <div className="aptitude-section-title">

                                            <div>

                                                <h3>

                                                    <FileText
                                                        size={19}
                                                    />

                                                    Question Source

                                                </h3>

                                                <p>
                                                    Choose whether this candidate
                                                    should receive a new aptitude
                                                    question set or reuse an
                                                    existing approved set from
                                                    the same job.
                                                </p>

                                            </div>

                                        </div>


                                        {loadingReusableSets ? (

                                            <div className="aptitude-question-loading">

                                                <RefreshCw
                                                    size={20}
                                                    className="aptitude-spin"
                                                />

                                                Checking existing aptitude
                                                question sets for this job...

                                            </div>

                                        ) : (

                                            <div className="aptitude-source-options">

                                                {/* =================================
                                                    CREATE NEW
                                                ================================= */}

                                                <button
                                                    type="button"
                                                    className={
                                                        `aptitude-source-card ${
                                                            questionMode === "new"
                                                                ? "active"
                                                                : ""
                                                        }`
                                                    }
                                                    onClick={
                                                        selectNewQuestionMode
                                                    }
                                                >

                                                    <div className="aptitude-source-icon">

                                                        <Plus
                                                            size={21}
                                                        />

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            Create New Questions
                                                        </strong>

                                                        <span>
                                                            Assign an employee to
                                                            create a fresh question
                                                            set for this candidate.
                                                        </span>

                                                    </div>


                                                    {questionMode === "new" && (

                                                        <CheckCircle2
                                                            size={20}
                                                            className="aptitude-source-check"
                                                        />

                                                    )}

                                                </button>


                                                {/* =================================
                                                    EXISTING
                                                ================================= */}

                                                {reusableQuestionSets.length > 0 && (

                                                    <button
                                                        type="button"
                                                        className={
                                                            `aptitude-source-card ${
                                                                questionMode === "existing"
                                                                    ? "active"
                                                                    : ""
                                                            }`
                                                        }
                                                        onClick={
                                                            selectExistingQuestionMode
                                                        }
                                                    >

                                                        <div className="aptitude-source-icon existing">

                                                            <Database
                                                                size={21}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                Use Existing Questions
                                                            </strong>

                                                            <span>
                                                                Reuse an approved
                                                                aptitude question
                                                                set already created
                                                                for this same job.
                                                            </span>

                                                        </div>


                                                        {questionMode === "existing" && (

                                                            <CheckCircle2
                                                                size={20}
                                                                className="aptitude-source-check"
                                                            />

                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        )}

                                    </section>


                                    {/* =============================================
                                        CREATE NEW QUESTIONS
                                    ============================================= */}

                                    {questionMode === "new" && (

                                        <section className="aptitude-assignment-section">

                                            <div className="aptitude-section-title">

                                                <div>

                                                    <h3>

                                                        <UserPlus
                                                            size={19}
                                                        />

                                                        Assign Employee

                                                    </h3>

                                                    <p>
                                                        The selected employee will
                                                        create a completely new
                                                        aptitude question set.
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="aptitude-assignment-form">

                                                <label>

                                                    Employee

                                                    <div className="aptitude-select-wrapper">

                                                        <select
                                                            value={
                                                                selectedEmployee
                                                            }
                                                            onChange={(event) =>
                                                                setSelectedEmployee(
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                loadingEmployees ||
                                                                assigning ||
                                                                reusing
                                                            }
                                                        >

                                                            <option value="">

                                                                {loadingEmployees
                                                                    ? "Loading employees..."
                                                                    : "Select employee"
                                                                }

                                                            </option>


                                                            {employees.map(
                                                                employee => (

                                                                    <option
                                                                        key={
                                                                            employee._id
                                                                        }
                                                                        value={
                                                                            employee._id
                                                                        }
                                                                    >

                                                                        {
                                                                            getEmployeeName(
                                                                                employee
                                                                            )
                                                                        }

                                                                        {" — "}

                                                                        {
                                                                            employee.department ||
                                                                            employee.email
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

                                                        <ChevronDown
                                                            size={15}
                                                        />

                                                    </div>

                                                </label>


                                                <label>

                                                    Required Questions

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            questionCount
                                                        }
                                                        onChange={(event) =>
                                                            setQuestionCount(
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            assigning ||
                                                            reusing
                                                        }
                                                    />

                                                </label>


                                                <button
                                                    type="button"
                                                    className="aptitude-primary-button"
                                                    onClick={
                                                        handleAssignEmployee
                                                    }
                                                    disabled={
                                                        assigning ||
                                                        reusing ||
                                                        !selectedEmployee
                                                    }
                                                >

                                                    {assigning ? (

                                                        <>

                                                            <RefreshCw
                                                                size={16}
                                                                className="aptitude-spin"
                                                            />

                                                            Assigning...

                                                        </>

                                                    ) : (

                                                        <>

                                                            <Plus
                                                                size={16}
                                                            />

                                                            Create New Questions

                                                        </>

                                                    )}

                                                </button>

                                            </div>

                                        </section>

                                    )}


                                    {/* =============================================
                                        EXISTING QUESTION SET
                                    ============================================= */}

                                    {questionMode === "existing" && (

                                        <section className="aptitude-assignment-section">

                                            <div className="aptitude-section-title">

                                                <div>

                                                    <h3>

                                                        <Copy
                                                            size={19}
                                                        />

                                                        Existing Question Set

                                                    </h3>

                                                    <p>
                                                        These question sets were
                                                        already created and approved
                                                        for the same job.
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="aptitude-reusable-list">

                                                {reusableQuestionSets.map(
                                                    questionSet => {

                                                        const employee =
                                                            getReusableSetEmployee(
                                                                questionSet
                                                            );


                                                        const count =
                                                            questionSet.questionCount ||
                                                            questionSet.questions?.length ||
                                                            0;


                                                        const isSelected =
                                                            String(
                                                                selectedReusableSet
                                                            ) ===
                                                            String(
                                                                questionSet._id
                                                            );


                                                        return (

                                                            <button
                                                                type="button"
                                                                key={
                                                                    questionSet._id
                                                                }
                                                                className={
                                                                    `aptitude-reusable-card ${
                                                                        isSelected
                                                                            ? "selected"
                                                                            : ""
                                                                    }`
                                                                }
                                                                onClick={() =>
                                                                    setSelectedReusableSet(
                                                                        questionSet._id
                                                                    )
                                                                }
                                                            >

                                                                <div className="aptitude-reusable-icon">

                                                                    <Database
                                                                        size={20}
                                                                    />

                                                                </div>


                                                                <div className="aptitude-reusable-content">

                                                                    <strong>

                                                                        {
                                                                            count
                                                                        }

                                                                        {" "}
                                                                        Questions

                                                                    </strong>


                                                                    <span>

                                                                        Created by:

                                                                        {" "}

                                                                        {
                                                                            getEmployeeName(
                                                                                employee
                                                                            )
                                                                        }

                                                                    </span>


                                                                    <small>

                                                                        Job:

                                                                        {" "}

                                                                        {
                                                                            getReusableSetJob(
                                                                                questionSet
                                                                            )
                                                                        }

                                                                    </small>


                                                                    {questionSet.createdAt && (

                                                                        <small>

                                                                            Created:

                                                                            {" "}

                                                                            {
                                                                                formatDate(
                                                                                    questionSet.createdAt
                                                                                )
                                                                            }

                                                                        </small>

                                                                    )}

                                                                </div>


                                                                <div className="aptitude-reusable-select">

                                                                    {isSelected ? (

                                                                        <CheckCircle2
                                                                            size={20}
                                                                        />

                                                                    ) : (

                                                                        <div className="aptitude-radio-circle" />

                                                                    )}

                                                                </div>

                                                            </button>

                                                        );

                                                    }
                                                )}

                                            </div>


                                            {/* =================================
                                                EMPLOYEE
                                            ================================= */}

                                            <div className="aptitude-assignment-form">

                                                <label>

                                                    Employee

                                                    <div className="aptitude-select-wrapper">

                                                        <select
                                                            value={
                                                                selectedEmployee
                                                            }
                                                            onChange={(event) =>
                                                                setSelectedEmployee(
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                loadingEmployees ||
                                                                reusing
                                                            }
                                                        >

                                                            <option value="">

                                                                {loadingEmployees
                                                                    ? "Loading employees..."
                                                                    : "Select employee"
                                                                }

                                                            </option>


                                                            {employees.map(
                                                                employee => (

                                                                    <option
                                                                        key={
                                                                            employee._id
                                                                        }
                                                                        value={
                                                                            employee._id
                                                                        }
                                                                    >

                                                                        {
                                                                            getEmployeeName(
                                                                                employee
                                                                            )
                                                                        }

                                                                        {" — "}

                                                                        {
                                                                            employee.department ||
                                                                            employee.email
                                                                        }

                                                                    </option>

                                                                )
                                                            )}

                                                        </select>

                                                        <ChevronDown
                                                            size={15}
                                                        />

                                                    </div>

                                                </label>


                                                <button
                                                    type="button"
                                                    className="aptitude-primary-button"
                                                    onClick={
                                                        handleReuseExistingQuestions
                                                    }
                                                    disabled={
                                                        reusing ||
                                                        assigning ||
                                                        !selectedReusableSet ||
                                                        !selectedEmployee
                                                    }
                                                >

                                                    {reusing ? (

                                                        <>

                                                            <RefreshCw
                                                                size={16}
                                                                className="aptitude-spin"
                                                            />

                                                            Reusing...

                                                        </>

                                                    ) : (

                                                        <>

                                                            <Copy
                                                                size={16}
                                                            />

                                                            Use Existing Questions

                                                        </>

                                                    )}

                                                </button>

                                            </div>

                                        </section>

                                    )}

                                </>

                            )}


                            {/* =================================================
                                EXISTING ASSIGNMENT
                            ================================================= */}

                            {selectedAssignment && (

                                <>

                                    <section className="aptitude-detail-section">

                                        <h3>

                                            <UserCheck
                                                size={18}
                                            />

                                            Employee Assignment

                                        </h3>


                                        <div className="aptitude-assignment-summary">

                                            <div>

                                                <span>
                                                    Employee
                                                </span>

                                                <strong>
                                                    {
                                                        getEmployeeName(
                                                            selectedAssignment.assignedEmployee
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Required Questions
                                                </span>

                                                <strong>
                                                    {
                                                        selectedAssignment.requiredQuestionCount
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Created
                                                </span>

                                                <strong>
                                                    {
                                                        selectedAssignment.questionCount ||
                                                        questions.length ||
                                                        0
                                                    }

                                                    {" / "}

                                                    {
                                                        selectedAssignment.requiredQuestionCount
                                                    }

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Status
                                                </span>

                                                <strong>
                                                    {
                                                        selectedAssignment.status
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* =========================================
                                            SOURCE
                                        ========================================= */}

                                        <div className="aptitude-assignment-source">

                                            {selectedAssignment.questionSource ===
                                                "Reused" ? (

                                                <>

                                                    <Copy size={15} />

                                                    <span>
                                                        Existing approved questions
                                                        were reused for this candidate.
                                                    </span>

                                                </>

                                            ) : (

                                                <>

                                                    <Plus size={15} />

                                                    <span>
                                                        New questions were assigned
                                                        to an employee for creation.
                                                    </span>

                                                </>

                                            )}

                                        </div>

                                    </section>


                                    {/* =================================================
                                        QUESTIONS
                                    ================================================= */}

                                    <section className="aptitude-detail-section">

                                        <h3>

                                            <FileText
                                                size={18}
                                            />

                                            Questions

                                            <span className="question-count-badge">

                                                {
                                                    questions.length
                                                }

                                                {" / "}

                                                {
                                                    selectedAssignment.requiredQuestionCount
                                                }

                                            </span>

                                        </h3>


                                        {loadingQuestions ? (

                                            <div className="aptitude-question-loading">

                                                <RefreshCw
                                                    size={22}
                                                    className="aptitude-spin"
                                                />

                                                Loading questions...

                                            </div>

                                        ) : questions.length === 0 ? (

                                            <div className="aptitude-no-questions">

                                                <Clock3
                                                    size={22}
                                                />

                                                Employee has not created
                                                questions yet.

                                            </div>

                                        ) : (

                                            <div className="aptitude-question-list">

                                                {questions.map(
                                                    (
                                                        question,
                                                        index
                                                    ) => {

                                                        const correctAnswer =
                                                            getQuestionCorrectAnswer(
                                                                question
                                                            );


                                                        return (

                                                            <div
                                                                className="aptitude-question-card"
                                                                key={
                                                                    question._id ||
                                                                    index
                                                                }
                                                            >

                                                                <div className="question-number">

                                                                    Q
                                                                    {index + 1}

                                                                </div>


                                                                <div className="question-content">

                                                                    <strong>
                                                                        {
                                                                            getQuestionText(
                                                                                question
                                                                            )
                                                                        }
                                                                    </strong>


                                                                    <div className="question-options">

                                                                        {(
                                                                            question.options ||
                                                                            []
                                                                        ).map(
                                                                            (
                                                                                option,
                                                                                optionIndex
                                                                            ) => (

                                                                                <span
                                                                                    key={
                                                                                        optionIndex
                                                                                    }
                                                                                    className={
                                                                                        optionIndex ===
                                                                                        correctAnswer
                                                                                            ? "correct"
                                                                                            : ""
                                                                                    }
                                                                                >

                                                                                    {
                                                                                        String.fromCharCode(
                                                                                            65 +
                                                                                            optionIndex
                                                                                        )
                                                                                    }

                                                                                    .

                                                                                    {" "}

                                                                                    {
                                                                                        typeof option ===
                                                                                        "object"
                                                                                            ? option.text ||
                                                                                              option.label ||
                                                                                              ""
                                                                                            : option
                                                                                    }


                                                                                    {optionIndex ===
                                                                                        correctAnswer && (

                                                                                        <Check
                                                                                            size={13}
                                                                                        />

                                                                                    )}

                                                                                </span>

                                                                            )
                                                                        )}

                                                                    </div>


                                                                    <small>

                                                                        Marks:
                                                                        {" "}
                                                                        {
                                                                            question.marks ??
                                                                            1
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        )}

                                    </section>


                                    {/* =================================================
                                        ADMIN REVIEW
                                    ================================================= */}

                                    {[
                                        "Submitted",
                                        "Resubmitted",
                                    ].includes(
                                        selectedAssignment.status
                                    ) && (

                                        <section className="aptitude-review-section">

                                            <h3>

                                                <CheckCircle2
                                                    size={18}
                                                />

                                                Admin Verification

                                            </h3>


                                            <p>
                                                Verify the employee's
                                                questions. The required
                                                question count must match
                                                exactly before approval.
                                            </p>


                                            <div className="aptitude-review-actions">

                                                <button
                                                    type="button"
                                                    className="aptitude-reject-button"
                                                    onClick={
                                                        handleReject
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                >

                                                    <XCircle
                                                        size={16}
                                                    />

                                                    Reject

                                                </button>


                                                <button
                                                    type="button"
                                                    className="aptitude-approve-button"
                                                    onClick={
                                                        handleApprove
                                                    }
                                                    disabled={
                                                        processing ||
                                                        questions.length !==
                                                        Number(
                                                            selectedAssignment.requiredQuestionCount
                                                        )
                                                    }
                                                >

                                                    {processing ? (

                                                        <RefreshCw
                                                            size={16}
                                                            className="aptitude-spin"
                                                        />

                                                    ) : (

                                                        <CheckCircle2
                                                            size={16}
                                                        />

                                                    )}

                                                    Approve & Send to HR

                                                </button>

                                            </div>


                                            <textarea
                                                value={
                                                    rejectionReason
                                                }
                                                onChange={(event) =>
                                                    setRejectionReason(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="If rejecting, explain what the employee needs to improve..."
                                                disabled={
                                                    processing
                                                }
                                            />

                                        </section>

                                    )}


                                    {/* =================================================
                                        REJECTED
                                    ================================================= */}

                                    {selectedAssignment.status ===
                                        "Rejected" && (

                                        <div className="aptitude-error">

                                            <XCircle
                                                size={18}
                                            />

                                            <span>

                                                Questions were rejected.

                                                {selectedAssignment.rejectionReason && (
                                                    <>
                                                        {" "}
                                                        Reason:

                                                        {" "}

                                                        {
                                                            selectedAssignment.rejectionReason
                                                        }
                                                    </>
                                                )}

                                            </span>

                                        </div>

                                    )}


                                    {/* =================================================
                                        SENT TO HR
                                    ================================================= */}

                                    {selectedAssignment.status ===
                                        "SentToHR" && (

                                        <div className="aptitude-success-box">

                                            <Send
                                                size={19}
                                            />

                                            <div>

                                                <strong>
                                                    Questions sent to HR
                                                </strong>

                                                <span>
                                                    The accepted HR can now
                                                    review the aptitude test
                                                    and send it to the candidate.
                                                </span>

                                            </div>

                                        </div>

                                    )}


                                    {/* =================================================
                                        APPROVED
                                    ================================================= */}

                                    {selectedAssignment.status ===
                                        "Approved" && (

                                        <div className="aptitude-success-box">

                                            <CheckCircle2
                                                size={19}
                                            />

                                            <div>

                                                <strong>
                                                    Questions approved
                                                </strong>

                                                <span>
                                                    The aptitude question
                                                    assignment has been approved.
                                                </span>

                                            </div>

                                        </div>

                                    )}

                                </>

                            )}

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="aptitude-modal-footer">

                            <button
                                type="button"
                                className="aptitude-close-button"
                                onClick={
                                    closeModal
                                }
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};


export default AdminAptitudeQuestionAssignment;