import React, { useState, useEffect } from 'react';
import { QrCode, Download, Share2, Users, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AttendanceFilters from '../Components/AttendanceFilters';
import { timetableService } from '../../Timetable/Services/timetable.service';
import { TeacherAttendanceManagement } from '../Services/attendance.service';
import { api } from '../../../../../_services/api';
import SweetAlert from 'react-bootstrap-sweetalert';

const QRAttendanceDashboard = () => {
    // Teacher and allocations
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loadingAllocations, setLoadingAllocations] = useState(false);

    // Filters - matching AttendanceFilters component structure
    const [filters, setFilters] = useState({
        program: '',
        batch: '',
        academicYear: '',
        semester: '',
        division: '',
        paper: ''
    });

    const [apiIds, setApiIds] = useState({
        academicYearId: null,
        semesterId: null,
        divisionId: null,
        collegeId: null
    });

    // Session data
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Students data
    const [students, setStudents] = useState([]);
    const [studentCount, setStudentCount] = useState(0);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // QR Session
    const [qrSession, setQrSession] = useState(null);
    const [sessionActive, setSessionActive] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    // Alerts
    const [successAlert, setSuccessAlert] = useState(null);
    const [errorAlert, setErrorAlert] = useState(null);

    // Company Logo - Using SVG text "LQ" for clean display
    const [companyLogo] = useState(() => {
        // Create SVG with "LQ" text
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" rx="10"/>
                <rect width="100" height="100" fill="#1e40af" rx="10"/>
                <text x="50" y="65" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="white" text-anchor="middle">LQ</text>
            </svg>
        `;
        // Convert SVG to data URL
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    });

    // Fetch teacher ID and college ID
    useEffect(() => {
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                const teacherId = parseInt(profile.teacher_id);
                const collegeId = parseInt(profile.college_id);

                if (!isNaN(teacherId)) {
                    setCurrentTeacherId(teacherId);
                }

                if (!isNaN(collegeId)) {
                    setApiIds(prev => ({
                        ...prev,
                        collegeId: collegeId
                    }));
                }
            } catch (error) {
                console.error("Error parsing user profile:", error);
            }
        }
    }, []);

    // Fetch allocations
    useEffect(() => {
        const fetchAllocations = async () => {
            if (!currentTeacherId) return;

            setLoadingAllocations(true);
            try {
                const response = await api.getTeacherAllocatedPrograms(currentTeacherId);

                if (response.success) {
                    const data = response.data;
                    const allAllocations = [
                        ...(data.class_teacher_allocation || []),
                        ...(data.normal_allocation || [])
                    ];
                    setAllocations(allAllocations);
                    console.log("QR Attendance - Allocations loaded:", allAllocations);
                } else {
                    setAllocations([]);
                }
            } catch (error) {
                console.error("Error fetching allocations:", error);
                setAllocations([]);
            } finally {
                setLoadingAllocations(false);
            }
        };

        if (currentTeacherId) {
            fetchAllocations();
        }
    }, [currentTeacherId]);

    // Auto-select first available filter values
    useEffect(() => {
        if (allocations.length > 0 && !filters.paper) {
            const firstAlloc = allocations[0];
            const newFilters = {
                program: firstAlloc.program?.program_id?.toString() || '',
                batch: firstAlloc.batch?.batch_id?.toString() || '',
                academicYear: firstAlloc.academic_year_id?.toString() || '',
                semester: firstAlloc.semester_id?.toString() || '',
                division: firstAlloc.division_id?.toString() || '',
                paper: firstAlloc.subjects?.[0]?.subject_id?.toString() || ''
            };
            setFilters(newFilters);
        }
    }, [allocations]);

    // Extract IDs from filters
    useEffect(() => {
        setApiIds(prev => ({
            ...prev,
            academicYearId: filters.academicYear ? parseInt(filters.academicYear) : null,
            semesterId: filters.semester ? parseInt(filters.semester) : null,
            divisionId: filters.division ? parseInt(filters.division) : null
        }));
    }, [filters.academicYear, filters.semester, filters.division]);

    // Fetch time slots from timetable-classes API
    useEffect(() => {
        const fetchTimeSlots = async () => {
            if (!filters.paper || !filters.academicYear || !filters.semester || !filters.division || !currentTeacherId || !apiIds.collegeId) {
                setTimeSlots([]);
                setSelectedSlot(null);
                return;
            }

            setLoadingSlots(true);
            try {
                const params = {
                    teacherId: currentTeacherId,
                    subjectId: filters.paper,
                    date: selectedDate,
                    academicYearId: filters.academicYear,
                    semesterId: filters.semester,
                    divisionId: filters.division,
                    collegeId: apiIds.collegeId
                };

                const response = await TeacherAttendanceManagement.getTimeSlots(params);

                if (response.success && response.data && response.data.length > 0) {
                    // Filter out holidays - only show non-holiday time slots
                    const validTimeSlots = response.data.filter(slot => !slot.is_holiday);

                    if (validTimeSlots.length > 0) {
                        const formattedSlots = validTimeSlots.map(slot => ({
                            id: slot.timetable_id || slot.time_slot_id,
                            time_slot_id: slot.time_slot_id,
                            timetable_id: slot.timetable_id,
                            timetable_allocation_id: slot.timetable_allocation_id,
                            start_time: slot.start_time,  // For AttendanceFilters component
                            end_time: slot.end_time,      // For AttendanceFilters component
                            start: slot.start_time,       // For internal use
                            end: slot.end_time,           // For internal use
                            name: `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`,
                            description: slot.description,
                            slot_name: slot.slot_name
                        }));

                        setTimeSlots(formattedSlots);

                        // Auto-select first time slot
                        const firstSlot = formattedSlots[0];
                        setSelectedSlot(firstSlot);

                        // Update filters.timeSlot for AttendanceFilters component
                        const firstSlotId = firstSlot.timetable_id?.toString() || firstSlot.time_slot_id?.toString();
                        setFilters(prev => ({ ...prev, timeSlot: firstSlotId }));

                        console.log("QR Attendance - Time slots loaded:", formattedSlots);
                        console.log("QR Attendance - Auto-selected first slot:", firstSlot);
                    } else {
                        // All slots are holidays, clear everything
                        setTimeSlots([]);
                        setSelectedSlot(null);
                        setFilters(prev => ({ ...prev, timeSlot: '' }));
                    }
                } else {
                    // No time slots available
                    setTimeSlots([]);
                    setSelectedSlot(null);
                    setFilters(prev => ({ ...prev, timeSlot: '' }));
                }
            } catch (error) {
                console.error('Error loading time slots:', error);
                setTimeSlots([]);
                setSelectedSlot(null);
                setFilters(prev => ({ ...prev, timeSlot: '' }));
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchTimeSlots();
    }, [filters.paper, filters.academicYear, filters.semester, filters.division, currentTeacherId, selectedDate, apiIds.collegeId]);

    // Fetch students when paper is selected
    useEffect(() => {
        const fetchStudents = async () => {
            if (!filters.academicYear || !filters.semester || !filters.division || !filters.paper) {
                setStudents([]);
                setStudentCount(0);
                return;
            }

            setLoadingStudents(true);
            try {
                const params = {
                    academicYearId: filters.academicYear,
                    semesterId: filters.semester,
                    divisionId: filters.division,
                    subjectId: filters.paper
                };

                const response = await TeacherAttendanceManagement.getAttendanceStudents(params);

                if (response.success && response.data && response.data.length > 0) {
                    setStudents(response.data);
                    setStudentCount(response.data.length);
                    console.log(`QR Attendance - ${response.data.length} students loaded`);
                } else {
                    setStudents([]);
                    setStudentCount(0);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                setStudents([]);
                setStudentCount(0);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [filters.academicYear, filters.semester, filters.division, filters.paper]);

    // Generate QR Session
    const generateQRSession = () => {
        if (!filters.division || !selectedSlot || !filters.paper) {
            setErrorAlert("Please select all filters and time slot");
            return;
        }

        const sessionId = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Find subject name from allocations
        let subjectName = '';
        for (const alloc of allocations) {
            if (alloc.subjects && Array.isArray(alloc.subjects)) {
                const subject = alloc.subjects.find(s => s.subject_id == filters.paper);
                if (subject) {
                    subjectName = subject.name;
                    break;
                }
            }
        }

        // Complete attendance data structure for QR
        const sessionData = {
            sessionId,
            // IDs for attendance marking
            academic_year_id: parseInt(filters.academicYear),
            semester_id: parseInt(filters.semester),
            division_id: parseInt(filters.division),
            subject_id: parseInt(filters.paper),
            subject_name: subjectName,
            timetable_id: selectedSlot.timetable_id,
            timetable_allocation_id: selectedSlot.timetable_allocation_id || null,
            time_slot_id: selectedSlot.time_slot_id,
            date: selectedDate,
            // Display info
            slotTime: selectedSlot.name,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };

        // Create URL with encoded session data
        const baseUrl = window.location.origin;
        const encodedData = btoa(JSON.stringify(sessionData)); // Base64 encode
        const qrUrl = `${baseUrl}/student/timetable/mark-attendance?s=${encodedData}`;

        // Create short session code for manual entry
        const shortCode = sessionId.split('_')[1].substring(0, 6).toUpperCase();

        setQrSession({
            ...sessionData,
            qrUrl, // Full URL for QR code
            shortCode, // 6-digit code for manual entry
            shareableLink: qrUrl // Same as QR URL
        });
        setSessionActive(true);
        setAttendanceRecords([]);
        setSuccessAlert("QR Code generated successfully! Share with students.");
    };


    // Stop session
    const stopSession = () => {
        setSessionActive(false);
        setSuccessAlert(`Session ended. Total attendance marked: ${attendanceRecords.length}`);
    };

    // Download QR Code
    const downloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `attendance-qr-${selectedDate}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    // Simulate student scanning
    const simulateStudentScan = () => {
        const mockStudent = {
            id: Math.floor(Math.random() * 1000),
            name: `Student ${Math.floor(Math.random() * 100)}`,
            rollNo: `20${Math.floor(Math.random() * 100)}`,
            scannedAt: new Date().toISOString()
        };

        setAttendanceRecords(prev => [...prev, mockStudent]);
    };

    // Calculate statistics
    const stats = {
        total: attendanceRecords.length,
        present: attendanceRecords.length,
        timeRemaining: qrSession ? Math.max(0, Math.floor((new Date(qrSession.expiresAt) - new Date()) / 1000 / 60)) : 0
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-primary-600" />
                    QR Code Attendance
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                    Generate QR codes for quick attendance marking
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <AttendanceFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    allocations={allocations}
                    loadingAllocations={loadingAllocations}
                    timeSlots={timeSlots}
                    loadingTimeSlots={loadingSlots}
                    showFilters={true}
                    compact={false}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                </div>

                {/* Generate Button */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={generateQRSession}
                        disabled={sessionActive || !filters.division || !selectedSlot || !filters.paper}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <QrCode size={20} />
                        Generate QR Code
                    </button>

                    {sessionActive && (
                        <button
                            onClick={stopSession}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-red-700 transition-all shadow-sm"
                        >
                            <XCircle size={20} />
                            End Session
                        </button>
                    )}
                </div>
            </div>

            {/* QR Code Display */}
            {qrSession && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* QR Code Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">QR Code</h2>
                            {sessionActive && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Active
                                </span>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center p-8 bg-gray-50 rounded-xl mb-4">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={qrSession.qrUrl}
                                size={400}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: companyLogo, // Company logo from state (backend in future)
                                    x: undefined,
                                    y: undefined,
                                    height: 80,
                                    width: 80,
                                    excavate: true, // Creates white background behind logo
                                }}
                            />
                        </div>

                        {/* Session Info */}
                        <div className="space-y-3 mb-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-600 font-semibold mb-1">📱 FOR PHONE USERS</p>
                                <p className="text-sm text-blue-800">Scan the QR code above with phone camera</p>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-xs text-purple-600 font-semibold mb-1">💻 FOR LAPTOP USERS</p>
                                <p className="text-sm text-purple-800 mb-2">Enter this code manually:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-3 py-2 rounded border border-purple-300 text-lg font-bold text-purple-900 text-center">
                                        {qrSession.shortCode}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(qrSession.shortCode);
                                            setSuccessAlert("Code copied!");
                                        }}
                                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all"
                                        title="Copy code"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs text-green-600 font-semibold mb-1">🔗 SHAREABLE LINK</p>
                                <p className="text-sm text-green-800 mb-2">Copy and share this link:</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={qrSession.shareableLink}
                                        readOnly
                                        className="flex-1 bg-white px-3 py-2 rounded border border-green-300 text-xs text-green-900"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(qrSession.shareableLink);
                                            setSuccessAlert("Link copied! Share with students.");
                                        }}
                                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                                        title="Copy link"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t">
                                <div>
                                    <span className="font-semibold">Division:</span> {qrSession.divisionName}
                                </div>
                                <div>
                                    <span className="font-semibold">Date:</span> {qrSession.date}
                                </div>
                                <div>
                                    <span className="font-semibold">Slot:</span> {qrSession.slotTime}
                                </div>
                                <div>
                                    <span className="font-semibold text-orange-600">Expires:</span>
                                    <span className="text-orange-600"> {stats.timeRemaining} min</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={downloadQR}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                            >
                                <Download size={18} />
                                Download QR
                            </button>
                            <button
                                onClick={() => {
                                    const whatsappText = `Mark your attendance:\n\n📱 Scan QR or\n💻 Use code: ${qrSession.shortCode}\n🔗 Or click: ${qrSession.shareableLink}`;
                                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                            >
                                <Share2 size={18} />
                                Share on WhatsApp
                            </button>
                        </div>

                        {/* Demo Button */}
                        <button
                            onClick={simulateStudentScan}
                            disabled={!sessionActive}
                            className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🎭 Simulate Student Scan (Demo)
                        </button>
                    </div>

                    {/* Statistics Card */}
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Total Scans</p>
                                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                                    </div>
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-green-600 uppercase">Present</p>
                                        <p className="text-3xl font-bold text-green-700">{stats.present}</p>
                                    </div>
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Live Attendance List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800">Live Attendance</h3>
                                {sessionActive && (
                                    <RefreshCw className="w-4 h-4 text-green-500 animate-spin" />
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {attendanceRecords.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Waiting for students to scan...</p>
                                    </div>
                                ) : (
                                    attendanceRecords.map((record, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800">{record.name}</p>
                                                <p className="text-xs text-gray-500">Roll: {record.rollNo}</p>
                                            </div>
                                            <div className="text-right">
                                                <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                                                <p className="text-xs text-gray-500">
                                                    {new Date(record.scannedAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!qrSession && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        How it works
                    </h3>
                    <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                            <span className="font-bold">1.</span>
                            <span>Select division, date, and time slot</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <span>Click "Generate QR Code" to create a unique attendance session</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">3.</span>
                            <span>Share the QR code with students (download or display on screen)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">4.</span>
                            <span>Students scan the QR code using their phones</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">5.</span>
                            <span>Attendance is automatically marked and displayed in real-time</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">6.</span>
                            <span>QR code expires after 30 minutes for security</span>
                        </li>
                    </ol>
                </div>
            )}

            {/* Success Alert */}
            {successAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setSuccessAlert(null)}
                >
                    {successAlert}
                </SweetAlert>
            )}

            {/* Error Alert */}
            {errorAlert && (
                <SweetAlert
                    error
                    title="Error!"
                    onConfirm={() => setErrorAlert(null)}
                >
                    {errorAlert}
                </SweetAlert>
            )}
        </div>
    );
};

export default QRAttendanceDashboard;
