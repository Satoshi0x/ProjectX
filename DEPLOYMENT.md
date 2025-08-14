# Relay Chat Extension - Deployment Guide

## Server Deployment to Vercel

The server is now configured for Vercel deployment with:
- Serverless function configuration
- CORS setup for browser extensions
- Socket.IO configuration for production
- Environment variables integration
- Supabase database integration

### Deploy Steps:
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically with environment variables
4. Update extension files with production server URL

### Environment Variables Needed:
- `SUPABASE_URL` (already configured in v0.app)
- `SUPABASE_ANON_KEY` (already configured in v0.app)
- `SUPABASE_SERVICE_ROLE_KEY` (already configured in v0.app)
- `NODE_ENV=production` (set automatically by Vercel)

### Post-Deployment Configuration:

After deployment, you'll get a Vercel URL like `https://your-relay-server.vercel.app`

**Update the following files with your production URL:**

1. **background.js** - Line 6:
   \`\`\`js
   this.serverUrl = process.env.NODE_ENV === "production" 
     ? "https://YOUR-ACTUAL-VERCEL-URL.vercel.app" 
     : "http://localhost:3001"
   \`\`\`

2. **content.js** - Line 7:
   \`\`\`js
   this.serverUrl = process.env.NODE_ENV === "production" 
     ? "https://YOUR-ACTUAL-VERCEL-URL.vercel.app" 
     : "http://localhost:3001"
   \`\`\`

3. **popup.js** - Line 42:
   \`\`\`js
   const serverUrl = process.env.NODE_ENV === "production" 
     ? "https://YOUR-ACTUAL-VERCEL-URL.vercel.app" 
     : "http://localhost:3001"
   \`\`\`

4. **analytics-dashboard.html** - Line 152:
   \`\`\`js
   const SERVER_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3001' 
     : 'https://YOUR-ACTUAL-VERCEL-URL.vercel.app'
   \`\`\`

### Testing the Deployment:
1. Visit your Vercel URL to confirm the server is running
2. Check `/api/health` endpoint for server status
3. Load the extension in Chrome/Edge
4. Test real-time messaging across different browser tabs
5. Verify Bitcoin wallet functionality and analytics tracking

### Next Steps After Deployment:
- Load extension as unpacked in Chrome/Edge
- Test all features with live server
- Configure Coinbase Commerce integration (optional)
- Set up Google Analytics tracking (optional)
