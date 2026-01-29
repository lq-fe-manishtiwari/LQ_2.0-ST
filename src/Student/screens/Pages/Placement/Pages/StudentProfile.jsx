'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Mail, BookOpen, Upload, FileText,
  CheckCircle, Edit2, Save
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { api } from '../../../../../_services/api';

/* ========= HELPERS ========= */
const toInputDate = (iso) =>
  iso ? new Date(iso).toISOString().split('T')[0] : '';

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [profile, setProfile] = useState({
    fullName: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    graduation_cgpa: '',
    backlogs: '',
    year: '',
    department: '',
    specialization: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    resumeUrl: null,
    resumeName: null,
    resumeSize: null,
    uploadDate: null
  });

  const [alert, setAlert] = useState(null);

  /* ========= FETCH PROFILE ========= */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getUserProfile();
      const d = res.data;

      setProfile({
        fullName: `${d.firstname} ${d.middlename || ''} ${d.lastname}`.trim(),
        rollNumber: d.roll_number || d.permanent_registration_number,
        dateOfBirth: toInputDate(d.date_of_birth),
        gender: d.gender === 'MALE' ? 'Male' : d.gender === 'FEMALE' ? 'Female' : 'Other',
        category: d.cast_category || '',
        tenth_percentage: d.education_details?.find(e => e.qualification === '10th')?.percentage || '',
        twelfth_percentage: d.education_details?.find(e => e.qualification === '12th')?.percentage || '',
        graduation_cgpa: '',
        backlogs: '',
        year: d.class_year || '',
        department: '',
        specialization: '',
        email: d.email,
        phone: d.mobile,
        alternatePhone: d.parents_mobile || '',
        address: d.address_line1,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        resumeUrl: null,
        resumeName: null,
        resumeSize: null,
        uploadDate: null
      });
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to load profile
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  /* ========= PROFILE COMPLETION ========= */
  useEffect(() => {
    const allFields = [
      'fullName', 'rollNumber', 'dateOfBirth', 'gender', 'category',
      'tenth_percentage', 'twelfth_percentage', 'graduation_cgpa', 'backlogs',
      'year', 'department', 'specialization', 'email', 'phone', 'alternatePhone',
      'address', 'city', 'state', 'pincode', 'resumeUrl'
    ];

    const filled = allFields.filter(
      (field) => profile[field] && profile[field] !== ''
    ).length;

    setProfileCompletion(
      Math.round((filled / allFields.length) * 100)
    );
  }, [profile]);

  /* ========= HANDLERS ========= */
  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setAlert(
        <SweetAlert
          error
          title="Invalid File!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Only PDF files are allowed
        </SweetAlert>
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAlert(
        <SweetAlert
          error
          title="File Too Large!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Maximum file size is 2MB
        </SweetAlert>
      );
      return;
    }

    setProfile(prev => ({
      ...prev,
      resumeUrl: URL.createObjectURL(file),
      resumeName: file.name,
      resumeSize: (file.size / 1024).toFixed(2) + ' KB',
      uploadDate: new Date().toLocaleDateString()
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const [first, ...rest] = profile.fullName.split(' ');

      await api.updateUserProfile({
        firstname: first,
        lastname: rest.join(' '),
        mobile: profile.phone,
        parents_mobile: profile.alternatePhone,
        gender: profile.gender.toUpperCase(),
        date_of_birth: profile.dateOfBirth,
        address_line1: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode
      });

      setIsEditing(false);
      setAlert(
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Profile updated successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to update profile
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========= TABS ========= */
  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'academic', label: 'Academic Details', icon: BookOpen },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

return (
  <div className="min-h-screen bg-gray-50 p-4 md:p-8">
    {alert}
    
    {/* Header */}
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete your placement profile
        </p>
      </div>

      <button
        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${isEditing
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'}
        `}
      >
        {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
        {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
      </button>
    </div>

    {/* Profile Completion */}
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Profile Completion
        </span>
        <span className="text-sm font-semibold text-blue-600">
          {profileCompletion}%
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${profileCompletion}%` }}
        />
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-800'}
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {/* PERSONAL */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Roll Number
                </label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg border bg-gray-50 border-gray-200 text-gray-500"
                  value={profile.rollNumber}
                  disabled
                  placeholder="Auto-generated"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.dateOfBirth}
                  onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Gender
                </label>
                <select
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.gender}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Alternate Phone
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.alternatePhone}
                  onChange={e => handleInputChange('alternatePhone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter alternate phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  City
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  State
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your state"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pincode
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.pincode}
                  onChange={e => handleInputChange('pincode', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your pincode"
                />
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your category"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  10th Percentage
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.tenth_percentage}
                  onChange={e => handleInputChange('tenth_percentage', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter 10th percentage"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  12th Percentage
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.twelfth_percentage}
                  onChange={e => handleInputChange('twelfth_percentage', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter 12th percentage"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Graduation CGPA
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.graduation_cgpa}
                  onChange={e => handleInputChange('graduation_cgpa', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter graduation CGPA"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Backlogs
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.backlogs}
                  onChange={e => handleInputChange('backlogs', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter number of backlogs"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Year
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.year}
                  onChange={e => handleInputChange('year', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter current year"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Department
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your department"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Specialization
                </label>
                <input
                  className={`w-full px-3 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white border-gray-300'
                  }`}
                  value={profile.specialization}
                  onChange={e => handleInputChange('specialization', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your specialization"
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center bg-blue-50">
              <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Upload Resume</h3>
              <p className="text-xs text-gray-600 mt-1">
                PDF only · Max 2MB
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                id="resume-upload"
                className="hidden"
              />

              <label
                htmlFor="resume-upload"
                className="inline-block mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition"
              >
                Choose File
              </label>
            </div>

            {profile.resumeUrl && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 p-4 rounded-xl">
                <CheckCircle className="text-green-600 mt-1" />
                <div>
                  <p className="font-medium text-green-900">
                    {profile.resumeName}
                  </p>
                  <p className="text-xs text-green-700">
                    Uploaded successfully
                  </p>
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
