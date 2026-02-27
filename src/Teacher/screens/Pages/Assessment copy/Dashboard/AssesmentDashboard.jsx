import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  ClipboardList,
  CheckCircle,
  BookOpen,
  Bell,
  Users,
  User,
  Download
} from 'lucide-react';
import { AssessmentService } from '../Services/assessment.service';
import { useAssessmentFormLogic } from '../../Assessment/hooks/useAssessmentFormLogic';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AssessmentDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('This Month');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege")) || {};
  const collegeId = activeCollege?.id || activeCollege?.college_id;

  const { getTeacherId } = useUserProfile();

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Use teacher-allocated programs via the hook (same as Assessment.jsx / AddCO.jsx)
  const formData = useMemo(() => ({
    selectedProgram: selectedProgram,
    selectedAcademicSemester: '',
    selectedBatch: '',
    selectedSubject: ''
  }), [selectedProgram]);

  const { options } = useAssessmentFormLogic(formData);
  const programs = options.programs; // [{label, value, full}]

  // Auto-select first program once loaded
  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].value);
    }
  }, [programs]);

  useEffect(() => {
    if (collegeId && selectedProgram) {
      fetchDashboardData();
    }
  }, [collegeId, selectedProgram, selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      const payload = {
        "college_id": Number(collegeId),
        "program_id": Number(selectedProgram),
        "month": selectedDate.getMonth() + 1,
        "year": selectedDate.getFullYear(),
        ...(teacherId ? { "subject_teacher_id": Number(teacherId) } : {})
      };

      const response = await AssessmentService.getDashboardStats(payload);
      if (response) {
        setDashboardData(response);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Transform API data for UI
  const getProgressData = () => {
    if (!dashboardData?.overall_stats) return [];
    const stats = dashboardData.overall_stats;
    return [
      { name: 'Given', value: stats.total_assessments || 0, fill: '#3b82f6' },
      { name: 'Submitted', value: stats.total_submissions || 0, fill: '#16a34a' },
      { name: 'Evaluated', value: stats.total_evaluated || 0, fill: '#f97316' },
      { name: 'Pending', value: stats.evaluation_pending || 0, fill: '#ef4444' },
    ];
  };

  const getSubjectData = () => {
    if (!dashboardData?.subjects) return [];
    return dashboardData.subjects.map(sub => {
      const total = sub.total_assessments || 0;
      const completed = sub.complete || 0;
      const pending = sub.pending || 0;

      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        subject: sub.subject_name,
        total: total,
        completed: completed,
        pending: pending, // Mapping API 'pending' to UI 'pending'
        notSub: total - completed - pending, // Inferring not submitted
        pct: pct,
        color: '#3b82f6', // Default color
        trend: 'up' // Default trend
      };
    });
  };

  const getClassData = () => {
    if (!dashboardData?.classes) return [];
    return dashboardData.classes.map(cls => ({
      name: cls.batch_name,
      total: cls.total_assessments,
      completed: cls.complete,
      pct: Math.round(cls.completed_percentage || 0),
      pending: cls.pending,
      notSub: cls.total_assessments - cls.complete - cls.pending,
      grade: cls.completed_percentage >= 80 ? 'A' : cls.completed_percentage >= 60 ? 'B' : 'C' // Simple grading logic
    }));
  };

  const getWeeklyTrendStr = () => {
    if (!dashboardData?.weekly_submission_trend) return [];
    return dashboardData.weekly_submission_trend.map(item => ({
      week: item.week,
      submitted: item.total_submitted,
      evaluated: item.total_evaluated
    }))
  }

  const getPendingSubjects = () => {
    if (!dashboardData?.subjects) return [];
    return dashboardData.subjects.map(sub => {
      const priority = sub.pending > 5 ? 'high' : sub.pending > 2 ? 'medium' : 'low';
      return {
        name: sub.subject_name,
        value: sub.pending,
        max: sub.total_assessments,
        priority: priority
      };
    }).filter(item => item.value >= 0);
  };

  const progressData = getProgressData();
  const subjectData = getSubjectData();
  const classData = getClassData();
  const weeklyTrend = getWeeklyTrendStr();
  const pendingSubjectsData = getPendingSubjects();


  const Card = ({ title, icon: Icon, children, className = '', action }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon className="text-blue-600 w-5 h-5" />
            </div>
          )}
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
        {action && action}
      </div>
      {children}
    </div>
  );

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      orange: 'bg-amber-50 text-amber-600 border-amber-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className={`${colorClasses[color]} rounded-xl p-4 border-2 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-5 h-5" />
          {/* <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            change?.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {change}
          </span> */}
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm font-medium opacity-80">{title}</div>
      </div>
    );
  };

  const PendingRow = ({ label, value, maxPct, priority }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return '#ef4444';
        case 'medium': return '#f97316';
        case 'low': return '#22c55e';
        default: return '#64748b';
      }
    };

    const barColor = getPriorityColor(priority);

    return (
      <div className="flex items-center justify-between py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 group">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: barColor }}
          ></div>
          <span className="text-sm font-semibold text-slate-700 min-w-[80px]">{label}</span>
        </div>
        <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-out rounded-full"
            style={{
              width: `${maxPct}%`,
              backgroundColor: barColor,
            }}
          ></div>
        </div>
        <div className="text-right min-w-[60px]">
          <span className="text-sm font-bold text-slate-800">{value}</span>
          <span className="text-xs text-slate-500 ml-1">({maxPct}%)</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Dashboard</h1>
            <p className="text-slate-600">Monitor and track assessment progress across all classes</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {programs.length > 0 && (
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
              >
                {programs.map((prog) => (
                  <option key={prog.value} value={prog.value}>
                    {prog.label}
                  </option>
                ))}
              </select>
            )}
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-[140px]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {progressData.map((item, idx) => (
            <StatCard
              key={idx}
              title={item.name}
              value={item.value}
              //   change={item.change}
              icon={idx === 0 ? ClipboardList : idx === 1 ? CheckCircle : idx === 2 ? TrendingUp : Bell}
              color={idx === 0 ? 'blue' : idx === 1 ? 'green' : idx === 2 ? 'orange' : 'red'}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card title="Assignment Progress Overview" icon={TrendingUp}>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: '14px', fontWeight: 'bold', fill: '#334155' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Weekly Submission Trend" icon={TrendingUp}>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="evaluated" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Class-wise Performance" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classData.map((cls, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${cls.pct >= 80 ? 'bg-emerald-500' : cls.pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                      <h4 className="font-bold text-slate-800">{cls.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${cls.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : cls.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        Grade {cls.grade}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-emerald-700 font-semibold">{cls.completed} Completed</span>
                      <span className="text-blue-600 font-bold">{cls.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${cls.pct}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 pt-3 border-t border-slate-200">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      {cls.pending} Pending
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      {cls.notSub} Not Submitted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Pending Assignments by Priority" icon={ClipboardList}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Low</span>
                </div>
              </div>
              <span className="text-xl font-bold text-amber-600">Total: {pendingSubjectsData.length}</span>
            </div>
            <div className="space-y-3">
              {pendingSubjectsData.map((sub, idx) => (
                <PendingRow key={idx} label={sub.name} value={sub.value} maxPct={sub.max} priority={sub.priority} />
              ))}
            </div>
          </Card>

          <Card title="Subject-wise Performance" icon={BookOpen}>
            <div className="grid grid-cols-1 gap-6">
              {subjectData.map((sub, idx) => (
                <div key={idx} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }}></div>
                      <span className="font-bold text-slate-800 break-words line-clamp-2">{sub.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TrendingUp className={`w-4 h-4 ${sub.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-semibold">{sub.total} Total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ value: sub.pct }, { value: 100 - sub.pct }]} innerRadius={28} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value">
                            <Cell fill={sub.color} />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">{sub.pct}%</div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Completed</span>
                        <span className="text-sm font-bold text-emerald-600">{sub.completed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Pending</span>
                        <span className="text-sm font-bold text-amber-600">{sub.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Not Submitted</span>
                        <span className="text-sm font-bold text-red-600">{sub.notSub}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${sub.pct}%`, backgroundColor: sub.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>



          {/* <Card title="Action Items & Alerts" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-red-800">High Priority Overdue</span>
                  <p className="text-xs text-red-600 mt-1">12 assignments pending evaluation</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1 bg-white rounded-lg">Review</button>
              </div>
              <div className="flex items-center justify-between p-4 border-l-4 border-amber-500 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-amber-800">Parent Communication</span>
                  <p className="text-xs text-amber-600 mt-1">5 students require follow-up</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1 bg-white rounded-lg">Contact</button>
              </div>
              <div className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-blue-800">Weekly Report</span>
                  <p className="text-xs text-blue-600 mt-1">Generate progress summary</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1 bg-white rounded-lg">Generate</button>
              </div>
            </div>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;