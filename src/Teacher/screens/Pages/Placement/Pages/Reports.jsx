'use client';

import React, { useState } from 'react';
import { Download, FileText, Users, Building2, TrendingUp, Calendar } from 'lucide-react';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const reportTypes = [
    {
      id: 'department-wise',
      title: 'Department-wise Placement Report',
      description: 'Registered companies, total companies, positions by department',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'company-wise',
      title: 'Company-wise Hiring Report',
      description: 'Students hired, positions, packages by company',
      icon: Building2,
      color: 'purple'
    },
    {
      id: 'student-status',
      title: 'Student Placement Status',
      description: 'Placed, unplaced, opted-out students',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'package-analysis',
      title: 'Package Analysis Report',
      description: 'Highest, lowest, average package analysis',
      icon: FileText,
      color: 'orange'
    },
    {
      id: 'timeline',
      title: 'Placement Timeline Report',
      description: 'Month-wise placement progress',
      icon: Calendar,
      color: 'red'
    }
  ];

  // Mock data for reports
  const departmentData = [
    { department: 'Computer Science', total_students: 120, registered: 115, companies: 25, placed: 95, percentage: '79%' },
    { department: 'Information Technology', total_students: 100, registered: 98, companies: 22, placed: 85, percentage: '85%' },
    { department: 'Electronics', total_students: 80, registered: 75, companies: 18, placed: 60, percentage: '75%' },
    { department: 'Mechanical', total_students: 90, registered: 85, companies: 15, placed: 65, percentage: '72%' }
  ];

  const companyData = [
    { company: 'TCS', students_hired: 45, positions: 'Developer, Analyst', avg_package: '4.5 LPA', highest: '7 LPA' },
    { company: 'Infosys', students_hired: 38, positions: 'System Engineer', avg_package: '5 LPA', highest: '8 LPA' },
    { company: 'Wipro', students_hired: 32, positions: 'Developer', avg_package: '4.8 LPA', highest: '7.5 LPA' },
    { company: 'Cognizant', students_hired: 28, positions: 'Associate', avg_package: '4.2 LPA', highest: '6 LPA' }
  ];

  const studentStatusData = [
    { status: 'Placed', count: 305, percentage: '76%', color: 'green' },
    { status: 'Unplaced', count: 75, percentage: '19%', color: 'red' },
    { status: 'Opted Out', count: 20, percentage: '5%', color: 'gray' }
  ];

  const handleExport = (format) => {
    alert(`Exporting ${selectedReport} as ${format}`);
  };

  const renderReportData = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case 'department-wise':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Total Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Companies</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Placed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Placement %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentData.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dept.total_students}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dept.registered}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dept.companies}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">{dept.placed}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{dept.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'company-wise':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Students Hired</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Positions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Avg Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase">Highest Package</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companyData.map((company, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.students_hired}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{company.positions}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">{company.avg_package}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{company.highest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'student-status':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {studentStatusData.map((item, idx) => (
              <div key={idx} className={'bg-white rounded-xl shadow-sm border-2 border-' + item.color + '-200 p-6'}>
                <div className={'w-16 h-16 rounded-full bg-' + item.color + '-100 flex items-center justify-center mb-4 mx-auto'}>
                  <span className={'text-2xl font-bold text-' + item.color + '-600'}>{item.count}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{item.status}</h3>
                <p className={'text-3xl font-bold text-' + item.color + '-600 text-center'}>{item.percentage}</p>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 text-center">
            <p className="text-blue-900">Report data will be displayed here</p>
          </div>
        );
    }
  };

  return (
    <div className="p-0 md:p-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Placement Reports</h2>
        <p className="text-gray-600 mt-1">Generate and export placement reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={'bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-lg ' + (
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={'w-12 h-12 rounded-lg bg-' + report.color + '-100 flex items-center justify-center mb-4'}>
                <Icon className={'w-6 h-6 text-' + report.color + '-600'} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
          );
        })}
      </div>

      {/* Report Data */}
      {renderReportData()}

      {/* Export Options */}
      {selectedReport && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleExport('Excel')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all shadow-sm flex-1"
            >
              <Download className="w-5 h-5" />
              Export as Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all shadow-sm flex-1"
            >
              <Download className="w-5 h-5" />
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
