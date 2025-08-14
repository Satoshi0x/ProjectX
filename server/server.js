const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()

app.use(
  cors({
    origin: ["chrome-extension://*", "moz-extension://*", "https://*.vercel.app", "http://localhost:*"],
    credentials: true,
  }),
)
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ["chrome-extension://*", "moz-extension://*", "https://*.vercel.app", "http://localhost:*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

// In-memory storage for active connections (still needed for real-time features)
const domainRooms = new Map()

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Join domain-based room
  socket.on("join-room", async (domain) => {
    socket.join(domain)

    if (!domainRooms.has(domain)) {
      domainRooms.set(domain, new Set())
    }
    domainRooms.get(domain).add(socket.id)

    try {
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("domain", domain)
        .order("created_at", { ascending: false })
        .limit(50)

      if (messages) {
        socket.emit("message-history", messages.reverse())
      }
    } catch (error) {
      console.error("Error fetching message history:", error)
    }

    // Notify room about user count
    const userCount = domainRooms.get(domain).size
    io.to(domain).emit("user-count-update", userCount)

    console.log(`User ${socket.id} joined room: ${domain}`)
  })

  // Handle new messages
  socket.on("send-message", async (data) => {
    const { domain, message, username, userId } = data

    const messageData = {
      domain: domain,
      content: message,
      username: username,
      user_id: userId || null,
      message_type: "message",
    }

    try {
      const { data: savedMessage, error } = await supabase.from("messages").insert(messageData).select().single()

      if (error) {
        console.error("Error saving message:", error)
        return
      }

      // Broadcast to room
      io.to(domain).emit("new-message", savedMessage)
      console.log(`Message sent to ${domain}:`, savedMessage)
    } catch (error) {
      console.error("Error handling message:", error)
    }
  })

  socket.on("tip-sent", async (data) => {
    const { domain, from, to, amount, txHash, timestamp, fromUserId, toUsername } = data

    try {
      const tipMessage = {
        domain: domain,
        content: `${from} tipped ${toUsername} ${amount} BTC`,
        username: from,
        user_id: fromUserId || null,
        message_type: "tip",
        tip_amount: Number.parseFloat(amount),
      }

      const { data: savedTip, error } = await supabase.from("messages").insert(tipMessage).select().single()

      if (error) {
        console.error("Error saving tip:", error)
        return
      }

      // Broadcast tip notification to room
      io.to(domain).emit("tip-notification", savedTip)
      console.log(`Tip sent in ${domain}:`, savedTip)
    } catch (error) {
      console.error("Error handling tip:", error)
    }
  })

  socket.on("track-site-visit", async (data) => {
    const { domain, anonymousUserId } = data

    try {
      await supabase.from("user_analytics").insert({
        anonymous_id: anonymousUserId,
        domain: domain,
        action_type: "site_visit",
        action_data: { domain },
      })

      console.log(`Site visit tracked: ${domain}`)
    } catch (error) {
      console.error("Error tracking site visit:", error)
    }
  })

  socket.on("track-wallet-usage", async (data) => {
    const { action, anonymousUserId, timestamp } = data

    try {
      await supabase.from("user_analytics").insert({
        anonymous_id: anonymousUserId,
        domain: "extension",
        action_type: "wallet_action",
        action_data: { action, timestamp },
      })

      console.log(`Wallet usage tracked: ${action}`)
    } catch (error) {
      console.error("Error tracking wallet usage:", error)
    }
  })

  socket.on("track-commerce-transaction", async (data) => {
    const { domain, amount, currency, anonymousUserId, timestamp } = data

    try {
      await supabase.from("user_analytics").insert({
        anonymous_id: anonymousUserId,
        domain: domain,
        action_type: "commerce_transaction",
        action_data: { amount, currency, timestamp },
      })

      console.log(`Commerce transaction tracked: ${amount} ${currency} on ${domain}`)
    } catch (error) {
      console.error("Error tracking commerce transaction:", error)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove user from all rooms
    for (const [domain, users] of domainRooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id)
        const userCount = users.size
        io.to(domain).emit("user-count-update", userCount)

        if (users.size === 0) {
          domainRooms.delete(domain)
        }
      }
    }
    console.log("User disconnected:", socket.id)
  })
})

