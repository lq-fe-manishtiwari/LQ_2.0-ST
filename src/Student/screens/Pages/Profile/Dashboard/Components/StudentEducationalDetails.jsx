import React from "react";
import { GraduationCap, IdCard } from "lucide-react";

const StudentEducationalDetails = ({ studentData }) => {
  const educationalInfo = [
    { label: "ABC ID", value: studentData?.abc_id || "---", icon: <IdCard className="w-4 h-4 text-white" />, color: "bg-indigo-500" },
    { label: "University App No", value: studentData?.university_app_number || "---", icon: <IdCard className="w-4 h-4 text-white" />, color: "bg-blue-500" },
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
          <div key={index} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg shadow-sm ${info.color} scale-90`}>
                {info.icon}
              </div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-bold ml-10 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection("Academic Identifiers", <GraduationCap size={20} />, educationalInfo)}

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Previous Qualifications</h3>
        </div>

        <div className="bg-gradient-to-br from-indigo-50/30 to-white p-12 rounded-[2rem] border border-indigo-100/50 text-center shadow-inner">
          <div className="bg-indigo-100/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <GraduationCap size={32} />
          </div>
          <p className="text-gray-400 font-bold tracking-tight">No historical education records found.</p>
          <p className="text-gray-300 text-xs mt-2 font-medium">Additional qualifications can be added by the admin.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentEducationalDetails;
