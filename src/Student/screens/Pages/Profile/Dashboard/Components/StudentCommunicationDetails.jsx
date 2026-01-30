import React from "react";
import { Phone, User, MapPin, Globe } from "lucide-react";

const StudentCommunicationDetails = ({ studentData }) => {
  const primaryContactInfo = [
    { label: "Primary Mobile", value: studentData?.primary_mobile || "---", icon: <Phone size={14} className="text-white" />, color: "bg-green-500" },
    { label: "Relation", value: studentData?.primary_relation || "---", icon: <User size={14} className="text-white" />, color: "bg-blue-500" },
  ];

  const fatherInfo = [
    { label: "First Name", value: studentData?.father_firstname || "---", icon: <User size={14} className="text-white" />, color: "bg-blue-600" },
    { label: "Last Name", value: studentData?.father_lastname || "---", icon: <User size={14} className="text-white" />, color: "bg-blue-600" },
    { label: "Mobile", value: studentData?.father_mobile || "---", icon: <Phone size={14} className="text-white" />, color: "bg-green-600" },
  ];

  const motherInfo = [
    { label: "First Name", value: studentData?.mother_firstname || "---", icon: <User size={14} className="text-white" />, color: "bg-purple-600" },
    { label: "Last Name", value: studentData?.mother_lastname || "---", icon: <User size={14} className="text-white" />, color: "bg-purple-600" },
    { label: "Mobile", value: studentData?.mother_mobile || "---", icon: <Phone size={14} className="text-white" />, color: "bg-green-600" },
  ];

  const addressInfo = [
    { label: "Address Line 1", value: studentData?.address_line1 || "---", icon: <MapPin size={14} className="text-white" />, color: "bg-orange-500" },
    { label: "Country", value: studentData?.country || "---", icon: <Globe size={14} className="text-white" />, color: "bg-indigo-600" },
    { label: "State", value: studentData?.state || "---", icon: <MapPin size={14} className="text-white" />, color: "bg-orange-400" },
    { label: "City", value: studentData?.city || "---", icon: <MapPin size={14} className="text-white" />, color: "bg-orange-300" },
    { label: "Pincode", value: studentData?.pincode || "---", icon: <MapPin size={14} className="text-white" />, color: "bg-orange-600" },
  ];

  const renderSection = (title, icon, items) => (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
          {icon}
        </div>
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((info, index) => (
          <div key={index} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg shadow-sm ${info.color} scale-90`}>
                {info.icon}
              </div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-bold ml-10 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection("Emergency Contact", <Phone size={20} />, primaryContactInfo)}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
        {renderSection("Father's Profile", <User size={20} />, fatherInfo)}
        {renderSection("Mother's Profile", <User size={20} />, motherInfo)}
      </div>
      {renderSection("Residential Address", <MapPin size={20} />, addressInfo)}
    </div>
  );
};

export default StudentCommunicationDetails;
