import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, UserX } from 'lucide-react';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import SweetAlert from 'react-bootstrap-sweetalert';
import { monitoringService } from '../Services/monitoring.service';

const MonitoringReports = () => {
    const userProfile = useUserProfile();
    const userId = userProfile.getUserId();
    const college_id = userProfile.getCollegeId();
    const loggedInUserId = userId; // Assuming the logged-in user is the one performing actions

    const [activeTerm, setActiveTerm] = useState('term1');
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [responses, setResponses] = useState({});
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [newActivity, setNewActivity] = useState('');
    const [editingActivity, setEditingActivity] = useState(null);

    // Fetch activities and responses
    useEffect(() => {
        if (college_id && activeTerm) {
            fetchActivities();
        }
    }, [college_id, activeTerm]);

    useEffect(() => {
        if (userId && activeTerm && activities.length > 0) {
            fetchResponses();
        }
    }, [userId, activeTerm, activities]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Hardcoded activities for testing
            const hardcodedActivities = [
                {
                    activity_id: 1,
                    activity: 'Preparation of Lesson Plan',
                    college_id: college_id,
                    term: activeTerm,
                    created_at: '2024-01-15T10:30:00Z'
                },
                {
                    activity_id: 2,
                    activity: 'Use of Teaching Aids',
                    college_id: college_id,
                    term: activeTerm,
                    created_at: '2024-01-15T10:35:00Z'
                },
            ];

            setActivities(hardcodedActivities);

            // Uncomment when backend is ready
            // const data = await monitoringService.getActivities(college_id, activeTerm);
            // setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        try {
            const data = await monitoringService.getResponses(userId, activeTerm);

            // Convert array response to object keyed by activity_id
            const responsesMap = {};
            if (Array.isArray(data)) {
                data.forEach(response => {
                    responsesMap[response.activity_id] = response.rating;
                });
            }
            setResponses(responsesMap);
        } catch (error) {
            console.error('Error fetching responses:', error);
            setResponses({});
        }
    };

    const handleAddActivity = async () => {
        if (!newActivity.trim()) {
            setAlert(
                <SweetAlert warning title="Empty Field!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Please enter an activity name.
                </SweetAlert>
            );
            return;
        }

        try {
            await monitoringService.addActivity({
                college_id,
                term: activeTerm,
                activity: newActivity,
                created_by: loggedInUserId
            });

            setAlert(
                <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Activity added successfully!
                </SweetAlert>
            );
            setNewActivity('');
            setShowAddActivityModal(false);
            fetchActivities();
        } catch (error) {
            console.error('Error adding activity:', error);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Failed to add activity.
                </SweetAlert>
            );
        }
    };

    const handleUpdateActivity = async (activityId, newText) => {
        try {
            await monitoringService.updateActivity(activityId, { activity: newText });

            setAlert(
                <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Activity updated successfully!
                </SweetAlert>
            );
            setEditingActivity(null);
            fetchActivities();
        } catch (error) {
            console.error('Error updating activity:', error);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Failed to update activity.
                </SweetAlert>
            );
        }
    };

    const handleDeleteActivity = async (activityId) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                title="Are you sure?"
                onConfirm={async () => {
                    try {
                        await monitoringService.deleteActivity(activityId);

                        setAlert(
                            <SweetAlert success title="Deleted!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                                Activity has been deleted.
                            </SweetAlert>
                        );
                        fetchActivities();
                    } catch (error) {
                        setAlert(
                            <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                                Failed to delete activity.
                            </SweetAlert>
                        );
                    }
                }}
                onCancel={() => setAlert(null)}
                focusCancelBtn
                confirmBtnCssClass="btn-confirm"
                cancelBtnCssClass="btn-cancel"
            >
                This will remove the activity for all teachers!
            </SweetAlert>
        );
    };

    const handleResponseChange = (activityId, rating) => {
        // Just update local state, don't call API yet
        setResponses(prev => ({ ...prev, [activityId]: rating }));
    };

    const handleSubmitResponses = async () => {
        setLoading(true);
        try {
            // Save all responses
            const promises = Object.entries(responses).map(([activityId, rating]) =>
                monitoringService.saveResponse({
                    user_id: userId,
                    activity_id: parseInt(activityId),
                    term: activeTerm,
                    rating
                })
            );

            await Promise.all(promises);

            setAlert(
                <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    All responses saved successfully!
                </SweetAlert>
            );
        } catch (error) {
            console.error('Error saving responses:', error);
            setAlert(
                <SweetAlert error title="Error!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    Failed to save responses. Please try again.
                </SweetAlert>
            );
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile.isLoaded) {
        return <div className="p-5 text-center text-gray-500">Loading profile...</div>;
    }

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
                <UserX className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-600">No Teacher Selected</p>
                <p className="text-sm mt-1 max-w-sm">
                    User information is unavailable.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Report of Internal Academic Monitoring Committee</h1>
                <p className="text-xs sm:text-sm text-gray-500">Evaluate teaching performance across key activities</p>
            </div>

            {/* Advanced Term Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex px-4 sm:px-6">
                    <button
                        onClick={() => setActiveTerm('term1')}
                        className={`relative px-6 py-4 font-semibold text-sm transition-all duration-200 ${activeTerm === 'term1'
                            ? 'text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Term 1
                        {activeTerm === 'term1' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTerm('term2')}
                        className={`relative px-6 py-4 font-semibold text-sm transition-all duration-200 ${activeTerm === 'term2'
                            ? 'text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Term 2
                        {activeTerm === 'term2' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Add Activity Button */}
            <div className="p-4 sm:p-6 border-b border-gray-50">
                <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={18} /> Add Activity
                </button>
            </div>

            {/* Table */}
            <div className="p-4 sm:p-6 overflow-x-auto flex-1">{loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading activities...</p>
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 font-medium">No activities added yet for {activeTerm === 'term1' ? 'Term 1' : 'Term 2'}.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border text-sm min-w-[800px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 w-[8%]">Sr. No.</th>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 w-[35%]">Activity</th>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-center font-semibold text-gray-700 w-[14%]">Excellent</th>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-center font-semibold text-gray-700 w-[14%]">Satisfactory</th>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-center font-semibold text-gray-700 w-[14%]">Can do better</th>
                                <th className="border border-gray-200 px-3 sm:px-4 py-3 text-center font-semibold text-gray-700 w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((activity, index) => (
                                <tr key={activity.activity_id} className="hover:bg-primary-50/30 transition-colors">
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3 font-medium text-gray-800">{index + 1}</td>
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3">
                                        {editingActivity === activity.activity_id ? (
                                            <input
                                                type="text"
                                                defaultValue={activity.activity}
                                                onBlur={(e) => handleUpdateActivity(activity.activity_id, e.target.value)}
                                                autoFocus
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        ) : (
                                            <span className="text-gray-700 font-medium">{activity.activity}</span>
                                        )}
                                    </td>
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3 text-center">
                                        <input
                                            type="radio"
                                            name={`activity-${activity.activity_id}`}
                                            checked={responses[activity.activity_id] === 'excellent'}
                                            onChange={() => handleResponseChange(activity.activity_id, 'excellent')}
                                            className="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3 text-center">
                                        <input
                                            type="radio"
                                            name={`activity-${activity.activity_id}`}
                                            checked={responses[activity.activity_id] === 'satisfactory'}
                                            onChange={() => handleResponseChange(activity.activity_id, 'satisfactory')}
                                            className="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3 text-center">
                                        <input
                                            type="radio"
                                            name={`activity-${activity.activity_id}`}
                                            checked={responses[activity.activity_id] === 'can_do_better'}
                                            onChange={() => handleResponseChange(activity.activity_id, 'can_do_better')}
                                            className="w-5 h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="border border-gray-200 px-3 sm:px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setEditingActivity(activity.activity_id)}
                                                className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors"
                                                title="Edit Activity"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteActivity(activity.activity_id)}
                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                                                title="Delete Activity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </div>

            {/* Submit Button */}
            {activities.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitResponses}
                            disabled={loading || Object.keys(responses).length === 0}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Submit Responses'}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Activity Modal */}
            {showAddActivityModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Add New Activity</h3>
                            <button onClick={() => setShowAddActivityModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Activity Name</label>
                            <input
                                type="text"
                                value={newActivity}
                                onChange={(e) => setNewActivity(e.target.value)}
                                placeholder="Enter activity name..."
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddActivityModal(false)}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddActivity}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-100"
                            >
                                Add Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {alert}
        </div>
    );
};

export default MonitoringReports;
