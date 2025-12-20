import React, { useState } from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';

const EventDashboard = () => {
    const [activeTab, setActiveTab] = useState('Latest');

    const initialEvents = Array(8).fill(null).map((_, index) => ({
        id: index,
        postedOn: "19-05-2025",
        title: "This will be the title of the event that has been scheduled",
        eventDate: "25-05-2025",
        location: "College Campus",
        likesCount: 1500,
        isLiked: false,
        image: "https://demo-learnqoch.s3.ap-south-1.amazonaws.com/engage/1733316684-CONQUER%20'24.png"
    }));

    const [events, setEvents] = useState(initialEvents);

    const toggleLike = (id) => {
        setEvents(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    isLiked: !item.isLiked,
                    likesCount: item.isLiked ? item.likesCount - 1 : item.likesCount + 1
                };
            }
            return item;
        }));
    };

    const formatLikes = (count) => {
        return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;
    };

    const EventCard = ({ item, onLike }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow duration-300">
            {/* Top Bar: Posted date and Like */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-medium text-slate-500">Posted on : {item.postedOn}</span>
                <button
                    onClick={() => onLike(item.id)}
                    className={`flex items-center gap-1 transition-colors duration-200 ${item.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                    <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-[11px] font-bold">{formatLikes(item.likesCount)}</span>
                </button>
            </div>

            {/* Event Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img
                    src={item.image}
                    alt="Event"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Title */}
            <h3 className="text-[13px] font-normal text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {item.title}
            </h3>

            {/* Footer: Date and Location */}
            <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-3">
                <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{item.eventDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{item.location}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
                {['Latest', 'Expired'].map((tab) => (
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
                {events.map((item) => (
                    <EventCard key={item.id} item={item} onLike={toggleLike} />
                ))}
            </div>
        </div>
    );
};

export default EventDashboard;
