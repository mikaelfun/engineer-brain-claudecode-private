---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Mount Encrypted OS Disk in a Nested VM_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-11-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

In this TSG, you will find steps for mounting an encrypted OS in a Nested VM.

## Instructions

1. Spin up a rescue VM with Ds_v3 series or another nested supported size. To ensure the BEK volume is available, the rescue VM must have the disk to be encrypted attached as a data drive during creation. This is the only time the proper BEK volume with the correct BEK file will be attached to the rescue VM.
2. Log in to the rescue VM. In `diskmgmt.msc`, assign the BEK volume a drive letter. Enter the BEK drive and verify the BEK file is within. You should be able to unlock the attached problematic OS disk with the BEK file.
    - Use Disk Manager to assign the BEK volume a drive letter so you can access the BEK file for later commands.
    - **Note:** If the BEK volume is there but the BEK file is missing, reboot the rescue VM. As long as the BEK volume is there, the rescue VM was created correctly, but the file isn't always there in this scenario. Rebooting will get the file there.

    ![diskmgmt](/.attachments/SME-Topics/Azure-Encryption/diskmgmt.png)

    Use `manage-bde -unlock <DRIVE LETTER>: -rk <BEK FILE Path>.BEK`

    Example: `manage-bde -unlock G: -rk <BEK FILE Path>.BEK`

    ![manage-bde.png](/.attachments/SME-Topics/Azure-Encryption/manage-bde.png)

3. After verifying that you can unlock the drive, proceed to installing Hyper-V.
    - For nested virtualization instructions, use [this guide](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshoot-vm-by-use-nested-virtualization).
    - **Note:** Depending on whether it is a V1 or V2 generation VM, the disk attached will be either IDE or SCSI.

4. After Hyper-V is installed, temporarily disable the disk encryption. **Note:** Before swapping the drive back, be sure to re-enable the disk encryption.
    - Go to Disk Management and change the BEK volume disk status to ONLINE.
    - Run the command prompt with Administrator privileges (please substitute your drive, in this example it is the G drive) and run the following commands:
      - Unlock the disk again: `manage-bde -unlock <ENCRYPTED DRIVE LETTER>: -RecoveryKey <.BEK FILE PATH>`
      - Suspend protection using the following command: `manage-bde �protectors �disable <Encrypted DRIVE LETTER>:`

5. In Disk Management, make the disk offline.

    ![diskmanagementofflinedrive](/.attachments/SME-Topics/Azure-Encryption/diskmanagementofflinedrive.png)

6. Go to the Nested Hyper-V console, edit the nested VM settings to ensure the nested VM has the correct hard drive devices on "IDE controller 0":

    ![diskhypervsettings](/.attachments/SME-Topics/Azure-Encryption/diskhypervsettings.png)

    The IDE controller 0 (or SCSI controller) - location 0 should have "physical hard disk", and in the drop-down list, you can find the attached encrypted OS disk with 128G size on LUN0.

7. Start the nested VM. You should see it starting without manually unlocking. If this is the known 5b or 6b issue caused by a Windows update, you can wait to see if it comes up. If it does come up and completes the Windows update, you can swap it back.

8. Once you have corrected the issue in the Nested Hyper-V, stop the Hyper-V instance. We will need to enable disk encryption again (unsuspend).

9. Go to Disk Manager and put the OS disk online.

10. Open a command window as Administrator and run the following command:
     - Resume protection using the following command: `manage-bde �protectors �enable <Encrypted DRIVE LETTER>:`

11. You can now detach the drive and swap it back to the original VM to complete the process.

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
