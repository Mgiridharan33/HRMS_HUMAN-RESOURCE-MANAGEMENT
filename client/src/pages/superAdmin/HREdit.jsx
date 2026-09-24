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

import hrApi from "../../services/hrApi";

import "./HREdit.css";


const HREdit = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    const [formData, setFormData] =
        useState({

            name: "",
            email: "",
            phone: "",
            department: "",

        });


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


            if (!response.success) {

                throw new Error(
                    response.message ||
                    "HR not found"
                );
            }


            const hr =
                response.hr;


            setFormData({

                name:
                    hr.name || "",

                email:
                    hr.email || "",

                phone:
                    hr.phone || "",

                department:
                    hr.department || "",

            });

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
                    await hrApi.update(
                        id,
                        formData
                    );


                if (!response.success) {

                    throw new Error(
                        response.message ||
                        "Failed to update HR"
                    );
                }


                alert(
                    response.message ||
                    "HR updated successfully"
                );


                navigate(
                    `/super-admin/hr/${id}`
                );


            } catch (error) {

                console.error(
                    "Update HR error:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update HR"
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
            <div className="hr-edit-loading">

                Loading HR...

            </div>
        );
    }


    return (

        <div className="hr-edit-page">


            {/* =================================================
                BACK
            ================================================= */}

            <button
                type="button"
                className="hr-edit-back"
                onClick={() =>
                    navigate(
                        `/super-admin/hr/${id}`
                    )
                }
            >

                <ArrowLeft size={17} />

                Back to HR Profile

            </button>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-edit-header">

                <h1>
                    Edit HR
                </h1>

                <p>
                    Update HR account and
                    organization information.
                </p>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
                className="hr-edit-form"
                onSubmit={handleSubmit}
            >


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="hr-edit-card">


                    <div className="hr-edit-card-header">

                        <h2>
                            HR Information
                        </h2>

                        <p>
                            Update basic HR information
                        </p>

                    </div>


                    <div className="hr-edit-grid">


                        {/* NAME */}

                        <div className="hr-edit-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="hr-edit-field">

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


                        {/* PHONE */}

                        <div className="hr-edit-field">

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


                        {/* DEPARTMENT */}

                        <div className="hr-edit-field">

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
                                placeholder="Human Resources"
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ACCOUNT
                ================================================= */}

                <section className="hr-edit-card">


                    <div className="hr-edit-card-header">

                        <h2>
                            Account Information
                        </h2>

                        <p>
                            Role is controlled by
                            Super Admin.
                        </p>

                    </div>


                    <div className="hr-edit-account-info">

                        <div>

                            <span>
                                Role
                            </span>

                            <strong>
                                HR
                            </strong>

                        </div>


                        <div>

                            <span>
                                HR ID
                            </span>

                            <strong>
                                {id}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="hr-edit-actions">


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/super-admin/hr/${id}`
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


export default HREdit;