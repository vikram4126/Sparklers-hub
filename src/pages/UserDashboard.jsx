import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Medal, Trophy, Plus, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#00338d', '#1e49e2', '#7213ea', '#fd349c', '#00c0ae'];

// Fiscal Year = Oct to Sep. E.g. Oct 2025–Sep 2026 = FY 2025-26
const getFiscalYear = (dateStr) => {
  const d = new Date(dateStr);
  const month = d.getMonth(); // 0-indexed; 9 = October
  const year  = d.getFullYear();
  const fyStart = month >= 9 ? year : year - 1;
  return `FY ${fyStart}-${String(fyStart + 1).slice(2)}`;
};

const getCurrentFY = () => getFiscalYear(new Date().toISOString());

const UserDashboard = () => {
  const { nominations, currentUser, currentRole, getPMForUser, getTeamNameForUser, getDepartmentForUser, getEffectiveCategory, getEffectiveReason, getReporteesForPM, externalAwards } = useAppContext();
  const navigate = useNavigate();

  const [selectedFY, setSelectedFY] = useState(getCurrentFY());
  
  // Filtering state for Other Awards
  const [otherAwardsYear, setOtherAwardsYear] = useState('All Time');
  const [otherAwardsPlatform, setOtherAwardsPlatform] = useState('All Platforms');

  // All approved awards for current user
  const allMyAwards = useMemo(() => {
    return nominations
      .filter(n => n.status === 'Approved' && n.name === currentUser)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [nominations, currentUser]);

  // FY options derived from data (deduplicated, sorted desc) + "All Time"
  const fyOptions = useMemo(() => {
    const years = new Set(allMyAwards.map(n => getFiscalYear(n.date)));
    return ['All Time', ...Array.from(years).sort().reverse()];
  }, [allMyAwards]);

  // Awards filtered by selected FY
  const filteredAwards = useMemo(() => {
    if (selectedFY === 'All Time') return allMyAwards;
    return allMyAwards.filter(n => getFiscalYear(n.date) === selectedFY);
  }, [allMyAwards, selectedFY]);

  const userStats = useMemo(() => {
    const awards = filteredAwards;
    const total = awards.length;
    const categories = {};
    awards.forEach(n => {
      const cat = getEffectiveCategory(n);
      categories[cat] = (categories[cat] || 0) + 1;
    });
    let badge = { name: 'Novice', color: '#9e9e9e', stars: 0, icon: <Medal color="#9e9e9e" size={48} style={{ opacity: 0.5 }} /> };
    if (total >= 25) badge = { name: 'Platinum', color: '#a0b2c6', stars: 4, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 20) badge = { name: 'Platinum', color: '#a0b2c6', stars: 3, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 15) badge = { name: 'Platinum', color: '#a0b2c6', stars: 2, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 10) badge = { name: 'Platinum', color: '#a0b2c6', stars: 1, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 6)  badge = { name: 'Gold',     color: '#ffd700', stars: 0, icon: <Medal color="#ffd700" size={48} /> };
    else if (total >= 3)  badge = { name: 'Silver',   color: '#b0bec5', stars: 0, icon: <Medal color="#b0bec5" size={48} /> };
    else if (total >= 1)  badge = { name: 'Bronze',   color: '#cd7f32', stars: 0, icon: <Medal color="#cd7f32" size={48} /> };

    return { total, categories, badge };
  }, [filteredAwards, getEffectiveCategory]);

  // Dynamic Leaderboard list based on current user role category
  // Users see their own direct awards.
  // TLs see total awards won by their team reportees + their own.
  // AMs see total awards won by their reportees (including nested TLs and their users) + their own.
  // Managers/AD/Directors see total awards won by all people in their hierarchy chain.
  const dynamicLeaderboard = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');

    // Mappings for roles
    const pmRoles = {
      'Abhineet': 'TL', 'Himanshu': 'TL', 'Ameen': 'TL',
      'Ses': 'AM', 'Monam': 'AM',
      'Ashok': 'Manager', 'Sol': 'Manager', 'Kumaran': 'AD', 'Krishan': 'Director'
    };

    const userLevel = pmRoles[currentUser] || 'User';

    // Helper to get all nested reportees (recursive hierarchy count)
    const getHierarchyReportees = (leaderName) => {
      let reportees = [];
      const direct = getReporteesForPM(leaderName);
      reportees.push(...direct);
      direct.forEach(sub => {
        reportees.push(...getHierarchyReportees(sub));
      });
      return Array.from(new Set(reportees));
    };

    if (userLevel === 'User') {
      // Regular Users: only count their own direct awards
      const ALL_USERS = ['Parteek', 'Shreya', 'Ganash lal', 'Vikram', 'Shantanu', 'Sukhvindar', 'Sivani'];
      const scores = {};
      ALL_USERS.forEach(name => { scores[name] = 0; });
      approved.forEach(n => {
        if (scores[n.name] !== undefined) {
          scores[n.name]++;
        }
      });
      return Object.entries(scores)
        .map(([name, total]) => ({
          name,
          roleLabel: 'User',
          department: getDepartmentForUser(name),
          total
        }))
        .sort((a, b) => b.total - a.total);
    } else if (userLevel === 'TL') {
      // Team Leads: count direct awards + all their reportees' awards
      const ALL_TLS = ['Abhineet', 'Himanshu', 'Ameen'];
      const scores = {};
      ALL_TLS.forEach(tl => {
        const team = getHierarchyReportees(tl);
        // Include TL's own awards + team awards
        scores[tl] = approved.filter(n => n.name === tl || team.includes(n.name)).length;
      });
      return Object.entries(scores)
        .map(([name, total]) => ({
          name: `${name} (TL)`,
          roleLabel: 'TL',
          department: getDepartmentForUser(name),
          total
        }))
        .sort((a, b) => b.total - a.total);
    } else if (userLevel === 'AM') {
      // Associate Managers: count direct awards + all nested reportees' awards in their segment
      const ALL_AMS = ['Ses', 'Monam', 'Rohan', 'Kunal'];
      const scores = {};
      ALL_AMS.forEach(am => {
        const team = getHierarchyReportees(am);
        scores[am] = approved.filter(n => n.name === am || team.includes(n.name)).length;
      });
      return Object.entries(scores)
        .map(([name, total]) => ({
          name: name,
          roleLabel: 'AM',
          department: getDepartmentForUser(name),
          total
        }))
        .sort((a, b) => b.total - a.total);
    } else {
      // Managers group (AD and Director are excluded to only compare Ashok vs Sol)
      const ALL_MANAGEMENT = ['Sol', 'Ashok'];
      const scores = {};
      ALL_MANAGEMENT.forEach(mgr => {
        const team = getHierarchyReportees(mgr);
        scores[mgr] = approved.filter(n => n.name === mgr || team.includes(n.name)).length;
      });
      return Object.entries(scores)
        .map(([name, total]) => ({
          name: `${name} (${pmRoles[name]})`,
          roleLabel: pmRoles[name],
          department: getDepartmentForUser(name),
          total
        }))
        .sort((a, b) => b.total - a.total);
    }
  }, [nominations, currentUser, getDepartmentForUser, getReporteesForPM]);

  // AM check
  const isAM = ['Ses', 'Monam'].includes(currentUser) && currentRole === 'PM';

  // AM: compute team stats for summary cards
  const amTeamStats = useMemo(() => {
    if (!isAM) return null;
    const allReportees = getReporteesForPM(currentUser) || [];
    // Also include nested reportees (TLs and their users)
    const nested = [];
    allReportees.forEach(r => {
      const sub = getReporteesForPM(r);
      if (sub.length) nested.push(...sub);
    });
    const everyone = [...new Set([...allReportees, ...nested])];
    const approved = nominations.filter(n => n.status === 'Approved' && everyone.includes(n.name));
    const pending  = nominations.filter(n => n.status === 'Pending'  && everyone.includes(n.name));

    // Count per TL (direct reportees of AM)
    const tlScores = {};
    allReportees.forEach(tl => {
      const tlReportees = getReporteesForPM(tl);
      const tlEveryone = [tl, ...tlReportees];
      tlScores[tl] = approved.filter(n => tlEveryone.includes(n.name)).length;
    });
    const topTL = Object.entries(tlScores).sort((a, b) => b[1] - a[1])[0];
    const categoryBreakdown = {};
    approved.forEach(n => {
      const cat = getEffectiveCategory(n);
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    return { total: approved.length, pending: pending.length, topTL, categoryBreakdown, tlScores };
  }, [isAM, nominations, currentUser, getReporteesForPM, getEffectiveCategory]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {currentUser}!</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            {isAM ? 'Team performance overview — your teams\' Sparklers activity.' : 'Here is your personal Sparklers summary (Year: Oct - Sep).'}
          </p>
        </div>
        {/* Self Nominate — only for Users and TLs. AMs and above cannot self-nominate */}
        {(currentRole === 'User' || (currentRole === 'PM' && !['Ses', 'Monam'].includes(currentUser))) && (
          <button className="btn btn-primary" onClick={() => navigate('/self-nominate')}>
            <Plus size={18} />
            Self Nominate
          </button>
        )}
      </div>

      {/* ── AM View ─────────────────────────────────────── */}
      {isAM && amTeamStats ? (
        <>
          {/* Stat Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Total Team Awards */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{amTeamStats.total}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>Total Team Awards</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>All Time</div>
            </div>

            {/* Pending Nominations */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: amTeamStats.pending > 0 ? 'var(--accent)' : 'var(--success)', lineHeight: 1 }}>
                {amTeamStats.pending}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '600' }}>Pending Nominations</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {amTeamStats.pending > 0 ? 'Awaiting action' : 'All clear ✅'}
              </div>
            </div>

            {/* Top Performer TL */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>🥇</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.4rem' }}>
                {amTeamStats.topTL ? amTeamStats.topTL[0] : '—'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: '600' }}>Leading Team Lead</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {amTeamStats.topTL ? `${amTeamStats.topTL[1]} awards` : ''}
              </div>
            </div>
          </div>

          {/* TL Breakdown + Category Pills + Leaderboard side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* TL Score Breakdown */}
            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem' }}>Team Lead Performance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(amTeamStats.tlScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tl, score], idx) => (
                    <div key={tl} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', width: '24px' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tl}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Team Lead</div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ flex: 2 }}>
                        <div style={{ background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                          <div style={{
                            width: amTeamStats.total > 0 ? `${(score / amTeamStats.total) * 100}%` : '0%',
                            background: 'var(--primary)', height: '100%', borderRadius: '999px',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem', minWidth: '40px', textAlign: 'right' }}>
                        {score}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Awards by Category</h3>
              <div style={{ flex: 1, minHeight: '260px' }}>
                {Object.keys(amTeamStats.categoryBreakdown).length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(amTeamStats.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(amTeamStats.categoryBreakdown).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Peer Leaderboard */}
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Trophy size={20} color="#f59e0b" />
                <h3 style={{ margin: 0 }}>Leaderboard</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dynamicLeaderboard.map((user, idx) => (
                  <div
                    key={user.name}
                    style={{
                      display: 'flex', alignItems: 'center',
                      paddingBottom: '0.75rem',
                      borderBottom: idx < dynamicLeaderboard.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                      </span>
                      <span style={{
                        fontWeight: (user.name === currentUser || user.name.startsWith(currentUser)) ? '700' : '500',
                        color: (user.name === currentUser || user.name.startsWith(currentUser)) ? 'var(--primary)' : 'inherit'
                      }}>
                        {user.name} {(user.name === currentUser || user.name.startsWith(currentUser)) && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(You)</span>}
                      </span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      {user.department && (
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(0,51,141,0.08)', color: 'var(--primary)' }}>
                          {user.department}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {user.total} <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>awards</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── Regular User / TL View ─────────────────── */}
          {/* Badge Guide */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
            background: 'rgba(0, 51, 141, 0.04)', padding: '0.75rem 1.5rem',
            borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(0, 51, 141, 0.1)',
            fontSize: '0.85rem'
          }}>
            <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Yearly Journey:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem' }}>🥉</span>
              <span style={{ fontWeight: '600', color: '#cd7f32' }}>Bronze</span>
              <span className="text-muted">(1)</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem' }}>🥈</span>
              <span style={{ fontWeight: '600', color: '#b0bec5' }}>Silver</span>
              <span className="text-muted">(3)</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem' }}>🥇</span>
              <span style={{ fontWeight: '600', color: '#ffd700' }}>Gold</span>
              <span className="text-muted">(6)</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem' }}>💎</span>
              <span style={{ fontWeight: '600', color: '#8e8e8e' }}>Platinum:</span>
              <span className="badge" style={{ background: '#e5e4e2', color: '#333' }}>⭐ (10)</span>
              <span className="badge" style={{ background: '#e5e4e2', color: '#333' }}>⭐⭐ (15)</span>
              <span className="badge" style={{ background: '#e5e4e2', color: '#333' }}>⭐⭐⭐ (20)</span>
              <span className="badge" style={{ background: '#e5e4e2', color: '#333' }}>⭐⭐⭐⭐ (25+)</span>
            </div>
          </div>

          {/* Stats & Leaderboards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* My Badge Card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>My Current Badge</h3>
              <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '50%', position: 'relative' }}>
                {userStats.badge.icon}
                {userStats.badge.stars > 0 && (
                  <div style={{
                    position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: '0.1rem', background: 'white', padding: '0.2rem 0.5rem',
                    borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    {Array(userStats.badge.stars).fill('⭐').map((s, i) => (
                      <span key={i} style={{ fontSize: '0.85rem' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <h2 style={{ color: userStats.badge.color }}>{userStats.badge.name} Level</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                <span style={{ background: 'rgba(0,51,141,0.07)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.78rem' }}>
                  {selectedFY}
                </span>
              </p>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                You have won a total of <strong>{userStats.total}</strong> Sparklers awards!
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                {Object.entries(userStats.categories).map(([cat, count]) => (
                  <span key={cat} className="badge badge-category" style={{ fontSize: '0.85rem' }}>
                    {cat} ×{count}
                  </span>
                ))}
                {Object.keys(userStats.categories).length === 0 && (
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>No awards yet. Nominate yourself!</span>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Trophy size={20} color="#f59e0b" />
                <h3 style={{ margin: 0 }}>Leaderboard</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dynamicLeaderboard.map((user, idx) => (
                  <div
                    key={user.name}
                    style={{
                      display: 'flex', alignItems: 'center',
                      paddingBottom: '0.75rem',
                      borderBottom: idx < dynamicLeaderboard.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                      </span>
                      <span style={{
                        fontWeight: (user.name === currentUser || user.name.startsWith(currentUser)) ? '700' : '500',
                        color: (user.name === currentUser || user.name.startsWith(currentUser)) ? 'var(--primary)' : 'inherit'
                      }}>
                        {user.name} {(user.name === currentUser || user.name.startsWith(currentUser)) && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(You)</span>}
                      </span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {user.department && (
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '20px', background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                          {user.department}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {user.total} <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>awards</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Achievement Locker */}
          {(() => {
            const myExternal = externalAwards.filter(a => a.submittedBy === currentUser);
            
            // Extract distinct years and platforms for filters
            const otherYears = ['All Time', ...Array.from(new Set(myExternal.map(a => new Date(a.dateReceived).getFullYear().toString()))).sort().reverse()];
            const otherPlatforms = ['All Platforms', ...Array.from(new Set(myExternal.map(a => a.platform))).filter(Boolean).sort()];
            
            // Filter data
            let filteredExternal = myExternal.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            if (otherAwardsYear !== 'All Time') {
              filteredExternal = filteredExternal.filter(a => new Date(a.dateReceived).getFullYear().toString() === otherAwardsYear);
            }
            if (otherAwardsPlatform !== 'All Platforms') {
              filteredExternal = filteredExternal.filter(a => a.platform === otherAwardsPlatform);
            }
            
            const pendingExt = myExternal.filter(a => a.status === 'Pending');

            return (
              <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={22} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>My Achievement Locker</h3>
                    {pendingExt.length > 0 && (
                      <span style={{ background: '#f59e0b', color: 'white', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.72rem', fontWeight: '700' }}>
                        {pendingExt.length} pending
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <select
                      className="form-select"
                      value={otherAwardsPlatform}
                      onChange={e => setOtherAwardsPlatform(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}
                    >
                      {otherPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select
                      className="form-select"
                      value={otherAwardsYear}
                      onChange={e => setOtherAwardsYear(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}
                    >
                      {otherYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }} onClick={() => navigate('/self-nominate')}>
                      + Log an Award
                    </button>
                  </div>
                </div>

                {myExternal.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
                    <p style={{ fontWeight: '600', marginBottom: '0.4rem' }}>No external awards logged yet</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      Received a Rising Star, Kudos, or any other award on a different platform?<br />Add it here to build your complete achievement portfolio.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/self-nominate')}>
                      <Award size={16} /> Log Your First Award
                    </button>
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ minWidth: '800px' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)' }}>
                        <tr>
                          <th>Date</th>
                          <th>Award Name</th>
                          <th>Platform</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExternal.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No awards match the selected filters.</td></tr>
                        ) : (
                          filteredExternal.map(award => (
                            <tr key={award.id}>
                              <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                                {new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ fontWeight: '700', color: 'var(--text)' }}>{award.awardName}</td>
                              <td>
                                <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                  {award.platform}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                                {award.description}
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {award.status === 'Approved' && <span className="badge badge-approved">Approved</span>}
                                {award.status === 'Pending'  && <span className="badge badge-pending">Pending</span>}
                                {award.status === 'Rejected' && <span className="badge badge-rejected" title={award.rejectReason}>Rejected</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* My Past Wins Section */}
          <div style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>My Past Wins</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Year:</span>
                <select
                  className="form-select"
                  value={selectedFY}
                  onChange={e => setSelectedFY(e.target.value)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', cursor: 'pointer', borderRadius: '8px' }}
                >
                  {fyOptions.map(fy => (
                    <option key={fy} value={fy}>{fy}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredAwards.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                <p className="text-muted">
                  {selectedFY === 'All Time'
                    ? "You haven't received any awards yet. Keep up the great work!"
                    : `No awards found for ${selectedFY}.`}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAwards.map(award => (
                      <tr key={award.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {award.date ? new Date(award.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td><span className="badge badge-category">{getEffectiveCategory(award)}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>{getEffectiveReason(award)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
