import React, { useState, useEffect, useMemo } from "react";
import { COService } from "../Service/co.service";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { api } from "@/_services/api";

const handleResponse = (res) => res.data;

const AddCO = () => {
  const [allocations, setAllocations] = useState([]);

  const { getTeacherId, isLoaded } = useUserProfile();
  const teacherId = getTeacherId();

  const [programs, setPrograms] = useState([]);

  const [batches, setBatches] = useState([]);

  const [semesters, setSemesters] = useState([]);

  const [papers, setPapers] = useState([]);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [courseCoData, setCourseCoData] = useState({});
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [coValidationErrors, setCoValidationErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Helper: Get active college ID (same as in PaperDashboard)
  const getActiveCollegeId = () => {
    try {
      const activeCollege = localStorage.getItem("activeCollege");
      if (activeCollege) {
        const parsed = JSON.parse(activeCollege);
        return parsed.college_id || parsed.id || parsed.collegeId;
      }
      return null;
    } catch (e) {
      console.error("Error parsing activeCollege:", e);
      return null;
    }
  };

  const collegeId = getActiveCollegeId();

  // Load Programs when page opens
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        if (!isLoaded) return;

        const teacherId = getTeacherId();
        const res = await api.getTeacherAllocatedPrograms(teacherId);

        if (res?.success) {
          const data = res.data?.normal_allocation || [];
          setAllocations(data);
          setPrograms([
            ...new Map(
              data.map((a) => [a.program.program_id, a.program])
            ).values(),
          ]);
        }
      } catch (err) {
        console.error("Program API error", err);
      }
    };

    loadPrograms();
  }, [isLoaded]);

  // Fetch Programs (same logic as PaperDashboard)
  useEffect(() => {
    if (!selectedProgram) return;

    const filtered = allocations.filter(
      (a) => String(a.program.program_id) === String(selectedProgram)
    );

    const uniqueDivisions = [
      ...new Map(
        filtered.map((a) => [a.division.division_id, a.division])
      ).values(),
    ];

    setBatches(uniqueDivisions);
    setSelectedBatch("");
    setSemesters([]);
    setPapers([]);
  }, [selectedProgram, allocations]);

  // Fetch Batches when program changes
  useEffect(() => {
    if (!selectedBatch) return;

    const filtered = allocations.filter(
      (a) =>
        String(a.program.program_id) === String(selectedProgram) &&
        String(a.division.division_id) === String(selectedBatch)
    );

    const uniqueSemesters = [
      ...new Map(filtered.map((a) => [a.semester.id, a.semester])).values(),
    ];

    setSemesters(uniqueSemesters);
    setSelectedSemester("");
    setPapers([]);
  }, [selectedBatch]);

  // Fetch Papers / Courses (same logic as PaperDashboard)
  useEffect(() => {
    if (!selectedSemester) return;

    const filtered = allocations.filter(
      (a) =>
        String(a.program.program_id) === String(selectedProgram) &&
        String(a.division.division_id) === String(selectedBatch) &&
        String(a.semester.id) === String(selectedSemester)
    );

    const uniquePapers = [
      ...new Map(filtered.map((a) => [a.paper.id, a.paper])).values(),
    ];

    setPapers(uniquePapers);
    setSelectedCourse("");
  }, [selectedSemester]);

  // Filter papers by selected semester (if your backend supports it)
  // If not, you may need to filter client-side or adjust backend query

  // ────────────────────────────────────────────────
  //  CO Logic (remains almost same)
  // ────────────────────────────────────────────────

  useEffect(() => {
    if (selectedCourse && !courseCoData[selectedCourse]) {
      setCourseCoData((prev) => ({
        ...prev,
        [selectedCourse]: [{ coCode: "CO1", coStatement: "" }],
      }));
      if (!selectedCourses.includes(selectedCourse)) {
        setSelectedCourses((prev) => [...prev, selectedCourse]);
      }
    }
  }, [selectedCourse]);

  const addCoRow = (courseId) => {
    setCourseCoData((prev) => {
      const existing = prev[courseId] || [];
      const newCode = `CO${existing.length + 1}`;
      return {
        ...prev,
        [courseId]: [...existing, { coCode: newCode, coStatement: "" }],
      };
    });
  };

  const removeCoRow = (courseId, rowIndex) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      if (updated[courseId]?.length > 1) {
        updated[courseId].splice(rowIndex, 1);
      }
      return updated;
    });
  };

  const handleCoChange = (courseId, rowIndex, field, value) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      updated[courseId][rowIndex][field] = value;
      return updated;
    });

    if (value.trim() !== "") {
      setCoValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${courseId}-${rowIndex}-${field}`];
        return newErrors;
      });
    }
  };

  const handleCourseSubmit = async () => {
    if (!selectedCourse || !selectedSemester) {
      alert("Please select semester and course.");
      return;
    }

    const college_id = getActiveCollegeId();

    const coRows = courseCoData[selectedCourse] || [];

    try {
      setLoading(true);

      for (let i = 0; i < coRows.length; i++) {
        const co = coRows[i];

        if (!co.coCode || !co.coStatement) continue;

        const payload = {
          college_id: Number(college_id),
          subject_id: Number(selectedCourse),
          outcome_code: co.coCode,
          outcome_title: co.coStatement,
          outcome_description: co.coStatement,
          outcome_order: i + 1,
          is_active: true,
        };

        await COService.saveCO(payload);
      }

      alert("Course Outcomes saved successfully ✅");

      // Optional: reset form
      setCourseCoData((prev) => ({
        ...prev,
        [selectedCourse]: [{ coCode: "CO1", coStatement: "" }],
      }));
    } catch (error) {
      console.error("Error saving COs:", error);
      alert("Failed to save Course Outcomes ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log({
      selectedProgram,
      selectedBatch,
      selectedSemester,
      selectedCourse,
    });
  }, [selectedProgram, selectedBatch, selectedSemester, selectedCourse]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Course Outcomes (CO)</h2>

      {/* Filters – same cascading style as PaperDashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-white p-6 rounded-lg shadow border">
        {/* Program */}
        <div>
          <label className="block mb-2 font-medium">Program</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedProgram}
            onChange={(e) => {
              setSelectedProgram(e.target.value);
              setSelectedBatch("");
              setSelectedSemester("");
              setSelectedCourse("");
            }}
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.program_id} value={p.program_id}>
                {p.program?.program_name || p.program_name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch / Class */}
        <div>
          <label className="block mb-2 font-medium">Batch</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setSelectedSemester("");
              setSelectedCourse("");
            }}
            disabled={!selectedProgram}
          >
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b.division_id} value={b.division_id}>
                {b.division_name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block mb-2 font-medium">Semester</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setSelectedCourse("");
            }}
            disabled={!selectedBatch}
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course / Paper */}
        <div>
          <label className="block mb-2 font-medium">Paper</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedSemester || loading}
          >
            <option value="">Select Paper</option>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.paper_name}
              </option>
            ))}
          </select>
          {loading && (
            <p className="text-sm text-gray-500 mt-1">Loading courses...</p>
          )}
        </div>
      </div>

      {/* CO Input Sections */}
      {selectedCourses.map((courseId) => {
        const course = papers.find((c) => String(c.id) === String(courseId));

        const coRows = courseCoData[courseId] || [];

        return (
          <div
            key={courseId}
            className="mb-8 bg-white rounded-lg shadow border"
          >
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-medium">
              {course?.name || "Course"}{" "}
              {course?.paper_code ? `(${course.paper_code})` : ""}
            </div>

            <div className="p-5">
              {coRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 mb-4 items-center"
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="CO Code (e.g. CO1)"
                      value={row.coCode}
                      onChange={(e) =>
                        handleCoChange(courseId, idx, "coCode", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-8">
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Course Outcome Statement"
                      value={row.coStatement}
                      onChange={(e) =>
                        handleCoChange(
                          courseId,
                          idx,
                          "coStatement",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => addCoRow(courseId)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCoRow(courseId, idx)}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full w-9 h-9 flex items-center justify-center text-lg"
                      disabled={coRows.length <= 1}
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCourseSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded font-medium"
              >
                Save COs
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2.5 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AddCO;
