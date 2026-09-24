import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    LogIn,
} from "lucide-react";

import {
    useCandidateAuth,
} from "../../context/CandidateAuthContext";


const Login = () => {
    const navigate =
        useNavigate();

    const {
        login,
    } = useCandidateAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError(
                "Please enter email and password"
            );

            return;
        }

        try {
            setLoading(true);

            const response =
                await login(
                    email,
                    password
                );

            if (!response?.success) {
                setError(
                    response?.message ||
                    "Login failed"
                );

                return;
            }

            navigate("/dashboard");
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to login"
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="auth-logo">
                        HR
                    </div>

                    <h1>
                        Candidate Portal
                    </h1>

                    <p>
                        Sign in to manage your
                        applications and interviews.
                    </p>

                </div>


                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>

                        <div className="password-input">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        <LogIn size={18} />

                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create Candidate Account
                    </Link>

                </div>

            </div>

        </div>
    );
};


export default Login;