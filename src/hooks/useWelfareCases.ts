import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { WelfareCase } from '@/types';

export function useWelfareCases() {
  const { token } = useAuth();
  const [welfareCases, setWelfareCases] = useState<WelfareCase[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWelfareCases = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }
    
    try {
      console.log('Fetching welfare cases...');
      const response = await fetch('/api/welfare-cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch welfare cases: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Welfare cases fetched:', data);
      setWelfareCases(data);
    } catch (err) {
      console.error('Error in fetchWelfareCases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch welfare cases');
    } finally {
      setLoading(false);
    }
  };

  const createWelfareCase = async (data: Omit<WelfareCase, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/welfare-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create welfare case');
      
      const newCase = await response.json();
      setWelfareCases(prev => [newCase, ...prev]);
      return newCase;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create welfare case');
    }
  };

  const updateWelfareCase = async (id: string, data: Partial<WelfareCase>) => {
    try {
      const response = await fetch(`/api/welfare-cases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to update welfare case');
      
      const updatedCase = await response.json();
      setWelfareCases(prev => prev.map(c => c.id === id ? updatedCase : c));
      return updatedCase;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update welfare case');
    }
  };

  useEffect(() => {
    if (token) {
      fetchWelfareCases();
    }
  }, [token]);

  return {
    welfareCases,
    loading,
    error,
    createWelfareCase,
    updateWelfareCase,
    refreshWelfareCases: fetchWelfareCases
  };
} 