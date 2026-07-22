import React, { useState } from 'react';
import { useAppContext, PM_TEAM, CATEGORIES } from '../context/AppContext';
import { Check, X, ChevronDown, Search } from 'lucide-react';

const PMApprovals = () => {
  const { nominations, pmApprove, rejectNomination, currentUser, getReporteesForPM } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filterBySearch = (nom) => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return nom.name.toLowerCase().includes(lowerQ) || 
           nom.category.toLowerCase().includes(lowerQ) || 
           nom.reason.toLowerCase().includes(lowerQ);
  };

  const myReportees = getReporteesForPM(currentUser);

  // PM only sees their team members' Pending requests
  const teamNominations = nominations
    .filter(n => myReportees.includes(n.name) && n.status === 'Pending')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const doneNominations = nominations
    .filter(n => myReportees.includes(n.name) && n.status !== 'Pending')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const [approveModal, setApproveModal] = useState({ open: false, nom: null, category: '', reason: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const handleApprove = () => {
    if (!approveModal.reason?.trim()) {
      alert("Approval reason is mandatory.");
      return;
    }
    pmApprove(approveModal.nom.id, approveModal.category, approveModal.reason);
    setApproveModal({ open: false, nom: null, category: '', reason: '' });
  };

  const handleReject = () => {
    if (!rejectModal.reason?.trim()) {
      alert("Rejection reason is mandatory.");
      return;
    }
    rejectNomination(rejectModal.id, rejectModal.reason);
    setRejectModal({ open: false, id: null, reason: '' });
  };

  const openApprove = (nom) => {
    setApproveModal({ open: true, nom, category: nom.category, reason: '' });
  };

  if (approveModal.open && approveModal.nom) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Approve Nomination</h2>
        
        <div className="form-group">
          <label className="form-label">Nominee</label>
          <input type="text" className="form-input" value={approveModal.nom.name} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
        </div>

        <div className="form-group">
          <label className="form-label">Reason</label>
          <textarea className="form-textarea" rows="4" value={approveModal.nom.reason} disabled style={{ background: 'var(--surface-hover)', cursor: 'not-allowed' }} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            🏷️ Award Category (You may change this)
          </label>
          <select
            className="form-select"
            value={approveModal.category}
            onChange={e => setApproveModal({ ...approveModal, category: e.target.value })}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {approveModal.category !== approveModal.nom.category && (
            <small style={{ color: 'var(--accent)', marginTop: '0.25rem', display: 'block' }}>
              ⚠️ Category changed from "{approveModal.nom.category}" to "{approveModal.category}"
            </small>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Approval Reason (Mandatory)</label>
          <textarea
            className="form-textarea"
            rows="3"
            value={approveModal.reason}
            onChange={e => setApproveModal({ ...approveModal, reason: e.target.value })}
            placeholder="Why are you approving this nomination?"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => setApproveModal({ open: false, nom: null, category: '', reason: '' })}>Cancel</button>
          <button className="btn btn-success" onClick={handleApprove}>
            <Check size={16} /> Approve & Forward to Admin
          </button>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Team Approvals</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Review nominations from your team. You can change the category before forwarding to Admin.
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
                      <button
                        className="btn btn-success"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => openApprove(nom)}
                      >
                        <Check size={14} /> Approve
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

      {/* Past Actions */}
      <h3 style={{ marginBottom: '1rem' }}>
        Past Actions
        {doneNominations.length > 0 && (
          <span style={{ marginLeft: '0.5rem', background: 'var(--surface-hover)', color: 'var(--text)', borderRadius: '999px', padding: '0.1rem 0.6rem', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
            {doneNominations.length}
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
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No past actions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PMApprovals;
