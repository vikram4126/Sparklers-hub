import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, Send, Paperclip, X, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';

const detectCategory = (text) => {
  if (!text || text.trim().length < 5) return 'General Appreciation';
  const lower = text.toLowerCase();
  if (/automat|power automate|workflow|process|streamline|efficiency|save hours/.test(lower)) {
    return 'Process Improvement';
  }
  if (/nps|client|customer|delight|support|satisfaction|feedback|outlook/.test(lower)) {
    return 'Client Experience';
  }
  if (/team|culture|collaborate|mentor|help|supportive|relationship|people/.test(lower)) {
    return 'Team Culture';
  }
  if (/technical|code|architecture|bug|fix|design|develop|delivery/.test(lower)) {
    return 'Technical Excellence';
  }
  return 'General Appreciation';
};

const calcImpactScore = (text) => {
  if (!text || text.trim().length < 10) return 3;
  const lower = text.toLowerCase();
  let raw = 0;
  const keywords = ['automat', 'revenue', 'cost saving', 'save', 'hours', 'efficiency', 'nps', 'client', 'customer', 'improve', 'reduce'];
  keywords.forEach(kw => {
    if (lower.includes(kw)) raw += 1;
  });
  if (text.length > 100) raw += 1;
  if (text.length > 200) raw += 1;
  return Math.min(10, Math.max(1, Math.round(raw || 3)));
};

export default function Feedback() {
  const { feedbacks, addFeedback, currentUser, getPMForUser } = useAppContext();
  const pm = getPMForUser(currentUser);
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({ description: '', fileName: '' });
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [error, setError] = useState('');

  // Table filters
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filtered feedbacks for logged-in user
  const myFeedbacks = useMemo(() => {
    return (feedbacks || [])
      .filter(f => f.submittedBy === currentUser)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [feedbacks, currentUser]);

  const approvedCount = useMemo(() => myFeedbacks.filter(f => (f.status || 'Approved') === 'Approved').length, [myFeedbacks]);
  const pendingCount  = useMemo(() => myFeedbacks.filter(f => (f.status || 'Approved') === 'Pending').length, [myFeedbacks]);
  const avgImpact     = useMemo(() => {
    if (myFeedbacks.length === 0) return null;
    const sum = myFeedbacks.reduce((acc, f) => acc + (f.impactScore || 3), 0);
    return (sum / myFeedbacks.length).toFixed(1);
  }, [myFeedbacks]);

  const categoryOptions = useMemo(() => {
    const set = new Set(myFeedbacks.map(f => f.category).filter(Boolean));
    return ['All Categories', ...Array.from(set).sort()];
  }, [myFeedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return myFeedbacks.filter(fb => {
      if (categoryFilter !== 'All Categories' && fb.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && (fb.status || 'Approved') !== statusFilter) return false;
      return true;
    });
  }, [myFeedbacks, categoryFilter, statusFilter]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) handleChange('fileName', file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || form.description.trim().length < 15) {
      return setError('Please write or paste a more detailed feedback (at least 15 characters).');
    }

    const autoCategory = detectCategory(form.description);
    const score = calcImpactScore(form.description);
    const initialStatus = ['Kumaran', 'Krishan'].includes(pm) ? 'Approved' : 'Pending';

    addFeedback({
      submittedBy: currentUser,
      to: pm,
      category: autoCategory,
      description: form.description.trim(),
      impactScore: score,
      hasAttachment: !!form.fileName,
      attachmentName: form.fileName || null,
      status: initialStatus
    });

    setSubmittedMessage(
      initialStatus === 'Approved'
        ? `Feedback logged and approved!`
        : `Feedback logged! Submitted to PM (${pm}) for approval.`
    );

    setForm({ description: '', fileName: '' });
    setError('');
    setTimeout(() => setSubmittedMessage(''), 5000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Client Feedback</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Log client appreciation on the left, and view your client feedback profile history on the right.
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
        
        {/* LEFT COLUMN: Log Feedback Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <MessageSquare size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Log Client Feedback</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Outlook / Email Content <span style={{ color: 'var(--accent)' }}>*</span></span>
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>{form.description.length} chars</span>
              </label>
              <textarea
                className="form-input"
                rows="8"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.5 }}
                placeholder="Paste the email or feedback received from client here..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Attachment Email Snapshot <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <div
                style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '0.85rem', textAlign: 'center', cursor: 'pointer', background: 'var(--surface-hover)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.fileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Paperclip size={14} color="var(--primary)" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>{form.fileName}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); handleChange('fileName', ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Paperclip size={16} style={{ marginBottom: '0.2rem' }} />
                    <div>Click to attach screenshot or PDF</div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFile} />
              </div>
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>My Client Feedback Profile</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Client appreciation record for {currentUser}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(5, 150, 105, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>LOGGED</span>
                <strong style={{ fontSize: '1.1rem', color: '#059669' }}>{myFeedbacks.length}</strong>
              </div>
              {avgImpact && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>AVG IMPACT</span>
                  <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{avgImpact}/10</strong>
                </div>
              )}
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
              <span>Filter Feedback Profile:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '8px', width: 'auto' }}
              >
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
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
            {filteredFeedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div>No feedbacks match the selected filters.</div>
              </div>
            ) : (
              <table style={{ minWidth: '600px' }}>
                <thead style={{ sticky: 'top', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Feedback Snippet</th>
                    <th>Impact Score</th>
                    <th>Attachment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map(fb => {
                    const scoreColor = (fb.impactScore || 3) >= 8 ? '#22c55e' : (fb.impactScore || 3) >= 5 ? '#3b82f6' : '#f59e0b';
                    const st = fb.status || 'Approved';
                    return (
                      <tr key={fb.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          {new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span style={{ background: 'rgba(0,51,141,0.08)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                            {fb.category}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '220px' }}>
                          {fb.description.length > 70 ? fb.description.slice(0, 70) + '…' : fb.description}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: '800', fontSize: '1rem', color: scoreColor }}>{fb.impactScore || '—'}</span>
                          {fb.impactScore && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>/10</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>{fb.hasAttachment ? '📎' : '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {st === 'Approved' && (
                            <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
                          {st === 'Pending' && (
                            <span className="badge badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={12} /> Pending PM
                            </span>
                          )}
                          {st === 'Rejected' && (
                            <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={fb.rejectReason}>
                              <XCircle size={12} /> Rejected
                            </span>
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

      </div>
    </div>
  );
}
