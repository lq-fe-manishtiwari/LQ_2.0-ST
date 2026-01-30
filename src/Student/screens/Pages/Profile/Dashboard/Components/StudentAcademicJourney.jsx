import React, { useEffect, useState } from "react";
import { GraduationCap, History } from "lucide-react";
import moment from "moment";
import { StudentService } from "../../Student.Service";
import { useUserProfile } from "@/contexts/UserProfileContext";

const StudentAcademicJourney = ({ studentData, historyLoading, enrichedHistory = [] }) => {
  const { userProfile } = useUserProfile();
  const [historyLoadingLocal, setHistoryLoadingLocal] = useState(false);
  const [localHistory, setLocalHistory] = useState([]);

  const historyLoadingEffective = historyLoading !== undefined ? historyLoading : historyLoadingLocal;
  const enrichedHistoryEffective = (enrichedHistory && enrichedHistory.length) ? enrichedHistory : localHistory;

  useEffect(() => {
    // Priority: userProfile context > studentData prop > localStorage fallback
    let studentId = userProfile?.student_id || studentData?.student_id;

    if (!studentId) {
      try {
        const userState = localStorage.getItem('user');
        if (userState) {
          const userData = JSON.parse(userState);
          studentId = userData.student_id || userData.id;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Could not parse user from localStorage", e);
      }
    }

    if (!studentId) {
      setLocalHistory([]);
      return;
    }

    setHistoryLoadingLocal(true);
    StudentService.getStudentHistoryWithoutactive(studentId)
      .then((res) => {
        // eslint-disable-next-line no-console
        console.log("Student history response:", res);

        let rawData = [];
        if (Array.isArray(res)) {
          rawData = res;
        } else if (res && Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res && typeof res === "object") {
          rawData = res.history || res.records || [];
        }

        const toTimestamp = (v) => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'number') return v;
          // if already a numeric string
          if (!Number.isNaN(Number(v)) && v.toString().trim() !== '') return Number(v);
          // try ISO/date string
          const parsed = Date.parse(v);
          return isNaN(parsed) ? null : Math.floor(parsed / 1000);
        };

        const mappedData = rawData.map((item) => ({
          ...item,
          // ids & basic
          id: item.id ?? item.student_history_id ?? null,
          student_id: item.student_id ?? null,
          student_name: item.student_name ?? item.name ?? null,
          roll_number: item.roll_number ?? item.rollNo ?? item.roll ?? null,
          is_active: typeof item.is_active === 'boolean' ? item.is_active : !!item.active,

          // flattened labels for UI (with fallbacks)
          class_name: item.class_name
            ?? item.academic_year?.program?.program_name
            ?? item.academic_year?.class_year?.name
            ?? (item.academic_year?.year_number ? `Year ${item.academic_year.year_number}` : null),
          academic_year_name: item.academic_year?.name ?? item.academic_year_name ?? null,
          semester_name: item.semester?.name ?? item.semester_name ?? null,
          batch_name: item.academic_year?.batch?.batch_name ?? item.academic_year?.batch?.batch_code ?? null,
          division_name: item.division?.division_name ?? item.division?.name ?? item.division_name ?? null,

          // timeline timestamps: prefer explicit fields, else try related dates
          allocated_at: toTimestamp(item.allocated_at ?? item.allocatedAt ?? item.allocation_at ?? item.academic_year?.start_date ?? null),
          promoted_at: toTimestamp(item.promoted_at ?? item.promotedAt ?? item.promotion_at ?? null),
          deallocated_at: toTimestamp(item.deallocated_at ?? item.deallocatedAt ?? item.deallocation_at ?? null),

          _raw: item,
        }));

        setLocalHistory(mappedData);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error fetching student history:", err);
        setLocalHistory([]);
      })
      .finally(() => setHistoryLoadingLocal(false));
  }, [studentData?.student_id, userProfile?.student_id]);

  return (
    <div className="space-y-10">
      {/* Timeline section remains the same */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 text-indigo-500 mr-2" />
          Academic History
        </h3>

        {historyLoadingEffective ? (
          <div className="bg-gray-50 p-12 rounded-lg border flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
          </div>
        ) : enrichedHistoryEffective.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-lg border text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">No academic history available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-blue-200"></div>
            <div className="space-y-6 sm:space-y-8 relative">
              {enrichedHistoryEffective.map((record, index) => (
                <div key={index} className="relative pl-10 sm:pl-16">
                  {/* Timeline circle */}
                  <div className="absolute left-0 sm:left-3 top-2 sm:top-3 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center z-10">
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
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Batch</p>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm break-words">{record.batch_name || "---"}</p>
                      </div>
                      <div className="bg-purple-50 p-2.5 sm:p-3 rounded-lg border border-purple-100">
                        <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide mb-1">Division</p>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm break-words">{record.division_name || "---"}</p>
                      </div>
                      <div className="bg-green-50 p-2.5 sm:p-3 rounded-lg border border-green-100">
                        <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">Roll Number</p>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm break-words">{record.roll_number || "---"}</p>
                      </div>
                      <div className="bg-orange-50 p-2.5 sm:p-3 rounded-lg border border-orange-100">
                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-1">Status</p>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm capitalize">{record.is_active ? "Active" : "Inactive"}</p>
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

      {/* STUDENT HISTORY SECTION - Updated to use enrichedHistory */}
      {/* <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <History className="w-5 h-5 text-red-600 mr-2" />
          Student Academic History
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg border">
          {historyLoadingEffective ? (
            <p className="text-gray-600">Loading history...</p>
          ) : enrichedHistoryEffective.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-2">No history records found.</p>
              <p className="text-gray-500 text-sm">
                Current student ID: {studentData?.student_id || "Not available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedHistoryEffective.map((item, idx) => (
                <div key={idx} className="p-4 bg-white border rounded-lg shadow">
                  <p><strong>Class:</strong> {item.class_name || "N/A"}</p>
                  <p><strong>Division:</strong> {item.division_name || "N/A"}</p>
                  <p><strong>Year:</strong> {item.academic_year_name || "N/A"}</p>
                  <p><strong>Roll Number:</strong> {item.roll_number || "N/A"}</p>
                  <p><strong>Status:</strong> {item.is_active ? "Active" : "Inactive"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default StudentAcademicJourney;