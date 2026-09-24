import {
    Edit3,
    MoreVertical,
    Power,
    Trash2,
    UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const HRTable = ({
    hrList,
    onEdit,
    onToggleStatus,
    onDelete,
}) => {

     const navigate = useNavigate();

     
    if (!hrList.length) {
        return (
            <div className="hr-empty-state">

                <div className="hr-empty-icon">
                    <UserRound size={28} />
                </div>

                <h3>
                    No HR found
                </h3>

                <p>
                    Add your first HR employee
                    to get started.
                </p>

            </div>
        );
    }


    return (
        <div className="hr-table-wrapper">

            <table className="hr-table">

                <thead>

                    <tr>
                        <th>HR</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    {hrList.map((hr) => (

                        <tr key={hr._id}>

                            {/* HR */}

                            <td>

                                <div className="hr-user">

                                    <div className="hr-avatar">

                                        {hr.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}

                                    </div>

                                    <div>

                                       <strong
    className="hr-name-link"
    onClick={() =>
        navigate(
            `/super-admin/hr/${hr._id}`
        )
    }
>
    {hr.name}
</strong>

                                        <span>
                                            {hr.email}
                                        </span>

                                    </div>

                                </div>

                            </td>


                            {/* PHONE */}

                            <td>
                                {hr.phone || "—"}
                            </td>


                            {/* DEPARTMENT */}

                            <td>
                                {hr.department || "—"}
                            </td>


                            {/* STATUS */}

                            <td>

                                <span
                                    className={
                                        hr.isActive
                                            ? "hr-status active"
                                            : "hr-status inactive"
                                    }
                                >
                                    <span />

                                    {hr.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            </td>


                            {/* CREATED */}

                            <td>
                                {hr.createdAt
                                    ? new Date(
                                          hr.createdAt
                                      ).toLocaleDateString()
                                    : "—"}
                            </td>


                            {/* ACTIONS */}

                            <td>

                                <div className="hr-actions">

                                    <button
                                        type="button"
                                        title="Edit"
                                        onClick={() =>
                                            onEdit(hr)
                                        }
                                    >
                                        <Edit3 size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        title={
                                            hr.isActive
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                        onClick={() =>
                                            onToggleStatus(
                                                hr
                                            )
                                        }
                                    >
                                        <Power size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        className="delete"
                                        title="Delete"
                                        onClick={() =>
                                            onDelete(hr)
                                        }
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default HRTable;