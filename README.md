# 🚀 Relay Chat Extension - Complete Browser Extension

A sophisticated browser extension that creates domain-based chat communities for every website, featuring integrated Bitcoin wallet functionality, real-time messaging, user authentication, and comprehensive analytics tracking.

## ✨ Current Features

### 🎯 Core Functionality
- **Domain-Based Chat Communities** - Instant chat rooms for every website you visit
- **Real-Time Messaging** - Live chat with other users on the same domain
- **User Authentication** - Email/password registration with custom aliases
- **Bitcoin Wallet Integration** - Full Bitcoin wallet with mnemonic generation, balance checking, and transaction broadcasting
- **Coinbase Commerce Payments** - One-click Bitcoin payments to merchants
- **Trending Analytics** - Real-time user activity and top domain statistics
- **Anonymous Usage Tracking** - Privacy-first analytics with comprehensive insights

### 🎨 User Interface
- **Dark Mode Design** - Sleek green and black theme with glassmorphism effects
- **Resizable Popup** - Adjustable height (400-800px) with drag handle
- **Draggable Positioning** - Move the extension anywhere on your browser window
- **Lower-Right Corner Positioning** - Opens in optimal location by default
- **Three-Tab Layout** - Chat, Bitcoin Wallet, and Trending Analytics tabs

### 💰 Bitcoin Features
- **Real Balance Checking** - Live Bitcoin balance from Blockstream.info API
- **Transaction Broadcasting** - Create and broadcast real Bitcoin transactions
- **Mnemonic Wallet Generation** - Secure 12-word seed phrase creation
- **Bitcoin Tipping** - Send Bitcoin tips to other chat users
- **Blockchain Explorer Integration** - Direct links to view transactions on Blockstream.info
- **Real-Time Price Updates** - Live BTC/USD conversion rates
- **Dynamic Fee Estimation** - Optimal transaction fees based on network conditions

### 📊 Analytics & Trending
- **Live User Count** - Real-time active user tracking across all domains
- **Top 5 Domains** - Most active chat communities updated every 10 minutes
- **Daily Statistics** - Messages sent, tips given, domains visited
- **Activity Feed** - Real-time stream of user actions across the network
- **Anonymous Tracking** - Privacy-first analytics with no personal data stored

## 🔐 User Authentication System

### Registration Process
- **First-Time Setup** - Email and password required on initial extension use
- **Custom Aliases** - Choose any username (duplicates allowed)
- **Cross-Browser Sync** - Login with email/password on any browser
- **Secure Storage** - User data encrypted in Supabase database

## 🚀 Production Deployment

### ✅ Live & Ready
- **Server**: `https://v0-clone-relay-extension.vercel.app`
- **Database**: Supabase with complete user and analytics schema
- **Analytics Dashboard**: `https://v0-clone-relay-extension.vercel.app/analytics-dashboard.html`
- **Coinbase Commerce**: Fully integrated with live API and webhooks
- **Real-Time Monitoring**: Automatic updates and transaction tracking

## 🔧 Installation

### Load Extension in Browser
1. **Download** this repository
2. **Open Chrome/Edge** → `chrome://extensions/` or `edge://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"** → Select project folder
5. **Register** with email, password, and alias on first use

The extension connects to the live server automatically - no additional setup required!

## 🎯 How to Use

### Getting Started
1. **Install extension** and complete registration
2. **Visit any website** (e.g., reddit.com, github.com)
3. **Click Relay Chat icon** or use draggable toggle button
4. **Join domain chat** and start messaging with other users

### Chat Tab
- **Real-time messaging** with users on the same domain
- **Bitcoin tip buttons** on other users' messages
- **User count display** showing active chatters
- **Message history** persisted across sessions

### Bitcoin Wallet Tab
- **Generate/Import wallet** with 12-word mnemonic phrase
- **View real Bitcoin balance** and transaction history
- **Send Bitcoin** to any address with dynamic fee calculation
- **Pay merchants** automatically when Coinbase Commerce detected
- **View transactions** on Blockstream.info blockchain explorer

### Trending Tab
- **Live user count** across all domains
- **Top 5 active domains** updated every 10 minutes
- **Daily activity stats** - messages, tips, unique domains
- **Real-time activity feed** showing network-wide actions

## 🛒 Coinbase Commerce Integration

### Merchant Payments
- **Auto-Detection** - Finds Commerce buttons on websites
- **Price Conversion** - Real-time BTC calculation for any currency
- **One-Click Payment** - Pay directly from extension wallet
- **Transaction Broadcasting** - Real Bitcoin sent to merchant addresses
- **Payment Confirmation** - Webhook notifications and success alerts

## 🔄 Real-Time Features

### Automatic Updates
- **Balance Updates** - Every 30 seconds
- **BTC Price Updates** - Every 60 seconds
- **Transaction Monitoring** - Every 15 seconds for confirmations
- **Trending Data** - Every 10 minutes for top domains
- **User Activity** - Instant updates via WebSocket connection

### Notifications
- **Transaction Confirmations** - Popup alerts when Bitcoin transactions confirm
- **Payment Success** - Coinbase Commerce payment completion notices
- **Balance Changes** - Visual indicators for wallet updates
- **New Messages** - Real-time chat notifications

## 🗄️ Database & Analytics

### Supabase Tables
- **users** - Authentication and profile data
- **messages** - Domain-based chat history
- **analytics** - Anonymous usage tracking
- **tips** - Bitcoin tip transactions
- **posts** - User-generated content

### Privacy Protection
- **Anonymous IDs** - No personal data in analytics
- **Encrypted Storage** - Secure user authentication
- **Local Wallet Keys** - Private keys never leave browser
- **GDPR Compliant** - Privacy-first data handling

## 🎉 Project Status: Complete & Production Ready

The Relay Chat Extension is fully functional with all features implemented and deployed:

✅ **User authentication with email/password registration**  
✅ **Domain-based chat communities with real-time messaging**  
✅ **Complete Bitcoin wallet with transaction broadcasting**  
✅ **Coinbase Commerce payment integration**  
✅ **Trending analytics with live user tracking**  
✅ **Resizable and draggable interface**  
✅ **Production deployment on Vercel with Supabase**  
✅ **Real-time monitoring and notifications**  
✅ **Anonymous analytics dashboard**  

The extension creates instant communities for every website on the internet, enabling authenticated users to chat, tip with Bitcoin, make merchant payments, and view trending activity across the entire network. Ready for immediate use! 🚀

---

**Live Demo**: Install the extension and visit any website to start chatting!  
**Analytics**: View real-time usage at the analytics dashboard  
**Support**: All features are production-ready with comprehensive error handling
