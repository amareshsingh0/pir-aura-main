Write-Host "🚀 Starting full app update process..." -ForegroundColor Cyan

# 1️⃣ Build the web app
Write-Host "🧱 Building web assets (npm run build)..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Build failed"; exit 1 }

# 2️⃣ Sync changes to Android
Write-Host "🔄 Syncing Capacitor (npx cap sync android)..."
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Capacitor sync failed"; exit 1 }

# 3️⃣ Move into android folder
Set-Location android

# 4️⃣ Clean Gradle build (optional)
Write-Host "🧹 Cleaning Gradle build..."
./gradlew clean

# 5️⃣ Build new release APK
Write-Host "🏗️ Building release APK..."
./gradlew assembleRelease
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Gradle build failed"; exit 1 }

# 6️⃣ Uninstall old app (optional)
Write-Host "🗑️ Uninstalling old app (if installed)..."
adb uninstall com.piraura.app

# 7️⃣ Install new APK
Write-Host "📱 Installing updated app..."
adb install "app/build/outputs/apk/release/app-release.apk"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully installed updated app!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Installation failed, check adb connection." -ForegroundColor Red
}

# 8️⃣ Return to root directory
Set-Location ..
Write-Host "🎉 All done!"