/**
 * Navbar.jsx — Orange gradient header with user info
 * Shows logout button on desktop (bottom nav hidden on desktop)
 * NU SeatFinder
 */
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <nav className="navbar">
            {/* Brand */}
            <div className="navbar__brand">
                <span className="navbar__brand-icon">🪑📍</span>
                <span>NU SeatFinder</span>
            </div>

            {/* User */}
            <div className="navbar__user">
                <div className="navbar__user-info">
                    <div className="navbar__user-name">{user.name}</div>
                    <div className="navbar__user-id">{user.student_id}</div>
                </div>
                <div className="navbar__avatar">{initial}</div>
                {/* Logout button — visible on desktop (bottom nav hidden) */}
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

/**
 * BottomNav — Fixed bottom navigation bar (mobile only, hidden via CSS on ≥768px)
 */
export function BottomNav({ activeTab, onTabChange, onLogout }) {
    return (
        <div className="bottom-nav">
            <button
                className={`bottom-nav__item ${activeTab === 'home' ? 'bottom-nav__item--active' : ''}`}
                onClick={() => onTabChange('home')}
            >
                <span className="bottom-nav__icon">🏠</span>
                Home
            </button>
            <button
                className={`bottom-nav__item ${activeTab === 'bookings' ? 'bottom-nav__item--active' : ''}`}
                onClick={() => onTabChange('bookings')}
            >
                <span className="bottom-nav__icon">📋</span>
                Bookings
            </button>
            <button
                className="bottom-nav__item"
                onClick={onLogout}
            >
                <span className="bottom-nav__icon">👤</span>
                Logout
            </button>
        </div>
    );
}
