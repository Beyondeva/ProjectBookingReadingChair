<?php
/**
 * register.php — Register a new user
 * POST { "student_id": "65000099", "name": "John Doe" }
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();
$body = getJsonBody();

$student_id = trim($body['student_id'] ?? '');
$name = trim($body['name'] ?? '');

if ($student_id === '' || $name === '') {
    jsonResponse(['success' => false, 'error' => 'student_id and name are required'], 400);
}

// Check if student_id already exists
$check = $db->prepare('SELECT id FROM users WHERE student_id = ?');
$check->execute([$student_id]);
if ($check->fetch()) {
    jsonResponse(['success' => false, 'error' => 'This Student ID is already registered.'], 409);
}

// Insert new user
$stmt = $db->prepare('INSERT INTO users (student_id, name) VALUES (?, ?)');
$stmt->execute([$student_id, $name]);

$userId = $db->lastInsertId();

jsonResponse([
    'success' => true,
    'user' => [
        'id' => (int) $userId,
        'student_id' => $student_id,
        'name' => $name,
        'faculty' => null,
    ],
    'message' => 'Registration successful!'
]);
