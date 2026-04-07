---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/Troubleshooting Guides/TSG Auto Extension Upgrade - Dependency Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FTroubleshooting%20Guides%2FTSG%20Auto%20Extension%20Upgrade%20-%20Dependency%20Agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Auto Extension Upgrade - Dependency Agent

**Support Boundary:** Monitor Support Team will only provide support for the Dependency Agent Extension upgrade related issues. Application Health Extension is supported by VM/Compute Support team.

## Scenario
Customer reports that Auto Extension Upgrade is not working for Dependency Agent.

## Diagnosis Steps

### Extension upgrade Operations query for Single Instance VM

Run the following Kusto Query on `azcrp.kusto.windows.net/crp_allprod`:

```kql
VMAutoExtensionUpgradeEvent
| where TIMESTAMP > ago(2d)
| where subscriptionId == "<subscriptionID>"
```

1. Filter by subscription id and find resource in question
2. Check the status on the operation (Submitted, InProgress, Succeeded, Failed)
3. If failed, look at error details in query to see why upgrade operation failed
4. **Note:** If you don't see your specific resource, check other resources from same subscription. RSM tries to batch single VM calls in a subscription so the resource you are looking for might be blocked by another failing resource.

### Extension Upgrade Operations query for VMSS

```kql
VmssAutomaticExtensionUpgradeEvent
| where TIMESTAMP > ago(12h)
| where subscriptionId == "<subscriptionID>"
```

Same steps as above.

### Additional CRP error investigation

If not enough information, query CRP errors:

```kql
ContextActivity
| where TIMESTAMP > ago(1d)
| where activityId == "<activityId>"
```

**Note:** The activity id should be the same as the operation id from the VmssAutomaticExtensionUpgradeEvent or VMAutoExtensionUpgradeEvent.

## Error Codes Reference

| Error Code | Description | Action |
|---|---|---|
| VMAgentStatusCommunicationError | VM Agent cannot communicate to external servers to download newest extension version | Check network connectivity |
| Conflict | Another operation already in progress | Should resolve with retry |
| OSProvisioningClientError | Unrelated error blocking extension upgrades | VM must be redeployed |
| OSProvisioningTimedOut | Unrelated error blocking extension upgrades | VM must be redeployed |
| StorageAccountLocationMismatch | Unrelated error blocking extension upgrades | Customer must fix storage account location |
| InternalOperationError | Internal error | Investigate further |
| ZonalAllocationFailed | Unrelated error blocking extension upgrades | Customer must fix zonal allocation |
| StorageAccountTypeNotSupported | Unrelated error blocking extension upgrades | Customer must fix storage account type |
| VMExtensionHandlerNonTransientError | Error upgrading/installing extension | Investigate VM agent logs |
| MaxUnhealthyUpgradedInstancePercentExceededInRollingUpgrade | VMSS instances unhealthy after upgrade | Investigate specific error in message |
| NotFound | Resource no longer exists | RSM should retry; if resource exists it may have been temporarily deleted |
| VMExtensionProvisioningError | Extension could not be provisioned after installing | Investigate VM agent logs; error message has extension details |
| MaxUnhealthyInstancePercentExceededInRollingUpgrade | VMSS has >20% unhealthy VM instances before next batch | Determine why VMSS is unhealthy |
| MaxUnhealthyInstancePercentExceededBeforeRollingUpgrade | VMSS has >20% unhealthy instances before upgrade attempt | Customer must determine VMSS health issue |
| OperationNotAllowed | Another ongoing rolling upgrade operation | Should be transient, retry |
| VMExtensionProvisioningTimeout | Extension takes too long to provision | Check error message details and guest agent logs |
| VMStartTimedOut | Non-transient, caused by bad customer deployment | VM must be redeployed |
