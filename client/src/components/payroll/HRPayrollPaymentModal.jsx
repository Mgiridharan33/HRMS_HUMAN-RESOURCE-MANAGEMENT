import {
    useEffect,
    useState,
} from "react";

import {
    X,
    WalletCards,
    UserRound,
    CalendarDays,
    IndianRupee,
    Building2,
    CreditCard,
    Banknote,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";

import axios from "axios";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// HELPERS
// =====================================================

const getToken = () => {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        ""
    );
};


const formatMoney = (value) => {

    const amount =
        Number(value || 0);

    return amount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
};


const getHRName = (payroll) => {

    const hr =
        payroll?.hr ||
        payroll?.user ||
        payroll?.employee;

    if (!hr) {
        return "HR";
    }

    const fullName =
        [
            hr.firstName,
            hr.lastName,
        ]
            .filter(Boolean)
            .join(" ");

    return (
        fullName ||
        hr.name ||
        hr.fullName ||
        hr.email ||
        "HR"
    );
};


const getHREmail = (payroll) => {

    const hr =
        payroll?.hr ||
        payroll?.user ||
        payroll?.employee;

    return (
        hr?.email ||
        "—"
    );
};


const getHRRole = (payroll) => {

    const hr =
        payroll?.hr ||
        payroll?.user ||
        payroll?.employee;

    return (
        hr?.role ||
        "HR"
    );
};


const getMonthName = (month) => {

    const months = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",

    ];

    const index =
        Number(month) - 1;

    return (
        months[index] ||
        "—"
    );
};


// =====================================================
// COMPONENT
// =====================================================

