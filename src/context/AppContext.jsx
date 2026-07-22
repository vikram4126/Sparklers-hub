import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const getWeekOfMonth = (date) => {
  return Math.ceil(date.getDate() / 7);
};

// PM and reportees mapping
export const PM_TEAM_MAP = {
  'Abhineet': ['Parteek', 'Shreya', 'Ganash lal'],
  'Ses': ['Vikram', 'Shantanu', 'Sukhvenar'],
  'Himanshu': ['Sivani'],
  'Monam': ['Ameen']
};

export const PM_ROLES = {
  'Abhineet': 'PM',
  'Ses': 'PM',
  'Himanshu': 'PM',
  'Monam': 'AM'
};

export const PM_TEAM_NAMES = {
  'Abhineet': "Abhineet's Team",
  'Ses': "Ses's Team",
  'Himanshu': "Himanshu's Team",
  'Monam': "Monam's Team"
};

// All reportees list
export const PM_TEAM = Object.values(PM_TEAM_MAP).flat();

export const CATEGORIES = ['Innovation', 'Team Player', 'Extra Mile', 'Customer Success'];

// Each role has its own identity
export const ROLE_USERS = {
  User: 'Parteek',
  PM: 'Abhineet',
  Admin: 'Sola',
  Leadership: 'Kumaran'
};

export const getPMForUser = (userName) => {
  for (const [pm, reportees] of Object.entries(PM_TEAM_MAP)) {
    if (reportees.includes(userName)) {
      return pm;
    }
  }
  return 'Unknown PM';
};

export const getTeamNameForUser = (userName) => {
  if (PM_TEAM_MAP[userName]) {
    return PM_TEAM_NAMES[userName];
  }
  const pm = getPMForUser(userName);
  return PM_TEAM_NAMES[pm] || 'Management';
};

export const getReporteesForPM = (pmName) => {
  return PM_TEAM_MAP[pmName] || [];
};


let _id = 100;
const mkNom = (name, category, reason, status, dateStr, submittedBy = 'PM') => ({
  id: _id++,
  name, category, reason, status,
  date: new Date(dateStr).toISOString(),
  submittedBy
});

