import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronDown,
  Plus,
  SquarePen,
  Trash2,
  FileCheck,
} from "lucide-react";

const AnswerSheetList = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);

  const data = [
    {
      id: "1",
      studentName: "Rahul Patil",
      rollNo: "CS101",
      ernNo: "ERN2025001",
      program: "PGDM",
      classYear: "First Year",
      course: "Data Structures",
      status: "Evaluated",
      totalMarks: 85,
      maxMarks: 100,
      fileUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      fileType: "pdf",
    },
    {
      id: "2",
      studentName: "Sneha Kulkarni",
      rollNo: "MBA202",
      ernNo: "ERN2025002",
      program: "MBA",
      classYear: "Second Year",
      course: "Finance Management",
      status: "Pending",
      totalMarks: 0,
      maxMarks: 100,
      fileUrl: "https://picsum.photos/800/1200",
      fileType: "image",
    },
    {
      id: "3",
      studentName: "Amit Sharma",
      rollNo: "CS103",
      ernNo: "ERN2025003",
      program: "PGDM",
      classYear: "First Year",
      course: "Database Management",
      status: "Pending",
      totalMarks: 0,
      maxMarks: 100,
      fileUrl: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      fileType: "pdf",
    },
    {
      id: "4",
      studentName: "Priya Deshmukh",
      rollNo: "MBA204",
      ernNo: "ERN2025004",
      program: "MBA",
      classYear: "Second Year",
      course: "Marketing Strategy",
      status: "Evaluated",
      totalMarks: 92,
      maxMarks: 100,
      fileUrl: "https://picsum.photos/800/1200?random=2",
      fileType: "image",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        {/* Search */}
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 bg-pink-100 text-pink-700 px-5 py-2.5 rounded-lg"
          >
            <Filter size={16} />
            Filter
            <ChevronDown size={16} />
          </button>

          <Link to="/teacher/exam/answer-sheets/add">
            <button className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg whitespace-nowrap">
              <Plus size={16} />
              Add Answer Sheet
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Program */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Program
              </label>
              <select className="w-full border rounded-lg px-3 py-2 text-gray-500">
                <option>Select Program</option>
                <option>PGDM</option>
                <option>MBA</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Class
              </label>
              <select className="w-full border rounded-lg px-3 py-2 text-gray-500">
                <option>Select Class</option>
                <option>First Year</option>
                <option>Second Year</option>
              </select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Schedule
              </label>
              <select className="w-full border rounded-lg px-3 py-2 text-gray-500">
                <option>Select Schedule</option>
                <option>Mid Term</option>
                <option>Final Exam</option>
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Course
              </label>
              <select className="w-full border rounded-lg px-3 py-2 text-gray-500">
                <option>Select Course</option>
                <option>Data Structures</option>
                <option>Finance Management</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-5 py-2 border rounded-lg">
              Clear All
            </button>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-lg">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow bg-white">
        <table className="w-full text-sm">
          <thead className="table-header text-white">
            <tr>
              <th className="px-4 py-4 text-left bg-[#2162c1]">STUDENT NAME</th>
              <th className="px-4 py-4 bg-[#2162c1]">ROLL NO</th>
              <th className="px-4 py-4 bg-[#2162c1]">ERN NO</th>
              <th className="px-4 py-4 bg-[#2162c1] ">PROGRAM</th>
              <th className="px-4 py-4 bg-[#2162c1]">CLASS</th>
              <th className="px-4 py-4 bg-[#2162c1]">COURSE</th>
              <th className="px-4 py-4 bg-[#2162c1]">STATUS</th>
              <th className="px-4 py-4 bg-[#2162c1]">TOTAL MARKS</th>
              <th className="px-4 py-4 bg-[#2162c1]">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr
                key={i}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-medium">
                  {item.studentName}
                </td>
                <td className="px-4 py-4 text-center">
                  {item.rollNo}
                </td>
                <td className="px-4 py-4 text-center">
                  {item.ernNo}
                </td>
                <td className="px-4 py-4 text-center">
                  {item.program}
                </td>
                <td className="px-4 py-4 text-center">
                  {item.classYear}
                </td>
                <td className="px-4 py-4 text-center">
                  {item.course}
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "Evaluated"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-medium">
                  {item.totalMarks}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex justify-center items-center gap-3">
                    {/* MARK BUTTON */}
                    <button
                      onClick={() => navigate(`/exam-management/answer-sheets/mark/${item.id}`)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      title="Mark Answer Sheet"
                    >
                      <FileCheck size={20} strokeWidth={1.8} />
                    </button>

                    {/* EDIT (BOX + PENCIL) */}
                    <button className="text-orange-500 hover:text-orange-600">
                      <SquarePen size={20} strokeWidth={1.8} />
                    </button>

                    {/* DELETE */}
                    <button className="text-red-500 hover:text-red-600">
                      <Trash2 size={20} strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnswerSheetList;