const HRPayrollPaymentModal = ({
    isOpen,
    onClose,
    payroll,
    onSuccess,
}) => {

    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState("BANK_TRANSFER");


    const [
        paymentReference,
        setPaymentReference,
    ] = useState("");


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


    // =================================================
    // RESET
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        setPaymentMethod(
            "BANK_TRANSFER"
        );

        setPaymentReference("");

        setError("");

        setSuccess("");

        setLoading(false);

    }, [
        isOpen,
        payroll,
    ]);


    // =================================================
    // ESCAPE
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event) => {

            if (
                event.key === "Escape" &&
                !loading
            ) {

                onClose?.();
            }
        };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [
        isOpen,
        loading,
        onClose,
    ]);


    // =================================================
    // PREVENT BODY SCROLL
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";


        return () => {

            document.body.style.overflow =
                previousOverflow;
        };

    }, [
        isOpen,
    ]);


    // =================================================
    // CLOSE
    // =================================================

    const handleClose = () => {

        if (loading) {
            return;
        }

        onClose?.();
    };


    // =================================================
    // PAYMENT
    // =================================================

    const handlePayment = async () => {

        setError("");

        setSuccess("");


        if (!payroll?._id) {

            setError(
                "Payroll record is missing."
            );

            return;
        }


        if (!paymentMethod) {

            setError(
                "Please select a payment method."
            );

            return;
        }


        // -------------------------------------------------
        // HR PAYROLL IS DIRECT PAYMENT
        // No approval required.
        // -------------------------------------------------

        try {

            setLoading(true);


            const token =
                getToken();


            const response =
                await axios.put(

                    `${API_URL}/hr-own-payroll/${payroll._id}/pay`,

                    {
                        paymentMethod,

                        paymentReference:
                            paymentReference.trim(),
                    },

                    {
                        headers: {

                            Authorization:
                                token
                                    ? `Bearer ${token}`
                                    : undefined,

                            "Content-Type":
                                "application/json",
                        },

                        withCredentials:
                            true,
                    }
                );


            if (
                response?.data?.success
            ) {

                setSuccess(
                    response?.data?.message ||
                    "HR payroll paid successfully."
                );


                // -----------------------------------------
                // Notify parent
                // -----------------------------------------

                if (
                    typeof onSuccess ===
                    "function"
                ) {

                    await onSuccess(
                        response.data
                    );
                }


                // -----------------------------------------
                // Close after success
                // -----------------------------------------

                setTimeout(() => {

                    onClose?.();

                }, 900);

            } else {

                setError(
                    response?.data?.message ||
                    "Payment failed."
                );
            }

        } catch (err) {

            console.error(
                "HR PAYROLL PAYMENT ERROR:",
                err
            );


            setError(

                err?.response?.data?.message ||

                err?.response?.data?.error ||

                "Failed to process HR payroll payment."
            );

        } finally {

            setLoading(false);
        }
    };


    // =================================================
    // DON'T RENDER
    // =================================================

    if (
        !isOpen ||
        !payroll
    ) {

        return null;
    }


    // =================================================
    // VALUES
    // =================================================

    const hrName =
        getHRName(payroll);


    const hrEmail =
        getHREmail(payroll);


    const hrRole =
        getHRRole(payroll);


    const month =
        getMonthName(
            payroll.month
        );


    const year =
        payroll.year ||
        "—";


    const grossSalary =
        Number(
            payroll.grossSalary ||
            0
        );


    const totalDeductions =
        Number(
            payroll.totalDeductions ||
            0
        );


    const netSalary =
        Number(
            payroll.netSalary ||
            0
        );


    // =================================================
    // RENDER
    // =================================================

    return (

        <div
            className="hr-payroll-payment-overlay"
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
                className="hr-payroll-payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hr-payroll-payment-title"
            >

                {/* ===================================== */}
                {/* HEADER */}
                {/* ===================================== */}

                <div className="hr-payroll-payment-header">

                    <div className="hr-payroll-payment-title-wrap">

                        <div className="hr-payroll-payment-icon">

                            <WalletCards
                                size={21}
                            />

                        </div>

                        <div>

                            <h2
                                id="hr-payroll-payment-title"
                            >
                                Pay HR Payroll
                            </h2>

                            <p>
                                Direct HR salary payment
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="hr-payroll-payment-close"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Close"
                    >

                        <X
                            size={20}
                        />

                    </button>

                </div>


                {/* ===================================== */}
                {/* DIRECT PAYMENT NOTICE */}
                {/* ===================================== */}

                <div className="hr-payroll-direct-notice">

                    <div className="hr-payroll-direct-notice-icon">

                        <CheckCircle2
                            size={18}
                        />

                    </div>

                    <div>

                        <strong>
                            Direct Payment
                        </strong>

                        <span>
                            Super Admin can pay HR payroll directly without approval.
                        </span>

                    </div>

                </div>


                {/* ===================================== */}
                {/* BODY */}
                {/* ===================================== */}

                <div className="hr-payroll-payment-body">


                    {/* ================================= */}
                    {/* HR INFORMATION */}
                    {/* ================================= */}

                    <section className="hr-payroll-payment-section">

                        <div className="hr-payroll-payment-section-title">

                            <UserRound
                                size={17}
                            />

                            <span>
                                HR Information
                            </span>

                        </div>


                        <div className="hr-payroll-employee-card">

                            <div className="hr-payroll-avatar">

                                {
                                    payroll?.hr?.profileImage ||
                                    payroll?.user?.profileImage ||
                                    payroll?.employee?.profileImage
                                ? (

                                    <img
                                        src={
                                            payroll?.hr?.profileImage ||
                                            payroll?.user?.profileImage ||
                                            payroll?.employee?.profileImage
                                        }
                                        alt={hrName}
                                    />

                                ) : (

                                    <UserRound
                                        size={23}
                                    />

                                )}

                            </div>


                            <div className="hr-payroll-employee-info">

                                <strong>
                                    {hrName}
                                </strong>

                                <span>
                                    {hrEmail}
                                </span>

                                <small>
                                    {hrRole}
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* ================================= */}
                    {/* PAYROLL PERIOD */}
                    {/* ================================= */}

                    <section className="hr-payroll-payment-section">

                        <div className="hr-payroll-payment-section-title">

                            <CalendarDays
                                size={17}
                            />

                            <span>
                                Payroll Period
                            </span>

                        </div>


                        <div className="hr-payroll-period-grid">

                            <div className="hr-payroll-info-box">

                                <span>
                                    Month
                                </span>

                                <strong>
                                    {month}
                                </strong>

                            </div>


                            <div className="hr-payroll-info-box">

                                <span>
                                    Year
                                </span>

                                <strong>
                                    {year}
                                </strong>

                            </div>


                            <div className="hr-payroll-info-box">

                                <span>
                                    Status
                                </span>

                                <strong className="hr-payroll-status-paid-ready">

                                    {
                                        payroll.status ===
                                        "PAID"
                                            ? "PAID"
                                            : "READY TO PAY"
                                    }

                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* ================================= */}
                    {/* SALARY SUMMARY */}
                    {/* ================================= */}

                    <section className="hr-payroll-payment-section">

                        <div className="hr-payroll-payment-section-title">

                            <IndianRupee
                                size={17}
                            />

                            <span>
                                Salary Summary
                            </span>

                        </div>


                        <div className="hr-payroll-summary-grid">

                            <div className="hr-payroll-summary-item">

                                <span>
                                    Gross Salary
                                </span>

                                <strong>
                                    ₹ {formatMoney(grossSalary)}
                                </strong>

                            </div>


                            <div className="hr-payroll-summary-item deduction">

                                <span>
                                    Total Deductions
                                </span>

                                <strong>
                                    ₹ {formatMoney(totalDeductions)}
                                </strong>

                            </div>


                            <div className="hr-payroll-summary-item net">

                                <span>
                                    Net Payable
                                </span>

                                <strong>
                                    ₹ {formatMoney(netSalary)}
                                </strong>

                            </div>

                        </div>


                        <div className="hr-payroll-net-pay-box">

                            <div>

                                <span>
                                    Amount to Pay
                                </span>

                                <small>
                                    Final net salary
                                </small>

                            </div>


                            <strong>
                                ₹ {formatMoney(netSalary)}
                            </strong>

                        </div>

                    </section>


                    {/* ================================= */}
                    {/* PAYMENT METHOD */}
                    {/* ================================= */}

                    <section className="hr-payroll-payment-section">

                        <div className="hr-payroll-payment-section-title">

                            <CreditCard
                                size={17}
                            />

                            <span>
                                Payment Details
                            </span>

                        </div>


                        <div className="hr-payroll-payment-method-grid">

                            {/* BANK */}

                            <button
                                type="button"
                                className={
                                    `hr-payroll-method-card ${
                                        paymentMethod ===
                                        "BANK_TRANSFER"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setPaymentMethod(
                                        "BANK_TRANSFER"
                                    )
                                }
                                disabled={loading}
                            >

                                <Building2
                                    size={20}
                                />

                                <span>
                                    Bank Transfer
                                </span>

                            </button>


                            {/* CASH */}

                            <button
                                type="button"
                                className={
                                    `hr-payroll-method-card ${
                                        paymentMethod ===
                                        "CASH"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setPaymentMethod(
                                        "CASH"
                                    )
                                }
                                disabled={loading}
                            >

                                <Banknote
                                    size={20}
                                />

                                <span>
                                    Cash
                                </span>

                            </button>


                            {/* CHEQUE */}

                            <button
                                type="button"
                                className={
                                    `hr-payroll-method-card ${
                                        paymentMethod ===
                                        "CHEQUE"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setPaymentMethod(
                                        "CHEQUE"
                                    )
                                }
                                disabled={loading}
                            >

                                <FileText
                                    size={20}
                                />

                                <span>
                                    Cheque
                                </span>

                            </button>


                            {/* OTHER */}

                            <button
                                type="button"
                                className={
                                    `hr-payroll-method-card ${
                                        paymentMethod ===
                                        "OTHER"
                                            ? "active"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    setPaymentMethod(
                                        "OTHER"
                                    )
                                }
                                disabled={loading}
                            >

                                <WalletCards
                                    size={20}
                                />

                                <span>
                                    Other
                                </span>

                            </button>

                        </div>


                        {/* REFERENCE */}

                        <div className="hr-payroll-reference-field">

                            <label>
                                Payment Reference
                                <span>
                                    Optional
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    paymentReference
                                }
                                onChange={(event) =>
                                    setPaymentReference(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    paymentMethod ===
                                    "BANK_TRANSFER"
                                        ? "Enter transaction / UTR number"
                                        : paymentMethod ===
                                          "CHEQUE"
                                            ? "Enter cheque number"
                                            : "Enter payment reference"
                                }
                                disabled={loading}
                                maxLength={100}
                            />

                        </div>

                    </section>


                    {/* ================================= */}
                    {/* ERROR */}
                    {/* ================================= */}

                    {
                        error && (

                            <div className="hr-payroll-payment-alert error">

                                <AlertCircle
                                    size={18}
                                />

                                <span>
                                    {error}
                                </span>

                            </div>

                        )
                    }


                    {/* ================================= */}
                    {/* SUCCESS */}
                    {/* ================================= */}

                    {
                        success && (

                            <div className="hr-payroll-payment-alert success">

                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    {success}
                                </span>

                            </div>

                        )
                    }

                </div>


                {/* ===================================== */}
                {/* FOOTER */}
                {/* ===================================== */}

                <div className="hr-payroll-payment-footer">

                    <button
                        type="button"
                        className="hr-payroll-payment-cancel-btn"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="hr-payroll-payment-submit-btn"
                        onClick={handlePayment}
                        disabled={
                            loading ||
                            payroll.status === "PAID"
                        }
                    >

                        {
                            loading ? (

                                <>
                                    <Loader2
                                        size={18}
                                        className="hr-payroll-spinner"
                                    />

                                    Processing...

                                </>

                            ) : payroll.status === "PAID" ? (

                                <>
                                    <CheckCircle2
                                        size={18}
                                    />

                                    Already Paid
                                </>

                            ) : (

                                <>
                                    <WalletCards
                                        size={18}
                                    />

                                    Pay ₹ {formatMoney(netSalary)}
                                </>

                            )
                        }

                    </button>

                </div>

            </div>

        </div>
    );
};


export default HRPayrollPaymentModal;