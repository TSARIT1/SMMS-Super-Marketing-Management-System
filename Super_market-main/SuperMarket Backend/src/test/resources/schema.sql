-- Test schema for H2 to ensure deterministic table creation order
-- Minimal columns required for tests

-- Drop tables if they exist (reverse dependency order)
DROP TABLE IF EXISTS ticket_attachments;
DROP TABLE IF EXISTS ticket_messages;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS landing_page;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),
  account_status VARCHAR(50),
  barcode_scanner_enabled BOOLEAN DEFAULT FALSE,
  barcode_scanner_prefix VARCHAR(50),
  barcode_scanner_suffix VARCHAR(50),
  barcode_scanner_type VARCHAR(50),
  cash_drawer_enabled BOOLEAN DEFAULT FALSE,
  cash_drawer_trigger VARCHAR(50),
  freeze_reason VARCHAR(255),
  frozen_at TIMESTAMP,
  frozen_by BIGINT,
  label_printer_enabled BOOLEAN DEFAULT FALSE,
  label_printer_type VARCHAR(50),
  phone VARCHAR(50),
  professional_number VARCHAR(100),
  razorpay_key_id VARCHAR(255),
  razorpay_key_secret VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  reset_token_hash VARCHAR(255),
  saved_card_expiry VARCHAR(50),
  saved_card_name VARCHAR(255),
  saved_card_number VARCHAR(50),
  saved_upi_id VARCHAR(100),
  shop_address CLOB,
  shop_name VARCHAR(255),
  thermal_printer_enabled BOOLEAN DEFAULT FALSE,
  thermal_printer_port VARCHAR(50),
  thermal_printer_type VARCHAR(50),
  thermal_printer_width VARCHAR(50),
  weighing_scale_enabled BOOLEAN DEFAULT FALSE,
  weighing_scale_port VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message CLOB NOT NULL,
  link VARCHAR(500),
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  target_user_id BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notification_reads (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  notification_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notification_id) REFERENCES notifications(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(notification_id, user_id)
);

CREATE TABLE IF NOT EXISTS profile (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  shop_name VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS landing_page (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hero_title VARCHAR(255),
  hero_subtitle VARCHAR(255),
  hero_image_url VARCHAR(500),
  features_json CLOB,
  sections_json CLOB,
  cta_primary_text VARCHAR(255),
  cta_primary_url VARCHAR(500),
  cta_secondary_text VARCHAR(255),
  cta_secondary_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  plan_id BIGINT,
  amount_paid DOUBLE,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  currency VARCHAR(20),
  end_date TIMESTAMP,
  is_trial_active BOOLEAN DEFAULT FALSE,
  last_payment_date TIMESTAMP,
  plan_type VARCHAR(50),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_subscription_id VARCHAR(255),
  -- Acurato columns (new provider)
  acurato_order_id VARCHAR(255),
  acurato_payment_id VARCHAR(255),
  acurato_signature VARCHAR(512),
  start_date TIMESTAMP,
  status VARCHAR(50),
  trial_end_date TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description CLOB,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  ticket_number VARCHAR(100) UNIQUE,
  admin_response CLOB,
  resolved_by BIGINT,
  resolved_at TIMESTAMP,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_by BIGINT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  sender VARCHAR(20) NOT NULL,
  sender_id BIGINT,
  message CLOB,
  created_at TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  message_id BIGINT,
  original_name VARCHAR(512),
  stored_name VARCHAR(1024),
  content_type VARCHAR(200),
  size BIGINT,
  created_at TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES ticket_messages(id)
);

-- Create simple indexes to help tests and queries
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
