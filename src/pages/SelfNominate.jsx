import React, { useState, useMemo } from 'react';
import { useAppContext, CATEGORIES } from '../context/AppContext';
import { Send, Filter, CheckCircle2, Clock, XCircle, Zap, ShieldCheck, Trophy, Award } from 'lucide-react';

const getFiscalYear = (dateStr) => {
  const d = new Date(dateStr);
  const month = d.getMonth();
  const year = d.getFullYear();
  const fyStart = month >= 9 ? year : year - 1;
  return `FY ${fyStart}-${String(fyStart + 1).slice(2)}`;
};

const SelfNominate = () => {
  const { nominations, addNomination, currentUser, getPMForUser, getEffectiveCategory, getEffectiveReason } = useAppContext();
  const pm = getPMForUser(currentUser);

  // Form state
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [hoursSaved, setHoursSaved] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [error, setError] = useState('');

  // Table filters
  const [fyFilter, setFyFilter] = useState('All Time');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // All nominations for current user
  const myNominations = useMemo(() => {
    return nominations
      .filter(n => n.name === currentUser)
      .sort((a, b) => new Date(b.date || b.id) - new Date(a.date || a.id));
  }, [nominations, currentUser]);

  const approvedCount = useMemo(() => myNominations.filter(n => n.status === 'Approved').length, [myNominations]);
  const pendingCount  = useMemo(() => myNominations.filter(n => n.status === 'Pending' || n.status === 'PMApproved').length, [myNominations]);
  const totalHours    = useMemo(() => myNominations.filter(n => n.status === 'Approved').reduce((sum, n) => sum + (Number(n.hoursSaved) || 0), 0), [myNominations]);

  const fyOptions = useMemo(() => {
    const set = new Set(myNominations.map(n => getFiscalYear(n.date)));
    return ['All Time', ...Array.from(set).sort().reverse()];
  }, [myNominations]);

  const filteredNominations = useMemo(() => {
    return myNominations.filter(nom => {
      if (fyFilter !== 'All Time' && getFiscalYear(nom.date) !== fyFilter) return false;
      if (categoryFilter !== 'All' && getEffectiveCategory(nom) !== categoryFilter) return false;
      if (statusFilter !== 'All' && nom.status !== statusFilter) return false;
      return true;
    });
  }, [myNominations, fyFilter, categoryFilter, statusFilter, getEffectiveCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category) return setError('Please select a category.');
    if (!reason.trim()) return setError('Please enter why you are nominating yourself.');

    const initialStatus = ['Kumaran', 'Krishan'].includes(pm) ? 'PMApproved' : 'Pending';

    addNomination(
      {
        name: currentUser,
        category,
        reason: reason.trim(),
        hoursSaved: Number(hoursSaved) || 0,
        status: initialStatus
      },
      'User'
    );

    setSubmittedMessage(
      initialStatus === 'PMApproved'
        ? `Sparklers self-nomination submitted and sent to Admin for final approval!`
        : `Sparklers self-nomination submitted! Sent to your PM (${pm}) for review.`
    );

    setCategory('');
    setReason('');
    setHoursSaved('');
    setError('');
    setTimeout(() => setSubmittedMessage(''), 5000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Sparklers Awards</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Submit a new self-nomination on the left, and view your Sparklers profile history on the right.
          </p>
        </div>
      </div>

      {submittedMessage && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#15803d', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          {submittedMessage}
        </div>
      )}

      {/* Main Side-by-Side Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: Self-Nomination Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Zap size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Self Nomination</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Category <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={category}
                onChange={e => { setCategory(e.target.value); setError(''); }}
                required
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                <option value="" disabled>Select category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {category === 'Process & Efficiency' && (
              <div style={{ background: 'rgba(0, 192, 174, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 192, 174, 0.3)' }}>
                <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  Hours Saved per Week
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  className="form-input"
                  placeholder="e.g. 20"
                  value={hoursSaved}
                  onChange={e => setHoursSaved(e.target.value)}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            )}

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Why are you nominating yourself? <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <textarea
                className="form-input"
                rows="5"
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                required
                placeholder="Describe your achievement and impact..."
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#dc2626', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '0.75rem' }}>
              <Send size={16} /> Submit to PM ({pm})
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Profile & History Table */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Profile Header & Summary Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>My Sparklers Profile</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Personal achievement ledger for {currentUser}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0, 51, 141, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>WON</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{approvedCount}</strong>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>PENDING</span>
                <strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{pendingCount}</strong>
              </div>
              {totalHours > 0 && (
                <div style={{ background: 'rgba(0, 192, 174, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>HOURS SAVED</span>
                  <strong style={{ fontSize: '1.1rem', color: '#00c0ae' }}>{totalHours}h</strong>
                </div>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
              <Filter size={16} color="var(--primary)" />
              <span>Filter Sparklers Profile:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={fyFilter}
                onChange={e => setFyFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                {fyOptions.map(fy => <option key={fy} value={fy}>{fy}</option>)}
              </select>

              <select
                className="form-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="PMApproved">PM Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Scrollable Table Area */}
          <div className="table-container" style={{ flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
            {filteredNominations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Zap size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div>No Sparklers entries match the selected filters.</div>
              </div>
            ) : (
              <table style={{ minWidth: '600px' }}>
                <thead style={{ sticky: 'top', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Reason / Achievement</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNominations.map(nom => (
                    <tr key={nom.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {nom.date ? new Date(nom.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className="badge badge-category" style={getEffectiveCategory(nom) === 'Process & Efficiency' ? { backgroundColor: 'rgba(0,192,174,0.15)', color: '#00c0ae', borderColor: 'rgba(0,192,174,0.4)', fontSize: '0.78rem' } : { fontSize: '0.78rem' }}>
                          {getEffectiveCategory(nom)}
                        </span>
                        {nom.hoursSaved > 0 && (
                          <span style={{ display: 'inline-block', marginLeft: '0.4rem', fontSize: '0.75rem', color: '#00c0ae', fontWeight: '700' }}>
                            {nom.hoursSaved}h saved
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                        {getEffectiveReason(nom)}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {nom.status === 'Approved' && (
                          <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        )}
                        {nom.status === 'PMApproved' && (
                          <span className="badge" style={{ background: 'rgba(30,73,226,0.15)', color: '#1e49e2', border: '1px solid rgba(30,73,226,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShieldCheck size={12} /> PM Approved
                          </span>
                        )}
                        {nom.status === 'Pending' && (
                          <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Pending PM
                          </span>
                        )}
                        {nom.status === 'Rejected' && (
                          <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={nom.rejectReason}>
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SelfNominate;
