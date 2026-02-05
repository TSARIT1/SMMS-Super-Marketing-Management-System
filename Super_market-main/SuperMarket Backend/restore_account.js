// Restore User Account Script
// Run this with: node restore_account.js

const axios = require('axios');

const userData = {
  fullName: "Wesly John Paul Raj",
  email: "weslyjohnpaulraj@gmail.com",
  phone: "9876543210",
  password: "yourpassword123",
  shopName: "My Super Market",
  shopAddress: "Chennai, Tamil Nadu"
};

async function restoreAccount() {
  try {
    console.log("🔄 Restoring your account: weslyjohnpaulraj@gmail.com");
    
    const response = await axios.post('http://localhost:8080/api/register', userData);
    
    console.log("✅ Account restored successfully!");
    console.log("📧 Email:", userData.email);
    console.log("🔑 Password:", userData.password);
    console.log("\n👉 You can now login with these credentials!");
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log("✅ Account already exists!");
      console.log("📧 Email:", userData.email);
      console.log("🔑 Password:", userData.password);
      console.log("\n👉 Try logging in now!");
    } else {
      console.error("❌ Error:", error.response?.data?.message || error.message);
    }
  }
}

restoreAccount();
