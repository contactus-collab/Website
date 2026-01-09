import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

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
      throw new Error('Unauthorized: Admin access required')
    }

    // Get Metricool API credentials from environment variables
    const METRICOOL_API_KEY = Deno.env.get('METRICOOL_API_KEY')
    const METRICOOL_USER_ID = Deno.env.get('METRICOOL_USER_ID')
    const METRICOOL_BLOG_ID = Deno.env.get('METRICOOL_BLOG_ID')

    if (!METRICOOL_API_KEY || !METRICOOL_USER_ID || !METRICOOL_BLOG_ID) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Metricool API credentials not configured. Please set METRICOOL_API_KEY, METRICOOL_USER_ID, and METRICOOL_BLOG_ID environment variables.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get date range from query parameters
    const url = new URL(req.url)
    const dateRange = url.searchParams.get('dateRange') || '7days'
    const customStartDate = url.searchParams.get('startDate')
    const customEndDate = url.searchParams.get('endDate')

    // Calculate date ranges
    let startDate: Date
    let endDate: Date

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
    } else {
      endDate = new Date()
      startDate = new Date()
      const days = parseInt(dateRange.replace('days', '')) || 7
      startDate.setDate(startDate.getDate() - days)
    }

    // Format dates for Metricool API (YYYY-MM-DDTHH:mm:ss-TZ format)
    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      // Get timezone offset
      const offset = -date.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(offset) / 60)
      const offsetMinutes = Math.abs(offset) % 60
      const offsetSign = offset >= 0 ? '+' : '-'
      const timezone = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`
    }

    const fromDate = formatDateForAPI(startDate)
    const toDate = formatDateForAPI(endDate)

    // Format dates for distribution API (YYYY-MM-DDTHH:mm:ss format without timezone)
    const formatDateForDistributionAPI = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}T00:00:00`
    }

    const fromDateDistribution = formatDateForDistributionAPI(startDate)
    const toDateDistribution = formatDateForDistributionAPI(endDate)

    // Fetch LinkedIn analytics from Metricool API (Followers timeline)
    const timelineUrl = new URL('https://app.metricool.com/api/v2/analytics/timelines')
    timelineUrl.searchParams.append('from', fromDate)
    timelineUrl.searchParams.append('to', toDate)
    timelineUrl.searchParams.append('metric', 'Followers')
    timelineUrl.searchParams.append('network', 'linkedin')
    timelineUrl.searchParams.append('timezone', 'America/Indianapolis')
    timelineUrl.searchParams.append('metricType', 'account')
    timelineUrl.searchParams.append('userId', METRICOOL_USER_ID)
    timelineUrl.searchParams.append('blogId', METRICOOL_BLOG_ID)

    // Fetch follower distribution by function
    const distributionUrl = new URL('https://app.metricool.com/api/v2/analytics/distribution')
    distributionUrl.searchParams.append('from', fromDateDistribution)
    distributionUrl.searchParams.append('to', toDateDistribution.replace('T00:00:00', 'T23:59:59'))
    distributionUrl.searchParams.append('metric', 'followerCountsByFunction')
    distributionUrl.searchParams.append('network', 'linkedin')
    distributionUrl.searchParams.append('subject', 'account')
    distributionUrl.searchParams.append('userId', METRICOOL_USER_ID)
    distributionUrl.searchParams.append('blogId', METRICOOL_BLOG_ID)

    // Fetch follower distribution by industry
    const industryDistributionUrl = new URL('https://app.metricool.com/api/v2/analytics/distribution')
    industryDistributionUrl.searchParams.append('from', fromDateDistribution)
    industryDistributionUrl.searchParams.append('to', toDateDistribution.replace('T00:00:00', 'T23:59:59'))
    industryDistributionUrl.searchParams.append('metric', 'aggregatedFollowerCountsByIndustry')
    industryDistributionUrl.searchParams.append('network', 'linkedin')
    industryDistributionUrl.searchParams.append('subject', 'account')
    industryDistributionUrl.searchParams.append('userId', METRICOOL_USER_ID)
    industryDistributionUrl.searchParams.append('blogId', METRICOOL_BLOG_ID)

    // Fetch all endpoints in parallel
    const [timelineResponse, distributionResponse, industryDistributionResponse] = await Promise.all([
      fetch(timelineUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Mc-Auth': METRICOOL_API_KEY,
          'Content-Type': 'application/json',
        },
      }),
      fetch(distributionUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Mc-Auth': METRICOOL_API_KEY,
          'Content-Type': 'application/json',
        },
      }),
      fetch(industryDistributionUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Mc-Auth': METRICOOL_API_KEY,
          'Content-Type': 'application/json',
        },
      })
    ])

    if (!timelineResponse.ok) {
      const errorText = await timelineResponse.text()
      console.error('Metricool Timeline API error:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch LinkedIn analytics from Metricool API: ${errorText}`,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: timelineResponse.status,
        }
      )
    }

    const timelineData = await timelineResponse.json()
    
    // Process distribution data by function
    let distributionData: Array<{ key: string; value: number }> = []
    if (distributionResponse.ok) {
      const distData = await distributionResponse.json()
      if (distData.data && Array.isArray(distData.data)) {
        distributionData = distData.data.map((item: any) => ({
          key: item.key || 'Unknown',
          value: parseFloat(item.value) || 0,
        }))
        // Sort by value descending for better visualization
        distributionData.sort((a, b) => b.value - a.value)
      }
    } else {
      console.warn('Distribution API returned error:', distributionResponse.status)
    }

    // Process distribution data by industry
    let industryDistributionData: Array<{ key: string; value: number }> = []
    if (industryDistributionResponse.ok) {
      const industryDistData = await industryDistributionResponse.json()
      if (industryDistData.data && Array.isArray(industryDistData.data)) {
        industryDistributionData = industryDistData.data.map((item: any) => ({
          key: item.key || 'Unknown',
          value: parseFloat(item.value) || 0,
        }))
        // Sort by value descending for better visualization
        industryDistributionData.sort((a, b) => b.value - a.value)
      }
    } else {
      console.warn('Industry Distribution API returned error:', industryDistributionResponse.status)
    }

    const data = timelineData

    // Process the data
    let followersData: Array<{ date: string; value: number }> = []
    let totalFollowers = 0
    let currentFollowers = 0
    let previousFollowers = 0
    let changePercentage = 0
    let peakFollowers = 0
    let averageFollowers = 0

    if (data.data && data.data.length > 0 && data.data[0].values) {
      const values = data.data[0].values
      
      // Sort by date (oldest first)
      const sortedValues = [...values].sort((a: any, b: any) => {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      })

      followersData = sortedValues.map((item: any) => {
        const date = new Date(item.dateTime)
        const formattedDate = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        return {
          date: formattedDate,
          value: item.value || 0,
        }
      })

      if (followersData.length > 0) {
        // Current followers (last value)
        currentFollowers = followersData[followersData.length - 1].value
        
        // Previous followers (first value)
        previousFollowers = followersData[0].value
        
        // Total change
        totalFollowers = currentFollowers
        
        // Change percentage
        if (previousFollowers > 0) {
          changePercentage = ((currentFollowers - previousFollowers) / previousFollowers) * 100
        } else if (currentFollowers > 0) {
          changePercentage = 100
        }
        
        // Peak followers
        peakFollowers = Math.max(...followersData.map(d => d.value))
        
        // Average followers
        const sum = followersData.reduce((acc, d) => acc + d.value, 0)
        averageFollowers = followersData.length > 0 ? sum / followersData.length : 0
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          followersData,
          distributionData,
          industryDistributionData,
          metrics: {
            totalFollowers,
            currentFollowers,
            previousFollowers,
            changePercentage,
            peakFollowers,
            averageFollowers,
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error in get-linkedin-analytics:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

