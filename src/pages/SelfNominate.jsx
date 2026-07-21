import React, { useState } from 'react';
import { useAppContext, CATEGORIES } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

const SelfNominate = () => {
  const { addNomination, currentUser } = useAppContext();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category && reason) {
      addNomination({ name: currentUser, category, reason });
      setSubmitted(true);
    }
  };

  // Power Apps pattern: Show a "Success screen" after submit, then navigate back
  if (submitted) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Nomination Submitted!</h1>
        <p className="text-muted" style={{ maxWidth: '420px', marginBottom: '2rem' }}>
          Your self-nomination for <strong>{category}</strong> has been sent to your PM for review. You'll be notified once it's approved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          Back to My Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Back nav — simulates Power Apps back button */}
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Self Nomination</h1>
        <p className="text-muted">
          Nominate yourself for a Sparklers award. Your PM will review and approve your request.
        </p>
      </div>

      {/* Form Card — full screen, single purpose like a Power Apps form screen */}
      <div className="glass-panel">
        <form onSubmit={handleSubmit}>

          {/* Read-only Nominee Field */}
          <div className="form-group">
            <label className="form-label">Nominee</label>
            <input
              type="text"
              className="form-input"
              value={currentUser}
              disabled
              style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
            <small className="text-muted" style={{ display: 'block', marginTop: '0.4rem' }}>
              You are nominating yourself. Your PM will approve this.
            </small>
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label">Award Category <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reason / Comments */}
          <div className="form-group">
            <label className="form-label">Reason / Comments <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              className="form-textarea"
              rows="5"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe what you achieved and why you deserve this award..."
              required
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!category || !reason}>
              <Send size={16} />
              Submit to PM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfNominate;
