'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Mail, BookOpen, Upload, FileText,
  CheckCircle, Edit2, Save
} from 'lucide-react';
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
        rollNumber: d.roll_number,
        dateOfBirth: toInputDate(d.date_of_birth),
        gender: d.gender === 'MALE' ? 'Male' : d.gender === 'FEMALE' ? 'Female' : 'Other',
        category: d.cast_category || '',
        tenth_percentage: '',
        twelfth_percentage: '',
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
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  /* ========= PROFILE COMPLETION ========= */
  useEffect(() => {
    const requiredFields = [
      'fullName', 'rollNumber', 'dateOfBirth', 'gender',
      'email', 'phone', 'address', 'resumeUrl'
    ];

    const filled = requiredFields.filter(
      (field) => profile[field]
    ).length;

    setProfileCompletion(
      Math.round((filled / requiredFields.length) * 100)
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
      alert('Only PDF files allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Max size 2MB');
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
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
    {/* Header */}
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your placement profile
        </p>
      </div>

      <button
        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition
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
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${profileCompletion}%` }}
        />
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white rounded-2xl shadow-sm">
      <div className="flex gap-2 p-2 border-b overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'}
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
          <div className="bg-white rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Full Name
                </label>
                <input
                  className="input"
                  value={profile.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Roll Number
                </label>
                <input
                  className="input bg-gray-100"
                  value={profile.rollNumber}
                  disabled
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="input"
                  value={profile.dateOfBirth}
                  onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Gender
                </label>
                <select
                  className="input"
                  value={profile.gender}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  disabled={!isEditing}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
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
