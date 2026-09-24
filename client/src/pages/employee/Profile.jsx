import {
    UserRound,
    Mail,
    Phone,
    Building2,
    BriefcaseBusiness,
    CalendarDays,
    IdCard,
    MapPin,
    Edit3,
    ArrowLeft,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    useMemo,
} from "react";

import "./Profile.css";


const EmployeeProfile = () => {

    const navigate = useNavigate();

    const {
        user,
        loading: authLoading,
    } = useAuth();


    /*
    =====================================================
    EMPLOYEE DATA
    =====================================================
    */

    const employee = {

        firstName:
            user?.firstName || "",

        lastName:
            user?.lastName || "",

        employeeId:
            user?.employeeId || "—",

        designation:
            user?.designation || "—",

        department:
            user?.department || "—",

        email:
            user?.email || "—",

        phone:
            user?.phone || "—",

        profileImage:
            user?.profileImage || "",

        employmentType:
            user?.employmentType || "—",

        joiningDate:
            user?.joiningDate || null,

        address:
            user?.address || "—",

        city:
            user?.city || "—",

        state:
            user?.state || "—",

        country:
            user?.country || "—",

    };


    /*
    =====================================================
    FULL NAME
    =====================================================
    */

    const fullName =
        `${employee.firstName} ${employee.lastName}`.trim();


    /*
    =====================================================
    INITIALS
    =====================================================
    */

    const initials = useMemo(() => {

        return fullName
            .split(" ")
            .filter(Boolean)
            .map(
                (name) =>
                    name.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();

    }, [
        fullName,
    ]);


    /*
    =====================================================
    FORMAT JOINING DATE
    =====================================================
    */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /*
    =====================================================
    LOCATION
    =====================================================
    */

    const employeeLocation = [
        employee.address !== "—"
            ? employee.address
            : null,

        employee.city !== "—"
            ? employee.city
            : null,

        employee.state !== "—"
            ? employee.state
            : null,

        employee.country !== "—"
            ? employee.country
            : null,

    ]
        .filter(Boolean)
        .join(", ");


    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (authLoading) {

        return (

            <div className="employee-profile-loading">

                <div className="employee-profile-loading-spinner" />

                <span>
                    Loading your profile...
                </span>

            </div>

        );

    }


    /*
    =====================================================
    NO USER
    =====================================================
    */

    if (!user) {

        return (

            <div className="employee-profile-loading">

                <span>
                    Please login to continue.
                </span>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Go to Login
                </button>

            </div>

        );

    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="employee-profile-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="employee-profile-header">

                <div className="employee-profile-header-left">

                    <button
                        type="button"
                        className="employee-profile-back-button"
                        onClick={() =>
                            navigate(
                                "/employee/dashboard"
                            )
                        }
                        title="Back to Dashboard"
                    >

                        <ArrowLeft
                            size={18}
                        />

                    </button>


                    <div>

                        <h1>
                            My Profile
                        </h1>

                        <p>
                            View and manage your employee information.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    className="employee-profile-edit-button"
                    onClick={() =>
                        navigate(
                            "/employee/profile/edit"
                        )
                    }
                >

                    <Edit3
                        size={17}
                    />

                    Edit Profile

                </button>

            </div>


            {/* =================================================
                EMPLOYEE WELCOME / PROFILE CARD
            ================================================= */}

            <div className="employee-welcome-card">


                {/* PROFILE */}

                <div className="employee-welcome-profile">


                    <div className="employee-dashboard-avatar">

                        {employee.profileImage ? (

                            <img
                                src={
                                    employee.profileImage
                                }
                                alt={
                                    fullName ||
                                    "Employee"
                                }
                            />

                        ) : (

                            initials || "E"

                        )}

                    </div>


                    <div>

                        <h2>

                            {fullName ||
                                "Employee"}

                        </h2>


                        <p>

                            {employee.designation}

                        </p>


                        <span>

                            Employee ID:{" "}

                            {employee.employeeId}

                        </span>

                    </div>

                </div>


                {/* EMPLOYEE SUMMARY */}

                <div className="employee-welcome-info">


                    <div>

                        <span>
                            Department
                        </span>

                        <strong>

                            {employee.department}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Employment
                        </span>

                        <strong>

                            {employee.employmentType}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Joining Date
                        </span>

                        <strong>

                            {formatDate(
                                employee.joiningDate
                            )}

                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                EMPLOYEE INFORMATION
            ================================================= */}

            <div className="employee-dashboard-card">


                {/* CARD HEADER */}

                <div className="employee-card-header">

                    <div>

                        <h2>
                            My Information
                        </h2>

                        <p>
                            Your current employee information.
                        </p>

                    </div>


                    <UserRound
                        size={20}
                    />

                </div>


                {/* INFORMATION GRID */}

                <div className="employee-dashboard-info-grid">


                    {/* FULL NAME */}

                    <div>

                        <span>
                            <UserRound
                                size={15}
                            />

                            Full Name
                        </span>

                        <strong>
                            {fullName || "—"}
                        </strong>

                    </div>


                    {/* EMAIL */}

                    <div>

                        <span>
                            <Mail
                                size={15}
                            />

                            Email
                        </span>

                        <strong>
                            {employee.email}
                        </strong>

                    </div>


                    {/* PHONE */}

                    <div>

                        <span>
                            <Phone
                                size={15}
                            />

                            Phone
                        </span>

                        <strong>
                            {employee.phone}
                        </strong>

                    </div>


                    {/* EMPLOYEE ID */}

                    <div>

                        <span>
                            <IdCard
                                size={15}
                            />

                            Employee ID
                        </span>

                        <strong>
                            {employee.employeeId}
                        </strong>

                    </div>


                    {/* DEPARTMENT */}

                    <div>

                        <span>
                            <Building2
                                size={15}
                            />

                            Department
                        </span>

                        <strong>
                            {employee.department}
                        </strong>

                    </div>


                    {/* DESIGNATION */}

                    <div>

                        <span>
                            <BriefcaseBusiness
                                size={15}
                            />

                            Designation
                        </span>

                        <strong>
                            {employee.designation}
                        </strong>

                    </div>


                    {/* EMPLOYMENT TYPE */}

                    <div>

                        <span>
                            <BriefcaseBusiness
                                size={15}
                            />

                            Employment Type
                        </span>

                        <strong>
                            {employee.employmentType}
                        </strong>

                    </div>


                    {/* JOINING DATE */}

                    <div>

                        <span>
                            <CalendarDays
                                size={15}
                            />

                            Joining Date
                        </span>

                        <strong>
                            {formatDate(
                                employee.joiningDate
                            )}
                        </strong>

                    </div>


                    {/* LOCATION */}

                    <div>

                        <span>
                            <MapPin
                                size={15}
                            />

                            Location
                        </span>

                        <strong>
                            {employeeLocation || "—"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="employee-dashboard-card employee-profile-contact-card">


                <div className="employee-card-header">

                    <div>

                        <h2>
                            Contact Information
                        </h2>

                        <p>
                            Your registered contact details.
                        </p>

                    </div>

                </div>


                <div className="employee-profile-contact-grid">


                    {/* EMAIL */}

                    <div className="employee-profile-contact-item">

                        <div className="employee-profile-contact-icon">

                            <Mail
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Email Address
                            </span>

                            <strong>
                                {employee.email}
                            </strong>

                        </div>

                    </div>


                    {/* PHONE */}

                    <div className="employee-profile-contact-item">

                        <div className="employee-profile-contact-icon">

                            <Phone
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Phone Number
                            </span>

                            <strong>
                                {employee.phone}
                            </strong>

                        </div>

                    </div>


                    {/* LOCATION */}

                    <div className="employee-profile-contact-item">

                        <div className="employee-profile-contact-icon">

                            <MapPin
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Address
                            </span>

                            <strong>
                                {employeeLocation || "—"}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                PROFILE ACTIONS
            ================================================= */}

            <div className="employee-profile-actions">


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/employee/attendance"
                        )
                    }
                >

                    <CalendarDays
                        size={18}
                    />

                    View Attendance

                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/employee/documents"
                        )
                    }
                >

                    <IdCard
                        size={18}
                    />

                    My Documents

                </button>


                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/employee/payroll"
                        )
                    }
                >

                    <BriefcaseBusiness
                        size={18}
                    />

                    Payroll

                </button>

            </div>


        </div>

    );

};


export default EmployeeProfile;