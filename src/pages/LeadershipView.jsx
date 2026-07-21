import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const COLORS = ['#00338d', '#1e49e2', '#7213ea', '#fd349c', '#00c0ae'];

const LeadershipView = () => {
  const { nominations } = useAppContext();

  // Process data for charts
  const { categoryData, monthlyData } = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');
    
    // Category distribution
    const catMap = {};
    // Monthly trend
    const monthMap = {};

    approved.forEach(n => {
      // Categories
      catMap[n.category] = (catMap[n.category] || 0) + 1;
      
      // Months
      if (n.date) {
        const d = new Date(n.date);
        const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        monthMap[mKey] = (monthMap[mKey] || 0) + 1;
      }
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    
    // Sort months chronologically
    const monthlyData = Object.entries(monthMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));

    return { categoryData, monthlyData };
  }, [nominations]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '0.25rem' }}>Leadership Analytics</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>High-level overview of Sparklers awards distribution and trends.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Category Chart */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Awards by Category</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Trends</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
          </div>
        </div>
      </div>
      
      {/* We can advise them to use the normal Leaderboard for tabular data, or include it here */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1rem' }}>Detailed Reporting</h3>
        <p className="text-muted">For a detailed tabular breakdown of every user and their badges, please visit the <a href="/leaderboard" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Full Leadership Board</a>.</p>
      </div>

    </div>
  );
};

export default LeadershipView;
