import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, ChevronDown, X ,Eye} from "lucide-react";

const StudentProject = () => {
  const [gradeData, setGradeData] = useState([]);
  const [divisionData, setDivisionData] = useState([]);
  const [teacherSubject, setTeacherSubject] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedGradeDivisionId, setSelectedGradeDivisionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subTabIndex, setSubTabIndex] = useState(0);
  const [selectedCurriculums, setSelectedCurriculums] = useState([]);
  const [openChapterIndex, setOpenChapterIndex] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleViewPdf = () => {
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
  };

  // Dummy Data
  const dummyGrades = [
    {
      grade_division: {
        grade: { grade_id: "1", name: "Grade 1" },
        class_data: { class_data_id: "1", name_data: "Class A" },
      },
    },
    {
      grade_division: {
        grade: { grade_id: "2", name: "Grade 2" },
        class_data: { class_data_id: "2", name_data: "Class B" },
      },
    },
  ];

  const dummyDivisions = [
    { grade_division_id: "1", division_id: "1", division_name: "Division A" },
    { grade_division_id: "2", division_id: "2", division_name: "Division B" },
  ];

  const dummySubjects = [
    { subject_id: "1", name: "Mathematics", color_code: "#FF6B6B" },
    { subject_id: "2", name: "Science", color_code: "#4ECDC4" },
    { subject_id: "3", name: "English", color_code: "#45B7D1" },
  ];

  const dummyCurriculums = [
    {
      chapter: { chapter_id: "1", label: "Chapter 1: Introduction" },
      topics: [
        {
          topic_id: "1",
          label: "Topic 1.1: Basics",
          curriculums: [
            {
              curriculum_id: "1",
              content_title: "Introduction to Mathematics",
              curriculum_type: { label: "Video" },
              curriculum_level: { name: "Beginner" },
              curriculum_read_time: "15 Min",
              lock_by_superadmin: false,
              name: "math_intro",
            },
            {
              curriculum_id: "2",
              content_title: "Basic Mathematical Operations",
              curriculum_type: { label: "Text" },
              curriculum_level: { name: "Beginner" },
              curriculum_read_time: "20 Min",
              lock_by_superadmin: true,
              name: "basic_operations",
            },
          ],
        },
      ],
    },
  ];

  // Mock API Functions
  const getGradeDivisions = () => {
    setTimeout(() => {
      setGradeData(dummyGrades);
      setSelectedGradeId(dummyGrades[0].grade_division.grade.grade_id);
      setSelectedClassId(dummyGrades[0].grade_division.class_data.class_data_id);
      getDivisionData(dummyGrades[0].grade_division.grade.grade_id);
    }, 500);
  };

  const getDivisionData = (gradeId) => {
    setSelectedGradeId(gradeId);
    setTimeout(() => {
      setDivisionData(dummyDivisions);
      setSelectedGradeDivisionId("");
      setTeacherSubject([]);
      setSelectedCurriculums([]);
    }, 300);
  };

  const handleDivisionChangeEvent = (gradeDivId) => {
    setSelectedGradeDivisionId(gradeDivId);
    setTeacherSubject(dummySubjects);
    setSelectedCurriculums([]);
  };

  const getContentSubjectWise = (subjectId, index) => {
    setSubTabIndex(index);
    setSelectedSubjectId(subjectId);
    setSelectedCurriculums(dummyCurriculums);
  };

  const toggleChapter = (index) => {
    setOpenChapterIndex(openChapterIndex === index ? null : index);
  };

  useEffect(() => {
    getGradeDivisions();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-semibold">+</span>
            </div>
            <h1 className="pageheading">Student Project</h1>
          </div>
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Button */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-200 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Grade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => getDivisionData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Grade</option>
                  {gradeData.map((g, i) => (
                    <option key={i} value={g.grade_division.grade.grade_id}>
                      {g.grade_division.grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Class</option>
                  {gradeData.map((g, i) => (
                    <option
                      key={i}
                      value={g.grade_division.class_data.class_data_id}
                    >
                      {g.grade_division.class_data.name_data}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Division
                </label>
                <select
                  value={selectedGradeDivisionId}
                  onChange={(e) => handleDivisionChangeEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select Division</option>
                  {divisionData.map((d, i) => (
                    <option key={i} value={d.grade_division_id}>
                      {d.division_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Subject Tabs */}
        {selectedGradeDivisionId && teacherSubject.length > 0 && (
          <div className="mb-4">
            {teacherSubject.map((subject, index) => (
              <button
                key={index}
                onClick={() => getContentSubjectWise(subject.subject_id, index)}
                style={{
                  padding: "8px 12px",
                  marginRight: "5px",
                  border: `1px solid ${subject.color_code}`,
                  borderRadius: "6px",
                  backgroundColor:
                    subTabIndex === index ? subject.color_code : "#fff",
                  color: subTabIndex === index ? "#fff" : subject.color_code,
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}

        {/* Curriculum Accordion */}
        {selectedCurriculums.length > 0 ? (
          selectedCurriculums.map((chapter, ci) => (
            <div
              key={ci}
              className="border border-gray-300 rounded-lg mb-3 overflow-hidden"
            >
              <div
                onClick={() => toggleChapter(ci)}
                className="flex justify-between items-center bg-gray-100 px-4 py-3 cursor-pointer font-semibold"
              >
                {chapter.chapter.label}
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    openChapterIndex === ci ? "rotate-180" : ""
                  }`}
                />
              </div>

              {openChapterIndex === ci && (
                <div className="p-4 bg-white">
                  {chapter.topics.map((topic, ti) => (
                    <div key={ti} className="mb-4">
                      <div className="font-semibold mb-2">{topic.label}</div>
                      {topic.curriculums.map((cur, cidx) => (
  <div
    key={cidx}
    className="ml-4 mb-2 text-gray-700 text-sm flex justify-between items-center"
  >
    <span>
      {cur.content_title} ({cur.curriculum_type.label})
    </span>
    {!cur.lock_by_superadmin && (
      <button
        onClick={handleViewPdf}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
    )}
  </div>
))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          selectedGradeDivisionId && <div>No Data Found!</div>
        )}
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Topic 1.1: Basics</h3>
              <button
                onClick={closePdfModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center bg-gray-50 mb-4">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">PDF Document Preview</p>
                  <p className="text-gray-500 text-sm mt-2">Testing-1_Study_Materials.pdf</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Download PDF
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProject;
