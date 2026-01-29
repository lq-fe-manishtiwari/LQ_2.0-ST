'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function DriveAttendance() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [driveId]);

  const loadStudents = async () => {
    setLoading(true);
    // Mock data
    const mockData = [
      {
        student_id: 1,
        roll_no: 'CS2021001',
        name: 'Rahul Sharma',
        department: 'Computer Science',
        semester: '6th',
        cgpa: '8.5',
        attended: true
      },
      {
        student_id: 2,
        roll_no: 'CS2021002',
        name: 'Priya Patel',
        department: 'Computer Science',
        semester: '6th',
        cgpa: '9.2',
        attended: true
      },
      {
        student_id: 3,
        roll_no: 'CS2021003',
        name: 'Amit Kumar',
        department: 'Computer Science',
        semester: '6th',
        cgpa: '7.8',
        attended: false
      },
      {
        student_id: 4,
        roll_no: 'IT2021001',
        name: 'Sneha Reddy',
        department: 'Information Technology',
        semester: '6th',
        cgpa: '8.9',
        attended: true
      },
      {
        student_id: 5,
        roll_no: 'IT2021002',
        name: 'Vikram Singh',
        department: 'Information Technology',
        semester: '6th',
        cgpa: '7.5',
        attended: false
      }
    ];
    setStudents(mockData);
    setLoading(false);
  };

  const toggleAttendance = (studentId) => {
    setStudents(students.map(s => 
      s.student_id === studentId ? { ...s, attended: !s.attended } : s
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, attended: true })));
    Swal.fire('Success', 'All students marked present', 'success');
  };

  const markAllAbsent = () => {
    setStudents(students.map(s => ({ ...s, attended: false })));
    Swal.fire('Success', 'All students marked absent', 'success');
  };

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Attendance Saved!',
      text: 'Attendance has been recorded successfully',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const exportAttendance = () => {
    Swal.fire('Export', 'Attendance exported to Excel', 'success');
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    present: students.filter(s => s.attended).length,
    absent: students.filter(s => !s.attended).length,
    percentage: students.length > 0 ? Math.round((students.filter(s => s.attended).length / students.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/placement/drive-scheduling')}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Drive Attendance</h2>
              <p className="text-gray-600 mt-1">Drive ID: {driveId} - TCS Placement Drive</p>
            </div>
          </div>
          <button
            onClick={exportAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Attendance %</p>
            <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={markAllPresent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">CGPA</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.roll_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.cgpa}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleAttendance(student.student_id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                          student.attended
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {student.attended ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Absent
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
