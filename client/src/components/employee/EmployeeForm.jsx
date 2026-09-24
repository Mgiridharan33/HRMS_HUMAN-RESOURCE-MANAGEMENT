import {
    useEffect,
    useState,
} from "react";

import { X } from "lucide-react";


const EmployeeForm = ({
    isOpen,
    onClose,
    onSubmit,
    editingEmployee,
    hrList,
    loading,
}) => {


    const [formData, setFormData] =
        useState({

            employeeId: "",

            firstName: "",

            lastName: "",

            email: "",

            phone: "",

            dateOfBirth: "",

            gender: "Other",

            address: "",

            department: "",

            designation: "",

            joiningDate: "",

            employmentType:
                "Full Time",

            reportingHR: "",

            password: "",

        });


    /*
    =====================================================
    LOAD EDIT DATA
    =====================================================
    */

    useEffect(() => {

        if (editingEmployee) {

            setFormData({

                employeeId:
                    editingEmployee.employeeId ||
                    "",

                firstName:
                    editingEmployee.firstName ||
                    "",

                lastName:
                    editingEmployee.lastName ||
                    "",

                email:
                    editingEmployee.email ||
                    "",

                phone:
                    editingEmployee.phone ||
                    "",

                dateOfBirth:
                    editingEmployee.dateOfBirth
                        ? editingEmployee.dateOfBirth.slice(
                              0,
                              10
                          )
                        : "",

                gender:
                    editingEmployee.gender ||
                    "Other",

                address:
                    editingEmployee.address ||
                    "",

                department:
                    editingEmployee.department ||
                    "",

                designation:
                    editingEmployee.designation ||
                    "",

                joiningDate:
                    editingEmployee.joiningDate
                        ? editingEmployee.joiningDate.slice(
                              0,
                              10
                          )
                        : "",

                employmentType:
                    editingEmployee.employmentType ||
                    "Full Time",

                reportingHR:
                    editingEmployee.reportingHR
                        ?._id ||
                    "",

                password: "",
            });

        } else {

            setFormData({

                employeeId: "",

                firstName: "",

                lastName: "",

                email: "",

                phone: "",

                dateOfBirth: "",

                gender: "Other",

                address: "",

                department: "",

                designation: "",

                joiningDate: "",

                employmentType:
                    "Full Time",

                reportingHR: "",

                password: "",
            });

        }

    }, [
        editingEmployee,
        isOpen,
    ]);


    /*
    =====================================================
    INPUT CHANGE
    =====================================================
    */

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setFormData(
            (previous) => ({
                ...previous,

                [name]: value,
            })
        );
    };


    /*
    =====================================================
    SUBMIT
    =====================================================
    */

    const handleSubmit = (e) => {

        e.preventDefault();

        onSubmit(formData);
    };


    if (!isOpen) {

        return null;
    }


    return (
        <div className="employee-modal-overlay">

            <div className="employee-modal">

                {/* HEADER */}

                <div className="employee-modal-header">

                    <div>

                        <h2>

                            {
                                editingEmployee
                                    ? "Edit Employee"
                                    : "Add New Employee"
                            }

                        </h2>

                        <p>

                            {
                                editingEmployee
                                    ? "Update employee information"
                                    : "Create a new employee account"
                            }

                        </p>

                    </div>


                    <button
                        type="button"
                        className="employee-modal-close"
                        onClick={onClose}
                        disabled={loading}
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* FORM */}

                <form
                    className="employee-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* =================================
                        PERSONAL INFORMATION
                    ================================= */}

                    <div className="employee-section-title">

                        Personal Information

                    </div>


                    <div className="employee-form-grid">

                        {/* EMPLOYEE ID */}

                        <div className="employee-form-group">

                            <label>
                                Employee ID
                            </label>

                            <input
                                type="text"
                                name="employeeId"
                                value={
                                    formData.employeeId
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="EMP001"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="employee-form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="employee@example.com"
                                required
                            />

                        </div>


                        {/* FIRST NAME */}

                        <div className="employee-form-group">

                            <label>
                                First Name
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                value={
                                    formData.firstName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="First name"
                                required
                            />

                        </div>


                        {/* LAST NAME */}

                        <div className="employee-form-group">

                            <label>
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                value={
                                    formData.lastName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Last name"
                                required
                            />

                        </div>


                        {/* PHONE */}

                        <div className="employee-form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="9876543210"
                            />

                        </div>


                        {/* DOB */}

                        <div className="employee-form-group">

                            <label>
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dateOfBirth"
                                value={
                                    formData.dateOfBirth
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* GENDER */}

                        <div className="employee-form-group">

                            <label>
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={
                                    formData.gender
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* ADDRESS */}

                        <div className="employee-form-group full">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Employee address"
                                rows="3"
                            />

                        </div>

                    </div>


                    {/* =================================
                        JOB INFORMATION
                    ================================= */}

                    <div className="employee-section-title">

                        Job Information

                    </div>


                    <div className="employee-form-grid">

                        {/* DEPARTMENT */}

                        <div className="employee-form-group">

                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={
                                    formData.department
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Development"
                            />

                        </div>


                        {/* DESIGNATION */}

                        <div className="employee-form-group">

                            <label>
                                Designation
                            </label>

                            <input
                                type="text"
                                name="designation"
                                value={
                                    formData.designation
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="MERN Developer"
                            />

                        </div>


                        {/* JOINING DATE */}

                        <div className="employee-form-group">

                            <label>
                                Joining Date
                            </label>

                            <input
                                type="date"
                                name="joiningDate"
                                value={
                                    formData.joiningDate
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        {/* EMPLOYMENT TYPE */}

                        <div className="employee-form-group">

                            <label>
                                Employment Type
                            </label>

                            <select
                                name="employmentType"
                                value={
                                    formData.employmentType
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="Full Time">
                                    Full Time
                                </option>

                                <option value="Part Time">
                                    Part Time
                                </option>

                                <option value="Contract">
                                    Contract
                                </option>

                                <option value="Intern">
                                    Intern
                                </option>

                            </select>

                        </div>


                        {/* REPORTING HR */}

                        <div className="employee-form-group full">

                            <label>
                                Reporting HR
                            </label>

                            <select
                                name="reportingHR"
                                value={
                                    formData.reportingHR
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="">
                                    No HR assigned
                                </option>


                                {hrList.map(
                                    (hr) => (

                                        <option
                                            key={
                                                hr._id
                                            }
                                            value={
                                                hr._id
                                            }
                                        >

                                            {
                                                hr.name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* =================================
                        ACCOUNT
                    ================================= */}

                    <div className="employee-section-title">

                        Account

                    </div>


                    <div className="employee-form-grid">

                        <div className="employee-form-group full">

                            <label>

                                Password

                                {
                                    editingEmployee && (
                                        <span>
                                            {" "}
                                            (leave blank to
                                            keep current
                                            password)
                                        </span>
                                    )
                                }

                            </label>

                            <input
                                type="password"
                                name="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder={
                                    editingEmployee
                                        ? "Enter new password"
                                        : "Enter password"
                                }
                                required={
                                    !editingEmployee
                                }
                            />

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="employee-form-actions">

                        <button
                            type="button"
                            className="employee-cancel-button"
                            onClick={
                                onClose
                            }
                            disabled={
                                loading
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="employee-submit-button"
                            disabled={
                                loading
                            }
                        >

                            {
                                loading
                                    ? "Saving..."
                                    : editingEmployee
                                    ? "Update Employee"
                                    : "Create Employee"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default EmployeeForm;