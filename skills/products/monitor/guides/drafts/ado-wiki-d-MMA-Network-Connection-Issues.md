---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to Check for Network Connection Issues for MMA"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20Check%20for%20Network%20Connection%20Issues%20for%20MMA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
Applies To:
- Microsoft Monitoring Agent :- All versions

[[_TOC_]]

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

# Scenario
---
Whenever customers are facing difficulties regarding the connectivity on windows agents, or even when you are troubleshooting why the machine is not reporting correctly to the workspace, the below steps could help in checking the connectivity issues reason.

# High level steps
---
- [ ] Execute the TestCloudConnection
- [ ] Check the proxy settings of LocalSystem using autoproxutil 
- [ ] Additional details to check 

## Execute the TestCloudConnection

1. Open a Command Line as admin

1. Run: `cd C:\Program Files\Microsoft Monitoring Agent\Agent`
 
1. And then: `.\TestCloudConnection.exe`

1. Validate if an endpoint is being blocked

If an endpoint is blocked such as this

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-fa8fd240-cfe7-4d22-8d12-45848c8d3b0d.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

## Check the proxy settings of LocalSystem using autoproxutil 
While troubleshooting agent connectivity issues, sometimes we need to check the proxy settings of the LocalSystem account.

Normally you can use PSEXEC to launch a command prompt or PowerShell session under LocalSystem context and then check, but you can also use a tool call '**autoproxutil**' to do that, running it with this cmdline: **autoproxutil /U:18**

Here's a zip file with the tool (password is safe)
[autoproxutil.zip](/.attachments/autoproxutil-88b7123a-801d-4f98-ad7c-50606b18b317.zip)

## Additional SSL Checks
1. Make sure TLS 1.2 is enabled on the agent and any proxy/firewall
2. Check customers network has no HTTPS Inspections
3. Check if customer has a firewall/proxy that would block outbound connections
4. Check list of ciphers on the Agent [How to check SSL connectivity for MMA using PowerShell](/Monitor-Agents/Agents/Microsoft-Monitoring-Agent-\(MMA\)-for-Windows/How%2DTo/How-to-check-SSL-connectivity-for-MMA-using-PowerShell)
## What you can also check


1. Are the network requirements respected? -> https://docs.microsoft.com/azure/azure-monitor/platform/log-analytics-agent#network-firewall-requirements

2. Check the outbound connections on the main Firewall to see if there was an attempt at any of the endpoints that you saw being blocked or if to any IPs in the customer region. Here are the regions -> https://www.microsoft.com/download/details.aspx?id=56519

3. Confirm there is no internal firewall on the machine or any other network configuration that might block the outbound traffic to our endpoint (other than the main firewall � which you should have confirmed by now that doesn't block anything).

4. Check the Microsoft Monitoring Agent Certificates from the Local Computer:

Open MMC -> File -> Add/Remove snap-in -> Certificates -> Add

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-c7a0b211-abfe-4f49-8c08-9f409938351c.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>


<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-7124454d-6a73-47d9-9e5d-6ca72f3605a3.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-a0208480-5cf2-4f74-9320-e6e5242c1553.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

Please check and document if any of them is expired:

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-0e4da5c6-500b-4fc4-a231-bfa888993a7d.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>


If it is expired, please follow [this process](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605554/How-to-regenerate-the-SourceComputerId-(Agent-ID)-on-the-Windows-Agent) to renew them by removing getting a new Source Computer ID for that VM.

5. Check the Event Viewer -> Application and Services Logs -> Operations Manager and see if there are any issues with Health or Health Connection.

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-b937656e-0883-430c-99c4-a87e89fd43e6.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

6. Run this command in the Command Prompt console and send me the output please -> `netsh winhttp show proxy`

# References
---
[How to troubleshoot issues with the Log Analytics agent for Windows](https://docs.microsoft.com/azure/azure-monitor/platform/agent-windows-troubleshoot)



