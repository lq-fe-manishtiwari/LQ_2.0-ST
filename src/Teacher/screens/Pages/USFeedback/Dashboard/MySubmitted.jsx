import React, { useState, useEffect } from "react";

export default function MySubmitted() {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch submitted feedback data from API
        // Placeholder data for now
        setLoading(false);
        setFeedbackList([]);
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
                <h3 className="text-lg font-semibold text-gray-800">My Submitted Feedback</h3>
            </div>

            {feedbackList.length === 0 ? (
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No submitted feedback found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {feedbackList.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h4 className="font-medium text-gray-900">{feedback.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{feedback.description}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-400">
                                    Submitted: {feedback.submittedDate}
                                </span>
                                <button className="text-blue-600 text-sm hover:underline">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
