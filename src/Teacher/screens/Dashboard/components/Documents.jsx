import React, { useState } from "react";

const Documents = ({ userProfile }) => {
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const documentCategories = [
    {
      id: "personal",
      name: "Personal Documents",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      documents: userProfile?.documents?.filter(d => d.category === 'personal') || [],
    },
    {
      id: "educational",
      name: "Educational Certificates",
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
      ),
      documents: userProfile?.documents?.filter(d => d.category === 'educational') || [],
    },
    {
      id: "professional",
      name: "Professional Documents",
      icon: (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
          />
        </svg>
      ),
      documents: userProfile?.documents?.filter(d => d.category === 'professional') || [],
    },
    {
      id: "medical",
      name: "Medical Documents",
      icon: (
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      documents: userProfile?.documents?.filter(d => d.category === 'medical') || [],
    },
  ];

  const handleFileUpload = (categoryId, docName) => {
    setUploadingDoc(`${categoryId}-${docName}`);
    setTimeout(() => {
      setUploadingDoc(null);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "uploaded":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✔ Uploaded
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Document Management
        </h3>

        <div className="text-sm text-gray-500">
          Total:{" "}
          {documentCategories.reduce((acc, cat) => acc + cat.documents.length, 0)}{" "}
          documents
        </div>
      </div>

      {/* Categories */}
      {documentCategories.map((category) => (
        <div key={category.id} className="bg-white rounded-lg border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-3">
                {category.icon}
                <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
              </div>

              <div className="text-sm text-gray-500">
                {category.documents.filter((doc) => doc.status === "uploaded").length} /{" "}
                {category.documents.length} uploaded
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {category.documents.map((doc, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                {/* Left */}
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <svg
                    className={`w-8 h-8 ${doc.status === "uploaded" ? "text-green-500" : "text-gray-400"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>

                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{doc.name}</div>
                    {doc.uploadDate && (
                      <div className="text-sm text-gray-500">
                        Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}{" "}
                        {doc.size && `• ${doc.size}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center flex-wrap gap-2">
                  {getStatusBadge(doc.status)}

                  {doc.status === "uploaded" ? (
                    <div className="flex space-x-3 text-sm">
                      <button className="text-blue-600">View</button>
                      <button className="text-green-600">Download</button>
                      <button className="text-orange-600">Replace</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFileUpload(category.id, doc.name)}
                      disabled={uploadingDoc === `${category.id}-${doc.name}`}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {uploadingDoc === `${category.id}-${doc.name}` ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Upload
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Upload Guidelines
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Max file size: 5MB</li>
          <li>• Supported: PDF, JPG, PNG, DOC, DOCX</li>
          <li>• Ensure clarity & readability</li>
          <li>• All info must be visible</li>
          <li>• Documents should be recent</li>
        </ul>
      </div>
    </div>
  );
};

export default Documents;
