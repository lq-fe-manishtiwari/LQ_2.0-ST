import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function SelectionModal({ isOpen, onClose, onGoToSelection, tabName, startTime, endTime }) {
    if (!isOpen) return null;

    // Format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Modal content */}
                <div className="p-6 pt-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                        Selection Required
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 text-center mb-4 leading-relaxed">
                        You have a selection available in <span className="font-semibold text-blue-600">{tabName}</span>.
                        Please complete your subject selection process within the timeline, then your content will unlock.
                    </p>

                    {/* Timeline */}
                    {(startTime || endTime) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                            <div className="space-y-1 text-sm">
                                {startTime && (
                                    <p className="text-gray-700">
                                        <span className="font-medium">Starts:</span> {formatDateTime(startTime)}
                                    </p>
                                )}
                                {endTime && (
                                    <p className="text-gray-700">
                                        <span className="font-medium">Ends:</span> {formatDateTime(endTime)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onGoToSelection}
                            className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-lg shadow-blue-200/50"
                        >
                            Go to Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
