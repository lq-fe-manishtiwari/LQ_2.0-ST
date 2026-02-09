import React, { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  Landmark,
  Layers,
  Crown,
  User,
  Loader2,
  Edit,
} from "lucide-react";
import { committeeService } from "../Services/committee.service";
import CommitteeEditModal from "./CommitteeEditModal";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

export default function Committee() {
  const userProfile = useUserProfile();
  const [committeeData, setCommitteeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);
  const [existingRecordId, setExistingRecordId] = useState(null);

  const teacherId = userProfile.getTeacherId();
  const collegeId = userProfile.getCollegeId();

  useEffect(() => {
    if (userProfile.isLoaded && teacherId) {
      fetchCommittees();
    }
  }, [userProfile.isLoaded, teacherId]);

  const fetchCommittees = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try fetching detailed level data first
      const detailData = await committeeService.getFacultyCommitteeDetailsByTeacherId({ teacher_id: teacherId });

      if (detailData && detailData.id) {
        // Use detailed data as long as a record exists
        setExistingRecordId(detailData.id);
        const formatted = formatDetailedCommittees(detailData);
        setCommitteeData(formatted);
      } else {
        // 2. Fallback to basic committee data if detailed is empty
        setExistingRecordId(null);
        let basicData = [];
        if (collegeId) {
          basicData = await committeeService.getCommitteesByTeacherAndCollege(teacherId, collegeId);
        }

        // Group basic data ALWAYS into "College Level" as requested
        const grouped = groupCommitteesInCollegeLevel(basicData || []);
        setCommitteeData(grouped);
      }
    } catch (err) {
      console.error('Error fetching committees:', err);
      setError('Failed to load committee data');
      setCommitteeData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDetailedCommittees = (data) => {
    const levels = [
      {
        level: 'College Level',
        icon: GraduationCap,
        badgeColor: 'bg-blue-100 text-blue-700',
        chairperson: data.college_level_chairperson || [],
        member: data.college_level_member || [],
      },
      {
        level: 'University Level',
        icon: Landmark,
        badgeColor: 'bg-purple-100 text-purple-700',
        chairperson: data.university_level_chairperson || [],
        member: data.university_level_member || [],
      },
      {
        level: 'Others',
        icon: Layers,
        badgeColor: 'bg-green-100 text-green-700',
        chairperson: data.other_level_chairperson || [],
        member: data.other_level_member || [],
      },
    ];
    return levels;
  };

  const groupCommitteesInCollegeLevel = (data) => {
    // Initialize three levels
    const levels = [
      {
        level: 'College Level',
        icon: GraduationCap,
        badgeColor: 'bg-blue-100 text-blue-700',
        chairperson: [],
        member: [],
      },
      {
        level: 'University Level',
        icon: Landmark,
        badgeColor: 'bg-purple-100 text-purple-700',
        chairperson: [],
        member: [],
      },
      {
        level: 'Others',
        icon: Layers,
        badgeColor: 'bg-green-100 text-green-700',
        chairperson: [],
        member: [],
      },
    ];

    // Group committees by member_type, but ALWAYS in College Level
    data.forEach(item => {
      if (item.member_type?.toUpperCase() === 'CHAIRPERSON') {
        if (!levels[0].chairperson.includes(item.committee_name)) {
          levels[0].chairperson.push(item.committee_name);
        }
      } else {
        if (!levels[0].member.includes(item.committee_name)) {
          levels[0].member.push(item.committee_name);
        }
      }
    });

    return levels;
  };

  const handleEdit = (committee) => {
    setEditingCommittee(committee);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedCommittee) => {
    const updatedData = committeeData.map(c =>
      c.level === updatedCommittee.level ? updatedCommittee : c
    );

    // Prepare payload
    const payload = {
      college_id: Number(collegeId),
      teacher_id: Number(teacherId),
      college_level_chairperson: updatedData.find(c => c.level === 'College Level')?.chairperson || [],
      college_level_member: updatedData.find(c => c.level === 'College Level')?.member || [],
      university_level_chairperson: updatedData.find(c => c.level === 'University Level')?.chairperson || [],
      university_level_member: updatedData.find(c => c.level === 'University Level')?.member || [],
      other_level_chairperson: updatedData.find(c => c.level === 'Others')?.chairperson || [],
      other_level_member: updatedData.find(c => c.level === 'Others')?.member || [],
    };

    if (existingRecordId) {
      payload.id = existingRecordId;
    }

    setLoading(true);
    try {
      if (existingRecordId) {
        await committeeService.updateFacultyCommitteeDetails(payload);
      } else {
        await committeeService.saveFacultyCommitteeDetails(payload);
      }

      setCommitteeData(updatedData);
      setShowEditModal(false);
      setEditingCommittee(null);


      fetchCommittees();
    } catch (err) {
      console.error('Error saving committee details:', err);

      setCommitteeData(updatedData);
      setShowEditModal(false);
      setEditingCommittee(null);
    } finally {
      setLoading(false);
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading committee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchCommittees}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Committee Memberships
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {committeeData.map((level, index) => {
          const LevelIcon = level.icon;
          const hasData = level.chairperson.length > 0 || level.member.length > 0;

          return (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Level Header */}
              <div className={`p-4 ${level.badgeColor.split(' ')[0]} border-b border-gray-100 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                    <LevelIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-800">
                    {level.level}
                  </h3>
                </div>
                {/* 🔹 Edit Button */}
                <button
                  onClick={() => handleEdit(level)}
                  className="p-2 rounded-lg hover:bg-white/50 text-gray-600 transition-colors"
                  title="Edit Committees"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {!hasData ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium italic">No committees assigned</p>
                  </div>
                ) : (
                  <>
                    {/* Chairperson */}
                    {level.chairperson.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg w-fit">
                          <Crown className="w-4 h-4 text-primary-600" />
                          <p className="font-bold text-[11px] text-primary-700 uppercase tracking-widest leading-none mt-0.5">
                            As Chairperson
                          </p>
                        </div>

                        <ul className="space-y-2">
                          {level.chairperson.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0"></span>
                              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Member */}
                    {level.member.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg w-fit">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="font-bold text-[11px] text-gray-600 uppercase tracking-widest leading-none mt-0.5">
                            As Member
                          </p>
                        </div>

                        <ul className="space-y-2">
                          {level.member.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0"></span>
                              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showEditModal && editingCommittee && (
        <CommitteeEditModal
          committee={editingCommittee}
          onClose={() => {
            setShowEditModal(false);
            setEditingCommittee(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