// REST API endpoints
app.get("/api/rooms/:domain/messages", async (req, res) => {
  const domain = req.params.domain

  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("domain", domain)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(messages.reverse())
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

app.get("/api/rooms/:domain/users", (req, res) => {
  const domain = req.params.domain
  const userCount = domainRooms.has(domain) ? domainRooms.get(domain).size : 0
  res.json({ userCount })
})

app.get("/api/rooms/:domain/tips", async (req, res) => {
  const domain = req.params.domain

  try {
    const { data: tips, error } = await supabase
      .from("messages")
      .select("*")
      .eq("domain", domain)
      .eq("message_type", "tip")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(tips)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tips" })
  }
})

app.post("/api/profiles", async (req, res) => {
  const { username, displayName, bio, websites, bitcoinAddress, anonymousId } = req.body

  try {
    const { data: profile, error } = await supabase
      .from("users")
      .insert({
        username,
        display_name: displayName,
        bio,
        website_url: websites,
        bitcoin_address: bitcoinAddress,
        anonymous_id: anonymousId,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ error: "Username already exists" })
      }
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, profile })
  } catch (error) {
    res.status(500).json({ error: "Failed to create profile" })
  }
})

app.get("/api/profiles/:username", async (req, res) => {
  const username = req.params.username

  try {
    const { data: profile, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) {
      return res.status(404).json({ error: "Profile not found" })
    }

    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

app.post("/api/posts", async (req, res) => {
  const { title, content, userId } = req.body

  try {
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        user_id: userId,
      })
      .select(`
        *,
        users (username, display_name)
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, post })
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" })
  }
})

app.get("/api/posts", async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 20

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

app.get("/api/posts/user/:username", async (req, res) => {
  const username = req.params.username

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        users!inner (username, display_name)
      `)
      .eq("users.username", username)
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user posts" })
  }
})

// Analytics API endpoints
app.get("/api/analytics/sites", async (req, res) => {
  try {
    const { data: analytics, error } = await supabase
      .from("user_analytics")
      .select("domain, anonymous_id")
      .eq("action_type", "site_visit")

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Process analytics data
    const siteStats = new Map()
    for (const record of analytics) {
      if (!siteStats.has(record.domain)) {
        siteStats.set(record.domain, {
          domain: record.domain,
          visits: 0,
          uniqueUsers: new Set(),
        })
      }
      const stats = siteStats.get(record.domain)
      stats.visits++
      stats.uniqueUsers.add(record.anonymous_id)
    }

    // Convert to array and format
    const result = Array.from(siteStats.values()).map((stats) => ({
      domain: stats.domain,
      visits: stats.visits,
      uniqueUsers: stats.uniqueUsers.size,
    }))

    // Sort by visits descending
    result.sort((a, b) => b.visits - a.visits)

    res.json(result.slice(0, 100))
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch site analytics" })
  }
})

app.get("/api/analytics/wallet", async (req, res) => {
  try {
    const { data: analytics, error } = await supabase
      .from("user_analytics")
      .select("anonymous_id, action_data")
      .eq("action_type", "wallet_action")

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const uniqueUsers = new Set()
    const actionBreakdown = {}

    for (const record of analytics) {
      uniqueUsers.add(record.anonymous_id)
      const action = record.action_data?.action || "unknown"
      actionBreakdown[action] = (actionBreakdown[action] || 0) + 1
    }

    const walletStats = {
      totalUsers: uniqueUsers.size,
      totalActions: analytics.length,
      actionBreakdown,
    }

    res.json(walletStats)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet analytics" })
  }
})

app.get("/api/analytics/commerce", async (req, res) => {
  try {
    const { data: analytics, error } = await supabase
      .from("user_analytics")
      .select("domain, anonymous_id, action_data")
      .eq("action_type", "commerce_transaction")

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const uniqueUsers = new Set()
    const topDomains = {}
    let totalVolume = 0

    for (const record of analytics) {
      uniqueUsers.add(record.anonymous_id)
      topDomains[record.domain] = (topDomains[record.domain] || 0) + 1
      totalVolume += record.action_data?.amount || 0
    }

    const commerceStats = {
      totalTransactions: analytics.length,
      totalVolume,
      uniqueUsers: uniqueUsers.size,
      topDomains,
    }

    res.json(commerceStats)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commerce analytics" })
  }
})

module.exports = app

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001
  server.listen(PORT, () => {
    console.log(`Relay Chat Server running on port ${PORT}`)
  })
}
