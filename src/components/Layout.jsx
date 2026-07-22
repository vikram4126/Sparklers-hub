import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FormInput, ShieldCheck, Trophy, Palette, Home, UserCircle, Users } from 'lucide-react';
import { useAppContext, ROLE_USERS } from '../context/AppContext';

const Layout = () => {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, nominations, getReporteesForPM } = useAppContext();
  const navigate = useNavigate();

  // Dynamic PM pending count based on logged-in PM's team
  const myReportees = currentRole === 'PM' ? getReporteesForPM(currentUser) : [];
  const pendingPM = nominations.filter(n => n.status === 'Pending' && myReportees.includes(n.name)).length;
  const pendingAdmin = nominations.filter(n => n.status === 'PMApproved').length;

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
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <Home size={20} />
            {currentRole === 'User' ? 'My Dashboard' : 'Home'}
          </NavLink>

          {/* Nominate - visible to PM only */}
          {currentRole === 'PM' && (
            <NavLink to="/nominate" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FormInput size={20} />
              Nominate Team Member
            </NavLink>
          )}

          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Trophy size={20} />
            Winners Board
          </NavLink>

          {/* PM Tab */}
          {currentRole === 'PM' && (
            <NavLink to="/pm-approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              Team Approvals
              {pendingPM > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>
                  {pendingPM}
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
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>Sparklers</span>
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
                <optgroup label="Users (Reportees)">
                  <option value="User:Parteek">Parteek (Abhineet's Team)</option>
                  <option value="User:Shreya">Shreya (Abhineet's Team)</option>
                  <option value="User:Ganash lal">Ganash lal (Abhineet's Team)</option>
                  <option value="User:Vikram">Vikram (Ses's Team)</option>
                  <option value="User:Shantanu">Shantanu (Ses's Team)</option>
                  <option value="User:Sukhvenar">Sukhvenar (Ses's Team)</option>
                  <option value="User:Sivani">Sivani (Himanshu's Team)</option>
                  <option value="User:Ameen">Ameen (Monam's Team)</option>
                </optgroup>
                <optgroup label="PMs & AMs (Managers)">
                  <option value="PM:Abhineet">Abhineet (PM)</option>
                  <option value="PM:Ses">Ses (PM)</option>
                  <option value="PM:Himanshu">Himanshu (PM)</option>
                  <option value="PM:Monam">Monam (AM)</option>
                </optgroup>
                <optgroup label="Admin & Leadership">
                  <option value="Admin:Sola">Sola (Admin)</option>
                  <option value="Leadership:Kumaran">Kumaran (Leadership)</option>
                </optgroup>
              </select>
            </div>

            <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', lineHeight: '1.2' }}>{currentUser}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{currentRole}</div>
              </div>
              <UserCircle size={36} color="var(--primary)" />
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
