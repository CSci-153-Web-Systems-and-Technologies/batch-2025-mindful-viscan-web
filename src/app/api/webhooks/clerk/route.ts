/*
 * ⚠️ DATABASE SETUP REQUIREMENT ⚠️
 * This webhook is tailored to your 'users' table columns:
 * 1. id (text) - Primary Key
 * 2. full_name (text)
 * 3. role (text) - defaulting to 'user' if empty
 *
 * Note: I removed the email sync because your table doesn't have an 'email' column yet!
 */

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
    // 1. Get the Webhook Secret from your .env file
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // 2. Get the headers to verify the request
    const headerPayload = headers()
    const svix_id = (await headerPayload).get('svix-id')
    const svix_timestamp = (await headerPayload).get('svix-timestamp')
    const svix_signature = (await headerPayload).get('svix-signature')

    // If headers are missing, someone is trying to spoof us
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    // 3. Get the body
    const body = await req.text()

    // 4. Verify the signature using Svix
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

    // 5. Handle the event
    // We need a Supabase client with the SERVICE ROLE key to bypass RLS
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, first_name, last_name, public_metadata, unsafe_metadata } = evt.data
        const fullName = `${first_name || ''} ${last_name || ''}`.trim()
        const role = (public_metadata?.role as string) || (unsafe_metadata?.role as string) || 'student' // Default to student

        const { error } = await supabase.from('users').upsert({
            id: id,
            full_name: fullName,
            role: role,
        })

        if (error) {
            console.error('Error inserting user into Supabase:', error)
            return new Response('Error inserting user', { status: 500 })
        }

        console.log(`User ${id} added with role ${role}!`)
    }

    // Handle updates
    if (eventType === 'user.updated') {
        const { id, first_name, last_name, public_metadata } = evt.data
        const fullName = `${first_name || ''} ${last_name || ''}`.trim()
        const role = public_metadata?.role as string

        const upsertData: any = {
            id: id,
            full_name: fullName,
        }

        // Only update role if it exists in metadata, otherwise leave it alone
        if (role) {
            upsertData.role = role
        }

        const { error } = await supabase
            .from('users')
            .upsert(upsertData)

        if (error) {
            console.error('Error updating user:', error)
            return new Response('Error updating user', { status: 500 })
        }
    }

    // Handle deletions
    if (eventType === 'user.deleted') {
        const { id } = evt.data
        const { error } = await supabase.from('users').delete().eq('id', id!)

        if (error) {
            console.error('Error deleting user:', error)
            return new Response('Error deleting user', { status: 500 })
        }
    }

    return new Response('', { status: 200 })
}