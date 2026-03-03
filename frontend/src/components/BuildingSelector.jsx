/**
 * BuildingSelector.jsx — Tabs for building + floor selection
 * NU SeatFinder
 */

export default function BuildingSelector({
    buildings,
    selectedBuilding,
    selectedFloor,
    onBuildingSelect,
    onFloorSelect,
}) {
    if (!buildings.length) return null;

    return (
        <div className="selector">
            {/* Building Tabs */}
            <div className="selector__label">🏛️ Select Building</div>
            <div className="selector__tabs">
                {buildings.map((b) => (
                    <button
                        key={b.id}
                        className={`selector__tab ${selectedBuilding?.id === b.id ? 'selector__tab--active' : ''
                            }`}
                        onClick={() => onBuildingSelect(b)}
                    >
                        {b.name}
                    </button>
                ))}
            </div>

            {/* Floor Tabs */}
            {selectedBuilding && selectedBuilding.floors.length > 0 && (
                <>
                    <div className="selector__label" style={{ marginTop: '1rem' }}>
                        📐 Select Floor
                    </div>
                    <div className="selector__floors">
                        {selectedBuilding.floors.map((f) => (
                            <button
                                key={f.id}
                                className={`selector__floor ${selectedFloor?.id === f.id ? 'selector__floor--active' : ''
                                    }`}
                                onClick={() => onFloorSelect(f)}
                            >
                                F{f.floor_number}
                            </button>
                        ))}
                    </div>
                    {selectedFloor && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {selectedFloor.label}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
