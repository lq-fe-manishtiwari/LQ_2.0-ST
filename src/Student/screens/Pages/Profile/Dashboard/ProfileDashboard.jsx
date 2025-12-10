import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, GraduationCap, MessageCircle, Bus, FileText } from "lucide-react";
import moment from "moment";
import StudentPersonalDetails from "./Components/StudentPersonalDetails";
import StudentEducationalDetails from "./Components/StudentEducationalDetails";
import StudentCommunicationDetails from "./Components/StudentCommunicationDetails";
import StudentTransportDetails from "./Components/StudentTransportDetails";
import StudentAcademicJourney from "./Components/StudentAcademicJourney";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("personal");
  const [historyLoading, setHistoryLoading] = useState(false);

  const tabs = [
    { id: 'personal', name: 'Personal', icon: <User className="w-5 h-5" /> },
    { id: 'educational', name: 'Educational', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'communication', name: 'Communication', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'transport', name: 'Transport', icon: <Bus className="w-5 h-5" /> },
    { id: 'academic', name: 'Academic Journey', icon: <FileText className="w-5 h-5" /> }
  ];

  // Mock student data - replace with actual data from props or API
  const studentData = {};
  const studentName = "Prajwal Bawane";
  const profileImage = null; // Set to null or image URL

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
        // Dummy academic history data
        const dummyHistory = [
          {
            class_name: "BCA Semester 6",
            academic_year_name: "2023-2024",
            semester_name: "Semester 6",
            batch_name: "Batch 2021-2024",
            division_name: "Division A",
            roll_number: "21BCA045",
            is_active: true,
            allocated_at: moment().subtract(6, 'months').unix(),
            promoted_at: null,
            deallocated_at: null
          },
          {
            class_name: "BCA Semester 5",
            academic_year_name: "2023-2024",
            semester_name: "Semester 5",
            batch_name: "Batch 2021-2024",
            division_name: "Division A",
            roll_number: "21BCA045",
            is_active: false,
            allocated_at: moment().subtract(12, 'months').unix(),
            promoted_at: moment().subtract(6, 'months').unix(),
            deallocated_at: null
          },
          {
            class_name: "BCA Semester 4",
            academic_year_name: "2022-2023",
            semester_name: "Semester 4",
            batch_name: "Batch 2021-2024",
            division_name: "Division B",
            roll_number: "21BCA045",
            is_active: false,
            allocated_at: moment().subtract(18, 'months').unix(),
            promoted_at: moment().subtract(12, 'months').unix(),
            deallocated_at: null
          }
        ];
        
        return (
          <StudentAcademicJourney 
            studentData={studentData} 
            historyLoading={historyLoading}
            enrichedHistory={dummyHistory}
          />
        );

      default:
        return null;
    }
  };

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
              {/* <p className="text-lg text-gray-600 mb-2">Student</p> */}

              {/* Tags */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Student
                </span>
                <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  Active
                </span>
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
