import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Member } from '@/types';

export function useMember() {
  const { token } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/members/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch member profile');
      }
      
      const data = await response.json();
      setMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member profile');
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (updates: Partial<Member>) => {
    if (!token || !member) return;
    
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member profile');
      }
      
      const updatedMember = await response.json();
      setMember(updatedMember);
      return updatedMember;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update member profile');
    }
  };

  useEffect(() => {
    if (token) {
      fetchMember();
    }
  }, [token]);

  return {
    member,
    loading,
    error,
    updateMember,
    refreshMember: fetchMember
  };
} 