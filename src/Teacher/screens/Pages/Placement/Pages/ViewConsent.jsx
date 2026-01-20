'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ViewConsent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [consentData, setConsentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsentData();
  }, [studentId]);

  const loadConsentData = async () => {
    setLoading(true);
    // Mock data - replace with API call
    const mockData = {
      student_id: studentId,
      roll_no: 'CS2021001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@college.edu',
      department: 'Computer Science',
      semester: '6th',
      cgpa: '8.5',
      consent_status: 'accepted',
      consent_date: '15/01/2026',
      consent_time: '10:30 AM',
      signature: 'Rahul Sharma',
      ip_address: '192.168.1.100',
      opted_out: false,
      opt_out_reason: '',
      policy_version: 'v1.0 - Academic Year 2025-26',
      policy_accepted_points: [
        'I agree to participate in the campus placement process',
        'I understand the one-student-one-offer policy',
        'I will maintain professional conduct during interviews',
        'I authorize the college to share my academic records with companies',
        'I will inform TPO immediately if I receive any external offer'
      ]
    };
    setConsentData(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!consentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Consent data not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/teacher/placement/student-consents')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Consent Details</h2>
            <p className="text-gray-600 mt-1">View placement consent information</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Consent Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                {consentData.consent_date} at {consentData.consent_time}
              </p>
            </div>
            <div>
              {consentData.consent_status === 'accepted' ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Accepted
                </span>
              ) : consentData.opted_out ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
                  <XCircle className="w-5 h-5" />
                  Opted Out
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold">
                  <XCircle className="w-5 h-5" />
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="font-medium text-gray-900">{consentData.roll_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{consentData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{consentData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium text-gray-900">{consentData.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Semester</p>
              <p className="font-medium text-gray-900">{consentData.semester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CGPA</p>
              <p className="font-medium text-gray-900">{consentData.cgpa}</p>
            </div>
          </div>
        </div>

        {/* Consent Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consent Details</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Policy Version</p>
              <p className="font-medium text-gray-900">{consentData.policy_version}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Accepted Terms</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {consentData.policy_accepted_points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Digital Signature</p>
              <div className="mt-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="font-signature text-2xl text-blue-900">{consentData.signature}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Consent Date & Time</p>
                <p className="font-medium text-gray-900">
                  {consentData.consent_date} at {consentData.consent_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-medium text-gray-900">{consentData.ip_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opt-out Information (if applicable) */}
        {consentData.opted_out && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Opt-out Information</h3>
            <div>
              <p className="text-sm text-red-600">Reason for Opting Out</p>
              <p className="font-medium text-red-900 mt-1">{consentData.opt_out_reason}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={() => navigate('/teacher/placement/student-consents')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
