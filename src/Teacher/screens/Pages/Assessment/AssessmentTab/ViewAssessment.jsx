'use client';
import React from 'react';
import { Calendar, Clock, Users, BookOpen, Target, Award, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import assesment_logo from '@/_assets/images_new_design/Assessment_logo.svg';

const ViewAssessment = ({ assessmentData, onEdit }) => {
  const navigate = useNavigate();
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'objective': return <Target className="w-5 h-5" />;
      case 'subjective': return <BookOpen className="w-5 h-5" />;
      case 'coding': return <Award className="w-5 h-5" />;
      case 'mixed': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center p-3">
                <img src={assesment_logo} alt="Assessment" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{assessmentData?.title || 'Assessment Title'}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assessmentData?.status)}`}>
                    {assessmentData?.status || 'Active'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {assessmentData?.int_ext_type || 'Internal'} Assessment
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  Edit Assessment
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>

          {/* Assessment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Program Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Program Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Program:</span> {assessmentData?.grade_name || 'MBA Grade Testing'}</div>
                <div><span className="font-medium">Class:</span> {assessmentData?.class_name || 'FY'}</div>
                <div><span className="font-medium">Division:</span> {assessmentData?.division_name || 'A'}</div>
              </div>
            </div>

            {/* Subject & Category */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getCategoryIcon(assessmentData?.test_category)}
                <h3 className="font-semibold text-gray-800">Subject & Category</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Subject:</span> {assessmentData?.subject_name || 'Mathematics'}</div>
                <div><span className="font-medium">Category:</span> {assessmentData?.test_category || 'Objective'}</div>
              </div>
            </div>

            {/* Marks Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Marks Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Total Marks:</span> {assessmentData?.max_marks || '100'}</div>
                <div><span className="font-medium">Passing Marks:</span> {assessmentData?.min_marks || '40'}</div>
                <div><span className="font-medium">Pass Percentage:</span> {assessmentData?.min_marks && assessmentData?.max_marks ? Math.round((assessmentData.min_marks / assessmentData.max_marks) * 100) : '40'}%</div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Schedule</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Result Date:</span> {formatDate(assessmentData?.date_time)}</div>
                <div><span className="font-medium">Duration:</span> {assessmentData?.time_limit || 'N/A'} minutes</div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-800">Statistics</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Total Students:</span> {assessmentData?.total_students || '0'}</div>
                <div><span className="font-medium">Completed:</span> {assessmentData?.completed_students || '0'}</div>
                <div><span className="font-medium">Pending:</span> {(assessmentData?.total_students || 0) - (assessmentData?.completed_students || 0)}</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Additional Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Created:</span> {formatDate(assessmentData?.created_at)}</div>
                <div><span className="font-medium">Modified:</span> {formatDate(assessmentData?.updated_at)}</div>
                <div><span className="font-medium">Created By:</span> {assessmentData?.created_by || 'Admin'}</div>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          {assessmentData?.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
              <p className="text-sm text-gray-700">{assessmentData.instructions}</p>
            </div>
          )}

          {/* Questions Summary */}
          {assessmentData?.questions && assessmentData.questions.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Questions Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-green-600">{assessmentData.questions.filter(q => q.level === 'EASY').length}</div>
                  <div className="text-gray-600">Easy Questions</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-yellow-600">{assessmentData.questions.filter(q => q.level === 'MEDIUM').length}</div>
                  <div className="text-gray-600">Medium Questions</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl font-bold text-red-600">{assessmentData.questions.filter(q => q.level === 'HARD').length}</div>
                  <div className="text-gray-600">Hard Questions</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-lg font-semibold text-gray-800">Total Questions: {assessmentData.questions.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAssessment;