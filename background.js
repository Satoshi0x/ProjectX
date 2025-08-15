// Background service worker for Relay Chat Extension
/* global chrome */

// Declare chrome variable to fix lint/correctness/noUndeclaredVariable

class RelayBackgroundService {
  constructor() {
    this.serverUrl = "https://v0-clone-relay-extension.vercel.app"
    this.init()
  }

  init() {
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))
  }

  handleMessage(message, sender, sendResponse) {
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
        chrome.action.openPopup()
        break
    }
  }

  async getRoomInfoFromServer(domain, sendResponse) {
    try {
      const response = await fetch(`${this.serverUrl}/api/rooms/${domain}/users`)
      const data = await response.json()
      sendResponse({ userCount: data.userCount })
    } catch (error) {
      console.error("Failed to get room info:", error)
      sendResponse({ userCount: 0 })
    }
  }

  trackSiteVisit(message, sender) {
    if (sender.tab) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "TRACK_SITE_VISIT",
        domain: message.domain,
        anonymousUserId: message.anonymousUserId,
        timestamp: message.timestamp,
      })
    }
  }

  forwardToContentScript(message, sender) {
    if (sender.tab) {
      chrome.tabs.sendMessage(sender.tab.id, message)
    }
  }
}

// Initialize the background service
new RelayBackgroundService()
