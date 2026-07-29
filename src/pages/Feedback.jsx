import React, { useState, useMemo, useRef } from 'react';
import { useAppContext, PM_TEAM_MAP } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Paperclip, X, Zap } from 'lucide-react';

// ── Keyword Weight Dictionary (simulates SharePoint KeywordWeights list) ─────
const KEYWORD_WEIGHTS = [
  { keyword: 'automat', weight: 1.5 },
  { keyword: 'revenue', weight: 1.4 },
  { keyword: 'cost saving', weight: 1.4 },
  { keyword: 'save', weight: 0.8 },
  { keyword: 'hours', weight: 0.6 },
  { keyword: 'efficiency', weight: 1.2 },
  { keyword: 'nps', weight: 1.3 },
  { keyword: 'client', weight: 0.8 },
  { keyword: 'customer', weight: 0.8 },
  { keyword: 'error', weight: 0.6 },
  { keyword: 'reduce', weight: 0.7 },
  { keyword: 'improve', weight: 0.5 },
  { keyword: 'increase', weight: 0.7 },
  { keyword: 'process', weight: 0.6 },
  { keyword: 'tool', weight: 0.4 },
  { keyword: 'implement', weight: 0.6 },
  { keyword: 'data', weight: 0.5 },
  { keyword: 'risk', weight: 0.8 },
  { keyword: 'deadline', weight: 0.7 },
  { keyword: 'sla', weight: 1.0 },
  { keyword: 'kpi', weight: 1.0 },
  { keyword: 'metric', weight: 0.9 },
  { keyword: 'percent', weight: 0.8 },
  { keyword: '%', weight: 0.7 },
  { keyword: 'bottleneck', weight: 0.9 },
  { keyword: 'blocker', weight: 0.8 },
  { keyword: 'delay', weight: 0.7 },
  { keyword: 'manual', weight: 0.6 },
  { keyword: 'streamline', weight: 0.8 },
  { keyword: 'pipeline', weight: 0.7 },
];

const getAssessment = (text, score) => {
  const lower = text.toLowerCase();
  const insights = [];
  const recommendations = [];

  if (/automat|power automate|tool|software/.test(lower)) insights.push({ icon: '⚙️', text: 'Automation opportunity identified' });
  if (/nps|client|customer/.test(lower)) insights.push({ icon: '🤝', text: 'Client experience impact detected' });
  if (/\d+\s*%|percent|hours|cost|revenue|saving/.test(lower)) insights.push({ icon: '📊', text: 'Quantified with measurable metrics' });
  if (/risk|sla|kpi|deadline/.test(lower)) insights.push({ icon: '🚨', text: 'Business risk or KPI reference found' });
  if (text.length > 200) insights.push({ icon: '📝', text: 'Well-detailed explanation provided' });

  if (score < 4) {
    recommendations.push('Add specific numbers (e.g., hours saved, % improvement)');
    recommendations.push('Mention business impact on clients or revenue');
    recommendations.push('Describe the root cause of the problem');
  } else if (score < 7) {
    recommendations.push('Quantify the expected outcome (e.g., "reduce errors by 30%")');
    recommendations.push('Link to a KPI or team goal for stronger context');
  } else {
    recommendations.push('Great detail! Consider adding a proposed solution or tool');
    recommendations.push('Mention timeline or urgency if applicable');
  }

  return { insights, recommendations };
};

const calcImpactScore = (text) => {
  if (!text || text.trim().length < 10) return 0;
  const lower = text.toLowerCase();
  let raw = 0;
  KEYWORD_WEIGHTS.forEach(({ keyword, weight }) => {
    if (lower.includes(keyword)) raw += weight;
  });
  const numericMatches = (lower.match(/\d+(\.\d+)?/g) || []).length;
  raw += Math.min(numericMatches * 0.3, 1.5);
  if (text.length > 100) raw += 0.5;
  if (text.length > 200) raw += 0.5;
  if (text.length > 350) raw += 0.5;
  return Math.min(10, Math.max(1, Math.round(raw)));
};

const FEEDBACK_CATEGORIES = [
  'Process Improvement', 'Client Experience', 'Team Culture',
  'Innovation', 'Communication', 'Resource Allocation',
  'Training & Development', 'Tool / Technology', 'Other',
];

const ScoreColor = (score) => {
  if (score === 0) return '#9ca3af';
  if (score <= 3) return '#ef4444';
  if (score <= 5) return '#f59e0b';
  if (score <= 7) return '#3b82f6';
  return '#22c55e';
};

const ScoreLabel = (score) => {
  if (score === 0) return 'Waiting for input…';
  if (score <= 2) return 'Very Low Impact';
  if (score <= 4) return 'Low Impact';
  if (score <= 6) return 'Moderate Impact';
  if (score <= 8) return 'High Impact';
  return 'Exceptional Impact';
};

