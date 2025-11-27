Write-Host "🚀 Starting PWA with HTTPS via ngrok..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python not found. Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check if ngrok is installed
$ngrokCmd = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokCmd) {
    Write-Host "❌ ngrok not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Using npm:" -ForegroundColor Cyan
    Write-Host "  npm install -g ngrok" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2 - Download:" -ForegroundColor Cyan
    Write-Host "  https://ngrok.com/download" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "✓ Python found" -ForegroundColor Green
Write-Host "✓ ngrok found" -ForegroundColor Green
Write-Host ""

# Start Python server in background
Write-Host "1️⃣ Starting local server on port 8000..." -ForegroundColor Yellow
$serverJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Local server running on http://localhost:8000' -ForegroundColor Green; python -m http.server 8000" -PassThru -WindowStyle Normal

Start-Sleep -Seconds 3

# Start ngrok
Write-Host "2️⃣ Creating HTTPS tunnel with ngrok..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 Your PWA is now available with HTTPS!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Use the https:// URL below for:" -ForegroundColor Yellow
Write-Host "   • Lighthouse PWA testing" -ForegroundColor White
Write-Host "   • Mobile device testing" -ForegroundColor White
Write-Host "   • Push notifications" -ForegroundColor White
Write-Host "   • Full PWA features" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both server and ngrok" -ForegroundColor Gray
Write-Host ""

ngrok http 8000

# Cleanup on exit
Stop-Process -Id $serverJob.Id -ErrorAction SilentlyContinue
