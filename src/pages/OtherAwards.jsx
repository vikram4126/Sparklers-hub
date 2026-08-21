import React, { useState, useMemo } from 'react';
import { useAppContext, EXTERNAL_AWARD_TYPES } from '../context/AppContext';
import { Award, Send, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';

const OtherAwards = () => {
  const { externalAwards, addExternalAward, currentUser, getPMForUser } = useAppContext();
  const pm = getPMForUser(currentUser);

  // Form state
  const [form, setForm] = useState({
    awardName: '',
    customAwardName: '',
    platform: '',
    dateReceived: '',
    description: ''
  });
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [error, setError] = useState('');

  // Table filter states
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [yearFilter, setYearFilter] = useState('All Time');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filtered awards for logged in user
  const myExternal = useMemo(() => {
    return externalAwards
      .filter(a => a.submittedBy === currentUser)
      .sort((a, b) => new Date(b.submittedAt || b.dateReceived) - new Date(a.submittedAt || a.dateReceived));
  }, [externalAwards, currentUser]);

  const approvedCount = useMemo(() => myExternal.filter(a => a.status === 'Approved').length, [myExternal]);
  const pendingCount  = useMemo(() => myExternal.filter(a => a.status === 'Pending').length, [myExternal]);

  const platformOptions = useMemo(() => {
    const set = new Set(myExternal.map(a => a.platform).filter(Boolean));
    return ['All Platforms', ...Array.from(set).sort()];
  }, [myExternal]);

  const yearOptions = useMemo(() => {
    const set = new Set(myExternal.map(a => new Date(a.dateReceived).getFullYear().toString()));
    return ['All Time', ...Array.from(set).sort().reverse()];
  }, [myExternal]);

  const filteredAwards = useMemo(() => {
    return myExternal.filter(award => {
      if (platformFilter !== 'All Platforms' && award.platform !== platformFilter) return false;
      if (yearFilter !== 'All Time' && new Date(award.dateReceived).getFullYear().toString() !== yearFilter) return false;
      if (statusFilter !== 'All' && award.status !== statusFilter) return false;
      return true;
    });
  }, [myExternal, platformFilter, yearFilter, statusFilter]);

  const handleOtherChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const finalAwardName = form.awardName === 'Other' ? form.customAwardName.trim() : form.awardName;

  const handleOtherSubmit = (e) => {
    e.preventDefault();
    if (!finalAwardName) return setError('Please select or enter an award name.');
    if (!form.dateReceived) return setError('Please select the date received.');
    if (!form.description.trim()) return setError('Please provide a short description.');

    const initialStatus = ['Kumaran', 'Krishan'].includes(pm) ? 'Approved' : 'Pending';

    addExternalAward({
      submittedBy: currentUser,
      awardName: finalAwardName,
      platform: form.platform.trim() || 'Not specified',
      dateReceived: form.dateReceived,
      description: form.description.trim(),
      status: initialStatus
    });

    setSubmittedMessage(
      initialStatus === 'Approved'
        ? `Award "${finalAwardName}" logged and automatically approved!`
        : `Award "${finalAwardName}" submitted! Pending PM review from ${pm}.`
    );

    setForm({ awardName: '', customAwardName: '', platform: '', dateReceived: '', description: '' });
    setTimeout(() => setSubmittedMessage(''), 5000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Other Awards</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Log external awards on the left, and view your external awards profile history on the right.
          </p>
        </div>
      </div>

      {submittedMessage && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#15803d', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          {submittedMessage}
        </div>
      )}

      {/* TOP ROW: 3 Crisp KPMG Metric Banners (Matching Image Layout - Clean, No Left Border) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', flexShrink: 0 }}>
        
        {/* Metric 1: Total Logged */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL LOGGED
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7213ea', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {myExternal.length}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(114, 19, 234, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} color="#7213ea" />
          </div>
        </div>

        {/* Metric 2: Approved */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              APPROVED AWARDS
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {approvedCount}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(5, 150, 105, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#059669" />
          </div>
        </div>

        {/* Metric 3: Pending Review */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PENDING PM REVIEW
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {pendingCount}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#d97706" />
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: External Awards Form Card (Left) + Full History Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT CARD: Compact Form */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Award size={18} color="#00338d" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Log External Award</h3>
          </div>

          <form onSubmit={handleOtherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Award Name <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={form.awardName}
                onChange={e => handleOtherChange('awardName', e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                <option value="" disabled>Select award type...</option>
                {EXTERNAL_AWARD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {form.awardName === 'Other' && (
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Custom Award Name <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Star of the Month"
                  value={form.customAwardName}
                  onChange={e => handleOtherChange('customAwardName', e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Platform / Issuer</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. KPMG Global"
                  value={form.platform}
                  onChange={e => handleOtherChange('platform', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Date Received <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dateReceived}
                  onChange={e => handleOtherChange('dateReceived', e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Description / Citation <span style={{ color: 'var(--accent)' }}>*</span></label>
              <textarea
                className="form-input"
                rows="3"
                value={form.description}
                onChange={e => handleOtherChange('description', e.target.value)}
                required
                placeholder="Describe why you received this award..."
                style={{ width: '100%', resize: 'none', fontFamily: 'inherit', fontSize: '0.875rem' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.5rem 0.8rem', color: '#dc2626', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', background: '#00338d', fontWeight: 700 }}>
              <Send size={15} /> Submit Award ➢
            </button>
          </form>
        </div>

        {/* RIGHT CARD: Full History Table (Only this card scrolls!) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          
          {/* Table Header & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem', flexShrink: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800 }}>Full External Awards History</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Complete record of all logged non-Sparklers awards</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Filter size={14} color="var(--text-muted)" />
                <select
                  className="form-select"
                  value={platformFilter}
                  onChange={e => setPlatformFilter(e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                >
                  {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <select
                className="form-select"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Scrollable Table Area */}
          <div className="table-container" style={{ flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
            {filteredAwards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Award size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div>No external awards match the selected filters.</div>
              </div>
            ) : (
              <table style={{ minWidth: '600px' }}>
                <thead style={{ sticky: 'top', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th>Date</th>
                    <th>Award Name</th>
                    <th>Platform</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAwards.map(award => (
                    <tr key={award.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontWeight: '700', fontSize: '0.9rem' }}>{award.awardName}</td>
                      <td>
                        <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                          {award.platform}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '240px' }}>{award.description}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {award.status === 'Approved' && (
                          <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        )}
                        {award.status === 'Pending' && (
                          <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Pending PM
                          </span>
                        )}
                        {award.status === 'Rejected' && (
                          <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={award.rejectReason}>
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

export default OtherAwards;
