"use client"

import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat")
  const [walletConnected, setWalletConnected] = useState(false)
  const [bitcoinAddress, setBitcoinAddress] = useState("")
  const [balance, setBalance] = useState("0.00000000")
  const [showPayment, setShowPayment] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", message: "Hey everyone! Love this new t-shirt design!", time: "2:34 PM", avatar: "A" },
    { id: 2, user: "Bob", message: "Agreed! Just ordered one in blue", time: "2:35 PM", avatar: "B" },
    { id: 3, user: "Charlie", message: "Anyone know if they ship internationally?", time: "2:36 PM", avatar: "C" },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [profile, setProfile] = useState({
    username: "user123",
    displayName: "John Doe",
    bio: "Crypto enthusiast and fashion lover",
    website: "https://mywebsite.com",
    joinDate: "March 2024",
  })
  const [editingProfile, setEditingProfile] = useState(false)
  const [tempProfile, setTempProfile] = useState(profile)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateWallet = () => {
    // Simulate wallet generation
    const addresses = [
      "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
      "bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3",
    ]
    setBitcoinAddress(addresses[Math.floor(Math.random() * addresses.length)])
    setBalance("0.00234567")
    setWalletConnected(true)
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        user: "You",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: "Y",
      }
      setMessages([...messages, newMsg])
      setNewMessage("")
    }
  }

  const sendTip = (messageId: number) => {
    if (!walletConnected) {
      alert("Please connect your wallet first!")
      return
    }
    alert("Tip sent! 🎉")
  }

  const saveProfile = () => {
    setProfile(tempProfile)
    setEditingProfile(false)
  }

  const renderChatTab = () => (
    <div className="p-4 h-[400px] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">styleshop.com</h3>
            <p className="text-white/60 text-xs">5 users online</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {msg.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-xs">{msg.user}</span>
                  <span className="text-white/40 text-xs">{msg.time}</span>
                  {msg.user !== "You" && (
                    <button
                      onClick={() => sendTip(msg.id)}
                      className="ml-auto bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-2 py-1 rounded text-xs border border-orange-500/30"
                    >
                      ₿ Tip
                    </button>
                  )}
                </div>
                <p className="text-white/80 text-xs">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-xs placeholder-white/40 focus:outline-none focus:border-purple-400"
        />
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  )

  const renderWalletTab = () => (
    <div className="p-4 h-[400px] flex flex-col">
      {!walletConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-xl mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-orange-400">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Bitcoin Wallet</h3>
          <p className="text-white/60 text-sm mb-6">Connect your wallet to start using Bitcoin features</p>
          <div className="space-y-3 w-full">
            <button
              onClick={generateWallet}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700"
            >
              Generate New Wallet
            </button>
            <button className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/20">
              Import Existing Wallet
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Wallet Status */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 mb-3 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold text-xs">Wallet Connected</span>
            </div>
            <p className="text-white/80 text-xs">Ready for payments</p>
          </div>

          {/* Balance Display */}
          <div className="bg-white/5 rounded-lg p-4 mb-3 border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-white/60 text-xs mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-white mb-1">{balance} BTC</p>
              <p className="text-orange-400 text-sm font-semibold">≈ $156.78 USD</p>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Your Address</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-xs font-mono flex-1 truncate">{bitcoinAddress}</p>
              <button
                onClick={() => navigator.clipboard.writeText(bitcoinAddress)}
                className="text-purple-400 hover:text-purple-300 text-xs"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Coinbase Commerce Detection */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3 mb-3 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-blue-400 font-semibold text-xs">Coinbase Commerce Detected</span>
            </div>
            <p className="text-white/80 text-xs mb-2">This store accepts Bitcoin payments</p>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              🛒 Pay with Bitcoin
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-auto">
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg text-xs font-semibold">
              Send
            </button>
            <button className="flex-1 bg-white/10 border border-white/20 text-white py-2 rounded-lg text-xs font-semibold">
              Receive
            </button>
            <button
              onClick={() => window.open(`https://blockstream.info/address/${bitcoinAddress}`, "_blank")}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 rounded-lg text-xs font-semibold"
            >
              View Transactions
            </button>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-80 border border-purple-500/20">
            <h3 className="text-white font-bold text-lg mb-4">Confirm Payment</h3>
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-sm">Item:</span>
                <span className="text-white text-sm">Premium T-Shirt</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-sm">Price:</span>
                <span className="text-white text-sm">$29.99 USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Bitcoin Amount:</span>
                <span className="text-orange-400 font-semibold text-sm">0.00045123 BTC</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-white/10 border border-white/20 text-white py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPayment(false)
                  alert("Payment sent successfully! 🎉")
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderProfileTab = () => (
    <div className="p-4 h-[400px] flex flex-col">
      {!editingProfile ? (
        <>
          {/* Profile Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
              {profile.displayName.charAt(0)}
            </div>
            <h3 className="text-white font-bold text-lg">{profile.displayName}</h3>
            <p className="text-purple-400 text-sm">@{profile.username}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-white font-bold text-lg">127</p>
              <p className="text-white/60 text-xs">Messages</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-white font-bold text-lg">23</p>
              <p className="text-white/60 text-xs">Tips Sent</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-white font-bold text-lg">8</p>
              <p className="text-white/60 text-xs">Domains</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-3 flex-1">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Bio</p>
              <p className="text-white text-sm">{profile.bio}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Website</p>
              <a href={profile.website} className="text-purple-400 text-sm hover:text-purple-300">
                {profile.website}
              </a>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Joined</p>
              <p className="text-white text-sm">{profile.joinDate}</p>
            </div>

            {walletConnected && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-white/60 text-xs mb-1">Bitcoin Address</p>
                <p className="text-orange-400 text-xs font-mono">{bitcoinAddress}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setTempProfile(profile)
                setEditingProfile(true)
              }}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 rounded-lg text-xs font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => window.open(`https://relay-profiles.vercel.app/u/${profile.username}`, "_blank")}
              className="flex-1 bg-white/10 border border-white/20 text-white py-2 rounded-lg text-xs font-semibold"
            >
              View Public Profile
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Edit Profile Form */}
          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-white/60 text-xs mb-1">Display Name</label>
              <input
                type="text"
                value={tempProfile.displayName}
                onChange={(e) => setTempProfile({ ...tempProfile, displayName: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1">Username</label>
              <input
                type="text"
                value={tempProfile.username}
                onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1">Bio</label>
              <textarea
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400 h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs mb-1">Website</label>
              <input
                type="url"
                value={tempProfile.website}
                onChange={(e) => setTempProfile({ ...tempProfile, website: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setEditingProfile(false)}
              className="flex-1 bg-white/10 border border-white/20 text-white py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Simulated E-commerce Website Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-slate-800 font-bold text-xl">StyleShop</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 text-sm">Cart (1)</span>
              <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-blue-600 text-xs font-semibold">Accepts Bitcoin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Page */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="w-full h-80 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                <span className="text-slate-500 text-lg">Premium T-Shirt</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Premium Cotton T-Shirt</h1>
                <p className="text-slate-600">Comfortable, stylish, and made from 100% organic cotton.</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-slate-800">$29.99</span>
                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-md">
                  <span className="text-orange-600 text-sm font-semibold">≈ 0.00045123 BTC</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">Size</label>
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                    <option>Medium</option>
                    <option>Large</option>
                    <option>X-Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-2">Color</label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-black rounded-full border-2 border-slate-800"></div>
                    <div className="w-8 h-8 bg-white rounded-full border-2 border-slate-300"></div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                  Add to Cart - $29.99
                </button>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-orange-600">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-orange-800 font-semibold">Pay with Bitcoin</span>
                  </div>
                  <p className="text-orange-700 text-sm">
                    Use your Relay Chat extension wallet for instant Bitcoin payments!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chrome Extension Popup - Fixed in lower right */}
      <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 z-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-center relative">
          <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto mb-2 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Relay Chat</h2>
          <p className="text-purple-100 text-xs">Domain-based communities</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 backdrop-blur-sm border-b border-white/10">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-all ${
              activeTab === "chat"
                ? "text-purple-400 bg-purple-500/10 border-b-2 border-purple-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-all ${
              activeTab === "wallet"
                ? "text-orange-400 bg-orange-500/10 border-b-2 border-orange-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            ₿ Wallet
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-2 text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "text-pink-400 bg-pink-500/10 border-b-2 border-pink-400"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            👤 Profile
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" && renderChatTab()}
        {activeTab === "wallet" && renderWalletTab()}
        {activeTab === "profile" && renderProfileTab()}
      </div>

      {/* Chrome Extension Icon in toolbar simulation */}
      <div className="fixed top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
          <path
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
