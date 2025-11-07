'use client';

import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { Calendar, Clock, CheckCircle, ChevronDown } from "lucide-react";
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

  // Dropdown control
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Mock data load
  useEffect(() => {
    // Simulate loading grades
  }, []);

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

  // Validation Schema
  const validationSchema = Yup.object().shape({
    title: Yup.string().trim().required("Please enter the assessment title"),
    grade: Yup.string().trim().required("Please select the program"),
    class_data_id: Yup.string().trim().required("Please select the class"),
    grade_division_id: Yup.string().trim().required("Please select the division"),
    subject_id: Yup.string().trim().required("Please select the subject"),
    test_category: Yup.string().trim().required("Please select the category"),
    min_marks: Yup.number().required("Please enter the Passing Threshold").min(0),
    max_marks: Yup.number()
      .required("Please enter the Total Marks")
      .min(Yup.ref("min_marks"), "Total Marks must be greater than Passing Threshold"),
    date_time: Yup.string().required("Please select result date"),
  });

  const formatDateForInput = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    return date.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
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
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting, resetForm }) => {
          values.date_time = Math.floor(new Date(values.date_time).getTime() / 1000);
          console.log("Submitted:", values);
          alert("External Assessment Created (Demo Mode)");
          setSubmitting(false);
          resetForm();
        }}
      >
        {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => {
          // Custom Dropdown Component
          const CustomDropdown = ({
            fieldName,
            label,
            value,
            options,
            placeholder = "",
            required = false,
            onChangeCallback,
          }) => (
            <div ref={(el) => (dropdownRefs.current[fieldName] = el)} className="relative">
              <label className="block font-medium mb-1 text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`w-full px-3 py-2.5 border bg-white cursor-pointer rounded-md min-h-[40px] flex items-center justify-between transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:border-blue-400 ${
                  errors[fieldName] && touched[fieldName] ? "border-red-500" : "border-gray-300"
                }`}
                onClick={() => setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
              >
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                  {value
                    ? options.find(
                        (opt) =>
                          (opt.grade_id || opt.class_data_id || opt.grade_division_id || opt.subject_id || opt) ===
                          value
                      )?.name ||
                      options.find(
                        (opt) =>
                          (opt.grade_id || opt.class_data_id || opt.grade_division_id || opt.subject_id || opt) ===
                          value
                      )?.name_data ||
                      options.find(
                        (opt) =>
                          (opt.grade_id || opt.class_data_id || opt.grade_division_id || opt.subject_id || opt) ===
                          value
                      )?.division?.name ||
                      value
                    : placeholder}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === fieldName ? "rotate-180" : "rotate-0"}`}
                />
              </div>
              {openDropdown === fieldName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => {
                      onChangeCallback("");
                      setOpenDropdown(null);
                    }}
                  >
                    {placeholder}
                  </div>
                  {options.map((option) => {
                    const optValue =
                      typeof option === "string"
                        ? option
                        : option.grade_id || option.class_data_id || option.grade_division_id || option.subject_id;
                    const optLabel =
                      typeof option === "string"
                        ? option
                        : option.name || option.name_data || option.division?.name;
                    return (
                      <div
                        key={optValue}
                        className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          onChangeCallback(optValue);
                          setOpenDropdown(null);
                        }}
                      >
                        {optLabel}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors[fieldName] && touched[fieldName] && (
                <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
              )}
            </div>
          );

          return (
            <Form className="space-y-8">
              {/* Header */}
              <div className="flex items-center space-x-4 border-b border-gray-200 pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center p-3">
                  <img src={assesment_logo} alt="Assessment" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <Field
                    name="title"
                    placeholder="Enter Assessment Title"
                    className={`w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 ${
                      errors.title && touched.title ? "text-red-600" : ""
                    }`}
                  />
                  {errors.title && touched.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
              </div>

              {/* Program, Class, Division */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <CustomDropdown
                  fieldName="grade"
                  label="Program"
                  value={values.grade}
                  options={mockGrades}
                  placeholder="Select Program"
                  required
                  onChangeCallback={(val) => handleGradeChange(val, setFieldValue)}
                />

                <CustomDropdown
                  fieldName="class_data_id"
                  label="Class"
                  value={values.class_data_id}
                  options={selectedGradeId ? mockClasses : []}
                  placeholder="Select Class"
                  required
                  onChangeCallback={(val) => handleClassChange(val, setFieldValue)}
                />

                <CustomDropdown
                  fieldName="grade_division_id"
                  label="Division"
                  value={values.grade_division_id}
                  options={selectedClassDataId ? mockDivisions : []}
                  placeholder="Select Division"
                  required
                  onChangeCallback={(val) => handleDivisionChange(val, setFieldValue)}
                />
              </div>

              {/* Subject & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomDropdown
                  fieldName="subject_id"
                  label="Paper"
                  value={values.subject_id}
                  options={selectedDivisionId ? mockSubjects : []}
                  placeholder="Select Paper"
                  required
                  onChangeCallback={(val) => handleSubjectChange(val, setFieldValue)}
                />

                <CustomDropdown
                  fieldName="test_category"
                  label="Category"
                  value={values.test_category}
                  options={["Objective", "Subjective", "Coding", "Mixed"]}
                  placeholder="Select Category"
                  required
                  onChangeCallback={(val) => handleCategoryChange(val, setFieldValue)}
                />
              </div>

              {/* Result Date, Passing Threshold, Total Marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Result Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      name="date_time"
                      type="datetime-local"
                      min={getMinDate()}
                      value={formatDateForInput(testDate)}
                      onChange={(e) => {
                        handleChange(e);
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate)) setTestDate(newDate);
                      }}
                      className={`w-full border rounded-md px-3 py-2.5 pl-10 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                        errors.date_time && touched.date_time ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.date_time && touched.date_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_time}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Passing Threshold <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="min_marks"
                    type="number"
                    placeholder="Enter Passing Threshold"
                    min="0"
                    max="999"
                    className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                      errors.min_marks && touched.min_marks ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.min_marks && touched.min_marks && (
                    <p className="mt-1 text-sm text-red-600">{errors.min_marks}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="max_marks"
                    type="number"
                    placeholder="Enter Total Marks"
                    min="0"
                    max="999"
                    className={`w-full border rounded-md px-3 py-2.5 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 hover:border-blue-400 ${
                      errors.max_marks && touched.max_marks ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.max_marks && touched.max_marks && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_marks}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-all ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Submit Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}