export default function Feedback() {
  const { addFeedback, currentUser } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const allUsers = useMemo(() => {
    const everyone = [...Object.keys(PM_TEAM_MAP), ...Object.values(PM_TEAM_MAP).flat()];
    return [...new Set(everyone)].filter(u => u !== currentUser).sort();
  }, [currentUser]);

  const [form, setForm] = useState({ category: '', to: '', description: '', fileName: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const impactScore = useMemo(() => calcImpactScore(form.description), [form.description]);
  const { insights, recommendations } = useMemo(() => getAssessment(form.description, impactScore), [form.description, impactScore]);
  const scoreColor = ScoreColor(impactScore);

  const handleChange = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setError(''); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) handleChange('fileName', file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category) return setError('Please select a feedback category.');
    if (!form.to) return setError('Please select who this feedback is for.');
    if (!form.description.trim() || form.description.trim().length < 20) return setError('Please write a more detailed feedback (at least 20 characters).');
    addFeedback({ submittedBy: currentUser, to: form.to, category: form.category, description: form.description.trim(), impactScore, hasAttachment: !!form.fileName, attachmentName: form.fileName || null });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Feedback Submitted!</h1>
        <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '0.5rem' }}>Your feedback has been sent to <strong>{form.to}</strong>.</p>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
          Impact Score: <strong style={{ color: scoreColor }}>{impactScore}/10 — {ScoreLabel(impactScore)}</strong>
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setForm({ category: '', to: '', description: '', fileName: '' }); }}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Submit Feedback</h1>
        <p className="text-muted">Share constructive feedback to help improve processes, culture, and client experience.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT: Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Category <span style={{ color: 'var(--accent)' }}>*</span></label>
              <select className="form-select" value={form.category} onChange={e => handleChange('category', e.target.value)} style={{ width: '100%' }} required>
                <option value="">— Select feedback category —</option>
                {FEEDBACK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Feedback For <span style={{ color: 'var(--accent)' }}>*</span></label>
              <select className="form-select" value={form.to} onChange={e => handleChange('to', e.target.value)} style={{ width: '100%' }} required>
                <option value="">— Select recipient —</option>
                {allUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Feedback Description <span style={{ color: 'var(--accent)' }}>*</span></span>
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>{form.description.length} chars</span>
              </label>
              <textarea
                className="form-input" rows="8"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                placeholder="Describe your feedback in detail. Include numbers, percentages, and client/business impact to improve your Impact Score…"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                required
              />
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
                💡 Tip: Include metrics like hours saved, % improvement, or cost/revenue impact for a higher score.
              </p>
            </div>

            <div>
              <label className="form-label">Attachment <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <div
                style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: 'var(--surface-hover)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.fileName ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Paperclip size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>{form.fileName}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); handleChange('fileName', ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Paperclip size={18} style={{ marginBottom: '0.25rem' }} />
                    <div>Click to attach a file (PDF, image, doc)</div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                <Send size={16} /> Submit Feedback
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: AI Impact Analyzer */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(0,51,141,0.07), rgba(114,19,234,0.06))',
            border: '1px solid rgba(114,19,234,0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 8px 32px rgba(114,19,234,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}>
                <Zap size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Impact Analyzer</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Powered by keyword scoring</div>
              </div>
            </div>

            {/* Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative', width: '150px', height: '85px', overflow: 'hidden' }}>
                <svg width="150" height="85" viewBox="0 0 150 85">
                  <path d="M 15 75 A 60 60 0 0 1 135 75" fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
                  <path
                    d="M 15 75 A 60 60 0 0 1 135 75"
                    fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(impactScore / 10) * 188} 188`}
                    style={{ transition: 'all 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', lineHeight: 1 }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: scoreColor, transition: 'color 0.5s ease' }}>
                    {impactScore === 0 ? '—' : impactScore}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ 10</div>
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: scoreColor, marginTop: '0.35rem', transition: 'color 0.5s ease' }}>
                {ScoreLabel(impactScore)}
              </div>
            </div>

            {/* Score Dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: impactScore >= n ? ScoreColor(n) : 'var(--surface-hover)',
                  border: `2px solid ${impactScore >= n ? ScoreColor(n) : 'var(--border)'}`,
                  fontSize: '0.6rem', color: impactScore >= n ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  transition: 'all 0.3s ease'
                }}>
                  {n}
                </div>
              ))}
            </div>

            {/* Detected Signals */}
            {insights.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Detected Signals
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span>{ins.icon}</span> {ins.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                💡 Suggestions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: '0.75rem', borderLeft: '2px solid var(--border)' }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {impactScore === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div>Start typing to see your<br />real-time impact score</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
