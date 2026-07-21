import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import NominationForm from './pages/NominationForm';
import AdminVerification from './pages/AdminVerification';
import LeadershipDashboard from './pages/LeadershipDashboard';
import DesignGeneratorPreview from './pages/DesignGeneratorPreview';
import UserDashboard from './pages/UserDashboard';
import LeadershipView from './pages/LeadershipView';
import PMApprovals from './pages/PMApprovals';
import SelfNominate from './pages/SelfNominate';

const RoleBasedHome = () => {
  const { currentRole } = useAppContext();
  switch (currentRole) {
    case 'Admin':      return <UserDashboard />;
    case 'PM':         return <UserDashboard />;
    case 'Leadership': return <LeadershipView />;
    default:           return <UserDashboard />;
  }
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RoleBasedHome />} />
            <Route path="self-nominate" element={<SelfNominate />} />
            <Route path="nominate" element={<NominationForm />} />
            <Route path="leaderboard" element={<LeadershipDashboard />} />
            <Route path="pm-approvals" element={<PMApprovals />} />
            <Route path="admin" element={<AdminVerification />} />
            <Route path="generator" element={<DesignGeneratorPreview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
