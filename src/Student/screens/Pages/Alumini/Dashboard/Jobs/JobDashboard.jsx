import React, { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';

const JobDashboard = () => {
    const [activeTab, setActiveTab] = useState('Latest');

    const initialJobs = Array(8).fill(null).map((_, index) => ({
        id: index,
        publishedOn: "19-05-2025",
        title: "This will be the title of the post that will be seen here",
        eventDate: "25-05-2025",
        location: "College Campus",
        image: "https://demo-learnqoch.s3.ap-south-1.amazonaws.com/engage/1733303649-hiring.png"
    }));

    const JobCard = ({ item, type }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 flex flex-col hover:shadow-md transition-shadow duration-300">
            {/* Published On */}
            <div className="mb-3">
                <span className="text-[10px] md:text-[11px] font-medium text-slate-500">Published on : {item.publishedOn}</span>
            </div>

            {/* Flyer Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img
                    src={item.image}
                    alt="Job Flyer"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Title */}
            <h3 className="text-[12px] md:text-[13px] font-normal text-slate-700 mb-3 md:mb-4 line-clamp-2 leading-relaxed">
                {item.title}
            </h3>

            {/* Info Footer */}
            <div className="flex justify-between items-center mb-4 md:mb-5">
                <div className="flex items-center gap-1 md:gap-1.5 text-slate-500">
                    <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="text-[10px] md:text-[11px] font-medium">{item.eventDate}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 text-slate-500">
                    <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="text-[10px] md:text-[11px] font-medium">{item.location}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:gap-3 mt-auto">
                {type === 'Latest' && (
                    <>
                        <button className="flex-1 py-1.5 md:py-2 bg-[#ff9800] text-white rounded-lg text-[12px] md:text-sm font-medium hover:bg-orange-600 transition-colors">
                            Apply
                        </button>
                        <button className="flex-1 py-1.5 md:py-2 border border-[#ff9800] text-[#ff9800] rounded-lg text-[12px] md:text-sm font-medium hover:bg-orange-50 transition-colors">
                            View
                        </button>
                    </>
                )}
                {type === 'Expired' && (
                    <button className="w-full py-1.5 md:py-2 border border-[#ff9800] text-[#ff9800] rounded-lg text-[12px] md:text-sm font-medium hover:bg-orange-50 transition-colors">
                        View
                    </button>
                )}
                {type === 'Applied' && (
                    <>
                        <button className="flex-1 py-1.5 md:py-2 bg-[#545e69] text-white rounded-lg text-[12px] md:text-sm font-medium cursor-default">
                            Applied
                        </button>
                        <button className="flex-1 py-1.5 md:py-2 border border-[#ff9800] text-[#ff9800] rounded-lg text-[12px] md:text-sm font-medium hover:bg-orange-50 transition-colors">
                            View
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            {/* Tabs */}
            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
                {['Latest', 'Expired', 'Applied'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 md:px-8 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${activeTab === tab
                            ? 'bg-[#1d4ed8] text-white shadow-md'
                            : 'bg-[#ffe4e6] text-[#1e293b] hover:bg-[#fecdd3]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {initialJobs.map((item) => (
                    <JobCard key={item.id} item={item} type={activeTab} />
                ))}
            </div>
        </div>
    );
};

export default JobDashboard;
