'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Briefcase, TrendingUp, Award, Building2, 
  UserCheck, UserX, Download, Calendar, ChevronDown, Bell 
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

// Custom Select Component
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400 min-h-[44px] flex items-center justify-between transition-all duration-150"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function PlacementDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024-25');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Mock data - replace with API calls
  const stats = {
    totalStudents: 450,
    placedStudents: 320,
    activeCompanies: 45,
    avgPackage: 6.5,
    highestPackage: 18,
    placementRate: 71.1
  };

  const departmentData = [
    { name: 'CSE', students: 120, placed: 95, companies: 25 },
    { name: 'ECE', students: 100, placed: 75, companies: 18 },
    { name: 'MECH', students: 90, placed: 60, companies: 15 },
    { name: 'CIVIL', students: 80, placed: 50, companies: 12 },
    { name: 'EEE', students: 60, placed: 40, companies: 10 }
  ];

  const placementTrend = [
    { month: 'Aug', placed: 20 },
    { month: 'Sep', placed: 45 },
    { month: 'Oct', placed: 80 },
    { month: 'Nov', placed: 120 },
    { month: 'Dec', placed: 180 },
    { month: 'Jan', placed: 240 },
    { month: 'Feb', placed: 290 },
    { month: 'Mar', placed: 320 }
  ];

  const statusData = [
    { name: 'Placed', value: 320, color: '#10b981' },
    { name: 'In Process', value: 80, color: '#3b82f6' },
    { name: 'Not Placed', value: 50, color: '#ef4444' }
  ];

  const topStudents = [
    { name: 'Rajesh Kumar', package: '18 LPA', company: 'Google', avatar: 'RK' },
    { name: 'Priya Sharma', package: '16 LPA', company: 'Microsoft', avatar: 'PS' },
    { name: 'Amit Patel', package: '15 LPA', company: 'Amazon', avatar: 'AP' }
  ];

  const topCompanies = [
    'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'HCL', 'Tech Mahindra', 
    'Capgemini', 'IBM', 'Oracle', 'SAP', 'Adobe', 'Salesforce', 'VMware'
  ];

  const packageDistribution = [
    { range: '0-3 LPA', count: 80 },
    { range: '3-5 LPA', count: 120 },
    { range: '5-7 LPA', count: 70 },
    { range: '7-10 LPA', count: 35 },
    { range: '10+ LPA', count: 15 }
  ];

  const notifications = [
    { id: 1, text: 'Google scheduled interview for 15 students', time: '2 hours ago', type: 'info' },
    { id: 2, text: '25 new registrations for TCS drive', time: '5 hours ago', type: 'success' },
    { id: 3, text: 'Microsoft placement drive on 25th Jan', time: '1 day ago', type: 'warning' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.6s ease-out forwards'}}>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Placement Dashboard</h1>
            <p className="text-gray-600 mt-1">Academic Year {selectedYear}</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 w-full lg:justify-end">
            <div className="w-full lg:w-auto lg:min-w-[200px]">
              <CustomSelect
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={['2024-25', '2023-24', '2022-23']}
                placeholder="Select Year"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg w-full lg:w-auto">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.1s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.2s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Placed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.placedStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.3s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.activeCompanies}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.4s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Package</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.avgPackage} LPA</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.5s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Package</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.highestPackage} LPA</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.6s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Placement Rate</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.placementRate}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Department-wise Placement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.7s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department-wise Placement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" name="Total Students" animationDuration={1000} />
              <Bar dataKey="placed" fill="#10b981" name="Placed" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Placement Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.8s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Placement Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.8s forwards'}}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-3 max-h-[268px] overflow-y-auto">
            {notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  notif.type === 'success' ? 'bg-green-500' : 
                  notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notif.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Placement Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.9s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Placement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={placementTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="placed" stroke="#10b981" strokeWidth={2} name="Students Placed" animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Package Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 1s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={packageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Students" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Students Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-0 mb-6" style={{animation: 'slideUp 0.8s ease-out 1.1s forwards'}}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Highest Package Students</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topStudents.map((student, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.company}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                  <span className="text-sm text-gray-600 font-medium">Package</span>
                  <span className="text-2xl font-bold text-green-600">{student.package}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-0" style={{animation: 'slideUp 0.8s ease-out 1.2s forwards'}}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Recruiting Companies</h3>
        </div>
        <div className="relative overflow-hidden py-6">
          <div className="flex animate-scroll">
            {[...topCompanies, ...topCompanies].map((company, index) => (
              <div key={index} className="flex-shrink-0 mx-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg px-8 py-4 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">{company}</p>
                </div>
              </div>
            ))}
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
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
