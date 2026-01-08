import React, { useState, useEffect, useMemo } from 'react';
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
    
    // Pagination
    const entriesPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

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

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const renderLocation = (location) => {
        if (!location || location === 'TBD') return location || 'TBD';
        
        const truncateText = (text, maxLength = 30) => {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        };
        
        if (isValidUrl(location)) {
            return (
                <a 
                    href={location} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                    onClick={(e) => e.stopPropagation()}
                    title={location}
                >
                    {truncateText(location)}
                </a>
            );
        }
        
        return <span className="break-words" title={location}>{truncateText(location)}</span>;
    };

    // Paginated Data for Meetings
    const paginatedMeetings = useMemo(() => {
        const totalEntries = meetings.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const currentEntries = meetings.slice(start, end);
        return { currentEntries, totalEntries, totalPages, start, end };
    }, [meetings, currentPage]);

    // Pagination handlers
    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < paginatedMeetings.totalPages && setCurrentPage(p => p + 1);
    const resetPage = () => setCurrentPage(1);

    // Reset page when tab changes
    useEffect(() => {
        resetPage();
    }, [activeTab]);

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
                <div className="flex gap-1 sm:gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('committees')}
                        className={`tab-link flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-sm flex-shrink-0 ${activeTab === 'committees' ? 'tab-active' : 'tab-inactive'}`}
                        style={{ minWidth: "120px" }}
                    >
                        Committees ({committees.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('meetings')}
                        className={`tab-link flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 text-sm flex-shrink-0 ${activeTab === 'meetings' ? 'tab-active' : 'tab-inactive'}`}
                        style={{ minWidth: "120px" }}
                    >
                        Meetings ({meetings.length})
                    </button>
                </div>

                {/* Committees Tab */}
                {activeTab === 'committees' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
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
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
                            {meetings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No meetings scheduled yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="table-header">
                                                <tr>
                                                    <th className="table-th text-center">Meeting</th>
                                                    <th className="table-th text-center">Committee</th>
                                                    <th className="table-th text-center">Date & Time</th>
                                                    <th className="table-th text-center">Location</th>
                                                    <th className="table-th text-center">Status</th>
                                                    <th className="table-th text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {paginatedMeetings.currentEntries.map((meeting) => (
                                                    <tr key={meeting.meeting_id || meeting.meetingId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="table-td text-center">{meeting.title}</td>
                                                        <td className="table-td text-center">{meeting.committee?.name || 'N/A'}</td>
                                                        <td className="table-td text-center">
                                                            {moment(meeting.start_date_time || meeting.startDateTime).format('DD MMM, YYYY hh:mm A')}
                                                        </td>
                                                        <td className="table-td text-center">{renderLocation(meeting.location)}</td>
                                                        <td className="table-td text-center">
                                                            {getStatusBadge(meeting)}
                                                        </td>
                                                        <td className="table-td text-center">
                                                            <button
                                                                onClick={() => navigate(`/teacher/committee/meeting/${meeting.meeting_id || meeting.meetingId}`)}
                                                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Pagination */}
                                    {paginatedMeetings.totalEntries > 0 && (
                                        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                                            <button
                                                onClick={handlePrev}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-md text-white ${
                                                    currentPage === 1 
                                                        ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <span className="text-gray-700 font-medium">
                                                Showing {paginatedMeetings.start + 1}–{Math.min(paginatedMeetings.end, paginatedMeetings.totalEntries)} of {paginatedMeetings.totalEntries} entries
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                disabled={currentPage === paginatedMeetings.totalPages}
                                                className={`px-4 py-2 rounded-md text-white ${
                                                    currentPage === paginatedMeetings.totalPages 
                                                        ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4 mt-6">
                            {meetings.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                                    <div className="text-gray-500">
                                        <p className="text-lg font-medium mb-2">No meetings found</p>
                                        <p className="text-sm">No meetings scheduled yet.</p>
                                    </div>
                                </div>
                            ) : (
                                paginatedMeetings.currentEntries.map((meeting) => (
                                    <div
                                        key={meeting.meeting_id || meeting.meetingId}
                                        className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{meeting.title}</p>
                                                <p className="text-sm text-gray-500">{meeting.committee?.name || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div><span className="font-medium">Date:</span> {moment(meeting.start_date_time || meeting.startDateTime).format('DD MMM, YYYY')}</div>
                                                <div><span className="font-medium">Time:</span> {moment(meeting.start_date_time || meeting.startDateTime).format('hh:mm A')}</div>
                                                <div className="col-span-2"><span className="font-medium">Location:</span> {renderLocation(meeting.location)}</div>
                                                <div><span className="font-medium">Status:</span> {getStatusBadge(meeting)}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center">
                                            <button
                                                onClick={() => navigate(`/teacher/committee/meeting/${meeting.meeting_id || meeting.meetingId}`)}
                                                className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Mobile Pagination */}
                        {paginatedMeetings.totalEntries > 0 && (
                            <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === 1 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700 font-medium text-xs">
                                    {paginatedMeetings.start + 1}–{Math.min(paginatedMeetings.end, paginatedMeetings.totalEntries)} of {paginatedMeetings.totalEntries}
                                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === paginatedMeetings.totalPages}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === paginatedMeetings.totalPages 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}