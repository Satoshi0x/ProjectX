import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Get active users (users who have been active in the last 5 minutes)
    const { data: activeUsers } = await supabase
      .from("analytics")
      .select("user_id")
      .gte("timestamp", fiveMinutesAgo.toISOString())
      .neq("user_id", null)

    const activeUserCount = new Set(activeUsers?.map((u) => u.user_id) || []).size

    // Get top domains by activity today
    const { data: domainStats } = await supabase
      .from("analytics")
      .select("website, action")
      .gte("timestamp", today.toISOString())
      .eq("action", "site_visit")

    // Process domain statistics
    const domainCounts = {}
    domainStats?.forEach((stat) => {
      if (stat.website) {
        domainCounts[stat.website] = (domainCounts[stat.website] || 0) + 1
      }
    })

    // Get active users per domain (last 10 minutes)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
    const { data: recentActivity } = await supabase
      .from("analytics")
      .select("website, user_id, action")
      .gte("timestamp", tenMinutesAgo.toISOString())
      .eq("action", "site_visit")

    const domainActiveUsers = {}
    recentActivity?.forEach((activity) => {
      if (activity.website) {
        if (!domainActiveUsers[activity.website]) {
          domainActiveUsers[activity.website] = new Set()
        }
        domainActiveUsers[activity.website].add(activity.user_id)
      }
    })

    const topDomains = Object.entries(domainCounts)
      .map(([domain, messages]) => ({
        domain,
        messages: messages as number,
        activeUsers: domainActiveUsers[domain]?.size || 0,
      }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 5)

    // Get daily statistics
    const { data: dailyMessages } = await supabase.from("messages").select("id").gte("timestamp", today.toISOString())

    const { data: dailyTips } = await supabase
      .from("analytics")
      .select("id")
      .gte("timestamp", today.toISOString())
      .eq("action", "bitcoin_tip_sent")

    const { data: dailyDomains } = await supabase
      .from("analytics")
      .select("website")
      .gte("timestamp", today.toISOString())
      .eq("action", "site_visit")

    const uniqueDomains = new Set(dailyDomains?.map((d) => d.website).filter(Boolean) || [])

    // Get recent activity for feed
    const { data: recentActivityFeed } = await supabase
      .from("analytics")
      .select("action, website, timestamp")
      .gte("timestamp", new Date(now.getTime() - 60 * 60 * 1000).toISOString()) // Last hour
      .order("timestamp", { ascending: false })
      .limit(20)

    const formattedActivity =
      recentActivityFeed?.map((activity) => ({
        action: formatActivityAction(activity.action),
        domain: activity.website || "unknown",
        timestamp: activity.timestamp,
      })) || []

    return NextResponse.json({
      activeUsers: activeUserCount,
      topDomains,
      dailyStats: {
        messages: dailyMessages?.length || 0,
        tips: dailyTips?.length || 0,
        domains: uniqueDomains.size,
      },
      recentActivity: formattedActivity,
    })
  } catch (error) {
    console.error("Analytics trending error:", error)
    return NextResponse.json({ error: "Failed to fetch trending data" }, { status: 500 })
  }
}

function formatActivityAction(action: string): string {
  const actionMap: { [key: string]: string } = {
    site_visit: "User visited",
    wallet_opened: "Wallet opened",
    bitcoin_tip_sent: "Bitcoin tip sent",
    message_sent: "Message sent",
    wallet_connected: "Wallet connected",
  }
  return actionMap[action] || action
}
