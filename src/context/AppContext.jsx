import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const getWeekOfMonth = (date) => {
  return Math.ceil(date.getDate() / 7);
};

// Managers: Sol (Manager), Ashok (Manager)
// AMs: Ses (AM), Monam (AM)
// TLs: Abhineet (TL - CD), Himanshu (TL - Digital), Ameen (TL - Design)
// Admin: Avinash (separate role — can be any user; gets Final Approvals + Design Generator access)
export const PM_TEAM_MAP = {
  'Abhineet': ['Parteek', 'Shreya', 'Ganash lal'], // Users to CD TL
  'Himanshu': ['Vikram', 'Shantanu', 'Sukhvindar'], // Users to Digital TL
  'Ameen': ['Sivani'], // User to Design TL
  'Monam': ['Abhineet', 'Rahul', 'Priya'], // CD/Sales TLs to AM Monam
  'Rohan': [], // Dummy AM under Ashok (Sales)
  'Ses': ['Himanshu', 'Ameen'], // Digital & Design TLs to AM Ses
  'Kunal': [], // Dummy AM under Sol (Digital)
  'Ashok': ['Monam', 'Rohan'], // AMs to Manager Ashok
  'Sol': ['Ses', 'Kunal'], // AMs to Manager Sol
  'Kumaran': ['Sol', 'Ashok'], // Managers to AD Kumaran
  'Krishan': ['Kumaran'] // AD Kumaran to Director Krishan
};

export const PM_ROLES = {
  'Abhineet': 'TL',
  'Himanshu': 'TL',
  'Ameen': 'TL',
  'Rahul': 'TL',
  'Priya': 'TL',
  'Ses': 'AM',
  'Monam': 'AM',
  'Rohan': 'AM',
  'Kunal': 'AM',
  'Sol': 'Manager',
  'Ashok': 'Manager',
  'Kumaran': 'AD',
  'Krishan': 'Director'
};

export const PM_TEAM_NAMES = {
  'Abhineet': "Abhineet's Team",
  'Ses': "Ses's Team",
  'Himanshu': "Himanshu's Team",
  'Monam': "Monam's Team"
};

// Department mapping per member
export const USER_DEPARTMENT_MAP = {
  // CD
  'Abhineet': 'CD',
  'Parteek':  'CD',
  'Shreya':   'CD',
  'Ganash lal': 'CD',
  // Digital
  'Himanshu':  'Digital',
  'Vikram':    'Digital',
  'Shantanu':  'Digital',
  'Sukhvindar': 'Digital',
  // Design
  'Ameen':     'Design',
  'Sivani':    'Design',
  // AM / Managers
  'Ses':       'Digital',
  'Monam':     'Sales',
  'Rahul':     'Sales',
  'Priya':     'Sales',
  'Rohan':     'Sales',
  'Kunal':     'Digital',
  'Sol':       'Digital', // Sol is Digital Manager
  'Ashok':     'Design',  // Ashok is Design Manager
  // AD / Director
  'Kumaran':   'Admin',
  'Krishan':   'Admin',
  // Admin (separate platform role — not tied to hierarchy)
  'Avinash':   'Admin'
};

export const getDepartmentForUser = (userName) => {
  return USER_DEPARTMENT_MAP[userName] || '';
};

// All reportees list
export const PM_TEAM = Object.values(PM_TEAM_MAP).flat();

export const CATEGORIES = ['Innovation', 'Process & Efficiency', 'Team Player', 'Extra Mile', 'Customer Success'];

export const EXTERNAL_AWARD_TYPES = [
  'Rising Star',
  'Kudos',
  'Above and Beyond',
  'Service Excellence',
  'Innovation Award',
  'Living the Values',
  'Client Champion',
  'Team Spirit',
  'Leadership Excellence',
  'Other'
];

