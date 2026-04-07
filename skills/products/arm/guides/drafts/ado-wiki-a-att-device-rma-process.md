---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[TSG] AT&T Device RMA Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BTSG%5D%20AT%26T%20Device%20RMA%20Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] AT&T Device RMA Process

## Steps for Patching and RMA Process Approval

1. Get approval from AT&T to patch the device. Approval contacts differ between production and non-production:

**Production** (subscription contains `prod`):
- Add Ante to "To" line: ac9571@att.com

**Non-Production** (subscription contains `nprd`):
- Add Trevor and Ryan to "TO" line: tl2972@att.com, rh173x@att.com

**Template:**
```
We received support case **Case Number** regarding RMA of a device.

The ARM ID of the device is: /subscriptions/<Subscription>/resourceGroups/<Resource Group>/providers/Microsoft.ManagedNetworkFabric/NetworkDevices/<Name of Device>

1. Support Request submitted by: <Name>
2. Investigation Details: RMA request, need to perform Serial Number Patch.
   Device ID: <Device ARM ID>
3. Support Ticket: **Case Number**

I am requesting approval to proceed with patch operation required to update the serial number.
```

2. No earlier than 24 hours before the RMA call, open an ICM and transfer to NNF team queue: **Nexus Network Fabric/NNF Site Reliability Eng**.

3. Add to ICM:
   - NF ARM id
   - Device ARM id
   - Terminal server Serial number
   - New device Serial number (preferably show version command output)
   - Approval status
   - Current Status of new device (Rack/stack, ZTP, maintenance mode)
   - Active issues on NF
   - Brick wall status

4. Call scheduled with AT&T for remaining RMA actions:
   - TS reprovision (NNF team)
   - Bootstrapping (NNF team)
   - Partial Reconciliation (NNF team)

## Scheduling Constraints
If AT&T requests specific-time actions by NNF team:
- Schedule during **India working hours** or **after 11:00 AM Pacific Time**
- Submit at least **two business days in advance**

## Additional Resources
- [BMM Provisioning Replace Diagnostics improvements video](https://microsofteur.sharepoint.com/:v:/t/AzureForOperatorsCSSHub/EZKfIRx_3mFKp9PtmO29OAYBBMsKO_i9LyQbp39i3c2SKg)
