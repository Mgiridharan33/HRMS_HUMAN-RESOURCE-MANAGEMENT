import { useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await login(
                formData.email,
                formData.password
            );

            if (response.success) {
                const returnPath =
                    location.state?.from?.pathname;

                if (returnPath && returnPath !== "/login") {
                    navigate(returnPath, { replace: true });
                } else if (response.user.role === "SUPER_ADMIN") {
                    navigate("/super-admin/dashboard", { replace: true });
                } else if (response.user.role === "HR") {
                    navigate("/hr/dashboard", { replace: true });
                } else if (response.user.role === "EMPLOYEE") {
                    navigate("/employee/dashboard", { replace: true });
                }
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>HRMS</h1>

                <p>Human Resource Management System</p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;