import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FamilyInvitationEmail } from './_templates/family-invitation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  invitedEmail: string
  petId: string
  petName: string
  inviterName: string
  role: string
  message?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { invitedEmail, petId, petName, inviterName, role, message }: InvitationRequest = await req.json()

    // Create invitation token
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Store invitation in database
    const { error: inviteError } = await supabaseClient
      .from('family_invitations')
      .insert({
        token: invitationToken,
        invited_email: invitedEmail,
        pet_id: petId,
        invited_by: user.id,
        role: role,
        message: message,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`)
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://your-app.com'
    const acceptUrl = `${appUrl}/accept-invitation?token=${invitationToken}`

    const html = await renderAsync(
      React.createElement(FamilyInvitationEmail, {
        invitedEmail,
        petName,
        inviterName,
        role,
        message,
        acceptUrl
      })
    )

    const { error } = await resend.emails.send({
      from: 'PetHelper <noreply@your-domain.com>',
      to: [invitedEmail],
      subject: `Πρόσκληση για διαχείριση του ${petName}`,
      html,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('Error sending invitation:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Failed to send invitation',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})