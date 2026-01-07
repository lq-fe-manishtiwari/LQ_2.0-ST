import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userCommitteeService } from '../../../../_services/committeeService';
import { ArrowLeft, Users, Calendar, MapPin, Clock, Eye, Loader2, Target, Lightbulb, CheckCircle } from 'lucide-react';
import moment from 'moment';

export default function CommitteeDetails() {
    const { committeeId } = useParams();
    const navigate = useNavigate();
    const [committee, setCommittee] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadCommitteeData();
    }, [committeeId]);

    const loadCommitteeData = async () => {
        try {
            setLoading(true);
            const [committeeData, meetingsData] = await Promise.all([
                userCommitteeService.getCommitteeDetails(committeeId),
                userCommitteeService.getCommitteeMeetings(committeeId)
            ]);
            setCommittee(committeeData);
            setMeetings(meetingsData || []);
        } catch (error) {
            console.error('Error loading committee data:', error);
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
                    <p className="text-gray-600">Loading committee details...</p>
                </div>
            </div>
        );
    }

    if (!committee) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Committee not found</p>
                    <button onClick={() => navigate('/committees')} className="mt-4 text-blue-600 hover:underline">
                        Go back to My Committees
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/committees')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{committee.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">Committee Details</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'overview'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Lightbulb className="w-4 h-4 inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'members'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Members ({committee.members?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('meetings')}
                        className={`px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'meetings'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Meetings ({meetings.length})
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {committee.vision && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Lightbulb className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Vision</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{committee.vision}</p>
                            </div>
                        )}

                        {committee.mission && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Target className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Mission</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{committee.mission}</p>
                            </div>
                        )}

                        {committee.objective && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Objectives</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{committee.objective}</p>
                            </div>
                        )}

                        {committee.goals && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Target className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Goals</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{committee.goals}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {committee.members && committee.members.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {committee.members.map((member, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{member.member_name || member.memberName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {member.designation || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {member.member_type || member.memberType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.member_category === 'INTERNAL' || member.memberCategory === 'INTERNAL'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {member.member_category || member.memberCategory}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {member.email_id || member.emailId || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No members found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {meetings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Meeting</th>
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
                                                        onClick={() => navigate(`/committee/meeting/${meeting.meeting_id || meeting.meetingId}`)}
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
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No meetings scheduled yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
