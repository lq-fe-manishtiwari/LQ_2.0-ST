import React from "react";
import { GraduationCap, IdCard } from "lucide-react";

const StudentEducationalDetails = ({ studentData }) => {
  const educationalInfo = [
    { label: "ABC ID", value: studentData?.abc_id || "Not provided", icon: <IdCard className="w-5 h-5 text-indigo-500" /> },
    { label: "University Application Number", value: studentData?.university_app_number || "Not provided", icon: <IdCard className="w-5 h-5 text-indigo-500" /> },
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
      {renderSection("Educational Information", <GraduationCap />, educationalInfo, "text-indigo-500")}
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 text-indigo-500 mr-2" />
          Previous Qualifications
        </h3>
        <div className="bg-gray-50 p-8 rounded-lg border text-center">
          <p className="text-gray-500">No education details available</p>
        </div>
      </div>
    </div>
  );
};

export default StudentEducationalDetails;
