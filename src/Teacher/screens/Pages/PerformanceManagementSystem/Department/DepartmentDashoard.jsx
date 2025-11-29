import React, { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DepartmentDashboard() {
  const initialDepartments = [
    { id: 1, name: "Statistics 2", institute: "TWT" },
    { id: 2, name: "Computer Science", institute: "Engineering" },
    { id: 3, name: "Business Administration", institute: "Management" },
    { id: 4, name: "Electrical Engineering", institute: "Engineering" },
    { id: 5, name: "Psychology", institute: "Social Sciences" },
  ];

  const [departments, setDepartments] = useState(initialDepartments);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.institute.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteDepartment = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-6xl mx-auto flex flex-col items-center">

        {/* Search Box Center */}
        <div className="mb-6 flex justify-center w-full">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-3 flex items-left text-gray-400">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 
                  4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search departments..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md 
                         text-sm focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Centered Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg 
                        overflow-hidden w-full max-w-3xl mx-auto">
          
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Department Name
                </th>

                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Institute
                </th>

                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                      {dept.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                      {dept.institute}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="p-2.5 rounded-lg bg-orange-50 text-orange-600 
                                   hover:bg-orange-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-6 text-center text-gray-500 text-sm"
                  >
                    No departments found matching your search.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </main>
    </div>
  );
}
