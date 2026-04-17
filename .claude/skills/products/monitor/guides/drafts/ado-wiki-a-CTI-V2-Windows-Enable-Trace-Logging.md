---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/How To/How To: Enable Trace Logging of CT&I Windows Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/How%20To/How%20To%3A%20Enable%20Trace%20Logging%20of%20CT%26I%20Windows%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::





# Scenario
---
If you are ever in the position where you need to trace down details on how CT&I Agent Linux works, the following process will give you some guidance.

## Step 1: Change Log Level in Configuration File
In order to enable debug logging of CT&I Agent, we need to edit the configuration file `C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\application.yml`. There are three parts we need to take care of 
1. Enable debug log for `cta_windows_agent.log`. Enable debug log for this is usually enough as this is the main agent log, which contains communication with AMA and details of Files/Services/Software/Registry inventory and changes. Edit the level to `TRACE`.

![image.png](/.attachments/image-ddddf4e2-1634-4db7-9852-f38f034b8b2e.png)

2. Enable debug log for `cta_windows_handler.log`. The is the log of handler services, brings up agent main process, provides basic environment parameters to the agent. Edit the level to `TRACE`.

![image.png](/.attachments/image-75731e25-8222-4f88-ad5b-52ea809a8d72.png)

3. Enable debug log for `cta_windows_watcher.log`. The is the log of checking whether agent main process/service are running. Edit the level to `TRACE`.

![image.png](/.attachments/image-2bac2484-644c-4112-aad0-f51a931668e8.png)

## Step 2: Restart CT&I Agent
- For how to restart CT&I Agent, Please refer to [How To: Manually Restart CT&I Windows Agent](/Monitor-Agents/Change-Tracking\(v2\)-and-Inventory/Change-Tracking-and-Inventory-\(CT&I\)-V2-%2D-Windows/How-To/How-To:-Manually-Restart-CT&I-Windows-Agent).

**Note:** 
- After restarted the CT&I Agent, we need to wait for some time for debug logs being populated. Typically 1 hour would be good to collect a cycle run of Registry Keys, Services, Software and Files. 
- Please remind customer of changing the collection level back to avoid filling up disk space after logs are collected.


