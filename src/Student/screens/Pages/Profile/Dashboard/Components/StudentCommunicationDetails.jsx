import React from "react";
import { Phone, User, MapPin, Globe } from "lucide-react";

const StudentCommunicationDetails = ({ studentData }) => {
  const primaryContactInfo = [
    { label: "Primary Mobile", value: studentData?.primary_mobile || "Not provided", icon: <Phone className="w-5 h-5 text-green-600" /> },
    { label: "Primary Relation", value: studentData?.primary_relation || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
  ];

  const fatherInfo = [
    { label: "Father First Name", value: studentData?.father_firstname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Father Last Name", value: studentData?.father_lastname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Father Mobile", value: studentData?.father_mobile || "Not provided", icon: <Phone className="w-5 h-5 text-green-600" /> },
  ];

  const motherInfo = [
    { label: "Mother First Name", value: studentData?.mother_firstname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Mother Last Name", value: studentData?.mother_lastname || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Mother Mobile", value: studentData?.mother_mobile || "Not provided", icon: <Phone className="w-5 h-5 text-green-600" /> },
  ];

  const addressInfo = [
    { label: "Address Line 1", value: studentData?.address_line1 || "Not provided", icon: <MapPin className="w-5 h-5 text-orange-500" /> },
    { label: "Country", value: studentData?.country || "Not provided", icon: <Globe className="w-5 h-5 text-purple-600" /> },
    { label: "State", value: studentData?.state || "Not provided", icon: <MapPin className="w-5 h-5 text-orange-500" /> },
    { label: "City", value: studentData?.city || "Not provided", icon: <MapPin className="w-5 h-5 text-orange-500" /> },
    { label: "Pincode", value: studentData?.pincode || "Not provided", icon: <MapPin className="w-5 h-5 text-orange-500" /> },
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
      {renderSection("Primary Contact", <Phone />, primaryContactInfo, "text-green-600")}
      {renderSection("Father's Details", <User />, fatherInfo, "text-blue-600")}
      {renderSection("Mother's Details", <User />, motherInfo, "text-purple-600")}
      {renderSection("Address Details", <MapPin />, addressInfo, "text-orange-500")}
    </div>
  );
};

export default StudentCommunicationDetails;
