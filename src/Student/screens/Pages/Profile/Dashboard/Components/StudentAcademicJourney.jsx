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
    <div className="space-y-4">
      {/* Timeline section */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Milestone History</h3>
        </div>

        {historyLoadingEffective ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600 border-r-transparent"></div>
            <p className="text-gray-400 font-bold animate-pulse text-sm">Building your journey...</p>
          </div>
        ) : enrichedHistoryEffective.length === 0 ? (
          <div className="bg-gray-50/50 p-16 rounded-[2rem] border border-dashed border-gray-200 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-bold text-lg">Your academic story starts here.</p>
            <p className="text-gray-300 text-sm mt-1">No historical records available yet.</p>
          </div>
        ) : (
          <div className="relative px-2 sm:px-4">
            {/* Timeline line */}
            <div className="absolute left-6 sm:left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-indigo-400 to-transparent rounded-full opacity-20"></div>

            <div className="space-y-12 relative">
              {enrichedHistoryEffective.map((record, index) => (
                <div key={index} className="relative pl-12 sm:pl-20 group">
                  {/* Timeline Node */}
                  <div className="absolute left-[1.125rem] sm:left-[2.125rem] top-4 w-6 h-6 rounded-full bg-white border-4 border-blue-600 shadow-xl shadow-blue-100 z-10 transition-transform group-hover:scale-125"></div>

                  {/* Card */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            {record.class_name || "Academic Standard"}
                          </h4>
                          {record.is_active && (
                            <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500 text-white shadow-lg shadow-green-100">
                              Current Standard
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          <span>{record.academic_year_name || "---"}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{record.semester_name || "---"}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 px-5 py-2 rounded-2xl border border-blue-100/50 flex flex-col items-center md:items-end">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-tight">Achievement</span>
                        <span className="text-blue-700 font-black text-lg">Rank #{record.roll_number || "--"}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Batch Code</p>
                        <p className="font-bold text-gray-700">{record.batch_name || "---"}</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Section</p>
                        <p className="font-bold text-gray-700">{record.division_name || "---"}</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Academic Status</p>
                        <p className={`font-bold ${record.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                          {record.is_active ? "In Progress" : "Completed"}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Events Pill */}
                    {(record.allocated_at || record.promoted_at || record.deallocated_at) && (
                      <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50">
                        {record.allocated_at && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enroll:</span>
                            <span className="text-xs font-black text-gray-700">
                              {moment.unix(record.allocated_at).format("MMM DD, YYYY")}
                            </span>
                          </div>
                        )}
                        {record.promoted_at && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Promote:</span>
                            <span className="text-xs font-black text-gray-700">
                              {moment.unix(record.promoted_at).format("MMM DD, YYYY")}
                            </span>
                          </div>
                        )}
                        {record.deallocated_at && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">End:</span>
                            <span className="text-xs font-black text-gray-700">
                              {moment.unix(record.deallocated_at).format("MMM DD, YYYY")}
                            </span>
                          </div>
                        )}
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