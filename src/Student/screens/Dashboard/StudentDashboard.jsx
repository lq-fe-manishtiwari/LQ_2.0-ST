import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  Bell,
  Calendar,
  Settings,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  BookMarked,
  ArrowRight,
  Target,
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import { authenticationService } from '@/_services/api';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    profile,
    loading: profileLoading,
    getFullName,
    fetchProfile,
    isLoaded
  } = useUserProfile();

  useEffect(() => {
    const currentUser = authenticationService.currentUser();
    setUser(currentUser);

    if (!isLoaded && !profileLoading) {
      fetchProfile();
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [isLoaded, profileLoading, fetchProfile]);

  const dashboardStats = [
    { title: 'Course Attendance', value: '0%', label: 'Current Semester', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Learning Hours', value: '0.0', label: 'This Week', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Assessments', value: '0', label: 'Pending Tasks', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Academic Rank', value: '--', label: 'Global Rank', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const upcomingActivities = [
    { time: '00:00 AM', title: 'Upcoming Lesson Name', venue: 'Scheduled Location', category: 'Lecture', status: 'Upcoming' },
    { time: '00:00 AM', title: 'Subject Activity Title', venue: 'Assigned Lab/Room', category: 'Practical', status: 'Pending' },
  ];

  const courseProgress = [
    { name: 'Enrolled Course A', percentage: 0, color: 'bg-blue-500' },
    { name: 'Enrolled Course B', percentage: 0, color: 'bg-indigo-500' },
    { name: 'Enrolled Course C', percentage: 0, color: 'bg-emerald-500' },
  ];

  const latestUpdates = [
    { message: 'New academic notification will appear here', date: 'Just now' },
    { message: 'General announcement regarding campus/classes', date: 'Today' },
  ];

  const shortcuts = [
    { name: 'Academics', icon: BookOpen, path: '/academics', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Time Table', icon: Calendar, path: '/timetable', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Resources', icon: BookMarked, path: '/library', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Settings', icon: Settings, path: '/settings', color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {profileLoading ? 'Loading Dashboard...' : `Welcome, ${getFullName() || user?.sub || 'Student'}!`}
            </h1>
            <p className="text-slate-500 font-medium">
              Explore your academic summary and daily highlights.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Current Date</p>
              <span className="text-sm font-bold text-slate-700">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </section>

        {/* Generic Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboardStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-5">
                <div className={`${stat.bg} p-3.5 rounded-2xl transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <p className="text-sm font-bold text-slate-500">{stat.title}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {stat.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Activities Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">Learning Timeline</h2>
                </div>
                <button className="text-sm font-bold text-blue-600 hover:underline">Full Schedule</button>
              </div>
              <div className="divide-y divide-slate-50">
                {upcomingActivities.map((act, idx) => (
                  <div key={idx} className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-default">
                    <div className="flex items-start gap-5">
                      <div className="flex flex-col items-center justify-center min-w-[80px] py-2 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{act.time.split(' ')[1]}</span>
                        <span className="text-sm font-black text-slate-700">{act.time.split(' ')[0]}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800">{act.title}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <Target className="w-3 h-3" /> {act.venue}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">
                            {act.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="px-4 py-2 bg-slate-50 text-slate-400 text-xs font-black rounded-xl uppercase tracking-widest border border-slate-100">
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress & Shortcuts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Course Progress Card */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h2 className="text-lg font-bold text-slate-800">Academic Progress</h2>
                </div>
                <div className="space-y-6">
                  {courseProgress.map((course, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-2.5">
                        <span className="text-sm font-bold text-slate-600">{course.name}</span>
                        <span className="text-xs font-black text-slate-300">{course.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${course.color} opacity-20`}
                          style={{ width: `100%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 text-center">
                    <p className="text-xs font-medium text-slate-400">Progress data will populate as you complete modules.</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-[#1E293B] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-white mb-2">Student Hub</h2>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">Quickly jump to your desired section.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {shortcuts.map((item, idx) => (
                      <Link to={item.path} key={idx} className="group flex flex-col items-center p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-3xl transition-all border border-white/5">
                        <div className={`p-3 rounded-2xl ${item.bg} mb-3 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Updates Feed */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-slate-800">Latest Updates</h2>
                </div>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-6">
                {latestUpdates.map((update, idx) => (
                  <div key={idx} className="flex gap-5 group cursor-default">
                    <div className="flex-shrink-0 w-1 rounded-full bg-slate-100 group-hover:bg-blue-500 transition-colors"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed mb-1 group-hover:text-blue-600 transition-colors">
                        {update.message}
                      </p>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        {update.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full py-4 bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                View All Notifications <ArrowRight className="w-4 h-4" />
              </button>
            </div>



          </div>

        </div>



      </main>
    </div>
  );
};

export default StudentDashboard;