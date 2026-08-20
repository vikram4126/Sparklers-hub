import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send } from 'lucide-react';

const NominationForm = () => {
  const { addNomination, currentRole, currentUser, getReporteesForPM } = useAppContext();
  const myReportees = getReporteesForPM(currentUser);
  const [formData, setFormData] = useState({ name: '', category: 'Process & Efficiency', reason: '', hoursSaved: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.reason) {
      addNomination({
        ...formData,
        hoursSaved: Number(formData.hoursSaved) || 0
      }, currentRole);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', category: 'Process & Efficiency', reason: '', hoursSaved: '' });
      }, 3000);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1>Submit a Sparkler Nomination</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Nominate your team members for outstanding contributions, efficiency gains, and impact this week.
      </p>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--success)', fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h3>Nomination Submitted!</h3>
            <p>Thank you for nominating {formData.name}. The admin team will review it.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nominee Name</label>
              <select 
                className="form-select"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              >
                <option value="" disabled>Select a team member</option>
                {myReportees.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Process & Efficiency">Process & Efficiency</option>
                <option value="Innovation">Innovation</option>
                <option value="Team Player">Team Player</option>
                <option value="Extra Mile">Extra Mile</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>

            {formData.category === 'Process & Efficiency' && (
              <div className="form-group" style={{ background: 'rgba(0, 192, 174, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0, 192, 174, 0.3)' }}>
                <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                  Hours Saved per Week
                </label>
                <input 
                  type="number"
                  min="0"
                  max="500"
                  className="form-input"
                  placeholder="e.g. 15 (Hours saved through automation/process improvement)"
                  value={formData.hoursSaved}
                  onChange={(e) => setFormData({...formData, hoursSaved: e.target.value})}
                />
                <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                  This metric fuels leadership's <strong>Efficiency ROI Dashboard</strong> and <strong>Automation Leaderboard</strong>.
                </small>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason for Nomination</label>
              <textarea 
                className="form-textarea" 
                rows="4"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Describe what they did and the impact/hours saved..."
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proof / Attachment (Optional)</label>
              <input type="file" className="form-input" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={18} /> Submit Nomination
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NominationForm;
