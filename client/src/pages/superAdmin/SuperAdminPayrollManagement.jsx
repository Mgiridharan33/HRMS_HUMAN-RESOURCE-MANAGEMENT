import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    DollarSign,
    Eye,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    Users,
    X,
    XCircle,
    CreditCard,
    Ban,
    Trash2,
    Download,
    Printer,
} from "lucide-react";

import { jsPDF } from "jspdf";

import api from "../../services/api";

import PayrollCreateModal
    from "../../components/payroll/PayrollCreateModal";

import PayrollPaymentModal
    from "../../components/payroll/PayrollPaymentModal";

import "./PayrollManagement.css";
import { useAppPrompt } from "../../components/common/useAppPrompt";


// =====================================================
// MONTHS
// =====================================================

const MONTHS = [
    {
        value: 1,
        label: "January",
    },
    {
        value: 2,
        label: "February",
    },
    {
        value: 3,
        label: "March",
    },
    {
        value: 4,
        label: "April",
    },
    {
        value: 5,
        label: "May",
    },
    {
        value: 6,
        label: "June",
    },
    {
        value: 7,
        label: "July",
    },
    {
        value: 8,
        label: "August",
    },
    {
        value: 9,
        label: "September",
    },
    {
        value: 10,
        label: "October",
    },
    {
        value: 11,
        label: "November",
    },
    {
        value: 12,
        label: "December",
    },
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {

    const amount =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }
    ).format(amount);
};


