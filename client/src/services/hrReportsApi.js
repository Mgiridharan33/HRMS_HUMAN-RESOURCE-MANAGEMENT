import api from "./api";

// =====================================================
// HR REPORT API
// =====================================================

const hrReportApi = {
    // =================================================
    // GET ALL EMPLOYEES
    // =================================================

    getEmployees: async () => {
        const response =
            await api.get(
                "/hr-reports/employees"
            );

        return response.data;
    },

    // =================================================
    // VIEW REPORT
    // =================================================

    getReport: async ({
        reportType,
        fromDate = "",
        toDate = "",
        employeeId = "",
        month = "",
        year = "",
    }) => {
        const params = {
            reportType,
        };

        if (fromDate) {
            params.fromDate =
                fromDate;
        }

        if (toDate) {
            params.toDate =
                toDate;
        }

        if (employeeId) {
            params.employeeId =
                employeeId;
        }

        if (month) {
            params.month =
                month;
        }

        if (year) {
            params.year =
                year;
        }

        const response =
            await api.get(
                "/hr-reports/view",
                {
                    params,
                }
            );

        return response.data;
    },

    // =================================================
    // DOWNLOAD REPORT
    // =================================================

    downloadReport: async ({
        reportType,
        fromDate = "",
        toDate = "",
        employeeId = "",
        month = "",
        year = "",
        format = "pdf",
    }) => {
        const params = {
            reportType,
            format,
        };

        if (fromDate) {
            params.fromDate =
                fromDate;
        }

        if (toDate) {
            params.toDate =
                toDate;
        }

        if (employeeId) {
            params.employeeId =
                employeeId;
        }

        if (month) {
            params.month =
                month;
        }

        if (year) {
            params.year =
                year;
        }

        return api.get(
            "/hr-reports/download",
            {
                params,
                responseType:
                    "blob",
            }
        );
    },
};

export default hrReportApi;