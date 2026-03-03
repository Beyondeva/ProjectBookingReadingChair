<?php
/**
 * setup_db.php — Initialize database schema and seed data
 * Access via browser: https://your-railway-url/setup_db.php
 * 
 * WARNING: This will DROP existing tables and recreate them!
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🪑 NU SeatFinder — Database Setup</h1><pre>\n";

try {
    // Connect using Railway env vars
    $host = getenv('MYSQLHOST') ?: getenv('DB_HOST') ?: 'localhost';
    $port = getenv('MYSQLPORT') ?: getenv('DB_PORT') ?: '3306';
    $db = getenv('MYSQLDATABASE') ?: getenv('DB_NAME') ?: 'nuseatfinder';
    $user = getenv('MYSQLUSER') ?: getenv('DB_USER') ?: 'root';
    $pass = getenv('MYSQLPASSWORD') ?: getenv('DB_PASS') ?: '12345678a';

    echo "Connecting to $host:$port as $user...\n";

    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "✅ Connected!\n\n";

    // ── DROP existing tables ──
    echo "Dropping existing tables...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec("DROP TABLE IF EXISTS bookings");
    $pdo->exec("DROP TABLE IF EXISTS seats");
    $pdo->exec("DROP TABLE IF EXISTS zones");
    $pdo->exec("DROP TABLE IF EXISTS floors");
    $pdo->exec("DROP TABLE IF EXISTS buildings");
    $pdo->exec("DROP TABLE IF EXISTS users");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "✅ Dropped!\n\n";

    // ── CREATE TABLES ──
    echo "Creating tables...\n";

    $pdo->exec("
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(20) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            faculty VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ users\n";

    $pdo->exec("
        CREATE TABLE buildings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(10) NOT NULL,
            total_seats INT DEFAULT 0,
            address TEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ buildings\n";

    $pdo->exec("
        CREATE TABLE floors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            building_id INT NOT NULL,
            floor_number INT NOT NULL,
            total_seats INT DEFAULT 0,
            FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ floors\n";

    $pdo->exec("
        CREATE TABLE zones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            floor_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            capacity INT DEFAULT 0,
            FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ zones\n";

    $pdo->exec("
        CREATE TABLE seats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            zone_id INT NOT NULL,
            seat_label VARCHAR(20) NOT NULL,
            seat_row INT DEFAULT 1,
            seat_col INT DEFAULT 1,
            status ENUM('available','reserved','occupied') DEFAULT 'available',
            FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ seats\n";

    $pdo->exec("
        CREATE TABLE bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            seat_id INT NOT NULL,
            status ENUM('reserved','occupied','completed','cancelled','expired') DEFAULT 'reserved',
            reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NULL DEFAULT NULL,
            checked_in_at TIMESTAMP NULL DEFAULT NULL,
            left_at TIMESTAMP NULL DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "  ✅ bookings\n\n";

    // ── SEED DATA ──
    echo "Inserting seed data...\n";

    // Users
    $pdo->exec("INSERT INTO users (student_id, name, faculty) VALUES
        ('65000001', 'Somchai Jaidee', 'Engineering'),
        ('65000002', 'Suda Rakdee', 'Science'),
        ('65000003', 'Anon Meesuk', 'Education')
    ");
    echo "  ✅ 3 users\n";

    // Buildings
    $pdo->exec("INSERT INTO buildings (name, code, total_seats) VALUES
        ('Learning Building (LB)', 'LB', 1112),
        ('Saeng Tian Building', 'ST', 565)
    ");
    echo "  ✅ 2 buildings\n";

    // Floors — LB (building_id=1)
    $pdo->exec("INSERT INTO floors (building_id, floor_number, total_seats) VALUES
        (1, 1, 215), (1, 2, 171), (1, 3, 176),
        (1, 4, 202), (1, 5, 214), (1, 6, 254)
    ");
    // Floors — ST (building_id=2)
    $pdo->exec("INSERT INTO floors (building_id, floor_number, total_seats) VALUES
        (2, 1, 409), (2, 2, 144), (2, 3, 62), (2, 4, 12)
    ");
    echo "  ✅ 10 floors\n";

    // Zones
    $pdo->exec("INSERT INTO zones (floor_id, name, capacity) VALUES
        (1, 'General Area', 215),
        (2, 'General Area', 159),
        (2, 'Internet Zone', 12),
        (3, 'Group Room A (16 seats)', 16),
        (3, 'Group Room B (10 seats)', 100),
        (3, 'Group Room C (6 seats)', 60),
        (3, 'Multimedia Area', 6),
        (3, 'Sofa Area', 68),
        (4, 'General Area', 202),
        (5, 'General Area', 214),
        (6, 'General Area', 254),
        (7, 'General Area', 359),
        (7, 'Movie Room', 50),
        (8, 'General Area', 144),
        (9, 'Private Room A', 20),
        (9, 'Private Room B', 42),
        (10, 'Manee Ratana Bunnag Center', 12)
    ");
    echo "  ✅ 17 zones\n";

    // ── SEATS ──
    $seatCount = 0;

    // Helper to insert seat grid
    function insertSeats($pdo, $zoneId, $prefix, $rows, $cols, &$count)
    {
        $labels = range('A', 'Z');
        for ($r = 0; $r < $rows; $r++) {
            for ($c = 1; $c <= $cols; $c++) {
                $label = $prefix . $labels[$r] . $c;
                $pdo->exec("INSERT INTO seats (zone_id, seat_label, seat_row, seat_col) VALUES ($zoneId, '$label', " . ($r + 1) . ", $c)");
                $count++;
            }
        }
    }

    // LB F1 General — 20 seats (4x5)
    insertSeats($pdo, 1, '', 4, 5, $seatCount);
    // LB F2 General — 15 seats (3x5)
    insertSeats($pdo, 2, '', 3, 5, $seatCount);
    // LB F2 Internet — 12 seats (2x6)
    insertSeats($pdo, 3, 'IT', 2, 6, $seatCount);
    // LB F3 Group A — 16 seats (4x4)
    insertSeats($pdo, 4, 'GA', 4, 4, $seatCount);
    // LB F3 Group B — 10 seats (2x5)
    insertSeats($pdo, 5, 'GB', 2, 5, $seatCount);
    // LB F3 Group C — 6 seats (2x3)
    insertSeats($pdo, 6, 'GC', 2, 3, $seatCount);
    // LB F3 Multimedia — 6 seats (1x6)
    insertSeats($pdo, 7, 'MM', 1, 6, $seatCount);
    // LB F3 Sofa — 12 seats (3x4)
    insertSeats($pdo, 8, 'SF', 3, 4, $seatCount);
    // LB F4 General — 20 seats (4x5)
    insertSeats($pdo, 9, '', 4, 5, $seatCount);
    // LB F5 General — 20 seats (4x5)
    insertSeats($pdo, 10, '', 4, 5, $seatCount);
    // LB F6 General — 20 seats (4x5)
    insertSeats($pdo, 11, '', 4, 5, $seatCount);
    // ST F1 General — 20 seats (4x5)
    insertSeats($pdo, 12, '', 4, 5, $seatCount);
    // ST F1 Movie — 10 seats (2x5)
    insertSeats($pdo, 13, 'MV', 2, 5, $seatCount);
    // ST F2 General — 15 seats (3x5)
    insertSeats($pdo, 14, '', 3, 5, $seatCount);
    // ST F3 Private A — 10 seats (2x5)
    insertSeats($pdo, 15, 'PA', 2, 5, $seatCount);
    // ST F3 Private B — 6 seats (2x3)
    insertSeats($pdo, 16, 'PB', 2, 3, $seatCount);
    // ST F4 Center — 12 seats (2x6)
    insertSeats($pdo, 17, 'MR', 2, 6, $seatCount);

    echo "  ✅ $seatCount seats\n\n";

    echo "========================================\n";
    echo "🎉 DATABASE SETUP COMPLETE!\n";
    echo "========================================\n";
    echo "\nTables: users, buildings, floors, zones, seats, bookings\n";
    echo "Users: 65000001, 65000002, 65000003\n";
    echo "\n⚠️  DELETE this file after setup for security!\n";

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "\nCheck your Railway MySQL environment variables.\n";
}

echo "</pre>";
