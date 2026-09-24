import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    WalletCards,
    Users,
    UserRound,
    IndianRupee,
    CalendarDays,
    Clock3,
    Percent,
    ShieldCheck,
    AlertCircle,
    X,
    Save,
    Power,
    PowerOff,
    Mail,
    BriefcaseBusiness,
    FileText,
    Calculator,
} from "lucide-react";

import {
    getHRUsers,
    getHRSalaryStructures,
    createHRSalaryStructure,
    updateHRSalaryStructure,
    activateHRSalaryStructure,
    deactivateHRSalaryStructure,
    deleteHRSalaryStructure,
} from "../../../services/hrSalaryStructureApi";

import "./HRSalaryStructure.css";


// =====================================================
// CONSTANTS
// =====================================================

const EMPTY_FORM = {
    hr: "",

    basicSalary: "",

    hra: "",
    da: "",
    conveyanceAllowance: "",
    medicalAllowance: "",
    specialAllowance: "",
    otherAllowance: "",

    bonus: "",
    incentive: "",

    pfEnabled: false,
    pfPercentage: "",

    esiEnabled: false,
    esiPercentage: "",

    professionalTax: "",
    tdsPercentage: "",

    loanDeduction: "",
    otherDeduction: "",

    standardWorkingHoursPerDay: "8",
    standardWorkingDaysPerMonth: "26",

    effectiveFrom: "",
    notes: "",
};


// =====================================================
// HELPERS
// =====================================================

const numberValue = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return number;
};


const money = (value) => {
    return numberValue(value).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
};


const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
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


