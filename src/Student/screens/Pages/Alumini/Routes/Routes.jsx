import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AluminiLayout from '../AluminiLayout';

import AluminiDashboard from '../Dashboard/AluminiDashboard.jsx/AluminiDashboard';
import AnnouncementDashboard from '../Dashboard/Announcement/AnnouncementDashboard';
import EngageDashboard from '../Dashboard/LQEngage/EngageDashboard';
import EventDashboard from '../Dashboard/EventDashboard/EventDashboard';
import GalleryDashboard from '../Dashboard/Gallery/GalleryDashboard';
import JobDashboard from '../Dashboard/Jobs/JobDashboard';
import SocialMediaDashboard from '../Dashboard/SocialMedia/SocialMediaDashboard';

const AluminiRoutes = () => {
    return (
        <Routes>
            <Route element={<AluminiLayout />}>
                <Route index element={<AluminiDashboard />} />
                <Route path="announcement" element={<AnnouncementDashboard />} />
                <Route path="engage" element={<EngageDashboard />} />
                <Route path="events" element={<EventDashboard />} />
                <Route path="gallery" element={<GalleryDashboard />} />
                <Route path="jobs" element={<JobDashboard />} />
                <Route path="social-media" element={<SocialMediaDashboard />} />
            </Route>
        </Routes>
    );
};

export default AluminiRoutes;