// Rich 6-month dummy data — every week of every month has winners
// Indian names: Priya Sharma, Rahul Verma, Anjali Singh, Vikram Patel, Neha Gupta,
//               Arjun Mehta, Kavitha Nair, Rohit Kumar, Sunita Rao, Deepak Joshi
const initialNominations = [
  // ── FEBRUARY 2026 ──────────────────────────────
  mkNom('Priya Sharma',   'Innovation',       'Built an automated report tool',            'Approved', '2026-02-03'),
  mkNom('Rahul Verma',    'Team Player',      'Onboarded 4 new joiners smoothly',          'Approved', '2026-02-04'),
  mkNom('Anjali Singh',   'Extra Mile',       'Delivered the sprint a day early',          'Approved', '2026-02-05'),
  mkNom('Vikram Patel',   'Customer Success', 'Resolved critical client escalation',       'Approved', '2026-02-06'),

  mkNom('Neha Gupta',     'Innovation',       'Introduced new testing framework',          'Approved', '2026-02-10'),
  mkNom('Arjun Mehta',    'Team Player',      'Organised cross-team knowledge session',    'Approved', '2026-02-11'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Fixed production bug over the weekend',     'Approved', '2026-02-12'),

  mkNom('Rohit Kumar',    'Customer Success', 'Client NPS score improved by 15 pts',       'Approved', '2026-02-17'),
  mkNom('Sunita Rao',     'Innovation',       'Reduced API latency by 40%',                'Approved', '2026-02-18'),
  mkNom('Deepak Joshi',   'Team Player',      'Mentored 2 junior analysts effectively',    'Approved', '2026-02-19'),
  mkNom('Priya Sharma',   'Extra Mile',       'Covered 3 sick colleagues seamlessly',      'Approved', '2026-02-20'),

  mkNom('Rahul Verma',    'Customer Success', 'Won a $200k renewal negotiation',           'Approved', '2026-02-24'),
  mkNom('Anjali Singh',   'Innovation',       'Created a reusable component library',      'Approved', '2026-02-25'),
  mkNom('Vikram Patel',   'Team Player',      'Coordinated seamlessly across 3 time zones','Approved', '2026-02-26'),

  // ── MARCH 2026 ──────────────────────────────
  mkNom('Neha Gupta',     'Extra Mile',       'Prepared detailed RFP in 24 hours',         'Approved', '2026-03-03'),
  mkNom('Arjun Mehta',    'Customer Success', 'Achieved 100% client satisfaction score',   'Approved', '2026-03-04'),
  mkNom('Kavitha Nair',   'Innovation',       'Automated weekly reporting saving 4 hrs',   'Approved', '2026-03-05'),
  mkNom('Rohit Kumar',    'Team Player',      'Led retrospectives that improved velocity', 'Approved', '2026-03-06'),

  mkNom('Sunita Rao',     'Extra Mile',       'Volunteered to train new batch',            'Approved', '2026-03-10'),
  mkNom('Deepak Joshi',   'Customer Success', 'Handled 3 critical incidents in 1 week',    'Approved', '2026-03-11'),
  mkNom('Priya Sharma',   'Innovation',       'Prototyped AI chatbot for helpdesk',        'Approved', '2026-03-12'),

  mkNom('Rahul Verma',    'Team Player',      'Pair-programmed with struggling colleague', 'Approved', '2026-03-17'),
  mkNom('Anjali Singh',   'Extra Mile',       'Completed certification ahead of deadline', 'Approved', '2026-03-18'),
  mkNom('Vikram Patel',   'Customer Success', 'Turned a detractor client into promoter',   'Approved', '2026-03-19'),
  mkNom('Neha Gupta',     'Innovation',       'Pioneered new data pipeline architecture',  'Approved', '2026-03-20'),

  mkNom('Arjun Mehta',    'Team Player',      'Ran an impactful team-building session',    'Approved', '2026-03-24'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Delivered 2 features in the same sprint',   'Approved', '2026-03-25'),
  mkNom('Rohit Kumar',    'Customer Success', 'Saved a churning enterprise account',        'Approved', '2026-03-26'),

  // ── APRIL 2026 ──────────────────────────────
  mkNom('Sunita Rao',     'Innovation',       'Proposed process saving 6 hrs/week',        'Approved', '2026-04-01'),
  mkNom('Deepak Joshi',   'Team Player',      'Documented entire codebase for the team',   'Approved', '2026-04-02'),
  mkNom('Priya Sharma',   'Extra Mile',       'Conducted 5 training sessions in a week',   'Approved', '2026-04-03'),
  mkNom('Rahul Verma',    'Customer Success', 'Maintained 100% SLA for entire month',      'Approved', '2026-04-04'),

  mkNom('Anjali Singh',   'Innovation',       'Reduced CI/CD build time by 50%',           'Approved', '2026-04-08'),
  mkNom('Vikram Patel',   'Team Player',      'Mediated a cross-team conflict effectively', 'Approved', '2026-04-09'),
  mkNom('Neha Gupta',     'Extra Mile',       'Delivered hotfix at midnight on a Friday',  'Approved', '2026-04-10'),

  mkNom('Arjun Mehta',    'Customer Success', 'Upsold additional module to key account',   'Approved', '2026-04-14'),
  mkNom('Kavitha Nair',   'Innovation',       'Introduced automated QA testing',           'Approved', '2026-04-15'),
  mkNom('Rohit Kumar',    'Team Player',      'Shared best practices across all squads',   'Approved', '2026-04-16'),
  mkNom('Sunita Rao',     'Extra Mile',       'Stayed late 3 days to unblock release',     'Approved', '2026-04-17'),

  mkNom('Deepak Joshi',   'Customer Success', 'Client requested to extend contract early', 'Approved', '2026-04-22'),
  mkNom('Priya Sharma',   'Innovation',       'Built a live dashboard for leadership',     'Approved', '2026-04-23'),
  mkNom('Rahul Verma',    'Team Player',      'Wrote onboarding guides used by 10 people', 'Approved', '2026-04-24'),

  // ── MAY 2026 ──────────────────────────────
  mkNom('Anjali Singh',   'Extra Mile',       'Submitted detailed post-mortem analysis',   'Approved', '2026-05-05'),
  mkNom('Vikram Patel',   'Customer Success', 'Achieved highest CSAT in the team',         'Approved', '2026-05-06'),
  mkNom('Neha Gupta',     'Innovation',       'Implemented feature flag system',           'Approved', '2026-05-07'),
  mkNom('Arjun Mehta',    'Team Player',      'Arranged fortnightly sprint demos',         'Approved', '2026-05-08'),

  mkNom('Kavitha Nair',   'Extra Mile',       'Helped 3 teammates meet sprint goal',       'Approved', '2026-05-12'),
  mkNom('Rohit Kumar',    'Customer Success', 'Resolved 50 support tickets in 5 days',     'Approved', '2026-05-13'),
  mkNom('Sunita Rao',     'Innovation',       'Created self-service analytics portal',     'Approved', '2026-05-14'),

  mkNom('Deepak Joshi',   'Team Player',      'Co-led hiring panel for 3 open roles',      'Approved', '2026-05-19'),
  mkNom('Priya Sharma',   'Extra Mile',       'Took over a colleagues tasks during leave', 'Approved', '2026-05-20'),
  mkNom('Rahul Verma',    'Customer Success', 'Finalised and signed key partnership deal', 'Approved', '2026-05-21'),
  mkNom('Anjali Singh',   'Innovation',       'Open-sourced an internal utility tool',     'Approved', '2026-05-22'),

  mkNom('Vikram Patel',   'Team Player',      'Ran a hackathon that produced 2 features',  'Approved', '2026-05-26'),
  mkNom('Neha Gupta',     'Extra Mile',       'Presented at company all-hands on short notice','Approved', '2026-05-27'),
  mkNom('Arjun Mehta',    'Customer Success', 'On-boarded the largest client of the year', 'Approved', '2026-05-28'),

  // ── JUNE 2026 ──────────────────────────────
  mkNom('Kavitha Nair',   'Innovation',       'Redesigned data ingestion pipeline',        'Approved', '2026-06-02'),
  mkNom('Rohit Kumar',    'Team Player',      'Mentored intern cohort for 4 weeks',        'Approved', '2026-06-03'),
  mkNom('Sunita Rao',     'Extra Mile',       'Coordinated go-live across 5 time zones',   'Approved', '2026-06-04'),
  mkNom('Deepak Joshi',   'Customer Success', 'Recovered churn risk worth ₹40L',           'Approved', '2026-06-05'),

  mkNom('Priya Sharma',   'Innovation',       'ML model improved forecast accuracy 20%',   'Approved', '2026-06-09'),
  mkNom('Rahul Verma',    'Team Player',      'Drove sprint retrospectives consistently',  'Approved', '2026-06-10'),
  mkNom('Anjali Singh',   'Extra Mile',       'Wrote detailed runbooks for production',    'Approved', '2026-06-11'),

  mkNom('Vikram Patel',   'Customer Success', 'Exceeded quarterly OKR by 15%',             'Approved', '2026-06-16'),
  mkNom('Neha Gupta',     'Innovation',       'Created no-code admin panel for ops',       'Approved', '2026-06-17'),
  mkNom('Arjun Mehta',    'Team Player',      'Launched internal wiki used by 40 people',  'Approved', '2026-06-18'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Resolved 3 P1 issues in same day',          'Approved', '2026-06-19'),

  mkNom('Rohit Kumar',    'Customer Success', 'Signed multi-year contract with client',    'Approved', '2026-06-23'),
  mkNom('Sunita Rao',     'Innovation',       'Piloted RPA for repetitive admin work',     'Approved', '2026-06-24'),
  mkNom('Deepak Joshi',   'Team Player',      'Coordinated cross-functional product review','Approved', '2026-06-25'),

  // ── JULY 2026 ──────────────────────────────
  mkNom('Priya Sharma',   'Innovation',       'Automated nomination email workflow',        'Approved', '2026-07-01'),
  mkNom('Rahul Verma',    'Customer Success', 'Achieved highest CSAT of Q3 in July W1',    'Approved', '2026-07-02'),
  mkNom('Anjali Singh',   'Team Player',      'Led stand-up coverage during PM leave',     'Approved', '2026-07-03'),
  mkNom('Vikram Patel',   'Extra Mile',       'Delivered emergency patch for client',      'Approved', '2026-07-04'),

  mkNom('Neha Gupta',     'Innovation',       'Integrated Power Automate with SharePoint', 'Approved', '2026-07-08'),
  mkNom('Arjun Mehta',    'Extra Mile',       'Reviewed 20 PRs in a single week',          'Approved', '2026-07-09'),
  mkNom('Kavitha Nair',   'Team Player',      'Unified design system across 3 teams',      'Approved', '2026-07-10'),

  mkNom('Rohit Kumar',    'Customer Success', 'Retained key client after competitor pitch','Approved', '2026-07-15'),
  mkNom('Sunita Rao',     'Innovation',       'Piloted AI summarisation tool for reports', 'Approved', '2026-07-16'),
  mkNom('Priya Sharma',   'Extra Mile',       'Self-nominated for going above and beyond', 'Pending',  '2026-07-17', 'self'),
  mkNom('Deepak Joshi',   'Team Player',      'Coordinated town hall logistics flawlessly','PMApproved','2026-07-18'),
];

const nameMap = {
  'Priya Sharma': 'Parteek',
  'Rahul Verma': 'Shreya',
  'Anjali Singh': 'Ganash lal',
  'Vikram Patel': 'Vikram',
  'Neha Gupta': 'Shantanu',
  'Arjun Mehta': 'Sukhvenar',
  'Kavitha Nair': 'Sivani',
  'Rohit Kumar': 'Ameen',
  'Sunita Rao': 'Shreya',
  'Deepak Joshi': 'Parteek'
};

const mappedInitialNominations = initialNominations.map(n => ({
  ...n,
  name: nameMap[n.name] || n.name
}));

export const AppProvider = ({ children }) => {
  const [nominations, setNominations] = useState(() => {
    const saved = localStorage.getItem('sparklers_nominations_v6');
    return saved ? JSON.parse(saved) : mappedInitialNominations;
  });

  const [currentRole, setCurrentRole] = useState('User');
  const [currentUser, setCurrentUser] = useState(ROLE_USERS['User']);

  // Auto-sync user name when role changes
  useEffect(() => {
    setCurrentUser(ROLE_USERS[currentRole] || 'Parteek');
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('sparklers_nominations_v6', JSON.stringify(nominations));
  }, [nominations]);

  useEffect(() => {
    const sweepExpirations = () => {
      setNominations(prev => {
        let changed = false;
        const now = new Date();
        const next = prev.map(n => {
          if (n.status === 'Pending' || n.status === 'PMApproved') {
            const nomDate = new Date(n.date);
            const day = nomDate.getDay();
            const daysToFriday = (5 - day + 7) % 7;
            
            const targetFriday = new Date(nomDate);
            targetFriday.setDate(nomDate.getDate() + daysToFriday);
            targetFriday.setHours(17, 0, 0, 0); // 5:00 PM
            
            if (day === 5 && nomDate.getHours() >= 17) {
              targetFriday.setDate(targetFriday.getDate() + 7);
            }
            
            if (now > targetFriday) {
              changed = true;
              return { ...n, status: 'Expired', rejectReason: 'Automatically expired after Friday 5:00 PM deadline.' };
            }
          }
          return n;
        });
        return changed ? next : prev;
      });
    };
    
    sweepExpirations();
    const interval = setInterval(sweepExpirations, 60000);
    return () => clearInterval(interval);
  }, []);

  const addNomination = (nomination, submittedByRole = 'User') => {
    const isSubmittedByPM = submittedByRole === 'PM';
    setNominations(prev => [...prev, {
      ...nomination,
      id: Date.now(),
      // If PM nominates directly, skip PM queue → go straight to Admin
      status: isSubmittedByPM ? 'PMApproved' : 'Pending',
      date: new Date().toISOString(),
      submittedBy: submittedByRole
    }]);
  };

  const pmApprove = (id, newCategory, reason) => {
    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'PMApproved', category: newCategory || n.category, pmApproveReason: reason } : n
    ));
  };

  const rejectNomination = (id, reason) => {
    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'Rejected', rejectReason: reason } : n
    ));
  };

  const adminApprove = (id, reason) => {
    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'Approved', adminApproveReason: reason } : n
    ));
  };

  return (
    <AppContext.Provider value={{
      nominations,
      addNomination,
      pmApprove,
      rejectNomination,
      adminApprove,
      currentRole,
      setCurrentRole,
      currentUser,
      setCurrentUser,
      getPMForUser,
      getTeamNameForUser,
      getReporteesForPM
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
