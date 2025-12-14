'use client';

import { useState } from 'react';
import { createAuthenticatedClient } from '@/lib/supabaseClient';
import { useSession, useUser } from '@clerk/nextjs';

interface MoodLog {
    id: string;
    created_at: string;
    rating: number;
    note?: string;
    summary?: string;
}

interface MoodEntryProps {
    onEntryAdded: () => void;
    currentLog?: MoodLog | null;
}

export default function MoodEntry({ onEntryAdded, currentLog }: MoodEntryProps) {
    const { session } = useSession();
    const { user } = useUser();

    // Form State
    const [summary, setSummary] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [note, setNote] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mood Icons & Colors
    const moods = [
        { value: 1, label: 'Awful', icon: '😫', color: 'text-red-500 hover:bg-red-500/10' },
        { value: 2, label: 'Bad', icon: '☹️', color: 'text-orange-500 hover:bg-orange-500/10' },
        { value: 3, label: 'Okay', icon: '😐', color: 'text-yellow-500 hover:bg-yellow-500/10' },
        { value: 4, label: 'Good', icon: '🙂', color: 'text-green-400 hover:bg-green-400/10' },
        { value: 5, label: 'Great', icon: '🤩', color: 'text-green-600 hover:bg-green-600/10' },
    ];

    const handleSubmit = async () => {
        if (!rating || !summary || !user || !session) return;

        try {
            setIsSubmitting(true);
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            const { error } = await supabase
                .from('mood_logs')
                .insert({
                    user_id: user.id,
                    rating,
                    summary,
                    note
                });

            if (error) {
                console.error("Error submitting mood:", error);
                alert("Failed to save mood entry.");
            } else {
                setSummary('');
                setRating(null);
                setNote('');
                onEntryAdded();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const insertFormatting = (type: 'bold' | 'italic' | 'underline') => {
        const textarea = document.getElementById('mood-note') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = note.substring(start, end);
        let newText = note;

        if (type === 'bold') {
            newText = note.substring(0, start) + `**${selectedText}**` + note.substring(end);
        } else if (type === 'italic') {
            newText = note.substring(0, start) + `*${selectedText}*` + note.substring(end);
        }

        setNote(newText);
    };

    // If a log for today exists, show Read-Only View
    if (currentLog) {
        const mood = moods.find(m => m.value === currentLog.rating);
        return (
            <div className="w-full bg-[#031207] border border-gray-900/50 rounded-2xl p-6 flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] relative overflow-hidden">
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 p-32 rounded-full blur-[100px] opacity-10 ${mood?.color.split(' ')[0].replace('text-', 'bg-') || 'bg-gray-500'}`} />

                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center z-10">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-gray-400 text-sm uppercase tracking-widest">Daily Check-in Complete</span>
                        <h3 className="text-2xl font-kodchasan text-white font-bold">You're feeling {mood?.label || '...'}</h3>
                    </div>

                    <div className="text-6xl animate-bounce-slow">
                        {mood?.icon}
                    </div>

                    <div className="bg-[#0F1E0F] px-6 py-3 rounded-xl border border-gray-800 max-w-lg mt-4">
                        <p className="text-gray-200 italic">"{currentLog.summary}"</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#031207] border border-gray-900/50 rounded-2xl p-6 flex flex-col gap-6 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)]">
            {/* Top Input: Summary */}
            <div className="relative group">
                <input
                    type="text"
                    placeholder="How would you briefly describe your day?"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-[#0F1E0F] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-mindful-green transition-colors pr-12"
                />
            </div>

            {/* Mood Selector (Icons) */}
            <div className="flex justify-between items-center bg-[#0F1E0F] border border-gray-800 rounded-xl px-6 py-3">
                {moods.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => setRating(m.value)}
                        className={`text-2xl transition-all duration-200 transform hover:scale-125 p-2 rounded-full ${m.color} ${rating === m.value ? 'bg-white/10 scale-125' : 'opacity-70 hover:opacity-100'}`}
                        title={m.label}
                    >
                        {m.icon}
                    </button>
                ))}
            </div>

            {/* Formatting Toolbar */}
            <div className="flex gap-2">
                <button onClick={() => insertFormatting('bold')} className="w-8 h-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500">B</button>
                <button onClick={() => insertFormatting('italic')} className="w-8 h-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 italic">I</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 underline">U</button>
            </div>

            {/* Large Text Area */}
            <div className="flex-1">
                <textarea
                    id="mood-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="More thoughts for the day?"
                    className="w-full h-48 bg-[#0F1E0F] border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-mindful-green transition-colors resize-none"
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !rating || !summary}
                    className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </div>
    );
}
