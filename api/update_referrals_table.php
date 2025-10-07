<?php
// ============================================
// UPDATE REFERRALS TABLE STRUCTURE
// ============================================

require_once 'config.php';

$conn = getDBConnection();

// Add new columns to existing referrals table
$alterations = [
    "ALTER TABLE referrals ADD COLUMN IF NOT EXISTS level INT DEFAULT 1",
    "ALTER TABLE referrals ADD COLUMN IF NOT EXISTS signup_reward INT DEFAULT 25", 
    "ALTER TABLE referrals ADD COLUMN IF NOT EXISTS total_earned INT DEFAULT 0",
    "ALTER TABLE referrals ADD INDEX IF NOT EXISTS idx_referred (referred_address)"
];

$success = true;
$messages = [];

foreach ($alterations as $sql) {
    if ($conn->query($sql) === TRUE) {
        $messages[] = "✅ " . $sql;
    } else {
        $messages[] = "❌ Error: " . $conn->error;
        $success = false;
    }
}

echo "<h2>Referrals Table Update</h2>";
echo "<pre>";
foreach ($messages as $msg) {
    echo $msg . "\n";
}
echo "</pre>";

if ($success) {
    echo "<h3>✅ Table updated successfully!</h3>";
    echo "<p>New structure supports:</p>";
    echo "<ul>";
    echo "<li>Multi-level referrals (level 1 & 2)</li>";
    echo "<li>Signup rewards tracking</li>";
    echo "<li>Total earned tracking</li>";
    echo "<li>Better indexing</li>";
    echo "</ul>";
} else {
    echo "<h3>❌ Some errors occurred</h3>";
}

$conn->close();
?>
