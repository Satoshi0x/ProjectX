-- Insert sample users for testing
INSERT INTO users (id, username, display_name, bio, bitcoin_address, join_date) VALUES
('user1', 'alice_crypto', 'Alice Johnson', 'Bitcoin enthusiast and web developer', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', NOW()),
('user2', 'bob_trader', 'Bob Smith', 'Day trader and crypto investor', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', NOW()),
('user3', 'charlie_dev', 'Charlie Brown', 'Full-stack developer building the future', 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', NOW());

-- Insert sample messages for different domains
INSERT INTO messages (user_id, username, domain, message, timestamp) VALUES
('user1', 'alice_crypto', 'news.ycombinator.com', 'Great article about Bitcoin adoption!', NOW() - INTERVAL '5 minutes'),
('user2', 'bob_trader', 'news.ycombinator.com', 'The tech industry is really embracing crypto', NOW() - INTERVAL '3 minutes'),
('user1', 'alice_crypto', 'github.com', 'Anyone working on Bitcoin-related projects?', NOW() - INTERVAL '10 minutes'),
('user3', 'charlie_dev', 'github.com', 'Check out my new Lightning Network implementation', NOW() - INTERVAL '8 minutes');

-- Insert sample posts for the community feed
INSERT INTO posts (user_id, username, title, content, timestamp) VALUES
('user1', 'alice_crypto', 'The Future of Web3 Chat', 'Domain-based chat communities are revolutionizing how we communicate online. By creating instant communities for every website, we''re building a more connected internet.', NOW() - INTERVAL '1 day'),
('user2', 'bob_trader', 'Bitcoin Payment Integration', 'Just tested the new Coinbase Commerce integration - seamless payments directly from the browser extension. This is the future of e-commerce!', NOW() - INTERVAL '2 days'),
('user3', 'charlie_dev', 'Building Decentralized Communities', 'The combination of domain-based chat and Bitcoin micropayments creates new possibilities for online communities and content monetization.', NOW() - INTERVAL '3 days');

-- Insert sample analytics data
INSERT INTO analytics (user_id, domain, action, metadata, timestamp) VALUES
('user1', 'news.ycombinator.com', 'site_visit', '{"duration": 300}', NOW() - INTERVAL '1 hour'),
('user1', 'github.com', 'site_visit', '{"duration": 450}', NOW() - INTERVAL '2 hours'),
('user2', 'coinbase.com', 'wallet_action', '{"action": "send_transaction", "amount": "0.001"}', NOW() - INTERVAL '30 minutes'),
('user3', 'news.ycombinator.com', 'site_visit', '{"duration": 600}', NOW() - INTERVAL '45 minutes');
