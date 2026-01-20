'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, FileText, Calendar, Award, TrendingUp, 
  CheckCircle, Clock, AlertCircle, Users, Building2, Download, ChevronDown, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function StudentPlacementDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const stats = {
    activeOpenings: 12,
    appliedJobs: 5,
    interviews: 3,
    offers: 1,
    eligibilityRate: 75,
    avgPackage: 6.5
  };

  const applicationStatus = [
    { name: 'Applied', value: 5, color: '#3b82f6' },
    { name: 'Shortlisted', value: 3, color: '#10b981' },
    { name: 'Rejected', value: 2, color: '#ef4444' }
  ];

  const applicationTrend = [
    { month: 'Aug', applied: 1 },
    { month: 'Sep', applied: 2 },
    { month: 'Oct', applied: 3 },
    { month: 'Nov', applied: 4 },
    { month: 'Dec', applied: 5 }
  ];

  const interviewTrend = [
    { month: 'Aug', interviews: 0 },
    { month: 'Sep', interviews: 1 },
    { month: 'Oct', interviews: 1 },
    { month: 'Nov', interviews: 2 },
    { month: 'Dec', interviews: 3 }
  ];

  const offerTrend = [
    { month: 'Aug', offers: 0 },
    { month: 'Sep', offers: 0 },
    { month: 'Oct', offers: 0 },
    { month: 'Nov', offers: 1 },
    { month: 'Dec', offers: 1 }
  ];

  const packageRanges = [
    { range: '0-3 LPA', count: 2 },
    { range: '3-5 LPA', count: 4 },
    { range: '5-7 LPA', count: 3 },
    { range: '7-10 LPA', count: 2 },
    { range: '10+ LPA', count: 1 }
  ];

  const recentActivity = [
    { id: 1, text: 'Applied to TCS - Software Developer', time: '2 hours ago', type: 'info' },
    { id: 2, text: 'Interview scheduled with Infosys', time: '5 hours ago', type: 'success' },
    { id: 3, text: 'Offer received from Wipro', time: '1 day ago', type: 'success' }
  ];

  const topCompanies = [
    'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'HCL', 'Tech Mahindra', 
    'Capgemini', 'IBM', 'Oracle', 'SAP', 'Adobe'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.6s ease-out forwards'}}>
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Placement Dashboard</h1>
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
              Download Resume
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.1s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Openings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.activeOpenings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.2s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Applications</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.appliedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.3s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.interviews}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.4s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offers</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.offers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.5s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eligibility Rate</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.eligibilityRate}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transform transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.6s ease-out 0.6s forwards'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Package</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.avgPackage} LPA</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Package Distribution & Multiple Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {/* Package Distribution - Left Side */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.7s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={packageRanges}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="count" fill="#8b5cf6" name="Jobs Applied" radius={[8, 8, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Applied Jobs Trend - Right Side */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.8s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={applicationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="applied" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                name="Applications" 
                animationDuration={1500}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interview Trend - Right Side */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 0.9s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={interviewTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                cursor={{ stroke: '#f97316', strokeWidth: 1 }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="interviews" 
                stroke="#f97316" 
                strokeWidth={3} 
                name="Interviews" 
                animationDuration={1500}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row - Offer Trend & Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Offer Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 1s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={offerTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                cursor={{ stroke: '#10b981', strokeWidth: 1 }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="offers" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Offers" 
                animationDuration={1500}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 opacity-0" style={{animation: 'slideUp 0.8s ease-out 1.1s forwards'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={applicationStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {applicationStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>



      {/* Top Companies Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-0" style={{animation: 'slideUp 0.8s ease-out 1.1s forwards'}}>
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
    </div>
  );
}
