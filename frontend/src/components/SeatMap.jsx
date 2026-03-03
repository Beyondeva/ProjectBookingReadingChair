/**
 * SeatMap.jsx — Visual seat grid with chair icons
 * Green = Available, Orange = Reserved, Red = Occupied
 * Floor-plan style with beige background
 * NU SeatFinder — Mobile Design
 */

export default function SeatMap({
    seats,
    loading,
    userId,
    activeBooking,
    onBookSeat,
    selectedFloor,
}) {
    if (loading) {
        return (
            <div className="seat-map">
                <div className="loading">
                    <div className="spinner" />
                    <span>Loading seats…</span>
                </div>
            </div>
        );
    }

    if (!selectedFloor) {
        return (
            <div className="seat-map">
                <div className="empty-state">
                    <div className="empty-state__icon">🏫</div>
                    <p>Select a building and floor</p>
                </div>
            </div>
        );
    }

    if (seats.length === 0) {
        return (
            <div className="seat-map">
                <div className="empty-state">
                    <div className="empty-state__icon">🪑</div>
                    <p>No seats match your filter</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Try clearing your search or changing the filter.
                    </p>
                </div>
            </div>
        );
    }

    // Group seats by zone
    const zones = {};
    seats.forEach((seat) => {
        const zoneKey = seat.zone_name || 'General Area';
        if (!zones[zoneKey]) zones[zoneKey] = [];
        zones[zoneKey].push(seat);
    });

    const handleSeatClick = (seat) => {
        if (seat.status !== 'available') return;
        if (activeBooking) return;
        onBookSeat(seat);
    };

    return (
        <div className="seat-map">
            {/* Header */}
            <div className="seat-map__header">
                <h2 className="seat-map__title">
                    Floor {selectedFloor.floor_number}
                </h2>
                <div className="seat-map__legend">
                    <div className="seat-map__legend-item">
                        <span className="seat-map__legend-dot seat-map__legend-dot--available" />
                        Free
                    </div>
                    <div className="seat-map__legend-item">
                        <span className="seat-map__legend-dot seat-map__legend-dot--reserved" />
                        Reserved
                    </div>
                    <div className="seat-map__legend-item">
                        <span className="seat-map__legend-dot seat-map__legend-dot--occupied" />
                        In Use
                    </div>
                </div>
            </div>

            {/* Zones */}
            {Object.entries(zones).map(([zoneName, zoneSeats]) => (
                <div key={zoneName} className="seat-map__zone">
                    <div className="seat-map__zone-name">📍 {zoneName}</div>
                    <div className="seat-map__grid">
                        {zoneSeats.map((seat) => {
                            const isMine =
                                activeBooking &&
                                String(activeBooking.seat_id) === String(seat.id);
                            const statusClass = `seat--${seat.status}`;

                            return (
                                <button
                                    key={seat.id}
                                    className={`seat ${statusClass} ${isMine ? 'seat--mine' : ''}`}
                                    onClick={() => handleSeatClick(seat)}
                                    title={
                                        seat.status === 'available'
                                            ? `Click to reserve ${seat.seat_label}`
                                            : `${seat.seat_label} — ${seat.status}`
                                    }
                                    disabled={seat.status !== 'available' || !!activeBooking}
                                >
                                    <span className="seat__icon">
                                        {seat.status === 'available' && '🟢'}
                                        {seat.status === 'reserved' && '🟠'}
                                        {seat.status === 'occupied' && '🔴'}
                                    </span>
                                    <span className="seat__label">{seat.seat_label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
