import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Analytics Configuration
const GA_CLIENT_ID = Deno.env.get('GA_CLIENT_ID') || ''
const GA_CLIENT_SECRET = Deno.env.get('GA_CLIENT_SECRET') || ''
// IMPORTANT: This must be a NUMERIC Property ID (e.g., "123456789"), NOT the Measurement ID (G-XXXXXXXXX)
// Find your Property ID: https://analytics.google.com/ → Admin → Property Settings
const GA_PROPERTY_ID = Deno.env.get('GA_PROPERTY_ID') || '' // Numeric Property ID (required)

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
      throw new Error('Unauthorized: Admin access required')
    }

    // Check if Google Analytics credentials are configured
    if (!GA_CLIENT_ID || !GA_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Analytics API not configured. Please set GA_CLIENT_ID and GA_CLIENT_SECRET environment variables.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if Property ID is configured (must be numeric, not Measurement ID)
    if (!GA_PROPERTY_ID || isNaN(Number(GA_PROPERTY_ID))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Property ID. Please set GA_PROPERTY_ID environment variable with a numeric Property ID (not the Measurement ID G-XXXXXXXXX). Find it in Google Analytics Admin → Property Settings.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Attempt to get access token and fetch real data from Google Analytics API
    const accessToken = await getGoogleAccessToken()
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with Google Analytics. Please check your credentials and complete the OAuth2 setup.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Get date range parameters from query string
    const url = new URL(req.url)
    const dateRange = url.searchParams.get('dateRange') || '7days'
    const customStartDate = url.searchParams.get('startDate')
    const customEndDate = url.searchParams.get('endDate')

    // Fetch real analytics data from Google Analytics API
    const analyticsData = await fetchAnalyticsData(accessToken, GA_PROPERTY_ID, dateRange, customStartDate || undefined, customEndDate || undefined)
    
    if (!analyticsData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch analytics data from Google Analytics API. Please verify your property ID and API access.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Return only real data from Google Analytics
    return new Response(
      JSON.stringify({
        success: true,
        data: analyticsData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while fetching analytics data',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to get Google OAuth access token using refresh token
// Note: You need to obtain a refresh token first through OAuth2 flow
// Store the refresh token in Supabase secrets as GA_REFRESH_TOKEN
async function getGoogleAccessToken(): Promise<string> {
  const refreshToken = Deno.env.get('GA_REFRESH_TOKEN')
  
  if (!refreshToken) {
    console.error('GA_REFRESH_TOKEN not found. Please complete OAuth2 flow to get refresh token.')
    return ''
  }

  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token'
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GA_CLIENT_ID,
        client_secret: GA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error refreshing access token:', error)
      return ''
    }

    const tokenData = await response.json()
    return tokenData.access_token || ''
  } catch (error) {
    console.error('Error getting access token:', error)
    return ''
  }
}

// Helper function to fetch analytics data from Google Analytics Data API (GA4)
async function fetchAnalyticsData(
  accessToken: string, 
  propertyId: string, 
  dateRange: string = '7days',
  customStartDate?: string,
  customEndDate?: string
): Promise<any> {
  if (!accessToken) {
    return null
  }

  try {
    // Calculate date ranges based on selected period
    let startDate: Date
    let endDate: Date
    let periodDays: number

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
      periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    } else {
      endDate = new Date()
      startDate = new Date()
      const days = parseInt(dateRange.replace('days', '')) || 7
      periodDays = days
      startDate.setDate(startDate.getDate() - days)
    }
    
    // Calculate previous period (same length before current period)
    const previousEndDate = new Date(startDate)
    previousEndDate.setDate(previousEndDate.getDate() - 1) // Day before last period starts
    const previousStartDate = new Date(previousEndDate)
    previousStartDate.setDate(previousStartDate.getDate() - periodDays + 1)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    const previousStartDateStr = previousStartDate.toISOString().split('T')[0]
    const previousEndDateStr = previousEndDate.toISOString().split('T')[0]

    // API endpoint for Google Analytics Data API (GA4)
    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`

    // Fetch overall metrics for last 7 days and previous 7 days (comparison)
    const metricsResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: startDateStr,
            endDate: endDateStr,
            name: 'currentPeriod',
          },
          {
            startDate: previousStartDateStr,
            endDate: previousEndDateStr,
            name: 'previousPeriod',
          },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'newUsers' },
          { name: 'eventCount' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      }),
    })

    if (!metricsResponse.ok) {
      const error = await metricsResponse.text()
      console.error('Error fetching metrics:', error)
      return null
    }

    const metricsData = await metricsResponse.json()
    
    console.log('Metrics API response structure:', {
      hasRows: !!metricsData.rows,
      rowsCount: metricsData.rows?.length || 0,
      firstRow: metricsData.rows?.[0] || null
    })
    
    // Extract metric values for both periods
    // When using multiple date ranges, Google Analytics returns one row per date range in order
    const rows = metricsData.rows || []
    
    // Current period metrics (first row)
    const currentPeriodValues = rows.length > 0 && rows[0]?.metricValues ? rows[0].metricValues : []
    const users = currentPeriodValues[0]?.value ? parseInt(currentPeriodValues[0].value) : 0
    const sessions = currentPeriodValues[1]?.value ? parseInt(currentPeriodValues[1].value) : 0
    const pageViews = currentPeriodValues[2]?.value ? parseInt(currentPeriodValues[2].value) : 0
    const newUsers = currentPeriodValues[3]?.value ? parseInt(currentPeriodValues[3].value) : 0
    const eventCount = currentPeriodValues[4]?.value ? parseInt(currentPeriodValues[4].value) : 0
    const bounceRate = currentPeriodValues[5]?.value ? parseFloat(currentPeriodValues[5].value) : 0
    const avgSessionDuration = currentPeriodValues[6]?.value ? parseFloat(currentPeriodValues[6].value) : 0
    
    // Previous period metrics (second row, if available)
    const previousPeriodValues = rows.length > 1 && rows[1]?.metricValues ? rows[1].metricValues : []
    const previousUsers = previousPeriodValues[0]?.value ? parseInt(previousPeriodValues[0].value) : 0
    
    console.log('Extracted metrics:', {
      users,
      sessions,
      pageViews,
      newUsers,
      eventCount,
      bounceRate,
      avgSessionDuration,
      previousUsers,
      rowsCount: rows.length,
      currentPeriodHasData: currentPeriodValues.length > 0
    })

    // Fetch page views by page path (list of all pages with views)
    const pagesResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: startDateStr,
            endDate: endDateStr,
          },
        ],
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true,
          },
        ],
        limit: 50, // Get more pages for the list
      }),
    })

    let pageViewsList: Array<{ page: string; title: string; views: number; users: number }> = []
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json()
      const pageRows = pagesData.rows || []
      pageViewsList = pageRows.map((row: any) => ({
        page: row.dimensionValues[0]?.value || 'Unknown',
        title: row.dimensionValues[1]?.value || 'Unknown',
        views: parseInt(row.metricValues[0]?.value || '0'),
        users: parseInt(row.metricValues[1]?.value || '0'),
      }))
    }

    // Fetch daily data for comparison graph
    // We need to make separate calls for each period to get proper date formatting
    const currentPeriodResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: startDateStr,
            endDate: endDateStr,
          },
        ],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
          },
        ],
      }),
    })

    const previousPeriodResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [
          {
            startDate: previousStartDateStr,
            endDate: previousEndDateStr,
          },
        ],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
          },
        ],
      }),
    })

    // Process daily data for comparison chart
    let dailyComparisonData: Array<{ 
      date: string
      last7days: number
      previous7days: number
    }> = []
    
    if (currentPeriodResponse.ok) {
      const currentPeriodData = await currentPeriodResponse.json()
      const previousPeriodData = previousPeriodResponse.ok ? await previousPeriodResponse.json() : { rows: [] }
      
      const currentPeriodRows = currentPeriodData.rows || []
      const previousPeriodRows = previousPeriodData.rows || []
      
      // Create maps for both periods by date
      const currentPeriodMap = new Map<string, number>()
      const previousPeriodMap = new Map<string, number>()
      
      // Process current period data
      currentPeriodRows.forEach((row: any) => {
        const date = row.dimensionValues[0]?.value || ''
        const users = parseInt(row.metricValues[0]?.value || '0')
        // Format date from YYYYMMDD to "MMM DD" format (e.g., "Jan 07")
        let formattedDate = date
        if (date.length === 8) {
          const month = parseInt(date.substring(4, 6))
          const day = parseInt(date.substring(6, 8))
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          formattedDate = `${monthNames[month - 1]} ${day.toString().padStart(2, '0')}`
        }
        currentPeriodMap.set(formattedDate, users)
      })
      
      // Process previous period data - map to corresponding dates
      previousPeriodRows.forEach((row: any) => {
        const date = row.dimensionValues[0]?.value || ''
        const users = parseInt(row.metricValues[0]?.value || '0')
        // Format date from YYYYMMDD to "MMM DD" format
        let formattedDate = date
        if (date.length === 8) {
          const month = parseInt(date.substring(4, 6))
          const day = parseInt(date.substring(6, 8))
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          formattedDate = `${monthNames[month - 1]} ${day.toString().padStart(2, '0')}`
        }
        previousPeriodMap.set(formattedDate, users)
      })
      
      // Combine into comparison data structure - use current period dates as primary
      // Sort by original date value to maintain chronological order
      const sortedDates = Array.from(currentPeriodMap.keys()).sort((a, b) => {
        // Parse dates for proper sorting (MMM DD format)
        const parseDate = (d: string) => {
          const parts = d.split(' ')
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const month = monthNames.indexOf(parts[0])
          const day = parseInt(parts[1])
          return month * 100 + day
        }
        return parseDate(a) - parseDate(b)
      })
      
      dailyComparisonData = sortedDates.map((date) => ({
        date,
        last7days: currentPeriodMap.get(date) || 0,
        previous7days: previousPeriodMap.get(date) || 0,
      }))
      
      console.log('Daily comparison data prepared:', dailyComparisonData)
    }

    // Calculate dashboard metrics from daily data
    // Priority: Use dailyComparisonData if available, otherwise use overall users metric
    let totalVisitors = 0
    let averageDaily = 0
    let peakVisitors = 0
    let currentVisitors = 0
    let percentageChange = 0

    // Use daily data if available and has values
    if (dailyComparisonData && dailyComparisonData.length > 0) {
      // Calculate total visitors (sum of all days in the period)
      const totalFromDaily = dailyComparisonData.reduce((sum, day) => sum + (day.last7days || 0), 0)
      
      // If daily data has values, use it; otherwise fall back to overall users
      if (totalFromDaily > 0 || users === 0) {
        totalVisitors = totalFromDaily
        // Calculate average daily (total visitors / number of days)
        averageDaily = dailyComparisonData.length > 0 ? totalVisitors / dailyComparisonData.length : 0
        
        // Find peak visitors (max daily visitors in the period)
        const dailyValues = dailyComparisonData.map(day => day.last7days || 0)
        peakVisitors = dailyValues.length > 0 ? Math.max(...dailyValues) : 0
        
        // Get current visitors (last day in the period)
        const lastDay = dailyComparisonData[dailyComparisonData.length - 1]
        currentVisitors = lastDay ? (lastDay.last7days || 0) : 0
        
        // Calculate percentage change (current day vs same day in previous period)
        if (lastDay && lastDay.previous7days > 0) {
          percentageChange = ((currentVisitors - lastDay.previous7days) / lastDay.previous7days) * 100
        } else if (lastDay && currentVisitors > 0 && lastDay.previous7days === 0) {
          percentageChange = 100 // 100% increase if previous was 0
        } else {
          percentageChange = 0 // No change if both are 0 or no data
        }
      } else {
        // Daily data exists but is all zeros, and we have overall users - use overall users
        totalVisitors = users
        averageDaily = periodDays > 0 ? users / periodDays : 0
        peakVisitors = users
        currentVisitors = users
        percentageChange = 0
      }
    } else {
      // No daily data available - use overall users metric as fallback
      if (users !== undefined && users !== null) {
        totalVisitors = users
        // Approximate average - divide by period days (already calculated above)
        averageDaily = periodDays > 0 ? users / periodDays : 0
        peakVisitors = users // Use total as peak if no daily breakdown
        currentVisitors = users
        percentageChange = 0 // Can't calculate without daily data
      } else {
        // No data at all
        totalVisitors = 0
        averageDaily = 0
        peakVisitors = 0
        currentVisitors = 0
        percentageChange = 0
      }
    }

    console.log('Dashboard metrics calculated:', {
      totalVisitors,
      averageDaily,
      peakVisitors,
      currentVisitors,
      percentageChange,
      source: dailyComparisonData && dailyComparisonData.length > 0 ? 'dailyData' : 'overallUsers',
      users,
      periodDays,
      dailyComparisonDataLength: dailyComparisonData?.length || 0,
      dailyDataSum: dailyComparisonData?.reduce((sum, day) => sum + (day.last7days || 0), 0) || 0
    })

    return {
      // Metrics for last 7 days
      users,
      newUsers,
      sessions,
      pageViews,
      eventCount,
      bounceRate: bounceRate * 100, // Convert to percentage
      avgSessionDuration, // Already in seconds
      
      // Previous period for comparison
      previousUsers,
      
      // Dashboard card metrics
      totalVisitors,
      averageDaily,
      peakVisitors,
      currentVisitors,
      percentageChange,
      
      // Page views list (all pages with views)
      pageViewsList,
      
      // Daily comparison data for graph
      dailyComparisonData,
      
      // Date ranges
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      previousDateRange: {
        start: previousStartDate.toISOString(),
        end: previousEndDate.toISOString(),
      },
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return null
  }
}

