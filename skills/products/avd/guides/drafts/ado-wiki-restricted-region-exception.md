---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Restricted Regions/Restricted region exception"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FRestricted%20Regions%2FRestricted%20region%20exception"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Restricted Region Exception

For W365 Enterprise or Frontline customers requesting provisioning in a restricted region (e.g., US West 2):

## Option 1: ANC (Bring Your Own Network)
- Customer has existing resources in the restricted region (e.g., ExpressRoute circuit)
- Configure an ANC in the restricted region
- **No exception needed**

## Option 2: MHN (Microsoft Hosted Network)
- Provision CPCs in another available (non-restricted) region
- **No exception process available**
- Work with account teams for network architecture (VNET peering, etc.)
