import { 
  getUnsyncedConversations, 
  getConversationFromLocalStorage,
  clearConversationFromUnsyncedList,
  saveLastSyncTimestamp
} from './local-storage';

// Sync interval in milliseconds (30 seconds)
const SYNC_INTERVAL = 30 * 1000;

let syncInterval: NodeJS.Timeout | null = null;
let isSyncing = false;

/**
 * Start the sync service
 */
export function startSyncService() {
  if (typeof window === 'undefined') return;
  
  // Clear any existing interval
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Set up tab close handler
  window.addEventListener('beforeunload', handleTabClose);
  
  // Start periodic sync
  syncInterval = setInterval(syncUnsynced, SYNC_INTERVAL);
  
  console.log('Sync service started');
}

/**
 * Stop the sync service
 */
export function stopSyncService() {
  if (typeof window === 'undefined') return;
  
  // Clear interval
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  // Remove tab close handler
  window.removeEventListener('beforeunload', handleTabClose);
  
  console.log('Sync service stopped');
}

/**
 * Handle tab close event
 */
function handleTabClose(event: BeforeUnloadEvent) {
  // Sync all unsynced conversations immediately
  syncUnsynced(true);
}

/**
 * Sync all unsynced conversations
 * @param isForceSync If true, will sync even if already syncing
 */
export async function syncUnsynced(isForceSync = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // Don't start a new sync if one is already in progress
  if (isSyncing && !isForceSync) return false;
  
  isSyncing = true;
  
  try {
    const unsyncedIds = getUnsyncedConversations();
    
    if (unsyncedIds.length === 0) {
      console.log('No unsynced conversations to sync');
      isSyncing = false;
      return true;
    }
    
    console.log(`Syncing ${unsyncedIds.length} conversations...`);
    
    // Process each unsynced conversation
    const results = await Promise.allSettled(
      unsyncedIds.map(async (id) => {
        // Skip local IDs that haven't been assigned a server ID yet
        if (id.startsWith('local-')) {
          // For local IDs, we need to create them on the server
          return syncLocalConversation(id);
        } else {
          // For server IDs, we just need to update them
          return syncServerConversation(id);
        }
      })
    );
    
    // Check results
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Synced ${successCount} of ${unsyncedIds.length} conversations`);
    
    // Update last sync timestamp
    saveLastSyncTimestamp();
    
    return successCount === unsyncedIds.length;
  } catch (error) {
    console.error('Error syncing conversations:', error);
    return false;
  } finally {
    isSyncing = false;
  }
}

/**
 * Sync a local conversation to the server
 */
async function syncLocalConversation(id: string): Promise<boolean> {
  try {
    const conversation = getConversationFromLocalStorage(id);
    
    if (!conversation) {
      console.error(`Local conversation ${id} not found`);
      clearConversationFromUnsyncedList(id);
      return false;
    }
    
    // Create new conversation on server
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: conversation.title,
        messages: conversation.messages,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error(`Failed to sync local conversation ${id}:`, result.error);
      return false;
    }
    
    // Clear from unsynced list
    clearConversationFromUnsyncedList(id);
    
    return true;
  } catch (error) {
    console.error(`Error syncing local conversation ${id}:`, error);
    return false;
  }
}

/**
 * Sync a server conversation
 */
async function syncServerConversation(id: string): Promise<boolean> {
  try {
    const conversation = getConversationFromLocalStorage(id);
    
    if (!conversation) {
      console.error(`Server conversation ${id} not found locally`);
      clearConversationFromUnsyncedList(id);
      return false;
    }
    
    // Update conversation on server
    const response = await fetch(`/api/chat/conversations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: conversation.title,
        messages: conversation.messages,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error(`Failed to sync server conversation ${id}:`, result.error);
      return false;
    }
    
    // Clear from unsynced list
    clearConversationFromUnsyncedList(id);
    
    return true;
  } catch (error) {
    console.error(`Error syncing server conversation ${id}:`, error);
    return false;
  }
}

/**
 * Force sync a specific conversation
 */
export async function forceSyncConversation(id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    if (id.startsWith('local-')) {
      return await syncLocalConversation(id);
    } else {
      return await syncServerConversation(id);
    }
  } catch (error) {
    console.error(`Error force syncing conversation ${id}:`, error);
    return false;
  }
}
