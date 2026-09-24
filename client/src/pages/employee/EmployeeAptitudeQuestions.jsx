import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    Info,
    Loader2,
    Mail,
    Pencil,
    Plus,
    RefreshCw,
    Send,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

import {
    getMyAptitudeAssignments,
    getMyAptitudeAssignment,
    createAptitudeQuestion,
    updateAptitudeQuestion,
    deleteAptitudeQuestion,
    submitAptitudeQuestions,
} from "../../services/employeeAptitudeApi";

import "./EmployeeAptitudeQuestions.css";


/*
=========================================================
QUESTION FORM DEFAULT
=========================================================
*/

const EMPTY_FORM = {
    question: "",
    options: ["", "", "", ""],
    correctAnswer: null,
    marks: "1",
    explanation: "",
};


/*
=========================================================
STATUS HELPERS
=========================================================
*/

const STATUS_CLASS_MAP = {

    Assigned:
        "employee-apt-status-assigned",

    InProgress:
        "employee-apt-status-progress",

    Rejected:
        "employee-apt-status-rejected",

    Resubmitted:
        "employee-apt-status-resubmitted",

    Submitted:
        "employee-apt-status-submitted",

    Approved:
        "employee-apt-status-approved",

    Pending:
        "employee-apt-status-pending",

};


const getStatusClass = (
    status
) => {

    return (
        STATUS_CLASS_MAP[status] ||
        "employee-apt-status-default"
    );

};


const isEditableStatus = (
    status
) => {

    return [
        "Assigned",
        "InProgress",
        "Rejected",
        "Resubmitted",
    ].includes(status);

};


const isSubmittedStatus = (
    status
) => {

    return [
        "Submitted",
        "Approved",
    ].includes(status);

};


/*
=========================================================
FORMAT DATE
=========================================================
*/

