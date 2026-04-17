---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/SDN in progress/SDN enabled by Azure ARC"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FSDN%20in%20progress%2FSDN%20enabled%20by%20Azure%20ARC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SDN enabled by Azure ARC — Setup Guide

As a first step to use SDN enabled by Azure ARC, run through the prerequisites and prepare the DNS environment:
https://learn.microsoft.com/en-us/azure/azure-local/deploy/enable-sdn-integration?view=azloc-2507#prerequisites

## Deployment Steps

1. RDP into the first host node as domain Administrator
2. Via PowerShell, run:

```powershell
Add-EceFeature -Name NC -SDNPrefix sdnclust
```

This kicks off a job that lasts about 20 minutes.

## Post-Deployment Verification

After successful deployment:
- Open **Failover Cluster Manager** — you should see the Network Controller services
- **Important**: These are **failover clustered services**, NOT Service Fabric services
- From Node01 you can see the same services via PowerShell

Since these are failover cluster services they can also be controlled with traditional cluster resource commands:
- `Get-ClusterResource`
- Stop/Start clustered services
- Move services to other nodes if needed

## NSG Scenario

If we deploy a VM from the Azure Local portal and later choose to create an NSG to apply to that VM, this scenario would use the **FirewallService** running in FCM to program the NSG rule into the VFP layer of the vSwitch, thus controlling what ports are open or denied to the VM.
