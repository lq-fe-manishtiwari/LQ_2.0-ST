'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, Award, 
  Upload, FileText, CheckCircle, AlertCircle, Edit2, Save 
} from 'lucide-react';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profile, setProfile] = useState({
    // Personal Details
    fullName: 'Rahul Kumar',
    rollNumber: 'CS2021001',
    dateOfBirth: '2003-05-15',
    gender: 'Male',
    category: 'General',
    
    // Academic Details
    tenth_percentage: '85.5',
    twelfth_percentage: '88.2',
    graduation_cgpa: '8.5',
    backlogs: '0',
    year: '4th Year',
    department: 'Computer Science',
    specialization: 'AI & ML',
    
    // Contact Information
    email: 'rahul.kumar@college.edu',
    phone: '+91 9876543210',
    alternatePhone: '+91 9876543211',
    address: '123, MG Road, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    
    // Documents
    resumeUrl: null,
    resumeName: null,
    resumeSize: null,
    uploadDate: null
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    calculateProfileCompletion();
  }, [profile]);

  const calculateProfileCompletion = () => {
    const requiredFields = [
      'fullName', 'rollNumber', 'dateOfBirth', 'gender', 'category',
      'tenth_percentage', 'twelfth_percentage', 'graduation_cgpa', 'backlogs',
      'email', 'phone', 'address', 'resumeUrl'
    ];
    
    const filledFields = requiredFields.filter(field => profile[field]).length;
    const completion = Math.round((filledFields / requiredFields.length) * 100);
    setProfileCompletion(completion);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size should not exceed 2MB!');
      return;
    }

    // Check naming convention: RollNo_Name_Resume.pdf
    const expectedName = `${profile.rollNumber}_${profile.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    
    // Simulate upload
    setProfile(prev => ({
      ...prev,
      resumeUrl: URL.createObjectURL(file),
      resumeName: file.name,
      resumeSize: (file.size / 1024).toFixed(2) + ' KB',
      uploadDate: new Date().toLocaleDateString()
    }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'academic', label: 'Academic Details', icon: BookOpen },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your placement profile</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all w-full sm:w-auto justify-center ${
              isEditing 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={loading}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-bold text-blue-600">{profileCompletion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        {profileCompletion < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            Complete your profile to apply for placements
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                <input
                  type="text"
                  value={profile.rollNumber}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
              </div>
            </div>
          )}

          {/* Academic Details Tab */}
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">10th Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.tenth_percentage}
                  onChange={(e) => handleInputChange('tenth_percentage', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">12th Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.twelfth_percentage}
                  onChange={(e) => handleInputChange('twelfth_percentage', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Graduation CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.graduation_cgpa}
                  onChange={(e) => handleInputChange('graduation_cgpa', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Active Backlogs</label>
                <input
                  type="number"
                  value={profile.backlogs}
                  onChange={(e) => handleInputChange('backlogs', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  value={profile.year}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  value={profile.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  value={profile.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Resume</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    PDF only, max 2MB<br />
                    Naming: {profile.rollNumber}_Name_Resume.pdf
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                </div>
              </div>

              {profile.resumeUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">Resume Uploaded</h4>
                      <p className="text-sm text-green-700 mt-1">
                        <strong>File:</strong> {profile.resumeName}<br />
                        <strong>Size:</strong> {profile.resumeSize}<br />
                        <strong>Uploaded:</strong> {profile.uploadDate}
                      </p>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
