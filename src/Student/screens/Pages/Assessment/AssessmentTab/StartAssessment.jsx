import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Clock, FileText, AlertCircle, Play, BookOpen, Target, Timer, CheckCircle2, ArrowLeft } from 'lucide-react';
import { assessmentService } from '../Services/assessment.service';

const StartAssessment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const assessmentFromNav = location.state || {};

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);

        // Fetch assessment questions to get metadata
        const response = await assessmentService.getAssessmentQuestions(id);

        if (response) {
          // Calculate total marks from questions
          const totalMarks = response.questions?.reduce((sum, q) => sum + (q.default_marks || 0), 0) || 0;

          const assessmentData = {
            id: id,
            title: assessmentFromNav.title || response.assessment_title || 'Assessment',
            subject: assessmentFromNav.subject || response.subject_name || 'General',
            duration: response.time_limit_minutes || assessmentFromNav.duration || 90,
            totalQuestions: response.questions?.length || 0,
            totalMarks: totalMarks,
            mode: response.mode,
            category: response.category,
            type: response.type,
            instructions: [
              'Read all questions carefully before answering',
              response.category === 'SUBJECTIVE' ? 'Write detailed answers for subjective questions' : 'Each question carries equal marks',
              'There is no negative marking',
              'You can navigate between questions using Next/Previous buttons',
              'Submit the assessment before time expires'
            ]
          };

          setAssessment(assessmentData);
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
        // Fallback to navigation state if API fails
        setAssessment({
          id: id,
          title: assessmentFromNav.title || 'Assessment',
          subject: assessmentFromNav.subject || 'General',
          duration: assessmentFromNav.duration || 90,
          totalQuestions: 0,
          totalMarks: 0,
          instructions: [
            'Read all questions carefully before answering',
            'Each question carries equal marks',
            'There is no negative marking',
            'You can navigate between questions using Next/Previous buttons',
            'Submit the assessment before time expires'
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [id]);

  const handleStartAssessment = () => {
    // Pass assessment data to TakeAssessment page
    navigate(`/my-assessment/assessment/take/${id}`, {
      state: {
        title: assessment.title,
        subject: assessment.subject,
        duration: assessment.duration,
        category: assessment.category
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-100 border border-slate-200 font-semibold transition-all duration-200 shadow-sm mb-4 sm:mb-6 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assessments
            </button>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 px-2">{assessment.title}</h1>
              <p className="text-slate-600 text-base sm:text-lg font-medium">Subject: {assessment.subject}</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Enhanced Assessment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-blue-200 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1 sm:mb-2">Duration</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{assessment.duration} mins</p>
              </div>
              <div className="bg-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-emerald-200 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1 sm:mb-2">Questions</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{assessment.totalQuestions}</p>
              </div>
              <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-purple-200 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1 sm:mb-2">Total Marks</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{assessment.totalMarks}</p>
              </div>
            </div>

            {/* Enhanced Instructions */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Important Instructions</h2>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {assessment.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Action Section */}
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Ready to Begin?</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">Once you start, the timer will begin and you cannot pause the assessment.</p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-100 font-semibold transition-all duration-200 border border-slate-200 shadow-sm text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAssessment}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Assessment Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartAssessment;