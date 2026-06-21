'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
  const [currentDoc,  setCurrentDoc]  = useState(null);
  const [versions,    setVersions]    = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs,   setAuditLogs]   = useState([]);
  const [comments,    setComments]    = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading,     setLoading]     = useState(false);

  const loadDocument = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/documents/${id}`);
      setCurrentDoc(res.data.data);
      return res.data.data;
    } catch (err) {
      toast.error('Failed to load document');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVersions = useCallback(async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}/versions`);
      setVersions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  }, []);

  const loadPermissions = useCallback(async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}/permissions`);
      setPermissions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  }, []);

  const loadAuditLogs = useCallback(async (docId) => {
    try {
      const res = await api.get(`/audit/${docId}`);
      setAuditLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }, []);

  const shareDocument = useCallback(async (docId, userId, permission) => {
    try {
      await api.post(`/documents/${docId}/share`, { userId, permission });
      toast.success('Document shared successfully');
      loadPermissions(docId);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share');
      return false;
    }
  }, [loadPermissions]);

  const restoreVersion = useCallback(async (docId, versionId) => {
    try {
      await api.post(`/documents/${docId}/versions/${versionId}/restore`);
      toast.success('Version restored successfully');
      loadVersions(docId);
      loadDocument(docId);
      return true;
    } catch (err) {
      toast.error('Failed to restore version');
      return false;
    }
  }, [loadVersions, loadDocument]);

  const addComment = useCallback((comment) => {
    setComments(prev => [comment, ...prev]);
  }, []);

  const updateActiveUsers = useCallback((users) => {
    setActiveUsers(users);
  }, []);

  return (
    <DocumentContext.Provider value={{
      currentDoc,
      versions,
      permissions,
      auditLogs,
      comments,
      activeUsers,
      loading,
      loadDocument,
      loadVersions,
      loadPermissions,
      loadAuditLogs,
      shareDocument,
      restoreVersion,
      addComment,
      updateActiveUsers,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => useContext(DocumentContext);