'use client';

import React, { useState, useEffect } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Loader2, X } from 'lucide-react';
import { studentPlacementService, createStudentDriveApplication } from '../Services/studentPlacement.service';
import { api,uploadFileToS3 } from '../../../../../_services/api';

const PROFILE_FIELD_MAP = {
  'Full Name': user => `${user.firstname} ${user.middlename || ''} ${user.lastname}`.trim(),
  email: user => user.email,
  mobile: user => user.mobile,
  marks: user => user.education_details?.find(e => e.qualification === '10th')?.percentage,
  '10th_percentage': user => user.education_details?.find(e => e.qualification === '10th')?.percentage,
  '12th_percentage': user => user.education_details?.find(e => e.qualification === '12th')?.percentage
};

export default function RegistrationForm({
  job,
  collegeId,
  placementId,
  onClose,
  onSuccess
}) {
  if (!job) return null;

  const driveId = job.drive_id || job.job_opening_id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formConfig, setFormConfig] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [resumeFile, setResumeFile] = useState(null);

  const [selectedJobIndexes, setSelectedJobIndexes] = useState([]);
  const [acceptedEligibility, setAcceptedEligibility] = useState({});

  // Filter to show only the role matching the clicked placement_id
  const jobRoles = (job.job_roles || []).filter(role => {
    const vacancy = (job.vacancy_details || []).find(
      v => v.placement_id === placementId
    );
    return vacancy && role.role_name?.trim().toLowerCase() === vacancy.role?.trim().toLowerCase();
  });
  
  const vacancyDetails = job.vacancy_details || [];
  const eligibility = job.eligibility_criteria || [];

 useEffect(() => {
  if (!collegeId || !driveId) return;

  loadForm();
  initEligibility();
}, [collegeId, driveId]);

  const loadForm = async () => {
    try {
      setLoading(true);

      // Get user profile data first
      const userRes = await api.getUserProfile();
      const userData = userRes.data;

      const res = await studentPlacementService.getRegistrationFormsByCollege(collegeId);

      const form = res?.[0];

      if (!form) {
        setFormConfig(null);
        setLoading(false);
        return;
      }

      setFormConfig(form.form_object);

      const initialValues = {
        prn_id: userData.permanent_registration_number || userData.roll_number || ''
      };

      // Map profile data to form fields
      form.form_object.fields.forEach(f => {
        if (PROFILE_FIELD_MAP[f.field_name]) {
          initialValues[f.field_name] = PROFILE_FIELD_MAP[f.field_name](userData) || '';
        } else {
          initialValues[f.field_name] = '';
        }
      });
      
      setFormValues(initialValues);

    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            onClose?.();
          }}
        >
          {err.message}
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const initEligibility = () => {
    const state = {};
    eligibility.forEach(c => {
      state[c.criteria_id] = false;
    });
    setAcceptedEligibility(state);
  };

  const getPlacementIdForRole = (roleName) => {
    const match = vacancyDetails.find(
      v => v.role?.trim().toLowerCase() === roleName?.trim().toLowerCase()
    );
    return match?.placement_id || 0;
  };

  const handleJobSelect = index => {
    setSelectedJobIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleEligibilityCheck = id => {
    setAcceptedEligibility(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResumeChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return setAlert(
        <SweetAlert
          warning
          title="File too large"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Resume must be under 5MB
        </SweetAlert>
      );
    }

    setResumeFile(file);
  };

  const formatEligibilityText = criteria =>
    criteria.criteria_list
      ?.map(obj =>
        Object.entries(obj)
          .filter(([k]) => k !== 'field_id')
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
          .join(', ')
      )
      .join(' | ');

const handleSubmit = async e => {
  e.preventDefault();

  if (!selectedJobIndexes.length)
    return setAlert(
      <SweetAlert
        warning
        title="Required"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        Select at least one role
      </SweetAlert>
    );

  if (!resumeFile)
    return setAlert(
      <SweetAlert
        warning
        title="Required"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        Upload resume
      </SweetAlert>
    );

  if (!formValues.prn_id?.trim())
    return setAlert(
      <SweetAlert
        warning
        title="Required"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        Enter PRN number
      </SweetAlert>
    );

  if (eligibility.length) {
    const accepted = eligibility.some(c => acceptedEligibility[c.criteria_id]);
    if (!accepted) {
      return setAlert(
        <SweetAlert
          warning
          title="Required"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Please accept at least one eligibility criteria
        </SweetAlert>
      );
    }
  }

  setSubmitting(true);

  const eligibilityIds = eligibility
    .filter(c => acceptedEligibility[c.criteria_id])
    .map(c => c.criteria_id);

  try {
    // 🔹 1. Upload resume to S3
    const s3Response = await uploadFileToS3(resumeFile);

    const resumeUrl =
      s3Response

    if (!resumeUrl) {
      throw new Error('Resume upload failed');
    }

    // 🔹 2. Submit applications
    await Promise.all(
      selectedJobIndexes.map(i => {
        const role = jobRoles[i];

        return createStudentDriveApplication({
          prn_id: formValues.prn_id.trim(),
          college_id: collegeId,
          drive_id: driveId,
          placement_id: getPlacementIdForRole(role.role_name),
          job_role_ids: [role.job_role_id],
          eligibility_criteria_ids: eligibilityIds,

          application_data: {
            ...formValues,
            resume_name: resumeFile.name,
            resume_type: resumeFile.type,
            resume_size: resumeFile.size
          },

          resume_url: resumeUrl, // ✅ S3 URL
          application_status: 'PENDING'
        });
      })
    );

    setAlert(
      <SweetAlert
        success
        title="Success"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => {
          setAlert(null);
          onClose?.();
          onSuccess?.();
        }}
      >
        Application submitted successfully!
      </SweetAlert>
    );

  } catch (err) {
    console.error(err);

    if (err.message === 'Resume upload failed') {
      setAlert(
        <SweetAlert
          error
          title="Upload Failed"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Resume upload failed. Please try again.
        </SweetAlert>
      );
    } else if (err.response?.message?.includes('Application already exists')) {
      setAlert(
        <SweetAlert
          warning
          title="Already Applied"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          You have already applied for this drive.
        </SweetAlert>
      );
    } else {
      setAlert(
        <SweetAlert
          error
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          {err.response?.message || 'Already Applied'}
        </SweetAlert>
      );
    }
  } finally {
    setSubmitting(false);
  }
};


  const renderField = f => {
    const common = {
      value: formValues[f.field_name] || '',
      required: f.required,
      onChange: e => handleChange(f.field_name, e.target.value),
      className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
    };

    if (f.field_type === 'select') {
      return (
        <select {...common}>
          <option value="">Select an option</option>
          {f.options?.map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>
      );
    }

    return (
      <input 
        type={f.field_type || 'text'} 
        placeholder={`Enter ${f.label.toLowerCase()}`}
        {...common} 
      />
    );
  };
    const companyName =
  job?.company?.company_name ||
  job?.companies?.[0]?.company_name ||
  'Company';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      {alert}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-blue-600 rounded-t-2xl">
            <div>

                <h1 className="text-2xl font-bold text-white">
                {companyName}
                </h1>
              <p className="text-blue-100 mt-1">{job.location} • Apply before: <span className="font-semibold text-white">{job.application_deadline}</span></p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6">
            {/* If form not found */}
            {!formConfig && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-yellow-800 font-semibold">Registration form not configured for this college.</p>
              </div>
            )}

            {formConfig && (
              <>
                {/* Available Roles */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Roles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobRoles.map((r, i) => {
                      const isSelected = selectedJobIndexes.includes(i);
                      return (
                        <div 
                          key={r.job_role_id} 
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleJobSelect(i)}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-1">{r.role_name}</div>
                              <div className="text-sm text-gray-600 line-clamp-2">{r.description}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Eligibility Criteria */}
                {eligibility.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Criteria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eligibility.map(c => {
                        const isAccepted = acceptedEligibility[c.criteria_id];
                        return (
                          <div 
                            key={c.criteria_id} 
                            className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isAccepted 
                                ? 'border-green-500 bg-green-50 shadow-md' 
                                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleEligibilityCheck(c.criteria_id)}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isAccepted}
                                readOnly
                                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 mb-1">{c.criteria_name}</div>
                                <div className="text-sm text-gray-600 line-clamp-2">{formatEligibilityText(c)}</div>
                              </div>
                            </div>
                            {isAccepted && (
                              <div className="absolute top-2 right-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Details</h3>
                    
                    {/* PRN Number */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">PRN Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter your PRN number"
                        value={formValues.prn_id || ''}
                        onChange={e => handleChange('prn_id', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>

                    {/* Dynamic Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formConfig.fields.map((f, i) => (
                        <div key={i}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(f)}
                        </div>
                      ))}
                    </div>

                    {/* Resume Upload */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resume <span className="text-red-500">*</span></label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeChange}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                          <div className="text-gray-600">
                            <div className="font-medium">
                              {resumeFile ? 'Change Resume' : 'Upload Resume'}
                            </div>
                            <div className="text-sm mt-1">PDF, DOC, DOCX up to 5MB</div>
                          </div>
                        </label>
                        {resumeFile && (
                          <div className="mt-3 text-sm text-green-600 font-medium">
                            Selected: {resumeFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
