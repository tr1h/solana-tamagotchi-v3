<?php
require_once 'config.php';

$conn = getDBConnection();

// Add pet_data column to leaderboard
$sql = "ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS pet_data TEXT AFTER pet_rarity";

if ($conn->query($sql) === TRUE) {
    echo "✅ Column 'pet_data' added successfully!";
} else {
    echo "❌ Error: " . $conn->error;
}

$conn->close();
?>








