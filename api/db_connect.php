<?php
/**
 * db_connect.php — Database connection + helpers
 * Supports both localhost (AppServ) and Railway deployment
 */

/* ── CORS ────────────────────────────────────── */
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

// Allow Railway frontend domain via env var
if (getenv('FRONTEND_URL')) {
    $allowed_origins[] = rtrim(getenv('FRONTEND_URL'), '/');
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else if (getenv('FRONTEND_URL')) {
    header("Access-Control-Allow-Origin: " . rtrim(getenv('FRONTEND_URL'), '/'));
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
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
    // Railway provides these env vars automatically when MySQL is added
    $host = getenv('MYSQLHOST') ?: getenv('DB_HOST') ?: 'localhost';
    $port = getenv('MYSQLPORT') ?: getenv('DB_PORT') ?: '3306';
    $db = getenv('MYSQLDATABASE') ?: getenv('DB_NAME') ?: 'nuseatfinder';
    $user = getenv('MYSQLUSER') ?: getenv('DB_USER') ?: 'root';
    $pass = getenv('MYSQLPASSWORD') ?: getenv('DB_PASS') ?: '12345678a';

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
