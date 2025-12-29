import React, { useState } from 'react';
import { Paperclip, Smile, Send } from 'lucide-react';

const EngageDashboard = () => {
    const [activeTab, setActiveTab] = useState('Admin');
    const [message, setMessage] = useState('');

    const chatHistory = [
        {
            date: "Tuesday, 25-August-2025",
            messages: [
                {
                    id: 1,
                    sender: "MT",
                    senderName: "Manish Tiwari",
                    text: "Hello, How are you ?",
                    time: "07:30 AM",
                    type: "sent"
                },
                {
                    id: 2,
                    sender: "RN",
                    senderName: "Rahul Nayak",
                    text: "I am fine, What about you ?",
                    time: "07:30 AM",
                    type: "received"
                }
            ]
        },
        {
            date: "Today, 26-August-2025",
            messages: [
                {
                    id: 3,
                    sender: "MT",
                    senderName: "Manish Tiwari",
                    text: "Send me a new Document",
                    time: "07:30 AM",
                    type: "sent"
                }
            ]
        }
    ];

    const MessageBubble = ({ msg }) => {
        const isSent = msg.type === 'sent';
        return (
            <div className={`flex items-end gap-3 mb-8 ${isSent ? 'justify-end' : 'justify-start'}`}>
                {!isSent && (
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {msg.sender}
                    </div>
                )}

                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                    <span className="text-[10px] text-slate-400 mb-1 font-medium px-2">{msg.time}</span>
                    <div className={`relative px-6 py-3 rounded-2xl text-[13px] font-normal leading-relaxed break-words w-full ${isSent
                        ? 'bg-[#f1f5f9] text-slate-800 rounded-tr-none'
                        : 'bg-[#f1f5f9] text-slate-800 rounded-tl-none'
                        }`}>
                        {msg.text}
                    </div>
                </div>

                {isSent && (
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {msg.sender}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] supports-[height:100dvh]:h-[calc(100dvh-220px)] md:supports-[height:100dvh]:h-[calc(100dvh-200px)]">
            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-4 md:mb-6">
                {['Admin', 'Alumni'].map((tab) => (
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

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-200">
                    {chatHistory.map((group, idx) => (
                        <div key={idx} className="mb-6 md:mb-10">
                            <div className="flex justify-center mb-6 md:mb-10">
                                <span className="text-[10px] md:text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                                    {group.date}
                                </span>
                            </div>
                            {group.messages.map((msg) => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Input */}
                <div className="p-3 md:p-4 bg-slate-50/50 border-t border-gray-100">
                    <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-200 rounded-xl px-2 md:px-4 py-1.5 md:py-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a meesage"
                            className="flex-1 bg-transparent outline-none text-[12px] md:text-sm py-1.5 md:py-2 min-w-0"
                        />
                        <div className="flex items-center gap-2 md:gap-4 text-slate-400">
                            <button className="hover:text-slate-600">
                                <Paperclip className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
                            </button>
                            <button className="hover:text-slate-600 hidden sm:block">
                                <Smile className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                        <button className="ml-1 md:ml-2 bg-[#ffc107] hover:bg-[#ffb300] text-slate-800 px-3 md:px-6 py-1.5 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2 text-[12px] md:text-sm font-semibold transition-colors shrink-0">
                            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngageDashboard;
