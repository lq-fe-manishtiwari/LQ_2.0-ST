import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userCommitteeService } from "./../../../../_services/committeeService.js";
import { Users, Calendar, MapPin, Clock, Eye, Loader2 } from 'lucide-react';
import moment from 'moment';
import { useUserProfile } from '../../../../contexts/UserProfileContext.jsx';

export default function MyCommittees() {
    const navigate = useNavigate();
    const [committees, setCommittees] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('committees');

    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    // For teachers, use teacher_id which is stored as internal_user_id in committee members
    const userId = userProfile.teacher_id || userProfile.id;
    const userType = 'TEACHER';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [committeesData, meetingsData] = await Promise.all([
                userCommitteeService.getMyCommittees(userId, userType),
                userCommitteeService.getMyMeetings(userId, userType)
            ]);
            setCommittees(committeesData || []);
            setMeetings(meetingsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (meeting) => {
        const now = moment();
        const meetingTime = moment(meeting.start_date_time || meeting.startDateTime);
        const hasAttendance = meeting.attendance_count > 0 || meeting.attendanceCount > 0;

        if (meeting.status === 'COMPLETED' || hasAttendance) {
            return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>;
        } else if (meetingTime.isBefore(now)) {
            return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Missed</span>;
        } else {
            return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Upcoming</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your committees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Committees</h1>
                    <p className="text-sm text-gray-500 mt-1">View your committee memberships and upcoming meetings</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 md:gap-4">
                    <button
                        onClick={() => setActiveTab('committees')}
                        className={`tab-link flex items-center justify-center gap-2 whitespace-nowrap px-3 py-2 ${activeTab === 'committees' ? 'tab-active' : 'tab-inactive'}`}
                        style={{ minWidth: "180px" }}
                    >
                        <Users className="w-4 h-4" />
                        Committees ({committees.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('meetings')}
                        className={`tab-link flex items-center justify-center gap-2 whitespace-nowrap px-3 py-2 ${activeTab === 'meetings' ? 'tab-active' : 'tab-inactive'}`}
                        style={{ minWidth: "180px" }}
                    >
                        <Calendar className="w-4 h-4" />
                        Meetings ({meetings.length})
                    </button>
                </div>

                {/* Committees Tab */}
                {activeTab === 'committees' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {committees.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">You are not a member of any committee yet.</p>
                            </div>
                        ) : (
                            committees.map((committee) => (
                                <div
                                    key={committee.committee_id || committee.committeeId}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => navigate(`/teacher/committee/${committee.committee_id || committee.committeeId}`)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            Active
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{committee.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {committee.vision || 'No vision specified'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{committee.members?.length || 0} Members</span>
                                        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {meetings.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No meetings scheduled yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="table-header">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Meeting</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Committee</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {meetings.map((meeting) => (
                                            <tr key={meeting.meeting_id || meeting.meetingId} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{meeting.title}</div>
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{meeting.description || 'No description'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700">{meeting.committee?.name || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {moment(meeting.start_date_time || meeting.startDateTime).format('DD MMM, YYYY')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {moment(meeting.start_date_time || meeting.startDateTime).format('hh:mm A')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="line-clamp-1">{meeting.location || 'TBD'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(meeting)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => navigate(`/teacher/committee/meeting/${meeting.meeting_id || meeting.meetingId}`)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