const getErrorMessage = (error) => {

    return (
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};


// =====================================================
// COMPONENT
// =====================================================

const HRSalaryStructureManagement = () => {

    // =================================================
    // STATE
    // =================================================

    const [hrUsers, setHRUsers] = useState([]);

    const [structures, setStructures] = useState([]);

    const [loading, setLoading] = useState(true);

    const [hrLoading, setHRLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [actionLoading, setActionLoading] =
        useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);

    const [editingStructure, setEditingStructure] =
        useState(null);

    const [viewingStructure, setViewingStructure] =
        useState(null);

    const [form, setForm] =
        useState(EMPTY_FORM);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [formError, setFormError] =
        useState("");

    // =================================================
    // LOAD HR USERS
    // =================================================

    const loadHRUsers = useCallback(
        async () => {

            try {

                setHRLoading(true);

                const response =
                    await getHRUsers();

                const users =
                    Array.isArray(
                        response?.hrUsers
                    )
                        ? response.hrUsers
                        : [];

                setHRUsers(users);

            } catch (err) {

                console.error(
                    "LOAD HR USERS ERROR:",
                    err
                );

                setError(
                    getErrorMessage(err)
                );

            } finally {

                setHRLoading(false);
            }

        },
        []
    );


    // =================================================
    // LOAD STRUCTURES
    // =================================================

    const loadStructures = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await getHRSalaryStructures();

                const data =
                    Array.isArray(
                        response?.salaryStructures
                    )
                        ? response.salaryStructures
                        : [];

                setStructures(data);

            } catch (err) {

                console.error(
                    "LOAD SALARY STRUCTURES ERROR:",
                    err
                );

                setError(
                    getErrorMessage(err)
                );

            } finally {

                setLoading(false);
            }

        },
        []
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadHRUsers();

        loadStructures();

    }, [
        loadHRUsers,
        loadStructures,
    ]);


    // =================================================
    // AUTO CLEAR SUCCESS
    // =================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer =
            setTimeout(
                () => {
                    setSuccess("");
                },
                3500
            );

        return () => {
            clearTimeout(timer);
        };

    }, [success]);


    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm(
            (previous) => ({
                ...previous,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,
            })
        );

        if (formError) {
            setFormError("");
        }
    };


    // =================================================
    // OPEN ADD
    // =================================================

    const openAddModal = () => {

        setEditingStructure(null);

        setForm({
            ...EMPTY_FORM,

            effectiveFrom:
                new Date()
                    .toISOString()
                    .split("T")[0],
        });

        setFormError("");

        setShowModal(true);
    };


    // =================================================
    // OPEN EDIT
    // =================================================

    const openEditModal = (
        structure
    ) => {

        setEditingStructure(
            structure
        );

        setForm({

            hr:
                structure?.hr?._id ||
                structure?.hr ||
                "",

            basicSalary:
                structure?.basicSalary ?? "",

            hra:
                structure?.hra ?? "",

            da:
                structure?.da ?? "",

            conveyanceAllowance:
                structure?.conveyanceAllowance ?? "",

            medicalAllowance:
                structure?.medicalAllowance ?? "",

            specialAllowance:
                structure?.specialAllowance ?? "",

            otherAllowance:
                structure?.otherAllowance ?? "",

            bonus:
                structure?.bonus ?? "",

            incentive:
                structure?.incentive ?? "",

            pfEnabled:
                Boolean(
                    structure?.pfEnabled
                ),

            pfPercentage:
                structure?.pfPercentage ?? "",

            esiEnabled:
                Boolean(
                    structure?.esiEnabled
                ),

            esiPercentage:
                structure?.esiPercentage ?? "",

            professionalTax:
                structure?.professionalTax ?? "",

            tdsPercentage:
                structure?.tdsPercentage ?? "",

            loanDeduction:
                structure?.loanDeduction ?? "",

            otherDeduction:
                structure?.otherDeduction ?? "",

            standardWorkingHoursPerDay:
                structure?.standardWorkingHoursPerDay ??
                8,

            standardWorkingDaysPerMonth:
                structure?.standardWorkingDaysPerMonth ??
                26,

            effectiveFrom:
                structure?.effectiveFrom
                    ? new Date(
                        structure.effectiveFrom
                    )
                        .toISOString()
                        .split("T")[0]
                    : "",

            notes:
                structure?.notes || "",
        });

        setFormError("");

        setShowModal(true);
    };


    // =================================================
    // OPEN VIEW
    // =================================================

    const openViewModal = (
        structure
    ) => {

        setViewingStructure(
            structure
        );

        setShowViewModal(true);
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

        setForm(EMPTY_FORM);

        setFormError("");
    };


    // =================================================
    // CALCULATIONS
    // =================================================

    const calculations =
        useMemo(() => {

            const basic =
                numberValue(
                    form.basicSalary
                );

            const hra =
                numberValue(
                    form.hra
                );

            const da =
                numberValue(
                    form.da
                );

            const conveyance =
                numberValue(
                    form.conveyanceAllowance
                );

            const medical =
                numberValue(
                    form.medicalAllowance
                );

            const special =
                numberValue(
                    form.specialAllowance
                );

            const other =
                numberValue(
                    form.otherAllowance
                );

            const bonus =
                numberValue(
                    form.bonus
                );

            const incentive =
                numberValue(
                    form.incentive
                );


            const gross =
                basic +
                hra +
                da +
                conveyance +
                medical +
                special +
                other +
                bonus +
                incentive;


            const pf =
                form.pfEnabled
                    ? basic *
                      (
                          numberValue(
                              form.pfPercentage
                          ) / 100
                      )
                    : 0;


            const esi =
                form.esiEnabled
                    ? gross *
                      (
                          numberValue(
                              form.esiPercentage
                          ) / 100
                      )
                    : 0;


            const professionalTax =
                numberValue(
                    form.professionalTax
                );


            const tds =
                gross *
                (
                    numberValue(
                        form.tdsPercentage
                    ) / 100
                );


            const loan =
                numberValue(
                    form.loanDeduction
                );


            const otherDeduction =
                numberValue(
                    form.otherDeduction
                );


            const deductions =
                pf +
                esi +
                professionalTax +
                tds +
                loan +
                otherDeduction;


            const net =
                Math.max(
                    0,
                    gross - deductions
                );


            return {
                gross,
                pf,
                esi,
                professionalTax,
                tds,
                loan,
                otherDeduction,
                deductions,
                net,
            };

        }, [
            form,
        ]);


    // =================================================
    // VALIDATE FORM
    // =================================================

    const validateForm = () => {

        if (!form.hr) {

            return "Please select an HR.";
        }


        const basic =
            numberValue(
                form.basicSalary
            );


        if (basic <= 0) {

            return "Basic salary must be greater than zero.";
        }


        if (
            numberValue(
                form.pfPercentage
            ) < 0 ||
            numberValue(
                form.pfPercentage
            ) > 100
        ) {

            return "PF percentage must be between 0 and 100.";
        }


        if (
            numberValue(
                form.esiPercentage
            ) < 0 ||
            numberValue(
                form.esiPercentage
            ) > 100
        ) {

            return "ESI percentage must be between 0 and 100.";
        }


        if (
            numberValue(
                form.tdsPercentage
            ) < 0 ||
            numberValue(
                form.tdsPercentage
            ) > 100
        ) {

            return "TDS percentage must be between 0 and 100.";
        }


        if (
            numberValue(
                form.standardWorkingHoursPerDay
            ) <= 0
        ) {

            return "Working hours per day must be greater than zero.";
        }


        if (
            numberValue(
                form.standardWorkingDaysPerMonth
            ) <= 0
        ) {

            return "Working days per month must be greater than zero.";
        }


        return null;
    };


    // =================================================
    // BUILD PAYLOAD
    // =================================================

    const buildPayload = () => {

        return {

            hr:
                form.hr,

            basicSalary:
                numberValue(
                    form.basicSalary
                ),

            hra:
                numberValue(
                    form.hra
                ),

            da:
                numberValue(
                    form.da
                ),

            conveyanceAllowance:
                numberValue(
                    form.conveyanceAllowance
                ),

            medicalAllowance:
                numberValue(
                    form.medicalAllowance
                ),

            specialAllowance:
                numberValue(
                    form.specialAllowance
                ),

            otherAllowance:
                numberValue(
                    form.otherAllowance
                ),

            bonus:
                numberValue(
                    form.bonus
                ),

            incentive:
                numberValue(
                    form.incentive
                ),

            pfEnabled:
                Boolean(
                    form.pfEnabled
                ),

            pfPercentage:
                numberValue(
                    form.pfPercentage
                ),

            esiEnabled:
                Boolean(
                    form.esiEnabled
                ),

            esiPercentage:
                numberValue(
                    form.esiPercentage
                ),

            professionalTax:
                numberValue(
                    form.professionalTax
                ),

            tdsPercentage:
                numberValue(
                    form.tdsPercentage
                ),

            loanDeduction:
                numberValue(
                    form.loanDeduction
                ),

            otherDeduction:
                numberValue(
                    form.otherDeduction
                ),

            standardWorkingHoursPerDay:
                numberValue(
                    form.standardWorkingHoursPerDay
                ),

            standardWorkingDaysPerMonth:
                numberValue(
                    form.standardWorkingDaysPerMonth
                ),

            effectiveFrom:
                form.effectiveFrom ||
                undefined,

            notes:
                form.notes.trim(),
        };
    };


    // =================================================
    // SAVE
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setFormError("");

        const validationError =
            validateForm();

        if (validationError) {

            setFormError(
                validationError
            );

            return;
        }


        try {

            setSaving(true);

            const payload =
                buildPayload();


            if (editingStructure) {

                await updateHRSalaryStructure(
                    editingStructure._id,
                    payload
                );

                setSuccess(
                    "HR salary structure updated successfully."
                );

            } else {

                await createHRSalaryStructure(
                    payload
                );

                setSuccess(
                    "HR salary structure created successfully."
                );
            }


            closeModal();

            await loadStructures();

        } catch (err) {

            console.error(
                "SAVE SALARY STRUCTURE ERROR:",
                err
            );

            setFormError(
                getErrorMessage(err)
            );

        } finally {

            setSaving(false);
        }
    };


    // =================================================
    // ACTIVATE
    // =================================================

    const handleActivate = async (
        structure
    ) => {

        if (!structure?._id) {
            return;
        }


        const confirmed =
            window.confirm(
                `Activate salary structure for ${
                    structure?.hr?.name ||
                    "this HR"
                }?`
            );

        if (!confirmed) {
            return;
        }


        try {

            setActionLoading(
                `activate-${structure._id}`
            );

            setError("");

            await activateHRSalaryStructure(
                structure._id
            );

            setSuccess(
                "Salary structure activated successfully."
            );

            await loadStructures();

        } catch (err) {

            console.error(
                "ACTIVATE ERROR:",
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setActionLoading("");
        }
    };


    // =================================================
    // DEACTIVATE
    // =================================================

    const handleDeactivate = async (
        structure
    ) => {

        if (!structure?._id) {
            return;
        }


        const confirmed =
            window.confirm(
                `Deactivate salary structure for ${
                    structure?.hr?.name ||
                    "this HR"
                }?`
            );

        if (!confirmed) {
            return;
        }


        try {

            setActionLoading(
                `deactivate-${structure._id}`
            );

            setError("");

            await deactivateHRSalaryStructure(
                structure._id
            );

            setSuccess(
                "Salary structure deactivated successfully."
            );

            await loadStructures();

        } catch (err) {

            console.error(
                "DEACTIVATE ERROR:",
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setActionLoading("");
        }
    };


    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (
        structure
    ) => {

        if (!structure?._id) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete salary structure for ${
                    structure?.hr?.name ||
                    "this HR"
                }?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }


        try {

            setActionLoading(
                `delete-${structure._id}`
            );

            setError("");

            await deleteHRSalaryStructure(
                structure._id
            );

            setSuccess(
                "Salary structure deleted successfully."
            );

            await loadStructures();

        } catch (err) {

            console.error(
                "DELETE ERROR:",
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setActionLoading("");
        }
    };


    // =================================================
    // FILTERED DATA
    // =================================================

    const filteredStructures =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            return structures.filter(
                (structure) => {

                    const name =
                        String(
                            structure?.hr?.name ||
                            ""
                        ).toLowerCase();

                    const email =
                        String(
                            structure?.hr?.email ||
                            ""
                        ).toLowerCase();


                    const matchesSearch =
                        !searchText ||
                        name.includes(
                            searchText
                        ) ||
                        email.includes(
                            searchText
                        );


                    const matchesStatus =
                        statusFilter === "ALL" ||
                        (
                            statusFilter ===
                            "ACTIVE" &&
                            structure.isActive
                        ) ||
                        (
                            statusFilter ===
                            "INACTIVE" &&
                            !structure.isActive
                        );


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            structures,
            search,
            statusFilter,
        ]);


    // =================================================
    // SUMMARY
    // =================================================

    const summary =
        useMemo(() => {

            const total =
                structures.length;

            const active =
                structures.filter(
                    item =>
                        item.isActive
                ).length;

            const inactive =
                structures.filter(
                    item =>
                        !item.isActive
                ).length;


            const totalBasic =
                structures.reduce(
                    (
                        totalValue,
                        item
                    ) =>
                        totalValue +
                        numberValue(
                            item.basicSalary
                        ),
                    0
                );


            return {
                total,
                active,
                inactive,
                totalBasic,
            };

        }, [
            structures,
        ]);


    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh = async () => {

        setError("");

        await Promise.all([
            loadHRUsers(),
            loadStructures(),
        ]);

        setSuccess(
            "HR salary data refreshed."
        );
    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="hr-salary-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="hr-salary-header">

                <div>

                    <div className="hr-salary-title-row">

                        <div className="hr-salary-title-icon">
                            <WalletCards size={24} />
                        </div>

                        <div>

                            <h1>
                                HR Salary Structure
                            </h1>

                            <p>
                                Manage salary structures,
                                allowances and deductions
                                for HR employees.
                            </p>

                        </div>

                    </div>

                </div>


                <button
                    type="button"
                    className="hr-primary-button"
                    onClick={openAddModal}
                >

                    <Plus size={18} />

                    <span>
                        Add Salary Structure
                    </span>

                </button>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div className="hr-alert hr-alert-error">

                    <AlertCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {success && (

                <div className="hr-alert hr-alert-success">

                    <CheckCircle2 size={18} />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="hr-summary-grid">

                <div className="hr-summary-card">

                    <div className="hr-summary-icon blue">
                        <WalletCards size={21} />
                    </div>

                    <div>

                        <span>
                            Total Structures
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <div className="hr-summary-icon green">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>
                            {summary.active}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <div className="hr-summary-icon orange">
                        <XCircle size={21} />
                    </div>

                    <div>

                        <span>
                            Inactive
                        </span>

                        <strong>
                            {summary.inactive}
                        </strong>

                    </div>

                </div>


                <div className="hr-summary-card">

                    <div className="hr-summary-icon purple">
                        <IndianRupee size={21} />
                    </div>

                    <div>

                        <span>
                            Total Basic Salary
                        </span>

                        <strong>
                            ₹{money(
                                summary.totalBasic
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="hr-salary-toolbar">

                <div className="hr-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search HR by name or email..."
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
                            <X size={15} />
                        </button>

                    )}

                </div>


                <select
                    className="hr-filter-select"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="INACTIVE">
                        Inactive
                    </option>

                </select>


                <button
                    type="button"
                    className="hr-refresh-button"
                    onClick={handleRefresh}
                    disabled={
                        loading ||
                        hrLoading
                    }
                >

                    <RefreshCw
                        size={17}
                        className={
                            loading ||
                            hrLoading
                                ? "spin"
                                : ""
                        }
                    />

                    <span>
                        Refresh
                    </span>

                </button>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="hr-table-card">

                <div className="hr-table-header">

                    <div>

                        <h2>
                            Salary Structures
                        </h2>

                        <p>
                            {filteredStructures.length}
                            {" "}
                            structure
                            {filteredStructures.length !== 1
                                ? "s"
                                : ""
                            }
                            {" "}
                            found
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="hr-loading-state">

                        <div className="hr-spinner" />

                        <span>
                            Loading salary structures...
                        </span>

                    </div>

                ) : filteredStructures.length === 0 ? (

                    <div className="hr-empty-state">

                        <div className="hr-empty-icon">
                            <WalletCards size={30} />
                        </div>

                        <h3>
                            No salary structures found
                        </h3>

                        <p>
                            Create a salary structure
                            for an HR employee to get
                            started.
                        </p>

                        <button
                            type="button"
                            className="hr-primary-button"
                            onClick={openAddModal}
                        >

                            <Plus size={17} />

                            Add Salary Structure

                        </button>

                    </div>

                ) : (

                    <div className="hr-table-wrapper">

                        <table className="hr-salary-table">

                            <thead>

                                <tr>

                                    <th>
                                        HR
                                    </th>

                                    <th>
                                        Basic Salary
                                    </th>

                                    <th>
                                        Gross Salary
                                    </th>

                                    <th>
                                        PF / ESI
                                    </th>

                                    <th>
                                        Working Days
                                    </th>

                                    <th>
                                        Effective From
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

                                {filteredStructures.map(
                                    (
                                        structure
                                    ) => {

                                        const gross =
                                            numberValue(
                                                structure.basicSalary
                                            ) +
                                            numberValue(
                                                structure.hra
                                            ) +
                                            numberValue(
                                                structure.da
                                            ) +
                                            numberValue(
                                                structure.conveyanceAllowance
                                            ) +
                                            numberValue(
                                                structure.medicalAllowance
                                            ) +
                                            numberValue(
                                                structure.specialAllowance
                                            ) +
                                            numberValue(
                                                structure.otherAllowance
                                            ) +
                                            numberValue(
                                                structure.bonus
                                            ) +
                                            numberValue(
                                                structure.incentive
                                            );


                                        const actionIsLoading =
                                            actionLoading &&
                                            actionLoading.includes(
                                                structure._id
                                            );


                                        return (

                                            <tr
                                                key={
                                                    structure._id
                                                }
                                            >

                                                {/* HR */}

                                                <td>

                                                    <div className="hr-person-cell">

                                                        <div className="hr-avatar">

                                                            {structure?.hr?.profileImage ? (

                                                                <img
                                                                    src={
                                                                        structure.hr.profileImage
                                                                    }
                                                                    alt={
                                                                        structure?.hr?.name ||
                                                                        "HR"
                                                                    }
                                                                />

                                                            ) : (

                                                                <UserRound
                                                                    size={18}
                                                                />

                                                            )}

                                                        </div>


                                                        <div className="hr-person-info">

                                                            <strong>
                                                                {
                                                                    structure?.hr?.name ||
                                                                    "Unknown HR"
                                                                }
                                                            </strong>

                                                            <span>
                                                                <Mail
                                                                    size={13}
                                                                />

                                                                {
                                                                    structure?.hr?.email ||
                                                                    "-"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* BASIC */}

                                                <td>

                                                    <span className="salary-amount">

                                                        ₹
                                                        {money(
                                                            structure.basicSalary
                                                        )}

                                                    </span>

                                                </td>


                                                {/* GROSS */}

                                                <td>

                                                    <span className="salary-amount gross">

                                                        ₹
                                                        {money(
                                                            gross
                                                        )}

                                                    </span>

                                                </td>


                                                {/* PF / ESI */}

                                                <td>

                                                    <div className="deduction-info">

                                                        <span>

                                                            PF:

                                                            {" "}

                                                            {structure.pfEnabled
                                                                ? `${numberValue(
                                                                    structure.pfPercentage
                                                                )}%`
                                                                : "Off"
                                                            }

                                                        </span>

                                                        <span>

                                                            ESI:

                                                            {" "}

                                                            {structure.esiEnabled
                                                                ? `${numberValue(
                                                                    structure.esiPercentage
                                                                )}%`
                                                                : "Off"
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* WORKING DAYS */}

                                                <td>

                                                    <div className="working-days-cell">

                                                        <span>

                                                            {
                                                                structure.standardWorkingDaysPerMonth ??
                                                                26
                                                            }

                                                            {" "}
                                                            days

                                                        </span>

                                                        <small>

                                                            {
                                                                structure.standardWorkingHoursPerDay ??
                                                                8
                                                            }

                                                            {" "}
                                                            hrs/day

                                                        </small>

                                                    </div>

                                                </td>


                                                {/* EFFECTIVE */}

                                                <td>

                                                    <div className="date-cell">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {
                                                            formatDate(
                                                                structure.effectiveFrom
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    {structure.isActive ? (

                                                        <span className="status-badge active">

                                                            <CheckCircle2
                                                                size={14}
                                                            />

                                                            Active

                                                        </span>

                                                    ) : (

                                                        <span className="status-badge inactive">

                                                            <XCircle
                                                                size={14}
                                                            />

                                                            Inactive

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="table-actions">

                                                        <button
                                                            type="button"
                                                            className="icon-action view"
                                                            title="View"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    structure
                                                                )
                                                            }
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="icon-action edit"
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


                                                        {structure.isActive ? (

                                                            <button
                                                                type="button"
                                                                className="icon-action deactivate"
                                                                title="Deactivate"
                                                                disabled={
                                                                    actionIsLoading
                                                                }
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        structure
                                                                    )
                                                                }
                                                            >

                                                                <PowerOff
                                                                    size={16}
                                                                />

                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                className="icon-action activate"
                                                                title="Activate"
                                                                disabled={
                                                                    actionIsLoading
                                                                }
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        structure
                                                                    )
                                                                }
                                                            >

                                                                <Power
                                                                    size={16}
                                                                />

                                                            </button>

                                                        )}


                                                        <button
                                                            type="button"
                                                            className="icon-action delete"
                                                            title="Delete"
                                                            disabled={
                                                                actionIsLoading
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    structure
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

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="hr-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="hr-modal large">

                        {/* MODAL HEADER */}

                        <div className="hr-modal-header">

                            <div>

                                <div className="hr-modal-title-icon">
                                    <WalletCards size={20} />
                                </div>

                                <div>

                                    <h2>
                                        {editingStructure
                                            ? "Edit Salary Structure"
                                            : "Add HR Salary Structure"
                                        }
                                    </h2>

                                    <p>
                                        Configure salary,
                                        allowances and
                                        deductions.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="hr-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <form
                            className="hr-modal-body"
                            onSubmit={handleSubmit}
                        >

                            {formError && (

                                <div className="hr-form-error">

                                    <AlertCircle
                                        size={17}
                                    />

                                    <span>
                                        {formError}
                                    </span>

                                </div>

                            )}


                            {/* =================================
                                HR DETAILS
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <UserRound size={17} />

                                    <span>
                                        HR Details
                                    </span>

                                </div>


                                <div className="form-grid">

                                    <div className="form-group full">

                                        <label>
                                            HR Employee
                                            <span>
                                                *
                                            </span>
                                        </label>


                                        <div className="select-with-icon">

                                            <UserRound
                                                size={17}
                                            />

                                            <select
                                                name="hr"
                                                value={form.hr}
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    Boolean(
                                                        editingStructure
                                                    )
                                                }
                                                required
                                            >

                                                <option value="">
                                                    {hrLoading
                                                        ? "Loading HR users..."
                                                        : "Select HR employee"
                                                    }
                                                </option>


                                                {hrUsers
                                                    .filter(
                                                        user =>
                                                            user.isActive !==
                                                            false
                                                    )
                                                    .map(
                                                        user => (

                                                            <option
                                                                key={
                                                                    user._id
                                                                }
                                                                value={
                                                                    user._id
                                                                }
                                                            >

                                                                {
                                                                    user.name
                                                                }

                                                                {" — "}

                                                                {
                                                                    user.email
                                                                }

                                                            </option>

                                                        )
                                                    )}

                                            </select>

                                        </div>


                                        {!hrLoading &&
                                            hrUsers.length === 0 && (

                                                <small className="field-warning">

                                                    <AlertCircle
                                                        size={13}
                                                    />

                                                    No HR users found.
                                                    Create an active
                                                    HR account first.

                                                </small>

                                            )}

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                BASIC SALARY
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <IndianRupee size={17} />

                                    <span>
                                        Basic Salary
                                    </span>

                                </div>


                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Basic Salary
                                            <span>
                                                *
                                            </span>
                                        </label>

                                        <div className="input-with-icon">

                                            <IndianRupee
                                                size={16}
                                            />

                                            <input
                                                type="number"
                                                name="basicSalary"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    form.basicSalary
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter basic salary"
                                                required
                                            />

                                        </div>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Effective From
                                        </label>

                                        <div className="input-with-icon">

                                            <CalendarDays
                                                size={16}
                                            />

                                            <input
                                                type="date"
                                                name="effectiveFrom"
                                                value={
                                                    form.effectiveFrom
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                ALLOWANCES
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <WalletCards size={17} />

                                    <span>
                                        Allowances
                                    </span>

                                </div>


                                <div className="form-grid">

                                    <SalaryInput
                                        label="HRA"
                                        name="hra"
                                        value={
                                            form.hra
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="DA"
                                        name="da"
                                        value={
                                            form.da
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Conveyance Allowance"
                                        name="conveyanceAllowance"
                                        value={
                                            form.conveyanceAllowance
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Medical Allowance"
                                        name="medicalAllowance"
                                        value={
                                            form.medicalAllowance
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Special Allowance"
                                        name="specialAllowance"
                                        value={
                                            form.specialAllowance
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Other Allowance"
                                        name="otherAllowance"
                                        value={
                                            form.otherAllowance
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Bonus"
                                        name="bonus"
                                        value={
                                            form.bonus
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Incentive"
                                        name="incentive"
                                        value={
                                            form.incentive
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================
                                PF / ESI
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <ShieldCheck size={17} />

                                    <span>
                                        Statutory Deductions
                                    </span>

                                </div>


                                <div className="deduction-toggle-grid">

                                    {/* PF */}

                                    <div className="deduction-card">

                                        <div className="deduction-card-header">

                                            <div>

                                                <strong>
                                                    Provident Fund
                                                    (PF)
                                                </strong>

                                                <small>
                                                    Calculate PF
                                                    from basic salary
                                                </small>

                                            </div>


                                            <label className="switch">

                                                <input
                                                    type="checkbox"
                                                    name="pfEnabled"
                                                    checked={
                                                        form.pfEnabled
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <span />

                                            </label>

                                        </div>


                                        {form.pfEnabled && (

                                            <div className="form-group">

                                                <label>
                                                    PF Percentage
                                                </label>

                                                <div className="input-with-icon">

                                                    <Percent
                                                        size={16}
                                                    />

                                                    <input
                                                        type="number"
                                                        name="pfPercentage"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={
                                                            form.pfPercentage
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="12"
                                                    />

                                                </div>

                                            </div>

                                        )}

                                    </div>


                                    {/* ESI */}

                                    <div className="deduction-card">

                                        <div className="deduction-card-header">

                                            <div>

                                                <strong>
                                                    Employee State
                                                    Insurance (ESI)
                                                </strong>

                                                <small>
                                                    Calculate ESI
                                                    from gross salary
                                                </small>

                                            </div>


                                            <label className="switch">

                                                <input
                                                    type="checkbox"
                                                    name="esiEnabled"
                                                    checked={
                                                        form.esiEnabled
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                                <span />

                                            </label>

                                        </div>


                                        {form.esiEnabled && (

                                            <div className="form-group">

                                                <label>
                                                    ESI Percentage
                                                </label>

                                                <div className="input-with-icon">

                                                    <Percent
                                                        size={16}
                                                    />

                                                    <input
                                                        type="number"
                                                        name="esiPercentage"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={
                                                            form.esiPercentage
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="0.75"
                                                    />

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </div>


                                <div className="form-grid deduction-fields">

                                    <SalaryInput
                                        label="Professional Tax"
                                        name="professionalTax"
                                        value={
                                            form.professionalTax
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="TDS Percentage"
                                        name="tdsPercentage"
                                        value={
                                            form.tdsPercentage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        suffix="%"
                                    />

                                    <SalaryInput
                                        label="Loan Deduction"
                                        name="loanDeduction"
                                        value={
                                            form.loanDeduction
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <SalaryInput
                                        label="Other Deduction"
                                        name="otherDeduction"
                                        value={
                                            form.otherDeduction
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* =================================
                                WORKING DETAILS
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <Clock3 size={17} />

                                    <span>
                                        Working Details
                                    </span>

                                </div>


                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Working Hours / Day
                                        </label>

                                        <div className="input-with-icon">

                                            <Clock3
                                                size={16}
                                            />

                                            <input
                                                type="number"
                                                name="standardWorkingHoursPerDay"
                                                min="0"
                                                step="0.5"
                                                value={
                                                    form.standardWorkingHoursPerDay
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Working Days / Month
                                        </label>

                                        <div className="input-with-icon">

                                            <CalendarDays
                                                size={16}
                                            />

                                            <input
                                                type="number"
                                                name="standardWorkingDaysPerMonth"
                                                min="0"
                                                step="1"
                                                value={
                                                    form.standardWorkingDaysPerMonth
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                NOTES
                            ================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <FileText size={17} />

                                    <span>
                                        Notes
                                    </span>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Additional Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        rows="4"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter any additional salary notes..."
                                    />

                                </div>

                            </div>


                            {/* =================================
                                CALCULATION PREVIEW
                            ================================= */}

                            <div className="salary-preview">

                                <div className="salary-preview-header">

                                    <div>

                                        <Calculator
                                            size={18}
                                        />

                                        <strong>
                                            Salary Preview
                                        </strong>

                                    </div>

                                    <span>
                                        Estimated monthly values
                                    </span>

                                </div>


                                <div className="salary-preview-grid">

                                    <div>

                                        <span>
                                            Gross Salary
                                        </span>

                                        <strong>
                                            ₹
                                            {money(
                                                calculations.gross
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Total Deductions
                                        </span>

                                        <strong className="deduction-value">
                                            ₹
                                            {money(
                                                calculations.deductions
                                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Net Salary
                                        </span>

                                        <strong className="net-value">
                                            ₹
                                            {money(
                                                calculations.net
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                MODAL FOOTER
                            ================================= */}

                            <div className="hr-modal-footer">

                                <button
                                    type="button"
                                    className="hr-secondary-button"
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
                                    className="hr-primary-button"
                                    disabled={
                                        saving ||
                                        hrLoading
                                    }
                                >

                                    {saving ? (

                                        <>
                                            <span className="button-spinner" />

                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <Save
                                                size={17}
                                            />

                                            {
                                                editingStructure
                                                    ? "Update Structure"
                                                    : "Create Structure"
                                            }
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {showViewModal &&
                viewingStructure && (

                    <div
                        className="hr-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                setShowViewModal(
                                    false
                                );
                            }

                        }}
                    >

                        <div className="hr-modal view-modal">

                            <div className="hr-modal-header">

                                <div>

                                    <div className="hr-modal-title-icon">
                                        <Eye size={20} />
                                    </div>

                                    <div>

                                        <h2>
                                            Salary Structure
                                        </h2>

                                        <p>
                                            Complete HR salary
                                            structure details.
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="hr-modal-close"
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            <div className="hr-modal-body">

                                {/* HR PROFILE */}

                                <div className="view-profile-card">

                                    <div className="view-profile-avatar">

                                        {viewingStructure?.hr?.profileImage ? (

                                            <img
                                                src={
                                                    viewingStructure.hr.profileImage
                                                }
                                                alt={
                                                    viewingStructure?.hr?.name ||
                                                    "HR"
                                                }
                                            />

                                        ) : (

                                            <UserRound
                                                size={28}
                                            />

                                        )}

                                    </div>


                                    <div>

                                        <h3>
                                            {
                                                viewingStructure?.hr?.name ||
                                                "Unknown HR"
                                            }
                                        </h3>

                                        <p>
                                            <Mail size={14} />

                                            {
                                                viewingStructure?.hr?.email ||
                                                "-"
                                            }
                                        </p>

                                    </div>


                                    <span
                                        className={
                                            viewingStructure.isActive
                                                ? "status-badge active"
                                                : "status-badge inactive"
                                        }
                                    >

                                        {viewingStructure.isActive ? (
                                            <>
                                                <CheckCircle2
                                                    size={14}
                                                />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <XCircle
                                                    size={14}
                                                />
                                                Inactive
                                            </>
                                        )}

                                    </span>

                                </div>


                                {/* BASIC */}

                                <ViewSection
                                    title="Basic Salary"
                                    icon={
                                        <IndianRupee
                                            size={17}
                                        />
                                    }
                                >

                                    <ViewRow
                                        label="Basic Salary"
                                        value={
                                            `₹${money(
                                                viewingStructure.basicSalary
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Effective From"
                                        value={
                                            formatDate(
                                                viewingStructure.effectiveFrom
                                            )
                                        }
                                    />

                                    <ViewRow
                                        label="Effective To"
                                        value={
                                            viewingStructure.effectiveTo
                                                ? formatDate(
                                                    viewingStructure.effectiveTo
                                                )
                                                : "Current"
                                        }
                                    />

                                </ViewSection>


                                {/* ALLOWANCES */}

                                <ViewSection
                                    title="Allowances"
                                    icon={
                                        <WalletCards
                                            size={17}
                                        />
                                    }
                                >

                                    <ViewRow
                                        label="HRA"
                                        value={
                                            `₹${money(
                                                viewingStructure.hra
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="DA"
                                        value={
                                            `₹${money(
                                                viewingStructure.da
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Conveyance"
                                        value={
                                            `₹${money(
                                                viewingStructure.conveyanceAllowance
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Medical"
                                        value={
                                            `₹${money(
                                                viewingStructure.medicalAllowance
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Special"
                                        value={
                                            `₹${money(
                                                viewingStructure.specialAllowance
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Other"
                                        value={
                                            `₹${money(
                                                viewingStructure.otherAllowance
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Bonus"
                                        value={
                                            `₹${money(
                                                viewingStructure.bonus
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Incentive"
                                        value={
                                            `₹${money(
                                                viewingStructure.incentive
                                            )}`
                                        }
                                    />

                                </ViewSection>


                                {/* DEDUCTIONS */}

                                <ViewSection
                                    title="Deductions"
                                    icon={
                                        <ShieldCheck
                                            size={17}
                                        />
                                    }
                                >

                                    <ViewRow
                                        label="PF"
                                        value={
                                            viewingStructure.pfEnabled
                                                ? `${viewingStructure.pfPercentage}%`
                                                : "Disabled"
                                        }
                                    />

                                    <ViewRow
                                        label="ESI"
                                        value={
                                            viewingStructure.esiEnabled
                                                ? `${viewingStructure.esiPercentage}%`
                                                : "Disabled"
                                        }
                                    />

                                    <ViewRow
                                        label="Professional Tax"
                                        value={
                                            `₹${money(
                                                viewingStructure.professionalTax
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="TDS"
                                        value={
                                            `${numberValue(
                                                viewingStructure.tdsPercentage
                                            )}%`
                                        }
                                    />

                                    <ViewRow
                                        label="Loan Deduction"
                                        value={
                                            `₹${money(
                                                viewingStructure.loanDeduction
                                            )}`
                                        }
                                    />

                                    <ViewRow
                                        label="Other Deduction"
                                        value={
                                            `₹${money(
                                                viewingStructure.otherDeduction
                                            )}`
                                        }
                                    />

                                </ViewSection>


                                {/* WORKING */}

                                <ViewSection
                                    title="Working Details"
                                    icon={
                                        <Clock3
                                            size={17}
                                        />
                                    }
                                >

                                    <ViewRow
                                        label="Hours / Day"
                                        value={
                                            `${
                                                viewingStructure.standardWorkingHoursPerDay ??
                                                8
                                            } hours`
                                        }
                                    />

                                    <ViewRow
                                        label="Days / Month"
                                        value={
                                            `${
                                                viewingStructure.standardWorkingDaysPerMonth ??
                                                26
                                            } days`
                                        }
                                    />

                                </ViewSection>


                                {/* NOTES */}

                                {viewingStructure.notes && (

                                    <ViewSection
                                        title="Notes"
                                        icon={
                                            <FileText
                                                size={17}
                                            />
                                        }
                                    >

                                        <div className="view-notes">
                                            {
                                                viewingStructure.notes
                                            }
                                        </div>

                                    </ViewSection>

                                )}

                            </div>


                            <div className="hr-modal-footer">

                                <button
                                    type="button"
                                    className="hr-secondary-button"
                                    onClick={() =>
                                        setShowViewModal(
                                            false
                                        )
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="hr-primary-button"
                                    onClick={() => {

                                        setShowViewModal(
                                            false
                                        );

                                        openEditModal(
                                            viewingStructure
                                        );

                                    }}
                                >

                                    <Edit3
                                        size={17}
                                    />

                                    Edit Structure

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};


// =====================================================
// SALARY INPUT COMPONENT
// =====================================================

const SalaryInput = ({
    label,
    name,
    value,
    onChange,
    suffix,
}) => {

    return (

        <div className="form-group">

            <label>
                {label}
            </label>

            <div className="input-with-icon">

                {suffix ? (
                    <Percent
                        size={16}
                    />
                ) : (
                    <IndianRupee
                        size={16}
                    />
                )}

                <input
                    type="number"
                    name={name}
                    min="0"
                    step="0.01"
                    value={value}
                    onChange={onChange}
                    placeholder="0.00"
                />

                {suffix && (
                    <span className="input-suffix">
                        {suffix}
                    </span>
                )}

            </div>

        </div>
    );
};


// =====================================================
// VIEW SECTION
// =====================================================

const ViewSection = ({
    title,
    icon,
    children,
}) => {

    return (

        <div className="view-section">

            <div className="view-section-title">

                {icon}

                <span>
                    {title}
                </span>

            </div>


            <div className="view-section-content">

                {children}

            </div>

        </div>
    );
};


// =====================================================
// VIEW ROW
// =====================================================

const ViewRow = ({
    label,
    value,
}) => {

    return (

        <div className="view-row">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
};


export default HRSalaryStructureManagement;