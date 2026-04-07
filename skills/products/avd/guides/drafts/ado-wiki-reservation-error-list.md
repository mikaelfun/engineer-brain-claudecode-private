---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Reservation error list for provision and resize"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Reservation%20error%20list%20for%20provision%20and%20resize"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reservation Error List for Provision and Resize

## Reserved VM Error Codes

When the following errors are encountered during provisioning/reprovision or resizing, the failed VM will be deferred for deletion to allow further investigation:

- **Retention periods**: Test/SH: 4 days | PPE/PE 1P: 7 days | PPE/PE Non-1P: 14 days

### Error codes that trigger reservation:
- JoinDomainFailed
- HybridAADJoinFailed
- IntuneEnrollFailed
- CustomscriptextensionFailed
- RunDscExtensionFailed
- DscExtension_UnableToCheckFirewallStatus
- DscExtension_ClassNotRegistered
- VMExtensionProvisioningTimeout
- VMExtensionProvisioningError
- ZtdAadjFail
- DeploymentTimeout
- UserNotFoundInExtension
- AzureCompute_OSNotGeneralized
- AzureCompute_VMAgentStatusCommunicationError
- AzureCompute_OSProvisioningTimedOut
- AzureCompute_OSNotProperlyPrepared
- VMAgentUnavailable

> If your error code is not listed above, contact SaaF to engage dev for ad-hoc reservation.

## Investigation Steps

1. Find the reserved VM in **CPCD** → Provision Diagnostic → Reserved CPC VM Due To Provision/Resize Failed
2. Use **Azure Support Center** to:
   - Get **Inspect IaaS Disk** for the reserved VM
   - Get **Guest Agent VM Logs** for the reserved VM
3. Investigate the root cause from collected logs
