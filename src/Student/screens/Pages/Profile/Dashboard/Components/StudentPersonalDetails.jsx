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
    { label: "Blood Group", value: studentData?.blood_group || "Not provided", icon: <User className="w-5 h-5 text-red-500" /> },
    { label: "Mother Tongue", value: studentData?.mother_tongue || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Birth Place", value: studentData?.birth_place || "Not provided", icon: <MapPin className="w-5 h-5 text-green-600" /> },
    { label: "Nationality", value: studentData?.nationality || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Caste", value: studentData?.caste || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Sub Caste", value: studentData?.sub_caste || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Caste Category", value: studentData?.caste_category || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Religion", value: studentData?.religion || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Class House", value: studentData?.class_house || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Weight (kg)", value: studentData?.weight || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Native Place", value: studentData?.native_place || "Not provided", icon: <MapPin className="w-5 h-5 text-green-600" /> },
  ];

  const identificationInfo = [
    { label: "Aadhaar Number", value: studentData?.aadhaar_number || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
    { label: "Name As Per Aadhaar", value: studentData?.name_as_per_aadhaar || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
    { label: "PRN", value: studentData?.prn || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
    { label: "Admission Number", value: studentData?.admission_number || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
    { label: "Roll Number", value: studentData?.roll_number || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
    { label: "Saral ID", value: studentData?.saral_id || "Not provided", icon: <User className="w-5 h-5 text-indigo-500" /> },
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

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
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
      {renderSection("Identification Information", <User />, identificationInfo, "text-indigo-500")}
      {renderSection("Address Information", <MapPin />, addressInfo, "text-green-600")}

      {/* PROFILE PICTURE SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 text-purple-600 mr-2" />
          Profile Picture
        </h3>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
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
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              {localImage ? "Profile picture uploaded" : "No profile picture uploaded"}
            </p>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium w-full sm:w-auto transition-colors"
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
            <p className="mt-2 text-xs text-gray-400 font-medium">
              Supported formats: JPG, PNG. Max size 2MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalDetails;
