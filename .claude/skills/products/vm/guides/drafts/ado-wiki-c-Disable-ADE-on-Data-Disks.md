---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Encryption/How Tos/Azure Disk Encryption (ADE)/Disable ADE on Data Disks_Encryption"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Encryption/How%20Tos/Azure%20Disk%20Encryption%20%28ADE%29/Disable%20ADE%20on%20Data%20Disks_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
- cw.Reviewed-01-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Summary
In this TSG, you will see how to disable encryption from the VM disks.

## Instructions for Disabling Encryption on OS Disk and Data Disks (PowerShell)

Pre. Make sure to set session to correct subscription:

```az account set --subscription "Your-Subscription-ID"```

1. Run the following command to disable the encryption:<br>
**Note: Disabling encryption on the OS disk only is not supported for Windows VMs. You will have to disable encryption on both the OS disk and Data disks by using Volume Type ALL.**

    ```powershell
    Disable-AzVMDiskEncryption -ResourceGroupName 'MyVirtualMachineResourceGroup' -VMName 'MySecureVM' -VolumeType "ALL"
    ``` 

    ![disable9.jpg](/.attachments/SME-Topics/Azure-Encryption/disable9.jpg)

2. Run the following command to remove the extension:

    ```powershell
    Remove-AzVMDiskEncryptionExtension -ResourceGroupName "MyResourceGroup" -VMName "MyTestVM"
    ```

    ![disable5.jpg](/.attachments/SME-Topics/Azure-Encryption/disable5.jpg)

3. Validate that the disks are no longer encrypted with ADE.

    ![disable10.jpg](/.attachments/SME-Topics/Azure-Encryption/disable10.jpg)

## Instructions for Disabling Encryption on OS Disk and Data Disks (CLI)

1. Run the following command to disable the encryption:<br>
**Note: Disabling encryption on the OS disk only is not supported for Windows VMs. You will have to disable encryption on both the OS disk and Data disks by using Volume Type ALL.**

    ```bash
    az vm encryption disable --name MyVirtualMachine --resource-group MyResourceGroup --volume-type ALL
    ``` 
    ![disable8.jpg](/.attachments/SME-Topics/Azure-Encryption/disable8.jpg)

2. Run the following command to remove the extension:

    ```bash
    az vm extension delete -g MyResourceGroup --vm-name MyVm -n AzureDiskEncryptionForLinux
    ```

    ![disable7.jpg](/.attachments/SME-Topics/Azure-Encryption/disable7.jpg)

3. Validate that the disks are no longer encrypted with ADE.

    ![disable10.jpg](/.attachments/SME-Topics/Azure-Encryption/disable10.jpg)

## Instructions for Disabling Encryption on Data Disks (Portal)

1. Go to the Azure Portal and select the encrypted VM. Select **Disks**. Then click on **Additional Settings**.

    ![disable1.jpg](/.attachments/SME-Topics/Azure-Encryption/disable1.jpg)

2. In the **Disks to encrypt** combobox, change the option to **None** and click on **Save**.

    ![disable2.jpg](/.attachments/SME-Topics/Azure-Encryption/disable2.jpg)

3. Validate that the Data disk is no longer encrypted with ADE.

    ![disable3.jpg](/.attachments/SME-Topics/Azure-Encryption/disable3.jpg)

## Instructions for Disabling Encryption on Data Disks (PowerShell)

1. Run the following command to disable the encryption:

    ```powershell
    Disable-AzVMDiskEncryption -ResourceGroupName 'MyVirtualMachineResourceGroup' -VMName 'MySecureVM' -VolumeType "Data"
    ``` 

    ![disable4.jpg](/.attachments/SME-Topics/Azure-Encryption/disable4.jpg)

2. Run the following command to remove the extension:

    ```powershell
    Remove-AzVMDiskEncryptionExtension -ResourceGroupName "MyResourceGroup" -VMName "MyTestVM"
    ```

    ![disable5.jpg](/.attachments/SME-Topics/Azure-Encryption/disable5.jpg)

3. Validate that the Data disk is no longer encrypted with ADE.

    ![disable3.jpg](/.attachments/SME-Topics/Azure-Encryption/disable3.jpg)

## Instructions for Disabling Encryption on Data Disks (CLI)

1. Run the following command to disable the encryption:

    ```bash
    az vm encryption disable --name MyVirtualMachine --resource-group MyResourceGroup --volume-type DATA
    ``` 

2. Run the following command to remove the extension:

    ```bash
    az vm extension delete -g MyResourceGroup --vm-name MyVm -n AzureDiskEncryptionForLinux
    ```

    ![disable7.jpg](/.attachments/SME-Topics/Azure-Encryption/disable7.jpg)

3. Validate that the Data disk is no longer encrypted with ADE.

    ![disable3.jpg](/.attachments/SME-Topics/Azure-Encryption/disable3.jpg)

::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::

