import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FormInput, ShieldCheck, Trophy, Palette, Home, UserCircle, Users, Award, MessageSquare, Zap } from 'lucide-react';
import { useAppContext, ROLE_USERS } from '../context/AppContext';

const Layout = () => {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, nominations, getReporteesForPM, externalAwards, feedbacks } = useAppContext();
  const navigate = useNavigate();

  // Dynamic PM pending count based on logged-in user's team
  const myReportees = getReporteesForPM(currentUser);
  const isManager = myReportees.length > 0;
  
  const pendingSparklers = nominations.filter(n => n.status === 'Pending' && myReportees.includes(n.name)).length;
  const pendingExt = externalAwards.filter(a => a.pm === currentUser && a.status === 'Pending').length;
  const pendingFbPM = (feedbacks || []).filter(f => (f.pm === currentUser || f.to === currentUser || myReportees.includes(f.submittedBy)) && f.status === 'Pending').length;
  const totalPendingPM = pendingSparklers + pendingExt + pendingFbPM;
  
  const pendingAdmin = nominations.filter(n => n.status === 'PMApproved').length;
  const unreadFeedbacks = feedbacks ? feedbacks.filter(f => f.to === currentUser && !f.acknowledged).length : 0;

  const handleRoleChange = (val) => {
    const [role, user] = val.split(':');
    setCurrentRole(role);
    setCurrentUser(user);
    navigate('/');
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <img src="/kpmg-logo.svg" alt="KPMG Logo" style={{ maxWidth: '90px' }} />
        </div>

        <div className="sidebar-nav">
          {/* My Dashboard — Personal badge & Leaderboard */}
          <NavLink to="/my-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={20} />
            My Dashboard
          </NavLink>

          {/* Leadership Board — for PM (TLs/AMs), Managers (Leadership) and Directors */}
          {['PM', 'Leadership', 'Director'].includes(currentRole) && (
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              <Home size={20} />
              Leadership Board
            </NavLink>
          )}

          {/* Sparklers — Self nominate & history */}
          {['User', 'PM', 'Admin'].includes(currentRole) && (
            <NavLink to="/sparklers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Zap size={20} />
              Sparklers
            </NavLink>
          )}

          {/* Others — Log external awards & history */}
          {['User', 'PM', 'Admin'].includes(currentRole) && (
            <NavLink to="/others" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={20} />
              Others
            </NavLink>
          )}

          {/* Feedback — Log client feedback & history */}
          {currentRole !== 'Admin' && (
            <NavLink to="/feedback" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} />
              Feedback
            </NavLink>
          )}

          {/* PM Tab — Team Dashboard & Nominate Team Member (Not for AD/Director) */}
          {isManager && currentRole !== 'Director' && (
            <NavLink to="/pm-approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              Team Dashboard
              {totalPendingPM > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
                  {totalPendingPM}
                </span>
              )}
            </NavLink>
          )}

          {/* Admin Tab */}
          {currentRole === 'Admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={20} />
              Final Approvals
              {pendingAdmin > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
                  {pendingAdmin}
                </span>
              )}
            </NavLink>
          )}

          {/* Design Generator — Admin only */}
          {currentRole === 'Admin' && (
            <NavLink to="/generator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Palette size={20} />
              Design Generator
            </NavLink>
          )}

          {/* Winners Board — always last */}
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Trophy size={20} />
            Winners Board
          </NavLink>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '250px' }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Left: Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          </div>

          {/* Right: Controls & User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>View As:</span>
              <select
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', width: 'auto', cursor: 'pointer' }}
                value={`${currentRole}:${currentUser}`}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <optgroup label="Users">
                  <option value="User:Parteek">Parteek</option>
                  <option value="User:Shreya">Shreya</option>
                  <option value="User:Ganash lal">Ganash lal</option>
                  <option value="User:Vikram">Vikram</option>
                  <option value="User:Shantanu">Shantanu</option>
                  <option value="User:Sukhvindar">Sukhvindar</option>
                  <option value="User:Sivani">Sivani</option>
                </optgroup>
                <optgroup label="Team Leads">
                  <option value="PM:Abhineet">Abhineet</option>
                  <option value="PM:Himanshu">Himanshu</option>
                  <option value="PM:Ameen">Ameen</option>
                </optgroup>
                <optgroup label="AMs">
                  <option value="PM:Ses">Ses</option>
                  <option value="PM:Rohan">Rohan</option>
                  <option value="PM:Kunal">Kunal</option>
                  <option value="PM:Monam">Monam</option>
                </optgroup>
                <optgroup label="Managers">
                  <option value="Leadership:Ashok">Ashok</option>
                  <option value="Leadership:Sol">Sol</option>
                </optgroup>
                <optgroup label="AD & Director">
                  <option value="Director:Kumaran">Kumaran (AD)</option>
                  <option value="Director:Krishan">Krishan (Director)</option>
                </optgroup>
                <optgroup label="Admin">
                  <option value="Admin:Avinash">Avinash (Admin)</option>
                </optgroup>
              </select>
            </div>

            <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>

            <div 
              onClick={() => navigate('/my-dashboard')} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.35rem 0.65rem', borderRadius: '8px', transition: 'background 0.2s' }}
              title="Click to view My Personal Dashboard & Badge"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentUser}</div>
              <UserCircle size={32} color="var(--primary)" />
            </div>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
