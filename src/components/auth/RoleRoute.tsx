import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 