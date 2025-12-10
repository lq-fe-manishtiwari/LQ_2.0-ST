import React, { useState, useEffect, useMemo, useRef } from "react";
import { CalendarDays, Plus, Filter, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from '../Components/Loader';

// Custom Select Components
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

export default function APIDashboard() {
  const [department, setDepartment] = useState("Digital Marketing");
  const [date, setDate] = useState("2025-05-23");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    activeInactiveStatus: 'all',
    filterOpen: false,
  });
  const navigate = useNavigate();

  const APIData = [
    {
      name: "Tejas Chaudhari",
      designation: "Graphic Designer",
      API: "All creatives of the year 2025 should be completed by April",
      frequency: "Quarterly",
      achievement: "2 month creative done",
      empInput: "-",
    },
    {
      name: "Rahul Sharma",
      designation: "Digital Marketer",
      API: "Increase social media engagement by 50%",
      frequency: "Monthly",
      achievement: "40% increase achieved",
      empInput: "Good progress",
    },
    {
      name: "Priya Patel",
      designation: "Content Writer",
      API: "Publish 50 articles per month",
      frequency: "Weekly",
      achievement: "45 articles published",
      empInput: "On track",
    },
  ];

  // Get unique designations and frequencies for filters
  const uniqueDesignations = useMemo(() => {
    const designations = APIData.map(item => item.designation);
    return ['all', ...new Set(designations)];
  }, [APIData]);

  const uniqueFrequencies = useMemo(() => {
    const frequencies = APIData.map(item => item.frequency);
    return ['all', ...new Set(frequencies)];
  }, [APIData]);

  /* ==================== PAGINATION & FILTERING ==================== */
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndPaginatedAPI = useMemo(() => {
    let list = APIData;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.designation.toLowerCase().includes(q) ||
          s.API.toLowerCase().includes(q) ||
          s.frequency.toLowerCase().includes(q) ||
          s.achievement.toLowerCase().includes(q) ||
          s.empInput.toLowerCase().includes(q)
      );
    }

    // Designation Filter
    if (designationFilter !== 'all') {
      list = list.filter((s) => s.designation === designationFilter);
    }

    // Frequency Filter
    if (frequencyFilter !== 'all') {
      list = list.filter((s) => s.frequency === frequencyFilter);
    }

    // Department Filter
    if (department !== 'all') {
      // You can add department-based filtering logic here if needed
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [APIData, searchQuery, currentPage, designationFilter, frequencyFilter, department]);

  const { currentEntries, totalEntries, totalPages, start, end } = filteredAndPaginatedAPI;

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  // Reset filters when filter panel closes
  useEffect(() => {
    if (!filters.filterOpen) {
      setDesignationFilter("all");
      setFrequencyFilter("all");
      setDepartment("Digital Marketing");
    }
  }, [filters.filterOpen]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search by name, designation, API, frequency..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>

          {/* Add API Button */}
          <button
            onClick={() => navigate("add-api")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="sm:inline">Add API</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            <CustomSelect
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={['Digital Marketing', 'HR', 'IT Department', 'Sales', 'All Departments']}
              placeholder="Select Department"
            />

            <CustomSelect
              label="Designation"
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              options={uniqueDesignations.map(designation => 
                designation === 'all' ? 'All Designations' : designation
              )}
              placeholder="Select Designation"
            />

            <CustomSelect
              label="Measurement Frequency"
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              options={uniqueFrequencies.map(frequency => 
                frequency === 'all' ? 'All Frequencies' : frequency
              )}
              placeholder="Select Frequency"
            />

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <div className="flex items-center bg-white border border-gray-300 px-3 py-2 rounded-lg w-full">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent outline-none w-full"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="table-header">
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">Designation</th>
              <th className="table-th">API</th>
              <th className="table-th">Measurement Frequency</th>
              <th className="table-th">Achievement</th>
              <th className="table-th">EMP Input</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader size="lg" className="mb-4" />
                    <p className="text-gray-500">Loading API data...</p>
                  </div>
                </td>
              </tr>
            ) : currentEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No API records found</p>
                    <p className="text-sm">
                      No API records found. Try adjusting the filters or contact support if the
                      issue persists.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentEntries.map((row, i) => (
                <tr key={i} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4">{row.name}</td>
                  <td className="py-3 px-4">{row.designation}</td>
                  <td className="py-3 px-4">{row.API}</td>
                  <td className="py-3 px-4">{row.frequency}</td>
                  <td className="py-3 px-4">{row.achievement}</td>
                  <td className="py-3 px-4">{row.empInput}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalEntries > 0 && (
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
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <Loader size="lg" className="mb-4" />
              <p className="text-gray-500">Loading API data...</p>
            </div>
          </div>
        ) : currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No API records found</p>
              <p className="text-sm">
                No API records found. Try adjusting the filters or contact support if the issue
                persists.
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((row, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="space-y-3">
                {/* Name and Designation */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{row.name}</h3>
                    <p className="text-sm text-gray-600">{row.designation}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {row.frequency}
                  </span>
                </div>

                {/* API */}
                <div>
                  <label className="text-xs font-medium text-gray-500">API</label>
                  <p className="text-sm text-gray-800 mt-1">{row.API}</p>
                </div>

                {/* Achievement and EMP Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Achievement</label>
                    <p className="text-sm text-gray-800 mt-1">{row.achievement}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">EMP Input</label>
                    <p className="text-sm text-gray-800 mt-1">{row.empInput}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Empty State */}
      {totalEntries === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600">No API records found.</p>
        </div>
      )}
    </div>
  );
}