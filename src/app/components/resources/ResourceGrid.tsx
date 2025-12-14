'use client';

import React from 'react';

export interface Resource {
    id: string;
    title: string;
    type: 'Article' | 'Video';
    content: string;
    created_at: string;
}

interface ResourceGridProps {
    resources: Resource[];
    onDelete?: (id: string) => void;
    isLoading?: boolean;
}

export default function ResourceGrid({ resources, onDelete, isLoading }: ResourceGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-[#0F1E0F] rounded-2xl border border-gray-800 animate-pulse" />
                ))}
            </div>
        );
    }

    if (resources.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#031207]/50">
                <div className="bg-[#0F1E0F] p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-gray-300 font-medium text-lg">No resources yet</h3>
                <p className="text-gray-500 text-sm mt-1">Check back later for helpful materials.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
                <div
                    key={resource.id}
                    className="group relative bg-[#0F1E0F] border border-gray-800 rounded-3xl p-5 hover:border-mindful-green/30 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)] transition-all duration-300 flex flex-col h-[340px]"
                >
                    {/* Delete Button (Absolute Top Right) */}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(resource.id);
                            }}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80"
                            title="Delete Resource"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Image Placeholder with Icon */}
                    <div className="w-full h-40 bg-[#48744C] rounded-2xl mb-5 shrink-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity overflow-hidden relative">
                        {/* Subtle pattern or gradient overlay could go here */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />

                        {resource.type === 'Video' ? (
                            <svg className="w-16 h-16 text-white/50 group-hover:text-white/80 transition-colors transform group-hover:scale-110 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-16 h-16 text-white/50 group-hover:text-white/80 transition-colors transform group-hover:scale-110 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h4 className="text-white font-bold text-xl mb-1 line-clamp-1" title={resource.title}>
                            {resource.title}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {resource.description || (resource.content.startsWith('http') ? 'Click to view resource' : resource.content)}
                        </p>

                        {/* Footer: Type Indicators */}
                        <div className="mt-auto flex gap-2">
                            {/* Format Type */}
                            <span className="text-gray-300 border border-gray-600 rounded-lg px-2 py-1 text-xs font-medium">
                                {resource.type}
                            </span>

                            {/* Content Category */}
                            {resource.content_type && (
                                <span className="text-mindful-green border border-mindful-green/40 bg-mindful-green/10 rounded-lg px-2 py-1 text-xs font-medium">
                                    {resource.content_type}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Full Card Link Overlay */}
                    {resource.content.startsWith('http') && (
                        <a
                            href={resource.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 rounded-3xl z-0"
                            aria-label={`Open ${resource.title}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
