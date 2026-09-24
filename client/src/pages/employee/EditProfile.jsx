import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    ArrowLeft,
    Loader2,
    X,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../../services/api";

import "./EditProfile.css";


const EditProfile = () => {

    const navigate = useNavigate();


    /*
    =====================================================
    AUTH
    =====================================================
    */

    const {
        user,
        loading: authLoading,
        updateUser,
        getCurrentUser,
    } = useAuth();


    /*
    =====================================================
    REFS
    =====================================================
    */

    const fileInputRef =
        useRef(null);

    const previewUrlRef =
        useRef("");


    /*
    =====================================================
    FORM STATE
    =====================================================
    */

    const [formData, setFormData] = useState({

        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",

    });


    /*
    =====================================================
    IMAGE STATE
    =====================================================
    */

    const [profileImage, setProfileImage] =
        useState("");

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [previewImage, setPreviewImage] =
        useState("");


    /*
    =====================================================
    UI STATE
    =====================================================
    */

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /*
    =====================================================
    LOAD USER DATA
    =====================================================
    */

    useEffect(() => {

        if (!user) {
            return;
        }


        setFormData({

            firstName:
                user.firstName || "",

            lastName:
                user.lastName || "",

            email:
                user.email || "",

            phone:
                user.phone || "",

            address:
                user.address || "",

        });


        setProfileImage(
            user.profileImage || ""
        );

    }, [user]);


    /*
    =====================================================
    CLEAN PREVIEW URL
    =====================================================
    */

    useEffect(() => {

        return () => {

            if (previewUrlRef.current) {

                URL.revokeObjectURL(
                    previewUrlRef.current
                );

            }

        };

    }, []);


    /*
    =====================================================
    HANDLE INPUT
    =====================================================
    */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,

                [name]: value,
            })
        );


        setError("");
        setSuccess("");

    };


    /*
    =====================================================
    SELECT IMAGE
    =====================================================
    */

    const handleImageChange = (event) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        /*
        ================================================
        VALIDATE IMAGE TYPE
        ================================================
        */

        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image file."
            );

            event.target.value = "";

            return;
        }


        /*
        ================================================
        VALIDATE IMAGE SIZE
        ================================================
        */

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setError(
                "Profile image must be smaller than 5MB."
            );

            event.target.value = "";

            return;
        }


        /*
        ================================================
        REMOVE OLD PREVIEW URL
        ================================================
        */

        if (previewUrlRef.current) {

            URL.revokeObjectURL(
                previewUrlRef.current
            );

        }


        /*
        ================================================
        CREATE NEW PREVIEW
        ================================================
        */

        const imageUrl =
            URL.createObjectURL(
                file
            );


        previewUrlRef.current =
            imageUrl;


        setSelectedImage(
            file
        );

        setPreviewImage(
            imageUrl
        );

        setError("");
        setSuccess("");

    };


    /*
    =====================================================
    REMOVE SELECTED IMAGE
    =====================================================
    */

    const handleRemoveSelectedImage = () => {

        setSelectedImage(null);

        setPreviewImage("");


        if (previewUrlRef.current) {

            URL.revokeObjectURL(
                previewUrlRef.current
            );

            previewUrlRef.current = "";

        }


        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }


        setError("");
        setSuccess("");

    };


    /*
    =====================================================
    UPLOAD IMAGE TO CLOUDINARY
    =====================================================
    */

    const uploadImageToCloudinary = async () => {

        /*
        ================================================
        NO NEW IMAGE
        ================================================
        */

        if (!selectedImage) {

            return profileImage || "";

        }


        /*
        ================================================
        ENV VARIABLES
        ================================================
        */

        const cloudName =
            import.meta.env
                .VITE_CLOUDINARY_CLOUD_NAME;


        const uploadPreset =
            import.meta.env
                .VITE_CLOUDINARY_UPLOAD_PRESET;


        if (
            !cloudName ||
            !uploadPreset
        ) {

            throw new Error(
                "Cloudinary configuration is missing. Check your VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
            );

        }


        /*
        ================================================
        FORM DATA
        ================================================
        */

        const cloudinaryFormData =
            new FormData();


        cloudinaryFormData.append(
            "file",
            selectedImage
        );


        cloudinaryFormData.append(
            "upload_preset",
            uploadPreset
        );


        /*
        ================================================
        CLOUDINARY UPLOAD
        ================================================
        */

        const response =
            await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",

                    body:
                        cloudinaryFormData,
                }
            );


        /*
        ================================================
        PARSE RESPONSE
        ================================================
        */

        const data =
            await response.json();


        /*
        ================================================
        CLOUDINARY ERROR
        ================================================
        */

        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                "Cloudinary image upload failed."
            );

        }


        /*
        ================================================
        CHECK SECURE URL
        ================================================
        */

        if (!data?.secure_url) {

            throw new Error(
                "Cloudinary did not return an image URL."
            );

        }


        console.log(
            "CLOUDINARY IMAGE URL:",
            data.secure_url
        );


        /*
        ================================================
        RETURN URL
        ================================================
        */

        return data.secure_url;

    };


    /*
    =====================================================
    SUBMIT PROFILE
    =====================================================
    */

    const handleSubmit = async (event) => {

        event.preventDefault();


        /*
        ================================================
        PREVENT DOUBLE SUBMIT
        ================================================
        */

        if (saving) {
            return;
        }


        setError("");
        setSuccess("");
        setSaving(true);


        try {

            /*
            ============================================
            VALIDATION
            ============================================
            */

            const firstName =
                formData.firstName.trim();

            const lastName =
                formData.lastName.trim();

            const email =
                formData.email
                    .trim()
                    .toLowerCase();

            const phone =
                formData.phone.trim();

            const address =
                formData.address.trim();


            if (!firstName) {

                throw new Error(
                    "First name is required."
                );

            }


            if (!email) {

                throw new Error(
                    "Email is required."
                );

            }


            /*
            ============================================
            UPLOAD IMAGE
            ============================================
            */

            let cloudinaryImageUrl =
                profileImage || "";


            if (selectedImage) {

                cloudinaryImageUrl =
                    await uploadImageToCloudinary();

            }


            /*
            ============================================
            DEBUG
            ============================================
            */

            console.log(
                "PROFILE IMAGE URL TO SAVE:",
                cloudinaryImageUrl
            );


            /*
            ============================================
            PAYLOAD
            ============================================
            
            ONLY editable fields are sent.
            */

            const payload = {

                firstName,

                lastName,

                email,

                phone,

                address,

                profileImage:
                    cloudinaryImageUrl,

            };


            console.log(
                "EMPLOYEE PROFILE PAYLOAD:",
                payload
            );


            /*
            ============================================
            UPDATE EMPLOYEE
            ============================================
            */

            const response =
                await api.put(
                    "/employees/profile",
                    payload
                );


            console.log(
                "UPDATE PROFILE RESPONSE:",
                response.data
            );


            /*
            ============================================
            CHECK BACKEND RESPONSE
            ============================================
            */

            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to update employee profile."
                );

            }


            /*
            ============================================
            GET UPDATED EMPLOYEE
            ============================================
            */

            const updatedEmployee =
                response.data?.employee;


            if (!updatedEmployee) {

                throw new Error(
                    "Profile updated, but updated employee data was not returned by the server."
                );

            }


            /*
            ============================================
            UPDATE AUTH CONTEXT
            ============================================
            
            This is important.

            Without this, EditProfile may save
            successfully but the profile page can
            continue showing old user information.
            */

            if (updateUser) {

                updateUser(
                    updatedEmployee
                );

            } else {

                setUserFallback(
                    updatedEmployee
                );

            }


            /*
            ============================================
            SUCCESS
            ============================================
            */

            setSuccess(
                "Profile updated successfully."
            );


            /*
            ============================================
            CLEAR SELECTED IMAGE
            ============================================
            */

            setSelectedImage(null);

            setProfileImage(
                updatedEmployee.profileImage || ""
            );

            setPreviewImage("");


            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }


            /*
            ============================================
            REFRESH AUTH USER
            ============================================
            
            This is optional but useful when /auth/me
            returns the updated employee.
            */

            if (getCurrentUser) {

                await getCurrentUser();

            }


            /*
            ============================================
            NAVIGATE
            ============================================
            */

            setTimeout(() => {

                navigate(
                    "/employee/profile"
                );

            }, 700);

        } catch (error) {

            console.error(
                "UPDATE EMPLOYEE PROFILE ERROR:",
                error
            );


            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to update profile.";


            setError(
                message
            );

        } finally {

            setSaving(false);

        }

    };


    /*
    =====================================================
    FALLBACK USER UPDATE
    =====================================================
    
    Only used if updateUser is unavailable.
    =====================================================
    */

    const setUserFallback = (updatedEmployee) => {

        console.warn(
            "updateUser is not available in AuthContext."
        );

    };


    /*
    =====================================================
    AUTH LOADING
    =====================================================
    */

    if (authLoading) {

        return (

            <div className="employee-edit-profile-loading">

                <Loader2
                    size={24}
                    className="employee-edit-loading-icon"
                />

                <span>
                    Loading profile...
                </span>

            </div>

        );

    }


    /*
    =====================================================
    USER NOT LOGGED IN
    =====================================================
    */

    if (!user) {

        return (

            <div className="employee-edit-profile-loading">

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
    DISPLAY IMAGE
    =====================================================
    */

    const displayedImage =
        previewImage ||
        profileImage ||
        user.profileImage ||
        "";


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (

        <div className="employee-edit-profile-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-edit-profile-header">

                <div className="employee-edit-profile-header-left">

                    <button
                        type="button"
                        className="employee-edit-back-button"
                        onClick={() =>
                            navigate(
                                "/employee/profile"
                            )
                        }
                        title="Back to Profile"
                        disabled={saving}
                    >

                        <ArrowLeft
                            size={18}
                        />

                    </button>


                    <div>

                        <h1>
                            Edit Profile
                        </h1>

                        <p>
                            Update your personal information and profile photo.
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="employee-edit-error">

                    {error}

                </div>

            )}


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (

                <div className="employee-edit-success">

                    {success}

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
                className="employee-edit-profile-form"
                onSubmit={handleSubmit}
            >


                {/* =================================================
                    PROFILE PHOTO
                ================================================= */}

                <section className="employee-edit-section">

                    <div className="employee-edit-section-header">

                        <div>

                            <h2>
                                Profile Photo
                            </h2>

                            <p>
                                Add or change your profile image.
                            </p>

                        </div>

                        <Camera
                            size={20}
                        />

                    </div>


                    <div className="employee-edit-photo-content">


                        {/* ==========================================
                            AVATAR
                        =========================================== */}

                        <div className="employee-edit-photo-wrapper">

                            <div className="employee-edit-avatar">

                                {displayedImage ? (

                                    <img
                                        src={
                                            displayedImage
                                        }
                                        alt={
                                            `${user.firstName || ""} ${user.lastName || ""}`
                                        }
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                "none";

                                        }}
                                    />

                                ) : (

                                    <UserRound
                                        size={48}
                                    />

                                )}

                            </div>


                            <button
                                type="button"
                                className="employee-edit-camera-button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                title="Change profile photo"
                                disabled={saving}
                            >

                                <Camera
                                    size={16}
                                />

                            </button>

                        </div>


                        {/* ==========================================
                            PHOTO INFO
                        =========================================== */}

                        <div className="employee-edit-photo-info">

                            <strong>
                                {user.firstName || ""}
                                {" "}
                                {user.lastName || ""}
                            </strong>

                            <span>
                                JPG, PNG or WEBP
                            </span>

                            <span>
                                Maximum file size: 5MB
                            </span>


                            <div className="employee-edit-photo-actions">

                                <button
                                    type="button"
                                    className="employee-upload-photo-button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={saving}
                                >

                                    <Camera
                                        size={16}
                                    />

                                    Choose Image

                                </button>


                                {selectedImage && (

                                    <button
                                        type="button"
                                        className="employee-remove-photo-button"
                                        onClick={
                                            handleRemoveSelectedImage
                                        }
                                        disabled={saving}
                                    >

                                        <X
                                            size={15}
                                        />

                                        Remove

                                    </button>

                                )}

                            </div>

                        </div>


                        {/* ==========================================
                            FILE INPUT
                        =========================================== */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="employee-profile-file-input"
                            onChange={
                                handleImageChange
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="employee-edit-section">

                    <div className="employee-edit-section-header">

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                You can update the following personal details.
                            </p>

                        </div>

                        <UserRound
                            size={20}
                        />

                    </div>


                    <div className="employee-edit-form-grid">


                        {/* ==========================================
                            FIRST NAME
                        =========================================== */}

                        <div className="employee-edit-field">

                            <label htmlFor="firstName">
                                First Name
                            </label>

                            <div className="employee-edit-input-wrapper">

                                <UserRound
                                    size={17}
                                />

                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={
                                        formData.firstName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="First name"
                                    autoComplete="given-name"
                                    required
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            LAST NAME
                        =========================================== */}

                        <div className="employee-edit-field">

                            <label htmlFor="lastName">
                                Last Name
                            </label>

                            <div className="employee-edit-input-wrapper">

                                <UserRound
                                    size={17}
                                />

                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={
                                        formData.lastName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Last name"
                                    autoComplete="family-name"
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            EMAIL
                        =========================================== */}

                        <div className="employee-edit-field">

                            <label htmlFor="email">
                                Email
                            </label>

                            <div className="employee-edit-input-wrapper">

                                <Mail
                                    size={17}
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Email address"
                                    autoComplete="email"
                                    required
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            PHONE
                        =========================================== */}

                        <div className="employee-edit-field">

                            <label htmlFor="phone">
                                Phone
                            </label>

                            <div className="employee-edit-input-wrapper">

                                <Phone
                                    size={17}
                                />

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Phone number"
                                    autoComplete="tel"
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            ADDRESS
                        =========================================== */}

                        <div className="employee-edit-field employee-edit-field-full">

                            <label htmlFor="address">
                                Address
                            </label>

                            <div className="employee-edit-input-wrapper employee-edit-textarea-wrapper">

                                <MapPin
                                    size={17}
                                />

                                <textarea
                                    id="address"
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter your address"
                                    rows={3}
                                    disabled={saving}
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    READ ONLY EMPLOYMENT INFORMATION
                ================================================= */}

                <section className="employee-edit-section employee-readonly-section">

                    <div className="employee-edit-section-header">

                        <div>

                            <h2>
                                Employment Information
                            </h2>

                            <p>
                                These details can only be changed by HR or an administrator.
                            </p>

                        </div>

                    </div>


                    <div className="employee-readonly-grid">


                        {/* EMPLOYEE ID */}

                        <div>

                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {user.employeeId || "—"}
                            </strong>

                        </div>


                        {/* DEPARTMENT */}

                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {user.department || "—"}
                            </strong>

                        </div>


                        {/* DESIGNATION */}

                        <div>

                            <span>
                                Designation
                            </span>

                            <strong>
                                {user.designation || "—"}
                            </strong>

                        </div>


                        {/* EMPLOYMENT TYPE */}

                        <div>

                            <span>
                                Employment Type
                            </span>

                            <strong>
                                {user.employmentType || "—"}
                            </strong>

                        </div>


                        {/* JOINING DATE */}

                        <div>

                            <span>
                                Joining Date
                            </span>

                            <strong>

                                {user.joiningDate

                                    ? new Date(
                                        user.joiningDate
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )

                                    : "—"}

                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="employee-edit-actions">

                    <button
                        type="button"
                        className="employee-edit-cancel-button"
                        onClick={() =>
                            navigate(
                                "/employee/profile"
                            )
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="employee-edit-save-button"
                        disabled={saving}
                    >

                        {saving ? (

                            <>

                                <Loader2
                                    size={17}
                                    className="employee-edit-button-spinner"
                                />

                                Saving...

                            </>

                        ) : (

                            <>

                                <Save
                                    size={17}
                                />

                                Save Changes

                            </>

                        )}

                    </button>

                </div>

            </form>

        </div>

    );

};


export default EditProfile;