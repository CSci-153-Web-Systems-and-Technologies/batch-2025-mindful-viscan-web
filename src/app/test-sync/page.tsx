'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function TestSyncPage() {
    const [status, setStatus] = useState<string>('Idle');
    const [details, setDetails] = useState<string>('');

    useEffect(() => {
        async function runTest() {
            setStatus('Running Test...');
            try {
                // We need to call a server action or API route because Service Role Key 
                // CANNOT be used in the client directly.
                // Wait, I can't check Service Role on Client. 
                // I must create an API route for this test to be valid.

                const res = await fetch('/api/test-db-connection');
                const data = await res.json();

                if (res.ok) {
                    setStatus('Success ✅');
                    setDetails(`User inserted! ID: ${data.id}`);
                } else {
                    setStatus('Failed ❌');
                    setDetails(data.error || 'Unknown error');
                }
            } catch (err: any) {
                setStatus('Error ⚠️');
                setDetails(err.message);
            }
        }

        runTest();
    }, []);

    return (
        <div className="p-10 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl mb-4">Database Connection Test</h1>
            <div className="text-xl mb-2">Status: {status}</div>
            <pre className="bg-gray-900 p-4 rounded text-sm text-green-400">
                {details}
            </pre>
        </div>
    );
}
