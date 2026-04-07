---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/Workflows/Guest Agent Workflow_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FWorkflows%2FGuest%20Agent%20Workflow_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AGEX
- cw.Workflow
- cw.Reviewed-02-2026
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Short URL

https://aka.ms/agexGAadvanced

## Guest Agent Workflow

Welcome to the **Guest Agent Advanced Workflow!** This workflow will help you troubleshoot advanced issues with the Guest Agent in IaaS VMs.

We recommend running the Basic TSG first. If you haven't done so, please visit the [AGEX Basic TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022).

Below is the workflow for the **GA Advanced Workflow**:

:::mermaid
graph TD
    start[VM Guest Agent Workflow]-->A([If possible, use Inspect IaaS Disk to collect logs,<br> otherwise gather them manually from the customer.<br> Click this node to open the Collect Guest Logs article for more information])
    A-->D[Which Operating System?]
    D--Windows-->W1[If possible, use Inspect IaaS Disk<br> and WinGuestAnalyer to check<br> for known issues and solutions]
    W1-->W2[Usually the helpful logs for Windows GA are:<br>C:\WindowsAzure\Logs\WaAppAgent.log<br>C:\WindowsAzure\Logs\TransparentInstaller.log]
    W2-->E[Verify the GA is running at or above the minimum supported version]
    D--Linux-->L1(["Check to see if they are using a Forked Guest Agent.<br>Please note this is not very common unless the VM is a Network Virtual Appliance (NVA)<br>Click this node for more information"])
    L1-->L2[Usually the helpful logs for Linux GA is:<br>/var/log/waagent.log]
    L2-->E
    E-->F([Analyze the logs to check for documented issues<br> Click here to go to the Guest Agent TSG folder])
    F-->G[Ensure the GA is able to communicate with the Wireserver]
    G-->H[Were you able to solve the issue?]
    H--No-->I([Click here to go the Agent & Extensions<br>SME channel to ask for help])
    H--Yes-->J[Resolve case]

click A "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495009";
click F "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/554375";
click I "https://wikiredirectorendpoint.azurewebsites.net/api/wikiredirecting?url=https://teams.microsoft.com/l/channel/19%3a2b25cbf5775c48a0a5ea8ebf52d4a7ab%40thread.tacv2/MGMT%2520-%2520Agent%2520and%2520Extensions%2520(AVA)?groupId=55f6a42a-c262-4937-bf2d-d290d7037af3&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47";
click L1 "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494976";

classDef clickable fill:#ffffff,color:#0f2080;
:::


## Collect Guest Logs

