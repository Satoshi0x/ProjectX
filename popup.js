// Popup script for Relay Chat Extension
document.addEventListener("DOMContentLoaded", async () => {
  const currentDomainEl = document.getElementById("current-domain")
  const userCountEl = document.getElementById("user-count")
  const toggleChatBtn = document.getElementById("toggle-chat")
  const settingsBtn = document.getElementById("settings")
  const aboutBtn = document.getElementById("about")

  const tabs = document.querySelectorAll(".tab")
  const tabContents = document.querySelectorAll(".tab-content")

  const walletSetup = document.getElementById("wallet-setup")
  const walletDisplay = document.getElementById("wallet-display")
  const mnemonicDisplay = document.getElementById("mnemonic-display")
  const generateWalletBtn = document.getElementById("generate-wallet")
  const importWalletBtn = document.getElementById("import-wallet")
  const connectWalletBtn = document.getElementById("connect-wallet")
  const sendBitcoinBtn = document.getElementById("send-bitcoin")
  const showMnemonicBtn = document.getElementById("show-mnemonic")
  const resetWalletBtn = document.getElementById("reset-wallet")
  const sendForm = document.getElementById("send-form")
  const confirmSendBtn = document.getElementById("confirm-send")
  const cancelSendBtn = document.getElementById("cancel-send")
  const copyMnemonicBtn = document.getElementById("copy-mnemonic")
  const hideMnemonicBtn = document.getElementById("hide-mnemonic")
  const viewTransactionsBtn = document.getElementById("view-transactions") // Add Blockstream.info explorer link functionality

  const profileSetup = document.getElementById("profile-setup")
  const profileDisplay = document.getElementById("profile-display")
  const createProfileBtn = document.getElementById("create-profile")
  const openProfilePageBtn = document.getElementById("open-profile-page")
  const createPostBtn = document.getElementById("create-post")
  const updateProfileBtn = document.getElementById("update-profile")
  const resetProfileBtn = document.getElementById("reset-profile")
  const postForm = document.getElementById("post-form")
  const publishPostBtn = document.getElementById("publish-post")
  const cancelPostBtn = document.getElementById("cancel-post")

  const chatMessages = document.getElementById("chat-messages")
  const messageInput = document.getElementById("message-input")
  const sendMessageBtn = document.getElementById("send-message")

  let socket = null
  let currentDomain = null
  const username = generateUsername()

  // Declare chrome variable
  const chrome = window.chrome

  let bip39, bitcoin

  let trendingUpdateInterval = null
  const TRENDING_UPDATE_INTERVAL = 10 * 60 * 1000 // 10 minutes

  // Bitcoin libraries are now loaded locally via HTML script tags
  // Initialize Bitcoin libraries from locally loaded scripts
  function initializeBitcoinLibraries() {
    // Libraries are already loaded via HTML script tags
    bip39 = window.bip39
    bitcoin = window.bitcoin

    if (!bip39 || !bitcoin) {
      console.error("Bitcoin libraries not loaded properly")
      return false
    }

    return true
  }

  let currentProfile = null
  let anonymousUserId = null
  let currentWallet = null
  let isConnected = false

  const serverUrl =
    window.location.hostname === "localhost" ? "http://localhost:3001" : "https://v0-clone-relay-extension.vercel.app"

  const COINBASE_COMMERCE_API_KEY = "4d04bab4-bee2-4dfb-81ab-19e8f5dedcff"
  const COINBASE_COMMERCE_API_URL = "https://api.commerce.coinbase.com"
  const COINBASE_MERCHANT_ID = "merchant_your_id_here" // Replace with your actual merchant ID
  const SERVER_URL = serverUrl // Define SERVER_URL for webhook usage

  // Authentication state management
  let currentUser = null
  let isAuthenticated = false

  await checkAuthenticationStatus()
  if (isAuthenticated) {
    showMainContent()
    initializeTabs()
  } else {
    showAuthForms()
  }

  chrome.storage.local.get(["anonymousUserId"], (result) => {
    if (result.anonymousUserId) {
      anonymousUserId = result.anonymousUserId
    } else {
      anonymousUserId = "anon_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      chrome.storage.local.set({ anonymousUserId: anonymousUserId })
    }
  })

  function trackWalletUsage(action, details = {}) {
    if (anonymousUserId) {
      // Send to content script to relay to server
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "TRACK_WALLET_USAGE",
            action: action,
            anonymousUserId: anonymousUserId,
            timestamp: Date.now(),
            details: details,
          })
        }
      })
    }
  }

  // Authentication functions
  async function checkAuthenticationStatus() {
    try {
      const result = await chrome.storage.local.get(["currentUser", "authToken"])
      if (result.currentUser && result.authToken) {
        currentUser = result.currentUser
        isAuthenticated = true
        return true
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    }
    return false
  }

  function showAuthForms() {
    document.getElementById("auth-container").style.display = "block"
    document.getElementById("main-content").style.display = "none"
  }

  function showMainContent() {
    document.getElementById("auth-container").style.display = "none"
    document.getElementById("main-content").style.display = "block"
  }

  // Registration functionality
  document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("reg-email").value.trim()
    const password = document.getElementById("reg-password").value
    const alias = document.getElementById("reg-alias").value.trim()

    if (!email || !password || !alias) {
      alert("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      alert("Alias can only contain letters, numbers, underscores, and hyphens")
      return
    }

    try {
      const response = await fetch(`${serverUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, alias, anonymousUserId }),
      })

      const data = await response.json()

      if (response.ok) {
        currentUser = data.user
        isAuthenticated = true

        await chrome.storage.local.set({
          currentUser: currentUser,
          authToken: data.token,
        })

        showMainContent()
        initializeTabs()
        alert("Account created successfully!")
      } else {
        alert(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    }
  })

  // Login functionality
  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim()
    const password = document.getElementById("login-password").value

    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        currentUser = data.user
        isAuthenticated = true

        await chrome.storage.local.set({
          currentUser: currentUser,
          authToken: data.token,
        })

        showMainContent()
        initializeTabs()
        alert("Signed in successfully!")
      } else {
        alert(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    }
  })

  // Form switching functionality
  document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("registration-form").style.display = "none"
    document.getElementById("login-form").style.display = "block"
  })

  document.getElementById("show-register").addEventListener("click", (e) => {
    e.preventDefault()
    document.getElementById("login-form").style.display = "none"
    document.getElementById("registration-form").style.display = "block"
  })

  function initializeTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab

        // Update active tab
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Update active content
        tabContents.forEach((content) => content.classList.remove("active"))
        document.getElementById(`${targetTab}-tab`).classList.add("active")

        // Initialize wallet tab if selected
        if (targetTab === "wallet") {
          initializeWalletTab()
          trackWalletUsage("opened")
        }
        if (targetTab === "profile") {
          initializeProfileTab()
        }
        if (targetTab === "trending") {
          initializeTrendingTab()
        }
      })
    })
  }

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tab && tab.url) {
    const domain = new URL(tab.url).hostname
    currentDomainEl.textContent = domain

    // Get room info
    chrome.runtime.sendMessage(
      {
        type: "GET_ROOM_INFO",
        domain: domain,
      },
      (response) => {
        if (response) {
          userCountEl.textContent = response.userCount
        }
      },
    )
  }

  // Toggle chat button
  toggleChatBtn.addEventListener("click", () => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CHAT" })
    window.close()
  })

  // Settings button
  settingsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") })
  })

  // About button
  aboutBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://github.com/relay-chat/extension" })
  })

  function initializeWalletTab() {
    chrome.storage.local.get(["walletMnemonic", "walletConnected"], (result) => {
      if (result.walletMnemonic) {
        loadWallet(result.walletMnemonic)
        isConnected = result.walletConnected || false
        updateWalletDisplay()
        updateWalletBalance()
        startRealTimeMonitoring()
      } else {
        showWalletSetup()
      }
    })
  }

  function initializeProfileTab() {
    if (currentUser) {
      currentProfile = {
        username: currentUser.alias,
        displayName: currentUser.display_name || currentUser.alias,
        bio: currentUser.bio || "",
        joinDate: currentUser.join_date,
        websites: currentUser.website_url || "",
        bitcoinAddress: currentUser.bitcoin_address || "",
      }
      showProfileDisplay()
      updateProfileDisplay()
    }
  }

  function showWalletSetup() {
    walletSetup.style.display = "block"
    walletDisplay.style.display = "none"
    mnemonicDisplay.style.display = "none"
  }

  function showWalletDisplay() {
    walletSetup.style.display = "none"
    walletDisplay.style.display = "block"
    mnemonicDisplay.style.display = "none"
  }

  function showProfileSetup() {
    profileSetup.style.display = "block"
    profileDisplay.style.display = "none"
    postForm.classList.remove("active")
  }

  function showProfileDisplay() {
    profileSetup.style.display = "none"
    profileDisplay.style.display = "block"
    postForm.classList.remove("active")
  }

  function updateProfileDisplay() {
    if (currentProfile) {
      document.getElementById("display-username").textContent = currentProfile.username
      document.getElementById("display-name").textContent = currentProfile.displayName
      document.getElementById("join-date").textContent = new Date(currentProfile.joinDate).toLocaleDateString()
      document.getElementById("profile-websites").value = currentProfile.websites || ""

      // Update Bitcoin address from wallet if available
      if (currentWallet) {
        document.getElementById("profile-btc-address").textContent = currentWallet.address
      }
    }
  }

  function generateMnemonic() {
    return bip39.generateMnemonic()
  }

  function loadWallet(mnemonic) {
    try {
      const seed = bip39.mnemonicToSeedSync(mnemonic)
      const root = bitcoin.bip32.fromSeed(seed)
      const account = root.derivePath("m/84'/0'/0'")
      const node = account.derive(0).derive(0)

      const { address } = bitcoin.payments.p2wpkh({
        pubkey: node.publicKey,
        network: bitcoin.networks.bitcoin,
      })

      currentWallet = {
        mnemonic,
        address,
        privateKey: node.privateKey,
        publicKey: node.publicKey,
      }

      if (currentProfile) {
        document.getElementById("profile-btc-address").textContent = address
      }

      return true
    } catch (error) {
      console.error("Error loading wallet:", error)
      return false
    }
  }

  function updateWalletDisplay() {
    if (currentWallet) {
      document.getElementById("wallet-address").textContent = currentWallet.address
      document.getElementById("wallet-status").textContent = isConnected ? "Connected" : "Disconnected"
      connectWalletBtn.textContent = isConnected ? "Disconnect" : "Connect"

      if (isConnected) {
        // Fetch real balance from Blockstream.info API
        updateWalletBalance()
      }
    }
  }

  // Generate new wallet
  generateWalletBtn.addEventListener("click", () => {
    const mnemonic = generateMnemonic()

    if (loadWallet(mnemonic)) {
      chrome.storage.local.set({
        walletMnemonic: mnemonic,
        walletConnected: false,
      })

      showWalletDisplay()
      updateWalletDisplay()

      // Show mnemonic for user to write down
      document.getElementById("mnemonic-words").textContent = mnemonic
      mnemonicDisplay.style.display = "block"
      walletDisplay.style.display = "none"

      trackWalletUsage("generated_wallet")
    }
  })

  // Import existing wallet
  importWalletBtn.addEventListener("click", () => {
    const mnemonic = prompt("Enter your 12-word mnemonic phrase:")

    if (mnemonic && bip39.validateMnemonic(mnemonic)) {
      if (loadWallet(mnemonic)) {
        chrome.storage.local.set({
          walletMnemonic: mnemonic,
          walletConnected: false,
        })

        showWalletDisplay()
        updateWalletDisplay()

        trackWalletUsage("imported_wallet")
      }
    } else {
      alert("Invalid mnemonic phrase. Please check and try again.")
    }
  })

  // Connect/Disconnect wallet
  connectWalletBtn.addEventListener("click", () => {
    isConnected = !isConnected
    chrome.storage.local.set({ walletConnected: isConnected })
    updateWalletDisplay()

    if (isConnected) {
      alert("Wallet connected! You can now send and receive Bitcoin.")
      trackWalletUsage("connected")
    } else {
      alert("Wallet disconnected.")
      trackWalletUsage("disconnected")
    }
  })

  // Show send form
  sendBitcoinBtn.addEventListener("click", () => {
    if (!isConnected) {
      alert("Please connect your wallet first.")
      return
    }
    sendForm.classList.add("active")
  })

  // Cancel send
  cancelSendBtn.addEventListener("click", () => {
    sendForm.classList.remove("active")
    document.getElementById("recipient-address").value = ""
    document.getElementById("send-amount").value = ""
  })

  // Confirm send transaction
  confirmSendBtn.addEventListener("click", async () => {
    const recipientAddress = document.getElementById("recipient-address").value
    const amount = Number.parseFloat(document.getElementById("send-amount").value)

    if (!recipientAddress || !amount) {
      alert("Please enter recipient address and amount.")
      return
    }

    if (!isConnected) {
      alert("Please connect your wallet first.")
      return
    }

    try {
      // Validate Bitcoin address
      bitcoin.address.toOutputScript(recipientAddress, bitcoin.networks.bitcoin)

      confirmSendBtn.textContent = "Sending..."
      confirmSendBtn.disabled = true

      // Create and broadcast real transaction
      const txid = await createAndBroadcastTransaction(recipientAddress, amount)

      alert(
        `Transaction sent successfully!\nTransaction ID: ${txid}\n\nView on explorer: https://blockstream.info/tx/${txid}`,
      )

      // Update balance after transaction
      setTimeout(() => updateWalletBalance(), 2000)

      trackWalletUsage("sent_bitcoin")
    } catch (error) {
      alert(`Transaction failed: ${error.message}`)
    } finally {
      confirmSendBtn.textContent = "Confirm Send"
      confirmSendBtn.disabled = false
      sendForm.classList.remove("active")
      document.getElementById("recipient-address").value = ""
      document.getElementById("send-amount").value = ""
    }
  })

  // Show mnemonic
  showMnemonicBtn.addEventListener("click", () => {
    if (currentWallet) {
      document.getElementById("mnemonic-words").textContent = currentWallet.mnemonic
      mnemonicDisplay.style.display = "block"
      walletDisplay.style.display = "none"
    }
  })

  // Copy mnemonic
  copyMnemonicBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(currentWallet.mnemonic).then(() => {
      alert("Mnemonic phrase copied to clipboard!")
    })
  })

  // Hide mnemonic
  hideMnemonicBtn.addEventListener("click", () => {
    mnemonicDisplay.style.display = "none"
    walletDisplay.style.display = "block"
  })

  // Reset wallet
  resetWalletBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your wallet? Make sure you have your mnemonic phrase saved!")) {
      chrome.storage.local.remove(["walletMnemonic", "walletConnected"])
      currentWallet = null
      isConnected = false
      showWalletSetup()
    }
  })

  // View transactions on Blockstream.info
  viewTransactionsBtn.addEventListener("click", () => {
    if (!currentWallet || !currentWallet.address) {
      alert("No wallet address available. Please generate or import a wallet first.")
      return
    }

    // Open Blockstream.info block explorer for the user's address
    const explorerUrl = `https://blockstream.info/address/${currentWallet.address}`
    chrome.tabs.create({ url: explorerUrl })

    // Track usage
    trackWalletUsage("viewed_transactions")
  })

  createProfileBtn.addEventListener("click", () => {
    const username = document.getElementById("profile-username").value.trim()
    const displayName = document.getElementById("profile-display-name").value.trim()
    const bio = document.getElementById("profile-bio").value.trim()

    if (!username || !displayName) {
      alert("Please enter both username and display name.")
      return
    }

    // Validate username (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      alert("Username can only contain letters, numbers, and hyphens.")
      return
    }

    currentProfile = {
      username: username,
      displayName: displayName,
      bio: bio,
      joinDate: Date.now(),
      websites: "",
      posts: [],
    }

    chrome.storage.local.set({ userProfile: currentProfile }, () => {
      showProfileDisplay()
      updateProfileDisplay()
      alert("Profile created successfully!")
    })
  })

  openProfilePageBtn.addEventListener("click", () => {
    if (currentProfile) {
      const profileUrl = `https://relay-profiles.vercel.app/u/${currentProfile.username}`
      chrome.tabs.create({ url: profileUrl })
    }
  })

  createPostBtn.addEventListener("click", () => {
    postForm.classList.add("active")
  })

  cancelPostBtn.addEventListener("click", () => {
    postForm.classList.remove("active")
    document.getElementById("post-title").value = ""
    document.getElementById("post-content").value = ""
  })

  publishPostBtn.addEventListener("click", () => {
    const title = document.getElementById("post-title").value.trim()
    const content = document.getElementById("post-content").value.trim()

    if (!title || !content) {
      alert("Please enter both title and content for your post.")
      return
    }

    const post = {
      id: Date.now(),
      title: title,
      content: content,
      timestamp: Date.now(),
      author: currentProfile.username,
    }

    currentProfile.posts.unshift(post)
    chrome.storage.local.set({ userProfile: currentProfile })

    fetch(`${serverUrl}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    }).catch(console.error)

    postForm.classList.remove("active")
    document.getElementById("post-title").value = ""
    document.getElementById("post-content").value = ""
    alert("Post published successfully!")
  })

  updateProfileBtn.addEventListener("click", () => {
    if (currentProfile) {
      const websites = document.getElementById("profile-websites").value.trim()
      currentProfile.websites = websites
      chrome.storage.local.set({ userProfile: currentProfile })
      alert("Profile updated successfully!")
    }
  })

  resetProfileBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your profile? This will delete all your posts and profile data.")) {
      chrome.storage.local.remove(["userProfile"])
      currentProfile = null
      showProfileSetup()
    }
  })

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendTip") {
      handleTipRequest(request, sendResponse)
      return true // Keep message channel open for async response
    } else if (request.action === "checkWalletStatus") {
      sendResponse({ connected: isConnected })
    }
  })

  async function handleTipRequest(request, sendResponse) {
    if (!isConnected || !currentWallet) {
      sendResponse({ success: false, error: "Wallet not connected" })
      return
    }

    try {
      // In a real implementation, you would:
      // 1. Create a Bitcoin transaction
      // 2. Sign it with the private key
      // 3. Broadcast to the Bitcoin network
      // 4. Return the transaction hash

      // For demo purposes, we'll simulate a successful transaction
      const mockTxHash = "demo_tx_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)

      console.log(`Demo tip: ${request.amount} BTC to ${request.recipient} on ${request.domain}`)

      trackWalletUsage("sent_tip")

      // Simulate network delay
      setTimeout(() => {
        sendResponse({
          success: true,
          txHash: mockTxHash,
          message: `Successfully sent ${request.amount} BTC tip to ${request.recipient}`,
        })
      }, 1000)
    } catch (error) {
      console.error("Tip transaction error:", error)
      sendResponse({ success: false, error: error.message })
    }
  }

  async function initializeChat() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab && tab.url) {
      currentDomain = new URL(tab.url).hostname
      document.getElementById("current-domain").textContent = currentDomain
      connectToServer()
      detectCoinbaseCommerce() // Detect Coinbase Commerce on initialization
    }
  }

  function connectToServer() {
    // Socket.IO is already loaded via HTML script tag
    if (window.io) {
      const io = window.io
      socket = io(serverUrl)
      setupSocketListeners()
      joinRoom()
    } else {
      console.error("Socket.IO not loaded properly from local library")
    }
  }

  function setupSocketListeners() {
    socket.on("connect", () => {
      console.log("Connected to Relay server")
    })

    socket.on("new-message", (messageData) => {
      if (messageData.username !== username) {
        displayMessage(messageData)
      }
    })

    socket.on("tip-notification", (tipData) => {
      displayTipNotification(tipData)
    })

    socket.on("user-count-update", (count) => {
      document.getElementById("user-count").textContent = `${count} users`
    })

    socket.on("message-history", (messages) => {
      chatMessages.innerHTML = ""
      messages.forEach((msg) => displayMessage(msg))
    })
  }

  function joinRoom() {
    if (socket && currentDomain) {
      socket.emit("join-room", currentDomain)
    }
  }

  function sendMessage() {
    const text = messageInput.value.trim()
    if (text && socket) {
      const messageData = {
        domain: currentDomain,
        message: text,
        username: username,
      }

      socket.emit("send-message", messageData)

      // Display own message immediately
      displayMessage({
        text: text,
        username: username,
        timestamp: Date.now(),
        isOwn: true,
      })

      messageInput.value = ""
    }
  }

  function displayMessage(messageData) {
    const messageElement = document.createElement("div")
    messageElement.className = `message ${messageData.isOwn ? "own" : ""}`

    const time = new Date(messageData.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    const tipButton =
      !messageData.isOwn && isConnected
        ? `<button class="tip-button" onclick="showTipModal('${messageData.username}')">💰 Tip</button>`
        : ""

    messageElement.innerHTML = `
      <div class="message-bubble">
        <div class="message-header">
          <span class="message-user">${messageData.username}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-text">${escapeHtml(messageData.text)}</div>
        ${tipButton}
      </div>
    `

    chatMessages.appendChild(messageElement)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function displayTipNotification(tipData) {
    const notificationElement = document.createElement("div")
    notificationElement.className = "tip-notification"
    notificationElement.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.1); border-radius: 12px; padding: 8px; margin: 4px 0; text-align: center; font-size: 12px; color: #f59e0b;">
        💰 ${tipData.from} tipped ${tipData.to} ${tipData.amount} BTC
      </div>
    `
    chatMessages.appendChild(notificationElement)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function generateUsername() {
    const adjectives = ["Cool", "Smart", "Quick", "Bright", "Swift", "Bold", "Calm", "Kind"]
    const nouns = ["User", "Visitor", "Guest", "Friend", "Chatter", "Explorer", "Surfer", "Reader"]
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 1000)
    return `${adj}${noun}${num}`
  }

  function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  window.showTipModal = (recipientUsername) => {
    if (!isConnected || !currentWallet) {
      alert("Please connect your Bitcoin wallet first.")
      return
    }

    const modal = document.createElement("div")
    modal.className = "modal"
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Send Bitcoin Tip</h3>
        <p>Send a tip to <strong>${recipientUsername}</strong></p>
        <div class="tip-amounts">
          <button class="tip-amount" data-amount="0.00001">0.00001 BTC</button>
          <button class="tip-amount" data-amount="0.0001">0.0001 BTC</button>
          <button class="tip-amount" data-amount="0.001">0.001 BTC</button>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button class="btn-primary" onclick="sendTip('${recipientUsername}', document.querySelector('.tip-amount.selected')?.dataset.amount)">Send Tip</button>
        </div>
      </div>
    `

    // Add amount selection
    modal.querySelectorAll(".tip-amount").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.querySelectorAll(".tip-amount").forEach((b) => b.classList.remove("selected"))
        btn.classList.add("selected")
      })
    })

    document.body.appendChild(modal)
  }

  window.sendTip = async (recipientUsername, amount) => {
    if (!amount) {
      alert("Please select an amount")
      return
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "sendTip",
        recipient: recipientUsername,
        amount: Number.parseFloat(amount),
        domain: currentDomain,
      })

      if (response.success) {
        if (socket) {
          socket.emit("tip-sent", {
            domain: currentDomain,
            from: username,
            to: recipientUsername,
            amount: Number.parseFloat(amount),
            txHash: response.txHash,
            timestamp: Date.now(),
          })
        }

        displayTipNotification({
          from: username,
          to: recipientUsername,
          amount: Number.parseFloat(amount),
          timestamp: Date.now(),
        })

        document.querySelector(".modal").remove()
        alert("Tip sent successfully!")
      } else {
        alert("Tip failed: " + response.error)
      }
    } catch (error) {
      console.error("Tip error:", error)
      alert("Failed to send tip. Please try again.")
    }
  }

  // Real Bitcoin balance checking and transaction functionality
  async function updateWalletBalance() {
    if (!currentWallet || !currentWallet.address) return

    try {
      // Fetch balance from Blockstream.info API
      const response = await fetch(`https://blockstream.info/api/address/${currentWallet.address}`)
      const addressData = await response.json()

      // Convert satoshis to BTC (handle both funded and spent amounts)
      const funded = addressData.chain_stats?.funded_txo_sum || 0
      const spent = addressData.chain_stats?.spent_txo_sum || 0
      const balanceSatoshis = funded - spent
      const balanceBTC = balanceSatoshis / 100000000

      document.getElementById("wallet-balance").textContent = `${balanceBTC.toFixed(8)} BTC`

      try {
        const priceResponse = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
        const priceData = await priceResponse.json()
        const btcPrice = Number.parseFloat(priceData.bpi.USD.rate.replace(",", ""))
        const balanceUSD = (balanceBTC * btcPrice).toFixed(2)
        document.getElementById("wallet-balance-usd").textContent = `≈ $${balanceUSD} USD`
      } catch (priceError) {
        console.error("Error fetching BTC price:", priceError)
        document.getElementById("wallet-balance-usd").textContent = "Price unavailable"
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      document.getElementById("wallet-balance").textContent = "Error loading balance"
      document.getElementById("wallet-balance-usd").textContent = ""
    }
  }

  // Coinbase Commerce detection and payment processing
  async function detectCoinbaseCommerce() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      // Check if current page has Coinbase Commerce integration
      chrome.tabs.sendMessage(tab.id, { type: "CHECK_COINBASE_COMMERCE" }, (response) => {
        if (response && response.hasCommerce) {
          showCommerceNotification(response.productInfo)
        }
      })
    } catch (error) {
      console.error("Error detecting Coinbase Commerce:", error)
    }
  }

  function showCommerceNotification(productInfo) {
    // Remove existing notification
    const existing = document.querySelector(".commerce-notification")
    if (existing) existing.remove()

    const notification = document.createElement("div")
    notification.className = "commerce-notification"
    notification.innerHTML = `
      <div class="commerce-alert">
        <div class="commerce-header">
          <span class="commerce-icon">🛒</span>
          <span>Bitcoin Payment Available</span>
        </div>
        <div class="commerce-details">
          <div class="product-info">
            <span class="product-name">${productInfo.name || "Product"}</span>
            <span class="product-price">${productInfo.price} ${productInfo.currency}</span>
          </div>
          <div class="btc-equivalent" id="btc-equivalent">
            Calculating BTC amount...
          </div>
        </div>
        <button class="btn-commerce" onclick="processCommercePayment('${productInfo.price}', '${productInfo.currency}', '${productInfo.name}')">
          Pay ${productInfo.price} ${productInfo.currency} with Bitcoin
        </button>
      </div>
    `

    document.getElementById("wallet-tab").prepend(notification)

    // Calculate BTC equivalent
    calculateBTCEquivalent(productInfo.price, productInfo.currency)
  }

  async function calculateBTCEquivalent(price, currency) {
    try {
      let usdPrice = Number.parseFloat(price)

      // Convert to USD if needed
      if (currency !== "USD") {
        const exchangeResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
        const exchangeData = await exchangeResponse.json()
        const rate = exchangeData.rates[currency]
        if (rate) {
          usdPrice = Number.parseFloat(price) / rate
        }
      }

      // Get BTC price
      const priceResponse = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
      const priceData = await priceResponse.json()
      const btcPrice = Number.parseFloat(priceData.bpi.USD.rate.replace(",", ""))

      const btcAmount = (usdPrice / btcPrice).toFixed(8)

      const equivalentEl = document.getElementById("btc-equivalent")
      if (equivalentEl) {
        equivalentEl.textContent = `≈ ${btcAmount} BTC`
      }

      return btcAmount
    } catch (error) {
      console.error("Error calculating BTC equivalent:", error)
      const equivalentEl = document.getElementById("btc-equivalent")
      if (equivalentEl) {
        equivalentEl.textContent = "BTC calculation unavailable"
      }
      return null
    }
  }

  window.processCommercePayment = async (price, currency, productName) => {
    const originalText = document.querySelector(".btn-commerce").textContent // Declare originalText here

    if (!isConnected || !currentWallet) {
      alert("Please connect your Bitcoin wallet first.")
      return
    }

    try {
      // Calculate BTC amount needed
      const btcAmount = await calculateBTCEquivalent(price, currency)
      if (!btcAmount) {
        alert("Unable to calculate Bitcoin amount. Please try again.")
        return
      }

      // Check if user has sufficient balance
      const currentBalance = Number.parseFloat(
        document.getElementById("wallet-balance").textContent.replace(" BTC", ""),
      )
      if (currentBalance < Number.parseFloat(btcAmount)) {
        alert(`Insufficient balance. You need ${btcAmount} BTC but only have ${currentBalance} BTC.`)
        return
      }

      // Show confirmation dialog
      const confirmed = confirm(
        `Confirm Bitcoin Payment:\n\n` +
          `Product: ${productName}\n` +
          `Price: ${price} ${currency}\n` +
          `Bitcoin Amount: ${btcAmount} BTC\n\n` +
          `Proceed with payment?`,
      )

      if (!confirmed) return

      // Show processing state
      const commerceBtn = document.querySelector(".btn-commerce")
      commerceBtn.textContent = "Processing Payment..."
      commerceBtn.disabled = true

      const charge = await createCommerceCharge(price, currency, productName)

      // Create and broadcast real Bitcoin transaction to Commerce address
      const txid = await createAndBroadcastTransaction(charge.addresses.bitcoin, Number.parseFloat(btcAmount))

      await notifyCommercePayment(charge.id, txid, btcAmount)

      // Show success message
      alert(
        `Payment Successful! 🎉\n\n` +
          `Transaction ID: ${txid}\n` +
          `Amount: ${btcAmount} BTC\n` +
          `Product: ${productName}\n\n` +
          `View transaction: https://blockstream.info/tx/${txid}`,
      )

      // Update balance
      setTimeout(() => updateWalletBalance(), 2000)

      // Track analytics
      trackWalletUsage("coinbase_commerce_payment")

      // Remove notification
      document.querySelector(".commerce-notification").remove()

      // Notify merchant of payment
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      chrome.tabs.sendMessage(tab.id, {
        type: "PAYMENT_COMPLETED",
        txid: txid,
        amount: btcAmount,
        currency: "BTC",
        chargeId: charge.id,
      })
    } catch (error) {
      console.error("Commerce payment error:", error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      // Reset button state
      const commerceBtn = document.querySelector(".btn-commerce")
      if (commerceBtn) {
        commerceBtn.textContent = originalText
        commerceBtn.disabled = false
      }
    }
  }

  async function createCommerceCharge(amount, currency, description) {
    try {
      const response = await fetch(`${COINBASE_COMMERCE_API_URL}/charges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CC-Api-Key": COINBASE_COMMERCE_API_KEY,
          "X-CC-Version": "2018-03-22",
        },
        body: JSON.stringify({
          name: description,
          description: `Payment for ${description}`,
          pricing_type: "fixed_price",
          local_price: {
            amount: amount,
            currency: currency,
          },
          metadata: {
            merchant_id: COINBASE_MERCHANT_ID,
            source: "relay_chat_extension",
          },
          redirect_url: window.location.href,
          cancel_url: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error(`Commerce API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error creating Commerce charge:", error)
      throw new Error("Failed to create payment charge")
    }
  }

  async function notifyCommercePayment(chargeId, txid, amount) {
    try {
      const paymentData = {
        chargeId,
        txid,
        amount,
        merchantId: COINBASE_MERCHANT_ID,
        timestamp: new Date().toISOString(),
      }

      // Send to our webhook endpoint for processing
      await fetch(`${SERVER_URL}/api/webhooks/coinbase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment_initiated",
          data: paymentData,
        }),
      })

      console.log("Payment completed:", paymentData)

      // Track the payment in analytics
      trackWalletUsage("commerce_payment_completed", paymentData)
    } catch (error) {
      console.error("Error notifying Commerce payment:", error)
    }
  }

  let balanceUpdateInterval = null
  let priceUpdateInterval = null
  let transactionMonitor = null
  const pendingTransactions = new Set()

  function startRealTimeMonitoring() {
    // Update balance every 30 seconds
    if (balanceUpdateInterval) clearInterval(balanceUpdateInterval)
    balanceUpdateInterval = setInterval(() => {
      if (currentWallet && currentWallet.address) {
        updateWalletBalance()
      }
    }, 30000)

    // Update BTC price every 60 seconds
    if (priceUpdateInterval) clearInterval(priceUpdateInterval)
    priceUpdateInterval = setInterval(updateBTCPrice, 60000)

    // Monitor pending transactions every 15 seconds
    if (transactionMonitor) clearInterval(transactionMonitor)
    transactionMonitor = setInterval(monitorPendingTransactions, 15000)
  }

  function stopRealTimeMonitoring() {
    if (balanceUpdateInterval) {
      clearInterval(balanceUpdateInterval)
      balanceUpdateInterval = null
    }
    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval)
      priceUpdateInterval = null
    }
    if (transactionMonitor) {
      clearInterval(transactionMonitor)
      transactionMonitor = null
    }
  }

  async function updateBTCPrice() {
    try {
      const priceResponse = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json")
      const priceData = await priceResponse.json()
      const btcPrice = Number.parseFloat(priceData.bpi.USD.rate.replace(",", ""))

      // Update price display if balance exists
      const balanceElement = document.getElementById("wallet-balance")
      if (balanceElement && balanceElement.textContent !== "Error loading balance") {
        const balanceBTC = Number.parseFloat(balanceElement.textContent.replace(" BTC", ""))
        const balanceUSD = (balanceBTC * btcPrice).toFixed(2)
        document.getElementById("wallet-balance-usd").textContent = `≈ $${balanceUSD} USD`
      }
    } catch (error) {
      console.error("Error updating BTC price:", error)
    }
  }

  async function monitorPendingTransactions() {
    if (pendingTransactions.size === 0) return

    for (const txid of pendingTransactions) {
      try {
        const response = await fetch(`https://blockstream.info/api/tx/${txid}`)
        const txData = await response.json()

        if (txData.status && txData.status.confirmed) {
          // Transaction confirmed
          pendingTransactions.delete(txid)
          showTransactionNotification(txid, "confirmed", txData.status.block_height)
          // Update balance after confirmation
          updateWalletBalance()
        }
      } catch (error) {
        console.error(`Error monitoring transaction ${txid}:`, error)
      }
    }
  }

  function showTransactionNotification(txid, status, blockHeight = null) {
    const notification = document.createElement("div")
    notification.className = "transaction-notification"
    notification.innerHTML = `
      <div class="notification-content">
        <strong>Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}</strong>
        <p>TX: ${txid.substring(0, 16)}...</p>
        ${blockHeight ? `<p>Block: ${blockHeight}</p>` : ""}
      </div>
    `

    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 5000)
  }

  async function estimateNetworkFee() {
    try {
      const response = await fetch("https://blockstream.info/api/fee-estimates")
      const feeData = await response.json()

      // Get fee for next block (fastest), 6 blocks (medium), 144 blocks (slow)
      return {
        fast: Math.ceil(feeData[1] || 20), // sat/vB
        medium: Math.ceil(feeData[6] || 15),
        slow: Math.ceil(feeData[144] || 10),
      }
    } catch (error) {
      console.error("Error fetching fee estimates:", error)
      return { fast: 20, medium: 15, slow: 10 }
    }
  }

  function initializeTrendingTab() {
    loadTrendingData()

    // Clear existing interval if any
    if (trendingUpdateInterval) {
      clearInterval(trendingUpdateInterval)
    }

    // Set up auto-refresh every 10 minutes
    trendingUpdateInterval = setInterval(loadTrendingData, TRENDING_UPDATE_INTERVAL)
  }

  async function loadTrendingData() {
    try {
      const response = await fetch("https://v0-clone-relay-extension.vercel.app/api/analytics/trending")
      const data = await response.json()

      if (data.error) {
        console.error("Trending data error:", data.error)
        showTrendingError()
        return
      }

      updateTrendingDisplay(data)
      updateLastUpdatedTime()
    } catch (error) {
      console.error("Failed to load trending data:", error)
      showTrendingError()
    }
  }

  function updateTrendingDisplay(data) {
    // Update active users count
    const activeUsersEl = document.getElementById("total-active-users")
    if (activeUsersEl) {
      activeUsersEl.textContent = data.activeUsers || 0
    }

    // Update top domains
    const trendingDomainsEl = document.getElementById("trending-domains")
    if (trendingDomainsEl && data.topDomains) {
      if (data.topDomains.length === 0) {
        trendingDomainsEl.innerHTML = '<div class="no-data">No active domains yet</div>'
      } else {
        trendingDomainsEl.innerHTML = data.topDomains
          .map(
            (domain, index) => `
          <div class="trending-item">
            <div class="trending-domain">${index + 1}. ${domain.domain}</div>
            <div class="trending-stats">
              <span class="trending-users">${domain.activeUsers} users</span>
              <span class="trending-messages">${domain.messages} visits</span>
            </div>
          </div>
        `,
          )
          .join("")
      }
    }

    // Update daily stats
    if (data.dailyStats) {
      const dailyMessagesEl = document.getElementById("daily-messages")
      const dailyTipsEl = document.getElementById("daily-tips")
      const dailyDomainsEl = document.getElementById("daily-domains")

      if (dailyMessagesEl) dailyMessagesEl.textContent = data.dailyStats.messages || 0
      if (dailyTipsEl) dailyTipsEl.textContent = data.dailyStats.tips || 0
      if (dailyDomainsEl) dailyDomainsEl.textContent = data.dailyStats.domains || 0
    }

    // Update activity feed
    const activityFeedEl = document.getElementById("activity-feed")
    if (activityFeedEl && data.recentActivity) {
      if (data.recentActivity.length === 0) {
        activityFeedEl.innerHTML = '<div class="no-data">No recent activity</div>'
      } else {
        activityFeedEl.innerHTML = data.recentActivity
          .map(
            (activity) => `
          <div class="activity-item">
            <div class="activity-text">
              ${activity.action} <span class="activity-domain">${activity.domain}</span>
            </div>
            <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
          </div>
        `,
          )
          .join("")
      }
    }
  }

  function updateLastUpdatedTime() {
    const lastUpdatedEl = document.getElementById("last-updated")
    if (lastUpdatedEl) {
      const now = new Date()
      lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString()}`
    }
  }

  function showTrendingError() {
    const trendingDomainsEl = document.getElementById("trending-domains")
    const activityFeedEl = document.getElementById("activity-feed")

    if (trendingDomainsEl) {
      trendingDomainsEl.innerHTML = '<div class="no-data">Unable to load trending data</div>'
    }
    if (activityFeedEl) {
      activityFeedEl.innerHTML = '<div class="no-data">Unable to load activity feed</div>'
    }
  }

  function formatTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  // Event listeners
  sendMessageBtn.addEventListener("click", sendMessage)
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  // Add resize functionality
  const resizeHandle = document.getElementById("resize-handle")
  if (resizeHandle) {
    let isResizing = false
    let startY = 0
    let startHeight = 0

    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true
      startY = e.clientY
      startHeight = document.body.offsetHeight
      document.body.style.userSelect = "none"
      e.preventDefault()
    })

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return

      const deltaY = e.clientY - startY
      const newHeight = startHeight + deltaY
      const minHeight = 400
      const maxHeight = 800

      const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight))
      document.body.style.height = clampedHeight + "px"

      // Update tab content height
      const tabContents = document.querySelectorAll(".tab-content")
      tabContents.forEach((content) => {
        content.style.height = `calc(${clampedHeight}px - 200px)`
      })
    })

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false
        document.body.style.userSelect = ""

        // Save height preference
        localStorage.setItem("relay_popup_height", document.body.offsetHeight)
      }
    })

    // Restore saved height
    const savedHeight = localStorage.getItem("relay_popup_height")
    if (savedHeight) {
      const height = Number.parseInt(savedHeight)
      document.body.style.height = height + "px"
      const tabContents = document.querySelectorAll(".tab-content")
      tabContents.forEach((content) => {
        content.style.height = `calc(${height}px - 200px)`
      })
    }
  }

  initializeChat()

  // Declare createAndBroadcastTransaction function
  async function createAndBroadcastTransaction(recipientAddress, amount) {
    if (!currentWallet || !bitcoin) {
      throw new Error("Wallet not loaded or Bitcoin library unavailable")
    }

    try {
      // Get UTXOs for the address
      const response = await fetch(`https://blockstream.info/api/address/${currentWallet.address}/utxo`)
      const utxos = await response.json()

      if (utxos.length === 0) {
        throw new Error("No UTXOs available for transaction")
      }

      // Create transaction
      const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })

      let totalInput = 0
      for (const utxo of utxos) {
        // Get transaction hex for each UTXO
        const txResponse = await fetch(`https://blockstream.info/api/tx/${utxo.txid}/hex`)
        const txHex = await txResponse.text()

        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: Buffer.from(txHex, "hex"),
        })

        totalInput += utxo.value
      }

      const amountSatoshis = Math.floor(amount * 100000000)
      const fee = 1000 // 1000 satoshis fee
      const change = totalInput - amountSatoshis - fee

      // Add output for recipient
      psbt.addOutput({
        address: recipientAddress,
        value: amountSatoshis,
      })

      // Add change output if needed
      if (change > 546) {
        // Dust limit
        psbt.addOutput({
          address: currentWallet.address,
          value: change,
        })
      }

      // Sign all inputs
      for (let i = 0; i < utxos.length; i++) {
        psbt.signInput(i, currentWallet.privateKey)
      }

      psbt.finalizeAllInputs()
      const txHex = psbt.extractTransaction().toHex()

      // Broadcast transaction
      const broadcastResponse = await fetch("https://blockstream.info/api/tx", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: txHex,
      })

      if (!broadcastResponse.ok) {
        throw new Error("Failed to broadcast transaction")
      }

      const txid = await broadcastResponse.text()
      return txid
    } catch (error) {
      console.error("Transaction creation failed:", error)
      throw error
    }
  }
})
