/**
 * api.js — Centralized API helper for NU SeatFinder
 * All calls target the PHP back-end served by AppServ.
 */

const API_BASE = 'http://localhost/PJBOOKING/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
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

/* ── Check-in (QR) ────────────────────────────── */
export const checkIn = (booking_id) =>
  request('check_in.php', {
    method: 'POST',
    body: JSON.stringify({ booking_id }),
  });

/* ── Leave / Cancel ───────────────────────────── */
export const leaveSeat = (booking_id) =>
  request('leave_seat.php', {
    method: 'POST',
    body: JSON.stringify({ booking_id }),
  });

/* ── Expire ghost bookings ────────────────────── */
export const cancelExpired = () => request('cancel_expired.php');
