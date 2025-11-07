'use client';

import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import { Calendar, CheckCircle, ChevronDown, Filter } from "lucide-react";
import assesment_logo from "@/_assets/images_new_design/Assessment_logo.svg";

// Mock Data
const mockGrades = [
  { grade_id: "1", name: "Grade 1" },
  { grade_id: "2", name: "Grade 2" },
];
const mockClasses = [
  { class_data_id: "FY", name_data: "FY" },
  { class_data_id: "SY", name_data: "SY" },
];
const mockDivisions = [
  { grade_division_id: "d1", division: { name: "A" } },
  { grade_division_id: "d2", division: { name: "B" } },
];
const mockSubjects = [
  { subject_id: "s1", name: "Maths" },
  { subject_id: "s2", name: "Science" },
];

export default function AddExternalAssessment() {
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedClassDataId, setSelectedClassDataId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTestCategory, setSelectedTestCategory] = useState("");
  const [testDate, setTestDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [filterOpen, setFilterOpen] = useState(true);

  // Dropdown control
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains && ref.contains(event.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGradeChange = (val, setFieldValue) => {
    setSelectedGradeId(val);
    setSelectedClassDataId("");
    setSelectedDivisionId("");
    setSelectedSubjectId("");
    setFieldValue("grade", val);
    setFieldValue("class_data_id", "");
    setFieldValue("grade_division_id", "");
    setFieldValue("subject_id", "");
  };

  const handleClassChange = (val, setFieldValue) => {
    setSelectedClassDataId(val);
    setSelectedDivisionId("");
    setSelectedSubjectId("");
    setFieldValue("class_data_id", val);
    setFieldValue("grade_division_id", "");
    setFieldValue("subject_id", "");
  };

  const handleDivisionChange = (val, setFieldValue) => {
    setSelectedDivisionId(val);
    setSelectedSubjectId("");
    setFieldValue("grade_division_id", val);
    setFieldValue("subject_id", "");
  };

  const handleSubjectChange = (val, setFieldValue) => {
    setSelectedSubjectId(val);
    setFieldValue("subject_id", val);
  };

  const handleCategoryChange = (val, setFieldValue) => {
    setSelectedTestCategory(val);
    setFieldValue("test_category", val);
  };

  const formatDateForInput = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    return date.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

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
                const val = option.grade_id || option.class_data_id || option.grade_division_id || option.subject_id || option;
                const label = option.name || option.name_data || option.division?.name || option;
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <Formik
        initialValues={{
          title: "",
          grade: "",
          class_data_id: "",
          grade_division_id: "",
          subject_id: "",
          test_category: "",
          min_marks: "",
          max_marks: "",
          date_time: formatDateForInput(testDate),
          int_ext_type: "External",
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          values.date_time = Math.floor(new Date(values.date_time).getTime() / 1000);
          console.log("Submitted:", values);
          alert("External Assessment Created (Demo Mode)");
          setSubmitting(false);
          resetForm();
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
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
              >
                <Filter className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Filter</span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 transition-transform ${
                    filterOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {filterOpen && (
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CustomSelect
                      label="Program"
                      value={mockGrades.find(g => g.grade_id === selectedGradeId)?.name || ""}
                      options={mockGrades}
                      placeholder="Select Program"
                      fieldName="grade"
                      onChange={(val) => handleGradeChange(val, setFieldValue)}
                    />

                    <CustomSelect
                      label="Class"
                      value={mockClasses.find(c => c.class_data_id === selectedClassDataId)?.name_data || ""}
                      options={selectedGradeId ? mockClasses : []}
                      placeholder="Select Class"
                      fieldName="class"
                      disabled={!selectedGradeId}
                      onChange={(val) => handleClassChange(val, setFieldValue)}
                    />

                    <CustomSelect
                      label="Division"
                      value={mockDivisions.find(d => d.grade_division_id === selectedDivisionId)?.division.name || ""}
                      options={selectedClassDataId ? mockDivisions : []}
                      placeholder="Select Division"
                      fieldName="division"
                      disabled={!selectedClassDataId}
                      onChange={(val) => handleDivisionChange(val, setFieldValue)}
                    />

                    <CustomSelect
                      label="Paper"
                      value={mockSubjects.find(s => s.subject_id === selectedSubjectId)?.name || ""}
                      options={selectedDivisionId ? mockSubjects : []}
                      placeholder="Select Paper"
                      fieldName="subject"
                      disabled={!selectedDivisionId}
                      onChange={(val) => handleSubjectChange(val, setFieldValue)}
                    />

                    <CustomSelect
                      label="Category"
                      value={selectedTestCategory}
                      options={["Objective", "Subjective", "Coding", "Mixed"]}
                      placeholder="Select Category"
                      fieldName="category"
                      onChange={(val) => handleCategoryChange(val, setFieldValue)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Result Date, Passing Threshold, Total Marks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Result Date</label>
                <div className="relative">
                  <Field
                    name="date_time"
                    type="datetime-local"
                    min={getMinDate()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                    onChange={(e) => {
                      setFieldValue("date_time", e.target.value);
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate)) setTestDate(newDate);
                    }}
                  />
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Threshold</label>
                <Field
                  name="min_marks"
                  type="number"
                  placeholder="Enter Passing Threshold"
                  min="0"
                  max="999"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                <Field
                  name="max_marks"
                  type="number"
                  placeholder="Enter Total Marks"
                  min="0"
                  max="999"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 text-sm md:text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit Assessment
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