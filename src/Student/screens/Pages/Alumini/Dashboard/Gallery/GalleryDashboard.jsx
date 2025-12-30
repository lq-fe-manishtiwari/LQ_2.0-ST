import React, { useEffect, useState } from 'react';
import { Heart, Calendar, Share2, Download } from 'lucide-react';
import { AluminiService } from '../../Service/Alumini.service';
import { useBatch } from '../../../../../../contexts/BatchContext';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';

const { getGalleryDetails, postLikeDislike } = AluminiService;

const GalleryDashboard = () => {
    const { batchId } = useBatch();
    const { getUserId } = useUserProfile();

    const [items, setItems] = useState([]);
    const [likedItems, setLikedItems] = useState(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch gallery
    useEffect(() => {
        if (!batchId) return;

        const fetchGallery = async () => {
            try {
                setLoading(true);
                const res = await getGalleryDetails(batchId);

                const galleryArray = [];
                const initiallyLiked = new Set();

                (res?.content || []).forEach(item => {
                    if (item.liked) {
                        initiallyLiked.add(item.gallery_id);
                    }

                    galleryArray.push({
                        gallery_id: item.gallery_id,
                        image: item.image,
                        title: item.title,
                        description: item.description,
                        date: new Date(item.publish_date).toLocaleDateString('en-GB'),
                        like_count: item.like_count || 0
                    });
                });

                setItems(galleryArray);
                setLikedItems(initiallyLiked);
            } catch (err) {
                console.error(err);
                setError('Failed to load gallery');
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, [batchId]);

    // ❤️ Like / Dislike
    const toggleLike = (galleryId) => {
        const userId = getUserId();
        if (!galleryId || !userId) return;

        const isCurrentlyLiked = likedItems.has(galleryId);

        // Optimistic UI update
        setItems(prev =>
            prev.map(item =>
                item.gallery_id === galleryId
                    ? {
                        ...item,
                        like_count: isCurrentlyLiked
                            ? Math.max(0, item.like_count - 1)
                            : item.like_count + 1
                    }
                    : item
            )
        );

        setLikedItems(prev => {
            const newSet = new Set(prev);
            isCurrentlyLiked ? newSet.delete(galleryId) : newSet.add(galleryId);
            return newSet;
        });

        const payload = {
            likeable_id: galleryId,
            likeable_type: 'PHOTO_GALLERY',
            status: isCurrentlyLiked ? 'DISLIKE' : 'LIKE'
        };

        postLikeDislike(userId, payload).catch(err => {
            console.error('Gallery Like/Dislike failed', err);

            // Rollback
            setItems(prev =>
                prev.map(item =>
                    item.gallery_id === galleryId
                        ? {
                            ...item,
                            like_count: isCurrentlyLiked
                                ? item.like_count + 1
                                : Math.max(0, item.like_count - 1)
                        }
                        : item
                )
            );

            setLikedItems(prev => {
                const newSet = new Set(prev);
                isCurrentlyLiked ? newSet.add(galleryId) : newSet.delete(galleryId);
                return newSet;
            });
        });
    };

    const formatLikes = (count) =>
        count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;

    const GalleryCard = ({ item }) => {
        const isLiked = likedItems.has(item.gallery_id);

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 flex flex-col hover:shadow-md transition-shadow duration-300">
                {/* Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Description */}
                <p className="text-[11px] md:text-[13px] font-normal text-slate-600 mb-3 md:mb-4 line-clamp-2 leading-relaxed">
                    {item.description || 'No description'}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-1 md:gap-1.5 text-slate-500">
                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                        <span className="text-[10px] md:text-[11px] font-medium">{item.date || '-'}</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 text-slate-400">

                        <button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = item.image;
                                link.download = item.title || 'gallery-image';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="hover:text-green-500 transition-colors"
                        >
                            <Download className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => toggleLike(item.gallery_id)}
                            className={`flex items-center gap-0.5 md:gap-1 transition-colors duration-200 ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                        >
                            <Heart className={`w-3 md:w-3.5 h-3 md:h-3.5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                            <span className="text-[10px] md:text-[11px] font-medium">{formatLikes(item.like_count)}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <p>Loading gallery...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {items.map(item => (
                <GalleryCard key={item.gallery_id} item={item} />
            ))}
        </div>
    );
};

export default GalleryDashboard;
