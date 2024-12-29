import { useState } from 'react';
import { useAuth } from '@/contexts/auth';

interface SendMessageParams {
  memberIds: string[];
  message: string;
  channels: {
    email: boolean;
    sms: boolean;
  };
}

export function useCommunications() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendBulkMessage = async ({ memberIds, message, channels }: SendMessageParams) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/communications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member_ids: memberIds,
          message,
          channels
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendBulkMessage,
    loading,
    error
  };
} 