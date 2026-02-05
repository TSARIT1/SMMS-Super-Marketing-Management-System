-- ============================================
-- SuperMarket Database Initialization Script
-- ============================================
-- This script runs automatically when MySQL container starts
-- Creates initial database structure and seed data

-- Set character set
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET COLLATION_CONNECTION = utf8mb4_unicode_ci;

-- Database already created by MYSQL_DATABASE env var
-- This file adds initial tables and data

-- ============================================
-- Example: Create initial admin user
-- ============================================
-- The application will auto-create tables via Hibernate DDL
-- This is just for reference

-- ============================================
-- Production Notes:
-- ============================================
-- 1. All actual table creation happens via Hibernate ORM
-- 2. Spring Boot data initialization scripts can be placed here
-- 3. Use schema.sql and data.sql files in src/main/resources for app-managed initialization
-- 4. This file is only for manual database setup if needed

-- ============================================
-- Example Data (uncomment to use)
-- ============================================

-- Create subscription plans if not managed by application
/*
INSERT IGNORE INTO subscription_plan (id, name, price, features) VALUES
(1, 'Free Trial', 0, 'Basic features'),
(2, 'Basic', 99900, 'Standard features'),
(3, 'Standard', 299900, 'Advanced features'),
(4, 'Premium', 599900, 'All features');
*/

-- ============================================
-- Verify Database Connection
-- ============================================
SELECT 'Database initialized successfully' AS status;
SHOW TABLES;
