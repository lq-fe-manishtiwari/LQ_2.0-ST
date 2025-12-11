import React, { useRef, useState, useEffect } from "react";
import { User, Calendar, MapPin, Image as ImageIcon, History } from "lucide-react";
import { StudentService } from "../../Student.Service";

const StudentPersonalDetails = ({ studentData, studentName, profileImage, onProfileUpload }) => {
  // 🔍 DEBUG: Log the studentData prop on every render
  console.log("🔍 [StudentPersonalDetails] studentData prop:", studentData);
  console.log("🔍 [StudentPersonalDetails] student_id from prop:", studentData?.student_id);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(profileImage);

  // History State
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ⭐ UPDATED: Fetch History API with better logging and validation
  useEffect(() => {
    console.log("🔄 [useEffect] Running. Full studentData:", studentData);
    
    // More explicit condition: Check if studentData exists AND has a valid numeric ID
    if (!studentData || typeof studentData.student_id !== 'number') {
      console.log("⏸️ [useEffect] Skipping fetch. Conditions not met.");
      return;
    }
    
    console.log("🚀 [useEffect] Conditions met. Fetching for ID:", student_id);
    
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await StudentService.getStudentHistory(student_id);
        console.log("✅ [fetchHistory] API Response:", res);
        console.log("📊 [fetchHistory] Response data:", res.data);
        console.log("📊 [fetchHistory] Response data.data:", res.data?.data);
        setHistoryData(res.data?.data || []);
      } catch (err) {
        console.error("❌ [fetchHistory] Fetch error:", err);
        console.error("❌ [fetchHistory] Error details:", err.response?.data || err.message);
      }
      setHistoryLoading(false);
    };

    fetchHistory();
  }, [studentData]); // ✅ Using studentData as the dependency

  // Handle Profile Upload
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setLocalImage(previewUrl);

    if (onProfileUpload) {
      await onProfileUpload(file);
    }

    setUploading(false);
  };

  const personalInfo = [
    { label: "First Name", value: studentData?.firstname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Middle Name", value: studentData?.middlename || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Last Name", value: studentData?.lastname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Gender", value: studentData?.gender || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { 
      label: "Date of Birth", 
      value: studentData?.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : "Not provided", 
      icon: <Calendar className="w-5 h-5 text-pink-500" /> 
    },
    { 
      label: "Date of Admission", 
      value: studentData?.date_of_admission ? new Date(studentData.date_of_admission).toLocaleDateString() : "Not provided", 
      icon: <Calendar className="w-5 h-5 text-pink-500" /> 
    },
  ];

  const addressInfo = [
    { label: "Address", value: studentData?.address || "Not provided", icon: <MapPin className="w-5 h-5 text-green-600" /> },
  ];

  const renderSection = (title, icon, items, colorClass) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className={`${colorClass} mr-2`}>{icon}</span>
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((info, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              {info.icon}
              <label className="block text-sm font-medium text-gray-700 ml-2">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-medium">{info.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* DEBUG INFO - Can remove after fixing */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Debug Info:</strong> studentData.student_id = {studentData?.student_id ? studentData.student_id : "undefined/null"}
            </p>
          </div>
        </div>
      </div>

      {renderSection("Personal Information", <User />, personalInfo, "text-blue-600")}
      {renderSection("Address Information", <MapPin />, addressInfo, "text-green-600")}

      {/* PROFILE PICTURE SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 text-purple-600 mr-2" />
          Profile Picture
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg border flex items-center space-x-4">
          <div className="flex-shrink-0">
            {localImage ? (
              <img src={localImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {studentName ? studentName.charAt(0).toUpperCase() : "S"}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              {localImage ? "Profile picture uploaded" : "No profile picture uploaded"}
            </p>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : localImage ? "Change Picture" : "Upload Picture"}
            </button>

            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
          </div>
        </div>
      </div>

      {/* STUDENT HISTORY SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <History className="w-5 h-5 text-red-600 mr-2" />
          Student Academic History
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg border">
          {historyLoading ? (
            <p className="text-gray-600">Loading history...</p>
          ) : historyData.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-2">No history records found.</p>
              <p className="text-gray-500 text-sm">
                Current student ID: {studentData?.student_id || "Not available"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyData.map((item, idx) => (
                <div key={idx} className="p-4 bg-white border rounded-lg shadow">
                  <p><strong>Class:</strong> {item.class_name || "N/A"}</p>
                  <p><strong>Division:</strong> {item.division || "N/A"}</p>
                  <p><strong>Year:</strong> {item.academic_year || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalDetails;