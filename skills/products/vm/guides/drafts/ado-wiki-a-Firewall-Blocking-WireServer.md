---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Firewall Blocking WireServer_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20%28AGEX%29/TSGs/GA/Firewall%20Blocking%20WireServer_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Short URL: https://aka.ms/agexTSG009

# Scenario

ASC and Azure Portal show VM Agent status: Not Ready

Extensions stuck in Transitioning or Failed state

You see the following error in **WaAppAgent.log**:
```
[00000011] [12/11/2018 06:27:55.66] [WARN]  (Ignoring) Exception while fetching supported versions from HostGAPlugin: System.Net.WebException: Unable to connect to the remote server
---> System.Net.Sockets.SocketException: An attempt was made to access a socket in a way forbidden by its access permissions 168.63.129.16:32526
```

Note: Port could be **32526** or **80**.

Performing a connectivity test to WireServer on ports 80 or 32526 returns a timeout.

# Troubleshooting

1. Windows Firewall (or another guest 3rd party software) is blocking access to ports **80** and/or **32526**, which is needed for HostGAPlugin
2. Documentation: [What is the IP address 168.63.129.16?](https://blogs.msdn.microsoft.com/mast/2015/05/18/what-is-the-ip-address-168-63-129-16/)

## Step 1: Check Windows Firewall Rules

Check if there is a Windows Firewall rule blocking outbound communication:

```powershell
Get-NetFirewallRule -Enabled True -Direction Outbound -Action Block
```

Save the rules that block any outbound connectivity, open Windows Defender Firewall with Advanced Security and validate if the communication to WireServer (IP 168.63.129.16, TCP ports 32526 and 80) are part of the blocking rule range.

## Step 2: Disable the Blocking Rule

Disable the rule, wait a few minutes and check if the problem is resolved.

If the rule is defined by GPO, customer needs to engage their AD team to adjust it:
```cmd
gpresult /h c:\temp\gpreport.html
```

## Step 3: Check 3rd Party Software

If no Windows Firewall Rule is blocking connectivity, a 3rd party tool might be the blocker.

Follow [How to determine WFP drops WoA](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1198796/How-to-determine-WFP-drops-WoA) to identify the culprit.

Engage Windows on Azure SMEs if further assistance is required: [Azure to Windows Collaboration Workflow](https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/610597/Azure-to-Windows-Collaboration-Workflow_Windows)

**IMPORTANT**: 168.63.129.16 is a virtual IP of the host node and is NOT subject to user defined routes and NSG. Only programs running on the Guest OS can block this communication (NVA or NSG in the data path should be ignored).
