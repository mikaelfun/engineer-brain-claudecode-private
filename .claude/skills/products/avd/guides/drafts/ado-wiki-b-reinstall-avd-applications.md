---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Reinstall AVD Applications"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Workflows/Host%20or%20AVD%20Agent/Reinstall%20AVD%20Applications"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

<table style="margin-left:.34in">
  <tr style="background:#ffeeff;color:black">
    <td>
      <p>&#8505; <b>Note</b></p>
Use this ONLY as a last resort, if every other troubleshooting attempt failed. Discuss with an SME before proceeding with reinstalling the AVD Agents if you are unsure.</td>    
  </tr>
</table>

# AVD Classic
1. Login to VM with administrator account

1. Go to Program and Features and remove following. You may see multiple instances, remove all of them
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Remote Desktop Services SxS Network stack

     ![image.png](/.attachments/image-a15ed91d-6418-490d-9bac-410c36ec7c57.png)
 		
1. Login to AVD PowerShell and remove the RDSH from host pool
   ```
   Remove-RdsSessionHost -TenantName <tenant name> -HostPoolName <host pool name> -Name <session host name> -Force
   ```

1. Export Registration Token
   ```
   Export-RdsRegistrationInfo -TenantName <tenant name> -HostPoolName <host pool name> | Select-Object -ExpandProperty Token > <path>
   ```
   - Note: If you get error "Export-RdsRegistrationInfo : RegistrationInfo does not exist for HostPoolName <host pool name>" that means you need to create new registration

      ![image.png](/.attachments/image-402b8956-42a5-4d18-be1f-f2bb00b915cb.png)
 				
1. Create Registration Token: 
   ```
   New-RdsRegistrationInfo -TenantName tenant name> -HostPoolName <host pool name> -ExpirationHours <token expiration in hours> | Select-Object -ExpandProperty Token > 
   <path>
   ```

1. On VM go to [Agent download page](https://learn.microsoft.com/en-us/azure/virtual-desktop/virtual-desktop-fall-2019/create-host-pools-powershell-2019#register-the-virtual-machines-to-the-azure-virtual-desktop-host-pool) and download Azure Virtual Desktop Agent and Azure Virtual Desktop Agent Bootloader.
 	
1. Install the Azure Virtual Desktop Agent.

   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer. When the installer asks you for the registration token, enter the value you got from the Export-RdsRegistrationInfo or New-RdsRegistrationInfo cmdlet.

      ![image.png](/.attachments/image-0bdaf85c-f3e8-465d-b74d-6d6f59f83c50.png)
 	
1. Install the Azure Virtual Desktop Agent Bootloader
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer.
  
1. Verify computer was registered in host pool by running command
   ```
   Get-RdsSessionHost -TenantName <tenant name> -HostPoolName <host pool name>
   ```

# AVD
1. Login to VM with administrator account

1. Go to Program and Features and remove following. You may see multiple instances, remove all of them
   - Remote Desktop Agent Boot Loader
   - Remote Desktop Services Infrastructure Agent
   - Remote Desktop Services Infrastructure Geneva Agent
   - Remote Desktop Services SxS Network stack

     ![image.png](/.attachments/image-a15ed91d-6418-490d-9bac-410c36ec7c57.png)
1. In Azure portal go to Host Pool VM is registered in -> Select Session Hosts
	
1. Click 3 dots next to Session Host to move -> select Remove

   ![image.png](/.attachments/image-4e265ad4-e8d1-44ef-aa2d-86e41bfbff7b.png)

1. Go to overview of hostpool -> click Registration key

   ![image.png](/.attachments/image-6ce00423-532d-4cb5-9c0d-ffc532b929ba.png)
	
1. Select Generate new key -> enter desired expiration date (if key already exists that hasn't expired use it)

   ![image.png](/.attachments/image-3561c85a-c8ee-4da4-b4e6-069dc6f88bb6.png)
	
1. Key will be generated -> copy to clipboard

   ![image.png](/.attachments/image-8460a7e0-2067-43d4-9115-5794de144d27.png)

1. On VM go to [Agent download page](https://learn.microsoft.com/en-us/azure/virtual-desktop/add-session-hosts-host-pool?tabs=portal%2Cgui#register-session-hosts-to-a-host-pool) and download Azure Virtual Desktop Agent and Azure Virtual Desktop Agent Bootloader.
 	
1. Install the Azure Virtual Desktop Agent.

   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer. When the installer asks you for the registration token, enter the value you got from the Export-RdsRegistrationInfo or New-RdsRegistrationInfo cmdlet.

      ![image.png](/.attachments/image-0bdaf85c-f3e8-465d-b74d-6d6f59f83c50.png)
 	
1. Install the Azure Virtual Desktop Agent Bootloader
   - Right-click the downloaded installer, select Properties, select Unblock, then select OK. This will allow your system to trust the installer.
   - Run the installer.

1. Verify computer was registered in host pool
   - In Azure portal should see session host registered in host pool with status available
