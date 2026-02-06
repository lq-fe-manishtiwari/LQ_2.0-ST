'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { studentPlacementService } from '../Services/studentPlacement.service';
import { api } from '../../../../../_services/api';

export default function PlacementConsent() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);
  const [signature, setSignature] = useState('');
  const [optOut, setOptOut] = useState(false);
  const [optOutReason, setOptOutReason] = useState('');
  const [showOptOutForm, setShowOptOutForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [collegePolicy, setCollegePolicy] = useState(null);
  const [policyError, setPolicyError] = useState(null);
  const [policyId, setPolicyId] = useState(null); // will be set from API

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // 1. Load student profile (critical)
        const profileRes = await api.getUserProfile();
        const studentInfo = profileRes.data || {};

        const studentId = studentInfo.student_id || studentInfo.id;
        const collegeId = studentInfo.college_id;
        const prnNo = studentInfo.prn_no || studentInfo.prnNo || studentInfo.PRN;
        const studentName = studentInfo.student_name || studentInfo.name || studentInfo.fullName;

        if (!collegeId) {
          alert('College information not found. Please login again.');
          setLoading(false);
          return;
        }

        const student = { ...studentInfo, studentId, collegeId, prnNo, studentName };
        setStudentData(student);

        // 2. Load college placement policy (and get real policyId)
        try {
          const policyRes = await studentPlacementService.getCollegeConsent(collegeId);
          if (policyRes?.policies?.length > 0) {
            const selectedPolicy = policyRes.policies[0]; // using first one
            setCollegePolicy(selectedPolicy);
            setPolicyId(selectedPolicy.policy_id); // dynamic policy ID
          } else {
            setPolicyError('No placement policy found for your college.');
          }
        } catch (policyErr) {
          console.error('Failed to load college placement policy:', policyErr);
          setPolicyError('Unable to load the placement policy. Please try again later or contact the placement cell.');
        }

        // 3. Load existing student consent — only if we have policyId and studentId
        if (studentId && policyId) {
          try {
            const consent = await studentPlacementService.getStudentConsent(studentId, policyId);
            if (consent) {
              setConsentGiven(consent.is_acknowledged && !consent.is_opt_out);
              setOptOut(consent.is_opt_out);
              setSignature(consent.student_name || studentName || '');
              if (consent.is_opt_out) setOptOutReason(consent.opt_out_reason || '');
            }
          } catch (consentErr) {
            console.warn('No existing consent record or failed to fetch:', consentErr.message);
            // Normal for first-time users → continue
          }
        }

      } catch (err) {
        console.error('Critical error loading profile:', err);
        alert('Failed to load your profile information. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConsentSubmit = async () => {
    if (!hasReadPolicy) {
      alert('Please confirm that you have read and understood the policy');
      return;
    }
    if (!signature.trim()) {
      alert('Please enter your full name as digital signature');
      return;
    }
    if (!studentData?.collegeId || !studentData?.studentId || !policyId) {
      alert('Required information is missing (policy or student data)');
      return;
    }

    try {
      const payload = {
        college_id: studentData.collegeId,
        policy_id: policyId,
        student_id: studentData.studentId,
        student_name: signature,
        prn_no: studentData.prnNo,
        is_acknowledged: true,
        is_opt_out: false,
        opt_out_reason: null,
      };

      await studentPlacementService.submitStudentConsent(payload);
      alert('Consent recorded successfully!');
      setConsentGiven(true);
    } catch (err) {
      console.error('Error submitting consent:', err);
      alert('Failed to record consent. Please try again.');
    }
  };

  const handleOptOut = async () => {
    if (!optOutReason.trim()) {
      alert('Please provide a reason for opting out');
      return;
    }
    if (!policyId) {
      alert('Policy information not available');
      return;
    }

    try {
      const payload = {
        college_id: studentData.collegeId,
        policy_id: policyId,
        student_id: studentData.studentId,
        student_name: studentData.studentName || signature,
        prn_no: studentData.prnNo,
        is_acknowledged: false,
        is_opt_out: true,
        opt_out_reason: optOutReason,
      };

      await studentPlacementService.submitStudentConsent(payload);
      alert('Opt-out recorded successfully');
      setOptOut(true);
      setShowOptOutForm(false);
    } catch (err) {
      console.error('Error submitting opt-out:', err);
      alert('Failed to record opt-out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (optOut) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You have opted out of placements</h2>
          <p className="text-gray-600 mb-4">
            Your opt-out has been recorded. You will not receive placement-related notifications.
          </p>
          <p className="text-sm text-gray-500">
            To participate again, please contact your placement cell.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Success message when consent is given */}
        {consentGiven && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You have acknowledged the placement policy
            </h2>
            <p className="text-gray-700">
              You can now apply for placement opportunities.
            </p>
            <div className="mt-4 text-sm text-gray-600">
              Digital Signature: <strong>{signature}</strong> • Date: {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        )}

        {/* Policy Document Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200 p-6">
            {collegePolicy ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {collegePolicy.policy_name || 'Placement Consent Policy'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Policy ID: {collegePolicy.policy_id}
                  </p>
                </div>
                {collegePolicy.policy_document_path && (
                  <a
                    href={collegePolicy.policy_document_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Download Full Policy PDF
                  </a>
                )}
              </div>
            ) : policyError ? (
              <div className="text-red-600 text-center py-4 font-medium">{policyError}</div>
            ) : (
              <div className="text-gray-500 text-center py-4">Loading policy...</div>
            )}
          </div>

          <div className="p-6">
            {collegePolicy ? (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {collegePolicy.policy_description}
                </p>
              </div>
            ) : policyError ? null : (
              <div className="text-center py-10 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mx-auto mb-3"></div>
                Loading placement policy...
              </div>
            )}
          </div>

          {!consentGiven && collegePolicy && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadPolicy}
                  onChange={(e) => setHasReadPolicy(e.target.checked)}
                  className="mt-1.5 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 leading-6">
                  I have read and understood the placement consent policy (including the full PDF document if available)
                  and agree to abide by all the terms and conditions mentioned.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Consent Form */}
        {!consentGiven && collegePolicy && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">Digital Acknowledgement</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (as Digital Signature) *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter your full name exactly as in records"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                By typing your full name above, you are electronically signing and agreeing to the policy.
              </p>
            </div>

            <button
              onClick={handleConsentSubmit}
              disabled={!hasReadPolicy || !signature.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Consent & Proceed to Placements
            </button>
          </div>
        )}

        {/* Opt Out Section */}
        {!consentGiven && !optOut && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Interested in Campus Placements?</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  If you do not wish to participate in the campus placement process, you may opt out.
                  This can be reversed later by contacting the placement cell.
                </p>

                {!showOptOutForm ? (
                  <button
                    onClick={() => setShowOptOutForm(true)}
                    className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Opt Out of Placements
                  </button>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Opting Out *
                    </label>
                    <textarea
                      value={optOutReason}
                      onChange={(e) => setOptOutReason(e.target.value)}
                      rows={3}
                      placeholder="Please mention your reason..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleOptOut}
                        className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Confirm Opt Out
                      </button>
                      <button
                        onClick={() => {
                          setShowOptOutForm(false);
                          setOptOutReason('');
                        }}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}