import { useState, useEffect, useMemo } from 'react';
import { studentResultService } from '../Service/StudentResultService';
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 8;

export default function ATKT() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [atktData, setAtktData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Get student_id from localStorage
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const studentId = userProfile?.student_id;

  useEffect(() => {
    if (studentId) {
      fetchAtktData();
    }
  }, [studentId]);

  const fetchAtktData = async () => {
    setLoading(true);
    try {
      const response = await studentResultService.getStudentAtktData(studentId);

      // 🔹 Map API Response
      const mappedData = (response || []).map((item) => ({
        id: item.student_result_id,
        program: item.academic_year?.program?.program_name || '-',
        semester: item.semester?.name || '-',
        studentName: `${item.student_firstname} ${item.student_lastname}`,
        rollNo: item.roll_number,
        examType: item.exam_type_name,
        receipt: item.exam_schedule_name,
        subjects: item.subject_results || [],
      }));

      setAtktData(mappedData);
    } catch (error) {
      console.error('Error fetching ATKT data:', error);
      setAtktData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search
  const filteredData = useMemo(() => {
    if (!searchTerm) return atktData;

    return atktData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, atktData]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // 🔘 Actions
  const handleView = (item) => {
    alert(
      item.subjects
        .map(
          (s) =>
            `${s.subject_name} (${s.marks_obtained}/${s.maximum_marks}) - ${s.subject_status}`
        )
        .join('\n')
    );
  };

  const handleEdit = (item) => {
    console.log('Edit ATKT:', item);
  };

  const handleDelete = (item) => {
    console.log('Delete ATKT:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔍 Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by Program, Class, Name, Roll No, Exam Type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-xl px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 📊 Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-700">
              <tr>
                {[
                  'Program',
                  'Semester',
                  'Student Name',
                  'Roll No',
                  'Exam Type',
                  'Receipt',
                  'Action',
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-4 text-left text-xs font-semibold text-white bg-blue-700"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {item.program}
                    </td>
                    <td className="px-6 py-4 text-sm">{item.semester}</td>
                    <td className="px-6 py-4 text-sm">{item.studentName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {item.rollNo}
                    </td>
                    <td className="px-6 py-4 text-sm">{item.examType}</td>
                    <td className="px-6 py-4 text-sm">{item.receipt}</td>

                    {/* 🔘 Heroicons Actions */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleView(item)}
                          title="View"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>

                      

                      
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No ATKT records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📑 Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of{' '}
              {filteredData.length}
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : ''
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
