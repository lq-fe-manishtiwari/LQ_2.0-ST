import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, AlertCircle, Timer } from 'lucide-react';
import { ContentService } from '../../Service/Content.service';
import SweetAlert from 'react-bootstrap-sweetalert';

export default function QuizModal({ isOpen, onClose, onShowHistory, quizId, colorCode, contentId, studentId: propStudentId, academicYearId, semesterId }) {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [timeExpired, setTimeExpired] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const timerRef = useRef(null);

    // Fetch student profile
    const fetchStudentProfile = async () => {
        try {
            console.log('Fetching student profile...');
            const response = await ContentService.getProfile();
            console.log('Profile response:', response);

            if (response.success && response.data) {
                const extractedStudentId = response.data.student_id || response.data.id;
                console.log('Extracted student ID:', extractedStudentId);
                setStudentId(extractedStudentId);
            } else {
                console.error('Failed to get profile data:', response);
            }
        } catch (error) {
            console.error('Error fetching student profile:', error);
        }
    };

    // Fetch quiz data from API
    const fetchQuiz = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await ContentService.getQuizById(id);
            if (response.success) {
                // Process the quiz data to match our expected format
                const processedQuiz = {
                    quiz_name: response.data.quiz_name,
                    duration: response.data.duration,
                    questions: response.data.questions?.map(q => ({
                        question_text: q.question,
                        options: [
                            q.option1,
                            q.option2,
                            q.option3,
                            q.option4,
                            q.option5,
                            q.option6
                        ].filter(option => option !== null && option !== undefined && option.trim() !== ''),
                        correct_answer: q.answer,
                        question_id: q.question_id,
                        default_weightage: q.default_weightage || 1
                    })) || []
                };

                setQuiz(processedQuiz);

                // Initialize answers object
                const initialAnswers = {};
                processedQuiz.questions.forEach((_, index) => {
                    initialAnswers[index] = null;
                });
                setAnswers(initialAnswers);

                // Initialize timer and set start time
                if (response.data.duration) {
                    setTimeRemaining(response.data.duration * 60); // Convert minutes to seconds
                    setQuizStartTime(new Date());
                    startTimer();
                }
            } else {
                setError('Failed to fetch quiz');
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setError('Failed to load quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Timer functions
    const startTimer = () => {
        if (timerStarted) return;

        setTimerStarted(true);
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Time's up - clear timer first, then auto submit
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    setTimerStarted(false);
                    setTimeExpired(true);

                    // Use setTimeout to ensure state updates are processed
                    setTimeout(() => {
                        handleSubmit(true); // Pass true to indicate auto-submit
                    }, 100);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimerStarted(false);
    };

    // Format time for display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Load quiz when modal opens
    useEffect(() => {
        if (isOpen && quizId) {
            fetchStudentProfile(); // Fetch student ID first
            fetchQuiz(quizId);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setSubmitted(false);
            setScore(null);
            setTimeRemaining(0);
            setTimerStarted(false);
            setQuizStartTime(null);
            setSaving(false);
            setSaveError(null);
            setTimeExpired(false);
            setShowSuccessAlert(false);
            setShowErrorAlert(false);

        } else if (!isOpen) {
            // Clean up timer when modal closes
            stopTimer();
        }

        // Cleanup timer on unmount
        return () => {
            stopTimer();
        };
    }, [isOpen, quizId]);

    // Handle auto-submit when time expires
    useEffect(() => {
        if (timeExpired && !submitted) {
            handleSubmit(true);
        }
    }, [timeExpired, submitted]);

    // Handle answer selection
    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    // Navigate to next question
    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    // Navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Submit quiz
    const handleSubmit = async (isAutoSubmit = false) => {
        if (!quiz || !quiz.questions) return;

        // If manually submitting, prevent auto-submit from running
        if (!isAutoSubmit) {
            setTimeExpired(false);
        }

        // Stop the timer
        stopTimer();

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question, index) => {
            const selectedOptionIndex = answers[index];

            // Convert correct_answer from string to 0-based index
            const correctAnswerIndex = parseInt(question.correct_answer) - 1;

            if (selectedOptionIndex !== null && selectedOptionIndex === correctAnswerIndex) {
                correctAnswers++;
            }
        });

        // Set raw score (number of correct answers)
        setScore(correctAnswers);

        // Calculate time taken in seconds
        const timeTaken = quizStartTime ? Math.floor((new Date() - quizStartTime) / 1000) : 0;

        setSubmitted(true);

        // Save quiz result to backend - send raw score (correct answers count)
        await saveQuizResult(correctAnswers, totalQuestions, timeTaken, isAutoSubmit);
    };

    // SweetAlert functions
    const showSweetAlert = (type, title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        if (type === 'success') {
            setShowSuccessAlert(true);
        } else {
            setShowErrorAlert(true);
        }
    };

    // Save quiz result function
    const saveQuizResult = async (correctAnswers, totalQuestions, timeTaken, isAutoSubmit = false) => {
        console.log('Attempting to save quiz result:', {
            contentId,
            studentId,
            quizId,
            correctAnswers,
            totalQuestions,
            timeTaken
        });

        if (!contentId || !studentId) {
            const errorMsg = `Missing required data - contentId: ${contentId}, studentId: ${studentId}`;
            console.error(errorMsg);
            showSweetAlert('error', 'Error', 'Unable to save quiz result. Missing required information.');
            return;
        }

        setSaving(true);
        setSaveError(null);

        try {
            const resultData = {
                content_id: contentId,
                quiz_id: quizId,
                student_id: studentId,
                score: correctAnswers,
                total_marks: totalQuestions,
                time_taken: timeTaken,
                completed: true,
                academic_year_id: academicYearId,
                semester_id: semesterId
            };

            const response = await ContentService.saveQuizResult(resultData);

            if (response.success) {
                // Show appropriate success message
                if (isAutoSubmit) {
                    showSweetAlert('success', 'Time Up!', 'Your response has been submitted successfully.');
                } else {
                    showSweetAlert('success', 'Success', 'Quiz submitted successfully!');
                }
            } else {
                throw new Error('Failed to save quiz result');
            }
        } catch (error) {
            console.error('Error saving quiz result:', error);
            setSaveError('Failed to save quiz result. Please try again.');
            if (isAutoSubmit) {
                showSweetAlert('error', 'Time Up!', 'Error saving your response. Please contact support.');
            } else {
                showSweetAlert('error', 'Error', 'Failed to save quiz result. Please contact support.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Check if all questions are answered
    const allQuestionsAnswered = quiz?.questions?.every((_, index) => answers[index] !== null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: `${colorCode}20` }}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {quiz?.quiz_name || 'Quiz'}
                        </h2>
                        {quiz?.description && (
                            <p className="text-gray-600 mt-1">{quiz.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Timer Display */}
                        {quiz && quiz.duration && !submitted && (
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                                <Timer className={`w-5 h-5 ${timeRemaining <= 300 ? 'text-red-500' : 'text-blue-500'}`} />
                                <span className={`font-mono text-lg font-semibold ${timeRemaining <= 300 ? 'text-red-500' : 'text-gray-700'}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">Loading quiz...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={() => fetchQuiz(quizId)}
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {quiz && !submitted && (
                        <div>
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Question {currentQuestionIndex + 1} of {quiz.questions?.length || 0}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {Object.values(answers).filter(a => a !== null).length} answered
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            backgroundColor: colorCode,
                                            width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Current Question */}
                            {quiz.questions && quiz.questions[currentQuestionIndex] && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                                        {quiz.questions[currentQuestionIndex].question_text}
                                    </h3>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {quiz.questions[currentQuestionIndex].options?.map((option, optionIndex) => (
                                            <button
                                                key={optionIndex}
                                                onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${answers[currentQuestionIndex] === optionIndex
                                                        ? 'border-current bg-opacity-10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                style={{
                                                    borderColor: answers[currentQuestionIndex] === optionIndex ? colorCode : undefined,
                                                    backgroundColor: answers[currentQuestionIndex] === optionIndex ? `${colorCode}10` : undefined
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 mr-3 ${answers[currentQuestionIndex] === optionIndex
                                                                ? 'border-current'
                                                                : 'border-gray-300'
                                                            }`}
                                                        style={{
                                                            borderColor: answers[currentQuestionIndex] === optionIndex ? colorCode : undefined,
                                                            backgroundColor: answers[currentQuestionIndex] === optionIndex ? colorCode : undefined
                                                        }}
                                                    >
                                                        {answers[currentQuestionIndex] === optionIndex && (
                                                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-700">{option}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz Results */}
                    {submitted && score !== null && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h3>
                            <p className="text-xl text-gray-600 mb-6">
                                Your Score: <span className="font-bold" style={{ color: colorCode }}>{score}</span>
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-gray-700">
                                    You answered {Object.values(answers).filter((answer, index) => {
                                        if (answer === null) return false;
                                        const correctAnswerIndex = parseInt(quiz.questions[index]?.correct_answer) - 1;
                                        return answer === correctAnswerIndex;
                                    }).length} out of {quiz.questions?.length || 0} questions correctly.
                                </p>
                                {quiz.duration && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Quiz Duration: {quiz.duration} minutes
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {quiz && !submitted && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex gap-3">
                            {currentQuestionIndex < (quiz.questions?.length || 0) - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                                    style={{ backgroundColor: colorCode }}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={!allQuestionsAnswered || saving}
                                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    style={{ backgroundColor: colorCode }}
                                >
                                    {saving && <Clock className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Saving...' : 'Submit Quiz'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {submitted && (
                    <div className="flex justify-center p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                            style={{ backgroundColor: colorCode }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Success Alert */}
            {showSuccessAlert && (
                <SweetAlert
                    success
                    title={alertTitle}
                    onConfirm={() => setShowSuccessAlert(false)}
                    confirmBtnStyle={{ backgroundColor: colorCode, color: 'white' }}
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {/* Error Alert */}
            {showErrorAlert && (
                <SweetAlert
                    error
                    title={alertTitle}
                    onConfirm={() => setShowErrorAlert(false)}
                    confirmBtnStyle={{ backgroundColor: colorCode }}
                >
                    {alertMessage}
                </SweetAlert>
            )}
        </div>
    );
}