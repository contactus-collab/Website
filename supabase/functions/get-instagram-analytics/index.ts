import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    const METRICOOL_API_KEY = Deno.env.get('METRICOOL_API_KEY')
    const METRICOOL_USER_ID = Deno.env.get('METRICOOL_USER_ID')
    const METRICOOL_BLOG_ID = Deno.env.get('METRICOOL_BLOG_ID')

    if (!METRICOOL_API_KEY || !METRICOOL_USER_ID || !METRICOOL_BLOG_ID) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Metricool API credentials not configured. Set METRICOOL_API_KEY, METRICOOL_USER_ID, and METRICOOL_BLOG_ID.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const url = new URL(req.url)
    const dateRange = url.searchParams.get('dateRange') || '60days'

    // Date range calculation — same as LinkedIn (local time, not UTC)
    const endDate = new Date()
    const startDate = new Date()
    const days = Math.max(1, parseInt(dateRange.replace('days', ''), 10) || 60)
    startDate.setDate(startDate.getDate() - days)

    // Format dates for Metricool API (YYYY-MM-DDTHH:mm:ss-TZ) — same as LinkedIn
    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      const offset = -date.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offset) / 60)
      const offsetMinutes = Math.abs(offset) % 60
      const offsetSign = offset >= 0 ? '+' : '-'
      const timezone = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`
    }

    const fromDate = formatDateForAPI(startDate)
    const toDate = formatDateForAPI(endDate)

    // Format dates for posts API (YYYY-MM-DDTHH:mm:ss) — same pattern as LinkedIn distribution
    const formatDateForPostsAPI = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}T00:00:00`
    }

    const fromDatePosts = formatDateForPostsAPI(startDate)
    const toDatePosts = formatDateForPostsAPI(endDate).replace('T00:00:00', 'T23:59:59')

    const timelineUrl = new URL('https://app.metricool.com/api/v2/analytics/timelines')
    timelineUrl.searchParams.append('from', fromDate)
    timelineUrl.searchParams.append('to', toDate)
    timelineUrl.searchParams.append('metric', 'followers')
    timelineUrl.searchParams.append('network', 'instagram')
    timelineUrl.searchParams.append('timezone', 'America/Indianapolis')
    timelineUrl.searchParams.append('subject', 'account')
    timelineUrl.searchParams.append('userId', METRICOOL_USER_ID)
    timelineUrl.searchParams.append('blogId', METRICOOL_BLOG_ID)

    const postsUrl = new URL('https://app.metricool.com/api/v2/analytics/posts/instagram')
    postsUrl.searchParams.append('from', fromDatePosts)
    postsUrl.searchParams.append('to', toDatePosts)
    postsUrl.searchParams.append('userId', METRICOOL_USER_ID)
    postsUrl.searchParams.append('blogId', METRICOOL_BLOG_ID)

    const [timelineResponse, postsResponse] = await Promise.all([
      fetch(timelineUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Mc-Auth': METRICOOL_API_KEY,
          'Content-Type': 'application/json',
        },
      }),
      fetch(postsUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Mc-Auth': METRICOOL_API_KEY,
          'Content-Type': 'application/json',
        },
      }),
    ])

    if (!timelineResponse.ok) {
      const errorText = await timelineResponse.text()
      console.error('Metricool Instagram timeline error:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch Instagram followers: ${errorText}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: timelineResponse.status }
      )
    }

    const timelineData = await timelineResponse.json()

    // Process timeline data — same structure as LinkedIn
    let followersData: Array<{ date: string; value: number }> = []
    let currentFollowers = 0
    let previousFollowers = 0
    let changePercentage = 0
    let peakFollowers = 0
    let averageFollowers = 0

    if (timelineData?.data && timelineData.data.length > 0 && timelineData.data[0].values) {
      const values = timelineData.data[0].values

      const sortedValues = [...values].sort((a: { dateTime: string }, b: { dateTime: string }) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      })

      followersData = sortedValues.map((item: { dateTime: string; value: number }) => {
        const date = new Date(item.dateTime)
        const formattedDate = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        return {
          date: formattedDate,
          value: item.value || 0,
        }
      })

      if (followersData.length > 0) {
        currentFollowers = followersData[followersData.length - 1].value
        previousFollowers = followersData[0].value
        if (previousFollowers > 0) {
          changePercentage = ((currentFollowers - previousFollowers) / previousFollowers) * 100
        } else if (currentFollowers > 0) {
          changePercentage = 100
        }
        peakFollowers = Math.max(...followersData.map((d) => d.value))
        const sum = followersData.reduce((acc, d) => acc + d.value, 0)
        averageFollowers = sum / followersData.length
      }
    }

    let posts: unknown[] = []
    if (postsResponse.ok) {
      const postsJson = await postsResponse.json()
      posts = Array.isArray(postsJson?.data) ? postsJson.data : []
    } else {
      console.warn('Instagram posts API error:', postsResponse.status)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          followersData,
          metrics: {
            currentFollowers,
            previousFollowers,
            changePercentage,
            peakFollowers,
            averageFollowers,
          },
          posts,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error in get-instagram-analytics:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
