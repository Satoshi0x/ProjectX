const { Server } = require("socket.io")
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const domainRooms = new Map()

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server, {
      cors: {
        origin: ["chrome-extension://*", "moz-extension://*", "https://*.vercel.app"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    })
    res.socket.server.io = io

    // Socket.io connection handling (same as server.js)
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

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

        const userCount = domainRooms.get(domain).size
        io.to(domain).emit("user-count-update", userCount)
      })

      // ... rest of socket handlers from server.js ...
    })
  }
  res.end()
}

export default SocketHandler
