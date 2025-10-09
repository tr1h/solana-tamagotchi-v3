<?php
// ============================================
// REWARD REFERRERS ON ACTIVITY
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDBConnection();

// POST - Reward referrers when user earns TAMA
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $playerWallet = sanitize($data['wallet'] ?? '');
    $tamaEarned = intval($data['tama'] ?? 0);
    
    if (empty($playerWallet) || $tamaEarned <= 0) {
        sendResponse(false, null, 'Invalid data');
    }
    
    $rewards = [];
    
    // Find Level 1 referrer (10% reward)
    $stmt = $conn->prepare("SELECT referrer_address FROM referrals WHERE referred_address = ? AND level = 1 LIMIT 1");
    $stmt->bind_param("s", $playerWallet);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $level1Referrer = $row['referrer_address'];
        $level1Reward = floor($tamaEarned * 0.10); // 10%
        
        // Update Level 1 referrer
        $stmt = $conn->prepare("UPDATE leaderboard SET tama = tama + ? WHERE wallet_address = ?");
        $stmt->bind_param("is", $level1Reward, $level1Referrer);
        $stmt->execute();
        
        // Update total earned
        $stmt = $conn->prepare("UPDATE referrals SET total_earned = total_earned + ? WHERE referrer_address = ? AND referred_address = ?");
        $stmt->bind_param("iss", $level1Reward, $level1Referrer, $playerWallet);
        $stmt->execute();
        
        $rewards['level1'] = ['wallet' => $level1Referrer, 'reward' => $level1Reward];
        
        // Find Level 2 referrer (5% reward)
        $stmt = $conn->prepare("SELECT referrer_address FROM referrals WHERE referred_address = ? AND level = 1 LIMIT 1");
        $stmt->bind_param("s", $level1Referrer);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row2 = $result->fetch_assoc()) {
            $level2Referrer = $row2['referrer_address'];
            $level2Reward = floor($tamaEarned * 0.05); // 5%
            
            // Update Level 2 referrer
            $stmt = $conn->prepare("UPDATE leaderboard SET tama = tama + ? WHERE wallet_address = ?");
            $stmt->bind_param("is", $level2Reward, $level2Referrer);
            $stmt->execute();
            
            // Update total earned
            $stmt = $conn->prepare("UPDATE referrals SET total_earned = total_earned + ? WHERE referrer_address = ? AND referred_address = ?");
            $stmt->bind_param("iss", $level2Reward, $level2Referrer, $playerWallet);
            $stmt->execute();
            
            $rewards['level2'] = ['wallet' => $level2Referrer, 'reward' => $level2Reward];
        }
    }
    
    sendResponse(true, ['rewards' => $rewards, 'total_distributed' => array_sum(array_column($rewards, 'reward'))]);
}

$conn->close();
?>






