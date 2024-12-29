import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface Transaction {
  id: string;
  member_id: string;
  amount: number;
  type: 'tithe' | 'offering' | 'donation' | 'welfare';
  payment_method: 'card' | 'bank_transfer' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export function useTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/transactions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch transaction stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction stats');
    }
  };

  const createTransaction = async (data: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create transaction');
      
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      await fetchStats();
      
      return newTransaction;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchStats();
    }
  }, [token]);

  return {
    transactions,
    stats,
    loading,
    error,
    createTransaction,
    refreshTransactions: fetchTransactions,
    refreshStats: fetchStats,
  };
} 