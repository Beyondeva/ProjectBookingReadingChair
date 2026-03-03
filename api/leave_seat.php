<?php
/**
 * leave_seat.php — End session / leave seat
 * POST { "booking_id": 1 }
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();
$body = getJsonBody();

$booking_id = intval($body['booking_id'] ?? 0);

if ($booking_id === 0) {
    jsonResponse(['success' => false, 'error' => 'booking_id is required'], 400);
}

$stmt = $db->prepare('SELECT * FROM bookings WHERE id = ?');
$stmt->execute([$booking_id]);
$booking = $stmt->fetch();

if (!$booking) {
    jsonResponse(['success' => false, 'error' => 'Booking not found'], 404);
}

if (!in_array($booking['status'], ['reserved', 'occupied'])) {
    jsonResponse(['success' => false, 'error' => 'No active booking to cancel'], 409);
}

$newStatus = $booking['status'] === 'occupied' ? 'completed' : 'cancelled';

$db->prepare("UPDATE bookings SET status = ? WHERE id = ?")->execute([$newStatus, $booking_id]);
$db->prepare("UPDATE seats SET status = 'available' WHERE id = ?")->execute([$booking['seat_id']]);

jsonResponse([
    'success' => true,
    'message' => $newStatus === 'completed'
        ? 'Session ended. Thank you for using NU SeatFinder!'
        : 'Reservation cancelled.'
]);
