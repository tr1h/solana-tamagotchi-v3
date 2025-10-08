<?php
// ============================================
// PLAYERS API - Online Counter
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// POST - Update player status (online/offline)
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $wallet = sanitize($data['wallet'] ?? '');
    $action = sanitize($data['action'] ?? 'ping'); // ping, connect, disconnect
    
    if (!isValidWallet($wallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    if ($action === 'connect' || $action === 'ping') {
        // Insert or update player as online
        $sql = "INSERT INTO players (wallet_address, is_online, last_active) 
                VALUES (?, 1, NOW())
                ON DUPLICATE KEY UPDATE 
                    is_online = 1, 
                    last_active = NOW()";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $wallet);
        $stmt->execute();
    } else if ($action === 'disconnect') {
        // Set player as offline
        $sql = "UPDATE players SET is_online = 0 WHERE wallet_address = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $wallet);
        $stmt->execute();
    }
    
    // Clean up old players (inactive > 5 minutes = offline)
    $sql = "UPDATE players SET is_online = 0 
            WHERE last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
    $conn->query($sql);
    
    // Get online count
    $result = $conn->query("SELECT COUNT(*) as count FROM players WHERE is_online = 1");
    $onlineCount = $result->fetch_assoc()['count'];
    
    sendResponse(true, ['online' => (int)$onlineCount]);
}

// GET - Get online count
if ($method === 'GET') {
    // Clean up old players first
    $sql = "UPDATE players SET is_online = 0 
            WHERE last_active < DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
    $conn->query($sql);
    
    // Get online count
    $result = $conn->query("SELECT COUNT(*) as count FROM players WHERE is_online = 1");
    $onlineCount = $result->fetch_assoc()['count'];
    
    sendResponse(true, ['online' => (int)$onlineCount]);
}

$conn->close();
?>




