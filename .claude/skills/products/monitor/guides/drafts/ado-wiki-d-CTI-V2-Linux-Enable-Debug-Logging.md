---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Linux/How-To/How To: Enable Debug Logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Linux/How-To/How%20To%3A%20Enable%20Debug%20Logging"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
If you are ever in the position where you need to trace down details on how CT&I Agent Linux works, the following process will give you some guidance.

## Step 1: Change Log Level in Configuration File
In order to enable debug logging of CT&I Agent, we need to edit the configuration file `/var/lib/waagent/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux-*/application.yml`. There is three parts we need to take care of 
1. Enable debug log for `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/cta_linux_agent.log`. The is the main agent log, which contains communication with AMA and details of Files/Services/Software inventory and changes. Edit the level to `TRACE`.
![Snipaste_2024-02-01_15-52-33.png](/.attachments/Snipaste_2024-02-01_15-52-33-81176f12-20f6-4a3c-a710-b330a9de34d5.png)

2. Enable debug log for `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/cta_linux_handler.log`. The is the log of handler services, brings up agent main process, provides basic environment parameters to the agent. Edit the level to `TRACE`.
![Snipaste_2024-02-01_15-52-53.png](/.attachments/Snipaste_2024-02-01_15-52-53-143d8194-dc58-4ed5-87b5-270bb0b0bb03.png)

3. Enable debug log for `/var/log/azure/Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Linux/cta_linux_watcher.log`. The is the log of checking whether agent main process/service are running. Edit the level to `TRACE`.
![Snipaste_2024-02-01_15-53-12.png](/.attachments/Snipaste_2024-02-01_15-53-12-3fae1416-7d92-43e0-a81b-51b8d44f2034.png)

## Step 2: Restart CT&I Agent
- For how to restart CT&I Agent, Please refer to [How To: Manually Restart CT&I Linux Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Linux/How%2DTo/How-To:-Manually-Restart-CT&I-Linux-Agent).

**Note:** 
- After restarted the CT&I Agent, we need to wait for some time for debug logs being populated. Typically 1 hour would be good to collect a cycle run of Services, Software and Files. 
- Please remind customer of changing the collection level back to avoid filling up disk space after logs are collected.


