// Background service worker for Relay Chat Extension
/* global chrome */

self.addEventListener("install", (event) => {
  console.log("[v0] Service worker installing...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[v0] Service worker activating...")
  event.waitUntil(self.clients.claim())
})

class RelayBackgroundService {
  constructor() {
    this.serverUrl = "https://v0-clone-relay-extension.vercel.app"
    this.init()
  }

  init() {
    try {
      window.chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))
      console.log("[v0] Background service initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize background service:", error)
    }
  }

  handleMessage(message, sender, sendResponse) {
    if (!message || !message.type) {
      console.error("[v0] Invalid message received:", message)
      return false
    }

    switch (message.type) {
      case "GET_ROOM_INFO":
        this.getRoomInfoFromServer(message.domain, sendResponse)
        return true
      case "TRACK_SITE_VISIT":
        this.trackSiteVisit(message, sender)
        break
      case "TRACK_WALLET_USAGE":
        this.forwardToContentScript(message, sender)
        break
      case "OPEN_POPUP":
        try {
          window.chrome.action.openPopup()
        } catch (error) {
          console.error("[v0] Failed to open popup:", error)
        }
        break
      default:
        console.warn("[v0] Unknown message type:", message.type)
    }
  }

  async getRoomInfoFromServer(domain, sendResponse) {
    try {
      const response = await fetch(`${this.serverUrl}/api/rooms/${domain}/users`)
      const data = await response.json()
      sendResponse({ userCount: data.userCount })
    } catch (error) {
      console.error("[v0] Failed to get room info:", error)
      sendResponse({ userCount: 0 })
    }
  }

  trackSiteVisit(message, sender) {
    if (sender && sender.tab && sender.tab.id) {
      try {
        window.chrome.tabs.sendMessage(sender.tab.id, {
          type: "TRACK_SITE_VISIT",
          domain: message.domain,
          anonymousUserId: message.anonymousUserId,
          timestamp: message.timestamp,
        })
      } catch (error) {
        console.error("[v0] Failed to send message to tab:", error)
      }
    }
  }

  forwardToContentScript(message, sender) {
    if (sender && sender.tab && sender.tab.id) {
      try {
        window.chrome.tabs.sendMessage(sender.tab.id, message)
      } catch (error) {
        console.error("[v0] Failed to forward message to content script:", error)
      }
    }
  }
}

try {
  new RelayBackgroundService()
  console.log("[v0] Relay Background Service started successfully")
} catch (error) {
  console.error("[v0] Failed to start Relay Background Service:", error)
}
