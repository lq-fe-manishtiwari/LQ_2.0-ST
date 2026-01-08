import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userCommitteeService } from "./../../../../_services/committeeService.js"
import { ArrowLeft, Users, Calendar, MapPin, Clock, Eye, Loader2, Target, Lightbulb, CheckCircle } from 'lucide-react';
import moment from 'moment';

export default function CommitteeDetails() {
    const { committeeId } = useParams();
    const navigate = useNavigate();
    const [committee, setCommittee] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Pagination
    const entriesPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

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
        
        const truncatedLocation = location.length > 30 ? location.substring(0, 30) + '...' : location;
        
        if (isValidUrl(location)) {
            return (
                <a 
                    href={location} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title={location}
                >
                    {truncatedLocation}
                </a>
            );
        }
        
        return (
            <span title={location}>
                {truncatedLocation}
            </span>
        );
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
                    <button onClick={() => navigate('/teacher/committees')} className="mt-4 text-blue-600 hover:underline">
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
                        onClick={() => navigate('/teacher/committees')}
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
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
                            {committee.members && committee.members.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="table-header">
                                            <tr>
                                                <th className="table-th text-center">Name</th>
                                                <th className="table-th text-center">Designation</th>
                                                <th className="table-th text-center">Role</th>
                                                <th className="table-th text-center">Type</th>
                                                <th className="table-th text-center">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {committee.members.map((member, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="table-td text-center">{member.member_name || member.memberName}</td>
                                                    <td className="table-td text-center">{member.designation || '-'}</td>
                                                    <td className="table-td text-center">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                            {member.member_type || member.memberType}
                                                        </span>
                                                    </td>
                                                    <td className="table-td text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.member_category === 'INTERNAL' || member.memberCategory === 'INTERNAL'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {member.member_category || member.memberCategory}
                                                        </span>
                                                    </td>
                                                    <td className="table-td text-center">{member.email_id || member.emailId || '-'}</td>
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

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4 mt-6">
                            {committee.members && committee.members.length > 0 ? (
                                committee.members.map((member, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{member.member_name || member.memberName}</p>
                                                <p className="text-sm text-gray-500">{member.designation || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div><span className="font-medium">Role:</span> 
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold ml-1">
                                                        {member.member_type || member.memberType}
                                                    </span>
                                                </div>
                                                <div><span className="font-medium">Type:</span> 
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-1 ${member.member_category === 'INTERNAL' || member.memberCategory === 'INTERNAL'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {member.member_category || member.memberCategory}
                                                    </span>
                                                </div>
                                                <div className="col-span-2"><span className="font-medium">Contact:</span> {member.email_id || member.emailId || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                                    <div className="text-gray-500">
                                        <p className="text-lg font-medium mb-2">No members found</p>
                                        <p className="text-sm">No members in this committee yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Meetings Tab */}
                {activeTab === 'meetings' && (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
                            {meetings.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="table-header">
                                                <tr>
                                                    <th className="table-th text-center">Meeting</th>
                                                    <th className="table-th text-center">Date & Time</th>
                                                    <th className="table-th text-center">Location</th>
                                                    <th className="table-th text-center">Status</th>
                                                    <th className="table-th text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {paginatedMeetings.currentEntries.map((meeting) => (
                                                    <tr key={meeting.meeting_id || meeting.meetingId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="table-td text-center">
                                                            <div className="font-semibold text-gray-800">{meeting.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{meeting.description || 'No description'}</div>
                                                        </td>
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
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No meetings scheduled yet</p>
                                </div>
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
                                                <p className="text-sm text-gray-500">{meeting.description || 'No description'}</p>
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
