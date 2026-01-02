import React, { useState, useEffect } from "react";

export default function Pending() {
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch pending feedback data from API
        // Placeholder data for now
        setLoading(false);
        setPendingList([]);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pending Feedback</h3>
            </div>

            {pendingList.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                        <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No pending feedback found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingList.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{feedback.description}</p>
                                    <div className="flex items-center mt-3">
                                        <span className="text-xs text-gray-400">
                                            Due: {feedback.dueDate}
                                        </span>
                                    </div>
                                </div>
                                <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                                    Submit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
