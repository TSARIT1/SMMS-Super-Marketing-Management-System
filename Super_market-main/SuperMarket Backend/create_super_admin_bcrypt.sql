-- Create Super Admin with BCrypt hashed password
-- Password: admin123
-- BCrypt Hash: $2a$10$XELiYo4iJVH4WN5SBVMwpONX7Z5sTj7W.3Fk8SU7CJD6V6xsB6KFS

-- First, check if super admin already exists
DELETE FROM users WHERE email = 'superadmin@supermart.com';

-- Insert super admin with hashed password
INSERT INTO users (full_name, email, phone, password_hash, shop_name, shop_address, role, created_at, updated_at) 
VALUES (
    'Super Administrator',
    'superadmin@supermart.com',
    '9999999999',
    '$2a$10$XELiYo4iJVH4WN5SBVMwpONX7Z5sTj7W.3Fk8SU7CJD6V6xsB6KFS',
    'SuperMart HQ',
    'Mumbai, Maharashtra, India',
    'SUPER_ADMIN',
    NOW(),
    NOW()
);

-- Verify super admin was created
SELECT id, full_name, email, role FROM users WHERE email = 'superadmin@supermart.com';

-- Login Credentials:
-- Email: superadmin@supermart.com
-- Password: admin123
