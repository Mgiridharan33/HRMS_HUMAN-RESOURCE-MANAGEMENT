const mongoose = require("mongoose");

const Job = require("../models/Job");


// =========================================================
// HELPER
// =========================================================

const getUserId = (req) => {

    return (
        req.user?.id ||
        req.user?._id ||
        null
    );

};


// =========================================================
// CREATE JOB
// POST /api/admin/jobs
//
// SUPER ADMIN ONLY
// =========================================================

const createJob = async (
    req,
    res
) => {

    try {

        const {

            title,

            department,

            designation,

            location,

            employmentType,

            description,

            requirements,

            responsibilities,

            skills,

            experience,

            salaryMin,

            salaryMax,

            salaryCurrency,

            vacancies,

            applicationDeadline,

            status,

        } = req.body;


        // =====================================================
        // TITLE VALIDATION
        // =====================================================

        if (
            !title ||
            !String(title).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Job title is required",

            });

        }


        // =====================================================
        // DESCRIPTION VALIDATION
        // =====================================================

        if (
            !description ||
            !String(description).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Job description is required",

            });

        }


        // =====================================================
        // NORMALIZE REQUIREMENTS
        // =====================================================

        const normalizedRequirements =
            Array.isArray(requirements)

                ? requirements
                    .map(item =>
                        String(item).trim()
                    )
                    .filter(Boolean)

                : [];


        // =====================================================
        // NORMALIZE RESPONSIBILITIES
        // =====================================================

        const normalizedResponsibilities =
            Array.isArray(responsibilities)

                ? responsibilities
                    .map(item =>
                        String(item).trim()
                    )
                    .filter(Boolean)

                : [];


        // =====================================================
        // NORMALIZE SKILLS
        // =====================================================

        const normalizedSkills =
            Array.isArray(skills)

                ? skills
                    .map(item =>
                        String(item).trim()
                    )
                    .filter(Boolean)

                : [];


        // =====================================================
        // VALIDATE STATUS
        // =====================================================

        const allowedStatuses = [

            "Draft",

            "Published",

            "Closed",

        ];


        const jobStatus =

            status &&
            allowedStatuses.includes(status)

                ? status

                : "Draft";


        // =====================================================
        // SALARY
        // =====================================================

        let normalizedSalaryMin = null;

        let normalizedSalaryMax = null;


        if (
            salaryMin !== undefined &&
            salaryMin !== null &&
            salaryMin !== ""
        ) {

            normalizedSalaryMin =
                Number(salaryMin);


            if (
                Number.isNaN(
                    normalizedSalaryMin
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid minimum salary",

                });

            }

        }


        if (
            salaryMax !== undefined &&
            salaryMax !== null &&
            salaryMax !== ""
        ) {

            normalizedSalaryMax =
                Number(salaryMax);


            if (
                Number.isNaN(
                    normalizedSalaryMax
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid maximum salary",

                });

            }

        }


        // =====================================================
        // CHECK SALARY RANGE
        // =====================================================

        if (

            normalizedSalaryMin !== null &&

            normalizedSalaryMax !== null &&

            normalizedSalaryMin >
            normalizedSalaryMax

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Minimum salary cannot be greater than maximum salary",

            });

        }


        // =====================================================
        // VACANCIES
        // =====================================================

        const normalizedVacancies =
            vacancies === undefined ||
            vacancies === null ||
            vacancies === ""

                ? 1

                : Number(vacancies);


        if (

            !Number.isInteger(
                normalizedVacancies
            ) ||

            normalizedVacancies < 1

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Vacancies must be at least 1",

            });

        }


        // =====================================================
        // DEADLINE
        // =====================================================

        let normalizedDeadline = null;


        if (applicationDeadline) {

            normalizedDeadline =
                new Date(
                    applicationDeadline
                );


            if (
                Number.isNaN(
                    normalizedDeadline.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application deadline",

                });

            }

        }


        // =====================================================
        // CREATE JOB
        // =====================================================

        const job =
            await Job.create({

                title:
                    String(
                        title
                    ).trim(),

                department:
                    String(
                        department || ""
                    ).trim(),

                designation:
                    String(
                        designation || ""
                    ).trim(),

                location:
                    String(
                        location || ""
                    ).trim(),

                employmentType:
                    employmentType ||
                    "Full Time",

                description:
                    String(
                        description
                    ).trim(),

                requirements:
                    normalizedRequirements,

                responsibilities:
                    normalizedResponsibilities,

                skills:
                    normalizedSkills,

                experience:
                    String(
                        experience || ""
                    ).trim(),

                salaryMin:
                    normalizedSalaryMin,

                salaryMax:
                    normalizedSalaryMax,

                salaryCurrency:
                    String(
                        salaryCurrency ||
                        "INR"
                    ).trim(),

                vacancies:
                    normalizedVacancies,

                applicationDeadline:
                    normalizedDeadline,

                status:
                    jobStatus,

                isActive:
                    jobStatus === "Published",

                createdBy:
                    getUserId(req),

            });


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Job created successfully",

            job,

        });

    } catch (error) {

        console.error(
            "CREATE JOB ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create job",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// GET ALL JOBS
// GET /api/admin/jobs
//
// SUPER ADMIN ONLY
// =========================================================

const getAllJobs = async (
    req,
    res
) => {

    try {

        const jobs =
            await Job.find({})

                .populate(
                    "createdBy",
                    "name email"
                )

                .sort({
                    createdAt: -1,
                })

                .lean();


        return res.status(200).json({

            success: true,

            count:
                jobs.length,

            jobs,

        });

    } catch (error) {

        console.error(
            "GET ALL JOBS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch jobs",

        });

    }

};


// =========================================================
// GET JOB BY ID
// GET /api/admin/jobs/:id
//
// SUPER ADMIN ONLY
// =========================================================

const getJobById = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid job ID",

            });

        }


        // =====================================================
        // FIND JOB
        // =====================================================

        const job =
            await Job.findById(id)

                .populate(
                    "createdBy",
                    "name email"
                );


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        return res.status(200).json({

            success: true,

            job,

        });

    } catch (error) {

        console.error(
            "GET JOB BY ID ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch job",

        });

    }

};


