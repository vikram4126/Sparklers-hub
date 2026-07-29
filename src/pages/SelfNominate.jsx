import React, { useState } from 'react';
import { useAppContext, CATEGORIES, EXTERNAL_AWARD_TYPES } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Award, Calendar, Building2, User, FileText, CheckCircle, Star } from 'lucide-react';

const SelfNominate = () => {
  const { addNomination, addExternalAward, currentUser, getPMForUser } = useAppContext();
  const navigate = useNavigate();

  const pm = getPMForUser(currentUser);
  const [activeTab, setActiveTab] = useState('sparklers');

  // Sparklers State
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [sparklersSubmitted, setSparklersSubmitted] = useState(false);

  // Other Awards State
  const [form, setForm] = useState({
    awardName: '',
    customAwardName: '',
    platform: '',
    dateReceived: '',
    description: ''
  });
  const [otherSubmitted, setOtherSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSparklersSubmit = (e) => {
    e.preventDefault();
    if (category && reason) {
      addNomination({ 
        name: currentUser, 
        category, 
        reason,
        status: ['Kumaran', 'Krishan'].includes(pm) ? 'PMApproved' : 'Pending'
      });
      setSparklersSubmitted(true);
    }
  };

  const handleOtherChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const finalAwardName = form.awardName === 'Other' ? form.customAwardName.trim() : form.awardName;

  const handleOtherSubmit = (e) => {
    e.preventDefault();
    if (!finalAwardName) return setError('Please select or enter an award name.');
    if (!form.dateReceived) return setError('Please select the date you received this award.');
    if (!form.description.trim()) return setError('Please provide a short description.');

    addExternalAward({
      submittedBy: currentUser,
      awardName: finalAwardName,
      platform: form.platform.trim() || 'Not specified',
      dateReceived: form.dateReceived,
      description: form.description.trim(),
      status: ['Kumaran', 'Krishan'].includes(pm) ? 'AdminPending' : 'Pending'
    });

    setOtherSubmitted(true);
  };

  if (sparklersSubmitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Nomination Submitted!</h1>
        <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '2rem' }}>
          Your self-nomination for <strong>{category}</strong> has been sent to your PM for review. You'll be notified once it's approved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to My Dashboard
        </button>
      </div>
    );
  }

  if (otherSubmitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Award Logged Successfully!</h1>
        <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '0.5rem' }}>
          Your <strong>{finalAwardName}</strong> award has been submitted.
        </p>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
          {['Kumaran', 'Krishan'].includes(pm) 
            ? `Your award has been sent directly to Admin for final approval.`
            : `Your PM ${pm} has been notified via email and will approve it shortly.`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to My Dashboard</button>
          <button className="btn btn-secondary" onClick={() => { setOtherSubmitted(false); setForm({ awardName: '', customAwardName: '', platform: '', dateReceived: '', description: '' }); }}>Log Another Award</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      
      {/* ── Tab Switcher ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('sparklers')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            fontWeight: '600', fontSize: '1rem', flex: 1,
            color: activeTab === 'sparklers' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'sparklers' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          <Star size={18} /> Sparklers Award
        </button>
        <button
          onClick={() => setActiveTab('other')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.5rem',
            fontWeight: '600', fontSize: '1rem', flex: 1,
            color: activeTab === 'other' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'other' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
          }}
        >
          <Award size={18} /> Other Awards
        </button>
      </div>

      {activeTab === 'sparklers' && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Self Nominate</h1>
            <p className="text-muted">Apply for a Sparklers award if you've gone above and beyond this week.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleSparklersSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Category</label>
                <select 
                  className="form-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required
                  style={{ width: '100%' }}
                >
                  <option value="" disabled>Select category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Why are you nominating yourself?</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  required 
                  placeholder="Describe your achievement..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <Send size={16} /> Submit to PM
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {activeTab === 'other' && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Log Other Awards</h1>
            <p className="text-muted">Received an award on another platform? Add it here to include it in your portfolio.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleOtherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Award size={16} color="var(--primary)" />
                  Award Name <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={form.awardName}
                  onChange={e => handleOtherChange('awardName', e.target.value)}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">— Select Award Type —</option>
                  {EXTERNAL_AWARD_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {form.awardName === 'Other' && (
                  <input
                    className="form-input"
                    style={{ marginTop: '0.5rem', width: '100%' }}
                    placeholder="Enter award name..."
                    value={form.customAwardName}
                    onChange={e => handleOtherChange('customAwardName', e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Building2 size={16} color="var(--primary)" />
                  Platform / Source <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. KPMG Encore, Teams Recognition..."
                  value={form.platform}
                  onChange={e => handleOtherChange('platform', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Calendar size={16} color="var(--primary)" />
                  Date Received <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={form.dateReceived}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => handleOtherChange('dateReceived', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <FileText size={16} color="var(--primary)" />
                  Description <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Briefly describe why you received this award..."
                  value={form.description}
                  onChange={e => handleOtherChange('description', e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <Award size={16} /> Log Award
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default SelfNominate;
