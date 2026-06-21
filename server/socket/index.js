const { Server } = require('socket.io');

const activeUsers = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin:      process.env.CLIENT_URL,
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-document', ({ documentId, user }) => {
      socket.join(documentId);
      if (!activeUsers[documentId]) activeUsers[documentId] = [];
      const existing = activeUsers[documentId].findIndex(u => u.userId === user.id);
      if (existing === -1) {
        activeUsers[documentId].push({ socketId: socket.id, userId: user.id, userName: user.name });
      }
      io.to(documentId).emit('active-users', activeUsers[documentId]);
      socket.to(documentId).emit('user-joined', { userName: user.name });
    });

    socket.on('leave-document', ({ documentId, user }) => {
      socket.leave(documentId);
      if (activeUsers[documentId]) {
        activeUsers[documentId] = activeUsers[documentId].filter(u => u.socketId !== socket.id);
        io.to(documentId).emit('active-users', activeUsers[documentId]);
      }
    });

    socket.on('document-change', ({ documentId, change, user }) => {
      socket.to(documentId).emit('receive-change', { change, user });
    });

    socket.on('cursor-move', ({ documentId, position, user }) => {
      socket.to(documentId).emit('cursor-update', { position, user });
    });

    socket.on('add-comment', ({ documentId, comment }) => {
      io.to(documentId).emit('new-comment', comment);
    });

    socket.on('disconnect', () => {
      Object.keys(activeUsers).forEach(docId => {
        activeUsers[docId] = activeUsers[docId].filter(u => u.socketId !== socket.id);
        io.to(docId).emit('active-users', activeUsers[docId]);
      });
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;