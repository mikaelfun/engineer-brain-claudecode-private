---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/How-To/How To: Manually Restart CT&I Linux Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/How-To/How%20To%3A%20Manually%20Restart%20CT%26I%20Linux%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
If you are ever in the position where you need to restart the CT&I Agent for Linux, the following process will give you some guidance.


**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent. You will need to browse the installation directory from a shell and execute the script using either the -disable parameter or the -enable parameter. This will need to be done as the root user.
- Go to /var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-{extension-version}
- As high privilege user run  `./cta_linux_handler disable`
- Wait for few minutes until following processes are finished
/usr/sbin/changetracking/changetracking
/opt/microsoft/changetracking/change_tracking_agent_linux_amd64

- To enable the agent back `./cta_linux_handler enable`


**Method 2** (If method 1 does not work)
- `systemctl restart cxp.service`




