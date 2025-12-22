import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserCircle, UserX } from "lucide-react";

/* 🔹 HARD CODED PROFILES */
const HARD_CODED_PROFILES = [
  {
    teacherId: "1",
    name: "Dr. Amit Sharma",
    department: "Computer Science",
    designation: "Associate Professor",
    qualification: "PhD (Computer Science)",
    dob: "1985-04-12",
    appointment_date: "2015-07-01",
    phone: "022-2456789",
    mobile: "9876543210",
    email: "amit.sharma@college.edu",
    address_local: "Andheri East, Mumbai",
    address_permanent: "Jaipur, Rajasthan",
  },
  {
    teacherId: "2",
    name: "Ms. Neha Verma",
    department: "Mathematics",
    designation: "Assistant Professor",
    qualification: "MSc Mathematics, B.Ed",
    dob: "1990-09-22",
    appointment_date: "2018-06-15",
    phone: "022-2233445",
    mobile: "9123456780",
    email: "neha.verma@college.edu",
    address_local: "Kothrud, Pune",
    address_permanent: "Indore, Madhya Pradesh",
  },
  {
    teacherId: "3",
    name: "Mr. Rajesh Kumar",
    department: "Physics",
    designation: "Professor",
    qualification: "PhD Physics",
    dob: "1978-01-05",
    appointment_date: "2010-01-10",
    phone: "011-4567890",
    mobile: "9988776655",
    email: "rajesh.kumar@college.edu",
    address_local: "Dwarka, Delhi",
    address_permanent: "Patna, Bihar",
  },
];

export default function UserProfile() {
  const { filters } = useOutletContext() || {};
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!filters?.teacherId) {
      setProfile(null);
      return;
    }

    // 🔴 FUTURE API
    // teacherProfileService.getTeacherProfileById(filters.teacherId).then(setProfile);

    const selected = HARD_CODED_PROFILES.find(
      (p) => p.teacherId === String(filters.teacherId)
    );

    setProfile(selected || null);
  }, [filters?.teacherId]);

  /* 🔹 EMPTY STATE */
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
          view profile details.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-gray-500 text-center py-10">
        No profile data found.
      </p>
    );
  }

  /* 🔹 INITIALS FOR AVATAR */
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">

      {/* Avatar + Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
          {initials}
        </div>

        <h3 className="mt-4 text-xl font-bold text-gray-800">
          {profile.name}
        </h3>

        <p className="text-sm text-gray-500">
          {profile.designation} · {profile.department}
        </p>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProfileItem label="Educational Qualification" value={profile.qualification} />
        <ProfileItem label="Date of Birth" value={profile.dob} />
        <ProfileItem label="Date of Appointment" value={profile.appointment_date} />
        <ProfileItem label="Phone Number" value={profile.phone} />
        <ProfileItem label="Mobile Number" value={profile.mobile} />
        <ProfileItem label="Email" value={profile.email} />
        <ProfileItem label="Local Address" value={profile.address_local} />
        <ProfileItem label="Permanent Address" value={profile.address_permanent} />
      </div>
    </div>
  );
}

/* 🔹 Reusable Item */
const ProfileItem = ({ label, value }) => (
  <div className="border rounded-lg p-3">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-800">{value || "-"}</p>
  </div>
);
