<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'solana_tamagotchi';

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Add telegram_id and telegram_username columns to leaderboard table
$sql = "ALTER TABLE leaderboard 
        ADD COLUMN telegram_id VARCHAR(100),
        ADD COLUMN telegram_username VARCHAR(100),
        ADD INDEX idx_telegram_id (telegram_id)";

if ($conn->query($sql) === TRUE) {
    echo "✅ Telegram columns added successfully!\n";
} else {
    if (strpos($conn->error, 'Duplicate column name') !== false) {
        echo "✅ Telegram columns already exist!\n";
    } else {
        echo "❌ Error: " . $conn->error . "\n";
    }
}

$conn->close();
?>

