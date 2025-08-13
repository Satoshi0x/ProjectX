export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4 text-white">Relay Chat Extension</h1>
        <p className="text-center text-purple-200 mb-12 text-lg">Dark Mode UI Preview</p>

        <div className="flex justify-center">
          <div className="w-96 h-[600px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl mx-auto mb-3 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Relay Chat</h2>
              <p className="text-purple-100 text-sm">Domain-based communities</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 backdrop-blur-sm border-b border-white/10">
              <button className="flex-1 py-4 px-3 text-sm font-semibold text-purple-400 bg-purple-500/10 border-b-2 border-purple-400">
                💬 Chat
              </button>
              <button className="flex-1 py-4 px-3 text-sm font-semibold text-white/60">₿ Wallet</button>
              <button className="flex-1 py-4 px-3 text-sm font-semibold text-white/60">👤 Profile</button>
            </div>

            {/* Chat Content */}
            <div className="p-5 h-[460px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-semibold text-sm">example.com</span>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-xs font-semibold">
                    3 users
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                <div className="bg-white/8 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-purple-400 font-semibold text-xs">Alice</span>
                    <span className="text-white/40 text-xs">2:34 PM</span>
                  </div>
                  <p className="text-slate-200 text-sm">Hey everyone! 👋</p>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold mt-2">
                    💰 Tip
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-3 ml-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/90 font-semibold text-xs">You</span>
                    <span className="text-white/60 text-xs">2:35 PM</span>
                  </div>
                  <p className="text-white text-sm">This looks amazing! 🚀</p>
                </div>

                <div className="bg-white/8 rounded-2xl p-3 border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-purple-400 font-semibold text-xs">Bob</span>
                    <span className="text-white/40 text-xs">2:36 PM</span>
                  </div>
                  <p className="text-slate-200 text-sm">Thanks for the Bitcoin tip! 🎉</p>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold mt-2">
                    💰 Tip
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2 bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400"
                />
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">✨ Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-purple-200">
              <div>• Dark mode interface</div>
              <div>• Integrated chat in popup</div>
              <div>• Bitcoin wallet & tipping</div>
              <div>• User profiles & posts</div>
              <div>• Real-time messaging</div>
              <div>• Analytics tracking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
