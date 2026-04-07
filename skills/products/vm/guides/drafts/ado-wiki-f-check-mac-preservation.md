---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Check if MAC Preservation is Enabled_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCheck%20if%20MAC%20Preservation%20is%20Enabled_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check if MAC Preservation is Enabled

## Summary

MAC Preservation ensures that when a customer stop-deallocates and starts an IaaS VM, the same MAC address is preserved. This prevents ghost NIC entries in the registry caused by multiple NIC re-creations.

**Current status:** This feature is released worldwide.

## Check Regions (if needed)

1. Check RDFE service setting: `MacReservationEnabledNetworkGeoIds`
2. The returned list contains network geo IDs enabled for the feature
3. Go to ACIS -> OS Management -> Get Service Setting

## Check Single Subscription

1. Go to ACIS portal: `acis.engineering.core.windows.net/`
2. Navigate: Tools -> Endpoint RDFE -> Single action input -> Subscription Management -> Get Subscription with details
3. Input the subscription ID
4. Check output for `IsAuthorized:True` (feature enabled)

## MAC Preservation Impact Table

When does IaaS Guest VM get a new NIC?

| Action | MAC Preserved? |
|--------|---------------|
| Stop-Deallocate + Start | Yes (with MAC Preservation) |
| Redeploy | New MAC assigned |
| Move to different host | New MAC assigned |
