import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserX, Loader2 } from "lucide-react";
import { leaveService } from "../../TeacherLeaves/Services/Leave.Service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

const Leaves = () => {
    const { filters } = useOutletContext();
    const userProfile = useUserProfile();

    // Initialize as empty object
    const [leaveData, setLeaveData] = useState({});
    const [loading, setLoading] = useState(false);

    // Get teacher ID from filters or current user profile
    const teacherId = filters?.teacher?.user_id || filters?.teacherId || (userProfile?.getUserId ? userProfile.getUserId() : null);

    const loadLeaves = async () => {
        if (!teacherId) return;

        try {
            setLoading(true);
            const response = await leaveService.getLeavesByUserId(teacherId);

            const groupedLeaves = {};

            if (Array.isArray(response)) {
                response.forEach((item) => {
                    const typeName = item.leave_type_name || "Other Leave";

                    if (!groupedLeaves[typeName]) {
                        groupedLeaves[typeName] = [];
                    }
                    groupedLeaves[typeName].push(item);
                });
            }

            setLeaveData(groupedLeaves);
        } catch (err) {
            console.error("Failed to load leaves:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, [teacherId]);

    /* ===== Validation ===== */
    if (!teacherId) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <UserX className="w-20 h-20 mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No Teacher Selected</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-blue-500">
                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                <p className="text-lg font-semibold">Loading Leave Records...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Academic Diary – Leave Record
                </h1>
                <p className="text-sm text-gray-600">
                    Information of Leave (To be verified by the Authority)
                </p>
            </div>

            {Object.keys(leaveData).length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No leave records available
                </div>
            )}

            {Object.entries(leaveData).map(([leaveTypeName, rows]) => (
                <div
                    key={leaveTypeName}
                    className="bg-white rounded-xl shadow-sm border mb-8"
                >
                    <div className="px-5 py-4 border-b bg-gray-100">
                        <h3 className="text-lg font-semibold">{leaveTypeName}</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="table-header">
                                <tr>
                                    <th className="border px-4 py-3 text-center w-20">
                                        Sr. No
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        Date
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        No. of Days
                                    </th>
                                    <th className="border px-4 py-3 text-center">
                                        Signature of Authority
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.apply_leave_id}>
                                        <td className="border px-4 py-3 text-center">
                                            {index + 1}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {row.start_date}
                                            {row.end_date &&
                                                row.end_date !== row.start_date && (
                                                    <> – {row.end_date}</>
                                                )}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {row.no_of_days}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            —
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Leaves;
