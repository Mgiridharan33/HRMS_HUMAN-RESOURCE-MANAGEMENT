import {
    Bell,
    ChevronDown,
    Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
    const { user } = useAuth();

    return (
        <header className="admin-topbar">

            <div className="topbar-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search anything..."
                />
            </div>

            <div className="topbar-right">

                <button
                    type="button"
                    className="notification-button"
                >
                    <Bell size={20} />

                    <span className="notification-dot" />
                </button>

                <div className="topbar-profile">

                    <div className="topbar-avatar">
                        {user?.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                    </div>

                    <div className="topbar-user-info">
                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role}
                        </span>
                    </div>

                    <ChevronDown size={17} />
                </div>

            </div>

        </header>
    );
};

export default Topbar;