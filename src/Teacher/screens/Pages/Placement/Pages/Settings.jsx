'use client';

import React, { useState } from 'react';
import { Save, Upload, Settings as SettingsIcon, Shield, Users, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('eligibility');
  const [eligibility, setEligibility] = useState({
    minCGPA: '6.0',
    maxBacklogs: '2',
    allowActiveBacklogs: false
  });

  const [placementRules, setPlacementRules] = useState({
    oneOfferPerStudent: true,
    lockAfterSelection: true,
    allowOptOut: true
  });

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Settings Saved!',
      text: 'Your settings have been updated successfully',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const tabs = [
    { id: 'eligibility', label: 'Eligibility Criteria', icon: Users },
    { id: 'rules', label: 'Placement Rules', icon: Shield },
    { id: 'policy', label: 'Policy Documents', icon: FileText },
    { id: 'system', label: 'System Settings', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Placement Settings</h2>
            <p className="text-gray-600 mt-1">Configure placement policies and rules</p>
          </div>
          <button
            onClick={() => navigate('/teacher/placement')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

      {/* Tabs */}
      <div className="mb-2 sm:mb-4">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-link whitespace-nowrap text-center px-3 py-2 text-xs sm:text-sm ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eligibility Criteria Tab */}
      {activeTab === 'eligibility' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Eligibility Criteria</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                value={eligibility.minCGPA}
                onChange={(e) => setEligibility({ ...eligibility, minCGPA: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Backlogs Allowed</label>
              <input
                type="number"
                value={eligibility.maxBacklogs}
                onChange={(e) => setEligibility({ ...eligibility, maxBacklogs: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activeBacklogs"
                checked={eligibility.allowActiveBacklogs}
                onChange={(e) => setEligibility({ ...eligibility, allowActiveBacklogs: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="activeBacklogs" className="text-sm font-medium text-gray-700">
                Allow students with active backlogs
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Placement Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Placement Rules</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">One Offer Per Student</p>
                <p className="text-sm text-gray-600">Students can accept only one job offer</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={placementRules.oneOfferPerStudent}
                  onChange={(e) => setPlacementRules({ ...placementRules, oneOfferPerStudent: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Lock After Selection</p>
                <p className="text-sm text-gray-600">Lock student profile after job acceptance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={placementRules.lockAfterSelection}
                  onChange={(e) => setPlacementRules({ ...placementRules, lockAfterSelection: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Allow Opt-Out</p>
                <p className="text-sm text-gray-600">Students can opt-out of placement process</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={placementRules.allowOptOut}
                  onChange={(e) => setPlacementRules({ ...placementRules, allowOptOut: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Policy Documents Tab */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Policy Documents</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Placement Assistance Policy</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Undertaking Form</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Settings</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>2024-25</option>
                <option>2023-24</option>
                <option>2022-23</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
      </div>
    </div>
  );
}
