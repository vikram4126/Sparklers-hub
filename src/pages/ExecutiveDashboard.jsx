import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Trophy, Globe, Users, TrendingUp, Medal, Zap, Clock } from 'lucide-react';

const COLORS = ['#00338d', '#00c0ae', '#1e49e2', '#7213ea', '#fd349c'];

const ExecutiveDashboard = () => {
  const { nominations, currentUser, getReporteesForPM, getEffectiveCategory, externalAwards, getEfficiencyStats } = useAppContext();

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

  const effStats = getEfficiencyStats();

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
      <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {currentUser}!</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Global organization performance, efficiency ROI metrics, vertical comparisons, and top talent recognition.</p>

      {/* Global Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        
        {/* Card 1: Global Sparklers */}
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
              <Globe size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(0, 51, 141, 0.08)', color: 'var(--primary)' }}>
              Global
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: 'var(--primary)', lineHeight: 1.1 }}>
            {executiveStats.totalApproved}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Global Sparklers
          </div>
        </div>

        {/* Card 2: Total Hours Saved */}
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
            {effStats.totalHours} hrs
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Total Hours Saved
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
            {executiveStats.totalExtApproved}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            External Awards
          </div>
        </div>

        {/* Card 4: Unique Participants */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(0, 192, 174, 0.15)',
          borderTop: '4px solid #00c0ae',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(0, 192, 174, 0.1)', color: '#00c0ae',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(0, 192, 174, 0.08)', color: '#00c0ae' }}>
              People
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: 'var(--primary)', lineHeight: 1.1 }}>
            {executiveStats.uniqueWinners}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Unique Participants
          </div>
        </div>

        {/* Card 5: Leading Vertical */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
          borderRadius: '16px', padding: '1.25rem 1.1rem',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderTop: '4px solid #f59e0b',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)',
          position: 'relative', overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Trophy size={20} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.55rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
              #1 Segment
            </span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: "'Open Sans Condensed', sans-serif", color: '#f59e0b', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {executiveStats.solScore > executiveStats.ashokScore ? 'Digital Segment' : (executiveStats.ashokScore > executiveStats.solScore ? 'Design & Sales' : 'Tied')}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
            Leading Vertical
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
            <h3 style={{ margin: 0 }}>Wall of Fame (Top Winners)</h3>
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

        {/* Efficiency & Automation Champions */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 192, 174, 0.3)', background: 'linear-gradient(135deg, rgba(0,192,174,0.03), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={20} color="#00c0ae" />
            <h3 style={{ margin: 0 }}>⚡ Efficiency Champions (Hours Saved)</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {effStats.topContributors.slice(0, 5).map((item, idx) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: idx < 4 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: '1.1rem', width: '28px', textAlign: 'center' }}>
                  {idx === 0 ? '⚡' : idx === 1 ? '⚙️' : '⏱️'}
                </span>
                <span style={{ fontWeight: '600', fontSize: '1rem', flex: 1 }}>{item.name}</span>
                <span style={{ fontWeight: '800', color: '#00c0ae', fontSize: '0.95rem' }}>{item.hours} hrs saved</span>
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
