# Capture Fiddler Trace on iOS

> Source: OneNote MCVKB/Intune/iOS — verified by Icy

## Prerequisites

- Fiddler Classic installed on PC
- iOS device on same WiFi network as Fiddler machine
- Disable 3G/4G on iPhone

## Step 1: Configure Fiddler Classic

1. Open Fiddler Classic, stop capturing
2. Open **Tools > Options > HTTPS**, disable *Capturing HTTPS Connects*
3. Close Fiddler Classic
4. Install BouncyCastle (CertMaker.dll) from [Telerik](https://telerik-fiddler.s3.amazonaws.com/fiddler/addons/fiddlercertmaker.exe)
   - Changes certificate generation to use single root cert (no intermediate certs per site)
5. Reopen Fiddler, go to **Tools > Options > HTTPS** → **Actions > Reset all certificates**
6. Accept all system dialogs
7. Enable **Capturing HTTPS Connects** and **Decrypt HTTPS traffic**
8. Go to **Tools > Options > Connections** → check **Allow remote computers to connect**
9. Restart Fiddler
10. Ensure firewall allows incoming connections to Fiddler process

## Step 2: Get Fiddler Machine IP

- Hover over the **Online** indicator at far-right of Fiddler toolbar to see assigned IP addresses

## Step 3: Configure iOS Device Proxy

1. Remove all existing `DO_NOT_TRUST_FiddlerRoot` profiles:
   - **Settings > General > VPN & Device Management** → remove (not just disable)
2. Go to **Settings > WiFi**, find current network, tap **i** icon
3. Scroll to bottom → **Configure Proxy** → **Manual**
4. Server: Fiddler machine IP, Port: 8888, tap **Save**

## Step 4: Trust Fiddler Certificate on iOS

1. Open Safari on iOS → navigate to `http://ipv4.fiddler:8888`
2. Click the Fiddler root certificate link to download
3. Go to **Settings > General > VPN & Device Management** → install via **Profile Downloaded**
4. (iOS 10.3+) Go to **General > About > Certificate Trust Settings** → enable full trust for `DO_NOT_TRUST_FiddlerRoot`

## Step 5: Verify

- Navigate to `http://FiddlerMachineIP:8888` from iOS browser → should show Fiddler Echo Service page
- HTTPS sites should now be captured without certificate warnings

## Important Notes

- Must use **Safari** browser for certificate download (verified)
- BouncyCastle cert generator is required for iOS compatibility
- Remember to remove proxy settings from iOS device after capture is complete
