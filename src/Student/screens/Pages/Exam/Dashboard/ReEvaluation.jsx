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
    if (studentId) fetchReEvaluationRequests();
  }, [studentId]);

  const fetchReEvaluationRequests = async () => {
    setLoading(true);
    try {
      const response =
        await studentResultService.getStudentRevaluationRequests(studentId);

      setData(response || []);
      setFilteredData(response || []);
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
      [
        item.exam_schedule_name,
        item.subject_name,
        item.request_status,
        item.request_reason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 🔹 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Re-Evaluation Requests
        </h1> */}

        <input
          type="text"
          placeholder="Search exam, subject, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto rounded-lg shadow border bg-white">
        <table className="min-w-full text-sm">
          <thead className="table-header">
            <tr>
               <th className="px-4 py-3 bg-[#2162c1] text-white">Request ID</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Date</th>
             
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white hidden md:table-cell">
                Reason
              </th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white hidden sm:table-cell">
                Updated Marks
              </th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.revaluation_request_id} className="hover:bg-gray-50">
                 

                  <td className="px-4 py-3">
                    #{item.revaluation_request_id}
                  </td>
                   <td className="px-4 py-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    {item.exam_schedule_name}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.request_reason}
                  </td>

                  <td className="px-4 py-3">
                    {item.subject_name}
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    {item.new_marks_obtained ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.request_status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : item.request_status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.request_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded text-sm border ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReEvaluation;
