/**
 * App.jsx — Root component with routing and global auth state
 * NU SeatFinder — Mobile Design
 */
import { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import { BottomNav } from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = useCallback((userData, booking) => {
    setUser(userData);
    setActiveBooking(booking || null);
    setActiveTab('home');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setActiveBooking(null);
  }, []);

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            user
              ? <DashboardPage
                user={user}
                activeBooking={activeBooking}
                setActiveBooking={setActiveBooking}
                activeTab={activeTab}
              />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
      {user && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
