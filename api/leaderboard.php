<?php
// ============================================
// LEADERBOARD API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get leaderboard
if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $limit = min($limit, 100); // Max 100
    
    $sql = "SELECT 
                wallet_address, 
                pet_name, 
                level, 
                xp, 
                tama,
                pet_type,
                pet_rarity,
                updated_at
            FROM leaderboard 
            ORDER BY xp DESC, level DESC 
            LIMIT ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $leaderboard = [];
    $rank = 1;
    
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            'rank' => $rank++,
            'wallet' => $row['wallet_address'],
            'petName' => $row['pet_name'],
            'level' => (int)$row['level'],
            'xp' => (int)$row['xp'],
            'tama' => (int)$row['tama'],
            'petType' => $row['pet_type'],
            'rarity' => $row['pet_rarity'],
            'lastUpdate' => $row['updated_at']
        ];
    }
    
    sendResponse(true, $leaderboard);
}

// POST - Update player score
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $wallet = sanitize($data['wallet'] ?? '');
    $petName = sanitize($data['petName'] ?? 'Unknown');
    $level = intval($data['level'] ?? 1);
    $xp = intval($data['xp'] ?? 0);
    $tama = intval($data['tama'] ?? 0);
    $petType = sanitize($data['petType'] ?? '');
    $petRarity = sanitize($data['rarity'] ?? 'common');
    
    if (!isValidWallet($wallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    // Insert or update
    $sql = "INSERT INTO leaderboard 
            (wallet_address, pet_name, level, xp, tama, pet_type, pet_rarity) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                pet_name = VALUES(pet_name),
                level = VALUES(level),
                xp = VALUES(xp),
                tama = VALUES(tama),
                pet_type = VALUES(pet_type),
                pet_rarity = VALUES(pet_rarity)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssiisss', $wallet, $petName, $level, $xp, $tama, $petType, $petRarity);
    
    if ($stmt->execute()) {
        // Get player rank
        $sql = "SELECT COUNT(*) + 1 as rank 
                FROM leaderboard 
                WHERE xp > ? OR (xp = ? AND level > ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $xp, $xp, $level);
        $stmt->execute();
        $result = $stmt->get_result();
        $rank = $result->fetch_assoc()['rank'];
        
        sendResponse(true, ['rank' => $rank, 'updated' => true]);
    } else {
        sendResponse(false, null, 'Failed to update leaderboard');
    }
}

$conn->close();
?>

