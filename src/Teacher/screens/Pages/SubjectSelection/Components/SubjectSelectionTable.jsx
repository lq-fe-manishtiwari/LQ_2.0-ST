import React from "react";
import PropTypes from "prop-types";
import { Edit, Trash2, Calendar, Users } from "lucide-react";

/**
 * SubjectSelectionTable Component
 * Displays subject selection configuration data in a responsive table/card format
 */
const SubjectSelectionTable = ({ data = [], onEdit, onDelete }) => {
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">No configurations found</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Create your first Paper selection configuration
                    </p>
                </div>
            </div>
        );
    }

    // Format datetime for display
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "Not set";
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return "Invalid date";
        }
    };

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                    Subject Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                    Selections
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                    Timeline
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                    Student Limit
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 w-fit">
                                                {item.subject_type_name || "Subject Type"}
                                            </span>
                                            {item.vertical_type_name && (
                                                <span className="text-xs text-gray-500 mt-1">
                                                    {item.vertical_type_name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Min:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {item.minimum_selections ?? "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Max:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {item.maximum_selections ?? "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-start gap-1">
                                                <Calendar size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-gray-600">Start: </span>
                                                    <span className="text-gray-900">{formatDateTime(item.start_time)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-1">
                                                <Calendar size={12} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-gray-600">End: </span>
                                                    <span className="text-gray-900">{formatDateTime(item.end_time)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users size={14} className="text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {item.limit_per_subject_selections ?? "No limit"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit Configuration"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Configuration"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
                    >
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {item.subject_type_name || "Subject Type"}
                                    </span>
                                    {item.vertical_type_name && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Vertical: {item.vertical_type_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 p-2 rounded">
                                    <span className="text-gray-600 text-xs font-medium">Min Selections</span>
                                    <p className="text-gray-900 font-semibold">{item.minimum_selections ?? "N/A"}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <span className="text-gray-600 text-xs font-medium">Max Selections</span>
                                    <p className="text-gray-900 font-semibold">{item.maximum_selections ?? "N/A"}</p>
                                </div>
                                <div className="col-span-2 bg-gray-50 p-2 rounded">
                                    <span className="text-gray-600 text-xs font-medium flex items-center gap-1">
                                        <Users size={12} /> Student Limit per Subject
                                    </span>
                                    <p className="text-gray-900 font-semibold">
                                        {item.limit_per_subject_selections ?? "No limit"}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="border-t border-gray-200 pt-2">
                                <div className="text-xs space-y-1">
                                    <div className="flex items-start gap-1">
                                        <Calendar size={12} className="text-green-600 mt-0.5" />
                                        <div>
                                            <span className="text-gray-600">Start: </span>
                                            <span className="text-gray-900">{formatDateTime(item.start_time)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-1">
                                        <Calendar size={12} className="text-red-600 mt-0.5" />
                                        <div>
                                            <span className="text-gray-600">End: </span>
                                            <span className="text-gray-900">{formatDateTime(item.end_time)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-200">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    <Edit size={16} />
                                    <span className="text-sm font-medium">Edit</span>
                                </button>
                                <button
                                    onClick={() => onDelete(item)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-sm font-medium">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

SubjectSelectionTable.propTypes = {
    data: PropTypes.array,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default SubjectSelectionTable;
