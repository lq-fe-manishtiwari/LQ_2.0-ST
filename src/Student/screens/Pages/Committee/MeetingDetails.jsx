import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userCommitteeService } from "./../../../../_services/committeeService.js";
import { ArrowLeft, Calendar, Clock, MapPin, FileText, Users as UsersIcon, Download, Loader2 } from 'lucide-react';
import moment from 'moment';

export default function UserMeetingDetails() {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [minutes, setMinutes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('agenda');

    useEffect(() => {
        loadMeetingData();
    }, [meetingId]);

    const loadMeetingData = async () => {
        try {
            setLoading(true);
            const meetingData = await userCommitteeService.getMeetingDetails(meetingId);
            setMeeting(meetingData);

            // Load attendance and minutes
            try {
                const attendanceData = await userCommitteeService.getMeetingAttendance(meetingId);
                setAttendance(attendanceData || []);
            } catch (err) {
                console.log('No attendance data');
            }

            try {
                const minutesData = await userCommitteeService.getMeetingMinutes(meetingId);
                setMinutes(minutesData);
            } catch (err) {
                console.log('No minutes data');
            }
        } catch (error) {
            console.error('Error loading meeting data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            await userCommitteeService.downloadMeetingReport(meetingId);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report');
        }
    };

    const getStatusBadge = () => {
        if (!meeting) return null;
        const now = moment();
        const meetingTime = moment(meeting.start_date_time || meeting.startDateTime);
        const hasAttendance = attendance.length > 0;

        if (meeting.status === 'COMPLETED' || hasAttendance) {
            return <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Completed</span>;
        } else if (meetingTime.isBefore(now)) {
            return <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">Missed</span>;
        } else {
            return <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Upcoming</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading meeting details...</p>
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">Meeting not found</p>
                    <button onClick={() => navigate('/my-committees')} className="mt-4 text-blue-600 hover:underline">
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
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{meeting.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">{meeting.committee?.name || 'Committee Meeting'}</p>
                    </div>
                    {(meeting.status === 'COMPLETED' || attendance.length > 0) && (
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Download size={16} />
                            <span className="hidden md:inline">Download Report</span>
                        </button>
                    )}
                </div>

                {/* Meeting Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="bg-slate-800 p-6 text-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    {getStatusBadge()}
                                    <span className="text-white/50 font-bold text-xs uppercase">ID: {meeting.meeting_id || meeting.meetingId}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-blue-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-white/50 font-bold uppercase">Date</p>
                                    <p className="text-sm font-semibold truncate">
                                        {moment(meeting.start_date_time || meeting.startDateTime).format('DD MMM, YYYY')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-blue-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-white/50 font-bold uppercase">Time</p>
                                    <p className="text-sm font-semibold truncate">
                                        {moment(meeting.start_date_time || meeting.startDateTime).format('hh:mm A')} -
                                        {moment(meeting.end_date_time || meeting.endDateTime).format('hh:mm A')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-blue-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-white/50 font-bold uppercase">Venue</p>
                                    <p className="text-sm font-semibold truncate">{meeting.mode} • {meeting.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('agenda')}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap
                                ${activeTab === 'agenda' ? 'text-blue-600 bg-white border-r border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FileText size={16} />
                            Agenda
                            {activeTab === 'agenda' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap
                                ${activeTab === 'attendance' ? 'text-blue-600 bg-white border-r border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <UsersIcon size={16} />
                            Attendance
                            {activeTab === 'attendance' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('minutes')}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap
                                ${activeTab === 'minutes' ? 'text-blue-600 bg-white border-l border-r border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <FileText size={16} />
                            Minutes
                            {activeTab === 'minutes' && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                        {activeTab === 'agenda' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Meeting Agenda</h3>
                                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {meeting.agenda || 'No agenda specified'}
                                    </p>
                                </div>

                                {meeting.objective && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Objectives</h3>
                                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                            {meeting.objective}
                                        </p>
                                    </div>
                                )}

                                {meeting.description && (
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Description</h3>
                                        <p className="text-gray-800 leading-relaxed">
                                            {meeting.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div>
                                {attendance.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Designation</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {attendance.map((record, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                            {record.member?.member_name || record.member?.memberName || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {record.member?.designation || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.is_present || record.isPresent
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {record.is_present || record.isPresent ? 'Present' : 'Absent'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Attendance not marked yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'minutes' && (
                            <div>
                                {minutes && (minutes.notes || minutes.action_items || minutes.actionItems) ? (
                                    <div className="space-y-6">
                                        {minutes.notes && (
                                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Notes</h3>
                                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {minutes.notes}
                                                </p>
                                            </div>
                                        )}

                                        {(minutes.action_items || minutes.actionItems) && (
                                            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Action Items</h3>
                                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {minutes.action_items || minutes.actionItems}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Minutes not recorded yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
