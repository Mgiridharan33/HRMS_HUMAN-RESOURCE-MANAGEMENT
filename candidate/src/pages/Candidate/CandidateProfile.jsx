import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    UserRound,
    Upload,
    FileText,
    Save,
    Loader2,
    X,
    CheckCircle2,
} from "lucide-react";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";

import {
    uploadImage,
    uploadResume,
} from "../../services/cloudinary";

import {
    updateCandidateProfile,
} from "../../services/candidateApi";

import "./Profile.css";


const Profile = () => {

    const {
        candidate,
        checkAuth,
    } = useCandidateAuth();


    // =====================================================
    // REFS
    // =====================================================

    const imageInputRef =
        useRef(null);

    const resumeInputRef =
        useRef(null);


    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] =
        useState({

            name: "",
            email: "",
            phone: "",
            address: "",
            skills: "",
            education: "",
            experience: "",

        });


    // =====================================================
    // CLOUDINARY DATA
    // =====================================================

    const [profileImage, setProfileImage] =
        useState("");

    const [resume, setResume] =
        useState("");


    // =====================================================
    // SELECTED FILES
    // =====================================================

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [selectedResume, setSelectedResume] =
        useState(null);


    // =====================================================
    // UI
    // =====================================================

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD CANDIDATE
    // =====================================================

    useEffect(() => {

        if (!candidate) {
            return;
        }


        setForm({

            name:
                candidate.name || "",

            email:
                candidate.email || "",

            phone:
                candidate.phone || "",

            address:
                candidate.address || "",

            skills:
                Array.isArray(
                    candidate.skills
                )
                    ? candidate.skills.join(", ")
                    : "",

            education:
                candidate.education || "",

            experience:
                candidate.experience || "",

        });


        setProfileImage(
            candidate.profileImage || ""
        );


        setResume(
            candidate.resume || ""
        );

    }, [candidate]);


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value,

            })
        );


        setMessage("");
        setError("");

    };


    // =====================================================
    // PROFILE IMAGE SELECT
    // =====================================================

    const handleImageChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        // -------------------------------------------------
        // IMAGE TYPE
        // -------------------------------------------------

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
        ) {

            setError(
                "Please select JPG, PNG or WEBP image."
            );

            event.target.value = "";

            return;

        }


        // -------------------------------------------------
        // IMAGE SIZE
        // -------------------------------------------------

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


        setSelectedImage(
            file
        );

        setMessage("");
        setError("");

    };


    // =====================================================
    // RESUME SELECT
    // =====================================================

    const handleResumeChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        const allowedExtensions = [

            ".pdf",
            ".doc",
            ".docx",
            ".jpg",
            ".jpeg",
            ".png",

        ];


        const fileName =
            file.name.toLowerCase();


        const validExtension =
            allowedExtensions.some(
                extension =>
                    fileName.endsWith(
                        extension
                    )
            );


        if (!validExtension) {

            setError(
                "Resume must be PDF, DOC, DOCX, JPG or PNG."
            );

            event.target.value = "";

            return;

        }


        // -------------------------------------------------
        // RESUME SIZE
        // -------------------------------------------------

        if (
            file.size >
            10 * 1024 * 1024
        ) {

            setError(
                "Resume must be smaller than 10MB."
            );

            event.target.value = "";

            return;

        }


        setSelectedResume(
            file
        );

        setMessage("");
        setError("");

    };


    // =====================================================
    // REMOVE SELECTED IMAGE
    // =====================================================

    const removeSelectedImage = () => {

        setSelectedImage(
            null
        );


        if (
            imageInputRef.current
        ) {

            imageInputRef.current.value =
                "";

        }

    };


    // =====================================================
    // REMOVE SELECTED RESUME
    // =====================================================

    const removeSelectedResume = () => {

        setSelectedResume(
            null
        );


        if (
            resumeInputRef.current
        ) {

            resumeInputRef.current.value =
                "";

        }

    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (saving) {
                return;
            }


            setSaving(true);

            setMessage("");

            setError("");


            try {

                // =================================================
                // VALIDATION
                // =================================================

                const name =
                    form.name.trim();

                const email =
                    form.email
                        .trim()
                        .toLowerCase();

                const phone =
                    form.phone.trim();

                const address =
                    form.address.trim();


                if (!name) {

                    throw new Error(
                        "Name is required."
                    );

                }


                if (!email) {

                    throw new Error(
                        "Email is required."
                    );

                }


                // =================================================
                // PROFILE IMAGE
                // =================================================

                let imageUrl =
                    profileImage || "";


                if (selectedImage) {

                    imageUrl =
                        await uploadImage(
                            selectedImage
                        );

                }


                // =================================================
                // RESUME
                // =================================================

                let resumeUrl =
                    resume || "";


                if (selectedResume) {

                    resumeUrl =
                        await uploadResume(
                            selectedResume
                        );

                }


                // =================================================
                // SKILLS
                // =================================================

                const skills =
                    form.skills
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean);


                // =================================================
                // BACKEND PAYLOAD
                // =================================================

                const payload = {

                    name,

                    email,

                    phone,

                    address,

                    profileImage:
                        imageUrl,

                    resume:
                        resumeUrl,

                    skills,

                    education:
                        form.education.trim(),

                    experience:
                        form.experience.trim(),

                };


                console.log(
                    "CANDIDATE PROFILE PAYLOAD:",
                    payload
                );


                // =================================================
                // UPDATE BACKEND
                // =================================================

                const response =
                    await updateCandidateProfile(
                        payload
                    );


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        "Profile update failed."
                    );

                }


                // =================================================
                // UPDATE LOCAL STATE
                // =================================================

                setProfileImage(
                    response
                        .candidate
                        ?.profileImage ||
                    imageUrl
                );


                setResume(
                    response
                        .candidate
                        ?.resume ||
                    resumeUrl
                );


                setSelectedImage(
                    null
                );


                setSelectedResume(
                    null
                );


                // =================================================
                // CLEAR FILE INPUTS
                // =================================================

                if (
                    imageInputRef.current
                ) {

                    imageInputRef.current.value =
                        "";

                }


                if (
                    resumeInputRef.current
                ) {

                    resumeInputRef.current.value =
                        "";

                }


                // =================================================
                // SUCCESS
                // =================================================

                setMessage(
                    "Profile updated successfully."
                );


                // =================================================
                // REFRESH AUTH
                // =================================================

                if (checkAuth) {

                    await checkAuth();

                }

            } catch (error) {

                console.error(
                    "CANDIDATE PROFILE ERROR:",
                    error
                );


                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to update profile."
                );

            } finally {

                setSaving(false);

            }

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="candidate-profile">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="candidate-profile-header">

                <div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your candidate information.
                    </p>

                </div>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {message && (

                <div className="profile-success">

                    <CheckCircle2
                        size={18}
                    />

                    {message}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="profile-error">

                    {error}

                </div>

            )}


            <form
                onSubmit={
                    handleSubmit
                }
            >

                {/* =================================================
                    PROFILE PHOTO
                ================================================= */}

                <section className="profile-section">

                    <h2>
                        Profile Photo
                    </h2>


                    <div className="profile-photo-area">

                        <div className="profile-avatar">

                            {profileImage ? (

                                <img
                                    src={
                                        profileImage
                                    }
                                    alt={
                                        form.name ||
                                        "Candidate"
                                    }
                                    onError={
                                        event => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }
                                    }
                                />

                            ) : (

                                <UserRound
                                    size={45}
                                />

                            )}

                        </div>


                        <div>

                            <button
                                type="button"
                                onClick={() =>
                                    imageInputRef
                                        .current
                                        ?.click()
                                }
                                disabled={
                                    saving
                                }
                            >

                                <Upload
                                    size={16}
                                />

                                Choose Image

                            </button>


                            {selectedImage && (

                                <div className="selected-file">

                                    <span>
                                        {selectedImage.name}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={
                                            removeSelectedImage
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        <X
                                            size={15}
                                        />

                                    </button>

                                </div>

                            )}

                        </div>


                        <input
                            ref={
                                imageInputRef
                            }
                            type="file"
                            accept="
                                image/png,
                                image/jpeg,
                                image/webp
                            "
                            hidden
                            onChange={
                                handleImageChange
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section className="profile-section">

                    <h2>
                        Personal Information
                    </h2>


                    <div className="profile-grid">

                        <div>

                            <label>
                                Full Name
                            </label>

                            <input
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Full name"
                                required
                                disabled={
                                    saving
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Email
                            </label>

                            <input
                                name="email"
                                type="email"
                                value={
                                    form.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Email"
                                required
                                disabled={
                                    saving
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Phone
                            </label>

                            <input
                                name="phone"
                                value={
                                    form.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Phone"
                                disabled={
                                    saving
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Address
                            </label>

                            <input
                                name="address"
                                value={
                                    form.address
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Address"
                                disabled={
                                    saving
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESUME
                ================================================= */}

                <section className="profile-section">

                    <div className="section-title-row">

                        <div>

                            <h2>
                                Resume
                            </h2>

                            <p>
                                Upload your latest resume.
                            </p>

                        </div>

                        <FileText
                            size={22}
                        />

                    </div>


                    {/* =============================================
                        CURRENT RESUME
                    ============================================== */}

                    {resume && (

                        <div className="current-resume">

                            <FileText
                                size={22}
                            />


                            <div>

                                <strong>
                                    Current Resume
                                </strong>

                                <span>
                                    Your uploaded resume
                                </span>

                            </div>


                            <a
                                href={
                                    resume
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                View Resume
                            </a>

                        </div>

                    )}


                    {/* =============================================
                        SELECT RESUME
                    ============================================== */}

                    <div className="resume-upload">

                        <input
                            ref={
                                resumeInputRef
                            }
                            type="file"
                            accept="
                                .pdf,
                                .doc,
                                .docx,
                                .jpg,
                                .jpeg,
                                .png
                            "
                            onChange={
                                handleResumeChange
                            }
                            disabled={
                                saving
                            }
                        />


                        {selectedResume && (

                            <div className="selected-resume">

                                <FileText
                                    size={20}
                                />


                                <span>
                                    {selectedResume.name}
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        removeSelectedResume
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <X
                                        size={16}
                                    />

                                </button>

                            </div>

                        )}

                    </div>


                    <small>
                        PDF, DOC, DOCX, JPG or PNG • Maximum 10MB
                    </small>

                </section>


                {/* =================================================
                    PROFESSIONAL INFORMATION
                ================================================= */}

                <section className="profile-section">

                    <h2>
                        Professional Information
                    </h2>


                    <div className="profile-professional">

                        <div>

                            <label>
                                Skills
                            </label>

                            <textarea
                                name="skills"
                                value={
                                    form.skills
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="React, Node.js, MongoDB, Express"
                                rows={4}
                                disabled={
                                    saving
                                }
                            />

                            <small>
                                Separate skills with commas.
                            </small>

                        </div>


                        <div>

                            <label>
                                Education
                            </label>

                            <textarea
                                name="education"
                                value={
                                    form.education
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="B.E Computer Science, 2025"
                                rows={4}
                                disabled={
                                    saving
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Experience
                            </label>

                            <textarea
                                name="experience"
                                value={
                                    form.experience
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="MERN Stack Developer Intern..."
                                rows={5}
                                disabled={
                                    saving
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SAVE
                ================================================= */}

                <div className="profile-actions">

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                    >

                        {saving ? (

                            <>

                                <Loader2
                                    size={17}
                                    className="spin"
                                />

                                Uploading & Saving...

                            </>

                        ) : (

                            <>

                                <Save
                                    size={17}
                                />

                                Save Profile

                            </>

                        )}

                    </button>

                </div>

            </form>

        </div>

    );

};


export default Profile;