/**
 * LoginPage.jsx — Login + Register with toggle
 * NU SeatFinder — Orange/White Mobile Design
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';

export default function LoginPage({ onLogin }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [studentId, setStudentId] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) return;

        setLoading(true);
        setError('');
        try {
            const res = await login(studentId.trim());
            onLogin(res.user, res.active_booking);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!studentId.trim() || !name.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await register(studentId.trim(), name.trim());
            setSuccess(res.message + ' You can now login.');
            // Switch to login mode after success
            setTimeout(() => {
                setMode('login');
                setSuccess('');
                setName('');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {mode === 'login' ? (
                /* ── LOGIN FORM ─────────────────────── */
                <form className="login-card" onSubmit={handleLogin}>
                    <div className="login-card__logo">🪑📍</div>
                    <h1 className="login-card__title">NU SeatFinder</h1>
                    <p className="login-card__subtitle">
                        Welcome to NU SeatFinder<br />
                        Find and book study spaces easily
                    </p>

                    {error && <div className="login-card__error">{error}</div>}

                    <div className="login-card__input-group">
                        <span className="login-card__input-icon">🎓</span>
                        <input
                            id="student-id-input"
                            className="login-card__input"
                            type="text"
                            placeholder="Enter your Student ID"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button
                        id="login-btn"
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading || !studentId.trim()}
                    >
                        {loading ? 'Signing in…' : 'Login with Student ID'}
                    </button>

                    <div style={{ margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        or
                    </div>

                    <button
                        type="button"
                        className="btn btn--outline"
                        style={{ width: '100%' }}
                        onClick={() => { setMode('register'); setError(''); }}
                    >
                        Sign Up / Register
                    </button>

                    <div className="login-card__demo">
                        Demo accounts:&nbsp;
                        <code>65000001</code>&nbsp;
                        <code>65000002</code>&nbsp;
                        <code>65000003</code>
                    </div>
                </form>
            ) : (
                /* ── REGISTER FORM ──────────────────── */
                <form className="login-card" onSubmit={handleRegister}>
                    <div className="login-card__logo">📝</div>
                    <h1 className="login-card__title">Register</h1>
                    <p className="login-card__subtitle">
                        Create your NU SeatFinder account
                    </p>

                    {error && <div className="login-card__error">{error}</div>}
                    {success && (
                        <div style={{
                            background: 'var(--green-light)',
                            border: '1px solid var(--green)',
                            color: 'var(--green-dark)',
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            fontWeight: 600,
                        }}>
                            ✅ {success}
                        </div>
                    )}

                    <div className="login-card__input-group">
                        <span className="login-card__input-icon">👤</span>
                        <input
                            className="login-card__input"
                            type="text"
                            placeholder="Full Name (ชื่อ-นามสกุล)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="login-card__input-group">
                        <span className="login-card__input-icon">🎓</span>
                        <input
                            className="login-card__input"
                            type="text"
                            placeholder="Student ID (รหัสนิสิต)"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading || !studentId.trim() || !name.trim()}
                    >
                        {loading ? 'Registering…' : '✅ Register'}
                    </button>

                    <div style={{ margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Already have an account?
                    </div>

                    <button
                        type="button"
                        className="btn btn--outline"
                        style={{ width: '100%' }}
                        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    >
                        Back to Login
                    </button>
                </form>
            )}
        </div>
    );
}
