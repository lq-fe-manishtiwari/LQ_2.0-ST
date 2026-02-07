import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

export default function CommitteeEditModal({ committee, onClose, onSave }) {
  const [chairperson, setChairperson] = useState(
    committee.chairperson.length ? committee.chairperson : [""]
  );
  const [member, setMember] = useState(
    committee.member.length ? committee.member : [""]
  );

  const handleChange = (list, setter, index, value) => {
    const updated = [...list];
    updated[index] = value;
    setter(updated);
  };

  const handleAdd = (list, setter) => {
    setter([...list, ""]);
  };

  const handleRemove = (list, setter, index) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSave({
      ...committee,
      chairperson: chairperson.filter(Boolean),
      member: member.filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/* Modal */}
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">

        {/* 🔹 Header (Fixed) */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            Edit {committee.level}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 🔹 Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

          <Section
            title="Chairperson Committees"
            items={chairperson}
            onChange={(i, v) =>
              handleChange(chairperson, setChairperson, i, v)
            }
            onAdd={() => handleAdd(chairperson, setChairperson)}
            onRemove={(i) =>
              handleRemove(chairperson, setChairperson, i)
            }
          />

          <Section
            title="Member Committees"
            items={member}
            onChange={(i, v) =>
              handleChange(member, setMember, i, v)
            }
            onAdd={() => handleAdd(member, setMember)}
            onRemove={(i) =>
              handleRemove(member, setMember, i)
            }
          />
        </div>

        {/* 🔹 Footer (Fixed) */}
        <div className="px-6 py-4 border-t bg-white flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable Input Section */
const Section = ({ title, items, onChange, onAdd, onRemove }) => (
  <div>
    <label className="block text-sm font-semibold mb-2">{title}</label>

    <div className="space-y-2">
      {items.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Enter committee name"
          />
          <button
            onClick={() => onRemove(index)}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>

    <button
      onClick={onAdd}
      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
    >
      <Plus className="w-4 h-4" />
      Add Committee
    </button>
  </div>
);
