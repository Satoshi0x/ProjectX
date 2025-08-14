export default function ExtensionDemo() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* GitHub-style website mockup */}
      <div className="relative bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <h1 className="text-xl font-semibold">facebook/react</h1>
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">Public</span>
          </div>
          <div className="mt-4 flex space-x-6 text-sm">
            <span className="flex items-center space-x-1">
              <span>📁</span>
              <span>Code</span>
            </span>
            <span>Issues</span>
            <span>Pull requests</span>
            <span>Actions</span>
          </div>
        </div>

        {/* Relay Chat Extension Overlay */}
        <div className="fixed bottom-6 right-6 z-50">
          {/* Draggable Toggle Button */}
          <div className="absolute -top-12 -left-12 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-move shadow-lg hover:bg-emerald-600 transition-colors">
            <span className="text-white text-sm font-bold">R</span>
          </div>

          {/* Extension Popup */}
          <div className="w-80 h-96 bg-black rounded-lg shadow-2xl border border-emerald-500/20 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Relay Chat</h3>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button className="flex-1 py-2 px-3 text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10">
                Chat
              </button>
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Wallet</button>
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Trending</button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="text-xs text-gray-500 text-center">github.com/facebook/react</div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="text-emerald-400 text-xs">alice_dev</div>
                    <div className="text-white text-sm">Anyone else excited about React 19?</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="text-blue-400 text-xs">bob_react</div>
                    <div className="text-white text-sm">The new compiler looks amazing! 🚀</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white">
                    C
                  </div>
                  <div className="flex-1">
                    <div className="text-purple-400 text-xs">charlie_js</div>
                    <div className="text-white text-sm">Finally, no more manual memoization!</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded text-sm border border-gray-700 focus:border-emerald-500 focus:outline-none"
                />
                <button className="px-3 py-2 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600">
                  Send
                </button>
              </div>
            </div>

            {/* Resize Handle */}
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
              <div className="w-full h-full bg-emerald-500/20 rounded-tl-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* E-commerce Demo */}
      <div className="relative bg-white mt-8 border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <img src="/nike-air-max-product.png" alt="Product" className="w-full rounded-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">Nike Air Max 270</h1>
              <p className="text-2xl font-semibold text-green-600 mb-4">$150.00</p>
              <p className="text-gray-600 mb-6">
                Experience ultimate comfort with the Nike Air Max 270, featuring the largest heel Air unit yet.
              </p>
              <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Extension with Wallet Tab Active */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="absolute -top-12 -left-12 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-move shadow-lg">
            <span className="text-white text-sm font-bold">R</span>
          </div>

          <div className="w-80 h-96 bg-black rounded-lg shadow-2xl border border-emerald-500/20">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Relay Chat</h3>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex border-b border-gray-800">
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Chat</button>
              <button className="flex-1 py-2 px-3 text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10">
                Wallet
              </button>
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Trending</button>
            </div>

            {/* Wallet Content */}
            <div className="flex-1 p-4 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">0.00234567 BTC</div>
                <div className="text-emerald-400 text-sm">≈ $150.00 USD</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Bitcoin Address</div>
                <div className="text-white text-xs font-mono break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
              </div>

              {/* Coinbase Commerce Detection */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-400 text-sm font-semibold">Commerce Detected</span>
                </div>
                <div className="text-white text-sm mb-2">Nike Air Max 270 - $150.00</div>
                <button className="w-full bg-emerald-500 text-white py-2 rounded text-sm hover:bg-emerald-600">
                  Pay with Bitcoin
                </button>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-700">Send</button>
                <button className="flex-1 bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-700">
                  Receive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Site Demo */}
      <div className="relative bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Breaking: Bitcoin Reaches New All-Time High</h1>
          <div className="text-gray-600 mb-6">Published 2 hours ago by CryptoNews</div>
          <div className="prose max-w-none">
            <p>
              Bitcoin has surged to unprecedented levels today, breaking through the $100,000 barrier for the first time
              in its history...
            </p>
          </div>
        </div>

        {/* Extension with Trending Tab Active */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="absolute -top-12 -left-12 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-move shadow-lg">
            <span className="text-white text-sm font-bold">R</span>
          </div>

          <div className="w-80 h-96 bg-black rounded-lg shadow-2xl border border-emerald-500/20">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Relay Chat</h3>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex border-b border-gray-800">
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Chat</button>
              <button className="flex-1 py-2 px-3 text-gray-400 hover:text-white">Wallet</button>
              <button className="flex-1 py-2 px-3 text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/10">
                Trending
              </button>
            </div>

            {/* Trending Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="text-center">
                <div className="text-emerald-400 text-lg font-bold">1,247 users active</div>
                <div className="text-gray-400 text-xs">Updated 2 minutes ago</div>
              </div>

              <div className="space-y-3">
                <div className="text-white text-sm font-semibold mb-2">🔥 Top Domains</div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <div>
                      <div className="text-white text-sm">news.ycombinator.com</div>
                      <div className="text-gray-400 text-xs">Tech discussions</div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold">342</div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <div>
                      <div className="text-white text-sm">github.com</div>
                      <div className="text-gray-400 text-xs">Code reviews</div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold">289</div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <div>
                      <div className="text-white text-sm">reddit.com</div>
                      <div className="text-gray-400 text-xs">General chat</div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold">156</div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <div>
                      <div className="text-white text-sm">twitter.com</div>
                      <div className="text-gray-400 text-xs">Social media</div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold">98</div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-800 rounded p-2">
                    <div>
                      <div className="text-white text-sm">coinbase.com</div>
                      <div className="text-gray-400 text-xs">Crypto trading</div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold">67</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
