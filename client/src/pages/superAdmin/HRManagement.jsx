import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    Users,
    UserCheck,
    UserX,
    RefreshCw,
} from "lucide-react";

import HRTable from "../../components/hr/HRTable";
import HRForm from "../../components/hr/HRForm";

import hrApi from "../../services/hrApi";


const HRManagement = () => {

    const [hrList, setHRList] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [formLoading, setFormLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingHR, setEditingHR] =
        useState(null);


    /*
    =====================================================
    LOAD HR
    =====================================================
    */

    const loadHR = async () => {

        try {

            setLoading(true);

            const response =
                await hrApi.getAll();

            if (response.success) {
                setHRList(response.hr || []);
            }

        } catch (error) {

            console.error(
                "Failed to load HR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load HR"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadHR();
    }, []);


    /*
    =====================================================
    FILTER HR
    =====================================================
    */

    const filteredHR = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        if (!value) {
            return hrList;
        }

        return hrList.filter((hr) =>
            hr.name
                ?.toLowerCase()
                .includes(value) ||

            hr.email
                ?.toLowerCase()
                .includes(value) ||

            hr.phone
                ?.toLowerCase()
                .includes(value) ||

            hr.department
                ?.toLowerCase()
                .includes(value)
        );

    }, [hrList, search]);


    /*
    =====================================================
    STATISTICS
    =====================================================
    */

    const totalHR =
        hrList.length;

    const activeHR =
        hrList.filter(
            (hr) => hr.isActive
        ).length;

    const inactiveHR =
        hrList.filter(
            (hr) => !hr.isActive
        ).length;


    /*
    =====================================================
    OPEN ADD
    =====================================================
    */

    const handleAdd = () => {

        setEditingHR(null);

        setShowForm(true);
    };


    /*
    =====================================================
    OPEN EDIT
    =====================================================
    */

    const handleEdit = (hr) => {

        setEditingHR(hr);

        setShowForm(true);
    };


    /*
    =====================================================
    CREATE / UPDATE
    =====================================================
    */

    const handleSubmit = async (
        formData
    ) => {

        try {

            setFormLoading(true);

            let response;

            if (editingHR) {

                response =
                    await hrApi.update(
                        editingHR._id,
                        formData
                    );

            } else {

                response =
                    await hrApi.create(
                        formData
                    );

            }


            if (response.success) {

                alert(
                    response.message
                );

                setShowForm(false);

                setEditingHR(null);

                await loadHR();

            }

        } catch (error) {

            console.error(
                "HR save error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save HR"
            );

        } finally {

            setFormLoading(false);

        }
    };


    /*
    =====================================================
    TOGGLE STATUS
    =====================================================
    */

    const handleToggleStatus = async (
        hr
    ) => {

        const action =
            hr.isActive
                ? "deactivate"
                : "activate";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} ${hr.name}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await hrApi.toggleStatus(
                    hr._id
                );


            if (response.success) {

                alert(
                    response.message
                );

                await loadHR();

            }

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update HR status"
            );

        }
    };


    /*
    =====================================================
    DELETE HR
    =====================================================
    */

    const handleDelete = async (
        hr
    ) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to permanently delete ${hr.name}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await hrApi.delete(
                    hr._id
                );


            if (response.success) {

                alert(
                    response.message
                );

                await loadHR();

            }

        } catch (error) {

            console.error(
                "Delete HR error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete HR"
            );

        }
    };


    return (
        <div className="hr-management-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="hr-page-header">

                <div>

                    <h1>
                        HR Management
                    </h1>

                    <p>
                        Manage HR accounts and
                        their access to the system.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-hr-button"
                    onClick={handleAdd}
                >
                    <Plus size={18} />

                    Add HR
                </button>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="hr-stats-grid">

                <div className="hr-stat-card">

                    <div className="hr-stat-icon">
                        <Users size={21} />
                    </div>

                    <div>

                        <span>
                            Total HR
                        </span>

                        <strong>
                            {totalHR}
                        </strong>

                    </div>

                </div>


                <div className="hr-stat-card">

                    <div className="hr-stat-icon active">
                        <UserCheck size={21} />
                    </div>

                    <div>

                        <span>
                            Active HR
                        </span>

                        <strong>
                            {activeHR}
                        </strong>

                    </div>

                </div>


                <div className="hr-stat-card">

                    <div className="hr-stat-icon inactive">
                        <UserX size={21} />
                    </div>

                    <div>

                        <span>
                            Inactive HR
                        </span>

                        <strong>
                            {inactiveHR}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <div className="hr-list-card">

                <div className="hr-list-header">

                    <div>

                        <h2>
                            HR Employees
                        </h2>

                        <p>
                            {filteredHR.length} HR
                            account
                            {filteredHR.length !== 1
                                ? "s"
                                : ""}
                        </p>

                    </div>


                    <div className="hr-list-actions">

                        <div className="hr-search">

                            <Search size={17} />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search HR..."
                            />

                        </div>


                        <button
                            type="button"
                            className="refresh-button"
                            onClick={loadHR}
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


                {/* TABLE */}

                {loading ? (

                    <div className="hr-loading">
                        <RefreshCw
                            size={24}
                            className="spin"
                        />

                        <span>
                            Loading HR...
                        </span>
                    </div>

                ) : (

                    <HRTable
                        hrList={filteredHR}
                        onEdit={handleEdit}
                        onToggleStatus={
                            handleToggleStatus
                        }
                        onDelete={handleDelete}
                    />

                )}

            </div>


            {/* =================================================
                FORM MODAL
            ================================================= */}

            <HRForm
                isOpen={showForm}
                onClose={() => {

                    if (!formLoading) {

                        setShowForm(false);

                        setEditingHR(null);

                    }

                }}
                onSubmit={handleSubmit}
                editingHR={editingHR}
                loading={formLoading}
            />

        </div>
    );
};

export default HRManagement;