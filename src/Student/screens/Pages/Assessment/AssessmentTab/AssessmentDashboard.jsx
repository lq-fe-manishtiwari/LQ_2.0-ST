import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    LayoutDashboard, TrendingUp, CheckCircle2, Clock, AlertCircle,
    BookOpen, Award, BarChart3, Calendar
} from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { assessmentService } from '../Services/assessment.service';
import { StudentService } from '../../Profile/Student.Service';

const AssessmentDashboard = () => {
    const { profile } = useUserProfile();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        upcoming: 0,
        averageScore: 0,
        subjectPerformance: [],
        statusData: [],
        monthlyTrend: []
    });

    useEffect(() => {
        if (profile?.student_id) {
            loadDashboardData();
        }
    }, [profile]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const history = await StudentService.getStudentHistoryWithoutactive(profile.student_id);
            const activeSession = history?.find(h => h.active || h.is_active);

            if (activeSession) {
                const payload = {
                    academic_year_id: activeSession.academic_year?.academic_year_id || activeSession.academic_year_id,
                    semester_id: activeSession.semester?.semester_id || activeSession.semester_id,
                    division_id: activeSession.division?.division_id || activeSession.division_id,
                    current: "true"
                };

                const response = await assessmentService.getStudentAssessments([payload], profile.student_id);

                if (response && Array.isArray(response)) {
                    processStats(response);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processStats = (data) => {
        const total = data.length;
        let completed = 0;
        let pending = 0;
        let upcoming = 0;
        let totalScoreTotal = 0;
        let scoredCount = 0;

        const subjectScores = {};
        const monthScores = {};
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        data.forEach(item => {
            const status = item.submission_status || (item.test_start_datetime && new Date(item.test_start_datetime) > now ? 'Upcoming' : 'Not Attempted');

            if (status === 'SUBMITTED' || status === 'COMPLETED') completed++;
            else if (status === 'Upcoming') upcoming++;
            else pending++;

            if (item.score !== undefined && item.max_marks && item.max_marks > 0) {
                const percentage = Math.round((item.score / item.max_marks) * 100);
                totalScoreTotal += percentage;
                scoredCount++;

                // Subject breakdown
                const subj = item.subject_name || 'General';
                if (!subjectScores[subj]) subjectScores[subj] = { total: 0, count: 0 };
                subjectScores[subj].total += percentage;
                subjectScores[subj].count++;

                // Monthly breakdown
                const date = item.test_start_datetime ? new Date(item.test_start_datetime) : now;
                const month = months[date.getMonth()];
                if (!monthScores[month]) monthScores[month] = { total: 0, count: 0, monthIdx: date.getMonth() };
                monthScores[month].total += percentage;
                monthScores[month].count++;
            }
        });

        // Subject breakdown for Bar Chart
        const subjectPerformance = Object.entries(subjectScores).map(([name, d]) => ({
            name,
            score: Math.round(d.total / d.count)
        }));

        // Monthly trend for Line Chart
        const monthlyTrend = Object.entries(monthScores)
            .sort((a, b) => a[1].monthIdx - b[1].monthIdx)
            .map(([name, d]) => ({
                name,
                score: Math.round(d.total / d.count)
            }));

        // Status breakdown for Pie Chart
        const statusData = [
            { name: 'Completed', value: completed, color: '#10B981' },
            { name: 'Pending', value: pending, color: '#F59E0B' },
            { name: 'Upcoming', value: upcoming, color: '#3B82F6' }
        ].filter(d => d.value > 0);

        setStats({
            total,
            completed,
            pending,
            upcoming,
            averageScore: scoredCount > 0 ? Math.round(totalScoreTotal / scoredCount) : 0,
            subjectPerformance,
            statusData,
            monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [{ name: months[now.getMonth()], score: 0 }]
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Analyzing your performance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-1 sm:p-2 space-y-6 bg-slate-50/50 rounded-xl">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Assessments"
                    value={stats.total}
                    icon={<BookOpen className="w-5 h-5 text-blue-600" />}
                    bgColor="bg-blue-50"
                    borderColor="border-blue-100"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    bgColor="bg-emerald-50"
                    borderColor="border-emerald-100"
                />
                <StatCard
                    title="Avg. Performance"
                    value={`${stats.averageScore}%`}
                    icon={<Award className="w-5 h-5 text-purple-600" />}
                    bgColor="bg-purple-50"
                    borderColor="border-purple-100"
                />
                <StatCard
                    title="Pending Action"
                    value={stats.pending}
                    icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
                    bgColor="bg-amber-50"
                    borderColor="border-amber-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Wise Performance - Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900">Subject-wise Performance (%)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.subjectPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11 }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="score"
                                    fill="#3B82F6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Trend - Area Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-900">Monthly Performance View</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11 }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Breakdown - Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                        <LayoutDashboard className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900">Assessment Status</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <div className="h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            {stats.statusData.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                        <span className="text-sm font-bold text-slate-600">{entry.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Overall Summary Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Keep it up! 🚀</h3>
                        <p className="text-blue-100 mb-6 text-sm leading-relaxed max-w-xs">
                            You've completed {stats.completed} assessments so far with an average score of {stats.averageScore}%.
                            Check your pending tasks to stay on track.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex-1 border border-white/10">
                                <p className="text-[10px] uppercase font-black text-blue-200 mb-1">Success Rate</p>
                                <p className="text-2xl font-black">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex-1 border border-white/10">
                                <p className="text-[10px] uppercase font-black text-blue-200 mb-1">Current Ranking</p>
                                <p className="text-2xl font-black">Top 15%</p>
                            </div>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bgColor, borderColor }) => (
    <div className={`p-5 rounded-2xl bg-white border ${borderColor} shadow-sm hover:shadow-md transition-all group`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
                <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{value}</h4>
            </div>
            <div className={`p-2.5 ${bgColor} rounded-xl shadow-sm`}>{icon}</div>
        </div>
    </div>
);

export default AssessmentDashboard;
