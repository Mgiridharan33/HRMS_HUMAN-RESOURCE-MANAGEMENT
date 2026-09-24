// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

const CLOUD_NAME =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const PROFILE_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_PROFILE_UPLOAD_PRESET ||
    "HRMS_profile";

const RESUME_UPLOAD_PRESET =
    import.meta.env.VITE_CLOUDINARY_RESUME_UPLOAD_PRESET ||
    "HRMS_resume";


// =====================================================
// COMMON CLOUDINARY UPLOAD
// =====================================================

const uploadToCloudinary = async (
    file,
    uploadPreset,
    resourceType = "image"
) => {

    if (!file) {
        throw new Error(
            "Please select a file."
        );
    }


    if (!CLOUD_NAME) {

        throw new Error(
            "Cloudinary cloud name is missing."
        );

    }


    if (!uploadPreset) {

        throw new Error(
            "Cloudinary upload preset is missing."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        uploadPreset
    );


    const uploadUrl =
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;


    const response =
        await fetch(
            uploadUrl,
            {
                method: "POST",
                body: formData,
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "CLOUDINARY UPLOAD ERROR:",
            data
        );

        throw new Error(
            data?.error?.message ||
            "Cloudinary upload failed."
        );

    }


    if (!data?.secure_url) {

        throw new Error(
            "Cloudinary did not return a secure URL."
        );

    }


    console.log(
        "CLOUDINARY UPLOAD SUCCESS:",
        data.secure_url
    );


    return data.secure_url;
};


// =====================================================
// PROFILE IMAGE
// =====================================================

export const uploadImage = async (
    file
) => {

    if (!file.type.startsWith("image/")) {

        throw new Error(
            "Please select a valid image."
        );

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        throw new Error(
            "Profile image must be smaller than 5MB."
        );

    }


    return await uploadToCloudinary(
        file,
        PROFILE_UPLOAD_PRESET,
        "image"
    );

};


// =====================================================
// RESUME
// =====================================================

export const uploadResume = async (
    file
) => {

    if (!file) {

        throw new Error(
            "Please select a resume."
        );

    }


    // =================================================
    // ALLOWED RESUME TYPES
    // =================================================

    const allowedTypes = [

        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "image/jpeg",

        "image/png",

    ];


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


    const hasValidType =
        allowedTypes.includes(
            file.type
        );


    const hasValidExtension =
        allowedExtensions.some(
            extension =>
                fileName.endsWith(
                    extension
                )
        );


    if (
        !hasValidType &&
        !hasValidExtension
    ) {

        throw new Error(
            "Resume must be PDF, DOC, DOCX, JPG or PNG."
        );

    }


    // =================================================
    // MAX RESUME SIZE
    // =================================================

    if (
        file.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "Resume must be smaller than 10MB."
        );

    }


    // =================================================
    // IMPORTANT
    //
    // Resume uses:
    //
    // HRMS_resume
    //
    // NOT HRMS_profile
    // =================================================

    return await uploadToCloudinary(
        file,
        RESUME_UPLOAD_PRESET,
        "auto"
    );

};