import React, { useState, useEffect } from 'react';
import { X, Clock, Trophy, Calendar, AlertCircle, Play, RotateCcw } from 'lucide-react';
import { ContentService } from '../../Service/Content.service';

export default function QuizHistoryModal({
    isOpen,
    onClose,
    onStartQuiz,
    quizId,
    contentId,
    studentId,
    colorCode,
    quizName
}) {
    const [quizHistory, setQuizHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch quiz history when modal opens
    useEffect(() => {
        if (isOpen && quizId && contentId && studentId) {
            fetchQuizHistory();
        }
    }, [isOpen, quizId, contentId, studentId]);

    const fetchQuizHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ContentService.getQuizResultsByStudent(contentId, quizId, studentId);
            if (response.success) {
                // Sort by attempt date (newest first)
                const sortedHistory = response.data.sort((a, b) =>
                    new Date(b.attempt_time) - new Date(a.attempt_time)
                );
                setQuizHistory(sortedHistory);
            } else {
                setError('Failed to fetch quiz history');
            }
        } catch (error) {
            console.error('Error fetching quiz history:', error);
            // If no history found (404), it means first attempt
            if (error.message.includes('404')) {
                setQuizHistory([]);
            } else {
                setError('Error loading quiz history. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculatePercentage = (score, totalMarks) => {
        if (!totalMarks || totalMarks === 0) return 0;
        return Math.round((score / totalMarks) * 100);
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-100';
        if (percentage >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: `${colorCode}20` }}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Quiz History
                        </h2>
                        <p className="text-gray-600 mt-1">{quizName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">Loading quiz history...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={fetchQuizHistory}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {quizHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
                                        <Play className="w-12 h-12 mx-auto mb-4" style={{ color: colorCode }} />
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            First Attempt
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            You haven't taken this quiz yet. This will be your first attempt.
                                        </p>
                                        <button
                                            onClick={onStartQuiz}
                                            className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                                            style={{ backgroundColor: colorCode }}
                                        >
                                            Start Quiz
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {quizHistory.length}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Attempts</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {Math.max(...quizHistory.map(h => calculatePercentage(h.score || 0, h.total_marks || 1)))}%
                                            </div>
                                            <div className="text-sm text-gray-600">Best Score</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Math.round(quizHistory.reduce((sum, h) => sum + calculatePercentage(h.score || 0, h.total_marks || 1), 0) / quizHistory.length)}%
                                            </div>
                                            <div className="text-sm text-gray-600">Average Score</div>
                                        </div>
                                    </div>

                                    {/* Attempt History */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <Trophy className="w-5 h-5" style={{ color: colorCode }} />
                                            Previous Attempts
                                        </h3>
                                        
                                        {quizHistory.map((attempt, index) => (
                                            <div 
                                                key={attempt.result_id || index} 
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-sm text-gray-500">Attempt</div>
                                                            <div className="font-bold text-gray-800">
                                                                #{quizHistory.length - index}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-6">
                                                            <div>
                                                                <div className="text-sm text-gray-500">Score</div>
                                                                <div className={`text-xl font-bold ${getScoreColor(calculatePercentage(attempt.score || 0, attempt.total_marks || 1))}`}>
                                                                    {calculatePercentage(attempt.score || 0, attempt.total_marks || 1)}%
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="text-sm text-gray-500">Time Taken</div>
                                                                <div className="font-medium text-gray-800">
                                                                    {formatTime(attempt.time_taken)}
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="text-sm text-gray-500">Date & Time</div>
                                                                <div className="font-medium text-gray-800">
                                                                    {formatDate(attempt.attempt_time)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(calculatePercentage(attempt.score || 0, attempt.total_marks || 1))} ${getScoreColor(calculatePercentage(attempt.score || 0, attempt.total_marks || 1))}`}>
                                                        {calculatePercentage(attempt.score || 0, attempt.total_marks || 1) >= 80 ? 'Excellent' :
                                                         calculatePercentage(attempt.score || 0, attempt.total_marks || 1) >= 60 ? 'Good' : 'Needs Improvement'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Retake Option */}
                                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">
                                                    Want to improve your score?
                                                </h4>
                                                <p className="text-gray-600 text-sm">
                                                    You can retake this quiz to try for a better score. 
                                                    Your best attempt will be considered for evaluation.
                                                </p>
                                            </div>
                                            <button
                                                onClick={onStartQuiz}
                                                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-medium ml-4"
                                                style={{ backgroundColor: colorCode }}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Retake Quiz
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}