import React, { useEffect, useState, useRef } from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { AluminiService } from '../../Service/Alumini.service';
import { useBatch } from '../../../../../../contexts/BatchContext';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';

const { getEventsDetails, postLikeDislike } = AluminiService;

const EventDashboard = () => {
    const { batchId, loading: batchLoading, error: batchError } = useBatch();
    const { getUserId } = useUserProfile();

    const [events, setEvents] = useState([]);
    const [likedEvents, setLikedEvents] = useState(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Latest');

    // 🔒 Prevent double API call
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!batchId || hasFetched.current) return;
        hasFetched.current = true;

        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getEventsDetails(batchId);

                const eventsArray = [];
                const initiallyLiked = new Set();

                (res?.content || []).forEach(item => {
                    if (item.liked === true) {
                        initiallyLiked.add(item.event_id);
                    }

                    eventsArray.push({
                        id: item.event_id,
                        title: item.title,
                        image: item.image,
                       eventDate: new Date(item.event_date),
                        location: item.event_location,
                        likesCount: item.like_count || 0,
                        postedOn: new Date().toLocaleDateString('en-GB')
                    });
                });

                setEvents(eventsArray);
                setLikedEvents(initiallyLiked);
            } catch (err) {
                console.error(err);
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [batchId]);

    // ❤️ LIKE / DISLIKE (Announcement jaisa)
    const toggleLike = (eventId) => {
        const userId = getUserId();
        if (!eventId || !userId) return;

        const isCurrentlyLiked = likedEvents.has(eventId);

        // ✅ Optimistic UI Update
        setEvents(prev =>
            prev.map(e =>
                e.id === eventId
                    ? {
                          ...e,
                          likesCount: isCurrentlyLiked
                              ? Math.max(0, e.likesCount - 1)
                              : e.likesCount + 1
                      }
                    : e
            )
        );

        setLikedEvents(prev => {
            const newSet = new Set(prev);
            isCurrentlyLiked ? newSet.delete(eventId) : newSet.add(eventId);
            return newSet;
        });

        const payload = {
            likeable_id: eventId,
            likeable_type: 'EVENT',
            status: isCurrentlyLiked ? 'DISLIKE' : 'LIKE'
        };

        postLikeDislike(userId, payload).catch(err => {
            console.error('Event Like/Dislike failed', err);

            // 🔁 Rollback on error
            setEvents(prev =>
                prev.map(e =>
                    e.id === eventId
                        ? {
                              ...e,
                              likesCount: isCurrentlyLiked
                                  ? e.likesCount + 1
                                  : Math.max(0, e.likesCount - 1)
                          }
                        : e
                )
            );

            setLikedEvents(prev => {
                const newSet = new Set(prev);
                isCurrentlyLiked ? newSet.add(eventId) : newSet.delete(eventId);
                return newSet;
            });
        });
    };

    const formatLikes = count =>
        count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count;

    const EventCard = ({ item }) => {
        const isLiked = likedEvents.has(item.id);

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] text-slate-500">
                        Posted on: {item.postedOn}
                    </span>

                    <button
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1 transition-colors ${
                            isLiked
                                ? 'text-red-500'
                                : 'text-slate-400 hover:text-red-400'
                        }`}
                    >
                        <Heart
                            className={`w-3.5 h-3.5 ${
                                isLiked ? 'fill-current scale-110' : ''
                            }`}
                        />
                        <span className="text-[11px] font-bold">
                            {formatLikes(item.likesCount)}
                        </span>
                    </button>
                </div>

                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                        src={item.image || '/placeholder.png'}
                        alt="Event"
                        className="w-full h-full object-cover"
                    />
                </div>

                <h3 className="text-[13px] text-slate-600 mb-4 line-clamp-2">
                    {item.title}
                </h3>

                <div className="flex justify-between items-center mt-auto border-t pt-3">
                  {/* <span className="text-[11px]">
    {item.eventDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}
</span> */}

                    <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{item.location}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || batchLoading)
        return <p className="text-center">Loading events...</p>;
    if (error || batchError)
        return <p className="text-center text-red-500">{error || batchError}</p>;

    // Filter by tab
const filteredEvents = events
    .filter(event => {
        const eventTime = event.eventDate.getTime();
        const now = Date.now();

        if (activeTab === 'Expired') {
            return eventTime < now;   // past events
        } else if (activeTab === 'Latest') {
            return eventTime >= now;  // upcoming events
        }
        return true;
    })
    .sort((a, b) => {
        if (activeTab === 'Latest') {
            return a.eventDate - b.eventDate;  // nearest first
        } else {
            return b.eventDate - a.eventDate;  // newest past first
        }
    });



    if (!filteredEvents.length)
     return (
    <div className="flex flex-col gap-4 md:gap-6">
        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
            {['Latest', 'Expired'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-xs font-medium ${
                        activeTab === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-100 text-slate-700 hover:bg-rose-200'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.length ? (
                filteredEvents.map(item => <EventCard key={item.id} item={item} />)
            ) : (
                <p className="text-center col-span-full">No events found</p>
            )}
        </div>
    </div>
);

    return (
        <div className="flex flex-col gap-4 md:gap-6">
            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {['Latest', 'Expired'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-xs font-medium ${
                            activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-rose-100 text-slate-700 hover:bg-rose-200'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEvents.map(item => (
                    <EventCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default EventDashboard;
