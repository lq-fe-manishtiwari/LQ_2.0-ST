import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { courseService } from "../../../Courses/Services/courses.service";
import { batchService } from "../../../Academics/Services/batch.Service";
import { collegeService } from "../../../Content/services/college.service";
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
// import { useColleges } from "../../../../../contexts/CollegeContext";
import { COService } from "../Service/co.service"
import { Formik, Form } from "formik";
import SweetAlert from "react-bootstrap-sweetalert";

const AddCO = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEdit, poData } = location.state || {};
  const { userID, userRole } = useUserProfile();
  const { colleges } = useColleges();

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
  const [alert, setAlert] = useState(null);

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

  // Fetch Programs (same logic as PaperDashboard)
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        let programData = [];

        if (userRole === "SUPERADMIN") {
          const stored = localStorage.getItem("college_programs");
          if (stored) {
            programData = JSON.parse(stored);
          } else if (collegeId) {
            const activeCollege = colleges.find(
              (c) => c.college_id === collegeId || c.id === collegeId
            );
            if (activeCollege?.programs) {
              programData = activeCollege.programs;
            } else if (userID && collegeId) {
              programData = await collegeService.getProgramByCollegeId(
                collegeId
              );
            }
          }
        } else {
          if (userID && collegeId) {
            programData = await collegeService.getProgramByCollegeId(
              collegeId
            );
          }
        }

        setPrograms(Array.isArray(programData) ? programData : []);
      } catch (err) {
        console.error("Failed to load programs:", err);
      }
    };

    if (collegeId || userRole === "SUPERADMIN") {
      fetchPrograms();
    }
  }, [collegeId, userRole, userID, colleges]);

  // Fetch Batches when program changes
  useEffect(() => {
    if (!selectedProgram) {
      setBatches([]);
      setSemesters([]);
      if (!isEdit) {
        setSelectedBatch("");
        setSelectedSemester("");
      }
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await batchService.getBatchByProgramId([selectedProgram]);
        if (Array.isArray(res)) {
          setBatches(res);

          // Extract all semesters from all academic years
          const allSemesters = [];
          res.forEach((batch) => {
            if (batch.academic_years && Array.isArray(batch.academic_years)) {
              batch.academic_years.forEach((ay) => {
                if (ay.semester_divisions && Array.isArray(ay.semester_divisions)) {
                  ay.semester_divisions.forEach((sem) => {
                    allSemesters.push({
                      semester_id: sem.semester_id,
                      name: sem.name || sem.semester_name,
                      semester_number: sem.semester_number,
                      academic_year_id: ay.academic_year_id,
                      batch_id: batch.batch_id,
                    });
                  });
                }
              });
            }
          });

          // Remove duplicates
          const uniqueSemesters = allSemesters.filter(
            (s, i, self) => i === self.findIndex((t) => t.semester_id === s.semester_id)
          );

          setSemesters(uniqueSemesters);
        } else {
          setBatches([]);
          setSemesters([]);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
        setBatches([]);
        setSemesters([]);
      }
    };

    fetchBatches();
  }, [selectedProgram]);

  // Fetch Papers / Courses (same logic as PaperDashboard)
  useEffect(() => {
    const fetchPapers = async () => {
      if (!collegeId) return;

      setLoading(true);
      try {
        const [collegeSubjects, globalSubjects] = await Promise.all([
          courseService.getSubjectsByCollegeId(collegeId),
          courseService.getGlobalSubjectsByCollegeId(collegeId),
        ]);

        let all = [];
        if (Array.isArray(collegeSubjects)) all.push(...collegeSubjects);
        if (Array.isArray(globalSubjects)) all.push(...globalSubjects);

        // Remove duplicates by subject_id
        const unique = all.filter(
          (item, index, self) => index === self.findIndex((t) => t.subject_id === item.subject_id)
        );

        // Optional: enrich with type/mode/specialization names if needed
        const enriched = unique.map((p) => ({
          ...p,
          name: p.subject_name || p.name || "Unnamed Course",
          is_global: p.is_global || p.college_id === null,
        }));

        setPapers(enriched.sort((a, b) => b.subject_id - a.subject_id));
      } catch (err) {
        console.error("Failed to load papers/courses:", err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    if (collegeId) {
      fetchPapers();
    }
  }, [collegeId]);

  const filteredPapers = useMemo(() => {
    if (!selectedSemester) return papers;

    // If your subjects have semester_id field:
    return papers.filter((p) => String(p.semester_id) === String(selectedSemester));
  }, [papers, selectedSemester]);

  // ────────────────────────────────────────────────
  //  CO Logic (remains almost same)
  // ────────────────────────────────────────────────

  // Pre-fill when in edit mode
  useEffect(() => {
    if (isEdit && poData) {
      setSelectedSemester(String(poData.semester_id || ""));
      setSelectedCourse(String(poData.subject_id || ""));
      setSelectedCourses([String(poData.subject_id)]);
      setCourseCoData({
        [String(poData.subject_id)]: [
          {
            co_id: poData.co_id,
            coCode: poData.co_code || "",
            coStatement: poData.co_statement || "",
          },
        ],
      });
    }
  }, [isEdit, poData]);

  useEffect(() => {
    if (!isEdit && selectedCourse && !courseCoData[selectedCourse]) {
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
      setAlert(
        <SweetAlert
          warning
          title="Check Inputs"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Please select semester and course.
        </SweetAlert>
      );
      return;
    }

    const college_id = getActiveCollegeId();
    const coRows = courseCoData[selectedCourse] || [];

    try {
      setLoading(true);

      if (isEdit) {
        // ── UPDATE MODE ──
        for (const co of coRows) {
          if (!co.coCode || !co.coStatement) continue;
          await COService.UpdatecourseOutcomeId(co.co_id, {
            subject_id: Number(selectedCourse),
            semester_id: Number(selectedSemester),
            outcome_code: co.coCode,
            outcome_description: co.coStatement,
          });
        }
        setAlert(
          <SweetAlert
            success
            title="Updated!"
            confirmBtnCssClass="bg-green-600 text-white px-5 py-2 rounded-lg"
            onConfirm={() => { setAlert(null); navigate(-1); }}
          >
            Course Outcomes updated successfully ✅
          </SweetAlert>
        );
      } else {
        // ── ADD MODE ──
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
        setAlert(
          <SweetAlert
            success
            title="Saved"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Course Outcomes saved successfully
          </SweetAlert>
        );
        // reset form after add
        setCourseCoData((prev) => ({
          ...prev,
          [selectedCourse]: [{ coCode: "CO1", coStatement: "" }],
        }));
      }
    } catch (error) {
      console.error("Error saving/updating COs:", error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          {isEdit ? "Failed to update Course Outcomes ❌" : "Failed to save Course Outcomes ❌"}
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? "Edit Course Outcomes (CO)" : "Add Course Outcomes (CO)"}</h2>

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
                {p.program_name}
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
              <option key={b.batch_id} value={b.batch_id}>
                {b.batch_name || b.batch_year || `Batch ${b.batch_id}`}
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
            {semesters
              .filter((s) => !selectedBatch || s.batch_id == selectedBatch)
              .map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.name || `Semester ${s.semester_number}`}
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
            {filteredPapers.map((c) => (
              <option key={c.subject_id} value={c.subject_id}>
                {c.name} {c.paper_code ? `(${c.paper_code})` : ""}
              </option>
            ))}
          </select>
          {loading && <p className="text-sm text-gray-500 mt-1">Loading courses...</p>}
        </div>
      </div>

      {/* CO Input Sections */}
      {selectedCourses.map((courseId) => {
        const course = papers.find((c) => String(c.subject_id) === String(courseId));
        const coRows = courseCoData[courseId] || [];

        return (
          <div key={courseId} className="mb-8 bg-white rounded-lg shadow border">
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-medium">
              {course?.name || "Course"} {course?.paper_code ? `(${course.paper_code})` : ""}
            </div>

            <div className="p-5">
              {coRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="CO Code (e.g. CO1)"
                      value={row.coCode}
                      onChange={(e) => handleCoChange(courseId, idx, "coCode", e.target.value)}
                    />
                  </div>
                  <div className="col-span-8">
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Course Outcome Statement"
                      value={row.coStatement}
                      onChange={(e) => handleCoChange(courseId, idx, "coStatement", e.target.value)}
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
                {isEdit ? "Update COs" : "Save COs"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin-assessment/settings/co")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2.5 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
      {alert}
    </div>
  );
};

export default AddCO;