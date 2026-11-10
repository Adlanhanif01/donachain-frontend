import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import Home from './pages/Home.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  const { bootstrapError } = useAuth();

  return (
    <>
      {bootstrapError && (
        <div className="global-error" role="alert">
          Sesi sebelumnya tidak dapat dipulihkan: {bootstrapError}
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route element={<ProtectedRoute roles={['donor', 'creator']} />}>
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<DashboardRedirect />} />
      </Routes>
    </>
  );
}