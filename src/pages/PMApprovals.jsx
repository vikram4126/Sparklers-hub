import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext, CATEGORIES } from '../context/AppContext';
import { Check, X, Search, Award, Star, MessageSquare, Send, Users, Filter, CheckCircle2, ShieldCheck, Clock, Share2, Eye, Paperclip, FileText } from 'lucide-react';

const PMApprovals = () => {
  const { 
    nominations, addNomination, pmApprove, rejectNomination, currentUser, currentRole, getReporteesForPM,
    externalAwards, approveExternalAward, rejectExternalAward,
    feedbacks, approveFeedback, rejectFeedback, markFeedbackShared
  } = useAppContext();

  const myReportees = getReporteesForPM(currentUser) || [];

  // Strictly 1st-level direct reportees only (no nested reportees of reportees)
  const allTeamMembers = myReportees;

  // Left Form State
  const [formData, setFormData] = useState({ name: '', category: 'Process & Efficiency', reason: '', hoursSaved: '' });
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Right Panel Filter & Tab State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('sparklers'); // 'sparklers' | 'other' | 'feedbacks'

  // Modals
  const [approveModal, setApproveModal] = useState({ open: false, nom: null, pmCategory: '', pmReason: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [extRejectModal, setExtRejectModal] = useState({ open: false, id: null, reason: '' });
  const [viewFeedbackModal, setViewFeedbackModal] = useState({ open: false, fb: null });

  // Handle Form Submit
  const handleNominateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return setFormError('Please select a team member.');
    if (!formData.reason.trim()) return setFormError('Please enter a reason for nomination.');

    addNomination({
      name: formData.name,
      category: formData.category,
      reason: formData.reason.trim(),
      hoursSaved: Number(formData.hoursSaved) || 0,
      status: 'PMApproved' // Direct PM nomination skips PM queue → goes to Admin approval
    }, currentRole);

    setSubmittedMessage(`Nomination for ${formData.name} submitted and sent to Admin for final approval!`);
    setFormData({ name: '', category: 'Process & Efficiency', reason: '', hoursSaved: '' });
    setFormError('');
    setTimeout(() => setSubmittedMessage(''), 5000);
  };

  // Search filter helper
  const filterBySearch = (nom) => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return nom.name.toLowerCase().includes(lowerQ) ||
           (nom.category && nom.category.toLowerCase().includes(lowerQ)) ||
           (nom.reason && nom.reason.toLowerCase().includes(lowerQ));
  };

  const teamNominations = nominations
    .filter(n => (myReportees.includes(n.name) || n.pm === currentUser) && n.status === 'Pending')
    .filter(filterBySearch)
    .sort((a, b) => b.id - a.id);

  const doneNominations = nominations
    .filter(n => (allTeamMembers.includes(n.name) || n.pm === currentUser) && n.status !== 'Pending')
    .filter(filterBySearch)
    .filter(n => statusFilter === 'All' || n.status === statusFilter)
    .filter(n => categoryFilter === 'All' || n.category === categoryFilter)
    .sort((a, b) => b.id - a.id);

  const allDoneCount = nominations.filter(n => (allTeamMembers.includes(n.name) || n.pm === currentUser) && n.status !== 'Pending').length;
  const approvedCount = nominations.filter(n => (allTeamMembers.includes(n.name) || n.pm === currentUser) && n.status === 'Approved').length;
  const forwardedCount = nominations.filter(n => (allTeamMembers.includes(n.name) || n.pm === currentUser) && n.status === 'PMApproved').length;
  const rejectedCount = nominations.filter(n => (allTeamMembers.includes(n.name) || n.pm === currentUser) && n.status === 'Rejected').length;

  const handleApprove = () => {
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

  /* ── PM Approve Modal Overlay ───────────────────────────────── */
  if (approveModal.open && approveModal.nom) {
    const nom = approveModal.nom;
    return (
      <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '2rem auto', background: 'var(--surface)', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Approve Team Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Review the nominee's details below. You may optionally add your own category and reason — if left blank, the nominee's original values will be used.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Original submission */}
          <div style={{ background: 'rgba(0,51,141,0.04)', border: '1px solid rgba(0,51,141,0.12)', borderRadius: '10px', padding: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Original Submission
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

          {/* PM override */}
          <div style={{ background: 'rgba(114,19,234,0.04)', border: '1px solid rgba(114,19,234,0.15)', borderRadius: '10px', padding: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Your Override (Optional)
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

  /* ── Reject Modal Overlay ───────────────────────────────── */
  if (rejectModal.open) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '550px', margin: '3rem auto', background: 'var(--surface)', padding: '2rem', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Reject Nomination</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Please provide a reason for rejection so the nominee understands why.</p>
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
  /* ── View Feedback Modal Overlay ───────────────────────── */
  const renderViewFeedbackModal = () => {
    if (!viewFeedbackModal.open || !viewFeedbackModal.fb) return null;
    const fb = viewFeedbackModal.fb;
    return createPortal(
      <div 
        onClick={() => setViewFeedbackModal({ open: false, fb: null })}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="animate-scale-in"
          style={{
            width: '100%', maxWidth: '640px', background: 'var(--surface)',
            padding: '1.75rem', borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0,51,141,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>Client Feedback Details</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Review original client appreciation email</span>
              </div>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setViewFeedbackModal({ open: false, fb: null })} 
              style={{ padding: '0.35rem 0.65rem', borderRadius: '8px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ background: 'var(--surface-hover)', padding: '0.85rem 1rem', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Submitted By</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>{fb.submittedBy}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Date</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Attachment</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)' }}>{fb.attachmentName || (fb.hasAttachment ? '📎 .msg file attached' : 'None')}</span>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
              ORIGINAL CLIENT EMAIL CONTENT
            </label>
            <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '240px', overflowY: 'auto' }}>
              {fb.description}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-primary" onClick={() => setViewFeedbackModal({ open: false, fb: null })} style={{ padding: '0.5rem 1.25rem' }}>
              Close Preview
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Team Dashboard</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Nominate your team members on the left, and manage team approvals & history on the right.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search team member or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', width: '100%', fontSize: '0.85rem', borderRadius: '10px' }}
          />
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
        
        {/* LEFT COLUMN: Nominate Team Member Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nominate Team Member</h3>
          </div>

          <form onSubmit={handleNominateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Team Member <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select 
                className="form-select"
                value={formData.name}
                onChange={(e) => { setFormData({...formData, name: e.target.value}); setFormError(''); }}
                required
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                <option value="" disabled>Select a team member...</option>
                {myReportees.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Category <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {formData.category === 'Process & Efficiency' && (
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
                  value={formData.hoursSaved}
                  onChange={(e) => setFormData({...formData, hoursSaved: e.target.value})}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            )}

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Reason for Nomination <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <textarea 
                className="form-input" 
                rows="5"
                value={formData.reason}
                onChange={(e) => { setFormData({...formData, reason: e.target.value}); setFormError(''); }}
                placeholder="Describe their achievement and impact..."
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem' }}
                required 
              />
            </div>

            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#dc2626', fontSize: '0.8rem' }}>
                {formError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '0.75rem' }}>
              <Send size={16} /> Submit to Admin Approval
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Team Dashboard & Approvals Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Tab Switcher Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
            <button
              onClick={() => setActiveTab('sparklers')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.1rem',
                fontWeight: '700', fontSize: '0.88rem',
                color: activeTab === 'sparklers' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'sparklers' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
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
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.1rem',
                fontWeight: '700', fontSize: '0.88rem',
                color: activeTab === 'other' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'other' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.45rem'
              }}
            >
              <Award size={16} />
              Other Awards
              {externalAwards.filter(a => (a.pm === currentUser || myReportees.includes(a.submittedBy)) && a.status === 'Pending').length > 0 && (
                <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
                  {externalAwards.filter(a => (a.pm === currentUser || myReportees.includes(a.submittedBy)) && a.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('feedbacks')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.1rem',
                fontWeight: '700', fontSize: '0.88rem',
                color: activeTab === 'feedbacks' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'feedbacks' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.45rem'
              }}
            >
              <MessageSquare size={16} />
              Client Feedbacks
              {(feedbacks || []).filter(f => (f.to === currentUser || myReportees.includes(f.submittedBy)) && f.status === 'Pending').length > 0 && (
                <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
                  {(feedbacks || []).filter(f => (f.to === currentUser || myReportees.includes(f.submittedBy)) && f.status === 'Pending').length}
                </span>
              )}
            </button>
          </div>

          {/* ── TAB 1: SPARKLERS ── */}
          {activeTab === 'sparklers' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* Pending Approvals Section */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Pending Your Approval
                  {teamNominations.length > 0 && (
                    <span style={{ marginLeft: '0.5rem', background: 'var(--accent)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.55rem', fontSize: '0.75rem' }}>
                      {teamNominations.length}
                    </span>
                  )}
                </h4>

                {teamNominations.length === 0 ? (
                  <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No pending nominations from your team members.
                  </div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Nominee</th>
                          <th>Category</th>
                          <th style={{ width: '50%' }}>Reason / Achievement</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamNominations.map(nom => (
                          <tr key={nom.id}>
                            <td style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{nom.name}</td>
                            <td><span className="badge badge-category" style={{ fontSize: '0.75rem' }}>{nom.category}</span></td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.45 }}>{nom.reason}</td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                <button className="btn btn-success" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Approve & Forward to Admin" onClick={() => setApproveModal({ open: true, nom, pmCategory: '', pmReason: '' })}>
                                  <Check size={15} />
                                </button>
                                <button className="btn btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Reject Nomination" onClick={() => setRejectModal({ open: true, id: nom.id, reason: '' })}>
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Past Actions with Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Team History ({doneNominations.length} / {allDoneCount})
                </h4>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem', width: 'auto' }}>
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="PMApproved">Forwarded to Admin</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem', width: 'auto' }}>
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="table-container" style={{ flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
                {doneNominations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No team nominations match the selected filters.
                  </div>
                ) : (
                  <table>
                    <thead style={{ sticky: 'top', top: 0, background: 'var(--surface)', zIndex: 1 }}>
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
                          <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{nom.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {nom.date ? new Date(nom.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td><span className="badge badge-category" style={{ fontSize: '0.75rem' }}>{nom.category}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {nom.status === 'Approved' && (
                              <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            )}
                            {nom.status === 'PMApproved' && (
                              <span className="badge" style={{ background: 'rgba(30,73,226,0.15)', color: '#1e49e2', border: '1px solid rgba(30,73,226,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                <ShieldCheck size={12} /> Forwarded to Admin
                              </span>
                            )}
                            {nom.status === 'Rejected' && (
                              <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                Rejected
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
          )}

          {/* ── TAB 2: OTHER AWARDS ── */}
          {activeTab === 'other' && (() => {
            const pendingExt = externalAwards.filter(a => (a.pm === currentUser || myReportees.includes(a.submittedBy)) && a.status === 'Pending');
            const doneExt = externalAwards.filter(a => (a.pm === currentUser || allTeamMembers.includes(a.submittedBy)) && a.status !== 'Pending');

            const handleExtReject = () => {
              if (!extRejectModal.reason.trim()) return alert('Rejection reason is mandatory.');
              rejectExternalAward(extRejectModal.id, extRejectModal.reason);
              setExtRejectModal({ open: false, id: null, reason: '' });
            };

            if (extRejectModal.open) {
              return (
                <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '10px' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent)' }}>Reject External Award</h4>
                  <textarea className="form-input" rows={3} style={{ width: '100%', fontSize: '0.85rem' }}
                    placeholder="Provide rejection reason..."
                    value={extRejectModal.reason}
                    onChange={e => setExtRejectModal(p => ({ ...p, reason: e.target.value }))}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setExtRejectModal({ open: false, id: null, reason: '' })}>Cancel</button>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={handleExtReject}>Confirm Reject</button>
                  </div>
                </div>
              );
            }

            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Pending Verification ({pendingExt.length})
                </h4>

                {pendingExt.length === 0 ? (
                  <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    No other awards pending your verification.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {pendingExt.map(award => (
                      <div key={award.id} style={{ background: 'var(--surface-hover)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem' }}>{award.awardName}</strong>
                          <span style={{ marginLeft: '0.5rem', background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>{award.platform}</span>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{award.submittedBy} · {award.description}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-success" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Approve Award" onClick={() => approveExternalAward(award.id)}>
                            <Check size={15} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Reject Award" onClick={() => setExtRejectModal({ open: true, id: award.id, reason: '' })}>
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>Past Team External Awards</h4>
                <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
                  {doneExt.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No past external awards.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr><th>Employee</th><th>Award</th><th>Platform</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {doneExt.map(award => (
                          <tr key={award.id}>
                            <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{award.submittedBy}</td>
                            <td style={{ fontSize: '0.85rem' }}>{award.awardName}</td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{award.platform}</td>
                            <td><span className={`badge badge-${award.status.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>{award.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── TAB 3: CLIENT FEEDBACKS ── */}
          {activeTab === 'feedbacks' && (() => {
            const myTeamFeedbacks = (feedbacks || []).filter(f => 
              myReportees.includes(f.submittedBy) || 
              f.to === currentUser
            );
            const pendingFbs = myTeamFeedbacks.filter(f => (f.status || 'Approved') === 'Pending');
            const doneFbs = myTeamFeedbacks.filter(f => (f.status || 'Approved') !== 'Pending');

            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Pending Feedback Approvals ({pendingFbs.length})
                </h4>

                {pendingFbs.length === 0 ? (
                  <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    No client feedbacks pending your approval.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {pendingFbs.map(fb => (
                      <div key={fb.id} style={{ background: 'var(--surface-hover)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem' }}>{fb.submittedBy}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fb.description.length > 40 ? fb.description.slice(0, 40) + '…' : fb.description}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                            title="View Full Client Email & Details"
                            onClick={() => setViewFeedbackModal({ open: true, fb })}
                          >
                            <Eye size={14} color="var(--primary)" /> View Details
                          </button>
                          <select
                            className="form-select"
                            defaultValue="Standard Appreciation"
                            id={`impact-tier-${fb.id}`}
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', width: 'auto' }}
                          >
                            <option value="Standard Appreciation">🟢 Standard</option>
                            <option value="High Value / NPS Booster">🔵 High Value</option>
                            <option value="Game Changer / Account Growth">⭐ Strategic</option>
                          </select>
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}
                            title="Approve and set impact tier"
                            onClick={() => {
                              const sel = document.getElementById(`impact-tier-${fb.id}`);
                              const val = sel ? sel.value : 'Standard Appreciation';
                              approveFeedback(fb.id, val);
                            }}
                          >
                            <Check size={14} /> Approve & Tag
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                            title="Reject Feedback" 
                            onClick={() => {
                              const reason = window.prompt("Please provide a reason for rejecting this feedback (Mandatory):");
                              if (!reason || !reason.trim()) {
                                alert("Rejection reason is mandatory.");
                                return;
                              }
                              rejectFeedback(fb.id, reason.trim());
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>Past Team Feedbacks</h4>
                <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
                  {doneFbs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No past feedbacks.</div>
                  ) : (
                    <table>
                      <thead>
                        <tr><th>Employee</th><th>Impact Level</th><th>Status</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {doneFbs.map(fb => {
                          const tierLabel = fb.impactTier || (fb.impactScore >= 8 ? '⭐ Strategic' : fb.impactScore >= 5 ? '🔵 High Value' : '🟢 Standard');
                          const tierBg = tierLabel.includes('Strategic') ? 'rgba(234, 179, 8, 0.12)' : tierLabel.includes('High') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(34, 197, 94, 0.12)';
                          const tierColor = tierLabel.includes('Strategic') ? '#ca8a04' : tierLabel.includes('High') ? '#2563eb' : '#16a34a';
                          
                          const handleShareWithTeam = () => {
                            markFeedbackShared(fb.id);
                            const nomineeEmail = `${fb.submittedBy.toLowerCase().replace(/\s+/g, '.')}@kpmg.com`;
                            const ccEmails = "UK-DLStarGraphicsTeamGGN@KPMG.co.uk; UK-DLStarGraphicsTeamBLR@KPMG.co.uk; dkumaran@kpmg.com";
                            const subject = fb.subject?.trim() ? fb.subject.trim() : `Client Appreciation Share: Kudos to ${fb.submittedBy}`;
                            const body = `Hi ${fb.submittedBy},\n\nKudos on receiving great client appreciation! Sharing this with the team.\n\n----------------------------------------\nClient Feedback Details:\n${fb.description}\n\nImpact Level: ${tierLabel}`;
                            
                            const mailtoUrl = `mailto:${encodeURIComponent(nomineeEmail)}?cc=${encodeURIComponent(ccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.location.href = mailtoUrl;
                          };

                          const isShared = fb.isShared || fb.shareCount > 0;

                          return (
                            <tr key={fb.id}>
                              <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fb.submittedBy}</td>
                              <td>
                                <span style={{ background: tierBg, color: tierColor, fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'inline-block' }}>
                                  {tierLabel}
                                </span>
                              </td>
                              <td><span className={`badge badge-${(fb.status || 'Approved').toLowerCase()}`} style={{ fontSize: '0.75rem' }}>{fb.status || 'Approved'}</span></td>
                              <td>
                                {isShared ? (
                                  <span 
                                    style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                    title={`Shared with team ${fb.shareCount || 1} time(s)`}
                                  >
                                    <CheckCircle2 size={12} color="#15803d" />
                                    Shared {fb.shareCount > 1 ? `(${fb.shareCount})` : ''}
                                  </span>
                                ) : (
                                  <button
                                    className="btn btn-secondary"
                                    onClick={handleShareWithTeam}
                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                                    title="Share this client feedback with team via Outlook"
                                  >
                                    <Share2 size={13} color="var(--primary)" />
                                    Share with Team
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>
      {renderViewFeedbackModal()}
    </div>
  );
};

export default PMApprovals;
