import React from "react";

export default function TabularView() {
  // Sample student data
  const students = [
    { id: 1, name: "John Doe", class: "10A", status: "Allocated" },
    { id: 2, name: "Jane Smith", class: "10B", status: "Non-Allocated" },
    { id: 3, name: "Bob Johnson", class: "10C", status: "ATKT" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Name</th>
            <th className="px-4 py-2 border-b">Class</th>
            <th className="px-4 py-2 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b">{student.id}</td>
              <td className="px-4 py-2 border-b">{student.name}</td>
              <td className="px-4 py-2 border-b">{student.class}</td>
              <td className="px-4 py-2 border-b">{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
