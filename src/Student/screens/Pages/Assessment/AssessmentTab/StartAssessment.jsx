import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Play, BookOpen, Timer, FileText, Target, ArrowLeft } from 'lucide-react';
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
        const response = await assessmentService.getAssessmentQuestions(id);

        if (response) {
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
            type: response.type
          };

          setAssessment(assessmentData);
        }
      } catch (error) {
        console.error('Error fetching assessment:', error);
        setAssessment({
          id: id,
          title: assessmentFromNav.title || 'Assessment',
          subject: assessmentFromNav.subject || 'General',
          duration: assessmentFromNav.duration || 90,
          totalQuestions: 0,
          totalMarks: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [id]);

  const handleStartAssessment = () => {
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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-4 sm:py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          {/* Horizontal Compact Header */}
          <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100/50 rounded-lg flex items-center justify-center border border-blue-100 hidden sm:flex">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                  {assessment.title}
                </h1>
                <p className="text-slate-500 text-[11px] sm:text-xs font-medium">
                  Subject: <span className="text-primary-600 font-bold">{assessment.subject}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 border border-slate-200 font-bold transition-all shadow-sm text-[11px] sm:text-xs order-first sm:order-last sm:self-center"
            >
              <ArrowLeft className="w-3 h-3 mr-1 inline" />
              Dashboard
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {/* Tighter Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="bg-blue-50/30 rounded-xl p-4 flex items-center gap-4 border border-blue-50">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Timer className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                  <p className="text-lg font-black text-slate-900">{assessment.duration} <span className="text-[10px] font-medium text-slate-500 uppercase">min</span></p>
                </div>
              </div>

              <div className="bg-emerald-50/30 rounded-xl p-4 flex items-center gap-4 border border-emerald-50">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                  <p className="text-lg font-black text-slate-900">{assessment.totalQuestions}</p>
                </div>
              </div>

              <div className="bg-purple-50/30 rounded-xl p-4 flex items-center gap-4 border border-purple-50">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                  <p className="text-lg font-black text-slate-900">{assessment.totalMarks}</p>
                </div>
              </div>
            </div>

            {/* Compact Action Section */}
            <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Ready to Start?</h3>
              <p className="text-slate-500 mb-6 text-[11px] sm:text-xs max-w-lg mx-auto leading-relaxed">
                Once you start, the timer will begin.
                Ensure a stable connection for the best experience.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 font-bold transition-all border border-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAssessment}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold transition-all shadow-md hover:shadow-lg transform active:scale-95 text-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Start Test Now
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