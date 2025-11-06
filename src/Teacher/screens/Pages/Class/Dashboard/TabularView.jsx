import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MonthlyView = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Student attendance data
  const students = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@school.com",
      mobile: "9876543210",
      rollNo: "001",
      grade: "8th",
      division: "A",
      gender: "MALE",
      status: "present",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Emma Johnson",
      email: "emma.johnson@school.com",
      mobile: "9823412312",
      rollNo: "002",
      grade: "8th",
      division: "A",
      gender: "FEMALE",
      status: "present",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@school.com",
      mobile: "9765432198",
      rollNo: "003",
      grade: "8th",
      division: "A",
      gender: "MALE",
      status: "absent",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Sarah Davis",
      email: "sarah.davis@school.com",
      mobile: "9988776655",
      rollNo: "004",
      grade: "8th",
      division: "A",
      gender: "FEMALE",
      status: "present",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@school.com",
      mobile: "9123456789",
      rollNo: "005",
      grade: "8th",
      division: "A",
      gender: "MALE",
      status: "present",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
    }
  ];

  const totalEntries = students.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = students.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const toggleStudentStatus = (studentId) => {
    console.log('Toggle status for student:', studentId);
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(selectedStudent === studentId ? null : studentId);
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="p-4 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEntries.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudent === student.id}
                      onChange={() => handleStudentSelect(student.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {student.gender === 'FEMALE' ? (
                          <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.grade} Division {student.division}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {student.mobile}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.rollNo}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleStudentStatus(student.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        student.status === 'present'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {student.status === 'present' ? (
                        <ToggleRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 mr-1" />
                      )}
                      {student.status === 'present' ? 'Present' : 'Absent'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirst + 1}–{Math.min(indexOfLast, totalEntries)} of {totalEntries} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {currentEntries.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStudent === student.id}
                  onChange={() => handleStudentSelect(student.id)}
                  className="w-4 h-4 mr-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {student.gender === 'FEMALE' ? (
                    <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <User className="w-7 h-7 text-blue-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.grade} Division {student.division}</p>
                </div>
              </div>
              <button
                onClick={() => toggleStudentStatus(student.id)}
                className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  student.status === 'present'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {student.status === 'present' ? (
                  <ToggleRight className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                )}
                {student.status === 'present' ? 'Present' : 'Absent'}
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {student.email}
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {student.mobile}
              </div>
              <div className="text-gray-600">Roll No: {student.rollNo}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyView;