# Capture Fiddler Trace on iOS

## Overview
Guide for capturing HTTPS traffic from iOS devices using Fiddler Classic, useful for troubleshooting Azure AD/Entra authentication issues on iOS.

## Prerequisites
- Fiddler Classic installed on Windows
- iOS device on the same network as Fiddler machine
- BouncyCastle CertMaker.dll

## Steps

### 1. Configure Fiddler Classic
1. Stop capturing in Fiddler
2. Open **Tools > Options > HTTPS**, disable "Capturing HTTPS Connects"
3. Close Fiddler
4. Install BouncyCastle CertMaker.dll from: https://telerik-fiddler.s3.amazonaws.com/fiddler/addons/fiddlercertmaker.exe
5. Reopen Fiddler, go to **Tools > Options > HTTPS** → **Actions > Reset all certificates**
6. Enable "Capturing HTTPS Connects" and "Decrypt HTTPS traffic"
7. Go to **Tools > Options > Connections** → check "Allow remote computers to connect"
8. Restart Fiddler
9. Ensure firewall allows incoming connections to Fiddler process

### 2. Get Fiddler Machine IP
- Hover over the Online indicator at Fiddler toolbar's far-right to display IP addresses

### 3. Verify Connectivity
- On iOS device browser, navigate to `http://FiddlerMachineIP:8888`
- Should return Fiddler Echo Service page

### 4. Configure iOS Device Proxy
1. Disable 3G/4G connection on iPhone
2. Go to **Settings > WiFi** → find current network → tap (i) icon
3. Scroll to bottom → **Configure Proxy** → Manual
4. Server: Fiddler machine IP
5. Port: 8888
6. Tap Save

### 5. Install Fiddler Certificate on iOS
1. On iOS browser, navigate to `http://ipv4.fiddler:8888`
2. Click the Fiddler root certificate link to download
3. Go to **Settings > General > VPN & Device Management** → install via "Profile Downloaded"
4. (iOS 10.3+) Go to **Settings > General > About > Certificate Trust Settings** → enable full trust for DO_NOT_TRUST_FiddlerRoot

### 6. Clean Up (Before Starting)
- Remove any existing DO_NOT_TRUST_FiddlerRoot profiles from **Settings > General > VPN & Device Management** (remove, not just disable)

## Tips
- Use Safari browser on iOS for best compatibility (verified by team)
- Make sure to use BouncyCastle certificate generator (single root cert, no intermediates)

## Source
- OneNote: MCVKB/VM+SCIM/11.55 Capture fiddler trace on ios
- Fiddler docs: https://docs.telerik.com/fiddler/configure-fiddler/tasks/configureforios
