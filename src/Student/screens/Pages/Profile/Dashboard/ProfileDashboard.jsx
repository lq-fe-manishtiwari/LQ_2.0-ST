import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, GraduationCap, MessageCircle, Bus, FileText } from "lucide-react";
import moment from "moment";
import { useUserProfile } from "@/contexts/UserProfileContext";
import StudentPersonalDetails from "./Components/StudentPersonalDetails";
import StudentEducationalDetails from "./Components/StudentEducationalDetails";
import StudentCommunicationDetails from "./Components/StudentCommunicationDetails";
import StudentTransportDetails from "./Components/StudentTransportDetails";
import StudentAcademicJourney from "./Components/StudentAcademicJourney";
import StudentFeesDetails from "./Components/StudentFeesDetails";
import { CreditCard } from "lucide-react";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("personal");
  const [historyLoading, setHistoryLoading] = useState(false);

  // Use UserProfile context for actual student data
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    getFullName,
    fetchProfile,
    isLoaded
  } = useUserProfile();

  const tabs = [
    { id: 'personal', name: 'Personal', icon: <User className="w-5 h-5" /> },
    { id: 'educational', name: 'Educational', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'communication', name: 'Communication', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'transport', name: 'Transport', icon: <Bus className="w-5 h-5" /> },
    { id: 'academic', name: 'Journey', icon: <FileText className="w-5 h-5" /> },
    { id: 'fees', name: 'Fees', icon: <CreditCard className="w-5 h-5" /> }
  ];

  // Use actual API data instead of dummy data
  const studentData = profile || {};
  const studentName = getFullName() || "Student";
  const profileImage = profile?.avatar || null;

  useEffect(() => {
    // Ensure profile data is loaded when component mounts
    if (!isLoaded && !profileLoading) {
      fetchProfile();
    }
  }, [isLoaded, profileLoading, fetchProfile]);

  const handleProfileUpload = async (file) => {
    console.log('Uploading file:', file);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <StudentPersonalDetails
            studentData={studentData}
            studentName={studentName}
            profileImage={profileImage}
            onProfileUpload={handleProfileUpload}
          />
        );

      case 'educational':
        return <StudentEducationalDetails studentData={studentData} />;

      case 'communication':
        return <StudentCommunicationDetails studentData={studentData} />;

      case 'transport':
        return <StudentTransportDetails studentData={studentData} />;

      case 'academic':
        return (
          <StudentAcademicJourney
            studentData={studentData}
            historyLoading={historyLoading}
          />
        );

      case 'fees':
        return <StudentFeesDetails studentId={studentData.student_id} />;

      default:
        return null;
    }
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-red-900 text-lg font-bold mb-2">Error Loading Profile</h3>
            <p className="text-red-600 text-sm mb-6">{profileError}</p>
            <button
              onClick={fetchProfile}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Action Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/student-dashboard"
            className="group flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm sm:text-base">Back</span>
          </Link>
          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase">Student Profile</div>
        </div>

        {/* Premium Profile card */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <User size={120} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6 text-center sm:text-left">
            {/* Avatar Section */}
            <div className="relative group">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-black border-4 border-white shadow-xl uppercase">
                  {studentName ? studentName.charAt(0) : 'S'}
                </div>
              )}
            </div>

            {/* Identity Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {studentName}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Student
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${profile?.is_active
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm sm:text-base">
                {profile?.admission_number && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500">
                    <span className="font-medium">Admission ID:</span>
                    <span className="font-bold text-gray-800">{profile.admission_number}</span>
                  </div>
                )}
                {profile?.roll_number && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500">
                    <span className="font-medium">Roll Number:</span>
                    <span className="font-bold text-gray-800">{profile.roll_number}</span>
                  </div>
                )}
                {profile?.user?.user_type && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500">
                    <span className="font-medium">Account Type:</span>
                    <span className="font-bold text-gray-800">{profile.user.user_type}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs Section */}
        <div className="mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:flex-wrap gap-2 sm:gap-3 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 font-bold text-sm
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                    : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
                  }
                `}
              >
                <span className={activeTab === tab.id ? "text-white" : "text-gray-400 group-hover:text-blue-600"}>
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Content area */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 sm:p-10 min-h-[400px]">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderTabContent()}
          </div>
        </div>

      </div>

      {/* Custom Styles for hiding scrollbar but allowing scroll */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
