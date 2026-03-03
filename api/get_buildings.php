<?php
/**
 * get_buildings.php — Fetch all buildings with their floors
 * GET /api/get_buildings.php
 */
require_once __DIR__ . '/db_connect.php';

$db = getDB();

// Fetch buildings
$buildings = $db->query('SELECT * FROM buildings ORDER BY id')->fetchAll();

// Attach floors to each building
foreach ($buildings as &$b) {
    $stmt = $db->prepare('SELECT * FROM floors WHERE building_id = ? ORDER BY floor_number');
    $stmt->execute([$b['id']]);
    $b['floors'] = $stmt->fetchAll();

    // Attach zones to each floor
    foreach ($b['floors'] as &$f) {
        $zstmt = $db->prepare('SELECT * FROM zones WHERE floor_id = ? ORDER BY id');
        $zstmt->execute([$f['id']]);
        $f['zones'] = $zstmt->fetchAll();
    }
}

jsonResponse(['success' => true, 'data' => $buildings]);
