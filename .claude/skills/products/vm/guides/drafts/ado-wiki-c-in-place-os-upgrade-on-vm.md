---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/In Place OS Upgrade on VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/In%20Place%20OS%20Upgrade%20on%20VM_RDP%20SSH"
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

In same scenarios you will have the need of:

1.  Reinstall the same OS on top of the current windows installation. Usually this could happen whenever you have a deep OS corruption and the OS is not working. This approach will be the last resource approach before going to a rebuild
2.  Upgrade the OS of a current VM. Usually the cases starts when the customer was already doing an inplace upgrade and due to the lack of serial console, couldn't complete the inplace upgrade procedure. 
 
 In-place Upgrade of Windows VMs (IaaS) is supported.
  - If upgrading Windows 10 single-session, all editions, all versions follow: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/in-place-system-upgrade
  - If upgrading to Windows Server 2016, 2019, or 2022 follow: https://learn.microsoft.com/en-us/azure/virtual-machines/windows-in-place-upgrade?context=%2ftroubleshoot%2fazure%2fvirtual-machines%2fwindows%2fcontext%2fcontext

### Reference

  - [Troubleshoot a Broken Azure VM using Nested Virtualization in Azure](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495132)
  - [Recovery Script](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496470)
  - [Recreate an ARM Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495137)
  - [Recreate an RDFE Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495139)
  - [KMS Client Keys](https://docs.microsoft.com/en-us/windows-server/get-started/kmsclientkeys)

## Instructions

1.  Attach OS as data disk to another VM using [Nested virtualization](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495132).
2.  Download the ISO with the desired edition of Windows for upgrading.
3.  Mount the ISO you downloaded on the DVD drive of the VM by pointing to the Image file<br>
![11fb7352-2afd-84b6-f2c4-562eed058b72600px-InPlaceUpgrade1.png](/.attachments/SME-Topics/Cant-RDP-SSH/11fb7352-2afd-84b6-f2c4-562eed058b72600px-InPlaceUpgrade1.png)
4.  Connect to the VM and Start the VM. While VM is booting `Press any key to boot from CD or DVD..`<br>
![bba7c772-6f1d-2485-1cc4-fc6c89621929600px-InPlaceUpgrade2.png](/.attachments/SME-Topics/Cant-RDP-SSH/bba7c772-6f1d-2485-1cc4-fc6c89621929600px-InPlaceUpgrade2.png)
5.  Choose `Language to install, Time and currency format, and Keyboard or input method` and then click `Next`<br>
![1aa2275e-60e3-76f1-0e48-02d345eb1ea5600px-InPlaceUpgrade3.png](/.attachments/SME-Topics/Cant-RDP-SSH/1aa2275e-60e3-76f1-0e48-02d345eb1ea5600px-InPlaceUpgrade3.png)
6.  Click `Install now`
7.  If prompted for Product Key use a KMS Client setup key from the following location or choose `I don't have a product key and enter it later`
      - Windows Server 2016 Datacenter Key: `CB7KF-BWN84-R7R2Y-793K2-8XDDG`
      - Windows Server 2016 Standard Key: `WC2BQ-8NRM3-FDDYY-2BFGV-KHKQY`
      - Windows Server 2012R2 Datacenter Key: `W3GGN-FT8W3-Y4M27-J84CP-Q3VJ9`
      - Windows Server 2012R2 Standard Key: `D2N9P-3P6X9-2R39C-7RTCD-MDVJX`
      - Windows Server 2012 Key: `BN3D2-R7TKB-3YPBD-8DRP2-27GG4`
      - Windows Server 2008R2 Datacenter: `74YFP-3QFB3-KQT8W-PMXWJ-7M648`
    <!-- end list -->
    1.  For other setup keys, please refer to [KMS Client Keys](https://docs.microsoft.com/en-us/windows-server/get-started/kmsclientkeys)
8.  Click `I accept` to the License Terms.
9.  Chose which edition of Windows Server to install.<br>
![640e76f3-fd68-4573-0b7a-1bbfb9c020dc600px-InPlaceUpgrade5.png](/.attachments/SME-Topics/Cant-RDP-SSH/640e76f3-fd68-4573-0b7a-1bbfb9c020dc600px-InPlaceUpgrade5.png)<br>
![4d31e392-f3b8-7a38-1c21-7c25883a5f7c600px-InPlaceUpgrade6.png](/.attachments/SME-Topics/Cant-RDP-SSH/4d31e392-f3b8-7a38-1c21-7c25883a5f7c600px-InPlaceUpgrade6.png)
10. Choose `Upgrade: Install Windows and keep files, settings and applications` or `Custom: Install Windows only (advanced)`<br>
![10ad7da9-4640-1bb0-4515-404325de4d63600px-InPlaceUpgrade7.png](/.attachments/SME-Topics/Cant-RDP-SSH/10ad7da9-4640-1bb0-4515-404325de4d63600px-InPlaceUpgrade7.png)
11. On the `Where do you want to install Windows` choose the Drive and Partition that you want to upgrade and click `Next`
12. After clicking next a `Windows Setup` will pop up and choose `OK`<br>
![3e562ea2-bf2a-ee44-8b19-507ebb8c786d600px-InPlaceUpgrade9.png](/.attachments/SME-Topics/Cant-RDP-SSH/3e562ea2-bf2a-ee44-8b19-507ebb8c786d600px-InPlaceUpgrade9.png)
13. Installation will begin. Window will display progress and will restart.<br>
![013627e6-53e0-b514-ca1a-9ce1a57827b2600px-InPlaceUpgrade10.png](/.attachments/SME-Topics/Cant-RDP-SSH/013627e6-53e0-b514-ca1a-9ce1a57827b2600px-InPlaceUpgrade10.png)
14. After the installation has finished, log into the VM and check the `C:` partition. Inside it you will find, besides the `Windows` folder, an additional folder called `Windows.old`. 
<br>This folder contains the <b>OLD</b> OS data that will need to be deleted, whereas the `Windows` folder contains the new OS build. <br>
![windows.old folder](/.attachments/SME-Topics/Cant-RDP-SSH/In-Place-OS-Upgrade-on-VM_window.old.png)
<br>This action is needed to prevent any unwanted rollback that will crash the VM.
<br>You can use Run Command (CMD) with Admin rights to run the below command that will delete the `Windows.old` folder.
  
  <blockquote>DISM /Online /Remove-OSUninstall</blockquote> 

**If you are witnessing with following error message after step 10.**

![Compatibilityreport.png](/.attachments/SME-Topics/Cant-RDP-SSH/Compatibilityreport.png)
1. it’s recommended to boot the machine, Click on the DVD ISO file which is mounted and execute the set-up file.

![setupfile.png](/.attachments/SME-Topics/Cant-RDP-SSH/setupfile.png)

2. Click Install now.
3. If prompted for Product Key use  KMS Client setup **follow step7.**
4. Click I accept to the License Terms.

![Select-image.png](/.attachments/SME-Topics/Cant-RDP-SSH/Select-image.png)

![Getupdate.png](/.attachments/SME-Topics/Cant-RDP-SSH/Getupdate.png)

![Keep-files.png](/.attachments/SME-Topics/Cant-RDP-SSH/Keep-files.png)

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
