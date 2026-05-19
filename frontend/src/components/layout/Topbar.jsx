import { useNotifications } from '../../context/NotificationContext';
import { HiOutlineBell } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Topbar.css';

export default function Topbar({ title }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions" ref={dropdownRef}>
        <button
          className="notif-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          id="notification-toggle"
        >
          <HiOutlineBell />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="notif-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllAsRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="notif-dot" />
                      <div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">
                          {new Date(n.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
