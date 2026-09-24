import {
    Edit3,
    Power,
    Trash2,
    UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const EmployeeTable = ({
    employees,
    onEdit,
    onToggleStatus,
    onDelete,
    basePath = "/super-admin",
}) => {

    const navigate = useNavigate();


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!employees.length) {

        return (
            <div className="employee-empty-state">

                <div className="employee-empty-icon">
                    <UserRound size={28} />
                </div>

                <h3>
                    No employees found
                </h3>

                <p>
                    Add your first employee
                    to get started.
                </p>

            </div>
        );
    }


    /* =====================================================
       PROFILE NAVIGATION
    ===================================================== */

    const openEmployeeProfile = (employeeId) => {

        navigate(
            `${basePath}/employees/${employeeId}`
        );

    };


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    const handleEmployeeKeyDown = (
        event,
        employeeId
    ) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            openEmployeeProfile(
                employeeId
            );

        }

    };


    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="employee-table-wrapper">

            <table className="employee-table">

                <thead>

                    <tr>

                        <th>
                            Employee
                        </th>

                        <th>
                            Employee ID
                        </th>

                        <th>
                            Department
                        </th>

                        <th>
                            Designation
                        </th>

                        <th>
                            HR
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {employees.map(
                        (employee) => (

                            <tr
                                key={
                                    employee._id
                                }
                            >

                                {/* =================================
                                   EMPLOYEE
                                ================================= */}

                                <td>

                                    <div className="employee-user">

                                        <div className="employee-avatar">

                                            {
                                                employee.firstName
                                                    ?.charAt(0)
                                                    ?.toUpperCase()
                                            }

                                        </div>


                                        <div>

                                            <strong
                                                className="employee-name-link"
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    openEmployeeProfile(
                                                        employee._id
                                                    )
                                                }
                                                onKeyDown={(event) =>
                                                    handleEmployeeKeyDown(
                                                        event,
                                                        employee._id
                                                    )
                                                }
                                            >

                                                {
                                                    employee.firstName
                                                }{" "}

                                                {
                                                    employee.lastName
                                                }

                                            </strong>


                                            <span>
                                                {
                                                    employee.email
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </td>


                                {/* =================================
                                   EMPLOYEE ID
                                ================================= */}

                                <td>

                                    <span className="employee-id">

                                        {
                                            employee.employeeId
                                        }

                                    </span>

                                </td>


                                {/* =================================
                                   DEPARTMENT
                                ================================= */}

                                <td>

                                    {
                                        employee.department ||
                                        "—"
                                    }

                                </td>


                                {/* =================================
                                   DESIGNATION
                                ================================= */}

                                <td>

                                    {
                                        employee.designation ||
                                        "—"
                                    }

                                </td>


                                {/* =================================
                                   HR
                                ================================= */}

                                <td>

                                    {
                                        employee.reportingHR?.name ||
                                        "Not assigned"
                                    }

                                </td>


                                {/* =================================
                                   STATUS
                                ================================= */}

                                <td>

                                    <span
                                        className={
                                            employee.isActive
                                                ? "employee-status active"
                                                : "employee-status inactive"
                                        }
                                    >

                                        <span />

                                        {
                                            employee.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }

                                    </span>

                                </td>


                                {/* =================================
                                   ACTIONS
                                ================================= */}

                                <td>

                                    <div className="employee-actions">


                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            title="Edit"
                                            onClick={() =>
                                                onEdit(
                                                    employee
                                                )
                                            }
                                        >

                                            <Edit3
                                                size={16}
                                            />

                                        </button>


                                        {/* STATUS */}

                                        <button
                                            type="button"
                                            title={
                                                employee.isActive
                                                    ? "Deactivate"
                                                    : "Activate"
                                            }
                                            onClick={() =>
                                                onToggleStatus(
                                                    employee
                                                )
                                            }
                                        >

                                            <Power
                                                size={16}
                                            />

                                        </button>


                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            className="delete"
                                            title="Delete"
                                            onClick={() =>
                                                onDelete(
                                                    employee
                                                )
                                            }
                                        >

                                            <Trash2
                                                size={16}
                                            />

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        )
                    )}

                </tbody>

            </table>

        </div>

    );

};


export default EmployeeTable;