import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Camera, AlertCircle } from 'lucide-react';

const QRScannerPage = () => {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [sessionData, setSessionData] = useState(null);

    // Parse session from URL on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');

        if (sessionParam) {
            try {
                // Decode base64 and parse JSON
                const decoded = atob(sessionParam);
                const session = JSON.parse(decoded);

                // Validate session expiry
                const now = new Date();
                const expiresAt = new Date(session.expiresAt);

                if (now > expiresAt) {
                    setError("QR Code has expired. Please ask your teacher for a new one.");
                    return;
                }

                setSessionData(session);
                // Auto-mark attendance
                markAttendance(session);
            } catch (err) {
                console.error("Error parsing session:", err);
                setError("Invalid QR Code. Please scan a valid attendance QR code.");
            }
        }
    }, []);

    useEffect(() => {
        // Get student info from localStorage
        const mockStudent = {
            id: 123,
            name: "John Doe",
            rollNo: "2024001",
            email: "john@example.com"
        };
        setStudentInfo(mockStudent);
    }, []);

    const markAttendance = async (session) => {
        if (!studentInfo) {
            setError("Student information not found");
            return;
        }

        setScanning(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Mark attendance API call
            console.log("Marking attendance:", {
                sessionId: session.sessionId,
                studentId: studentInfo.id,
                studentName: studentInfo.name,
                rollNo: studentInfo.rollNo,
                divisionId: session.divisionId,
                slotId: session.slotId,
                date: session.date
            });

            // TODO: Replace with actual API call
            // await attendanceService.markAttendance({...});

            setScanResult({
                success: true,
                message: "Attendance marked successfully!",
                session: session
            });
        } catch (err) {
            console.error("Error marking attendance:", err);
            setError("Failed to mark attendance. Please try again.");
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Scan Attendance QR
                    </h1>
                    <p className="text-gray-600">
                        Scan the QR code displayed by your teacher
                    </p>
                </div>

                {/* Student Info */}
                {studentInfo && !scanResult && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-xl font-bold text-primary-600">
                                    {studentInfo.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{studentInfo.name}</p>
                                <p className="text-sm text-gray-500">Roll No: {studentInfo.rollNo}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scanner */}
                {!scanning && !scanResult && !error && !sessionData && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                        <Camera className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Ready to Scan
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Please scan the QR code to mark your attendance
                        </p>
                        <p className="text-sm text-gray-500">
                            QR code should be provided by your teacher
                        </p>
                    </div>
                )}

                {/* Scanning View */}
                {scanning && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                        <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Scanning...</h2>
                        <p className="text-gray-600">Please wait while we process the QR code</p>
                    </div>
                )}

                {/* Success Result */}
                {scanResult?.success && (
                    <div className="bg-white rounded-xl shadow-lg border border-green-200 p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            Attendance Marked!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your attendance has been successfully recorded
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Division:</span>
                                    <span className="font-semibold">{scanResult.session.divisionName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-semibold">{scanResult.session.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-semibold">{scanResult.session.slotTime}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setScanResult(null);
                                setScanning(false);
                            }}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-700 mb-2">
                            Error
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {error}
                        </p>
                        <button
                            onClick={() => {
                                setError(null);
                                setScanning(false);
                            }}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-3">📱 Instructions</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Click "Start Scanning" button</li>
                        <li>• Point your device at the QR code</li>
                        <li>• Make sure the QR code is well-lit and in focus</li>
                        <li>• Wait for automatic detection</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QRScannerPage;
