/**
 * DashboardPage.jsx — Main dashboard with search, filters, seat map
 * NU SeatFinder — Orange/White Mobile Design
 */
import { useState, useEffect, useCallback } from 'react';
import BuildingSelector from '../components/BuildingSelector';
import SeatMap from '../components/SeatMap';
import QRScannerModal from '../components/QRScannerModal';
import { getBuildings, getSeats, bookSeat, leaveSeat } from '../api';

export default function DashboardPage({ user, activeBooking, setActiveBooking, activeTab }) {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    // Load buildings on mount
    useEffect(() => {
        getBuildings()
            .then((res) => {
                setBuildings(res.data);
                if (res.data.length > 0) {
                    setSelectedBuilding(res.data[0]);
                    if (res.data[0].floors.length > 0) {
                        setSelectedFloor(res.data[0].floors[0]);
                    }
                }
            })
            .catch((err) => setError(err.message));
    }, []);

    // Fetch seats when floor changes
    const fetchSeats = useCallback(async () => {
        if (!selectedFloor) return;
        setLoadingSeats(true);
        setError('');
        try {
            const res = await getSeats(selectedFloor.id);
            setSeats(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingSeats(false);
        }
    }, [selectedFloor]);

    useEffect(() => { fetchSeats(); }, [fetchSeats]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchSeats, 30000);
        return () => clearInterval(interval);
    }, [fetchSeats]);

    const handleBuildingSelect = (building) => {
        setSelectedBuilding(building);
        if (building.floors.length > 0) {
            setSelectedFloor(building.floors[0]);
        } else {
            setSelectedFloor(null);
            setSeats([]);
        }
    };

    const handleBook = async (seat) => {
        if (activeBooking) {
            setError('You already have an active booking.');
            return;
        }
        try {
            setError('');
            const res = await bookSeat(seat.id, user.id);
            setActiveBooking({
                booking_id: res.booking_id,
                seat_id: seat.id,
                seat_label: seat.seat_label,
                zone_name: seat.zone_name,
                status: 'reserved',
                expires_at: res.expires_at,
            });
            fetchSeats();
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle QR check-in (called by poll after phone scan)
    const handleCheckIn = () => {
        setActiveBooking((prev) => ({ ...prev, status: 'occupied' }));
        setShowQR(false);
        fetchSeats();
    };

    const handleLeave = async () => {
        if (!activeBooking) return;
        try {
            setError('');
            await leaveSeat(activeBooking.booking_id);
            setActiveBooking(null);
            fetchSeats();
        } catch (err) {
            setError(err.message);
        }
    };

    // Filter seats
    const filteredSeats = seats.filter((s) => {
        if (filter !== 'all' && s.status !== filter) return false;
        if (search && !s.seat_label.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    // Stats
    const stats = {
        total: seats.length,
        available: seats.filter((s) => s.status === 'available').length,
        reserved: seats.filter((s) => s.status === 'reserved').length,
        occupied: seats.filter((s) => s.status === 'occupied').length,
    };

    // Bookings tab view
    if (activeTab === 'bookings') {
        return (
            <div className="page">
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>📋 My Bookings</h2>
                {activeBooking ? (
                    <div className="active-booking">
                        <div className="active-booking__info">
                            <div className="active-booking__title">
                                🪑 {activeBooking.seat_label}
                            </div>
                            <div className="active-booking__detail">
                                {activeBooking.zone_name}
                                {activeBooking.status === 'reserved' && activeBooking.expires_at && (
                                    <Countdown expiresAt={activeBooking.expires_at} />
                                )}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                marginTop: '0.25rem',
                                background: activeBooking.status === 'occupied' ? 'var(--green-bg)' : 'var(--orange-bg)',
                                color: activeBooking.status === 'occupied' ? 'var(--green-dark)' : 'var(--orange-dark)',
                            }}>
                                {activeBooking.status === 'occupied' ? '✅ Checked In' : '⏳ Reserved'}
                            </div>
                        </div>
                        <div className="active-booking__actions">
                            {activeBooking.status === 'reserved' && (
                                <button className="btn btn--sm btn--green" onClick={() => setShowQR(true)}>
                                    ✅ Check In
                                </button>
                            )}
                            <button className="btn btn--sm btn--red" onClick={handleLeave}>
                                {activeBooking.status === 'occupied' ? '🚪 Leave' : '✕ Cancel Booking'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state__icon">📭</div>
                        <p>No active bookings</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            Go to Home to find and book a seat
                        </p>
                    </div>
                )}

                {showQR && (
                    <QRScannerModal
                        booking={activeBooking}
                        onConfirm={handleCheckIn}
                        onClose={() => setShowQR(false)}
                    />
                )}
            </div>
        );
    }

    // Home tab view
    return (
        <div className="page">
            {/* Error Banner */}
            {error && (
                <div className="login-card__error" style={{ marginBottom: '0.75rem' }}>
                    {error}
                    <button
                        onClick={() => setError('')}
                        style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Search Box */}
            <div className="search-box">
                <span className="search-box__icon">🔍</span>
                <input
                    className="search-box__input"
                    type="text"
                    placeholder={`Search seats in ${selectedBuilding?.name || 'building'}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'filter-tab--all' : 'filter-tab--inactive'}`}
                    onClick={() => setFilter('all')}
                >All</button>
                <button
                    className={`filter-tab ${filter === 'available' ? 'filter-tab--available' : 'filter-tab--inactive'}`}
                    onClick={() => setFilter('available')}
                >Available</button>
                <button
                    className={`filter-tab ${filter === 'reserved' ? 'filter-tab--reserved' : 'filter-tab--inactive'}`}
                    onClick={() => setFilter('reserved')}
                >Reserved</button>
                <button
                    className={`filter-tab ${filter === 'occupied' ? 'filter-tab--occupied' : 'filter-tab--inactive'}`}
                    onClick={() => setFilter('occupied')}
                >Occupied</button>
            </div>

            {/* Active Booking Banner */}
            {activeBooking && (
                <div className="active-booking">
                    <div className="active-booking__info">
                        <div className="active-booking__title">
                            {activeBooking.status === 'occupied' ? '📖 Currently Studying' : '⏳ Reservation Active'}
                        </div>
                        <div className="active-booking__detail">
                            Seat <strong>{activeBooking.seat_label}</strong> — {activeBooking.zone_name}
                            {activeBooking.status === 'reserved' && activeBooking.expires_at && (
                                <Countdown expiresAt={activeBooking.expires_at} />
                            )}
                        </div>
                    </div>
                    <div className="active-booking__actions">
                        {activeBooking.status === 'reserved' && (
                            <button className="btn btn--sm btn--green" onClick={() => setShowQR(true)}>
                                ✅ Check In
                            </button>
                        )}
                        <button className="btn btn--sm btn--red" onClick={handleLeave}>
                            {activeBooking.status === 'occupied' ? '🚪 Leave' : '✕ Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Building & Floor Selector */}
            <BuildingSelector
                buildings={buildings}
                selectedBuilding={selectedBuilding}
                selectedFloor={selectedFloor}
                onBuildingSelect={handleBuildingSelect}
                onFloorSelect={setSelectedFloor}
            />

            {/* Stats */}
            {seats.length > 0 && (
                <div className="stats-bar">
                    <div className="stat-card">
                        <div className="stat-card__value stat-card__value--accent">{stats.total}</div>
                        <div className="stat-card__label">Total</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value stat-card__value--green">{stats.available}</div>
                        <div className="stat-card__label">Free</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value stat-card__value--orange">{stats.reserved}</div>
                        <div className="stat-card__label">Reserved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value stat-card__value--red">{stats.occupied}</div>
                        <div className="stat-card__label">In Use</div>
                    </div>
                </div>
            )}

            {/* Seat Map */}
            <SeatMap
                seats={filteredSeats}
                loading={loadingSeats}
                userId={user.id}
                activeBooking={activeBooking}
                onBookSeat={handleBook}
                selectedFloor={selectedFloor}
            />

            {/* Quick Action Buttons */}
            <div className="quick-actions">
                <button className="quick-action-btn quick-action-btn--book" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
                    <span className="quick-action-btn__icon">🪑</span>
                    Book in Advance
                    <span className="quick-action-btn__arrow">›</span>
                </button>
                <button className="quick-action-btn quick-action-btn--scan" onClick={() => activeBooking && setShowQR(true)}>
                    <span className="quick-action-btn__icon">📷</span>
                    Scan QR Code to Check In
                    <span className="quick-action-btn__arrow">›</span>
                </button>
            </div>

            {/* QR Scanner Modal */}
            {showQR && (
                <QRScannerModal
                    booking={activeBooking}
                    onConfirm={handleCheckIn}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
}

/* ── Countdown Timer Component ─────────────────── */
function Countdown({ expiresAt }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [urgent, setUrgent] = useState(false);

    useEffect(() => {
        const update = () => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            const min = Math.floor(diff / 60);
            const sec = diff % 60;
            setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`);
            setUrgent(diff < 300);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <span className={`countdown ${urgent ? 'countdown--urgent' : ''}`}>
            &nbsp;⏱ {timeLeft}
        </span>
    );
}
