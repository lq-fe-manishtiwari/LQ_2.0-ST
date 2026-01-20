'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FileText, Calendar, Award, TrendingUp, 
  CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentPlacementDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    interviews: 0,
    offers: 0,
    activeOpenings: 0
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setStats({
        appliedJobs: 5,
        interviews: 3,
        offers: 1,
        activeOpenings: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  const navigate = useNavigate();

  const recentActivity = [
    { id: 1, type: 'application', company: 'TCS', status: 'pending', date: '2 days ago' },
    { id: 2, type: 'interview', company: 'Infosys', status: 'scheduled', date: '5 days ago' },
    { id: 3, type: 'offer', company: 'Wipro', status: 'received', date: '1 week ago' }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Placement Portal</h1>
        <p className="text-gray-600 mt-1">Track your placement journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Job Openings</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.activeOpenings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.interviews}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offers Received</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.offers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => navigate('/student/placement/job-openings')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <Briefcase className="w-6 h-6 mb-2" />
          <p className="font-semibold">Browse Jobs</p>
        </button>

        <button
          onClick={() => navigate('/student/placement/my-registrations')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <FileText className="w-6 h-6 mb-2" />
          <p className="font-semibold">My Applications</p>
        </button>

        <button
          onClick={() => navigate('/student/placement/my-interviews')}
          className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <Calendar className="w-6 h-6 mb-2" />
          <p className="font-semibold">My Interviews</p>
        </button>

        <button
          onClick={() => navigate('/student/placement/my-offers')}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <Award className="w-6 h-6 mb-2" />
          <p className="font-semibold">My Offers</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                {activity.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                {activity.status === 'scheduled' && <Calendar className="w-5 h-5 text-blue-500" />}
                {activity.status === 'received' && <CheckCircle className="w-5 h-5 text-green-500" />}
                <div>
                  <p className="font-medium text-gray-900">{activity.company}</p>
                  <p className="text-sm text-gray-600 capitalize">{activity.type} - {activity.status}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
