import React, { useState, useEffect } from 'react';
import { Eye, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useOutletContext, useParams } from 'react-router-dom';
import { teacherProfileService } from '../Services/academicDiary.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { timetableService } from '../../TimeTable/Services/timetable.service';
import Swal from 'sweetalert2';

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


    const { filters } = useOutletContext();

    const { id } = useParams();
    const [collegeId, setCollegeId] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [collegeName, setCollegeName] = useState("");
    const [error, setError] = useState(null);


    const userProfile = useUserProfile();


    useEffect(() => {
        try {
            const activeCollegeStr = localStorage.getItem('activeCollege');
            if (activeCollegeStr) {
                const activeCollege = JSON.parse(activeCollegeStr);
                setCollegeId(activeCollege.id);
                setCollegeName(activeCollege.name);
                console.log("Active College:", activeCollege);
            }

            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                setTeacherId(currentUser.jti);
                console.log("Current User:", currentUser);
            }


            if (id) {
                setTeacherId(id);
            }

            // If ID is passed via filters (from layout), it overrides (optional, depending on priority)
            const filterTeacherId = filters?.teacher?.teacher_id || filters?.teacherId;
            if (filterTeacherId) {
                setTeacherId(filterTeacherId);
            }

        } catch (err) {
            console.error("Error parsing localStorage data:", err);
            setError("Failed to load user information from localStorage");
        }
    }, [id, filters]);

    // Get day name from date
    const getDayName = (dateStr) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date(dateStr).getDay()];
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        return timeStr.substring(0, 5);
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
                // Exception exists - use it (exceptions override templates)
                console.log('Using exception_id:', exceptionId);
                response = await timetableService.getClassUpdates(exceptionId, null);
            } else if (slotId) {
                // No exception - use template slot
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
        if (!teacherId || !selectedDate) {
            console.warn('⚠️ Missing basic params for Daily Work Report:', { teacherId, selectedDate });
            return;
        }

        console.log('🚀 fetchAllData initiating...', { teacherId, collegeId, selectedDate });
        setLoading(true);

        // Tracker for race conditions could be added here if needed, but for now we rely on simple state updates

        try {
            const promises = [];

            // 1. Fetch Other Activities (Needs teacherId, date)
            const otherActivitiesPromise = teacherProfileService.getOtherActivities(teacherId, selectedDate)
                .then(res => {
                    console.log('✅ Other Activities Response:', res);
                    setOtherActivities(Array.isArray(res) ? res : []);
                })
                .catch(err => {
                    console.error('❌ Error fetching other activities:', err);
                    setOtherActivities([]);
                });
            promises.push(otherActivitiesPromise);

            // 2. Fetch Curricular Activities (Needs teacherId, collegeId, date)
            if (collegeId) {
                const curricularPromise = teacherProfileService.getTeacherDailyReport(teacherId, collegeId, selectedDate)
                    .then(res => {
                        console.log('✅ Curricular Response:', res);
                        // API returns array directly
                        setCurricularData(Array.isArray(res) ? res : []);
                    })
                    .catch(err => {
                        console.error('❌ Error fetching curricular report:', err);
                        setCurricularData([]);
                    });
                promises.push(curricularPromise);
            } else {
                console.warn('⚠️ Skipping Curricular Activities fetch: No collegeId found.');
                setCurricularData([]);
            }

            await Promise.all(promises);
        } catch (error) {
            console.error('❌ Unexpected error in fetchAllData:', error);
        } finally {
            setLoading(false);
            console.log('🏁 fetchAllData completed');
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (teacherId && collegeId) {
            console.log('🔄 useEffect triggered');
            console.log('Dependencies:', { teacherId, collegeId, selectedDate });

            fetchAllData();
        }

        return () => {
            isMounted = false;
        };
    }, [teacherId, collegeId, selectedDate]); // Removed userProfile.isLoaded dependency as we are managing IDs locally now

    if (userProfile.loading) {
        return <div className="p-8 text-center text-gray-500">Loading user profile...</div>;
    }

    // Handle activity CRUD
    const handleSaveActivity = async () => {
        try {
            const payload = {
                ...activityForm,
                teacher_id: teacherId,
                date: selectedDate,
                // Include collegeId if available
                ...(collegeId && { college_id: collegeId })
            };

            if (editingActivity) {
                await teacherProfileService.updateOtherActivity(editingActivity.id, payload);
                Swal.fire("Success", "Activity updated successfully!", "success");
            } else {
                await teacherProfileService.createOtherActivity(payload);
                Swal.fire("Success", "Activity created successfully!", "success");
            }
            setShowActivityModal(false);
            fetchAllData();
        } catch (error) {
            console.error('Error saving activity:', error);
            Swal.fire("Error", "Failed to save activity.", "error");
        }
    };

    const handleDeleteActivity = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await teacherProfileService.deleteOtherActivity(id);
            Swal.fire("Deleted!", "Activity has been deleted.", "success");
            fetchAllData();
        } catch (error) {
            console.error('Error deleting activity:', error);
            Swal.fire("Error", "Failed to delete activity.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 lg:p-8 font-sans">
            {/* Top Bar / Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-1 w-full lg:w-auto">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Work Report</h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full lg:w-auto">
                    <div className="flex flex-col space-y-1 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Date</label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-auto">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-sm font-medium text-gray-900 outline-none flex-1 sm:flex-none"
                            />
                            <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-tighter w-20 hidden sm:block text-center">{getDayName(selectedDate)}</span>
                        </div>
                        {/* Mobile Day Display */}
                        <div className="sm:hidden text-xs font-bold text-blue-600 uppercase tracking-tighter mt-1 text-right">
                            {getDayName(selectedDate)}
                        </div>
                    </div>
                </div>
            </div>

            {/* CURRICULAR ACTIVITIES SECTION */}
            <div className="mb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 gap-2">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        Curricular Activities
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-th w-[5%] whitespace-nowrap">Sr No.</th>
                                    <th className="table-th w-[12%] whitespace-nowrap">Period</th>
                                    <th className="table-th w-[10%] whitespace-nowrap">Academic Year</th>
                                    <th className="table-th w-[8%] whitespace-nowrap">Semester</th>
                                    <th className="table-th w-[8%] whitespace-nowrap">Division</th>
                                    <th className="table-th w-[15%] whitespace-nowrap">Paper</th>
                                    <th className="table-th w-[15%] whitespace-nowrap">Teaching Unit</th>
                                    <th className="table-th text-center w-[15%] whitespace-nowrap">
                                        <div>No. of Students</div>
                                        <div className="grid grid-cols-3 gap-1 mt-1 text-[10px] font-normal">
                                            <span>Present</span>
                                            <span>Absent</span>
                                            <span>Total</span>
                                        </div>
                                    </th>
                                    <th className="table-th text-center w-[10%] whitespace-nowrap">Action</th>
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
                                                <td className="py-4 px-4 text-sm text-gray-900 font-bold whitespace-nowrap">
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
            </div>

            {/* OTHER ACTIVITIES SECTION */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-2 gap-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        {/* <span className="w-2 h-8 bg-purple-600 rounded-full"></span> */}
                        Research / Co-curricular / Extracurricular
                    </h2>
                    <button
                        onClick={() => { setEditingActivity(null); setActivityForm({ from_time: '', to_time: '', description: '' }); setShowActivityModal(true); }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-bold text-sm shadow-lg shadow-gray-200"
                    >
                        <Plus size={18} />
                        <span className="inline">Add Activity</span>
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-th w-[10%] whitespace-nowrap">Sr No.</th>
                                    <th className="table-th w-[15%] whitespace-nowrap">From</th>
                                    <th className="table-th w-[15%] whitespace-nowrap">To</th>
                                    <th className="table-th whitespace-nowrap">Description</th>
                                    <th className="table-th text-center w-[12%] whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {otherActivities.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No other activities recorded for this date.</td></tr>
                                ) : (
                                    otherActivities.map((act, idx) => (
                                        <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-600 font-medium">{idx + 1}</td>
                                            <td className="py-4 px-6 text-sm text-gray-900 font-bold whitespace-nowrap">{act.from_time || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-900 font-bold whitespace-nowrap">{act.to_time || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600 leading-relaxed font-medium min-w-[200px]">{act.description}</td>
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
            </div>

            {/* LECTURE NOTES MODAL */}
            {showLectureModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Lecture Details</h3>
                                <p className="text-gray-400 text-xs font-bold tracking-wider mt-1">Class Update Information</p>
                            </div>
                            <button onClick={() => { setShowLectureModal(false); setLectureDetails(null); }} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            {loadingLecture ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
                                    <p className="text-gray-500 font-medium">Loading lecture details...</p>
                                </div>
                            ) : !lectureDetails || lectureDetails.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 font-medium">No lecture details found for this session.</p>
                                </div>
                            ) : (
                                lectureDetails.map((detail, idx) => (
                                    <div key={idx} className="space-y-5 border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                        {/* Teaching Units */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-blue-600 uppercase tracking-widest">Teaching Units</label>
                                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                {detail.teaching_unit && detail.teaching_unit.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {detail.teaching_unit.map((unit, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                                                                {unit}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No teaching units specified.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Books Used */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-green-600 uppercase tracking-widest">Books Used</label>
                                            <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                                {detail.book_used && detail.book_used.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {detail.book_used.map((book, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                                                <span className="text-green-600 mt-1">📚</span>
                                                                <span className="break-words">{book}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No books reported.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Synopsis (Notes) */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-purple-600 uppercase tracking-widest">Synopsis</label>
                                            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100">
                                                {detail.notes ? (
                                                    <p className="text-gray-700 leading-relaxed text-sm font-medium whitespace-pre-line break-words">{detail.notes}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No synopsis provided.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50 shrink-0">
                            <button onClick={() => { setShowLectureModal(false); setLectureDetails(null); }} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVITY MODAL */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">{editingActivity ? 'Edit Activity' : 'Add New Activity'}</h3>
                            <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50 shrink-0">
                            <button onClick={() => setShowActivityModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                            <button onClick={handleSaveActivity} className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100">Save Activity</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyWorkReport;
