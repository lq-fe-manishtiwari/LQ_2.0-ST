import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getTeacherAllocatedPrograms } from "../../../../../_services/api";

const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  required = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const displayValue = options.find((opt) => opt.value?.toString() === value?.toString())?.label || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border rounded flex items-center justify-between transition-all ${
          disabled || loading
            ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
        }`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {loading ? "Loading..." : displayValue || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && !loading && options.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
            onClick={() => handleSelect("")}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ClassLeave() {
  const [program, setProgram] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        setLoading(true);
        const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        const teacherId = userProfile?.user?.teacher_id || userProfile?.teacher_id;

        if (!teacherId) {
          console.error("Teacher ID not found");
          return;
        }

        const response = await getTeacherAllocatedPrograms(teacherId);
        console.log("Raw API Response:", response);

        const normal = response?.data?.normal_allocation || [];
        const classTeacher = response?.data?.class_teacher_allocation || [];
        const all = [...normal, ...classTeacher];

        console.log("Combined Allocations:", all);
        setAllocations(all);
      } catch (err) {
        console.error("Error fetching allocations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  // Reset dependent fields
  useEffect(() => {
    setAcademicYear("");
    setSemester("");
    setDivision("");
  }, [program]);

  useEffect(() => {
    setSemester("");
    setDivision("");
  }, [academicYear]);

  // PROGRAM OPTIONS - Unique by program_id
  const programOptions = allocations
    .map((alloc) => ({
      value: alloc.program?.program_id,
      label: alloc.program?.program_name,
    }))
    .filter((opt, index, self) => 
      opt.value && self.findIndex((o) => o.value === opt.value) === index
    );

  // ACADEMIC YEAR OPTIONS - Filter by selected program
  const academicYearOptions = allocations
    .filter((alloc) => alloc.program?.program_id?.toString() === program)
    .map((alloc) => ({
      value: alloc.academic_year_id,
      label: alloc.academic_year?.name,
    }))
    .filter((opt, index, self) => 
      opt.value && self.findIndex((o) => o.value === opt.value) === index
    );

  // SEMESTER & DIVISION - Filter by program + academic year
  const filteredAllocations = allocations.filter(
    (alloc) =>
      alloc.program?.program_id?.toString() === program &&
      alloc.academic_year_id?.toString() === academicYear
  );

  const semesterOptions = filteredAllocations
    .map((alloc) => ({
      value: alloc.semester_id,
      label: alloc.semester?.name || `Semester ${alloc.semester?.semester_number || ""}`,
    }))
    .filter((opt, index, self) => 
      opt.value && self.findIndex((o) => o.value === opt.value) === index
    );

  const divisionOptions = filteredAllocations
    .map((alloc) => ({
      value: alloc.division_id,
      label: alloc.division?.division_name,
    }))
    .filter((opt, index, self) => 
      opt.value && self.findIndex((o) => o.value === opt.value) === index
    );

  // Mock leaves when full class is selected
  useEffect(() => {
    if (program && academicYear && semester && division) {
      setLeavesLoading(true);
      setTimeout(() => {
        setLeaves([
          {
            sr: 1,
            studentName: "Rahul Verma",
            leaveType: "Medical Leave",
            fromDate: "2025-12-15",
            toDate: "2025-12-18",
            days: 4,
            status: "Approved",
            remark: "Viral fever",
          },
          {
            sr: 2,
            studentName: "Sneha Gupta",
            leaveType: "Casual Leave",
            fromDate: "2025-12-22",
            toDate: "2025-12-22",
            days: 1,
            status: "Pending",
            remark: "Personal work",
          },
        ]);
        setLeavesLoading(false);
      }, 500);
    } else {
      setLeaves([]);
    }
  }, [program, academicYear, semester, division]);

  const totalEntries = leaves.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const currentEntries = leaves.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const statusColor = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
          Class Leaves
        </h1>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Class</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CustomSelect
              label="Program"
              value={program}
              onChange={setProgram}
              options={programOptions}
              placeholder="Select Program"
              loading={loading}
              required
            />

            <CustomSelect
              label="Academic Year"
              value={academicYear}
              onChange={setAcademicYear}
              options={academicYearOptions}
              placeholder="Select Academic Year"
              disabled={!program}
            />

            <CustomSelect
              label="Semester"
              value={semester}
              onChange={setSemester}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={!academicYear}
            />

            <CustomSelect
              label="Division"
              value={division}
              onChange={setDivision}
              options={divisionOptions}
              placeholder="Select Division"
              disabled={!academicYear}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {leavesLoading ? (
            <div className="p-12 text-center text-gray-500">Loading leaves...</div>
          ) : leaves.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {program && academicYear
                ? "No leave records found for the selected class."
                : "Please select a class to view student leaves."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-50 text-blue-700">
                    <tr>
                      <th className="p-4 text-left">Sr No</th>
                      <th className="p-4 text-left">Student Name</th>
                      <th className="p-4 text-left">Leave Type</th>
                      <th className="p-4 text-left">From</th>
                      <th className="p-4 text-left">To</th>
                      <th className="p-4 text-center">Days</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.map((leave) => (
                      <tr key={leave.sr} className="border-t hover:bg-blue-50">
                        <td className="p-4">{leave.sr}</td>
                        <td className="p-4 font-medium">{leave.studentName}</td>
                        <td className="p-4">{leave.leaveType}</td>
                        <td className="p-4">{leave.fromDate}</td>
                        <td className="p-4">{leave.toDate}</td>
                        <td className="p-4 text-center">{leave.days}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{leave.remark || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center py-4 gap-2 border-t">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {leavesLoading ? (
            <div className="text-center py-8 text-gray-500">Loading leaves...</div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {program && academicYear ? "No leave records found." : "Select a class to view leaves."}
            </div>
          ) : (
            currentEntries.map((leave) => (
              <div key={leave.sr} className="bg-white rounded-xl shadow-md p-5 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-lg">{leave.studentName}</p>
                    <p className="text-sm text-gray-500">Sr No: {leave.sr}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{leave.leaveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From → To:</span>
                    <span>{leave.fromDate} → {leave.toDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days:</span>
                    <span className="font-medium">{leave.days}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Remark:</span>
                    <p className="text-gray-800">{leave.remark || "-"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}