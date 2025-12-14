'use client';

import { useState } from 'react';
import { createAuthenticatedClient } from '@/app/utils/supabase/client';
import { useSession, useUser } from '@clerk/nextjs';

interface MoodEntryProps {
    onEntryAdded: () => void;
}

export default function MoodEntry({ onEntryAdded }: MoodEntryProps) {
    const { session } = useSession();
    const { user } = useUser();

    // Form State
    const [summary, setSummary] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [note, setNote] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formatting, setFormatting] = useState({ bold: false, italic: false, underline: false });

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
                // Reset form
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

    // Toggle formatting for textarea (Visual only for now, or simple markdown injection)
    // For simplicity, we'll just insert markdown chars or leave as is if pure text.
    // The design shows B / I / U buttons. Let's make them insert markdown.
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
        } else if (type === 'underline') {
            // Markdown doesn't standardly support underline, usually ignored or HTML used.
            // We'll skip or use HTML <u> tag if safe, or just ignore for MVP.
            // Let's use simple CSS class logic if we were rendering rich text, 
            // but for simpler input, let's just use it as a placeholder.
        }

        setNote(newText);
    };

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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex gap-2">
                    {/* Icons from design (optional) */}
                    <span>📎</span>
                    <span>➤</span>
                </div>
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
                <p className="text-sm text-gray-400 mb-2">Need more room?</p>
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
