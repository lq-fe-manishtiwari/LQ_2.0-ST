// import React from 'react'

// export default function ProfileDashboard() {
//   return (
//     <div>ProfileDashboard</div>
//   )
// }


import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { X, User, GraduationCap, MessageCircle, Bus, Mail, Phone } from "lucide-react";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("1");
  const [historyLoading, setHistoryLoading] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div>
        <div className="student-form-container">
          {/* Header */}
          <div className="page-header relative mb-4 sm:mb-6">
            <Link
              to="/student"
              className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:shadow-md"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border object-cover mb-3"
              />
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold m-0" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}>
                Student Name
              </h3>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">student@email.com</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" style={{ color: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }} />
                  <span className="text-black text-sm">+91 9876543210</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <ul className="flex flex-wrap -mb-px text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400 justify-center overflow-x-auto">
              {[
                { k: "1", l: "Personal", icon: User },
                { k: "2", l: "Educational", icon: GraduationCap },
                { k: "3", l: "Communication", icon: MessageCircle },
                { k: "4", l: "Transport", icon: Bus },
                { k: "5", l: "Academic Journey", icon: GraduationCap },
              ].map((t, index) => {
                const Icon = t.icon;
                const isActive = activeTab === t.k;
                return (
                  <li key={t.k} className="me-1 sm:me-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(t.k)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-3 border-b-2 rounded-t-lg transition-all duration-200 ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <Icon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span className="text-xs sm:text-base">{t.l}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-0 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="w-full space-y-8">
                {/* PERSONAL */}
                {activeTab === "1" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">First Name</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Middle Name</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Name</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Birth</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Admission</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Address</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                  </div>
                )}

                {/* EDUCATIONAL */}
                {activeTab === "2" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ABC ID</p>
                        <p className="font-semibold text-gray-800 text-lg">---</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">University Application Number</p>
                        <p className="font-semibold text-gray-800 text-lg">---</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Previous Qualifications</h3>
                      <div className="text-center py-8 text-gray-500">
                        No education details available
                      </div>
                    </div>
                  </div>
                )}

                {/* COMMUNICATION */}
                {activeTab === "3" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Primary Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary Mobile</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary Relation</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Father's Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father First Name</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father Last Name</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Father Mobile</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Mother's Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother First Name</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother Last Name</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mother Mobile</p>
                          <p className="font-semibold text-gray-800 text-lg">---</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRANSPORT */}
                {activeTab === "4" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mode of Transport</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bus Number</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bus Stop</p>
                      <p className="font-semibold text-gray-800 text-lg">---</p>
                    </div>
                  </div>
                )}

                {/* ACADEMIC JOURNEY */}
                {activeTab === "5" && (
                  <div className="space-y-6">
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 text-lg">No academic history available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
