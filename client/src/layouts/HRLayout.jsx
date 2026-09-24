import {
    Outlet,
} from "react-router-dom";

import HRSidebar
    from "../components/hr/HRSidebar";

import "../styles/hr/HRLayout.css";
import "../styles/hr/HRSidebar.css";


const HRLayout = () => {

    return (

        <div className="hr-layout">

            {/* SIDEBAR */}

            <HRSidebar />


            {/* MAIN CONTENT */}

            <main className="hr-layout-content">

                <Outlet />

            </main>

        </div>

    );
};


export default HRLayout;
