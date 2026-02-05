-- Create Super Admin with BCrypt hashed password
-- Password: admin123
-- BCrypt Hash: $2a$10$XELiYo4iJVH4WN5SBVMwpONX7Z5sTj7W.3Fk8SU7CJD6V6xsB6KFS

-- Only seed if the users table exists (schema is created by the app)
SET @db := IFNULL(DATABASE(), 'supermarket');
SELECT COUNT(*) INTO @users_exists
FROM information_schema.tables
WHERE table_schema = @db AND table_name = 'users';

SET @sql := IF(
    @users_exists > 0,
    'DELETE FROM users WHERE email = ''superadmin@supermart.com'';',
    'SELECT ''users table not found; skipping super admin seed'' AS message;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @users_exists > 0,
    CONCAT(
        'INSERT INTO users (full_name, email, phone, password_hash, shop_name, shop_address, role, created_at, updated_at) VALUES (',
        '''Super Administrator'',''superadmin@supermart.com'',''9999999999'',''',
        '$2a$10$XELiYo4iJVH4WN5SBVMwpONX7Z5sTj7W.3Fk8SU7CJD6V6xsB6KFS',
        ''',''SuperMart HQ'',''Mumbai, Maharashtra, India'',''SUPER_ADMIN'',NOW(),NOW());'
    ),
    'SELECT ''users table not found; skipping super admin insert'' AS message;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
    @users_exists > 0,
    'SELECT id, full_name, email, role FROM users WHERE email = ''superadmin@supermart.com'';',
    'SELECT ''users table not found; skipping verification'' AS message;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Login Credentials:
-- Email: superadmin@supermart.com
-- Password: admin123
