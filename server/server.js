const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

app.use(cors())
app.use(express.json())

// In-memory storage (replace with database in production)
const domainRooms = new Map()
const messages = new Map()
const tips = new Map()
const profiles = new Map()
const posts = []
const analytics = {
  siteVisits: new Map(), // domain -> { visits: number, uniqueUsers: Set }
  walletUsage: [],
  commerceTransactions: [],
}

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Join domain-based room
  socket.on("join-room", (domain) => {
    socket.join(domain)

    if (!domainRooms.has(domain)) {
      domainRooms.set(domain, new Set())
    }
    domainRooms.get(domain).add(socket.id)

    // Send recent messages to new user
    if (messages.has(domain)) {
      socket.emit("message-history", messages.get(domain).slice(-50))
    }

    // Notify room about user count
    const userCount = domainRooms.get(domain).size
    io.to(domain).emit("user-count-update", userCount)

    console.log(`User ${socket.id} joined room: ${domain}`)
  })

  // Handle new messages
  socket.on("send-message", (data) => {
    const { domain, message, username } = data

    const messageData = {
      id: Date.now() + Math.random(),
      text: message,
      username: username,
      timestamp: Date.now(),
      domain: domain,
    }

    // Store message
    if (!messages.has(domain)) {
      messages.set(domain, [])
    }
    messages.get(domain).push(messageData)

    // Keep only last 1000 messages per domain
    const domainMessages = messages.get(domain)
    if (domainMessages.length > 1000) {
      messages.set(domain, domainMessages.slice(-1000))
    }

    // Broadcast to room
    io.to(domain).emit("new-message", messageData)
    console.log(`Message sent to ${domain}:`, messageData)
  })

  socket.on("tip-sent", (data) => {
    const { domain, from, to, amount, txHash, timestamp } = data

    const tipData = {
      id: Date.now() + Math.random(),
      from: from,
      to: to,
      amount: amount,
      txHash: txHash,
      timestamp: timestamp,
      domain: domain,
    }

    // Store tip
    if (!tips.has(domain)) {
      tips.set(domain, [])
    }
    tips.get(domain).push(tipData)

    // Keep only last 500 tips per domain
    const domainTips = tips.get(domain)
    if (domainTips.length > 500) {
      tips.set(domain, domainTips.slice(-500))
    }

    // Broadcast tip notification to room
    io.to(domain).emit("tip-notification", tipData)
    console.log(`Tip sent in ${domain}:`, tipData)
  })

  socket.on("track-site-visit", (data) => {
    const { domain, anonymousUserId } = data

    if (!analytics.siteVisits.has(domain)) {
      analytics.siteVisits.set(domain, {
        visits: 0,
        uniqueUsers: new Set(),
      })
    }

    const siteData = analytics.siteVisits.get(domain)
    siteData.visits++
    siteData.uniqueUsers.add(anonymousUserId)

    console.log(`Site visit tracked: ${domain}`)
  })

  socket.on("track-wallet-usage", (data) => {
    const { action, anonymousUserId, timestamp } = data

    analytics.walletUsage.push({
      action, // 'opened', 'generated_wallet', 'imported_wallet', 'connected'
      anonymousUserId,
      timestamp,
    })

    // Keep only last 10000 wallet events
    if (analytics.walletUsage.length > 10000) {
      analytics.walletUsage.splice(0, 1000)
    }

    console.log(`Wallet usage tracked: ${action}`)
  })

  socket.on("track-commerce-transaction", (data) => {
    const { domain, amount, currency, anonymousUserId, timestamp } = data

    analytics.commerceTransactions.push({
      domain,
      amount,
      currency,
      anonymousUserId,
      timestamp,
    })

    // Keep only last 5000 transactions
    if (analytics.commerceTransactions.length > 5000) {
      analytics.commerceTransactions.splice(0, 1000)
    }

    console.log(`Commerce transaction tracked: ${amount} ${currency} on ${domain}`)
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
app.get("/api/rooms/:domain/messages", (req, res) => {
  const domain = req.params.domain
  const roomMessages = messages.get(domain) || []
  res.json(roomMessages.slice(-50)) // Last 50 messages
})

app.get("/api/rooms/:domain/users", (req, res) => {
  const domain = req.params.domain
  const userCount = domainRooms.has(domain) ? domainRooms.get(domain).size : 0
  res.json({ userCount })
})

app.get("/api/rooms/:domain/tips", (req, res) => {
  const domain = req.params.domain
  const roomTips = tips.get(domain) || []
  res.json(roomTips.slice(-20)) // Last 20 tips
})

app.post("/api/profiles", (req, res) => {
  const { username, displayName, bio, joinDate, websites } = req.body

  if (profiles.has(username)) {
    return res.status(400).json({ error: "Username already exists" })
  }

  const profile = {
    username,
    displayName,
    bio,
    joinDate,
    websites,
    posts: [],
  }

  profiles.set(username, profile)
  res.json({ success: true, profile })
})

app.get("/api/profiles/:username", (req, res) => {
  const username = req.params.username
  const profile = profiles.get(username)

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" })
  }

  res.json(profile)
})

app.post("/api/posts", (req, res) => {
  const { id, title, content, timestamp, author } = req.body

  const post = {
    id,
    title,
    content,
    timestamp,
    author,
  }

  posts.unshift(post)

  // Keep only last 1000 posts
  if (posts.length > 1000) {
    posts.splice(1000)
  }

  res.json({ success: true, post })
})

app.get("/api/posts", (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 20
  res.json(posts.slice(0, limit))
})

app.get("/api/posts/user/:username", (req, res) => {
  const username = req.params.username
  const userPosts = posts.filter((post) => post.author === username)
  res.json(userPosts)
})

// Analytics API endpoints
app.get("/api/analytics/sites", (req, res) => {
  const siteStats = []

  for (const [domain, data] of analytics.siteVisits.entries()) {
    siteStats.push({
      domain,
      visits: data.visits,
      uniqueUsers: data.uniqueUsers.size,
    })
  }

  // Sort by visits descending
  siteStats.sort((a, b) => b.visits - a.visits)

  res.json(siteStats.slice(0, 100)) // Top 100 sites
})

app.get("/api/analytics/wallet", (req, res) => {
  const walletStats = {
    totalUsers: new Set(analytics.walletUsage.map((w) => w.anonymousUserId)).size,
    totalActions: analytics.walletUsage.length,
    actionBreakdown: {},
  }

  // Count actions by type
  for (const usage of analytics.walletUsage) {
    walletStats.actionBreakdown[usage.action] = (walletStats.actionBreakdown[usage.action] || 0) + 1
  }

  res.json(walletStats)
})

app.get("/api/analytics/commerce", (req, res) => {
  const commerceStats = {
    totalTransactions: analytics.commerceTransactions.length,
    totalVolume: analytics.commerceTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    uniqueUsers: new Set(analytics.commerceTransactions.map((tx) => tx.anonymousUserId)).size,
    topDomains: {},
  }

  // Count transactions by domain
  for (const tx of analytics.commerceTransactions) {
    commerceStats.topDomains[tx.domain] = (commerceStats.topDomains[tx.domain] || 0) + 1
  }

  res.json(commerceStats)
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Relay Chat Server running on port ${PORT}`)
})
