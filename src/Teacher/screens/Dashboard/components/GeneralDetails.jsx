import React, { useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  ShieldCheck,
  CalendarDays,
  Building,
  Landmark,
  CreditCard,
  IndianRupee,
  Image as ImageIcon,
} from "lucide-react";

const GeneralDetails = ({
  userProfile,
  fullName,
  email,
  phone,
  designation,
  profileImage,
  onProfileUpload, // <-- ADD THIS IN PARENT
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(profileImage || userProfile?.avatar);

  const iconColors = {
    user: "text-blue-600",
    mail: "text-purple-500",
    phone: "text-green-600",
    shield: "text-orange-500",
    id: "text-indigo-500",
    calendar: "text-pink-500",
    bank: "text-amber-600",
    briefcase: "text-rose-500",
    building: "text-cyan-600",
    image: "text-purple-600",
  };

  // ------------ HANDLE PROFILE UPLOAD ---------------
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // Show preview instantly
    const previewUrl = URL.createObjectURL(file);
    setLocalImage(previewUrl);

    // Trigger upload to parent
    if (onProfileUpload) {
      await onProfileUpload(file);
    }

    setUploading(false);
  };

  const personalInfo = [
    { label: "First Name", value: userProfile?.firstname || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
    { label: "Middle Name", value: userProfile?.middlename || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
    { label: "Last Name", value: userProfile?.lastname || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },

    { label: "Email", value: email || userProfile?.email || "Not provided", icon: <Mail className={`w-5 h-5 ${iconColors.mail}`} /> },
    { label: "Phone", value: phone || userProfile?.mobile || "Not provided", icon: <Phone className={`w-5 h-5 ${iconColors.phone}`} /> },

    { label: "Gender", value: userProfile?.gender || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
    { label: "Marital Status", value: userProfile?.marital_status || "Not provided", icon: <ShieldCheck className={`w-5 h-5 ${iconColors.shield}`} /> },
    { label: "Blood Group", value: userProfile?.blood_group || "Not provided", icon: <ShieldCheck className={`w-5 h-5 ${iconColors.shield}`} /> },

    {
      label: "Date of Birth",
      value: userProfile?.date_of_birth
        ? new Date(userProfile.date_of_birth).toLocaleDateString()
        : "Not available",
      icon: <CalendarDays className={`w-5 h-5 ${iconColors.calendar}`} />,
    },

    { label: "Father Name", value: userProfile?.father_name || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
    { label: "Spouse Name", value: userProfile?.spouse_name || "Not provided", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
  ];

  const identityInfo = [
    { label: "Teacher ID", value: userProfile?.teacher_id || "Not available", icon: <IdCard className={`w-5 h-5 ${iconColors.id}`} /> },
    { label: "Employee ID", value: userProfile?.employee_id || "Not available", icon: <IdCard className={`w-5 h-5 ${iconColors.id}`} /> },
    { label: "Aadhaar", value: userProfile?.aadhar_number || "Not available", icon: <IdCard className={`w-5 h-5 ${iconColors.id}`} /> },
    { label: "PAN", value: userProfile?.pan_number || "Not available", icon: <IdCard className={`w-5 h-5 ${iconColors.id}`} /> },
    { label: "UAN", value: userProfile?.uan_number || "Not available", icon: <IdCard className={`w-5 h-5 ${iconColors.id}`} /> },
  ];

  const employmentInfo = [
    { label: "Designation", value: designation || userProfile?.designation || "Not provided", icon: <Briefcase className={`w-5 h-5 ${iconColors.briefcase}`} /> },
    { label: "College ID", value: userProfile?.college_id || "Not available", icon: <Building className={`w-5 h-5 ${iconColors.building}`} /> },

    {
      label: "Date of Joining",
      value: userProfile?.date_of_joining
        ? new Date(userProfile.date_of_joining).toLocaleDateString()
        : "Not available",
      icon: <CalendarDays className={`w-5 h-5 ${iconColors.calendar}`} />,
    },

    { label: "User Type", value: userProfile?.user?.user_type || "Not available", icon: <User className={`w-5 h-5 ${iconColors.user}`} /> },
    { label: "Status", value: userProfile?.user?.active ? "Active" : "Inactive", icon: <ShieldCheck className={`w-5 h-5 ${iconColors.shield}`} /> },
  ];

  const bankInfo = [
    { label: "Bank Name", value: userProfile?.bank_name || "Not available", icon: <Landmark className={`w-5 h-5 ${iconColors.bank}`} /> },
    { label: "Account Number", value: userProfile?.bank_account_no || "Not available", icon: <CreditCard className={`w-5 h-5 ${iconColors.bank}`} /> },
    { label: "IFSC Code", value: userProfile?.ifsc_code || "Not available", icon: <CreditCard className={`w-5 h-5 ${iconColors.bank}`} /> },
    { label: "Financial Year", value: userProfile?.financial_year || "Not available", icon: <CalendarDays className={`w-5 h-5 ${iconColors.calendar}`} /> },
    { label: "CTC", value: userProfile?.cost_to_company || "Not available", icon: <IndianRupee className={`w-5 h-5 ${iconColors.bank}`} /> },
    { label: "Deduction", value: userProfile?.deduction || "Not available", icon: <IndianRupee className={`w-5 h-5 ${iconColors.bank}`} /> },
    { label: "Net Pay", value: userProfile?.net_pay || "Not available", icon: <IndianRupee className={`w-5 h-5 ${iconColors.bank}`} /> },
  ];

  const renderSection = (title, icon, items, colorClass) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className={`${colorClass} mr-2`}>{icon}</span>
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((info, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <span className="text-gray-400 mr-2">{info.icon}</span>
              <label className="block text-xs font-medium text-gray-500">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-medium break-words">{info.value || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">

      {renderSection("Personal Information", <User />, personalInfo, iconColors.user)}
      {renderSection("Identity Information", <IdCard />, identityInfo, iconColors.id)}
      {renderSection("Employment Information", <Briefcase />, employmentInfo, iconColors.briefcase)}
      {renderSection("Bank Information", <Landmark />, bankInfo, iconColors.bank)}

      {/* PROFILE PICTURE SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ImageIcon className={`w-5 h-5 ${iconColors.image} mr-2`} />
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
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
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

            {/* Hidden File Input */}
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

export default GeneralDetails;
