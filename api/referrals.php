<?php
// ============================================
// REFERRALS API
// ============================================

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDBConnection();

// POST - Add referral
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $referralCode = sanitize($data['referralCode'] ?? '');
    $newPlayerWallet = sanitize($data['newPlayerWallet'] ?? '');
    
    if (empty($referralCode) || empty($newPlayerWallet)) {
        sendResponse(false, null, 'Missing referral code or wallet address');
    }
    
    // Decode referral code to get referrer wallet
    $referrerWallet = base64_decode($referralCode);
    
    if (!isValidWallet($referrerWallet) || !isValidWallet($newPlayerWallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    // Check if referral already exists
    $stmt = $conn->prepare("SELECT id FROM referrals WHERE referrer_address = ? AND referred_address = ?");
    $stmt->bind_param("ss", $referrerWallet, $newPlayerWallet);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse(false, null, 'Referral already exists');
    }
    
    // Add referral
    $stmt = $conn->prepare("INSERT INTO referrals (referrer_address, referred_address, referral_code, reward_tama) VALUES (?, ?, ?, 25)");
    $stmt->bind_param("sss", $referrerWallet, $newPlayerWallet, $referralCode);
    
    if ($stmt->execute()) {
        // Update referrer's referral count
        $stmt = $conn->prepare("UPDATE players SET referrals = referrals + 1 WHERE wallet_address = ?");
        $stmt->bind_param("s", $referrerWallet);
        $stmt->execute();
        
        // Update referrer's TAMA balance in leaderboard
        $stmt = $conn->prepare("UPDATE leaderboard SET tama = tama + 25 WHERE wallet_address = ?");
        $stmt->bind_param("s", $referrerWallet);
        $stmt->execute();
        
        sendResponse(true, ['message' => 'Referral added successfully', 'reward' => 25]);
    } else {
        sendResponse(false, null, 'Failed to add referral');
    }
}

// GET - Get referral stats
if ($method === 'GET') {
    $wallet = sanitize($_GET['wallet'] ?? '');
    
    if (empty($wallet) || !isValidWallet($wallet)) {
        sendResponse(false, null, 'Invalid wallet address');
    }
    
    // Get referral count
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM referrals WHERE referrer_address = ?");
    $stmt->bind_param("s", $wallet);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $referralCount = $row['count'];
    
    // Get total earnings (25 TAMA per referral)
    $totalEarnings = $referralCount * 25;
    
    // Get list of referrals
    $stmt = $conn->prepare("SELECT referred_address, created_at FROM referrals WHERE referrer_address = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->bind_param("s", $wallet);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $referrals = [];
    while ($row = $result->fetch_assoc()) {
        $referrals[] = $row;
    }
    
    sendResponse(true, [
        'referralCount' => $referralCount,
        'totalEarnings' => $totalEarnings,
        'referrals' => $referrals
    ]);
}

$conn->close();
?>

