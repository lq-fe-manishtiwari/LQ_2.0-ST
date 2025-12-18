import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Landmark,
  Layers,
  Crown,
  User,
  Edit,
  UserX,
} from "lucide-react";
import CommitteeEditModal from "./CommitteeEditModal";

/* 🔹 HARD CODED COMMITTEE DATA */
const INITIAL_COMMITTEE_DATA = [
  {
    level: "College Level",
    icon: GraduationCap,
    badgeColor: "bg-blue-100 text-blue-700",
    chairperson: ["Academic Council"],
    member: [
      "Examination Committee",
      "Disciplinary Committee",
      "Anti-Ragging Committee",
      "Library Committee",
    ],
  },
  {
    level: "University Level",
    icon: Landmark,
    badgeColor: "bg-purple-100 text-purple-700",
    chairperson: ["Board of Studies (Computer Science)"],
    member: [
      "University Examination Panel",
      "Curriculum Development Committee",
    ],
  },
  {
    level: "Others",
    icon: Layers,
    badgeColor: "bg-green-100 text-green-700",
    chairperson: ["NAAC Peer Team Coordination Committee"],
    member: [
      "Admission Monitoring Committee",
      "Grievance Redressal Cell",
    ],
  },
];

export default function Committee() {
  const { filters } = useOutletContext() || {};
  const [committeeData, setCommitteeData] = useState(INITIAL_COMMITTEE_DATA);
  const [editingCommittee, setEditingCommittee] = useState(null);

  if (!filters?.programId || !filters?.teacherId) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
          <UserX className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-600">
            No Teacher Selected
          </p>
          <p className="text-sm mt-1 max-w-sm">
            Please select a <span className="font-medium">Program</span> and a{" "}
            <span className="font-medium">Teacher</span> from the filters above to
            view committee details.
          </p>
        </div>
      );
    }

  const handleSave = (updatedCommittee) => {
    setCommitteeData((prev) =>
      prev.map((c) =>
        c.level === updatedCommittee.level ? updatedCommittee : c
      )
    );
    setEditingCommittee(null);
  };

  return (
    <div className="mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Committee Memberships
        </h2>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {committeeData.map((committee, index) => {
          const LevelIcon = committee.icon;

          return (
            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm p-5 relative"
            >
              {/* Edit Button */}
              <button
                onClick={() => setEditingCommittee(committee)}
                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100"
                title="Edit Committee"
              >
                <Edit className={`w-4 h-4 text-blue-600 ${committee.badgeColor}`} />
              </button>

              {/* Level Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LevelIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-800">
                    {committee.level}
                  </h3>
                </div>

                {/* <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${committee.badgeColor}`}
                >
                  Level
                </span> */}
              </div>

              {/* Chairperson */}
              <div className="mb-4 border-l-2 border-blue-200 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-gray-700">
                    As Chairperson
                  </p>
                </div>

                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {committee.chairperson.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Member */}
              <div className="border-l-2 border-gray-200 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="font-semibold text-gray-700">
                    As Member
                  </p>
                </div>

                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {committee.member.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 Edit Modal */}
      {editingCommittee && (
        <CommitteeEditModal
          committee={editingCommittee}
          onClose={() => setEditingCommittee(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
