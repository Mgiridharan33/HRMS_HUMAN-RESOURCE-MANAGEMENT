import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Edit3,
    Mail,
    Phone,
    BriefcaseBusiness,
    UserRound,
    ShieldCheck,
    Power,
    Trash2,
    CalendarDays,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import hrApi from "../../services/hrApi";

import "./HRProfile.css";


const HRProfile = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    const [hr, setHR] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    /*
    =====================================================
    LOAD HR
    =====================================================
    */

    const loadHR = async () => {

        try {

            setLoading(true);

            const response =
                await hrApi.getById(id);


            if (response.success) {

                setHR(
                    response.hr
                );

            } else {

                throw new Error(
                    response.message ||
                    "HR not found"
                );
            }

        } catch (error) {

            console.error(
                "Load HR error:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to load HR"
            );

            navigate(
                "/super-admin/hr"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadHR();

    }, [id]);


    /*
    =====================================================
    TOGGLE STATUS
    =====================================================
    */

    const handleToggleStatus =
        async () => {

            if (!hr) {
                return;
            }


            const action =
                hr.isActive
                    ? "deactivate"
                    : "activate";


            const confirmed =
                window.confirm(
                    `Are you sure you want to ${action} ${hr.name}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await hrApi.toggleStatus(
                        hr._id
                    );


                if (response.success) {

                    alert(
                        response.message
                    );

                    await loadHR();

                }

            } catch (error) {

                console.error(
                    "HR status error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to update HR status"
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

            if (!hr) {
                return;
            }


            const confirmed =
                window.confirm(
                    `Are you sure you want to permanently delete ${hr.name}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await hrApi.delete(
                        hr._id
                    );


                if (response.success) {

                    alert(
                        response.message
                    );

                    navigate(
                        "/super-admin/hr"
                    );

                }

            } catch (error) {

                console.error(
                    "Delete HR error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to delete HR"
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
            <div className="hr-profile-loading">

                Loading HR...

            </div>
        );
    }


    if (!hr) {

        return (
            <div className="hr-profile-loading">

                HR not found.

            </div>
        );
    }


    /*
    =====================================================
    DATA
    =====================================================
    */

    const initials =
        hr.name
            ?.split(" ")
            .map(
                word =>
                    word.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


    return (

        <div className="hr-profile-page">


            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                className="hr-profile-back"
                onClick={() =>
                    navigate(
                        "/super-admin/hr"
                    )
                }
            >

                <ArrowLeft size={17} />

                Back to HR Management

            </button>


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="hr-profile-header">


                <div className="hr-profile-main">


                    <div className="hr-profile-avatar">

                        {initials || "HR"}

                    </div>


                    <div className="hr-profile-title">


                        <div className="hr-profile-name-row">

                            <h1>
                                {hr.name}
                            </h1>


                            <span
                                className={
                                    hr.isActive
                                        ? "hr-profile-status active"
                                        : "hr-profile-status inactive"
                                }
                            >

                                <span />

                                {
                                    hr.isActive
                                        ? "Active"
                                        : "Inactive"
                                }

                            </span>

                        </div>


                        <p>
                            Human Resources
                        </p>


                        <div className="hr-profile-meta">

                            <span>

                                <BriefcaseBusiness
                                    size={14}
                                />

                                {
                                    hr.department ||
                                    "HR Department"
                                }

                            </span>


                            <span>

                                <Mail
                                    size={14}
                                />

                                {hr.email}

                            </span>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="hr-profile-actions">


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/super-admin/hr/${hr._id}/edit`
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
                            hr.isActive
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


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="hr-profile-grid">


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <div className="hr-profile-card">


                    <div className="hr-profile-card-header">

                        <div className="hr-profile-card-icon">

                            <UserRound
                                size={18}
                            />

                        </div>


                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                HR personal details
                            </p>

                        </div>

                    </div>


                    <div className="hr-information-list">


                        <div>

                            <span>

                                <UserRound
                                    size={15}
                                />

                                Full Name

                            </span>

                            <strong>
                                {hr.name || "—"}
                            </strong>

                        </div>


                        <div>

                            <span>

                                <Mail
                                    size={15}
                                />

                                Email

                            </span>

                            <strong>
                                {hr.email || "—"}
                            </strong>

                        </div>


                        <div>

                            <span>

                                <Phone
                                    size={15}
                                />

                                Phone

                            </span>

                            <strong>
                                {hr.phone || "—"}
                            </strong>

                        </div>


                        <div>

                            <span>

                                <BriefcaseBusiness
                                    size={15}
                                />

                                Department

                            </span>

                            <strong>
                                {
                                    hr.department ||
                                    "—"
                                }
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    HR INFORMATION
                ================================================= */}

                <div className="hr-profile-card">


                    <div className="hr-profile-card-header">

                        <div className="hr-profile-card-icon">

                            <BriefcaseBusiness
                                size={18}
                            />

                        </div>


                        <div>

                            <h2>
                                HR Information
                            </h2>

                            <p>
                                HR role and organization details
                            </p>

                        </div>

                    </div>


                    <div className="hr-information-list">


                        <div>

                            <span>
                                Role
                            </span>

                            <strong>
                                {hr.role || "HR"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {
                                    hr.department ||
                                    "Human Resources"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                HR ID
                            </span>

                            <strong>
                                {hr._id}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Joined
                            </span>

                            <strong>

                                {
                                    hr.createdAt
                                        ? new Date(
                                              hr.createdAt
                                          ).toLocaleDateString()
                                        : "—"
                                }

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================= */}

                <div className="hr-profile-card">


                    <div className="hr-profile-card-header">

                        <div className="hr-profile-card-icon">

                            <ShieldCheck
                                size={18}
                            />

                        </div>


                        <div>

                            <h2>
                                Account Information
                            </h2>

                            <p>
                                Access and account status
                            </p>

                        </div>

                    </div>


                    <div className="hr-information-list">


                        <div>

                            <span>
                                Account Status
                            </span>

                            <strong
                                className={
                                    hr.isActive
                                        ? "text-active"
                                        : "text-inactive"
                                }
                            >

                                {
                                    hr.isActive
                                        ? "Active"
                                        : "Inactive"
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                Role
                            </span>

                            <strong>
                                {
                                    hr.role ||
                                    "HR"
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Created Date
                            </span>

                            <strong>

                                {
                                    hr.createdAt
                                        ? new Date(
                                              hr.createdAt
                                          ).toLocaleDateString()
                                        : "—"
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                Last Updated
                            </span>

                            <strong>

                                {
                                    hr.updatedAt
                                        ? new Date(
                                              hr.updatedAt
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


export default HRProfile;