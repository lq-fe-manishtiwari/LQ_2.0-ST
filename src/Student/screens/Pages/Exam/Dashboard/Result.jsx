import React, { useEffect, useState } from "react";
import { studentResultService } from "../Service/StudentResultService";

const Result = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔽 Dropdown state
  const [resultType, setResultType] = useState("INTERNAL");

  // 🔹 Get student_id from localStorage
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const studentId = userProfile?.student_id;

  useEffect(() => {
    if (!studentId) return;
    fetchResults();
  }, [studentId, resultType]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      let response;

      if (resultType === "FINAL") {
        response = await studentResultService.getFinalResult(studentId);
      } else {
        response = await studentResultService.getInternalExternal(
          studentId,
          resultType
        );
      }

      setResults(response?.data || []);
    } catch (error) {
      console.error("Error fetching results", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  const filteredResults = results.filter((item) =>
    item.examName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 rounded-lg">
      {/* Search + Dropdown */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by exam name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />

        {/* 🔽 Result Type Dropdown */}
        <select
          value={resultType}
          onChange={(e) => setResultType(e.target.value)}
          className="w-full sm:w-56 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="INTERNAL">Internal</option>
          <option value="EXTERNAL">External</option>
          <option value="FINAL">Final</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="p-4 text-left">Exam Name</th>
              <th className="p-4 text-left">Program</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Marks Obtained</th>
              <th className="p-4 text-left">Total Marks</th>
              <th className="p-4 text-left">Grade</th>
              <th className="p-4 text-left">Result Status</th>
              <th className="p-4 text-left">Grade Card</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500 bg-gray-50">
                  No matching records found
                </td>
              </tr>
            ) : (
              filteredResults.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">{item.examName}</td>
                  <td className="p-4">{item.program}</td>
                  <td className="p-4">{item.className}</td>
                  <td className="p-4">{item.marksObtained}</td>
                  <td className="p-4">{item.totalMarks}</td>
                  <td className="p-4">{item.grade}</td>
                  <td className="p-4">{item.resultStatus}</td>
                  <td className="p-4">
                    {item.gradeCardUrl ? (
                      <a
                        href={item.gradeCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-gray-500">
        Showing {filteredResults.length} entries
      </div>
    </div>
  );
};

export default Result;
