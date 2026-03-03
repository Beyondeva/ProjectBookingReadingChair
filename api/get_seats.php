<?php
/**
 * get_seats.php — Fetch seats for a specific floor (optionally by zone)
 * GET /api/get_seats.php?floor_id=1[&zone_id=1]
 *
 * Also runs ghost-booking expiration before returning data.
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();

// --- Ghost Booking Cleanup (15 min timeout) ---
$db->exec("
    UPDATE bookings
       SET status = 'expired'
     WHERE status = 'reserved'
       AND reserved_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
");

// Reset seat status for expired bookings
$db->exec("
    UPDATE seats s
      JOIN bookings b ON b.seat_id = s.id
       SET s.status = 'available'
     WHERE b.status = 'expired'
       AND s.status = 'reserved'
");

// --- Params ---
$floor_id = isset($_GET['floor_id']) ? intval($_GET['floor_id']) : 0;
$zone_id = isset($_GET['zone_id']) ? intval($_GET['zone_id']) : 0;

if ($floor_id === 0) {
    jsonResponse(['success' => false, 'error' => 'floor_id is required'], 400);
}

// --- Query seats ---
if ($zone_id > 0) {
    $sql = "
        SELECT s.*, z.name AS zone_name,
               b.id AS booking_id, b.user_id AS booked_by, b.status AS booking_status,
               b.reserved_at, b.checked_in_at
          FROM seats s
          JOIN zones z ON z.id = s.zone_id
     LEFT JOIN bookings b ON b.seat_id = s.id AND b.status IN ('reserved','occupied')
         WHERE z.floor_id = ? AND z.id = ?
         ORDER BY s.seat_row, s.seat_col
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$floor_id, $zone_id]);
} else {
    $sql = "
        SELECT s.*, z.name AS zone_name,
               b.id AS booking_id, b.user_id AS booked_by, b.status AS booking_status,
               b.reserved_at, b.checked_in_at
          FROM seats s
          JOIN zones z ON z.id = s.zone_id
     LEFT JOIN bookings b ON b.seat_id = s.id AND b.status IN ('reserved','occupied')
         WHERE z.floor_id = ?
         ORDER BY z.id, s.seat_row, s.seat_col
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute([$floor_id]);
}

$seats = $stmt->fetchAll();

jsonResponse(['success' => true, 'data' => $seats]);
