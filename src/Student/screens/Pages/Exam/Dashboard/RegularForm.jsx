import React, { useState } from "react";
import { X } from "lucide-react";

const RegularForm = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MAIN PAGE */}
      <div className="p-6 bg-white rounded-lg">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full sm:w-[300px] px-4 py-2 border border-gray-300 rounded-lg"
          />

          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
          >
            Fill Form
          </button>
        </div>

        <h2 className="text-4xl font-semibold text-gray-500 mb-2">
          Submitted Exam Forms
        </h2>

        <p className="text-lg text-gray-500">
          No exam forms found.
        </p>
      </div>

      {/* ================= MODAL ================= */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[95%] max-w-6xl rounded-xl shadow-lg overflow-hidden">

            {/* Header */}
            <div className="bg-[#6b74a6] px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Exam Registration Form
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="font-semibold">Name</label>
                  <input
                    value="Rajesh Patil"
                    disabled
                    className="w-full mt-2 p-3 bg-gray-100 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold">Enrollment No.</label>
                  <input
                    value="454"
                    disabled
                    className="w-full mt-2 p-3 bg-gray-100 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold">Roll No.</label>
                  <input
                    value="123"
                    disabled
                    className="w-full mt-2 p-3 bg-gray-100 border rounded-lg"
                  />
                </div>
              </div>

              {/* Course Table */}
              <h4 className="font-semibold mb-3">Select Course</h4>

              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="p-3">Sr No.</th>
                      <th className="p-3">Vertical</th>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Name</th>
                      <th className="p-3">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center bg-gray-50">
                      <td className="p-3">1</td>
                      <td className="p-3">Vertical 3 Open Elective Basket</td>
                      <td className="p-3">-</td>
                      <td className="p-3">Ninja</td>
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                    </tr>
                    <tr className="text-center">
                      <td className="p-3">2</td>
                      <td className="p-3">Vertical 2 Minor Basket</td>
                      <td className="p-3">-</td>
                      <td className="p-3">BEM1</td>
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setOpen(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button className="bg-blue-400 text-white px-6 py-2 rounded-lg">
                  Pay & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegularForm;
