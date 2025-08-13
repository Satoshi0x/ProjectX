// Content script for Relay Chat Extension
class RelayContentScript {
  constructor() {
    this.domain = window.location.hostname
    this.anonymousUserId = this.generateAnonymousId()
    this.init()
  }

  init() {
    // Don't inject on extension pages or chrome:// pages
    if (
      window.location.protocol === "chrome-extension:" ||
      window.location.protocol === "chrome:" ||
      window.location.protocol === "moz-extension:"
    ) {
      return
    }

    this.createFloatingIndicator()
    this.connectToServer()
    this.trackSiteVisit()
  }

  generateAnonymousId() {
    let anonymousId = localStorage.getItem("relay_anonymous_id")
    if (!anonymousId) {
      anonymousId = "anon_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("relay_anonymous_id", anonymousId)
    }
    return anonymousId
  }

  trackSiteVisit() {
    window.chrome.runtime.sendMessage({
      type: "TRACK_SITE_VISIT",
      domain: this.domain,
      anonymousUserId: this.anonymousUserId,
      timestamp: Date.now(),
    })
  }

  connectToServer() {
    // Load Socket.IO client
    const script = document.createElement("script")
    script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js"
    script.onload = () => {
      const io = window.io
      this.socket = io("http://localhost:3001") // Update this URL for production
      this.setupSocketListeners()
      this.joinRoom()
    }
    document.head.appendChild(script)
  }

  setupSocketListeners() {
    this.socket.on("connect", () => {
      console.log("Connected to Relay server")
      this.trackSiteVisit()
    })

    this.socket.on("user-count-update", (count) => {
      this.updateUserCount(count)
    })
  }

  joinRoom() {
    if (this.socket) {
      this.socket.emit("join-room", this.domain)
    }
  }

  createFloatingIndicator() {
    const indicator = document.createElement("div")
    indicator.className = "relay-floating-indicator"
    indicator.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="relay-user-count">0</span>
    `

    indicator.addEventListener("click", () => {
      window.chrome.runtime.sendMessage({ type: "OPEN_POPUP" })
    })

    document.body.appendChild(indicator)
  }

  updateUserCount(count) {
    const userCountEl = document.querySelector(".relay-user-count")
    if (userCountEl) {
      userCountEl.textContent = count
    }
  }

  handleMessage(request, sender, sendResponse) {
    if (request.type === "TRACK_WALLET_USAGE") {
      if (this.socket) {
        this.socket.emit("track-wallet-usage", {
          action: request.action,
          anonymousUserId: request.anonymousUserId,
          timestamp: request.timestamp,
        })
      }
    } else if (request.type === "TRACK_COMMERCE_TRANSACTION") {
      if (this.socket) {
        this.socket.emit("track-commerce-transaction", {
          domain: request.domain,
          amount: request.amount,
          currency: request.currency,
          anonymousUserId: request.anonymousUserId,
          timestamp: request.timestamp,
        })
      }
    }
  }
}

// Initialize content script
let relayContentScript
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    relayContentScript = new RelayContentScript()
  })
} else {
  relayContentScript = new RelayContentScript()
}

window.chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (relayContentScript) {
    relayContentScript.handleMessage(request, sender, sendResponse)
  }
})
