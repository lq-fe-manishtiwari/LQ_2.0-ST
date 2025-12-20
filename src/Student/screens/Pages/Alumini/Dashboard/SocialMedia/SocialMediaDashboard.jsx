import React, { useState } from 'react';
import { Linkedin, Youtube, Instagram, Heart, Calendar, ExternalLink, Play } from 'lucide-react';

const SocialMediaDashboard = () => {
    const [likedPosts, setLikedPosts] = useState({});

    const toggleLike = (platform, id) => {
        const key = `${platform}-${id}`;
        setLikedPosts(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const platforms = [
        {
            name: "LinkedIn",
            icon: <Linkedin className="w-6 h-6 text-[#0077b5]" />,
            themeColor: "text-[#0077b5]",
            posts: [
                { id: 1, account: "LinkedIn Account Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" },
                { id: 2, account: "LinkedIn Account Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" }
            ]
        },
        {
            name: "Youtube",
            icon: <Youtube className="w-6 h-6 text-[#ff0000]" />,
            themeColor: "text-[#ff0000]",
            isVideo: true,
            posts: [
                { id: 1, account: "Youtube Channel Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" },
                { id: 2, account: "Youtube Channel Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" }
            ]
        },
        {
            name: "Instagram",
            icon: <Instagram className="w-6 h-6 text-[#e4405f]" />,
            themeColor: "text-[#e4405f]",
            posts: [
                { id: 1, account: "Instagram Account Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" },
                { id: 2, account: "Instagram Account Name", handle: "@youtube.channek", date: "25-05-2025", likes: "1.5K", text: "This will be the heading of the post related contain. This will be the heading of the post related contain. This will be the heading......" }
            ]
        }
    ];

    const PostCard = ({ post, platform, isVideo }) => {
        const isLiked = likedPosts[`${platform}-${post.id}`];

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 hover:shadow-md transition-shadow">
                {/* Header: User Info */}
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white font-bold text-[10px] md:text-xs shrink-0">
                        MT
                    </div>
                    <div>
                        <h4 className="text-[12px] md:text-[13px] font-semibold text-slate-800 leading-tight">{post.account}</h4>
                        <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">{post.handle}</p>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 md:gap-1.5 text-slate-500 mb-3">
                    <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    <span className="text-[10px] md:text-[11px] font-medium">{post.date}</span>
                </div>

                {/* Content Area */}
                {isVideo ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3 md:mb-4 bg-slate-900 flex items-center justify-center group cursor-pointer">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        </div>
                        {/* Mock Youtube UI elements */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                            <div className="h-full bg-red-600 w-1/3"></div>
                        </div>
                    </div>
                ) : (
                    <div className="aspect-video rounded-lg mb-3 md:mb-4 bg-[#d1d5db]"></div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center mb-3">
                    <button
                        onClick={() => toggleLike(platform, post.id)}
                        className={`flex items-center gap-1 md:gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                    >
                        <Heart className={`w-3 md:w-3.5 h-3 md:h-3.5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                        <span className="text-[10px] md:text-[11px] font-medium">{post.likes}</span>
                    </button>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                        <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Text Content */}
                <p className="text-[11px] md:text-[12px] font-normal text-slate-600 leading-relaxed line-clamp-3">
                    {post.text}
                </p>

                {/* Bottom Separator/Double Feed indication */}
                <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{post.date}</span>
                    </div>
                    <div className="aspect-video rounded-lg bg-[#d1d5db]"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {platforms.map((platform) => (
                <div key={platform.name} className="flex flex-col">
                    {/* Platform Header */}
                    <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                        {platform.icon}
                        <span className={`text-lg font-medium text-slate-700`}>{platform.name}</span>
                    </div>

                    {/* Feed Container */}
                    <div className="flex flex-col">
                        {platform.posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                platform={platform.name}
                                isVideo={platform.isVideo}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SocialMediaDashboard;
