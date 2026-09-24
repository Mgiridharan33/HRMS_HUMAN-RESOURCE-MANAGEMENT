const mongoose = require("mongoose");

const Job = require("../models/Job");


// =========================================================
// GET PUBLISHED JOBS
// GET /api/jobs
//
// PUBLIC / CANDIDATE
// =========================================================

const getPublishedJobs = async (
    req,
    res
) => {

    try {

        const now = new Date();


        const jobs =
            await Job.find({

                status: "Published",

                isActive: true,

                $or: [

                    {
                        applicationDeadline: null,
                    },

                    {
                        applicationDeadline: {
                            $gte: now,
                        },
                    },

                ],

            })
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
            "GET PUBLISHED JOBS ERROR:",
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
// GET SINGLE PUBLISHED JOB
// GET /api/jobs/:id
//
// PUBLIC / CANDIDATE
// =========================================================

const getPublishedJobById = async (
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
        // FIND PUBLISHED JOB
        // =====================================================

        const job =
            await Job.findOne({

                _id: id,

                status: "Published",

                isActive: true,

                $or: [

                    {
                        applicationDeadline: null,
                    },

                    {
                        applicationDeadline: {
                            $gte: new Date(),
                        },
                    },

                ],

            })
                .lean();


        if (!job) {

            return res.status(404).json({

                success: false,

                message:
                    "Job not found or no longer available",

            });

        }


        // =====================================================
        // CHECK APPLICATION DEADLINE
        // =====================================================

        if (

            job.applicationDeadline &&

            new Date(
                job.applicationDeadline
            ) < new Date()

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Applications for this job are closed",

            });

        }


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            job,

        });

    } catch (error) {

        console.error(
            "GET PUBLISHED JOB ERROR:",
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
// EXPORTS
// =========================================================

module.exports = {

    getPublishedJobs,

    getPublishedJobById,

};