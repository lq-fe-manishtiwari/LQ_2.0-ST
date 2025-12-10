import React, { useRef, useState } from "react";
import { User, Calendar, MapPin, Image as ImageIcon } from "lucide-react";

const StudentPersonalDetails = ({ studentData, studentName, profileImage, onProfileUpload }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(profileImage);

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
      {renderSection("Personal Information", <User />, personalInfo, "text-blue-600")}
      {renderSection("Address Information", <MapPin />, addressInfo, "text-green-600")}

      {/* PROFILE PICTURE SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 text-purple-600 mr-2" />
          Profile Picture
        </h3>

        <div className="bg-gray-50 p-6 rounded-lg border flex items-center space-x-4">
          {/* Profile Preview */}
          <div className="flex-shrink-0">
            {localImage ? (
              <img
                src={localImage}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {studentName ? studentName.charAt(0).toUpperCase() : "S"}
              </div>
            )}
          </div>

          {/* Upload Button */}
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

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalDetails;
