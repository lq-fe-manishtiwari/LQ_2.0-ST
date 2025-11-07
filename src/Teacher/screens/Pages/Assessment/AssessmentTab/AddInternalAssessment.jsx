'use client';

import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { Search, Calendar, Clock, CheckCircle, ChevronDown, Filter, X } from "lucide-react";
import assesment_logo from "@/_assets/images_new_design/Assessment_logo.svg";

// Mock Data
const mockGrades = [
  { grade_id: "1", name: "Grade 1" },
  { grade_id: "2", name: "Grade 2" },
];
const mockDivisions = [
  { grade_division_id: "d1", division: { name: "A" } },
  { grade_division_id: "d2", division: { name: "B" } },
];
const mockSubjects = [
  { subject_id: "s1", name: "Maths" },
  { subject_id: "s2", name: "Science" },
];
const mockChapters = [
  { chapter_id: "c1", label: "Chapter 1" },
  { chapter_id: "c2", label: "Chapter 2" },
];
const mockTopics = [
  { topic_id: "t1", label: "Topic 1" },
  { topic_id: "t2", label: "Topic 2" },
];
const mockQuestionLevels = [
  { question_level_id: "easy", question_level_type: "EASY" },
  { question_level_id: "medium", question_level_type: "MEDIUM" },
  { question_level_id: "hard", question_level_type: "HARD" },
];
const mockQuestions = [
  {
    question_id: "q1",
    question: "<p>What is 2 + 2?</p>",
    question_level: { question_level_type: "EASY" },
    objective_subjective_type: "Objective",
    option1: "3", option2: "4", option3: "5", option4: "6",
    chapter: { label: "Chapter 1" },
    topic: { label: "Topic 1" },
    default_weight_age: 1,
    question_images: [],
  },
  {
    question_id: "q2",
    question: "<p>Define photosynthesis.</p>",
    question_level: { question_level_type: "MEDIUM" },
    objective_subjective_type: "Subjective",
    option1: null, option2: null, option3: null, option4: null,
    chapter: { label: "Chapter 1" },
    topic: { label: "Topic 2" },
    default_weight_age: 3,
    question_images: [],
  },
];

// Color Mapping
const levelColors = {
  EASY: "bg-green-500",
  MEDIUM: "bg-amber-500",
  HARD: "bg-red-500",
};

