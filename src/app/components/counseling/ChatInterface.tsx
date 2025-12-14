'use client';

import React, { useState, useEffect, useRef } from 'react';

// Interfaces (Shared or Local)
export interface Message {
    id: string;
    session_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_counselor: boolean; // Helper to distinguish visual style
}

interface ChatInterfaceProps {
    sessionId: string | null;
    sessionTitle?: string;
    messages: Message[];
    currentUserId: string;
    onSendMessage: (content: string) => void;
    loading?: boolean;
    isSessionClosed?: boolean;
}

export default function ChatInterface({
    sessionId,
    sessionTitle,
    messages,
    currentUserId,
    onSendMessage,
    loading = false,
    isSessionClosed = false
}: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !sessionId || isSessionClosed) return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!sessionId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#031207] p-8 text-center text-gray-500 rounded-r-2xl">
                <div className="w-16 h-16 mb-4 rounded-full bg-mindful-green/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-mindful-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-300">Select a Session</h3>
                <p className="mt-2 text-sm max-w-sm">
                    Choose a student session from the sidebar to view the conversation and start chatting.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#031207] rounded-r-2xl overflow-hidden relative">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#031207]">
                <div>
                    <h2 className="text-gray-200 font-medium text-lg">
                        {sessionTitle || 'Session Chat'}
                    </h2>
                    {isSessionClosed && (
                        <span className="text-xs text-red-500 font-medium uppercase tracking-wider ml-2 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded">
                            Closed
                        </span>
                    )}
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#031207]">
                {loading ? (
                    <div className="flex justify-center pt-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mindful-green"></div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // Check if message is from the Current User (Self)
                        const isSelf = msg.sender_id === currentUserId;

                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* Avatar (Left / Other) */}
                                {!isSelf && (
                                    <div className="w-8 h-8 rounded-full bg-mindful-green/20 border border-mindful-green/50 flex items-center justify-center shrink-0 text-mindful-green">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isSelf
                                        ? 'bg-[#1A2E1A] text-gray-200 rounded-br-none border border-mindful-green/20'
                                        : 'bg-[#0F1E0F] text-gray-300 rounded-bl-none border border-gray-800'
                                        }`}
                                >
                                    {msg.content}
                                </div>

                                {/* Avatar (Right / Self) */}
                                {isSelf && (
                                    <div className="w-8 h-8 flex items-center justify-center shrink-0 text-mindful-green">
                                        {/* Hexagon Shape for Self/Counselor */}
                                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" className="text-mindful-green/20" />
                                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" className="text-mindful-green" fill="currentColor" transform="scale(0.5) translate(12, 12)" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#031207] border-t border-gray-800">
                {isSessionClosed ? (
                    <div className="flex items-center justify-center p-3 bg-[#0F1E0F] border border-gray-800 rounded-xl text-gray-500 text-sm italic">
                        This session is closed. No new messages can be sent.
                    </div>
                ) : (
                    <div className="relative flex items-center bg-[#0F1E0F] border border-gray-700/50 rounded-xl px-2 focus-within:border-mindful-green/50 transition-colors">
                        {/* Attachment Icon */}
                        <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500 py-3 px-2"
                        />

                        {/* Send Icon */}
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim()}
                            className={`p-2 transition-colors ${newMessage.trim()
                                ? 'text-mindful-green hover:text-green-400 cursor-pointer'
                                : 'text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
