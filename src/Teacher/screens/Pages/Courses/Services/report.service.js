import { authHeaderToPost, handleResponse, AcademicAPI, ContentAPI } from '@/_services/api';

// Simple in-memory cache
const reportCache = new Map();

export const reportService = {
    getProgramWiseReport,
    getGlobalPaperReport,
    getModuleGapReport,
    getUnitGapReport,
    getPendingContentReport,
    getContentDashboardAnalytics,
    clearCache: () => reportCache.clear()
};

async function fetchWithPost(endpoint, params, extraKeys = [], baseAPI = AcademicAPI) {
    const cacheKey = JSON.stringify({ endpoint, params, baseAPI });
    if (reportCache.has(cacheKey)) {
        return Promise.resolve(reportCache.get(cacheKey));
    }

    // Base body with standard keys mapped from camelCase to snake_case
    const body = {
        program_ids: params.programIds || params.program_ids || [],
        batch_ids: params.batchIds || params.batch_ids || [],
        academic_year_ids: params.academicYearIds || params.academic_year_ids || [],
        semester_ids: params.semesterIds || params.semester_ids || []
    };

    // Add extra keys only if they are requested and have data
    extraKeys.forEach(key => {
        // Map camelCase param to snake_case body key
        const paramKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()); // e.g., paper_ids -> paperIds
        if (params[paramKey] && params[paramKey].length > 0) {
            body[key] = params[paramKey];
        }
    });

    const requestOptions = {
        method: 'POST',
        headers: authHeaderToPost(),
        body: JSON.stringify(body)
    };

    const url = `${baseAPI}${endpoint}`;

    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            reportCache.set(cacheKey, data);
            return data;
        });
}

// 1. Program Wise Report (Course Dashboard)
function getProgramWiseReport(params) {
    return fetchWithPost('/reports/course-dashboard', params);
}

// 2. Global Papers Report
function getGlobalPaperReport(params) {
    return fetchWithPost('/reports/global-subjects', params, ['subject_ids', 'subject_type_ids']);
}

// 3. Module Gap Analysis
function getModuleGapReport(params) {
    return fetchWithPost('/reports/module-gap', params);
}

// 4. Unit Gap Analysis
function getUnitGapReport(params) {
    return fetchWithPost('/reports/unit-gap', params);
}

// 5. Pending Content Report
function getPendingContentReport(params) {
    return fetchWithPost('/reports/pending-content', params);
}

// 6. Content Dashboard Analytics
function getContentDashboardAnalytics(params) {
    const college = JSON.parse(localStorage.getItem("activeCollege"));
    const collegeId = college?.id || null;

    // Send only necessary IDs to avoid cache churn and redundant requests
    const cleanParams = {
        college_id: collegeId,
        module_ids: params.module_ids || []
    };

    if (params.refresh) {
        reportService.clearCache();
    }

    return fetchWithPost('/admin/content/dashboard-analytics', cleanParams, ['college_id', 'module_ids'], ContentAPI);
}
