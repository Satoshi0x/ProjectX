"use client"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Relay Chat Extension</h1>
          <p className="text-xl text-green-100 mb-6">Domain-based chat communities with integrated Bitcoin wallet</p>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="text-green-300 font-semibold">✅ Production Ready</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="text-green-300 font-semibold">🔒 Secure Authentication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Chat Feature */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl">💬</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-green-400">Domain Chat</h3>
            <p className="text-white/80 mb-4">
              Chat with other users visiting the same website. Every domain gets its own community.
            </p>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Real-time messaging</li>
              <li>• Domain-based rooms</li>
              <li>• User avatars & timestamps</li>
              <li>• Bitcoin tipping system</li>
            </ul>
          </div>

          {/* Bitcoin Wallet */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl">₿</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-orange-400">Bitcoin Wallet</h3>
            <p className="text-white/80 mb-4">
              Full Bitcoin wallet with real transaction capabilities and Coinbase Commerce integration.
            </p>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Generate/import wallets</li>
              <li>• Real balance checking</li>
              <li>• Send/receive Bitcoin</li>
              <li>• Coinbase Commerce payments</li>
            </ul>
          </div>

          {/* Trending Analytics */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-blue-400">Live Analytics</h3>
            <p className="text-white/80 mb-4">
              Real-time insights into user activity and trending domains across the network.
            </p>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Active user counts</li>
              <li>• Top 5 trending domains</li>
              <li>• Daily activity reports</li>
              <li>• Real-time updates</li>
            </ul>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-8 border border-emerald-500/20 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Backend Infrastructure</h3>
              <ul className="text-white/80 space-y-2">
                <li>
                  • <strong>Database:</strong> Supabase with real-time subscriptions
                </li>
                <li>
                  • <strong>Server:</strong> Node.js with Socket.IO deployed on Vercel
                </li>
                <li>
                  • <strong>Authentication:</strong> Email/password with secure sessions
                </li>
                <li>
                  • <strong>Analytics:</strong> Anonymous usage tracking
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Frontend Features</h3>
              <ul className="text-white/80 space-y-2">
                <li>
                  • <strong>Extension:</strong> Chrome/Edge compatible
                </li>
                <li>
                  • <strong>UI:</strong> Resizable, draggable popup interface
                </li>
                <li>
                  • <strong>Bitcoin:</strong> Real blockchain integration
                </li>
                <li>
                  • <strong>Commerce:</strong> Coinbase Commerce API integration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Ready to Install</h2>
          <p className="text-white/80 mb-6">
            The Relay Chat extension is production-ready with full Bitcoin functionality and real-time chat.
          </p>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-w-2xl mx-auto">
            <p className="text-sm text-white/60 mb-2">Installation Instructions:</p>
            <ol className="text-left text-white/80 space-y-1 text-sm">
              <li>1. Download the extension files from GitHub</li>
              <li>2. Open Chrome/Edge → Extensions → Developer Mode</li>
              <li>3. Click "Load unpacked" and select the extension folder</li>
              <li>4. Register with email/password on first use</li>
              <li>5. Start chatting and using Bitcoin on any website!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/5 border-t border-white/10 p-6 text-center">
        <p className="text-white/60">Relay Chat Extension - Domain-based communities with integrated Bitcoin wallet</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a href="/analytics-dashboard.html" className="text-green-400 hover:text-green-300 text-sm">
            View Analytics Dashboard
          </a>
          <span className="text-white/40">•</span>
          <span className="text-white/60 text-sm">Deployed on Vercel</span>
        </div>
      </div>
    </div>
  )
}
