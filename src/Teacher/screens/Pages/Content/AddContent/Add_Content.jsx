import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ChevronDown, Upload, X } from "lucide-react";

// Custom Select Component
const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false, 
  required = false, 
  error = false,
  optionLabel = "label",
  optionValue = "value"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border ${
          disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : error
            ? 'bg-white border-red-500 cursor-pointer hover:border-red-400'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
        } rounded min-h-[40px] flex items-center justify-between transition-all duration-150 focus:ring-2 focus:ring-blue-500`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map((option, index) => (
            <div
              key={option[optionValue] || index}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              {option[optionLabel]}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">Required</p>
      )}
    </div>
  );
};

const AddContent = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState("");
  const [filePicked, setFilePicked] = useState("");
  const [FileSizeError, setFileSizeError] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const [isUploadingContentData, setIsUploadingContentData] = useState(false);
  const [contentDataName, setContentDataName] = useState("");
  const [requiredErrors, setRequiredErrors] = useState({});

  // Mock data
  const [gradeDiv, setGradeDiv] = useState([
    { grade_division_id: "1", grade: { name: "Grade 1" } },
    { grade_division_id: "2", grade: { name: "Grade 2" } },
    { grade_division_id: "3", grade: { name: "Grade 3" } }
  ]);

  const [batches, setBatches] = useState([
    { batch_id: "1", batch_name: "Batch A" },
    { batch_id: "2", batch_name: "Batch B" },
    { batch_id: "3", batch_name: "Batch C" }
  ]);

  const [subjects, setSubjects] = useState([
    { subject_id: "1", name: "Mathematics", class_data_id: "1" },
    { subject_id: "2", name: "Science", class_data_id: "1" },
    { subject_id: "3", name: "English", class_data_id: "2" }
  ]);

  const [chapters, setChapters] = useState([
    { chapter_id: "1", label: "Chapter 1: Introduction" },
    { chapter_id: "2", label: "Chapter 2: Advanced Topics" },
    { chapter_id: "3", label: "Chapter 3: Practical Applications" }
  ]);

  const [topics, setTopics] = useState([
    { topic_id: "1", label: "Topic 1.1" },
    { topic_id: "2", label: "Topic 1.2" },
    { topic_id: "3", label: "Topic 2.1" }
  ]);

  const [contentTypes, setContentTypes] = useState([
    { curriculum_type_id: "1", label: "File" },
    { curriculum_type_id: "2", label: "Video" },
    { curriculum_type_id: "3", label: "External Link" },
  ]);

  const [classData2, setClassData2] = useState([
    { grade_division_id: "1", class_data: { name_data: "Class A" }, division: { name: "Division 1" } },
    { grade_division_id: "2", class_data: { name_data: "Class B" }, division: { name: "Division 2" } }
  ]);

  const inputKeyDown = (e) => {
    const val = e.target.value;
    if ((e.key === " " || e.key === "Spacebar") && val) {
      if (tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      setTags([...tags, val]);
      e.target.value = null;
    } else if (e.key === "Backspace" && !val) {
      removeTag(tags.length - 1);
    }
  };

  const removeTag = (i) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    setTags(newTags);
  };

  const handleRequiredBlur = (e) => {
    const { name, value } = e.target;
    if (!value || !value.toString().trim()) {
      setRequiredErrors((prev) => ({ ...prev, [name]: true }));
    } else {
      setRequiredErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleRequiredChange = (e) => {
    const { name, value } = e.target;
    if (value && value.toString().trim()) {
      setRequiredErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const onContentChangeHandler = (e, setFieldValue, typeOfContent) => {
    setIsUploadingContentData(true);
    setTimeout(() => {
      setContentDataName("mock_uploaded_file.pdf");
      setFieldValue("name", "mock_uploaded_file.pdf");
      setIsUploadingContentData(false);
    }, 1000);
  };

  const onVideoChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFilePicked(file.name);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-semibold">C</span>
            </div>
            <h1 className="pageheading">Add New Content</h1>
          </div>
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <Formik
          enableReinitialize={true}
          initialValues={{
            name: "",
            batch_id: "",
            subject_id: "",
            chapter_id: "",
            topic_id: "",
            curriculum_type_id: "",
            grade_division_id: "",
            class_data_id: "",
            content_visibility: "Public",
            average_content_time: 30,
            title: "",
            terms_and_condition: false,
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required("Please select the content."),
            batch_id: Yup.string().trim().required("Please select the batch."),
            grade_division_id: Yup.string().trim().required("Please select the class"),
            subject_id: Yup.string().trim().required("Please select the subject."),
            chapter_id: Yup.string().trim().required("Please select the chapter."),
            curriculum_type_id: Yup.string().trim().required("Please select the content type."),
            average_content_time: Yup.string().trim().required("Please enter average reading time for the content."),
            title: Yup.string().trim().required("Please select the title."),
            terms_and_condition: Yup.boolean().oneOf([true], "Please accept terms & conditions"),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            if (tags.length === 0) {
              setShowWarningModal(true);
              setSubmitting(false);
            } else {
              setTimeout(() => {
                resetForm();
                setShowSuccessModal(true);
                setSubmitting(false);
              }, 1000);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <div className="space-y-8">

                {/* Programme, Class, Batch */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Programme */}
                  <CustomSelect
                    label="Programme"
                    value={gradeDiv.find(g => g.grade_division_id === values.grade_division_id)?.grade.name || ""}
                    onChange={(selectedGrade) => {
                      setFieldValue("grade_division_id", selectedGrade.grade_division_id);
                    }}
                    options={gradeDiv}
                    optionLabel="grade.name"
                    optionValue="grade_division_id"
                    placeholder="Select Programme"
                    required={true}
                    error={requiredErrors.grade_division_id || (errors.grade_division_id && touched.grade_division_id)}
                  />

                  {/* Class */}
                  <CustomSelect
                    label="Class"
                    value={classData2.find(c => c.grade_division_id === values.class_data_id) ? 
                      `${classData2.find(c => c.grade_division_id === values.class_data_id).class_data.name_data} - ${classData2.find(c => c.grade_division_id === values.class_data_id).division.name}` 
                      : ""}
                    onChange={(selectedClass) => {
                      setFieldValue("class_data_id", selectedClass.grade_division_id);
                    }}
                    options={classData2}
                    optionLabel={(item) => `${item.class_data.name_data} - ${item.division.name}`}
                    optionValue="grade_division_id"
                    placeholder="Select Class"
                    required={true}
                    error={requiredErrors.class_data_id || (errors.class_data_id && touched.class_data_id)}
                  />

                  {/* Batch */}
                  <CustomSelect
                    label="Select Batch"
                    value={batches.find(b => b.batch_id === values.batch_id)?.batch_name || ""}
                    onChange={(selectedBatch) => {
                      setFieldValue("batch_id", selectedBatch.batch_id);
                    }}
                    options={batches}
                    optionLabel="batch_name"
                    optionValue="batch_id"
                    placeholder="Select Batch"
                    required={true}
                    error={requiredErrors.batch_id || (errors.batch_id && touched.batch_id)}
                  />
                </div>

                {/* Paper, Module, Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Paper */}
                  <CustomSelect
                    label="Select Paper"
                    value={subjects.find(s => s.subject_id === values.subject_id)?.name || ""}
                    onChange={(selectedSubject) => {
                      setFieldValue("subject_id", selectedSubject.subject_id);
                    }}
                    options={subjects}
                    optionLabel="name"
                    optionValue="subject_id"
                    placeholder="Select Paper"
                    required={true}
                    error={requiredErrors.subject_id || (errors.subject_id && touched.subject_id)}
                  />

                  {/* Module */}
                  <CustomSelect
                    label="Select Module"
                    value={chapters.find(c => c.chapter_id === values.chapter_id)?.label || ""}
                    onChange={(selectedChapter) => {
                      setFieldValue("chapter_id", selectedChapter.chapter_id);
                    }}
                    options={chapters}
                    optionLabel="label"
                    optionValue="chapter_id"
                    placeholder="Select Module"
                    required={true}
                    error={requiredErrors.chapter_id || (errors.chapter_id && touched.chapter_id)}
                  />

                  {/* Unit */}
                  <CustomSelect
                    label="Select Unit"
                    value={topics.find(t => t.topic_id === values.topic_id)?.label || ""}
                    onChange={(selectedTopic) => {
                      setFieldValue("topic_id", selectedTopic.topic_id);
                    }}
                    options={topics}
                    optionLabel="label"
                    optionValue="topic_id"
                    placeholder="Select Unit"
                  />
                </div>

                {/* Content Title */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block font-medium mb-1 text-gray-700">
                      Content Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={values.title || ""}
                      onChange={(e) => {
                        handleChange(e);
                        handleRequiredChange(e);
                      }}
                      onBlur={handleRequiredBlur}
                      placeholder="Enter Content Title"
                      className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                        requiredErrors.title || (errors.title && touched.title)
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {(requiredErrors.title || (errors.title && touched.title)) && (
                      <p className="mt-1 text-sm text-red-600">Required</p>
                    )}
                  </div>
                </div>

                {/* Content Type and Content Input */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content Type */}
                  <div>
                    <label className="block font-medium mb-3 text-gray-700">
                      Select Content Type<span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {contentTypes.map((contentType) => (
                        <label
                          key={contentType.curriculum_type_id}
                          className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                            values.curriculum_type_id === contentType.curriculum_type_id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="curriculum_type_id"
                            value={contentType.curriculum_type_id}
                            onChange={(e) => {
                              handleChange(e);
                              setSelectedContentType(contentType.label);
                              setFieldValue("name", "");
                              setContentDataName("");
                            }}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">{contentType.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.curriculum_type_id && touched.curriculum_type_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.curriculum_type_id}</p>
                    )}
                  </div>

                  {/* Content Input */}
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Content<span className="text-red-500">*</span>
                    </label>
                    
                    {selectedContentType === "Text" && (
                      <textarea
                        name="name"
                        value={values.name || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your content here..."
                        rows="4"
                        className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                          errors.name && touched.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                    )}

                    {selectedContentType === "External Link" && (
                      <input
                        type="url"
                        name="name"
                        value={values.name || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="https://example.com"
                        className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                          errors.name && touched.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                    )}

                    {(selectedContentType === "File" || selectedContentType === "Video") && (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={contentDataName || filePicked || "No file chosen"}
                            readOnly
                            placeholder="No file chosen"
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none"
                          />
                          <input
                            type="file"
                            accept={selectedContentType === "File" ? "image/jpeg,image/png,application/pdf" : "video/*"}
                            className="hidden"
                            id="contentFile"
                            onChange={(e) => {
                              if (selectedContentType === "File") {
                                onContentChangeHandler(e, setFieldValue, "file");
                              } else {
                                onVideoChange(e, setFieldValue);
                              }
                            }}
                          />
                          <label
                            htmlFor="contentFile"
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          {selectedContentType === "File" 
                            ? "jpeg, png, pdf files" 
                            : "MP4, 3GP, WEBM, MPEG files"}
                        </p>
                      </div>
                    )}

                    {errors.name && touched.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                    {FileSizeError && (
                      <p className="mt-1 text-sm text-red-600">{sizeError}</p>
                    )}
                  </div>
                </div>

                {/* Average Reading Time and Tags */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Average Reading Time */}
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Average Reading Time (minutes)<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="average_content_time"
                      value={values.average_content_time || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="1"
                      max="999"
                      placeholder="Enter reading time"
                      className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                        errors.average_content_time && touched.average_content_time
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />
                    {errors.average_content_time && touched.average_content_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.average_content_time}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">
                      Add Tags<span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded px-3 py-2 min-h-[42px] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(i)}
                              className="hover:text-blue-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        onKeyDown={inputKeyDown}
                        placeholder="Type and press space to add tags"
                        className="w-full border-0 p-0 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    {tags.length === 0 && (
                      <p className="mt-1 text-sm text-red-600">Please add at least one tag</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t border-gray-200 pt-6">
  {/* Heading */}
  <label className="block font-medium text-primary-600 mb-2">
    Terms and Conditions<span className="text-red-500">*</span>
  </label>

  {/* Checkbox + Label in One Row */}
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      name="terms_and_condition"
      checked={values.terms_and_condition || false}
      onChange={(e) => setFieldValue("terms_and_condition", e.target.checked)}
      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label
      htmlFor="terms_and_condition"
      className="text-sm text-gray-700 cursor-pointer select-none"
    >
      I hereby declare that the content added by me is fruitful and knowledgeable content.
    </label>
  </div>

  {/* Validation Message */}
  {errors.terms_and_condition && touched.terms_and_condition && (
    <p className="mt-1 text-sm text-red-600">{errors.terms_and_condition}</p>
  )}
</div>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddContent;