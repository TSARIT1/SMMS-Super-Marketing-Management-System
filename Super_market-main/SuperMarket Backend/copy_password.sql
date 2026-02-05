-- Direct update of password hash
-- Copy from test123abc@test.com to weslyjohnpaulraj@gmail.com

UPDATE users dest, 
       (SELECT password_hash FROM users WHERE email = 'test123abc@test.com') src
SET dest.password_hash = src.password_hash
WHERE dest.email = 'weslyjohnpaulraj@gmail.com';

-- Verify
SELECT email, 'Password hash updated' AS status, LEFT(password_hash, 30) AS hash_preview
FROM users 
WHERE email = 'weslyjohnpaulraj@gmail.com';
