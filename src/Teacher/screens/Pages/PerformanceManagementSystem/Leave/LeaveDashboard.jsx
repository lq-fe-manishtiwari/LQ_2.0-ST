'use client';
import { useNavigate } from "react-router-dom";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    Trash2,
    User,
    Plus,
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import Loader from '../Components/Loader';

// Custom Select Component (keep the same as your original)
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        onChange({ target: { value: option } });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <div
                    className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                        {value || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => handleSelect('')}
                        >
                            {placeholder}
                        </div>
                        {options.map(option => (
                            <div
                                key={option}
                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// LeavesTable Component (keep the same as your original)
const LeavesTable = ({
    tasks = [],
    selectedTask,
    onTaskSelect,
    onToggleActive,
    onView,
    onEdit,
    onDelete,
    onShowDetails,
    currentPage = 0,
    entriesPerPage = 10,
    onPageChange,
    loading = false,
    totalTasks = 0,
    totalPages = 0,
    statusChanging = {},
}) => {
    const displayPage = currentPage + 1;
    const indexOfFirst = currentPage * entriesPerPage;
    const indexOfLast = Math.min(indexOfFirst + entriesPerPage, totalTasks);

    const handlePrev = () => displayPage > 1 && onPageChange(currentPage - 1);
    const handleNext = () => displayPage < totalPages && onPageChange(currentPage + 1);

    const isNextDisabled = totalTasks <= entriesPerPage || displayPage >= totalPages;

    return (
        <>
            <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Form Date</th>
                                <th className="table-th">To Date</th>
                                <th className="table-th">Name</th>
                                <th className="table-th">Leave Type</th>
                                <th className="table-th">Subject</th>
                                <th className="table-th table-cell-center">Leave Days</th>
                                <th className="table-th table-cell-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="table-td text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader size="lg" className="mb-4" />
                                            <p className="text-gray-500">Loading leaves...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="table-td text-center py-12">
                                        <div className="text-gray-500">
                                            <p className="text-lg font-medium mb-2">No leaves found</p>
                                            <p className="text-sm">
                                                No leaves found. Try adjusting the filters or contact support if the
                                                issue persists.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="table-td">{task.formDate}</td>
                                        <td className="table-td">{task.toDate}</td>
                                        <td className="table-td">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-semibold text-gray-900 whitespace-nowrap">{task.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-td">{task.leaveType}</td>
                                        <td className="table-td">{task.subject}</td>
                                        <td className="table-td text-center">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {task.leaveDays} days
                                            </span>
                                        </td>
                                        <td className="table-td text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onView(task)}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(task)}
                                                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(task.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalTasks > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
                        <button
                            onClick={handlePrev}
                            disabled={displayPage === 1}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${displayPage === 1
                                ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            Previous
                        </button>

                        <span className="text-sm font-medium text-gray-700">
                            Showing <strong>{indexOfFirst + 1}</strong>–<strong>{indexOfLast}</strong> of <strong>{totalTasks}</strong> entries
                        </span>

                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${isNextDisabled
                                ? 'bg-blue-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile view remains the same */}
            <div className="lg:hidden space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                        <div className="flex flex-col items-center justify-center">
                            <Loader size="lg" className="mb-4" />
                            <p className="text-gray-500">Loading leaves...</p>
                        </div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                        <div className="text-gray-500">
                            <p className="text-lg font-medium mb-2">No leaves found</p>
                            <p className="text-sm">
                                No leaves found. Try adjusting the filters or contact support if the issue
                                persists.
                            </p>
                        </div>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <User className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900">{task.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-700 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="font-medium">From:</span> {task.formDate}</div>
                                    <div><span className="font-medium">To:</span> {task.toDate}</div>
                                    <div><span className="font-medium">Type:</span> {task.leaveType}</div>
                                    <div><span className="font-medium">Days:</span> {task.leaveDays}</div>
                                    <div className="col-span-2">
                                        <span className="font-medium">Subject:</span> {task.subject}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onView(task)}
                                        className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

// Main Leaves Component
export default function Leaves() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([
        {
            id: "L001",
            name: "Manish Tiwari",
            formDate: "15-09-2025",
            toDate: "20-09-2025",
            leaveType: "Casual Leave",
            subject: "Family Function",
            leaveDays: "5",
            status: "Pending"
        },
        {
            id: "L002",
            name: "Utkarsh Sharma",
            formDate: "18-09-2025",
            toDate: "19-09-2025",
            leaveType: "Sick Leave",
            subject: "Medical Appointment",
            leaveDays: "2",
            status: "Approved"
        },
        {
            id: "L003",
            name: "Brajesh Kumar",
            formDate: "25-09-2025",
            toDate: "30-09-2025",
            leaveType: "Earned Leave",
            subject: "Vacation",
            leaveDays: "6",
            status: "Pending"
        }
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusChanging, setStatusChanging] = useState({});
    const [filters, setFilters] = useState({
        filterOpen: false,
        name: '',
        view: '',
        year: '',
        month: '',
        week: '',
        fromDate: '',
        toDate: '',
        activeSubTab: ''
    });
    const [mobileTabStart, setMobileTabStart] = useState(0);

    const [passwordAlert, setPasswordAlert] = useState(false);
    const [password, setPassword] = useState('');
    const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
    const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
    const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
    const [showStatusErrorAlert, setShowStatusErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const entriesPerPage = 10;

    const names = ['Utkarsh', 'Brajesh', 'Manish Tiwari'];
    const years = ['2022', '2023', '2024', '2025'];
    const monthTabs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getWeekOptions = (year, month) => {
        if (!year || !month) return [];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month);
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const weeks = Math.ceil(daysInMonth / 7);
        return Array.from({ length: weeks }, (_, i) => `Week ${i + 1}`);
    };

    const getWeekTabs = (year, month, week) => {
        if (!year || !month || !week) return [];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.indexOf(month);
        const weekNumber = parseInt(week.split(' ')[1]);
        
        const startDay = (weekNumber - 1) * 7 + 1;
        const endDay = Math.min(weekNumber * 7, new Date(year, monthIndex + 1, 0).getDate());
        
        const days = [];
        for (let day = startDay; day <= endDay; day++) {
            const date = new Date(year, monthIndex, day);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[date.getDay()];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dayLabel = `${dayName}, ${day} ${months[monthIndex]}`;
            days.push({ label: dayLabel, date: new Date(date) });
        }
        return days;
    };

    const getPeriodTabs = (fromDate, toDate) => {
        if (!fromDate || !toDate) return [];
        
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const dates = [];
        
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const formatDate = (date) => {
                const d = String(date.getDate()).padStart(2, '0');
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const y = date.getFullYear();
                return `${d}-${m}-${y}`;
            };
            
            dates.push(formatDate(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const getSubTabs = () => {
        switch(filters.view) {
            case 'monthly': return monthTabs;
            case 'weekly': return getWeekTabs(parseInt(filters.year), filters.month, filters.week);
            case 'period': return getPeriodTabs(filters.fromDate, filters.toDate);
            default: return [];
        }
    };

    const handleViewChange = (view) => {
        const viewValue = view.toLowerCase();
        let subTabs;
        if (viewValue === 'monthly') {
            subTabs = monthTabs;
        } else if (viewValue === 'weekly') {
            subTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
        } else {
            subTabs = getPeriodTabs(filters.fromDate, filters.toDate);
        }
        const firstTab = Array.isArray(subTabs[0]) ? subTabs[0] : subTabs[0]?.label || subTabs[0];
        setFilters(prev => ({ ...prev, view: viewValue, activeSubTab: firstTab }));
    };

    const filteredTasks = useMemo(() => {
        let list = tasks;
        if (searchQuery) {
            list = list.filter(
                (task) =>
                    task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.subject.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return list;
    }, [tasks, searchQuery]);

    const paginatedTasks = useMemo(() => {
        const startIndex = currentPage * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        return filteredTasks.slice(startIndex, endIndex);
    }, [filteredTasks, currentPage, entriesPerPage]);

    const totalTasks = filteredTasks.length;
    const totalPages = Math.ceil(totalTasks / entriesPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleTaskSelect = (id) => {
        setSelectedTask(selectedTask === id ? null : id);
    };

    const handleToggleActive = (id) => {
        setStatusChanging(prev => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setStatusChanging(prev => ({ ...prev, [id]: false }));
        }, 1000);
    };

    const handleView = (task) => {
        navigate(`view-leave/${task.id}`);
    };

    const handleEdit = (task) => {
        navigate(`edit/${task.id}`);
    };

    const handleDelete = (id) => {
        setTaskToDelete(id);
        setShowAlert(true);
    };

    const handleConfirmDelete = () => {
        setShowAlert(false);
        setPasswordAlert(true);
    };

    const handleCancelDelete = () => {
        setShowAlert(false);
        setTaskToDelete(null);
    };

    const handlePasswordConfirm = () => {
        if (password === 'admin123') {
            setTimeout(() => {
                setPasswordAlert(false);
                setPassword('');
                setTaskToDelete(null);
                setAlertMessage('Leave application deleted successfully!');
                setShowDeleteSuccessAlert(true);
            }, 500);
        } else {
            setPasswordAlert(false);
            setPassword('');
            setAlertMessage('Incorrect password. Leave deletion failed.');
            setShowDeleteErrorAlert(true);
        }
    };

    const handleCancelPassword = () => {
        setPasswordAlert(false);
        setPassword('');
        setTaskToDelete(null);
    };

    const handleShowDetails = (task) => console.log('Show details:', task);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (filters.view === 'period' && filters.fromDate && filters.toDate) {
            const periodTabs = getPeriodTabs(filters.fromDate, filters.toDate);
            setFilters(prev => ({ ...prev, activeSubTab: periodTabs[0] }));
        }
    }, [filters.fromDate, filters.toDate, filters.view]);

    useEffect(() => {
        if (filters.view === 'weekly' && filters.week) {
            const weeklyTabs = getWeekTabs(parseInt(filters.year), filters.month, filters.week);
            const firstTab = weeklyTabs[0]?.label || weeklyTabs[0];
            setFilters(prev => ({ ...prev, activeSubTab: firstTab }));
        }
        setMobileTabStart(0);
    }, [filters.month, filters.year, filters.week, filters.view]);

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search for leaves"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
                    >
                        <Filter className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-medium">Filter</span>
                        <ChevronDown
                            className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`}
                        />
                    </button>

                    <button
                        onClick={() => navigate("add-leave")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="sm:inline">Add Leave</span>
                    </button>
                </div>
            </div>

            {filters.filterOpen && (
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <CustomSelect
                            label="Name"
                            value={filters.name}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            options={names}
                            placeholder="Select Name"
                        />

                        <CustomSelect
                            label="Select View"
                            value={filters.view}
                            onChange={(e) => handleViewChange(e.target.value)}
                            options={['Monthly', 'Weekly', 'Period']}
                            placeholder="Select View"
                        />

                        {filters.view === 'weekly' && (
                            <>
                                <CustomSelect
                                    label="Month"
                                    value={filters.month}
                                    onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, week: '' }))}
                                    options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
                                    placeholder="Select Month"
                                />
                                <CustomSelect
                                    label="Year"
                                    value={filters.year}
                                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, week: '' }))}
                                    options={years}
                                    placeholder="Select Year"
                                />
                                <CustomSelect
                                    label="Week"
                                    value={filters.week}
                                    onChange={(e) => setFilters(prev => ({ ...prev, week: e.target.value }))}
                                    options={getWeekOptions(parseInt(filters.year), filters.month)}
                                    placeholder="Select Week"
                                    disabled={!filters.month || !filters.year}
                                />
                            </>
                        )}

                        {filters.view === 'monthly' && (
                            <CustomSelect
                                label="Year"
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                options={years}
                                placeholder="Select Year"
                            />
                        )}

                        {filters.view === 'period' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        value={filters.fromDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[44px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        value={filters.toDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {filters.view && (
                        <div className="relative max-w-[920px] mx-auto">
                            <button
                                onClick={() => {
                                    const el = document.getElementById("tabsCarousel");
                                    el.scrollLeft -= 200;
                                }}
                                className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors p-2 z-20 bg-white rounded-full shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => {
                                    const el = document.getElementById("tabsCarousel");
                                    el.scrollLeft += 200;
                                }}
                                className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors p-2 z-20 bg-white rounded-full shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div
                                id="tabsCarousel"
                                className="hidden sm:flex space-x-2 overflow-x-auto whitespace-nowrap scroll-smooth px-12 py-2"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                <style>{`#tabsCarousel::-webkit-scrollbar { display: none; }`}</style>
                                {getSubTabs().map((tab, index) => {
                                    const tabLabel = typeof tab === 'object' ? tab.label : tab;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                                            className={`whitespace-nowrap text-center px-3 py-2 text-sm rounded-lg transition-colors flex-shrink-0 ${
                                                filters.activeSubTab === tabLabel 
                                                    ? "bg-blue-600 text-white" 
                                                    : "bg-white text-gray-700 shadow-md"
                                            }`}
                                        >
                                            {filters.view === 'monthly' && monthTabs.includes(tabLabel) 
                                                ? fullMonthNames[monthTabs.indexOf(tabLabel)] 
                                                : tabLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="sm:hidden relative">
                                {getSubTabs().length > 3 && (
                                    <>
                                        <button
                                            onClick={() => setMobileTabStart(Math.max(0, mobileTabStart - 1))}
                                            disabled={mobileTabStart === 0}
                                            className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${
                                                mobileTabStart === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                                            }`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setMobileTabStart(Math.min(getSubTabs().length - 3, mobileTabStart + 1))}
                                            disabled={mobileTabStart >= getSubTabs().length - 3}
                                            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 z-20 bg-white rounded-full shadow-sm transition-colors ${
                                                mobileTabStart >= getSubTabs().length - 3 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                                            }`}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                <div className="grid grid-cols-3 gap-2 px-8 py-2">
                                    {getSubTabs().slice(mobileTabStart, mobileTabStart + 3).map((tab, index) => {
                                        const tabLabel = typeof tab === 'object' ? tab.label : tab;
                                        return (
                                            <button
                                                key={mobileTabStart + index}
                                                onClick={() => setFilters(prev => ({ ...prev, activeSubTab: tabLabel }))}
                                                className={`text-center px-2 py-2 text-xs rounded-lg transition-colors ${
                                                    filters.activeSubTab === tabLabel 
                                                        ? "bg-blue-600 text-white" 
                                                        : "bg-white text-gray-700 shadow-md"
                                                }`}
                                            >
                                                {tabLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <LeavesTable
                tasks={paginatedTasks}
                selectedTask={selectedTask}
                onTaskSelect={handleTaskSelect}
                onToggleActive={handleToggleActive}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowDetails={handleShowDetails}
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                onPageChange={handlePageChange}
                totalTasks={totalTasks}
                totalPages={totalPages}
                statusChanging={statusChanging}
                loading={loading}
            />

            {/* Alerts remain the same */}
            {showAlert && (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                    title="Are you sure?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                >
                    Do you want to delete this Leave Application?
                </SweetAlert>
            )}

            {passwordAlert && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 sm:px-0">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md animate-fadeIn">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
                            Admin Verification Required
                        </h3>
                        <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
                            Enter your admin password to confirm deletion.
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handlePasswordConfirm();
                            }}
                            className="flex flex-col"
                        >
                            <input
                                type="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 text-center text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancelPassword}
                                    className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition text-sm sm:text-base"
                                >
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteSuccessAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setShowDeleteSuccessAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {showDeleteErrorAlert && (
                <SweetAlert
                    error
                    title="Error!"
                    onConfirm={() => setShowDeleteErrorAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {showStatusSuccessAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setShowStatusSuccessAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {showStatusErrorAlert && (
                <SweetAlert
                    error
                    title="Error!"
                    onConfirm={() => setShowStatusErrorAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {alertMessage}
                </SweetAlert>
            )}
        </div>
    );
}