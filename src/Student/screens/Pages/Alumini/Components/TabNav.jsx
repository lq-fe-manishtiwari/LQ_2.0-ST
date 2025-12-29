import React from 'react';
import { NavLink } from 'react-router-dom';

const TabNav = () => {
    const tabs = [
        { name: 'Alumini', path: '/student/alumini', end: true },
        { name: 'Announcement', path: '/student/alumini/announcement' },
        // { name: 'LQ Engage', path: '/student/alumini/engage' },
        { name: 'Events', path: '/student/alumini/events' },
        { name: 'Gallery', path: '/student/alumini/gallery' },
        // { name: 'Jobs', path: '/student/alumini/jobs' },
        { name: 'Social Media', path: '/student/alumini/social-media' },
    ];

    return (
        <div className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 md:mb-6 tracking-tight">
                    Alumni
                </h1>
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 select-none">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            end={tab.end}
                            className={({ isActive }) =>
                                `px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${isActive
                                    ? 'bg-[#1d4ed8] text-white shadow-md shadow-blue-100'
                                    : 'bg-[#ffe4e6] text-[#1e293b] hover:bg-[#fecdd3]'
                                }`
                            }
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TabNav;
