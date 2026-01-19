import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { QrCode, Download, Share2, Users, Clock, CheckCircle, XCircle, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import AttendanceFilters from '../Components/AttendanceFilters';
//import { timetableService } from '../../Timetable/Services/timetable.service';
import { TeacherAttendanceManagement } from '../Services/attendance.service';
import { api } from '../../../../../_services/api';
import SweetAlert from 'react-bootstrap-sweetalert';

const QRAttendanceDashboard = () => {
    const location = useLocation();
    const slotData = location.state?.slot;

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
        paper: '',
        timeSlot: ''
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
    const qrCanvasRef = useRef(null);
    const hiddenQRRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [tempQRUrl, setTempQRUrl] = useState('');
    const [qrDuration, setQrDuration] = useState(5); // Default 5 minutes
    const [existingQRSession, setExistingQRSession] = useState(null);
    const [loadingExistingQR, setLoadingExistingQR] = useState(false);

    // REST API polling states (replaced WebSocket)
    const [liveCount, setLiveCount] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);
    // Auto-select from slot data
    const [autoSelectCompleted, setAutoSelectCompleted] = useState(false);

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

    // Formatters
    const formatDateTime = (dateStr, timeStr) => {
        try {
            if (!dateStr || !timeStr) return "N/A";
            const dateTimeStr = `${dateStr}T${timeStr}`;
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) {
                return `${dateStr} ${timeStr}`;
            }
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return `${dateStr} ${timeStr}`;
        }
    };

    const formatDateOnly = (dateStr) => {
        try {
            if (!dateStr) return "N/A";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Fetch teacher ID and college ID
    useEffect(() => {
        try {
            // 1. Try to get from userProfile (as originally implemented)
            const userProfile = localStorage.getItem("userProfile");
            console.log("DEBUG: userProfile:", userProfile);
            if (userProfile) {
                const profile = JSON.parse(userProfile);
                if (profile.teacher_id) setCurrentTeacherId(parseInt(profile.teacher_id));
                if (profile.college_id) setApiIds(prev => ({ ...prev, collegeId: parseInt(profile.college_id) }));
            }

            // 2. Fallback to currentUser (matching TimetableView.jsx logic)
            const currentUserStr = localStorage.getItem('currentUser');
            console.log("DEBUG: currentUser:", currentUserStr);
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                const teacherIdFromJti = currentUser.jti;
                if (teacherIdFromJti && !currentTeacherId) {
                    setCurrentTeacherId(teacherIdFromJti);
                    console.log("DEBUG: Setting teacherId from jti:", teacherIdFromJti);
                }
            }

            // 3. Fallback to activeCollege (matching TimetableView.jsx logic)
            const activeCollegeStr = localStorage.getItem('activeCollege');
            console.log("DEBUG: activeCollege:", activeCollegeStr);
            if (activeCollegeStr) {
                const activeCollege = JSON.parse(activeCollegeStr);
                if (activeCollege.id && !apiIds.collegeId) {
                    setApiIds(prev => ({
                        ...prev,
                        collegeId: activeCollege.id
                    }));
                    console.log("DEBUG: Setting collegeId from activeCollege:", activeCollege.id);
                }
            }

            // 4. Also check slotData as fallback
            if (slotData?.teacher_id && !currentTeacherId) {
                setCurrentTeacherId(slotData.teacher_id);
            }

        } catch (error) {
            console.error("Error setting IDs from local storage:", error);
        }
    }, [slotData]);

    // Initialize from slot data
    useEffect(() => {
        if (slotData) {
            console.log("Received slot data for QR:", slotData);

            // Set filters from slot data
            setFilters(prev => ({
                ...prev,
                program: slotData.program_id?.toString() || '',
                batch: slotData.batch_id?.toString() || '',
                academicYear: slotData.academic_year_id?.toString() || '',
                semester: slotData.semester_id?.toString() || '',
                division: slotData.division_id?.toString() || '',
                paper: slotData.subject_id?.toString() || ''
            }));

            // Set date from slot data
            if (slotData.date) {
                setSelectedDate(slotData.date);
            }

            // Set teacher ID from slot data
            if (slotData.teacher_id) {
                setCurrentTeacherId(slotData.teacher_id);
            }

            // Mark auto-select as completed
            setAutoSelectCompleted(true);

            setSuccessAlert("Timetable data loaded successfully! Filters are auto-selected.");
        } else {
            // If no slot data, we are ready for manual selection
            setAutoSelectCompleted(true);
        }
    }, [slotData]);

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
    const fetchTimeSlots = async () => {
        // Essential fields required for the API
        const { paper, academicYear, semester, division } = filters;
        if (!paper || !academicYear || !semester || !division || !currentTeacherId || !apiIds.collegeId) {
            console.log("DEBUG: fetchTimeSlots skipping - missing fields:", {
                paper, academicYear, semester, division, teacherId: currentTeacherId, collegeId: apiIds.collegeId
            });
            setTimeSlots([]);
            setSelectedSlot(null);
            return;
        }

        setLoadingSlots(true);
        try {
            const params = {
                teacherId: currentTeacherId,
                subjectId: paper,
                date: selectedDate,
                academicYearId: academicYear,
                semesterId: semester,
                divisionId: division,
                collegeId: apiIds.collegeId
            };

            const response = await TeacherAttendanceManagement.getTimeSlots(params);
            console.log("DEBUG: getTimeSlots response:", response);

            if (response.success && response.data && Array.isArray(response.data)) {
                console.log(`DEBUG: Processing ${response.data.length} slots from API`);

                const formattedSlots = response.data.map(slot => ({
                    id: slot.time_slot_id?.toString(),
                    time_slot_id: slot.time_slot_id,
                    timetable_id: slot.timetable_id,
                    timetable_allocation_id: slot.timetable_allocation_id,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    name: `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}${slot.is_holiday ? ' (Holiday)' : ''}`,
                    description: slot.description,
                    slot_name: slot.slot_name,
                    is_holiday: slot.is_holiday,
                    holiday_name: slot.holiday_name
                }));

                setTimeSlots(formattedSlots);

                // HANDLE SELECTION
                if (formattedSlots.length > 0) {
                    let slotToSelect = null;

                    // 1. If we have slotData from navigation, prioritize matching it
                    if (slotData?.time_slot_id) {
                        slotToSelect = formattedSlots.find(s =>
                            s.time_slot_id == slotData.time_slot_id ||
                            s.timetable_id == slotData.time_slot_id
                        );
                    }

                    // 2. If no matching slotData or not available, use current filter or first slot
                    if (!slotToSelect && filters.timeSlot) {
                        slotToSelect = formattedSlots.find(s => s.id === filters.timeSlot);
                    }

                    // 3. Fallback to first slot
                    if (!slotToSelect) {
                        slotToSelect = formattedSlots[0];
                    }

                    if (slotToSelect) {
                        setSelectedSlot(slotToSelect);
                        setFilters(prev => ({
                            ...prev,
                            timeSlot: slotToSelect.id
                        }));
                        console.log("DEBUG: Selected slot set to:", slotToSelect.id);
                    }
                } else {
                    setSelectedSlot(null);
                    setFilters(prev => ({ ...prev, timeSlot: '' }));
                }
            } else {
                setTimeSlots([]);
                setSelectedSlot(null);
                setFilters(prev => ({ ...prev, timeSlot: '' }));
            }
        } catch (error) {
            console.error('Error loading time slots:', error);
            setTimeSlots([]);
            setSelectedSlot(null);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (filters.paper && currentTeacherId && apiIds.collegeId) {
            fetchTimeSlots();
        }
    }, [filters.paper, filters.academicYear, filters.semester, filters.division, selectedDate, currentTeacherId, apiIds.collegeId]);

    // Sync selectedSlot when filters.timeSlot changes
    useEffect(() => {
        if (filters.timeSlot && timeSlots.length > 0) {
            const matchedSlot = timeSlots.find(slot =>
                (slot.timetable_id?.toString() === filters.timeSlot) ||
                (slot.time_slot_id?.toString() === filters.timeSlot)
            );
            if (matchedSlot && matchedSlot !== selectedSlot) {
                setSelectedSlot(matchedSlot);
                console.log("Sync - Selected slot updated from filters:", matchedSlot);
            }
        }
    }, [filters.timeSlot, timeSlots]);

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

                if (response.success && response.data && response.data?.students?.length > 0) {
                    setStudents(response.data?.students);
                    setStudentCount(response.data?.students?.length);
                    console.log(`QR Attendance - ${response.data?.students?.length} students loaded`);
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

        if (filters.paper) {
            fetchStudents();
        }
    }, [filters.academicYear, filters.semester, filters.division, filters.paper]);

    // Check for existing QR session when filters are complete
    useEffect(() => {
        const checkExistingQR = async () => {
            if (filters.academicYear && filters.semester && filters.division && filters.paper && selectedSlot && selectedDate) {
                setLoadingExistingQR(true);
                try {
                    const params = {
                        academicYearId: filters.academicYear,
                        semesterId: filters.semester,
                        divisionId: filters.division,
                        paperId: filters.paper,
                        timeSlotId: selectedSlot.time_slot_id,
                        date: selectedDate
                    };

                    console.log("Checking for existing QR session:", params);
                    const response = await TeacherAttendanceManagement.getQRCodeSession(params);

                    console.log("QR Session API Response:", response);

                    // Check if response has actual data with required fields
                    const hasValidData = response?.data[0]?.id;
                    console.log("hasValidData", hasValidData);
                    if (hasValidData) {
                        const sessionDataObj = response.data[0];
                        console.log("Existing QR session found:", sessionDataObj);

                        // Check if QR is still valid (not expired)
                        const endTime = new Date(`${sessionDataObj.date} ${sessionDataObj.end_time}`);
                        const now = new Date();

                        if (now < endTime) {
                            // QR is still valid, use it
                            console.log("Existing QR is still valid");
                        } else {
                            // QR expired but still show it
                            console.log("Existing QR has expired but showing anyway");
                        }
                        setExistingQRSession(sessionDataObj);
                    } else {
                        setExistingQRSession(null);
                        console.log("No existing QR session found or empty/invalid data");
                    }
                } catch (error) {
                    console.error("Error checking existing QR:", error);
                    setExistingQRSession(null);
                } finally {
                    setLoadingExistingQR(false);
                }
            } else {
                setExistingQRSession(null);
            }
        };

        if (selectedSlot) {
            checkExistingQR();
        }
    }, [filters.academicYear, filters.semester, filters.division, filters.paper, selectedSlot, selectedDate]);

    // REST API polling for live attendance updates
    useEffect(() => {
        if (sessionActive && qrSession) {
            console.log('� Starting 15s REST API polling for live attendance...');

            // Function to fetch grouped attendance
            const fetchLiveAttendance = async () => {
                if (isRefreshing) return;
                setIsRefreshing(true);
                try {
                    const params = {
                        academicYearId: qrSession.academic_year_id,
                        semesterId: qrSession.semester_id,
                        divisionId: qrSession.division_id,
                        timeSlotId: qrSession.time_slot_id,
                        date: qrSession.date,
                        subjectId: qrSession.subject_id
                    };

                    console.log('📡 Polling grouped attendance:', params);

                    const response = await TeacherAttendanceManagement.getGroupedAttendance(params);

                    if (response.success && response.data) {
                        // Flatten students from all groups
                        const allStudents = response.data.flatMap(group =>
                            (group.students || []).map(student => ({
                                studentId: student.student_id,
                                name: `${student.firstname || ''} ${student.lastname || ''}`.trim(),
                                rollNo: student.roll_number,
                                scannedAt: new Date().toISOString() // Fallback
                            }))
                        );

                        // Filter unique students by ID
                        const uniqueStudentsMap = new Map();
                        allStudents.forEach(s => {
                            if (!uniqueStudentsMap.has(s.studentId)) {
                                uniqueStudentsMap.set(s.studentId, s);
                            }
                        });
                        const uniqueStudents = Array.from(uniqueStudentsMap.values());

                        console.log(`📊 Polled data: ${uniqueStudents.length} students found`);
                        setAttendanceRecords(uniqueStudents);
                        setLiveCount(uniqueStudents.length);
                        setLastRefreshTime(new Date());
                    }
                } catch (error) {
                    console.error('❌ Error polling attendance:', error);
                } finally {
                    setIsRefreshing(false);
                }
            };

            // Initial fetch
            fetchLiveAttendance();

            // Set up polling interval (15 seconds)
            const pollingInterval = setInterval(() => {
                console.log('🔄 Auto-refreshing attendance...');
                fetchLiveAttendance();
            }, 15000);

            // Cleanup on unmount or session end
            return () => {
                console.log('🛑 Stopping attendance polling');
                clearInterval(pollingInterval);
                setLiveCount(0);
                setLastRefreshTime(null);
            };
        }
    }, [sessionActive, qrSession]);

    // Manual refresh function
    const refreshAttendanceCount = async () => {
        if (!sessionActive || !qrSession) {
            setErrorAlert('No active session to refresh');
            return;
        }

        try {
            setIsRefreshing(true);

            const params = {
                academicYearId: qrSession.academic_year_id,
                semesterId: qrSession.semester_id,
                divisionId: qrSession.division_id,
                timeSlotId: qrSession.time_slot_id,
                date: qrSession.date,
                subjectId: qrSession.subject_id
            };

            console.log('🔄 Manual refresh - Fetching attendance:', params);

            const response = await TeacherAttendanceManagement.getGroupedAttendance(params);

            if (response.success && response.data) {
                // Flatten and deduplicate students
                const allStudents = response.data.flatMap(group =>
                    (group.students || []).map(student => ({
                        studentId: student.student_id,
                        name: `${student.firstname || ''} ${student.lastname || ''}`.trim(),
                        rollNo: student.roll_number,
                        scannedAt: new Date().toISOString()
                    }))
                );

                const uniqueStudentsMap = new Map();
                allStudents.forEach(s => {
                    if (!uniqueStudentsMap.has(s.studentId)) {
                        uniqueStudentsMap.set(s.studentId, s);
                    }
                });
                const uniqueStudents = Array.from(uniqueStudentsMap.values());

                setAttendanceRecords(uniqueStudents);
                setLiveCount(uniqueStudents.length);
                setLastRefreshTime(new Date());

                setSuccessAlert(`Refreshed! ${uniqueStudents.length} students found`);
            } else {
                setErrorAlert(response.message || 'Failed to refresh attendance');
            }
        } catch (error) {
            console.error('❌ Error refreshing attendance:', error);
            setErrorAlert('Failed to refresh attendance');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Generate QR Session
    const generateQRSession = async () => {
        if (!filters.division || !selectedSlot || !filters.paper) {
            setErrorAlert("Please select all filters and time slot");
            return;
        }

        // If existing QR session is available, use it
        if (existingQRSession) {
            console.log("Using existing QR session:", existingQRSession);

            // Find subject name from allocations or slotData
            let subjectName = '';
            if (slotData?.subject_name) {
                subjectName = slotData.subject_name;
            } else {
                for (const alloc of allocations) {
                    if (alloc.subjects && Array.isArray(alloc.subjects)) {
                        const subject = alloc.subjects.find(s => s.subject_id == filters.paper);
                        if (subject) {
                            subjectName = subject.name;
                            break;
                        }
                    }
                }
            }

            // Reconstruct session data from existing QR
            const sessionData = {
                sessionId: `EXISTING_${existingQRSession.id}`,
                academic_year_id: existingQRSession.academic_year_id,
                semester_id: existingQRSession.semester_id,
                division_id: existingQRSession.division_id,
                subject_id: existingQRSession.paper_id,
                subject_name: subjectName,
                timetable_id: selectedSlot.timetable_id,
                timetable_allocation_id: selectedSlot.timetable_allocation_id || null,
                time_slot_id: existingQRSession.time_slot_id,
                date: existingQRSession.date,
                slotTime: selectedSlot.name,
                timestamp: existingQRSession.start_time,
                expiresAt: new Date(`${existingQRSession.date} ${existingQRSession.end_time}`).toISOString(),
                divisionName: slotData?.division_name || `Division ${existingQRSession.division_id}`
            };

            setQrSession({
                ...sessionData,
                qrUrl: existingQRSession.shareable_link,
                shortCode: existingQRSession.laptop_code,
                shareableLink: existingQRSession.shareable_link
            });
            setSessionActive(true);
            setAttendanceRecords([]);
            setSuccessAlert("Existing QR Code loaded successfully!");
            return;
        }

        // Validate duration
        const validDuration = qrDuration && qrDuration > 0 ? qrDuration : 5;

        setIsGenerating(true);
        try {
            const sessionId = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Find subject name from allocations or slotData
            let subjectName = '';
            if (slotData?.subject_name) {
                subjectName = slotData.subject_name;
            } else {
                for (const alloc of allocations) {
                    if (alloc.subjects && Array.isArray(alloc.subjects)) {
                        const subject = alloc.subjects.find(s => s.subject_id == filters.paper);
                        if (subject) {
                            subjectName = subject.name;
                            break;
                        }
                    }
                }
            }

            const now = new Date();
            const expires = new Date(now.getTime() + validDuration * 60 * 1000);

            // Complete attendance data structure for QR
            const sessionData = {
                sessionId,
                academic_year_id: parseInt(filters.academicYear),
                semester_id: parseInt(filters.semester),
                division_id: parseInt(filters.division),
                subject_id: parseInt(filters.paper),
                subject_name: subjectName,
                timetable_id: selectedSlot.timetable_id,
                timetable_allocation_id: selectedSlot.timetable_allocation_id || null,
                time_slot_id: selectedSlot.time_slot_id,
                date: selectedDate,
                slotTime: selectedSlot.name,
                timestamp: now.toISOString(),
                expiresAt: expires.toISOString(),
                divisionName: slotData?.division_name || `Division ${filters.division}`
            };

            const baseUrl = window.location.origin;
            const encodedData = btoa(JSON.stringify(sessionData));
            const qrUrl = `${baseUrl}/student/timetable/mark-attendance?s=${encodedData}`;
            const shortCode = sessionId.split('_')[1].substring(0, 6).toUpperCase();

            // 1. Set Temp URL to render hidden QR
            setTempQRUrl(qrUrl);

            // 2. Wait for render (short delay to ensure canvas updates)
            await new Promise(resolve => setTimeout(resolve, 300));

            // 3. Get Canvas and convert to blob
            const canvas = document.querySelector('div[style*="fixed"] canvas');
            if (!canvas) throw new Error("QR Generation failed: Canvas not found");

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `qr_attendance_${sessionId}.png`, { type: 'image/png' });

            // 4. Upload to S3
            console.log("Uploading QR to S3...");
            const s3Response = await TeacherAttendanceManagement.uploadFileToS3(file);
            console.log("S3 Upload Response:", s3Response);

            const qrLink = typeof s3Response === 'string' ? s3Response : (s3Response.path || s3Response.url || s3Response.data?.path || s3Response.data?.url || "");

            // 5. Save to QR Codes table
            const qrPayload = {
                academic_year_id: parseInt(filters.academicYear),
                semester_id: parseInt(filters.semester),
                division_id: parseInt(filters.division),
                paper_id: parseInt(filters.paper),
                time_slot_id: selectedSlot.time_slot_id,
                date: selectedDate,
                start_time: now.toLocaleTimeString('en-GB', { hour12: false }), // HH:mm:ss
                end_time: expires.toLocaleTimeString('en-GB', { hour12: false }), // HH:mm:ss
                qr_code_link: qrLink,
                laptop_code: shortCode,
                shareable_link: qrUrl
            };

            console.log("Saving QR Session to DB:", qrPayload);
            const saveResponse = await TeacherAttendanceManagement.saveQRCodeSession(qrPayload);

            if (saveResponse.success) {
                setQrSession({
                    ...sessionData,
                    qrUrl,
                    shortCode,
                    shareableLink: qrUrl
                });
                setSessionActive(true);
                setAttendanceRecords([]);
                setSuccessAlert("QR Code generated and saved successfully!");
            } else {
                throw new Error(saveResponse.message || "Failed to save session to database");
            }

        } catch (err) {
            console.error("QR Generation Error:", err);
            setErrorAlert("Error generating QR: " + (err.message || String(err)));
        } finally {
            setIsGenerating(false);
        }
    };

    // Stop session
    const stopSession = () => {
        setSessionActive(false);
        setSuccessAlert(`Session ended. Total attendance marked: ${attendanceRecords.length}`);
    };

    // Download QR Code
    const downloadQR = () => {
        const canvas = document.getElementById('qr-code-canvas');
        if (!canvas) return;

        const pngFile = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.download = `attendance-qr-${selectedDate}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
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

                {/* Slot Info Display */}
                {/* {slotData && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-800">
                                    📋 Timetable Slot Information
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-blue-700">
                                    <div>
                                        <span className="font-medium">Subject:</span> {slotData.subject_name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Date:</span> {slotData.date}
                                    </div>
                                    <div>
                                        <span className="font-medium">Time:</span> {slotData.start_time?.slice(0, 5)} - {slotData.end_time?.slice(0, 5)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Division:</span> {slotData.division_name}
                                    </div>
                                </div>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                            All filters have been auto-selected from the timetable slot.
                        </p>
                    </div>
                )} */}
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
                    slotData={slotData} // Pass slot data to filters
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
                            onChange={(e) => {
                                const newDate = e.target.value;
                                setSelectedDate(newDate);
                                // Reset slots and session when date changes
                                setTimeSlots([]);
                                setSelectedSlot(null);
                                setFilters(prev => ({ ...prev, timeSlot: '' }));
                                setQrSession(null);
                                setSessionActive(false);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {/* QR Duration Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            QR Code Validity (Minutes)
                        </label>
                        <input
                            type="number"
                            value={qrDuration}
                            onChange={(e) => {
                                const val = e.target.value;
                                setQrDuration(val === '' ? '' : parseInt(val));
                            }}
                            disabled={sessionActive}
                            placeholder="Enter minutes (e.g., 5)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter QR validity duration in minutes</p>
                    </div>
                </div>

                {/* Selected Time Slot Info */}
                {/* {selectedSlot && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">
                                Selected Time Slot: {selectedSlot.name}
                            </span>
                        </div>
                        {slotData && (
                            <p className="text-xs text-green-600 mt-1">
                                Auto-selected from timetable slot
                            </p>
                        )}
                    </div>
                )} */}

                {/* Existing QR Notification */}
                {!loadingExistingQR && existingQRSession && !sessionActive && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                    Existing QR Code Found
                                </h3>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <p>
                                        <span className="font-medium">Created:</span>{' '}
                                        {formatDateTime(existingQRSession.date, existingQRSession.start_time)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Valid Until:</span>{' '}
                                        {formatDateTime(existingQRSession.date, existingQRSession.end_time)}
                                    </p>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    You can use the existing QR code or generate a new one.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Buttons */}
                <div className="mt-6 flex flex-wrap gap-3 items-center">
                    {loadingExistingQR && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Loader size={16} className="animate-spin" />
                            Checking for existing QR...
                        </div>
                    )}

                    {!loadingExistingQR && existingQRSession && !sessionActive && (
                        <button
                            onClick={generateQRSession}
                            disabled={loadingExistingQR}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <CheckCircle size={20} />
                            Use Existing QR
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            // Clear existing session to force new generation
                            setExistingQRSession(null);
                            await generateQRSession();
                        }}
                        disabled={isGenerating || sessionActive || !filters.division || !selectedSlot || !filters.paper || loadingExistingQR}
                        className={`px-6 py-3 ${existingQRSession ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-600 hover:bg-primary-700'} text-white rounded-lg font-semibold flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm`}
                    >
                        {isGenerating ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <QrCode size={20} />
                        )}
                        {isGenerating ? "Generating & Saving..." : existingQRSession ? "Generate New QR Code" : "Generate QR Code"}
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

            {/* Holiday Info */}
            {selectedSlot?.is_holiday && (
                <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-900">Holiday Detected</h4>
                        <p className="text-xs text-orange-700">
                            Today is marked as <span className="font-semibold underline">{selectedSlot.holiday_name || 'a Holiday'}</span>.
                            Attendance marking might not be required, but you can still proceed if needed.
                        </p>
                    </div>
                </div>
            )}

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
                            <QRCodeCanvas
                                id="qr-code-canvas"
                                ref={qrCanvasRef}
                                value={qrSession.qrUrl}
                                size={400}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: companyLogo,
                                    x: undefined,
                                    y: undefined,
                                    height: 80,
                                    width: 80,
                                    excavate: true,
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
                                    <span className="font-semibold">Date:</span> {formatDateOnly(qrSession.date)}
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
                            {/* Live Count Card with Refresh */}
                            <div className="rounded-xl p-4 shadow-sm border bg-blue-50 border-blue-200">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-blue-600 uppercase font-semibold">Attendance Count</p>
                                            {isRefreshing && (
                                                <Loader size={12} className="animate-spin text-blue-600" />
                                            )}
                                        </div>
                                        <button
                                            onClick={refreshAttendanceCount}
                                            disabled={isRefreshing || !sessionActive}
                                            className="p-1.5 rounded-full hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Refresh attendance count"
                                        >
                                            <RefreshCw size={16} className={`text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-blue-700">{liveCount}</p>
                                            {lastRefreshTime && (
                                                <p className="text-xs text-blue-500 mt-1">
                                                    Updated: {lastRefreshTime.toLocaleTimeString()}
                                                </p>
                                            )}
                                        </div>
                                        <Users className="w-10 h-10 text-blue-400" />
                                    </div>

                                    <div className="text-xs text-blue-600 mt-1">
                                        Auto-refreshes every 2 minutes
                                    </div>
                                </div>
                            </div>

                            {/* <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Total Scans</p>
                                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                                    </div>
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                            </div> */}
                            {/* <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-green-600 uppercase">Present</p>
                                        <p className="text-3xl font-bold text-green-700">{stats.present}</p>
                                    </div>
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                            </div> */}
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
                            <span>QR code expires after set duration for security</span>
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

            {/* Hidden canvas for pre-generating QR for S3 upload */}
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
                <QRCodeCanvas
                    ref={hiddenQRRef}
                    value={tempQRUrl}
                    size={400}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                        src: companyLogo,
                        height: 80,
                        width: 80,
                        excavate: true,
                    }}
                />
            </div>
        </div>
    );
};

export default QRAttendanceDashboard;