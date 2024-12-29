import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_status: string;
}

export function useMembers() {
  const { token } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  return {
    members,
    loading,
    error,
    refreshMembers: fetchMembers
  };
} 