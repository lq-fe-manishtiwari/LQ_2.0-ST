import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Award,
  Target,
  TrendingUp,
  Calendar,
  BookOpen
} from 'lucide-react';
import { assessmentService } from '../Services/assessment.service';

const ViewAssessmentResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        console.log('Fetching assessment result for attempt ID:', id);
        const response = await assessmentService.getAssessmentResult(id);

        if (response) {
          // Map API response to UI model
          const mappedResult = {
            id: response.attempt_id || id,
            assessmentTitle: response.assessment_title || 'Assessment Result',
            subject: response.subject_name || 'N/A',
            totalQuestions: response.total_questions || 0,
            correctAnswers: response.correct_answers || 0,
            wrongAnswers: response.wrong_answers || 0,
            unanswered: response.unanswered_questions || 0,
            totalMarks: response.total_marks || 0,
            obtainedMarks: response.obtained_marks || 0,
            percentage: response.percentage || 0,
            grade: response.grade || 'N/A',
            timeTaken: response.time_spent_minutes ? `${response.time_spent_minutes} minutes` : 'N/A',
            submittedAt: response.submitted_at || new Date().toISOString(),
            status: response.status || 'Completed',
            overallFeedback: response.feedback || 'Great effort! Review your answers to improve further.'
          };
          setResult(mappedResult);
        } else {
          throw new Error('No data received from API');
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError('Failed to load assessment results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': case 'A+': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'B': case 'B+': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'C': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'D': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'F': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Calculating your performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 sm:px-10 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 flex items-center justify-center bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assessment Results</h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {result.assessmentTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${getGradeColor(result.grade)}`}>
                  GRADE: {result.grade}
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${result.status === 'Passed' || result.status === 'Completed'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200'
                  }`}>
                  {result.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-32 bg-emerald-50 rounded-3xl flex items-center justify-center border-2 border-emerald-100 flex-shrink-0">
                <Trophy className="w-16 h-16 text-emerald-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{result.subject}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-slate-500 font-medium">
                  <p className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Attempt ID: {result.id}</p>
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date: {new Date(result.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-center md:text-right px-8 py-4 bg-blue-50 border border-blue-100 rounded-2xl min-w-[180px]">
                <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-1">Total Score</p>
                <p className="text-5xl font-black text-blue-700">{result.percentage}<span className="text-2xl">%</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Marks</p>
            <p className="text-2xl font-bold text-slate-900">{result.obtainedMarks} <span className="text-slate-400 text-sm font-medium">/ {result.totalMarks}</span></p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Correct</p>
            <p className="text-2xl font-bold text-emerald-600">{result.correctAnswers}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Wrong</p>
            <p className="text-2xl font-bold text-red-500">{result.wrongAnswers}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Time Spent</p>
            <p className="text-2xl font-bold text-slate-900">{result.timeTaken}</p>
          </div>
        </div>

        {/* Feedback Section */}
        {result.overallFeedback && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Performance Feedback</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                <Award className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-emerald-900 text-lg font-medium italic leading-relaxed">
                  "{result.overallFeedback}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAssessmentResult;