import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Save,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import employeeApi
    from "../../services/employeeApi";

import "./EmployeeEdit.css";


const EmployeeEdit = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    const [formData, setFormData] =
        useState({

            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            gender: "",
            address: "",

            employeeId: "",
            department: "",
            designation: "",
            joiningDate: "",
            employmentType: "",

            reportingHR: "",

        });


    /*
    =====================================================
    LOAD EMPLOYEE
    =====================================================
    */

    const loadEmployee = async () => {

        try {

            setLoading(true);

            const response =
                await employeeApi.getById(id);


            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Employee not found"
                );
            }


            const employee =
                response.employee;


            setFormData({

                firstName:
                    employee.firstName || "",

                lastName:
                    employee.lastName || "",

                email:
                    employee.email || "",

                phone:
                    employee.phone || "",

                dateOfBirth:
                    employee.dateOfBirth
                        ? employee.dateOfBirth.slice(0, 10)
                        : "",

                gender:
                    employee.gender || "",

                address:
                    employee.address || "",


                employeeId:
                    employee.employeeId || "",

                department:
                    employee.department || "",

                designation:
                    employee.designation || "",

                joiningDate:
                    employee.joiningDate
                        ? employee.joiningDate.slice(0, 10)
                        : "",

                employmentType:
                    employee.employmentType || "",

                reportingHR:
                    employee.reportingHR?._id || "",

            });

        } catch (error) {

            console.error(
                "Load employee error:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to load employee"
            );

            navigate(
                "/super-admin/employees"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadEmployee();

    }, [id]);


    /*
    =====================================================
    HANDLE CHANGE
    =====================================================
    */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            previous => ({

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

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            try {

                setSaving(true);


                const response =
                    await employeeApi.update(
                        id,
                        formData
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to update employee"
                    );
                }


                alert(
                    "Employee updated successfully"
                );


                navigate(
                    `/super-admin/employees/${id}`
                );


            } catch (error) {

                console.error(
                    "Update employee error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update employee"
                );

            } finally {

                setSaving(false);

            }
        };


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (
            <div className="employee-edit-loading">

                Loading employee...

            </div>
        );
    }


    return (

        <div className="employee-edit-page">


            {/* =========================================
                BACK
            ========================================= */}

            <button
                type="button"
                className="employee-edit-back"
                onClick={() =>
                    navigate(
                        `/super-admin/employees/${id}`
                    )
                }
            >

                <ArrowLeft size={17} />

                Back to Employee

            </button>


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="employee-edit-header">

                <div>

                    <h1>
                        Edit Employee
                    </h1>

                    <p>
                        Update employee information
                        and job details.
                    </p>

                </div>

            </div>


            {/* =========================================
                FORM
            ========================================= */}

            <form
                className="employee-edit-form"
                onSubmit={handleSubmit}
            >


                {/* =====================================
                    PERSONAL INFORMATION
                ===================================== */}

                <section className="employee-edit-card">

                    <div className="employee-edit-card-header">

                        <h2>
                            Personal Information
                        </h2>

                        <p>
                            Basic employee information
                        </p>

                    </div>


                    <div className="employee-edit-grid">


                        <div className="employee-edit-field">

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
                                required
                            />

                        </div>


                        <div className="employee-edit-field">

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
                                required
                            />

                        </div>


                        <div className="employee-edit-field">

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
                                required
                            />

                        </div>


                        <div className="employee-edit-field">

                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        <div className="employee-edit-field">

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


                        <div className="employee-edit-field">

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

                                <option value="">
                                    Select Gender
                                </option>

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


                        <div className="employee-edit-field full">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                rows="3"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================
                    JOB INFORMATION
                ===================================== */}

                <section className="employee-edit-card">

                    <div className="employee-edit-card-header">

                        <h2>
                            Job Information
                        </h2>

                        <p>
                            Employment and organization details
                        </p>

                    </div>


                    <div className="employee-edit-grid">


                        <div className="employee-edit-field">

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
                                required
                            />

                        </div>


                        <div className="employee-edit-field">

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
                            />

                        </div>


                        <div className="employee-edit-field">

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
                            />

                        </div>


                        <div className="employee-edit-field">

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


                        <div className="employee-edit-field">

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

                                <option value="">
                                    Select Type
                                </option>

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


                        <div className="employee-edit-field">

                            <label>
                                Reporting HR ID
                            </label>

                            <input
                                type="text"
                                name="reportingHR"
                                value={
                                    formData.reportingHR
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="HR MongoDB ID"
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================
                    ACTIONS
                ===================================== */}

                <div className="employee-edit-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/super-admin/employees/${id}`
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="save"
                        disabled={saving}
                    >

                        <Save size={16} />

                        {
                            saving
                                ? "Saving..."
                                : "Save Changes"
                        }

                    </button>

                </div>

            </form>

        </div>
    );
};


export default EmployeeEdit;