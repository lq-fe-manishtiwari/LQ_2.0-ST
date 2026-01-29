import React, { useEffect, useState } from "react";
// import { teacherProfileService } from "../Services/academicDiary.service";

/* 🔹 HARD CODED TEACHERS */
const HARD_CODED_TEACHERS = [
  {
    teacher_id: "1",
    name: "Dr. Amit Sharma",
    program_id: "40",
  },
  {
    teacher_id: "2",
    name: "Ms. Neha Verma",
    program_id: "40",
  },
  {
    teacher_id: "3",
    name: "Mr. Rajesh Kumar",
    program_id: "41",
  },
];

export default function ProgramTeacherFilter({ onChange }) {
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  /* ✅ Load programs from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("college_programs");
    if (stored) {
      setPrograms(JSON.parse(stored));
    }
  }, []);

  /* ✅ Load teachers when program changes */
  useEffect(() => {
    if (!selectedProgram) {
      setTeachers([]);
      setSelectedTeacher("");
      return;
    }

    // 🔴 FUTURE API CALL
    // teacherProfileService
    //   .getTeachersByProgramId(selectedProgram)
    //   .then(res => setTeachers(res))
    //   .catch(() => setTeachers([]));

    // ✅ HARD CODED FILTER
    const filteredTeachers = HARD_CODED_TEACHERS.filter(
    (t) => Number(t.program_id) === Number(selectedProgram)
    );


    setTeachers(filteredTeachers);
    setSelectedTeacher("");
  }, [selectedProgram]);

  /* ✅ Notify parent ONLY when something changes */
  useEffect(() => {
    if (onChange) {
      onChange({
        programId: selectedProgram || null,
        teacherId: selectedTeacher || null,
      });
    }
  }, [selectedProgram, selectedTeacher, onChange]);

  return (
    <div className="bg-white p-4 rounded-xl border mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Program */}
      <div>
        <label className="block text-sm font-semibold mb-1">Program</label>
        <select
          className="w-full border px-3 py-2 rounded-lg"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="">Select Program</option>
          {programs.map((p) => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_name}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher */}
      <div>
        <label className="block text-sm font-semibold mb-1">Teacher</label>
        <select
          className="w-full border px-3 py-2 rounded-lg"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          disabled={!selectedProgram}
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t.teacher_id} value={t.teacher_id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
