import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Save,
    RefreshCw,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import employeeApi
    from "../../services/employeeApi";
import "./EmployeeEdit.css";

const EmployeeEdit = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeId: "",
        department: "",
        designation: "",
        gender: "",
        dateOfBirth: "",
        joiningDate: "",
        address: "",
    });


    /* =====================================================
       LOAD
    ===================================================== */

    useEffect(() => {

        const loadEmployee = async () => {

            try {

                const response =
                    await employeeApi.getById(id);

                if (response.success) {

                    const employee =
                        response.employee;

                    setForm({

                        firstName:
                            employee.firstName || "",

                        lastName:
                            employee.lastName || "",

                        email:
                            employee.email || "",

                        phone:
                            employee.phone || "",

                        employeeId:
                            employee.employeeId || "",

                        department:
                            employee.department || "",

                        designation:
                            employee.designation || "",

                        gender:
                            employee.gender || "",

                        dateOfBirth:
                            employee.dateOfBirth
                                ? employee.dateOfBirth
                                    .split("T")[0]
                                : "",

                        joiningDate:
                            employee.joiningDate
                                ? employee.joiningDate
                                    .split("T")[0]
                                : "",

                        address:
                            employee.address || "",

                    });

                }

            } catch (error) {

                console.error(
                    "Failed to load employee:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to load employee"
                );

            } finally {

                setLoading(false);

            }

        };


        loadEmployee();

    }, [id]);


    /* =====================================================
       INPUT
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            const response =
                await employeeApi.update(
                    id,
                    form
                );


            if (response.success) {

                alert(
                    response.message ||
                    "Employee updated successfully"
                );

                navigate(
                    `/hr/employees/${id}`
                );

            }

        } catch (error) {

            console.error(
                "Employee update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update employee"
            );

        } finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <div className="employee-edit-loading">

                <RefreshCw
                    size={25}
                    className="spin"
                />

                Loading employee...

            </div>

        );

    }


    return (

        <div className="employee-edit-page">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="employee-edit-header">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/hr/employees/${id}`
                        )
                    }
                    className="back-button"
                >

                    <ArrowLeft size={18} />

                    Back

                </button>


                <div>

                    <h1>
                        Edit Employee
                    </h1>

                    <p>
                        Update employee information.
                    </p>

                </div>

            </div>


            {/* =================================================
               FORM
            ================================================= */}

            <form
                className="employee-edit-form"
                onSubmit={handleSubmit}
            >

                <div className="employee-form-section">

                    <h2>
                        Personal Information
                    </h2>


                    <div className="employee-form-grid">

                        <label>

                            <span>
                                First Name
                            </span>

                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </label>


                        <label>

                            <span>
                                Last Name
                            </span>

                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={
                                    handleChange
                                }
                            />

                        </label>


                        <label>

                            <span>
                                Email
                            </span>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </label>


                        <label>

                            <span>
                                Phone
                            </span>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={
                                    handleChange
                                }
                            />

                        </label>


                        <label>

                            <span>
                                Gender
                            </span>

                            <select
                                name="gender"
                                value={form.gender}
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

                        </label>


                        <label>

                            <span>
                                Date of Birth
                            </span>

                            <input
                                type="date"
                                name="dateOfBirth"
                                value={
                                    form.dateOfBirth
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </label>

                    </div>

                </div>


                <div className="employee-form-section">

                    <h2>
                        Work Information
                    </h2>


                    <div className="employee-form-grid">

                        <label>

                            <span>
                                Employee ID
                            </span>

                            <input
                                name="employeeId"
                                value={
                                    form.employeeId
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </label>


                        <label>

                            <span>
                                Department
                            </span>

                            <input
                                name="department"
                                value={
                                    form.department
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </label>


                        <label>

                            <span>
                                Designation
                            </span>

                            <input
                                name="designation"
                                value={
                                    form.designation
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </label>


                        <label>

                            <span>
                                Joining Date
                            </span>

                            <input
                                type="date"
                                name="joiningDate"
                                value={
                                    form.joiningDate
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </label>

                    </div>

                </div>


                <div className="employee-form-section">

                    <h2>
                        Address
                    </h2>


                    <label>

                        <span>
                            Address
                        </span>

                        <textarea
                            name="address"
                            value={
                                form.address
                            }
                            onChange={
                                handleChange
                            }
                            rows="4"
                        />

                    </label>

                </div>


                {/* =================================================
                   ACTIONS
                ================================================= */}

                <div className="employee-form-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/hr/employees/${id}`
                            )
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="save-button"
                        disabled={saving}
                    >

                        {saving ? (

                            <RefreshCw
                                size={17}
                                className="spin"
                            />

                        ) : (

                            <Save size={17} />

                        )}

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>

    );

};


export default EmployeeEdit;