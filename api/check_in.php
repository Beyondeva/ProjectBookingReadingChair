<?php
/**
 * check_in.php — QR Check-in: change booking from 'reserved' → 'occupied'
 * POST { "booking_id": 1 }
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();
$body = getJsonBody();

$booking_id = intval($body['booking_id'] ?? 0);

if ($booking_id === 0) {
    jsonResponse(['success' => false, 'error' => 'booking_id is required'], 400);
}

// Fetch booking
$stmt = $db->prepare('SELECT * FROM bookings WHERE id = ?');
$stmt->execute([$booking_id]);
$booking = $stmt->fetch();

if (!$booking) {
    jsonResponse(['success' => false, 'error' => 'Booking not found'], 404);
}

if ($booking['status'] !== 'reserved') {
    jsonResponse(['success' => false, 'error' => 'Booking is not in reserved state (current: ' . $booking['status'] . ')'], 409);
}

// Check if expired (15 min)
$reserved = strtotime($booking['reserved_at']);
if (time() - $reserved > 900) {
    // Mark expired
    $db->prepare("UPDATE bookings SET status = 'expired' WHERE id = ?")->execute([$booking_id]);
    $db->prepare("UPDATE seats SET status = 'available' WHERE id = ?")->execute([$booking['seat_id']]);
    jsonResponse(['success' => false, 'error' => 'Booking has expired (exceeded 15 minutes). Please book again.'], 410);
}

// Perform check-in
$db->prepare("
    UPDATE bookings SET status = 'occupied', checked_in_at = NOW() WHERE id = ?
")->execute([$booking_id]);

$db->prepare("UPDATE seats SET status = 'occupied' WHERE id = ?")->execute([$booking['seat_id']]);

jsonResponse([
    'success' => true,
    'message' => 'Check-in successful! Enjoy your study session.'
]);
