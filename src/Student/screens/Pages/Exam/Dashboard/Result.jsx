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

      setResults(response || []);
    } catch (error) {
      console.error("Error fetching results", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Search filter
  const filteredResults = results.filter((item) =>
    item.exam_schedule_name?.toLowerCase().includes(search.toLowerCase())
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
              <th className="p-4 text-left">Class/Year</th>
              <th className="p-4 text-left">Semester</th>
              <th className="p-4 text-left">Marks Obtained</th>
              <th className="p-4 text-left">Total Marks</th>
              <th className="p-4 text-left">Percentage</th>
              <th className="p-4 text-left">Grade</th>
              <th className="p-4 text-left">Result Status</th>
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
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-4">{item.exam_schedule_name}</td>
                  <td className="p-4">{item.academic_year?.program?.program_name || "N/A"}</td>
                  <td className="p-4">{item.academic_year?.class_year?.name || "N/A"}</td>
                  <td className="p-4">{item.semester?.name || "N/A"}</td>
                  <td className="p-4">{item.total_marks_obtained}</td>
                  <td className="p-4">{item.total_maximum_marks}</td>
                  <td className="p-4">{item.percentage}%</td>
                  <td className="p-4">{item.grade}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      item.result_status === "PASS" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.result_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Subject Details (Optional - if you want to show subjects) */}
      {filteredResults.length > 0 && filteredResults[0].subject_results && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Subject-wise Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Subject Name</th>
                  <th className="p-3 text-left">Marks Obtained</th>
                  <th className="p-3 text-left">Maximum Marks</th>
                  <th className="p-3 text-left">Minimum Marks</th>
                  <th className="p-3 text-left">Subject Status</th>
                  <th className="p-3 text-left">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults[0].subject_results.map((subject, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">{subject.subject_name}</td>
                    <td className="p-3">{subject.marks_obtained}</td>
                    <td className="p-3">{subject.maximum_marks}</td>
                    <td className="p-3">{subject.minimum_marks}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        subject.subject_status === "PASS" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {subject.subject_status}
                      </span>
                    </td>
                    <td className="p-3">{subject.grade || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-gray-500">
        Showing {filteredResults.length} entries
      </div>
    </div>
  );
};

export default Result;