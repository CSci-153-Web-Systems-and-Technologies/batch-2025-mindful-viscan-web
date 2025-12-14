'use client';

import { useState, useEffect } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/supabaseClient';
import ResourceGrid, { Resource } from '@/app/components/resources/ResourceGrid';
import AddResourceModal from './AddResourceModal';

export default function ResourceManager() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchResources = async () => {
        if (!session) return;

        try {
            setLoading(true);
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching resources:', error);
            } else {
                setResources(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        if (!session) return;

        try {
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting resource:', error);
                alert('Failed to delete resource');
            } else {
                fetchResources(); // Refresh list
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    useEffect(() => {
        if (isLoaded && session) {
            fetchResources();
        }
    }, [isLoaded, session]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-kodchasan font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                        Resource Library
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage curative materials for student well-being
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-mindful-green text-white rounded-xl hover:bg-[#5a9f5f] transition-all font-medium shadow-lg shadow-mindful-green/20 flex items-center gap-2 self-start md:self-auto"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Resource
                </button>
            </div>

            {/* Grid */}
            <ResourceGrid
                resources={resources}
                isLoading={loading}
                onDelete={handleDeleteResource} // Pass delete handler for counselors
            />

            {/* Modal */}
            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchResources}
            />
        </div>
    );
}
