---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Identifying the WHfB trust scenario Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20Identifying%20the%20WHfB%20trust%20scenario%20Data%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Identifying the Windows Hello for Business deployment and trust types

Microlearning session: [Identifying the WHfB and trust type.mp4](https://microsofteur.sharepoint.com/:v:/t/Community-StrongAuthMethods/EdRP1Wg6YL5Pj3mIqc65fZEBXjh3tYc52SRhGYsZKzBvLQ?e=Jq7314)

### Data Collection Steps

1. **Start with `dsregcmd.exe /status`** on the client PC that is unable to provision or authenticate.
   - See [Device registration/Troubleshooting Windows 10 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184298#Device_Registration_Status) for field reference.

2. **Event logs to review on client:**
   - Application and Service Logs > Microsoft > Windows > **HelloForBusiness**
   - Application and Service Logs > Microsoft > Windows > **User Device Registration**
   - Application and Service Logs > Microsoft > Windows > **AAD**

3. **Prerequisites Check** (at bottom of `DSREGCMD /STATUS` output):
   - Last field shows provision status: **WillProvision** or **WillNotProvision**
   - Other fields indicate why provisioning won't proceed
   - Reference: https://docs.microsoft.com/azure/active-directory/devices/troubleshoot-device-dsregcmd#ngc-prerequisites-check
