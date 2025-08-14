-- Create users table for user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  bitcoin_address TEXT,
  anonymous_id TEXT UNIQUE NOT NULL,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'message' CHECK (message_type IN ('message', 'tip', 'system')),
  tip_amount DECIMAL(16, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('site_visit', 'wallet_action', 'commerce_transaction')),
  action_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for user long-form posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_domain ON messages(domain);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_anonymous_id ON user_analytics(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_domain ON user_analytics(domain);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for messages table
CREATE POLICY "Anyone can view messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user_analytics table (anonymous tracking)
CREATE POLICY "Anyone can insert analytics" ON user_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view analytics" ON user_analytics FOR SELECT USING (true);

-- Create policies for posts table
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Users can manage own posts" ON posts FOR ALL USING (auth.uid() = user_id);