// =========================================================
// UPDATE JOB
// PUT /api/admin/jobs/:id
//
// SUPER ADMIN ONLY
// =========================================================

const updateJob = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid job ID",

            });

        }


        // =====================================================
        // FIND JOB
        // =====================================================

        const job =
            await Job.findById(id);


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        // =====================================================
        // TITLE
        // =====================================================

        if (
            req.body.title !== undefined
        ) {

            const value =
                String(
                    req.body.title
                ).trim();


            if (!value) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Job title cannot be empty",

                });

            }


            job.title =
                value;

        }


        // =====================================================
        // DEPARTMENT
        // =====================================================

        if (
            req.body.department !== undefined
        ) {

            job.department =
                String(
                    req.body.department
                ).trim();

        }


        // =====================================================
        // DESIGNATION
        // =====================================================

        if (
            req.body.designation !== undefined
        ) {

            job.designation =
                String(
                    req.body.designation
                ).trim();

        }


        // =====================================================
        // LOCATION
        // =====================================================

        if (
            req.body.location !== undefined
        ) {

            job.location =
                String(
                    req.body.location
                ).trim();

        }


        // =====================================================
        // EMPLOYMENT TYPE
        // =====================================================

        if (
            req.body.employmentType !== undefined
        ) {

            job.employmentType =
                req.body.employmentType;

        }


        // =====================================================
        // DESCRIPTION
        // =====================================================

        if (
            req.body.description !== undefined
        ) {

            const value =
                String(
                    req.body.description
                ).trim();


            if (!value) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Job description cannot be empty",

                });

            }


            job.description =
                value;

        }


        // =====================================================
        // REQUIREMENTS
        // =====================================================

        if (
            req.body.requirements !== undefined
        ) {

            job.requirements =
                Array.isArray(
                    req.body.requirements
                )

                    ? req.body.requirements

                        .map(item =>
                            String(item).trim()
                        )

                        .filter(Boolean)

                    : [];

        }


        // =====================================================
        // RESPONSIBILITIES
        // =====================================================

        if (
            req.body.responsibilities !== undefined
        ) {

            job.responsibilities =
                Array.isArray(
                    req.body.responsibilities
                )

                    ? req.body.responsibilities

                        .map(item =>
                            String(item).trim()
                        )

                        .filter(Boolean)

                    : [];

        }


        // =====================================================
        // SKILLS
        // =====================================================

        if (
            req.body.skills !== undefined
        ) {

            job.skills =
                Array.isArray(
                    req.body.skills
                )

                    ? req.body.skills

                        .map(item =>
                            String(item).trim()
                        )

                        .filter(Boolean)

                    : [];

        }


        // =====================================================
        // EXPERIENCE
        // =====================================================

        if (
            req.body.experience !== undefined
        ) {

            job.experience =
                String(
                    req.body.experience
                ).trim();

        }


        // =====================================================
        // SALARY MIN
        // =====================================================

        if (
            req.body.salaryMin !== undefined
        ) {

            if (
                req.body.salaryMin === "" ||
                req.body.salaryMin === null
            ) {

                job.salaryMin =
                    null;

            } else {

                const value =
                    Number(
                        req.body.salaryMin
                    );


                if (
                    Number.isNaN(value)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid minimum salary",

                    });

                }


                job.salaryMin =
                    value;

            }

        }


        // =====================================================
        // SALARY MAX
        // =====================================================

        if (
            req.body.salaryMax !== undefined
        ) {

            if (
                req.body.salaryMax === "" ||
                req.body.salaryMax === null
            ) {

                job.salaryMax =
                    null;

            } else {

                const value =
                    Number(
                        req.body.salaryMax
                    );


                if (
                    Number.isNaN(value)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid maximum salary",

                    });

                }


                job.salaryMax =
                    value;

            }

        }


        // =====================================================
        // SALARY RANGE VALIDATION
        // =====================================================

        if (

            job.salaryMin !== null &&

            job.salaryMax !== null &&

            job.salaryMin >
            job.salaryMax

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Minimum salary cannot be greater than maximum salary",

            });

        }


        // =====================================================
        // CURRENCY
        // =====================================================

        if (
            req.body.salaryCurrency !== undefined
        ) {

            job.salaryCurrency =
                String(
                    req.body.salaryCurrency
                ).trim();

        }


        // =====================================================
        // VACANCIES
        // =====================================================

        if (
            req.body.vacancies !== undefined
        ) {

            const value =
                Number(
                    req.body.vacancies
                );


            if (

                !Number.isInteger(value) ||

                value < 1

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Vacancies must be at least 1",

                });

            }


            job.vacancies =
                value;

        }


        // =====================================================
        // DEADLINE
        // =====================================================

        if (
            req.body.applicationDeadline !== undefined
        ) {

            if (
                !req.body.applicationDeadline
            ) {

                job.applicationDeadline =
                    null;

            } else {

                const deadline =
                    new Date(
                        req.body.applicationDeadline
                    );


                if (
                    Number.isNaN(
                        deadline.getTime()
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid application deadline",

                    });

                }


                job.applicationDeadline =
                    deadline;

            }

        }


        // =====================================================
        // STATUS
        // =====================================================

        if (
            req.body.status !== undefined
        ) {

            const allowedStatuses = [

                "Draft",

                "Published",

                "Closed",

            ];


            if (
                !allowedStatuses.includes(
                    req.body.status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid job status",

                });

            }


            job.status =
                req.body.status;

            if (req.body.isActive === undefined) {
                job.isActive =
                    req.body.status === "Published";
            }

        }


        // =====================================================
        // ACTIVE
        // =====================================================

        if (
            req.body.isActive !== undefined
        ) {

            job.isActive =
                Boolean(
                    req.body.isActive
                );

        }


        // =====================================================
        // SAVE
        // =====================================================

        await job.save();


        return res.status(200).json({

            success: true,

            message:
                "Job updated successfully",

            job,

        });

    } catch (error) {

        console.error(
            "UPDATE JOB ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update job",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,

        });

    }

};


