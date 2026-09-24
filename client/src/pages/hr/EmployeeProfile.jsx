import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Edit3,
    Mail,
    Phone,
    Building2,
    BriefcaseBusiness,
    CalendarDays,
    UserRound,
    ShieldCheck,
    RefreshCw,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import employeeApi
    from "../../services/employeeApi";
import "./EmployeeProfile.css";

const EmployeeProfile = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [employee, setEmployee] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    /* =====================================================
       LOAD EMPLOYEE
    ===================================================== */

    const loadEmployee = async () => {

        try {

            setLoading(true);

            const response =
                await employeeApi.getById(id);

            if (response.success) {

                setEmployee(
                    response.employee
                );

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


    useEffect(() => {

        loadEmployee();

    }, [id]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="employee-profile-loading">

                <RefreshCw
                    size={26}
                    className="spin"
                />

                <span>
                    Loading employee...
                </span>

            </div>

        );

    }


    /* =====================================================
       NOT FOUND
    ===================================================== */

    if (!employee) {

        return (

            <div className="employee-profile-empty">

                <UserRound size={40} />

                <h2>
                    Employee not found
                </h2>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/hr/employees")
                    }
                >
                    Back to Employees
                </button>

            </div>

        );

    }


    const fullName =
        `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();


    const initials =
        fullName
            .split(" ")
            .map(
                (name) =>
                    name.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


    return (

        <div className="employee-profile-page">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="employee-profile-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/hr/employees")
                    }
                >

                    <ArrowLeft size={18} />

                    Back

                </button>


                <button
                    type="button"
                    className="edit-profile-button"
                    onClick={() =>
                        navigate(
                            `/hr/employees/${id}/edit`
                        )
                    }
                >

                    <Edit3 size={17} />

                    Edit Employee

                </button>

            </div>


            {/* =================================================
               PROFILE CARD
            ================================================= */}

            <div className="employee-profile-card">

                <div className="employee-profile-main">

                    <div className="employee-profile-avatar">

                        {employee.profileImage ? (

                            <img
                                src={
                                    employee.profileImage
                                }
                                alt={fullName}
                            />

                        ) : (

                            initials || "E"

                        )}

                    </div>


                    <div className="employee-profile-name">

                        <h1>
                            {fullName || "Employee"}
                        </h1>

                        <p>
                            {employee.designation ||
                                "Employee"}
                        </p>

                        <span
                            className={
                                employee.isActive
                                    ? "employee-status active"
                                    : "employee-status inactive"
                            }
                        >

                            <span />

                            {employee.isActive
                                ? "Active"
                                : "Inactive"}

                        </span>

                    </div>

                </div>


                <div className="employee-profile-id">

                    <span>
                        Employee ID
                    </span>

                    <strong>
                        {employee.employeeId ||
                            "—"}
                    </strong>

                </div>

            </div>


            {/* =================================================
               INFORMATION
            ================================================= */}

            <div className="employee-profile-grid">


                {/* PERSONAL INFORMATION */}

                <div className="employee-info-card">

                    <div className="employee-info-header">

                        <UserRound size={19} />

                        <h2>
                            Personal Information
                        </h2>

                    </div>


                    <div className="employee-info-list">

                        <div>

                            <span>
                                Email
                            </span>

                            <strong>
                                {employee.email ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>
                                {employee.phone ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {employee.dateOfBirth
                                    ? new Date(
                                        employee.dateOfBirth
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Gender
                            </span>

                            <strong>
                                {employee.gender ||
                                    "—"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* WORK INFORMATION */}

                <div className="employee-info-card">

                    <div className="employee-info-header">

                        <BriefcaseBusiness
                            size={19}
                        />

                        <h2>
                            Work Information
                        </h2>

                    </div>


                    <div className="employee-info-list">

                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {employee.department ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Designation
                            </span>

                            <strong>
                                {employee.designation ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Reporting HR
                            </span>

                            <strong>
                                {employee.reportingHR
                                    ?.name ||
                                    "Not assigned"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Joining Date
                            </span>

                            <strong>
                                {employee.joiningDate
                                    ? new Date(
                                        employee.joiningDate
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* CONTACT */}

                <div className="employee-info-card">

                    <div className="employee-info-header">

                        <Phone size={19} />

                        <h2>
                            Contact Information
                        </h2>

                    </div>


                    <div className="employee-contact-list">

                        <a
                            href={
                                employee.email
                                    ? `mailto:${employee.email}`
                                    : "#"
                            }
                        >

                            <Mail size={17} />

                            {employee.email ||
                                "No email"}

                        </a>


                        <a
                            href={
                                employee.phone
                                    ? `tel:${employee.phone}`
                                    : "#"
                            }
                        >

                            <Phone size={17} />

                            {employee.phone ||
                                "No phone"}

                        </a>

                    </div>

                </div>


                {/* ACCOUNT */}

                <div className="employee-info-card">

                    <div className="employee-info-header">

                        <ShieldCheck
                            size={19}
                        />

                        <h2>
                            Account Information
                        </h2>

                    </div>


                    <div className="employee-info-list">

                        <div>

                            <span>
                                Account Status
                            </span>

                            <strong>
                                {employee.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Role
                            </span>

                            <strong>
                                {employee.role ||
                                    "EMPLOYEE"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Created
                            </span>

                            <strong>
                                {employee.createdAt
                                    ? new Date(
                                        employee.createdAt
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Last Updated
                            </span>

                            <strong>
                                {employee.updatedAt
                                    ? new Date(
                                        employee.updatedAt
                                    ).toLocaleDateString()
                                    : "—"}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default EmployeeProfile;