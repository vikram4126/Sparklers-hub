import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Send } from 'lucide-react';

const NominationForm = () => {
  const { addNomination, currentRole, currentUser, getReporteesForPM } = useAppContext();
  const myReportees = getReporteesForPM(currentUser);
  const [formData, setFormData] = useState({ name: '', category: 'Innovation', reason: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.reason) {
      addNomination(formData, currentRole);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', category: 'Innovation', reason: '' });
      }, 3000);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1>Submit a Sparkler Nomination</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Nominate your team members for outstanding contributions this week.
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
                <option value="Innovation">Innovation</option>
                <option value="Team Player">Team Player</option>
                <option value="Extra Mile">Extra Mile</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Nomination</label>
              <textarea 
                className="form-textarea" 
                rows="4"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Describe what they did..."
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
