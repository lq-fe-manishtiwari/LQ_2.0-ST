import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StudentExamDashboard = () => {

  const examStatusData = [
    { name: 'Form Filled', value: 1, color: '#3b82f6' },
    { name: 'Result Declared', value: 1, color: '#10b981' },
    { name: 'Revaluation', value: 1, color: '#f59e0b' },
    { name: 'ATKT', value: 1, color: '#ef4444' },
  ];

  const subjectResultData = [
    { subject: 'Mathematics', percentage: 78 },
    { subject: 'Physics', percentage: 42 },
    { subject: 'Chemistry', percentage: 65 },
    { subject: 'Computer Science', percentage: 81 },
    { subject: 'Electronics', percentage: 55 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Exam Dashboard</h1>
        <p className="text-gray-600 mb-8">View your subject-wise performance and exam status</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card title="Overall %" value="64%" color="blue" />
          <Card title="Passed Subjects" value="3 / 5" color="green" />
          <Card title="ATKT Subjects" value="1" color="red" />
          <Card title="Revaluation" value="1" color="yellow" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Exam Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={examStatusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name }) => name}
                >
                  {examStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Subject-wise Percentage */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Subject-wise Percentage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectResultData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500`}>
    <p className="text-gray-600 text-lg">{title}</p>
    <p className={`text-4xl font-bold text-${color}-600 mt-2`}>{value}</p>
  </div>
);

export default StudentExamDashboard;
