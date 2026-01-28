'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import PlacementRules from '../Settings/PlacementRules';
import ConsentPolicy from '../Settings/ConsentPolicy';
import Companies from '../Settings/Companies';
import EligibilityCriteria from '../Settings/EligibilityCriteria';
import JobRoles from '../Settings/JobRoles';
import InterviewRounds from '../Settings/InterviewRounds';
import RegistrationFormConfigurations from '../Settings/RegistrationFormConfigurations';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('eligibility');

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
    { id: 'eligibility', label: 'Eligibility Criteria' },
    { id: 'rules', label: 'Placement Rules' },
    { id: 'policy', label: 'Consent Policy' },
    { id: 'roles', label: 'Job Roles' },
    { id: 'rounds', label: 'Interview Rounds' },
    { id: 'companies', label: 'Companies' },
    { id: 'RegistrationForm', label: 'Registration Form Configuration' }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="pageheading">Placement Settings</h2>
          <p className="text-gray-600 mt-1">Configure placement policies and rules</p>
        </div>
        <button
          onClick={() => navigate('/placement')}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-start gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-link whitespace-nowrap w-auto flex items-center gap-2 flex-shrink-0 px-4 py-2 text-sm cursor-default ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'eligibility' && <EligibilityCriteria />}
      {activeTab === 'rules' && <PlacementRules />} 
      {activeTab === 'policy' && <ConsentPolicy />}
      {activeTab === 'roles' && <JobRoles />}
      {activeTab === 'rounds' && <InterviewRounds />}
      {activeTab === 'companies' && <Companies />}
      {activeTab === 'RegistrationForm' && <RegistrationFormConfigurations />}
    </div>
  );
}
