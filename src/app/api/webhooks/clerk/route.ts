/*
 * ⚠️ DATABASE SYNC ⚠️
 * This webhook keeps Supabase 'users' table in sync with Clerk.
 * - user.created -> upsert user
 * - user.updated -> update user
 * - user.deleted -> delete user (cascades to all data)
 */

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = (await headerPayload).get('svix-id')
    const svix_timestamp = (await headerPayload).get('svix-timestamp')
    const svix_signature = (await headerPayload).get('svix-signature')

    // If headers are missing, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Verify the signature
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    // Setup Supabase Admin Client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const eventType = evt.type
    console.log('------------------------------------------------')
    console.log(`[Webhook] Received event: ${eventType}`)
    // console.log(`[Webhook] Payload:`, JSON.stringify(evt.data, null, 2)) // Uncomment if needed, but type is usually enough

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, first_name, last_name, public_metadata, unsafe_metadata, email_addresses, primary_email_address_id } = evt.data

        console.log(`[Webhook] Processing user: ${id}`)

        const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'User'

        // Resolve Role: Public Metadata > Unsafe Metadata > default 'student'
        const role = (public_metadata?.role as string) || (unsafe_metadata?.role as string) || 'student'

        // Resolve Email
        const primaryEmailObj = email_addresses?.find(e => e.id === primary_email_address_id)
        const email = primaryEmailObj?.email_address || (email_addresses && email_addresses[0]?.email_address) || ''

        console.log(`Syncing user ${id} (${fullName}) as ${role}...`)

        const { error } = await supabase.from('users').upsert({
            id: id,
            full_name: fullName,
            role: role,
        }, { onConflict: 'id' })

        if (error) {
            console.error('Error syncing user to Supabase:', error)
            return new Response(`Error syncing user: ${error.message}`, { status: 500 })
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data
        if (!id) return new Response('No ID found', { status: 400 })

        console.log(`Deleting user ${id} and all related data...`)

        // 1. Manually delete dependent data (in case CASCADE is missing)
        // Order matters slightly (messages depend on sessions)

        // Chat Messages (sent by user)
        await supabase.from('messages').delete().eq('sender_id', id)

        // Mood Logs
        await supabase.from('mood_logs').delete().eq('user_id', id)

        // Thoughts
        await supabase.from('thoughts').delete().eq('user_id', id)

        // Daily Logins
        await supabase.from('daily_logins').delete().eq('user_id', id)

        // Counseling Sessions (Student)
        // Note: deleting sessions might crash if they have messages from OTHERS, 
        // but typically messages cascade from sessions.
        await supabase.from('counseling_sessions').delete().eq('student_id', id)

        // 2. Finally, delete the user
        const { error } = await supabase.from('users').delete().eq('id', id)

        if (error) {
            console.error('Error deleting user from Supabase:', error)
            return new Response(`Error deleting user: ${error.message}`, { status: 500 })
        }
    }

    return new Response('', { status: 200 })
}