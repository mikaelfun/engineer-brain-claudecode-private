# iOS Fiddler Proxy HTTPS Capture

## Prerequisites
- A PC and iOS device on the same Wi-Fi network
- Fiddler installed on PC
- Fiddler port (default 8888) not blocked

## Steps

### 1. Configure Fiddler on PC
1. Tools > Options > Connections > Enable "Allow remote computers to connect"
2. Tools > Options > HTTPS > Check "Decrypt HTTPS traffic", trust the root cert
3. Download & install "Certificate Maker" plugin from https://www.telerik.com/fiddler/add-ons
4. Restart Fiddler
5. Hover over Online indicator to get Fiddler machine IP

### 2. Configure iOS Device
1. Connect to same Wi-Fi, disable cellular data
2. Verify connectivity: browse to `http://<FiddlerIP>:8888` — should show Echo Service page
3. Settings > WLAN > connected Wi-Fi > Configure Proxy > Manual:
   - Server: Fiddler machine IP
   - Port: 8888
   - Authentication: Off
4. Browse to `http://<FiddlerIP>:8888` on iOS, download FiddlerRoot certificate
5. Install the `.cer` file
6. **Important**: Settings > General > About > Certificate Trust Settings > enable full trust for FiddlerRoot

### 3. Capture
1. Reproduce the issue on iOS device
2. Stop capture in Fiddler (click "Capturing" in lower-left)
3. File > Save All Sessions to export `.saz` file

## Source
- OneNote: IOS logs/Gather Fiddler logs for IOS device
