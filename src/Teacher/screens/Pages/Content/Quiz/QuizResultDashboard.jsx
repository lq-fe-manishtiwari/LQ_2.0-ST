import React, { useState, useEffect } from 'react';
import { BarChart3, Search, TrendingUp, Users, Award, Calendar, ChevronRight } from 'lucide-react';

export default function QuizResultDashboard({ filters, modules }) {
    const [quizResults, setQuizResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    // Mock data for demonstration - Replace with actual API call
    const mockQuizResults = [
        {
            quiz_id: 1,
            quiz_name: 'Introduction to React Basics',
            total_submissions: 45,
            average_score: 78.5,
            pass_rate: 82.2,
            highest_score: 98,
            lowest_score: 42,
            created_date: '2024-01-15',
            module_name: 'React Fundamentals',
            unit_name: 'Getting Started'
        },
        {
            quiz_id: 2,
            quiz_name: 'JavaScript ES6 Features',
            total_submissions: 38,
            average_score: 72.3,
            pass_rate: 76.3,
            highest_score: 95,
            lowest_score: 38,
            created_date: '2024-01-18',
            module_name: 'JavaScript Advanced',
            unit_name: 'Modern JavaScript'
        },
        {
            quiz_id: 3,
            quiz_name: 'State Management with Redux',
            total_submissions: 52,
            average_score: 85.7,
            pass_rate: 90.4,
            highest_score: 100,
            lowest_score: 55,
            created_date: '2024-01-20',
            module_name: 'React Fundamentals',
            unit_name: 'Advanced Concepts'
        }
    ];

    useEffect(() => {
        // TODO: Replace with actual API call
        // fetchQuizResults();
        setQuizResults(mockQuizResults);
    }, [filters]);

    const filteredQuizzes = quizResults.filter(quiz =>
        quiz.quiz_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                            <span className="truncate">Quiz Results Dashboard</span>
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">View and analyze quiz performance</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                        />
                    </div>

                    {/* Active Filters Display */}
                    {(filters?.program || filters?.batch || filters?.academicYear || filters?.semester || filters?.paper || filters?.module) && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                            {filters.program && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                    Program: {filters.program}
                                </span>
                            )}
                            {filters.batch && (
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                                    Batch: {filters.batch}
                                </span>
                            )}
                            {filters.academicYear && (
                                <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-200">
                                    Academic Year: {filters.academicYear}
                                </span>
                            )}
                            {filters.semester && (
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                                    Semester: {filters.semester}
                                </span>
                            )}
                            {filters.paper && (
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                    Paper: {filters.paper}
                                </span>
                            )}
                            {filters.module && (
                                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">
                                    Module: {filters.module}
                                </span>
                            )}
                            {filters.unit && (
                                <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium border border-pink-200">
                                    Unit: {filters.unit}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {quizResults.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-blue-700 font-medium">Total Quizzes</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">{quizResults.length}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 opacity-40 self-end sm:self-auto" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-green-700 font-medium">Submissions</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">
                                        {quizResults.reduce((sum, q) => sum + q.total_submissions, 0)}
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
                                        {(quizResults.reduce((sum, q) => sum + q.average_score, 0) / quizResults.length).toFixed(1)}%
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
                                        {(quizResults.reduce((sum, q) => sum + q.pass_rate, 0) / quizResults.length).toFixed(1)}%
                                    </p>
                                </div>
                                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 opacity-40 self-end sm:self-auto" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quiz Results Grid */}
            {filteredQuizzes.length > 0 ? (
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
            )}

            {/* Quiz Details Modal */}
            {selectedQuiz && (
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
                                    <ChevronRight className="w-6 h-6 rotate-90" />
                                </button>
                            </div>
                        </div>

                        {/* Student Results Table */}
                        <div className="p-4 sm:p-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Student Performance</h4>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="text-left p-3 font-semibold text-gray-700">Student Name</th>
                                            <th className="text-left p-3 font-semibold text-gray-700">Roll No</th>
                                            <th className="text-center p-3 font-semibold text-gray-700">Score</th>
                                            <th className="text-center p-3 font-semibold text-gray-700">Time Taken</th>
                                            <th className="text-center p-3 font-semibold text-gray-700">Date</th>
                                            <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Dummy Student Data */}
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">Rahul Sharma</td>
                                            <td className="p-3 text-gray-600">CS001</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-green-600">92%</span>
                                                <span className="text-sm text-gray-500 ml-1">(46/50)</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">12 min</td>
                                            <td className="p-3 text-center text-gray-600">Dec 18, 2024</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                    ✅ Pass
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">Priya Patel</td>
                                            <td className="p-3 text-gray-600">CS002</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-green-600">88%</span>
                                                <span className="text-sm text-gray-500 ml-1">(44/50)</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">15 min</td>
                                            <td className="p-3 text-center text-gray-600">Dec 18, 2024</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                    ✅ Pass
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">Amit Kumar</td>
                                            <td className="p-3 text-gray-600">CS003</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-yellow-600">72%</span>
                                                <span className="text-sm text-gray-500 ml-1">(36/50)</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">18 min</td>
                                            <td className="p-3 text-center text-gray-600">Dec 19, 2024</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                                    ⚠️ Pass
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">Sneha Reddy</td>
                                            <td className="p-3 text-gray-600">CS004</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-green-600">95%</span>
                                                <span className="text-sm text-gray-500 ml-1">(47.5/50)</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">10 min</td>
                                            <td className="p-3 text-center text-gray-600">Dec 19, 2024</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                    ✅ Pass
                                                </span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">Vikram Singh</td>
                                            <td className="p-3 text-gray-600">CS005</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-red-600">45%</span>
                                                <span className="text-sm text-gray-500 ml-1">(22.5/50)</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-600">20 min</td>
                                            <td className="p-3 text-center text-gray-600">Dec 19, 2024</td>
                                            <td className="p-3 text-center">
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                    ❌ Fail
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {/* Student Card 1 */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-gray-800">Rahul Sharma</h5>
                                            <p className="text-sm text-gray-500">Roll: CS001</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            ✅ Pass
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Score:</span>
                                            <span className="font-bold text-green-600 ml-1">92% (46/50)</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-medium ml-1">12 min</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium ml-1">Dec 18, 2024</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Card 2 */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-gray-800">Priya Patel</h5>
                                            <p className="text-sm text-gray-500">Roll: CS002</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            ✅ Pass
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Score:</span>
                                            <span className="font-bold text-green-600 ml-1">88% (44/50)</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-medium ml-1">15 min</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium ml-1">Dec 18, 2024</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Card 3 */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-gray-800">Amit Kumar</h5>
                                            <p className="text-sm text-gray-500">Roll: CS003</p>
                                        </div>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                            ⚠️ Pass
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Score:</span>
                                            <span className="font-bold text-yellow-600 ml-1">72% (36/50)</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-medium ml-1">18 min</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium ml-1">Dec 19, 2024</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Card 4 */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-gray-800">Sneha Reddy</h5>
                                            <p className="text-sm text-gray-500">Roll: CS004</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            ✅ Pass
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Score:</span>
                                            <span className="font-bold text-green-600 ml-1">95% (47.5/50)</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-medium ml-1">10 min</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium ml-1">Dec 19, 2024</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Card 5 */}
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h5 className="font-bold text-gray-800">Vikram Singh</h5>
                                            <p className="text-sm text-gray-500">Roll: CS005</p>
                                        </div>
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                            ❌ Fail
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Score:</span>
                                            <span className="font-bold text-red-600 ml-1">45% (22.5/50)</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time:</span>
                                            <span className="font-medium ml-1">20 min</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="font-medium ml-1">Dec 19, 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Note */}
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This is sample data for demonstration. Actual student results will be fetched from the API once backend integration is complete.
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedQuiz(null)}
                                className="w-full mt-4 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-colors"
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
