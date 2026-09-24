import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Send,
    X,
    XCircle,
} from "lucide-react";

import employeeLeaveApi
    from "../../services/employeeLeaveApi";

import "./EmployeeLeave.css";


// =====================================================
// HELPERS
// =====================================================

const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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


// =====================================================
// DATE INPUT FORMAT
// =====================================================

const getToday = () => {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =====================================================
// CALCULATE DAYS
// =====================================================

const calculateDays = (
    startDate,
    endDate
) => {

    if (
        !startDate ||
        !endDate
    ) {
        return 0;
    }

    const start =
        new Date(
            `${startDate}T00:00:00`
        );

    const end =
        new Date(
            `${endDate}T00:00:00`
        );

    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {
        return 0;
    }

    if (end < start) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    return (
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ) + 1
    );
};


// =====================================================
// STATUS CLASS
// =====================================================

const getStatusClass = (
    status
) => {

    switch (status) {

        case "Approved":
            return "approved";

        case "Cancelled":
            return "cancelled";

        case "Pending":
        default:
            return "pending";
    }
};


// =====================================================
// STATUS ICON
// =====================================================

const StatusIcon = ({
    status,
}) => {

    if (
        status === "Approved"
    ) {

        return (
            <CheckCircle2
                size={13}
            />
        );
    }

    if (
        status === "Cancelled"
    ) {

        return (
            <XCircle
                size={13}
            />
        );
    }

    return (
        <Clock3
            size={13}
        />
    );
};


// =====================================================
// COMPONENT
// =====================================================

