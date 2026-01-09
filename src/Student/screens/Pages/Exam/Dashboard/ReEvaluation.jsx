import React, { useState, useEffect } from "react";
import { studentResultService } from "../Service/StudentResultService";

const ReEvaluation = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 5;

  // 🔹 Get studentId from localStorage
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const studentId = userProfile?.student_id;

  // 🔹 Fetch re-evaluation requests
  useEffect(() => {
    if (!studentId) return;

    fetchReEvaluationRequests();
  }, [studentId]);

  const fetchReEvaluationRequests = async () => {
    setLoading(true);
    try {
      const response =
        await studentResultService.getStudentRevaluationRequests(studentId);

      setData(response?.data || []);
      setFilteredData(response?.data || []);
    } catch (error) {
      console.error("Error fetching re-evaluation requests", error);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Re-Evaluation Requests
      </h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Request Date</th>
              <th className="px-6 py-3 text-left">Request ID</th>
              <th className="px-6 py-3 text-left">Exam Name</th>
              <th className="px-6 py-3 text-left">Request For</th>
              <th className="px-6 py-3 text-left">Subject</th>
              <th className="px-6 py-3 text-left">Updated Marks</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Receipt</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{item.requestDate}</td>
                  <td className="px-6 py-4 text-sm">{item.requestId}</td>
                  <td className="px-6 py-4 text-sm">{item.examName}</td>
                  <td className="px-6 py-4 text-sm">{item.requestFor}</td>
                  <td className="px-6 py-4 text-sm">{item.subject}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.updatedMarks ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{item.receipt || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-2 rounded-md text-sm ${
                currentPage === number
                  ? "bg-blue-500 text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReEvaluation;
