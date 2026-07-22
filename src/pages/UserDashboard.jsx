import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Medal, Trophy, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { nominations, currentUser, currentRole, getPMForUser } = useAppContext();
  const navigate = useNavigate();

  const userStats = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');
    const myAwards = approved.filter(n => n.name === currentUser);
    const total = myAwards.length;
    const categories = {};
    myAwards.forEach(n => {
      categories[n.category] = (categories[n.category] || 0) + 1;
    });
    let badge = { name: 'Bronze', color: '#cd7f32', stars: 0, icon: <Medal color="#cd7f32" size={48} /> };
    if (total >= 25) badge = { name: 'Platinum', color: '#a0b2c6', stars: 4, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 20) badge = { name: 'Platinum', color: '#a0b2c6', stars: 3, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 15) badge = { name: 'Platinum', color: '#a0b2c6', stars: 2, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 10) badge = { name: 'Platinum', color: '#a0b2c6', stars: 1, icon: <Medal color="#a0b2c6" size={48} /> };
    else if (total >= 6) badge = { name: 'Gold', color: '#ffd700', stars: 0, icon: <Medal color="#ffd700" size={48} /> };
    else if (total >= 3) badge = { name: 'Silver', color: '#b0bec5', stars: 0, icon: <Medal color="#b0bec5" size={48} /> };

    const myPastAwards = [...myAwards].sort((a, b) => new Date(b.date) - new Date(a.date));

    return { total, categories, badge, myPastAwards };
  }, [nominations, currentUser]);

  const memberLeaderboard = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');
    const scores = {};
    
    // Initialize all reportees with 0
    const ALL_REPORTEES = ['Parteek', 'Shreya', 'Ganash lal', 'Vikram', 'Shantanu', 'Sukhvenar', 'Sivani', 'Ameen'];
    ALL_REPORTEES.forEach(name => {
      scores[name] = 0;
    });
    
    approved.forEach(n => {
      if (scores[n.name] !== undefined) {
        scores[n.name]++;
      }
    });
    
    return Object.entries(scores)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [nominations]);

  const pmLeaderboard = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved');
    const pmScores = {
      'Abhineet': 0,
      'Ses': 0,
      'Himanshu': 0,
      'Monam': 0
    };
    
    approved.forEach(n => {
      const pm = getPMForUser(n.name);
      if (pmScores[pm] !== undefined) {
        pmScores[pm]++;
      }
    });
    
    const pmRoles = {
      'Abhineet': 'PM',
      'Ses': 'PM',
      'Himanshu': 'PM',
      'Monam': 'AM'
    };
    
    const pmTeamNames = {
      'Abhineet': "Abhineet's Team",
      'Ses': "Ses's Team",
      'Himanshu': "Himanshu's Team",
      'Monam': "Monam's Team"
    };
    
    return Object.entries(pmScores)
      .map(([pmName, total]) => ({
        name: `${pmName} (${pmRoles[pmName]})`,
        teamName: pmTeamNames[pmName],
        total
      }))
      .sort((a, b) => b.total - a.total);
  }, [nominations, getPMForUser]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome, {currentUser}!</h1>
          <p className="text-muted" style={{ margin: 0 }}>Here is your personal Sparklers summary (Year: Oct - Sep).</p>
        </div>
        {/* Navigate to a full screen — like switching Screen in Power Apps */}
        <button className="btn btn-primary" onClick={() => navigate('/self-nominate')}>
          <Plus size={18} />
          Self Nominate
        </button>
      </div>

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

      {/* Stats Grid */}
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
          <p className="text-muted">
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

        {/* Leaderboard Snapshot */}
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Trophy size={20} color="#f59e0b" />
            <h3 style={{ margin: 0 }}>{currentRole === 'PM' ? 'PM & AM Leaderboard' : 'All Members Leaderboard'}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentRole === 'PM' ? (
              pmLeaderboard.map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: idx < pmLeaderboard.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                    </span>
                    <div>
                      <div style={{ 
                        fontWeight: item.name.startsWith(currentUser) ? '700' : '500',
                        color: item.name.startsWith(currentUser) ? 'var(--primary)' : 'inherit'
                      }}>
                        {item.name} {item.name.startsWith(currentUser) && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(You)</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.teamName}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {item.total} <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>awards</span>
                  </div>
                </div>
              ))
            ) : (
              memberLeaderboard.map((user, idx) => (
                <div
                  key={user.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: idx < memberLeaderboard.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                    </span>
                    <span style={{
                      fontWeight: user.name === currentUser ? '700' : '500',
                      color: user.name === currentUser ? 'var(--primary)' : 'inherit'
                    }}>
                      {user.name} {user.name === currentUser && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>(You)</span>}
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {user.total} <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>awards</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* My Past Wins Section */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>My Past Wins</h3>
        {userStats.myPastAwards.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-muted">You haven't received any awards yet. Keep up the great work!</p>
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
                {userStats.myPastAwards.map(award => (
                  <tr key={award.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {award.date ? new Date(award.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td><span className="badge badge-category">{award.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>{award.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
