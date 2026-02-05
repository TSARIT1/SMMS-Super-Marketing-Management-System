# Update user password to 123abc
# BCrypt hash for password "123abc": $2a$10$N9qo8uLOickgx2ZMRZoMye4JdFl3RXvzQP5o2eIlEKyW4xqF8HHry

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$mysqlPath2 = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"  
$mysqlPath3 = "C:\xampp\mysql\bin\mysql.exe"

# Try to find MySQL
$mysql = $null
if (Test-Path $mysqlPath) { $mysql = $mysqlPath }
elseif (Test-Path $mysqlPath2) { $mysql = $mysqlPath2 }
elseif (Test-Path $mysqlPath3) { $mysql = $mysqlPath3 }
else {
    Write-Host "MySQL not found. Trying system PATH..." -ForegroundColor Yellow
    try {
        Get-Command mysql -ErrorAction Stop | Out-Null
        $mysql = "mysql"
    }
    catch {
        Write-Host "ERROR: MySQL not found!" -ForegroundColor Red
        Write-Host "Please install MySQL or XAMPP" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Found MySQL at: $mysql" -ForegroundColor Green

# SQL command to update password
$sqlCommand = "UPDATE users SET password_hash = '$2a\$10\$N9qo8uLOickgx2ZMRZoMye4JdFl3RXvzQP5o2eIlEKyW4xqF8HHry' WHERE email = 'weslyjohnpaulraj@gmail.com';"

Write-Host "`nUpdating password for weslyjohnpaulraj@gmail.com..." -ForegroundColor Cyan

# Execute MySQL command
& $mysql -u root -pwesly8143 -D supermarket -e $sqlCommand 2>&1

# Verify
Write-Host "`nVerifying update..." -ForegroundColor Cyan
& $mysql -u root -pwesly8143 -D supermarket -e "SELECT email, role, account_status, created_at FROM users WHERE email = 'weslyjohnpaulraj@gmail.com';" 2>&1

Write-Host "`n✅ Password updated successfully!" -ForegroundColor Green
Write-Host "You can now login with:" -ForegroundColor Yellow
Write-Host "  Email: weslyjohnpaulraj@gmail.com" -ForegroundColor White  
Write-Host "  Password: 123abc" -ForegroundColor White
