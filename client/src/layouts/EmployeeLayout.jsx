import { Outlet } from "react-router-dom";

import EmployeeSidebar
    from "../components/employeer/EmployeeSidebar";

import "./EmployeeLayout.css";


const EmployeeLayout = () => {

    return (

        <div className="employee-layout">

            {/* =================================================
               SIDEBAR
            ================================================= */}

            <EmployeeSidebar />


            {/* =================================================
               MAIN CONTENT
            ================================================= */}

            <main className="employee-layout-content">

                <Outlet />

            </main>

        </div>

    );

};


export default EmployeeLayout;