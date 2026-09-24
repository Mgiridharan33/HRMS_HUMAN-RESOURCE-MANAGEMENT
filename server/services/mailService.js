const nodemailer = require("nodemailer");


/*
=========================================================
EMAIL VALIDATION
=========================================================
*/

const isValidEmail = (email) => {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(email || "").trim()
    );

};


/*
=========================================================
HTML ESCAPE
=========================================================
*/

const escapeHtml = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};


/*
=========================================================
GET SMTP TRANSPORTER
=========================================================
*/

const getTransporter = () => {

    const host =
        String(
            process.env.SMTP_HOST || "smtp.gmail.com"
        ).trim();


    const port =
        Number(
            process.env.SMTP_PORT || 587
        );


    if (!Number.isInteger(port) || port < 1 || port > 65535) {

        throw new Error(
            "SMTP_PORT must be a valid port number"
        );

    }


    const secure =
        String(
            process.env.SMTP_SECURE || "false"
        ).toLowerCase() === "true";


    const user =
        String(
            process.env.SMTP_USER || ""
        ).trim();


    const pass =
        String(
            process.env.SMTP_PASS || ""
        )
            .replace(/\s+/g, "")
            .trim();


    /*
    -----------------------------------------------------
    Validate SMTP configuration
    -----------------------------------------------------
    */

    if (!host) {

        throw new Error(
            "SMTP_HOST is missing in .env"
        );

    }


    if (!user) {

        throw new Error(
            "SMTP_USER is missing in .env"
        );

    }


    if (!pass) {

        throw new Error(
            "SMTP_PASS is missing in .env"
        );

    }


    if (!isValidEmail(user)) {

        throw new Error(
            `SMTP_USER is not a valid email address: ${user}`
        );

    }


    /*
    -----------------------------------------------------
    Create Nodemailer transporter
    -----------------------------------------------------
    */

    return nodemailer.createTransport({

        host,

        port,

        secure:
            secure || port === 465,

        auth: {

            user,

            pass,

        },

    });

};


/*
=========================================================
VERIFY SMTP CONNECTION
=========================================================
*/

const verifyMailConnection = async () => {

    try {

        const transporter =
            getTransporter();


        await transporter.verify();


        console.log(
            "=========================================="
        );

        console.log(
            "GMAIL SMTP CONNECTION SUCCESSFUL"
        );

        console.log(
            "SMTP USER:",
            process.env.SMTP_USER
        );

        console.log(
            "=========================================="
        );


        return true;

    } catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "GMAIL SMTP CONNECTION FAILED"
        );

        console.error(
            error.message
        );

        console.error(
            "=========================================="
        );


        return false;

    }

};


/*
=========================================================
SEND JOB CONFIRMATION EMAIL
=========================================================
*/

