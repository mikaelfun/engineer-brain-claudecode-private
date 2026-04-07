---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to get Action Group details from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20get%20Action%20Group%20details%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Get Action Group Details from Azure Support Center

## Procedure

1. Open Azure Support Center from the support request
2. Navigate to **Resource Explorer**
3. Locate the action group via:
   - **Resource Group** structure, OR
   - **Providers** → **microsoft.insights** → **actionGroups** → select desired action group
4. Click the **Properties** tab

## Available Information

### General Section
- Action group Name
- Resource ID
- Short Name
- Enabled status

### Action-Specific Sections
- Details for each configured action type (Email, SMS, Webhook, Logic App, etc.)

## Tip

Copy/paste the Properties details directly into case notes as environmental data.
