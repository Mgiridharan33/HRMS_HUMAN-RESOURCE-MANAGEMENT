import {
    useEffect,
    useState,
} from "react";

import {
    X,
    CreditCard,
    UserRound,
    CalendarDays,
    IndianRupee,
    Hash,
    Loader2,
    CheckCircle2,
} from "lucide-react";

import axios from "axios";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// MONTHS
// =====================================================

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {

    const amount =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


const getMonthName = (month) => {

    const found =
        MONTHS.find(
            item =>
                item.value ===
                Number(month)
        );

    return found?.label || "—";
};


const getEmployeeName = (payroll) => {

    if (
        payroll?.employeeName
    ) {
        return payroll.employeeName;
    }

    const employee =
        payroll?.employee;

    if (
        employee?.firstName ||
        employee?.lastName
    ) {

        return `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();
    }

    if (
        employee?.name
    ) {
        return employee.name;
    }

    return "Unknown Employee";
};


const getEmployeeId = (payroll) => {

    if (
        payroll?.employeeId
    ) {
        return payroll.employeeId;
    }

    if (
        payroll?.employee?.employeeId
    ) {
        return payroll.employee.employeeId;
    }

    if (
        payroll?.employee?.empCode
    ) {
        return payroll.employee.empCode;
    }

    return "—";
};


// =====================================================
// COMPONENT
// =====================================================

const PayrollPaymentModal = ({
    isOpen,
    payroll,
    onClose,
    onSuccess,
}) => {

    // =================================================
    // STATE
    // =================================================

    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState("Bank Transfer");


    const [
        paymentReference,
        setPaymentReference,
    ] = useState("");


    const [
        processing,
        setProcessing,
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
    // RESET WHEN OPENED
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        setPaymentMethod(
            payroll?.paymentMethod ||
            "Bank Transfer"
        );

        setPaymentReference(
            payroll?.paymentReference ||
            ""
        );

        setProcessing(false);
        setError("");
        setSuccess("");

    }, [
        isOpen,
        payroll,
    ]);


    // =================================================
    // CLOSE
    // =================================================

    const handleClose = () => {

        if (processing) {
            return;
        }

        setError("");
        setSuccess("");

        onClose?.();
    };


    // =================================================
    // CHANGE PAYMENT METHOD
    // =================================================

    const handlePaymentMethodChange = (
        event
    ) => {

        setPaymentMethod(
            event.target.value
        );

        setError("");
        setSuccess("");
    };


    // =================================================
    // CHANGE REFERENCE
    // =================================================

    const handleReferenceChange = (
        event
    ) => {

        setPaymentReference(
            event.target.value
        );

        setError("");
        setSuccess("");
    };


    // =================================================
    // SUBMIT PAYMENT
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // =============================================
        // PAYROLL VALIDATION
        // =============================================

        if (!payroll?._id) {

            setError(
                "Invalid payroll record."
            );

            return;
        }


        // =============================================
        // STATUS VALIDATION
        // =============================================

        if (
            payroll.status !==
            "Approved"
        ) {

            setError(
                "Only approved payroll can be marked as paid."
            );

            return;
        }


        // =============================================
        // PAYMENT METHOD VALIDATION
        // =============================================

        if (!paymentMethod) {

            setError(
                "Please select a payment method."
            );

            return;
        }


        // =============================================
        // PAYMENT REFERENCE
        // =============================================

        const cleanReference =
            String(
                paymentReference || ""
            ).trim();


        // =============================================
        // PROCESS
        // =============================================

        try {

            setProcessing(true);


            // =========================================
            // API REQUEST
            // =========================================

            const response =
                await axios.put(

                    `${API_URL}/payroll/${payroll._id}/pay`,

                    {
                        paymentMethod:
                            paymentMethod,

                        paymentReference:
                            cleanReference,
                    },

                    {
                        withCredentials: true,
                    }
                );


            // =========================================
            // RESPONSE
            // =========================================

            if (
                !response?.data?.success
            ) {

                throw new Error(
                    response?.data?.message ||
                    "Failed to mark payroll as paid."
                );
            }


            // =========================================
            // SUCCESS
            // =========================================

            setSuccess(
                response.data.message ||
                "Payroll marked as paid successfully."
            );


            // =========================================
            // CALLBACK
            // =========================================

            if (
                typeof onSuccess ===
                "function"
            ) {

                await onSuccess(
                    response.data.payroll ||
                    response.data.data ||
                    response.data
                );
            }


            // =========================================
            // CLOSE
            // =========================================

            setTimeout(() => {

                onClose?.();

            }, 500);

        } catch (err) {

            console.error(
                "MARK PAYROLL PAID ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to mark payroll as paid."
            );

        } finally {

            setProcessing(false);
        }
    };


    // =================================================
    // DO NOT RENDER
    // =================================================

    if (
        !isOpen ||
        !payroll
    ) {

        return null;
    }


    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className="payroll-modal-overlay"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    handleClose();
                }

            }}
        >

            <div
                className="payroll-payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="payroll-payment-title"
                onMouseDown={event =>
                    event.stopPropagation()
                }
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div
                    className="payroll-modal-header"
                >

                    <div
                        className="payroll-modal-title-area"
                    >

                        <div
                            className="payroll-modal-icon"
                        >

                            <CreditCard
                                size={21}
                            />

                        </div>

                        <div>

                            <h2
                                id="payroll-payment-title"
                            >
                                Mark Payroll as Paid
                            </h2>

                            <p>
                                Record the payment details for this payroll.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="payroll-modal-close"
                        onClick={handleClose}
                        disabled={processing}
                        aria-label="Close"
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                {/* =====================================
                    BODY
                ===================================== */}

                <form
                    className="payroll-payment-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (

                        <div
                            className="payroll-form-error"
                        >

                            {error}

                        </div>

                    )}


                    {/* =================================
                        SUCCESS
                    ================================= */}

                    {success && (

                        <div
                            className="payroll-form-success"
                        >

                            <CheckCircle2
                                size={17}
                            />

                            {success}

                        </div>

                    )}


                    {/* =================================
                        EMPLOYEE SUMMARY
                    ================================= */}

                    <div
                        className="payroll-payment-employee"
                    >

                        <div
                            className="payroll-payment-avatar"
                        >

                            {getEmployeeName(
                                payroll
                            )
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div
                            className="payroll-payment-employee-info"
                        >

                            <strong>
                                {
                                    getEmployeeName(
                                        payroll
                                    )
                                }
                            </strong>

                            <span>
                                Employee ID:{" "}
                                {
                                    getEmployeeId(
                                        payroll
                                    )
                                }
                            </span>

                        </div>

                    </div>


                    {/* =================================
                        PAYROLL SUMMARY
                    ================================= */}

                    <div
                        className="payroll-payment-summary"
                    >

                        <div>

                            <span>

                                <CalendarDays
                                    size={15}
                                />

                                Payroll Period

                            </span>

                            <strong>

                                {
                                    getMonthName(
                                        payroll.month
                                    )
                                }{" "}
                                {
                                    payroll.year
                                }

                            </strong>

                        </div>


                        <div>

                            <span>

                                <IndianRupee
                                    size={15}
                                />

                                Net Salary

                            </span>

                            <strong
                                className="payroll-payment-net"
                            >

                                {formatCurrency(
                                    payroll.netSalary
                                )}

                            </strong>

                        </div>

                    </div>


                    {/* =================================
                        PAYMENT METHOD
                    ================================= */}

                    <div
                        className="payroll-form-group"
                    >

                        <label
                            htmlFor="payroll-payment-method"
                        >

                            <CreditCard
                                size={16}
                            />

                            Payment Method

                        </label>


                        <select
                            id="payroll-payment-method"
                            value={
                                paymentMethod
                            }
                            onChange={
                                handlePaymentMethodChange
                            }
                            disabled={
                                processing
                            }
                        >

                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>

                            <option value="Cash">
                                Cash
                            </option>

                            <option value="Cheque">
                                Cheque
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* =================================
                        PAYMENT REFERENCE
                    ================================= */}

                    <div
                        className="payroll-form-group"
                    >

                        <label
                            htmlFor="payroll-payment-reference"
                        >

                            <Hash
                                size={16}
                            />

                            Payment Reference

                            <span className="payroll-label-optional">
                                Optional
                            </span>

                        </label>


                        <input
                            id="payroll-payment-reference"
                            type="text"
                            value={
                                paymentReference
                            }
                            onChange={
                                handleReferenceChange
                            }
                            placeholder="Transaction ID / cheque number / reference"
                            maxLength={100}
                            disabled={
                                processing
                            }
                        />

                    </div>


                    {/* =================================
                        CONFIRMATION
                    ================================= */}

                    <div
                        className="payroll-payment-warning"
                    >

                        <CreditCard
                            size={18}
                        />

                        <div>

                            <strong>
                                Confirm Payment
                            </strong>

                            <p>
                                Once this payroll is marked as paid,
                                its status will change from
                                <strong> Approved </strong>
                                to
                                <strong> Paid </strong>.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        FOOTER
                    ================================= */}

                    <div
                        className="payroll-modal-footer"
                    >

                        <button
                            type="button"
                            className="payroll-btn payroll-btn-secondary"
                            onClick={
                                handleClose
                            }
                            disabled={
                                processing
                            }
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="payroll-btn payroll-btn-primary payroll-payment-submit"
                            disabled={
                                processing
                            }
                        >

                            {processing ? (

                                <>

                                    <Loader2
                                        size={17}
                                        className="payroll-spinner"
                                    />

                                    Processing...

                                </>

                            ) : (

                                <>

                                    <CreditCard
                                        size={17}
                                    />

                                    Confirm Payment

                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default PayrollPaymentModal;