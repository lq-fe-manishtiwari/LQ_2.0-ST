import React from 'react';
import { Eye, X } from 'lucide-react';

const DocumentViewer = ({ isOpen, document, onClose }) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4 sm:px-0">
      <div className="bg-white p-0 rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn border border-gray-100">
        {/* Header */}
        <div className="p-6 rounded-t-3xl" style={{backgroundColor: 'rgb(33 98 193 / var(--tw-bg-opacity, 1))'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Document Viewer
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
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <h4 className="font-semibold text-blue-700 text-sm uppercase tracking-wide mb-1">File Name</h4>
            <p className="text-gray-900 font-medium">{document.fileName}</p>
          </div>
          
          {/* Document Preview Area */}
          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">Document Preview</p>
                <p className="text-gray-500 text-xs">Document content will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;