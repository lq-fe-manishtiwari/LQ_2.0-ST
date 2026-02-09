import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { monitoringService } from '../Services/monitoring.service';
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

const MonitoringReports = () => {
    const userProfile = useUserProfile();
    const userId = userProfile.getUserId();
    const college_id = userProfile.getCollegeId();

    const [activeTerm, setActiveTerm] = useState('Term 1');
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState([]);
    const [responses, setResponses] = useState({});

    // Ratings Constants
    const RATINGS = {
        EXCELLENT: 'EXCELLENT',
        SATISFACTORY: 'SATISFACTORY',
        CAN_DO_BETTER: 'CAN_DO_BETTER'
    };

    // Fetch activities and responses
    useEffect(() => {
        if (userProfile.isLoaded && college_id) {
            fetchActivities();
        }
    }, [userProfile.isLoaded, college_id, activeTerm]);

    useEffect(() => {
        if (userProfile.isLoaded && userId && college_id && activities.length > 0) {
            fetchResponses();
        }
    }, [userProfile.isLoaded, userId, activeTerm, activities]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await monitoringService.getActivities(college_id, activeTerm);
            setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        try {
            const data = await monitoringService.getResponses(college_id, userId, activeTerm);

            // Convert array response to object keyed by activity_id
            const responsesMap = {};
            if (Array.isArray(data)) {
                data.forEach(resp => {
                    responsesMap[resp.activity_id] = resp.rating;
                });
            }
            setResponses(responsesMap);
        } catch (error) {
            console.error('Error fetching responses:', error);
            setResponses({});
        }
    };

    const handleResponseChange = (activityId, rating) => {
        setResponses(prev => ({ ...prev, [activityId]: rating }));
    };

    const handleSubmitResponses = async () => {
        setLoading(true);
        try {
            // Prepare bulk payload including all activities
            const payload = activities.map(activity => ({
                activity_id: activity.activity_id,
                college_id: college_id,
                user_id: userId,
                term: activeTerm,
                rating: responses[activity.activity_id] || null
            }));

            await monitoringService.saveBulkResponses(payload);

            setAlert(
                <SweetAlert success title="Success!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                    All responses saved successfully!
                </SweetAlert>
            );
            fetchResponses();
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading monitoring reports...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col min-h-[600px] w-full max-w-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Report of Internal Academic Monitoring Committee</h1>
                <p className="text-xs sm:text-sm text-gray-500">Evaluate teaching performance across key activities</p>
            </div>

            {/* Tabs Header */}
            <div className="border-b border-gray-200 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6">
                    <div className="flex w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTerm('Term 1')}
                            className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all duration-200 text-center ${activeTerm === 'Term 1'
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Term 1
                            {activeTerm === 'Term 1' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTerm('Term 2')}
                            className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all duration-200 text-center ${activeTerm === 'Term 2'
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Term 2
                            {activeTerm === 'Term 2' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full"></div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading activities...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <p className="text-gray-400 font-medium">No activities added yet for {activeTerm}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="border-b border-gray-200 px-3 py-3 sm:px-4 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm w-[50px] sm:w-[8%] whitespace-nowrap">Sr.</th>
                                    <th className="border-b border-gray-200 px-3 py-3 sm:px-4 sm:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm w-auto">Activity</th>
                                    <th className="border-b border-gray-200 px-2 py-3 sm:px-4 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm w-[80px] sm:w-[15%] whitespace-nowrap">Excellent</th>
                                    <th className="border-b border-gray-200 px-2 py-3 sm:px-4 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm w-[90px] sm:w-[15%] whitespace-nowrap">Satisfactory</th>
                                    <th className="border-b border-gray-200 px-2 py-3 sm:px-4 sm:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm w-[100px] sm:w-[15%] whitespace-nowrap">Can do better</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((activity, index) => (
                                    <tr key={activity.activity_id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
                                        <td className="px-3 py-3 sm:px-4 sm:py-4 font-medium text-gray-800 text-xs sm:text-sm text-center sm:text-left">{index + 1}</td>
                                        <td className="px-3 py-3 sm:px-4 sm:py-4">
                                            <span className="text-gray-700 font-medium text-xs sm:text-sm block min-w-[150px]">{activity.activity_name}</span>
                                        </td>
                                        <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                                            <div className="flex justify-center items-center h-full">
                                                <input
                                                    type="radio"
                                                    name={`activity-${activity.activity_id}`}
                                                    checked={responses[activity.activity_id] === RATINGS.EXCELLENT}
                                                    onChange={() => handleResponseChange(activity.activity_id, RATINGS.EXCELLENT)}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                                            <div className="flex justify-center items-center h-full">
                                                <input
                                                    type="radio"
                                                    name={`activity-${activity.activity_id}`}
                                                    checked={responses[activity.activity_id] === RATINGS.SATISFACTORY}
                                                    onChange={() => handleResponseChange(activity.activity_id, RATINGS.SATISFACTORY)}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 sm:px-4 sm:py-4 text-center">
                                            <div className="flex justify-center items-center h-full">
                                                <input
                                                    type="radio"
                                                    name={`activity-${activity.activity_id}`}
                                                    checked={responses[activity.activity_id] === RATINGS.CAN_DO_BETTER}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                    onChange={() => handleResponseChange(activity.activity_id, RATINGS.CAN_DO_BETTER)}
                                                />
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
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-20">
                    <div className="flex justify-end w-full">
                        <button
                            onClick={handleSubmitResponses}
                            disabled={loading || Object.keys(responses).length === 0}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Submit Responses'}
                        </button>
                    </div>
                </div>
            )}



            {alert}
        </div>
    );
};

export default MonitoringReports;
