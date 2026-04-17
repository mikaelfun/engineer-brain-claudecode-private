---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FExpand%20Encrypted%20OS%20Disk%20Partition%20in%20Windows_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-09-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

In this TSG you will find steps for expanding an encrypted OS disk in Windows.

# LabBox
 https://aka.ms/LabBox

- For the purpose of training or following along with this TSG, you can use the following link to deploy a VM with this scenario built-in. You will need to enable JIT for the VM. This lab is not to be shared with customers.

    [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Encryption/adeConnectivity.json)

## Instructions

1.	Make a backup of the VM OS disk.
2.	Deallocate the VM from Azure portal and expand the OS disk size. Then start it.
3.	Login to the VM. In Disk Management tool, assign a driver letter to the reserved partition that is 350 MB. For example, you can assign drive letter H: to it.

    [![cdlp](/.attachments/SME-Topics/Azure-Encryption/cdlp.jpg)](/.attachments/SME-Topics/Azure-Encryption/cdlp.jpg)

    [![adlp](/.attachments/SME-Topics/Azure-Encryption/adlp.jpg)](/.attachments/SME-Topics/Azure-Encryption/adlp.jpg)

4.	Add the free space into H: drive, *but leave at least 200 MB in the right end of the disk:*

    [![extendvol1](/.attachments/SME-Topics/Azure-Encryption/extendvol1.jpg)](/.attachments/SME-Topics/Azure-Encryption/extendvol1.jpg)

    [![extendwizard](/.attachments/SME-Topics/Azure-Encryption/extendwizard.jpg)](/.attachments/SME-Topics/Azure-Encryption/extendwizard.jpg)

    The disk partition layout will look like this after this step:

    [![partitionafter.jpg](/.attachments/SME-Topics/Azure-Encryption/partitionafter.jpg)](/.attachments/SME-Topics/Azure-Encryption/partitionafter.jpg)

5.	Create a new volume in the last unallocated partition and assign drive letter G: to it.

    [![newvol](/.attachments/SME-Topics/Azure-Encryption/newvol.jpg)](/.attachments/SME-Topics/Azure-Encryption/newvol.jpg)

    [![newvolwizard](/.attachments/SME-Topics/Azure-Encryption/newvolwizard.jpg)](/.attachments/SME-Topics/Azure-Encryption/newvolwizard.jpg)

    [![newvolwizard2](/.attachments/SME-Topics/Azure-Encryption/newvolwizard2.jpg)](/.attachments/SME-Topics/Azure-Encryption/newvolwizard2.jpg)

    [![newvolwizard3](/.attachments/SME-Topics/Azure-Encryption/newvolwizard3.jpg)](/.attachments/SME-Topics/Azure-Encryption/newvolwizard3.jpg)

6.	Open CMD and run the following command to create a new set of boot files from C:\windows into G: drive:
bcdboot C:\windows /s G:

7.	Open regedit, select HKEY_LOCAL_MACHINE\BCD00000000, then unload hive.

    [![regedit](/.attachments/SME-Topics/Azure-Encryption/regedit.jpg)](/.attachments/SME-Topics/Azure-Encryption/regedit.jpg)

    [![unloadhive](/.attachments/SME-Topics/Azure-Encryption/unloadhive.jpg)](/.attachments/SME-Topics/Azure-Encryption/unloadhive.jpg)

8.	Copy the current bcd file from H:\boot to replace G:\boot:     
(we do this because the BCD file created by step 6 does not contain the Azure specific configurations.) if you don’t want to do the copy, at least follow the
“Set the Boot Configuration Data (BCD) settings” part in https://docs.microsoft.com/en-us/azure/virtual-machines/windows/prepare-for-upload-vhd-image
 
    [![rujin](/.attachments/SME-Topics/Azure-Encryption/rujin.jpg)](/.attachments/SME-Topics/Azure-Encryption/rujin.jpg)

9.	Run the following command to change boot manager guid from H:\ to G:
    ```
    C:\Users\rujin>bcdedit /store G:\boot\bcd /enum /v
     
    Windows Boot Manager
    --------------------
    identifier              {9dea862c-5cdd-4e70-acc1-f32b344d4795}  <<<<<
    device                  partition=H:
    description             Windows Boot Manager
    locale                  en-us
    inherit                 {7ea2e1ac-2e61-4728-aaa3-896d9d0a9f0e}
    displayorder            {05d0826e-19a2-4380-968f-4b45f971812d}
    toolsdisplayorder       {b2721d73-1db4-4c62-bf78-c548a880142d}
    timeout                 30
    …………..
    ```
    ```
    bcdedit /store G:\boot\bcd /set {9dea862c-5cdd-4e70-acc1-f32b344d4795} device partition=G:
    ```

10.	In Disk Management, right click G:\, select “mark partition as active” and Click Yes to confirm.
11.	Restart the VM.
12.	Log in VM again. In disk management, delete the H: partition and click Yes to confirm:

    [![delvol](/.attachments/SME-Topics/Azure-Encryption/delvol.jpg)](/.attachments/SME-Topics/Azure-Encryption/delvol.jpg)

13.	Then expand C drive with the free space:
 
    [![extendvol2](/.attachments/SME-Topics/Azure-Encryption/extendvol2.jpg)](/.attachments/SME-Topics/Azure-Encryption/extendvol2.jpg)



::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
