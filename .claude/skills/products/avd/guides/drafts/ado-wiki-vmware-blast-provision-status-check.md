---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/VMWare Blast/Provisioning/VMWare Provision Status Check"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FVMWare%20Blast%2FProvisioning%2FVMWare%20Provision%20Status%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview
VMWare agent will install and be registered inside VMs comparing with general provisioning process.

# Provisioning Workflow
There will be 7 steps in the provisioning process.
- **[VMWare]** User is licensed in the VMware cloud portal
- **[VMWare]** UserId + LicenseState + Token sent to W365
- **[W365]** UserId + LicenseSate + Token stored in W365 until TTL expires
- **[W365]** Provisioning/post-provisioning executes VMware agent install
- **[W365]** VMware agent installed using JWT token
- **[W365]** VMware agent registers into VMware service using JWT token
- **[VMWare]** CPC registered and available in VMware cloud portal
