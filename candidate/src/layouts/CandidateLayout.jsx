import {
    useState,
} from "react";

import {
    Outlet,
} from "react-router-dom";

import {
    Menu,
    BriefcaseBusiness,
} from "lucide-react";

import CandidateSidebar
    from "../components/candidate/CandidateSidebar";

import "./CandidateLayout.css";


const CandidateLayout = () => {

    const [
        sidebarCollapsed,
        setSidebarCollapsed,
    ] = useState(false);

    const [
        mobileSidebarOpen,
        setMobileSidebarOpen,
    ] = useState(false);


    const handleToggleSidebar = () => {

        setSidebarCollapsed(
            previous => !previous
        );

    };


    return (

        <div
            className={`candidate-layout ${
                sidebarCollapsed
                    ? "candidate-layout-collapsed"
                    : ""
            }`}
        >

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <div
                className={`candidate-sidebar-container ${
                    mobileSidebarOpen
                        ? "candidate-sidebar-mobile-open"
                        : ""
                }`}
            >

                <CandidateSidebar
                    collapsed={
                        sidebarCollapsed
                    }
                    onToggle={
                        handleToggleSidebar
                    }
                    onNavigate={() =>
                        setMobileSidebarOpen(
                            false
                        )
                    }
                />

            </div>


            {/* =====================================================
                MOBILE OVERLAY
            ====================================================== */}

            {mobileSidebarOpen && (

                <button
                    type="button"
                    className="candidate-mobile-overlay"
                    onClick={() =>
                        setMobileSidebarOpen(
                            false
                        )
                    }
                    aria-label="Close navigation"
                />

            )}


            {/* =====================================================
                MAIN
            ====================================================== */}

            <div className="candidate-layout-main">

                {/* MOBILE HEADER */}

                <header className="candidate-mobile-header">

                    <button
                        type="button"
                        className="candidate-mobile-menu"
                        onClick={() =>
                            setMobileSidebarOpen(
                                true
                            )
                        }
                        aria-label="Open navigation"
                    >

                        <Menu
                            size={21}
                        />

                    </button>


                    <div className="candidate-mobile-brand">

                        <div className="candidate-mobile-brand-icon">

                            <BriefcaseBusiness
                                size={18}
                            />

                        </div>

                        <span>
                            Candidate Portal
                        </span>

                    </div>

                </header>


                {/* PAGE */}

                <div className="candidate-page-container">

                    <Outlet />

                </div>

            </div>

        </div>

    );

};


export default CandidateLayout;