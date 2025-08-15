// Content script for Relay Chat Extension
class RelayContentScript {
  constructor() {
    this.domain = window.location.hostname
    this.anonymousUserId = this.generateAnonymousId()
    this.serverUrl = "https://v0-clone-relay-extension.vercel.app"
    this.popupVisible = false
    this.dragButton = null
    this.popupContainer = null
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

    this.createDraggableToggleButton()
    this.connectToServer()
    this.trackSiteVisit()
    this.detectCoinbaseCommerce()
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
    const chrome = window.chrome // Declare the chrome variable
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: "TRACK_SITE_VISIT",
        domain: this.domain,
        anonymousUserId: this.anonymousUserId,
        timestamp: Date.now(),
      })
    }
  }

  connectToServer() {
    // Load Socket.IO client
    const script = document.createElement("script")
    script.src = window.chrome.runtime.getURL("lib/socket.io.min.js") // Updated line
    script.onload = () => {
      const io = window.io
      this.socket = io(this.serverUrl)
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

  createDraggableToggleButton() {
    // Create draggable toggle button
    this.dragButton = document.createElement("div")
    this.dragButton.className = "relay-drag-button"
    this.dragButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="relay-user-count">0</span>
    `

    this.addDragButtonStyles()
    this.makeDraggable(this.dragButton)

    // Position in lower right corner initially
    const savedPosition = localStorage.getItem("relay_button_position")
    if (savedPosition) {
      const pos = JSON.parse(savedPosition)
      this.dragButton.style.left = pos.x + "px"
      this.dragButton.style.top = pos.y + "px"
    } else {
      this.dragButton.style.right = "20px"
      this.dragButton.style.bottom = "20px"
    }

    this.dragButton.addEventListener("click", () => {
      this.togglePopup()
    })

    document.body.appendChild(this.dragButton)
  }

  addDragButtonStyles() {
    const style = document.createElement("style")
    style.textContent = `
      .relay-drag-button {
        position: fixed;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: move;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
        color: white;
      }
      
      .relay-drag-button:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6);
      }
      
      .relay-drag-button svg {
        width: 28px;
        height: 28px;
      }
      
      .relay-user-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #f59e0b;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        border: 2px solid white;
      }
      
      .relay-popup-container {
        position: fixed;
        width: 400px;
        height: 600px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 9999;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        resize: vertical;
        min-height: 400px;
        max-height: 800px;
      }
    `
    document.head.appendChild(style)
  }

  makeDraggable(element) {
    let isDragging = false
    let startX, startY, startLeft, startTop

    element.addEventListener("mousedown", (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      startLeft = element.offsetLeft
      startTop = element.offsetTop
      element.style.cursor = "grabbing"
      e.preventDefault()
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      const newLeft = startLeft + deltaX
      const newTop = startTop + deltaY

      // Keep within viewport bounds
      const maxLeft = window.innerWidth - element.offsetWidth
      const maxTop = window.innerHeight - element.offsetHeight

      element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px"
      element.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px"
      element.style.right = "auto"
      element.style.bottom = "auto"
    })

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false
        element.style.cursor = "move"

        // Save position
        localStorage.setItem(
          "relay_button_position",
          JSON.stringify({
            x: element.offsetLeft,
            y: element.offsetTop,
          }),
        )
      }
    })
  }

  togglePopup() {
    if (this.popupVisible) {
      this.hidePopup()
    } else {
      this.showPopup()
    }
  }

  showPopup() {
    if (this.popupContainer) return

    this.popupContainer = document.createElement("div")
    this.popupContainer.className = "relay-popup-container"

    // Position near the drag button
    const buttonRect = this.dragButton.getBoundingClientRect()
    const popupWidth = 400
    const popupHeight = 600

    let left = buttonRect.left - popupWidth - 20
    let top = buttonRect.top - popupHeight + 60

    // Keep within viewport
    if (left < 20) left = buttonRect.right + 20
    if (top < 20) top = 20
    if (left + popupWidth > window.innerWidth - 20) left = window.innerWidth - popupWidth - 20
    if (top + popupHeight > window.innerHeight - 20) top = window.innerHeight - popupHeight - 20

    this.popupContainer.style.left = left + "px"
    this.popupContainer.style.top = top + "px"

    // Load popup content
    this.loadPopupContent()

    document.body.appendChild(this.popupContainer)
    this.popupVisible = true

    // Add click outside to close
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick.bind(this))
    }, 100)
  }

  hidePopup() {
    if (this.popupContainer) {
      this.popupContainer.remove()
      this.popupContainer = null
      this.popupVisible = false
      document.removeEventListener("click", this.handleOutsideClick.bind(this))
    }
  }

  handleOutsideClick(e) {
    if (this.popupContainer && !this.popupContainer.contains(e.target) && !this.dragButton.contains(e.target)) {
      this.hidePopup()
    }
  }

  loadPopupContent() {
    // This would load the actual popup HTML content
    // For now, we'll create a simplified version
    this.popupContainer.innerHTML = `
      <div style="padding: 20px; color: white; height: 100%;">
        <h2 style="margin: 0 0 20px 0; text-align: center;">Relay Chat</h2>
        <p style="text-align: center; margin-bottom: 20px;">Domain: ${this.domain}</p>
        <div style="text-align: center;">
          <button onclick="window.chrome.runtime.sendMessage({type: 'OPEN_FULL_POPUP'})" 
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                         color: white; border: none; padding: 12px 24px; 
                         border-radius: 8px; cursor: pointer; font-weight: 600;">
            Open Full Extension
          </button>
        </div>
      </div>
    `
  }

  updateUserCount(count) {
    const userCountEl = document.querySelector(".relay-user-count")
    if (userCountEl) {
      userCountEl.textContent = count
    }
  }

  detectCoinbaseCommerce() {
    // Check for Coinbase Commerce indicators
    const commerceSelectors = [
      "[data-commerce-button]",
      ".coinbase-commerce-button",
      '[href*="commerce.coinbase.com"]',
      "[data-cb-checkout]",
      ".cb-checkout-button",
    ]

    const priceSelectors = [".price", ".product-price", "[data-price]", ".cost", ".amount"]

    let hasCommerce = false
    const productInfo = {
      name: "Product",
      price: "0.00",
      currency: "USD",
    }

    // Check for commerce buttons
    for (const selector of commerceSelectors) {
      if (document.querySelector(selector)) {
        hasCommerce = true
        break
      }
    }

    // Extract product information
    if (hasCommerce) {
      // Try to find product name
      const nameElements = document.querySelectorAll("h1, .product-title, .product-name, [data-product-name]")
      if (nameElements.length > 0) {
        productInfo.name = nameElements[0].textContent.trim() || "Product"
      }

      // Try to find price
      for (const selector of priceSelectors) {
        const priceElement = document.querySelector(selector)
        if (priceElement) {
          const priceText = priceElement.textContent.trim()
          const priceMatch = priceText.match(/[\d,]+\.?\d*/g)
          const currencyMatch = priceText.match(/[A-Z]{3}|\$|€|£|¥/g)

          if (priceMatch) {
            productInfo.price = priceMatch[0].replace(",", "")
          }
          if (currencyMatch) {
            const currency = currencyMatch[0]
            productInfo.currency =
              currency === "$"
                ? "USD"
                : currency === "€"
                  ? "EUR"
                  : currency === "£"
                    ? "GBP"
                    : currency === "¥"
                      ? "JPY"
                      : currency
          }
          break
        }
      }
    }

    // Store commerce info for popup access
    this.commerceInfo = { hasCommerce, productInfo }
  }

  getMerchantBitcoinAddress() {
    // Look for Bitcoin addresses on the page
    const bitcoinAddressRegex = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}/g
    const pageText = document.body.textContent
    const addresses = pageText.match(bitcoinAddressRegex)

    if (addresses && addresses.length > 0) {
      // Return the first valid Bitcoin address found
      return addresses[0]
    }

    // Fallback: look for data attributes
    const addressElement = document.querySelector("[data-bitcoin-address], [data-btc-address]")
    if (addressElement) {
      return addressElement.getAttribute("data-bitcoin-address") || addressElement.getAttribute("data-btc-address")
    }

    // Demo address for testing (replace with actual merchant integration)
    return "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  }

  handleMessage(request, sender, sendResponse) {
    const chrome = window.chrome // Declare the chrome variable
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
    } else if (request.type === "CHECK_COINBASE_COMMERCE") {
      sendResponse(this.commerceInfo)
    } else if (request.type === "GET_MERCHANT_ADDRESS") {
      const address = this.getMerchantBitcoinAddress()
      sendResponse({ address })
    } else if (request.type === "PAYMENT_COMPLETED") {
      // Handle payment completion notification
      this.showPaymentSuccessNotification(request.txid, request.amount, request.currency)

      // Track commerce transaction
      if (this.socket) {
        this.socket.emit("track-commerce-transaction", {
          domain: this.domain,
          amount: request.amount,
          currency: request.currency,
          anonymousUserId: this.anonymousUserId,
          timestamp: Date.now(),
        })
      }
    }
  }

  showPaymentSuccessNotification(txid, amount, currency) {
    const notification = document.createElement("div")
    notification.className = "relay-payment-notification"
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 300px;
        backdrop-filter: blur(10px);
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">✅</span>
          <strong>Payment Successful!</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          <div>Amount: ${amount} ${currency}</div>
          <div style="margin-top: 4px; font-size: 12px; opacity: 0.8;">
            TX: ${txid.substring(0, 8)}...
          </div>
        </div>
      </div>
    `

    document.body.appendChild(notification)

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
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

if (window.chrome && window.chrome.runtime) {
  // Use window.chrome instead of chrome
  window.chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (relayContentScript) {
      relayContentScript.handleMessage(request, sender, sendResponse)
    }
    return true // Keep message channel open for async responses
  })
}
