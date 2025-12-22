import React from 'react';
import { X, User, Briefcase, Building2, ClipboardList } from 'lucide-react';

const RoleModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4 sm:px-0">
      <div className="bg-white p-0 rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn border border-gray-100">
        {/* Header */}
        <div className="p-6 rounded-t-3xl" style={{backgroundColor: 'rgb(33 98 193 / var(--tw-bg-opacity, 1))'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Employee Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-blue-600 mb-1">EMPLOYEE NAME</label>
              <p className="text-gray-900 font-semibold text-lg">{employee.employeeName || employee.employee || employee.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-green-600 mb-1">ROLE</label>
                <p className="text-gray-900 font-medium">{employee.roleDisplay || employee.roleName || employee.role}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-purple-600 mb-1">DEPARTMENT</label>
                <p className="text-gray-900 font-medium">{employee.departmentName || employee.department}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-orange-600" />
              </div>
              <label className="block text-xs font-medium text-orange-600">ROLES & RESPONSIBILITIES</label>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <ul className="text-gray-700 leading-relaxed space-y-2">
                {employee.responsibility?.split(/[,\n]/).filter(item => item.trim()).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;