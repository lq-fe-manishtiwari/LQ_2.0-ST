import React from "react";
import { GraduationCap } from "lucide-react";
import moment from "moment";

const StudentAcademicJourney = ({ studentData, historyLoading, enrichedHistory = [] }) => {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 text-indigo-500 mr-2" />
          Academic History
        </h3>

        {historyLoading ? (
          <div className="bg-gray-50 p-12 rounded-lg border flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
          </div>
        ) : enrichedHistory.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-lg border text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">No academic history available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-blue-200"></div>
            <div className="space-y-6 sm:space-y-8">
              {enrichedHistory.map((record, index) => (
                <div key={index} className="relative pl-10 sm:pl-16">
                  {/* Timeline circle */}
                  <div className="absolute left-0 sm:left-3 top-2 sm:top-3 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{enrichedHistory.length - index}</span>
                  </div>
                  
                  {/* Card */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <h4 className="text-base sm:text-lg font-bold text-gray-800 break-words">
                            {record.class_name || "Class"}
                          </h4>
                          {record.is_active && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {record.academic_year_name || "Academic Year"} • {record.semester_name || "Semester"}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Timeline</p>
                        <p className="text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                          {index === 0 ? "Most Recent" : `Step ${enrichedHistory.length - index}`}
                        </p>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Batch</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.batch_name || "---"}</p>
                      </div>
                      <div className="bg-purple-50 p-2.5 sm:p-3 rounded-lg border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Division</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.division_name || "---"}</p>
                      </div>
                      <div className="bg-green-50 p-2.5 sm:p-3 rounded-lg border border-green-100">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Roll Number</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm break-words">{record.roll_number || "---"}</p>
                      </div>
                      <div className="bg-orange-50 p-2.5 sm:p-3 rounded-lg border border-orange-100">
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Status</p>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm capitalize">{record.is_active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>

                    {/* Timeline Events */}
                    {(record.allocated_at || record.promoted_at || record.deallocated_at) && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timeline Events</p>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                          {record.allocated_at && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                              <span className="text-gray-600 whitespace-nowrap">Allocated:</span>
                              <span className="font-semibold text-gray-800">
                                {moment.unix(record.allocated_at).format("DD/MM/YYYY")}
                              </span>
                            </div>
                          )}
                          {record.promoted_at && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                              <span className="text-gray-600 whitespace-nowrap">Promoted:</span>
                              <span className="font-semibold text-gray-800">
                                {moment.unix(record.promoted_at).format("DD/MM/YYYY")}
                              </span>
                            </div>
                          )}
                          {record.deallocated_at && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                              <span className="text-gray-600 whitespace-nowrap">Deallocated:</span>
                              <span className="font-semibold text-gray-800">
                                {moment.unix(record.deallocated_at).format("DD/MM/YYYY")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAcademicJourney;
