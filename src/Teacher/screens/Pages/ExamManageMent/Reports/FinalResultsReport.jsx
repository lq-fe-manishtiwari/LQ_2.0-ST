import React, { useEffect, useState, useMemo } from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
// import { examReportService } from "../Services/ExamReports.Service";

const FinalResultsReport = ({ academicYearId, semesterId, divisionId, examForTypeId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const entriesPerPage = 10;
  const totalEntries = rows.length;
  
  // Pagination calculations
  const totalPages = Math.ceil(rows.length / entriesPerPage);
  const displayPage = currentPage + 1;
  const indexOfFirst = currentPage * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, rows.length);
  
  const handlePrev = () => displayPage > 1 && setCurrentPage(displayPage - 2);
  const handleNext = () => displayPage < totalPages && setCurrentPage(displayPage);
  const isNextDisabled = rows.length <= entriesPerPage || displayPage >= totalPages;

  // Paginated data
  const paginatedRows = useMemo(() => {
    const start = currentPage * entriesPerPage;
    return rows.slice(start, start + entriesPerPage);
  }, [rows, currentPage]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  /* ================= FETCH ON FILTERS CHANGE ================= */
  useEffect(() => {
    if (academicYearId && semesterId && divisionId && examForTypeId) {
      fetchResults();
    } else {
      setRows([]);
    }
  }, [academicYearId, semesterId, divisionId, examForTypeId]);

const fetchResults = async () => {
  try {
    setLoading(true);

    const res = await examReportService.getFinalExamResults(
      academicYearId,
      semesterId,
      divisionId,
      examForTypeId
    );

    /* ===== STUDENT LEVEL RESULTS ===== */
    const mappedRows = res?.map(student => ({
      rollNo: student.roll_number,
      prn: student.permanent_registration_number,
      studentName: student.student_name,
      subject: "—", // No subject data in API
      marks: student.total_marks_obtained,
      totalMarks: student.total_marks,
      status: student.result_status,
      percentage: student.percentage,
      cgpa: student.cgpa,
      grade: student.grade,
    })) || [];

    setRows(mappedRows);
  } catch (err) {
    console.error("Failed to fetch final results", err);
    setRows([]);
  } finally {
    setLoading(false);
  }
};


  /* ================= EXCEL DOWNLOAD ================= */
  const downloadExcel = () => {
    if (!rows.length) return;

    const excelData = [
      ["Final Examination Results"],
      [],
      [
        "Roll No",
        "PRN",
        "Student Name",
        "Subject",
        "Marks Obtained",
        "Total Marks",
        "Result Status",
      ],
      ...rows.map((r) => [
        r.rollNo,
        r.prn,
        r.studentName,
        r.subject,
        r.marks,
        r.totalMarks,
        r.status,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 18 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Final Results");

    XLSX.writeFile(workbook, "Final_Results.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {rows.length > 0 && (
            <>
              Showing <strong>{indexOfFirst + 1}</strong>–<strong>{indexOfLast}</strong> of{" "}
              <strong>{totalEntries}</strong> entries
            </>
          )}
        </span>
        
        <button
          onClick={downloadExcel}
          disabled={!rows.length}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading results...</p>
        ) : rows.length ? (
          <>
            <table className="min-w-full border-collapse">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">PRN</th>
                  <th className="px-4 py-3">Student Name</th>
                  {/* <th className="px-4 py-3">Subject</th> */}
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((r, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{r.rollNo}</td>
                    <td className="px-4 py-2">{r.prn}</td>
                    <td className="px-4 py-2">{r.studentName}</td>
                    {/* <td className="px-4 py-2">{r.subject}</td> */}
                    <td className="px-4 py-2">{r.marks}</td>
                    <td className="px-4 py-2">{r.totalMarks}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          r.status === "PRESENT"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {rows.length > entriesPerPage && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
                <button
                  onClick={handlePrev}
                  disabled={displayPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${
                    displayPage === 1
                      ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm font-medium text-gray-700">
                  Page <strong>{displayPage}</strong> of <strong>{totalPages}</strong>
                </span>
                
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${
                    isNextDisabled
                      ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-6 text-center text-gray-500">
            Select academic year, semester, division and exam type to view results
          </p>
        )}
      </div>
    </div>
  );
};

export default FinalResultsReport;