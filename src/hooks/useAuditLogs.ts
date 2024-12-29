import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface AuditLogFilters {
  user_id?: string;
  entity_type?: string;
  from_date?: Date | null;
  to_date?: Date | null;
}

export function useAuditLogs(initialFilters: AuditLogFilters = {}) {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchLogs = async () => {
    if (!token) return;
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/audit-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/audit-logs/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export audit logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, filters]);

  return {
    logs,
    loading,
    error,
    setFilters,
    exportLogs,
    refreshLogs: fetchLogs
  };
} 