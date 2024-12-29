import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

export interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  category?: string;
}

export interface Category {
  id: string;
  name: string;
}

export function useDocuments() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/documents/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  const uploadDocument = async (formData: FormData) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      await fetchDocuments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      await fetchDocuments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const createCategory = async (name: string) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/documents/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      await fetchCategories();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchCategories();
    }
  }, [token]);

  return {
    documents,
    categories,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    createCategory,
    refreshDocuments: fetchDocuments
  };
}
