'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
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

  const policyId = 1;

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const res = await api.getUserProfile();
        const studentInfo = res.data || {};
        
        const studentId = studentInfo.student_id || studentInfo.id;
        const collegeId = studentInfo.college_id;
        const prnNo = studentInfo.prn_no || studentInfo.prnNo || studentInfo.PRN;
        const studentName = studentInfo.student_name || studentInfo.name || studentInfo.fullName;
        
        console.log('Student Data:', { studentId, collegeId, prnNo, studentName });
        
        if (!collegeId) {
          console.error('College ID not found');
          alert('College information not found. Please login again.');
          setLoading(false);
          return;
        }
        
        setStudentData({ ...studentInfo, studentId, collegeId, prnNo, studentName });
        
        if (studentId) {
          const consent = await studentPlacementService.getStudentConsent(studentId, policyId);
          if (consent) {
            setConsentGiven(consent.is_acknowledged && !consent.is_opt_out);
            setOptOut(consent.is_opt_out);
            setSignature(consent.student_name || '');
            if (consent.is_opt_out) setOptOutReason(consent.opt_out_reason || '');
          }
        }
      } catch (err) {
        console.error('Error loading consent:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  const placementPolicy = {
    title: "Placement Assistance Policy 2025-26",
    lastUpdated: "January 2026",
    sections: [
      {
        heading: "1. Eligibility Criteria",
        content: [
          "Minimum 60% in 10th and 12th standard",
          "Minimum CGPA of 6.5 in graduation",
          "No active backlogs at the time of placement drive",
          "Regular attendance (minimum 75%)"
        ]
      },
      {
        heading: "2. One Student - One Offer Policy",
        content: [
          "Students can accept only one job offer",
          "Once an offer is accepted, student will be locked from further placements",
          "Dream companies (>10 LPA) - students can apply for super-dream (>15 LPA)",
          "Students must inform placement cell within 24 hours of offer acceptance"
        ]
      },
      {
        heading: "3. Student Responsibilities",
        content: [
          "Maintain professional conduct during all placement activities",
          "Attend all scheduled drives unless prior permission obtained",
          "Update profile and resume regularly",
          "Respond to placement cell communications within 24 hours",
          "Abide by company-specific rules and regulations"
        ]
      },
      {
        heading: "4. Placement Cell Responsibilities",
        content: [
          "Invite reputed companies for campus recruitment",
          "Provide placement training and guidance",
          "Maintain transparency in the placement process",
          "Assist students in resume building and interview preparation"
        ]
      },
      {
        heading: "5. Code of Conduct",
        content: [
          "No malpractice or unfair means during selection process",
          "Respect company representatives and placement team",
          "Maintain confidentiality of company information",
          "Dress code: Formal attire for all placement activities"
        ]
      }
    ]
  };

  const handleConsentSubmit = async () => {
    if (!hasReadPolicy) {
      alert('Please read the complete policy document');
      return;
    }
    if (!signature.trim()) {
      alert('Please provide your digital signature');
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
        opt_out_reason: null
      };
      
      console.log('Submitting consent:', payload);
      await studentPlacementService.submitStudentConsent(payload);
      alert('Consent recorded successfully!');
      setConsentGiven(true);
    } catch (err) {
      console.error('Error submitting consent:', err);
      alert('Failed to submit consent. Please try again.');
    }
  };

  const handleOptOut = async () => {
    if (!optOutReason.trim()) {
      alert('Please provide a reason for opting out');
      return;
    }
    
    try {
      const payload = {
        college_id: studentData.collegeId,
        policy_id: policyId,
        student_id: studentData.studentId,
        student_name: studentData.studentName,
        prn_no: studentData.prnNo,
        is_acknowledged: false,
        is_opt_out: true,
        opt_out_reason: optOutReason
      };
      
      console.log('Submitting opt-out:', payload);
      await studentPlacementService.submitStudentConsent(payload);
      alert('Opt-out request submitted successfully');
      setOptOut(true);
      setShowOptOutForm(false);
    } catch (err) {
      console.error('Error submitting opt-out:', err);
      alert('Failed to submit opt-out. Please try again.');
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You have opted out of placements</h2>
            <p className="text-gray-600 mb-4">
              Your opt-out request has been recorded. You will not receive any placement notifications.
            </p>
            <p className="text-sm text-gray-500">
              If you wish to re-register, please contact the placement cell.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (consentGiven) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Consent Recorded Successfully!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully acknowledged the placement policy. You can now apply for job openings.
            </p>
            <div className="bg-white rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-600">
                <strong>Digital Signature:</strong> {signature}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Placement Policy & Consent</h1>
          <p className="text-gray-600 mt-1">Please read and acknowledge the placement policy</p>
        </div>

        {/* Policy Document */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{placementPolicy.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Last Updated: {placementPolicy.lastUpdated}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {placementPolicy.sections.map((section, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.heading}</h3>
                <ul className="space-y-2">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadPolicy}
                onChange={(e) => setHasReadPolicy(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I have read and understood the complete placement policy document and agree to abide by all the terms and conditions mentioned above.
              </span>
            </label>
          </div>
        </div>

        {/* Consent Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Acknowledgement</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name (Digital Signature) *
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              By typing your name, you are providing a digital signature
            </p>
          </div>

          <button
            onClick={handleConsentSubmit}
            disabled={!hasReadPolicy || !signature.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Submit Consent & Proceed
          </button>
        </div>

        {/* Opt Out Option */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Interested in Placements?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you do not wish to participate in campus placements, you can opt out. This action can be reversed by contacting the placement cell.
              </p>
              
              {!showOptOutForm ? (
                <button
                  onClick={() => setShowOptOutForm(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                >
                  Opt Out of Placements
                </button>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Opting Out *
                  </label>
                  <textarea
                    value={optOutReason}
                    onChange={(e) => setOptOutReason(e.target.value)}
                    rows="3"
                    placeholder="Please provide a reason..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleOptOut}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                    >
                      Confirm Opt Out
                    </button>
                    <button
                      onClick={() => {
                        setShowOptOutForm(false);
                        setOptOutReason('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
