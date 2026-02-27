import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";

import { COService } from "../Service/co.service";
import { batchService } from "../../../Academics/Services/batch.Service";
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
import { useAssessmentFormLogic } from '../../../Assessment/hooks/useAssessmentFormLogic';

const ListCO = () => {
  const { userID } = useUserProfile();
  const [alert, setAlert] = useState(null);

  /* ===================== STATES ===================== */
  const [batches, setBatches] = useState([]);

  const allBatchesRef = useRef([]);
  const allAcademicYearsRef = useRef([]);
  const allSemestersRef = useRef([]);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [coRows, setCoRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== PAGINATION ===================== */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ===================== COLLEGE ID ===================== */
  const getActiveCollegeId = () => {
    const activeCollege = localStorage.getItem("activeCollege");
    if (!activeCollege) return null;
    const parsed = JSON.parse(activeCollege);
    return parsed.college_id || parsed.id;
  };
  const collegeId = getActiveCollegeId();

  /* ===================== useAssessmentFormLogic hook ===================== */
  const hookFormData = useMemo(() => ({
    selectedProgram: String(selectedProgram || ''),
    selectedAcademicSemester: selectedAcademicYear && selectedSemester
      ? `${selectedAcademicYear}-${selectedSemester}`
      : '',
    selectedBatch: String(selectedBatch || ''),
    selectedSubject: String(selectedCourse || ''),
  }), [selectedProgram, selectedAcademicYear, selectedSemester, selectedBatch, selectedCourse]);

  const { options: hookOptions } = useAssessmentFormLogic(hookFormData);

  /* ===================== PROGRAM → BATCH → AY → SEMESTER ===================== */
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

    batchService.getBatchByProgramId([selectedProgram]).then(res => {
      if (!Array.isArray(res)) { setBatches([]); return; }

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

      setBatches(res.map(b => ({ value: b.batch_id, label: b.batch_name || `Batch ${b.batch_id}` })));
    }).catch(err => {
      console.error("Failed to load batches:", err);
      setBatches([]);
    });

    setSelectedBatch("");
    setSelectedAcademicYear("");
    setSelectedSemester("");
    setSelectedCourse("");
    setPapers([]);
  }, [selectedProgram]);

  /* ===================== Derived Academic Years ===================== */
  const academicYears = useMemo(() => {
    if (!selectedBatch) return [];
    const filtered = allAcademicYearsRef.current.filter(ay => String(ay.batchId) === String(selectedBatch));
    const unique = filtered.filter((ay, i, self) => i === self.findIndex(a => a.academic_year_id === ay.academic_year_id));
    return unique.map(ay => ({ value: ay.academic_year_id, label: ay.name }));
  }, [selectedBatch, batches]);

  /* ===================== Derived Semesters ===================== */
  const semesters = useMemo(() => {
    if (!selectedBatch || !selectedAcademicYear) return [];
    const filtered = allSemestersRef.current.filter(
      s => String(s.batch_id) === String(selectedBatch) && String(s.academicYearId) === String(selectedAcademicYear)
    );
    const unique = filtered.filter((s, i, self) => i === self.findIndex(x => x.semester_id === s.semester_id));
    return unique.map(s => ({ value: s.semester_id, label: s.semester_name }));
  }, [selectedBatch, selectedAcademicYear, batches]);

  // Papers come from hookOptions.subjects (teacher-allocated subjects via API)

  /* ===================== GET CO LIST ===================== */
  useEffect(() => {
    if (!collegeId) return;

    setLoading(true);
    COService.getAllCOByCollegeId(collegeId).then(data => {
      const mapped = (data || []).map(co => ({
        co_id: co.course_outcome_id,
        co_code: co.outcome_code,
        co_statement: co.outcome_description,
        subject_id: co.subject_id,
        semester_id: co.semester_id,
        is_active: co.is_active
      }));

      setCoRows(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [collegeId]);

  /* ===================== FINAL FILTER ===================== */
  const filteredRows = useMemo(() => {
    return coRows.filter(row => {
      if (selectedSemester && String(row.semester_id) !== String(selectedSemester)) return false;
      if (selectedCourse && String(row.subject_id) !== String(selectedCourse)) return false;
      return true;
    });
  }, [coRows, selectedSemester, selectedCourse]);

  /* ===================== PAGINATION ===================== */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  /* ===================== DELETE ===================== */
  const handleDeleteCO = (coId) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(coId)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover this CO!
      </SweetAlert>
    );
  };

  const confirmDelete = async (coId) => {
    try {
      setAlert(null);
      setLoading(true);
      await COService.DeleteCourseOutcomeId(coId);
      setCoRows(prev => prev.filter(co => co.co_id !== coId));
      setLoading(false);
      setAlert(
        <SweetAlert success title="Deleted!" onConfirm={() => setAlert(null)}>
          CO deleted successfully!
        </SweetAlert>
      );
    } catch (error) {
      console.error("Error deleting CO:", error);
      setLoading(false);
      setAlert(
        <SweetAlert danger title="Error!" onConfirm={() => setAlert(null)}>
          Failed to delete CO. Please try again.
        </SweetAlert>
      );
    }
  };

  return (
    <div className="p-6">
      {alert}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">CO List</h2>
        <Link
          to="Add_CO"
          className="bg-primary-600 text-white px-4 py-2 rounded text-sm"
        >
          Add CO
        </Link>
      </div>

      {/* ===================== FILTERS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

        {/* Program – from teacher allocation */}
        <select
          value={selectedProgram}
          onChange={e => setSelectedProgram(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Program</option>
          {hookOptions.programs.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* Batch */}
        <select
          value={selectedBatch}
          onChange={e => {
            setSelectedBatch(e.target.value);
            setSelectedAcademicYear("");
            setSelectedSemester("");
            setSelectedCourse("");
          }}
          disabled={!selectedProgram}
          className="border p-2 rounded"
        >
          <option value="">Batch</option>
          {batches.map(b => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>

        {/* Academic Year */}
        <select
          value={selectedAcademicYear}
          onChange={e => {
            setSelectedAcademicYear(e.target.value);
            setSelectedSemester("");
            setSelectedCourse("");
          }}
          disabled={!selectedBatch}
          className="border p-2 rounded"
        >
          <option value="">Academic Year</option>
          {academicYears.map(ay => (
            <option key={ay.value} value={ay.value}>{ay.label}</option>
          ))}
        </select>

        {/* Semester */}
        <select
          value={selectedSemester}
          onChange={e => {
            setSelectedSemester(e.target.value);
            setSelectedCourse("");
          }}
          disabled={!selectedAcademicYear}
          className="border p-2 rounded"
        >
          <option value="">Semester</option>
          {semesters.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Paper */}
        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          disabled={!selectedSemester}
          className="border p-2 rounded"
        >
          <option value="">Paper</option>
          {hookOptions.subjects.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* ===================== TABLE ===================== */}
      <table className="w-full border">
        <thead className="bg-primary-600 text-white">
          <tr>
            <th className="p-3 border">CO Code</th>
            <th className="p-3 border">CO Statement</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="3" className="p-6 text-center">Loading...</td></tr>
          ) : currentItems.length === 0 ? (
            <tr><td colSpan="3" className="p-6 text-center">No CO Found</td></tr>
          ) : (
            currentItems.map(row => (
              <tr key={row.co_id} className="hover:bg-gray-50">
                <td className="p-3 border text-center">{row.co_code}</td>
                <td className="p-3 border">{row.co_statement}</td>
                <td className="p-3 border text-center">
                  <Link to="Add_CO" state={{ isEdit: true, poData: row }}>
                    <button className="p-2 bg-yellow-100 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    className="p-2 bg-red-100 rounded hover:bg-red-200 ml-1"
                    onClick={() => handleDeleteCO(row.co_id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===================== PAGINATION ===================== */}
      {filteredRows.length > 0 && (
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>

          <span className="text-sm">
            Showing {indexOfFirstItem + 1}–
            {Math.min(indexOfLastItem, filteredRows.length)} of {filteredRows.length}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ListCO;
