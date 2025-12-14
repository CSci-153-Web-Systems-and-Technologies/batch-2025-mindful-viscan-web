import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Missing Env Variables' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const testId = `test-user-${Date.now()}`;
        const { error } = await supabase.from('users').insert({
            id: testId,
            full_name: 'Test Connectivity User',
            role: 'student'
        });

        if (error) {
            console.error('DB Test Error:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: testId });
    } catch (err: any) {
        console.error('DB Test Exception:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
