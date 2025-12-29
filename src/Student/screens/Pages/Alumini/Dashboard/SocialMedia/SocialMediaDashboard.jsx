import React, { useEffect, useRef, useState } from "react";
import { Linkedin, Youtube, Instagram, Heart, Calendar, ExternalLink, Play } from "lucide-react";
import { useUserProfile } from "../../../../../../contexts/UserProfileContext";
import { useBatch } from '../../../../../../contexts/BatchContext';
import { AluminiService } from "../../Service/Alumini.service";

const { getSocialMediaDetails } = AluminiService;

const SocialMediaDashboard = () => {
  const { batchId } = useBatch(); 
  const [platforms, setPlatforms] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); 

  useEffect(() => {
    if (!batchId) return; 
    if (hasFetched.current) return;

    hasFetched.current = true;
    loadSocialMedia(batchId);
  }, [batchId]);

  const loadSocialMedia = async (batchId) => {
    try {
      setLoading(true);
      setError(null);

      const socialRes = await getSocialMediaDetails(batchId);

      const platformsData = ["LINKEDIN", "YOUTUBE", "INSTAGRAM"].map((type) => {
        const filteredPosts = socialRes.content.filter((post) => post.type === type)
          .map((post) => ({
            id: post.post_id,
            account: type === "LINKEDIN" ? "LinkedIn Account" :
                     type === "YOUTUBE" ? "YouTube Channel" : "Instagram Account",
            handle: type === "LINKEDIN" ? "@linkedin.handle" :
                    type === "YOUTUBE" ? "@youtube.handle" : "@instagram.handle",
            date: new Date().toLocaleDateString(),
            likes: post.like_count,
            liked: post.liked,
            text: post.description || "",
            image: post.image,
            link: post.link,
          }));

        const icon = type === "LINKEDIN" ? (
          <Linkedin className="w-6 h-6 text-[#0077b5]" />
        ) : type === "YOUTUBE" ? (
          <Youtube className="w-6 h-6 text-[#ff0000]" />
        ) : (
          <Instagram className="w-6 h-6 text-[#e4405f]" />
        );

        return {
          name: type === "LINKEDIN" ? "LinkedIn" :
                type === "YOUTUBE" ? "YouTube" : "Instagram",
          icon,
          isVideo: type === "YOUTUBE",
          posts: filteredPosts,
        };
      });

      setPlatforms(platformsData);

      // Initialize liked posts
      const initialLikes = {};
      platformsData.forEach((platform) => {
        platform.posts.forEach((post) => {
          initialLikes[`${platform.name}-${post.id}`] = post.liked;
        });
      });
      setLikedPosts(initialLikes);

    } catch (err) {
      console.error("Social Media Error:", err);
      setError("Failed to load social media feeds");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (platform, id) => {
    const key = `${platform}-${id}`;
    setLikedPosts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const PostCard = ({ post, platform, isVideo }) => {
    const isLiked = likedPosts[`${platform}-${post.id}`];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 mb-4 md:mb-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white font-bold text-[10px] md:text-xs shrink-0">
            {post.account[0]}{post.account[1]}
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

        {/* Content */}
        {isVideo ? (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3 md:mb-4 bg-slate-900 flex items-center justify-center group cursor-pointer">
            {post.image && <img src={post.image} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-lg mb-3 md:mb-4 bg-[#d1d5db]">
            {post.image && <img src={post.image} alt="Post image" className="w-full h-full object-cover rounded-lg" />}
          </div>
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
          <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
            <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" strokeWidth={2.5} />
          </a>
        </div>

        {/* Text Content */}
        <p className="text-[11px] md:text-[12px] font-normal text-slate-600 leading-relaxed line-clamp-3">
          {post.text}
        </p>
      </div>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {platforms.map((platform) => (
        <div key={platform.name} className="flex flex-col">
          {/* Platform Header */}
          <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
            {platform.icon}
            <span className="text-lg font-medium text-slate-700">{platform.name}</span>
          </div>

          {/* Posts */}
          <div className="flex flex-col">
            {platform.posts.map((post) => (
              <PostCard key={post.id} post={post} platform={platform.name} isVideo={platform.isVideo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialMediaDashboard;
