---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to get internal blade details from the Azure portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20get%20internal%20blade%20details%20from%20the%20Azure%20portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Why do we need this?

Blade name (screen name) is a key piece of information when troubleshooting user experience (UX) issues. It provides a scope and a context for the investigation.

# Instructions

1. Ask the customer to browse to the affected page in his portal, or alternatively browse to the same location in your lab environment.
2. Press on **Ctrl + Alt + D** in the keyboard. A few windows will pop up on the screen:
   - The section highlighted in blue represents the **team that owns the blade** (e.g., Azure Monitoring). This indicates which product team handles the issue.
   - The section highlighted in red is the **blade name**. For example, **AlertVNextRulesViewModel** is the blade name.
   - The section highlighted in green is the **session id**. If captured from the customer, it can be referenced against a browser trace (HAR) to match session details.
3. Pressing on **Ctrl + Alt + D** again will remove the pop-ups.
