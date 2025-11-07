'use client';

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building, Home, X } from 'lucide-react';
import AddInternalAssessment from './AddInternalAssessment';
import AddExternalAssessment from './AddExternalAssessment';
import assesment_logo from '@/_assets/images_new_design/Assessment_logo.svg';

export default function AddNewAssessment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState({
    loading: false,
    offline_assessment_enabled: true,
    int_ext_type: 'Internal',
    internalAssessmentViewBtn: 'tab-active',
    externalAssessmentViewBtn: 'tab-inactive',
    selectedClass: location?.state?.selectedClass || '',
    selectedClassName: location?.state?.selectedClassName || '',
    previous_page_url: location.state?.previous_path || '/teacher/assessments',
    selected_test_type: location.state?.selected_test_type || 'ALL',
    selected_subject_props: location.state?.selected_subject || '',
    curr_date_ori: location.state?.curr_date_ori || new Date(),
    default_sel_tab: location.state?.default_sel_tab || '',
  });

  // ---------- Modal States ----------
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalHeading, setModalHeading] = useState('');

  // ---------- Tab Handler ----------
  const handleTabView = (type) => {
    setState((prev) => ({
      ...prev,
      int_ext_type: type,
      internalAssessmentViewBtn: type === 'Internal' ? 'tab-active' : 'tab-inactive',
      externalAssessmentViewBtn: type === 'External' ? 'tab-active' : 'tab-inactive',
    }));
  };

  // ---------- Navigate Back ----------
  const goBack = () => {
    navigate(state.previous_page_url, {
      state: {
        selected_test_type: state.selected_test_type,
        selected_subject: state.selected_subject_props,
        curr_date_ori: state.curr_date_ori,
        default_sel_tab: state.default_sel_tab,
        selectedClass: state.selectedClass,
        selectedClassName: state.selectedClassName,
      },
    });
  };

  // ---------- Modal Helpers ----------
  const openImagePreview = (status = true, image) => {
    setShowImageModal(status);
    setModalHeading('Image Preview');
    setModalContent(image);
  };

  const openWarningModal = (show = true, content = '') => {
    setShowWarningModal(show);
    setModalHeading('Warning');
    setModalContent(content);
  };

  const openSuccessModal = (show = true, content = '') => {
    setShowSuccessModal(show);
    setModalHeading('Success');
    setModalContent(content);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    goBack();
  };

  const { offline_assessment_enabled, int_ext_type } = state;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto h-full">

          {/* Main Container */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <img src={assesment_logo} alt="Assessment" className="w-8 h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>Add New Assessment</h1>
              </div>

              {/* Right Circular Close Button */}
              <button
                onClick={goBack}
                className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs: Online / Offline */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleTabView('Internal')}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all shadow-sm ${
                  state.internalAssessmentViewBtn === 'tab-active'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Building className="w-4 h-4" />
                Online
              </button>
              <button
                type="button"
                onClick={() => handleTabView('External')}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all shadow-sm ${
                  state.externalAssessmentViewBtn === 'tab-active'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Home className="w-4 h-4" />
                Offline
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 h-full">
                {state.loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {offline_assessment_enabled ? (
                      int_ext_type === 'Internal' ? (
                        <AddInternalAssessment
                          showWarningModal={openWarningModal}
                          showImageModal={openImagePreview}
                          showSuccessModal={openSuccessModal}
                          selectedClass={state.selectedClass}
                          selectedClassName={state.selectedClassName}
                        />
                      ) : (
                        <AddExternalAssessment
                          showWarningModal={openWarningModal}
                          showImageModal={openImagePreview}
                          showSuccessModal={openSuccessModal}
                          selectedClass={state.selectedClass}
                          selectedClassName={state.selectedClassName}
                        />
                      )
                    ) : (
                      <AddInternalAssessment
                        showWarningModal={openWarningModal}
                        showImageModal={openImagePreview}
                        showSuccessModal={openSuccessModal}
                        selectedClass={state.selectedClass}
                        selectedClassName={state.selectedClassName}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-green-600">{modalHeading}</h3>
              <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleSuccessConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-amber-600">{modalHeading}</h3>
              <button onClick={() => setShowWarningModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSuccessConfirm}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-xl max-w-3xl w-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={modalContent} alt="Preview" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
}