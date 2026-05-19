import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineViewGrid, HiOutlineFolder, HiOutlineLightningBolt,
  HiOutlineViewBoards, HiOutlineChat, HiOutlineUsers,
  HiOutlineChartBar, HiOutlineMoon, HiOutlineSun,
  HiOutlineLogout, HiOutlineMenu, HiOutlineX
} from 'react-icons/hi';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/projects', icon: HiOutlineFolder, label: 'Projects' },
  { path: '/sprints', icon: HiOutlineLightningBolt, label: 'Sprints' },
  { path: '/board', icon: HiOutlineViewBoards, label: 'Board' },
  { path: '/standups', icon: HiOutlineChat, label: 'Standups' },
  { path: '/team', icon: HiOutlineUsers, label: 'Team' },
  { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">DevBoard</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={toggleTheme}>
          {theme === 'dark' ? <HiOutlineSun className="sidebar-icon" /> : <HiOutlineMoon className="sidebar-icon" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button className="sidebar-link" onClick={handleLogout}>
          <HiOutlineLogout className="sidebar-icon" />
          <span>Logout</span>
        </button>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.fullName}</div>
              <div className="sidebar-user-role">{user.role?.replace('_', ' ')}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">{sidebarContent}</aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="sidebar mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
