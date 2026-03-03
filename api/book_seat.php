<?php
/**
 * book_seat.php — Reserve a seat
 * POST { "seat_id": 1, "user_id": 1 }
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();
$body = getJsonBody();

$seat_id = intval($body['seat_id'] ?? 0);
$user_id = intval($body['user_id'] ?? 0);

if ($seat_id === 0 || $user_id === 0) {
    jsonResponse(['success' => false, 'error' => 'seat_id and user_id are required'], 400);
}

// Check if user already has an active booking
$check = $db->prepare("
    SELECT id FROM bookings
    WHERE user_id = ? AND status IN ('reserved','occupied')
    LIMIT 1
");
$check->execute([$user_id]);
if ($check->fetch()) {
    jsonResponse(['success' => false, 'error' => 'You already have an active booking. Please check in or cancel it first.'], 409);
}

// Check seat availability
$stmt = $db->prepare('SELECT status FROM seats WHERE id = ?');
$stmt->execute([$seat_id]);
$seat = $stmt->fetch();

if (!$seat) {
    jsonResponse(['success' => false, 'error' => 'Seat not found'], 404);
}
if ($seat['status'] !== 'available') {
    jsonResponse(['success' => false, 'error' => 'Seat is not available'], 409);
}

// Create booking
$expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));
$ins = $db->prepare("
    INSERT INTO bookings (seat_id, user_id, status, reserved_at, expires_at)
    VALUES (?, ?, 'reserved', NOW(), ?)
");
$ins->execute([$seat_id, $user_id, $expires]);
$booking_id = $db->lastInsertId();

// Update seat status
$db->prepare("UPDATE seats SET status = 'reserved' WHERE id = ?")->execute([$seat_id]);

jsonResponse([
    'success' => true,
    'booking_id' => (int) $booking_id,
    'expires_at' => $expires,
    'message' => 'Seat reserved! Please check in within 15 minutes.'
]);
