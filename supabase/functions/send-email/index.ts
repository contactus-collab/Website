import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Gmail Configuration - Reusing Google Analytics OAuth credentials
// Note: The refresh token must include the Gmail send scope
const GA_CLIENT_ID = Deno.env.get('GA_CLIENT_ID') || ''
const GA_CLIENT_SECRET = Deno.env.get('GA_CLIENT_SECRET') || ''
// Use GA_REFRESH_TOKEN if it includes Gmail scope, or GMAIL_REFRESH_TOKEN if separate
const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN') || ''
const GMAIL_USER = Deno.env.get('GMAIL_USER') || ''

interface EmailRequest {
  subject: string
  recipients: string[]
  contentType: 'text' | 'html'
  content: string
}

// Get Gmail OAuth2 access token using refresh token
async function getGmailAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GA_CLIENT_ID,
      client_secret: GA_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.access_token
}

// Send email via Gmail API
async function sendEmailViaGmail(
  to: string,
  subject: string,
  content: string,
  contentType: 'text' | 'html'
): Promise<void> {
  const accessToken = await getGmailAccessToken()

  // Prepare email content
  let htmlContent = content.trim()
  if (contentType === 'html') {
    // Wrap in proper HTML structure if not already wrapped
    if (!htmlContent.toLowerCase().includes('<html')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${htmlContent}
</body>
</html>`
    }
  }

  // Create email message in RFC 2822 format
  // For plain text version, strip HTML tags and clean up whitespace
  const plainText = contentType === 'html' 
    ? htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&') // Replace &amp; with &
        .replace(/&lt;/g, '<') // Replace &lt; with <
        .replace(/&gt;/g, '>') // Replace &gt; with >
        .replace(/&quot;/g, '"') // Replace &quot; with "
        .replace(/&#39;/g, "'") // Replace &#39; with '
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
        .trim()
    : content

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const date = new Date().toUTCString()

  // Format From field with display name
  const fromField = `"BallFour Foundation" <${GMAIL_USER}>`

  let emailMessage = ''
  if (contentType === 'html') {
    // Encode HTML content in base64 for reliable transmission
    const htmlBytes = new TextEncoder().encode(htmlContent)
    let htmlBinary = ''
    for (let i = 0; i < htmlBytes.length; i++) {
      htmlBinary += String.fromCharCode(htmlBytes[i])
    }
    const htmlBase64 = btoa(htmlBinary)
    
    // Encode plain text in base64 as well for consistency
    const textBytes = new TextEncoder().encode(plainText)
    let textBinary = ''
    for (let i = 0; i < textBytes.length; i++) {
      textBinary += String.fromCharCode(textBytes[i])
    }
    const textBase64 = btoa(textBinary)
    
    emailMessage = `From: ${fromField}
To: ${to}
Subject: ${subject}
Date: ${date}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: base64

${textBase64}

--${boundary}
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: base64

${htmlBase64}

--${boundary}--`
  } else {
    emailMessage = `From: ${fromField}
To: ${to}
Subject: ${subject}
Date: ${date}
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

${content.replace(/\n/g, '\r\n')}`
  }

  // Encode message in base64url format (Gmail API requirement)
  // Convert to base64 using a method that handles all characters properly
  let base64Message = ''
  try {
    // For Deno, we can use btoa with proper string handling
    // Convert the message to a format that btoa can handle
    const messageBytes = new TextEncoder().encode(emailMessage)
    // Convert bytes to string for btoa
    let binaryString = ''
    for (let i = 0; i < messageBytes.length; i++) {
      binaryString += String.fromCharCode(messageBytes[i])
    }
    base64Message = btoa(binaryString)
  } catch (error) {
    console.error('Error encoding message to base64:', error)
    throw new Error('Failed to encode email message')
  }
  
  const encodedMessage = base64Message
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // Send email via Gmail API
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gmail API error details:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      messageLength: emailMessage.length,
      contentType: contentType,
    })
    throw new Error(`Gmail API error: ${response.status} - ${errorText}`)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Check if the requesting user is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate environment variables
    if (!GA_CLIENT_ID || !GA_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_USER) {
      return new Response(
        JSON.stringify({ 
          error: 'Gmail configuration missing. Please ensure GA_CLIENT_ID and GA_CLIENT_SECRET are set (shared with Analytics), and either GMAIL_REFRESH_TOKEN or GA_REFRESH_TOKEN (with Gmail scope) is set. Also set GMAIL_USER with your Gmail address.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json()

    if (!emailRequest.subject || !emailRequest.recipients || !emailRequest.content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: subject, recipients, content' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate contentType
    if (emailRequest.contentType !== 'text' && emailRequest.contentType !== 'html') {
      return new Response(
        JSON.stringify({ error: 'Invalid contentType. Must be "text" or "html"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Log request details for debugging
    console.log('Email request received:', {
      recipientCount: emailRequest.recipients.length,
      contentType: emailRequest.contentType,
      contentLength: emailRequest.content.length,
      subject: emailRequest.subject,
    })

    // Send emails to each recipient individually
    const results: Array<{ recipient: string; status: string; error?: string }> = []
    let sentCount = 0
    let failedCount = 0

    for (const recipient of emailRequest.recipients) {
      try {
        console.log(`Attempting to send email to ${recipient}`, {
          contentType: emailRequest.contentType,
          contentLength: emailRequest.content.length,
          subject: emailRequest.subject,
        })
        
        await sendEmailViaGmail(
          recipient,
          emailRequest.subject,
          emailRequest.content,
          emailRequest.contentType
        )
        
        console.log(`Successfully sent email to ${recipient}`)
        sentCount++
        results.push({ recipient, status: 'success' })
      } catch (error: any) {
        console.error(`Error sending email to ${recipient}:`, {
          error: error.message,
          stack: error.stack,
          contentType: emailRequest.contentType,
        })
        failedCount++
        results.push({ recipient, status: 'failed', error: error.message || 'Unknown error' })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