const EmployeeLeave = () => {

    // =================================================
    // FORM STATE
    // =================================================

    const [
        leaveType,
        setLeaveType,
    ] = useState("");

    const [
        leaveCategory,
        setLeaveCategory,
    ] = useState("Paid");

    const [
        startDate,
        setStartDate,
    ] = useState("");

    const [
        endDate,
        setEndDate,
    ] = useState("");

    const [
        reason,
        setReason,
    ] = useState("");


    // =================================================
    // DATA STATE
    // =================================================

    const [
        leaves,
        setLeaves,
    ] = useState([]);


    // =================================================
    // UI STATE
    // =================================================

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");


    // =================================================
    // TODAY
    // =================================================

    const today =
        useMemo(
            () => getToday(),
            []
        );


    // =================================================
    // TOTAL FORM DAYS
    // =================================================

    const totalDays =
        useMemo(
            () =>
                calculateDays(
                    startDate,
                    endDate
                ),
            [
                startDate,
                endDate,
            ]
        );


    // =================================================
    // LOAD MY LEAVES
    // =================================================

    const loadLeaves =
        useCallback(
            async (
                showMainLoader = true
            ) => {

                try {

                    if (
                        showMainLoader
                    ) {

                        setLoading(true);

                    } else {

                        setRefreshing(true);
                    }

                    setError("");

                    const result =
                        await employeeLeaveApi
                            .getMyLeaves();


                    if (
                        result?.success
                    ) {

                        setLeaves(
                            Array.isArray(
                                result.leaves
                            )
                                ? result.leaves
                                : []
                        );

                    } else {

                        setLeaves([]);

                        setError(
                            result?.message ||
                            "Failed to load leave requests."
                        );
                    }

                } catch (err) {

                    console.error(
                        "GET EMPLOYEE LEAVES ERROR:",
                        err
                    );

                    setLeaves([]);

                    setError(
                        err?.response?.data?.message ||
                        "Failed to load leave requests."
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }

            },
            []
        );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadLeaves(true);

    }, [
        loadLeaves,
    ]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary =
        useMemo(
            () => {

                const safeLeaves =
                    Array.isArray(
                        leaves
                    )
                        ? leaves
                        : [];

                return {

                    total:
                        safeLeaves.length,

                    pending:
                        safeLeaves.filter(
                            (leave) =>
                                leave?.status ===
                                "Pending"
                        ).length,

                    approved:
                        safeLeaves.filter(
                            (leave) =>
                                leave?.status ===
                                "Approved"
                        ).length,

                    cancelled:
                        safeLeaves.filter(
                            (leave) =>
                                leave?.status ===
                                "Cancelled"
                        ).length,

                };

            },
            [
                leaves,
            ]
        );


    // =================================================
    // CLEAR ALERT
    // =================================================

    const clearAlerts = () => {

        setError("");
        setSuccess("");
    };


    // =================================================
    // START DATE CHANGE
    // =================================================

    const handleStartDateChange = (
        event
    ) => {

        const value =
            event.target.value;

        setStartDate(value);

        if (
            endDate &&
            value > endDate
        ) {

            setEndDate("");
        }
    };


    // =================================================
    // SUBMIT LEAVE
    // =================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();

            clearAlerts();


            // -----------------------------------------
            // LEAVE TYPE
            // -----------------------------------------

            const cleanLeaveType =
                leaveType.trim();

            if (
                !cleanLeaveType
            ) {

                setError(
                    "Please select a leave type."
                );

                return;
            }


            // -----------------------------------------
            // START DATE
            // -----------------------------------------

            if (
                !startDate
            ) {

                setError(
                    "Please select a start date."
                );

                return;
            }


            // -----------------------------------------
            // END DATE
            // -----------------------------------------

            if (
                !endDate
            ) {

                setError(
                    "Please select an end date."
                );

                return;
            }


            // -----------------------------------------
            // DATE ORDER
            // -----------------------------------------

            if (
                endDate < startDate
            ) {

                setError(
                    "End date cannot be before start date."
                );

                return;
            }


            // -----------------------------------------
            // DAYS
            // -----------------------------------------

            if (
                totalDays < 1
            ) {

                setError(
                    "Leave duration must be at least one day."
                );

                return;
            }


            // -----------------------------------------
            // REASON
            // -----------------------------------------

            const cleanReason =
                reason.trim();

            if (
                cleanReason.length < 3
            ) {

                setError(
                    "Leave reason must contain at least 3 characters."
                );

                return;
            }

            if (
                cleanReason.length > 500
            ) {

                setError(
                    "Leave reason cannot exceed 500 characters."
                );

                return;
            }


            try {

                setSubmitting(true);


                const result =
                    await employeeLeaveApi
                        .applyLeave({

                            leaveType:
                                cleanLeaveType,

                            leaveCategory,

                            startDate,

                            endDate,

                            reason:
                                cleanReason,

                        });


                if (
                    result?.success
                ) {

                    setSuccess(
                        result.message ||
                        "Leave request submitted successfully."
                    );


                    // ---------------------------------
                    // RESET FORM
                    // ---------------------------------

                    setLeaveType("");
                    setLeaveCategory("Paid");
                    setStartDate("");
                    setEndDate("");
                    setReason("");


                    // ---------------------------------
                    // RELOAD DATA
                    // ---------------------------------

                    await loadLeaves(
                        false
                    );

                } else {

                    setError(
                        result?.message ||
                        "Failed to submit leave request."
                    );
                }

            } catch (err) {

                console.error(
                    "APPLY LEAVE ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to submit leave request."
                );

            } finally {

                setSubmitting(false);
            }
        };


    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh =
        async () => {

            clearAlerts();

            await loadLeaves(
                false
            );
        };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="employee-leave-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-leave-header">

                <div className="employee-leave-title">

                    <div className="employee-leave-title-icon">

                        <CalendarDays
                            size={24}
                        />

                    </div>

                    <div>

                        <h1>
                            Leave Management
                        </h1>

                        <p>
                            Apply for leave and track your leave requests
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="employee-leave-refresh"
                    onClick={handleRefresh}
                    disabled={
                        refreshing ||
                        loading
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "employee-leave-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                SUCCESS ALERT
            ================================================= */}

            {success && (

                <div className="employee-leave-alert success">

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
                        aria-label="Close success message"
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>

            )}


            {/* =================================================
                ERROR ALERT
            ================================================= */}

            {error && (

                <div className="employee-leave-alert error">

                    <XCircle
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
                        aria-label="Close error message"
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="employee-leave-summary">


                {/* TOTAL */}

                <div className="employee-leave-summary-card">

                    <div className="employee-leave-summary-icon">

                        <FileText
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Total Requests
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                {/* PENDING */}

                <div className="employee-leave-summary-card">

                    <div className="employee-leave-summary-icon pending">

                        <Clock3
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {summary.pending}
                        </strong>

                    </div>

                </div>


                {/* APPROVED */}

                <div className="employee-leave-summary-card">

                    <div className="employee-leave-summary-icon approved">

                        <CheckCircle2
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <strong>
                            {summary.approved}
                        </strong>

                    </div>

                </div>


                {/* CANCELLED */}

                <div className="employee-leave-summary-card">

                    <div className="employee-leave-summary-icon cancelled">

                        <XCircle
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {summary.cancelled}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="employee-leave-content">


                {/* =================================================
                    APPLY LEAVE
                ================================================= */}

                <section className="employee-leave-form-card">

                    <div className="employee-leave-card-header">

                        <div>

                            <h2>
                                Apply for Leave
                            </h2>

                            <p>
                                Submit your leave request to HR
                            </p>

                        </div>

                        <div className="employee-leave-card-header-icon">

                            <Plus
                                size={19}
                            />

                        </div>

                    </div>


                    <form
                        className="employee-leave-form"
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {/* =================================================
                            LEAVE TYPE
                        ================================================= */}

                        <div className="employee-leave-field">

                            <label htmlFor="leaveType">
                                Leave Type
                            </label>

                            <select
                                id="leaveType"
                                value={
                                    leaveType
                                }
                                onChange={(event) =>
                                    setLeaveType(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    submitting
                                }
                            >

                                <option value="">
                                    Select leave type
                                </option>

                                <option value="Casual Leave">
                                    Casual Leave
                                </option>

                                <option value="Sick Leave">
                                    Sick Leave
                                </option>

                                <option value="Earned Leave">
                                    Earned Leave
                                </option>

                                <option value="Emergency Leave">
                                    Emergency Leave
                                </option>

                                <option value="Personal Leave">
                                    Personal Leave
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div className="employee-leave-field">

                            <label htmlFor="leaveCategory">
                                Leave Category
                            </label>

                            <select
                                id="leaveCategory"
                                value={leaveCategory}
                                onChange={(event) =>
                                    setLeaveCategory(event.target.value)
                                }
                                disabled={submitting}
                            >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>

                        </div>


                        {/* =================================================
                            DATE GRID
                        ================================================= */}

                        <div className="employee-leave-date-grid">


                            {/* START DATE */}

                            <div className="employee-leave-field">

                                <label htmlFor="startDate">
                                    Start Date
                                </label>

                                <div className="employee-leave-input-icon">

                                    <CalendarDays
                                        size={17}
                                    />

                                    <input
                                        id="startDate"
                                        type="date"
                                        min={today}
                                        value={
                                            startDate
                                        }
                                        onChange={
                                            handleStartDateChange
                                        }
                                        disabled={
                                            submitting
                                        }
                                    />

                                </div>

                            </div>


                            {/* END DATE */}

                            <div className="employee-leave-field">

                                <label htmlFor="endDate">
                                    End Date
                                </label>

                                <div className="employee-leave-input-icon">

                                    <CalendarDays
                                        size={17}
                                    />

                                    <input
                                        id="endDate"
                                        type="date"
                                        min={
                                            startDate ||
                                            today
                                        }
                                        value={
                                            endDate
                                        }
                                        onChange={(event) =>
                                            setEndDate(
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DURATION
                        ================================================= */}

                        <div className="employee-leave-days-box">

                            <div>

                                <CalendarDays
                                    size={18}
                                />

                                <span>
                                    Leave Duration
                                </span>

                            </div>

                            <strong>

                                {totalDays > 0
                                    ? `${totalDays} ${
                                        totalDays === 1
                                            ? "Day"
                                            : "Days"
                                    }`
                                    : "Select dates"}

                            </strong>

                        </div>


                        {/* =================================================
                            REASON
                        ================================================= */}

                        <div className="employee-leave-field">

                            <div className="employee-leave-label-row">

                                <label htmlFor="reason">
                                    Reason
                                </label>

                                <span>
                                    {reason.length}/500
                                </span>

                            </div>

                            <textarea
                                id="reason"
                                rows={6}
                                maxLength={500}
                                placeholder="Enter the reason for your leave..."
                                value={
                                    reason
                                }
                                onChange={(event) =>
                                    setReason(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    submitting
                                }
                            />

                        </div>


                        {/* =================================================
                            SUBMIT
                        ================================================= */}

                        <button
                            type="submit"
                            className="employee-leave-submit"
                            disabled={
                                submitting
                            }
                        >

                            {submitting ? (

                                <>

                                    <Loader2
                                        size={18}
                                        className="employee-leave-spin"
                                    />

                                    Submitting...

                                </>

                            ) : (

                                <>

                                    <Send
                                        size={18}
                                    />

                                    Submit Leave Request

                                </>

                            )}

                        </button>

                    </form>

                </section>


                {/* =================================================
                    LEAVE PROCESS
                ================================================= */}

                <section className="employee-leave-info-card">

                    <div className="employee-leave-info-header">

                        <Clock3
                            size={19}
                        />

                        <h3>
                            Leave Process
                        </h3>

                    </div>


                    <div className="employee-leave-process">


                        {/* STEP 1 */}

                        <div className="employee-leave-process-item">

                            <span>
                                1
                            </span>

                            <div>

                                <strong>
                                    Submit Request
                                </strong>

                                <p>
                                    Your leave request is sent to HR.
                                </p>

                            </div>

                        </div>


                        <div className="employee-leave-process-line" />


                        {/* STEP 2 */}

                        <div className="employee-leave-process-item">

                            <span>
                                2
                            </span>

                            <div>

                                <strong>
                                    HR Review
                                </strong>

                                <p>
                                    HR reviews your requested dates and reason.
                                </p>

                            </div>

                        </div>


                        <div className="employee-leave-process-line" />


                        {/* STEP 3 */}

                        <div className="employee-leave-process-item">

                            <span>
                                3
                            </span>

                            <div>

                                <strong>
                                    Decision
                                </strong>

                                <p>
                                    You will see the approval or cancellation status.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* =================================================
                LEAVE HISTORY
            ================================================= */}

            <section className="employee-leave-history-card">


                {/* HEADER */}

                <div className="employee-leave-history-header">

                    <div>

                        <h2>
                            My Leave Requests
                        </h2>

                        <p>
                            Track all your submitted leave applications
                        </p>

                    </div>

                    <span className="employee-leave-count">

                        {summary.total}{" "}
                        {summary.total === 1
                            ? "request"
                            : "requests"}

                    </span>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="employee-leave-loading">

                        <Loader2
                            size={30}
                            className="employee-leave-spin"
                        />

                        <span>
                            Loading leave requests...
                        </span>

                    </div>

                ) : leaves.length === 0 ? (


                    /* =================================================
                        EMPTY
                    ================================================= */

                    <div className="employee-leave-empty">

                        <FileText
                            size={42}
                        />

                        <h3>
                            No leave requests yet
                        </h3>

                        <p>
                            Submit your first leave request using the form above.
                        </p>

                    </div>

                ) : (


                    /* =================================================
                        TABLE
                    ================================================= */

                    <div className="employee-leave-table-wrapper">

                        <table className="employee-leave-table">

                            <thead>

                                <tr>

                                    <th>
                                        Leave Type
                                    </th>

                                    <th>
                                        From
                                    </th>

                                    <th>
                                        To
                                    </th>

                                    <th>
                                        Days
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        HR Response
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {leaves.map(
                                    (leave) => {

                                        if (!leave) {
                                            return null;
                                        }

                                        const status =
                                            leave.status ||
                                            "Pending";

                                        const statusClass =
                                            getStatusClass(
                                                status
                                            );


                                        return (

                                            <tr
                                                key={
                                                    leave._id
                                                }
                                            >


                                                {/* TYPE */}

                                                <td>

                                                    <span className="employee-leave-type">

                                                        {leave.leaveType ||
                                                            "-"}

                                                    </span>

                                                </td>


                                                {/* FROM */}

                                                <td>

                                                    {formatDate(
                                                        leave.startDate
                                                    )}

                                                </td>


                                                {/* TO */}

                                                <td>

                                                    {formatDate(
                                                        leave.endDate
                                                    )}

                                                </td>


                                                {/* DAYS */}

                                                <td>

                                                    <strong className="employee-leave-days">

                                                        {leave.totalDays ||
                                                            calculateDays(
                                                                leave.startDate,
                                                                leave.endDate
                                                            )}

                                                    </strong>

                                                </td>


                                                {/* REASON */}

                                                <td>

                                                    <div
                                                        className="employee-leave-reason"
                                                        title={
                                                            leave.reason ||
                                                            ""
                                                        }
                                                    >

                                                        {leave.reason ||
                                                            "-"}

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `employee-leave-status ${statusClass}`
                                                        }
                                                    >

                                                        <StatusIcon
                                                            status={
                                                                status
                                                            }
                                                        />

                                                        {status}

                                                    </span>

                                                </td>


                                                {/* HR RESPONSE */}

                                                <td>


                                                    {status ===
                                                    "Cancelled" ? (

                                                        <div className="employee-leave-cancellation">

                                                            <strong>
                                                                Cancellation Reason
                                                            </strong>

                                                            <span>
                                                                {leave.cancellationReason ||
                                                                    "No reason provided."}
                                                            </span>

                                                            {leave.cancelledBy?.name && (

                                                                <small>
                                                                    By{" "}
                                                                    {
                                                                        leave
                                                                            .cancelledBy
                                                                            .name
                                                                    }
                                                                </small>

                                                            )}

                                                        </div>

                                                    ) : status ===
                                                      "Approved" ? (

                                                        <div className="employee-leave-approved-info">

                                                            <CheckCircle2
                                                                size={14}
                                                            />

                                                            <div>

                                                                <span>
                                                                    Approved by HR
                                                                </span>

                                                                {leave.approvedBy?.name && (

                                                                    <small>
                                                                        {
                                                                            leave
                                                                                .approvedBy
                                                                                .name
                                                                        }
                                                                    </small>

                                                                )}

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span className="employee-leave-no-response">

                                                            Waiting for HR response

                                                        </span>

                                                    )}

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

        </div>
    );
};


export default EmployeeLeave;