const sendJobConfirmationEmail = async ({

    candidateName,

    candidateEmail,

    jobTitle,

    department,

    senderName,

    joiningDate,

    additionalMessage,

}) => {


    /*
    =====================================================
    VALIDATE CANDIDATE EMAIL
    =====================================================
    */

    if (!candidateEmail) {

        throw new Error(
            "Candidate email is missing"
        );

    }


    const cleanCandidateEmail =
        String(
            candidateEmail
        ).trim();


    if (!isValidEmail(cleanCandidateEmail)) {

        throw new Error(
            `Invalid candidate email: ${cleanCandidateEmail}`
        );

    }


    /*
    =====================================================
    SMTP ACCOUNT
    =====================================================
    */

    const mailFromAddress =
        String(
            process.env.SMTP_USER || ""
        ).trim();


    if (!isValidEmail(mailFromAddress)) {

        throw new Error(
            `SMTP_USER must be a valid email address. Current value: ${mailFromAddress}`
        );

    }


    /*
    =====================================================
    DISPLAY NAME
    =====================================================
    */

    const mailFromName =
        String(
            process.env.MAIL_FROM_NAME ||
            senderName ||
            " Technology HR"
        ).trim();


    /*
    =====================================================
    VALUES
    =====================================================
    */

    const cleanCandidateName =
        candidateName ||
        "Candidate";


    const cleanJobTitle =
        jobTitle ||
        "Selected Position";


    const cleanDepartment =
        department ||
        "Not specified";


    const cleanJoiningDate =
        joiningDate ||
        "To be confirmed by HR";


    const cleanMessage =
        additionalMessage ||
        "We are pleased to confirm that you have been selected for the position.";


    /*
    =====================================================
    ESCAPED HTML VALUES
    =====================================================
    */

    const safeCandidateName =
        escapeHtml(
            cleanCandidateName
        );


    const safeJobTitle =
        escapeHtml(
            cleanJobTitle
        );


    const safeDepartment =
        escapeHtml(
            cleanDepartment
        );


    const safeJoiningDate =
        escapeHtml(
            cleanJoiningDate
        );


    const safeMessage =
        escapeHtml(
            cleanMessage
        );


    const safeSenderName =
        escapeHtml(
            mailFromName
        );


    /*
    =====================================================
    EMAIL SUBJECT
    =====================================================
    */

    const subject =
        `Job Confirmation - ${cleanJobTitle}`;


    /*
    =====================================================
    PLAIN TEXT EMAIL
    =====================================================
    */

    const text = [

        `Dear ${cleanCandidateName},`,

        "",

        cleanMessage,

        "",

        `Position: ${cleanJobTitle}`,

        `Department: ${cleanDepartment}`,

        `Expected joining date: ${cleanJoiningDate}`,

        "",

        "Our HR team will contact you with the remaining onboarding details.",

        "",

        "Regards,",

        mailFromName,

        "Human Resources",

        " Technology",

    ].join("\n");


    /*
    =====================================================
    HTML EMAIL
    =====================================================
    */

    const html = `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Job Confirmation</title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f3f4f6;
        font-family:Arial,Helvetica,sans-serif;
    "
>


    <div
        style="
            width:100%;
            padding:40px 0;
        "
    >


        <div
            style="
                max-width:640px;
                margin:0 auto;
                background:#ffffff;
                border-radius:12px;
                overflow:hidden;
                border:1px solid #e5e7eb;
            "
        >


            <!-- HEADER -->

            <div
                style="
                    background:#111827;
                    padding:30px;
                    text-align:center;
                "
            >

                <h1
                    style="
                        margin:0;
                        color:#ffffff;
                        font-size:26px;
                    "
                >
                     Technology
                </h1>


                <p
                    style="
                        margin:8px 0 0;
                        color:#d1d5db;
                        font-size:14px;
                    "
                >
                    Human Resources
                </p>

            </div>


            <!-- CONTENT -->

            <div
                style="
                    padding:35px 32px;
                    color:#1f2937;
                "
            >


                <h2
                    style="
                        margin:0 0 22px;
                        color:#111827;
                        font-size:24px;
                    "
                >
                    Job Confirmation
                </h2>


                <p
                    style="
                        margin:0 0 18px;
                        font-size:15px;
                        line-height:1.7;
                    "
                >
                    Dear
                    <strong>
                        ${safeCandidateName}
                    </strong>,
                </p>


                <p
                    style="
                        margin:0 0 22px;
                        font-size:15px;
                        line-height:1.7;
                    "
                >
                    ${safeMessage}
                </p>


                <!-- JOB DETAILS -->

                <div
                    style="
                        background:#f9fafb;
                        border:1px solid #e5e7eb;
                        border-radius:10px;
                        padding:20px;
                        margin:25px 0;
                    "
                >


                    <p
                        style="
                            margin:7px 0;
                            font-size:15px;
                        "
                    >
                        <strong>
                            Position:
                        </strong>

                        ${safeJobTitle}
                    </p>


                    <p
                        style="
                            margin:7px 0;
                            font-size:15px;
                        "
                    >
                        <strong>
                            Department:
                        </strong>

                        ${safeDepartment}
                    </p>


                    <p
                        style="
                            margin:7px 0;
                            font-size:15px;
                        "
                    >
                        <strong>
                            Expected Joining Date:
                        </strong>

                        ${safeJoiningDate}
                    </p>


                </div>


                <p
                    style="
                        margin:0 0 20px;
                        font-size:15px;
                        line-height:1.7;
                    "
                >
                    Our HR team will contact you with
                    the remaining onboarding details.
                </p>


                <p
                    style="
                        margin:28px 0 0;
                        font-size:15px;
                        line-height:1.7;
                    "
                >

                    Regards,

                    <br>

                    <strong>
                        ${safeSenderName}
                    </strong>

                    <br>

                    Human Resources

                    <br>

                     Technology

                </p>


            </div>


            <!-- FOOTER -->

            <div
                style="
                    padding:18px 30px;
                    background:#f9fafb;
                    border-top:1px solid #e5e7eb;
                    text-align:center;
                "
            >

                <p
                    style="
                        margin:0;
                        color:#6b7280;
                        font-size:12px;
                    "
                >
                    This email was sent by the
                     Technology Human Resources team.
                </p>

            </div>


        </div>


    </div>


</body>

</html>

`;


    /*
    =====================================================
    GET TRANSPORTER
    =====================================================
    */

    const transporter =
        getTransporter();


    /*
    =====================================================
    SEND
    =====================================================
    */

    const info =
        await transporter.sendMail({

            /*
            Gmail authenticated account:
            giridharanotp@gmail.com

            Displayed as:
             Technology HR
            */

            from:
                `"${mailFromName}" <${mailFromAddress}>`,

            /*
            Candidate email
            */

            to:
                cleanCandidateEmail,

            /*
            Subject
            */

            subject,

            /*
            Plain text
            */

            text,

            /*
            HTML
            */

            html,

        });


    /*
    =====================================================
    SUCCESS LOG
    =====================================================
    */

    console.log(
        "=========================================="
    );

    console.log(
        "JOB CONFIRMATION EMAIL SENT SUCCESSFULLY"
    );

    console.log(
        "TO:",
        cleanCandidateEmail
    );

    console.log(
        "FROM:",
        `${mailFromName} <${mailFromAddress}>`
    );

    console.log(
        "SUBJECT:",
        subject
    );

    console.log(
        "MESSAGE ID:",
        info.messageId
    );

    console.log(
        "=========================================="
    );


    return info;

};


/*
=========================================================
EXPORTS
=========================================================
*/

module.exports = {

    getTransporter,

    verifyMailConnection,

    sendJobConfirmationEmail,

};