'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, Award, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EligibilityChecker() {
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState({
    tenth_percentage: 85.5,
    twelfth_percentage: 88.2,
    graduation_cgpa: 7.5,
    backlogs: 0,
    year: '4th Year',
    department: 'Computer Science',
    gender: 'Male'
  });

  const [eligibleJobs, setEligibleJobs] = useState([]);
  const [ineligibleJobs, setIneligibleJobs] = useState([]);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = () => {
    // Mock job data with eligibility criteria
    const allJobs = [
      {
        id: 1,
        company: 'TCS',
        role: 'Software Developer',
        ctc: '4.5 LPA',
        criteria: {
          min_tenth: 60,
          min_twelfth: 60,
          min_cgpa: 6.5,
          max_backlogs: 0,
          departments: ['Computer Science', 'IT'],
          years: ['4th Year']
        }
      },
      {
        id: 2,
        company: 'Infosys',
        role: 'System Engineer',
        ctc: '5 LPA',
        criteria: {
          min_tenth: 65,
          min_twelfth: 65,
          min_cgpa: 7.0,
          max_backlogs: 0,
          departments: ['Computer Science', 'IT', 'ECE'],
          years: ['4th Year']
        }
      },
      {
        id: 3,
        company: 'Google',
        role: 'Software Engineer',
        ctc: '18 LPA',
        criteria: {
          min_tenth: 80,
          min_twelfth: 80,
          min_cgpa: 8.0,
          max_backlogs: 0,
          departments: ['Computer Science'],
          years: ['4th Year']
        }
      },
      {
        id: 4,
        company: 'Wipro',
        role: 'Project Engineer',
        ctc: '4 LPA',
        criteria: {
          min_tenth: 60,
          min_twelfth: 60,
          min_cgpa: 6.0,
          max_backlogs: 1,
          departments: ['Computer Science', 'IT', 'ECE', 'EEE'],
          years: ['4th Year']
        }
      },
      {
        id: 5,
        company: 'Microsoft',
        role: 'SDE',
        ctc: '20 LPA',
        criteria: {
          min_tenth: 85,
          min_twelfth: 85,
          min_cgpa: 8.5,
          max_backlogs: 0,
          departments: ['Computer Science'],
          years: ['4th Year']
        }
      },
      {
        id: 6,
        company: 'LearnQoch',
        role: 'Full Stack Developer',
        ctc: '6 LPA',
        criteria: {
          min_tenth: 70,
          min_twelfth: 70,
          min_cgpa: 7.5,
          max_backlogs: 0,
          departments: ['Computer Science', 'IT'],
          years: ['4th Year']
        }
      }
    ];

    const eligible = [];
    const ineligible = [];

    allJobs.forEach(job => {
      const reasons = [];
      let isEligible = true;

      if (studentProfile.tenth_percentage < job.criteria.min_tenth) {
        isEligible = false;
        reasons.push(`10th % should be ≥ ${job.criteria.min_tenth}%`);
      }
      if (studentProfile.twelfth_percentage < job.criteria.min_twelfth) {
        isEligible = false;
        reasons.push(`12th % should be ≥ ${job.criteria.min_twelfth}%`);
      }
      if (studentProfile.graduation_cgpa < job.criteria.min_cgpa) {
        isEligible = false;
        reasons.push(`CGPA should be ≥ ${job.criteria.min_cgpa}`);
      }
      if (studentProfile.backlogs > job.criteria.max_backlogs) {
        isEligible = false;
        reasons.push(`Max ${job.criteria.max_backlogs} backlogs allowed`);
      }
      if (!job.criteria.departments.includes(studentProfile.department)) {
        isEligible = false;
        reasons.push(`Department not eligible`);
      }
      if (!job.criteria.years.includes(studentProfile.year)) {
        isEligible = false;
        reasons.push(`Year not eligible`);
      }

      if (isEligible) {
        eligible.push({ ...job, reasons: [] });
      } else {
        ineligible.push({ ...job, reasons });
      }
    });

    setEligibleJobs(eligible);
    setIneligibleJobs(ineligible);
  };

  const getEligibilityPercentage = () => {
    const total = eligibleJobs.length + ineligibleJobs.length;
    return total > 0 ? Math.round((eligibleJobs.length / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Eligibility Checker</h1>
        <p className="text-gray-600 mt-1">Check your eligibility for available job openings</p>
      </div>

      {/* Student Profile Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">10th %</p>
            <p className="text-xl font-bold text-blue-600">{studentProfile.tenth_percentage}%</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">12th %</p>
            <p className="text-xl font-bold text-purple-600">{studentProfile.twelfth_percentage}%</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">CGPA</p>
            <p className="text-xl font-bold text-green-600">{studentProfile.graduation_cgpa}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Backlogs</p>
            <p className="text-xl font-bold text-orange-600">{studentProfile.backlogs}</p>
          </div>
        </div>
      </div>

      {/* Eligibility Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eligible Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{eligibleJobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Not Eligible</p>
              <p className="text-2xl font-bold text-gray-900">{ineligibleJobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eligibility Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getEligibilityPercentage()}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Eligible Jobs */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Eligible Job Openings ({eligibleJobs.length})
        </h2>
        {eligibleJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No eligible jobs found. Improve your profile to unlock more opportunities.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">CTC</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eligibleJobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <p className="font-semibold">{job.company}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{job.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="font-semibold text-green-600">{job.ctc}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Eligible
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => navigate('/student-placement/job-openings')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                          >
                            View & Apply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {eligibleJobs.length > 10 && (
              <div className="hidden lg:flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-600 rounded-b-xl">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Showing 1–{eligibleJobs.length} of {eligibleJobs.length} entries
                </span>
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Next
                </button>
              </div>
            )}

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {eligibleJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-green-200 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{job.company}</h3>
                      <p className="text-sm text-gray-600">{job.role}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Eligible
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">{job.ctc}</span>
                  </div>
                  <button
                    onClick={() => navigate('/student-placement/job-openings')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    View & Apply
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ineligible Jobs */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <XCircle className="w-6 h-6 text-red-600" />
          Not Eligible ({ineligibleJobs.length})
        </h2>
        {ineligibleJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">Great! You are eligible for all available jobs.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">CTC</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Reasons</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ineligibleJobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <p className="font-semibold">{job.company}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{job.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <span className="font-semibold text-gray-600">{job.ctc}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Not Eligible
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <ul className="space-y-1">
                            {job.reasons.map((reason, idx) => (
                              <li key={idx} className="text-xs text-red-700 flex items-start gap-1">
                                <span className="mt-0.5">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {ineligibleJobs.length > 10 && (
              <div className="hidden lg:flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-600 rounded-b-xl">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Showing 1–{ineligibleJobs.length} of {ineligibleJobs.length} entries
                </span>
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  Next
                </button>
              </div>
            )}

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {ineligibleJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-red-200 p-5 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{job.company}</h3>
                      <p className="text-sm text-gray-600">{job.role}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      Not Eligible
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">{job.ctc}</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-900 mb-2">Reasons:</p>
                    <ul className="space-y-1">
                      {job.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-red-700 flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
