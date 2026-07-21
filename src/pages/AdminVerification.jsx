import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, X, Search } from 'lucide-react';

const AdminVerification = () => {
  const { nominations, adminApprove, rejectNomination } = useAppContext();
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ open: false, id: null, reason: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const filterBySearch = (nom) => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return nom.name.toLowerCase().includes(lowerQ) || 
           nom.category.toLowerCase().includes(lowerQ) || 
           nom.reason.toLowerCase().includes(lowerQ);
  };

  // Admin sees nominations waiting for final approval (PMApproved)
  const pendingAdmin = nominations
    .filter(n => n.status === 'PMApproved')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  // All other nominations for reference
  const otherNominations = nominations
    .filter(n => n.status !== 'PMApproved')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const handleReject = () => {
    if (!rejectModal.reason?.trim()) {
      alert("Rejection reason is mandatory.");
      return;
    }
    rejectNomination(rejectModal.id, rejectModal.reason);
    setRejectModal({ open: false, id: null, reason: '' });
  };

  const handleApprove = () => {
    if (!approveModal.reason?.trim()) {
      alert("Approval reason is mandatory.");
      return;
    }
    adminApprove(approveModal.id, approveModal.reason);
    setApproveModal({ open: false, id: null, reason: '' });
  };

  const statusClass = (status) => {
    if (status === 'PMApproved') return 'badge-pmapproved';
    return `badge-${status.toLowerCase()}`;
  };

  const statusLabel = (status) => {
    if (status === 'PMApproved') return '⏳ Awaiting Admin';
    return status;
  };

  if (approveModal.open) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Final Approve Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Please provide an approval reason (mandatory).</p>
        
        <div className="form-group">
          <label className="form-label">Approval Reason</label>
          <textarea
            className="form-textarea"
            rows="4"
            value={approveModal.reason}
            onChange={e => setApproveModal({ ...approveModal, reason: e.target.value })}
            placeholder="E.g., Great contribution to the project..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => setApproveModal({ open: false, id: null, reason: '' })}>Cancel</button>
          <button className="btn btn-success" onClick={handleApprove}>Confirm Approve</button>
        </div>
      </div>
    );
  }

  if (rejectModal.open) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Reject Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Please provide a reason for rejection so the nominee or nominator understands why.</p>
        
        <div className="form-group">
          <label className="form-label">Rejection Reason</label>
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Admin — Final Approval</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            These nominations have been approved by the PM and are awaiting your final sign-off.
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
              {pendingAdmin.map(nom => (
                <tr key={nom.id}>
                  <td style={{ fontWeight: 600 }}>{nom.name}</td>
                  <td><span className="badge badge-category">{nom.category}</span></td>
                  <td style={{ maxWidth: '300px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{nom.reason}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-success"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => setApproveModal({ open: true, id: nom.id, reason: '' })}
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

      {/* All nominations overview */}
      <h3 style={{ marginBottom: '1rem' }}>
        All Nominations Overview
        {otherNominations.length > 0 && (
          <span style={{ marginLeft: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text)', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
            {otherNominations.length}
          </span>
        )}
      </h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nominee</th>
              <th>Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Rejection Reason</th>
            </tr>
          </thead>
          <tbody>
            {otherNominations.map(nom => (
              <tr key={nom.id}>
                <td style={{ fontWeight: 600 }}>{nom.name}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {nom.date ? new Date(nom.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td><span className="badge badge-category">{nom.category}</span></td>
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
            {otherNominations.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVerification;
