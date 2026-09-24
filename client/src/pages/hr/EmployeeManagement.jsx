import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Users,
    UserCheck,
    UserX,
    RefreshCw,
} from "lucide-react";

import EmployeeTable from "../../components/employee/EmployeeTable";
import EmployeeForm from "../../components/employee/EmployeeForm";

import employeeApi from "../../services/employeeApi";


const HREmployeeManagement = () => {

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [formLoading, setFormLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingEmployee, setEditingEmployee] =
        useState(null);


    /* =====================================================
       LOAD EMPLOYEES
    ===================================================== */

    const loadEmployees = async () => {

        try {

            setLoading(true);

            const response =
                await employeeApi.getAll();

            if (response.success) {

                setEmployees(
                    response.employees || []
                );

            }

        } catch (error) {

            console.error(
                "Failed to load employees:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employees"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadEmployees();

    }, []);


    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredEmployees = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        if (!value) {

            return employees;

        }

        return employees.filter((employee) => {

            const name =
                `${employee.firstName || ""} ${
                    employee.lastName || ""
                }`.toLowerCase();

            return (
                name.includes(value) ||
                employee.email
                    ?.toLowerCase()
                    .includes(value) ||
                employee.employeeId
                    ?.toLowerCase()
                    .includes(value) ||
                employee.department
                    ?.toLowerCase()
                    .includes(value) ||
                employee.designation
                    ?.toLowerCase()
                    .includes(value)
            );

        });

    }, [employees, search]);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalEmployees =
        employees.length;

    const activeEmployees =
        employees.filter(
            (employee) =>
                employee.isActive
        ).length;

    const inactiveEmployees =
        employees.filter(
            (employee) =>
                !employee.isActive
        ).length;


    /* =====================================================
       ADD EMPLOYEE
    ===================================================== */

    const handleAdd = () => {

        setEditingEmployee(null);

        setShowForm(true);

    };


    /* =====================================================
       EDIT EMPLOYEE
    ===================================================== */

    const handleEdit = (employee) => {

        setEditingEmployee(employee);

        setShowForm(true);

    };


    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    const handleSubmit = async (formData) => {

        try {

            setFormLoading(true);

            let response;


            if (editingEmployee) {

                response =
                    await employeeApi.update(
                        editingEmployee._id,
                        formData
                    );

            } else {

                /*
                =============================================
                HR CREATES EMPLOYEE
                =============================================
                */

                response =
                    await employeeApi.create(
                        formData
                    );

            }


            if (response.success) {

                alert(
                    response.message ||
                    (
                        editingEmployee
                            ? "Employee updated successfully"
                            : "Employee created successfully"
                    )
                );

                setShowForm(false);

                setEditingEmployee(null);

                await loadEmployees();

            }

        } catch (error) {

            console.error(
                "Employee save error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save employee"
            );

        } finally {

            setFormLoading(false);

        }

    };


    /* =====================================================
       TOGGLE STATUS
    ===================================================== */

    const handleToggleStatus = async (employee) => {

        const action =
            employee.isActive
                ? "deactivate"
                : "activate";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} ${
                    employee.firstName
                } ${employee.lastName || ""}?`
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await employeeApi.toggleStatus(
                    employee._id
                );


            if (response.success) {

                alert(
                    response.message
                );

                await loadEmployees();

            }

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update employee status"
            );

        }

    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (employee) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to permanently delete ${
                    employee.firstName
                } ${employee.lastName || ""}?`
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await employeeApi.delete(
                    employee._id
                );


            if (response.success) {

                alert(
                    response.message
                );

                await loadEmployees();

            }

        } catch (error) {

            console.error(
                "Delete employee error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete employee"
            );

        }

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="employee-management-page">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="employee-page-header">

                <div>

                    <h1>
                        Employee Management
                    </h1>

                    <p>
                        Manage employees assigned
                        to your organization.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-employee-button"
                    onClick={handleAdd}
                >

                    <Plus size={18} />

                    Add Employee

                </button>

            </div>


            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="employee-stats-grid">

                <div className="employee-stat-card">

                    <div className="employee-stat-icon">

                        <Users size={21} />

                    </div>

                    <div>

                        <span>
                            Total Employees
                        </span>

                        <strong>
                            {totalEmployees}
                        </strong>

                    </div>

                </div>


                <div className="employee-stat-card">

                    <div className="employee-stat-icon active">

                        <UserCheck size={21} />

                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>
                            {activeEmployees}
                        </strong>

                    </div>

                </div>


                <div className="employee-stat-card">

                    <div className="employee-stat-icon inactive">

                        <UserX size={21} />

                    </div>

                    <div>

                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveEmployees}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
               EMPLOYEE LIST
            ================================================= */}

            <div className="employee-list-card">

                <div className="employee-list-header">

                    <div>

                        <h2>
                            Employees
                        </h2>

                        <p>
                            {filteredEmployees.length} employee
                            {filteredEmployees.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>


                    <div className="employee-list-actions">

                        <div className="employee-search">

                            <Search size={17} />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search employees..."
                            />

                        </div>


                        <button
                            type="button"
                            className="refresh-button"
                            onClick={loadEmployees}
                            disabled={loading}
                            title="Refresh"
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "spin"
                                        : ""
                                }
                            />

                        </button>

                    </div>

                </div>


                {/* =================================================
                   TABLE
                ================================================= */}

                {loading ? (

                    <div className="employee-loading">

                        <RefreshCw
                            size={24}
                            className="spin"
                        />

                        <span>
                            Loading employees...
                        </span>

                    </div>

                ) : (

                    <EmployeeTable
                        employees={filteredEmployees}
                        onEdit={handleEdit}
                        onToggleStatus={
                            handleToggleStatus
                        }
                        onDelete={
                            handleDelete
                        }
                        basePath="/hr"
                    />

                )}

            </div>


            {/* =================================================
               ADD / EDIT FORM
            ================================================= */}

            <EmployeeForm

                isOpen={showForm}

                onClose={() => {

                    if (!formLoading) {

                        setShowForm(false);

                        setEditingEmployee(null);

                    }

                }}

                onSubmit={handleSubmit}

                editingEmployee={
                    editingEmployee
                }

                /*
                 * HR does not need to select
                 * another HR.
                 */
                hrList={[]}

                loading={
                    formLoading
                }

            />

        </div>

    );

};


export default HREmployeeManagement;
