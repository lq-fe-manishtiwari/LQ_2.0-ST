import React, { useEffect, useState } from 'react';
import { Heart, Calendar, Share2, Download } from 'lucide-react';
import { AluminiService } from '../../Service/Alumini.service';
import { useBatch } from '../../../../../../contexts/BatchContext';

const { getGalleryDetails } = AluminiService;

const GalleryDashboard = () => {
    const { batchId } = useBatch();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!batchId) return;

        const fetchGallery = async () => {
            try {
                setLoading(true);
                const res = await getGalleryDetails(batchId);
                // Use the 'content' array from API response
                setItems(res?.content || []);
            } catch (err) {
                console.error(err);
                setError('Failed to load gallery');
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, [batchId]);

    const toggleLike = (id) => {
        setItems(prev =>
            prev.map(item => {
                if (item.gallery_id === id) {
                    return {
                        ...item,
                        liked: !item.liked,
                        like_count: item.liked ? item.like_count - 1 : item.like_count + 1
                    };
                }
                return item;
            })
        );
    };

    const formatLikes = (count) => {
        return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;
    };

    const GalleryCard = ({ item, onLike }) => (
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
                    <button className="hover:text-blue-500 transition-colors">
                        <Share2 className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
                    </button>
                    <button className="hover:text-green-500 transition-colors">
                        <Download className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => onLike(item.gallery_id)}
                        className={`flex items-center gap-0.5 md:gap-1 transition-colors duration-200 ${item.liked ? 'text-red-500' : 'hover:text-red-400'}`}
                    >
                        <Heart className={`w-3 md:w-3.5 h-3 md:h-3.5 ${item.liked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                        <span className="text-[10px] md:text-[11px] font-medium">{formatLikes(item.like_count)}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <p>Loading gallery...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {items.map((item) => (
                <GalleryCard key={item.gallery_id} item={item} onLike={toggleLike} />
            ))}
        </div>
    );
};

export default GalleryDashboard;
