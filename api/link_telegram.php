<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

function sendResponse($success, $data = []) {
    echo json_encode(['success' => $success, 'data' => $data]);
    exit();
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'link') {
    // Link wallet to Telegram user
    $walletAddress = $data['wallet_address'] ?? '';
    $telegramId = $data['telegram_id'] ?? '';
    $telegramUsername = $data['telegram_username'] ?? '';
    
    if (empty($walletAddress) || empty($telegramId)) {
        sendResponse(false, ['message' => 'Missing wallet address or Telegram ID']);
    }
    
    // Update or insert link
    $stmt = $conn->prepare("INSERT INTO leaderboard (wallet_address, telegram_id, telegram_username) 
                           VALUES (?, ?, ?) 
                           ON DUPLICATE KEY UPDATE 
                           telegram_id = VALUES(telegram_id),
                           telegram_username = VALUES(telegram_username)");
    $stmt->bind_param("sss", $walletAddress, $telegramId, $telegramUsername);
    
    if ($stmt->execute()) {
        sendResponse(true, [
            'message' => 'Telegram account linked successfully',
            'wallet' => $walletAddress,
            'telegram_id' => $telegramId
        ]);
    } else {
        sendResponse(false, ['message' => 'Failed to link account']);
    }
    
} elseif ($action === 'get_wallet') {
    // Get wallet by Telegram ID
    $telegramId = $data['telegram_id'] ?? '';
    
    if (empty($telegramId)) {
        sendResponse(false, ['message' => 'Missing Telegram ID']);
    }
    
    $stmt = $conn->prepare("SELECT wallet_address, pet_name, level, xp, tama FROM leaderboard WHERE telegram_id = ?");
    $stmt->bind_param("s", $telegramId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        sendResponse(true, [
            'wallet_address' => $row['wallet_address'],
            'pet_name' => $row['pet_name'],
            'level' => $row['level'],
            'xp' => $row['xp'],
            'tama' => $row['tama']
        ]);
    } else {
        sendResponse(false, ['message' => 'No wallet linked to this Telegram account']);
    }
    
} elseif ($action === 'get_telegram') {
    // Get Telegram ID by wallet
    $walletAddress = $data['wallet_address'] ?? '';
    
    if (empty($walletAddress)) {
        sendResponse(false, ['message' => 'Missing wallet address']);
    }
    
    $stmt = $conn->prepare("SELECT telegram_id, telegram_username FROM leaderboard WHERE wallet_address = ?");
    $stmt->bind_param("s", $walletAddress);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        sendResponse(true, [
            'telegram_id' => $row['telegram_id'],
            'telegram_username' => $row['telegram_username']
        ]);
    } else {
        sendResponse(false, ['message' => 'No Telegram account linked to this wallet']);
    }
} else {
    sendResponse(false, ['message' => 'Invalid action']);
}

$conn->close();
?>




