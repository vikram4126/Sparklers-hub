import React, { useState } from 'react';
import { useAppContext, CATEGORIES } from '../context/AppContext';
import { Check, X, Search, Award, Star } from 'lucide-react';

const PMApprovals = () => {
  const { nominations, pmApprove, rejectNomination, currentUser, getReporteesForPM,
    externalAwards, approveExternalAward, rejectExternalAward } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('sparklers'); // 'sparklers' | 'other'
  const [extRejectModal, setExtRejectModal] = useState({ open: false, id: null, reason: '' });

  const filterBySearch = (nom) => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return nom.name.toLowerCase().includes(lowerQ) ||
           nom.category.toLowerCase().includes(lowerQ) ||
           nom.reason.toLowerCase().includes(lowerQ);
  };

  const myReportees = getReporteesForPM(currentUser);

  const teamNominations = nominations
    .filter(n => myReportees.includes(n.name) && n.status === 'Pending')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const doneNominations = nominations
    .filter(n => myReportees.includes(n.name) && n.status !== 'Pending')
    .filter(filterBySearch)
    .filter(n => statusFilter === 'All' || n.status === statusFilter)
    .filter(n => categoryFilter === 'All' || n.category === categoryFilter)
    .sort((a, b) => b.id - a.id);

  const allDoneCount = nominations.filter(n => myReportees.includes(n.name) && n.status !== 'Pending').length;
  const approvedCount = nominations.filter(n => myReportees.includes(n.name) && n.status === 'Approved').length;
  const forwardedCount = nominations.filter(n => myReportees.includes(n.name) && n.status === 'PMApproved').length;
  const rejectedCount = nominations.filter(n => myReportees.includes(n.name) && n.status === 'Rejected').length;

  const [approveModal, setApproveModal] = useState({ open: false, nom: null, pmCategory: '', pmReason: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const handleApprove = () => {
    // PM category & reason are optional — blank means fallback to user's values
    pmApprove(approveModal.nom.id, approveModal.pmCategory.trim(), approveModal.pmReason.trim());
    setApproveModal({ open: false, nom: null, pmCategory: '', pmReason: '' });
  };

  const handleReject = () => {
    if (!rejectModal.reason?.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }
    rejectNomination(rejectModal.id, rejectModal.reason);
    setRejectModal({ open: false, id: null, reason: '' });
  };

  const openApprove = (nom) => {
    setApproveModal({ open: true, nom, pmCategory: '', pmReason: '' });
  };

  /* ── PM Approve Modal ───────────────────────────────── */
  if (approveModal.open && approveModal.nom) {
    const nom = approveModal.nom;
    return (
      <div className="animate-fade-in" style={{ maxWidth: '620px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Approve Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Review the nominee's details below. You may optionally add your own category and reason — if left blank, the nominee's original values will be used.
        </p>

        {/* ── Original submission (read-only) ── */}
        <div style={{ background: 'rgba(0,51,141,0.04)', border: '1px solid rgba(0,51,141,0.12)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            📄 Original Submission
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Nominee</label>
            <input type="text" className="form-input" value={nom.name} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
            <input type="text" className="form-input" value={nom.category} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason</label>
            <textarea className="form-textarea" rows="3" value={nom.reason} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed', resize: 'none' }} />
          </div>
        </div>

        {/* ── PM override (optional) ── */}
        <div style={{ background: 'rgba(114,19,234,0.04)', border: '1px solid rgba(114,19,234,0.15)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            ✏️ Your Override (Optional)
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Category <span className="text-muted" style={{ fontWeight: '400' }}>(leave blank to keep original)</span>
            </label>
            <select
              className="form-select"
              value={approveModal.pmCategory}
              onChange={e => setApproveModal({ ...approveModal, pmCategory: e.target.value })}
            >
              <option value="">— Keep original: {nom.category} —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Reason <span className="text-muted" style={{ fontWeight: '400' }}>(leave blank to keep original)</span>
            </label>
            <textarea
              className="form-textarea"
              rows="3"
              value={approveModal.pmReason}
              onChange={e => setApproveModal({ ...approveModal, pmReason: e.target.value })}
              placeholder="Add your perspective or additional context (optional)…"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setApproveModal({ open: false, nom: null, pmCategory: '', pmReason: '' })}>Cancel</button>
          <button className="btn btn-success" onClick={handleApprove}>
            <Check size={16} /> Approve & Forward to Admin
          </button>
        </div>
      </div>
    );
  }

  /* ── Reject Modal ───────────────────────────────── */
  if (rejectModal.open) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Reject Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Please provide a reason for rejection so the nominee or nominator understands why.</p>
        <div className="form-group">
          <label className="form-label">Rejection Reason (Mandatory)</label>
          <textarea
            className="form-textarea"
            rows="4"
            value={rejectModal.reason}
            onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
            placeholder="E.g., Needs more details, or doesn't fit the criteria..."
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => setRejectModal({ open: false, id: null, reason: '' })}>Cancel</button>
          <button className="btn btn-danger" onClick={handleReject}>Confirm Reject</button>
        </div>
      </div>
    );
  }

  /* ── Main List ───────────────────────────────── */
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Team Dashboard</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Review nominations and other award requests from your team.
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, category, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        <button
          onClick={() => setActiveTab('sparklers')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem',
            fontWeight: '600', fontSize: '0.9rem',
            color: activeTab === 'sparklers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'sparklers' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Star size={16} />
          Sparklers Nominations
          {teamNominations.length > 0 && (
            <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
              {teamNominations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('other')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem',
            fontWeight: '600', fontSize: '0.9rem',
            color: activeTab === 'other' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'other' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
        >
          <Award size={16} />
          Other Awards
          {externalAwards.filter(a => a.pm === currentUser && a.status === 'Pending').length > 0 && (
            <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
              {externalAwards.filter(a => a.pm === currentUser && a.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* ── SPARKLERS TAB ── */}
      {activeTab === 'sparklers' && (
        <>
          {/* Pending Nominations */}
          <h3 style={{ marginBottom: '1rem' }}>
            Pending Your Approval
            {teamNominations.length > 0 && (
              <span style={{ marginLeft: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
                {teamNominations.length}
              </span>
            )}
          </h3>

          {teamNominations.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem' }}>
              <p className="text-muted">No pending nominations from your team. ✅</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginBottom: '2rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nominee</th>
                    <th>Category</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamNominations.map(nom => (
                    <tr key={nom.id}>
                      <td style={{ fontWeight: 600 }}>{nom.name}</td>
                      <td><span className="badge badge-category">{nom.category}</span></td>
                      <td style={{ maxWidth: '300px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{nom.reason}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => openApprove(nom)}>
                            <Check size={14} /> Approve
                          </button>
                          <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setRejectModal({ open: true, id: nom.id, reason: '' })}>
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Past Actions with Filters */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>
              Past Actions
              <span style={{ marginLeft: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text)', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                {doneNominations.length} / {allDoneCount}
              </span>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
              <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(34,197,94,0.12)', color: '#15803d', border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer' }}
                onClick={() => setStatusFilter(statusFilter === 'Approved' ? 'All' : 'Approved')}>
                ✅ Approved: {approvedCount}
              </span>
              <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(99,102,241,0.12)', color: '#4338ca', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer' }}
                onClick={() => setStatusFilter(statusFilter === 'PMApproved' ? 'All' : 'PMApproved')}>
                📤 Forwarded: {forwardedCount}
              </span>
              <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(239,68,68,0.12)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}
                onClick={() => setStatusFilter(statusFilter === 'Rejected' ? 'All' : 'Rejected')}>
                ❌ Rejected: {rejectedCount}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', width: 'auto' }}>
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="PMApproved">Forwarded to Admin</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', width: 'auto' }}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(statusFilter !== 'All' || categoryFilter !== 'All') && (
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); }}>
                Clear Filters
              </button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nominee</th><th>Date</th><th>Category</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doneNominations.map(nom => (
                  <tr key={nom.id}>
                    <td style={{ fontWeight: 600 }}>{nom.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {nom.date ? new Date(nom.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td><span className="badge badge-category">{nom.category}</span></td>
                    <td>
                      <span className={`badge badge-${nom.status === 'PMApproved' ? 'pmapproved' : nom.status.toLowerCase()}`}>
                        {nom.status === 'PMApproved' ? '✅ Forwarded to Admin' : nom.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {doneNominations.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No past actions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── OTHER AWARDS TAB ── */}
      {activeTab === 'other' && (() => {
        const pendingExt = externalAwards.filter(a => a.pm === currentUser && a.status === 'Pending');
        const doneExt = externalAwards.filter(a => a.pm === currentUser && a.status !== 'Pending');

        const handleExtReject = () => {
          if (!extRejectModal.reason.trim()) return alert('Rejection reason is mandatory.');
          rejectExternalAward(extRejectModal.id, extRejectModal.reason);
          setExtRejectModal({ open: false, id: null, reason: '' });
        };

        if (extRejectModal.open) {
          return (
            <div className="glass-panel" style={{ maxWidth: '500px', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Reject Other Award</h3>
              <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Please tell the employee why this award cannot be verified.</p>
              <textarea className="form-input" rows={4} style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="e.g. Could not verify on the platform, please resubmit with a screenshot..."
                value={extRejectModal.reason}
                onChange={e => setExtRejectModal(p => ({ ...p, reason: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setExtRejectModal({ open: false, id: null, reason: '' })}>Cancel</button>
                <button className="btn btn-danger" onClick={handleExtReject}><X size={14} /> Confirm Reject</button>
              </div>
            </div>
          );
        }

        return (
          <>
            <h3 style={{ marginBottom: '1rem' }}>
              Pending Verification
              {pendingExt.length > 0 && (
                <span style={{ marginLeft: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
                  {pendingExt.length}
                </span>
              )}
            </h3>

            {pendingExt.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '2rem' }}>
                <Award size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                <p className="text-muted">No other awards pending your verification. ✅</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {pendingExt.map(award => (
                  <div key={award.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <Award size={18} color="var(--primary)" />
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{award.awardName}</span>
                        <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.1rem 0.5rem', borderRadius: '8px' }}>
                          {award.platform}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                        <strong style={{ color: 'var(--text)' }}>{award.submittedBy}</strong> · Received: {new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{award.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="btn btn-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => approveExternalAward(award.id)}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => setExtRejectModal({ open: true, id: award.id, reason: '' })}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {doneExt.length > 0 && (
              <>
                <h3 style={{ marginBottom: '1rem' }}>Past Actions</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Employee</th><th>Award</th><th>Platform</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {doneExt.map(award => (
                        <tr key={award.id}>
                          <td style={{ fontWeight: 600 }}>{award.submittedBy}</td>
                          <td>{award.awardName}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{award.platform}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {new Date(award.dateReceived).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <span className={`badge badge-${award.status.toLowerCase()}`}>{award.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        );
      })()}

    </div>
  );
};

export default PMApprovals;

