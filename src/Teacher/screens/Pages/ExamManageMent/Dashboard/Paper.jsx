import React, { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import SweetAlert from "react-bootstrap-sweetalert";
import { examPaperService } from "../Services/ExamPaper.Service";
import EditPaper from "../Component/EditPaper";

const Paper = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit state
  const [editingPaper, setEditingPaper] = useState(null);

  // delete alert state
  const [alert, setAlert] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const collegeId = activeCollege?.id;
  const teacherId = userProfile?.teacher_id;

  // ─────────────────────────────────────────────
  // Fetch papers
  // ─────────────────────────────────────────────
  const fetchPapers = async () => {
    if (!collegeId || !teacherId) return;

    try {
      setLoading(true);
      const res = await examPaperService.getPaperByCollegeTeacher(
        collegeId,
        teacherId
      );
      setPapers(res || []);
    } catch (err) {
      console.error("Failed to fetch papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [collegeId, teacherId]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-GB");

  const formatTime = (value) =>
    new Date(value).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─────────────────────────────────────────────
  // Delete handlers
  // ─────────────────────────────────────────────
  const confirmDelete = (id) => {
    setDeleteId(id);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete"
        confirmBtnBsStyle="danger"
        title="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone.
      </SweetAlert>
    );
  };

  const handleDelete = async () => {
    try {
      await examPaperService.deleteExamPaper(deleteId);
      setPapers((prev) =>
        prev.filter((p) => p.exam_paper_id !== deleteId)
      );
      setAlert(
        <SweetAlert success title="Deleted">
          Exam paper deleted successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert danger title="Error">
          Failed to delete exam paper.
        </SweetAlert>
      );
    }
  };

  // ─────────────────────────────────────────────
  // EDIT MODE → show EditPaper
  // ─────────────────────────────────────────────
  if (editingPaper) {
    return (
      <EditPaper
        paper={editingPaper}
        onCancel={() => setEditingPaper(null)}
        onSuccess={() => {
          setEditingPaper(null);
          fetchPapers();
        }}
      />
    );
  }

  // ─────────────────────────────────────────────
  // TABLE UI
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {alert}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="table-header">
            <tr className="bg-[#2162c1] text-white text-left">
              <th className="px-4 py-3 bg-[#2162c1] text-white">Exam Schedule</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper Name</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Program</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Semester</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Paper</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Date</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Time</th>
              <th className="px-4 py-3 bg-[#2162c1] text-white">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : papers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  No matching records found
                </td>
              </tr>
            ) : (
              papers.map((paper) => (
                <tr
                  key={paper.exam_paper_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    {paper.exam_schedule_name}
                  </td>
                  <td className="px-6 py-4">{paper.paper_name}</td>
                  <td className="px-6 py-4">
                    {paper.academic_year?.program_name}
                  </td>
                  <td className="px-6 py-4">
                    {paper.semester?.name}
                  </td>
                  <td className="px-6 py-4">{paper.subject_name}</td>
                  <td className="px-6 py-4">
                    {formatDate(paper.start_date_time)}
                  </td>
                  <td className="px-6 py-4">
                    {formatTime(paper.start_date_time)}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <EyeIcon className="h-5 w-5 text-blue-600" />
                    </button>

                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={() => setEditingPaper(paper)}
                    >
                      <PencilSquareIcon className="h-5 w-5 text-green-600" />
                    </button>

                    <button
                      className="p-2 hover:bg-gray-100 rounded"
                      onClick={() =>
                        confirmDelete(paper.exam_paper_id)
                      }
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between px-6 py-4">
          <p className="text-gray-500">
            Showing {papers.length} entries
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paper;
