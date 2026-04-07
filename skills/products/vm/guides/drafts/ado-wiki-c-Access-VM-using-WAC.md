---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access VM using Windows Admin Center_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20VM%20using%20Windows%20Admin%20Center_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-01-2026
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Summary

Windows Admin Center (WAC) is implemented in the Azure portal as a guest agent extension that can be installed on Azure VMs. This extension connects to an external service that manages certificates and DNS records so that you can easily connect to your VM. This article explains how to use WAC to manage an Azure VM.

Public documentation for WAC is available at:

<http://aka.ms/wacportaldocs>

which redirects to:

<https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/azure/manage-vm>

## LabBox

<https://aka.ms/LabBox>

- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. This lab is not to be shared with customers.

  [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/WindowsAdminCenterBrokenRDP.json)

## WAC Prerequisites

1. VMs running Windows Server 2022, Windows Server 2019, Windows Server 2016, Windows 10, or Windows 11. The WAC extension is **NOT** supported on 2012R2/2012/2008R2 versions of Windows Server.
2. The server should have a minimum of 3 GiB of RAM.
3. It�s required to have an open inbound port (6516) rule for Windows Admin Center to install.
4. It is supported in Azure public cloud and not supported in Azure China, Azure Government, or other non-public clouds.
5. The VM should have booted successfully, and the guest agent must be running.
6. The customer needs to have appropriate access to the VM and credentials to log in to the VM.
7. The user connecting via WAC must be part of the "Windows Admin Center Administrator Login" role assignment.

## Installing WAC in an Azure VM

1. Sign in to the Azure Portal.
2. Type "Virtual machines" and then select "Virtual machines".
3. From the list of VMs, select the VM in which you want to install Windows Admin Center.
4. On the VM menu, navigate to **Windows Admin Center** (found in the Connect group). Note that **Windows Admin Center** will only show up for VMs in the Azure portal if they are running a supported version of Windows (Windows Server 2016 or later). It is expected and by design that **Windows Admin Center** will not show up if the VM is using a guest OS that is not supported by WAC (Windows Server versions prior to Windows Server 2016 - 2012R2, 2012, 2008R2).

![Access_VM_using_Windows_Admin_Center_WAC1.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACinstall-new.png)

5. To optionally provide access to your VM over the public internet from any IP address (convenient for testing but exposes the VM to attack from any host on the internet), you can select 'Open this port for me'. It is recommended to use a private IP address to connect with, or manually creating an inbound port rule will help decrease the traffic so the risk will be lesser.
6. Select Install.
7. Please note that you must be part of the "Windows Admin Center Administrator Login" role assignment to be able to connect - Click on "Access Control (IAM)" and "Add Role Assignment", then assign the role "Windows Admin Center Administrator Login" to your user (or the users connecting to WAC)
8. Once it is installed, you can connect to the Admin Center using the Public or Private IP.

![Access_VM_using_Windows_Admin_Center_WAC2.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACconnect.png)

9. Once you click on 'Connect', you will be prompted to enter the credentials. You will see the below screen after entering the username and password.

![Access_VM_using_Windows_Admin_Center_WAC3.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACoverview.png)

## Using WAC

WAC provides the following management tools:

1. Certificates
2. Devices
3. Events
4. Files and file sharing
5. Firewall
6. Installed apps
7. Local users and groups
8. Performance Monitor
9. PowerShell
10. Processes
11. Registry
12. Remote Desktop
13. Roles and features
14. Scheduled tasks
15. Services
16. Storage
17. Updates

### Remote Desktop

a. Click on Remote Desktop from the left-hand side of the menu page of Windows Admin Center.
b. It will prompt you to enter the username and password, and you will be able to get into the server.

![Access_VM_using_Windows_Admin_Center_WAC4.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACrdpconnect.png)

c. You will see the VM's desktop.
d. The Remote Desktop Services (termservice) service needs to be running.

### Services

You can use WAC to manage Windows services, for example, check service status, restart a service, and check startup type if it is manual or automatic from this section. Let's take an example of the termservice not running.

1. Go to Services under the menu page on the left side.
2. Click on Services, search for termservice from the right top search.
3. Click on the service, and start the service by clicking on start.

![Access_VM_using_Windows_Admin_Center_WAC7.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACservices.png)

### Firewall

This section helps you manage your Windows server firewall. Firewall rules can be added, disabled, and enabled by using this window. Here are the steps:

1. Click on Firewall from the left side.
2. Click on the incoming rules and check for these 3 rules if they are allowing the traffic.

![Access_VM_using_Windows_Admin_Center_WAC8.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACfirewall.png)

### Certificates (Regenerate RDP certificate)

Follow the steps below to regenerate the RDP self-signed certificate:

1. Click on Certificates from the left-hand side, and navigate to Remote Desktop under the Certificates stores.
2. Click on Delete, and the certificate will be deleted.

![Access_VM_using_Windows_Admin_Center_WAC9.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACcertificates.png)

3. You need to restart the RDP configuration service so that the certificate is regenerated.

### PowerShell

In scenarios where the serial console is not working, this helps in running remote commands.

1. Go to PowerShell from the left-hand side and PowerShell will be launched.

![Access_VM_using_Windows_Admin_Center_WAC11.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACpowershell.png)

### Registry

This section is useful for all the work related to registry management, i.e., add, delete, modify, import, and export. This is easier to use than the serial console because of the GUI.

1. Go to Registry from the left-hand side of the page.
2. Navigate to the required path and make the changes required.

![Access_VM_using_Windows_Admin_Center_WAC12.png](/.attachments/SME-Topics/Cant-RDP-SSH/Access_VM_using_Windows_Admin_Center_WACregistry.png)

### Support Boundaries

Azure VM POD supports the guest agent. The guest agent must be healthy for any extension to work, including the WAC extension.

The WAC extension itself and its functionality are supported by the Windows support team.

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::