/**
 * api.js — Centralized API helper
 * Auto-detects Railway vs localhost based on environment
 */

// In production (Railway), VITE_API_URL should point to the PHP service
// In dev, it defaults to localhost AppServ
const API_BASE = import.meta.env.VITE_API_URL
  || `http://${window.location.hostname}/PJBOOKING/api`;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Auth ─────────────────────────────────────── */
export const login = (student_id) =>
  request('login.php', {
    method: 'POST',
    body: JSON.stringify({ student_id }),
  });

export const register = (student_id, name) =>
  request('register.php', {
    method: 'POST',
    body: JSON.stringify({ student_id, name }),
  });

/* ── Buildings & Floors ───────────────────────── */
export const getBuildings = () => request('get_buildings.php');

/* ── Seats ────────────────────────────────────── */
export const getSeats = (floor_id) =>
  request(`get_seats.php?floor_id=${floor_id}`);

/* ── Booking ──────────────────────────────────── */
export const bookSeat = (seat_id, user_id) =>
  request('book_seat.php', {
    method: 'POST',
    body: JSON.stringify({ seat_id, user_id }),
  });

export const checkIn = (booking_id) =>
  request('check_in.php', {
    method: 'POST',
    body: JSON.stringify({ booking_id }),
  });

export const leaveSeat = (booking_id) =>
  request('leave_seat.php', {
    method: 'POST',
    body: JSON.stringify({ booking_id }),
  });

export const cancelExpired = () => request('cancel_expired.php');

// Export API_BASE for use in QR code generation
export { API_BASE };
