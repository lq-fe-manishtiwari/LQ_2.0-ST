import React, { useState } from "react";
import { Link } from "react-router-dom";

const AddAnswerSheet = () => {
  const [program, setProgram] = useState("Diploma CS234");
  const [classYear, setClassYear] = useState("FY");
  const [examSchedule, setExamSchedule] = useState("");
  const [course, setCourse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      program,
      classYear,
      examSchedule,
      course,
    });
    alert("Answer Sheet Added Successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button & Title */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-blue-700">Add Answer Sheet</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <form onSubmit={handleSubmit}>
            {/* Grid for Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Diploma CS234">Diploma CS234</option>
                  <option value="PGDM">PGDM</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Tech">B.Tech</option>
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="FY">FY</option>
                  <option value="SY">SY</option>
                  <option value="TY">TY</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              {/* Exam Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Schedule <span className="text-red-500">*</span>
                </label>
                <select
                  value={examSchedule}
                  onChange={(e) => setExamSchedule(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" disabled>
                    Select Schedule
                  </option>
                  <option value="Mid Term">Mid Term</option>
                  <option value="End Term">End Term</option>
                  <option value="Supplementary">Supplementary</option>
                  <option value="Re-exam">Re-exam</option>
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="" disabled>
                    Select Course
                  </option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Database Management">Database Management</option>
                  <option value="Finance Management">Finance Management</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-in justify-center gap-6">
              <Link
                to="/exam-management/answer-sheets"
                className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-12 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAnswerSheet;