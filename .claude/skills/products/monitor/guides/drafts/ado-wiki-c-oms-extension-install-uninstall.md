---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Extension Installation and Uninstallation issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Extension%20Installation%20and%20Uninstallation%20issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Applies to:
- OMS agent: Extension installation & uninstallation

[[_TOC_]]
#Troubleshooting steps
---
Firstly, you need to know how to [access to ASC(Azure Support Center)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/499768/How-to-open-Azure-Support-Center-from-case-management-systems) and [find a desired resource in ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/503141/How-to-navigate-to-a-resource-in-Azure-Support-Center) to get basic information.

##Log Collection
---
1. Gather messages from VM's Extension tab from ASC

  - ASC>VM>Extensions
    ![Items1.png](/.attachments/Items1-fa42b3f3-c92a-413c-872b-7c9d2e2d6cb6.png)

  - If there is an issue, 'Display status' won't be in 'Ready' and 'Status Message' will give a hint.
    ![Items (1).png](/.attachments/Items%20(1)-cc71afd3-ee05-45a4-9ed6-66febd4142c9.png)


    The message can be retrieved also from portal
- VM>Extensions + applications>Extensions
  ![Items (2).png](/.attachments/Items%20(2)-956cf901-41ed-4b4c-91ba-1a6d17991fbf.png)

2. If the properties are empty, it means extension information is not retrieved via Guest agent.
   Proceed with this scenario
	<details><summary>Unhealthy Guest agent</summary>

	- Make sure Waagent(Guest agent) is running and in ready status([how to access to ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841332/Troubleshooting-OMS-Agent-Install-Uninstall-Extension-based-deployment?anchor=access-to-asc(azure-support-center)))
	  1. ASC>VM>Properties
	  ![Items (16).png](/.attachments/Items%20(16)-160f6e6c-aa8f-4b5f-994c-6ce28a80d91b.png)

	  2. If the status is not ready, start waagent or [install waagent](https://learn.microsoft.com/azure/virtual-machines/extensions/update-linux-agent)
	https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022/Basic-Workflow_AGEX?anchor=linux
	```systemctl start walinuxagent.service```
	or
	```systemctl start waagent.service```

	  3. If the guest agent is still not in ready status, then contact VM team to fix the agent. There might be other issues such as a network issue.
	</details>

>
3. If 'Status Message' contains a meaningful clue, collect data through 
    <details><summary>IaaS disk logs</summary>

    1. ASC>VM>Diagnostics
    ![Items (11).png](/.attachments/Items%20(11)-b5307f24-e419-4717-9e07-850b617c9348.png)

    2. Inspect IaaS Disk>Create report>Diagnostic>Run
    Download the created report
    ![Items (12).png](/.attachments/Items%20(12)-eaafdfca-e2b5-401d-99b6-9cb6731fa3e8.png)

    3. If you unzip the file, you will find extension.log from a path similar to this
    ```
    \joham-redhat6.7-krc-InspectIaaSDisk-2wlakakl.r4s_3b1c387fa5\device_0\var\log\azure\Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux\1.14.23[omsagent version]\extension.log
    ```

    4. extension.log will give you a detailed information about the failure of an installation/uninstallation.
    ```
    2023/03/09 09:07:19 Workspace xxxxxxxx-xxx-xxxx-xxxx-xxxxxxxxxxxx already onboarded and agent is running.
    2023/03/09 09:07:19 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.16] Extension marker file /etc/opt/microsoft/omsagent/xxxxxxxx-xxx-xxxx-xxxx-xxxxxxxxxxxx/conf/.azure_extension_marker already created
    2023/03/09 09:07:24 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.16] Current sequence number 0 is smaller than or egual to the sequence number of the most recent executed configuration, skipping omsagent process restart.
    2023/03/09 09:07:24 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.16] set most recent sequence number to 0
    2023/03/09 09:07:24 Enable succeeded
    2023/03/09 09:07:24 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.16] Enable succeeded
    2023/03/09 09:07:24 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.16] Enable,success,0,Enable succeeded
    ```
    </details>


    <details><summary>Activity log</summary>

      1. ASC>Subscription>Azure Activity Logs([how to access to ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841332/Troubleshooting-OMS-Agent-Install-Uninstall-Extension-based-deployment?anchor=access-to-asc(azure-support-center)))
      ![Items (13).png](/.attachments/Items%20(13)-22a13805-4de6-4a1d-9973-9a47bf1d9aaf.png)
      
      2. Find the activity log installing the extension.
      Copy 'CorrelationId' for detailed query
      ![Items (14).png](/.attachments/Items%20(14)-47a923b0-f577-405c-afbd-d99d5fc93217.png)

      3. From the bottom of the page, there is 'Query Activity logs By CorrelationId'.
      Paste the correlatedId copied from the above.
      The result will give you a hint for the failed installation.
      ![Items (15).png](/.attachments/Items%20(15)-795d14ac-cc54-49f5-a4f1-7feaeb3fe1cb.png)
    </details>

    <details><summary>a command output</summary>

      - When running a command failed, it would return an error message.
        - ex) this message can be generated due to lack of resources in VM such as memory, disk space or etc.
      ```
      (VMExtensionProvisioningTimeout) Provisioning of VM extension OmsAgentForLinux has timed out. Extension provisioning has 
      taken too long to complete. The extension did not report a message.
      More information on troubleshooting is available at https://aka.ms/VMExtensionOMSAgentLinuxTroubleshoot
      ```
    </details>


    <details><summary>manual collection</summary>

    - extension.log
    This will give you detailed message when installing & uninstalling the agent.
    /var/log/azure/Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux/extension.log
    ```
    2023/04/06 15:26:04 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Handler initiating onboarding.
    2023/04/06 15:26:04 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Output:
    2023/04/06 15:26:04 Azure Resource ID updated.
    2023/04/06 15:26:04 Workspace 7d2c6b8b-7b1d-4a40-898f-37993dcc1f01 already onboarded and agent is running.
    2023/04/06 15:26:04 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Extension marker file /etc/opt/microsoft/omsagent/7d2c6b8b-7b1d-4a40-898f-37993dcc1f01/conf/.azure_extension_marker already created
    2023/04/06 15:26:09 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Current sequence number 0 is smaller than or egual to the sequence number of the most recent executed configuration, skipping omsagent process restart.
    2023/04/06 15:26:09 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] set most recent sequence number to 0
    2023/04/06 15:26:09 Enable succeeded
    2023/04/06 15:26:09 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Enable succeeded
    2023/04/06 15:26:09 [Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-1.14.23] Enable,success,0,Enable succeeded
    ```
    </details>

