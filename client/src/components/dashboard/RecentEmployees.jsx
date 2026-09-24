import { useNavigate } from "react-router-dom";

const RecentEmployees = ({
    employees = [],
    hrList = [],
}) => {

    const navigate = useNavigate();


    /*
    =====================================================
    PREPARE EMPLOYEES
    =====================================================
    */

    const employeeData = employees.map(
        (employee) => {

            const fullName =
                [
                    employee.firstName,
                    employee.lastName,
                ]
                    .filter(Boolean)
                    .join(" ") ||
                employee.name ||
                "Unknown Employee";

            return {
                ...employee,

                recordType: "Employee",

                displayName: fullName,

                displayEmail:
                    employee.email ||
                    "No email",

                displayDepartment:
                    employee.department ||
                    "—",

                displayDesignation:
                    employee.designation ||
                    "—",

                displayStatus:
                    employee.isActive === true
                        ? "Active"
                        : "Inactive",

                createdDate:
                    employee.createdAt ||
                    null,
            };
        }
    );


    /*
    =====================================================
    PREPARE HR
    =====================================================
    */

    const hrData = hrList.map(
        (hr) => {

            return {
                ...hr,

                recordType: "HR",

                displayName:
                    hr.name ||
                    "Unknown HR",

                displayEmail:
                    hr.email ||
                    "No email",

                displayDepartment:
                    hr.department ||
                    "Human Resources",

                displayDesignation:
                    hr.designation ||
                    "HR",

                displayStatus:
                    hr.isActive === true
                        ? "Active"
                        : "Inactive",

                createdDate:
                    hr.createdAt ||
                    null,
            };
        }
    );


    /*
    =====================================================
    COMBINE EMPLOYEES + HR
    =====================================================
    */

    const allPeople = [
        ...employeeData,
        ...hrData,
    ];


    /*
    =====================================================
    SORT BY CREATED DATE
    =====================================================
    */

    const recentPeople =
        allPeople
            .sort(
                (a, b) =>
                    new Date(
                        b.createdDate || 0
                    ) -
                    new Date(
                        a.createdDate || 0
                    )
            )
            .slice(0, 5);


    /*
    =====================================================
    EMPTY STATE
    =====================================================
    */

    if (!recentPeople.length) {

        return (

            <div className="recent-employees-card">

                <div className="section-header">

                    <div>

                        <h3>
                            Recent People
                        </h3>

                        <p>
                            Recently added HR
                            and employees
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/super-admin/employees"
                            )
                        }
                    >
                        View All
                    </button>

                </div>


                <div className="recent-employees-empty">

                    <div className="employee-avatar">
                        —
                    </div>

                    <div>

                        <strong>
                            No records found
                        </strong>

                        <span>
                            HR and employees will
                            appear here after they
                            are added.
                        </span>

                    </div>

                </div>

            </div>
        );
    }


    /*
    =====================================================
    TABLE
    =====================================================
    */

    return (

        <div className="recent-employees-card">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="section-header">

                <div>

                    <h3>
                        Recent People
                    </h3>

                    <p>
                        Recently added HR
                        and employees
                    </p>

                </div>


                <div className="recent-people-buttons">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/super-admin/employees"
                            )
                        }
                    >
                        Employees
                    </button>
 

 <a className="division-emp">/</a>
 
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/super-admin/hr"
                            )
                        }
                    >
                         HR
                    </button>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="employee-table-wrapper">

                <table className="employee-table">

                    <thead>

                        <tr>

                            <th>
                                Person
                            </th>

                            <th>
                                Type
                            </th>

                            <th>
                                Department
                            </th>

                            <th>
                                Designation
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {recentPeople.map(
                            (person) => {

                                const isHR =
                                    person.recordType ===
                                    "HR";


                                return (

                                    <tr
                                        key={
                                            `${person.recordType}-${person._id}`
                                        }
                                    >


                                        {/* =================================
                                            PERSON
                                        ================================= */}

                                        <td>

                                            <div className="employee-name">

                                                <div className="employee-avatar">

                                                    {person.displayName
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                <div>

                                                    <strong
                                                        className="employee-name-link"
                                                        onClick={() => {

                                                            if (
                                                                !person._id
                                                            ) {
                                                                return;
                                                            }


                                                            navigate(
                                                                isHR
                                                                    ? `/super-admin/hr/${person._id}`
                                                                    : `/super-admin/employees/${person._id}`
                                                            );

                                                        }}
                                                    >
                                                        {
                                                            person.displayName
                                                        }
                                                    </strong>


                                                    <span>
                                                        {
                                                            person.displayEmail
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* =================================
                                            TYPE
                                        ================================= */}

                                        <td>

                                            <span
                                                className={
                                                    isHR
                                                        ? "person-type hr"
                                                        : "person-type employee"
                                                }
                                            >
                                                {
                                                    person.recordType
                                                }
                                            </span>

                                        </td>


                                        {/* =================================
                                            DEPARTMENT
                                        ================================= */}

                                        <td>

                                            {
                                                person.displayDepartment
                                            }

                                        </td>


                                        {/* =================================
                                            DESIGNATION
                                        ================================= */}

                                        <td>

                                            {
                                                person.displayDesignation
                                            }

                                        </td>


                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td>

                                            <span
                                                className={
                                                    person.displayStatus ===
                                                    "Active"
                                                        ? "status-badge active"
                                                        : "status-badge inactive"
                                                }
                                            >

                                                {
                                                    person.displayStatus
                                                }

                                            </span>

                                        </td>

                                    </tr>

                                );

                            }
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};


export default RecentEmployees;