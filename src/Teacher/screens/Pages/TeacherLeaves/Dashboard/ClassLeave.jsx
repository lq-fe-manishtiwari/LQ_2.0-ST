import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { getTeacherAllocatedPrograms } from "../../../../../_services/api";
import { leaveService } from "../Services/Leave.Service";

/* =======================
   Custom Select Component
======================= */
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

  const displayValue =
    options.find((opt) => opt.value?.toString() === value?.toString())?.label ||
    "";

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
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border rounded flex justify-between cursor-pointer ${
          disabled || loading
            ? "bg-gray-100 text-gray-500"
            : "bg-white hover:border-blue-400"
        }`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <span>{loading ? "Loading..." : displayValue || placeholder}</span>
        <ChevronDown className="w-4 h-4" />
      </div>

      {isOpen && !disabled && !loading && (
        <div className="absolute z-20 w-full bg-white border rounded shadow mt-1">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
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

/* =======================
   Main Component
======================= */
export default function ClassLeave() {
  const [program, setProgram] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(false);

  /* =======================
     Fetch Allocations
  ======================= */
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const userProfile = JSON.parse(
          localStorage.getItem("userProfile") || "{}"
        );
        const teacherId =
          userProfile?.user?.teacher_id || userProfile?.teacher_id;

        const response = await getTeacherAllocatedPrograms(teacherId);
        const normal = response?.data?.normal_allocation || [];
        const classTeacher = response?.data?.class_teacher_allocation || [];
        setAllocations([...normal, ...classTeacher]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  /* =======================
     Options
  ======================= */
  const programOptions = allocations
    .map((a) => ({
      value: a.program?.program_id?.toString(),
      label: a.program?.program_name,
    }))
    .filter(
      (opt, i, arr) =>
        opt.value && arr.findIndex((o) => o.value === opt.value) === i
    );

  const academicYearOptions = allocations
    .filter((a) => a.program?.program_id?.toString() === program)
    .map((a) => ({
      value: a.academic_year_id?.toString(),
      label: a.academic_year?.name,
    }));

  const semesterOptions = allocations
    .filter(
      (a) =>
        a.program?.program_id?.toString() === program &&
        a.academic_year_id?.toString() === academicYear
    )
    .map((a) => ({
      value: a.semester_id?.toString(),
      label: a.semester?.name,
    }));

  /* =======================
     Fetch Leaves
  ======================= */
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!academicYear || !semester) return;

      setLeavesLoading(true);
      try {
        const response =
          await leaveService.getLeaveByAcaddemicyearIdSemesterId(
            parseInt(academicYear),
            parseInt(semester)
          );

        const data = response || [];

        const formatted = data.map((leave, index) => ({
          id: leave.apply_leave_id,
          sr: index + 1,
          studentName: `${leave.first_name} ${leave.last_name}`,
          leaveType: leave.leave_type_id,
          fromDate: leave.start_date,
          toDate: leave.end_date,
          days: leave.no_of_days,
          status: leave.leave_status,
          remark: leave.remark,
        }));

        setLeaves(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLeavesLoading(false);
      }
    };

    fetchLeaves();
  }, [academicYear, semester]);

  /* =======================
     Update Leave Status
  ======================= */
const updateLeaveStatus = async (id, status) => {
  try {
    await leaveService.updateLeaveStatus(id, status);

    // Update UI immediately
    setLeaves((prev) =>
      prev.map((leave) =>
        leave.id === id ? { ...leave, status } : leave
      )
    );
  } catch (error) {
    console.error("Update failed:", error);
    alert("Failed to update leave status");
  }
};


  /* =======================
     UI
  ======================= */
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Class Leaves</h1>

      <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded shadow mb-6">
        <CustomSelect
          label="Program"
          value={program}
          onChange={setProgram}
          options={programOptions}
          placeholder="Select Program"
          loading={loading}
        />
        <CustomSelect
          label="Academic Year"
          value={academicYear}
          onChange={setAcademicYear}
          options={academicYearOptions}
          placeholder="Select Year"
        />
        <CustomSelect
          label="Semester"
          value={semester}
          onChange={setSemester}
          options={semesterOptions}
          placeholder="Select Semester"
        />
      </div>

      {leavesLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3">Sr</th>
              <th className="p-3">Student</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.sr}</td>
                <td className="p-3">{l.studentName}</td>
                <td className="p-3">{l.fromDate}</td>
                <td className="p-3">{l.toDate}</td>
                <td className="p-3">{l.days}</td>
                <td className="p-3">{l.status}</td>
                <td className="p-3 space-x-2">
                  {l.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateLeaveStatus(l.id, "APPROVED")}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l.id, "REJECTED")}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
