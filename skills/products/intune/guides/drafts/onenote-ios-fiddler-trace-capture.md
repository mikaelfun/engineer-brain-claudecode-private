# Capturing Fiddler Trace on iOS

## Overview
How to capture HTTPS network traffic from iOS devices using Fiddler Classic for troubleshooting Intune/MAM/MDM issues.

## Prerequisites
- Fiddler Classic installed on Windows PC
- iOS device on same WiFi network as Fiddler machine
- BouncyCastle CertMaker.dll installed

## Steps

### 1. Configure Fiddler Classic
1. Open Fiddler Classic → stop capturing
2. Tools > Options > HTTPS → disable Capturing HTTPS Connects
3. Close Fiddler, install BouncyCastle CertMaker.dll from [here](https://telerik-fiddler.s3.amazonaws.com/fiddler/addons/fiddlercertmaker.exe)
4. Reopen Fiddler → Tools > Options > HTTPS → Actions > Reset all certificates
5. Enable Capturing HTTPS Connects + Decrypt HTTPS traffic
6. Tools > Options > Connections → check "Allow remote computers to connect"
7. Restart Fiddler
8. Ensure firewall allows incoming connections to Fiddler process

### 2. Get Fiddler Machine IP
- Hover over Online indicator at far-right of Fiddler toolbar to see IP addresses

### 3. Configure iOS Device Proxy
1. Remove all existing DO_NOT_TRUST_FiddlerRoot profiles: Settings > General > VPN & Device Management
2. Settings > WiFi > current network > (i) icon
3. Scroll to bottom → Configure Proxy → Manual
4. Server: Fiddler machine IP, Port: 8888 → Save

### 4. Install Fiddler Certificate on iOS
1. On iOS browser, navigate to `http://ipv4.fiddler:8888`
2. Click Fiddler root certificate link to download
3. Settings > General > VPN & Device Management → install via Profile Downloaded
4. (iOS 10.3+) Settings > General > About > Certificate Trust Settings → enable full trust for DO_NOT_TRUST_FiddlerRoot

### 5. Verify
- Navigate to `http://FiddlerMachineIP:8888` on iOS → should show Fiddler Echo Service page
- Disable 3G/4G on iPhone (WiFi only)
- Use **Safari** browser (verified working) for capturing

## Tips
- Safari is verified working for trace capture (verified by team member)
- Remember to remove proxy settings and certificate after capture is complete

## Source
- OneNote: MCVKB/Intune/iOS/##MCVKB--ios SSO and debug/##Capture fiddler trace on ios.md
