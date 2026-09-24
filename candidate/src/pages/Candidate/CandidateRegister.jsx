import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    UserPlus,
} from "lucide-react";

import {
    registerCandidate,
} from "../../services/candidateApi";


const Register = () => {
    const navigate =
        useNavigate();

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            phone: "",
            password: "",
        });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !form.name ||
            !form.email ||
            !form.password
        ) {
            setError(
                "Name, email and password are required"
            );

            return;
        }

        try {
            setLoading(true);

            const response =
                await registerCandidate(
                    form
                );

            if (!response?.success) {
                setError(
                    response?.message ||
                    "Registration failed"
                );

                return;
            }

            setSuccess(
                "Account created successfully"
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 700);

        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to create account"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card register-card">

                <div className="auth-header">

                    <div className="auth-logo">
                        HR
                    </div>

                    <h1>
                        Create Candidate Account
                    </h1>

                    <p>
                        Create your account to apply
                        for jobs and attend interviews.
                    </p>

                </div>


                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}


                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Phone
                        </label>

                        <input
                            name="phone"
                            type="tel"
                            placeholder="Enter phone number"
                            value={form.phone}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <input
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >

                        <UserPlus size={18} />

                        {loading
                            ? "Creating..."
                            : "Create Account"}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign In
                    </Link>

                </div>

            </div>

        </div>
    );
};


export default Register;