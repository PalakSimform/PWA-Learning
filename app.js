// Service Worker Registration
let deferredPrompt;
let swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', swRegistration);
      document.getElementById('swStatus').textContent = 'Active ✓';
      
      // Check for updates
      swRegistration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
      
      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          console.log('Sync completed, updating UI');
          updateSyncQueue();
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      document.getElementById('swStatus').textContent = 'Failed ✗';
    }
  });
}

// Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBanner').classList.remove('hidden');
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    deferredPrompt = null;
    document.getElementById('installBanner').classList.add('hidden');
  }
});

document.getElementById('dismissBtn')?.addEventListener('click', () => {
  document.getElementById('installBanner').classList.add('hidden');
});

// Online/Offline Status
function updateOnlineStatus() {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  if (navigator.onLine) {
    statusIndicator.className = 'status-indicator online';
    statusText.textContent = 'Online';
  } else {
    statusIndicator.className = 'status-indicator offline';
    statusText.textContent = 'Offline';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Cache Testing
async function testCache() {
  const resultDiv = document.getElementById('cacheResult');
  resultDiv.innerHTML = 'Testing cache...';
  
  try {
    const cache = await caches.open('pwa-demo-v1.0.0');
    const keys = await cache.keys();
    
    resultDiv.innerHTML = `
      <strong>✓ Cache Working!</strong><br>
      ${keys.length} items cached<br>
      <small>${keys.slice(0, 3).map(k => k.url.split('/').pop()).join(', ')}...</small>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<strong>✗ Error:</strong> ${error.message}`;
  }
}

// IndexedDB Functions
async function saveData() {
  const input = document.getElementById('dataInput');
  const resultDiv = document.getElementById('dbResult');
  
  if (!input.value.trim()) {
    resultDiv.innerHTML = 'Please enter some data';
    return;
  }
  
  try {
    const id = await dbManager.saveData('appData', { 
      content: input.value 
    });
    resultDiv.innerHTML = `✓ Saved! ID: ${id}`;
    input.value = '';
  } catch (error) {
    resultDiv.innerHTML = `✗ Error: ${error.message}`;
  }
}

async function loadData() {
  const resultDiv = document.getElementById('dbResult');
  resultDiv.innerHTML = 'Loading...';
  
  try {
    const data = await dbManager.getAllData('appData');
    
    if (data.length === 0) {
      resultDiv.innerHTML = 'No data saved yet';
      return;
    }
    
    resultDiv.innerHTML = `
      <strong> Loaded ${data.length} items:</strong><br>
      ${data.slice(-3).reverse().map(item => 
        `<div class="data-item">
          ${item.content} 
          <small>(${new Date(item.timestamp).toLocaleTimeString()})</small>
        </div>`
      ).join('')}
    `;
  } catch (error) {
    resultDiv.innerHTML = `✗ Error: ${error.message}`;
  }
}

// Background Sync
async function scheduleSync() {
  const input = document.getElementById('syncInput');
  const resultDiv = document.getElementById('syncResult');
  
  if (!input.value.trim()) {
    resultDiv.innerHTML = 'Please enter a message';
    return;
  }
  
  try {
    // Save to sync queue
    await dbManager.addToSyncQueue(input.value);
    
    // Register sync
    if ('sync' in swRegistration) {
      await swRegistration.sync.register('sync-messages');
      console.log('Background sync registered');
      
      // If online, sync will happen immediately
      if (navigator.onLine) {
        resultDiv.innerHTML = '✓ Message queued! <strong>Currently ONLINE</strong> - syncing immediately...<br><small>💡 Tip: Go offline first to see delayed sync!</small>';
        // Give it a moment to sync
        setTimeout(() => {
          updateSyncQueue();
        }, 3000);
      } else {
        resultDiv.innerHTML = '✓ Message queued! <strong>Currently OFFLINE</strong> - will sync when you go online.<br><small>💡 Watch for notification when you reconnect!</small>';
      }
    } else {
      resultDiv.innerHTML = 'Background sync not supported. Try Chrome/Edge.';
      console.warn('Background Sync API not supported');
    }
    
    input.value = '';
    updateSyncQueue();
  } catch (error) {
    resultDiv.innerHTML = `✗ Error: ${error.message}`;
    console.error('Sync schedule error:', error);
  }
}

async function updateSyncQueue() {
  try {
    const pending = await dbManager.getPendingSyncs();
    const listEl = document.getElementById('syncList');
    
    if (pending.length === 0) {
      listEl.innerHTML = '<li>No pending syncs</li>';
      return;
    }
    
    listEl.innerHTML = pending.map(item => 
      `<li>${item.text} <small>(${new Date(item.timestamp).toLocaleTimeString()})</small></li>`
    ).join('');
  } catch (error) {
    console.error('Failed to update sync queue:', error);
  }
}

// Push Notifications
async function subscribeToPush() {
  const resultDiv = document.getElementById('pushResult');
  
  if (!('Notification' in window)) {
    resultDiv.innerHTML = '✗ Notifications not supported';
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      resultDiv.innerHTML = '✓ Notification permission granted!';
      
      // Get push subscription (simplified - needs VAPID keys for real implementation)
      if ('pushManager' in swRegistration) {
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrEcxaY0hVggHxgRxvfk1G0NtnVnjmR9Vxcp_uxHs1P6C5c5pQE'
          )
        });
        console.log('Push subscription:', subscription);
      }
    } else {
      resultDiv.innerHTML = '✗ Notification permission denied';
    }
  } catch (error) {
    resultDiv.innerHTML = `✗ Error: ${error.message}`;
  }
}

