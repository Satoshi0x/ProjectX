# Relay Chat Extension Setup Guide

## ✅ Completed Steps
1. **Database Setup** - Supabase tables created and seeded with sample data
2. **Server Configuration** - Updated to use Supabase instead of in-memory storage

## 🚀 Next Steps to Complete Setup

### Step 2: Install Server Dependencies
\`\`\`bash
cd server
npm install
\`\`\`

### Step 3: Start the Backend Server
\`\`\`bash
npm start
\`\`\`
The server will run on `http://localhost:3001`

### Step 4: Load Extension in Browser
1. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this project folder
4. The Relay Chat extension will appear with a purple chat icon

### Step 5: Test the Extension
1. Click the extension icon in your browser toolbar
2. The popup will appear in the lower-right corner
3. Visit different websites to test domain-based chat rooms
4. Try the Bitcoin wallet and profile features

## 🔧 Configuration Options

### Environment Variables (Already Set)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional Integrations
- **Coinbase Commerce** - For Bitcoin payments (add API keys when ready)
- **Google Analytics** - For user tracking (add GA ID when ready)

## 📊 Database Schema
The following tables have been created:
- `users` - User profiles and Bitcoin addresses
- `messages` - Chat messages by domain
- `posts` - Long-form community posts
- `analytics` - Anonymous usage tracking

Sample data has been added for testing purposes.
