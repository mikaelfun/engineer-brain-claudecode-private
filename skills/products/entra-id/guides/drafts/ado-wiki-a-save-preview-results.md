---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/General/SavePreviewResults"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FGeneral%2FSavePreviewResults"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Save Preview Results from AAD Connect Sync Service Manager

## Purpose

Collect synchronization preview XML data for an object to diagnose sync issues.

## Steps

1. **Log on to the AAD Connect Server**
2. Open **Synchronization Service Manager**
3. Click **Connectors** > select the **Active Directory Connector** (e.g., contoso.com)
4. Click **Search Connector Space** from the Actions Bar
5. Set Scope to **DN or anchor**, paste the distinguishedName (e.g., `CN=Videoroom01,OU=Provisioning,DC=contoso,DC=com`)
6. Click **Search** and click **Properties** on the result
7. In **Connector Space Object Properties**, click **Preview**
8. After preview completes, click **Save Preview Results**
9. Upload the saved **XML file** to the workspace

## Notes

- Ensure appropriate permissions before performing these steps
- The XML file helps diagnose synchronization attribute flow and rule evaluation
