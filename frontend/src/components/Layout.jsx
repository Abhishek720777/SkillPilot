import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getSocket } from '../socket/socket';
import '../styles/layout.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg> },
  { to: '/practice', label: 'Practice', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" /></svg> },
  { to: '/battle', label: 'Battle', icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 8h2.5l1.5-5 3 10 1.5-5H13" /></svg> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="7" width="3" height="8" rx="1" /><rect x="6" y="4" width="3" height="11" rx="1" /><rect x="11" y="1" width="3" height="14" rx="1" /></svg> },
  { to: '/chat', label: 'Messages', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" /></svg> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const [requests, setRequests] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Normalize a request to always have a consistent 'id' field regardless of source
  const normalizeReq = (r) => ({ ...r, id: String(r._id || r.userId) });

  useEffect(() => {
    if (!user) return;
    api.get('/users/social/friends').then(r => {
      setRequests((r.data.friendRequests || []).map(normalizeReq));
    });

    const socket = getSocket();
    const handleReq = (reqData) => {
      const norm = normalizeReq(reqData);
      setRequests(prev => [...prev.filter(r => r.id !== norm.id), norm]);
    };
    socket.on('social:request', handleReq);
    return () => { socket.off('social:request', handleReq); };
  }, [user]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'accept') await api.post('/users/social/accept', { requesterId: id });
      else await api.post('/users/social/reject', { requesterId: id });
      setRequests(prev => prev.filter(r => r.id !== String(id)));
    } catch(err) { console.error('Friend action failed', err); }
  };

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="SkillPilot" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
          <span className="sidebar-logo-name">Skill<span>Pilot</span></span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate('/profile')}>
            <div className="avatar" style={{ background: user?.avatarColor || '#4F46E5', width: 30, height: 30, fontSize: 11 }}>
              {initial}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.username}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" /></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div style={{ position: 'relative' }}>
             <button className="btn btn-ghost btn-sm" style={{ padding: '8px' }} onClick={() => setShowBell(!showBell)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {requests.length > 0 && (
                   <span style={{ 
                     position: 'absolute', top: 4, right: 4, width: 8, height: 8, 
                     background: '#EF4444', borderRadius: '50%', border: '2px solid var(--bg-subtle)'
                   }} />
                )}
             </button>

             {showBell && (
               <div style={{
                 position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 320,
                 background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                 boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden'
               }}>
                 <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }}>
                   Notifications
                 </div>
                 <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                   {requests.length === 0 ? (
                     <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                        No pending friend requests.
                     </div>
                   ) : (
                     requests.map(req => (
                      <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: req.avatarColor || '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>{req.username?.[0]?.toUpperCase()}</div>
                         <div style={{ flex: 1, overflow: 'hidden' }}>
                           <div style={{ fontSize: 13, fontWeight: 600 }}>{req.username}</div>
                           <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sent a friend request</div>
                         </div>
                         <div style={{ display: 'flex', gap: 6 }}>
                           <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handleAction(req.id, 'accept')}>Accept</button>
                           <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => handleAction(req.id, 'reject')}>Reject</button>
                         </div>
                      </div>
                     ))
                   )}
                 </div>
               </div>
             )}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
           <Outlet />
        </div>
      </main>
    </div>
  );
}
