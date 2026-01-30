import React from "react";
import { Bus, User, Phone } from "lucide-react";

const StudentTransportDetails = ({ studentData }) => {
  const transportInfo = [
    { label: "Transport Mode", value: studentData?.transport_mode || "---", icon: <Bus size={14} className="text-white" />, color: "bg-orange-500" },
    { label: "Bus Number", value: studentData?.bus_number || "---", icon: <Bus size={14} className="text-white" />, color: "bg-orange-600" },
    { label: "Bus Stop", value: studentData?.bus_stop || "---", icon: <Bus size={14} className="text-white" />, color: "bg-orange-400" },
    { label: "Driver Name", value: studentData?.driver_name || "---", icon: <User size={14} className="text-white" />, color: "bg-blue-600" },
    { label: "Driver Contact", value: studentData?.driver_phone || "---", icon: <Phone size={14} className="text-white" />, color: "bg-green-600" },
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
          <div key={index} className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg shadow-sm ${info.color} scale-90`}>
                {info.icon}
              </div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {info.label}
              </label>
            </div>
            <p className="text-gray-900 font-bold ml-10 text-sm sm:text-base group-hover:text-orange-600 transition-colors">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection("Commutation Info", <Bus size={20} />, transportInfo)}
    </div>
  );
};

export default StudentTransportDetails;
