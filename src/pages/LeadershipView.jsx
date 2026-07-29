import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Trophy, Users, ShieldAlert, Medal } from 'lucide-react';

const COLORS = ['#00338d', '#1e49e2', '#7213ea', '#fd349c', '#00c0ae'];

const LeadershipView = () => {
  const { nominations, currentUser, getReporteesForPM, getEffectiveCategory, externalAwards } = useAppContext();

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
      categoryData, 
      monthlyData, 
      reporteeScores, 
      topPerformer 
    };
  }, [nominations, currentUser, getReporteesForPM, getEffectiveCategory, externalAwards]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {currentUser}!</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Here is your segment performance, team breakdown, and high-level analytics.</p>

      {/* Stats Summary Row (3 Columns Grid: 3 Stats Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Total Segment Awards */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 51, 141, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{managerStats.total}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Sparklers Awards</div>
          </div>
        </div>

        {/* Total Segment External Awards */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(114, 19, 234, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--secondary)' }}>
            <Medal size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{managerStats.extTotal}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Other Platform Awards</div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: managerStats.pending > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', color: managerStats.pending > 0 ? 'var(--accent)' : 'var(--success)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: managerStats.pending > 0 ? 'var(--accent)' : 'var(--success)', lineHeight: 1 }}>{managerStats.pending}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Pending Team Approvals</div>
          </div>
        </div>

        {/* Top Performer */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 192, 174, 0.1)', padding: '1rem', borderRadius: '12px', color: '#00c0ae' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1.2 }}>
              {managerStats.topPerformer ? `${managerStats.topPerformer[0]} (${managerStats.topPerformer[1]} wins)` : '—'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Top Reporting Team</div>
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
