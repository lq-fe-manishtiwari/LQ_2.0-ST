'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, AlertCircle,Trash2,Edit } from 'lucide-react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import SweetAlert from 'react-bootstrap-sweetalert';
import { QuestionsService } from '../Services/questions.service';

// Dummy initial data


export default function QuestionLevel() {
  const [questionLevels, setQuestionLevels] = useState([]);
const [showEditModal, setShowEditModal] = useState(false);
const [selectedLevel, setSelectedLevel] = useState(null);


  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
  fetchQuestionLevels();
}, []);

const fetchQuestionLevels = async () => {
  try {
    const response = await QuestionsService.getAllQuestionLevels();
    setQuestionLevels(response); 
  } catch (error) {
    setAlertMessage('Failed to load question levels');
    setShowErrorAlert(true);
  }
};

  // Filter & Search Logic
  const filteredLevels = useMemo(() => {
    if (!searchQuery) return questionLevels;

    const query = searchQuery.toLowerCase();
    return questionLevels.filter(level =>
      level.question_level_type.toLowerCase().includes(query)
    );
  }, [questionLevels, searchQuery]);

  // Add New Level Handler (Dummy)
const handleAddLevel = async (values, { resetForm, setSubmitting }) => {
  try {
    const payload = {
      question_level_type: values.question_level_type.trim(),
    };

    await QuestionsService.createQuestionLevel(payload);

    await fetchQuestionLevels(); // refresh list

    resetForm();
    setShowAddModal(false);
    setAlertMessage('Question Level Added Successfully');
    setShowSuccessAlert(true);
  } catch (error) {
    setAlertMessage(
      error?.message || 'Failed to add question level'
    );
    setShowErrorAlert(true);
  } finally {
    setSubmitting(false);
  }
};
const handleDeleteLevel = async (id) => {
  try {
    await QuestionsService.deleteQuestionLevel(id);
    setQuestionLevels(prev =>
      prev.filter(level => level.question_level_id !== id)
    );
    setAlertMessage('Question Level Deleted Successfully');
    setShowSuccessAlert(true);
  } catch (error) {
    setAlertMessage('Failed to delete question level');
    setShowErrorAlert(true);
  }
};
const handleEditLevel = async (values, { setSubmitting }) => {
  try {
    await QuestionsService.updateQuestionLevel(
      selectedLevel.question_level_id,
      { question_level_type: values.question_level_type.trim() }
    );

    await fetchQuestionLevels(); // refresh list

    setShowEditModal(false);
    setSelectedLevel(null);
    setAlertMessage('Question Level Updated Successfully');
    setShowSuccessAlert(true);
  } catch (error) {
    setAlertMessage('Failed to update question level');
    setShowErrorAlert(true);
  } finally {
    setSubmitting(false);
  }
};


  // Validation Schema
  const validationSchema = Yup.object().shape({
    question_level_type: Yup.string()
      .trim()
      .required('Enter a valid name')
      .min(2, 'Too short')
      .max(20, 'Too long'),
  });

  return (
    <>
      <div className="min-h-screen bg-[rgb(33,98,193)] bg-opacity-5 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            {/* Search Bar */}
            <div className="w-full sm:flex-1 sm:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search levels..."
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base
                           border border-gray-300 rounded-lg sm:rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-all duration-200 
                           placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-[rgb(33,98,193)] hover:bg-[rgb(33,98,193)]/90 
                       text-white font-medium px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg 
                       shadow-md transition-all hover:shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="text-sm sm:text-base">New Level</span>
            </button>
          </div>

          {/* Responsive Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-[rgb(33,98,193)]">
                    <th colSpan="3" className="px-4 sm:px-6 py-4 text-center">
                      <h2 className="text-lg sm:text-xl font-semibold text-white">
                        Question Level Type
                      </h2>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLevels.length > 0 ? (
                    filteredLevels.map((level) => (
                      <tr
                        key={level.question_level_id}
                        className="group hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {/* {level.question_level_id} */}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-50 rounded-full 
                                          flex items-center justify-center group-hover:bg-blue-100 
                                          transition-colors">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {level.question_level_type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
  onClick={() => {
    setSelectedLevel(level);
    setShowEditModal(true);
  }}
  className="text-gray-400 hover:text-blue-600 p-2 rounded-lg
             hover:bg-blue-50 transition-all inline-flex items-center"
>
<Edit className="w-4 h-4" />
</button>

<button
  onClick={() => handleDeleteLevel(level.question_level_id)}
  className="text-gray-400 hover:text-red-600 p-2 rounded-lg
             hover:bg-red-50 transition-all inline-flex items-center ml-2"
>
   <Trash2 className="w-4 h-4" />
</button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 sm:px-6 py-8 text-center">
                        <div className="max-w-sm mx-auto">
                          <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                          <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                            No question levels found
                          </p>
                          <p className="text-sm text-gray-500">
                            Try adjusting the search or contact support if the issue persists.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[rgb(33,98,193)]">
                    Add Question Level
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="w-5 sm:w-6 h-5 sm:h-6" />
                  </button>
                </div>

                <Formik
                  initialValues={{ question_level_type: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleAddLevel}
                >
                  {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Enter Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="question_level_type"
                          placeholder="Example: Easy, Medium, Hard"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base
                                    border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 
                                    focus:border-transparent transition-all ${
                                      errors.question_level_type && touched.question_level_type
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                    }`}
                          value={values.question_level_type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.question_level_type && touched.question_level_type && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.question_level_type}</p>
                        )}
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300
                                   text-gray-700 rounded-lg font-medium hover:bg-gray-50
                                   transition-all text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 
                                   bg-[rgb(33,98,193)] text-white rounded-lg font-medium 
                                   hover:bg-[rgb(33,98,193)]/90 transition-all disabled:opacity-50
                                   text-sm sm:text-base"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Level'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {showSuccessAlert && (
            <SweetAlert
              success
              title="Success!"
              onConfirm={() => setShowSuccessAlert(false)}
              confirmBtnCssClass="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              {alertMessage}
            </SweetAlert>
          )}

          {/* Error Alert */}
          {showErrorAlert && (
            <SweetAlert
              danger
              title="Error!"
              onConfirm={() => setShowErrorAlert(false)}
              confirmBtnCssClass="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              {alertMessage}
            </SweetAlert>
          )}
          {showEditModal && selectedLevel && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <h3 className="text-xl font-semibold text-[rgb(33,98,193)] mb-4">
        Edit Question Level
      </h3>

      <Formik
        initialValues={{
          question_level_type: selectedLevel.question_level_type,
        }}
        validationSchema={validationSchema}
        onSubmit={handleEditLevel}
      >
        {({ values, handleChange, handleBlur, isSubmitting }) => (
          <Form className="space-y-4">
            <input
              type="text"
              name="question_level_type"
              value={values.question_level_type}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
)}

        </div>
      </div>
    </>
  );
}