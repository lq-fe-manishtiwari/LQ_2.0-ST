import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, AlertCircle, Loader, User, Hash, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAttendanceManagement } from './Services/attendance.service';

const MarkAttendancePage = () => {
    const navigate = useNavigate();
    const [method, setMethod] = useState(null); // 'qr', 'code', or 'link'
    const [sessionData, setSessionData] = useState(null);
    const [sessionCode, setSessionCode] = useState('');
    const [studentId, setStudentId] = useState(null);
    const [rollNo, setRollNo] = useState('');
    const [studentName, setStudentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Check if user is a teacher - redirect to dashboard
    useEffect(() => {
        console.log("=== Checking User Role ===");
        try {
            const userProfile = localStorage.getItem("userProfile");
            if (userProfile) {
                const profile = JSON.parse(userProfile);
                const userRole = profile.role || profile.user_type;

                console.log("User Role:", userRole);

                // If teacher, redirect to teacher dashboard
                if (userRole === 'teacher' || userRole === 'Teacher' || userRole === 'TEACHER' || profile.teacher_id) {
                    console.log("⚠️ Teacher detected - Redirecting to dashboard");
                    navigate('/dashboard');
                    return;
                }

                console.log("✅ Student access granted");
            }
        } catch (err) {
            console.error("Error checking user role:", err);
        }
    }, [navigate]);

    // Check if session is in URL (from QR scan or link)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('s');

        console.log("=== QR Attendance Page Loaded ===");
        console.log("URL:", window.location.href);
        console.log("Session Parameter:", sessionParam);

        if (sessionParam) {
            try {
                const decoded = atob(sessionParam);
                const session = JSON.parse(decoded);

                console.log("=== Decoded Session Data ===");
                console.log("Session ID:", session.sessionId);
                console.log("Academic Year ID:", session.academic_year_id);
                console.log("Semester ID:", session.semester_id);
                console.log("Division ID:", session.division_id);
                console.log("Subject ID:", session.subject_id);
                console.log("Timetable ID:", session.timetable_id);
                console.log("Timetable Allocation ID:", session.timetable_allocation_id);
                console.log("Time Slot ID:", session.time_slot_id);
                console.log("Date:", session.date);
                console.log("Slot Time:", session.slotTime);
                console.log("Timestamp:", session.timestamp);
                console.log("Expires At:", session.expiresAt);

                // Validate expiry
                const now = new Date();
                const expiresAt = new Date(session.expiresAt);

                console.log("Current Time:", now.toISOString());
                console.log("Expiry Time:", expiresAt.toISOString());
                console.log("Is Expired:", now > expiresAt);

                if (now > expiresAt) {
                    setError("This QR code has expired. Please ask your teacher for a new one.");
                    return;
                }

                setSessionData(session);
                setMethod('link');
                console.log("✅ Session validated successfully");
            } catch (err) {
                console.error("❌ Error parsing session:", err);
                setError("Invalid QR code or link. Please try again.");
            }
        } else {
            console.log("⚠️ No session parameter found in URL");
        }
    }, []);

    // Load current user data from localStorage
    useEffect(() => {
        console.log("=== Loading Student Data ===");
        try {
            const userProfile = localStorage.getItem("userProfile");
            console.log("User Profile from localStorage:", userProfile);

            if (userProfile) {
                const profile = JSON.parse(userProfile);
                console.log("Parsed Profile:", profile);

                const extractedStudentId = profile.student_id || profile.id;

                // Construct full name from firstname, middlename, lastname
                const firstName = profile.firstname || '';
                const middleName = profile.middlename || '';
                const lastName = profile.lastname || '';
                const fullName = `${firstName} ${middleName} ${lastName}`.trim();

                const extractedRollNo = profile.roll_number || profile.roll_no || profile.employeeId || '';

                console.log("Extracted Student ID:", extractedStudentId);
                console.log("Extracted First Name:", firstName);
                console.log("Extracted Middle Name:", middleName);
                console.log("Extracted Last Name:", lastName);
                console.log("Constructed Full Name:", fullName);
                console.log("Extracted Roll No:", extractedRollNo);

                setStudentId(extractedStudentId);
                setStudentName(fullName);
                setRollNo(extractedRollNo);

                console.log("✅ Student data loaded successfully");
            } else {
                console.log("⚠️ No userProfile found in localStorage");
            }
        } catch (err) {
            console.error("❌ Error loading user data:", err);
        }
    }, []);

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // TODO: Validate session code via API
            // const session = await attendanceService.validateSessionCode(sessionCode);

            // Mock validation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For demo, create mock session
            const mockSession = {
                sessionId: `ATT_${sessionCode}`,
                divisionName: "Division A",
                date: new Date().toISOString().split('T')[0],
                slotTime: "09:00 - 10:00",
                programName: "MCA",
                batchName: "2024-2025"
            };

            setSessionData(mockSession);
            setMethod('code');
        } catch (err) {
            setError("Invalid session code. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();

        if (!rollNo || !studentName) {
            setError("Please fill in all fields");
            return;
        }

        if (!studentId) {
            setError("Student ID not found. Please login again.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare attendance data matching teacher's bulk attendance format
            const attendanceData = {
                academic_year_id: sessionData.academic_year_id,
                semester_id: sessionData.semester_id,
                division_id: sessionData.division_id,
                subject_id: sessionData.subject_id,
                timetable_id: sessionData.timetable_id,
                timetable_allocation_id: sessionData.timetable_allocation_id || null,
                time_slot_id: sessionData.time_slot_id,
                date: sessionData.date,
                students: [
                    {
                        student_id: parseInt(studentId),
                        status_id: 1, // 1 = Present
                        remarks: 'Marked via QR Code'
                    }
                ]
            };

            console.log("Marking attendance:", attendanceData);

            const response = await StudentAttendanceManagement.markAttendance(attendanceData);

            if (response.success) {
                setSuccess(true);
            } else {
                setError(response.message || "Failed to mark attendance. Please try again.");
            }
        } catch (err) {
            console.error("Error marking attendance:", err);
            setError("Failed to mark attendance. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Success Screen
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-green-700 mb-3">
                        Attendance Marked! ✅
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your attendance has been successfully recorded
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-semibold text-gray-800">{studentName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Roll No:</span>
                            <span className="font-semibold text-gray-800">{rollNo}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Division:</span>
                            <span className="font-semibold text-gray-800">{sessionData.divisionName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold text-gray-800">{sessionData.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold text-gray-800">{sessionData.slotTime}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.close()}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    // Error Screen
    if (error && !sessionData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-700 mb-3">
                        Oops! Something went wrong
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={() => {
                            setError(null);
                            window.location.href = '/attendance/mark';
                        }}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Student Details Form (after session is validated)
    if (sessionData && !success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Mark Your Attendance
                        </h1>
                        <div className="bg-blue-50 rounded-lg p-3 mt-3 space-y-1">
                            {sessionData.subject_name && (
                                <p className="text-sm text-blue-900 font-bold">
                                    📚 {sessionData.subject_name}
                                </p>
                            )}
                            <p className="text-sm text-blue-900 font-semibold">
                                📅 {sessionData.date}
                            </p>
                            <p className="text-sm text-blue-700">
                                🕐 {sessionData.slotTime}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="inline w-4 h-4 mr-1" />
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={studentName}
                                readOnly
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Hash className="inline w-4 h-4 mr-1" />
                                Roll Number
                            </label>
                            <input
                                type="text"
                                value={rollNo}
                                readOnly
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Marking Attendance...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Mark Attendance
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Initial Screen - Choose Method
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Mark Your Attendance
                    </h1>
                    <p className="text-gray-600">
                        Choose how you want to mark your attendance
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Method 1: QR Code Scan */}
                    <div className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-all cursor-pointer bg-blue-50">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl">📱</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    Scan QR Code
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Use your phone camera to scan the QR code displayed by your teacher
                                </p>
                                <p className="text-xs text-blue-700 font-semibold">
                                    ✓ Fastest method • ✓ No typing required
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Method 2: Enter Code */}
                    <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl">💻</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    Enter Session Code
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Type the 6-digit code shown by your teacher
                                </p>

                                <form onSubmit={handleCodeSubmit} className="space-y-3">
                                    <input
                                        type="text"
                                        value={sessionCode}
                                        onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code (e.g., ABC123)"
                                        maxLength={6}
                                        className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-lg font-bold uppercase"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || sessionCode.length < 6}
                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? 'Validating...' : 'Continue →'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Method 3: Link Info */}
                    <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl">🔗</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    Click Shared Link
                                </h3>
                                <p className="text-sm text-gray-600">
                                    If your teacher shared a link via WhatsApp or email, just click it
                                </p>
                                <p className="text-xs text-green-700 font-semibold mt-2">
                                    ✓ Direct access • ✓ No code needed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">💡 Need Help?</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Make sure you're in the correct class session</li>
                        <li>• Session codes expire after 30 minutes</li>
                        <li>• Contact your teacher if you face any issues</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendancePage;