import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen } from 'lucide-react';

export default function ModulesUnitsList({ modules, colorCode }) {
    const [expandedModuleId, setExpandedModuleId] = useState(null);

    const toggleModule = (moduleId) => {
        if (expandedModuleId === moduleId) {
            setExpandedModuleId(null);
        } else {
            setExpandedModuleId(moduleId);
        }
    };

    if (!modules || modules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No modules available for this subject.
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: colorCode }} />
                Modules & Units
            </h3>

            <div className="grid grid-cols-1 gap-4">
                {modules.map((module) => (
                    <div
                        key={module.module_id}
                        className="border rounded-lg overflow-hidden shadow-sm transition-all duration-200"
                        style={{
                            borderColor: `${colorCode}40`, // Low opacity border
                        }}
                    >
                        {/* Module Header / Button */}
                        <button
                            onClick={() => toggleModule(module.module_id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:opacity-95 transition-opacity"
                            style={{
                                backgroundColor: expandedModuleId === module.module_id
                                    ? colorCode // Full color when active
                                    : `${colorCode}15`, // Very light bg when inactive
                                color: expandedModuleId === module.module_id
                                    ? '#ffffff'
                                    : '#1f2937' // Text color logic
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-medium ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-900'}`}>
                                    {module.module_name}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${expandedModuleId === module.module_id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {module.units ? module.units.length : 0} Units
                                </span>
                            </div>

                            {expandedModuleId === module.module_id ? (
                                <ChevronDown className={`w-5 h-5 ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-500'}`} />
                            ) : (
                                <ChevronRight className={`w-5 h-5 ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-500'}`} />
                            )}
                        </button>

                        {/* Units List (Expanded Content) */}
                        {expandedModuleId === module.module_id && (
                            <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
                                {module.units && module.units.length > 0 ? (
                                    <ul className="space-y-2">
                                        {module.units.map((unit, idx) => (
                                            <li
                                                key={unit.unit_id || idx}
                                                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer group"
                                            >
                                                <div
                                                    className="p-2 rounded-full bg-gray-100 group-hover:bg-white transition-colors"
                                                    style={{ color: colorCode }}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {unit.unit_name || unit.name || `Unit ${idx + 1}`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic px-2">No units found in this module.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
