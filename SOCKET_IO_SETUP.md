# Socket.IO Real-time Communication Setup

This document explains how to use the Socket.IO setup for real-time communication between the Vue frontend and Express backend.

## Backend Setup

### Installation

```bash
npm install socket.io
```

### Integration

The Socket.IO server is integrated into the Express app in `backend/index.js`:

1. HTTP server is created to support Socket.IO
2. Socket.IO server is initialized with CORS configuration
3. Socket events are handled for connections/disconnections
4. The IO instance is exported for use in routes via `app.set('io', io)`

### Emitting Events from Routes

In any route file (e.g., `listsRoutes.js`), you can emit events:

```javascript
// Get the io instance
const io = req.app.get('io');

// Emit to all connected clients
io.emit('event-name', { data: 'example' });

// Emit to specific room
io.to('room-name').emit('event-name', { data: 'example' });
```

### Room-Based Events (List-Specific)

The Socket.IO server uses **rooms** to send events only to clients viewing a specific list. This ensures clients only receive relevant updates.

**Room Events:**

- `join-list`: Client joins a list-specific room (server-side handler)
- `leave-list`: Client leaves a list-specific room (server-side handler)

**Current Events** (emitted to list-specific rooms):

- `voting-started`: Emitted when a new voting round starts
  - Data: `{ listId, round }`
  - Sent to: `list-{listId}` room
- `voting-ended`: Emitted when voting ends and a winner is chosen
  - Data: `{ listId, winner, round }`
  - Sent to: `list-{listId}` room

## Frontend Setup

### Installation

```bash
npm install socket.io-client
```

### Usage in Vue Components

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useSocket } from '@/composables/useSocket';

const { onEvent, isConnected } = useSocket();

onMounted(() => {
  // Listen for voting started event
  const cleanup1 = onEvent('voting-started', (data) => {
    console.log('Voting started:', data);
    // Update UI, show notification, etc.
  });

  // Listen for voting ended event
  const cleanup2 = onEvent('voting-ended', (data) => {
    console.log('Voting ended:', data);
    // Show winner, update standings, etc.
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup1();
    cleanup2();
  });
});
</script>

<template>
  <div>Connection: {{ isConnected ? 'Connected' : 'Disconnected' }}</div>
</template>
```

### Composables API

The `useSocket` composable provides:

- `socket`: The Socket.IO client instance
- `isConnected`: Reactive boolean indicating connection status
- `currentListId`: Reactive ref tracking the current list room
- `onEvent(eventName, callback)`: Listen to server events, returns cleanup function
- `emit(eventName, data)`: Emit events to the server
- `joinList(listId)`: Join a list-specific room to receive list events
- `leaveList(listId)`: Leave a list-specific room

## Example: Real-time Voting Notifications

### In App.vue (app-wide notifications)

The socket listeners are set up in `App.vue` for app-wide notifications:

```javascript
import { useSocket } from '@/composables/useSocket';

const { joinList, onEvent } = useSocket();

onMounted(() => {
  // Join the list room to receive list-specific events
  const listId = config.listId;
  joinList(listId);

  onEvent('voting-started', (data) => {
    // Show toast notification: "Round X voting has started!"
    console.log(`Round ${data.round} voting started`);
  });

  onEvent('voting-ended', (data) => {
    // Show toast: "Winner: {data.winner.title}"
    console.log('Winner:', data.winner.title);
  });
});
```

### In VotingView (component-specific)

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { useSocket } from '@/composables/useSocket';

const { onEvent } = useSocket();
const showNotification = ref(false);
const notificationMessage = ref('');

onMounted(() => {
  onEvent('voting-started', (data) => {
    notificationMessage.value = `Round ${data.round} has started!`;
    showNotification.value = true;
    setTimeout(() => (showNotification.value = false), 5000);
  });
});
</script>

<template>
  <div v-if="showNotification" class="notification">
    {{ notificationMessage }}
  </div>
</template>
```

## Architecture

1. **Connection**: Single persistent connection established when the app loads
2. **Rooms**: Clients join list-specific rooms to receive only relevant events
3. **Events**: Server emits events to specific rooms, not globally
4. **Scope**: Components listen to events only for the list they're viewing
5. **Cleanup**: Each component is responsible for cleaning up its event listeners

### Room Structure

- Rooms are named: `list-{listId}`
- Example: `list-21307903-10d0-4265-8ed1-40286c22eea4`
- When emitting to a room: `io.to('list-{listId}').emit(...)`
- When a client joins: `socket.join('list-{listId}')`

## Future Enhancements

- ✅ Add rooms for list-specific events (Implemented)
- Add authentication for socket connections
- Add reconnection handling
- Add event acknowledgment
- Add typing indicators or presence status
- Add user presence tracking (who's viewing a list)