##Installation troubleshooting
---
###Basic installation steps to install omsagent
<details><summary>Basic installation steps</summary>

>
>1. Conncet a virtual machine from portal
>portal>Log analytics workspace>Classic>Virtual machines(deprecated)>select a target vm
>![image.png](/.attachments/image-39606a77-546d-4812-a610-af4828b09ea7.png)
>
>- Click 'Connect' to install omsagent to the vm
>![image.png](/.attachments/image-1eff53ad-f830-40a6-b59d-4447bf110577.png)
>
>2. Install omsagent extension By Azure CLI
```
az vm extension set \
  --resource-group myResourceGroup \
  --vm-name myVM \
  --name OmsAgentForLinux \
  --publisher Microsoft.EnterpriseCloud.Monitoring \
  --protected-settings '{"workspaceKey":"myWorkspaceKey"}' \
  --settings '{"workspaceId":"myWorkspaceId","skipDockerProviderInstall": true}' \
  --version latestVersion
```
>3. Install omsagent extension By Powershell
```
Set-AzVMExtension \
  -ResourceGroupName myResourceGroup \
  -VMName myVM \
  -ExtensionName OmsAgentForLinux \
  -ExtensionType OmsAgentForLinux \
  -Publisher Microsoft.EnterpriseCloud.Monitoring \
  -TypeHandlerVersion latestVersion \
  -ProtectedSettingString '{"workspaceKey":"myWorkspaceKey"}' \
  -SettingString '{"workspaceId":"myWorkspaceId","skipDockerProviderInstall": true}'
```
</details>

---

