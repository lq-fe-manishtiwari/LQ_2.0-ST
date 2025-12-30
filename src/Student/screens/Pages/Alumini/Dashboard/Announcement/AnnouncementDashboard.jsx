import React, { useEffect, useState } from 'react';
import { Heart, Calendar } from 'lucide-react';
import { AluminiService } from '../../Service/Alumini.service';
import { useBatch } from '../../../../../../contexts/BatchContext';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';

const { getAnnouncementDetails } = AluminiService;

const AnnouncementDashboard = () => {
    const { batchId, loading: batchLoading, error: batchError } = useBatch();
    const { getUserId } = useUserProfile();
    const [announcements, setAnnouncements] = useState([]);
    const [likedAnnouncements, setLikedAnnouncements] = useState(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batchId) return;

        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const res = await getAnnouncementDetails(batchId);

                const initiallyLiked = new Set();

                const mappedAnnouncements = (res.content || []).map(item => {
                    if (item.liked === true) {
                        initiallyLiked.add(item.announcement_id);
                    }

                    return {
                        id: item.announcement_id,
                        headline: item.headline,
                        image: item.image,
                        description: item.description,
                        date: new Date(item.publish_date).toLocaleDateString(),
                        likes: item.like_count || 0
                    };
                });

                setAnnouncements(mappedAnnouncements);
                setLikedAnnouncements(initiallyLiked);
            } catch (err) {
                console.error(err);
                setError('Failed to load announcements');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [batchId]);

    const handleLike = (announcementId) => {
          const userId = getUserId();
        if (!announcementId || !userId) {
        console.error('announcementId or userId missing', announcementId, userId);
        return;
    }
    const isCurrentlyLiked = likedAnnouncements.has(announcementId);

        setAnnouncements(prev =>
            prev.map(a =>
                a.id === announcementId
                    ? {
                        ...a,
                        likes: isCurrentlyLiked
                            ? Math.max(0, a.likes - 1)
                            : a.likes + 1
                    }
                    : a
            )
        );

        setLikedAnnouncements(prev => {
            const newSet = new Set(prev);
            isCurrentlyLiked ? newSet.delete(announcementId) : newSet.add(announcementId);
            return newSet;
        });

        const payload = {
            likeable_id: announcementId,
            likeable_type: 'ANNOUNCEMENT',
            status: isCurrentlyLiked ? 'DISLIKE' : 'LIKE'
        };

        AluminiService.postLikeDislike(userId, payload)
            .catch(err => {
                console.error('Like/Dislike failed', err);

                // 🔁 Rollback
                setAnnouncements(prev =>
                    prev.map(a =>
                        a.id === announcementId
                            ? {
                                ...a,
                                likes: isCurrentlyLiked
                                    ? a.likes + 1
                                    : Math.max(0, a.likes - 1)
                            }
                            : a
                    )
                );

                setLikedAnnouncements(prev => {
                    const newSet = new Set(prev);
                    isCurrentlyLiked ? newSet.add(announcementId) : newSet.delete(announcementId);
                    return newSet;
                });
            });
    };

    const formatLikes = (count) =>
        count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;

    const AnnouncementCard = ({ item }) => {
        const isLiked = likedAnnouncements.has(item.id);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 flex gap-3 md:gap-4">
              <div className="w-[160px] h-[100px] rounded-lg overflow-hidden flex-shrink-0">
                    <img
                        src={item.image}
                        alt={item.headline}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col justify-between flex-1">
                    <p className="text-xs md:text-sm text-slate-600 line-clamp-3">
                        {item.headline}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                        <button
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center gap-1 transition-colors ${
                                isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-400'
                            }`}
                        >
                            <Heart
                                className={`w-4 h-4 transition-transform ${
                                    isLiked ? 'fill-current scale-110' : ''
                                }`}
                            />
                            <span className="text-xs font-medium">
                                {formatLikes(item.likes)}
                            </span>
                        </button>

                        <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">{item.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || batchLoading) return <p>Loading announcements...</p>;
    if (error || batchError) return <p>{error || batchError}</p>;
    if (announcements.length === 0) return <p>No announcements available.</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map(item => (
                <AnnouncementCard key={item.id} item={item} />
            ))}
        </div>
    );
};

export default AnnouncementDashboard;
