---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Portal/Problems loading Logs blade in Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FPortal%2FProblems%20loading%20Logs%20blade%20in%20Portal"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Troubleshooting Portal Issues Step-by-Step
---
This guide helps you investigate and resolve issues loading the 'Logs' blade in the Azure Portal by capturing and analyzing browser traces (HAR files) and console logs.

**Before continuing with this troubleshooting guide, it's important to confirm if the customer already performed these steps\tests:**
* Clear the browser cache
* Use Private browsing
* Try a different web browser
* Try using another network or a different proxy server, if possible

## Step 1: Check for Service Incidents and Known Issues
---
1. Follow the instructions in the following guide to determine if the issue is related with an active or previous service incidents (also refereed to as 'outage') on 'Log Analytics': [Check for Service Outages](/Azure-Monitor/Check-for-Service-Outages)

2. If the issue is not related with an active\mitigated outage, then please check the 'Known' issues section of our wiki: [Log Analytics Known issues](/Log-Analytics#before-you-start-troubleshooting-a-log-analytics-case)

## Step 2: Capture Browser Trace and Console Logs
---
1. **Capture a HAR File and Console Logs:**
   - Follow the instructions in this guide: [How to capture a browser trace (HAR) for troubleshooting](/Azure-Monitor/How%2DTo/General/How-to-capture-a-browser-trace-\(HAR\)-for-troubleshooting).

## Step 3: Analyze the HAR File
---
1. **Open the HAR File:**
   - Use a HAR file viewer or your browser's developer tools to open the HAR file.

2. **Analyze the HAR File:**
   - Follow this detailed guide: [How-To: Analyze HAR traces and decide if and which product team should we escalate to](/Log-Analytics/How%2DTo-Guides/General/How%2DTo:-Analyze-HAR-traces-and-decide-if-and-which-product-team-should-we-escalate-to).

## Step 4: Identify Common Issues
---
Check the HAR file for the following common issues:

1. **Blocked Endpoints:**
   - Ensure the following endpoints are not blocked by a firewall or proxy, and are properly resolved by DNS:
     - `https://management.azure.com/`
     - `https://api.loganalytics.io/`
     - `https://api.loganalytics.azure.com` (Note: `api.loganalytics.io` is being replaced by `api.loganalytics.azure.com`. Both endpoints will be supported for the foreseeable future.)
     - `https://analytics.aimon.applicationinsights.io/`

## Step 5: Check Network Isolation Settings
---
1. **Identify Network Isolation Issues:**
   - If queries through the public network are turned off, you may see an error message similar to the one below:
     ![image.png](/.attachments/image-10b5982c-5570-4ee0-84c5-d04c73b48182.png)

2. **Enable Public Network Access:**
   - Navigate to the "Network Isolation" blade and enable public network access for queries:
     ![image.png](/.attachments/image-7e00dd63-871d-4e74-a3cf-794f3865db30.png)

3. **Check for Policy Enforcement:**
   - If this setting is enforced by Azure Policy, request a policy exemption.
   - If a policy exemption is not possible, or if the customer does not want to enable queries from public networks, run queries from a VM in an AMPLS-connected VNet.

**Note:** Some blades may still not load properly due to queries running against the ARM API instead of the Log Analytics API. More information can be found [HERE](https://learn.microsoft.com//azure/azure-monitor/logs/private-link-design#azure-resource-manager).

# Additional Resources
---
- [How to capture a browser trace (HAR) for troubleshooting](/Azure-Monitor/How%2DTo/General/How-to-capture-a-browser-trace-\(HAR\)-for-troubleshooting)
- [How-To: Analyze HAR traces and decide if and which product team should we escalate to](/Log-Analytics/How%2DTo-Guides/General/How%2DTo:-Analyze-HAR-traces-and-decide-if-and-which-product-team-should-we-escalate-to)
- [Network Isolation and Azure Monitor](https://learn.microsoft.com//azure/azure-monitor/logs/private-link-design#azure-resource-manager)
- [Unable to use the Logs blade when the workspace is on Azure Lighthouse managed subscription](/Log-Analytics/Known-Issues/Portal-Issues/Unable-to-use-the-Logs-blade-when-the-workspace-is-on-Azure-Lighthouse-managed-subscription)
- [Known Issue: Workspace Inaccessible if Blocking Third Party Cookies](/Log-Analytics/Known-Issues/Portal-Issues/Known-Issue:-Workspace-Inaccessible-if-Blocking-Third-Party-Cookies)

# Keywords
---
Browser Trace, HAR File, Console Logs, Azure Portal, Troubleshooting, Network Isolation, DNS Resolution, Firewall, Proxy, Azure Monitor, Private Link

