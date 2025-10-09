<?php
require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $wallet = sanitize($data['wallet'] ?? '');
    $pet = json_encode($data['pet'] ?? []);
    
    $sql = "INSERT INTO leaderboard (wallet_address, pet_data) VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE pet_data = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $wallet, $pet, $pet);
    $stmt->execute();
    
    sendResponse(true, ['message' => 'Pet saved']);
}

if ($method === 'GET') {
    $wallet = sanitize($_GET['wallet'] ?? '');
    
    $sql = "SELECT pet_data FROM leaderboard WHERE wallet_address = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $wallet);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        sendResponse(true, ['pet' => json_decode($row['pet_data'], true)]);
    } else {
        sendResponse(false, null, 'No pet found');
    }
}
?>







