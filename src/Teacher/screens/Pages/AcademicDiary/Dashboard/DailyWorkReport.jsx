import React, { useState, useEffect } from 'react';
import { Eye, Plus, Edit, Trash2, Save, X, Download, FileText } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useUserProfile } from "@/contexts/UserProfileContext";
import { teacherProfileService } from '../Services/academicDiary.service';
import { ProfessionalEthicsService } from '../Services/ProfessionalEthics.service';
import { timetableService } from '../../TimeTable/Services/timetable.service';
import SweetAlert from "react-bootstrap-sweetalert";

const DailyWorkReport = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [curricularData, setCurricularData] = useState([]);
    const [otherActivities, setOtherActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLectureModal, setShowLectureModal] = useState(false);
    const [lectureDetails, setLectureDetails] = useState(null);
    const [loadingLecture, setLoadingLecture] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [activityForm, setActivityForm] = useState({ from_time: '', to_time: '', description: '' });
    const [alert, setAlert] = useState(null);

    // Export States
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportForm, setExportForm] = useState({ start_date: '', end_date: '' });
    const [exportLoadingType, setExportLoadingType] = useState(null);

    // Get filters from parent layout (header filter)
    const { filters } = useOutletContext();

    // User Context 
    const { getUserId, getTeacherId, isLoaded } = useUserProfile();

    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const collegeId = userProfile.college_id;
    const teacher_id = filters?.teacher?.teacher_id || getTeacherId();
    const userId = filters?.teacher?.user_id || getUserId();

    // Get day name from date
    const getDayName = (dateStr) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(dateStr).getDay()];
    };

    // Format time from HH:MM:SS to HH:MM
    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5); // "09:00:00" -> "09:00"
    };

    // Fetch lecture details when view is clicked
    const handleViewLecture = async (item) => {
        setLoadingLecture(true);
        setShowLectureModal(true);

        try {

            const exceptionId = item.exception_id;
            const slotId = item.template_slot_id;

            console.log('Fetching lecture details:', { exceptionId, slotId });

            let response;

            if (exceptionId) {
                console.log('Using exception_id:', exceptionId);
                response = await timetableService.getClassUpdates(exceptionId, null);
            } else if (slotId) {
                console.log('Using template_slot_id:', slotId);
                response = await timetableService.getClassUpdates(null, slotId);
            } else {
                throw new Error('No valid ID found');
            }

            console.log('Lecture details response:', response);
            setLectureDetails(response);
        } catch (error) {
            console.error('Error fetching lecture details:', error);
            setLectureDetails(null);
        } finally {
            setLoadingLecture(false);
        }
    };


    // Fetch data when date changes
    const fetchAllData = async () => {
        if (!isLoaded || !teacher_id || !collegeId || !selectedDate) {
            console.log('Missing required params or profile loading:', { isLoaded, teacher_id, collegeId, selectedDate });
            return;
        }

        setLoading(true);
        try {
            const [curricularRes, otherActivitiesRes] = await Promise.all([
                teacherProfileService.getTeacherDailyReport(teacher_id, collegeId, selectedDate),
                teacherProfileService.getOtherActivities(teacher_id, selectedDate)
            ]);

            setCurricularData(Array.isArray(curricularRes) ? curricularRes : []);
            setOtherActivities(Array.isArray(otherActivitiesRes) ? otherActivitiesRes : []);

        } catch (error) {
            console.error('❌ Error fetching data:', error);
            setCurricularData([]);
            setOtherActivities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchAllData();
        }
    }, [teacher_id, selectedDate, isLoaded]);

    // Handle activity CRUD
    const handleSaveActivity = async () => {
        try {
            const payload = {
                ...activityForm,
                teacher_id: teacher_id,
                date: selectedDate,
                college_id: collegeId
            };

            if (editingActivity) {
                await teacherProfileService.updateOtherActivity(editingActivity.id, payload);
            } else {
                await teacherProfileService.createOtherActivity(payload);
            }

            setShowActivityModal(false);
            fetchAllData();
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    };

    const handleDeleteActivity = (id) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnCssClass="btn-confirm"
                cancelBtnCssClass="btn-cancel"
                title="Are you sure?"
                onConfirm={() => confirmDelete(id)}
                onCancel={() => setAlert(null)}
                focusCancelBtn
            >
                You will not be able to recover this activity record!
            </SweetAlert>
        );
    };

    const confirmDelete = async (id) => {
        try {
            await teacherProfileService.deleteOtherActivity(id);
            setAlert(
                <SweetAlert success title="Deleted!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Activity deleted successfully.
                </SweetAlert>
            );
            fetchAllData();
        } catch (error) {
            console.error('Error deleting activity:', error);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Failed to delete activity. Please try again.
                </SweetAlert>
            );
        }
    };

    const handleExport = async (type) => {
        if (!exportForm.start_date || !exportForm.end_date) {
            setAlert(
                <SweetAlert warning title="Missing Dates!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Please select both start and end dates before exporting.
                </SweetAlert>
            );
            return;
        }

        try {
            setExportLoadingType(type);

            const params = {
                userId: userId,
                startDate: exportForm.start_date,
                endDate: exportForm.end_date,
            };

            const res = type === 'pdf'
                ? await ProfessionalEthicsService.exportDailyWorkReportPdf(params)
                : await ProfessionalEthicsService.exportDailyWorkReportExcel(params);

            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Daily_Work_Report_${exportForm.start_date}_to_${exportForm.end_date}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setShowExportModal(false);
            setExportForm({ start_date: '', end_date: '' });
        } catch (error) {
            console.error('Export error:', error);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Failed to download report.
                </SweetAlert>
            );
        } finally {
            setExportLoadingType(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 font-sans">
            {alert}
            {/* Top Bar / Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Work Report</h1>
                </div>

                <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Date</label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-sm font-medium text-gray-900 outline-none"
                            />
                            <div className="h-4 w-px bg-gray-200"></div>
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-tighter w-20">{getDayName(selectedDate)}</span>
                        </div>
                    </div>

                    <div className="flex items-center pb-0.5">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl shadow-sm font-medium hover:bg-green-700 h-11"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* CURRICULAR ACTIVITIES SECTION */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        Curricular Activities
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden lg:block">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-th w-[5%]">Sr No.</th>
                                    <th className="table-th w-[12%]">Period</th>
                                    <th className="table-th w-[12%]">Academic Year</th>
                                    <th className="table-th w-[8%]">Semester</th>
                                    <th className="table-th w-[8%]">Division</th>
                                    <th className="table-th w-[15%]">Paper</th>
                                    <th className="table-th w-[15%]">Teaching Unit</th>
                                    <th className="table-th text-center w-[15%]">
                                        <div>No. of Students</div>
                                        <div className="grid grid-cols-3 gap-1 mt-1 text-[10px] font-normal">
                                            <span>Present</span>
                                            <span>Absent</span>
                                            <span>Total</span>
                                        </div>
                                    </th>
                                    <th className="table-th text-center w-[10%]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="9" className="py-12 text-center text-gray-400 font-medium">Loading records...</td></tr>
                                ) : curricularData.length === 0 ? (
                                    <tr><td colSpan="9" className="py-12 text-center text-gray-400 font-medium">No curricular activities found.</td></tr>
                                ) : (
                                    curricularData.map((item, index) => {
                                        const teachingUnits = item.teachingunits || [];
                                        const displayUnits = teachingUnits.slice(0, 2);
                                        const remainingCount = teachingUnits.length - 2;

                                        return (
                                            <tr key={index} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="py-4 px-4 text-sm text-gray-600 font-medium">{index + 1}</td>
                                                <td className="py-4 px-4 text-sm text-gray-900 font-bold">
                                                    {formatTime(item.starttime)} - {formatTime(item.end_time)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{item.academic_year || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{item.semester || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">{item.division || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600 font-medium">{item.subject_name || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {teachingUnits.length === 0 ? (
                                                        <span className="text-gray-400">-</span>
                                                    ) : teachingUnits.length <= 2 ? (
                                                        <span>{teachingUnits.join(', ')}</span>
                                                    ) : (
                                                        <span>
                                                            {displayUnits.join(', ')}
                                                            <span className="ml-1.5 text-blue-600 font-semibold">
                                                                +{remainingCount} more
                                                            </span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                                        <span className="text-green-600 font-bold">{item.totalprasentstudent || 0}</span>
                                                        <span className="text-red-600 font-bold">{item.totalabsentstudent || 0}</span>
                                                        <span className="text-gray-700 font-bold">{item.totalstudent || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <button
                                                        onClick={() => handleViewLecture(item)}
                                                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="View Lecture Notes"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MOBILE CARD VIEW FOR CURRICULAR */}
                <div className="lg:hidden space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium">Loading activities...</p>
                        </div>
                    ) : curricularData.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <p className="text-gray-400 font-medium">No curricular activities found.</p>
                        </div>
                    ) : (
                        curricularData.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Period</div>
                                        <div className="text-sm font-bold text-gray-900">{formatTime(item.starttime)} - {formatTime(item.end_time)}</div>
                                    </div>
                                    <button
                                        onClick={() => handleViewLecture(item)}
                                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</div>
                                        <div className="text-xs font-semibold text-gray-700">{item.academic_year || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Division</div>
                                        <div className="text-xs font-semibold text-gray-700">{item.division || '-'}</div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paper</div>
                                        <div className="text-xs font-semibold text-gray-700">{item.subject_name || '-'}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Teaching Unit</div>
                                        <div className="text-xs font-medium text-gray-600">
                                            {item.teachingunits?.length > 0 ? item.teachingunits.join(', ') : '-'}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-[10px] font-bold text-green-600 uppercase">P</div>
                                            <div className="text-xs font-bold">{item.totalprasentstudent || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-bold text-red-600 uppercase">A</div>
                                            <div className="text-xs font-bold">{item.totalabsentstudent || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">T</div>
                                            <div className="text-xs font-bold">{item.totalstudent || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* OTHER ACTIVITIES SECTION */}
            <div>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        {/* <span className="w-2 h-8 bg-purple-600 rounded-full"></span> */}
                        Research Activity / Co-curricular / Extracurricular / Administrative
                    </h2>
                    <button
                        onClick={() => { setEditingActivity(null); setActivityForm({ from_time: '', to_time: '', description: '' }); setShowActivityModal(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-bold text-sm shadow-lg shadow-gray-200"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Activity</span>
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden lg:block">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-th w-[10%]">Sr No.</th>
                                    <th className="table-th w-[15%]">From</th>
                                    <th className="table-th w-[15%]">To</th>
                                    <th className="table-th">Description</th>
                                    <th className="table-th text-center w-[12%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Loading other activities...</td></tr>
                                ) : otherActivities.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No other activities recorded for this date.</td></tr>
                                ) : (
                                    otherActivities.map((act, idx) => (
                                        <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-600 font-medium">{idx + 1}</td>
                                            <td className="py-4 px-6 text-sm text-gray-900 font-bold">{act.from_time || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-900 font-bold">{act.to_time || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600 leading-relaxed font-medium">{act.description}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => { setEditingActivity(act); setActivityForm(act); setShowActivityModal(true); }} className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteActivity(act.id)} className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MOBILE CARD VIEW FOR OTHER ACTIVITIES */}
                <div className="lg:hidden space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium">Loading activities...</p>
                        </div>
                    ) : otherActivities.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <p className="text-gray-400 font-medium">No other activities recorded.</p>
                        </div>
                    ) : (
                        otherActivities.map((act, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</div>
                                            <div className="text-sm font-bold text-gray-900">{act.from_time || '-'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</div>
                                            <div className="text-sm font-bold text-gray-900">{act.to_time || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingActivity(act); setActivityForm(act); setShowActivityModal(true); }} className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteActivity(act.id)} className="p-2.5 rounded-xl bg-red-50 text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-50">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</div>
                                    <div className="text-sm text-gray-700 font-medium leading-relaxed px-1">{act.description}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* LECTURE NOTES MODAL */}
            {showLectureModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-lg font-bold text-gray-900">Lecture Details</h3>
                            <button onClick={() => { setShowLectureModal(false); setLectureDetails(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {loadingLecture ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-500 text-sm">Loading details...</p>
                                </div>
                            ) : !lectureDetails || lectureDetails.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-sm">No lecture details found.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {lectureDetails.map((detail, idx) => (
                                        <div key={idx} className="space-y-4 pb-6 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Lecture {idx + 1}</h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Teaching Units:</span>
                                                <span className="text-sm text-gray-700">{detail.teaching_unit?.join(', ') || '-'}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Books Used:</span>
                                                <span className="text-sm text-gray-700">{detail.book_used?.join(', ') || '-'}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 items-start">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Synopsis:</span>
                                                <span className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{detail.notes || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button onClick={() => { setShowLectureModal(false); setLectureDetails(null); }} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVITY MODAL */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h3>
                            <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">From Time</label>
                                    <input type="time" value={activityForm.from_time} onChange={(e) => setActivityForm({ ...activityForm, from_time: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">To Time</label>
                                    <input type="time" value={activityForm.to_time} onChange={(e) => setActivityForm({ ...activityForm, to_time: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                                <textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} rows="4" className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm font-medium" placeholder="Describe the activity..." />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                            <button onClick={() => setShowActivityModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button onClick={handleSaveActivity} className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100">Save Activity</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPORT WORK REPORT MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Export Work Report</h3>
                            <button onClick={() => { setShowExportModal(false); setExportForm({ start_date: '', end_date: '' }); }} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={exportForm.start_date}
                                        onChange={(e) => setExportForm({ ...exportForm, start_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={exportForm.end_date}
                                        min={exportForm.start_date}
                                        onChange={(e) => setExportForm({ ...exportForm, end_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex flex-col gap-3 bg-gray-50/50">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={exportLoadingType !== null}
                                className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <FileText className="w-5 h-5" />
                                {exportLoadingType === 'pdf' ? 'Exporting PDF...' : 'Download as PDF'}
                            </button>

                            <button
                                onClick={() => handleExport('excel')}
                                disabled={exportLoadingType !== null}
                                className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <FileText className="w-5 h-5" />
                                {exportLoadingType === 'excel' ? 'Exporting Excel...' : 'Download as Excel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyWorkReport;
