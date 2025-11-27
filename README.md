# 🚀 PWA Demo - Complete Features

A comprehensive Progressive Web App demonstrating all core PWA features including manifest, service worker, caching strategies, IndexedDB, background sync, push notifications, and native device features.

## ✨ Features

### 1. **Manifest**
- App installability on mobile and desktop
- Custom icons and theme colors
- Standalone display mode
- Splash screen support

### 2. **Service Worker**
- Automatic registration and lifecycle management
- Install, activate, and fetch event handlers
- Version management and cache cleanup

### 3. **Advanced Caching Strategies**
- **Cache First**: For static assets (HTML, CSS, JS)
- **Network First**: For dynamic API calls
- **Stale While Revalidate**: For images
- **Network with Fallback**: For everything else

### 4. **IndexedDB**
- Local data persistence
- Dynamic data storage and retrieval
- Sync queue management
- CRUD operations

### 5. **Background Sync**
- Offline form submission queue
- Automatic sync when back online
- Retry mechanism for failed syncs
- User notifications on sync completion

### 6. **Push Notifications**
- Notification subscription management
- Custom notification actions
- Badge and vibration support
- Click handling and navigation

### 7. **Native Features**
- **Web Share API**: Share content natively
- **Camera Access**: Access device camera
- **Geolocation**: Get user location
- Responsive mobile-first design

## 🚀 Getting Started

### Prerequisites
- Node.js (for local server) OR any HTTP server
- Modern browser (Chrome, Edge, Safari, Firefox)
- HTTPS (required for service workers and push notifications)

### Installation

1. **Clone or download** this project

2. **Serve the files** using a local HTTP server:

   **Option 1: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option 2: Using Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 3: Using VS Code Live Server**
   - Install Live Server extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**: `http://localhost:8000`

### For HTTPS (Required for full functionality)

**Option 1: Using ngrok**
```bash
ngrok http 8000
```

**Option 2: Using VS Code + mkcert**
1. Install [mkcert](https://github.com/FiloSottile/mkcert)
2. Create local certificates
3. Configure your server for HTTPS

## 📱 Testing on Mobile

### Android
1. Enable USB debugging on your device
2. Use Chrome DevTools → Remote Devices
3. Or use ngrok to get a public HTTPS URL

### iOS
1. Deploy to a server with HTTPS
2. Open in Safari
3. Tap Share → Add to Home Screen

## 🧪 Testing Features

### 1. Caching
- Click "Test Cache" button
- Open DevTools → Application → Cache Storage
- Verify cached resources

### 2. IndexedDB
- Enter text in "IndexedDB" input
- Click "Save Data"
- Click "Load Data" to retrieve
- Check DevTools → Application → IndexedDB

### 3. Background Sync
- Enter message in "Background Sync" input
- Click "Schedule Sync"
- Go offline (DevTools → Network → Offline)
- Submit more messages
- Go back online and watch them sync

### 4. Push Notifications
- Click "Subscribe" to request permission
- Click "Test Notification" to send a test
- Check notification appears

### 5. Native Features
- **Share**: Click "Share" button (works on mobile/supported browsers)
- **Camera**: Click "Camera" to test camera access
- **Location**: Click "Location" to get coordinates

### 6. Install App
- Look for "Install" button in the browser
- Or click the install banner in the app
- App will be added to home screen/app drawer

## 🏗️ Project Structure

```
pwa-demo/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── app.js             # Main application logic
├── db.js              # IndexedDB manager
├── styles.css         # Styling
└── icons/             # App icons (create these)
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## 🎨 Creating Icons

You need to create icons for the manifest. Use any of these methods:

**Option 1: Use a tool**
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

**Option 2: Create manually**
- Create PNG files at the sizes specified in manifest.json
- Use any design tool (Figma, Photoshop, GIMP)
- Save in `/icons/` folder

**Quick Placeholder (for testing)**
Create simple colored squares at each size using any image editor.

## 🔍 Debugging

### Chrome DevTools
1. Open DevTools (F12)
2. **Application Tab**:
   - Service Workers: Check registration status
   - Cache Storage: View cached resources
   - IndexedDB: Inspect stored data
   - Manifest: Verify manifest settings

3. **Console Tab**: View logs from service worker and app

4. **Network Tab**: Test offline functionality

### Service Worker Update
To force a service worker update:
- Change `CACHE_VERSION` in `sw.js`
- Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
- Or DevTools → Application → Service Workers → Update

## 📝 Important Notes

1. **HTTPS Required**: Most PWA features require HTTPS (except localhost)
2. **Push Notifications**: The VAPID key in the code is a placeholder. For production, generate your own keys
3. **Background Sync**: Not supported in all browsers (mainly Chrome/Edge)
4. **Icons Required**: Create icon files for the manifest to work properly
5. **Browser Support**: Test in multiple browsers as support varies

## 🐛 Common Issues

### Service Worker not registering
- Ensure you're using HTTP server (not file://)
- Check console for errors
- Clear browser cache and retry

### Push notifications not working
- Check notification permission in browser settings
- Ensure HTTPS is enabled
- Generate proper VAPID keys for production

### Cache not updating
- Increment `CACHE_VERSION` in sw.js
- Use hard reload
- Clear cache in DevTools

### Install banner not showing
- Manifest must be valid
- Service worker must be registered
- Must be served over HTTPS (or localhost)
- Icons must exist

## 🚀 Deployment

### Deploy to Netlify/Vercel/GitHub Pages
1. Push code to GitHub
2. Connect to hosting service
3. Deploy (automatic HTTPS included)

### Deploy to your own server
1. Ensure HTTPS is configured
2. Upload all files
3. Configure proper MIME types for manifest.json

## 📚 Learn More

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)

## 📄 License

This is a demo project for educational purposes. Feel free to use and modify as needed!

---

**Happy coding! 🎉**
