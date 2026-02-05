import React, { useState } from 'react';

import {
  User,
  Mail,
  Library,
  GraduationCap,
  FileText,
  ArrowLeft
} from "lucide-react";

import GeneralDetails from './GeneralDetails';
import CommunicationDetails from './CommunicationDetails';
import AllocatedPrograms from './AllocatedPrograms';
import AcademicInfo from './AcademicInfo';
import Documents from './Documents';

const ProfileView = ({
  userProfile,
  fullName,
  email,
  phone,
  designation,
  profileImage,
  allocatedPrograms,
  allocatedMentorClasses,
  programsLoading,
  programsError,
  fetchAllocatedPrograms,
  fetchMentoringStudents,
  fetchAllocatedMentorClasses,
  expandedProgram,
  setExpandedProgram,
  studentsData,
  studentsLoading,
  fetchStudents,
  studentsPagination,
  changePage,
  getPaginatedStudents,
  onBack
}) => {

  const [activeTab, setActiveTab] = useState('general');
  const [uploadedImage, setUploadedImage] = useState(profileImage);

  // ==========================================================
  // HANDLE PROFILE PICTURE UPLOAD
  // ==========================================================
  const handleProfileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profile", file);

      // ---- YOUR API CALL HERE ----
      const response = await fetch(
        "https://your-api.com/user/upload-profile",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result?.avatar_url) {
        setUploadedImage(result.avatar_url);
      }

    } catch (error) {
      console.error("Profile upload failed:", error);
    }
  };


  const tabs = [
    { id: 'general', name: 'Personal', icon: <User className="w-5 h-5" /> },
    { id: 'communication', name: 'Communication', icon: <Mail className="w-5 h-5" /> },
    { id: 'programs', name: 'Other', icon: <Library className="w-5 h-5" /> },
    { id: 'academic', name: 'Academic Info', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'documents', name: 'Documents', icon: <FileText className="w-5 h-5" /> }
  ];


  // ==========================================================
  // RENDER TABS
  // ==========================================================
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralDetails
            userProfile={userProfile}
            fullName={fullName}
            email={email}
            phone={phone}
            designation={designation}
            profileImage={uploadedImage}
            onProfileUpload={handleProfileUpload}
          />
        );

      case 'communication':
        return (
          <CommunicationDetails
            email={email}
            phone={phone}
            userProfile={userProfile}
          />
        );

      case 'programs':
        return (
          <AllocatedPrograms
            allocatedPrograms={allocatedPrograms}
            allocatedMentorClasses={allocatedMentorClasses}
            programsLoading={programsLoading}
            programsError={programsError}
            fetchAllocatedPrograms={fetchAllocatedPrograms}
            fetchMentoringStudents={fetchMentoringStudents}
            fetchAllocatedMentorClasses={fetchAllocatedMentorClasses}
            expandedProgram={expandedProgram}
            setExpandedProgram={setExpandedProgram}
            studentsData={studentsData}
            studentsLoading={studentsLoading}
            fetchStudents={fetchStudents}
            studentsPagination={studentsPagination}
            changePage={changePage}
            getPaginatedStudents={getPaginatedStudents}
          />
        );

      case 'academic':
        return <AcademicInfo userProfile={userProfile} />;

      case 'documents':
        return <Documents userProfile={userProfile} />;

      default:
        return null;
    }
  };

  // ==========================================================
  // MAIN RETURN UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border hover:shadow-sm transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-center md:text-left">
            {/* Profile Image */}
            <div className="flex justify-center md:block mb-4 md:mb-0">
              <div className="relative inline-block">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-100">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {fullName || 'User Profile'}
              </h1>

              {designation && (
                <p className="text-lg text-gray-600 mb-2">{designation}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Teacher
                </span>
                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Responsive Scroll */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <nav className="flex px-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-400 hover:text-gray-600 border-transparent"
                    } whitespace-nowrap py-5 px-6 border-b-2 font-bold text-sm flex items-center gap-2 transition-all relative`}
                >
                  <span className={`${activeTab === tab.id ? 'animate-pulse' : ''}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 min-h-[400px]">
          <div className="animate-in fade-in duration-500">
            {renderTabContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
