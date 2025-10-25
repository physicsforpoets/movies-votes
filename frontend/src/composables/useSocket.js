import { onUnmounted, ref } from 'vue';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://movies-votes-production.up.railway.app' : 'http://localhost:3000');
const socket = io(BASE_URL.replace('/api', ''), {
  transports: ['websocket', 'polling']
});

const isConnected = ref(false);

socket.on('connect', () => {
  console.log('Socket connected');
  isConnected.value = true;
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
  isConnected.value = false;
});

export function useSocket() {
  const currentListId = ref(null);
  
  const onEvent = (eventName, callback) => {
    socket.on(eventName, callback);
    
    // Return cleanup function
    return () => {
      socket.off(eventName, callback);
    };
  };
  
  const emit = (eventName, data) => {
    socket.emit(eventName, data);
  };
  
  // Join a list room to receive list-specific events
  const joinList = (listId) => {
    if (currentListId.value && currentListId.value !== listId) {
      // Leave the previous room if switching lists
      leaveList(currentListId.value);
    }
    currentListId.value = listId;
    socket.emit('join-list', listId);
  };
  
  // Leave a list room
  const leaveList = (listId) => {
    socket.emit('leave-list', listId);
    if (currentListId.value === listId) {
      currentListId.value = null;
    }
  };
  
  // Cleanup on component unmount
  onUnmounted(() => {
    // Note: We don't disconnect the socket here since it might be used by other components
    // If you need to disconnect, call socket.disconnect() explicitly
  });
  
  return {
    socket,
    isConnected,
    currentListId,
    onEvent,
    emit,
    joinList,
    leaveList,
  };
}

export default socket;