// =========================================================
// DELETE JOB
// DELETE /api/admin/jobs/:id
//
// SUPER ADMIN ONLY
// =========================================================

const deleteJob = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid job ID",

            });

        }


        // =====================================================
        // FIND JOB
        // =====================================================

        const job =
            await Job.findById(id);


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        // =====================================================
        // DELETE
        // =====================================================

        await Job.findByIdAndDelete(id);


        return res.status(200).json({

            success: true,

            message:
                "Job deleted successfully",

        });

    } catch (error) {

        console.error(
            "DELETE JOB ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete job",

        });

    }

};


// =========================================================
// CLOSE JOB
// PATCH /api/admin/jobs/:id/close
//
// SUPER ADMIN ONLY
// =========================================================

const closeJob = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid job ID",

            });

        }


        // =====================================================
        // FIND JOB
        // =====================================================

        const job =
            await Job.findById(id);


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found",

            });

        }


        // =====================================================
        // CLOSE
        // =====================================================

        job.status =
            "Closed";

        job.isActive =
            false;


        await job.save();


        return res.status(200).json({

            success: true,

            message:
                "Job closed successfully",

            job,

        });

    } catch (error) {

        console.error(
            "CLOSE JOB ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to close job",

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {

    createJob,

    getAllJobs,

    getJobById,

    updateJob,

    deleteJob,

    closeJob,

};