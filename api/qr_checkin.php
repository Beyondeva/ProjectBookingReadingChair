<?php
/**
 * qr_checkin.php — Handle QR code scan check-in via GET request
 * 
 * This endpoint is accessed by scanning a QR code with a phone.
 * URL: http://<server-ip>/PJBOOKING/api/qr_checkin.php?token=<booking_id>
 * 
 * Returns a simple HTML page showing success or error.
 */
require_once __DIR__ . '/db_connect.php';

// Override JSON content type — this returns HTML for the phone browser
header('Content-Type: text/html; charset=utf-8');

$booking_id = intval($_GET['token'] ?? 0);

// Build response HTML
function renderPage($title, $icon, $message, $color, $detail = '')
{
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . htmlspecialchars($title) . ' — NU SeatFinder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Inter", system-ui, sans-serif;
            background: linear-gradient(135deg, #0b0f1a, #1e1b4b);
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .card {
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 3rem 2rem;
            text-align: center;
            max-width: 380px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; font-weight: 800; color: ' . $color . '; margin-bottom: 0.5rem; }
        p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
        .detail { margin-top: 1rem; font-size: 0.8rem; color: #64748b; }
        .brand {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.08);
            font-size: 0.8rem;
            color: #64748b;
        }
        .brand strong {
            background: linear-gradient(135deg, #818cf8, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">' . $icon . '</div>
        <h1>' . htmlspecialchars($title) . '</h1>
        <p>' . $message . '</p>
        ' . ($detail ? '<p class="detail">' . htmlspecialchars($detail) . '</p>' : '') . '
        <div class="brand">🪑 Powered by <strong>NU SeatFinder</strong></div>
    </div>
</body>
</html>';
    exit;
}

// Validate
if ($booking_id === 0) {
    renderPage('Invalid QR Code', '❌', 'This QR code is invalid or has expired.', '#ef4444');
}

$db = getDB();

// Fetch booking
$stmt = $db->prepare('SELECT b.*, s.seat_label, z.name AS zone_name FROM bookings b JOIN seats s ON s.id = b.seat_id JOIN zones z ON z.id = s.zone_id WHERE b.id = ?');
$stmt->execute([$booking_id]);
$booking = $stmt->fetch();

if (!$booking) {
    renderPage('Booking Not Found', '🔍', 'No booking found for this QR code.', '#ef4444');
}

if ($booking['status'] === 'occupied') {
    renderPage(
        'Already Checked In',
        '✅',
        'Seat <strong>' . htmlspecialchars($booking['seat_label']) . '</strong> is already checked in.<br>' . htmlspecialchars($booking['zone_name']),
        '#22c55e',
        'Checked in at: ' . $booking['checked_in_at']
    );
}

if ($booking['status'] !== 'reserved') {
    renderPage(
        'Booking Inactive',
        '⚠️',
        'This booking is no longer active.<br>Status: <strong>' . htmlspecialchars($booking['status']) . '</strong>',
        '#f59e0b'
    );
}

// Check expiry (15 min)
$reserved = strtotime($booking['reserved_at']);
if (time() - $reserved > 900) {
    $db->prepare("UPDATE bookings SET status = 'expired' WHERE id = ?")->execute([$booking_id]);
    $db->prepare("UPDATE seats SET status = 'available' WHERE id = ?")->execute([$booking['seat_id']]);
    renderPage(
        'Booking Expired',
        '⏰',
        'This reservation has expired (exceeded 15 minutes).<br>Please book again.',
        '#f59e0b'
    );
}

// ✅ Perform check-in!
$db->prepare("UPDATE bookings SET status = 'occupied', checked_in_at = NOW() WHERE id = ?")->execute([$booking_id]);
$db->prepare("UPDATE seats SET status = 'occupied' WHERE id = ?")->execute([$booking['seat_id']]);

renderPage(
    'Check-In Successful! 🎉',
    '✅',
    'Seat <strong>' . htmlspecialchars($booking['seat_label']) . '</strong> confirmed!<br>' . htmlspecialchars($booking['zone_name']) . '<br><br>Enjoy your study session! 📚',
    '#22c55e'
);
