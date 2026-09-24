import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Edit3,
    Mail,
    Phone,
    CalendarDays,
    MapPin,
    BriefcaseBusiness,
    UserRound,
    ShieldCheck,
    Power,
    Trash2,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import employeeApi
    from "../../services/employeeApi";


const EmployeeProfile = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    const [employee, setEmployee] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


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


            if (response.success) {

                setEmployee(
                    response.employee
                );

            }

        } catch (error) {

            console.error(
                "Load employee error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employee"
            );

            navigate(
                "/super-admin/employees"
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    =====================================================
    INITIAL LOAD
    =====================================================
    */

    useEffect(() => {

        loadEmployee();

    }, [id]);


    /*
    =====================================================
    TOGGLE STATUS
    =====================================================
    */

    const handleToggleStatus =
        async () => {

            if (!employee) {
                return;
            }


            const action =
                employee.isActive
                    ? "deactivate"
                    : "activate";


            const confirmed =
                window.confirm(
                    `Are you sure you want to ${action} this employee?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await employeeApi.toggleStatus(
                        employee._id
                    );


                if (response.success) {

                    alert(
                        response.message
                    );

                    await loadEmployee();

                }

            } catch (error) {

                console.error(
                    "Status update error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to update status"
                );
            }
        };


    /*
    =====================================================
    DELETE
    =====================================================
    */

    const handleDelete =
        async () => {

            if (!employee) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await employeeApi.delete(
                        employee._id
                    );


                if (response.success) {

                    alert(
                        response.message
                    );

                    navigate(
                        "/super-admin/employees"
                    );

                }

            } catch (error) {

                console.error(
                    "Delete employee error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to delete employee"
                );
            }
        };


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {

        return (
            <div className="employee-profile-loading">

                Loading employee...

            </div>
        );
    }


    /*
    =====================================================
    NOT FOUND
    =====================================================
    */

    if (!employee) {

        return (
            <div className="employee-profile-loading">

                Employee not found.

            </div>
        );
    }


    /*
    =====================================================
    DATA
    =====================================================
    */

    const fullName =
        `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();


    const initials =
        `${employee.firstName?.charAt(0) || ""}${
            employee.lastName?.charAt(0) || ""
        }`.toUpperCase();


    return (
        <div className="employee-profile-page">


            {/* =========================================
                BACK
            ========================================= */}

            <button
                type="button"
                className="employee-profile-back"
                onClick={() =>
                    navigate(
                        "/super-admin/employees"
                    )
                }
            >

                <ArrowLeft size={17} />

                Back to Employees

            </button>


            {/* =========================================
                PROFILE HEADER
            ========================================= */}

            <div className="employee-profile-header">


                <div className="employee-profile-main">


                    <div className="employee-profile-avatar">

                        {initials}

                    </div>


                    <div className="employee-profile-title">

                        <div className="employee-profile-name-row">

                            <h1>
                                {fullName}
                            </h1>


                            <span
                                className={
                                    employee.isActive
                                        ? "employee-profile-status active"
                                        : "employee-profile-status inactive"
                                }
                            >

                                <span />

                                {
                                    employee.isActive
                                        ? "Active"
                                        : "Inactive"
                                }

                            </span>

                        </div>


                        <p>
                            {
                                employee.designation ||
                                "Employee"
                            }
                        </p>


                        <div className="employee-profile-meta">

                            <span>

                                <BriefcaseBusiness
                                    size={14}
                                />

                                {
                                    employee.department ||
                                    "No Department"
                                }

                            </span>


                            <span>

                                <UserRound
                                    size={14}
                                />

                                {
                                    employee.employeeId
                                }

                            </span>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="employee-profile-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/super-admin/employees/${employee._id}/edit`
                            )
                        }
                    >

                        <Edit3 size={16} />

                        Edit

                    </button>


                    <button
                        type="button"
                        onClick={
                            handleToggleStatus
                        }
                    >

                        <Power size={16} />

                        {
                            employee.isActive
                                ? "Deactivate"
                                : "Activate"
                        }

                    </button>


                    <button
                        type="button"
                        className="danger"
                        onClick={
                            handleDelete
                        }
                    >

                        <Trash2 size={16} />

                        Delete

                    </button>

                </div>

            </div>


            {/* =========================================
                INFORMATION
            ========================================= */}

            <div className="employee-profile-grid">


                {/* =====================================
                    PERSONAL
                ===================================== */}

                <div className="employee-profile-card">

                    <div className="employee-profile-card-header">

                        <div className="employee-profile-card-icon">

                            <UserRound
                                size={18}
                            />

                        </div>

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Employee personal details
                            </p>

                        </div>

                    </div>


                    <div className="employee-information-list">


                        <div>

                            <span>
                                <Mail size={15} />
                                Email
                            </span>

                            <strong>
                                {
                                    employee.email ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                <Phone size={15} />
                                Phone
                            </span>

                            <strong>
                                {
                                    employee.phone ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                <CalendarDays size={15} />
                                Date of Birth
                            </span>

                            <strong>
                                {
                                    employee.dateOfBirth
                                        ? new Date(
                                              employee.dateOfBirth
                                          ).toLocaleDateString()
                                        : "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                <UserRound size={15} />
                                Gender
                            </span>

                            <strong>
                                {
                                    employee.gender ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div className="full">

                            <span>
                                <MapPin size={15} />
                                Address
                            </span>

                            <strong>
                                {
                                    employee.address ||
                                    "—"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    JOB
                ===================================== */}

                <div className="employee-profile-card">

                    <div className="employee-profile-card-header">

                        <div className="employee-profile-card-icon">

                            <BriefcaseBusiness
                                size={18}
                            />

                        </div>

                        <div>

                            <h2>
                                Job Information
                            </h2>

                            <p>
                                Employment details
                            </p>

                        </div>

                    </div>


                    <div className="employee-information-list">


                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {
                                    employee.department ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Designation
                            </span>

                            <strong>
                                {
                                    employee.designation ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Joining Date
                            </span>

                            <strong>
                                {
                                    employee.joiningDate
                                        ? new Date(
                                              employee.joiningDate
                                          ).toLocaleDateString()
                                        : "—"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Employment Type
                            </span>

                            <strong>
                                {
                                    employee.employmentType ||
                                    "—"
                                }
                            </strong>

                        </div>


                        <div className="full">

                            <span>
                                Reporting HR
                            </span>

                            <strong>
                                {
                                    employee.reportingHR
                                        ?.name ||
                                    "Not assigned"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    ACCOUNT
                ===================================== */}

                <div className="employee-profile-card">

                    <div className="employee-profile-card-header">

                        <div className="employee-profile-card-icon">

                            <ShieldCheck
                                size={18}
                            />

                        </div>

                        <div>

                            <h2>
                                Account Information
                            </h2>

                            <p>
                                Account and access details
                            </p>

                        </div>

                    </div>


                    <div className="employee-information-list">


                        <div>

                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {
                                    employee.employeeId
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Role
                            </span>

                            <strong>
                                {
                                    employee.role ||
                                    "EMPLOYEE"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Account Status
                            </span>

                            <strong
                                className={
                                    employee.isActive
                                        ? "text-active"
                                        : "text-inactive"
                                }
                            >

                                {
                                    employee.isActive
                                        ? "Active"
                                        : "Inactive"
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                Created
                            </span>

                            <strong>
                                {
                                    employee.createdAt
                                        ? new Date(
                                              employee.createdAt
                                          ).toLocaleDateString()
                                        : "—"
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default EmployeeProfile;