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
    { label: "First Name", value: studentData?.firstname || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-blue-500" },
    { label: "Middle Name", value: studentData?.middlename || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-blue-400" },
    { label: "Last Name", value: studentData?.lastname || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-blue-600" },
    { label: "Gender", value: studentData?.gender || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-purple-500" },
    {
      label: "Date of Birth",
      value: studentData?.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : "---",
      icon: <Calendar className="w-4 h-4 text-white" />,
      color: "bg-pink-500"
    },
    {
      label: "Admission Date",
      value: studentData?.date_of_admission ? new Date(studentData.date_of_admission).toLocaleDateString() : "---",
      icon: <Calendar className="w-4 h-4 text-white" />,
      color: "bg-orange-500"
    },
    { label: "Blood Group", value: studentData?.blood_group || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-red-500" },
    { label: "Mother Tongue", value: studentData?.mother_tongue || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-500" },
    { label: "Birth Place", value: studentData?.birth_place || "---", icon: <MapPin className="w-4 h-4 text-white" />, color: "bg-green-500" },
    { label: "Nationality", value: studentData?.nationality || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-blue-700" },
    { label: "Caste", value: studentData?.caste || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-cyan-500" },
    { label: "Religion", value: studentData?.religion || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-yellow-600" },
  ];

  const identificationInfo = [
    { label: "Aadhaar No", value: studentData?.aadhaar_number || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-600" },
    { label: "PRN", value: studentData?.prn || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-400" },
    { label: "Admission No", value: studentData?.admission_number || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-700" },
    { label: "Roll No", value: studentData?.roll_number || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-500" },
    { label: "Saral ID", value: studentData?.saral_id || "---", icon: <User className="w-4 h-4 text-white" />, color: "bg-indigo-800" },
  ];

  const renderSection = (title, icon, items) => (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
          {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((info, index) => (
          <div key={index} className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg shadow-sm ${info.color} scale-90`}>
                {info.icon}
              </div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-bold ml-10 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* PROFILE PICTURE BOX */}
      <div className="group mb-12 bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 shadow-inner">
        <div className="relative">
          {localImage ? (
            <img
              src={localImage}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl transition-transform group-hover:rotate-3"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-xl uppercase">
              {studentName ? studentName.charAt(0) : "S"}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Customize Profile Picture</h4>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Keep your profile updated with a recent photograph. JPG or PNG allowed.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {localImage ? "Update Photo" : "Upload New Photo"}
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

      {renderSection("Personal Details", <User size={20} />, personalInfo)}
      {renderSection("Identification", <FileText size={20} />, identificationInfo)}

      {/* ADDRESS SECTION */}
      <div className="bg-blue-50/50 p-6 sm:p-8 rounded-3xl border border-blue-100 mt-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
            <MapPin size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Location Details</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-blue-100/50 font-bold text-gray-700 shadow-sm leading-relaxed">
          {studentData?.address || "No address information provided yet."}
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalDetails;
