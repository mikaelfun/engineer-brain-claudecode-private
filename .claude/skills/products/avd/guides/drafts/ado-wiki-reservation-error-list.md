---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Reservation error list for provision and resize"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Provisioning/Reservation%20error%20list%20for%20provision%20and%20resize"
importDate: "2026-04-21"
type: guide-draft
---




1. When the following errors are encountered during provisioning/reprovision or resizing(by default, we can also enable the flighting to reserve failed devices with all error codes), the failed VM will be deferred to be deleted for further investigate the failure:

    In Test/SH the failed devices will be deferred for 4 days. In PPE/PE, 1P failed devices will be deferred for 7 days, Non-1P failed devices will be deferred for 14 days. 

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

```
If you need a reserved failed VM to investigate the provision/resize failure but the error code is not listed as above, please contact SaaF to engage dev for add-hoc reservation.
```
2. The reserved VM can be found on **[CPCD](https://dataexplorer.azure.com/dashboards/75337ab5-9514-41a7-9c9c-bbc114809f55?p-_startTime=2days&p-_endTime=now&p-TenantID=v-%3CTenant+ID%3E&p-action=all&p-UserID=all&p-ANCId=all&p-ANCActivityId=all#6f5323e0-de81-4055-89a2-e12b22d40c89) - Provision Diagnostic- Reserved CPC VM Due To Provision/Resize Failed**

     ![image.png](/.attachments/image-7196424c-bc9c-437e-bbbf-b79480ca852b.png )

3. Using **[Azure Support Center](https://azuresupportcenter.azure.com/)** to get the **[Inspect IaaS Disk](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495113/Collect-Logs-from-VM_RDP-SSH?anchor=option-1---inspect-iaas-disk-with-asc)** or **[Guest Agent VM Logs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495009/Log-Collection_AGEX?anchor=guest-agent-vm-logs)** of the reserved VM to investigate the root cause of the provision/resize failure. 


   ![ASCP1.png](/.attachments/ASCP1-7fd7473b-ebab-4136-bdf6-f6636bf20fbb.png  =500x250)

   ![ASCP2.png](/.attachments/ASCP2-f47be062-8ce4-42f7-a66a-60aa8afb24a6.png  =500x300)

   ![ASCP3.png](/.attachments/ASCP3-72200c06-dad7-4582-8c93-17895d152fa1.png  =500x300)

   ![image.png](/.attachments/image-19c4499e-5a7c-4abb-a766-93de3d70f2dd.png)