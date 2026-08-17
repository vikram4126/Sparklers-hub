import React, { useState } from 'react';
import { useAppContext, CATEGORIES } from '../context/AppContext';
import { Check, X, Search } from 'lucide-react';

const AdminVerification = () => {
  const {
    nominations, adminApprove, rejectNomination,
    externalAwards, approveExternalAward, rejectExternalAward,
    getPMForUser, getTeamNameForUser,
    getEffectiveCategory, getEffectiveReason,
    feedbacks, acknowledgeFeedback
  } = useAppContext();

  const [rejectModal, setRejectModal]   = useState({ open: false, id: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ open: false, nom: null, adminCategory: '', adminReason: '' });
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeTab, setActiveTab]       = useState('nominations');

  // All Nominations Overview Filters
  const [overviewStatusFilter, setOverviewStatusFilter]     = useState('All');
  const [overviewCategoryFilter, setOverviewCategoryFilter] = useState('All');

  const filterBySearch = (nom) => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return nom.name.toLowerCase().includes(lowerQ) ||
           nom.category.toLowerCase().includes(lowerQ) ||
           nom.reason.toLowerCase().includes(lowerQ);
  };

  const pendingAdmin = nominations
    .filter(n => n.status === 'PMApproved')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const pendingExtAdmin = externalAwards
    .filter(a => a.status === 'AdminPending')
    .sort((a, b) => b.id - a.id);

  const pendingPM = nominations
    .filter(n => n.status === 'Pending')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const allOverviewNominations = nominations
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const filteredOverviewNominations = allOverviewNominations
    .filter(n => overviewStatusFilter === 'All' || n.status === overviewStatusFilter)
    .filter(n => overviewCategoryFilter === 'All' || getEffectiveCategory(n) === overviewCategoryFilter);

  const handleReject = () => {
    if (!rejectModal.reason?.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }
    rejectNomination(rejectModal.id, rejectModal.reason);
    setRejectModal({ open: false, id: null, reason: '' });
  };

  const handleApprove = () => {
    adminApprove(
      approveModal.nom.id,
      approveModal.adminCategory.trim(),
      approveModal.adminReason.trim()
    );
    setApproveModal({ open: false, nom: null, adminCategory: '', adminReason: '' });
  };

  const statusClass = (status) => {
    if (status === 'PMApproved') return 'badge-pmapproved';
    return `badge-${status.toLowerCase()}`;
  };

  const statusLabel = (status) => {
    if (status === 'PMApproved') return 'Awaiting Admin';
    return status;
  };

  /* ── Admin Approve Modal ───────────────────────────────── */
  if (approveModal.open && approveModal.nom) {
    const nom = approveModal.nom;
    // What PM saw / set
    const effectiveCategoryForAdmin = nom.pmCategory || nom.category;
    const effectiveReasonForAdmin    = nom.pmReason   || nom.reason;

    return (
      <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--success)' }}>Final Approve Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Review the chain of category and reason below. You may optionally override — if left blank, the PM's (or original) values will be used.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* ── Original submission ── */}
        <div style={{ background: 'rgba(0,51,141,0.04)', border: '1px solid rgba(0,51,141,0.12)', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            📄 Original Submission
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Nominee</label>
              <input type="text" className="form-input" value={nom.name} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Category</label>
              <input type="text" className="form-input" value={nom.category} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Reason</label>
            <textarea className="form-textarea" rows="2" value={nom.reason} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed', resize: 'none' }} />
          </div>
        </div>

        {/* ── PM override (read-only for admin) ── */}
        <div style={{ background: 'rgba(114,19,234,0.04)', border: '1px solid rgba(114,19,234,0.15)', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            ✏️ PM Override
          </p>
          {nom.pmCategory || nom.pmReason ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Category</label>
                <input type="text" className="form-input" value={nom.pmCategory || '—'} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Reason</label>
                <textarea className="form-textarea" rows="2" value={nom.pmReason || '—'} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed', resize: 'none' }} />
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>PM did not add an override — original values will carry forward.</p>
          )}
        </div>

        {/* ── Admin override (optional) ── */}
        <div style={{ background: 'rgba(0,150,80,0.04)', border: '1px solid rgba(0,150,80,0.2)', borderRadius: '8px', padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            🏆 Your Override (Optional)
          </p>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Category <span className="text-muted" style={{ fontWeight: '400' }}>(leave blank to keep: "{effectiveCategoryForAdmin}")</span>
            </label>
            <select
              className="form-select"
              value={approveModal.adminCategory}
              onChange={e => setApproveModal({ ...approveModal, adminCategory: e.target.value })}
            >
              <option value="">— Keep: {effectiveCategoryForAdmin} —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Reason <span className="text-muted" style={{ fontWeight: '400' }}>(leave blank to keep PM's or original reason)</span>
            </label>
            <textarea
              className="form-textarea"
              rows="3"
              value={approveModal.adminReason}
              onChange={e => setApproveModal({ ...approveModal, adminReason: e.target.value })}
              placeholder="Add your final remarks or improvement context (optional)…"
            />
          </div>
        </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setApproveModal({ open: false, nom: null, adminCategory: '', adminReason: '' })}>Cancel</button>
          <button className="btn btn-success" onClick={handleApprove}>
            <Check size={16} /> Final Approve
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

  /* ── Main Page ───────────────────────────────── */
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Admin — Final Approval</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            These nominations have been approved by the PM. Category and reason override are optional.
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

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        {[{ id: 'nominations', label: 'Nominations Approvals' }, { id: 'feedbacks', label: 'Employee Feedbacks' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
              background: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              marginBottom: '-2px', transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
            {tab.id === 'feedbacks' && feedbacks && feedbacks.filter(f => !f.acknowledged).length > 0 && (
              <span style={{ marginLeft: '0.5rem', background: 'var(--secondary)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.72rem' }}>
                {feedbacks.filter(f => !f.acknowledged).length}
              </span>
            )}
          </button>
        ))}
      </div>


      {activeTab === 'feedbacks' && (
        <>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Review employee feedback submitted across the organization. Acknowledge feedbacks to mark them as reviewed.
        </p>
        {!feedbacks || feedbacks.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-muted">No feedbacks submitted yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Auto-Category</th>
                  <th>Description</th>
                  <th>Impact Score</th>
                  <th>Attachment</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...feedbacks].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(fb => {
                  const scoreColor = fb.impactScore >= 8 ? '#22c55e' : fb.impactScore >= 5 ? '#3b82f6' : fb.impactScore >= 3 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={fb.id} style={{ opacity: fb.acknowledged ? 0.6 : 1 }}>
                      <td style={{ fontWeight: '600' }}>{fb.submittedBy}</td>
                      <td><span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '8px', whiteSpace: 'nowrap' }}>{fb.category}</span></td>
                      <td style={{ maxWidth: '280px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fb.description.length > 100 ? fb.description.slice(0, 100) + '…' : fb.description}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: scoreColor }}>{fb.impactScore}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/10</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{fb.hasAttachment ? '📎' : '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      <td>
                        {fb.acknowledged ? (
                          <span className="badge badge-approved">Acknowledged</span>
                        ) : (
                          <button className="btn btn-sm btn-success" onClick={() => acknowledgeFeedback(fb.id)}>Acknowledge</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </>
      )}

      {activeTab === 'nominations' && (<>

      <div style={{
        background: 'rgba(253, 52, 156, 0.07)',
        border: '1px solid rgba(253, 52, 156, 0.25)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#c0186b',
        marginTop: '1rem'
      }}>
        ✅ Once you approve, the nomination will appear on the Leadership Board and the Design Generator.
      </div>

      {/* Awaiting Admin Approval */}
      <h3 style={{ marginBottom: '1rem' }}>
        Awaiting Final Approval
        {pendingAdmin.length > 0 && (
          <span style={{ marginLeft: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
            {pendingAdmin.length}
          </span>
        )}
      </h3>

      {pendingAdmin.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem' }}>
          <p className="text-muted">No nominations waiting for final approval. ✅</p>
        </div>
      ) : (
        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
              <tr>
                <th>Nominee</th>
                <th>Effective Category</th>
                <th>Effective Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmin.map(nom => (
                <tr key={nom.id}>
                  <td style={{ fontWeight: 600 }}>{nom.name}</td>
                  <td>
                    <span className="badge badge-category">{getEffectiveCategory(nom)}</span>
                    {nom.pmCategory && nom.pmCategory !== nom.category && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        orig: {nom.category}
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: '300px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {getEffectiveReason(nom)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-success"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => setApproveModal({ open: true, nom, adminCategory: '', adminReason: '' })}
                      >
                        <Check size={14} /> Final Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => setRejectModal({ open: true, id: nom.id, reason: '' })}
                      >
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

      {/* Awaiting Admin Approval - Other Awards */}
      <h3 style={{ marginBottom: '1rem' }}>
        Awaiting Final Approval (Other Awards)
        {pendingExtAdmin.length > 0 && (
          <span style={{ marginLeft: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem' }}>
            {pendingExtAdmin.length}
          </span>
        )}
      </h3>
      <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        These are external awards submitted by Managers. They bypass the PM queue and come directly to Admin.
      </p>

      {pendingExtAdmin.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem' }}>
          <p className="text-muted">No other awards waiting for final approval. ✅</p>
        </div>
      ) : (
        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
              <tr>
                <th>Nominee</th>
                <th>Award Name</th>
                <th>Platform</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingExtAdmin.map(award => (
                <tr key={award.id}>
                  <td style={{ fontWeight: '600' }}>{award.submittedBy}</td>
                  <td>{award.awardName}</td>
                  <td>{award.platform}</td>
                  <td>{award.dateReceived}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-success" onClick={() => approveExternalAward(award.id)}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => rejectExternalAward(award.id, 'Rejected by Admin')}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending with PMs */}
      <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>
        Pending with PMs (Awaiting PM Approval)
        {pendingPM.length > 0 && (
          <span style={{ marginLeft: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            {pendingPM.length}
          </span>
        )}
      </h3>

      {pendingPM.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2.5rem' }}>
          <p className="text-muted">No nominations pending with PMs. ✅</p>
        </div>
      ) : (
        <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2.5rem' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
              <tr>
                <th>Nominee</th>
                <th>Category</th>
                <th>Reason</th>
                <th>Assigned PM / Team</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingPM.map(nom => {
                const pm   = getPMForUser(nom.name);
                const team = getTeamNameForUser(nom.name);
                return (
                  <tr key={nom.id}>
                    <td style={{ fontWeight: 600 }}>{nom.name}</td>
                    <td><span className="badge badge-category">{nom.category}</span></td>
                    <td style={{ maxWidth: '300px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{nom.reason}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{pm}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{team}</div>
                    </td>
                    <td>
                      <span className="badge badge-pending">Pending PM</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* All nominations overview with Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
        <h3 style={{ margin: 0 }}>
          All Nominations Overview ({filteredOverviewNominations.length} / {allOverviewNominations.length})
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            value={overviewStatusFilter} 
            onChange={e => setOverviewStatusFilter(e.target.value)} 
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="PMApproved">Awaiting Admin</option>
            <option value="Pending">Pending PM</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select 
            className="form-select" 
            value={overviewCategoryFilter} 
            onChange={e => setOverviewCategoryFilter(e.target.value)} 
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'auto' }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '2rem' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 }}>
            <tr>
              <th>Nominee</th>
              <th>Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredOverviewNominations.map(nom => (
              <tr key={nom.id}>
                <td style={{ fontWeight: 600 }}>{nom.name}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {nom.date ? new Date(nom.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td><span className="badge badge-category">{getEffectiveCategory(nom)}</span></td>
                <td>
                  <span className={`badge ${statusClass(nom.status)}`}>
                    {statusLabel(nom.status)}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {nom.rejectReason || '—'}
                </td>
              </tr>
            ))}
            {filteredOverviewNominations.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No records match selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </>)}
    </div>
  );
};

export default AdminVerification;
