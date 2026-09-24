import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="basic-dashboard-page">
            <div className="basic-dashboard-card">
                <span className="basic-dashboard-eyebrow">
                    HRMS
                </span>

                <h1>HRMS Dashboard</h1>

                <h2>Welcome, {user?.name}</h2>

                <p>Email: {user?.email}</p>

                <p>Role: {user?.role}</p>

                <button
                    className="basic-dashboard-logout"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;