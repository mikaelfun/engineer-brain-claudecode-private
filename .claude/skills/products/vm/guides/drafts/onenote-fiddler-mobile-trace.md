# Capturing Fiddler Trace for Mobile Devices

## Overview
How to capture Fiddler HTTPS trace from iPhone or other mobile devices using a PC as proxy.

## Steps
1. Connect phone and PC to the same LAN/WiFi
2. Open Fiddler on PC, enable remote connections: Tools > Options > Connections > Allow remote computers to connect
3. In Fiddler HTTPS tab, enable HTTPS decryption; Actions > Export Root Certificate to Desktop
4. Restart Fiddler to accept remote connections
5. Upload `FiddlerRoot.cer` to accessible location (e.g., Azure Blob with anonymous access)
6. Open the certificate URL on phone browser, allow profile download (iOS)
7. Install profile: Settings > General > Profiles & Device Management > DO_NOT_TRUST_FiddlerRoot
8. Trust certificate: Settings > General > About > Certificate Trust Settings > enable Fiddler root
9. Configure HTTP proxy on phone WiFi: Manual, set to PC IP address port 8888
10. Reproduce issue on phone; Fiddler on PC captures HTTPS traffic
11. After capture, disable proxy and remove Fiddler root certificate from phone

## Source
- OneNote: MCVKB/VM+SCIM/7.9
