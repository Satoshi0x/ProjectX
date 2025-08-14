const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()
const server = createServer(app)

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// CORS configuration for browser extensions
app.use(
  cors({
    origin: ["chrome-extension://*", "moz-extension://*", "http://localhost:3000", "https://*.vercel.app"],
    credentials: true,
  }),
)

app.use(express.json())

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: ["chrome-extension://*", "moz-extension://*", "http://localhost:3000", "https://*.vercel.app"],
    methods: ["GET", "POST"],
  },
})

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    res.json({
      status: "Server is running",
      database: error ? "error" : "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.json({
      status: "Server is running",
      database: "error",
      error: err.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-domain", async (domain) => {
    socket.join(domain)

    // Get recent messages for this domain
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("domain", domain)
      .order("created_at", { ascending: false })
      .limit(50)

    socket.emit("message-history", messages?.reverse() || [])

    // Get user count for domain
    const roomSize = io.sockets.adapter.rooms.get(domain)?.size || 0
    io.to(domain).emit("user-count", roomSize)
  })

  socket.on("send-message", async (data) => {
    const { domain, message, username, userId } = data

    // Store message in database
    const { data: newMessage, error } = await supabase
      .from("messages")
      .insert({
        domain,
        message,
        username,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && newMessage) {
      io.to(domain).emit("new-message", newMessage)
    }
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Export for Vercel
module.exports = app
