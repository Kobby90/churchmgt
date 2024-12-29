import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
  isUserActive: boolean;
}

export function useUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    // Add in fetchUsers function in src/hooks/useUsers.ts
    const fetchUsers = async () => {
    if (!token) {
        console.log('No token available');
        return;
    }
    
    try {
        console.log('Fetching users with token:', token);
        const response = await fetch('/api/users', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });
        
        if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch users:', errorData);
        throw new Error(`Failed to fetch users: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Users fetched successfully:', data);
        setUsers(data);
    } catch (err) {
        console.error('Error in fetchUsers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
        setLoading(false);
    }
    };

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) throw new Error('Failed to reset password');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const toggleUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to toggle user status');
      
      await fetchUsers(); // Refresh the users list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to toggle user status');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return {
    users,
    loading,
    error,
    resetPassword,
    toggleUserStatus,
    refreshUsers: fetchUsers
  };
} 