<?php
/**
 * login.php — Mock SSO Login
 * POST { "student_id": "65000001" }
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();
$body = getJsonBody();

$student_id = trim($body['student_id'] ?? '');

if ($student_id === '') {
    jsonResponse(['success' => false, 'error' => 'student_id is required'], 400);
}

$stmt = $db->prepare('SELECT id, student_id, name, faculty FROM users WHERE student_id = ?');
$stmt->execute([$student_id]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['success' => false, 'error' => 'Student ID not found. Please check your ID.'], 404);
}

// Check for active booking
$bstmt = $db->prepare("
    SELECT b.id AS booking_id, b.seat_id, b.status, b.reserved_at, b.expires_at,
           s.seat_label, z.name AS zone_name
      FROM bookings b
      JOIN seats s ON s.id = b.seat_id
      JOIN zones z ON z.id = s.zone_id
     WHERE b.user_id = ? AND b.status IN ('reserved','occupied')
     LIMIT 1
");
$bstmt->execute([$user['id']]);
$activeBooking = $bstmt->fetch();

jsonResponse([
    'success' => true,
    'user' => $user,
    'active_booking' => $activeBooking ?: null
]);
