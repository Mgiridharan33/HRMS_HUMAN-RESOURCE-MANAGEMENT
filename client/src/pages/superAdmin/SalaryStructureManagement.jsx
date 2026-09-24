import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Calculator,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Edit3,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

import axios from "axios";

import "./SalaryStructureManagement.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// HELPERS
// =====================================================

const getEmployeeName = (employee) => {

    if (!employee) {
        return "Unknown Employee";
    }

    const fullName = [
        employee.firstName,
        employee.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        fullName ||
        employee.name ||
        employee.employeeId ||
        "Employee"
    );
};


const formatCurrency = (value) => {

    const amount = Number(value || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


const formatDate = (value) => {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const emptyForm = {
    employee: "",

    basicSalary: "",

    hra: "",
    da: "",
    conveyanceAllowance: "",
    medicalAllowance: "",
    specialAllowance: "",
    otherAllowance: "",

    overtimeRatePerHour: "",

    bonus: "",
    incentive: "",

    pfEnabled: true,
    pfPercentage: 12,

    esiEnabled: false,
    esiPercentage: 0,

    professionalTax: "",
    tdsPercentage: 0,

    loanDeduction: "",
    otherDeduction: "",

    standardWorkingHoursPerDay: 8,
    standardWorkingDaysPerMonth: 26,

    effectiveFrom: "",
    effectiveTo: "",

    notes: "",
};


// =====================================================
// COMPONENT
// =====================================================

const SalaryStructureManagement = () => {

    // =================================================
    // STATE
    // =================================================

    const [salaryStructures, setSalaryStructures] =
        useState([]);

    const [employees, setEmployees] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [loadingEmployees, setLoadingEmployees] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [showModal, setShowModal] =
        useState(false);

    const [editingStructure, setEditingStructure] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);

    const [showMoreFields, setShowMoreFields] =
        useState(false);


    // =================================================
    // LOAD SALARY STRUCTURES
    // =================================================

    const loadSalaryStructures =
        useCallback(async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await axios.get(
                        `${API_URL}/salary-structures`,
                        {
                            withCredentials: true,
                        }
                    );

                const list =
                    response?.data?.salaryStructures ||
                    response?.data?.data ||
                    [];

                setSalaryStructures(
                    Array.isArray(list)
                        ? list
                        : []
                );

            } catch (err) {

                console.error(
                    "LOAD SALARY STRUCTURES ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load salary structures."
                );

            } finally {

                setLoading(false);
            }

        }, []);


    // =================================================
    // LOAD EMPLOYEES
    // =================================================

    const loadEmployees =
        useCallback(async () => {

            try {

                setLoadingEmployees(true);

                const response =
                    await axios.get(
                        `${API_URL}/employees`,
                        {
                            withCredentials: true,
                        }
                    );

                const list =
                    response?.data?.employees ||
                    response?.data?.data ||
                    [];

                setEmployees(
                    Array.isArray(list)
                        ? list
                        : []
                );

            } catch (err) {

                console.error(
                    "LOAD EMPLOYEES ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load employees."
                );

            } finally {

                setLoadingEmployees(false);
            }

        }, []);


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadSalaryStructures();
        loadEmployees();

    }, [
        loadSalaryStructures,
        loadEmployees,
    ]);


    // =================================================
    // FILTER
    // =================================================

    const filteredStructures =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return salaryStructures.filter(
                structure => {

                    const employee =
                        structure.employee;

                    const employeeName =
                        getEmployeeName(
                            employee
                        ).toLowerCase();

                    const employeeId =
                        String(
                            employee?.employeeId || ""
                        ).toLowerCase();

                    const email =
                        String(
                            employee?.email || ""
                        ).toLowerCase();

                    const department =
                        String(
                            employee?.department || ""
                        ).toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        employeeName.includes(
                            searchText
                        ) ||
                        employeeId.includes(
                            searchText
                        ) ||
                        email.includes(
                            searchText
                        ) ||
                        department.includes(
                            searchText
                        );

                    const matchesStatus =
                        statusFilter === "all" ||
                        (
                            statusFilter === "active" &&
                            structure.isActive
                        ) ||
                        (
                            statusFilter === "inactive" &&
                            !structure.isActive
                        );

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            salaryStructures,
            search,
            statusFilter,
        ]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary = useMemo(() => {

        const total =
            salaryStructures.length;

        const active =
            salaryStructures.filter(
                item => item.isActive
            ).length;

        const inactive =
            total - active;

        return {
            total,
            active,
            inactive,
        };

    }, [salaryStructures]);


    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData(
            previous => ({
                ...previous,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            })
        );

        setError("");
        setSuccess("");
    };


    // =================================================
    // OPEN CREATE
    // =================================================

    const openCreateModal = () => {

        setEditingStructure(null);

        setFormData({
            ...emptyForm,
            effectiveFrom:
                new Date()
                    .toISOString()
                    .split("T")[0],
        });

        setShowMoreFields(false);
        setError("");
        setSuccess("");
        setShowModal(true);
    };


    // =================================================
    // OPEN EDIT
    // =================================================

    const openEditModal = (structure) => {

        setEditingStructure(
            structure
        );

        setFormData({

            employee:
                structure.employee?._id ||
                structure.employee ||
                "",

            basicSalary:
                structure.basicSalary ?? "",

            hra:
                structure.hra ?? "",

            da:
                structure.da ?? "",

            conveyanceAllowance:
                structure.conveyanceAllowance ?? "",

            medicalAllowance:
                structure.medicalAllowance ?? "",

            specialAllowance:
                structure.specialAllowance ?? "",

            otherAllowance:
                structure.otherAllowance ?? "",

            overtimeRatePerHour:
                structure.overtimeRatePerHour ?? "",

            bonus:
                structure.bonus ?? "",

            incentive:
                structure.incentive ?? "",

            pfEnabled:
                Boolean(
                    structure.pfEnabled
                ),

            pfPercentage:
                structure.pfPercentage ?? 0,

            esiEnabled:
                Boolean(
                    structure.esiEnabled
                ),

            esiPercentage:
                structure.esiPercentage ?? 0,

            professionalTax:
                structure.professionalTax ?? "",

            tdsPercentage:
                structure.tdsPercentage ?? 0,

            loanDeduction:
                structure.loanDeduction ?? "",

            otherDeduction:
                structure.otherDeduction ?? "",

            standardWorkingHoursPerDay:
                structure.standardWorkingHoursPerDay ??
                8,

            standardWorkingDaysPerMonth:
                structure.standardWorkingDaysPerMonth ??
                26,

            effectiveFrom:
                structure.effectiveFrom
                    ? new Date(
                        structure.effectiveFrom
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            effectiveTo:
                structure.effectiveTo
                    ? new Date(
                        structure.effectiveTo
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            notes:
                structure.notes || "",

        });

        setShowMoreFields(true);
        setError("");
        setSuccess("");
        setShowModal(true);
    };


    // =================================================
    // CLOSE MODAL
    // =================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingStructure(null);
        setFormData(emptyForm);
        setShowMoreFields(false);
        setError("");
    };


    // =================================================
    // VALIDATE
    // =================================================

    const validateForm = () => {

        if (!formData.employee) {
            return "Please select an employee.";
        }

        const basic =
            Number(
                formData.basicSalary
            );

        if (
            !Number.isFinite(basic) ||
            basic <= 0
        ) {
            return "Basic salary must be greater than zero.";
        }

        const percentageFields = [
            [
                "PF percentage",
                formData.pfPercentage,
            ],
            [
                "ESI percentage",
                formData.esiPercentage,
            ],
            [
                "TDS percentage",
                formData.tdsPercentage,
            ],
        ];

        for (
            const [
                label,
                value,
            ] of percentageFields
        ) {

            const number =
                Number(value || 0);

            if (
                !Number.isFinite(number) ||
                number < 0 ||
                number > 100
            ) {
                return `${label} must be between 0 and 100.`;
            }
        }

        const hours =
            Number(
                formData.standardWorkingHoursPerDay
            );

        if (
            !Number.isFinite(hours) ||
            hours <= 0
        ) {
            return "Working hours per day must be greater than zero.";
        }

        const days =
            Number(
                formData.standardWorkingDaysPerMonth
            );

        if (
            !Number.isFinite(days) ||
            days <= 0
        ) {
            return "Working days per month must be greater than zero.";
        }

        return null;
    };


    // =================================================
    // BUILD PAYLOAD
    // =================================================

    const buildPayload = () => {

        const numericFields = [
            "basicSalary",

            "hra",
            "da",
            "conveyanceAllowance",
            "medicalAllowance",
            "specialAllowance",
            "otherAllowance",

            "overtimeRatePerHour",

            "bonus",
            "incentive",

            "pfPercentage",
            "esiPercentage",

            "professionalTax",
            "tdsPercentage",

            "loanDeduction",
            "otherDeduction",

            "standardWorkingHoursPerDay",
            "standardWorkingDaysPerMonth",
        ];

        const payload = {
            employee: formData.employee,

            pfEnabled:
                Boolean(
                    formData.pfEnabled
                ),

            esiEnabled:
                Boolean(
                    formData.esiEnabled
                ),

            effectiveFrom:
                formData.effectiveFrom ||
                undefined,

            effectiveTo:
                formData.effectiveTo ||
                null,

            notes:
                formData.notes || "",
        };

        numericFields.forEach(
            field => {

                const value =
                    formData[field];

                payload[field] =
                    value === "" ||
                    value === null ||
                    value === undefined
                        ? 0
                        : Number(value);
            }
        );

        return payload;
    };


    // =================================================
    // SAVE
    // =================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {

            setError(
                validationError
            );

            return;
        }

        try {

            setSaving(true);

            const payload =
                buildPayload();

            let response;

            if (editingStructure) {

                response =
                    await axios.put(
                        `${API_URL}/salary-structures/${editingStructure._id}`,
                        payload,
                        {
                            withCredentials: true,
                        }
                    );

            } else {

                response =
                    await axios.post(
                        `${API_URL}/salary-structures`,
                        payload,
                        {
                            withCredentials: true,
                        }
                    );
            }

            const message =
                response?.data?.message ||
                (
                    editingStructure
                        ? "Salary structure updated successfully."
                        : "Salary structure created successfully."
                );

            setSuccess(message);

            await loadSalaryStructures();

            setTimeout(() => {

                closeModal();

            }, 500);

        } catch (err) {

            console.error(
                "SAVE SALARY STRUCTURE ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to save salary structure."
            );

        } finally {

            setSaving(false);
        }
    };


    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (structure) => {

        const employeeName =
            getEmployeeName(
                structure.employee
            );

        const confirmed =
            window.confirm(
                `Delete salary structure for ${employeeName}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                structure._id
            );

            setError("");

            await axios.delete(
                `${API_URL}/salary-structures/${structure._id}`,
                {
                    withCredentials: true,
                }
            );

            setSuccess(
                "Salary structure deleted successfully."
            );

            await loadSalaryStructures();

        } catch (err) {

            console.error(
                "DELETE SALARY STRUCTURE ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to delete salary structure."
            );

        } finally {

            setDeletingId("");
        }
    };


    // =================================================
    // TOGGLE STATUS
    // =================================================

    const handleToggleStatus = async (
        structure
    ) => {

        try {

            setError("");

            const endpoint =
                structure.isActive
                    ? "deactivate"
                    : "activate";

            await axios.put(
                `${API_URL}/salary-structures/${structure._id}/${endpoint}`,
                {},
                {
                    withCredentials: true,
                }
            );

            await loadSalaryStructures();

            setSuccess(
                structure.isActive
                    ? "Salary structure deactivated."
                    : "Salary structure activated."
            );

        } catch (err) {

            console.error(
                "TOGGLE SALARY STRUCTURE ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to update salary structure status."
            );
        }
    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="salary-structure-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="salary-page-header">

                <div>

                    <div className="salary-page-heading">

                        <div className="salary-page-icon">

                            <Calculator size={24} />

                        </div>

                        <div>

                            <h1>
                                Salary Structures
                            </h1>

                            <p>
                                Configure employee salary,
                                allowances and deductions.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="salary-header-actions">

                    <button
                        type="button"
                        className="salary-refresh-btn"
                        onClick={
                            loadSalaryStructures
                        }
                        disabled={loading}
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "salary-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="salary-create-btn"
                        onClick={
                            openCreateModal
                        }
                    >

                        <Plus size={18} />

                        Create Salary Structure

                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="salary-alert salary-alert-error">

                    <XCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {success && (

                <div className="salary-alert salary-alert-success">

                    <CheckCircle2 size={18} />

                    <span>
                        {success}
                    </span>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="salary-summary-grid">

                <div className="salary-summary-card">

                    <div className="salary-summary-icon">
                        <Calculator size={20} />
                    </div>

                    <div>
                        <span>Total Structures</span>
                        <strong>
                            {summary.total}
                        </strong>
                    </div>

                </div>


                <div className="salary-summary-card">

                    <div className="salary-summary-icon">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Active</span>
                        <strong>
                            {summary.active}
                        </strong>
                    </div>

                </div>


                <div className="salary-summary-card">

                    <div className="salary-summary-icon">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Inactive</span>
                        <strong>
                            {summary.inactive}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="salary-filter-bar">

                <div className="salary-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search employee, ID, email..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X size={16} />
                        </button>

                    )}

                </div>


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="inactive">
                        Inactive
                    </option>

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="salary-table-card">

                {loading ? (

                    <div className="salary-loading">

                        <Loader2
                            size={30}
                            className="salary-spin"
                        />

                        <span>
                            Loading salary structures...
                        </span>

                    </div>

                ) : filteredStructures.length === 0 ? (

                    <div className="salary-empty">

                        <div className="salary-empty-icon">
                            <Calculator size={28} />
                        </div>

                        <h3>
                            No salary structures found
                        </h3>

                        <p>
                            Create a salary structure
                            for an employee before
                            generating payroll.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openCreateModal
                            }
                        >

                            <Plus size={17} />

                            Create Salary Structure

                        </button>

                    </div>

                ) : (

                    <div className="salary-table-wrapper">

                        <table className="salary-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Basic Salary
                                    </th>

                                    <th>
                                        Gross Salary
                                    </th>

                                    <th>
                                        PF
                                    </th>

                                    <th>
                                        ESI
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Effective From
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStructures.map(
                                    structure => {

                                        const employee =
                                            structure.employee;

                                        const grossSalary =
                                            Number(
                                                structure.basicSalary || 0
                                            ) +

                                            Number(
                                                structure.hra || 0
                                            ) +

                                            Number(
                                                structure.da || 0
                                            ) +

                                            Number(
                                                structure.conveyanceAllowance || 0
                                            ) +

                                            Number(
                                                structure.medicalAllowance || 0
                                            ) +

                                            Number(
                                                structure.specialAllowance || 0
                                            ) +

                                            Number(
                                                structure.otherAllowance || 0
                                            );

                                        return (

                                            <tr
                                                key={
                                                    structure._id
                                                }
                                            >

                                                <td>

                                                    <div className="salary-employee-cell">

                                                        <div className="salary-avatar">

                                                            {employee?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        employee.profileImage
                                                                    }
                                                                    alt=""
                                                                />

                                                            ) : (

                                                                <UserRound
                                                                    size={19}
                                                                />

                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    getEmployeeName(
                                                                        employee
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    employee?.employeeId ||
                                                                    "No ID"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    {employee?.department ||
                                                        "—"}

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                structure.basicSalary
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                grossSalary
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>

                                                    {structure.pfEnabled
                                                        ? `${structure.pfPercentage || 0}%`
                                                        : "Disabled"}

                                                </td>


                                                <td>

                                                    {structure.esiEnabled
                                                        ? `${structure.esiPercentage || 0}%`
                                                        : "Disabled"}

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            structure.isActive
                                                                ? "salary-status salary-status-active"
                                                                : "salary-status salary-status-inactive"
                                                        }
                                                    >

                                                        {structure.isActive
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        formatDate(
                                                            structure.effectiveFrom
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <div className="salary-actions">

                                                        <button
                                                            type="button"
                                                            className="salary-action-edit"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    structure
                                                                )
                                                            }
                                                        >

                                                            <Edit3
                                                                size={16}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                structure.isActive
                                                                    ? "salary-action-warning"
                                                                    : "salary-action-success"
                                                            }
                                                            title={
                                                                structure.isActive
                                                                    ? "Deactivate"
                                                                    : "Activate"
                                                            }
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    structure
                                                                )
                                                            }
                                                        >

                                                            {structure.isActive
                                                                ? (
                                                                    <XCircle
                                                                        size={16}
                                                                    />
                                                                )
                                                                : (
                                                                    <CheckCircle2
                                                                        size={16}
                                                                    />
                                                                )}

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="salary-action-delete"
                                                            title="Delete"
                                                            disabled={
                                                                deletingId ===
                                                                structure._id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    structure
                                                                )
                                                            }
                                                        >

                                                            {deletingId ===
                                                            structure._id
                                                                ? (
                                                                    <Loader2
                                                                        size={16}
                                                                        className="salary-spin"
                                                                    />
                                                                )
                                                                : (
                                                                    <Trash2
                                                                        size={16}
                                                                    />
                                                                )}

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="salary-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div
                        className="salary-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        {/* HEADER */}

                        <div className="salary-modal-header">

                            <div>

                                <div className="salary-modal-title">

                                    <div className="salary-modal-icon">

                                        <Calculator
                                            size={21}
                                        />

                                    </div>

                                    <div>

                                        <h2>

                                            {editingStructure
                                                ? "Edit Salary Structure"
                                                : "Create Salary Structure"}

                                        </h2>

                                        <p>

                                            Configure the employee's
                                            monthly salary package.

                                        </p>

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="salary-modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="salary-modal-body"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {error && (

                                <div className="salary-modal-error">

                                    <XCircle size={17} />

                                    {error}

                                </div>

                            )}


                            {success && (

                                <div className="salary-modal-success">

                                    <CheckCircle2 size={17} />

                                    {success}

                                </div>

                            )}


                            {/* EMPLOYEE */}

                            <div className="salary-form-section">

                                <div className="salary-section-title">

                                    <UserRound size={18} />

                                    <span>
                                        Employee
                                    </span>

                                </div>


                                <div className="salary-form-group">

                                    <label>
                                        Employee *
                                    </label>

                                    <select
                                        name="employee"
                                        value={
                                            formData.employee
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving ||
                                            loadingEmployees ||
                                            Boolean(
                                                editingStructure
                                            )
                                        }
                                    >

                                        <option value="">

                                            {loadingEmployees
                                                ? "Loading employees..."
                                                : "Select employee"}

                                        </option>


                                        {employees
                                            .filter(
                                                employee =>
                                                    employee.isActive !==
                                                    false
                                            )
                                            .map(
                                                employee => (

                                                    <option
                                                        key={
                                                            employee._id
                                                        }
                                                        value={
                                                            employee._id
                                                        }
                                                    >

                                                        {
                                                            employee.employeeId ||
                                                            "EMP"
                                                        }

                                                        {" - "}

                                                        {
                                                            getEmployeeName(
                                                                employee
                                                            )
                                                        }

                                                    </option>

                                                )
                                            )}

                                    </select>

                                </div>

                            </div>


                            {/* BASIC */}

                            <div className="salary-form-section">

                                <div className="salary-section-title">

                                    <Calculator size={18} />

                                    <span>
                                        Basic Salary
                                    </span>

                                </div>


                                <div className="salary-form-grid">

                                    <div className="salary-form-group">

                                        <label>
                                            Basic Salary *
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="basicSalary"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.basicSalary
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="50000"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            HRA
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="hra"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.hra
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="10000"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            DA
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="da"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.da
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="5000"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Conveyance Allowance
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="conveyanceAllowance"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.conveyanceAllowance
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="2000"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ALLOWANCES */}

                            <div className="salary-form-section">

                                <div className="salary-section-title">

                                    <Calculator size={18} />

                                    <span>
                                        Additional Earnings
                                    </span>

                                </div>


                                <div className="salary-form-grid">

                                    <div className="salary-form-group">

                                        <label>
                                            Medical Allowance
                                        </label>

                                        <input
                                            type="number"
                                            name="medicalAllowance"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.medicalAllowance
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Special Allowance
                                        </label>

                                        <input
                                            type="number"
                                            name="specialAllowance"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.specialAllowance
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Other Allowance
                                        </label>

                                        <input
                                            type="number"
                                            name="otherAllowance"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.otherAllowance
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Overtime Rate / Hour
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="overtimeRatePerHour"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.overtimeRatePerHour
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Bonus
                                        </label>

                                        <input
                                            type="number"
                                            name="bonus"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.bonus
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Incentive
                                        </label>

                                        <input
                                            type="number"
                                            name="incentive"
                                            min="0"
                                            step="0.01"
                                            value={
                                                formData.incentive
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* DEDUCTIONS */}

                            <div className="salary-form-section">

                                <div className="salary-section-title">

                                    <Calculator size={18} />

                                    <span>
                                        Statutory Deductions
                                    </span>

                                </div>


                                <div className="salary-deduction-grid">

                                    <div className="salary-toggle-card">

                                        <div>

                                            <strong>
                                                PF
                                            </strong>

                                            <span>
                                                Provident Fund
                                            </span>

                                        </div>

                                        <label className="salary-switch">

                                            <input
                                                type="checkbox"
                                                name="pfEnabled"
                                                checked={
                                                    formData.pfEnabled
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span />

                                        </label>

                                    </div>


                                    <div className="salary-toggle-card">

                                        <div>

                                            <strong>
                                                ESI
                                            </strong>

                                            <span>
                                                Employee State Insurance
                                            </span>

                                        </div>

                                        <label className="salary-switch">

                                            <input
                                                type="checkbox"
                                                name="esiEnabled"
                                                checked={
                                                    formData.esiEnabled
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span />

                                        </label>

                                    </div>

                                </div>


                                <div className="salary-form-grid">

                                    {formData.pfEnabled && (

                                        <div className="salary-form-group">

                                            <label>
                                                PF Percentage
                                            </label>

                                            <div className="salary-input-suffix">

                                                <input
                                                    type="number"
                                                    name="pfPercentage"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        formData.pfPercentage
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />

                                                <span>
                                                    %
                                                </span>

                                            </div>

                                        </div>

                                    )}


                                    {formData.esiEnabled && (

                                        <div className="salary-form-group">

                                            <label>
                                                ESI Percentage
                                            </label>

                                            <div className="salary-input-suffix">

                                                <input
                                                    type="number"
                                                    name="esiPercentage"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={
                                                        formData.esiPercentage
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />

                                                <span>
                                                    %
                                                </span>

                                            </div>

                                        </div>

                                    )}


                                    <div className="salary-form-group">

                                        <label>
                                            Professional Tax
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="professionalTax"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.professionalTax
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            TDS Percentage
                                        </label>

                                        <div className="salary-input-suffix">

                                            <input
                                                type="number"
                                                name="tdsPercentage"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={
                                                    formData.tdsPercentage
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span>
                                                %
                                            </span>

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Loan Deduction
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="loanDeduction"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.loanDeduction
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Other Deduction
                                        </label>

                                        <div className="salary-input-prefix">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="otherDeduction"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.otherDeduction
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* MORE */}

                            <button
                                type="button"
                                className="salary-more-btn"
                                onClick={() =>
                                    setShowMoreFields(
                                        previous =>
                                            !previous
                                    )
                                }
                            >

                                {showMoreFields
                                    ? (
                                        <>
                                            <ChevronUp size={17} />
                                            Hide additional settings
                                        </>
                                    )
                                    : (
                                        <>
                                            <ChevronDown size={17} />
                                            Additional settings
                                        </>
                                    )}

                            </button>


                            {showMoreFields && (

                                <div className="salary-form-section">

                                    <div className="salary-section-title">

                                        <Calculator size={18} />

                                        <span>
                                            Payroll Settings
                                        </span>

                                    </div>


                                    <div className="salary-form-grid">

                                        <div className="salary-form-group">

                                            <label>
                                                Working Hours / Day
                                            </label>

                                            <input
                                                type="number"
                                                name="standardWorkingHoursPerDay"
                                                min="1"
                                                max="24"
                                                step="0.5"
                                                value={
                                                    formData.standardWorkingHoursPerDay
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>


                                        <div className="salary-form-group">

                                            <label>
                                                Working Days / Month
                                            </label>

                                            <input
                                                type="number"
                                                name="standardWorkingDaysPerMonth"
                                                min="1"
                                                max="31"
                                                value={
                                                    formData.standardWorkingDaysPerMonth
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>


                                        <div className="salary-form-group">

                                            <label>
                                                Effective From
                                            </label>

                                            <input
                                                type="date"
                                                name="effectiveFrom"
                                                value={
                                                    formData.effectiveFrom
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>


                                        <div className="salary-form-group">

                                            <label>
                                                Effective To
                                            </label>

                                            <input
                                                type="date"
                                                name="effectiveTo"
                                                value={
                                                    formData.effectiveTo
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="salary-form-group">

                                        <label>
                                            Notes
                                        </label>

                                        <textarea
                                            name="notes"
                                            value={
                                                formData.notes
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="3"
                                            placeholder="Optional payroll notes..."
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                </div>

                            )}


                            {/* FOOTER */}

                            <div className="salary-modal-footer">

                                <button
                                    type="button"
                                    className="salary-cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="salary-save-btn"
                                    disabled={
                                        saving ||
                                        loadingEmployees
                                    }
                                >

                                    {saving ? (

                                        <>
                                            <Loader2
                                                size={17}
                                                className="salary-spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        <>
                                            <CheckCircle2
                                                size={17}
                                            />

                                            {
                                                editingStructure
                                                    ? "Update Salary Structure"
                                                    : "Create Salary Structure"
                                            }

                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default SalaryStructureManagement;