'use client';

import { useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/supabaseClient';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddResourceModal({ isOpen, onClose, onSuccess }: AddResourceModalProps) {
    const { user } = useUser();
    const { session } = useSession();

    const [title, setTitle] = useState('');
    const [type, setType] = useState('Article');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !session) return;

        if (!title.trim() || !content.trim()) {
            setError('Please fill in directly required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            const { error: insertError } = await supabase
                .from('resources')
                .insert({
                    title: title.trim(),
                    type: type,
                    content: content.trim(),
                });

            if (insertError) {
                console.error('Resource insert error:', insertError);
                throw insertError;
            }

            // Reset
            setTitle('');
            setContent('');
            setType('Article');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error adding resource:', err);
            setError('Failed to add resource. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#031207] border border-gray-800 rounded-2xl shadow-[0px_0px_20px_0px_rgba(34,197,94,0.1)] p-6 m-4 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-white mb-6">Add New Resource</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 font-medium ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Resource Title"
                            className="w-full px-4 py-3 bg-[#0F1E0F] border border-gray-700 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-mindful-green"
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 font-medium ml-1">Type</label>
                        <div className="flex bg-[#0F1E0F] p-1 rounded-xl border border-gray-700">
                            {['Article', 'Video'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === t
                                            ? 'bg-mindful-green text-white shadow-lg'
                                            : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content / URL */}
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400 font-medium ml-1">
                            {type === 'Video' ? 'Video Link' : 'Content or Link'}
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === 'Video' ? 'https://youtube.com/...' : 'Paste link or summary...'}
                            rows={3}
                            className="w-full px-4 py-3 bg-[#0F1E0F] border border-gray-700 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-mindful-green resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-transparent border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-mindful-green text-white rounded-xl hover:bg-[#5a9f5f] transition-all shadow-lg shadow-mindful-green/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
