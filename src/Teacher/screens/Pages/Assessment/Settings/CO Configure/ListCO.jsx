import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit } from "lucide-react";

import { COService } from "../Service/co.service";
import { courseService } from "../../../Content/services/courses.service";
// import { batchService } from "../../../Academics/Services/batch.Service";
import { collegeService } from "../../../Content/services/college.service";
import { useUserProfile } from "../../../../../../contexts/UserProfileContext";
const ListCO = () => {
  const { userID } = useUserProfile();

  /* ===================== STATES ===================== */
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [papers, setPapers] = useState([]);

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

  /* ===================== PROGRAM ===================== */
  useEffect(() => {
    if (!collegeId || !userID) return;

    collegeService
      .getProgrambyUserIdandCollegeId(userID, collegeId)
      .then(res => setPrograms(res || []));
  }, [collegeId, userID]);

  /* ===================== PROGRAM → BATCH → AY → SEM ===================== */
  useEffect(() => {
    if (!selectedProgram) return;

    batchService.getBatchByProgramId([selectedProgram]).then(res => {
      setBatches(res || []);

      const ay = [];
      const sem = [];

      res.forEach(batch => {
        batch.academic_years?.forEach(a => {
          ay.push({
            academic_year_id: a.academic_year_id,
            name: a.name,
            batchId: batch.batch_id
          });

          a.semester_divisions?.forEach(s => {
            sem.push({
              semester_id: s.semester_id,
              semester_name: s.name,
              academicYearId: a.academic_year_id
            });
          });
        });
      });

      setAcademicYears(ay);
      setSemesters(sem);
    });

    setSelectedBatch("");
    setSelectedAcademicYear("");
    setSelectedSemester("");
    setSelectedCourse("");
    setPapers([]);
  }, [selectedProgram]);

  /* ===================== SEMESTER → SUBJECT ===================== */
  useEffect(() => {
    if (!collegeId || !selectedSemester) return;

    Promise.all([
      courseService.getSubjectsByCollegeId(collegeId),
      courseService.getGlobalSubjectsByCollegeId(collegeId)
    ]).then(([collegeSubjects, globalSubjects]) => {
      const all = [...(collegeSubjects || []), ...(globalSubjects || [])];

      const semesterWise = all.filter(
        s => String(s.semester_id) === String(selectedSemester)
      );

      const unique = semesterWise.filter(
        (s, i, self) =>
          i === self.findIndex(x => x.subject_id === s.subject_id)
      );

      setPapers(unique);
    });
  }, [collegeId, selectedSemester]);

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
        is_active: co.is_active
      }));

      setCoRows(mapped);
      setLoading(false);
    });
  }, [collegeId]);

  /* ===================== FINAL FILTER (SAME AS SAVE) ===================== */
  const filteredRows = useMemo(() => {
    return coRows.filter(row => {
      if (selectedCourse && row.subject_id != selectedCourse) return false;
      return true;
    });
  }, [coRows, selectedCourse]);

  /* ===================== PAGINATION ===================== */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  /* ===================== JSX ===================== */
  const handleDeleteCO = async (coId) => {
  if (!window.confirm("Are you sure you want to delete this CO?")) return;

  try {
    setLoading(true);
    await COService.DeleteCourseOutcomeId(coId);

    // Remove deleted CO from the table
    setCoRows(prev => prev.filter(co => co.co_id !== coId));

    setLoading(false);
    alert("CO deleted successfully!");
  } catch (error) {
    console.error("Error deleting CO:", error);
    setLoading(false);
    alert("Failed to delete CO. Please try again.");
  }
};

  return (
    <div className="p-6">
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

        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} className="border p-2 rounded">
          <option value="">Program</option>
          {programs.map(p => (
            <option key={p.program_id} value={p.program_id}>
              {p.program_name}
            </option>
          ))}
        </select>

        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} disabled={!selectedProgram} className="border p-2 rounded">
          <option value="">Batch</option>
          {batches.map(b => (
            <option key={b.batch_id} value={b.batch_id}>
              {b.batch_name}
            </option>
          ))}
        </select>

        <select value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)} disabled={!selectedBatch} className="border p-2 rounded">
          <option value="">Academic Year</option>
          {academicYears
            .filter(a => a.batchId == selectedBatch)
            .map(a => (
              <option key={a.academic_year_id} value={a.academic_year_id}>
                {a.name}
              </option>
            ))}
        </select>

        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} disabled={!selectedAcademicYear} className="border p-2 rounded">
          <option value="">Semester</option>
          {semesters
            .filter(s => s.academicYearId == selectedAcademicYear)
            .map(s => (
              <option key={s.semester_id} value={s.semester_id}>
                {s.semester_name}
              </option>
            ))}
        </select>

        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedSemester} className="border p-2 rounded">
          <option value="">Paper</option>
          {papers.map(p => (
            <option key={p.subject_id} value={p.subject_id}>
              {p.subject_name || p.name}
            </option>
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
                  <Link to="Edit_CO" state={{ isEdit: true, poData: row }}>
                    <button className="p-2 bg-yellow-100 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                    {/* Delete Button */}
          <button
            className="p-2 bg-red-100 rounded hover:bg-red-200"
            onClick={() => handleDeleteCO(row.co_id)}
          >
            Delete
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
