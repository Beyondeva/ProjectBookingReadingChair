<?php
/**
 * cancel_expired.php — Batch cleanup: expire ghost bookings
 * GET /api/cancel_expired.php
 *
 * Can be called on a cron or manually for demo purposes.
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();

// Expire ghost bookings older than 15 minutes
$result = $db->exec("
    UPDATE bookings
       SET status = 'expired'
     WHERE status = 'reserved'
       AND reserved_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
");

// Reset seats linked to those expired bookings
$db->exec("
    UPDATE seats s
      JOIN bookings b ON b.seat_id = s.id
       SET s.status = 'available'
     WHERE b.status = 'expired'
       AND s.status != 'available'
");

jsonResponse([
    'success' => true,
    'expired' => (int) $result,
    'message' => "Ghost booking cleanup complete."
]);
