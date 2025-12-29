import React from 'react';
import { Outlet } from 'react-router-dom';
import TabNav from './Components/TabNav';

const AluminiLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <TabNav />
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default AluminiLayout;
