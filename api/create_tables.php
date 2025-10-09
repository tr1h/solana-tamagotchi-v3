<?php
// ============================================
// CREATE MISSING TABLES
// ============================================

require_once 'config.php';

// Force create referrals table
$conn = getDBConnection();

$sql = "CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_address VARCHAR(100) NOT NULL,
    referred_address VARCHAR(100) NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    reward_tama INT DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_referrer (referrer_address),
    INDEX idx_code (referral_code),
    UNIQUE KEY unique_referral (referrer_address, referred_address)
)";

if ($conn->query($sql) === TRUE) {
    echo "✅ Table 'referrals' created successfully!";
} else {
    echo "❌ Error creating table: " . $conn->error;
}

$conn->close();
?>





