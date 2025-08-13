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

  // Import bip39 and bitcoin libraries
  const bip39 = require("bip39")
  const bitcoin = require("bitcoinjs-lib")

  let currentProfile = null
  let anonymousUserId = null
  let currentWallet = null
  let isConnected = false

  chrome.storage.local.get(["anonymousUserId"], (result) => {
    if (result.anonymousUserId) {
      anonymousUserId = result.anonymousUserId
    } else {
      anonymousUserId = "anon_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      chrome.storage.local.set({ anonymousUserId: anonymousUserId })
    }
  })

  function trackWalletUsage(action) {
    if (anonymousUserId) {
      // Send to content script to relay to server
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "TRACK_WALLET_USAGE",
            action: action,
            anonymousUserId: anonymousUserId,
            timestamp: Date.now(),
          })
        }
      })
    }
  }

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
    })
  })

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
      } else {
        showWalletSetup()
      }
    })
  }

  function initializeProfileTab() {
    chrome.storage.local.get(["userProfile"], (result) => {
      if (result.userProfile) {
        currentProfile = result.userProfile
        showProfileDisplay()
        updateProfileDisplay()
      } else {
        showProfileSetup()
      }
    })
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
        // In a real implementation, you would fetch the balance from a Bitcoin API
        // For demo purposes, showing 0 balance
        document.getElementById("wallet-balance").textContent = "0.00000000 BTC"
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
  confirmSendBtn.addEventListener("click", () => {
    const recipientAddress = document.getElementById("recipient-address").value
    const amount = Number.parseFloat(document.getElementById("send-amount").value)

    if (!recipientAddress || !amount) {
      alert("Please enter recipient address and amount.")
      return
    }

    // In a real implementation, you would:
    // 1. Validate the recipient address
    // 2. Check if you have sufficient balance
    // 3. Create and sign the transaction
    // 4. Broadcast to the Bitcoin network

    alert(
      `Demo: Would send ${amount} BTC to ${recipientAddress}\n\nIn a real implementation, this would create and broadcast a Bitcoin transaction.`,
    )

    trackWalletUsage("sent_bitcoin")

    sendForm.classList.remove("active")
    document.getElementById("recipient-address").value = ""
    document.getElementById("send-amount").value = ""
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

    // Send post to server for homepage feed
    fetch("http://localhost:3001/api/posts", {
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
    }
  }

  function connectToServer() {
    // Load Socket.IO client
    const script = document.createElement("script")
    script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js"
    script.onload = () => {
      const io = window.io // Declare the io variable here
      socket = io("http://localhost:3001") // Update this URL for production
      setupSocketListeners()
      joinRoom()
    }
    document.head.appendChild(script)
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

  // Event listeners
  sendMessageBtn.addEventListener("click", sendMessage)
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  initializeChat()
})
