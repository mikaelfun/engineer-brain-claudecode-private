---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Reboot/Reboot 1074 System Event Messages"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Reboot/Reboot%201074%20System%20Event%20Messages"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reboot 1074 System Event Messages

Understanding the meaning of the 1074 system reboot/shutdown messages seen in Event Viewer (Event ID 1074).

## Reboot Source Identification

### 1. RuntimeBroker.exe
- **Trigger**: User initiated restart from Start → Power Menu within the OS
- **Example message**: `The process C:\Windows\System32\RuntimeBroker.exe (MACHINE_NAME) has initiated the restart...`
- **Reason Code**: 0x0
- **Shut-down Type**: restart

### 2. winlogon.exe
- **Trigger**: User initiated restart from Windows Logon Screen power menu
- **Example message**: `The process C:\Windows\system32\winlogon.exe (MACHINE_NAME) has initiated the restart...`
- **Reason Code**: 0x500ff
- **Shut-down Type**: restart
- **User**: NT AUTHORITY\SYSTEM

### 3. shutdown.exe
- **Trigger**: Restart from command line or by a 3rd party application
