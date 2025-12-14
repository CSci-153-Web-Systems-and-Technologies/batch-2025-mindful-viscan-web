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
                    className="group relative bg-[#0F1E0F] border border-gray-800 rounded-2xl p-6 hover:border-mindful-green/30 hover:shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)] transition-all duration-300 flex flex-col"
                >
                    {/* Icon & Type Badge */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`
                            p-3 rounded-xl 
                            ${resource.type === 'Video' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}
                        `}>
                            {resource.type === 'Video' ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            )}
                        </div>

                        {/* Delete Button (Only visible if onDelete is provided) */}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(resource.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                                title="Delete Resource"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${resource.type === 'Video'
                                    ? 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                                    : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                                }`}>
                                {resource.type}
                            </span>
                            <span className="text-gray-500 text-xs">
                                {new Date(resource.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h4 className="text-gray-100 font-medium text-lg mb-2 line-clamp-2" title={resource.title}>
                            {resource.title}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                            {resource.content.startsWith('http')
                                ? 'Click to view this resource link.'
                                : resource.content}
                        </p>
                    </div>

                    {/* Footer / Link */}
                    {resource.content.startsWith('http') ? (
                        <a
                            href={resource.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto flex items-center gap-2 text-sm font-medium text-mindful-green hover:text-white transition-colors"
                        >
                            Open Link
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    ) : (
                        <div className="mt-auto text-sm text-gray-500 italic">
                            Text Resource
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
