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
    const approved = nominations.filter(n => n.status === 'Approved' && everyone.includes(n.name));
    const pending = nominations.filter(n => n.status === 'Pending' && everyone.includes(n.name));
    const segmentHoursSaved = approved.reduce((sum, n) => {
      const h = Number(n.hoursSaved) || (getEffectiveCategory(n) === 'Process & Efficiency' ? 15 : 0);
      return sum + h;
    }, 0);

    // Category distribution
    const catMap = {};
    // Monthly trend
    const monthMap = {};
    // Performance breakdown of direct reportees (AMs or TLs reporting to this manager)
    const directReportees = getReporteesForPM(currentUser) || [];
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
          <h1 style={{ margin: '0 0 0.25rem 0' }}>Welcome, {currentUser}!</h1>
          <p className="text-muted" style={{ margin: 0 }}>Here is your segment performance, team breakdown, and high-level analytics.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/my-dashboard')}
          style={{ fontSize: '0.85rem', gap: '0.45rem', padding: '0.5rem 1rem', borderRadius: '10px' }}
        >
          <UserCircle size={18} color="var(--primary)" /> View My Personal Badge & Portfolio
        </button>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        
        {/* Card 1: Sparklers Awards */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(0, 51, 141, 0.15)',
          borderTop: '4px solid var(--primary)',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(0, 51, 141, 0.1)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(0, 51, 141, 0.08)', color: 'var(--primary)' }}>
              Active
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: 'var(--primary)', lineHeight: 1.1 }}>
            {managerStats.total}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Sparklers Awards
          </div>
        </div>

        {/* Card 2: Segment Hours Saved */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(0, 192, 174, 0.06), #ffffff)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(0, 192, 174, 0.3)',
          borderTop: '4px solid #00c0ae',
          boxShadow: '0 4px 15px -3px rgba(0, 192, 174, 0.08)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(0, 192, 174, 0.15)', color: '#00c0ae',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(0, 192, 174, 0.12)', color: '#00c0ae' }}>
              Efficiency ROI
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: '#00c0ae', lineHeight: 1.1 }}>
            {managerStats.segmentHoursSaved} hrs
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Segment Hours Saved
          </div>
        </div>

        {/* Card 3: External Awards */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(114, 19, 234, 0.15)',
          borderTop: '4px solid var(--secondary)',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(114, 19, 234, 0.1)', color: 'var(--secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Medal size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(114, 19, 234, 0.08)', color: 'var(--secondary)' }}>
              External
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: 'var(--secondary)', lineHeight: 1.1 }}>
            {managerStats.extTotal}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            External Awards
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: `1px solid ${managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
          borderTop: `4px solid ${managerStats.pending > 0 ? '#f59e0b' : '#22c55e'}`,
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: managerStats.pending > 0 ? '#f59e0b' : '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert size={20} />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px',
              background: managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              color: managerStats.pending > 0 ? '#d97706' : '#16a34a'
            }}>
              {managerStats.pending > 0 ? 'Action Needed' : 'All Clear'}
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: managerStats.pending > 0 ? '#d97706' : '#16a34a', lineHeight: 1.1 }}>
            {managerStats.pending}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Pending Approvals
          </div>
        </div>

        {/* Card 5: Top Reporting Team */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(30, 73, 226, 0.15)',
          borderTop: '4px solid #1e49e2',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(30, 73, 226, 0.1)', color: '#1e49e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(30, 73, 226, 0.08)', color: '#1e49e2' }}>
              #1 Team
            </span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: '#1e49e2', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {managerStats.topPerformer ? `${managerStats.topPerformer[0]}` : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            {managerStats.topPerformer ? `${managerStats.topPerformer[1]} Wins · Top Team` : 'Top Reporting Team'}
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
