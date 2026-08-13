import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Award, Star, Filter } from 'lucide-react';

// Get the Friday of the week for a given date
// (i.e., the next Friday on or after the given date)
const getFridayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon ... 5=Fri, 6=Sat
  const daysToFriday = (5 - day + 7) % 7; // 0 if already Friday
  d.setDate(d.getDate() + daysToFriday);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatFriday = (fridayDate) => {
  return fridayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getMonthKey = (date) => {
  const mDate = new Date(date);
  if (mDate.getDate() <= 2) {
    mDate.setDate(0); // Go to previous month
  }
  return `${mDate.toLocaleString('default', { month: 'long' })} ${mDate.getFullYear()}`;
};

// Badge based on awards won in the selected month (not all-time)
const getMonthlyBadge = (count) => {
  if (count >= 3) return { label: 'Gold',   emoji: '🥇', color: '#f59e0b' };
  if (count === 2) return { label: 'Silver',  emoji: '🥈', color: '#607d8b' };
  if (count === 1) return { label: 'Bronze',  emoji: '🥉', color: '#a0785a' };
  return null;
};

const LeadershipDashboard = () => {
  const { nominations, externalAwards } = useAppContext();
  const [activeTab, setActiveTab] = useState('sparklers');

  // Build list of months that appear in the DATA (based on Friday of the week)
  const months = useMemo(() => {
    const seen = new Set();
    nominations.forEach(n => {
      if (n.status === 'Approved' && n.date) {
        const friday = getFridayOfWeek(new Date(n.date));
        seen.add(getMonthKey(friday));
      }
    });
    return [...seen].sort((a, b) => new Date(b) - new Date(a));
  }, [nominations]);

  const currentMonthStr = useMemo(() => {
    return getMonthKey(new Date());
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Filter approved nominations; group by the Friday of their week
  const sections = useMemo(() => {
    const approved = nominations.filter(n => n.status === 'Approved' && n.date);

    if (selectedMonth === 'All Time') {
      // Group by Month → then by Friday within month
      const monthMap = {};
      approved.forEach(n => {
        const friday = getFridayOfWeek(new Date(n.date));
        const mKey = getMonthKey(friday);
        const fKey = friday.toISOString();
        if (!monthMap[mKey]) monthMap[mKey] = {};
        if (!monthMap[mKey][fKey]) monthMap[mKey][fKey] = { friday, winners: [] };
        monthMap[mKey][fKey].winners.push(n);
      });

      // Sort months desc, weeks asc within month
      const result = [];
      Object.entries(monthMap)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .forEach(([mKey, weekMap]) => {
          const weeks = Object.values(weekMap).sort((a, b) => b.friday - a.friday);
          result.push({ isMonthHeader: true, label: mKey });
          weeks.forEach(w => {
            result.push({ isMonthHeader: false, friday: w.friday, winners: w.winners });
          });
        });
      return result;
    }

    // Month filter: only nominations whose Friday falls in the selected month
    const weekMap = {};
    approved.forEach(n => {
      const friday = getFridayOfWeek(new Date(n.date));
      if (getMonthKey(friday) !== selectedMonth) return; // Friday not in this month
      const fKey = friday.toISOString();
      if (!weekMap[fKey]) weekMap[fKey] = { friday, winners: [] };
      weekMap[fKey].winners.push(n);
    });

    // All Fridays in selected month using the new rule
    const [monthName, year] = selectedMonth.split(' ');
    const firstDay = new Date(`${monthName} 1, ${year}`);
    
    // Start scanning from late previous month
    const d = new Date(firstDay);
    d.setDate(d.getDate() - 10);
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); // Move to Friday

    const allFridays = [];
    for (let i = 0; i < 8; i++) { // Safely covers any month
      if (getMonthKey(d) === selectedMonth) {
        allFridays.push(new Date(d));
      }
      d.setDate(d.getDate() + 7); // Next Friday
    }

    return allFridays
      .map(friday => ({
        isMonthHeader: false,
        friday,
        winners: weekMap[friday.toISOString()] ? weekMap[friday.toISOString()].winners : []
      }))
      .filter(section => section.winners.length > 0)
      .sort((a, b) => b.friday - a.friday);
  }, [nominations, selectedMonth]);

  // Per-person win count in this month (for badge)
  const monthlyWinCount = useMemo(() => {
    const counts = {};
    if (selectedMonth === 'All Time') return counts;
    nominations.forEach(n => {
      if (n.status !== 'Approved' || !n.date) return;
      const friday = getFridayOfWeek(new Date(n.date));
      if (getMonthKey(friday) !== selectedMonth) return;
      counts[n.name] = (counts[n.name] || 0) + 1;
    });
    return counts;
  }, [nominations, selectedMonth]);

  const totalApproved = nominations.filter(n => {
    if (n.status !== 'Approved' || !n.date) return false;
    if (selectedMonth === 'All Time') return true;
    return getMonthKey(getFridayOfWeek(new Date(n.date))) === selectedMonth;
  }).length;

  const uniqueWinners = useMemo(() => {
    const names = new Set();
    nominations.forEach(n => {
      if (n.status !== 'Approved' || !n.date) return;
      if (selectedMonth !== 'All Time' && getMonthKey(getFridayOfWeek(new Date(n.date))) !== selectedMonth) return;
      names.add(n.name);
    });
    return names.size;
  }, [nominations, selectedMonth]);

  const activeWeeks = sections.filter(s => !s.isMonthHeader).length;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* ── Tab Switcher ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('sparklers')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            fontWeight: '600', fontSize: '1rem', flex: 1,
            color: activeTab === 'sparklers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'sparklers' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          <Star size={18} /> Sparklers Awards
        </button>
        <button
          onClick={() => setActiveTab('other')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            fontWeight: '600', fontSize: '1rem', flex: 1,
            color: activeTab === 'other' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'other' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          <Award size={18} /> Other Platform Awards
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={28} color="var(--primary)" />
            {activeTab === 'sparklers' ? 'Winners Board' : 'Global Portfolio'}
          </h1>
          <p className="text-muted" style={{ margin: '0.25rem 0 0' }}>
            {activeTab === 'sparklers' 
              ? 'Celebrate the weekly Sparklers champions across the company.' 
              : 'Recognitions and awards our team has received on other platforms.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }} className="glass-panel">
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ width: 'auto', border: 'none', background: 'transparent', padding: '0.4rem 0.75rem', cursor: 'pointer' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="All Time">All Time</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Badge Guide */}
      {activeTab === 'sparklers' && (
        <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        background: 'rgba(0, 51, 141, 0.04)', padding: '0.75rem 1.5rem',
        borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(0, 51, 141, 0.1)',
        fontSize: '0.85rem'
      }}>
        <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Badge Guide (per month):</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1rem' }}>🥉</span>
          <span style={{ fontWeight: '600', color: '#a0785a' }}>Bronze</span>
          <span className="text-muted">(1 win)</span>
        </div>
        <div style={{ width: '1px', height: '14px', background: 'var(--border)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1rem' }}>🥈</span>
          <span style={{ fontWeight: '600', color: '#607d8b' }}>Silver</span>
          <span className="text-muted">(2 wins)</span>
        </div>
        <div style={{ width: '1px', height: '14px', background: 'var(--border)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1rem' }}>🥇</span>
          <span style={{ fontWeight: '600', color: '#f59e0b' }}>Gold</span>
          <span className="text-muted">(3+ wins)</span>
        </div>
      </div>
      )}

      {/* Stats */}
      {activeTab === 'sparklers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { icon: <Award size={24} color="var(--primary)" />, bg: 'rgba(0,51,141,0.1)', value: totalApproved, label: 'Awards Given' },
          { icon: <Star size={24} color="var(--secondary)" />, bg: 'rgba(114,19,234,0.1)', value: uniqueWinners, label: 'Unique Winners' },
          { icon: <span style={{ fontSize: '1.2rem' }}>📅</span>, bg: 'rgba(253,52,156,0.1)', value: selectedMonth === 'All Time' ? '—' : activeWeeks, label: 'Fridays this Month' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: s.bg, borderRadius: '50%' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Week sections */}
      {activeTab === 'sparklers' && sections.map((section, idx) => {
        if (section.isMonthHeader) {
          return (
            <div key={`mh-${section.label}`} style={{ margin: '2rem 0 1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.4rem' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>{section.label}</h2>
            </div>
          );
        }

        const { friday, winners } = section;
        const weekOfMonth = Math.ceil(friday.getDate() / 7);
        const fridayLabel = `Week ${weekOfMonth} (Fri, ${formatFriday(friday)})`;

        return (
          <div key={friday.toISOString()} style={{ marginBottom: '1.25rem' }}>
            {/* Week header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.55rem 1rem',
              background: winners.length > 0 ? 'rgba(0,51,141,0.07)' : 'rgba(0,0,0,0.025)',
              borderLeft: `3px solid ${winners.length > 0 ? 'var(--primary)' : 'var(--border)'}`,
              borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)',
              borderRadius: '8px 8px 0 0',
            }}>
              <span style={{ fontWeight: '700', color: winners.length > 0 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                📧 {fridayLabel}
              </span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                {winners.length > 0 ? `${winners.length} winner${winners.length > 1 ? 's' : ''}` : 'No winner this week'}
              </span>
            </div>

            {/* Winners table OR empty state */}
            {winners.length > 0 ? (
            <div className="table-container" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '45%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Winner</th>
                      <th>Category</th>
                      <th>Reason</th>
                      <th>Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map(nom => {
                      const count = monthlyWinCount[nom.name] || 1;
                      const badge = getMonthlyBadge(count);
                      return (
                        <tr key={nom.id}>
                          <td style={{ fontWeight: 600 }}>{nom.name}</td>
                          <td>
                            <span className="badge badge-category" style={nom.category === 'Process & Efficiency' ? { backgroundColor: 'rgba(0,192,174,0.15)', color: '#00c0ae', borderColor: 'rgba(0,192,174,0.4)' } : {}}>
                              {nom.category}
                            </span>
                            {nom.hoursSaved > 0 && (
                              <span style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.75rem', color: '#00c0ae', fontWeight: '700' }}>
                                ⏱️ {nom.hoursSaved}h saved
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>{nom.reason}</td>
                          <td style={{ whiteSpace: 'nowrap', fontWeight: '600', color: badge ? badge.color : 'var(--text-muted)' }}>
                            {badge ? `${badge.emoji} ${badge.label}` : '—'}
                            {count > 1 && (
                              <span style={{ fontSize: '0.72rem', marginLeft: '0.35rem', opacity: 0.65 }}>({count}× this month)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px',
                padding: '0.75rem 1.25rem', background: 'var(--surface)',
                color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic'
              }}>
                No awards given in this week.
              </div>
            )}
          </div>
        );
      })}

      {activeTab === 'sparklers' && totalApproved === 0 && selectedMonth !== 'All Time' && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No awards found for <strong>{selectedMonth}</strong>.</p>
        </div>
      )}

      {activeTab === 'other' && (() => {
        const approvedExt = externalAwards.filter(a => a.status === 'Approved');
        const extMonths = [...new Set(approvedExt.map(a => getMonthKey(a.dateReceived)))].sort((a, b) => new Date(b) - new Date(a));
        
        const currentExtMonth = selectedMonth === 'All Time' ? 'All Time' : selectedMonth;
        let displayExt = approvedExt;
        if (currentExtMonth !== 'All Time') {
          displayExt = approvedExt.filter(a => getMonthKey(a.dateReceived) === currentExtMonth);
        }

        // Group by month
        const extSections = [];
        extMonths.forEach(m => {
          if (currentExtMonth === 'All Time' || currentExtMonth === m) {
            extSections.push({ isMonthHeader: true, label: m });
            extSections.push({
              month: m,
              winners: displayExt.filter(a => getMonthKey(a.dateReceived) === m).sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived))
            });
          }
        });

        if (approvedExt.length === 0) {
          return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
              <p className="text-muted">No external awards have been approved yet.</p>
            </div>
          );
        }

        return (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0,51,141,0.1)', borderRadius: '50%' }}>
                  <Award size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>{displayExt.length}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Total Recognitions</div>
                </div>
              </div>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(114,19,234,0.1)', borderRadius: '50%' }}>
                  <Star size={24} color="var(--secondary)" />
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>{new Set(displayExt.map(a => a.submittedBy)).size}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Unique Achievers</div>
                </div>
              </div>
            </div>

            {extSections.map((section, idx) => {
              if (section.isMonthHeader) {
                return (
                  <div key={`mh-ext-${section.label}`} style={{ margin: '2rem 0 1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.4rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>{section.label}</h2>
                  </div>
                );
              }
              
              const { winners } = section;
              if (winners.length === 0) return null;
              
              return (
                <div key={`ext-grid-${section.month}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  {winners.map(award => (
                    <div key={award.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>{award.submittedBy}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                          {award.platform}
                        </span>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>{award.awardName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>{award.description}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })()}

    </div>
  );
};

export default LeadershipDashboard;
