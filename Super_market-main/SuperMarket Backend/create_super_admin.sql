-- Create default super admin user
-- Run this SQL in MySQL Workbench Query window

USE supermarket;

-- First, check if admin user already exists
SELECT * FROM users WHERE email = 'admin@supermart.com';

-- If not exists, insert super admin user
-- Email: admin@supermart.com
-- Password: admin123
-- Role: SUPER_ADMIN
INSERT INTO users (full_name, email, password_hash, shop_name, phone, shop_address, role) 
VALUES ('Super Admin', 'admin@supermart.com', 'admin123', 'TSAR-IT Admin', '+91 98765 43210', 'Chennai, India', 'SUPER_ADMIN');

-- Verify the super admin was created
SELECT id, full_name, email, shop_name, role FROM users WHERE role = 'SUPER_ADMIN';

-- If you want to promote an existing user to SUPER_ADMIN:
-- UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'youremail@example.com';
