---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Purge and reinstall the Linux agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Purge%20and%20reinstall%20the%20Linux%20agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
Whenever customers are facing difficulties on a linux agent reinstallation, or even attempting to add a newer version if a previous one is causing issues, purge is the way to achieve this, if a regular uninstallation is faling. This way all data referring to the agent will be fully removed
 
# High level steps
---
- [ ] Confirm agent version
- [ ] Proceed with the purge actions

## Confirm agent version

Make sure to validate what is the current version of the agent you have:

- **For Debian based distro (for for example Ubuntu) machines**: apt list | grep omsagent
- **For other distributions**: rpm -qa | grep oms

![image.png](/.attachments/image-db874aa4-4419-479f-9048-75d6653608cb.png)

## Proceed with the purge actions

_**If the version is different than the one present below, replace the bold sections with the correct one including the version present on the wget link**_

1. Go to portal and uninstall these three extensions (if present) from the Virtual Machine extension blade.
- LinuxDiagnostics
- OMSAgentForLinux

2.  Remove LAD files from the machine if they present.

2.1. First, check these two locations and remove them if they exist: 

_/var/lib/waagent/Microsoft.Azure.Diagnostics.LinuxDiagnostic-<version>/_ 

_/var/opt/microsoft/omsagent/LAD/_

2.2. If you do not find anything, please run the command below to check for any lad packages

Redhat based distro (RedHat, CentOS, Oracle, Fedora + SUSE*):

`rpm -qa | grep lad`

`rpm -qa | grep mdsd`

Debian based distro (Debian, Ubuntu):

`dpkg -l | grep lad`

`dpkg -l | grep mdsd`

![image.png](/.attachments/image-59ec819e-503c-4ea8-9b4a-e33660a060e3.png)

If you see any, please remove them with:

Redhat based distro (RedHat, CentOS, Oracle, Fedora + SUSE*):

`rpm -e package_name`

Debian based distro (Debian, Ubuntu):

`dpkg -r | grep mdsd`


![image.png](/.attachments/image-62535cc8-e114-4623-88ed-c9716f984334.png)

3.  Remove mdsd: 
rpm -e | grep mdsd

    **For Debian based distros:**

    dpkg -r | grep mdsd

    Now, Uninstall the OMS extension from portal to see if it goes away.

4. Run the following commands to get the agent file and purge the agent:

**_wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh**
 
**_chmod +x ./onboard_agent.sh_**
 
**_sudo ./onboard_agent.sh --purge_**


5. Remove OMS Extension from portal and its files from the machine if they are present in the following location: /var/lib/waagent/Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux-<version>    

5.1. Try to find it:

`ls /var/lib/waagent/ | grep -i oms`

![image.png](/.attachments/image-6d538264-7f0c-493b-afeb-6c20aaa697b1.png)

�
5.2. Stop the waagent - otherwise the .xml file will re-appear immediately after you remove it. When the waagent is stopped, some extensions might not work properly, but you will nevertheless restart the waagent back at step 8.

`service walinuxagent stop`

If the above command doesn't work, please try with:

`service waagent stop`

 

5.3. Remove it:

`rm -rf /var/lib/waagent/Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux.9.manifest.xml`

![image.png](/.attachments/image-360164c7-9efe-4e84-98ef-b25238c3fb89.png)


6. After the agent is purged, remove any old versions of the core packages (if they still exist). 

   First, try to find any leftover packages.
``` bash
rpm -qa | grep oms
rpm -qa | grep omi
rpm -qa | grep scx
```

   If they still exist, please remove them:
``` bash
rpm -e <package_name>
```
   You can also remove by using the full package name and version
rpm -qa | grep <package_name>

> <font color="red"> Do not try to remove it with pipes or using any type of grep </font>

![image.png](/.attachments/image-55b3611c-fdde-4f2f-aaa3-96bcf104af90.png)

**For Debian based distros:**
``` bash
dpkg -r <package_name>
```

7. After removing the package, ensure files are removed using commands below.
-  Ensure that the following directories do not have any of the 4 OMS agent related sub-directories. The OMS Agent related sub-directories are **auoms**, **omsagent**, **omsconfig** and **scx**!
 
``` 
ls /etc/opt/microsoft/
```
```
ls /var/opt/microsoft/
```
![image.png](/.attachments/image-7be4e015-2a68-49ee-b45b-f1085149336d.png)

- Other files (related to other agents, such as dependency agent) can be there, no need to remove them:
![image.png](/.attachments/image-fbc3e10e-8585-487b-8950-aae8cedebd22.png)

- If there are OMS files available in the above two paths, then use the following command to delete them:

  rpm -q �filename�

  rpm -e "paste the package"

  rpm -q �filename� -> make sure it was deleted

- ensure that users are deleted :

  cat /etc/passwd | grep -i omsagent

  cat /etc/passwd | grep -i omi

  cat /etc/passwd | grep -i nxautomation

  If they are available then use the following command to delete :
 userdel -r <UserName>

- ensure that groups are deleted :

  cat /etc/group | grep -i omiusers

  cat /etc/group | grep -i omi

  cat /etc/group | grep -i omsagent

  cat /etc/group | grep -i nxautomation

  If they are available then use the following command to delete :
  groupdel <GroupName>

- Check if there is any process that still running :

  ps -ef | grep -i omi | grep -v grep

  ps -ef | grep -i oms | grep -v grep

  If so please kill that process using :
 kill -9 <ProcessID>

8. After removing the OMS agent and related packages, it might be needed to restart the WAAgent for the complete removal of the extension. In extreme cases, you might need to clear the WAAgent cache:

   sudo -i

   service waagent restart

   **For Debian based distros:**

   sudo -i

   service walinuxagent restart

�
9. Once the extension is no longer present on the VM, either wait for A**zure Security Center to provision it (if you have it active)** or **manually connect it to the workspace** (Azure Log Analytics - > Workspace -> Virtual Machines -> VM_name -> Connect).


# References
---
[How to troubleshoot issues with the Log Analytics agent for Linux](https://docs.microsoft.com/azure/azure-monitor/platform/agent-linux-troubleshoot)