The first thing to do is collect guest logs. The most common way is via Inspect IaaS Disk in the [Azure Support Center](https://azuresupportcenter.msftcloudes.com/), but there are multiple methods you can use. All are explained in detail here: [Guest Logs Collection TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495009).

Once you have collected logs, proceed to either the Windows or Linux section below, depending on the OS of the VM you are troubleshooting.

### Windows

For Windows VMs, ASC Resource Explorer has a feature called WinGuestAnalyzer to automatically collect and parse the guest logs. It's described in the [Guest Logs Collection TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495009/Log-Collection_AGEX-How-To?anchor=winguestanalyzer). Always open that report and check for findings. If one of the findings matches the issue, apply the mitigation and check if it resolves the issue. If not, you might have to look into the guest logs yourself.

Here are the most commonly useful logs for troubleshooting the Windows Azure Guest Agent:

- `C:\WindowsAzure\Logs\WaAppAgent.log`
- `C:\WindowsAzure\Logs\TransparentInstaller.log`

Open them with Visual Studio Code and search for warnings or errors at the time of the issue, or go directly to the end to search for why the Guest Agent is failing.

Check for when the Guest Agent was started or stopped by searching for the string `"WindowsAzureGuestAgent st"`, for example:

```
[07/11/2019 21:04:07.05] [INFO]  WindowsAzureGuestAgent starting. Version 2.7.41491.911
```

Take note of the version that is running.

Check if the WireServer connectivity is working, for example:

```
[07/11/2019 21:04:19.62] [INFO]  Try to fetch identity data of the VM from metadata server at http://169.254.169.254/Microsoft.Compute/identity.
[07/11/2019 21:04:29.86] [INFO]  Initializing ControlSystem.
[07/11/2019 21:04:30.13] [INFO]  Attempting to discover fabric address on interface Local Area Connection 3.
[07/11/2019 21:04:40.25] [INFO]  Discovered fabric address on interface Local Area Connection 3.
[07/11/2019 21:04:40.25] [INFO]  Using fabric address 168.63.129.16 from DHCP.
[07/11/2019 21:04:40.25] [INFO]  Using fabric URI http://168.63.129.16/.
[07/11/2019 21:04:40.61] [INFO]  ControlSystem initialized with version 2012-11-30.
```

If you spot an error and don't know what it means, go to the step **"Check for known issues with Guest Agent"** to see if it's a known one.

### Linux

For Linux VMs, the Linux Agent logs almost everything in:

- `/var/log/waagent.log`

Open that file with Notepad or VS Code and search for warnings or errors at the time of the issue, or go directly to the end to search for why the Guest Agent is failing.

Check for when the Guest Agent was started or stopped by searching for the string `"Azure Linux Agent Version"`, for example:

```
2019/10/31 14:10:25.203983 INFO Daemon Agent WALinuxAgent-2.2.40 forwarding signal 15 to WALinuxAgent-2.2.44
2019/10/31 14:10:43.788009 INFO Daemon Azure Linux Agent Version:2.2.40
2019/10/31 14:10:43.802092 INFO Daemon OS: ubuntu 18.04
2019/10/31 14:10:43.806403 INFO Daemon Python: 3.6.8
```

Check if the WireServer connectivity is working, for example:

```
2019/10/31 14:10:44.653792 INFO ExtHandler Test for route to 168.63.129.16
2019/10/31 14:10:44.658255 INFO ExtHandler Route to 168.63.129.16 exists
2019/10/31 14:10:44.662707 INFO ExtHandler Wire server endpoint:168.63.129.16
2019/10/31 14:10:44.680614 INFO ExtHandler Fabric preferred wire protocol version:2015-04-05
2019/10/31 14:10:44.689325 INFO ExtHandler Wire protocol version:2012-11-30
2019/10/31 14:10:44.695500 INFO ExtHandler Server preferred version:2015-04-05
2019/10/31 14:10:44.992568 INFO ExtHandler Found private key matching thumbprint 8AD8AB433276753A464631622066C00DE723560D
2019/10/31 14:10:45.019225 INFO ExtHandler Start env monitor service.
2019/10/31 14:10:45.030064 INFO ExtHandler Configure routes
2019/10/31 14:10:45.040869 INFO ExtHandler Gateway:None
2019/10/31 14:10:45.045654 INFO ExtHandler Routes:None
2019/10/31 14:10:45.087680 INFO ExtHandler Wire server endpoint:168.63.129.16


```

If you spot an error and don't know what it means, go to the step **"Check for known issues with Guest Agent"** to see if it's a known one.

Run a connnectivity test to WireServer on ports 80 and 32526:

```
~# sudo nc -v 168.63.129.16 80
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Connected to 168.63.129.16:80.

~# sudo nc -v 168.63.129.16 32526
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Connected to 168.63.129.16:32526.

```
NOTE: You have to run this test as root because connectivity to WireServer as non-root users are blocked by design in Linux VMs.

If the commands above are timing out, proceed with [Connectivity to WireServer is blocked in Linux VMs_AGEX](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2418377/Connectivity-to-WireServer-is-blocked-in-Linux-VMs_AGEX)


Take note of the version that is running. In some cases, you might see two different versions mentioned in the `waagent.log`, for example:

```
2018/09/26 09:55:51.888411 INFO Agent WALinuxAgent-2.2.18 forwarding signal 15 to WALinuxAgent-2.2.31
```

In that case:

- `waagent 2.2.18` is the *provisioning* instance of the agent. It is built into the image by the distribution maker (Canonical, RedHat, etc.) and is only updated by the distro maker providing an update through their repo. This instance of the agent never updates itself. The only generally supported mechanism for updating this agent is through the usual package management tools (`rpm`, `yum`, `apt`) updating the waagent package to a newer version published by the distro maker in the repo they control. The agent team strongly recommends customers do **not** attempt to install a newer version of the agent directly from the published agent code in GitHub; there are a lot of ways to cause issues.
- `waagent 2.2.31` is the *extension management* instance of the agent; it coordinates installation, startup, shutdown, removal, and status reporting of VM compute extensions. Recent versions of this agent (roughly 2.2.18 and newer) will self-update as Microsoft releases new versions of the agent. As long as the customer's distro has a reasonably recent version of waagent as the provisioning agent, the extension management agent will always be the most recently published by Microsoft.

**Note:** Also see the [WALinuxAgent FAQ](https://github.com/Azure/WALinuxAgent/wiki/FAQ).

See [how to read guest agent logs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495567) for a more in-depth description about reading Linux guest logs.

Other common log files that can be helpful to look through:

- `/var/lib/waagent/*.xml`
- `/var/log/waagent.log`
- `/var/log/azure/*`
- Linux OS Version (`cat /etc/*-release`) output
#### Check for a Forked Linux Agent

The Linux Guest Agent is open source, so it is possible for an image provider to create and/or install a customized or "forked" version of the Linux Guest Agent. This is uncommon, but more likely on Network Virtual Appliances (NVAs), where the entire OS is extensively customized. If it is confirmed to be a forked GA, our ability to assist is very limited, and the customer may need to contact the image provider for guidance.

Some common signs of a forked agent are:
- The VM is an NVA. Common NVA vendors include, but are not limited to, Fortinet, Barracuda, Kemp, Palo Alto, and Cisco.
- Guest Agent logs are not in their expected locations.
- SSH is disabled on the image, or there is limited access to the shell or file system.
- The Guest Agent version is _very_ outdated.

More information can be found in the [Forked GA article](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494976).

## Check for the Latest Guest Agent Version and Upgrade

The Guest Agent has an auto-update capability that allows it to check for and apply newer versions. However, auto-update behavior depends on how the VM is configured. Some VMs require a VM-level operation (such as extension install, update, or reapply) to trigger the Guest Agent self-update. Platform-triggered automatic updates are not yet enabled for all VMs.

Check here to see whether a version is supported: https://support.microsoft.com/en-us/help/4049215/extensions-and-virtual-machine-agent-minimum-version-support. If the version is below the currently supported minimum, continue to the next section to update the Guest Agent.

### Windows

If auto-update does not work, for **Windows** Guest Agent, you can find the MSI for the latest version at https://github.com/Azure/WindowsVMAgent/releases. Use a command like the following to install it and capture the MSI install logs:

```shell
msiexec.exe /i c:\VMAgentMSI\WindowsAzureVmAgent.2.7.<version>.fre.msi /quiet /L*v c:\VMAgentMSI\msiexec.log
```

In rare cases where the Guest Agent does not install properly, you can attempt the [Install VM Agent Offline](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/install-vm-agent-offline) method.

To follow the latest changes, refer to the [CHANGELOG](https://msazure.visualstudio.com/One/_git/Compute-IaaS-VMAgent?path=%2FCHANGELOG.md).

If the Guest Agent does not upgrade automatically after a new version is released, triggering a VM operation (for example, reapplying an existing extension) may initiate the Guest Agent self-update.

### Linux

For the **Linux** Agent, all WALinuxAgent releases are listed at https://github.com/Azure/WALinuxAgent/releases.
- **Pre-release:** Initially marked 'Pre-release' (not the same as preview) on GitHub. 'Pre-release' becomes 'Latest release' after propagation to all production regions.
- **Release deployment status:** Refer to https://msazure.visualstudio.com/One/_wiki/wikis/One.wiki/6876/WALinuxAgent.

Instructions for upgrading the agent, depending on the distro, are here: https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/update-linux-agent.

To check the WALinuxAgent version on a Linux VM, you might see two different versions, for example:

```
2018/09/26 08:52:28 [Microsoft.Azure.Diagnostics.LinuxDiagnostic-3.0.115] Change log file to /var/log/azure/Microsoft.Azure.Diagnostics.LinuxDiagnostic/3.0.115/extension.log
2018/09/26 09:55:51.888411 INFO Agent WALinuxAgent-2.2.18 forwarding signal 15 to WALinuxAgent-2.2.31
```

Here's the explanation:
- `waagent 2.2.18` is the **provisioning** instance of the agent. It is built into the image by the distribution maker (Canonical, RedHat, etc.) and is only updated by the distro maker through their repo. This instance never updates itself. The only supported way to update this agent is via the usual package management tools (`rpm`, `yum`, `apt`) with a newer version published by the distro maker. The agent team strongly recommends customers do **not** attempt to install a newer version directly from GitHub.
- `waagent 2.2.31` is the **extension management** instance of the agent; it manages installation, startup, shutdown, removal, and status reporting of VM compute extensions. Recent versions (roughly 2.2.18 and newer) will self-update as Microsoft releases new versions. As long as the provisioning agent is reasonably recent, the extension management agent will always be the latest published by Microsoft.

If you need to debug WALinuxAgent (e.g., if it's stuck and you need a call stack), follow this TSG: [Get Linux Agent call stack](https://microsoft.sharepoint.com/teams/ComputeVM/_layouts/15/Doc.aspx?sourcedoc={4ae3eb4b-d82b-4fd3-a02d-49c472cc91ba}&action=edit&wd=target%28LiveSite-Howto.one%7C3b7ba43c-f36c-43f3-a79d-0e393c7c60ed%2FGet%20Linux%20Agent%20call%20stack%7Cfcca2f58-8a2f-4a01-94bc-fc0d780f35da%2F%29).

## Known Issues with Guest Agent

After analyzing the log files and finding any relevant error messages, refer to the [GA TSGs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/554375/GA) for a list of identifiable problems and their solutions.

If you don't find your error there, proceed to the next step.

## Check for WireServer Issues on the Host

If you're not familiar with the WireServer component, see [WireServer Architecture](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494982).

The Guest Agent relies on connectivity with the host's WireServer to report its status, telemetry, and other information. If connectivity is disrupted or the host's WireServer is unhealthy, the Guest Agent may report as NotReady.

To check for WireServer issues, you need to collect [Host Logs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494974).

Look in the WireServer folder for at least two types of files:

- `WireMarshal_<datetime>.log` � Indicates the health of the WireServer process. If this file is missing, the WireServer process may be down.
- `REST_<datetime>.log` � Contains all requests from Guest VMs. Search this log using the DIP (PA IP) of the guest VM. Review requests (GoalState, Versions, Health, etc.) and their associated responses.

Example:
```
[2019/10/09, 07:32:42.651,  INFO, 00011280] Received request from Client Id = '169.254.13.226:53134' To = '10.250.2.151:80'. Request Id = 681250
[2019/10/09, 07:32:42.651,  INFO, 00011280] Request type = 'GoalState'. Request Id = 681250
[2019/10/09, 07:32:42.651,  INFO, 00011280] Request 681250 processing complete. Http response status code = 200
```

You can match requests from the Guest VM (found in `WaAppAgent.log` or `TransparentInstaller.log`) with what the host's WireServer received. You can also search using the ContainerID, as IMDS requests use this identifier.

If WireServer issues are detected, suggest the customer use the **Redeploy** button in the Azure portal to move the VM to a new host.

**RCA for Transient WireServer Issues on the Host**  
*Please validate with your TA or an EEE before delivering. Fill in `<VirtualMachine>` and `<TimeStamp>` with the correct information:*

```
Customer RCA

We identified that your VM <VirtualMachine> failed to start as expected and was service healed at <TimeStamp> (UTC). The host node where your VM was running was affected by a recently identified platform bug. Our core platform engineers are working on a fix, which will be deployed after testing and verification. 
Because this issue occurred during the OS setup phase, the only solution is to recreate the VM.
We are continuously working to improve the platform and apologize for any inconvenience this may have caused.

Regards,
Microsoft Azure Team
Privacy Statement
```

If you see requests leaving the Guest VM but not arriving at the host, or if the host replies but the Guest doesn't receive the response, there may be connectivity issues between the Guest and Host.

Investigate for firewalls, proxies, NSGs, or other configurations blocking IP `168.63.129.16`. Also check for ExpressRoute, forced tunneling, or user-defined routes.

You can collect a network trace or packet capture (using Wireshark, NETSH, TCPDump, etc.) to further analyze HTTP communication.

At this stage, it's recommended to engage your TA or the **Azure Networking POD**.

## Engage the Agents & Extensions SMEs

If you've followed all steps in this article, haven't found any relevant [known GA issues](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495008), and the problem persists, please post on the [AGEX SME Ava channel](https://wikiredirectorendpoint.azurewebsites.net/api/wikiredirecting?url=https://teams.microsoft.com/l/channel/19%3a2b25cbf5775c48a0a5ea8ebf52d4a7ab%40thread.tacv2/MGMT%2520-%2520Agent%2520and%2520Extensions%2520(AVA)?groupId=55f6a42a-c262-4937-bf2d-d290d7037af3&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47). See [how to use Ava](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496458/How-To-Use-Ava_Tool?anchor=when-asking-a-question) if needed.

### IcM

After approval from your TA or an SME, you can open an IcM by following the [EEE CRI Process](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494892).

If the case is eligible for Sev1/Sev2 and the customer is blocked, engage the [VCPE Team Process](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2113626/Engage-VCPE-Team_Process).

For Sev3/Sev4, open an IcM with **EEE GA/PA** (Service = Support / Team = EEE GA/PA).

Please use [this template](https://aka.ms/CRI-GAPA) and fill it out so all required information is included.

::: template /.templates/Processes/Knowledge-Management/AGEX-Feedback-Template.md
:::
