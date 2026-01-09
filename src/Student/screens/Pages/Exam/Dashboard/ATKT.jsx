// src/components/ATKT.jsx
import { useState, useEffect, useMemo } from 'react';
import { studentResultService } from '../Service/StudentResultService'; // make sure this has getStudentAtktData

const ITEMS_PER_PAGE = 8;

export default function ATKT() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [atktData, setAtktData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Get student_id from localStorage
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  const studentId = userProfile?.student_id;

  // Fetch ATKT data
  useEffect(() => {
    if (!studentId) return;
    fetchAtktData();
  }, [studentId]);

  const fetchAtktData = async () => {
    setLoading(true);
    try {
      const response = await studentResultService.getStudentAtktData(studentId);
      // Assuming response is an array
      setAtktData(response || []);
    } catch (err) {
      console.error('Error fetching ATKT data:', err);
      setAtktData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return atktData;

    return atktData.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, atktData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on new search
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">ATKT Requests</h1> */}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search by Program, Class, Name, Roll No, Exam Type or Receipt..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-xl px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Program
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Student Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Roll No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Exam Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Receipt
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider bg-blue-700">
                  Action
                </th>
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
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {item.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.examType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.receipt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 font-medium mr-4">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 font-medium mr-4">
                        Download
                      </button>
                      <button className="text-green-600 hover:text-green-900 font-medium">
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-lg">
                    No ATKT records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of{' '}
              {filteredData.length} entries
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
