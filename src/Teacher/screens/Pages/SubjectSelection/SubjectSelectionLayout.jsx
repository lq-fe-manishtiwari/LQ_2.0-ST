import React from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Error fallback component for the Subject Selection section
 */
const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
                <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
                <p className="text-red-600 text-sm mb-4">
                    {error?.message || "An unexpected error occurred in the Subject Selection section."}
                </p>
                <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

/**
 * Loading fallback component
 */
const LoadingFallback = () => {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
};

/**
 * Main layout component for the Subject Selection section
 * Provides error boundaries, loading states, and consistent layout structure
 */
const SubjectSelectionLayout = () => {
    return (
        <div className="p-0 sm:p-6 min-h-screen">
            {/* Header Section */}
            <header className="mb-6">
                <h1 className="pageheading mb-2 sm:mb-4">Paper Selection</h1>
            </header>

            {/* Main Content Area */}
            <main className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
                <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onError={(error, errorInfo) => {
                        console.error("Subject Selection page error:", error, errorInfo);
                    }}
                    onReset={() => {
                        window.location.reload();
                    }}
                >
                    <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
                        <Outlet />
                    </div>
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default SubjectSelectionLayout;
