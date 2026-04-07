---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/Geneva Agent/Geneva Monitoring Agent Check"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FHost%20or%20AVD%20Agent%2FHealth%20Check%20Failures%2FGeneva%20Agent%2FGeneva%20Monitoring%20Agent%20Check"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467896&Instance=467896&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467896&Instance=467896&Feedback=2)

___
<div id='cssfeedback-end'></div>

|Contributors|
|--|
| [Josh Bender](mailto:jobende@microsoft.com) ; [Robert Klemencz](mailto:robert.klemencz@microsoft.com) |
---

See [Geneva Monitoring Agent Check](https://eng.ms/docs/cloud-ai-platform/azure/aep-platform/sigma/sigma-remote-desktop-azure-virtual-desktop/internal-documentation/documentation/sessionhost/healthchecks/monitoringagentcheck) for possible troubleshooting steps.

---
When troubleshooting issues related to the Geneva Agent connectivity (e.g. URLs unreachable or high traffic), usually the following data collection from the affected VM can be helpful:
- Network traces while reproducing the issue
  - See: [Network Trace - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/470842/Network-Trace)
- Geneva Agent Troubleshooter logs
  - See: [Using the Windows Agent Troubleshooter | Geneva Monitoring](https://eng.ms/docs/products/geneva/collect/troubleshoot/troubleshooter)
  - Most of the data collected by this tool is already included in MSRD-Collect but not everything _(there's work in progress to merge them if possible)_
- MSRD-Collect ("AVD Target" or "W365 Target", depending on the context)
  - See: [Data collection for Session Connectivity issues (not Logon or User Profile related) - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2278889/Data-collection-for-Session-Connectivity-issues-(not-Logon-or-User-Profile-related))

---
When dealing with "high traffic" topics, make sure to clarify first if the traffic is measured per VM or per host pool or per "entire AVD", as a host pool or the "entire AVD" environment of a customer may contain hundreds of VMs. Each VM may generate just a small amount of monitoring traffic, which can be expected, but if you sum up all VMs, the total may become large.

If just one single VM is generating a large amount of traffic to the Geneva endpoints, that may require an IcM, but validate it first with an AVD SME. For reference, see: [Incident-692557619 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/692557619/summary)

---
 content checked: 20251121