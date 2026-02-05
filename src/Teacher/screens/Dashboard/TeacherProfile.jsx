// src/Teacher/Dashboard/TeacherProfile.jsx
import React, { useState, useEffect } from "react";
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
  Layout,
  Clock,
  MapPin,
  Building,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { api } from "@/_services/api";

export default function TeacherProfile() {
  const {
    profile: teacherData,
    loading: profileLoading,
    error: profileError,
    getFullName,
    getEmail,
    getMobile,
    getTeacherId,
    getUserId,
    isLoaded
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState("2"); // Set Personal as default if attendance is mock

  // State for allocated programs
  const [allocatedPrograms, setAllocatedPrograms] = useState({
    class_teacher_allocation: [],
    normal_allocation: []
  });
  const [allocatedMentorClasses, setAllocatedMentorClasses] = useState([]);
  const [extraDataLoading, setExtraDataLoading] = useState(false);

  // ---------- FETCH EXTRA DATA (ALLOCATIONS) ----------
  useEffect(() => {
    const fetchExtraData = async () => {
      if (!isLoaded) return;

      setExtraDataLoading(true);
      try {
        const teacherId = getTeacherId();
        const userId = getUserId();

        // Fetch Programs
        if (teacherId) {
          const res = await api.getTeacherAllocatedPrograms(teacherId);
          if (res.success) {
            setAllocatedPrograms({
              class_teacher_allocation: res.data?.class_teacher_allocation || [],
              normal_allocation: res.data?.normal_allocation || res.data?.programs || []
            });
          }
        }

        // Fetch Mentoring Classes
        if (userId) {
          const res = await api.getTeacherAllocatedMentoringClasses(userId);
          if (res && (res.success || Array.isArray(res))) {
            const mentorData = Array.isArray(res) ? res : res.data;
            setAllocatedMentorClasses(Array.isArray(mentorData) ? mentorData : []);
          }
        }
      } catch (err) {
        console.error("Error fetching allocations:", err);
      } finally {
        setExtraDataLoading(false);
      }
    };

    fetchExtraData();
  }, [isLoaded, getTeacherId, getUserId]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm text-center max-w-md">
          <h2 className="text-lg font-bold mb-2">Error Loading Profile</h2>
          <p className="mb-4">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const teacher = teacherData || {};
  const fullName = getFullName();
  const email = getEmail() || teacher.email;
  const mobile = getMobile() || teacher.mobile;

  // ---------- RE-USABLE CARD ----------
  const Card = ({ label, value }) => {
    const cleanLabel = label.replace(/\*$/, "");
    const hasAsterisk = label.endsWith("*");
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${hasAsterisk ? "text-blue-600" : "text-gray-400"
            }`}
        >
          {cleanLabel}
          {hasAsterisk && <span className="text-red-500">*</span>}
        </p>
        <p className="font-semibold text-gray-800 text-base break-words">
          {value || <span className="text-gray-300 font-normal">Not provided</span>}
        </p>
      </div>
    );
  };

  // ---------- 8 TABS IN REQUIRED ORDER ----------
  const tabs = [
    { k: "1", l: "Attendance", icon: Calendar },
    { k: "2", l: "Personal", icon: User },
    { k: "3", l: "Communication", icon: MessageCircle },
    { k: "4", l: "Employment", icon: Briefcase },
    { k: "5", l: "Qualification", icon: BookOpen },
    { k: "6", l: "Security", icon: Lock },
    { k: "7", l: "Meetings", icon: Link2 },
    { k: "8", l: "My Classes", icon: Users },
    { k: "9", l: "Documents", icon: FileText },
  ];

  return (
    <div className="p-0 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        {/* Header Section */}
        <div className="bg-white md:rounded-3xl shadow-sm overflow-hidden mb-6 border-b md:border border-gray-100">
          <div className="relative h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <Link to="/teacher">
                <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition">
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </Link>
            </div>
          </div>

          <div className="px-6 pb-6 text-center md:text-left">
            <div className="relative -mt-16 md:-mt-20 mb-4 inline-block md:block">
              <img
                src={teacher.avatar || `https://ui-avatars.com/api/?name=${fullName}&background=random&size=128`}
                alt="Teacher"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white mx-auto md:mx-0 object-cover shadow-xl bg-white"
              />
              <span className="absolute bottom-2 right-2 md:left-32 md:right-auto w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
            </div>

            <div className="md:flex md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  {fullName}
                </h1>
                <p className="text-blue-600 font-bold mt-1 uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-3 h-3" />
                  {teacher.designation || "Faculty Member"}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span>{mobile || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Mobile Optimized */}
        <div className="bg-white sticky top-0 z-20 md:relative md:rounded-2xl shadow-sm border-b md:border border-gray-100 mb-6 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <ul className="flex px-4 md:px-2">
              {tabs.map((t, i) => {
                const Icon = t.icon;
                const isActive = activeTab === t.k;
                return (
                  <li key={t.k} className="flex-shrink-0">
                    <button
                      onClick={() => setActiveTab(t.k)}
                      className={`relative flex items-center gap-2 px-5 py-5 transition-all group ${isActive
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                      <span className="text-sm font-bold whitespace-nowrap">{t.l}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 min-h-[500px]">

          {/* TAB 1: Attendance */}
          {activeTab === "1" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Attendance Log</h2>
                  <p className="text-gray-500 text-sm">Monitor your monthly presence</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    <Layout className="w-5 h-5 text-gray-600 text-sm" />
                  </button>
                  <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                    January / 2026
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-3 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="text-center text-[9px] md:text-xs font-black uppercase text-gray-400 py-2">
                    {d}
                  </div>
                ))}
                {/* Calendar Grid - Static Mock */}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square md:h-24 p-1.5 md:p-3 rounded-lg md:rounded-2xl border flex flex-col items-center md:items-start justify-center md:justify-between transition group cursor-default hover:border-blue-200 ${(i + 1) % 7 === 0 ? "bg-red-50/30 border-red-50" : "bg-gray-50/50 border-gray-100"
                      }`}
                  >
                    <span className="text-[10px] md:text-sm font-bold text-gray-700">{i + 1}</span>
                    <div className="hidden md:block w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-700"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-800 text-sm">Live Sync Pending</h4>
                  <p className="text-yellow-700/80 text-xs">Real-time attendance logs will be integrated with the HRM system soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Personal */}
          {activeTab === "2" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">Personal Information</h2>
                <p className="text-gray-500 text-sm">Primary identity and personal details</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card label="First Name *" value={teacher.firstname} />
                <Card label="Middle Name" value={teacher.middlename} />
                <Card label="Last Name *" value={teacher.lastname} />
                <Card label="Gender *" value={teacher.gender} />
                <Card label="Date of Birth" value={teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString() : null} />
                <Card label="Blood Group" value={teacher.blood_group} />
                <Card label="Marital Status" value={teacher.marital_status} />
                <Card label="Father Name" value={teacher.father_name} />
                <Card label="Spouse Name" value={teacher.spouse_name} />
                <Card label="Aadhaar Number" value={teacher.aadhar_number} />
                <Card label="PAN Number" value={teacher.pan_number} />
                <Card label="UAN Number" value={teacher.uan_number} />
                <Card label="Employee ID *" value={teacher.employee_id} />
              </div>
            </div>
          )}

          {/* TAB 3: Communication */}
          {activeTab === "3" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">Contact & Address</h2>
                <p className="text-gray-500 text-sm">Where we can reach you</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card label="Address Line 1" value={teacher.address_line1} />
                <Card label="Address Line 2" value={teacher.address_line2} />
                <Card label="City" value={teacher.city} />
                <Card label="State" value={teacher.state} />
                <Card label="Country" value={teacher.country} />
                <Card label="Pincode" value={teacher.pincode} />
                <Card label="Primary Email" value={email} />
                <Card label="Alternate Email" value={teacher.alternate_email} />
                <Card label="Primary Phone" value={mobile} />
                <Card label="Alternate Phone" value={teacher.alternate_mobile} />
              </div>
            </div>
          )}

          {/* TAB 4: Employment History */}
          {activeTab === "4" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">Employment Details</h2>
                <p className="text-gray-500 text-sm">Professional journey and bank info</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card label="Designation" value={teacher.designation} />
                <Card label="Date of Joining *" value={teacher.date_of_joining ? new Date(teacher.date_of_joining).toLocaleDateString() : null} />
                <Card label="Bank Name" value={teacher.bank_name} />
                <Card label="Account No." value={teacher.bank_account_no} />
                <Card label="IFSC Code" value={teacher.ifsc_code} />
                <Card label="CTC" value={teacher.cost_to_company ? `₹${teacher.cost_to_company}` : null} />
                <Card label="Net Pay" value={teacher.net_pay ? `₹${teacher.net_pay}` : null} />
              </div>
            </div>
          )}

          {/* TAB 5: Qualification */}
          {activeTab === "5" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900">Academic Qualifications</h2>
                <p className="text-gray-500 text-sm">Your educational verification records</p>
              </div>

              {teacher.qualifications?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teacher.qualifications.map((qual, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-black">
                          {qual.year || idx + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 leading-tight">{qual.degree || qual.name}</h4>
                          <p className="text-blue-600 text-sm font-bold mt-1">{qual.university || qual.board || 'University/Board N/A'}</p>
                          <p className="text-gray-400 text-xs mt-1">Status: <span className="text-green-500 font-bold uppercase tracking-wider">Verified</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">No Records Found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2">Detailed educational records will be visible once updated in the system.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Security */}
          {activeTab === "6" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Change Password</h2>
                <p className="text-gray-500 text-sm">Update your secure access</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: Meetings */}
          {activeTab === "7" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Virtual Classroom</h2>
                <p className="text-gray-500 text-sm">Configure your default meeting link</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Google Meet / Zoom URL</label>
                  <input
                    type="url"
                    defaultValue={teacher.connect_link}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full bg-transparent outline-none font-medium text-blue-600"
                  />
                </div>
                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: Know My Class */}
          {activeTab === "8" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">My Allocations</h2>
                  <p className="text-gray-500 text-sm">Classes and mentoring groups</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs">
                  {allocatedPrograms.class_teacher_allocation.length + allocatedPrograms.normal_allocation.length + allocatedMentorClasses.length} Active
                </div>
              </div>

              {extraDataLoading ? (
                <div className="py-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4 font-medium">Loading your classes...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Class Teacher */}
                  {allocatedPrograms.class_teacher_allocation.map((cls, idx) => (
                    <div key={`ct-${idx}`} className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">Class Teacher</span>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition truncate">
                            {cls.program?.program_name || "Program"}
                          </h3>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-bold">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {cls.division?.division_name || "A"}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cls.academic_year?.name || "2024-25"}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                          <Layout className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Normal Allocations */}
                  {allocatedPrograms.normal_allocation.map((cls, idx) => (
                    <div key={`n-${idx}`} className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">Subject Teacher</span>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition truncate">
                            {cls.program?.program_name || "Program"}
                          </h3>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-bold">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {cls.division?.division_name || "N/A"}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cls.academic_year?.name || "N/A"}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mentor Classes */}
                  {allocatedMentorClasses.map((cls, idx) => (
                    <div key={`m-${idx}`} className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-green-200 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">Mentor</span>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition truncate">
                            {cls.mentoring_collection_name || "Mentoring Group"}
                          </h3>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-bold">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.student_count || 0} Students</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {allocatedPrograms.class_teacher_allocation.length === 0 &&
                    allocatedPrograms.normal_allocation.length === 0 &&
                    allocatedMentorClasses.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No Classes Allocated</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">You haven't been assigned any active classes or mentoring groups yet.</p>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: Documents */}
          {activeTab === "9" && (
            <div className="animate-in fade-in duration-500">
              <Documents userProfile={userProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}