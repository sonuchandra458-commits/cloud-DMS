'use client';
import { useState, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/documents', { params });
      setDocuments(res.data.data || []);
      return res.data.data;
    } catch (err) {
      toast.error('Failed to load documents');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file, metadata = {}) => {
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.folder)      formData.append('folder', metadata.folder);
      if (metadata.tags)        formData.append('tags', JSON.stringify(metadata.tags));

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });
      toast.success(`${file.name} uploaded successfully!`);
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to upload ${file.name}`);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const deleteDocument = useCallback(async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return false;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted successfully');
      return true;
    } catch (err) {
      toast.error('Failed to delete document');
      return false;
    }
  }, []);

  const getDocument = useCallback(async (id) => {
    try {
      const res = await api.get(`/documents/${id}`);
      return res.data.data;
    } catch (err) {
      toast.error('Failed to load document');
      return null;
    }
  }, []);

  return {
    documents,
    loading,
    uploading,
    progress,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDocument,
  };
};