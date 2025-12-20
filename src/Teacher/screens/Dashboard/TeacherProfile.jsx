// src/Teacher/Dashboard/TeacherProfile.jsx
import React, { useState } from "react";
import {
  X,
  Calendar,
  User,
  MessageCircle,
  Briefcase,
  BookOpen,
  Lock,
  Link2,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherProfile() {
  const [activeTab, setActiveTab] = useState("1"); // My Attendance by default

  // ---------- STATIC MOCK DATA ----------
  const teacher = {
    firstname: "Shravan",
    lastname: "Teacher",
    mobile: "1234567890",
    email: "shravansharma@gmail.com",
    avatar: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
    blood_group: "O+",
    date_of_birth: "15/05/1990",
    gender: "Male",
    marital_status: "Single",
    father_name: "Mr. ABC",
    spouse_name: "---",
    designation: "Senior Teacher",
    aadhar_number: "1234-5678-9012",
    pan_number: "ABCDE1234F",
    uan_number: "123456789012",
    employee_id: "EMP002",
    date_of_joining: "10/01/2023",
    financial_year: "2024-25",
    bank_name: "HDFC Bank",
    bank_account_no: "1234567890",
    ifsc_code: "HDFC0001234",
    cost_to_company: "₹6,00,000",
    deduction: "₹50,000",
    net_pay: "₹5,50,000",
    address_line1: "123, MG Road",
    address_line2: "Near City Center",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400001",
    phone: "9876543210",
    connect_link: "https://meet.google.com/abc-def-ghi",
    reports_access: true,
    username: "teacher002",
    employments: [],
    qualifications: [],
  };

  // ---------- RE-USABLE CARD ----------
  const Card = ({ label, value }) => {
    const cleanLabel = label.replace(/\*$/, "");
    const hasAsterisk = label.endsWith("*");
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <p
          className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1 ${
            hasAsterisk ? "text-gray-600" : "text-gray-500"
          }`}
        >
          {cleanLabel}
          {hasAsterisk && <span className="text-red-600">*</span>}
        </p>
        <p className="font-semibold text-gray-800 text-lg">{value}</p>
      </div>
    );
  };

  // ---------- 8 TABS IN REQUIRED ORDER ----------
  const tabs = [
    { k: "1", l: "My Attendance", icon: Calendar },
    { k: "2", l: "Personal", icon: User },
    { k: "3", l: "Communication", icon: MessageCircle },
    { k: "4", l: "Employment History", icon: Briefcase },
    { k: "5", l: "Qualification", icon: BookOpen },
    { k: "6", l: "Password", icon: Lock },
    { k: "7", l: "Meeting Link", icon: Link2 },
    { k: "8", l: "Know My Class", icon: Users },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Link to="/teacher">
            <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              <X className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={teacher.avatar}
            alt="Teacher"
            className="w-24 h-24 rounded-full border-4 border-blue-100 mx-auto mb-3 object-cover shadow-md"
          />
          <h3 className="text-2xl font-bold text-blue-700">
            {teacher.firstname} {teacher.lastname}
          </h3>
          <div className="flex items-center justify-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-blue-700" />
              <span className="text-black">{teacher.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-blue-700" />
              <span className="text-black">{teacher.mobile}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <ul className="flex gap-2 text-sm font-medium text-gray-500 whitespace-nowrap">
            {tabs.map((t, i) => {
              const Icon = t.icon;
              const isActive = activeTab === t.k;
              return (
                <li key={t.k}>
                  <button
                    onClick={() => setActiveTab(t.k)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 rounded-t-lg transition-all ${
                      isActive
                        ? "text-blue-600 border-blue-600"
                        : "border-transparent hover:text-gray-700"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span>{t.l}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">

            {/* TAB 1: My Attendance - FULL WIDTH CALENDAR */}
            {activeTab === "1" && (
              <div className="">
                <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      November / 2025
                    </h2>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="text-right text-sm text-gray-600 mb-6">
                    Total 0 Days | Present 0 Days
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-blue-700 mb-3">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {/* Row 1 */}
                    {[27, 28, 29, 30, 31, 1, 2].map((d) => (
                      <div
                        key={`row1-${d}`}
                        className="p-3 md:p-4 rounded-xl bg-gray-50 text-gray-700 text-center font-medium"
                      >
                        {d}
                      </div>
                    ))}

                    {/* Row 2 */}
                    {[3, 4, 5, 6, 7, 8, 9].map((d) => (
                      <div
                        key={`row2-${d}`}
                        className="p-3 md:p-4 rounded-xl bg-gray-50 text-gray-700 text-center font-medium"
                      >
                        {d}
                      </div>
                    ))}

                    {/* Row 3 */}
                    {[10, 11, 12, 13, 14, 15, 16].map((d) => (
                      <div
                        key={`row3-${d}`}
                        className="p-3 md:p-4 rounded-xl bg-gray-50 text-gray-700 text-center font-medium"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Personal */}
            {activeTab === "2" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card label="First Name *" value={teacher.firstname} />
                <Card label="Last Name *" value={teacher.lastname} />
                <Card label="Mobile *" value={teacher.mobile} />
                <Card label="Email *" value={teacher.email} />
                <Card label="Blood Group" value={teacher.blood_group} />
                <Card label="Date of Birth" value={teacher.date_of_birth} />
                <Card label="Gender *" value={teacher.gender} />
                <Card label="Marital Status" value={teacher.marital_status} />
                <Card label="Father Name" value={teacher.father_name} />
                <Card label="Spouse Name" value={teacher.spouse_name} />
                <Card label="Designation" value={teacher.designation} />
                <Card label="Aadhaar Number" value={teacher.aadhar_number} />
                <Card label="PAN Number" value={teacher.pan_number} />
                <Card label="UAN Number" value={teacher.uan_number} />
                <Card label="Employee ID *" value={teacher.employee_id} />
                <Card label="Date of Joining *" value={teacher.date_of_joining} />
                <Card label="Financial Year" value={teacher.financial_year} />
                <Card label="Bank Name" value={teacher.bank_name} />
                <Card label="Bank Account No." value={teacher.bank_account_no} />
                <Card label="IFSC Code" value={teacher.ifsc_code} />
                <Card label="Cost to Company" value={teacher.cost_to_company} />
                <Card label="Deduction" value={teacher.deduction} />
                <Card label="Net Pay" value={teacher.net_pay} />
              </div>
            )}

            {/* TAB 3: Communication */}
            {activeTab === "3" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card label="Address Line 1" value={teacher.address_line1} />
                <Card label="Address Line 2" value={teacher.address_line2} />
                <Card label="City" value={teacher.city} />
                <Card label="State" value={teacher.state} />
                <Card label="Country" value={teacher.country} />
                <Card label="Pincode" value={teacher.pincode} />
                <Card label="Phone" value={teacher.phone} />
                <Card
                  label="Connect Link"
                  value={
                    <a
                      href={teacher.connect_link}
                      className="text-blue-600 underline break-all"
                    >
                      {teacher.connect_link}
                    </a>
                  }
                />
                <Card
                  label="Reports Access"
                  value={teacher.reports_access ? "Yes" : "No"}
                />
              </div>
            )}

            {/* TAB 4: Employment History */}
            {activeTab === "4" && (
              <div className="py-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Employment History
                </h3>
                <p className="text-gray-500">No records to display.</p>
              </div>
            )}

            {/* TAB 5: Qualification */}
            {activeTab === "5" && (
              <div className="py-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Qualification
                </h3>
                <p className="text-gray-500">No records to display.</p>
              </div>
            )}

            {/* TAB 6: Password */}
            {activeTab === "6" && (
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password: <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••"
                    />
                    <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password: <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password: <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <button className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: Meeting Link */}
            {activeTab === "7" && (
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Meeting Link here: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="text-center">
                  <button className="px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* TAB 8: Know My Class */}
            {activeTab === "8" && (
              <div className="space-y-4">
                {[
                  "Testing Grade - S1 - A",
                  "Testing Grade - S1 - B",
                  "My Grade - Semester I - Morning Shift",
                  "Testing Grade - S5 - EnTC",
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800">{cls}</span>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}