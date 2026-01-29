'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Loader2, X } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { createStudentDriveApplication } from '../Services/studentPlacement.service';

export default function RegistrationForm({
  job,
  collegeId,
  onClose,
  onSuccess
}) {
    console.log(job,collegeId);
  if (!job) return null;

  const driveId = job.job_opening_id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formConfig, setFormConfig] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [resumeFile, setResumeFile] = useState(null);

  const [selectedJobIndexes, setSelectedJobIndexes] = useState([]);
  const [acceptedEligibility, setAcceptedEligibility] = useState({});

  const jobRoles = job.job_roles || [];
  const vacancyDetails = job.vacancy_details || [];
  const eligibility = job.eligibility_criteria || [];

  useEffect(() => {
    // important: only load if job & college exist
    if (!collegeId || !job) return;
    loadForm();
    initEligibility();
  }, [collegeId, job]);

  const loadForm = async () => {
    try {
      setLoading(true);

      const res = await studentPlacementService.getRegistrationFormsByCollege(collegeId);

      // Debug log
      console.log("FORM RES:", res);

      const form = res?.[0];

      if (!form) {
        setFormConfig(null);
        setLoading(false);
        return;
      }

      setFormConfig(form.form_object);

      const initialValues = { prn_id: '' };
      form.form_object.fields.forEach(f => {
        initialValues[f.field_name] = '';
      });
      setFormValues(initialValues);

    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
      onClose?.();
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
    if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
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
      return Swal.fire('Required', 'Select at least one role', 'warning');

    if (!resumeFile)
      return Swal.fire('Required', 'Upload resume', 'warning');

    if (!formValues.prn_id?.trim())
      return Swal.fire('Required', 'Enter PRN number', 'warning');

    setSubmitting(true);

    const eligibilityIds = eligibility
      .filter(c => acceptedEligibility[c.criteria_id])
      .map(c => c.criteria_id);

    try {
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
            resume_url: '',
            application_status: 'PENDING'
          });
        })
      );

      Swal.fire('Success', 'Application submitted successfully!', 'success');
      onSuccess?.();

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = f => {
    const common = {
      value: formValues[f.field_name] || '',
      required: f.required,
      onChange: e => handleChange(f.field_name, e.target.value),
      className:
        'w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500'
    };

    if (f.field_type === 'select') {
      return (
        <select {...common}>
          <option value="">Select</option>
          {f.options?.map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>
      );
    }

    return <input type={f.field_type || 'text'} {...common} />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-2xl shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <div className="mb-8 bg-blue-50 p-6 rounded-xl">
          <h1 className="text-2xl font-bold">{job.company.company_name}</h1>
          <p>{job.location}</p>
          <p>Apply before: <strong>{job.application_deadline}</strong></p>
        </div>

        {/* If form not found */}
        {!formConfig && (
          <div className="p-6 bg-yellow-100 rounded-xl">
            <p className="font-bold">Registration form not configured for this college.</p>
          </div>
        )}

        {formConfig && (
          <>
            <div className="mb-8">
              <h3 className="font-bold mb-4">Available Roles</h3>
              {jobRoles.map((r, i) => (
                <label key={r.job_role_id} className="block mb-2">
                  <input
                    type="checkbox"
                    checked={selectedJobIndexes.includes(i)}
                    onChange={() => handleJobSelect(i)}
                    className="mr-2"
                  />
                  {r.role_name}
                </label>
              ))}
            </div>

            {eligibility.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold mb-4">Eligibility</h3>
                {eligibility.map(c => (
                  <label key={c.criteria_id} className="block mb-2">
                    <input
                      type="checkbox"
                      checked={acceptedEligibility[c.criteria_id]}
                      onChange={() => handleEligibilityCheck(c.criteria_id)}
                      className="mr-2"
                    />
                    {c.criteria_name} ({formatEligibilityText(c)})
                  </label>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                placeholder="PRN Number"
                value={formValues.prn_id || ''}
                onChange={e => handleChange('prn_id', e.target.value)}
                className="w-full border p-3 rounded-lg"
              />

              {formConfig.fields.map((f, i) => (
                <div key={i}>
                  <label className="block mb-1 font-semibold">{f.label}</label>
                  {renderField(f)}
                </div>
              ))}

              <input type="file" onChange={handleResumeChange} />

              <button
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold"
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
