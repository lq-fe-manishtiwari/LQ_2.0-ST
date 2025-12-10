import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Home,
  User,
  X,
  Check,
  Edit3,
  ShieldAlert,
} from "lucide-react";

const CommunicationDetails = ({ userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Build formatted address
  const formattedAddress = [
    userProfile?.address_line1,
    userProfile?.address_line2,
    userProfile?.city,
    userProfile?.state,
    userProfile?.country,
    userProfile?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // Form state (NO dummy data)
  const [formData, setFormData] = useState({
    email: userProfile?.email || "",
    phone: userProfile?.mobile || "",
    alternateEmail: userProfile?.alternate_email || "",
    alternatePhone: userProfile?.alternate_phone || "",
    emergencyContact: userProfile?.emergency_contact || "",
    emergencyPhone: userProfile?.emergency_phone || "",
    address: formattedAddress || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving communication details:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      email: userProfile?.email || "",
      phone: userProfile?.mobile || "",
      alternateEmail: userProfile?.alternate_email || "",
      alternatePhone: userProfile?.alternate_phone || "",
      emergencyContact: userProfile?.emergency_contact || "",
      emergencyPhone: userProfile?.emergency_phone || "",
      address: formattedAddress || "",
    });
    setIsEditing(false);
  };

  // Fields shown ALWAYS (Option A)
  const contactFields = [
    {
      key: "email",
      label: "Primary Email",
      type: "email",
      icon: <Mail className="w-5 h-5 text-blue-600" />,
    },
    {
      key: "alternateEmail",
      label: "Alternate Email",
      type: "email",
      icon: <Mail className="w-5 h-5 text-gray-500" />,
    },
    {
      key: "phone",
      label: "Primary Phone",
      type: "tel",
      icon: <Phone className="w-5 h-5 text-green-600" />,
    },
    {
      key: "alternatePhone",
      label: "Alternate Phone",
      type: "tel",
      icon: <Phone className="w-5 h-5 text-gray-500" />,
    },
  ];

  const emergencyFields = [
    {
      key: "emergencyContact",
      label: "Emergency Contact Name",
      type: "text",
      icon: <User className="w-5 h-5 text-red-600" />,
    },
    {
      key: "emergencyPhone",
      label: "Emergency Contact Phone",
      type: "tel",
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          Communication Details
        </h3>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* CONTACT INFORMATION */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
          <Mail className="w-4 h-4 text-blue-500 mr-2" />
          Contact Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactFields.map((field) => (
            <div key={field.key} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                {field.icon}
                <label className="block text-sm font-medium text-gray-700 ml-2">
                  {field.label}
                </label>
              </div>

              {isEditing ? (
                <input
                  type={field.type}
                  name={field.key}
                  value={formData[field.key]}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field.label}`}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {formData[field.key] || "Not provided"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
          <MapPin className="w-4 h-4 text-green-600 mr-2" />
          Address Information
        </h4>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center mb-2">
            <Home className="w-5 h-5 text-green-600" />
            <label className="block text-sm font-medium text-gray-700 ml-2">
              Address
            </label>
          </div>

          {isEditing ? (
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter your address"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-gray-900 font-medium">
              {formData.address || "Not provided"}
            </p>
          )}
        </div>
      </div>

      {/* EMERGENCY CONTACT */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
          <ShieldAlert className="w-4 h-4 text-red-500 mr-2" />
          Emergency Contact
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyFields.map((field) => (
            <div
              key={field.key}
              className="bg-red-50 p-4 rounded-lg border border-red-200"
            >
              <div className="flex items-center mb-2">
                {field.icon}
                <label className="block text-sm font-medium text-gray-700 ml-2">
                  {field.label}
                </label>
              </div>

              {isEditing ? (
                <input
                  type={field.type}
                  name={field.key}
                  value={formData[field.key]}
                  onChange={handleInputChange}
                  placeholder={`Enter ${field.label}`}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">
                  {formData[field.key] || "Not provided"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunicationDetails;
