import React, { useEffect, useState } from 'react';
import { Heart, Calendar } from 'lucide-react';
import { AluminiService } from '../../Service/Alumini.service';
import { useBatch } from '../../../../../../contexts/BatchContext';

const { getAnnouncementDetails } = AluminiService;

const AnnouncementDashboard = () => {
    const { batchId, loading: batchLoading, error: batchError } = useBatch();
    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batchId) return;

        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const res = await getAnnouncementDetails(batchId);

                // Map API response to component-friendly format
                const mappedAnnouncements = (res.content || []).map(item => ({
                    id: item.announcement_id,
                    headline: item.headline,
                    image: item.image,
                    description: item.description,
                    date: new Date(item.publish_date).toLocaleDateString(),
                    likesCount: item.like_count,
                    isLiked: item.liked
                }));

                setAnnouncements(mappedAnnouncements);
            } catch (err) {
                console.error(err);
                setError('Failed to load announcements');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [batchId]);

    const toggleLike = (id) => {
        setAnnouncements(prev =>
            prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        isLiked: !item.isLiked,
                        likesCount: item.isLiked ? item.likesCount - 1 : item.likesCount + 1
                    };
                }
                return item;
            })
        );
    };

    const formatLikes = (count) => {
        return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;
    };

    const AnnouncementCard = ({ item, onLike }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex gap-3 md:gap-4 hover:shadow-md transition-shadow duration-300">
            {/* Announcement Image */}
            <div className="min-w-[80px] h-[80px] md:min-w-[100px] md:h-[100px] rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.headline} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between flex-1 min-w-0">
                <p className="text-[12px] md:text-sm text-slate-600 font-normal leading-tight line-clamp-3">
                    {item.headline}
                </p>

                <div className="flex items-center justify-between mt-3 md:mt-4">
                    <button
                        onClick={() => onLike(item.id)}
                        className={`flex items-center gap-1 md:gap-1.5 transition-colors duration-200 ${item.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-[10px] md:text-xs font-medium">{formatLikes(item.likesCount)}</span>
                    </button>
                    <div className="flex items-center gap-1 md:gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="text-[10px] md:text-xs font-medium">{item.date}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading || batchLoading) return <p>Loading announcements...</p>;
    if (error || batchError) return <p>{error || batchError}</p>;
    if (announcements.length === 0) return <p>No announcements available.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {announcements.map(item => (
                <AnnouncementCard key={item.id} item={item} onLike={toggleLike} />
            ))}
        </div>
    );
};

export default AnnouncementDashboard;
