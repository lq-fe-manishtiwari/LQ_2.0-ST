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
    { id: 'academic', name: 'Academic Journey', icon: <FileText className="w-5 h-5" /> },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-medium mb-2">Error Loading Profile</h3>
            <p className="text-red-600 text-sm mb-4">{profileError}</p>
            <button
              onClick={fetchProfile}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="py-2 sm:py-4">

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/student"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border hover:shadow-sm transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm mx-auto"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-blue-300 shadow-sm mx-auto">
                  {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {studentName}
              </h1>
              <div className="space-y-1 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-x-4 text-gray-600 mb-3">
                {profile?.admission_number && (
                  <p className="text-sm sm:text-base">
                    Admission No: <span className="font-semibold text-gray-800">{profile.admission_number}</span>
                  </p>
                )}
                {profile?.roll_number && (
                  <p className="text-sm sm:text-base">
                    Roll No: <span className="font-semibold text-gray-800">{profile.roll_number}</span>
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-blue-100">
                  Student
                </span>
                <span className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border ${profile?.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
                {profile?.user?.user_type && (
                  <span className="bg-purple-50 text-purple-700 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border border-purple-100">
                    {profile.user.user_type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="block md:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* First Row */}
            <div className="flex divide-x border-b">
              {tabs.slice(0, 3).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } flex-1 py-3 px-1 flex flex-col items-center justify-center gap-1.5 text-[10px] xs:text-xs font-semibold transition-colors`}
                >
                  <div className={`${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`}>
                    {React.cloneElement(tab.icon, { className: "w-5 h-5" })}
                  </div>
                  <span className="text-center leading-tight">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Second Row */}
            <div className="flex divide-x">
              {tabs.slice(3).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } flex-1 py-3 px-1 flex flex-col items-center justify-center gap-1.5 text-[10px] xs:text-xs font-semibold transition-colors`}
                >
                  <div className={`${activeTab === tab.id ? "text-blue-600" : "text-gray-400"}`}>
                    {React.cloneElement(tab.icon, { className: "w-5 h-5" })}
                  </div>
                  <span className="text-center leading-tight">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex justify-start lg:justify-center space-x-4 lg:space-x-8 px-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition whitespace-nowrap`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
}
