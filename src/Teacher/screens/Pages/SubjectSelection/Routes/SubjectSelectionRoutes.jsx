import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SubjectSelectionLayout from "../SubjectSelectionLayout";

// Lazy load dashboard component
const SubjectSelectionDashboard = React.lazy(() => import("../SubjectSelectionDashboard"));

/**
 * Loading component with context
 */
const RouteLoading = () => {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading page...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we prepare the content</p>
            </div>
        </div>
    );
};

/**
 * Route wrapper with loading
 */
const RouteWrapper = ({ Component, title }) => {
    // Set document title
    React.useEffect(() => {
        const originalTitle = document.title;
        document.title = `${title} - Subject Selection`;

        return () => {
            document.title = originalTitle;
        };
    }, [title]);

    return (
        <Suspense fallback={<RouteLoading />}>
            <Component />
        </Suspense>
    );
};

/**
 * Main Subject Selection Routes component
 */
export default function SubjectSelectionRoutes() {
    return (
        <Routes>
            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            {/* Main layout with nested routes */}
            <Route element={<SubjectSelectionLayout />}>
                <Route
                    path="dashboard"
                    element={
                        <RouteWrapper
                            Component={SubjectSelectionDashboard}
                            title="Dashboard"
                        />
                    }
                />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
}
