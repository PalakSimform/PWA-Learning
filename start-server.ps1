# Simple PWA Server
# Run this file to start the PWA demo

Write-Host "🚀 Starting PWA Demo Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue

if ($pythonCmd) {
    Write-Host "✓ Python found" -ForegroundColor Green
    Write-Host "Starting server on http://localhost:8000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 Open your browser and navigate to:" -ForegroundColor Cyan
    Write-Host "   http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 For Lighthouse PWA audit, use 'localhost' not '127.0.0.1'" -ForegroundColor Yellow
    Write-Host "🔒 For full PWA features on mobile, use ngrok for HTTPS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    
    # Auto-open browser
    Start-Process "http://localhost:8000"
    
    # Start Python server
    python -m http.server 8000
} else {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python or use one of these alternatives:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Python" -ForegroundColor Cyan
    Write-Host "  Download from: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use Node.js" -ForegroundColor Cyan
    Write-Host "  npx http-server -p 8000" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Use VS Code Live Server" -ForegroundColor Cyan
    Write-Host "  Install 'Live Server' extension and right-click index.html" -ForegroundColor White
    Write-Host ""
    
    # Wait before closing
    Read-Host "Press Enter to exit"
}