const formatCurrencyPdf = (value) => {

    const amount =
        Number(value) || 0;

    return `Rs. ${amount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};


const formatDate = (value) => {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


const formatDatePdf = (value) => {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


const getMonthName = (month) => {

    const found =
        MONTHS.find(
            item =>
                item.value ===
                Number(month)
        );

    return found?.label || "—";
};


const getEmployeeName = (payroll) => {

    if (
        payroll?.employeeName
    ) {
        return payroll.employeeName;
    }

    const employee =
        payroll?.employee;

    if (
        employee?.firstName ||
        employee?.lastName
    ) {

        return `${employee.firstName || ""} ${
            employee.lastName || ""
        }`.trim();
    }

    if (
        employee?.name
    ) {
        return employee.name;
    }

    return "Unknown Employee";
};


const getEmployeeId = (payroll) => {

    if (
        payroll?.employeeId
    ) {
        return String(
            payroll.employeeId
        );
    }

    if (
        payroll?.employee?.employeeId
    ) {
        return String(
            payroll.employee.employeeId
        );
    }

    if (
        payroll?.employee?.empCode
    ) {
        return String(
            payroll.employee.empCode
        );
    }

    return "—";
};


const getDepartment = (payroll) => {

    return (
        payroll?.department ||
        payroll?.employee?.department ||
        payroll?.employee?.departmentName ||
        "—"
    );
};


const getDesignation = (payroll) => {

    return (
        payroll?.designation ||
        payroll?.employee?.designation ||
        payroll?.employee?.designationName ||
        "—"
    );
};


const getPayrollStatus = (payroll) => {

    return (
        payroll?.status ||
        "Draft"
    );
};


// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({
    status,
}) => {

    const normalized =
        String(
            status || ""
        ).toLowerCase();

    let className =
        "payroll-status-badge payroll-status-draft";

    let Icon =
        Clock3;

    if (
        normalized ===
        "approved"
    ) {

        className =
            "payroll-status-badge payroll-status-approved";

        Icon =
            CheckCircle2;
    }

    if (
        normalized ===
        "paid"
    ) {

        className =
            "payroll-status-badge payroll-status-paid";

        Icon =
            DollarSign;
    }

    if (
        normalized ===
        "cancelled"
    ) {

        className =
            "payroll-status-badge payroll-status-cancelled";

        Icon =
            XCircle;
    }

    return (
        <span
            className={className}
        >

            <Icon
                size={14}
            />

            {status || "Draft"}

        </span>
    );
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const PayrollManagement = () => {

    const prompt = useAppPrompt();

    // =================================================
    // PAYROLL DATA
    // =================================================

    const [
        payrolls,
        setPayrolls,
    ] = useState([]);


    // =================================================
    // LOADING
    // =================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    // =================================================
    // ALERTS
    // =================================================

    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    // =================================================
    // SEARCH
    // =================================================

    const [
        search,
        setSearch,
    ] = useState("");


    // =================================================
    // FILTERS
    // =================================================

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");


    const [
        monthFilter,
        setMonthFilter,
    ] = useState("All");


    const [
        yearFilter,
        setYearFilter,
    ] = useState("All");


    // =================================================
    // SELECTED PAYROLL
    // =================================================

    const [
        selectedPayroll,
        setSelectedPayroll,
    ] = useState(null);


    // =================================================
    // VIEW MODAL
    // =================================================

    const [
        showViewModal,
        setShowViewModal,
    ] = useState(false);


    // =================================================
    // CREATE MODAL
    // =================================================

    const [
        showCreateModal,
        setShowCreateModal,
    ] = useState(false);


    // =================================================
    // PAYMENT MODAL
    // =================================================

    const [
        showPaymentModal,
        setShowPaymentModal,
    ] = useState(false);


    const [
        paymentPayroll,
        setPaymentPayroll,
    ] = useState(null);


    // =================================================
    // PDF LOADING
    // =================================================

    const [
        generatingPayslip,
        setGeneratingPayslip,
    ] = useState(false);


    // =================================================
    // FETCH PAYROLLS
    // =================================================

    const fetchPayrolls =
        useCallback(
            async (
                showRefreshLoader = false
            ) => {

                try {

                    setError("");

                    if (
                        showRefreshLoader
                    ) {

                        setRefreshing(
                            true
                        );

                    } else {

                        setLoading(
                            true
                        );
                    }


                    const response =
                        await api.get(
                            "/payroll"
                        );


                    const data =
                        response?.data;


                    if (
                        data?.success
                    ) {

                        const payrollList =
                            Array.isArray(
                                data.payrolls
                            )
                                ? data.payrolls
                                : [];

                        setPayrolls(
                            payrollList
                        );

                        // ---------------------------------
                        // KEEP OPEN PAYROLL VIEW UPDATED
                        // ---------------------------------

                        setSelectedPayroll(
                            previous => {

                                if (
                                    !previous?._id
                                ) {
                                    return previous;
                                }

                                const updated =
                                    payrollList.find(
                                        payroll =>
                                            String(
                                                payroll._id
                                            ) ===
                                            String(
                                                previous._id
                                            )
                                    );

                                return (
                                    updated ||
                                    previous
                                );
                            }
                        );

                    } else {

                        setPayrolls([]);

                        setError(
                            data?.message ||
                            "Failed to load payroll records."
                        );
                    }

                } catch (err) {

                    console.error(
                        "FETCH PAYROLLS ERROR:",
                        err
                    );

                    setPayrolls([]);

                    setError(
                        err?.response?.data?.message ||
                        "Unable to load payroll records."
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);
                }
            },
            []
        );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(
        () => {

            fetchPayrolls();

        },
        [
            fetchPayrolls,
        ]
    );


    // =================================================
    // SUCCESS AUTO CLEAR
    // =================================================

    useEffect(
        () => {

            if (!success) {
                return;
            }

            const timer =
                setTimeout(
                    () => {

                        setSuccess("");

                    },
                    4000
                );

            return () =>
                clearTimeout(
                    timer
                );

        },
        [
            success,
        ]
    );


    // =================================================
    // AVAILABLE YEARS
    // =================================================

    const availableYears =
        useMemo(
            () => {

                const years =
                    payrolls
                        .map(
                            payroll =>
                                Number(
                                    payroll.year
                                )
                        )
                        .filter(
                            year =>
                                Number.isFinite(
                                    year
                                )
                        );

                return [
                    ...new Set(
                        years
                    ),
                ].sort(
                    (
                        a,
                        b
                    ) =>
                        b - a
                );

            },
            [
                payrolls,
            ]
        );


    // =================================================
    // FILTER PAYROLLS
    // =================================================

    const filteredPayrolls =
        useMemo(
            () => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();


                return payrolls.filter(
                    payroll => {

                        // ---------------------------------
                        // SEARCH
                        // ---------------------------------

                        if (
                            searchText
                        ) {

                            const employeeName =
                                getEmployeeName(
                                    payroll
                                ).toLowerCase();

                            const employeeId =
                                getEmployeeId(
                                    payroll
                                ).toLowerCase();

                            const department =
                                String(
                                    getDepartment(
                                        payroll
                                    )
                                ).toLowerCase();

                            const designation =
                                String(
                                    getDesignation(
                                        payroll
                                    )
                                ).toLowerCase();

                            const status =
                                String(
                                    payroll.status ||
                                    ""
                                ).toLowerCase();

                            const searchable =
                                [
                                    employeeName,
                                    employeeId,
                                    department,
                                    designation,
                                    status,
                                ].join(" ");


                            if (
                                !searchable.includes(
                                    searchText
                                )
                            ) {

                                return false;
                            }
                        }


                        // ---------------------------------
                        // STATUS
                        // ---------------------------------

                        if (
                            statusFilter !==
                            "All"
                        ) {

                            if (
                                payroll.status !==
                                statusFilter
                            ) {

                                return false;
                            }
                        }


                        // ---------------------------------
                        // MONTH
                        // ---------------------------------

                        if (
                            monthFilter !==
                            "All"
                        ) {

                            if (
                                Number(
                                    payroll.month
                                ) !==
                                Number(
                                    monthFilter
                                )
                            ) {

                                return false;
                            }
                        }


                        // ---------------------------------
                        // YEAR
                        // ---------------------------------

                        if (
                            yearFilter !==
                            "All"
                        ) {

                            if (
                                Number(
                                    payroll.year
                                ) !==
                                Number(
                                    yearFilter
                                )
                            ) {

                                return false;
                            }
                        }


                        return true;
                    }
                );

            },
            [
                payrolls,
                search,
                statusFilter,
                monthFilter,
                yearFilter,
            ]
        );


    // =================================================
    // SUMMARY
    // =================================================

    const summary =
        useMemo(
            () => {

                const total =
                    filteredPayrolls.length;


                const draft =
                    filteredPayrolls.filter(
                        payroll =>
                            payroll.status ===
                            "Draft"
                    ).length;


                const approved =
                    filteredPayrolls.filter(
                        payroll =>
                            payroll.status ===
                            "Approved"
                    ).length;


                const paid =
                    filteredPayrolls.filter(
                        payroll =>
                            payroll.status ===
                            "Paid"
                    ).length;


                const cancelled =
                    filteredPayrolls.filter(
                        payroll =>
                            payroll.status ===
                            "Cancelled"
                    ).length;


                const gross =
                    filteredPayrolls.reduce(
                        (
                            totalAmount,
                            payroll
                        ) =>
                            totalAmount +
                            (
                                Number(
                                    payroll.grossSalary
                                ) || 0
                            ),
                        0
                    );


                const deductions =
                    filteredPayrolls.reduce(
                        (
                            totalAmount,
                            payroll
                        ) =>
                            totalAmount +
                            (
                                Number(
                                    payroll.totalDeductions
                                ) || 0
                            ),
                        0
                    );


                const net =
                    filteredPayrolls.reduce(
                        (
                            totalAmount,
                            payroll
                        ) =>
                            totalAmount +
                            (
                                Number(
                                    payroll.netSalary
                                ) || 0
                            ),
                        0
                    );


                return {
                    total,
                    draft,
                    approved,
                    paid,
                    cancelled,
                    gross,
                    deductions,
                    net,
                };

            },
            [
                filteredPayrolls,
            ]
        );


    // =================================================
    // VIEW
    // =================================================

    const handleView =
        (payroll) => {

            setSelectedPayroll(
                payroll
            );

            setShowViewModal(
                true
            );
        };


    // =================================================
    // CLOSE VIEW
    // =================================================

    const closeViewModal =
        () => {

            setShowViewModal(
                false
            );

            setSelectedPayroll(
                null
            );
        };


    // =================================================
    // OPEN CREATE
    // =================================================

    const handleOpenCreate =
        () => {

            setError("");

            setSuccess("");

            setShowCreateModal(
                true
            );
        };


    // =================================================
    // CLOSE CREATE
    // =================================================

    const handleCloseCreate =
        () => {

            setShowCreateModal(
                false
            );
        };


    // =================================================
    // AFTER CREATE
    // =================================================

    const handlePayrollCreated =
        async (
            createdPayroll
        ) => {

            setShowCreateModal(
                false
            );

            setSuccess(
                "Payroll created successfully."
            );

            // -----------------------------------------
            // If callback sends payroll object,
            // immediately add it to UI.
            // -----------------------------------------

            if (
                createdPayroll &&
                typeof createdPayroll ===
                    "object" &&
                createdPayroll._id
            ) {

                setPayrolls(
                    previous => {

                        const exists =
                            previous.some(
                                payroll =>
                                    String(
                                        payroll._id
                                    ) ===
                                    String(
                                        createdPayroll._id
                                    )
                            );

                        if (exists) {
                            return previous;
                        }

                        return [
                            createdPayroll,
                            ...previous,
                        ];
                    }
                );
            }

            await fetchPayrolls(
                true
            );
        };


    // =================================================
    // APPROVE
    // =================================================

    const handleApprove =
        async (
            payroll
        ) => {

            if (
                !payroll?._id
            ) {
                return;
            }


            if (
                payroll.status !==
                "Draft"
            ) {

                setError(
                    "Only draft payroll can be approved."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Approve payroll for ${getEmployeeName(
                        payroll
                    )} for ${getMonthName(
                        payroll.month
                    )} ${payroll.year}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setError("");

                const response =
                    await api.put(
                        `/payroll/${payroll._id}/approve`
                    );


                if (
                    response?.data?.success
                ) {

                    setSuccess(
                        response.data.message ||
                        "Payroll approved successfully."
                    );

                    await fetchPayrolls(
                        true
                    );

                } else {

                    setError(
                        response?.data?.message ||
                        "Failed to approve payroll."
                    );
                }

            } catch (err) {

                console.error(
                    "APPROVE PAYROLL ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to approve payroll."
                );
            }
        };


    // =================================================
    // OPEN PAYMENT MODAL
    // =================================================

    const handleMarkPaid =
        (payroll) => {

            if (
                !payroll?._id
            ) {
                return;
            }


            if (
                payroll.status !==
                "Approved"
            ) {

                setError(
                    "Only approved payroll can be marked as paid."
                );

                return;
            }


            setError("");

            setSuccess("");

            setPaymentPayroll(
                payroll
            );

            setShowPaymentModal(
                true
            );
        };


    // =================================================
    // CLOSE PAYMENT
    // =================================================

    const handleClosePayment =
        () => {

            setShowPaymentModal(
                false
            );

            setPaymentPayroll(
                null
            );
        };


    // =================================================
    // PAYMENT SUCCESS
    // =================================================

    const handlePaymentSuccess =
        async (
            paymentResult
        ) => {

            /*
             * Expected callback data can be:
             *
             * {
             *    _id,
             *    status: "Paid",
             *    paymentMethod,
             *    paymentReference,
             *    paidAt
             * }
             *
             * or:
             *
             * {
             *    payroll: {...}
             * }
             */

            const updatedPayroll =
                paymentResult?.payroll ||
                paymentResult?.data ||
                (
                    paymentResult?._id
                        ? paymentResult
                        : null
                );


            const payrollId =
                updatedPayroll?._id ||
                paymentPayroll?._id;


            // -----------------------------------------
            // IMMEDIATELY UPDATE CURRENT TABLE
            // -----------------------------------------

            if (
                updatedPayroll
            ) {

                setPayrolls(
                    previous =>
                        previous.map(
                            payroll =>
                                String(
                                    payroll._id
                                ) ===
                                String(
                                    payrollId
                                )
                                    ? {
                                        ...payroll,
                                        ...updatedPayroll,
                                    }
                                    : payroll
                        )
                );

                // -------------------------------------
                // IMMEDIATELY UPDATE OPEN VIEW
                // -------------------------------------

                setSelectedPayroll(
                    previous =>
                        previous &&
                        String(
                            previous._id
                        ) ===
                        String(
                            payrollId
                        )
                            ? {
                                ...previous,
                                ...updatedPayroll,
                            }
                            : previous
                );
            }


            setShowPaymentModal(
                false
            );

            setPaymentPayroll(
                null
            );

            setSuccess(
                paymentResult?.message ||
                "Payroll payment recorded successfully."
            );


            // -----------------------------------------
            // SERVER IS AUTHORITATIVE
            // -----------------------------------------

            await fetchPayrolls(
                true
            );
        };


    // =================================================
    // CANCEL
    // =================================================

    const handleCancel =
        async (
            payroll
        ) => {

            if (
                !payroll?._id
            ) {
                return;
            }


            if (
                String(payroll.status || "").toUpperCase() ===
                "PAID"
            ) {

                setError(
                    "Paid payroll cannot be cancelled."
                );

                return;
            }


            if (
                payroll.status ===
                "Cancelled"
            ) {

                setError(
                    "Payroll is already cancelled."
                );

                return;
            }


            const reason = await prompt({
                title: "Cancel payroll",
                message: "Provide a reason for cancelling this payroll record.",
                label: "Cancellation reason",
                placeholder: "Enter at least 3 characters",
                multiline: true,
                submitLabel: "Cancel payroll",
            });


            if (
                reason === null
            ) {
                return;
            }


            const cleanReason =
                String(
                    reason
                ).trim();


            if (
                cleanReason.length < 3
            ) {

                setError(
                    "Cancellation reason must contain at least 3 characters."
                );

                return;
            }


            try {

                setError("");

                const response =
                    await api.put(
                        `/payroll/${payroll._id}/cancel`,
                        {
                            cancellationReason:
                                cleanReason,
                        }
                    );


                if (
                    response?.data?.success
                ) {

                    setSuccess(
                        response.data.message ||
                        "Payroll cancelled successfully."
                    );

                    await fetchPayrolls(
                        true
                    );

                } else {

                    setError(
                        response?.data?.message ||
                        "Failed to cancel payroll."
                    );
                }

            } catch (err) {

                console.error(
                    "CANCEL PAYROLL ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to cancel payroll."
                );
            }
        };


    // =================================================
    // DELETE
    // =================================================

    const handleDelete =
        async (
            payroll
        ) => {

            if (
                !payroll?._id
            ) {
                return;
            }


            if (
                payroll.status ===
                "Paid"
            ) {

                setError(
                    "Paid payroll cannot be deleted."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Delete payroll for ${getEmployeeName(
                        payroll
                    )} for ${getMonthName(
                        payroll.month
                    )} ${payroll.year}?\n\nThis action cannot be undone.`
                );


            if (!confirmed) {
                return;
            }


            try {

                setError("");

                const response =
                    await api.delete(
                        `/payroll/${payroll._id}`
                    );


                if (
                    response?.data?.success
                ) {

                    setSuccess(
                        response.data.message ||
                        "Payroll deleted successfully."
                    );

                    if (
                        selectedPayroll?._id &&
                        String(
                            selectedPayroll._id
                        ) ===
                        String(
                            payroll._id
                        )
                    ) {

                        closeViewModal();
                    }

                    await fetchPayrolls(
                        true
                    );

                } else {

                    setError(
                        response?.data?.message ||
                        "Failed to delete payroll."
                    );
                }

            } catch (err) {

                console.error(
                    "DELETE PAYROLL ERROR:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to delete payroll."
                );
            }
        };


    // =================================================
    // RESET FILTERS
    // =================================================

    const resetFilters =
        () => {

            setSearch("");

            setStatusFilter(
                "All"
            );

            setMonthFilter(
                "All"
            );

            setYearFilter(
                "All"
            );
        };


    // =================================================
    // GENERATE PAYSLIP PDF
    // =================================================

    const handleDownloadPayslip =
        async (
            payroll = selectedPayroll
        ) => {

            if (
                !payroll?._id
            ) {

                setError(
                    "Payroll information is not available."
                );

                return;
            }


            if (
                payroll.status !==
                "Paid"
            ) {

                setError(
                    "Payslip can only be downloaded for paid payroll."
                );

                return;
            }


            try {

                setGeneratingPayslip(
                    true
                );

                setError("");


                const employeeName =
                    getEmployeeName(
                        payroll
                    );

                const employeeId =
                    getEmployeeId(
                        payroll
                    );

                const department =
                    getDepartment(
                        payroll
                    );

                const designation =
                    getDesignation(
                        payroll
                    );

                const monthName =
                    getMonthName(
                        payroll.month
                    );

                const year =
                    payroll.year ||
                    "";


                // =====================================
                // CREATE A4 DOCUMENT
                // =====================================

                const doc =
                    new jsPDF(
                        {
                            orientation:
                                "portrait",
                            unit:
                                "mm",
                            format:
                                "a4",
                        }
                    );


                const pageWidth =
                    doc.internal.pageSize.getWidth();

                const pageHeight =
                    doc.internal.pageSize.getHeight();


                const left =
                    16;

                const right =
                    pageWidth - 16;

                let y =
                    16;


                // =====================================
                // HEADER
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    20
                );

                doc.text(
                    "PAYSLIP",
                    pageWidth / 2,
                    y,
                    {
                        align: "center",
                    }
                );


                y += 8;


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(
                    9
                );

                doc.text(
                    "Employee Payroll Statement",
                    pageWidth / 2,
                    y,
                    {
                        align: "center",
                    }
                );


                y += 8;


                // =====================================
                // HEADER LINE
                // =====================================

                doc.line(
                    left,
                    y,
                    right,
                    y
                );


                y += 9;


                // =====================================
                // PAYROLL PERIOD
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    11
                );

                doc.text(
                    "Payroll Period",
                    left,
                    y
                );


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    `${monthName} ${year}`,
                    right,
                    y,
                    {
                        align: "right",
                    }
                );


                y += 7;


                doc.line(
                    left,
                    y,
                    right,
                    y
                );


                y += 9;


                // =====================================
                // EMPLOYEE INFORMATION
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    12
                );

                doc.text(
                    "Employee Information",
                    left,
                    y
                );


                y += 7;


                const employeeRows = [
                    [
                        "Employee Name",
                        employeeName,
                    ],
                    [
                        "Employee ID",
                        employeeId,
                    ],
                    [
                        "Department",
                        department,
                    ],
                    [
                        "Designation",
                        designation,
                    ],
                ];


                doc.setFontSize(
                    9
                );


                employeeRows.forEach(
                    row => {

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );

                        doc.text(
                            row[0],
                            left,
                            y
                        );

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            String(
                                row[1]
                            ),
                            72,
                            y
                        );

                        y += 6;
                    }
                );


                y += 4;


                // =====================================
                // ATTENDANCE
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    12
                );

                doc.text(
                    "Attendance Summary",
                    left,
                    y
                );


                y += 7;


                const attendanceRows = [
                    [
                        "Working Days",
                        payroll.workingDays ?? 0,
                    ],
                    [
                        "Present Days",
                        payroll.presentDays ?? 0,
                    ],
                    [
                        "Absent Days",
                        payroll.absentDays ?? 0,
                    ],
                    [
                        "Half Days",
                        payroll.halfDays ?? 0,
                    ],
                    [
                        "Leave Days",
                        payroll.leaveDays ?? 0,
                    ],
                    [
                        "Paid Leave",
                        payroll.paidLeaveDays ?? 0,
                    ],
                    [
                        "Unpaid Leave",
                        payroll.unpaidLeaveDays ?? 0,
                    ],
                    [
                        "Overtime Hours",
                        Number(
                            payroll.overtimeHours || 0
                        ).toFixed(2),
                    ],
                ];


                doc.setFontSize(
                    9
                );


                attendanceRows.forEach(
                    row => {

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );

                        doc.text(
                            String(
                                row[0]
                            ),
                            left,
                            y
                        );

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            String(
                                row[1]
                            ),
                            72,
                            y
                        );

                        y += 5.5;
                    }
                );


                y += 4;


                // =====================================
                // EARNINGS + DEDUCTIONS
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    12
                );

                doc.text(
                    "Earnings",
                    left,
                    y
                );

                doc.text(
                    "Deductions",
                    110,
                    y
                );


                y += 7;


                const earnings = [
                    [
                        "Basic Salary",
                        payroll.basicSalary,
                    ],
                    [
                        "HRA",
                        payroll.hra,
                    ],
                    [
                        "DA",
                        payroll.da,
                    ],
                    [
                        "TA / Conveyance",
                        payroll.ta,
                    ],
                    [
                        "Other Allowances",
                        payroll.otherAllowances,
                    ],
                    [
                        "Bonus",
                        payroll.bonus,
                    ],
                    [
                        "Overtime",
                        payroll.overtimeAmount,
                    ],
                ];


                const deductions = [
                    [
                        "PF",
                        payroll.pf,
                    ],
                    [
                        "ESI",
                        payroll.esi,
                    ],
                    [
                        "Professional Tax",
                        payroll.professionalTax,
                    ],
                    [
                        "TDS",
                        payroll.tds,
                    ],
                    [
                        "Attendance Deduction",
                        payroll.attendanceDeduction,
                    ],
                    [
                        "Unpaid Leave",
                        payroll.unpaidLeaveDeduction,
                    ],
                    [
                        "Other Deductions",
                        payroll.otherDeductions,
                    ],
                ];


                const maxRows =
                    Math.max(
                        earnings.length,
                        deductions.length
                    );


                doc.setFontSize(
                    8.8
                );


                for (
                    let index = 0;
                    index < maxRows;
                    index += 1
                ) {

                    if (
                        earnings[index]
                    ) {

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );

                        doc.text(
                            earnings[index][0],
                            left,
                            y
                        );

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            formatCurrencyPdf(
                                earnings[index][1]
                            ),
                            92,
                            y,
                            {
                                align: "right",
                            }
                        );
                    }


                    if (
                        deductions[index]
                    ) {

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );

                        doc.text(
                            deductions[index][0],
                            110,
                            y
                        );

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            formatCurrencyPdf(
                                deductions[index][1]
                            ),
                            right,
                            y,
                            {
                                align: "right",
                            }
                        );
                    }


                    y += 5.5;
                }


                y += 2;


                // =====================================
                // GROSS / DEDUCTIONS
                // =====================================

                doc.line(
                    left,
                    y,
                    right,
                    y
                );


                y += 7;


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    10
                );

                doc.text(
                    "Gross Salary",
                    left,
                    y
                );

                doc.text(
                    formatCurrencyPdf(
                        payroll.grossSalary
                    ),
                    92,
                    y,
                    {
                        align: "right",
                    }
                );


                doc.text(
                    "Total Deductions",
                    110,
                    y
                );

                doc.text(
                    formatCurrencyPdf(
                        payroll.totalDeductions
                    ),
                    right,
                    y,
                    {
                        align: "right",
                    }
                );


                y += 9;


                // =====================================
                // NET SALARY
                // =====================================

                doc.line(
                    left,
                    y,
                    right,
                    y
                );


                y += 10;


                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    14
                );

                doc.text(
                    "NET SALARY",
                    left,
                    y
                );

                doc.text(
                    formatCurrencyPdf(
                        payroll.netSalary
                    ),
                    right,
                    y,
                    {
                        align: "right",
                    }
                );


                y += 12;


                // =====================================
                // PAYMENT INFORMATION
                // =====================================

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.setFontSize(
                    12
                );

                doc.text(
                    "Payment Information",
                    left,
                    y
                );


                y += 7;


                const paymentRows = [
                    [
                        "Payment Status",
                        payroll.status || "Paid",
                    ],
                    [
                        "Payment Method",
                        payroll.paymentMethod || "—",
                    ],
                    [
                        "Payment Reference",
                        payroll.paymentReference || "—",
                    ],
                    [
                        "Paid Date",
                        formatDatePdf(
                            payroll.paidAt
                        ),
                    ],
                ];


                doc.setFontSize(
                    9
                );


                paymentRows.forEach(
                    row => {

                        doc.setFont(
                            "helvetica",
                            "normal"
                        );

                        doc.text(
                            row[0],
                            left,
                            y
                        );

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            String(
                                row[1]
                            ),
                            72,
                            y
                        );

                        y += 6;
                    }
                );


                // =====================================
                // PERIOD DATES
                // =====================================

                y += 3;


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(
                    8
                );

                doc.text(
                    `Payroll period: ${formatDatePdf(
                        payroll.periodStart
                    )} - ${formatDatePdf(
                        payroll.periodEnd
                    )}`,
                    left,
                    y
                );


                // =====================================
                // FOOTER
                // =====================================

                const footerY =
                    pageHeight - 18;


                doc.line(
                    left,
                    footerY - 5,
                    right,
                    footerY - 5
                );


                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(
                    7.5
                );

                doc.text(
                    "This is a computer-generated payslip.",
                    left,
                    footerY
                );


                doc.text(
                    `Generated on ${formatDatePdf(
                        new Date()
                    )}`,
                    right,
                    footerY,
                    {
                        align: "right",
                    }
                );


                // =====================================
                // SAFE FILE NAME
                // =====================================

                const safeEmployeeName =
                    employeeName
                        .replace(
                            /[^a-zA-Z0-9]+/g,
                            "_"
                        )
                        .replace(
                            /^_+|_+$/g,
                            ""
                        );


                const fileName =
                    `Payslip_${safeEmployeeName || "Employee"}_${monthName}_${year}.pdf`;


                // =====================================
                // SAVE
                // =====================================

                doc.save(
                    fileName
                );


                setSuccess(
                    "Payslip PDF generated successfully."
                );

            } catch (err) {

                console.error(
                    "GENERATE PAYSLIP ERROR:",
                    err
                );

                setError(
                    "Unable to generate payslip PDF."
                );

            } finally {

                setGeneratingPayslip(
                    false
                );
            }
        };


    // =================================================
    // PRINT PAYSLIP
    // =================================================

    const handlePrintPayslip =
        () => {

            if (
                !selectedPayroll
            ) {
                return;
            }

            if (
                selectedPayroll.status !==
                "Paid"
            ) {

                setError(
                    "Only paid payroll can be printed."
                );

                return;
            }

            handleDownloadPayslip(
                selectedPayroll
            );
        };


    // =================================================
    // LOADING
    // =================================================

    if (
        loading
    ) {

        return (
            <div
                className="payroll-management-page"
            >

                <div
                    className="payroll-loading-state"
                >

                    <Loader2
                        size={34}
                        className="payroll-loading-spinner"
                    />

                    <h3>
                        Loading Payroll
                    </h3>

                    <p>
                        Please wait while payroll records are being loaded.
                    </p>

                </div>

            </div>
        );
    }


    // =================================================
    // RENDER
    // =================================================

    return (
        <div
            className="payroll-management-page"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="payroll-page-header"
            >

                <div
                    className="payroll-page-heading"
                >

                    <div
                        className="payroll-page-icon"
                    >

                        <DollarSign
                            size={26}
                        />

                    </div>


                    <div>

                        <h1>
                            Payroll Management
                        </h1>

                        <p>
                            Create, review, approve, pay and manage employee payroll.
                        </p>

                    </div>

                </div>


                <div
                    className="payroll-header-actions"
                >

                    <button
                        type="button"
                        className="payroll-refresh-btn"
                        onClick={() =>
                            fetchPayrolls(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "payroll-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="payroll-create-btn"
                        onClick={
                            handleOpenCreate
                        }
                    >

                        <Plus
                            size={18}
                        />

                        Create Payroll

                    </button>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (

                <div
                    className="payroll-alert payroll-alert-error"
                >

                    <XCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>

            )}


            {success && (

                <div
                    className="payroll-alert payroll-alert-success"
                >

                    <CheckCircle2
                        size={18}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >

                        <X
                            size={17}
                        />

                    </button>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
                className="payroll-summary-grid"
            >

                <div
                    className="payroll-summary-card"
                >

                    <div
                        className="payroll-summary-card-icon"
                    >

                        <FileText
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Total Payrolls
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div
                    className="payroll-summary-card"
                >

                    <div
                        className="payroll-summary-card-icon"
                    >

                        <Clock3
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Draft
                        </span>

                        <strong>
                            {summary.draft}
                        </strong>

                    </div>

                </div>


                <div
                    className="payroll-summary-card"
                >

                    <div
                        className="payroll-summary-card-icon"
                    >

                        <CheckCircle2
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Approved
                        </span>

                        <strong>
                            {summary.approved}
                        </strong>

                    </div>

                </div>


                <div
                    className="payroll-summary-card"
                >

                    <div
                        className="payroll-summary-card-icon"
                    >

                        <CreditCard
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Paid
                        </span>

                        <strong>
                            {summary.paid}
                        </strong>

                    </div>

                </div>


                <div
                    className="payroll-summary-card payroll-summary-money"
                >

                    <div
                        className="payroll-summary-card-icon"
                    >

                        <DollarSign
                            size={21}
                        />

                    </div>

                    <div>

                        <span>
                            Net Payroll
                        </span>

                        <strong>
                            {formatCurrency(
                                summary.net
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div
                className="payroll-filter-card"
            >

                <div
                    className="payroll-search-box"
                >

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search employee, ID, department..."
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >

                            <X
                                size={16}
                            />

                        </button>

                    )}

                </div>


                <div
                    className="payroll-filter-controls"
                >

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Draft">
                            Draft
                        </option>

                        <option value="Approved">
                            Approved
                        </option>

                        <option value="Paid">
                            Paid
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>

                    </select>


                    <select
                        value={
                            monthFilter
                        }
                        onChange={(event) =>
                            setMonthFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Months
                        </option>

                        {MONTHS.map(
                            month => (

                                <option
                                    key={
                                        month.value
                                    }
                                    value={
                                        month.value
                                    }
                                >
                                    {month.label}
                                </option>

                            )
                        )}

                    </select>


                    <select
                        value={
                            yearFilter
                        }
                        onChange={(event) =>
                            setYearFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="All">
                            All Years
                        </option>

                        {availableYears.map(
                            year => (

                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>

                            )
                        )}

                    </select>


                    <button
                        type="button"
                        className="payroll-reset-btn"
                        onClick={
                            resetFilters
                        }
                    >
                        Reset
                    </button>

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div
                className="payroll-table-card"
            >

                <div
                    className="payroll-table-header"
                >

                    <div>

                        <h2>
                            Payroll Records
                        </h2>

                        <span>
                            {filteredPayrolls.length} record
                            {filteredPayrolls.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                </div>


                {filteredPayrolls.length === 0 ? (

                    <div
                        className="payroll-empty-state"
                    >

                        <div
                            className="payroll-empty-icon"
                        >

                            <Users
                                size={30}
                            />

                        </div>

                        <h3>
                            No Payroll Records Found
                        </h3>

                        <p>
                            Create payroll for an employee to see it here.
                        </p>

                        <button
                            type="button"
                            className="payroll-create-btn"
                            onClick={
                                handleOpenCreate
                            }
                        >

                            <Plus
                                size={17}
                            />

                            Create Payroll

                        </button>

                    </div>

                ) : (

                    <div
                        className="payroll-table-wrapper"
                    >

                        <table
                            className="payroll-table"
                        >

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Period
                                    </th>

                                    <th>
                                        Attendance
                                    </th>

                                    <th>
                                        Gross
                                    </th>

                                    <th>
                                        Deductions
                                    </th>

                                    <th>
                                        Net Salary
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

                                {filteredPayrolls.map(
                                    payroll => (

                                        <tr
                                            key={
                                                payroll._id
                                            }
                                        >

                                            {/* EMPLOYEE */}

                                            <td>

                                                <div
                                                    className="payroll-employee-cell"
                                                >

                                                    <div
                                                        className="payroll-employee-avatar"
                                                    >

                                                        {getEmployeeName(
                                                            payroll
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getEmployeeName(
                                                                    payroll
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getEmployeeId(
                                                                    payroll
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* PERIOD */}

                                            <td>

                                                <div
                                                    className="payroll-period-cell"
                                                >

                                                    <strong>
                                                        {
                                                            getMonthName(
                                                                payroll.month
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            payroll.year
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* ATTENDANCE */}

                                            <td>

                                                <div
                                                    className="payroll-attendance-cell"
                                                >

                                                    <span>
                                                        Present:{" "}
                                                        <strong>
                                                            {
                                                                payroll.presentDays ??
                                                                0
                                                            }
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Absent:{" "}
                                                        <strong>
                                                            {
                                                                payroll.absentDays ??
                                                                0
                                                            }
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Leave:{" "}
                                                        <strong>
                                                            {
                                                                payroll.leaveDays ??
                                                                0
                                                            }
                                                        </strong>
                                                    </span>

                                                </div>

                                            </td>


                                            {/* GROSS */}

                                            <td>

                                                <strong
                                                    className="payroll-money-text"
                                                >
                                                    {formatCurrency(
                                                        payroll.grossSalary
                                                    )}
                                                </strong>

                                            </td>


                                            {/* DEDUCTIONS */}

                                            <td>

                                                <strong
                                                    className="payroll-deduction-text"
                                                >
                                                    {formatCurrency(
                                                        payroll.totalDeductions
                                                    )}
                                                </strong>

                                            </td>


                                            {/* NET */}

                                            <td>

                                                <strong
                                                    className="payroll-net-text"
                                                >
                                                    {formatCurrency(
                                                        payroll.netSalary
                                                    )}
                                                </strong>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <StatusBadge
                                                    status={
                                                        payroll.status
                                                    }
                                                />

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div
                                                    className="payroll-action-buttons"
                                                >

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        className="payroll-action-view"
                                                        title="View payroll"
                                                        onClick={() =>
                                                            handleView(
                                                                payroll
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                    </button>


                                                    {/* APPROVE */}

                                                    {payroll.status ===
                                                        "Draft" && (

                                                        <button
                                                            type="button"
                                                            className="payroll-action-approve"
                                                            title="Approve payroll"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <CheckCircle2
                                                                size={16}
                                                            />

                                                        </button>

                                                    )}


                                                    {/* PAY */}

                                                    {payroll.status ===
                                                        "Approved" && (

                                                        <button
                                                            type="button"
                                                            className="payroll-action-paid"
                                                            title="Mark as paid"
                                                            onClick={() =>
                                                                handleMarkPaid(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <CreditCard
                                                                size={16}
                                                            />

                                                        </button>

                                                    )}


                                                    {/* DOWNLOAD */}

                                                    {payroll.status ===
                                                        "Paid" && (

                                                        <button
                                                            type="button"
                                                            className="payroll-action-download"
                                                            title="Download payslip"
                                                            onClick={() =>
                                                                handleDownloadPayslip(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Download
                                                                size={16}
                                                            />

                                                        </button>

                                                    )}


                                                    {/* CANCEL */}

                                                    {payroll.status !==
                                                        "Paid" &&
                                                        payroll.status !==
                                                        "Cancelled" && (

                                                        <button
                                                            type="button"
                                                            className="payroll-action-cancel"
                                                            title="Cancel payroll"
                                                            onClick={() =>
                                                                handleCancel(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Ban
                                                                size={16}
                                                            />

                                                        </button>

                                                    )}


                                                    {/* DELETE */}

                                                    {String(
                                                        payroll.status ||
                                                        ""
                                                    ).toUpperCase() !==
                                                        "PAID" && (

                                                        <button
                                                            type="button"
                                                            className="payroll-action-delete"
                                                            title="Delete payroll"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    payroll
                                                                )
                                                            }
                                                        >

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                VIEW PAYROLL MODAL
            ================================================= */}

            {showViewModal &&
                selectedPayroll && (

                    <div
                        className="payroll-modal-overlay"
                        onMouseDown={
                            closeViewModal
                        }
                    >

                        <div
                            className="payroll-view-modal"
                            onMouseDown={event =>
                                event.stopPropagation()
                            }
                        >

                            {/* HEADER */}

                            <div
                                className="payroll-modal-header"
                            >

                                <div>

                                    <h2>
                                        Payroll Details
                                    </h2>

                                    <p>
                                        {
                                            getEmployeeName(
                                                selectedPayroll
                                            )
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeViewModal
                                    }
                                >

                                    <X
                                        size={20}
                                    />

                                </button>

                            </div>


                            <div
                                className="payroll-modal-body"
                            >

                                {/* EMPLOYEE */}

                                <div
                                    className="payroll-detail-section"
                                >

                                    <h3>
                                        Employee Information
                                    </h3>

                                    <div
                                        className="payroll-detail-grid"
                                    >

                                        <div>
                                            <span>
                                                Employee
                                            </span>

                                            <strong>
                                                {
                                                    getEmployeeName(
                                                        selectedPayroll
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Employee ID
                                            </span>

                                            <strong>
                                                {
                                                    getEmployeeId(
                                                        selectedPayroll
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Department
                                            </span>

                                            <strong>
                                                {
                                                    getDepartment(
                                                        selectedPayroll
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Designation
                                            </span>

                                            <strong>
                                                {
                                                    getDesignation(
                                                        selectedPayroll
                                                    )
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* PERIOD */}

                                <div
                                    className="payroll-detail-section"
                                >

                                    <h3>
                                        Payroll Period
                                    </h3>

                                    <div
                                        className="payroll-detail-grid"
                                    >

                                        <div>
                                            <span>
                                                Month
                                            </span>

                                            <strong>
                                                {
                                                    getMonthName(
                                                        selectedPayroll.month
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Year
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.year
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Period Start
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedPayroll.periodStart
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Period End
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        selectedPayroll.periodEnd
                                                    )
                                                }
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* ATTENDANCE */}

                                <div
                                    className="payroll-detail-section"
                                >

                                    <h3>
                                        Attendance Summary
                                    </h3>

                                    <div
                                        className="payroll-detail-grid"
                                    >

                                        <div>
                                            <span>
                                                Working Days
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.workingDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Present Days
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.presentDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Absent Days
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.absentDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Half Days
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.halfDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Leave Days
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.leaveDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Paid Leave
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.paidLeaveDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Unpaid Leave
                                            </span>

                                            <strong>
                                                {
                                                    selectedPayroll.unpaidLeaveDays ??
                                                    0
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Overtime Hours
                                            </span>

                                            <strong>
                                                {Number(
                                                    selectedPayroll.overtimeHours ||
                                                    0
                                                ).toFixed(2)}
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* EARNINGS */}

                                <div
                                    className="payroll-detail-section"
                                >

                                    <h3>
                                        Earnings
                                    </h3>

                                    <div
                                        className="payroll-money-list"
                                    >

                                        <div>
                                            <span>
                                                Basic Salary
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.basicSalary
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                HRA
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.hra
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                DA
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.da
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                TA / Conveyance
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.ta
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Other Allowances
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.otherAllowances
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Bonus
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.bonus
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Overtime
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.overtimeAmount
                                                )}
                                            </strong>
                                        </div>


                                        <div
                                            className="payroll-total-row"
                                        >

                                            <span>
                                                Gross Salary
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.grossSalary
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* DEDUCTIONS */}

                                <div
                                    className="payroll-detail-section"
                                >

                                    <h3>
                                        Deductions
                                    </h3>

                                    <div
                                        className="payroll-money-list"
                                    >

                                        <div>
                                            <span>
                                                PF
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.pf
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                ESI
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.esi
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Professional Tax
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.professionalTax
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                TDS
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.tds
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Attendance Deduction
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.attendanceDeduction
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Unpaid Leave Deduction
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.unpaidLeaveDeduction
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Other Deductions
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.otherDeductions
                                                )}
                                            </strong>
                                        </div>


                                        <div
                                            className="payroll-total-row"
                                        >

                                            <span>
                                                Total Deductions
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    selectedPayroll.totalDeductions
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* NET */}

                                <div
                                    className="payroll-net-summary"
                                >

                                    <div>

                                        <span>
                                            Net Salary
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedPayroll.netSalary
                                            )}
                                        </strong>

                                    </div>


                                    <StatusBadge
                                        status={
                                            selectedPayroll.status
                                        }
                                    />

                                </div>


                                {/* PAYMENT */}

                                {selectedPayroll.status ===
                                    "Paid" && (

                                    <div
                                        className="payroll-detail-section"
                                    >

                                        <h3>
                                            Payment Information
                                        </h3>

                                        <div
                                            className="payroll-detail-grid"
                                        >

                                            <div>
                                                <span>
                                                    Payment Method
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.paymentMethod ||
                                                        "—"
                                                    }
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Payment Reference
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.paymentReference ||
                                                        "—"
                                                    }
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Paid Date
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            selectedPayroll.paidAt
                                                        )
                                                    }
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Payment Status
                                                </span>

                                                <strong>
                                                    Paid
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* CANCELLATION */}

                                {selectedPayroll.status ===
                                    "Cancelled" && (

                                    <div
                                        className="payroll-detail-section"
                                    >

                                        <h3>
                                            Cancellation Information
                                        </h3>

                                        <div
                                            className="payroll-detail-grid"
                                        >

                                            <div>
                                                <span>
                                                    Cancelled Date
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            selectedPayroll.cancelledAt
                                                        )
                                                    }
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Reason
                                                </span>

                                                <strong>
                                                    {
                                                        selectedPayroll.cancellationReason ||
                                                        "—"
                                                    }
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* FOOTER */}

                            <div
                                className="payroll-modal-footer"
                            >

                                {selectedPayroll.status ===
                                    "Paid" && (

                                    <>

                                        <button
                                            type="button"
                                            className="payroll-btn payroll-btn-primary"
                                            onClick={() =>
                                                handleDownloadPayslip(
                                                    selectedPayroll
                                                )
                                            }
                                            disabled={
                                                generatingPayslip
                                            }
                                        >

                                            {generatingPayslip ? (

                                                <>

                                                    <Loader2
                                                        size={17}
                                                        className="payroll-spin"
                                                    />

                                                    Generating PDF...

                                                </>

                                            ) : (

                                                <>

                                                    <Download
                                                        size={17}
                                                    />

                                                    Download Payslip

                                                </>

                                            )}

                                        </button>


                                        <button
                                            type="button"
                                            className="payroll-btn payroll-btn-secondary"
                                            onClick={
                                                handlePrintPayslip
                                            }
                                            disabled={
                                                generatingPayslip
                                            }
                                        >

                                            <Printer
                                                size={17}
                                            />

                                            Print Payslip

                                        </button>

                                    </>

                                )}


                                <button
                                    type="button"
                                    className="payroll-modal-close-btn"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* =================================================
                CREATE PAYROLL MODAL
            ================================================= */}

            <PayrollCreateModal
                isOpen={
                    showCreateModal
                }

                onClose={
                    handleCloseCreate
                }

                onSuccess={
                    handlePayrollCreated
                }
            />


            {/* =================================================
                PAYMENT MODAL
            ================================================= */}

            <PayrollPaymentModal
                isOpen={
                    showPaymentModal
                }

                payroll={
                    paymentPayroll
                }

                onClose={
                    handleClosePayment
                }

                onSuccess={
                    handlePaymentSuccess
                }
            />

        </div>
    );
};


export default PayrollManagement;