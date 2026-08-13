import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Medal, Trophy, Plus, Award, Zap, MessageSquare } from 'lucide-react';
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
  const { nominations, currentUser, currentRole, getPMForUser, getTeamNameForUser, getDepartmentForUser, getEffectiveCategory, getEffectiveReason, getReporteesForPM, externalAwards, feedbacks } = useAppContext();
  const navigate = useNavigate();

  const [selectedFY, setSelectedFY] = useState(getCurrentFY());
  
  // Filtering state for Other Awards
  const [otherAwardsYear, setOtherAwardsYear] = useState('All Time');
  const [otherAwardsPlatform, setOtherAwardsPlatform] = useState('All Platforms');
  const [portfolioTab, setPortfolioTab] = useState('sparklers');
  const [feedbackCategory, setFeedbackCategory] = useState('All Categories');

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
                  <span key={cat} className="badge badge-category" style={cat === 'Process & Efficiency' ? { backgroundColor: 'rgba(0,192,174,0.15)', color: '#00c0ae', borderColor: 'rgba(0,192,174,0.4)', fontSize: '0.85rem' } : { fontSize: '0.85rem' }}>
                    {cat} ×{count}
                  </span>
                ))}
                {Object.keys(userStats.categories).length === 0 && (
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>No awards yet. Nominate yourself!</span>
                )}
              </div>
              {/* ── 3 Stat Boxes below badge ── */}
              {(() => {
                const totalOther = externalAwards.filter(a => a.submittedBy === currentUser).length;
                const myFbs = (feedbacks || []).filter(f => f.submittedBy === currentUser);
                const avgImpact = myFbs.length > 0
                  ? (myFbs.reduce((s, f) => s + (f.impactScore || 0), 0) / myFbs.length).toFixed(1)
                  : null;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', width: '100%', marginTop: '1.25rem' }}>
                    {[
                      { icon: <Zap size={16} />, value: userStats.total, label: 'Sparklers', sub: 'Awards', tab: 'sparklers', color: '#00338d' },
                      { icon: <Award size={16} />, value: totalOther,     label: 'Other',     sub: 'Awards',   tab: 'other',     color: '#7c3aed' },
                      { icon: <MessageSquare size={16} />, value: myFbs.length,   label: 'Client',    sub: avgImpact ? `Avg ${avgImpact}/10` : 'Feedbacks', tab: 'feedbacks', color: '#059669' },
                    ].map(stat => (
                      <button key={stat.tab} onClick={() => { setPortfolioTab(stat.tab); document.getElementById('my-portfolio')?.scrollIntoView({ behavior: 'smooth' }); }} style={{
                        border: `1.5px solid ${stat.color}22`,
                        borderRadius: '12px',
                        padding: '0.7rem 0.5rem',
                        background: `${stat.color}0a`,
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${stat.color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${stat.color}0a`; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: `${stat.color}15`, color: stat.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {stat.icon}
                        </div>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: stat.color, lineHeight: 1.1 }}>{stat.value}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', color: stat.color, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{stat.label}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{stat.sub}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
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

          {/* ── My Portfolio (Unified 3-Tab Section) ───────────────────────────── */}
          {(() => {
            const myExternal = externalAwards.filter(a => a.submittedBy === currentUser);
            const myFeedbacks = (feedbacks || []).filter(f => f.submittedBy === currentUser);
            const pendingExt = myExternal.filter(a => a.status === 'Pending');

            // Other Awards filters
            const otherYears = ['All Time', ...Array.from(new Set(myExternal.map(a => new Date(a.dateReceived).getFullYear().toString()))).sort().reverse()];
            const otherPlatforms = ['All Platforms', ...Array.from(new Set(myExternal.map(a => a.platform))).filter(Boolean).sort()];
            let filteredExternal = myExternal.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            if (otherAwardsYear !== 'All Time') filteredExternal = filteredExternal.filter(a => new Date(a.dateReceived).getFullYear().toString() === otherAwardsYear);
            if (otherAwardsPlatform !== 'All Platforms') filteredExternal = filteredExternal.filter(a => a.platform === otherAwardsPlatform);

            // Feedbacks filter
            const feedbackCategories = ['All Categories', ...Array.from(new Set(myFeedbacks.map(f => f.category))).filter(Boolean).sort()];
            const filteredFeedbacks = feedbackCategory === 'All Categories' ? myFeedbacks.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) : myFeedbacks.filter(f => f.category === feedbackCategory).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            const TABS = [
              { id: 'sparklers', label: 'Sparklers Awards', icon: <Zap size={16} />, count: filteredAwards.length },
              { id: 'other',     label: 'Other Awards',    icon: <Award size={16} />, count: myExternal.length, badge: pendingExt.length > 0 ? pendingExt.length : null },
              { id: 'feedbacks', label: 'Client Feedbacks', icon: <MessageSquare size={16} />, count: myFeedbacks.length },
            ];

            const avgImpact = myFeedbacks.length > 0
              ? (myFeedbacks.reduce((s, f) => s + (f.impactScore || 0), 0) / myFeedbacks.length).toFixed(1)
              : null;

            return (
              <div id="my-portfolio" style={{ marginTop: '3rem' }}>
                {/* Portfolio Header + Filters Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={22} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>My Portfolio</h3>
                    {pendingExt.length > 0 && (
                      <span style={{ background: '#f59e0b', color: 'white', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.72rem', fontWeight: '700' }}>
                        {pendingExt.length} pending
                      </span>
                    )}
                  </div>

                  {/* Per-tab filter controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {portfolioTab === 'sparklers' && (
                      <select className="form-select" value={selectedFY} onChange={e => setSelectedFY(e.target.value)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}>
                        {fyOptions.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                      </select>
                    )}
                    {portfolioTab === 'other' && (<>
                      <select className="form-select" value={otherAwardsPlatform} onChange={e => setOtherAwardsPlatform(e.target.value)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}>
                        {otherPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select className="form-select" value={otherAwardsYear} onChange={e => setOtherAwardsYear(e.target.value)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}>
                        {otherYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }} onClick={() => navigate('/self-nominate')}>
                        + Log Award
                      </button>
                    </>)}
                    {portfolioTab === 'feedbacks' && (<>
                      <select className="form-select" value={feedbackCategory} onChange={e => setFeedbackCategory(e.target.value)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', width: 'auto', borderRadius: '8px' }}>
                        {feedbackCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }} onClick={() => navigate('/feedback')}>
                        + Log Feedback
                      </button>
                    </>)}
                  </div>
                </div>


                {/* Tab Switcher */}
                <div style={{ display: 'flex', gap: '0.1rem', borderBottom: '2px solid var(--border)', marginTop: '1rem', marginBottom: '1.5rem' }}>
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setPortfolioTab(tab.id)} style={{
                      padding: '0.6rem 1.3rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
                      background: 'none', borderBottom: portfolioTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                      color: portfolioTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                      marginBottom: '-2px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '0.45rem'
                    }}>
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span style={{ background: '#f59e0b', color: 'white', borderRadius: '999px', padding: '0.05rem 0.45rem', fontSize: '0.68rem', fontWeight: '700' }}>
                          {tab.badge}
                        </span>
                      )}
                      {!tab.badge && tab.count > 0 && (
                        <span style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', borderRadius: '999px', padding: '0.05rem 0.45rem', fontSize: '0.68rem', fontWeight: '600' }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── TAB: Sparklers Awards ── */}
                {portfolioTab === 'sparklers' && (filteredAwards.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p className="text-muted">
                      {selectedFY === 'All Time'
                        ? "You haven't received any Sparklers awards yet. Keep up the great work!"
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
                            <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {award.date ? new Date(award.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                             <td>
                               <span className="badge badge-category" style={getEffectiveCategory(award) === 'Process & Efficiency' ? { backgroundColor: 'rgba(0,192,174,0.15)', color: '#00c0ae', borderColor: 'rgba(0,192,174,0.4)' } : {}}>
                                 {getEffectiveCategory(award)}
                               </span>
                               {award.hoursSaved > 0 && (
                                 <span style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.75rem', color: '#00c0ae', fontWeight: '700' }}>
                                   ⏱️ {award.hoursSaved}h saved
                                 </span>
                               )}
                             </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>{getEffectiveReason(award)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* ── TAB: Other Awards ── */}
                {portfolioTab === 'other' && (myExternal.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', color: '#7c3aed', marginBottom: '0.75rem' }}>
                      <Award size={36} />
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.4rem' }}>No external awards logged yet</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      Received a Rising Star, Kudos, or any award on another platform?<br />Add it here to build your full achievement portfolio.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/self-nominate')}>
                      <Award size={16} /> Log Your First Award
                    </button>
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
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
                        ) : filteredExternal.map(award => (
                          <tr key={award.id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ fontWeight: '700' }}>{award.awardName}</td>
                            <td>
                              <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                {award.platform}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>{award.description}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {award.status === 'Approved' && <span className="badge badge-approved">Approved</span>}
                              {award.status === 'Pending'  && <span className="badge badge-pending">Pending</span>}
                              {award.status === 'Rejected' && <span className="badge badge-rejected" title={award.rejectReason}>Rejected</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* ── TAB: Client Feedbacks ── */}
                {portfolioTab === 'feedbacks' && (myFeedbacks.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(5,150,105,0.1)', color: '#059669', marginBottom: '0.75rem' }}>
                      <MessageSquare size={36} />
                    </div>
                    <p style={{ fontWeight: '600', marginBottom: '0.4rem' }}>No client feedbacks logged yet</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      Received appreciation from a client via Outlook or email?<br />Log it here to build your impact portfolio.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/feedback')}>
                      <MessageSquare size={16} /> Log Your First Feedback
                    </button>
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table style={{ minWidth: '700px' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)' }}>
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Feedback Snippet</th>
                          <th>Impact Score</th>
                          <th>Attachment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedbacks.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No feedbacks match the selected category.</td></tr>
                        ) : filteredFeedbacks.map(fb => {
                          const scoreColor = fb.impactScore >= 8 ? '#22c55e' : fb.impactScore >= 5 ? '#3b82f6' : fb.impactScore >= 3 ? '#f59e0b' : '#ef4444';
                          return (
                            <tr key={fb.id}>
                              <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td>
                                <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                                  {fb.category}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '340px' }}>
                                {fb.description.length > 90 ? fb.description.slice(0, 90) + '…' : fb.description}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: scoreColor }}>{fb.impactScore}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/10</span>
                              </td>
                              <td style={{ textAlign: 'center' }}>{fb.hasAttachment ? '📎' : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default UserDashboard;
