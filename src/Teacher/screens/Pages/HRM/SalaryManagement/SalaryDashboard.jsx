import React, { useState } from 'react';
import { Edit, Trash2, Eye, MoreVertical, X, Mail, Calendar, CreditCard, FileText, Download, FileEdit, CheckCircle, XCircle, Info } from 'lucide-react';

export default function SalaryDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const entriesPerPage = 5;

  // Updated employee data with all columns
  const employees = [
    {
      id: 1,
      empId: "EMP001",
      name: "John Smith",
      email: "john.smith@company.com",
      designation: "Senior Software Engineer",
      department: "Engineering",
      financialYear: "2024-2025",
      costToCompany: "₹1,20,000",
      deduction: "₹15,000",
      netPay: "₹1,05,000",
      status: "Active"
    },
    {
      id: 2,
      empId: "EMP002",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      designation: "Product Manager",
      department: "Product",
      financialYear: "2024-2025",
      costToCompany: "₹1,35,000",
      deduction: "₹20,000",
      netPay: "₹1,15,000",
      status: "Active"
    },
    {
      id: 3,
      empId: "EMP003",
      name: "Michael Chen",
      email: "michael.chen@company.com",
      designation: "UX Designer",
      department: "Design",
      financialYear: "2024-2025",
      costToCompany: "₹1,05,000",
      deduction: "₹12,000",
      netPay: "₹93,000",
      status: "Active"
    },
    {
      id: 4,
      empId: "EMP004",
      name: "Emily Davis",
      email: "emily.davis@company.com",
      designation: "Marketing Specialist",
      department: "Marketing",
      financialYear: "2024-2025",
      costToCompany: "₹95,000",
      deduction: "₹10,000",
      netPay: "₹85,000",
      status: "Inactive"
    },
    {
      id: 5,
      empId: "EMP005",
      name: "Robert Wilson",
      email: "robert.w@company.com",
      designation: "DevOps Engineer",
      department: "Engineering",
      financialYear: "2024-2025",
      costToCompany: "₹1,30,000",
      deduction: "₹18,000",
      netPay: "₹1,12,000",
      status: "Active"
    },
    {
      id: 6,
      empId: "EMP006",
      name: "Lisa Anderson",
      email: "lisa.a@company.com",
      designation: "HR Manager",
      department: "Human Resources",
      financialYear: "2024-2025",
      costToCompany: "₹1,15,000",
      deduction: "₹15,000",
      netPay: "₹1,00,000",
      status: "Active"
    },
    {
      id: 7,
      empId: "EMP007",
      name: "David Miller",
      email: "david.m@company.com",
      designation: "Sales Executive",
      department: "Sales",
      financialYear: "2024-2025",
      costToCompany: "₹90,000",
      deduction: "₹8,000",
      netPay: "₹82,000",
      status: "Active"
    },
    {
      id: 8,
      empId: "EMP008",
      name: "Priya Sharma",
      email: "priya.sharma@company.com",
      designation: "Finance Analyst",
      department: "Finance",
      financialYear: "2024-2025",
      costToCompany: "₹1,10,000",
      deduction: "₹12,000",
      netPay: "₹98,000",
      status: "Active"
    },
    {
      id: 9,
      empId: "EMP009",
      name: "Amit Kumar",
      email: "amit.kumar@company.com",
      designation: "QA Engineer",
      department: "Engineering",
      financialYear: "2024-2025",
      costToCompany: "₹85,000",
      deduction: "₹7,000",
      netPay: "₹78,000",
      status: "Active"
    },
    {
      id: 10,
      empId: "EMP010",
      name: "Sophia Williams",
      email: "sophia.w@company.com",
      designation: "Content Writer",
      department: "Marketing",
      financialYear: "2024-2025",
      costToCompany: "₹75,000",
      deduction: "₹6,000",
      netPay: "₹69,000",
      status: "Active"
    }
  ];

  // Payslip data
  const payslipData = [
    {
      id: 1,
      fromDate: "19/06/2025",
      toDate: "19/06/2025",
      salary: "₹ 5000",
      deduction: "₹ 200",
      netSalary: "₹ 4800",
      status: "Unpaid"
    },
    {
      id: 2,
      fromDate: "19/06/2025",
      toDate: "19/06/2025",
      salary: "₹ 5000",
      deduction: "₹ 1000",
      netSalary: "₹ 4000",
      status: "Paid"
    },
    {
      id: 3,
      fromDate: "19/06/2025",
      toDate: "19/06/2025",
      salary: "₹ 5000",
      deduction: "₹ 1998",
      netSalary: "₹ 3002",
      status: "Unpaid"
    },
    {
      id: 4,
      fromDate: "16/06/2025",
      toDate: "26/06/2025",
      salary: "₹ 5005",
      deduction: "₹ 500",
      netSalary: "₹ 4505",
      status: "Paid"
    }
  ];

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = employees.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(employees.length / entriesPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleEdit = (id) => {
    console.log('Edit employee with id:', id);
    alert(`Edit employee ${id} clicked`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      console.log('Delete employee with id:', id);
      alert(`Delete employee ${id} clicked`);
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowPayslip(false);
    setIsModalOpen(true);
  };

  const handleViewPayslip = (employee) => {
    setSelectedEmployee(employee);
    setShowPayslip(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setShowPayslip(false);
  };

  const handlePayslipView = () => {
    setShowPayslip(true);
  };

  const handleBackToDetails = () => {
    setShowPayslip(false);
  };

  const handleEditPayslip = (payslipId) => {
    console.log('Edit payslip:', payslipId);
    alert(`Edit payslip ${payslipId} clicked`);
  };

  const handleDownloadPayslip = (payslipId) => {
    console.log('Download payslip:', payslipId);
    alert(`Download payslip ${payslipId} clicked`);
    
    const link = document.createElement('a');
    link.href = '#';
    link.download = `payslip-${selectedEmployee?.empId}-${payslipId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage employee salary records and payroll</h1>
        <p className="text-gray-600">View and manage all employee salary details in one place</p>
      </div>

      {/* Table Section with Horizontal Scroll */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Scrollable Container with horizontal scrollbar */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="min-w-[1400px]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap sticky left-0 bg-blue-600">Emp ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap sticky left-16 bg-blue-600">Emp Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Email ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Designation</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Financial Year</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Cost to Company</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Deduction</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Net Pay</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-blue-600">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntries.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap sticky left-0 bg-white">
                      {employee.empId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap sticky left-16 bg-white">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-blue-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {employee.financialYear}
                    </td>
                    
                    {/* Cost to Company with Blur Effect */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group inline-block">
                        <div className="text-sm font-bold flex items-center">
                          <span className="blur-sm group-hover:blur-none transition-all duration-200 text-blue-700">
                            {employee.costToCompany}
                          </span>
                          <Info className="w-3 h-3 ml-1 text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-3 rounded-lg text-xs w-64 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 shadow-lg">
                          <div className="font-semibold mb-1">Cost to Company (CTC)</div>
                          <div className="text-gray-300">Total annual cost incurred by company including salary, bonuses, allowances, benefits, and other expenses for this employee.</div>
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="font-medium">Actual Amount:</div>
                            <div className="text-green-300 font-bold">{employee.costToCompany}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Deduction with Blur Effect */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group inline-block">
                        <div className="text-sm font-semibold flex items-center">
                          <span className="blur-sm group-hover:blur-none transition-all duration-200 text-red-600">
                            {employee.deduction}
                          </span>
                          <Info className="w-3 h-3 ml-1 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-3 rounded-lg text-xs w-64 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 shadow-lg">
                          <div className="font-semibold mb-1">Total Deductions</div>
                          <div className="text-gray-300">Sum of all deductions including income tax, professional tax, provident fund (PF), employee insurance, loans, and other statutory deductions.</div>
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="font-medium">Actual Amount:</div>
                            <div className="text-red-300 font-bold">{employee.deduction}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Net Pay with Blur Effect */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative group inline-block">
                        <div className="text-sm font-bold flex items-center">
                          <span className="blur-sm group-hover:blur-none transition-all duration-200 text-green-700">
                            {employee.netPay}
                          </span>
                          <Info className="w-3 h-3 ml-1 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-3 rounded-lg text-xs w-64 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 shadow-lg">
                          <div className="font-semibold mb-1">Net Pay (Take Home)</div>
                          <div className="text-gray-300">Actual amount received by employee after all deductions. Calculated as: Cost to Company - Total Deductions.</div>
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="font-medium">Actual Amount:</div>
                            <div className="text-green-300 font-bold">{employee.netPay}</div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status === 'Active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(employee)}
                          className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="p-1.5 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewPayslip(employee)}
                          className="p-1.5 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                          title="View Payslip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {employees.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm rounded-md flex items-center ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm rounded-md flex items-center ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {showPayslip ? 'Payslip Details' : 'Employee Details'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {showPayslip ? 'Complete payslip history' : 'Basic information about employee'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!showPayslip ? (
                <>
                  {/* Employee Basic Information */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-xl font-bold text-blue-600">
                          {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedEmployee.name}</h3>
                        <p className="text-gray-600">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Basic Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee ID</span>
                          <span className="font-medium">{selectedEmployee.empId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email Address</span>
                          <span className="font-medium flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {selectedEmployee.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joining Date</span>
                          <span className="font-medium flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            2023-01-15
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience</span>
                          <span className="font-medium">2 years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost to Company</span>
                          <span className="font-bold text-blue-700">{selectedEmployee.costToCompany}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Salary</span>
                          <span className="font-medium">₹ 85,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Payslip Button */}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handlePayslipView}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        View Payslip Details
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Payslip Table */
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <button
                      onClick={handleBackToDetails}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Employee Details
                    </button>
                    <div className="text-right">
                      <p className="font-medium">{selectedEmployee.name}</p>
                      <p className="text-sm text-gray-600">{selectedEmployee.empId}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">From Date</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">To Date</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Salary</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Deduction</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Net Salary</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payslipData.map((payslip) => (
                            <tr key={payslip.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{payslip.fromDate}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{payslip.toDate}</td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payslip.salary}</td>
                              <td className="px-6 py-4 text-sm text-red-600">{payslip.deduction}</td>
                              <td className="px-6 py-4 text-sm font-bold text-green-700">{payslip.netSalary}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  payslip.status === 'Paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {payslip.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditPayslip(payslip.id)}
                                    className="p-1.5 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                    title="Edit Payslip"
                                  >
                                    <FileEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPayslip(payslip.id)}
                                    className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                    title="Download Payslip"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Total Salary</p>
                        <p className="text-lg font-bold text-gray-800">₹ 20,005</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Total Deductions</p>
                        <p className="text-lg font-bold text-red-600">₹ 3,698</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-sm text-gray-600">Total Net Salary</p>
                        <p className="text-lg font-bold text-green-700">₹ 16,307</p>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                      <FileEdit className="w-4 h-4 inline mr-2" />
                      Edit Multiple
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <Download className="w-4 h-4 inline mr-2" />
                      Download All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}