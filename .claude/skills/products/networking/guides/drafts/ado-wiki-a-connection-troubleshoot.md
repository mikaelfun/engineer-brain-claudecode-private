---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Connection Troubleshoot"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Connection%20Troubleshoot"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AppGW Connection Troubleshoot

Useful for debugging network connectivity issues between AppGW v2 instances and custom DNS servers or backend servers.

## Customer-Facing — Azure Portal

The Network Watcher team released an improved **Connection Troubleshoot** tool integrated with Application Gateway:

- Accessible through the **Backend Health** page for any backend connectivity problems
- Pre-fills details automatically when navigating through the backend health troubleshoot link
- Users only need to select required tests
- Also available in the **Monitoring section** of the Application Gateway blade

## Internal — ASC

Navigate to ASC → **Network Watcher Diagnostic Tools** → **Connection Troubleshoot**:

- **Resource Type**: Application Gateway
- **Resource ID**: `/subscriptions/{subscriptionID}/resourceGroups/{RG}/providers/Microsoft.Network/applicationGateways/{AppGW}`
- **Region**: Select the AppGW region
- **Destination**: URI, FQDN, or IPv4 address
- **Destination Port**: 1-65535

> **Note**: The old Connection Troubleshoot under Application Gateway Diagnostics Tab in ASC is deprecated and will be removed in the next ASC release cycle.
