---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Partner Connectors/VMWare Blast/General/General Troubleshooting Tools"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FPartner%20Connectors%2FVMWare%20Blast%2FGeneral%2FGeneral%20Troubleshooting%20Tools"
importDate: "2026-04-05"
type: troubleshooting-guide
---

In product we provide a few troubleshooting tools to help customers identify issues that may impact Windows 365 experiences. These tools may also be used to support BLAST scenarios.

## Azure Network Connection canary checks
For customers using HAADJ and/or BYO networks, the Azure Network Connection (ANC) health checks can still be helpful. ANC health checks will validate external connectivity, internal DNS and Domain Controller access. This may help customers/VMware understand if the Cloud PC connectivity should be working as expected, and rule out some issues on the customers BYO vNet.

## Connection Health reports
Windows 365 provides a connection health report per device, where health checks are run on each Cloud PC and issues reported. These health checks include AVD RD Gateway connectivity checks, domain join status checks and various others. All of these health checks are expected to return success, even when enabling BLAST. Use these checks to confirm basic connectivity and Cloud PC health when troubleshooting BLAST related issues.

## Enable RDP for troubleshooting
VMware BLAST will automatically block Remote Desktop connectivity when installed to ensure there is no easy security bypass of BLAST. However, any user that is added to the Local Administrators of a machine may connect via BLAST or RDP. This means we have a simple way to enable RDP for troubleshooting purposes - just add the Cloud PC user to the Local Administrators.

This can be done in many ways: in the Windows 365 Local Admin feature, via Intune Local Admin policy, or via Group Policy.

Once the user has been enabled for Local Administrator, connect to the Cloud PC using the Remote Desktop app and begin troubleshooting BLAST related connectivity issues.

## Retry VMware BLAST enablement
If BLAST has not been enabled correctly, the customer can force a BLAST onboarding manually by:
- Remove the VMware license from the Windows 365 node in the VMware Cloud admin console
- Wait 10 minutes for the offboarding event to process in Windows 365
- Re-add the VMware license from the Windows 365 node in the VMware Cloud admin console
- Wait 20-30 minutes for the onboarding event to process in Windows 365
- Retry connecting via BLAST. If successful, the installation and onboarding has completed correctly. If unsuccessful, contact MSFT support to help diagnose the BLAST installation failure.