// Each role has its own identity
// Admin is a platform role — Avinash is both a user AND admin
export const ROLE_USERS = {
  User: 'Parteek',
  PM: 'Abhineet',
  Admin: 'Avinash',
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
const mkNom = (name, category, reason, status, dateStr, submittedBy = 'PM', hoursSaved = 0) => ({
  id: _id++,
  name, category, reason, status,
  date: new Date(dateStr).toISOString(),
  submittedBy,
  hoursSaved
});

// Rich 6-month dummy data — every week of every month has winners
// Indian names: Priya Sharma, Rahul Verma, Anjali Singh, Vikram Patel, Neha Gupta,
//               Arjun Mehta, Kavitha Nair, Rohit Kumar, Sunita Rao, Deepak Joshi
const initialNominations = [
  // ── FEBRUARY 2026 ──────────────────────────────
  mkNom('Priya Sharma',   'Process & Efficiency', 'Built an automated report tool',            'Approved', '2026-02-03', 'PM', 15),
  mkNom('Rahul Verma',    'Team Player',      'Onboarded 4 new joiners smoothly',          'Approved', '2026-02-04'),
  mkNom('Anjali Singh',   'Extra Mile',       'Delivered the sprint a day early',          'Approved', '2026-02-05'),
  mkNom('Vikram Patel',   'Customer Success', 'Resolved critical client escalation',       'Approved', '2026-02-06'),

  mkNom('Neha Gupta',     'Process & Efficiency', 'Introduced new testing framework',          'Approved', '2026-02-10', 'PM', 20),
  mkNom('Arjun Mehta',    'Team Player',      'Organised cross-team knowledge session',    'Approved', '2026-02-11'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Fixed production bug over the weekend',     'Approved', '2026-02-12'),

  mkNom('Rohit Kumar',    'Customer Success', 'Client NPS score improved by 15 pts',       'Approved', '2026-02-17'),
  mkNom('Sunita Rao',     'Process & Efficiency', 'Reduced API latency by 40%',                'Approved', '2026-02-18', 'PM', 25),
  mkNom('Deepak Joshi',   'Team Player',      'Mentored 2 junior analysts effectively',    'Approved', '2026-02-19'),
  mkNom('Priya Sharma',   'Extra Mile',       'Covered 3 sick colleagues seamlessly',      'Approved', '2026-02-20'),

  mkNom('Rahul Verma',    'Customer Success', 'Won a $200k renewal negotiation',           'Approved', '2026-02-24'),
  mkNom('Anjali Singh',   'Innovation',       'Created a reusable component library',      'Approved', '2026-02-25', 'PM', 12),
  mkNom('Vikram Patel',   'Team Player',      'Coordinated seamlessly across 3 time zones','Approved', '2026-02-26'),

  // ── MARCH 2026 ──────────────────────────────
  mkNom('Neha Gupta',     'Extra Mile',       'Prepared detailed RFP in 24 hours',         'Approved', '2026-03-03'),
  mkNom('Arjun Mehta',    'Customer Success', 'Achieved 100% client satisfaction score',   'Approved', '2026-03-04'),
  mkNom('Kavitha Nair',   'Process & Efficiency', 'Automated weekly reporting saving 16 hrs',  'Approved', '2026-03-05', 'PM', 16),
  mkNom('Rohit Kumar',    'Team Player',      'Led retrospectives that improved velocity', 'Approved', '2026-03-06'),

  mkNom('Sunita Rao',     'Extra Mile',       'Volunteered to train new batch',            'Approved', '2026-03-10'),
  mkNom('Deepak Joshi',   'Customer Success', 'Handled 3 critical incidents in 1 week',    'Approved', '2026-03-11'),
  mkNom('Priya Sharma',   'Process & Efficiency', 'Prototyped AI chatbot for helpdesk',        'Approved', '2026-03-12', 'PM', 30),

  mkNom('Rahul Verma',    'Team Player',      'Pair-programmed with struggling colleague', 'Approved', '2026-03-17'),
  mkNom('Anjali Singh',   'Extra Mile',       'Completed certification ahead of deadline', 'Approved', '2026-03-18'),
  mkNom('Vikram Patel',   'Customer Success', 'Turned a detractor client into promoter',   'Approved', '2026-03-19'),
  mkNom('Neha Gupta',     'Process & Efficiency', 'Pioneered new data pipeline architecture',  'Approved', '2026-03-20', 'PM', 35),

  mkNom('Arjun Mehta',    'Team Player',      'Ran an impactful team-building session',    'Approved', '2026-03-24'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Delivered 2 features in the same sprint',   'Approved', '2026-03-25'),
  mkNom('Rohit Kumar',    'Customer Success', 'Saved a churning enterprise account',        'Approved', '2026-03-26'),

  // ── APRIL 2026 ──────────────────────────────
  mkNom('Sunita Rao',     'Process & Efficiency', 'Proposed process saving 24 hrs/month',       'Approved', '2026-04-01', 'PM', 24),
  mkNom('Deepak Joshi',   'Team Player',      'Documented entire codebase for the team',   'Approved', '2026-04-02'),
  mkNom('Priya Sharma',   'Extra Mile',       'Conducted 5 training sessions in a week',   'Approved', '2026-04-03'),
  mkNom('Rahul Verma',    'Customer Success', 'Maintained 100% SLA for entire month',      'Approved', '2026-04-04'),

  mkNom('Anjali Singh',   'Process & Efficiency', 'Reduced CI/CD build time by 50%',           'Approved', '2026-04-08', 'PM', 18),
  mkNom('Vikram Patel',   'Team Player',      'Mediated a cross-team conflict effectively', 'Approved', '2026-04-09'),
  mkNom('Neha Gupta',     'Extra Mile',       'Delivered hotfix at midnight on a Friday',  'Approved', '2026-04-10'),

  mkNom('Arjun Mehta',    'Customer Success', 'Upsold additional module to key account',   'Approved', '2026-04-14'),
  mkNom('Kavitha Nair',   'Process & Efficiency', 'Introduced automated QA testing',           'Approved', '2026-04-15', 'PM', 22),
  mkNom('Rohit Kumar',    'Team Player',      'Shared best practices across all squads',   'Approved', '2026-04-16'),
  mkNom('Sunita Rao',     'Extra Mile',       'Stayed late 3 days to unblock release',     'Approved', '2026-04-17'),

  mkNom('Deepak Joshi',   'Customer Success', 'Client requested to extend contract early', 'Approved', '2026-04-22'),
  mkNom('Priya Sharma',   'Process & Efficiency', 'Built a live dashboard for leadership',     'Approved', '2026-04-23', 'PM', 14),
  mkNom('Rahul Verma',    'Team Player',      'Wrote onboarding guides used by 10 people', 'Approved', '2026-04-24'),

  // ── MAY 2026 ──────────────────────────────
  mkNom('Anjali Singh',   'Extra Mile',       'Submitted detailed post-mortem analysis',   'Approved', '2026-05-05'),
  mkNom('Vikram Patel',   'Customer Success', 'Achieved highest CSAT in the team',         'Approved', '2026-05-06'),
  mkNom('Neha Gupta',     'Process & Efficiency', 'Implemented feature flag system',           'Approved', '2026-05-07', 'PM', 10),
  mkNom('Arjun Mehta',    'Team Player',      'Arranged fortnightly sprint demos',         'Approved', '2026-05-08'),

  mkNom('Kavitha Nair',   'Extra Mile',       'Helped 3 teammates meet sprint goal',       'Approved', '2026-05-12'),
  mkNom('Rohit Kumar',    'Customer Success', 'Resolved 50 support tickets in 5 days',     'Approved', '2026-05-13'),
  mkNom('Sunita Rao',     'Process & Efficiency', 'Created self-service analytics portal',     'Approved', '2026-05-14', 'PM', 28),

  mkNom('Deepak Joshi',   'Team Player',      'Co-led hiring panel for 3 open roles',      'Approved', '2026-05-19'),
  mkNom('Priya Sharma',   'Extra Mile',       'Took over a colleagues tasks during leave', 'Approved', '2026-05-20'),
  mkNom('Rahul Verma',    'Customer Success', 'Finalised and signed key partnership deal', 'Approved', '2026-05-21'),
  mkNom('Anjali Singh',   'Innovation',       'Open-sourced an internal utility tool',     'Approved', '2026-05-22'),

  mkNom('Vikram Patel',   'Team Player',      'Ran a hackathon that produced 2 features',  'Approved', '2026-05-26'),
  mkNom('Neha Gupta',     'Extra Mile',       'Presented at company all-hands on short notice','Approved', '2026-05-27'),
  mkNom('Arjun Mehta',    'Customer Success', 'On-boarded the largest client of the year', 'Approved', '2026-05-28'),

  // ── JUNE 2026 ──────────────────────────────
  mkNom('Kavitha Nair',   'Process & Efficiency', 'Redesigned data ingestion pipeline',        'Approved', '2026-06-02', 'PM', 40),
  mkNom('Rohit Kumar',    'Team Player',      'Mentored intern cohort for 4 weeks',        'Approved', '2026-06-03'),
  mkNom('Sunita Rao',     'Extra Mile',       'Coordinated go-live across 5 time zones',   'Approved', '2026-06-04'),
  mkNom('Deepak Joshi',   'Customer Success', 'Recovered churn risk worth ₹40L',           'Approved', '2026-06-05'),

  mkNom('Priya Sharma',   'Process & Efficiency', 'ML model improved forecast accuracy 20%',   'Approved', '2026-06-09', 'PM', 30),
  mkNom('Rahul Verma',    'Team Player',      'Drove sprint retrospectives consistently',  'Approved', '2026-06-10'),
  mkNom('Anjali Singh',   'Extra Mile',       'Wrote detailed runbooks for production',    'Approved', '2026-06-11'),

  mkNom('Vikram Patel',   'Customer Success', 'Exceeded quarterly OKR by 15%',             'Approved', '2026-06-16'),
  mkNom('Neha Gupta',     'Process & Efficiency', 'Created no-code admin panel for ops',       'Approved', '2026-06-17', 'PM', 25),
  mkNom('Arjun Mehta',    'Team Player',      'Launched internal wiki used by 40 people',  'Approved', '2026-06-18'),
  mkNom('Kavitha Nair',   'Extra Mile',       'Resolved 3 P1 issues in same day',          'Approved', '2026-06-19'),

  mkNom('Rohit Kumar',    'Customer Success', 'Signed multi-year contract with client',    'Approved', '2026-06-23'),
  mkNom('Sunita Rao',     'Process & Efficiency', 'Piloted RPA for repetitive admin work',     'Approved', '2026-06-24', 'PM', 50),
  mkNom('Deepak Joshi',   'Team Player',      'Coordinated cross-functional product review','Approved', '2026-06-25'),

  // ── JULY 2026 ──────────────────────────────
  mkNom('Priya Sharma',   'Process & Efficiency', 'Automated nomination email workflow',        'Approved', '2026-07-01', 'PM', 15),
  mkNom('Rahul Verma',    'Customer Success', 'Achieved highest CSAT of Q3 in July W1',    'Approved', '2026-07-02'),
  mkNom('Anjali Singh',   'Team Player',      'Led stand-up coverage during PM leave',     'Approved', '2026-07-03'),
  mkNom('Vikram Patel',   'Extra Mile',       'Delivered emergency patch for client',      'Approved', '2026-07-04'),

  mkNom('Neha Gupta',     'Process & Efficiency', 'Integrated Power Automate with SharePoint', 'Approved', '2026-07-08', 'PM', 20),
  mkNom('Arjun Mehta',    'Extra Mile',       'Reviewed 20 PRs in a single week',          'Approved', '2026-07-09'),
  mkNom('Kavitha Nair',   'Team Player',      'Unified design system across 3 teams',      'Approved', '2026-07-10'),

  mkNom('Rohit Kumar',    'Customer Success', 'Retained key client after competitor pitch','Approved', '2026-07-15'),
  mkNom('Sunita Rao',     'Process & Efficiency', 'Piloted AI summarisation tool for reports', 'Approved', '2026-07-16', 'PM', 18),
  mkNom('Priya Sharma',   'Extra Mile',       'Self-nominated for going above and beyond', 'Pending',  '2026-07-17', 'self'),
  mkNom('Deepak Joshi',   'Team Player',      'Coordinated town hall logistics flawlessly','PMApproved','2026-07-18'),
];

const nameMap = {
  'Priya Sharma': 'Parteek',
  'Rahul Verma': 'Shreya',
  'Anjali Singh': 'Ganash lal',
  'Vikram Patel': 'Vikram',
  'Neha Gupta': 'Shantanu',
  'Arjun Mehta': 'Sukhvindar',
  'Kavitha Nair': 'Sivani',
  'Rohit Kumar': 'Ameen',
  'Sunita Rao': 'Shreya',
  'Deepak Joshi': 'Parteek'
};

// Dummy awards directly for TLs, AMs and Managers
const pmInitialNominations = [
  mkNom('Abhineet', 'Extra Mile', 'Exemplary leadership during project transition', 'Approved', '2026-06-15', 'Monam'),
  mkNom('Abhineet', 'Innovation', 'Set up high-performance workflow models', 'Approved', '2026-07-10', 'Monam'),
  mkNom('Ses', 'Team Player', 'Successfully coordinated cross-functional launch', 'Approved', '2026-06-20', 'Sol'),
  mkNom('Himanshu', 'Customer Success', 'Helped secure digital onboarding from key client', 'Approved', '2026-07-05', 'Ses'),
  mkNom('Monam', 'Extra Mile', 'Led emergency sales pitch securing 3 key accounts', 'Approved', '2026-07-12', 'Ashok'),
  mkNom('Ameen', 'Innovation', 'Created beautiful interactive user journey interfaces', 'Approved', '2026-07-11', 'Ses'),
  // Avinash as a user — nominated by their TL
  mkNom('Avinash', 'Innovation', 'Streamlined admin workflows improving team efficiency by 30%', 'Approved', '2026-07-08', 'Ses'),
  // Monam's Dummy TLs awards
  mkNom('Rahul', 'Extra Mile', 'Secured 3 new enterprise deals', 'Approved', '2026-06-28', 'Monam'),
  mkNom('Priya', 'Team Player', 'Successfully restructured the sales pipeline', 'Approved', '2026-07-10', 'Monam'),
  mkNom('Priya', 'Innovation', 'Created new automated lead tracking tool', 'Approved', '2026-07-02', 'Monam'),
  // Rohan (AM Sales under Ashok) dummy approved awards
  mkNom('Rohan', 'Extra Mile', 'Exceeded sales targets for Q2 by 45%', 'Approved', '2026-06-18', 'Ashok'),
  mkNom('Rohan', 'Innovation', 'Created new automated lead tracking tool', 'Approved', '2026-07-02', 'Ashok'),
  mkNom('Rohan', 'Team Player', 'Helped onboard new TLs in Sales', 'Approved', '2026-07-15', 'Ashok'),
  // Kunal (AM Digital under Sol) dummy approved awards
  mkNom('Kunal', 'Customer Success', 'Maintained 100% SLA for key digital accounts', 'Approved', '2026-06-25', 'Sol'),
  mkNom('Kunal', 'Team Player', 'Supported cross-team design integrations', 'Approved', '2026-07-04', 'Sol'),
];

const mappedInitialNominations = [
  ...initialNominations.map(n => ({
    ...n,
    name: nameMap[n.name] || n.name
  })),
  ...pmInitialNominations
];

export const AppProvider = ({ children }) => {
  // AI Feature Switch (Admin can toggle ON/OFF)
  const [aiEnabled, setAiEnabled] = useState(true);
  const toggleAiFeature = (status) => setAiEnabled(status !== undefined ? status : !aiEnabled);
  const [nominations, setNominations] = useState(() => {
    const saved = localStorage.getItem('sparklers_nominations_v9');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure hoursSaved exists from initial data mapping
      return parsed.map(p => {
        const initial = mappedInitialNominations.find(m => m.id === p.id);
        return {
          ...p,
          hoursSaved: p.hoursSaved !== undefined ? p.hoursSaved : (initial ? initial.hoursSaved : 0)
        };
      });
    }
    return mappedInitialNominations;
  });

  const [currentRole, setCurrentRole] = useState('User');
  const [currentUser, setCurrentUser] = useState(ROLE_USERS['User']);

  useEffect(() => {
    localStorage.setItem('sparklers_nominations_v9', JSON.stringify(nominations));
  }, [nominations]);

  // ── External Awards (My Achievement Locker) ────────────────────
  const [externalAwards, setExternalAwards] = useState(() => {
    const saved = localStorage.getItem('sparklers_external_awards_v1');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sparklers_external_awards_v1', JSON.stringify(externalAwards));
  }, [externalAwards]);

  // ── Feedbacks ────────────────────────────────────────────────────────────
  const initialFeedbacks = [
    {
      id: 2001,
      submittedBy: 'Parteek',
      to: 'Abhineet',
      pm: 'Abhineet',
      category: 'Process Improvement',
      description: 'We should automate the weekly reporting process. Currently it takes 4 hours manually every Friday. Implementing Power Automate could save the team significant time and reduce client delivery errors by at least 30%.',
      impactScore: 9,
      hasAttachment: false,
      submittedAt: '2026-07-15T10:30:00Z',
      acknowledged: false,
      status: 'Approved'
    },
    {
      id: 2002,
      submittedBy: 'Vikram',
      to: 'Himanshu',
      pm: 'Himanshu',
      category: 'Client Experience',
      description: 'Client NPS has dropped this quarter. I think we should schedule bi-weekly check-in calls to address pain points proactively.',
      impactScore: 7,
      hasAttachment: false,
      submittedAt: '2026-07-18T14:00:00Z',
      acknowledged: false,
      status: 'Pending'
    },
    {
      id: 2003,
      submittedBy: 'Sivani',
      to: 'Ameen',
      pm: 'Ameen',
      category: 'Team Culture',
      description: 'The team needs more collaboration sessions. It would be great to have monthly design reviews.',
      impactScore: 4,
      hasAttachment: false,
      submittedAt: '2026-07-20T09:15:00Z',
      acknowledged: true,
      status: 'Approved'
    }
  ];

  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('sparklers_feedbacks_v1');
    return saved ? JSON.parse(saved) : initialFeedbacks;
  });

  useEffect(() => {
    localStorage.setItem('sparklers_feedbacks_v1', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (feedback) => {
    const pm = getPMForUser(feedback.submittedBy);
    const newFeedback = {
      ...feedback,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      acknowledged: false,
      status: feedback.status || 'Pending',
      pm
    };
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  const approveFeedback = (id, impactTier = 'Standard Appreciation') => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Approved', impactTier, approvedAt: new Date().toISOString() } : f));
  };

  const rejectFeedback = (id, reason) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'Rejected', rejectReason: reason } : f));
  };

  const acknowledgeFeedback = (id) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, acknowledged: true } : f));
  };

  const markFeedbackShared = (id) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { 
      ...f, 
      isShared: true, 
      shareCount: (f.shareCount || 0) + 1,
      sharedAt: new Date().toISOString()
    } : f));
  };

  const addExternalAward = (award) => {
    const pm = getPMForUser(award.submittedBy);
    const newAward = {
      ...award,
      id: Date.now(),
      status: award.status || 'Pending',
      submittedAt: new Date().toISOString(),
      pm
    };
    setExternalAwards(prev => [...prev, newAward]);
    // Trigger Power Automate webhook (placeholder — replace URL when ready)
    const POWER_AUTOMATE_WEBHOOK = null; // TODO: Replace with your Power Automate HTTP trigger URL
    if (POWER_AUTOMATE_WEBHOOK) {
      fetch(POWER_AUTOMATE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: award.submittedBy,
          pmName: pm,
          awardName: award.awardName,
          platform: award.platform,
          awardedBy: award.awardedBy,
          dateReceived: award.dateReceived,
          description: award.description
        })
      }).catch(() => {}); // Silent fail — email is nice-to-have
    }
  };

  const approveExternalAward = (id) => {
    setExternalAwards(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'Approved', approvedAt: new Date().toISOString() } : a
    ));
  };

  const rejectExternalAward = (id, reason) => {
    setExternalAwards(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'Rejected', rejectReason: reason } : a
    ));
  };




  const addNomination = (nomination, submittedByRole = 'User') => {
    const isSubmittedByPM = ['PM', 'Leadership', 'Director'].includes(submittedByRole);
    const now = new Date().toISOString();
    setNominations(prev => [...prev, {
      ...nomination,
      id: Date.now(),
      // If PM nominates directly, skip PM queue → go straight to Admin
      status: nomination.status || (isSubmittedByPM ? 'PMApproved' : 'Pending'),
      submittedAt: nomination.submittedAt || nomination.date || now,
      date: nomination.date || now,
      submittedBy: submittedByRole
    }]);
  };

  const pmApprove = (id, pmCategory, pmReason) => {
    const now = new Date().toISOString();
    setNominations(prev => prev.map(n =>
      n.id === id ? {
        ...n,
        status: 'PMApproved',
        pmCategory: pmCategory || '',
        pmReason: pmReason || '',
        pmApprovedAt: now
      } : n
    ));
  };

  const rejectNomination = (id, reason) => {
    setNominations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'Rejected', rejectReason: reason } : n
    ));
  };

  const adminApprove = (id, adminCategory, adminReason) => {
    const now = new Date().toISOString();
    setNominations(prev => prev.map(n =>
      n.id === id ? {
        ...n,
        status: 'Approved',
        adminCategory: adminCategory || '',
        adminReason: adminReason || '',
        approvedAt: now,
        date: now // Set date to approval timestamp so it immediately lands in the current week's Leaderboard & Admin Generator
      } : n
    ));
  };

  // Priority: Admin > PM > User
  const getEffectiveCategory = (nom) => {
    if (nom.adminCategory) return nom.adminCategory;
    if (nom.pmCategory) return nom.pmCategory;
    return nom.category;
  };

  const getEffectiveReason = (nom) => {
    if (nom.adminReason) return nom.adminReason;
    if (nom.pmReason) return nom.pmReason;
    return nom.reason;
  };

  const getTotalHoursSaved = () => {
    return nominations
      .filter(n => n.status === 'Approved')
      .reduce((sum, n) => sum + (Number(n.hoursSaved) || 0), 0);
  };

  const getEfficiencyStats = () => {
    const approved = nominations.filter(n => n.status === 'Approved');
    const totalHours = approved.reduce((sum, n) => sum + (Number(n.hoursSaved) || 0), 0);
    const effCount = approved.filter(n => getEffectiveCategory(n) === 'Process & Efficiency' || (n.hoursSaved && n.hoursSaved > 0)).length;
    
    // User hours map for leaderboard
    const userHoursMap = {};
    approved.forEach(n => {
      if (n.hoursSaved && Number(n.hoursSaved) > 0) {
        userHoursMap[n.name] = (userHoursMap[n.name] || 0) + Number(n.hoursSaved);
      }
    });

    const topContributors = Object.entries(userHoursMap)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);

    return { totalHours, effCount, topContributors };
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
      getReporteesForPM,
      getDepartmentForUser,
      getEffectiveCategory,
      getEffectiveReason,
      getTotalHoursSaved,
      getEfficiencyStats,
      // External Awards
      externalAwards,
      addExternalAward,
      approveExternalAward,
      rejectExternalAward,
      // Feedbacks
      feedbacks,
      addFeedback,
      approveFeedback,
      rejectFeedback,
      markFeedbackShared,
      acknowledgeFeedback,
      // AI Feature Toggle
      aiEnabled,
      toggleAiFeature
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
