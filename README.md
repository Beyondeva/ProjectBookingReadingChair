# 🪑 NU SeatFinder

> **Naresuan University Study Seat Booking System**
> แอปพลิเคชันจองที่นั่งอ่านหนังสือ มหาวิทยาลัยนเรศวร

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PHP](https://img.shields.io/badge/PHP-7.3+-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-5.7-4479A1?logo=mysql)

## 📋 Overview

NU SeatFinder เป็นระบบจองที่นั่งอ่านหนังสือ สำหรับสำนักหอสมุด มหาวิทยาลัยนเรศวร เพื่อแก้ปัญหา **"Ghost Booking"** — การจองที่นั่งแล้วไม่มานั่งจริง ทำให้คนอื่นเสียโอกาส

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ Real-time Seat Map | แสดงสถานะที่นั่ง (ว่าง/จอง/ใช้งาน) แบบ Real-time |
| 📱 QR Code Check-In | สแกน QR Code ด้วยโทรศัพท์เพื่อยืนยันการเข้าใช้ |
| ⏰ Ghost Booking Prevention | หากจองแล้วไม่ Check-in ภายใน 15 นาที จะถูกยกเลิกอัตโนมัติ |
| 👤 Mock SSO Login | ระบบ Login ด้วยรหัสนิสิต + ลงทะเบียนผู้ใช้ใหม่ |
| 🔍 Search & Filter | ค้นหาและกรองที่นั่งตามสถานะ |
| 📊 Live Stats | แสดงสถิติที่นั่งแบบ Real-time |

## 🏫 Buildings

### Learning Building (LB) — 6 ชั้น
| ชั้น | พื้นที่ |
|------|---------|
| F1 | พื้นที่นั่งอ่านตามอัธยาศัย (215 ที่นั่ง) |
| F2 | พื้นที่นั่งอ่าน (159) + มุมอินเทอร์เน็ต (12) |
| F3 | ห้องศึกษาค้นคว้ากลุ่ม + Multimedia + โซฟา |
| F4 | พื้นที่นั่งอ่าน (202 ที่นั่ง) |
| F5 | พื้นที่นั่งอ่าน (214 ที่นั่ง) |
| F6 | พื้นที่นั่งอ่าน (254 ที่นั่ง) |

### Saeng Tian Building (ST) — 4 ชั้น
| ชั้น | พื้นที่ |
|------|---------|
| F1 | พื้นที่นั่งอ่าน (359) + ห้องฉายภาพยนตร์ (50) |
| F2 | พื้นที่นั่งอ่าน (144 ที่นั่ง) |
| F3 | ห้องศึกษาค้นคว้าส่วนบุคคล |
| F4 | ศูนย์มณีรัตนา บุนนาค (12 ที่นั่ง) |

## 🛠️ Tech Stack

```
Frontend:  React 18 + Vite
Backend:   PHP (Vanilla)
Database:  MySQL
Server:    AppServ (Apache + MySQL)
QR Code:   qrcode.react
```

## 📁 Project Structure

```
PJBOOKING/
├── README.md
├── nuseatfinder.sql          # Database schema + seed data
├── api/                      # PHP REST API
│   ├── db_connect.php        # Database connection + helpers
│   ├── login.php             # Mock SSO login
│   ├── register.php          # User registration
│   ├── get_buildings.php     # Buildings, floors, zones
│   ├── get_seats.php         # Seats + ghost booking cleanup
│   ├── book_seat.php         # Reserve a seat
│   ├── check_in.php          # Check-in via API
│   ├── qr_checkin.php        # QR scan check-in (GET)
│   ├── leave_seat.php        # Leave / cancel booking
│   └── cancel_expired.php    # Batch ghost booking expiry
└── frontend/                 # React Application
    ├── index.html
    ├── package.json
    └── src/
        ├── api.js            # API client
        ├── index.css         # Design system (responsive)
        ├── App.jsx           # Router + auth state
        ├── pages/
        │   ├── LoginPage.jsx
        │   └── DashboardPage.jsx
        └── components/
            ├── Navbar.jsx
            ├── BuildingSelector.jsx
            ├── SeatMap.jsx
            └── QRScannerModal.jsx
```

## 🚀 Getting Started

### Prerequisites
- [AppServ](https://www.appserv.org/) (Apache + MySQL + PHP)
- [Node.js](https://nodejs.org/) (v16+)

### 1. Database Setup
```bash
mysql -u root -p12345678a < nuseatfinder.sql
```
Or import `nuseatfinder.sql` via phpMyAdmin.

### 2. Backend
Place the project folder in `C:\AppServ\www\PJBOOKING`. The API will be available at:
```
http://localhost/PJBOOKING/api/
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/`

### Demo Accounts
| Student ID | Name |
|-----------|------|
| `65000001` | Somchai Jaidee |
| `65000002` | Suda Rakdee |
| `65000003` | Anon Meesuk |

## 📱 QR Code Check-In Flow

1. **จองที่นั่ง** → เลือกที่นั่งว่างแล้วกด
2. **เปิด QR Scanner** → กดปุ่ม "Check In"
3. **สแกน QR** → ใช้โทรศัพท์สแกน QR Code (PC + มือถือต้องอยู่ Wi-Fi เดียวกัน)
4. **ยืนยัน** → หน้าเว็บอัปเดตสถานะอัตโนมัติ

## 👥 Contributors

- Naresuan University — Faculty of Engineering

## 📄 License

This project is for educational purposes at Naresuan University.
