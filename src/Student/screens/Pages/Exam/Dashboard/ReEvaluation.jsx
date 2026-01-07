import React, { useState, useEffect } from 'react';

const ReEvaluation = () => {
  // Sample data - in real app, fetch from API
  const [data, setData] = useState([
    {
      id: 1,
      requestDate: '2024-01-15',
      examName: 'Midterm Exam',
      subject: 'Mathematics',
      requestFor: 'Re-evaluation',
      updatedMarks: '85',
      status: 'Approved',
      receipt: 'REC-001'
    },
    {
      id: 2,
      requestDate: '2024-01-16',
      examName: 'Final Exam',
      subject: 'Physics',
      requestFor: 'Re-check',
      updatedMarks: '78',
      status: 'Rejected',
      receipt: 'REC-002'
    },
    {
      id: 3,
      requestDate: '2024-01-17',
      examName: 'Quiz',
      subject: 'Chemistry',
      requestFor: 'Re-evaluation',
      updatedMarks: '92',
      status: 'Pending',
      receipt: 'REC-003'
    },
    // Add more sample data as needed
  ]);

  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  // Filter data based on search term
  useEffect(() => {
    const filtered = data.filter(item =>
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, data]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Re-Evaluation Requests</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-blue-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Request Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Exam Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Request For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Updated Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-blue-700">Receipt</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.requestDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.examName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.requestFor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.updatedMarks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.receipt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-2 border rounded-md text-sm font-medium ${
                  currentPage === number
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
          </nav>
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">No records found.</div>
      )}
    </div>
  );
};

export default ReEvaluation;