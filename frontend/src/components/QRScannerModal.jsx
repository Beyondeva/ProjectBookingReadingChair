/**
 * QRScannerModal.jsx — Real QR Code for seat check-in
 * NU SeatFinder — Orange/White Design
 */
import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function getCheckInUrl(bookingId) {
    const host = window.location.hostname;
    return `http://${host}/PJBOOKING/api/qr_checkin.php?token=${bookingId}`;
}

export default function QRScannerModal({ booking, onConfirm, onClose }) {
    const [checkedIn, setCheckedIn] = useState(false);
    const pollRef = useRef(null);
    const checkInUrl = booking ? getCheckInUrl(booking.booking_id) : '';

    // Poll to detect when phone scan completes the check-in
    useEffect(() => {
        if (!booking || checkedIn) return;

        const API_BASE = `http://${window.location.hostname}/PJBOOKING/api`;

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/get_seats.php?floor_id=1`);
                const data = await res.json();
                if (!data.success) return;

                const ourSeat = data.data.find(
                    (s) => String(s.id) === String(booking.seat_id)
                );
                if (ourSeat && ourSeat.status === 'occupied') {
                    setCheckedIn(true);
                    clearInterval(pollRef.current);
                }
            } catch { /* ignore */ }
        }, 2000);

        return () => clearInterval(pollRef.current);
    }, [booking, checkedIn]);

    useEffect(() => {
        if (checkedIn) {
            const timeout = setTimeout(() => onConfirm(), 2000);
            return () => clearTimeout(timeout);
        }
    }, [checkedIn, onConfirm]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {!checkedIn ? (
                    <>
                        <div className="modal__icon">📱</div>
                        <h2 className="modal__title">Scan QR Code to Check In</h2>
                        <p className="modal__desc">
                            Scan this QR code with your phone to check in at seat{' '}
                            <strong>{booking?.seat_label}</strong>
                        </p>

                        {/* Real QR Code */}
                        <div className="modal__qr-box">
                            <QRCodeSVG
                                value={checkInUrl}
                                size={170}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#000000"
                                imageSettings={{
                                    src: 'data:image/svg+xml,' + encodeURIComponent(
                                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🪑</text></svg>'
                                    ),
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                        </div>

                        {/* URL hint */}
                        <p style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            wordBreak: 'break-all',
                            margin: '0 0 0.75rem',
                            padding: '0.4rem',
                            background: 'var(--bg-body)',
                            borderRadius: '6px',
                        }}>
                            {checkInUrl}
                        </p>

                        {/* Waiting */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            marginBottom: '0.75rem',
                        }}>
                            <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                            Waiting for scan…
                        </div>

                        <div className="modal__actions">
                            <button className="btn btn--sm btn--outline" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="btn btn--sm btn--green"
                                onClick={() => window.open(checkInUrl, '_blank')}
                            >
                                🔗 Open Link (Demo)
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal__icon modal__success">✅</div>
                        <h2 className="modal__title" style={{ color: 'var(--green)' }}>
                            Check-In Successful!
                        </h2>
                        <p className="modal__desc">
                            Seat <strong>{booking?.seat_label}</strong> confirmed via QR scan!
                            <br />
                            Enjoy your study session! 📚
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
