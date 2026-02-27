import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { batchService } from "../../../Academics/Services/batch.Service";
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
import { useAssessmentFormLogic } from '../../../Assessment/hooks/useAssessmentFormLogic';
import { COService } from "../Service/co.service";
import SweetAlert from "react-bootstrap-sweetalert";

const EditCO = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEdit, poData } = location.state || {};
  const { userID } = useUserProfile();

  // ─── filter states ───
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [batches, setBatches] = useState([]);

  const allBatchesRef = useRef([]);
  const allAcademicYearsRef = useRef([]);
  const allSemestersRef = useRef([]);

  // ─── CO form states ───
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseCoData, setCourseCoData] = useState({});
  const [coValidationErrors, setCoValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // ─── College ID ───
  const getActiveCollegeId = () => {
    try {
      const activeCollege = localStorage.getItem("activeCollege");
      if (activeCollege) {
        const parsed = JSON.parse(activeCollege);
        return parsed.college_id || parsed.id || parsed.collegeId;
      }
      return null;
    } catch (e) {
      return null;
    }
  };
  const collegeId = getActiveCollegeId();

  // ─── useAssessmentFormLogic hook ───
  const hookFormData = useMemo(() => ({
    selectedProgram: String(selectedProgram || ''),
    selectedAcademicSemester: selectedAcademicYear && selectedSemester
      ? `${selectedAcademicYear}-${selectedSemester}`
      : '',
    selectedBatch: String(selectedBatch || ''),
    selectedSubject: String(selectedCourse || ''),
  }), [selectedProgram, selectedAcademicYear, selectedSemester, selectedBatch, selectedCourse]);

  const { options: hookOptions } = useAssessmentFormLogic(hookFormData);

  // ─── Program → Batches / AY / Semesters ───
  useEffect(() => {
    if (!selectedProgram) {
      setBatches([]);
      allBatchesRef.current = [];
      allAcademicYearsRef.current = [];
      allSemestersRef.current = [];
      setSelectedBatch("");
      setSelectedAcademicYear("");
      setSelectedSemester("");
      setSelectedCourse("");
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await batchService.getBatchByProgramId([selectedProgram]);
        if (Array.isArray(res)) {
          const extractedAYs = [];
          const extractedSems = [];

          res.forEach(batch => {
            batch.academic_years?.forEach(ay => {
              extractedAYs.push({
                academic_year_id: ay.academic_year_id,
                name: ay.name,
                batchId: batch.batch_id,
              });
              ay.semester_divisions?.forEach(sem => {
                extractedSems.push({
                  semester_id: sem.semester_id,
                  semester_name: sem.name || sem.semester_name,
                  academicYearId: ay.academic_year_id,
                  batch_id: batch.batch_id,
                });
              });
            });
          });

          allBatchesRef.current = res;
          allAcademicYearsRef.current = extractedAYs;
          allSemestersRef.current = extractedSems;

          setBatches(res.map(b => ({ value: b.batch_id, label: b.batch_name || b.batch_year || `Batch ${b.batch_id}` })));
        } else {
          setBatches([]);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);
        setBatches([]);
      }
    };

    fetchBatches();
  }, [selectedProgram]);

  // ─── Derived Academic Years ───
  const academicYears = useMemo(() => {
    if (!selectedBatch) return [];
    const filtered = allAcademicYearsRef.current.filter(ay => String(ay.batchId) === String(selectedBatch));
    const unique = filtered.filter((ay, i, self) => i === self.findIndex(a => a.academic_year_id === ay.academic_year_id));
    return unique.map(ay => ({ value: ay.academic_year_id, label: ay.name }));
  }, [selectedBatch, batches]);

  // ─── Derived Semesters ───
  const semesters = useMemo(() => {
    if (!selectedBatch || !selectedAcademicYear) return [];
    const filtered = allSemestersRef.current.filter(
      s => String(s.batch_id) === String(selectedBatch) && String(s.academicYearId) === String(selectedAcademicYear)
    );
    const unique = filtered.filter((s, i, self) => i === self.findIndex(x => x.semester_id === s.semester_id));
    return unique.map(s => ({ value: s.semester_id, label: s.semester_name }));
  }, [selectedBatch, selectedAcademicYear, batches]);

  // Papers come from hookOptions.subjects (teacher-allocated subjects via API)

  // ─── Pre-fill when in edit mode ───
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
    if (selectedCourse && !courseCoData[selectedCourse]) {
      setCourseCoData(prev => ({
        ...prev,
        [selectedCourse]: [{ coCode: "CO1", coStatement: "" }],
      }));
    }
    if (selectedCourse && !selectedCourses.includes(selectedCourse)) {
      setSelectedCourses(prev => [...prev, selectedCourse]);
    }
  }, [selectedCourse]);

  // ─── CO helpers ───
  const addCoRow = (courseId) => {
    setCourseCoData(prev => {
      const existing = prev[courseId] || [];
      return { ...prev, [courseId]: [...existing, { coCode: `CO${existing.length + 1}`, coStatement: "" }] };
    });
  };

  const removeCoRow = (courseId, rowIndex) => {
    setCourseCoData(prev => {
      const updated = { ...prev };
      if (updated[courseId]?.length > 1) updated[courseId].splice(rowIndex, 1);
      return updated;
    });
  };

  const handleCoChange = (courseId, rowIndex, field, value) => {
    setCourseCoData(prev => {
      const updated = { ...prev };
      updated[courseId][rowIndex][field] = value;
      return updated;
    });
    if (value.trim() !== "") {
      setCoValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${courseId}-${rowIndex}-${field}`];
        return newErrors;
      });
    }
  };

  const validateCoFields = () => {
    const errors = {};
    let isValid = true;
    Object.keys(courseCoData).forEach(courseId => {
      courseCoData[courseId].forEach((co, index) => {
        if (!co.coCode || co.coCode.trim() === "") {
          errors[`${courseId}-${index}-coCode`] = "CO Code is required";
          isValid = false;
        }
        if (!co.coStatement || co.coStatement.trim() === "") {
          errors[`${courseId}-${index}-coStatement`] = "CO Statement is required";
          isValid = false;
        }
      });
    });
    setCoValidationErrors(errors);
    return isValid;
  };

  const handleCourseUpdate = async () => {
    if (!validateCoFields()) return;
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

    try {
      setLoading(true);
      const coRows = courseCoData[selectedCourse] || [];
      for (const co of coRows) {
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
          CO updated successfully! ✅
        </SweetAlert>
      );
    } catch (err) {
      console.error("Error updating CO:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          confirmBtnCssClass="bg-red-600 text-white px-5 py-2 rounded-lg"
          onConfirm={() => setAlert(null)}
        >
          Failed to update CO. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin-assessment/settings/co")}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-400 rounded px-3 py-1.5 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold">Edit Course Outcomes (CO)</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 bg-white p-6 rounded-lg shadow border">

        {/* Program */}
        <div>
          <label className="block mb-2 font-medium">Program</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedProgram}
            onChange={e => {
              setSelectedProgram(e.target.value);
              setSelectedBatch("");
              setSelectedAcademicYear("");
              setSelectedSemester("");
              setSelectedCourse("");
            }}
          >
            <option value="">Select Program</option>
            {hookOptions.programs.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Batch */}
        <div>
          <label className="block mb-2 font-medium">Batch</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedBatch}
            onChange={e => {
              setSelectedBatch(e.target.value);
              setSelectedAcademicYear("");
              setSelectedSemester("");
              setSelectedCourse("");
            }}
            disabled={!selectedProgram}
          >
            <option value="">Select Batch</option>
            {batches.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block mb-2 font-medium">Academic Year</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedAcademicYear}
            onChange={e => {
              setSelectedAcademicYear(e.target.value);
              setSelectedSemester("");
              setSelectedCourse("");
            }}
            disabled={!selectedBatch}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map(ay => (
              <option key={ay.value} value={ay.value}>{ay.label}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block mb-2 font-medium">Semester</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedSemester}
            onChange={e => {
              setSelectedSemester(e.target.value);
              setSelectedCourse("");
            }}
            disabled={!selectedAcademicYear}
          >
            <option value="">Select Semester</option>
            {semesters.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Paper */}
        <div>
          <label className="block mb-2 font-medium">Paper</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            disabled={!selectedSemester || loading}
          >
            <option value="">Select Paper</option>
            {hookOptions.subjects.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {loading && <p className="text-sm text-gray-500 mt-1">Loading...</p>}
        </div>
      </div>

      {/* CO Rows */}
      {selectedCourses.map(courseId => {
        const course = hookOptions.subjects.find(s => String(s.value) === String(courseId));
        const coRows = courseCoData[courseId] || [];

        return (
          <div key={courseId} className="mb-8 bg-white rounded-lg shadow border">
            <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-medium">
              {course?.label || "Course"}
            </div>
            <div className="p-5">
              {coRows.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="CO Code (e.g. CO1)"
                      value={row.coCode}
                      onChange={e => handleCoChange(courseId, rowIndex, "coCode", e.target.value)}
                    />
                    {coValidationErrors[`${courseId}-${rowIndex}-coCode`] && (
                      <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coCode`]}</div>
                    )}
                  </div>
                  <div className="col-span-8">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Course Outcome Statement"
                      value={row.coStatement}
                      onChange={e => handleCoChange(courseId, rowIndex, "coStatement", e.target.value)}
                    />
                    {coValidationErrors[`${courseId}-${rowIndex}-coStatement`] && (
                      <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coStatement`]}</div>
                    )}
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
                      onClick={() => removeCoRow(courseId, rowIndex)}
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
                onClick={handleCourseUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded font-medium"
              >
                Update COs
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin-assessment/settings/co')}
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

export default EditCO;
