import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FamilyInvitationEmail } from './_templates/family-invitation.tsx'

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
    console.log('🚀 send-family-invitation function called')
    
    // Check if RESEND_API_KEY exists
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }
    console.log('✅ RESEND_API_KEY found')

    // Initialize Resend client
    const resend = new Resend(resendApiKey)

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
    console.log('✅ User authenticated:', user.id)

    const { invitedEmail, petId, petName, inviterName, role, message }: InvitationRequest = await req.json()
    console.log('📧 Invitation request:', { invitedEmail, petId, petName, role })

    // Create invitation token
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Store invitation in database
    console.log('💾 Storing invitation in database...')
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
      console.error('❌ Database error:', inviteError)
      throw new Error(`Failed to create invitation: ${inviteError.message}`)
    }
    console.log('✅ Invitation stored in database')

    // Create deep link URL for mobile app with fallback to web
    const mobileScheme = 'formypet://accept-invitation'
    const webUrl = 'https://formypet.gr/accept-invitation'
    const acceptUrl = `${mobileScheme}?token=${invitationToken}&fallback=${encodeURIComponent(webUrl + '?token=' + invitationToken)}`

    console.log('📧 Rendering email template...')
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
    console.log('✅ Email template rendered')

    console.log('📤 Sending email via Resend...')
    const { error } = await resend.emails.send({
      from: 'ForMyPet <noreply@formypet.gr>',
      to: [invitedEmail],
      subject: `Πρόσκληση για διαχείριση του ${petName}`,
      html,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      throw error
    }
    console.log('✅ Email sent successfully!')

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('❌ Error sending invitation:', error)
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