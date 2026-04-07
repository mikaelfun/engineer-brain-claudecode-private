---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/HP Anyware/Connectivity/HP Anyware Connectivity Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FHP%20Anyware%2FConnectivity%2FHP%20Anyware%20Connectivity%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# HP Anyware Connectivity Status Check

## Overview

HP Anyware protocol is enabled by default in HP scenario. If customer encountered HP related connectivity issues, HP support will be the first-tier support for these issues.

## Connectivity Workflow

There will be 4 steps for HP Anyware connectivity scenario. HP will be responsible for **all** steps:

1. **[HP]** User authenticates against Azure AD, on-prem AD or 3P IDP
2. **[HP]** Connection is established via HP protocol to HP cloud gateway
3. **[HP]** Cloud PCs assigned to the user available in web/desktop portals
4. **[HP]** Connection is established via HP into Cloud PC

## Key Insight: RDP Fallback

HP will **NOT** block RDP connection, which is the main difference from Citrix/VMWare scenarios. Therefore, RDP can be treated as a fallback solution in case HP protocol breaks.
