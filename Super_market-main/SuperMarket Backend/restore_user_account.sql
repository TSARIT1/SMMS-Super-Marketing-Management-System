-- Restore User Account: weslyjohnpaulraj@gmail.com
-- This script will create/restore your user account in the MySQL database
-- Password will be: yourpassword123 (you can change it after login)

USE supermarket;

-- First, delete any existing account with this email (if any)
DELETE FROM users WHERE email = 'weslyjohnpaulraj@gmail.com';

-- Insert your user account
-- Password: yourpassword123 (BCrypt hash: $2a$10$N5bLQ3YLXxzjQhXzPh7xh.GvGZ5oZkWXmHfYjK8gKJxWdT1Y8kXYK)
INSERT INTO users (full_name, email, phone, password_hash, shop_name, shop_address, role, account_status, created_at, updated_at) 
VALUES (
    'Wesly John Paul Raj',
    'weslyjohnpaulraj@gmail.com',
    '9876543210',
    '$2a$10$N5bLQ3YLXxzjQhXzPh7xh.GvGZ5oZkWXmHfYjK8gKJxWdT1Y8kXYK',
    'My Super Market',
    'Chennai, Tamil Nadu',
    'USER',
    'ACTIVE',
    NOW(),
    NOW()
);

-- Get the user ID for subscription setup
SET @user_id = LAST_INSERT_ID();

-- Create a FREE TRIAL subscription for 30 days (optional)
INSERT INTO subscriptions (user_id, plan_name, price, billing_cycle, start_date, end_date, status, features, created_at, updated_at)
VALUES (
    @user_id,
    'Free Trial',
    0.00,
    'MONTHLY',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'ACTIVE',
    '{"max_products": 100, "max_orders": 500, "support": "email", "ai_features": false}',
    NOW(),
    NOW()
);

-- Verify the account was created
SELECT id, full_name, email, phone, shop_name, role, account_status 
FROM users 
WHERE email = 'weslyjohnpaulraj@gmail.com';

-- Show the subscription details
SELECT s.id, s.plan_name, s.start_date, s.end_date, s.status, u.email
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE u.email = 'weslyjohnpaulraj@gmail.com';

-- ============================================
-- CREDENTIALS TO LOGIN:
-- Email: weslyjohnpaulraj@gmail.com
-- Password: yourpassword123
-- ============================================