function testNotification() {
  const resultDiv = document.getElementById('pushResult');
  
  if (Notification.permission === 'granted' && swRegistration) {
    swRegistration.showNotification('PWA Demo', {
      body: 'This is a test notification!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ]
    });
    resultDiv.innerHTML = '✓ Notification sent!';
  } else {
    resultDiv.innerHTML = 'Please subscribe first';
  }
}

// Native Features
async function shareContent() {
  const resultDiv = document.getElementById('nativeResult');
  
  if (!navigator.share) {
    resultDiv.innerHTML = '✗ Web Share API not supported';
    return;
  }
  
  try {
    await navigator.share({
      title: 'PWA Demo',
      text: 'Check out this Progressive Web App demo!',
      url: window.location.href
    });
    resultDiv.innerHTML = '✓ Shared successfully!';
  } catch (error) {
    if (error.name !== 'AbortError') {
      resultDiv.innerHTML = `✗ Error: ${error.message}`;
    }
  }
}

async function capturePhoto() {
  const resultDiv = document.getElementById('nativeResult');
  
  if (!navigator.mediaDevices?.getUserMedia) {
    resultDiv.innerHTML = '✗ Camera API not supported';
    return;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' } 
    });
    resultDiv.innerHTML = '✓ Camera access granted!';
    
    // Stop stream immediately (this is just a demo)
    stream.getTracks().forEach(track => track.stop());
  } catch (error) {
    resultDiv.innerHTML = `✗ Error: ${error.message}`;
  }
}

async function getLocation() {
  const resultDiv = document.getElementById('nativeResult');
  
  if (!navigator.geolocation) {
    resultDiv.innerHTML = '✗ Geolocation not supported';
    return;
  }
  
  resultDiv.innerHTML = 'Getting location...';
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      resultDiv.innerHTML = `
        ✓ Location obtained!<br>
        <small>Lat: ${position.coords.latitude.toFixed(4)}<br>
        Lng: ${position.coords.longitude.toFixed(4)}</small>
      `;
    },
    (error) => {
      resultDiv.innerHTML = `✗ Error: ${error.message}`;
    }
  );
}

// Utility Functions
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateSyncQueue();
  
  // Check for action parameter
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');
  
  if (action === 'cache') testCache();
  if (action === 'notify') testNotification();
});
