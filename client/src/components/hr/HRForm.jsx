import { useEffect, useState } from "react";
import { X } from "lucide-react";

const HRForm = ({
    isOpen,
    onClose,
    onSubmit,
    editingHR,
    loading,
}) => {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        department: "",
    });

    useEffect(() => {

        if (editingHR) {
            setFormData({
                name: editingHR.name || "",
                email: editingHR.email || "",
                phone: editingHR.phone || "",
                password: "",
                department:
                    editingHR.department || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                department: "",
            });
        }

    }, [editingHR, isOpen]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit(formData);
    };


    if (!isOpen) {
        return null;
    }


    return (
        <div className="hr-modal-overlay">

            <div className="hr-modal">

                {/* HEADER */}

                <div className="hr-modal-header">

                    <div>
                        <h2>
                            {editingHR
                                ? "Edit HR"
                                : "Add New HR"}
                        </h2>

                        <p>
                            {editingHR
                                ? "Update HR information"
                                : "Create a new HR account"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="hr-modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* FORM */}

                <form
                    className="hr-form"
                    onSubmit={handleSubmit}
                >

                    <div className="hr-form-grid">

                        {/* NAME */}

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />

                        </div>


                        {/* PHONE */}

                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />

                        </div>


                        {/* DEPARTMENT */}

                        <div className="form-group">

                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value={
                                    formData.department
                                }
                                onChange={handleChange}
                                placeholder="Human Resources"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group full">

                            <label>
                                Password
                                {editingHR && (
                                    <span>
                                        {" "}
                                        (leave blank to keep
                                        current password)
                                    </span>
                                )}
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={
                                    editingHR
                                        ? "Enter new password"
                                        : "Enter password"
                                }
                                required={!editingHR}
                            />

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="hr-form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : editingHR
                                ? "Update HR"
                                : "Create HR"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default HRForm;