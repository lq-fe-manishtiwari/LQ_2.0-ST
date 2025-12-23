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
    { id: 'academic', name: 'Academic Journey', icon: <FileText className="w-5 h-5" /> }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-center md:text-left">
            {/* Profile Image */}
            <div className="flex justify-center md:block mb-4 md:mb-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-300">
                  {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {studentName}
              </h1>
              {profile?.admission_number && (
                <p className="text-lg text-gray-600 mb-2">
                  Admission No: {profile.admission_number}
                </p>
              )}
              {profile?.roll_number && (
                <p className="text-lg text-gray-600 mb-2">
                  Roll No: {profile.roll_number}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Student
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  profile?.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
                {profile?.user?.user_type && (
                  <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
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
            <div className="flex">
              {tabs.slice(0, 3).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } flex-1 py-4 px-2 flex flex-row items-center justify-center gap-2 text-sm font-medium`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Second Row */}
            <div className="border-t">
              <div className="flex">
                {tabs.slice(3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-500"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } flex-1 py-4 px-2 flex flex-row items-center justify-center gap-2 text-sm font-medium`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex justify-center space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
}
