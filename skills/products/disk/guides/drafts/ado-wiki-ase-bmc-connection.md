---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Connecting to an Azure Stack Edge Device via BMC"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FConnecting%20to%20an%20Azure%20Stack%20Edge%20Device%20via%20BMC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Connecting to Azure Stack Edge Device via BMC

## Prerequisites
- Configure host Ethernet adapter: static IP 192.168.100.5, subnet 255.255.255.0
- Connect host to BMC port on ASE device

## Steps
1. Open browser: `https://192.168.100.100` (may take a few minutes after power on)
2. Accept security certificate warning (Advanced > Proceed)
3. Log in to iDRAC:
   - Username: `EdgeSupport`
   - Password: Request from Engineering Roster team with device serial number; decrypt via Support Password Decrypter at https://hcssupport/
   - Note: PST business hours; for SevA cases contact directly
4. Available features:
   - **System Health Dashboard**: Component health overview, temperature
   - **System tab**: Detailed system component info
   - **Storage tab**: Storage component info
   - **Virtual Console**: CLI access (set Plug-In Type to HTML5; disable pop-ups)
   - **TSR Logs**: Maintenance > Support Assist > Start a Collection (for Dell Support)