const formatDate = (
    value
) => {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


/*
=========================================================
GET CANDIDATE NAME
=========================================================
*/

const getCandidateName = (
    assignment
) => {

    if (
        assignment?.jobApplication
            ?.candidateName
    ) {

        return assignment
            .jobApplication
            .candidateName;

    }


    if (
        assignment?.candidate?.name
    ) {

        return assignment
            .candidate
            .name;

    }


    return "Candidate";

};


/*
=========================================================
GET CANDIDATE EMAIL
=========================================================
*/

const getCandidateEmail = (
    assignment
) => {

    return (
        assignment?.jobApplication
            ?.candidateEmail ||
        assignment?.candidate?.email ||
        "—"
    );

};


/*
=========================================================
GET JOB TITLE
=========================================================
*/

const getJobTitle = (
    assignment
) => {

    return (
        assignment?.jobApplication
            ?.jobTitle ||
        assignment?.job?.title ||
        "Aptitude Assessment"
    );

};


/*
=========================================================
GET JOB DEPARTMENT
=========================================================
*/

const getDepartment = (
    assignment
) => {

    return (
        assignment?.jobApplication
            ?.jobDepartment ||
        assignment?.job?.department ||
        "—"
    );

};


/*
=========================================================
GET LOCATION
=========================================================
*/

const getLocation = (
    assignment
) => {

    return (
        assignment?.jobApplication
            ?.jobLocation ||
        assignment?.job?.location ||
        "—"
    );

};


/*
=========================================================
MAIN COMPONENT
=========================================================
*/

const EmployeeAptitudeQuestions = () => {

    /*
    =====================================================
    ASSIGNMENTS
    =====================================================
    */

    const [
        assignments,
        setAssignments,
    ] = useState([]);


    const [
        assignmentsLoading,
        setAssignmentsLoading,
    ] = useState(true);


    const [
        assignmentsError,
        setAssignmentsError,
    ] = useState("");


    /*
    =====================================================
    SELECTED ASSIGNMENT
    =====================================================
    */

    const [
        selectedAssignmentId,
        setSelectedAssignmentId,
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
        assessmentLoading,
        setAssessmentLoading,
    ] = useState(false);


    const [
        assessmentError,
        setAssessmentError,
    ] = useState("");


    /*
    =====================================================
    QUESTION MODAL
    =====================================================
    */

    const [
        showQuestionModal,
        setShowQuestionModal,
    ] = useState(false);


    const [
        editingQuestion,
        setEditingQuestion,
    ] = useState(null);


    const [
        questionForm,
        setQuestionForm,
    ] = useState(
        EMPTY_FORM
    );


    const [
        savingQuestion,
        setSavingQuestion,
    ] = useState(false);


    const [
        formError,
        setFormError,
    ] = useState("");


    /*
    =====================================================
    DELETE
    =====================================================
    */

    const [
        deletingQuestionId,
        setDeletingQuestionId,
    ] = useState(null);


    /*
    =====================================================
    SUBMIT
    =====================================================
    */

    const [
        showSubmitModal,
        setShowSubmitModal,
    ] = useState(false);


    const [
        submitting,
        setSubmitting,
    ] = useState(false);


    /*
    =====================================================
    DELETE CONFIRMATION
    =====================================================
    */

    const [
        questionToDelete,
        setQuestionToDelete,
    ] = useState(null);


    /*
    =====================================================
    TOAST
    =====================================================
    */

    const [
        toast,
        setToast,
    ] = useState(null);


    /*
    =====================================================
    LOAD ASSIGNMENTS
    =====================================================
    */

    const loadAssignments =
        useCallback(
            async () => {

                try {

                    setAssignmentsLoading(
                        true
                    );

                    setAssignmentsError(
                        ""
                    );


                    const response =
                        await getMyAptitudeAssignments();


                    setAssignments(
                        Array.isArray(
                            response?.assignments
                        )
                            ? response.assignments
                            : []
                    );

                } catch (error) {

                    setAssignmentsError(
                        error.message ||
                        "Failed to load aptitude assignments"
                    );

                } finally {

                    setAssignmentsLoading(
                        false
                    );

                }

            },
            []
        );


    /*
    =====================================================
    LOAD SINGLE ASSESSMENT
    =====================================================
    */

    const loadAssessment =
        useCallback(
            async (
                assignmentId
            ) => {

                if (!assignmentId) {

                    return;

                }


                try {

                    setAssessmentLoading(
                        true
                    );

                    setAssessmentError(
                        ""
                    );


                    const response =
                        await getMyAptitudeAssignment(
                            assignmentId
                        );


                    setSelectedAssignment(
                        response?.assignment ||
                        null
                    );


                    setQuestions(
                        Array.isArray(
                            response?.questions
                        )
                            ? response.questions
                            : []
                    );

                } catch (error) {

                    setAssessmentError(
                        error.message ||
                        "Failed to load assessment"
                    );

                } finally {

                    setAssessmentLoading(
                        false
                    );

                }

            },
            []
        );


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(() => {

        loadAssignments();

    }, [
        loadAssignments,
    ]);


    /*
    =====================================================
    LOAD SELECTED ASSESSMENT
    =====================================================
    */

    useEffect(() => {

        if (
            selectedAssignmentId
        ) {

            loadAssessment(
                selectedAssignmentId
            );

        }

    }, [
        selectedAssignmentId,
        loadAssessment,
    ]);


    /*
    =====================================================
    TOAST AUTO CLEAR
    =====================================================
    */

    useEffect(() => {

        if (!toast) {

            return undefined;

        }


        const timer =
            window.setTimeout(
                () => {

                    setToast(
                        null
                    );

                },
                3500
            );


        return () => {

            window.clearTimeout(
                timer
            );

        };

    }, [
        toast,
    ]);


    /*
    =====================================================
    SELECT ASSIGNMENT
    =====================================================
    */

    const openAssignment = (
        assignmentId
    ) => {

        setSelectedAssignmentId(
            assignmentId
        );

        setSelectedAssignment(
            null
        );

        setQuestions([]);

        setAssessmentError("");

    };


    /*
    =====================================================
    BACK TO ASSIGNMENTS
    =====================================================
    */

    const backToAssignments = () => {

        setSelectedAssignmentId(
            null
        );

        setSelectedAssignment(
            null
        );

        setQuestions([]);

        loadAssignments();

    };


    /*
    =====================================================
    REFRESH ASSESSMENT
    =====================================================
    */

    const refreshAssessment = async () => {

        if (!selectedAssignmentId) {

            return;

        }


        await loadAssessment(
            selectedAssignmentId
        );

        await loadAssignments();

    };


    /*
    =====================================================
    PROGRESS
    =====================================================
    */

    const requiredCount =
        Number(
            selectedAssignment
                ?.requiredQuestionCount
        ) || 0;


    const questionCount =
        questions.length;


    const progress =
        requiredCount > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        questionCount /
                        requiredCount
                    ) *
                    100
                )
            )
            : 0;


    const canSubmit =
        requiredCount > 0 &&
        questionCount ===
            requiredCount;


    const editable =
        isEditableStatus(
            selectedAssignment?.status
        );


    const locked =
        isSubmittedStatus(
            selectedAssignment?.status
        );


    /*
    =====================================================
    TOTAL MARKS
    =====================================================
    */

    const totalMarks =
        useMemo(() => {

            return questions.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        (
                            Number(
                                item?.marks
                            ) || 0
                        )
                    );

                },
                0
            );

        }, [
            questions,
        ]);


    /*
    =====================================================
    OPEN CREATE MODAL
    =====================================================
    */

    const openCreateModal = () => {

        setEditingQuestion(
            null
        );

        setQuestionForm({
            ...EMPTY_FORM,
            options: [
                "",
                "",
                "",
                "",
            ],
        });

        setFormError("");

        setShowQuestionModal(
            true
        );

    };


    /*
    =====================================================
    OPEN EDIT MODAL
    =====================================================
    */

    const openEditModal = (
        question
    ) => {

        setEditingQuestion(
            question
        );


        setQuestionForm({

            question:
                question?.question ||
                "",

            options:
                Array.isArray(
                    question?.options
                )
                    ? [
                        ...question.options,
                        "",
                        "",
                        "",
                        "",
                    ].slice(
                        0,
                        4
                    )
                    : [
                        "",
                        "",
                        "",
                        "",
                    ],

            correctAnswer:
                Number.isInteger(
                    Number(
                        question?.correctAnswer
                    )
                )
                    ? Number(
                        question.correctAnswer
                    )
                    : null,

            marks:
                question?.marks !==
                    undefined
                    ? String(
                        question.marks
                    )
                    : "1",

            explanation:
                question?.explanation ||
                "",

        });


        setFormError("");

        setShowQuestionModal(
            true
        );

    };


    /*
    =====================================================
    CLOSE QUESTION MODAL
    =====================================================
    */

    const closeQuestionModal = () => {

        if (savingQuestion) {

            return;

        }


        setShowQuestionModal(
            false
        );

        setEditingQuestion(
            null
        );

        setQuestionForm(
            EMPTY_FORM
        );

        setFormError("");

    };


    /*
    =====================================================
    UPDATE QUESTION FIELD
    =====================================================
    */

    const updateQuestionField = (
        field,
        value
    ) => {

        setQuestionForm(
            (
                previous
            ) => ({

                ...previous,

                [field]:
                    value,

            })
        );

    };


    /*
    =====================================================
    UPDATE OPTION
    =====================================================
    */

    const updateOption = (
        index,
        value
    ) => {

        setQuestionForm(
            (
                previous
            ) => {

                const options = [
                    ...previous.options,
                ];

                options[index] =
                    value;


                return {

                    ...previous,

                    options,

                };

            }
        );

    };


    /*
    =====================================================
    SELECT CORRECT ANSWER
    =====================================================
    */

    const selectCorrectAnswer = (
        index
    ) => {

        setQuestionForm(
            (
                previous
            ) => ({

                ...previous,

                correctAnswer:
                    index,

            })
        );

    };


    /*
    =====================================================
    VALIDATE FORM
    =====================================================
    */

    const validateQuestionForm =
        () => {

            const question =
                String(
                    questionForm.question ||
                    ""
                ).trim();


            if (!question) {

                return "Question text is required";

            }


            if (
                !Array.isArray(
                    questionForm.options
                ) ||
                questionForm.options.length !== 4
            ) {

                return "Exactly four options are required";

            }


            const cleanedOptions =
                questionForm.options.map(
                    (
                        option
                    ) =>
                        String(
                            option || ""
                        ).trim()
                );


            if (
                cleanedOptions.some(
                    (
                        option
                    ) =>
                        !option
                )
            ) {

                return "Please fill all four options";

            }


            const duplicateOptions =
                new Set(
                    cleanedOptions.map(
                        (
                            option
                        ) =>
                            option.toLowerCase()
                    )
                ).size !==
                cleanedOptions.length;


            if (duplicateOptions) {

                return "Each option should be different";

            }


            if (
                !Number.isInteger(
                    questionForm.correctAnswer
                ) ||
                questionForm.correctAnswer <
                    0 ||
                questionForm.correctAnswer >
                    3
            ) {

                return "Please select the correct answer";

            }


            const marks =
                Number(
                    questionForm.marks
                );


            if (
                !Number.isFinite(
                    marks
                ) ||
                marks <= 0
            ) {

                return "Marks must be greater than zero";

            }


            return "";

        };


    /*
    =====================================================
    SAVE QUESTION
    =====================================================
    */

    const handleSaveQuestion =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !selectedAssignmentId
            ) {

                return;

            }


            const validationError =
                validateQuestionForm();


            if (validationError) {

                setFormError(
                    validationError
                );

                return;

            }


            const payload = {

                question:
                    String(
                        questionForm.question
                    ).trim(),

                options:
                    questionForm.options.map(
                        (
                            option
                        ) =>
                            String(
                                option
                            ).trim()
                    ),

                correctAnswer:
                    Number(
                        questionForm.correctAnswer
                    ),

                marks:
                    Number(
                        questionForm.marks
                    ),

                explanation:
                    String(
                        questionForm.explanation ||
                        ""
                    ).trim(),

            };


            try {

                setSavingQuestion(
                    true
                );

                setFormError("");


                if (
                    editingQuestion
                ) {

                    const response =
                        await updateAptitudeQuestion(
                            selectedAssignmentId,
                            editingQuestion._id,
                            payload
                        );


                    if (
                        response?.question
                    ) {

                        setQuestions(
                            (
                                previous
                            ) =>
                                previous.map(
                                    (
                                        item
                                    ) =>
                                        item._id ===
                                        editingQuestion._id
                                            ? response.question
                                            : item
                                )
                        );

                    }


                    setToast({

                        type:
                            "success",

                        message:
                            "Question updated successfully",

                    });

                } else {

                    const response =
                        await createAptitudeQuestion(
                            selectedAssignmentId,
                            payload
                        );


                    if (
                        response?.question
                    ) {

                        setQuestions(
                            (
                                previous
                            ) => [
                                ...previous,
                                response.question,
                            ]
                        );

                    }


                    setToast({

                        type:
                            "success",

                        message:
                            "Question created successfully",

                    });

                }


                setShowQuestionModal(
                    false
                );

                setEditingQuestion(
                    null
                );

                setQuestionForm(
                    EMPTY_FORM
                );


                /*
                Refresh from DB so the
                frontend always follows
                backend state.
                */

                await loadAssessment(
                    selectedAssignmentId
                );

                await loadAssignments();

            } catch (error) {

                setFormError(
                    error.message ||
                    "Failed to save question"
                );

            } finally {

                setSavingQuestion(
                    false
                );

            }

        };


    /*
    =====================================================
    REQUEST DELETE
    =====================================================
    */

    const requestDeleteQuestion = (
        question
    ) => {

        setQuestionToDelete(
            question
        );

    };


    /*
    =====================================================
    CANCEL DELETE
    =====================================================
    */

    const cancelDelete = () => {

        if (
            deletingQuestionId
        ) {

            return;

        }


        setQuestionToDelete(
            null
        );

    };


    /*
    =====================================================
    DELETE QUESTION
    =====================================================
    */

    const confirmDeleteQuestion =
        async () => {

            if (
                !questionToDelete?._id ||
                !selectedAssignmentId
            ) {

                return;

            }


            try {

                setDeletingQuestionId(
                    questionToDelete._id
                );


                const response =
                    await deleteAptitudeQuestion(
                        selectedAssignmentId,
                        questionToDelete._id
                    );


                setQuestions(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                item
                            ) =>
                                item._id !==
                                questionToDelete._id
                        )
                );


                setQuestionToDelete(
                    null
                );


                setToast({

                    type:
                        "success",

                    message:
                        response?.message ||
                        "Question deleted successfully",

                });


                await loadAssessment(
                    selectedAssignmentId
                );

                await loadAssignments();

            } catch (error) {

                setToast({

                    type:
                        "error",

                    message:
                        error.message ||
                        "Failed to delete question",

                });

            } finally {

                setDeletingQuestionId(
                    null
                );

            }

        };


    /*
    =====================================================
    REQUEST SUBMIT
    =====================================================
    */

    const requestSubmit =
        () => {

            if (!canSubmit) {

                setToast({

                    type:
                        "error",

                    message:
                        `Create exactly ${requiredCount} questions before submitting`,

                });

                return;

            }


            setShowSubmitModal(
                true
            );

        };


    /*
    =====================================================
    SUBMIT
    =====================================================
    */

    const handleSubmit =
        async () => {

            if (
                !selectedAssignmentId
            ) {

                return;

            }


            try {

                setSubmitting(
                    true
                );


                const response =
                    await submitAptitudeQuestions(
                        selectedAssignmentId
                    );


                setShowSubmitModal(
                    false
                );


                setToast({

                    type:
                        "success",

                    message:
                        response?.message ||
                        "Questions submitted successfully for Admin verification",

                });


                await loadAssessment(
                    selectedAssignmentId
                );

                await loadAssignments();

            } catch (error) {

                setToast({

                    type:
                        "error",

                    message:
                        error.message ||
                        "Failed to submit questions",

                });

            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
    =====================================================
    ASSIGNMENT CARD
    =====================================================
    */

    const renderAssignmentCard = (
        assignment
    ) => {

        const count =
            Number(
                assignment?.questionCount
            ) || 0;


        const required =
            Number(
                assignment?.requiredQuestionCount
            ) || 0;


        const cardProgress =
            required > 0
                ? Math.min(
                    100,
                    Math.round(
                        (
                            count /
                            required
                        ) *
                        100
                    )
                )
                : 0;


        const status =
            assignment?.status ||
            "Assigned";


        return (

            <button
                type="button"
                className="employee-apt-assignment-card"
                onClick={() =>
                    openAssignment(
                        assignment._id
                    )
                }
            >

                <div className="employee-apt-card-top">

                    <div className="employee-apt-card-icon">

                        <BookOpen
                            size={20}
                        />

                    </div>


                    <span
                        className={
                            `employee-apt-status ${getStatusClass(status)}`
                        }
                    >

                        {status}

                    </span>

                </div>


                <div className="employee-apt-card-content">

                    <h3>
                        {getJobTitle(
                            assignment
                        )}
                    </h3>


                    <div className="employee-apt-candidate">

                        <UserRound
                            size={15}
                        />

                        <span>
                            {getCandidateName(
                                assignment
                            )}
                        </span>

                    </div>


                    <div className="employee-apt-card-meta">

                        <span>

                            <BriefcaseBusiness
                                size={14}
                            />

                            {getDepartment(
                                assignment
                            )}

                        </span>


                        <span>

                            <CalendarDays
                                size={14}
                            />

                            {formatDate(
                                assignment.createdAt
                            )}

                        </span>

                    </div>

                </div>


                <div className="employee-apt-card-progress">

                    <div className="employee-apt-progress-header">

                        <span>
                            Questions
                        </span>

                        <strong>
                            {count} / {required}
                        </strong>

                    </div>


                    <div className="employee-apt-progress-track">

                        <div
                            className="employee-apt-progress-fill"
                            style={{
                                width:
                                    `${cardProgress}%`,
                            }}
                        />

                    </div>

                </div>


                <div className="employee-apt-card-footer">

                    <span>
                        Open assessment
                    </span>

                    <ChevronRight
                        size={18}
                    />

                </div>

            </button>

        );

    };


    /*
    =====================================================
    ASSIGNMENT LIST VIEW
    =====================================================
    */

    if (
        !selectedAssignmentId
    ) {

        return (

            <div className="employee-apt-page">

                {toast && (

                    <Toast
                        toast={toast}
                        onClose={() =>
                            setToast(null)
                        }
                    />

                )}


                <div className="employee-apt-page-header">

                    <div>

                        <div className="employee-apt-title-row">

                            <div className="employee-apt-main-icon">

                                <BookOpen
                                    size={24}
                                />

                            </div>


                            <div>

                                <h1>
                                    Aptitude Assessments
                                </h1>

                                <p>
                                    Create and submit aptitude questions assigned to you.
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="employee-apt-refresh-button"
                        onClick={
                            loadAssignments
                        }
                        disabled={
                            assignmentsLoading
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                assignmentsLoading
                                    ? "employee-apt-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>


                <div className="employee-apt-info-banner">

                    <div className="employee-apt-info-icon">

                        <Info
                            size={19}
                        />

                    </div>

                    <div>

                        <strong>
                            Assessment Question Creation
                        </strong>

                        <p>
                            Create the exact number of questions requested for each assignment.
                            Once submitted, your questions will be sent to Super Admin for verification.
                        </p>

                    </div>

                </div>


                {assignmentsError && (

                    <div className="employee-apt-error-state">

                        <AlertCircle
                            size={21}
                        />

                        <div>

                            <strong>
                                Unable to load assignments
                            </strong>

                            <p>
                                {assignmentsError}
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={
                                loadAssignments
                            }
                        >
                            Try again
                        </button>

                    </div>

                )}


                {assignmentsLoading ? (

                    <AssignmentSkeleton />

                ) : assignments.length === 0 ? (

                    <div className="employee-apt-empty-state">

                        <div className="employee-apt-empty-icon">

                            <FileText
                                size={30}
                            />

                        </div>

                        <h2>
                            No aptitude assignments
                        </h2>

                        <p>
                            You currently don't have any aptitude question assignments.
                            New assignments from HR will appear here.
                        </p>

                        <button
                            type="button"
                            className="employee-apt-primary-button"
                            onClick={
                                loadAssignments
                            }
                        >

                            <RefreshCw
                                size={17}
                            />

                            Refresh assignments

                        </button>

                    </div>

                ) : (

                    <div className="employee-apt-assignment-grid">

                        {assignments.map(
                            (
                                assignment
                            ) => (

                                <div
                                    key={
                                        assignment._id
                                    }
                                >

                                    {renderAssignmentCard(
                                        assignment
                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        );

    }


    /*
    =====================================================
    ASSESSMENT LOADING
    =====================================================
    */

    if (
        assessmentLoading &&
        !selectedAssignment
    ) {

        return (

            <div className="employee-apt-page">

                <div className="employee-apt-loading-page">

                    <Loader2
                        size={32}
                        className="employee-apt-spin"
                    />

                    <span>
                        Loading assessment...
                    </span>

                </div>

            </div>

        );

    }


    /*
    =====================================================
    ASSESSMENT ERROR
    =====================================================
    */

    if (
        assessmentError &&
        !selectedAssignment
    ) {

        return (

            <div className="employee-apt-page">

                <div className="employee-apt-error-state employee-apt-full-error">

                    <AlertCircle
                        size={24}
                    />

                    <div>

                        <strong>
                            Unable to load assessment
                        </strong>

                        <p>
                            {assessmentError}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadAssessment(
                                selectedAssignmentId
                            )
                        }
                    >
                        Try again
                    </button>


                    <button
                        type="button"
                        className="employee-apt-secondary-button"
                        onClick={
                            backToAssignments
                        }
                    >
                        Back
                    </button>

                </div>

            </div>

        );

    }


    /*
    =====================================================
    MAIN ASSESSMENT WORKSPACE
    =====================================================
    */

    return (

        <div className="employee-apt-page">

            {toast && (

                <Toast
                    toast={toast}
                    onClose={() =>
                        setToast(null)
                    }
                />

            )}


            {/* =================================================
                TOP HEADER
            ================================================= */}

            <div className="employee-apt-workspace-header">

                <button
                    type="button"
                    className="employee-apt-back-button"
                    onClick={
                        backToAssignments
                    }
                >

                    <ArrowLeft
                        size={18}
                    />

                    <span>
                        All Assessments
                    </span>

                </button>


                <div className="employee-apt-workspace-actions">

                    <button
                        type="button"
                        className="employee-apt-icon-button"
                        title="Refresh"
                        onClick={
                            refreshAssessment
                        }
                        disabled={
                            assessmentLoading
                        }
                    >

                        <RefreshCw
                            size={18}
                            className={
                                assessmentLoading
                                    ? "employee-apt-spin"
                                    : ""
                            }
                        />

                    </button>

                </div>

            </div>


            {/* =================================================
                ASSESSMENT HERO
            ================================================= */}

            <section className="employee-apt-assessment-hero">

                <div className="employee-apt-hero-main">

                    <div className="employee-apt-hero-icon">

                        <BookOpen
                            size={25}
                        />

                    </div>


                    <div>

                        <div className="employee-apt-hero-title-row">

                            <h1>
                                {getJobTitle(
                                    selectedAssignment
                                )}
                            </h1>


                            <span
                                className={
                                    `employee-apt-status ${getStatusClass(
                                        selectedAssignment?.status
                                    )}`
                                }
                            >

                                {selectedAssignment?.status ||
                                    "Assigned"}

                            </span>

                        </div>


                        <p className="employee-apt-hero-subtitle">

                            Aptitude question assessment for{" "}

                            <strong>
                                {getCandidateName(
                                    selectedAssignment
                                )}
                            </strong>

                        </p>

                    </div>

                </div>


                <div className="employee-apt-hero-stats">

                    <div className="employee-apt-stat">

                        <span>
                            Questions
                        </span>

                        <strong>
                            {questionCount} / {requiredCount}
                        </strong>

                    </div>


                    <div className="employee-apt-stat-divider" />


                    <div className="employee-apt-stat">

                        <span>
                            Total Marks
                        </span>

                        <strong>
                            {totalMarks}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                REJECTION ALERT
            ================================================= */}

            {selectedAssignment?.status ===
                "Rejected" && (

                <div className="employee-apt-rejection-banner">

                    <div className="employee-apt-rejection-icon">

                        <AlertCircle
                            size={21}
                        />

                    </div>


                    <div>

                        <strong>
                            Questions rejected by Super Admin
                        </strong>

                        <p>

                            {selectedAssignment
                                ?.rejectionReason
                                ? selectedAssignment.rejectionReason
                                : "Please review your questions, make the required changes, and resubmit them for verification."}

                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                SUBMITTED ALERT
            ================================================= */}

            {selectedAssignment?.status ===
                "Submitted" && (

                <div className="employee-apt-submitted-banner">

                    <div className="employee-apt-submitted-icon">

                        <CheckCircle2
                            size={21}
                        />

                    </div>


                    <div>

                        <strong>
                            Submitted for Super Admin verification
                        </strong>

                        <p>
                            Your aptitude questions have been submitted successfully.
                            Editing is disabled while they are under review.
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                APPROVED ALERT
            ================================================= */}

            {selectedAssignment?.status ===
                "Approved" && (

                <div className="employee-apt-approved-banner">

                    <div className="employee-apt-approved-icon">

                        <CheckCircle2
                            size={21}
                        />

                    </div>


                    <div>

                        <strong>
                            Assessment approved
                        </strong>

                        <p>
                            Your aptitude questions have been verified by Super Admin.
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                PROGRESS SECTION
            ================================================= */}

            <section className="employee-apt-progress-card">

                <div className="employee-apt-progress-heading">

                    <div>

                        <span>
                            Assessment progress
                        </span>

                        <strong>
                            {progress}%
                        </strong>

                    </div>


                    <span className="employee-apt-progress-text">

                        {questionCount} of{" "}
                        {requiredCount} questions completed

                    </span>

                </div>


                <div className="employee-apt-large-progress">

                    <div
                        className="employee-apt-large-progress-fill"
                        style={{
                            width:
                                `${progress}%`,
                        }}
                    />

                </div>


                {editable &&
                    questionCount <
                        requiredCount && (

                    <div className="employee-apt-progress-hint">

                        <Info
                            size={15}
                        />

                        <span>
                            Add {requiredCount - questionCount} more question
                            {requiredCount - questionCount !== 1
                                ? "s"
                                : ""} to submit this assessment.
                        </span>

                    </div>

                )}


                {editable &&
                    canSubmit && (

                    <div className="employee-apt-ready-hint">

                        <CheckCircle2
                            size={16}
                        />

                        <span>
                            All required questions are ready for submission.
                        </span>

                    </div>

                )}

            </section>


            {/* =================================================
                CANDIDATE / JOB DETAILS
            ================================================= */}

            <section className="employee-apt-details-card">

                <div className="employee-apt-details-title">

                    <FileText
                        size={18}
                    />

                    <h2>
                        Assessment Details
                    </h2>

                </div>


                <div className="employee-apt-details-grid">

                    <DetailItem
                        icon={
                            <UserRound
                                size={16}
                            />
                        }
                        label="Candidate"
                        value={
                            getCandidateName(
                                selectedAssignment
                            )
                        }
                    />


                    <DetailItem
                        icon={
                            <Mail
                                size={16}
                            />
                        }
                        label="Email"
                        value={
                            getCandidateEmail(
                                selectedAssignment
                            )
                        }
                    />


                    <DetailItem
                        icon={
                            <BriefcaseBusiness
                                size={16}
                            />
                        }
                        label="Department"
                        value={
                            getDepartment(
                                selectedAssignment
                            )
                        }
                    />


                    <DetailItem
                        icon={
                            <BriefcaseBusiness
                                size={16}
                            />
                        }
                        label="Location"
                        value={
                            getLocation(
                                selectedAssignment
                            )
                        }
                    />


                    <DetailItem
                        icon={
                            <CalendarDays
                                size={16}
                            />
                        }
                        label="Assigned On"
                        value={
                            formatDate(
                                selectedAssignment?.createdAt
                            )
                        }
                    />


                    <DetailItem
                        icon={
                            <Clock3
                                size={16}
                            />
                        }
                        label="Required Questions"
                        value={
                            String(
                                requiredCount
                            )
                        }
                    />

                </div>

            </section>


            {/* =================================================
                QUESTIONS HEADER
            ================================================= */}

            <div className="employee-apt-questions-heading">

                <div>

                    <h2>
                        Assessment Questions
                    </h2>

                    <p>
                        Create high-quality multiple-choice questions for this assessment.
                    </p>

                </div>


                {editable && (

                    <button
                        type="button"
                        className="employee-apt-primary-button"
                        onClick={
                            openCreateModal
                        }
                        disabled={
                            questionCount >=
                            requiredCount
                        }
                    >

                        <Plus
                            size={18}
                        />

                        Add Question

                    </button>

                )}

            </div>


            {/* =================================================
                QUESTIONS
            ================================================= */}

            {assessmentLoading &&
                selectedAssignment && (

                <div className="employee-apt-inline-loading">

                    <Loader2
                        size={22}
                        className="employee-apt-spin"
                    />

                    Refreshing assessment...

                </div>

            )}


            {questions.length === 0 ? (

                <div className="employee-apt-question-empty">

                    <div className="employee-apt-empty-icon">

                        <FileText
                            size={28}
                        />

                    </div>

                    <h3>
                        No questions created yet
                    </h3>

                    <p>
                        Start building this aptitude assessment by adding the first question.
                    </p>


                    {editable && (

                        <button
                            type="button"
                            className="employee-apt-primary-button"
                            onClick={
                                openCreateModal
                            }
                        >

                            <Plus
                                size={17}
                            />

                            Create First Question

                        </button>

                    )}

                </div>

            ) : (

                <div className="employee-apt-question-list">

                    {questions.map(
                        (
                            question,
                            index
                        ) => (

                            <QuestionCard
                                key={
                                    question._id ||
                                    index
                                }
                                question={
                                    question
                                }
                                index={
                                    index
                                }
                                editable={
                                    editable
                                }
                                deleting={
                                    deletingQuestionId ===
                                    question._id
                                }
                                onEdit={() =>
                                    openEditModal(
                                        question
                                    )}
                                onDelete={() =>
                                    requestDeleteQuestion(
                                        question
                                    )}
                            />

                        )
                    )}

                </div>

            )}


            {/* =================================================
                BOTTOM SUBMIT
            ================================================= */}

            {editable && (

                <section className="employee-apt-submit-card">

                    <div className="employee-apt-submit-content">

                        <div className="employee-apt-submit-icon">

                            {canSubmit ? (

                                <CheckCircle2
                                    size={23}
                                />

                            ) : (

                                <Send
                                    size={22}
                                />

                            )}

                        </div>


                        <div>

                            <h3>
                                {canSubmit
                                    ? "Assessment is ready"
                                    : "Complete the assessment"}
                            </h3>

                            <p>

                                {canSubmit
                                    ? "All required questions have been created. Submit them to Super Admin for verification."
                                    : `You need ${requiredCount - questionCount} more question${requiredCount - questionCount !== 1 ? "s" : ""} before this assessment can be submitted.`}

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="employee-apt-submit-button"
                        onClick={
                            requestSubmit
                        }
                        disabled={
                            !canSubmit ||
                            submitting
                        }
                    >

                        <Send
                            size={18}
                        />

                        Submit for Verification

                    </button>

                </section>

            )}


            {/* =================================================
                QUESTION MODAL
            ================================================= */}

            {showQuestionModal && (

                <QuestionModal
                    form={
                        questionForm
                    }
                    editingQuestion={
                        editingQuestion
                    }
                    saving={
                        savingQuestion
                    }
                    error={
                        formError
                    }
                    onClose={
                        closeQuestionModal
                    }
                    onSubmit={
                        handleSaveQuestion
                    }
                    onFieldChange={
                        updateQuestionField
                    }
                    onOptionChange={
                        updateOption
                    }
                    onCorrectChange={
                        selectCorrectAnswer
                    }
                />

            )}


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {questionToDelete && (

                <ConfirmModal

                    title="Delete question?"

                    message="This question will be permanently removed from this assessment. You can create another question afterward."

                    confirmText="Delete Question"

                    danger

                    loading={
                        Boolean(
                            deletingQuestionId
                        )
                    }

                    onCancel={
                        cancelDelete
                    }

                    onConfirm={
                        confirmDeleteQuestion
                    }

                />

            )}


            {/* =================================================
                SUBMIT MODAL
            ================================================= */}

            {showSubmitModal && (

                <ConfirmModal

                    title="Submit for verification?"

                    message={`You have completed all ${requiredCount} required questions. Once submitted, the assessment will be locked while Super Admin reviews your questions.`}

                    confirmText="Submit Assessment"

                    loading={
                        submitting
                    }

                    onCancel={() =>
                        setShowSubmitModal(
                            false
                        )
                    }

                    onConfirm={
                        handleSubmit
                    }

                />

            )}

        </div>

    );

};


/*
=========================================================
 DETAIL ITEM
=========================================================
*/

const DetailItem = ({
    icon,
    label,
    value,
}) => {

    return (

        <div className="employee-apt-detail-item">

            <div className="employee-apt-detail-icon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value || "—"}
                </strong>

            </div>

        </div>

    );

};


/*
=========================================================
 QUESTION CARD
=========================================================
*/

const QuestionCard = ({
    question,
    index,
    editable,
    deleting,
    onEdit,
    onDelete,
}) => {

    const correctAnswer =
        Number(
            question?.correctAnswer
        );


    return (

        <article className="employee-apt-question-card">

            <div className="employee-apt-question-top">

                <div className="employee-apt-question-number">

                    Q{index + 1}

                </div>


                <div className="employee-apt-question-heading-content">

                    <div className="employee-apt-question-meta">

                        <span>
                            {Number(
                                question?.marks
                            ) || 0}{" "}
                            mark
                            {Number(
                                question?.marks
                            ) !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>


                    <h3>
                        {question?.question}
                    </h3>

                </div>


                {editable && (

                    <div className="employee-apt-question-actions">

                        <button
                            type="button"
                            className="employee-apt-question-action edit"
                            onClick={
                                onEdit
                            }
                            disabled={
                                deleting
                            }
                            title="Edit question"
                        >

                            <Pencil
                                size={16}
                            />

                        </button>


                        <button
                            type="button"
                            className="employee-apt-question-action delete"
                            onClick={
                                onDelete
                            }
                            disabled={
                                deleting
                            }
                            title="Delete question"
                        >

                            {deleting ? (

                                <Loader2
                                    size={16}
                                    className="employee-apt-spin"
                                />

                            ) : (

                                <Trash2
                                    size={16}
                                />

                            )}

                        </button>

                    </div>

                )}

            </div>


            <div className="employee-apt-options">

                {Array.isArray(
                    question?.options
                ) &&
                    question.options.map(
                        (
                            option,
                            optionIndex
                        ) => {

                            const isCorrect =
                                optionIndex ===
                                correctAnswer;


                            return (

                                <div
                                    key={
                                        optionIndex
                                    }
                                    className={
                                        `employee-apt-option ${
                                            isCorrect
                                                ? "correct"
                                                : ""
                                        }`
                                    }
                                >

                                    <span className="employee-apt-option-letter">

                                        {String.fromCharCode(
                                            65 +
                                            optionIndex
                                        )}

                                    </span>


                                    <span className="employee-apt-option-text">

                                        {option}

                                    </span>


                                    {isCorrect && (

                                        <span className="employee-apt-correct-badge">

                                            <Check
                                                size={14}
                                            />

                                            Correct answer

                                        </span>

                                    )}

                                </div>

                            );

                        }
                    )}

            </div>


            {question?.explanation && (

                <div className="employee-apt-explanation">

                    <Info
                        size={16}
                    />

                    <div>

                        <strong>
                            Explanation
                        </strong>

                        <p>
                            {question.explanation}
                        </p>

                    </div>

                </div>

            )}

        </article>

    );

};


/*
=========================================================
QUESTION MODAL
=========================================================
*/

const QuestionModal = ({
    form,
    editingQuestion,
    saving,
    error,
    onClose,
    onSubmit,
    onFieldChange,
    onOptionChange,
    onCorrectChange,
}) => {

    return (

        <div
            className="employee-apt-modal-overlay"
            onMouseDown={
                (event) => {

                    if (
                        event.target ===
                        event.currentTarget
                    ) {

                        onClose();

                    }

                }
            }
        >

            <div className="employee-apt-modal employee-apt-question-modal">

                <div className="employee-apt-modal-header">

                    <div>

                        <span className="employee-apt-modal-eyebrow">

                            {editingQuestion
                                ? "EDIT QUESTION"
                                : "NEW QUESTION"}

                        </span>

                        <h2>

                            {editingQuestion
                                ? "Edit Aptitude Question"
                                : "Create Aptitude Question"}

                        </h2>

                        <p>
                            Add a clear multiple-choice question with one correct answer.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="employee-apt-modal-close"
                        onClick={
                            onClose
                        }
                        disabled={
                            saving
                        }
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                <form
                    className="employee-apt-question-form"
                    onSubmit={
                        onSubmit
                    }
                >

                    {error && (

                        <div className="employee-apt-form-error">

                            <AlertCircle
                                size={17}
                            />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    <div className="employee-apt-form-group">

                        <label htmlFor="apt-question">

                            Question
                            <span>*</span>

                        </label>

                        <textarea
                            id="apt-question"
                            value={
                                form.question
                            }
                            onChange={(
                                event
                            ) =>
                                onFieldChange(
                                    "question",
                                    event.target.value
                                )
                            }
                            placeholder="Enter the aptitude question..."
                            rows={4}
                            maxLength={1000}
                            disabled={
                                saving
                            }
                            autoFocus
                        />

                        <div className="employee-apt-character-count">

                            {form.question.length}
                            /1000

                        </div>

                    </div>


                    <div className="employee-apt-form-section-title">

                        <div>

                            <h3>
                                Answer Options
                            </h3>

                            <p>
                                Enter exactly four choices and select the correct one.
                            </p>

                        </div>

                    </div>


                    <div className="employee-apt-option-editor">

                        {form.options.map(
                            (
                                option,
                                index
                            ) => {

                                const selected =
                                    form.correctAnswer ===
                                    index;


                                return (

                                    <div
                                        key={
                                            index
                                        }
                                        className={
                                            `employee-apt-option-input-row ${
                                                selected
                                                    ? "selected"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <button
                                            type="button"
                                            className="employee-apt-answer-selector"
                                            onClick={() =>
                                                onCorrectChange(
                                                    index
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            title={
                                                selected
                                                    ? "Correct answer"
                                                    : "Mark as correct answer"
                                            }
                                        >

                                            {selected ? (

                                                <Check
                                                    size={16}
                                                />

                                            ) : (

                                                String.fromCharCode(
                                                    65 +
                                                    index
                                                )

                                            )}

                                        </button>


                                        <input
                                            type="text"
                                            value={
                                                option
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                onOptionChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                `Option ${String.fromCharCode(
                                                    65 +
                                                    index
                                                )}`
                                            }
                                            maxLength={300}
                                            disabled={
                                                saving
                                            }
                                        />


                                        {selected && (

                                            <span className="employee-apt-selected-label">

                                                Correct

                                            </span>

                                        )}

                                    </div>

                                );

                            }
                        )}

                    </div>


                    <div className="employee-apt-form-two-column">

                        <div className="employee-apt-form-group">

                            <label htmlFor="apt-marks">

                                Marks
                                <span>*</span>

                            </label>

                            <input
                                id="apt-marks"
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={
                                    form.marks
                                }
                                onChange={(
                                    event
                                ) =>
                                    onFieldChange(
                                        "marks",
                                        event.target.value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            />

                        </div>


                        <div className="employee-apt-form-help">

                            <Info
                                size={16}
                            />

                            <span>
                                Select the correct answer by clicking A, B, C or D.
                            </span>

                        </div>

                    </div>


                    <div className="employee-apt-form-group">

                        <label htmlFor="apt-explanation">

                            Explanation
                            <span className="optional">
                                Optional
                            </span>

                        </label>

                        <textarea
                            id="apt-explanation"
                            value={
                                form.explanation
                            }
                            onChange={(
                                event
                            ) =>
                                onFieldChange(
                                    "explanation",
                                    event.target.value
                                )
                            }
                            placeholder="Explain why the selected answer is correct..."
                            rows={3}
                            maxLength={1000}
                            disabled={
                                saving
                            }
                        />

                    </div>


                    <div className="employee-apt-modal-footer">

                        <button
                            type="button"
                            className="employee-apt-secondary-button"
                            onClick={
                                onClose
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="employee-apt-primary-button"
                            disabled={
                                saving
                            }
                        >

                            {saving ? (

                                <>

                                    <Loader2
                                        size={17}
                                        className="employee-apt-spin"
                                    />

                                    Saving...

                                </>

                            ) : (

                                <>

                                    <Check
                                        size={17}
                                    />

                                    {editingQuestion
                                        ? "Update Question"
                                        : "Save Question"}

                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};


/*
=========================================================
CONFIRM MODAL
=========================================================
*/

const ConfirmModal = ({
    title,
    message,
    confirmText,
    danger = false,
    loading = false,
    onCancel,
    onConfirm,
}) => {

    return (

        <div
            className="employee-apt-modal-overlay"
            onMouseDown={
                (event) => {

                    if (
                        event.target ===
                        event.currentTarget &&
                        !loading
                    ) {

                        onCancel();

                    }

                }
            }
        >

            <div className="employee-apt-modal employee-apt-confirm-modal">

                <div className="employee-apt-confirm-icon">

                    {danger ? (

                        <Trash2
                            size={23}
                        />

                    ) : (

                        <Send
                            size={23}
                        />

                    )}

                </div>


                <h2>
                    {title}
                </h2>


                <p>
                    {message}
                </p>


                <div className="employee-apt-modal-footer">

                    <button
                        type="button"
                        className="employee-apt-secondary-button"
                        onClick={
                            onCancel
                        }
                        disabled={
                            loading
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className={
                            danger
                                ? "employee-apt-danger-button"
                                : "employee-apt-primary-button"
                        }
                        onClick={
                            onConfirm
                        }
                        disabled={
                            loading
                        }
                    >

                        {loading ? (

                            <>

                                <Loader2
                                    size={17}
                                    className="employee-apt-spin"
                                />

                                Processing...

                            </>

                        ) : (

                            confirmText

                        )}

                    </button>

                </div>

            </div>

        </div>

    );

};


/*
=========================================================
TOAST
=========================================================
*/

const Toast = ({
    toast,
    onClose,
}) => {

    const isError =
        toast?.type ===
        "error";


    return (

        <div
            className={
                `employee-apt-toast ${
                    isError
                        ? "error"
                        : "success"
                }`
            }
        >

            <div className="employee-apt-toast-icon">

                {isError ? (

                    <AlertCircle
                        size={18}
                    />

                ) : (

                    <CheckCircle2
                        size={18}
                    />

                )}

            </div>


            <span>
                {toast?.message}
            </span>


            <button
                type="button"
                onClick={
                    onClose
                }
            >

                <X
                    size={16}
                />

            </button>

        </div>

    );

};


/*
=========================================================
ASSIGNMENT SKELETON
=========================================================
*/

const AssignmentSkeleton = () => {

    return (

        <div className="employee-apt-assignment-grid">

            {[1, 2, 3].map(
                (
                    item
                ) => (

                    <div
                        className="employee-apt-skeleton-card"
                        key={
                            item
                        }
                    >

                        <div className="employee-apt-skeleton-top">

                            <div className="employee-apt-skeleton-circle" />

                            <div className="employee-apt-skeleton-status" />

                        </div>


                        <div className="employee-apt-skeleton-line large" />

                        <div className="employee-apt-skeleton-line medium" />

                        <div className="employee-apt-skeleton-line small" />

                        <div className="employee-apt-skeleton-progress" />

                        <div className="employee-apt-skeleton-footer" />

                    </div>

                )
            )}

        </div>

    );

};


export default EmployeeAptitudeQuestions;