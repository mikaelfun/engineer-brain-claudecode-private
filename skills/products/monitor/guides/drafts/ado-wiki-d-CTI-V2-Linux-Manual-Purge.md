---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/How-To/How To: Manually Purge CT&I Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/How-To/How%20To%3A%20Manually%20Purge%20CT%26I%20Linux%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
If you are ever in the position where you need to manually purge the CT&I Agent for Linux, the following process will give you some guidance.

Make sure to uninstall the CT&I extension from Azure Portal first, regardless of a failed uninstallation, as below process is only for the agent on OS, not for extension itself.

**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent.
```
cd /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*
./cta_linux_handler disable
./cta_linux_handler uninstall
```
**Method 2** (If method 1 does not work)
1. Remove cxp service
```
systemctl stop cxp
systemctl disable cxp
rm /lib/systemd/system/cxp.service
rm /etc/systemd/system/cxp.service
rm /usr/lib/systemd/system/cxp.service
systemctl daemon-reload (**This is optional**)
```
2. At this stage, cxp.service is still available via `systemctl status cxp`, though in failed state.. Optionally run `systemctl reset-failed` to remove cxp.service from systemd.
3. Remove change-tracking-retail package
- Redhat series : `yum remove -y change_tracking_retail `
- Debian series : `apt remove -y change-tracking-retail `
4. Remove local files
- /opt/microsoft/changetracking/*
- /usr/sbin/changetracking/*
- Optional: /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*/*
- Optional: /var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/*



