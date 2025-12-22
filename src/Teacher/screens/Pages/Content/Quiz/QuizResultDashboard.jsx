import React, { useState, useEffect } from 'react';
import { contentQuizService } from '../services/contentQuiz.service.js';
import { X, BarChart3, Search, TrendingUp, Users, Award, Calendar, ChevronRight, Clock } from 'lucide-react';

export default function QuizResultDashboard({ filters }) {
    const [summaryData, setSummaryData] = useState({
        totalQuizzes: 0,
        totalSubmissions: 0,
        averageScore: 0,
        passRate: 0
    });
    const [quizResults, setQuizResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (filters.academicYear && filters.paper) {
                setLoading(true);
                try {
                    const response = await contentQuizService.getQuizDashboard(filters.academicYear, filters.paper);

                    if (response) {
                        setSummaryData({
                            totalQuizzes: response.total_quizzes || 0,
                            totalSubmissions: response.total_submissions || 0,
                            averageScore: response.average_score || 0,
                            passRate: response.pass_rate || 0
                        });

                        const mappedStats = (response.quiz_stats || []).map(stat => ({
                            quiz_id: stat.quiz_id,
                            quiz_name: stat.quiz_name,
                            total_submissions: stat.total_submissions,
                            average_score: stat.average_score,
                            pass_rate: stat.pass_rate,
                            highest_score: stat.highest_score,
                            lowest_score: stat.lowest_score,
                            module_name: stat.module_name,
                            unit_name: stat.unit_name,
                            created_date: new Date().toISOString()
                        }));
                        setQuizResults(mappedStats);
                    } else {
                        setQuizResults([]);
                    }
                } catch (error) {
                    console.error("Error fetching quiz dashboard:", error);
                    setQuizResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setSummaryData({
                    totalQuizzes: 0,
                    totalSubmissions: 0,
                    averageScore: 0,
                    passRate: 0
                });
                setQuizResults([]);
            }
        };

        fetchDashboardData();
    }, [filters.academicYear, filters.paper]);

    useEffect(() => {
        const fetchStudentResults = async () => {
            if (selectedQuiz && filters.academicYear) {
                setLoadingStudents(true);
                try {
                    const response = await contentQuizService.getQuizStudentResults(selectedQuiz.quiz_id, filters.academicYear);

                    const rawResults = response || [];

                    // Group by student_id and keep the best attempt + calculate average
                    const studentMap = rawResults.reduce((acc, current) => {
                        const sid = current.student_id;
                        if (!acc[sid]) {
                            acc[sid] = {
                                ...current,
                                attemptCount: 1,
                                totalScore: current.percentage_rate || current.score || 0,
                                bestScore: current.percentage_rate || current.score || 0
                            };
                        } else {
                            acc[sid].attemptCount += 1;
                            const score = current.percentage_rate || current.score || 0;
                            acc[sid].totalScore += score;
                            if (score > acc[sid].bestScore) {
                                acc[sid].bestScore = score;
                                acc[sid].attempt_date = current.attempt_date;
                                acc[sid].time_taken = current.time_taken;
                            }
                        }
                        return acc;
                    }, {});

                    const aggregatedResults = Object.values(studentMap).map(s => ({
                        studentId: s.student_id,
                        fullName: s.full_name || `${s.first_name} ${s.last_name}`,
                        rollNumber: s.roll_number,
                        bestScore: s.bestScore,
                        avgScore: (s.totalScore / s.attemptCount).toFixed(1),
                        totalMarks: s.total_marks,
                        timeTaken: s.time_taken,
                        attemptDate: s.attempt_date,
                        attemptCount: s.attemptCount
                    }));

                    setStudentResults(aggregatedResults);
                } catch (error) {
                    console.error("Error fetching student results:", error);
                    setStudentResults([]);
                } finally {
                    setLoadingStudents(false);
                }
            } else {
                setStudentResults([]);
            }
        };

        fetchStudentResults();
    }, [selectedQuiz, filters.academicYear]);

    const filteredQuizzes = Array.isArray(quizResults)
        ? quizResults.filter(quiz => quiz?.quiz_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const getPassRateColor = (rate) => {
        if (rate >= 80) return 'text-green-700 bg-green-50 border-green-200';
        if (rate >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        return 'text-red-700 bg-red-50 border-red-200';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                            <span className="truncate">Quiz Results</span>
                        </h2>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-100 h-24 rounded-lg border border-gray-200"></div>
                    ))}
                </div>
            ) : quizResults.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Quizzes</p>
                                <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">{summaryData.totalQuizzes}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 opacity-40 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm text-green-700 font-medium">Submissions</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">
                                    {summaryData.totalSubmissions}
                                </p>
                            </div>
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 opacity-40 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm text-purple-700 font-medium">Avg Score</p>
                                <p className="text-2xl sm:text-3xl font-bold text-purple-800 mt-1">
                                    {summaryData.averageScore.toFixed(1)}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 opacity-40 self-end sm:self-auto" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border border-orange-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm text-orange-700 font-medium">Pass Rate</p>
                                <p className="text-2xl sm:text-3xl font-bold text-orange-800 mt-1">
                                    {summaryData.passRate.toFixed(1)}%
                                </p>
                            </div>
                            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 opacity-40 self-end sm:self-auto" />
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Results Grid */}
            {
                loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-100 h-64 rounded-xl border-2 border-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <div
                                key={quiz.quiz_id}
                                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
                                onClick={() => setSelectedQuiz(quiz)}
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 text-white">
                                    <h3 className="font-bold text-base sm:text-lg line-clamp-2 mb-2">{quiz.quiz_name}</h3>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-50">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>{new Date(quiz.created_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                                    {/* Module & Unit */}
                                    <div className="flex flex-col gap-1 text-xs sm:text-sm">
                                        <span className="text-gray-500">Module: <span className="text-gray-700 font-medium">{quiz.module_name}</span></span>
                                        <span className="text-gray-500">Unit: <span className="text-gray-700 font-medium">{quiz.unit_name}</span></span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        {/* Total Submissions */}
                                        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                                <span className="text-xs text-blue-700 font-medium">Submissions</span>
                                            </div>
                                            <p className="text-xl sm:text-2xl font-bold text-blue-800">{quiz.total_submissions}</p>
                                        </div>

                                        {/* Average Score */}
                                        <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                <span className="text-xs text-green-700 font-medium">Avg Score</span>
                                            </div>
                                            <p className={`text-xl sm:text-2xl font-bold ${getScoreColor(quiz.average_score)}`}>
                                                {quiz.average_score.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pass Rate Badge */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Pass Rate</span>
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${getPassRateColor(quiz.pass_rate)}`}>
                                            {quiz.pass_rate.toFixed(1)}%
                                        </span>
                                    </div>

                                    {/* Score Range */}
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500">High:</span>
                                            <span className="font-bold text-green-600">{quiz.highest_score}%</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500">Low:</span>
                                            <span className="font-bold text-red-600">{quiz.lowest_score}%</span>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold hover:from-blue-600 hover:to-blue-700 transition-all group-hover:shadow-md">
                                        <span>View Details</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                        <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Quiz Results Found</h3>
                        <p className="text-sm sm:text-base text-gray-500">
                            {searchTerm
                                ? 'No quizzes match your search criteria.'
                                : 'Select filters to view quiz results or create a new quiz.'}
                        </p>
                    </div>
                )
            }

            {/* Quiz Details Modal */}
            {
                selectedQuiz && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white sticky top-0 z-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl sm:text-2xl font-bold mb-2">{selectedQuiz.quiz_name}</h3>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                                📊 {selectedQuiz.total_submissions} Submissions
                                            </span>
                                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                                ⭐ {selectedQuiz.average_score.toFixed(1)}% Avg Score
                                            </span>
                                            <span className="bg-white/20 px-3 py-1 rounded-full">
                                                ✅ {selectedQuiz.pass_rate.toFixed(1)}% Pass Rate
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedQuiz(null)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Student Results Table */}
                            <div className="p-4 sm:p-6">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">Student Performance</h4>

                                {loadingStudents ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-500">Loading student results...</p>
                                    </div>
                                ) : studentResults.length > 0 ? (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                        <th className="text-left p-3 font-semibold text-gray-700">Student Name</th>
                                                        <th className="text-left p-3 font-semibold text-gray-700">Roll No</th>
                                                        <th className="text-center p-3 font-semibold text-gray-700">Best Score</th>
                                                        <th className="text-center p-3 font-semibold text-gray-700">Avg Score</th>
                                                        <th className="text-center p-3 font-semibold text-gray-700">Attempts</th>
                                                        <th className="text-center p-3 font-semibold text-gray-700">Best Effort Time</th>
                                                        <th className="text-center p-3 font-semibold text-gray-700">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentResults.map((student) => (
                                                        <tr key={student.studentId} className="border-b border-gray-200 hover:bg-gray-50">
                                                            <td className="p-3 font-medium text-gray-800">{student.fullName}</td>
                                                            <td className="p-3 text-gray-600">{student.rollNumber || 'N/A'}</td>
                                                            <td className="p-3 text-center">
                                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                                                                    {student.attemptCount}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <span className={`font-bold ${getScoreColor(student.bestScore)}`}>{student.bestScore}%</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <span className={`font-bold ${getScoreColor(parseFloat(student.avgScore))}`}>{student.avgScore}%</span>
                                                            </td>
                                                            <td className="p-3 text-center text-gray-600">
                                                                {student.timeTaken ? `${Math.floor(student.timeTaken / 60)}m ${student.timeTaken % 60}s` : 'N/A'}
                                                            </td>
                                                            <td className="p-3 text-center text-gray-600">
                                                                {student.attemptDate ? new Date(student.attemptDate).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-3">
                                            {studentResults.map((student) => (
                                                <div key={student.studentId} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h5 className="font-bold text-gray-800">{student.fullName}</h5>
                                                            <p className="text-sm text-gray-500">Roll: {student.rollNumber || 'N/A'}</p>
                                                        </div>
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                                            {student.attemptCount} Attempts
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Best Score:</span>
                                                            <span className={`font-bold ml-1 ${getScoreColor(student.bestScore)}`}>{student.bestScore}%</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Avg Score:</span>
                                                            <span className={`font-bold ml-1 ${getScoreColor(parseFloat(student.avgScore))}`}>{student.avgScore}%</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Time:</span>
                                                            <span className="font-medium ml-1">
                                                                {student.timeTaken ? `${Math.floor(student.timeTaken / 60)}m` : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-500">Date:</span>
                                                            <span className="font-medium ml-1">
                                                                {student.attemptDate ? new Date(student.attemptDate).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <div className="text-4xl mb-4">🤷‍♂️</div>
                                        <h5 className="text-gray-600 font-medium">No student results found for this quiz.</h5>
                                    </div>
                                )}

                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedQuiz(null)}
                                    className="w-full mt-6 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
