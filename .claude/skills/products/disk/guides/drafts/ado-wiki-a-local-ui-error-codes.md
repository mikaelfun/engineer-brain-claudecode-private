---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Data Box/Management and How-To/Local UI Error Codes"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Data%20Box%2FManagement%20and%20How-To%2FLocal%20UI%20Error%20Codes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Summary:**

UI will show "OOPs! Something went wrong" Web Page for below listed cases.

UI Page will have an `Error code with #<Alphanumeric value>`

This error code will correspond to one of the below failure category.

*   Hardware not healthy (#60XZY)

The user will not be able to access the appliance or shares.

Some of the reasons why the device may be showing unhealthy:
*   Virtual disk in failed state
*   All network adapters failed

*   Software is Unhealthy (#60XYZ)
    *   The DV filter service is not running.
    *   Some exception trying to unlock the disks.
    *   Pod startup tasks failed for any other reason.

*   Mgmt cluster resource is not running or responding (#55XYZ)

The #60XYZ or #55XYZ code corresponds to the current appliance system health and should be interpreted as follows:

```
X - Corresponds to Hardware health and can have one of the following values
0 - Unknown
1 - Healthy
2 - Degraded
3 - Unhealthy

Y - Corresponds to Software health and can have one of the following values
0 - Unknown
1 - Healthy
2 - Unhealthy

Z - Corresponds to Overall health and can have one of the following values
0 - Unknown
1 - Healthy
2 - Degraded
3 - Unhealthy
```

**For Example:**

If hardware is unhealthy and software is healthy the error code would be, `#60313`

If hardware and software both are unhealthy the error code would be, `#60323`

If hardware is healthy, but software is unhealthy the error code would be, `#60123`

If pod service is not running, but hardware health is fine, the error code would be `#55100`

*   Databox returned unexpected error for an UI action. `#70111`

User can try reboot of the appliance and re-try the operation.

From the limited OOBE UI that will be available to the user when the device is unhealthy the user can collect support package and contact management and platform team.
