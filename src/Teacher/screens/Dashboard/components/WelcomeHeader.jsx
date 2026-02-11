import React from 'react';

const WelcomeHeader = ({
  profileImage,
  fullName,
  designation,
  userType,
  onViewProfile
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={onViewProfile}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-blue-200 hover:border-blue-300">
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {fullName || 'User'}!
            </h1>
            {designation && (
              <p className="text-xs sm:text-base text-gray-600 mb-2">{designation}</p>
            )}
            <div className="flex items-center space-x-3">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                {userType || 'User'}
              </span>
              <button
                onClick={onViewProfile}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
          <div className="text-gray-500 text-xs sm:text-sm bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none inline-block">
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