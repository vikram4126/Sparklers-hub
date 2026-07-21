import React from 'react';
import { useAppContext, getWeekOfMonth } from '../context/AppContext';

const getBackgroundImage = (category) => {
  switch (category) {
    case 'Innovation': return '/category-background/Screenshot 2026-07-19 at 9.47.35 AM.png';
    case 'Team Player': return '/category-background/Screenshot 2026-07-19 at 9.47.44 AM.png';
    case 'Extra Mile': return '/category-background/Screenshot 2026-07-19 at 9.47.51 AM.png';
    case 'Customer Success': return '/category-background/Screenshot 2026-07-19 at 9.47.57 AM.png';
    default: return '/category-background/Screenshot 2026-07-19 at 9.48.03 AM.png';
  }
};

const getCurrentWeekMonth = () => {
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  const week = getWeekOfMonth(date);
  return `Week ${week}, ${month} ${date.getFullYear()}`;
};

const DesignGeneratorPreview = () => {
  const { nominations } = useAppContext();
  
  // Only show for the current month AND current week
  const approvedThisWeek = nominations.filter(n => {
    if (n.status !== 'Approved') return false;
    const dateObj = new Date(n.date || new Date());
    const currentDate = new Date();
    
    const isCurrentMonth = dateObj.getMonth() === currentDate.getMonth() && dateObj.getFullYear() === currentDate.getFullYear();
    const isCurrentWeek = getWeekOfMonth(dateObj) === getWeekOfMonth(currentDate);
    
    return isCurrentMonth && isCurrentWeek;
  });
  
  const dateStr = getCurrentWeekMonth();

  return (
    <div className="animate-fade-in">
      <h1>Automated Design Generator</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Preview of the Friday Teams announcement and generated award cards for the current week.
      </p>

      {approvedThisWeek.length > 0 ? (
        <>
          <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
            <h3>Teams Message Preview</h3>
            <p style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
              🎉 **Congratulations to our Sparklers of the week!** 🎉
              {"\n\n"}
              This week, we are celebrating the outstanding contributions of:
              {approvedThisWeek.map(n => `\n- **${n.name}** for ${n.category}`).join('')}
              {"\n\n"}
              Thank you all for your hard work and dedication! Check out their awards below. 🚀
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {approvedThisWeek.map(nom => (
              <div 
                key={nom.id} 
                className="award-card"
                style={{ backgroundImage: `url("${getBackgroundImage(nom.category)}")` }}
              >
                <div>
                  <div className="award-category">{nom.category}</div>
                </div>
                
                <div style={{ paddingBottom: '1rem' }}>
                  <div className="award-name">{nom.name}</div>
                  <div className="award-date">{dateStr}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Approved Awards This Week</h3>
          <p className="text-muted">Approve some nominations in the Admin tab for this week to see generated designs.</p>
        </div>
      )}
    </div>
  );
};

export default DesignGeneratorPreview;
