import React from 'react';
import { X, Award, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';

const AssessmentResultModal = ({ isOpen, onClose, resultData }) => {
    if (!isOpen || !resultData) return null;

    const percentage = ((resultData.total_score / resultData.max_marks) * 100).toFixed(1);

    const getGradeColor = (score, maxMarks) => {
        const percent = (score / maxMarks) * 100;
        if (percent >= 90) return 'bg-emerald-500';
        if (percent >= 75) return 'bg-blue-500';
        if (percent >= 60) return 'bg-amber-500';
        if (percent >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStatusColor = (status) => {
        if (status === 'SUBMITTED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTimeTaken = () => {
        if (!resultData.start_time || !resultData.end_time) return 'N/A';
        const start = new Date(resultData.start_time);
        const end = new Date(resultData.end_time);
        const diff = end - start;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex justify-between items-center rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Assessment Submitted!</h2>
                            <p className="text-blue-100 text-sm">Your answers have been recorded</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
                        <div className="text-center mb-6">
                            <div className="inline-block">
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="#e5e7eb"
                                            strokeWidth="8"
                                            fill="none"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="url(#gradient)"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-blue-100">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Award className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-600 mb-1">
                                    {resultData.total_score}
                                </div>
                                <p className="text-gray-600 font-medium text-sm">Score Obtained</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-blue-100">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-3xl font-bold text-purple-600 mb-1">
                                    {resultData.max_marks}
                                </div>
                                <p className="text-gray-600 font-medium text-sm">Maximum Marks</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <span className={`px-6 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(resultData.status)}`}>
                                Status: {resultData.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <h3 className="font-semibold text-gray-800">Time Taken</h3>
                            </div>
                            <p className="text-2xl font-bold text-amber-600 ml-8">{calculateTimeTaken()}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Submission Details</h3>
                            </div>
                            <div className="ml-8 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Attempt ID:</span>
                                    <span className="font-semibold text-gray-800">#{resultData.attempt_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Assessment ID:</span>
                                    <span className="font-semibold text-gray-800">#{resultData.assessment_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Started:</span>
                                    <span className="font-semibold text-gray-800">{formatDateTime(resultData.start_time)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Submitted:</span>
                                    <span className="font-semibold text-gray-800">{formatDateTime(resultData.end_time)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default AssessmentResultModal;
