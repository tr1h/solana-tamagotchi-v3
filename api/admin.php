<?php
// ============================================
// ADMIN API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// Check if admin
function isAdmin($wallet, $conn) {
    $sql = "SELECT id FROM admins WHERE wallet_address = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $wallet);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->num_rows > 0;
}

// POST - Check admin status
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'check') {
    $data = json_decode(file_get_contents('php://input'), true);
    $wallet = sanitize($data['wallet'] ?? '');
    
    if (!isValidWallet($wallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    $isAdminUser = isAdmin($wallet, $conn);
    sendResponse(true, ['isAdmin' => $isAdminUser]);
}

// GET - Get admin stats (admin only)
if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'stats') {
    $wallet = sanitize($_GET['wallet'] ?? '');
    
    if (!isAdmin($wallet, $conn)) {
        sendResponse(false, null, 'Unauthorized');
    }
    
    // Get stats
    $stats = [];
    
    // Total players
    $result = $conn->query("SELECT COUNT(*) as count FROM leaderboard");
    $stats['totalPlayers'] = $result->fetch_assoc()['count'];
    
    // Online players
    $conn->query("UPDATE players SET is_online = 0 WHERE last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
    $result = $conn->query("SELECT COUNT(*) as count FROM players WHERE is_online = 1");
    $stats['onlinePlayers'] = $result->fetch_assoc()['count'];
    
    // Total XP
    $result = $conn->query("SELECT SUM(xp) as total FROM leaderboard");
    $stats['totalXP'] = $result->fetch_assoc()['total'] ?? 0;
    
    // Total TAMA
    $result = $conn->query("SELECT SUM(tama) as total FROM leaderboard");
    $stats['totalTAMA'] = $result->fetch_assoc()['total'] ?? 0;
    
    // Top pet type
    $result = $conn->query("SELECT pet_type, COUNT(*) as count FROM leaderboard GROUP BY pet_type ORDER BY count DESC LIMIT 1");
    $topPet = $result->fetch_assoc();
    $stats['topPetType'] = $topPet['pet_type'] ?? 'Unknown';
    
    sendResponse(true, $stats);
}

// POST - Add admin (admin only)
if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $requesterWallet = sanitize($data['requester'] ?? '');
    $newAdminWallet = sanitize($data['newAdmin'] ?? '');
    $name = sanitize($data['name'] ?? 'Admin');
    
    if (!isAdmin($requesterWallet, $conn)) {
        sendResponse(false, null, 'Unauthorized');
    }
    
    if (!isValidWallet($newAdminWallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    $sql = "INSERT INTO admins (wallet_address, name, permissions) 
            VALUES (?, ?, 'all')
            ON DUPLICATE KEY UPDATE name = VALUES(name)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $newAdminWallet, $name);
    
    if ($stmt->execute()) {
        sendResponse(true, ['added' => true]);
    } else {
        sendResponse(false, null, 'Failed to add admin');
    }
}

// DELETE - Remove admin (admin only)
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $requesterWallet = sanitize($data['requester'] ?? '');
    $removeWallet = sanitize($data['remove'] ?? '');
    
    if (!isAdmin($requesterWallet, $conn)) {
        sendResponse(false, null, 'Unauthorized');
    }
    
    $sql = "DELETE FROM admins WHERE wallet_address = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $removeWallet);
    
    if ($stmt->execute()) {
        sendResponse(true, ['removed' => true]);
    } else {
        sendResponse(false, null, 'Failed to remove admin');
    }
}

$conn->close();
?>







