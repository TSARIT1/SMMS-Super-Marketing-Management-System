-- Update password for weslyjohnpaulraj@gmail.com to 123abc
-- This uses BCrypt hash for password '123abc'

UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye4JdFl3RXvzQP5o2eIlEKyW4xqF8HHry'
WHERE email = 'weslyjohnpaulraj@gmail.com';

-- Verify the update
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
WHERE email = 'weslyjohnpaulraj@gmail.com';

-- Note: The password '123abc' is now set
-- You can login with: weslyjohnpaulraj@gmail.com / 123abc
