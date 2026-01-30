import React from "react";
import { Bus, User, Phone } from "lucide-react";

const StudentTransportDetails = ({ studentData }) => {
  const transportInfo = [
    { label: "Mode of Transport", value: studentData?.transport_mode || "Not provided", icon: <Bus className="w-5 h-5 text-orange-500" /> },
    { label: "Bus Number", value: studentData?.bus_number || "Not provided", icon: <Bus className="w-5 h-5 text-orange-500" /> },
    { label: "Bus Stop", value: studentData?.bus_stop || "Not provided", icon: <Bus className="w-5 h-5 text-orange-500" /> },
    { label: "Driver Name", value: studentData?.driver_name || "Not provided", icon: <User className="w-5 h-5 text-blue-600" /> },
    { label: "Driver Phone", value: studentData?.driver_phone || "Not provided", icon: <Phone className="w-5 h-5 text-green-600" /> },
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
      {renderSection("Transport Information", <Bus />, transportInfo, "text-orange-500")}
    </div>
  );
};

export default StudentTransportDetails;
