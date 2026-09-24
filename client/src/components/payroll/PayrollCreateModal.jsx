import {
    useEffect,
    useState,
} from "react";

import {
    X,
    UserRound,
    CalendarDays,
    Loader2,
    Calculator,
} from "lucide-react";

import axios from "axios";

import "./css/PayrollCreateModal.css"
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
    {
        value: 1,
        label: "January",
    },
    {
        value: 2,
        label: "February",
    },
    {
        value: 3,
        label: "March",
    },
    {
        value: 4,
        label: "April",
    },
    {
        value: 5,
        label: "May",
    },
    {
        value: 6,
        label: "June",
    },
    {
        value: 7,
        label: "July",
    },
    {
        value: 8,
        label: "August",
    },
    {
        value: 9,
        label: "September",
    },
    {
        value: 10,
        label: "October",
    },
    {
        value: 11,
        label: "November",
    },
    {
        value: 12,
        label: "December",
    },
];


// =====================================================
// COMPONENT
// =====================================================

const PayrollCreateModal = ({
    isOpen,
    onClose,
    onSuccess,
}) => {

    // =================================================
    // STATE
    // =================================================

    const [employees, setEmployees] =
        useState([]);

    const [loadingEmployees, setLoadingEmployees] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const currentDate =
        new Date();

    const [formData, setFormData] =
        useState({

            employee: "",

            month:
                currentDate.getMonth() + 1,

            year:
                currentDate.getFullYear(),

        });


    // =================================================
    // LOAD EMPLOYEES
    // =================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        loadEmployees();

    }, [isOpen]);


    // =================================================
    // LOAD EMPLOYEES
    // =================================================

    const loadEmployees = async () => {

        try {

            setLoadingEmployees(true);

            setError("");

            const response =
                await axios.get(
                    `${API_URL}/employees`,
                    {
                        withCredentials: true,
                    }
                );


            const data =
                response?.data;


            const employeeList =
                data?.employees ||
                data?.data ||
                [];


            setEmployees(
                Array.isArray(employeeList)
                    ? employeeList
                    : []
            );

        } catch (err) {

            console.error(
                "LOAD PAYROLL EMPLOYEES ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load employees."
            );

        } finally {

            setLoadingEmployees(false);
        }
    };


    // =================================================
    // CHANGE HANDLER
    // =================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            previous => ({
                ...previous,

                [name]:
                    name === "month" ||
                    name === "year"
                        ? Number(value)
                        : value,
            })
        );


        setError("");

        setSuccess("");
    };


    // =================================================
    // CLOSE
    // =================================================

    const handleClose = () => {

        if (creating) {
            return;
        }

        setError("");

        setSuccess("");

        setFormData({

            employee: "",

            month:
                currentDate.getMonth() + 1,

            year:
                currentDate.getFullYear(),

        });

        onClose?.();
    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setError("");

        setSuccess("");


        // =============================================
        // VALIDATION
        // =============================================

        if (!formData.employee) {

            setError(
                "Please select an employee."
            );

            return;
        }


        if (
            !formData.month ||
            formData.month < 1 ||
            formData.month > 12
        ) {

            setError(
                "Please select a valid payroll month."
            );

            return;
        }


        if (
            !formData.year ||
            formData.year < 2000
        ) {

            setError(
                "Please enter a valid payroll year."
            );

            return;
        }


        try {

            setCreating(true);


            // =========================================
            // CREATE PAYROLL
            // =========================================

            const response =
                await axios.post(

                    `${API_URL}/payroll`,

                    {
                        employee:
                            formData.employee,

                        month:
                            formData.month,

                        year:
                            formData.year,
                    },

                    {
                        withCredentials: true,
                    }
                );


            // =========================================
            // SUCCESS
            // =========================================

            const message =
                response?.data?.message ||
                "Payroll created successfully.";

            setSuccess(message);


            // =========================================
            // CALLBACK
            // =========================================

            if (
                typeof onSuccess ===
                "function"
            ) {

                await onSuccess(
                    response?.data?.payroll ||
                    response?.data?.data ||
                    response?.data
                );
            }


            // =========================================
            // CLOSE AFTER SUCCESS
            // =========================================

            setTimeout(() => {

                handleClose();

            }, 600);

        } catch (err) {

            console.error(
                "CREATE PAYROLL ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Failed to create payroll."
            );

        } finally {

            setCreating(false);
        }
    };


    // =================================================
    // DO NOT RENDER
    // =================================================

    if (!isOpen) {
        return null;
    }


    // =================================================
    // SELECTED EMPLOYEE
    // =================================================

    const selectedEmployee =
        employees.find(
            employee =>
                String(
                    employee._id
                ) ===
                String(
                    formData.employee
                )
        );


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
                className="payroll-create-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="payroll-create-title"
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="payroll-modal-header">

                    <div className="payroll-modal-title-area">

                        <div className="payroll-modal-icon">

                            <Calculator
                                size={21}
                            />

                        </div>

                        <div>

                            <h2
                                id="payroll-create-title"
                            >
                                Create Payroll
                            </h2>

                            <p>
                                Generate monthly payroll
                                from employee records.
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="payroll-modal-close"
                        onClick={handleClose}
                        disabled={creating}
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
                    className="payroll-create-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (

                        <div className="payroll-form-error">

                            {error}

                        </div>

                    )}


                    {/* =================================
                        SUCCESS
                    ================================= */}

                    {success && (

                        <div className="payroll-form-success">

                            {success}

                        </div>

                    )}


                    {/* =================================
                        EMPLOYEE
                    ================================= */}

                    <div className="payroll-form-group">

                        <label htmlFor="payroll-employee">

                            <UserRound
                                size={16}
                            />

                            Employee

                        </label>


                        <select
                            id="payroll-employee"
                            name="employee"
                            value={
                                formData.employee
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                loadingEmployees ||
                                creating
                            }
                        >

                            <option value="">
                                {loadingEmployees
                                    ? "Loading employees..."
                                    : "Select employee"}
                            </option>


                            {employees
                                .filter(
                                    employee =>
                                        employee.isActive !==
                                        false
                                )
                                .map(
                                    employee => (

                                        <option
                                            key={
                                                employee._id
                                            }
                                            value={
                                                employee._id
                                            }
                                        >

                                            {employee.employeeId ||
                                                employee.empCode ||
                                                "Employee"}{" "}
                                            -{" "}
                                            {employee.firstName ||
                                                employee.name ||
                                                ""}{" "}
                                            {employee.lastName ||
                                                ""}

                                        </option>

                                    )
                                )}

                        </select>

                    </div>


                    {/* =================================
                        SELECTED EMPLOYEE PREVIEW
                    ================================= */}

                    {selectedEmployee && (

                        <div className="payroll-selected-employee">

                            <div className="payroll-selected-avatar">

                                {selectedEmployee.profileImage ? (

                                    <img
                                        src={
                                            selectedEmployee.profileImage
                                        }
                                        alt=""
                                    />

                                ) : (

                                    <UserRound
                                        size={21}
                                    />

                                )}

                            </div>


                            <div className="payroll-selected-info">

                                <strong>

                                    {selectedEmployee.firstName ||
                                        selectedEmployee.name ||
                                        ""}{" "}

                                    {selectedEmployee.lastName ||
                                        ""}

                                </strong>

                                <span>

                                    {selectedEmployee.employeeId ||
                                        selectedEmployee.empCode ||
                                        "No employee ID"}

                                </span>

                                <span>

                                    {selectedEmployee.department ||
                                        "No department"}

                                    {" • "}

                                    {selectedEmployee.designation ||
                                        "No designation"}

                                </span>

                            </div>

                        </div>

                    )}


                    {/* =================================
                        PERIOD
                    ================================= */}

                    <div className="payroll-period-grid">

                        {/* MONTH */}

                        <div className="payroll-form-group">

                            <label htmlFor="payroll-month">

                                <CalendarDays
                                    size={16}
                                />

                                Month

                            </label>


                            <select
                                id="payroll-month"
                                name="month"
                                value={
                                    formData.month
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    creating
                                }
                            >

                                {MONTHS.map(
                                    month => (

                                        <option
                                            key={
                                                month.value
                                            }
                                            value={
                                                month.value
                                            }
                                        >

                                            {
                                                month.label
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* YEAR */}

                        <div className="payroll-form-group">

                            <label htmlFor="payroll-year">

                                <CalendarDays
                                    size={16}
                                />

                                Year

                            </label>


                            <input
                                id="payroll-year"
                                type="number"
                                name="year"
                                min="2000"
                                max="2100"
                                value={
                                    formData.year
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    creating
                                }
                            />

                        </div>

                    </div>


                    {/* =================================
                        INFORMATION
                    ================================= */}

                    <div className="payroll-calculation-info">

                        <Calculator
                            size={18}
                        />

                        <div>

                            <strong>
                                Automatic Calculation
                            </strong>

                            <p>
                                Attendance, approved
                                leave, salary structure,
                                overtime and deductions
                                will be calculated by
                                the payroll server.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        FOOTER
                    ================================= */}

                    <div className="payroll-modal-footer">

                        <button
                            type="button"
                            className="payroll-btn payroll-btn-secondary"
                            onClick={
                                handleClose
                            }
                            disabled={
                                creating
                            }
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="payroll-btn payroll-btn-primary"
                            disabled={
                                creating ||
                                loadingEmployees
                            }
                        >

                            {creating ? (

                                <>
                                    <Loader2
                                        size={17}
                                        className="payroll-spinner"
                                    />

                                    Calculating...

                                </>

                            ) : (

                                <>
                                    <Calculator
                                        size={17}
                                    />

                                    Create Payroll

                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default PayrollCreateModal;