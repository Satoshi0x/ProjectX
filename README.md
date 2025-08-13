# 🚀 Relay Chat Extension - Complete Setup Guide

A browser extension that creates domain-based chat communities for every website, with Bitcoin wallet integration and analytics tracking.

## 🎯 ELI5 Setup Guide (Explain Like I'm 5)

### Step 1: Get the Extension Running
1. **Download this project** to your computer
2. **Open Chrome or Edge** browser
3. **Type** `chrome://extensions/` in the address bar
4. **Turn on** "Developer mode" (toggle in top right)
5. **Click** "Load unpacked" button
6. **Select** this project folder
7. **Done!** You'll see the Relay Chat icon in your browser

### Step 2: Start the Backend Server
Think of this like starting the "brain" that makes everything work:

1. **Open Terminal/Command Prompt**
2. **Navigate to server folder:**
   \`\`\`bash
   cd server
   \`\`\`
3. **Install the brain's dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
4. **Start the brain:**
   \`\`\`bash
   npm start
   \`\`\`
5. **Keep this running!** Don't close this window

### Step 3: Test Everything Works
1. **Go to any website** (like google.com)
2. **Click the Relay Chat icon** in your browser toolbar
3. **You should see:**
   - The website domain name
   - A chat interface
   - Bitcoin wallet tab
   - Profile tab
4. **Test Coinbase Commerce payments:**
   - Visit any website with Coinbase Commerce checkout
   - Enable "Auto-pay with Bitcoin" in the wallet tab
   - The extension will detect checkout pages and offer to pay directly
   - Transactions are calculated in real-time Bitcoin prices

## 🔧 Production Deployment

### Backend Server Deployment
**Option 1: Vercel (Recommended)**
1. Create account at [vercel.com](https://vercel.com)
2. Upload the `server/` folder
3. Deploy with one click
4. Copy your deployment URL (like `https://your-app.vercel.app`)

**Option 2: Railway**
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Deploy the server folder
4. Copy your deployment URL

### Update Extension for Production
After deploying your server, update these files:

**In `popup.js` line 45:**
\`\`\`javascript
socket = io("https://your-deployed-server-url.com") // Replace with your URL
\`\`\`

**In `content.js` line 35:**
\`\`\`javascript
this.socket = io("https://your-deployed-server-url.com") // Replace with your URL
\`\`\`

**In `background.js` line 20:**
\`\`\`javascript
const response = await fetch(`https://your-deployed-server-url.com/api/rooms/${domain}/users`)
\`\`\`

## 🗄️ Database Setup (Optional but Recommended)

The extension works with in-memory storage, but for production you need a real database:

### Option 1: Supabase (Easiest)
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Run this SQL in the SQL editor:

\`\`\`sql
-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tips table
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  from_user VARCHAR(100) NOT NULL,
  to_user VARCHAR(100) NOT NULL,
  amount DECIMAL(16,8) NOT NULL,
  tx_hash VARCHAR(255),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics tables
CREATE TABLE site_visits (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  anonymous_user_id VARCHAR(100) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_usage (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  anonymous_user_id VARCHAR(100) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_domain ON messages(domain);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_site_visits_domain ON site_visits(domain);
CREATE INDEX idx_wallet_usage_action ON wallet_usage(action);
\`\`\`

4. Get your database URL from Settings > Database
5. Add to your server environment variables

### Option 2: Neon (PostgreSQL)
1. Go to [neon.tech](https://neon.tech) and create account
2. Create database
3. Use the same SQL as above
4. Get connection string and add to server

## 📊 Analytics Dashboard

View your analytics at: `http://localhost:3001/analytics-dashboard.html`

**What you'll see:**
- **Top visited websites** using your extension
- **Bitcoin wallet usage** statistics
- **Commerce transaction** data (anonymous)
- **Real-time user counts** per domain

## 🔐 Environment Variables

Create a `.env` file in the `server/` folder:

\`\`\`env
PORT=3001
DATABASE_URL=your_database_connection_string
NODE_ENV=production
\`\`\`

## 🌐 Domain Homepage & Trending

The extension tracks:
- **Most visited domains** by users
- **Active chat communities** 
- **Bitcoin transaction volume** per domain
- **User engagement** metrics

All data is **anonymous** - no personal information is stored.

## 🚀 Features Included

✅ **Domain-based chat rooms** - Every website gets its own chat  
✅ **Bitcoin wallet integration** - Generate, import, send Bitcoin  
✅ **User tipping system** - Tip other users with Bitcoin  
✅ **Profile system** - Create profiles with posts  
✅ **Analytics tracking** - Anonymous usage statistics  
✅ **Real-time messaging** - Instant chat updates  
✅ **Dark mode UI** - Beautiful modern interface  
✅ **Cross-browser support** - Works on Chrome and Edge  
✅ **Coinbase Commerce payments** - Pay any merchant that accepts Coinbase Commerce directly from your wallet  
✅ **Blockchain explorer integration** - View all transactions on Blockstream.info  

## 💳 Coinbase Commerce Integration

The Bitcoin wallet can automatically pay any merchant that accepts Coinbase Commerce:

### How It Works
1. **Visit any website** with Coinbase Commerce checkout
2. **Enable "Auto-pay with Bitcoin"** in the wallet tab
3. **Extension detects** Coinbase Commerce payment pages
4. **Calculates Bitcoin amount** needed in real-time
5. **One-click payment** directly from your wallet
6. **Transaction confirmation** shown in wallet tab

### Supported Merchants
- Any website using Coinbase Commerce for payments
- E-commerce stores, subscription services, donations
- Automatic price conversion from USD/EUR to Bitcoin
- Real-time exchange rate calculations

### Payment Process
1. Extension scans for Coinbase Commerce checkout pages
2. Extracts payment amount and merchant details
3. Converts fiat currency to Bitcoin using live rates
4. Displays payment confirmation modal
5. Sends Bitcoin transaction to merchant's address
6. Shows transaction status and confirmation

### Security Features
- **Manual confirmation** required for each payment
- **Amount verification** before sending
- **Transaction history** tracking
- **Merchant verification** through Coinbase Commerce API

## 🔧 Troubleshooting

**Extension not loading?**
- Make sure Developer mode is enabled
- Try reloading the extension

**Chat not working?**
- Check if server is running (`npm start` in server folder)
- Look for errors in browser console (F12)

**Bitcoin wallet issues?**
- Wallet is for demo purposes only
- Don't use real Bitcoin without proper security audit

**Analytics not showing?**
- Make sure server is running
- Visit `http://localhost:3001/analytics-dashboard.html`

**Coinbase Commerce payments not working?**
- Ensure Coinbase Commerce is enabled in the wallet tab
- Verify the merchant accepts Coinbase Commerce
- Check for any errors in the browser console

## 📞 Support

If you need help:
1. Check the browser console for errors (F12)
2. Make sure the server is running
3. Verify all URLs are updated for production
4. Check that ports aren't blocked by firewall

## 🎉 You're Done!

Your Relay Chat extension is now fully functional with:
- Real-time domain-based chat
- Bitcoin wallet and tipping
- User profiles and posts  
- Analytics tracking
- Production-ready backend
- Coinbase Commerce payments
- Blockchain explorer integration

Enjoy chatting with others on every website! 🚀
