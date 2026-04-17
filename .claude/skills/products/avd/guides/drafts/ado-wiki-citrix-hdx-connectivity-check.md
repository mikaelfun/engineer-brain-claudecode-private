---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/Citrix HDX Plus/Connectivity/Citrix HDX Connectivity Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Partner%20Connectors/Citrix%20HDX%20Plus/Connectivity/Citrix%20HDX%20Connectivity%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Citrix HDX Connectivity Status Check

HDX protocol is enabled by default in Citrix HDX Plus scenario. If customer encountered HDX related connectivity issues, Citrix support will be the first-tier support for these issues.

Before asking customer to raise support ticket from Citrix side, perform these validations:

## Check Connectivity between Citrix Agent and Citrix Gateway

### 1. Turn on RDP Protocol

Follow guidance: https://learn.microsoft.com/en-us/windows-365/enterprise/troubleshoot-citrix-hdx-plus#turn-on-the-rdp-protocol

⚠️ Do **not** remove the HDX license from the user of the machine when doing this.

### 2. Check Registry Key

Check the value of `NgsConnected` at:
```
Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\VirtualDesktopAgent
```

- `value of 1` — connection from Cloud PC to Citrix gateway service is **established**
- `value of 0` — connection from Cloud PC to Citrix gateway service is **NOT established**

### 3. Check Citrix Requirements

Verify access for named URLs and ports per: https://learn.microsoft.com/en-us/windows-365/enterprise/requirements-citrix#citrix-requirements

### 4. Escalate to Citrix Support

If issue persists after above checks, ask customers to seek support from Citrix.
See support collaboration guidance for MSFT vs Citrix responsibility boundaries.
