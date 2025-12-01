import React from 'react';

const WelcomeHeader = ({ 
  profileImage, 
  fullName, 
  designation, 
  userType, 
  onViewProfile 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={onViewProfile}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-blue-200 hover:border-blue-300">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {fullName || 'User'}!
            </h1>
            {designation && (
              <p className="text-gray-600 mb-2">{designation}</p>
            )}
            <div className="flex items-center space-x-3">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {userType || 'User'}
              </span>
              <button
                onClick={onViewProfile}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;