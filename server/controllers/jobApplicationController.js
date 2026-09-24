const mongoose = require("mongoose");

const Candidate =
    require("../models/Candidate");

const Job =
    require("../models/Job");

const JobApplication =
    require("../models/JobApplication");


// =========================================================
// APPLY FOR JOB
// POST /api/job-applications
// CANDIDATE ONLY
// =========================================================

const applyForJob = async (req, res) => {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "JOB APPLICATION REQUEST"
        );

        console.log(
            "BODY:",
            req.body
        );

        console.log(
            "CANDIDATE:",
            req.candidate
        );


        // =====================================================
        // CANDIDATE AUTH
        // =====================================================

        const candidateId =
            req.candidate?.id ||
            req.candidate?._id;


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication required",

            });

        }


        // =====================================================
        // BODY
        // =====================================================

        const {
            jobId,
            coverLetter,
            additionalMessage,
            expectedSalary,
            noticePeriod,
        } = req.body;


        // =====================================================
        // VALIDATE JOB ID
        // =====================================================

        if (
            !jobId ||
            !mongoose.Types.ObjectId.isValid(jobId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid job ID is required",

            });

        }


        // =====================================================
        // FIND CANDIDATE
        // =====================================================

        const candidate =
            await Candidate.findById(
                candidateId
            ).select("-password");


        if (!candidate) {

            return res.status(404).json({

                success: false,

                message:
                    "Candidate not found",

            });

        }


        // =====================================================
        // ACTIVE CHECK
        // =====================================================

        if (
            candidate.isActive === false
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Candidate account is inactive",

            });

        }


        // =====================================================
        // RESUME REQUIRED
        // =====================================================

        if (
            !candidate.resume ||
            !String(candidate.resume).trim()
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "RESUME_REQUIRED",

                message:
                    "Please upload your resume before applying",

            });

        }


        // =====================================================
        // PHONE REQUIRED
        // =====================================================

        if (
            !candidate.phone ||
            !String(candidate.phone).trim()
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "PHONE_REQUIRED",

                message:
                    "Please add your phone number before applying",

            });

        }


        // =====================================================
        // SKILLS REQUIRED
        // =====================================================

        if (
            !Array.isArray(candidate.skills) ||
            candidate.skills.length === 0
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "SKILLS_REQUIRED",

                message:
                    "Please add at least one skill before applying",

            });

        }


        // =====================================================
        // EDUCATION REQUIRED
        // =====================================================

        if (
            !candidate.education ||
            !String(candidate.education).trim()
        ) {

            return res.status(400).json({

                success: false,

                code:
                    "EDUCATION_REQUIRED",

                message:
                    "Please add your education before applying",

            });

        }


        // =====================================================
        // FIND JOB
        // =====================================================

        const job =
            await Job.findById(
                jobId
            );


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        // =====================================================
        // JOB ACTIVE
        // =====================================================

        const deadlinePassed =
            job.applicationDeadline &&
            new Date(job.applicationDeadline) < new Date();

        if (
            job.status !== "Published" ||
            job.isActive === false ||
            deadlinePassed
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This job is no longer accepting applications",

            });

        }


        // =====================================================
        // DUPLICATE APPLICATION
        // =====================================================

        const existingApplication =
            await JobApplication.findOne({

                candidate:
                    candidate._id,

                job:
                    job._id,

            });


        if (existingApplication) {

            return res.status(409).json({

                success: false,

                code:
                    "ALREADY_APPLIED",

                message:
                    "You have already applied for this job",

                application:
                    existingApplication,

            });

        }


        // =====================================================
        // CANDIDATE NAME
        // =====================================================

        const candidateName =
            candidate.name ||
            `${candidate.firstName || ""} ${candidate.lastName || ""}`
                .trim() ||
            "Candidate";


        // =====================================================
        // CREATE APPLICATION
        // =====================================================

        const application =
            await JobApplication.create({

                // =================================================
                // REFERENCES
                // =================================================

                candidate:
                    candidate._id,

                job:
                    job._id,


                // =================================================
                // CANDIDATE SNAPSHOT
                // =================================================

                candidateName:

                    candidateName,

                candidateEmail:

                    candidate.email || "",

                candidatePhone:

                    candidate.phone || "",

                candidateResume:

                    candidate.resume || "",

                candidateProfileImage:

                    candidate.profileImage || "",

                candidateSkills:

                    Array.isArray(candidate.skills)
                        ? candidate.skills
                        : [],

                candidateEducation:

                    candidate.education || "",

                candidateExperience:

                    candidate.experience || "",

                candidateAddress:

                    candidate.address || "",


                // =================================================
                // JOB SNAPSHOT
                // =================================================

                jobTitle:

                    job.title ||
                    job.jobTitle ||
                    "",

                jobDepartment:

                    job.department ||
                    "",

                jobLocation:

                    job.location ||
                    "",


                // =================================================
                // APPLICATION DETAILS
                // =================================================

                coverLetter:

                    String(
                        coverLetter || ""
                    ).trim(),

                additionalMessage:

                    String(
                        additionalMessage || ""
                    ).trim(),

                expectedSalary:

                    expectedSalary !== undefined &&
                    expectedSalary !== null &&
                    expectedSalary !== ""
                        ? Number(expectedSalary)
                        : null,

                noticePeriod:

                    String(
                        noticePeriod || ""
                    ).trim(),


                // =================================================
                // INITIAL STATUS
                // =================================================

                status:
                    "Pending",


                // =================================================
                // ADMIN
                // =================================================

                adminNotes:
                    "",

                reviewedBy:
                    null,

                reviewedAt:
                    null,


                // =================================================
                // HR ASSIGNMENT
                //
                // Candidate does NOT select HR.
                // Super Admin assigns HR later.
                // =================================================

                assignedHR:
                    null,

                assignedAt:
                    null,

            });


        console.log(
            "APPLICATION CREATED:",
            application._id
        );


        console.log(
            "INITIAL STATUS:",
            application.status
        );

        console.log(
            "ASSIGNED HR:",
            application.assignedHR
        );


        console.log(
            "========================================\n"
        );


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Job application submitted successfully",

            application,

        });

    } catch (error) {

        console.error(
            "APPLY FOR JOB ERROR:",
            error
        );


        // =====================================================
        // DUPLICATE
        // =====================================================

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                code:
                    "ALREADY_APPLIED",

                message:
                    "You have already applied for this job",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit job application",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET MY APPLICATIONS
// GET /api/job-applications/my
// CANDIDATE ONLY
// =========================================================

const getMyApplications = async (
    req,
    res
) => {

    try {

        const candidateId =
            req.candidate?.id ||
            req.candidate?._id;


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication required",

            });

        }


        const applications =
            await JobApplication.find({

                candidate:
                    candidateId,

            })

                .populate(
                    "job"
                )

                // HR assignment is returned to the
                // candidate if needed by the dashboard.
                .populate(
                    "assignedHR",
                    "name email profileImage"
                )

                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            applications,

        });

    } catch (error) {

        console.error(
            "GET MY APPLICATIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch applications",

        });

    }

};


// =========================================================
// GET SINGLE APPLICATION
// GET /api/job-applications/:id
// CANDIDATE ONLY
// =========================================================

const getMyApplicationById = async (
    req,
    res
) => {

    try {

        const candidateId =
            req.candidate?.id ||
            req.candidate?._id;


        if (!candidateId) {

            return res.status(401).json({

                success: false,

                message:
                    "Candidate authentication required",

            });

        }


        // =====================================================
        // VALIDATE APPLICATION ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid application ID",

            });

        }


        // =====================================================
        // FIND APPLICATION
        // =====================================================

        const application =
            await JobApplication.findOne({

                _id:
                    req.params.id,

                candidate:
                    candidateId,

            })

                .populate(
                    "job"
                )

                .populate(
                    "assignedHR",
                    "name email profileImage"
                );


        if (!application) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found",

            });

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            application,

        });

    } catch (error) {

        console.error(
            "GET APPLICATION ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch application",

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    applyForJob,

    getMyApplications,

    getMyApplicationById,

};