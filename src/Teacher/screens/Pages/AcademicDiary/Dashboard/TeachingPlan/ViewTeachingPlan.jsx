'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, BookOpen, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { teachingPlanService } from '../../Services/teachingPlan.service';

export default function ViewTeachingPlan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    loadPlanData();
  }, [id]);

  const loadPlanData = async () => {
    setLoading(true);
    try {
      const response = await teachingPlanService.GetTeachingPlanById(id);

      if (response) {
        // Map API response to component state using enriched_modules
        setPlanData({
          // Academic Selection
          program: response.academic_year?.program_name || '-',
          teacher: response.teacher ? `${response.teacher.firstname} ${response.teacher.lastname}` : '-',
          academicYear: response.academic_year?.name || '-',
          semester: response.semester?.name || '-',
          batch: response.academic_year?.batch_name || '-',
          division: response.division?.division_name || response.division_name || '-',
          subject: response.subject?.name || '-',

          // Basic Information
          department: response.department?.department_name || '-',
          levelOfSubject: response.subject_level || '-',

          // Objectives
          selectedObjectives: response.objectives || [],

          // Course Outcomes
          courseOutcomes: response.course_outcome?.map((desc, idx) => ({
            coNumber: `CO${idx + 1}`,
            coDescription: desc
          })) || [],

          // Table rows - Use enriched_modules which has module_name and unit_name directly
          tableRows: response.enriched_modules?.map((mod, idx) => ({
            id: mod.teaching_module_id || idx,
            module: mod.module_name || '-',
            unit: mod.unit_name || '-',
            co: mod.co || [],
            moduleStartingMonth: mod.month || '-',
            week: mod.week || '-',
            noOfLectureHours: mod.lecture_hour || '-',
            preClassActivity: mod.pre_class_activity || '-',
            instructionalTechniques: mod.instructional_technique || '-',
            postClassActivity: mod.post_class_activity || '-'
          })) || []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading plan:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Teaching plan not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/teacher/academic-diary/teaching-plan')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-blue-700">View Teaching Plan</h2>
        </div>
        <button
          onClick={() => navigate(`/teacher/academic-diary/teaching-plan/edit/${id}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Edit Plan
        </button>
      </div>

      <div className="space-y-6">
        {/* Academic Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Academic Selection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ViewField label="Program" value={planData.program} />
            {/* <ViewField label="Teacher" value={planData.teacher} /> */}
            <ViewField label="Academic Year" value={planData.academicYear} />
            <ViewField label="Semester" value={planData.semester} />
            <ViewField label="Batch" value={planData.batch} />
            <ViewField label="Division" value={planData.division} />
            <ViewField label="Paper" value={planData.subject} />
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ViewField label="Department" value={planData.department} />
            <ViewField label="Level of Paper" value={planData.levelOfSubject} />
          </div>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectives</h3>
          <ul className="space-y-2">
            {planData.selectedObjectives.map((obj, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{obj.objective || obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Course Outcomes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Outcomes</h3>
          <div className="space-y-3">
            {planData.courseOutcomes.map((co, index) => (
              <div key={index} className="flex gap-3">
                <span className="font-semibold text-blue-600 min-w-[60px]">{co.coNumber}:</span>
                <span className="text-gray-700">{co.coDescription}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Plan Details Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Plan Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Module</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Unit</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">CO</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Starting Month</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Week</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Lecture Hours</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Pre Class Activity</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Instructional Technique</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white">Post Class Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {planData.tableRows.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-200">
                    <td className="px-3 py-3 text-sm text-gray-900">{row.module}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.unit}</td>
                    <td className="px-3 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {row.co.map((coNum) => (
                          <span key={coNum} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {coNum}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.moduleStartingMonth}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.week}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.noOfLectureHours}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.preClassActivity}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.instructionalTechniques}</td>
                    <td className="px-3 py-3 text-sm text-gray-900">{row.postClassActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => navigate(`/teacher/academic-diary/teaching-plan/edit/${id}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit Plan
          </button>
          <button
            onClick={() => navigate('/teacher/academic-diary/teaching-plan')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying fields
const ViewField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <div className="text-gray-900 font-medium">{value || '-'}</div>
  </div>
);
