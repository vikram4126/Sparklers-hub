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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem' }}>
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

      {/* Side-by-Side Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Log External Award</h3>
          </div>

          <form onSubmit={handleOtherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Award Name <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={form.awardName}
                onChange={e => handleOtherChange('awardName', e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                <option value="">— Select Award Type —</option>
                {EXTERNAL_AWARD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {form.awardName === 'Other' && (
                <input
                  className="form-input"
                  style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.875rem' }}
                  placeholder="Enter award name..."
                  value={form.customAwardName}
                  onChange={e => handleOtherChange('customAwardName', e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Platform / Source
              </label>
              <input
                className="form-input"
                style={{ width: '100%', fontSize: '0.875rem' }}
                placeholder="e.g. KPMG Encore, Teams..."
                value={form.platform}
                onChange={e => handleOtherChange('platform', e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Date Received <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                style={{ width: '100%', fontSize: '0.875rem' }}
                value={form.dateReceived}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => handleOtherChange('dateReceived', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Description <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <textarea
                className="form-input"
                style={{ width: '100%', minHeight: '90px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }}
                placeholder="Briefly describe why you received this award..."
                value={form.description}
                onChange={e => handleOtherChange('description', e.target.value)}
                required
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>My Other Awards Profile</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>External recognition locker for {currentUser}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(124, 58, 237, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TOTAL LOGGED</span>
                <strong style={{ fontSize: '1.1rem', color: '#7c3aed' }}>{myExternal.length}</strong>
              </div>
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>APPROVED</span>
                <strong style={{ fontSize: '1.1rem', color: '#16a34a' }}>{approvedCount}</strong>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>PENDING</span>
                <strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{pendingCount}</strong>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 700 }}>
              <Filter size={16} color="var(--primary)" />
              <span>Filter Awards Profile:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select
                className="form-select"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
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
