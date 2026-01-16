import React, { useEffect, useState } from "react";
import { studentResultService } from "../Service/StudentResultService";
import { ChevronDown, ChevronUp, X } from "lucide-react";

const Result = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultType, setResultType] = useState("INTERNAL");

  const [expandedRow, setExpandedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [reason, setReason] = useState("");

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const studentId = userProfile?.student_id;

  useEffect(() => {
    if (!studentId) return;
    fetchResults();
  }, [studentId, resultType]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response =
        resultType === "FINAL"
          ? await studentResultService.getFinalResult(studentId)
          : await studentResultService.getInternalExternal(studentId, resultType);

      setResults(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((item) =>
    item.exam_schedule_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRow = (index) =>
    setExpandedRow(expandedRow === index ? null : index);

  const openRevaluationModal = (exam) => {
    setSelectedExam(exam);
    setSelectedSubjects([]);
    setReason("");
    setShowModal(true);
  };

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

const submitRevaluation = async () => {
  try {
    for (const subjectId of selectedSubjects) {
      await studentResultService.createRevaluationRequest(
        studentId, // ✅ pass studentId
        {
          exam_schedule_id: selectedExam.exam_schedule_id,
          subject_id: subjectId,
          request_reason: reason,
        }
      );
    }

    setShowModal(false);
    alert("Revaluation request submitted successfully");
  } catch (error) {
    console.error(error);
    alert("Failed to submit request");
  }
};

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Search + Dropdown */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Search by exam name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={resultType}
          onChange={(e) => setResultType(e.target.value)}
        >
          <option value="INTERNAL">Internal</option>
          <option value="EXTERNAL">External</option>
          <option value="FINAL">Final</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3 bg-[#2162c1] text-white"></th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Program</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Semester</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Marks</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Total</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">%</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Grade</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredResults.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="border-b hover:bg-blue-50">
                  <td className="p-3 text-center">
                    <button onClick={() => toggleRow(index)}>
                      {expandedRow === index ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </td>
                  <td className="p-3 font-medium">
                    {item.exam_schedule_name}
                  </td>
                  <td className="p-3">{item.academic_year?.program?.program_name}</td>
                  <td className="p-3">{item.semester?.name}</td>
                  <td className="p-3">{item.total_marks_obtained}</td>
                  <td className="p-3">{item.total_maximum_marks}</td>
                  <td className="p-3">{item.percentage}%</td>
                  <td className="p-3">{item.grade}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.result_status === "PASS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.result_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => openRevaluationModal(item)}
                    >
                      Revaluation
                    </button>
                  </td>
                </tr>

                {/* Subject Details */}
                {expandedRow === index && (
                  <tr className="bg-gray-50">
                    <td colSpan="10" className="p-4">
                      <table className="w-full border rounded">
                        <thead className="table-header">
                          <tr>
                            <th className="px-4 py-3 bg-[#2162c1] text-white">Subject</th>
                            <th className="px-4 py-3 bg-[#2162c1] text-white">Obtained</th>
                            <th className="px-4 py-3 bg-[#2162c1] text-white">Max</th>
                            <th className="px-4 py-3 bg-[#2162c1] text-white">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.subject_results.map((sub, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{sub.subject_name}</td>
                              <td className="p-2">{sub.marks_obtained}</td>
                              <td className="p-2">{sub.maximum_marks}</td>
                              <td className="p-2">{sub.subject_status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tailwind Modal */}
  {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-scaleIn">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Revaluation Request
        </h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
        <p className="text-sm text-gray-600 mb-4">
          Select the subjects you want to apply for revaluation.
        </p>

        <div className="space-y-3">
          {selectedExam?.subject_results.map((sub) => (
            <label
              key={sub.subject_id}
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(sub.subject_id)}
                  onChange={() => toggleSubject(sub.subject_id)}
                  className="w-4 h-4 accent-blue-600"
                />

                <div>
                  <p className="font-medium text-gray-800">
                    {sub.subject_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {sub.minimum_marks} | Max: {sub.maximum_marks}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {sub.marks_obtained} / {sub.maximum_marks}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    sub.subject_status === "PASS"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {sub.subject_status}
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* Reason */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Revaluation
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Marks seem incorrect / calculation mistake..."
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          disabled={!selectedSubjects.length || !reason}
          onClick={submitRevaluation}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Request
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Result;
