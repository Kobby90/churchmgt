import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard } from './pages/dashboard';
import { Members } from './pages/members';
import { Finance } from './pages/finance';
import { Welfare } from './pages/welfare';
import { Login } from './pages/auth/login';
import { Register } from './pages/auth/register';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { Profile } from './pages/profile';
import { Settings } from './pages/settings';
import { Users } from './pages/users';
import { SettingsProvider, useSettings } from '@/contexts/settings';
import { Documents } from './pages/documents';
import { Communications } from './pages/communications';
import { AuditLogs } from './pages/admin/audit-logs';
import { RoleRoute } from './components/auth/RoleRoute';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Auth wrapper to prevent authenticated users from accessing auth pages
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { settings } = useSettings();
  
  // Update theme colors and document title when settings change
  React.useEffect(() => {
    if (settings) {
      // Update theme colors
      if (settings.themeColors) {
        const root = document.documentElement;
        root.style.setProperty('--primary', settings.themeColors.primary);
        root.style.setProperty('--secondary', settings.themeColors.secondary);
        root.style.setProperty('--accent', settings.themeColors.accent);
      }
      
      // Update document title
      if (settings.appName) {
        document.title = settings.appName;
      }
    }
  }, [settings]);

  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/members" element={<Members />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/welfare" element={<Welfare />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/communications" element={<Communications />} />
        <Route 
          path="/audit-logs" 
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AuditLogs />
            </RoleRoute>
          } 
        />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;