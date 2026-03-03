<?php
/**
 * db_connect.php — Database connection + helpers
 * Supports: Railway MYSQL_PUBLIC_URL, individual env vars, and localhost
 */

/* ── CORS ────────────────────────────────────── */
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];
if (getenv('FRONTEND_URL')) {
    $allowed_origins[] = rtrim(getenv('FRONTEND_URL'), '/');
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else if (getenv('FRONTEND_URL')) {
    header("Access-Control-Allow-Origin: " . rtrim(getenv('FRONTEND_URL'), '/'));
} else {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/* ── Database Connection ─────────────────────── */
function getDB()
{
    // Option 1: Parse MYSQL_PUBLIC_URL or MYSQL_URL (Railway connection string)
    $url = getenv('MYSQL_PUBLIC_URL') ?: getenv('MYSQL_URL') ?: '';

    if ($url) {
        $parsed = parse_url($url);
        $host = $parsed['host'];
        $port = $parsed['port'] ?? 3306;
        $user = $parsed['user'];
        $pass = $parsed['pass'] ?? '';
        $db = ltrim($parsed['path'], '/');
    } else {
        // Option 2: Individual env vars (Railway reference vars or localhost)
        $host = getenv('MYSQLHOST') ?: 'localhost';
        $port = getenv('MYSQLPORT') ?: '3306';
        $db = getenv('MYSQLDATABASE') ?: 'nuseatfinder';
        $user = getenv('MYSQLUSER') ?: 'root';
        $pass = getenv('MYSQLPASSWORD') ?: '12345678a';
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

/* ── Helpers ──────────────────────────────────── */
function jsonResponse($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody()
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
