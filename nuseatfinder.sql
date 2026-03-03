-- ============================================================
-- NU SeatFinder Database Schema
-- Database: nuseatfinder
-- ============================================================

CREATE DATABASE IF NOT EXISTS nuseatfinder
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nuseatfinder;

-- ============================================================
-- 1. USERS — mock SSO accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  faculty     VARCHAR(100) DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. BUILDINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS buildings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  name_th     VARCHAR(100) DEFAULT NULL,
  image_url   VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB;

-- ============================================================
-- 3. FLOORS
-- ============================================================
CREATE TABLE IF NOT EXISTS floors (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  building_id INT NOT NULL,
  floor_number INT NOT NULL,
  label       VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. ZONES — distinct areas within a floor
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  floor_id    INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  total_seats INT NOT NULL DEFAULT 0,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. SEATS
-- ============================================================
CREATE TABLE IF NOT EXISTS seats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  zone_id     INT NOT NULL,
  seat_label  VARCHAR(20) NOT NULL,
  seat_row    INT DEFAULT 1,
  seat_col    INT DEFAULT 1,
  status      ENUM('available','reserved','occupied') DEFAULT 'available',
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  seat_id      INT NOT NULL,
  user_id      INT NOT NULL,
  status       ENUM('reserved','occupied','completed','expired','cancelled') DEFAULT 'reserved',
  reserved_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  checked_in_at DATETIME DEFAULT NULL,
  expires_at   DATETIME DEFAULT NULL,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- SEED DATA
-- ============================================================

-- Mock Users
INSERT INTO users (student_id, name, faculty) VALUES
  ('65000001', 'Somchai Jaidee',    'Engineering'),
  ('65000002', 'Nattaya Sriwan',    'Science'),
  ('65000003', 'Pichaya Rattanakul','Business');

-- --------------------------------------------------------
-- Buildings
-- --------------------------------------------------------
INSERT INTO buildings (id, name, name_th) VALUES
  (1, 'Learning Building (LB)', 'อาคารเรียนรวม'),
  (2, 'Saeng Tian Building',    'อาคารแสงเทียน');

-- --------------------------------------------------------
-- Floors — Learning Building (LB)
-- --------------------------------------------------------
INSERT INTO floors (id, building_id, floor_number, label) VALUES
  (1,  1, 1, 'Floor 1 — 215 seats'),
  (2,  1, 2, 'Floor 2 — 159 seats + Internet Zone'),
  (3,  1, 3, 'Floor 3 — Group Study & Multimedia'),
  (4,  1, 4, 'Floor 4 — 202 seats'),
  (5,  1, 5, 'Floor 5 — 214 seats'),
  (6,  1, 6, 'Floor 6 — 254 seats');

-- --------------------------------------------------------
-- Floors — Saeng Tian Building
-- --------------------------------------------------------
INSERT INTO floors (id, building_id, floor_number, label) VALUES
  (7,  2, 1, 'Floor 1 — 359 seats + Movie Room'),
  (8,  2, 2, 'Floor 2 — 144 seats'),
  (9,  2, 3, 'Floor 3 — Private Study Rooms'),
  (10, 2, 4, 'Floor 4 — Manee Ratana Bunnag Center');

-- --------------------------------------------------------
-- Zones — LB
-- --------------------------------------------------------
INSERT INTO zones (id, floor_id, name, total_seats) VALUES
  -- LB Floor 1
  (1,  1,  'General Area',      215),
  -- LB Floor 2
  (2,  2,  'General Area',      159),
  (3,  2,  'Internet Zone',      12),
  -- LB Floor 3
  (4,  3,  'Group Room A (16 seats)',  16),
  (5,  3,  'Group Room B1-B10 (10 seats each)', 100),
  (6,  3,  'Group Room C1-C10 (6 seats each)',   60),
  (7,  3,  'Multimedia Area',     6),
  (8,  3,  'Sofa Area',          68),
  -- LB Floor 4
  (9,  4,  'General Area',      202),
  -- LB Floor 5
  (10, 5,  'General Area',      214),
  -- LB Floor 6
  (11, 6,  'General Area',      254);

-- --------------------------------------------------------
-- Zones — Saeng Tian
-- --------------------------------------------------------
INSERT INTO zones (id, floor_id, name, total_seats) VALUES
  -- ST Floor 1
  (12, 7,  'General Area',      359),
  (13, 7,  'Movie Room',         50),
  -- ST Floor 2
  (14, 8,  'General Area',      144),
  -- ST Floor 3
  (15, 9,  'Private Room A1-A2 (10 seats each)', 20),
  (16, 9,  'Private Room B1-B7 (6 seats each)',   42),
  -- ST Floor 4
  (17, 10, 'Manee Ratana Bunnag Center', 12);

-- --------------------------------------------------------
-- Mock Seats — LB Floor 1, General Area (zone_id = 1)
-- 20 prototype seats arranged in a 4×5 grid
-- --------------------------------------------------------
INSERT INTO seats (zone_id, seat_label, seat_row, seat_col) VALUES
  (1, 'A1', 1, 1), (1, 'A2', 1, 2), (1, 'A3', 1, 3), (1, 'A4', 1, 4), (1, 'A5', 1, 5),
  (1, 'B1', 2, 1), (1, 'B2', 2, 2), (1, 'B3', 2, 3), (1, 'B4', 2, 4), (1, 'B5', 2, 5),
  (1, 'C1', 3, 1), (1, 'C2', 3, 2), (1, 'C3', 3, 3), (1, 'C4', 3, 4), (1, 'C5', 3, 5),
  (1, 'D1', 4, 1), (1, 'D2', 4, 2), (1, 'D3', 4, 3), (1, 'D4', 4, 4), (1, 'D5', 4, 5);

-- Mock Seats — LB Floor 2, Internet Zone (zone_id = 3)
-- 12 seats arranged in 2×6 grid
INSERT INTO seats (zone_id, seat_label, seat_row, seat_col) VALUES
  (3, 'I1', 1, 1), (3, 'I2', 1, 2), (3, 'I3', 1, 3), (3, 'I4', 1, 4), (3, 'I5', 1, 5), (3, 'I6', 1, 6),
  (3, 'I7', 2, 1), (3, 'I8', 2, 2), (3, 'I9', 2, 3), (3, 'I10', 2, 4), (3, 'I11', 2, 5), (3, 'I12', 2, 6);

-- Mock Seats — Saeng Tian Floor 4, Manee Ratana Bunnag Center (zone_id = 17)
-- 12 seats arranged in 3×4 grid
INSERT INTO seats (zone_id, seat_label, seat_row, seat_col) VALUES
  (17, 'M1', 1, 1), (17, 'M2', 1, 2), (17, 'M3', 1, 3), (17, 'M4', 1, 4),
  (17, 'M5', 2, 1), (17, 'M6', 2, 2), (17, 'M7', 2, 3), (17, 'M8', 2, 4),
  (17, 'M9', 3, 1), (17, 'M10', 3, 2), (17, 'M11', 3, 3), (17, 'M12', 3, 4);