export default function AddInternalAssessment() {
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTestCategory, setSelectedTestCategory] = useState("Objective");
  const [selectedQuestionLevelId, setSelectedQuestionLevelId] = useState("");
  const [selectedQuestionFilterId, setSelectedQuestionFilterId] = useState("");
  const [testDate, setTestDate] = useState(moment().add(2, "m").toDate());
  const [testLastDate, setTestLastDate] = useState(moment().add(1, "d").add(2, "m").toDate());
  const [timeLimit, setTimeLimit] = useState("");
  const [proctoring, setProctoring] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [noofQuestionSelected, setNoofQuestionSelected] = useState(0);
  const [noofEasyQuestionSelected, setNoofEasyQuestionSelected] = useState(0);
  const [noofMediumQuestionSelected, setNoofMediumQuestionSelected] = useState(0);
  const [noofHardQuestionSelected, setNoofHardQuestionSelected] = useState(0);
  const [selectAll, setSelectAll] = useState(false);
  const [classViewActive, setClassViewActive] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some((ref) => ref?.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ───────────────────── Custom Select Component ─────────────────────
  const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, fieldName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    dropdownRefs.current[fieldName] = dropdownRef.current;

    const handleSelect = (option) => {
      onChange(option);
      setIsOpen(false);
      setOpenDropdown(null);
    };

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
      <div ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <div className="relative">
          <div
            className={`w-full px-3 py-2 border rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150 cursor-pointer ${
              disabled
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white border-gray-300 hover:border-blue-400"
            }`}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={value ? "text-gray-900" : "text-gray-400"}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          {isOpen && !disabled && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect("")}
              >
                {placeholder}
              </div>
              {options.map((option) => {
                const val = option.grade_division_id || option.subject_id || option.chapter_id || option.topic_id || option.question_level_id || option;
                const label = option.division?.name || option.name || option.label || option.question_level_type || option;
                return (
                  <div
                    key={val}
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleSelect(val)}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ───────────────────── Filter Questions ─────────────────────
  const applyFilters = () => {
    let list = [...mockQuestions];

    if (selectedChapter) {
      list = list.filter(q => q.chapter.label === mockChapters.find(c => c.chapter_id === selectedChapter)?.label);
    }
    if (selectedTopic) {
      list = list.filter(q => q.topic.label === mockTopics.find(t => t.topic_id === selectedTopic)?.label);
    }
    if (selectedTestCategory && selectedTestCategory !== "Mixed") {
      list = list.filter(q => q.objective_subjective_type === selectedTestCategory);
    }
    if (selectedQuestionLevelId) {
      const level = mockQuestionLevels.find(l => l.question_level_id === selectedQuestionLevelId)?.question_level_type;
      list = list.filter(q => q.question_level.question_level_type === level);
    }

    setFilteredQuestions(list.map(q => ({
      ...q,
      checked: selectedQuestions.some(s => s.question_id === q.question_id && s.selected)
    })));
  };

  useEffect(() => {
    applyFilters();
  }, [selectedChapter, selectedTopic, selectedTestCategory, selectedQuestionLevelId, selectedQuestions]);

  // ───────────────────── Handlers ─────────────────────
  const handleGradeChange = (val) => {
    setSelectedGradeId(val);
    setSelectedDivisionId("");
    setSelectedSubject("");
    resetFilters();
  };

  const handleDivisionChange = (val) => {
    setSelectedDivisionId(val);
    setSelectedSubject("");
    resetFilters();
  };

  const handleSubjectChange = (val) => {
    setSelectedSubject(val);
    setSelectedChapter("");
    setSelectedTopic("");
    setFilteredQuestions(mockQuestions);
    setSelectedQuestions([]);
    resetCounts();
  };

  const resetFilters = () => {
    setSelectedChapter("");
    setSelectedTopic("");
    setFilteredQuestions([]);
    setSelectedQuestions([]);
    resetCounts();
  };

  const resetCounts = () => {
    setNoofQuestionSelected(0);
    setNoofEasyQuestionSelected(0);
    setNoofMediumQuestionSelected(0);
    setNoofHardQuestionSelected(0);
    setSelectAll(false);
  };

  const toggleSelectAll = (checked) => {
    setSelectAll(checked);
    const updated = filteredQuestions.map(q => ({ question_id: q.question_id, selected: checked }));
    setSelectedQuestions(updated);

    if (checked) {
      const easy = filteredQuestions.filter(q => q.question_level.question_level_type === "EASY").length;
      const med = filteredQuestions.filter(q => q.question_level.question_level_type === "MEDIUM").length;
      const hard = filteredQuestions.filter(q => q.question_level.question_level_type === "HARD").length;
      setNoofQuestionSelected(filteredQuestions.length);
      setNoofEasyQuestionSelected(easy);
      setNoofMediumQuestionSelected(med);
      setNoofHardQuestionSelected(hard);
    } else {
      resetCounts();
    }
  };

  const toggleQuestion = (q, checked) => {
    const updated = selectedQuestions.filter(s => s.question_id !== q.question_id);
    if (checked) updated.push({ question_id: q.question_id, selected: true });

    setSelectedQuestions(updated);
    setNoofQuestionSelected(prev => checked ? prev + 1 : prev - 1);
    if (q.question_level.question_level_type === "EASY") setNoofEasyQuestionSelected(prev => checked ? prev + 1 : prev - 1);
    if (q.question_level.question_level_type === "MEDIUM") setNoofMediumQuestionSelected(prev => checked ? prev + 1 : prev - 1);
    if (q.question_level.question_level_type === "HARD") setNoofHardQuestionSelected(prev => checked ? prev + 1 : prev - 1);
  };

  const changeTimeLimit = (mins) => {
    setTimeLimit(mins);
    const end = moment(testDate).add(parseInt(mins || "0"), "m").toDate();
    setTestLastDate(end);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <Formik
        initialValues={{
          title: "",
          grade: "",
          grade_division_id: "",
          subject_id: "",
          chapter_id: "",
          topic_id: "",
          test_category: "Objective",
          test_duration: "",
        }}
        onSubmit={(values, { setSubmitting }) => {
          alert("Assessment Created (Demo Mode)");
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form className="space-y-6 md:space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center p-2">
                <img src={assesment_logo} alt="Assessment" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 w-full">
                <Field
                  name="title"
                  placeholder="Enter Assessment Title"
                  className="w-full text-2xl font-bold text-gray-800 placeholder-gray-400 border-0 focus:outline-none"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search questions"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 border-b pb-4">
              <button
                type="button"
                onClick={() => setClassViewActive(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  classViewActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Class
              </button>
              <button
                type="button"
                onClick={() => setClassViewActive(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  !classViewActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                Home
              </button>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
              >
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Filter Questions</span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 transition-transform ${
                    filterOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {filterOpen && (
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CustomSelect
                      label="Program"
                      value={mockGrades.find(g => g.grade_id === selectedGradeId)?.name || ""}
                      options={mockGrades}
                      placeholder="Select Program"
                      fieldName="grade"
                      onChange={(val) => {
                        setFieldValue("grade", val);
                        handleGradeChange(val);
                      }}
                    />
                    <CustomSelect
                      label="Division"
                      value={mockDivisions.find(d => d.grade_division_id === selectedDivisionId)?.division.name || ""}
                      options={[{ grade_division_id: "All", division: { name: "All" } }, ...mockDivisions]}
                      placeholder="Select Division"
                      fieldName="division"
                      onChange={(val) => {
                        setFieldValue("grade_division_id", val);
                        handleDivisionChange(val);
                      }}
                    />
                    <CustomSelect
                      label="Paper"
                      value={mockSubjects.find(s => s.subject_id === selectedSubject)?.name || ""}
                      options={mockSubjects}
                      placeholder="Select Paper"
                      fieldName="subject"
                      onChange={(val) => {
                        setFieldValue("subject_id", val);
                        handleSubjectChange(val);
                      }}
                    />
                    <CustomSelect
                      label="Category"
                      value={selectedTestCategory}
                      options={["Objective", "Subjective", "Coding", "Mixed"]}
                      placeholder="Select Category"
                      fieldName="category"
                      onChange={(val) => {
                        setFieldValue("test_category", val);
                        setSelectedTestCategory(val);
                      }}
                    />
                    <CustomSelect
                      label="Module"
                      value={mockChapters.find(c => c.chapter_id === selectedChapter)?.label || ""}
                      options={mockChapters}
                      placeholder="All Modules"
                      fieldName="chapter"
                      onChange={(val) => {
                        setSelectedChapter(val);
                        setFieldValue("chapter_id", val);
                      }}
                    />
                    <CustomSelect
                      label="Unit"
                      value={mockTopics.find(t => t.topic_id === selectedTopic)?.label || ""}
                      options={mockTopics}
                      placeholder="All Units"
                      fieldName="topic"
                      onChange={(val) => {
                        setSelectedTopic(val);
                        setFieldValue("topic_id", val);
                      }}
                    />
                    <CustomSelect
                      label="Level"
                      value={mockQuestionLevels.find(l => l.question_level_id === selectedQuestionLevelId)?.question_level_type || ""}
                      options={mockQuestionLevels}
                      placeholder="All Levels"
                      fieldName="level"
                      onChange={setSelectedQuestionLevelId}
                    />
                    <CustomSelect
                      label="Filter"
                      value={selectedQuestionFilterId}
                      options={["All", "Used", "Unused"]}
                      placeholder="All"
                      fieldName="filter"
                      onChange={setSelectedQuestionFilterId}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Duration & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (mins)</label>
                <div className="relative">
                  <Field
                    name="test_duration"
                    type="number"
                    min="1"
                    max="999"
                    placeholder="Enter duration"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                    onChange={(e) => {
                      setFieldValue("test_duration", e.target.value);
                      changeTimeLimit(e.target.value);
                    }}
                  />
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                <div className="relative">
                  <DatePicker
                    selected={testDate}
                    onChange={(date) => setTestDate(moment(date).add(2, "m").toDate())}
                    showTimeSelect
                    dateFormat="Pp"
                    minDate={new Date()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                  />
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                <div className="relative">
                  <DatePicker
                    selected={testLastDate}
                    onChange={(date) => setTestLastDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    minDate={new Date()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                  />
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Proctoring & Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={proctoring}
                  onChange={(e) => setProctoring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Proctoring</span>
              </label>
              <div className="text-sm font-medium text-gray-700">
                {noofQuestionSelected} selected |{" "}
                <span className="text-green-600">{noofEasyQuestionSelected} Easy</span> |{" "}
                <span className="text-orange-600">{noofMediumQuestionSelected} Medium</span> |{" "}
                <span className="text-red-600">{noofHardQuestionSelected} Hard</span>
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      disabled={selectedTestCategory === "Coding"}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Select all questions</span>
                  </label>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((q, idx) => {
                    const isChecked = selectedQuestions.some(s => s.question_id === q.question_id && s.selected);
                    const colorClass = levelColors[q.question_level.question_level_type] || "bg-gray-500";

                    return (
                      <div key={q.question_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggleQuestion(q, e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-bold text-white rounded ${colorClass}`}>
                                {q.question_level.question_level_type}
                              </span>
                              <input
                                type="number"
                                defaultValue={q.default_weight_age}
                                min="1"
                                max="99"
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                              <span className="text-sm text-gray-600">marks</span>
                            </div>
                            <p
                              className="text-sm text-gray-800 mb-2"
                              dangerouslySetInnerHTML={{ __html: `${idx + 1}. ${q.question}` }}
                            />
                            {q.objective_subjective_type === "Objective" && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                {q.option1 && <div>A) {q.option1}</div>}
                                {q.option2 && <div>B) {q.option2}</div>}
                                {q.option3 && <div>C) {q.option3}</div>}
                                {q.option4 && <div>D) {q.option4}</div>}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              Chapter: {q.chapter.label} | Topic: {q.topic.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all shadow-md ${
                  isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Assessment
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}