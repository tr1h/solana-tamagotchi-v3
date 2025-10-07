<?php
// ============================================
// MySQL DATABASE CONFIG
// ============================================

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');  // Измените на ваше имя пользователя
define('DB_PASS', '');      // Измените на ваш пароль
define('DB_NAME', 'solana_tamagotchi');

// Create Connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die(json_encode([
            'success' => false,
            'error' => 'Connection failed: ' . $conn->connect_error
        ]));
    }
    
    $conn->set_charset('utf8mb4');
    return $conn;
}

// Create Database and Tables if not exists
function initDatabase() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    
    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    $conn->query($sql);
    
    $conn->select_db(DB_NAME);
    
    // Create leaderboard table
    $sql = "CREATE TABLE IF NOT EXISTS leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_address VARCHAR(100) UNIQUE NOT NULL,
        pet_name VARCHAR(100),
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        tama INT DEFAULT 0,
        pet_type VARCHAR(50),
        pet_rarity VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_xp (xp),
        INDEX idx_level (level)
    )";
    $conn->query($sql);
    
    // Create players table
    $sql = "CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_address VARCHAR(100) UNIQUE NOT NULL,
        total_clicks INT DEFAULT 0,
        total_games INT DEFAULT 0,
        referrals INT DEFAULT 0,
        is_online BOOLEAN DEFAULT 0,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wallet (wallet_address),
        INDEX idx_online (is_online)
    )";
    $conn->query($sql);
    
    // Create admin table
    $sql = "CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_address VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100),
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->query($sql);
    
    $conn->close();
}

// Initialize database on first run
initDatabase();

// Helper function to sanitize input
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Helper function to validate wallet address
function isValidWallet($wallet) {
    return preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $wallet);
}

// Response helper
function sendResponse($success, $data = null, $error = null) {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}
?>

