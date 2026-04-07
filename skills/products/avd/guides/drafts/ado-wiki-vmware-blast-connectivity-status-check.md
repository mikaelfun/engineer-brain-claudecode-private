---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/VMWare Blast/Connectivity/VMWare Blast Connectivity Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FVMWare%20Blast%2FConnectivity%2FVMWare%20Blast%20Connectivity%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

Blast protocol is enabled by default in VMWare Blast scenario. If customer encountered Blast related connectivity issues, VMWare support will be the first-tier support for these issues.

# Connectivity Workflow

There will be 5 steps for VMWare Blast connectivity scenario. VMWare will be responsible for **all** steps.

- **[VMWare]** User authenticates against Azure AD, on-prem AD or 3P IDP
- **[VMWare]** Connection is established via Blast protocol to VMware cloud gateway
- **[VMWare]** Cloud PCs assigned to the user available in web/desktop portals
- **[VMWare]** Connection is established via Blast into Cloud PC
- **[VMWare]** VMware Horizon agent blocks RDP connectivity, forcing VMware connection

> **Key Point**: All connectivity steps are VMware's responsibility. Microsoft support should redirect Blast connectivity issues to VMware.
