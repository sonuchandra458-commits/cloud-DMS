'use client';
import { useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

export const useSocket = (documentId, user) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!documentId || !user) return;

    const socket = connectSocket();
    socketRef.current = socket;

    socket.emit('join-document', { documentId, user });

    return () => {
      socket.emit('leave-document', { documentId, user });
    };
  }, [documentId, user]);

  const onActiveUsers = useCallback((callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('active-users', callback);
    return () => socket.off('active-users', callback);
  }, []);

  const onUserJoined = useCallback((callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('user-joined', callback);
    return () => socket.off('user-joined', callback);
  }, []);

  const onNewComment = useCallback((callback) => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('new-comment', callback);
    return () => socket.off('new-comment', callback);
  }, []);

  const sendComment = useCallback((comment) => {
    const socket = getSocket();
    if (!socket || !documentId) return;
    socket.emit('add-comment', { documentId, comment });
  }, [documentId]);

  const sendChange = useCallback((change) => {
    const socket = getSocket();
    if (!socket || !documentId) return;
    socket.emit('document-change', { documentId, change, user });
  }, [documentId, user]);

  return {
    onActiveUsers,
    onUserJoined,
    onNewComment,
    sendComment,
    sendChange,
  };
};