import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, Send, Paperclip, X, Filter, CheckCircle2, Clock, XCircle, Download, Sparkles } from 'lucide-react';

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
  const { feedbacks, addFeedback, currentUser, getPMForUser, aiEnabled } = useAppContext();
  const pm = getPMForUser(currentUser);
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({ description: '', fileName: '' });
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

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
    if (file) {
      if (!file.name.toLowerCase().endsWith('.msg')) {
        setError('Only Outlook email files (.msg format) are allowed.');
        handleChange('fileName', '');
        return;
      }
      setError('');
      handleChange('fileName', file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || form.description.trim().length < 15) {
      return setError('Please write or paste a more detailed feedback (at least 15 characters).');
    }
    if (!form.fileName || !form.fileName.toLowerCase().endsWith('.msg')) {
      return setError('Please attach the original Outlook email file (.msg format). Attachment is mandatory.');
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', gap: '1.25rem', overflow: 'hidden' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Client Feedback</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Submit client appreciation on the left, and view your client feedback profile history on the right.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (myFeedbacks.length === 0) return alert('No client feedback records available to download.');
            const headers = ['Date', 'Category', 'Description', 'Impact Level', 'Status', 'Attachment'];
            const rows = myFeedbacks.map(f => [
              `"${new Date(f.submittedAt).toLocaleDateString()}"`,
              `"${f.category || ''}"`,
              `"${(f.description || '').replace(/"/g, '""')}"`,
              `"${f.impactTier || (f.impactScore >= 8 ? 'Strategic' : f.impactScore >= 5 ? 'High Value' : 'Standard')}"`,
              `"${f.status || 'Approved'}"`,
              `"${f.attachmentName || (f.hasAttachment ? 'Attached' : 'None')}"`
            ]);
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `${currentUser}_Client_Feedback_Portfolio_${new Date().getFullYear()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}
        >
          <Download size={15} color="var(--primary)" />
          Download Portfolio (CSV/Excel)
        </button>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {myFeedbacks.length}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(5, 150, 105, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color="#059669" />
          </div>
        </div>

        {/* Metric 2: Approved */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              APPROVED FEEDBACKS
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {approvedCount}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#2563eb" />
          </div>
        </div>

        {/* Metric 3: High Impact */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HIGH IMPACT (NPS/GAME CHANGER)
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9333ea', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {myFeedbacks.filter(f => (f.impactScore || 3) >= 7).length}
            </div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(147, 51, 234, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#9333ea" />
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Feedback Form Card (Left) + Full History Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.25rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT CARD: Compact Submit Form */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <MessageSquare size={18} color="#00338d" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Submit Client Feedback</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Outlook / Email Content <span style={{ color: 'var(--accent)' }}>*</span></span>
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>{form.description.length} chars</span>
              </label>
              <textarea
                className="form-input"
                rows="4"
                style={{ width: '100%', resize: 'none', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.4 }}
                placeholder="Paste the email or feedback received from client here..."
                value={form.description}
                onChange={e => {
                  handleChange('description', e.target.value);
                  if (aiResult) setAiResult(null);
                }}
                required
              />
            </div>

            {/* Form Controls & Attachment Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Email File (.msg) <span style={{ color: 'var(--accent)' }}>*</span></label>
                <div
                  style={{ border: '1.5px dashed var(--border)', borderRadius: '6px', padding: '0.45rem', textAlign: 'center', cursor: 'pointer', background: 'var(--surface-hover)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.fileName ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <Paperclip size={12} color="#00338d" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#00338d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90px' }}>{form.fileName}</span>
                      <button type="button" onClick={e => { e.stopPropagation(); handleChange('fileName', ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex' }}>
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <Paperclip size={12} style={{ marginBottom: '0.1rem' }} /> Attach <strong>.msg</strong>
                    </div>
                  )}
                  <input type="file" accept=".msg" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFile} />
                </div>
              </div>

              {/* AI Analyze Action */}
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>AI Analysis</label>
                {aiEnabled ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isAnalyzing || !form.description.trim()}
                    onClick={() => {
                      if (!form.description.trim() || form.description.trim().length < 10) {
                        return setError('Please paste client feedback text before running AI analysis.');
                      }
                      setIsAnalyzing(true);
                      setError('');
                      setTimeout(() => {
                        const detectedCat = detectCategory(form.description);
                        const detectedScore = calcImpactScore(form.description);
                        let tier = 'Standard Appreciation';
                        let desc = 'Client provided positive routine feedback.';
                        if (detectedScore >= 8) {
                          tier = 'Strategic Game Changer';
                          desc = 'High-impact feedback indicating major process efficiency or account booster.';
                        } else if (detectedScore >= 5) {
                          tier = 'High Value / NPS Booster';
                          desc = 'Strong client appreciation highlighting quality delivery and project satisfaction.';
                        }
                        setAiResult({ tier, score: detectedScore, category: detectedCat, reasoning: desc });
                        setIsAnalyzing(false);
                      }, 600);
                    }}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '0.3rem',
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: '#7c3aed',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '0.45rem'
                    }}
                  >
                    <Sparkles size={13} color="#8b5cf6" className={isAnalyzing ? 'animate-spin' : ''} />
                    {isAnalyzing ? 'Analyzing...' : 'AI Impact'}
                  </button>
                ) : (
                  <div style={{ background: 'var(--surface-hover)', borderRadius: '6px', padding: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    AI OFF
                  </div>
                )}
              </div>
            </div>

            {/* AI Live Output Card */}
            {aiResult && (
              <div style={{
                background: 'rgba(124, 58, 237, 0.04)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={13} /> Impact: <strong>{aiResult.tier} ({aiResult.score}/10)</strong>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.5rem', color: '#dc2626', fontSize: '0.78rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', background: '#00338d', fontWeight: 700 }}>
              <Send size={15} /> Submit Feedback ➢
            </button>
          </form>
        </div>

        {/* RIGHT CARD: Full History Table (Only this card scrolls!) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          
          {/* Table Header & Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem', flexShrink: 0 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 800 }}>Full Client Feedback History</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Track past feedback and impact levels</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Filter size={14} color="var(--text-muted)" />
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                >
                  {categoryOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Scrollable Table Area */}
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
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
                    <th style={{ width: '55%' }}>Feedback Snippet</th>
                    <th>Impact Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map(fb => {
                    const tierLabel = fb.impactTier || (fb.impactScore >= 8 ? '⭐ Strategic' : fb.impactScore >= 5 ? '🔵 High Value' : '🟢 Standard');
                    const tierBg = tierLabel.includes('Strategic') ? 'rgba(234, 179, 8, 0.12)' : tierLabel.includes('High') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(34, 197, 94, 0.12)';
                    const tierColor = tierLabel.includes('Strategic') ? '#ca8a04' : tierLabel.includes('High') ? '#2563eb' : '#16a34a';
                    const st = fb.status || 'Approved';
                    return (
                      <tr key={fb.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          {new Date(fb.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ color: 'var(--text-main)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                          {fb.description}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ background: tierBg, color: tierColor, fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'inline-block' }}>
                            {tierLabel}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                            {fb.hasAttachment && (
                              <span title={fb.attachmentName || 'Attachment available'} style={{ cursor: 'pointer', background: 'var(--surface-hover)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center' }}>
                                <Paperclip size={13} color="var(--primary)" />
                              </span>
                            )}
                          </div>
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