1. Extension based installation failure scenarios

    <details><summary>Network issue (invalid workspace id)</summary>

      - If the vm cannot reach out to Log analytics workspace endpoints, validation of workspace id is failed.
          ```
          error message:
          Unable to install successfully the OMS Extension. Error: Install failed due to an invalid parameter: Workspace ID is invalid
          ```
     refer to the following wiki to troubleshoot further
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841334/Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment#:~:text=Network%20connection%20issue
    </details>

    <details><summary>Issues with packages(plugins) in omsagent</summary>

    - There are packages supporting omsagent

    |Package|Description|
    |--|--|
    |omsagent   |   The Operations Management Suite Agent for Linux
    |omsconfig  |   Configuration agent for the OMS Agent
    |omi    |   Open Management Infrastructure (OMI) -- a lightweight CIM Server. Note that OMI requires root access to run a |cron job necessary for the functioning of the service
    |scx    |   OMI CIM Providers for operating system performance metrics
    |auoms  |   Microsoft Operations Management Suite Audit Data Collector
    |apache-cimprov |   Apache HTTP Server performance monitoring provider for OMI. Only installed if Apache HTTP Server is detected.
    |mysql-cimprov  |   MySQL Server performance monitoring provider for OMI. Only installed if MySQL/MariaDB server is detected.
    |docker-cimprov |   Docker provider for OMI. Only installed if Docker is detected.

    - This command will show you where the script is located.
       ```find / -name omsagent-*.universal.x64.sh```
       ![image.png](/.attachments/image-70c8cb72-191d-40ed-8408-9a844ec50485.png)

       extract versions of the packages from the script located in the path of the above output.
       ```sudo sh ./omsagent-*.universal.x64.sh --version-check```
       ![image.png](/.attachments/image-fb641972-0331-4d2d-9706-71cd2fa0070d.png)
    - omi
    https://github.com/Microsoft/omi/blob/master/Unix/doc/diagnose-omi-problems.md
       - to get a version of omi currently installed
          ```opt/omi/bin/omiserver -v```
          ![image.png](/.attachments/image-4c57fc65-b9c9-4f85-80d2-797f22fb4557.png)
       - to restart omiagent
          ```sudo /opt/omi/bin/service_control restart```
          or
          ```
          sudo /opt/omi/bin/service_control stop
          sudo /opt/omi/bin/service_control start
          ```
       - to remove omi package manually
          (Debian based distro (Debian, Ubuntu))
          ```dpkg -r | grep omi```
          (Redhat based distro (RedHat, CentOS, Oracle, Fedora + SUSE*))
          ```rpm -e | grep omi```

          make sure no entries left for omi
          ```cat /etc/passwd | grep -i omi``` if exists, then remove by ```userdel -r [UserName]```
          ```cat /etc/group | grep -i omi``` if exists, then remove by ```groupdel [GroupName]```
          ```ps -ef | grep -i omi | grep -v grep``` if exists, then kill by ```kill -9 <ProcessID>```
        - to install omi package manually
          RPM and DEB packages are provided for the installation of OMI on most enterprise Linux distributions. To install OMI, download the correct package for your Linux computer. [Download link](https://github.com/microsoft/omi/releases)
          Choose from:

          - RPM or Debian package format
          - OpenSSL version 1.0.x, 1.1.x or 3.0.x (To determine your OpenSSL version, run: openssl version)
          
          Installation examples:
          Ubuntu 16.04, x64:
          ```sudo dpkg -i ./omi-1.7.0-0.ssl_100.ulinux.x64.deb```

          Red Hat Enterprise Linux, Oracle Linux, or CentOS 6/7, x64:
          ```sudo rpm -Uvh ./omi-1.7.0-0.ssl_100.ulinux.x64.rpm```

          restart omi and omsagent after installing the new omi
          ```/opt/omi/bin/service_control restart```

    - scx(scx version cannot be higher than omi version)
    https://github.com/microsoft/SCXcore
      - to check installed scx version
      ```/opt/microsoft/scx/bin/tools/scxadmin -version``` 
      or 
      ```/opt/omi/bin/omicli ei root/scx SCX_Agent```
      ![image.png](/.attachments/image-08c1673a-07d3-485d-b701-f00dbaccef06.png)

      - to restart scx
        ```
        scxadmin -stop
        scxadmin -start
        ```
      - to remove scx package manually
          (Debian based distro (Debian, Ubuntu))
          ```dpkg -r | grep scx```
          (Redhat based distro (RedHat, CentOS, Oracle, Fedora + SUSE*))
          ```rpm -e | grep scx```

          make sure no entries left for omi
          ```cat /etc/passwd | grep -i scx``` if exists, then remove by ```userdel -r [UserName]```
          ```cat /etc/group | grep -i scx``` if exists, then remove by ```groupdel [GroupName]```
          ```ps -ef | grep -i scx | grep -v grep``` if exists, then kill by ```kill -9 <ProcessID>```
      - to install scx package manually
        RPM and DEB packages are provided for the installation of SCX on most enterprise Linux distributions. To install SCX, download the correct package for your Linux computer. [Download link](https://github.com/microsoft/SCXcore/releases)
        Choose from:

        - RPM or Debian package format
        - OpenSSL version 1.0.x, 1.1.x or 3.0.x. (To determine your OpenSSL version, run: openssl version)

        Installation examples:
        Ubuntu 16.04, x64:
        ```sudo dpkg -i ./scx-1.7.0-0.ssl_100.universal.x64.deb```

        Red Hat Enterprise Linux, Oracle Linux, or CentOS 6/7, x64:
        ```sudo rpm -Uvh ./scx-1.7.0-0.ssl_100.universal.x64.rpm```

        restart omi and omsagent after installing the new scx
          ```/opt/omi/bin/service_control restart```
    </details>

    <details><summary>I'm getting Errno address already in use in omsagent log file</summary>

    https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md#im-getting-errno-address-already-in-use-in-omsagent-log-file
    If you see ```[error]: unexpected error error_class=Errno::EADDRINUSE error=#<Errno::EADDRINUSE: Address already in use - bind(2) for "127.0.0.1" port 25224>``` in omsagent.log, it would mean that Linux Diagnostic extension (LAD) is installed side by side with OMS linux extension, and it is using same port for syslog data collection as omsagent.

    - As root execute the following commands (note that 25224 is an example and it is possible that in your environment you see a different port number used by LAD):
    ```
    /opt/microsoft/omsagent/bin/configure_syslog.sh configure LAD 25229

    sed -i -e 's/25224/25229/' /etc/opt/microsoft/omsagent/LAD/conf/omsagent.d/syslog.conf
    ```
    The user will then have to edit the correct rsyslogd or syslog_ng config file and change the LAD-related configuration to write to port 25229.
    - If the VM is running rsyslogd, the file to be modified is /etc/rsyslog.d/95-omsagent.conf (if it exists, else /etc/rsyslog)
    - If the VM is running syslog_ng, the file to be modified is /etc/syslog-ng/syslog-ng.conf
    - Restart omsagent sudo /opt/microsoft/omsagent/bin/service_control restart
    - Restart syslog service
    </details>

    <details><summary>Portal issue</summary>

    Collect HAR trace
      - When you consider the error message is caused by portal issue
    https://learn.microsoft.com/en-gb/azure/azure-portal/capture-browser-trace

      - Possible issues that can be found by the trace
        - Traffics are blocked by their security policy: 
            security devices including firewall: ex) Zscaler - header can be modified by the device
            browser CORS issue: https://developer.mozilla.org/docs/Web/HTTP/CORS
        - Backend issue (outage due to incident):
            503 gateway error
            check recent incidents from https://iridias.microsoft.com/incidentcentral
            or
            check 'Recently Created Known Issues' https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/504792/Home?anchor=recently-created-known-issues
        - Permission issue:
            403 forbidden error
            check if they allow the following endpoints https://learn.microsoft.com/azure/azure-portal/azure-portal-safelist-urls?tabs=public-cloud#azure-portal-urls-for-proxy-bypass
    </details>

>

2. Sometimes failure of extension installtion may be related to oms agent. Refer to Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment wiki for agent related common scenarios
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841334/Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment

3. If you still have the issue unresolved, escalate the case based on [Escalating to Product Group](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841332/Troubleshooting-OMS-Agent-Install-Uninstall-Extension-based-deployment?anchor=escalating-to-product-group)

##Uninstallation troubleshooting
---

###Basic uninstallation steps to uninstall omsagent extension
<details><summary>Basic uninstallation steps</summary>

>1. Disconncet a virtual machine from portal
>portal>Log analytics workspace>Classic>Virtual machines(deprecated)>select a target vm
>![image.png](/.attachments/image-39606a77-546d-4812-a610-af4828b09ea7.png)
>
>   Click 'Disconnect' to remove omsagent from the vm
>![image.png](/.attachments/image-23ed6007-6e9c-4ffa-a6bc-aa9853d2467b.png)
>
>2. Uninstall from Extension menu in portal
>portal>target Virtual machine>Extension + applications>Extensions>OmsAgentForLinux>Uninstall
>![image.png](/.attachments/image-14b26c14-1f3f-4468-bb07-9e3bef2729c1.png)
>
>
>3. Uninstall omsagent extension by Azure CLI
>```az vm extension delete -g MyResourceGroup --vm-name MyVm -n OmsAgentForLinux```
>
>4. Uninstall omsagent extension by Powershell
>```Remove-AzVMExtension -ResourceGroupName "ResourceGroup11" -Name "ContosoTest" -VMName "OmsAgentForLinux"```
</details>

---



1. Extension based uninstallation failure scenarios
	1-1. Uninstallation from portal can be failed when omsagent is already deleted from the vm.
	   /opt/microsoft/omsagent/bin/service_control does not exist
	![Items (3).png](/.attachments/Items%20(3)-01b69f48-e90d-4cc2-9faf-c8621b04303c.png)
	   /opt/microsoft/omsagent/bin/service_control is not running
	![Items (4).png](/.attachments/Items%20(4)-1cae9440-c8ad-4836-a3f8-da582411838e.png)
	  - Install omsagent manually
	Log analytics workspace>Agents>Linux servers
	![Items (5).png](/.attachments/Items%20(5)-b5580d4e-2967-44b6-a0aa-f1e06d887bb1.png)
	  - Remove the extension from portal
	portal>VM>Extensions + applications>Extension
	![Items (6).png](/.attachments/Items%20(6)-d6a04016-e8ad-4359-bd03-afc68aed603a.png)
	  - Lastly, re-install the extension from portal
	portal>Log analytics workspace>Virtual machines(deprecated)>select the vm>Connect
	![Items (7).png](/.attachments/Items%20(7)-e091b5d8-a933-4c5a-9e2e-1023e501866f.png)
	![Items (8).png](/.attachments/Items%20(8)-ff493dd8-9bb7-4349-b6b1-39bd03dc6f52.png)

	1-2. I'm unable to uninstall omsagent using purge option
	https://github.com/microsoft/OMS-Agent-for-Linux/blob/master/docs/Troubleshooting.md#im-unable-to-uninstall-omsagent-using-purge-option
	Probable Causes
	- Linux diagnostic extension is installed
	- Linux diagnostic extension was installed and uninstalled but you still see an error about omsagent being used by mdsd and can not be removed.

	Resolution
	- Uninstall LAD extension.
	- Remove LAD files from the machine if they present in the following location: ```/var/lib/waagent/Microsoft.Azure.Diagnostics.LinuxDiagnostic-<version>/``` and ```/var/opt/microsoft/omsagent/LAD/```

	Restoring and fixing current agent install:
	Follow these steps to recover from a bad state, like changing/removing important files under /[etc/var]/opt/microsoft/omsagent:

	- Extension Install:
	  - Got to Azure Portal and remove the OMS extension, wait until you successfully remove the extension.
       - Purge the agent manually: wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh && sh onboard_agent.sh --purge
	  - From Azure Portal, install OMS extension again, and you should be able to see the agent successfully installed.
	- Github Install:
	  - Download from Github the same agent version that you have installed, and run upgrade command with --force: sh omsagent*.sh --upgrade --force -w <WORKSPACE_ID> -s <SECRET>.

2. Refer to this wiki to purge in case not matching with the above scenario
[How-to: Purge and reinstall the Linux agent](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605544/How-to-Purge-and-reinstall-the-Linux-agent)

3. If you are still seeing the issue, [escalate the case](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/841334/Troubleshooting-OMS-Agent-Install-Uninstall-manual-deployment?anchor=escalating-to-product-group)

# Known Issues
   [OMS Agent extension status Provisioning failed : Exception: Failed to verify shell bundle with the SHA256 sums file at /var/lib/waagent/Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux](https://supportability.visualstudio.com/AzureMonitor/_workitems/edit/55311) 


#Escalating to Product Group
---
If you still fail to install or uninstall omsagent extension and then you are at a point to reach out to other resources for help.
##Update SAP
Ensure that the Support Topic is coded to Azure/Log Analytics agent (MMA and OMS)/Linux Agents/Linux agent installation and uninstallation issues
Do this to ensure you get the correct template if you need to escalate to the Product Group. 
![Items (9).png](/.attachments/Items%20(9)-cbf59fa7-f8cc-4f36-a646-965dff61a0a9.png)

##Escalate case
Detailed process for PG escalation
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480442/Product-Group-Escalation

Proceed to ASC and utilize the Escalation button at the top right. 
![Items (10).png](/.attachments/Items%20(10)-3cc7935a-108b-4cb8-a4ee-2e4d35a2ac57.png)
You will be given the template automatically but if you are having issues with ASC and need to open an ICM utilize the Manual Template below. You can engage the Escalating to the Azure Log Analytics Agent Product Group directly or you can reach out to your TA / EE for a review before engaging the Product Group. Inform the customer that you are reviewing with a teammate, but do not mention that they are the Product Group or your TA/EE (this is for a customer satisfaction standpoint so they maintain confidence)

Manual Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ci3v1e 

  - Please be ready to detail what you have done up to this point, and that you have gone through this TSG.

  - Ensure that the Log Collector output is still available in DTM.

  - Make sure your case notes are up to date and complete. This will result in a quicker turnaround time to resolution.

  - What if Agent is behind Azure Private Link? Follow https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750398/Azure-Monitor-Private-Link-Troubleshooting

  - Linux level escalation
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/774568/Collaboration-Guide-Azure-Linux-Escalation-Team

#References
---
**Learning materials**
Brownbag list:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605648/BrownBags

**Troubleshooting guides**
Troubleshooting-OMS-Agent-Install-Issues-Missing-Heartbeats: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605654/Troubleshooting-OMS-Agent-Install-Issues-Missing-Heartbeats

Troubleshooting-OMS-Linux-Agent-Missing-Performance-Counters:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605655/Troubleshooting-OMS-Linux-Agent-Missing-Performance-Counters

Troubleshooting-OMS-Linux-Agent-Crash:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605632/Troubleshooting-OMS-Linux-Agent-Crash

Troubleshooting-OMS-Agent-for-Linux-Performance-Issues:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605630/Troubleshooting-OMS-Agent-for-Linux-Performance-Issues

Troubleshooting-omsagent-Hang-Issue:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620164/Troubleshooting-omsagent-Hang-Issue

Troubleshooting-Issues-related-to-high-CPU-or-Memory-consumption-by-OMS-Agent-or-its-subcomponents:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605653/Troubleshooting-Issues-related-to-high-CPU-or-Memory-consumption-by-OMS-Agent-or-its-subcomponents

Troubleshooting-OmsAgent-plugins-issue-for-distros-running-Python3:
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/620169/Troubleshooting-OmsAgent-plugins-issue-for-distros-running-Python3

Required permissions for OS Hardening Customizations
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605657/Required-permissions-for-OS-Hardening-Customizations-Linux-Agent

**Public docs to refer**
Log Analytics agent overview:
https://learn.microsoft.com/azure/azure-monitor/agents/log-analytics-agent

Install the Log Analytics agent on Linux computers:
https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux?tabs=wrapper-script

Log Analytics gateway:
https://learn.microsoft.com/azure/azure-monitor/agents/gateway

agent-linux-troubleshoot:
https://learn.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot