-- =====================================================
-- AI Configuration System - Database Migration Script
-- =====================================================
-- Version: 1.0.0
-- Date: February 5, 2026
-- Description: Adds AI Configuration and Billing System fields to profile table
-- =====================================================

USE supermarket_db;

-- Add AI Configuration columns
ALTER TABLE profile ADD COLUMN IF NOT EXISTS ai_mode VARCHAR(10) DEFAULT 'manual' 
    COMMENT 'AI operation mode: manual or auto';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS ai_enabled TINYINT(1) DEFAULT 1
    COMMENT 'Master switch for AI features';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS voice_ai_enabled TINYINT(1) DEFAULT 1
    COMMENT 'Enable voice AI agent';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS auto_inventory_management TINYINT(1) DEFAULT 0
    COMMENT 'Automatic inventory management by AI';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS auto_order_processing TINYINT(1) DEFAULT 0
    COMMENT 'Automatic order processing by AI';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS ai_load_balancing TINYINT(1) DEFAULT 1
    COMMENT 'AI-powered load balancing';

-- Add Billing Configuration columns
ALTER TABLE profile ADD COLUMN IF NOT EXISTS billing_mode VARCHAR(10) DEFAULT 'manual'
    COMMENT 'Billing mode: manual or ai';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS auto_billing_confirm TINYINT(1) DEFAULT 0
    COMMENT 'Auto-confirm billing operations';

ALTER TABLE profile ADD COLUMN IF NOT EXISTS paper_size VARCHAR(10) DEFAULT '80mm'
    COMMENT 'Receipt paper size: 58mm, 80mm, A4, or A5';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_ai_mode ON profile(ai_mode);
CREATE INDEX IF NOT EXISTS idx_profile_billing_mode ON profile(billing_mode);
CREATE INDEX IF NOT EXISTS idx_profile_paper_size ON profile(paper_size);

-- Update existing profiles with default values (if any NULL values exist)
UPDATE profile 
SET 
    ai_mode = COALESCE(ai_mode, 'manual'),
    ai_enabled = COALESCE(ai_enabled, 1),
    voice_ai_enabled = COALESCE(voice_ai_enabled, 1),
    auto_inventory_management = COALESCE(auto_inventory_management, 0),
    auto_order_processing = COALESCE(auto_order_processing, 0),
    ai_load_balancing = COALESCE(ai_load_balancing, 1),
    billing_mode = COALESCE(billing_mode, 'manual'),
    auto_billing_confirm = COALESCE(auto_billing_confirm, 0),
    paper_size = COALESCE(paper_size, '80mm')
WHERE id IS NOT NULL;

-- Verify the changes
SELECT 
    COUNT(*) as total_profiles,
    COUNT(ai_mode) as profiles_with_ai_mode,
    COUNT(billing_mode) as profiles_with_billing_mode,
    COUNT(paper_size) as profiles_with_paper_size
FROM profile;

-- Show sample data
SELECT 
    id,
    shop_name,
    ai_mode,
    ai_enabled,
    billing_mode,
    paper_size
FROM profile
LIMIT 5;

-- =====================================================
-- Migration Complete
-- =====================================================
-- All profiles now have AI Configuration fields
-- Default settings applied: Manual mode, Basic AI enabled
-- =====================================================
