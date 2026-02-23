-- ============================================
-- High Performance Database Indexes for 10M Users
-- Optimized for 60ms response time
-- ============================================

-- Users Table Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status);

-- Profiles Table Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_business_name ON profiles(business_name);
CREATE INDEX IF NOT EXISTS idx_profiles_gstin ON profiles(gstin);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_subscription ON profiles(user_id, subscription_status);

-- Products Table Indexes
CREATE INDEX IF NOT EXISTS idx_products_profile_id ON products(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_profile_status ON products(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_products_profile_category ON products(profile_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- Categories Table Indexes
CREATE INDEX IF NOT EXISTS idx_categories_profile_id ON categories(profile_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_profile_parent ON categories(profile_id, parent_id);

-- Orders Table Indexes
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total);
CREATE INDEX IF NOT EXISTS idx_orders_profile_status ON orders(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_profile_created ON orders(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at);

-- Order Items Table Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);

-- Inventory Table Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_profile_id ON inventory(profile_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_profile_product ON inventory(profile_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(profile_id, quantity) WHERE quantity < 10;

-- Subscriptions Table Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring ON subscriptions(end_date) WHERE status = 'ACTIVE';

-- Payments Table Indexes
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);

-- Discounts Table Indexes
CREATE INDEX IF NOT EXISTS idx_discounts_profile_id ON discounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_status ON discounts(status);
CREATE INDEX IF NOT EXISTS idx_discounts_start_date ON discounts(start_date);
CREATE INDEX IF NOT EXISTS idx_discounts_end_date ON discounts(end_date);
CREATE INDEX IF NOT EXISTS idx_discounts_profile_status ON discounts(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_discounts_valid ON discounts(profile_id, start_date, end_date) WHERE status = 'ACTIVE';

-- Support Tickets Table Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_profile_id ON support_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON support_tickets(user_id, status);

-- Audit Logs Table Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Sessions Table Indexes (if using database sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);

-- Refresh Tokens Table Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- Full-text Search Indexes
CREATE INDEX IF NOT EXISTS idx_products_fulltext ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_categories_fulltext ON categories USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_orders_dashboard ON orders(profile_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_dashboard ON inventory(profile_id, quantity, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(profile_id, status, category_id, name);

-- Partial Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_active_users ON users(created_at) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_active_products ON products(profile_id, category_id) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_pending_orders ON orders(profile_id, created_at) WHERE status IN ('PENDING', 'PROCESSING');
CREATE INDEX IF NOT EXISTS idx_low_inventory ON inventory(profile_id, product_id, quantity) WHERE quantity < 10;

-- Covering Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_products_list ON products(profile_id, status) INCLUDE (id, name, sku, price, quantity);
CREATE INDEX IF NOT EXISTS idx_orders_list ON orders(profile_id, created_at DESC) INCLUDE (id, status, total, user_id);

-- ============================================
-- ULTRA-FAST BILLING INDEXES (60ms target)
-- ============================================

-- Order creation optimization
CREATE INDEX IF NOT EXISTS idx_orders_user_id_desc ON orders(user_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Product batch fetch optimization for billing
CREATE INDEX IF NOT EXISTS idx_products_id_batch ON products(id) INCLUDE (id, name, price, quantity, sold, net_rate);

-- Order items batch operations
CREATE INDEX IF NOT EXISTS idx_order_items_product_include ON order_items(product_id) INCLUDE (order_id, quantity, price);

-- Payment creation optimization
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- ============================================
-- Analyze Tables for Query Optimization
-- ============================================
ANALYZE users;
ANALYZE profiles;
ANALYZE products;
ANALYZE categories;
ANALYZE orders;
ANALYZE order_items;
ANALYZE inventory;
ANALYZE subscriptions;
ANALYZE payments;
ANALYZE discounts;
ANALYZE support_tickets;
ANALYZE audit_logs;