---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Alerts: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Alerts%3A%20Determining%20Scope"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Case Misroutes: Alerts — Determining Scope

## Scoping

- The first thing you should do is identify the **alert prefix** (e.g., DA, FA, DL, IR) and collect/check the service source and detection source in the Defender alerts portal.
- Use public documentation to verify alert GUID and prefix: [Investigate alerts in Microsoft Defender XDR](https://learn.microsoft.com/en-us/defender-xdr/investigate-alerts?view=o365-worldwide&tabs=settings)
- Collaborate with other teams if the alert involves multiple workloads.
- For more information consult the recent presentation: [Decoding Alerts Across MDO, MDE, and Purview | QA Platform](https://platform.qa.com/resource/decoding-alerts-across-mdo-mde-and-purview-1854/?context_id=16211&context_resource=lp)

> ℹ️ See the Alerts prefix table image in the original wiki for a full reference of alert prefix → owning team mapping.

## Contributors

**Tara Doherty** — taradohery@microsoft.com  
**Sandra Ugwu** — sandraugwu@microsoft.com
