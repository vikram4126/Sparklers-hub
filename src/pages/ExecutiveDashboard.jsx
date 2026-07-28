import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Trophy, Globe, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#00338d', '#1e49e2', '#7213ea', '#fd349c', '#00c0ae'];

const ExecutiveDashboard = () => {
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

  const executiveStats = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');

    // 1. Top Level Stats
    const totalApproved = approved.length;
    const uniqueWinners = new Set(approved.map(n => n.name)).size;

    // 2. Vertical Face-off (Sol vs Ashok)
    const solTeam = ['Sol', ...getHierarchyReportees('Sol')];
    const ashokTeam = ['Ashok', ...getHierarchyReportees('Ashok')];

    const solScore = approved.filter(n => solTeam.includes(n.name)).length;
    const ashokScore = approved.filter(n => ashokTeam.includes(n.name)).length;

    // 3. Category & Monthly Data
    const catMap = {};
    const monthMap = {};
    
    // 4. Top 5 All-Stars (Company wide)
    const userScores = {};

    approved.forEach(n => {
      const cat = getEffectiveCategory(n);
      catMap[cat] = (catMap[cat] || 0) + 1;
      
      if (n.date) {
        const d = new Date(n.date);
        const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        monthMap[mKey] = (monthMap[mKey] || 0) + 1;
      }

      userScores[n.name] = (userScores[n.name] || 0) + 1;
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    const monthlyData = Object.entries(monthMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));

    const topStars = Object.entries(userScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalExtApproved = (externalAwards || []).filter(a => a.status === 'Approved').length;

    return { 
      totalApproved, 
      uniqueWinners, 
      totalExtApproved,
      solScore, 
      ashokScore,
      categoryData, 
      monthlyData, 
      topStars 
    };
  }, [nominations, getReporteesForPM, getEffectiveCategory, externalAwards]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '0.25rem' }}>Executive Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Global organization performance, vertical comparisons, and top talent recognition.</p>

      {/* Global Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 51, 141, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{executiveStats.totalApproved}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Global Sparklers Awards</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(114, 19, 234, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--secondary)' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🎖️</span>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{executiveStats.totalExtApproved}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Other Platform Awards</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 192, 174, 0.1)', padding: '1rem', borderRadius: '12px', color: '#00c0ae' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>{executiveStats.uniqueWinners}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Unique Participants</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: '#f59e0b' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f59e0b', lineHeight: 1.2 }}>
              {executiveStats.solScore > executiveStats.ashokScore ? 'Digital Segment' : (executiveStats.ashokScore > executiveStats.solScore ? 'Design & Sales' : 'Tied')}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.2rem' }}>Leading Vertical</div>
          </div>
        </div>
      </div>

      {/* Middle Row: Vertical Face-off & Wall of Fame */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Manager Face-off */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Vertical Face-off</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Comparing total segment performance across the top-level managers.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
            {/* Sol */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>Sol (Digital)</div>
              </div>
              <div style={{ flex: 3 }}>
                <div style={{ background: 'var(--border)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: executiveStats.totalApproved > 0 ? `${(executiveStats.solScore / executiveStats.totalApproved) * 100}%` : '0%',
                    background: 'var(--primary)', height: '100%', borderRadius: '999px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
              <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem', minWidth: '40px', textAlign: 'right' }}>
                {executiveStats.solScore}
              </span>
            </div>

            {/* Ashok */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>Ashok (Design/Sales)</div>
              </div>
              <div style={{ flex: 3 }}>
                <div style={{ background: 'var(--border)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: executiveStats.totalApproved > 0 ? `${(executiveStats.ashokScore / executiveStats.totalApproved) * 100}%` : '0%',
                    background: 'var(--secondary)', height: '100%', borderRadius: '999px',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
              <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '1.1rem', minWidth: '40px', textAlign: 'right' }}>
                {executiveStats.ashokScore}
              </span>
            </div>
          </div>
        </div>

        {/* Wall of Fame */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Trophy size={20} color="#f59e0b" />
            <h3 style={{ margin: 0 }}>Wall of Fame (Top 5)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {executiveStats.topStars.map(([name, score], idx) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: idx < executiveStats.topStars.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '1.1rem', width: '28px', textAlign: 'center' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                </span>
                <span style={{ fontWeight: '600', fontSize: '1rem', flex: 1 }}>{name}</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>{score} awards</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Category Chart */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Global Awards by Category</h3>
          <div style={{ height: '280px' }}>
            {executiveStats.categoryData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={executiveStats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {executiveStats.categoryData.map((entry, index) => (
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
          <h3 style={{ marginBottom: '1.5rem' }}>Global Monthly Trends</h3>
          <div style={{ height: '280px' }}>
            {executiveStats.monthlyData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executiveStats.monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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

export default ExecutiveDashboard;
