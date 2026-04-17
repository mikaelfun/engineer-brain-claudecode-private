---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Jarvis/SAW Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FJarvis%2FSAW%20Access"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SAW Access (Secure Admin Workstation)

## What is a SAW?

See: https://strikecommunity.azurewebsites.net/articles/680/cai-saw-program.html

## When Do You Need SAW Access?

SAW access should be infrequent. Consult your TA if unsure. Within Application Insights:
- **iKey swap** requires SAW (temporary — functionality is being exposed via ASC)
- **Restoring a deleted AI Component** can now be handled via ASC without SAW: use [Recover a deleted AI Component](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki) in ASC

## How to Get Permissions

Official eligibility requirements: https://strikecommunity.azurewebsites.net/articles/4281/joining-savm.html

## How to Log onto a SAW VM

Official usage documentation: https://strikecommunity.azurewebsites.net/articles/4282/using-savm.html

Step-by-step:

1. Go to: https://tdc.azure.net/
2. Drop down "CSS SAVM" on the left
3. Pick an option from the available choices under "CSS SAVM"
4. On the right side, click the **Request** button
5. Upon approval, a VM is added to the list on the right — select it
6. Hit **Connect** — this generates an `.RDP` file to connect
7. Log onto the machine using **Windows Hello** or your **domain credentials** (NOT AME.GBL account)
8. Once logged in, use your **AME.GBL account** and smart card to access Jarvis and its restricted actions

> **Note:** For operations that require AME account (such as iKey swap), you must be a member of **AME\\App-Insights-CSS-TA-EEE** security group.
