import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Trophy, Users, ShieldAlert, Medal, Clock, Zap, UserCircle } from 'lucide-react';

const COLORS = ['#00338d', '#00c0ae', '#1e49e2', '#7213ea', '#fd349c'];

const LeadershipView = () => {
  const { nominations, currentUser, getReporteesForPM, getEffectiveCategory, externalAwards } = useAppContext();
  const navigate = useNavigate();

  // Helper to get all nested reportees recursively
  const getHierarchyReportees = (leaderName) => {
    let reportees = [];
    const direct = getReporteesForPM(leaderName) || [];
    reportees.push(...direct);
    direct.forEach(sub => {
      reportees.push(...getHierarchyReportees(sub));
    });
    return Array.from(new Set(reportees));
  };

  const managerStats = useMemo(() => {
    const everyone = getHierarchyReportees(currentUser);
    const directReportees = getReporteesForPM(currentUser) || [];
    const approved = nominations.filter(n => n.status === 'Approved' && everyone.includes(n.name));
    const pending = nominations.filter(n => n.status === 'Pending' && (directReportees.includes(n.name) || n.pm === currentUser));
    const segmentHoursSaved = approved.reduce((sum, n) => {
      const h = Number(n.hoursSaved) || (getEffectiveCategory(n) === 'Process & Efficiency' ? 15 : 0);
      return sum + h;
    }, 0);

    // Category distribution
    const catMap = {};
    // Monthly trend
    const monthMap = {};
    // Performance breakdown of direct reportees (AMs or TLs reporting to this manager)
    const reporteeScores = {};

    directReportees.forEach(rep => {
      const subHierarchy = [rep, ...getHierarchyReportees(rep)];
      reporteeScores[rep] = nominations.filter(n => n.status === 'Approved' && subHierarchy.includes(n.name)).length;
    });

    approved.forEach(n => {
      // Categories
      const cat = getEffectiveCategory(n);
      catMap[cat] = (catMap[cat] || 0) + 1;
      
      // Months
      if (n.date) {
        const d = new Date(n.date);
        const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        monthMap[mKey] = (monthMap[mKey] || 0) + 1;
      }
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const monthlyData = Object.entries(monthMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));

    const topPerformer = Object.entries(reporteeScores).sort((a, b) => b[1] - a[1])[0];

    const extApproved = externalAwards ? externalAwards.filter(a => a.status === 'Approved' && everyone.includes(a.submittedBy)) : [];

    return { 
      total: approved.length, 
      pending: pending.length, 
      extTotal: extApproved.length,
      segmentHoursSaved,
      categoryData, 
      monthlyData, 
      reporteeScores, 
      topPerformer 
    };
  }, [nominations, currentUser, getReporteesForPM, getEffectiveCategory, externalAwards]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 800 }}>Leadership Board</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Segment performance, team breakdown, and high-level analytics for {currentUser}.
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/my-dashboard')}
          style={{ fontSize: '0.85rem', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: '10px' }}
        >
          <UserCircle size={18} color="var(--primary)" /> View My Personal Badge & Portfolio
        </button>
      </div>

      {/* Stats Summary Row — Ultra-Creative Modern Glassmorphism Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Card 1: Sparklers Awards */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            borderRadius: '22px', padding: '1.4rem 1.25rem',
            border: '1px solid rgba(0, 51, 141, 0.15)',
            boxShadow: '0 10px 25px -5px rgba(0, 51, 141, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 18px 35px -5px rgba(0, 51, 141, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 51, 141, 0.06)';
          }}
        >
          {/* Watermark Icon */}
          <Trophy size={110} style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.06, color: '#00338d', transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #00338d 0%, #1e49e2 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px -2px rgba(0, 51, 141, 0.35)'
            }}>
              <Trophy size={22} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '800', padding: '0.25rem 0.7rem', borderRadius: '20px',
              background: 'rgba(0, 51, 141, 0.08)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              Active
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.3rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {managerStats.total}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.55rem' }}>
              Sparklers Awards
            </div>
          </div>
        </div>

        {/* Card 2: Segment Hours Saved */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e6fffa 100%)',
            borderRadius: '22px', padding: '1.4rem 1.25rem',
            border: '1px solid rgba(0, 192, 174, 0.25)',
            boxShadow: '0 10px 25px -5px rgba(0, 192, 174, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 18px 35px -5px rgba(0, 192, 174, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 192, 174, 0.08)';
          }}
        >
          <Clock size={110} style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.07, color: '#00c0ae', transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #00c0ae 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px -2px rgba(0, 192, 174, 0.35)'
            }}>
              <Clock size={22} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '800', padding: '0.25rem 0.7rem', borderRadius: '20px',
              background: 'rgba(0, 192, 174, 0.12)', color: '#00c0ae',
              display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em'
            }}>
              Efficiency ROI
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.3rem', fontWeight: '900', color: '#00c0ae', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {managerStats.segmentHoursSaved} <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.55rem' }}>
              Segment Hours Saved
            </div>
          </div>
        </div>

        {/* Card 3: External Awards */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)',
            borderRadius: '22px', padding: '1.4rem 1.25rem',
            border: '1px solid rgba(114, 19, 234, 0.18)',
            boxShadow: '0 10px 25px -5px rgba(114, 19, 234, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 18px 35px -5px rgba(114, 19, 234, 0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(114, 19, 234, 0.06)';
          }}
        >
          <Medal size={110} style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.07, color: '#7213ea', transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #7213ea 0%, #a855f7 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px -2px rgba(114, 19, 234, 0.35)'
            }}>
              <Medal size={22} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '800', padding: '0.25rem 0.7rem', borderRadius: '20px',
              background: 'rgba(114, 19, 234, 0.1)', color: 'var(--secondary)',
              display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em'
            }}>
              External
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.3rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {managerStats.extTotal}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.55rem' }}>
              External Awards
            </div>
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div 
          onClick={() => navigate('/pm-approvals')}
          style={{
            background: managerStats.pending > 0
              ? 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '22px', padding: '1.4rem 1.25rem',
            border: `1px solid ${managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.25)'}`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
            e.currentTarget.style.boxShadow = managerStats.pending > 0
              ? '0 18px 35px -5px rgba(245, 158, 11, 0.2)'
              : '0 18px 35px -5px rgba(34, 197, 94, 0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
          }}
        >
          <ShieldAlert size={110} style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.07, color: managerStats.pending > 0 ? '#f59e0b' : '#22c55e', transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: managerStats.pending > 0
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: managerStats.pending > 0 ? '0 6px 14px -2px rgba(245, 158, 11, 0.35)' : '0 6px 14px -2px rgba(34, 197, 94, 0.35)'
            }}>
              <ShieldAlert size={22} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '800', padding: '0.25rem 0.7rem', borderRadius: '20px',
              background: managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: managerStats.pending > 0 ? '#d97706' : '#16a34a',
              display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: managerStats.pending > 0 ? '#d97706' : '#16a34a', display: 'inline-block' }} />
              {managerStats.pending > 0 ? 'Action Needed' : 'All Clear'}
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.3rem', fontWeight: '900', color: managerStats.pending > 0 ? '#d97706' : '#16a34a', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {managerStats.pending}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.55rem' }}>
              Pending Approvals
            </div>
          </div>
        </div>

        {/* Card 5: Top Reporting Team */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
            borderRadius: '22px', padding: '1.4rem 1.25rem',
            border: '1px solid rgba(30, 73, 226, 0.2)',
            boxShadow: '0 10px 25px -5px rgba(30, 73, 226, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
            backdropFilter: 'blur(16px)',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
            e.currentTarget.style.boxShadow = '0 18px 35px -5px rgba(30, 73, 226, 0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(30, 73, 226, 0.06)';
          }}
        >
          <Users size={110} style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.07, color: '#1e49e2', transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #1e49e2 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px -2px rgba(30, 73, 226, 0.35)'
            }}>
              <Users size={22} color="#ffffff" />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '800', padding: '0.25rem 0.7rem', borderRadius: '20px',
              background: 'rgba(30, 73, 226, 0.12)', color: '#1e49e2',
              display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.03em'
            }}>
              #1 Team
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#1e49e2', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
              {managerStats.topPerformer ? `${managerStats.topPerformer[0]}` : '—'}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.55rem' }}>
              {managerStats.topPerformer ? `${managerStats.topPerformer[1]} Wins · Top Team` : 'Top Reporting Team'}
            </div>
          </div>
        </div>
      </div>

      {/* Row for Team Performance Breakdown */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>Team / Verticals Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(managerStats.reporteeScores)
              .sort((a, b) => b[1] - a[1])
              .map(([name, score], idx) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '28px', textAlign: 'center' }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{name}</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ flex: 3 }}>
                    <div style={{ background: 'var(--border)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        width: managerStats.total > 0 ? `${(score / managerStats.total) * 100}%` : '0%',
                        background: 'var(--primary)', height: '100%', borderRadius: '999px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem', minWidth: '40px', textAlign: 'right' }}>
                    {score} wins
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Category Chart */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Awards by Category</h3>
          <div style={{ height: '280px' }}>
            {managerStats.categoryData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={managerStats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {managerStats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Trends</h3>
          <div style={{ height: '280px' }}>
            {managerStats.monthlyData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={managerStats.monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,51,141,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Awards Given" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default LeadershipView;
