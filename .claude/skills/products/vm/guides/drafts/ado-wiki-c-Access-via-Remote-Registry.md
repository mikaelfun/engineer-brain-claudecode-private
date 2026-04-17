---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access via Remote Registry_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20via%20Remote%20Registry_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

When the Azure Virtual Machine has connectivity within the same VNET, there's another way of access directly to the registry that VM is running and perform changes if any of the other components such as RDP is not working.

## Prerequisite

  - Adding TCP ports 135 and 445 at NSG level from Azure Portal with the priority to allow the connection.

  ![port135port445.png](/.attachments/SME-Topics/Cant-RDP-SSH/port135port445.png)

 Even if our customer is or is not aware if they have firewall enabled at the Guest OS level, we need to check the following:�
- existing firewall state�
- firewall settings regarding the 135 and 445 ports�
- the Remote Registry Service must not be disabled 

We can check the current firewall state using Serial Console with the following command: <i>netsh firewall show state</i>

Serial Console cmd commands to check ports 135 and 445:
<span�class="small"></span>
```
netstat -ano | findstr LISTENING | findstr 135
netstat -ano | findstr LISTENING | findstr 445�
```
We can also perform a telnet connection to port 135/445 to check the connectivity.�

If the ports are not listening, we can enable them at the Guest OS level using cmd with the following commands:
<span�class="small"></span>
```
netsh advfirewall firewall add rule name="allowTCP445" dir=in action=allow protocol=TCP localport=445
netsh advfirewall firewall add rule name="allowTCP135" dir=in action=allow protocol=TCP localport=135�
```

Serial Console Powershell commands:
<span�class="small"></span>
```
New-NetFirewallRule -DisplayName "Allow Ping ICMPv4 Outbound" -Direction Outbound -Protocol ICMPv4 -Action Allow
New-NetFirewallRule -DisplayName "Allow Ping ICMPv4 Inbound" -Direction Inbound -Protocol ICMPv4 -Action Allow
```
We can check the status of the Remote Registry service using Serial Console with the following command: <i>sc query "RemoteRegistry" | findstr /i "STATE"</i>

If the service is disabled, we can enable them at the Guest OS level using cmd with the following commands:
<span�class="small"></span>
```
sc config RemoteRegistry start= auto
net start RemoteRegistry
```

## Instructions

If you have access to the problematic VM's registry remotely, this saves significant time compared to having to delete/recreate VM and attaching/detaching disks to troubleshoot.

1.  From another VM on the same VNET open the registry editor **regedit**
2.  Select **File\\Connect Network Registry**<br>
    ![35f3610a-da77-20ab-0f51-a0c08fc2ed50Hive1.png](/.attachments/SME-Topics/Cant-RDP-SSH/35f3610a-da77-20ab-0f51-a0c08fc2ed50Hive1.png)
3.  Look for the problem VM by **hostname** or **DIP** (preferably)<br>
    ![20f40e10-1689-3f5f-9e49-6047ec9a0aa2Hive2.png](/.attachments/SME-Topics/Cant-RDP-SSH/20f40e10-1689-3f5f-9e49-6047ec9a0aa2Hive2.png)
4.  Input credentials for the remote, problem VM and make necessary registry changes
5.  Restart the problematic VM to have the registry changes take effect if necessary.
    **Note:**If the changes that you performed were related to an application, restarting the application will take that configuration.


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::