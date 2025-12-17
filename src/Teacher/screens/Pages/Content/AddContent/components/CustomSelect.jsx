import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled = false, 
    required = false, 
    loading = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const displayValue = options?.find(opt => opt.value === value)?.label || "";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block font-medium mb-1 text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className={`w-full px-3 py-2 border ${
                    disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
                } rounded min-h-[40px] flex items-center justify-between transition-all duration-150`}
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            >
                <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                    {loading ? 'Loading...' : (displayValue || placeholder)}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            {isOpen && !disabled && !loading && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50" onClick={() => handleSelect({ value: '', label: placeholder })}>
                        {placeholder}
                    </div>
                    {options?.map((option, index) => (
                        <div
                            key={`${option.value}-${index}`}
                            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50"
                            onClick={() => handleSelect(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;