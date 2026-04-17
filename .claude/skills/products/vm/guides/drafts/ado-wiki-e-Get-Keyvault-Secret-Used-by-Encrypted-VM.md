---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:%2FSME%20Topics%2FAzure%20Encryption%2FHow%20Tos%2FAzure%20Disk%20Encryption%20%28ADE%29%2FGet%20Keyvault%20Secret%20Used%20by%20Encrypted%20VM_Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Encryption
- cw.How-To
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::




[[_TOC_]]

## Scenario

When a customer wants to recover an encrypted VHD and should know the secret to download the BEK file and unlock/recover the VHD.

## Windows VM

1.  The encryption settings are exposed in VM Model. Use the following PowerShell commands to get the VM model details which contains the encryption settings for the VM under the StorageProfile.
    
    <span class="small"></span>
    
    ```
        $rgName = "<RESOURCE GROUP>"
        $kvrgName = ‘ToTestEncryption’
        $vmName = "<VM NAME>"
        $KeyVaultName = "<KEY VAULT NAME>"
        $keyvaultkeyname = "<KEY NAME>"
        $location = "<LOCATION>"
         
        Get-AzVM -ResourceGroupName $rgName -Name $vmName -DisplayHint Expand 
    ```

2.  The SecretUrl contains the BEK file name and the version of the secret.<br>
    ![dc24ca9d-ef3f-23e7-8e36-0c6f1636e3bc950px-PS_Script_Capture.jpg](/.attachments/SME-Topics/Azure-Encryption/dc24ca9d-ef3f-23e7-8e36-0c6f1636e3bc950px-PS_Script_Capture.jpg)

3.  The second pull that we can do to narrow down the search if the "Expand" feature does not work from above.
    ```
        $vm = Get-AzVM -ResourceGroupName $rgName -Name $vmName
        $vm.StorageProfile.OsDisk.EncryptionSettings.DiskEncryptionKey.SecretUrl
    ```
    ![d099258e-9029-a828-544f-3cb9ec09afd2SecretUrl-2.jpg](/.attachments/SME-Topics/Azure-Encryption/d099258e-9029-a828-544f-3cb9ec09afd2SecretUrl-2.jpg)

4.  The third way to check is by viewing it in the Keyvault from the portal:

5.  The extension for Windows VMs creates the following Tags for the Secret which makes it easy for us to identify the Secret used by a particular VM.
    
      - MachineName
      - VolumeLetter
    
    Note: These tags are only applicable for Windows VM. For Linux VMs, the extension does not create these tags.<br>
    ![8794da1c-3655-2860-d2d5-cbbeddb20f3f950px-Keyvaultinportal.jpg](/.attachments/SME-Topics/Azure-Encryption/8794da1c-3655-2860-d2d5-cbbeddb20f3f950px-Keyvaultinportal.jpg)<br>
    ![873f10f6-e3e3-4b55-42dc-9919c2f92560950px-Kv2.jpg](/.attachments/SME-Topics/Azure-Encryption/873f10f6-e3e3-4b55-42dc-9919c2f92560950px-Kv2.jpg)<br>
    ![70644ab9-a2ca-475a-6fc7-601f4f0d36e9950px-Kv3.png](/.attachments/SME-Topics/Azure-Encryption/70644ab9-a2ca-475a-6fc7-601f4f0d36e9950px-Kv3.png)

6.  From the Guest OS:
    
    1.  Attach the disk as data disk to another VM. Once attached to the VM, the explorer window will look like the one below. The encrypted drive will have a lock icon.<br>
        ![891621c1-46b6-10f1-0a8d-44cd1b68d1f7960px-Guestos.png](/.attachments/SME-Topics/Azure-Encryption/891621c1-46b6-10f1-0a8d-44cd1b68d1f7960px-Guestos.png)
    
    2.  Open command prompt with administrator privileges and run the following command:
        ```
            manage-bde -protectors -get <volume letter>
        ```
        ![5e62c4de-0aff-a1b2-2294-4e329e8ba5b1960px-Commandprompt.jpg](/.attachments/SME-Topics/Azure-Encryption/5e62c4de-0aff-a1b2-2294-4e329e8ba5b1960px-Commandprompt.jpg)
    
    3.  We could see that this corresponds to the BEK in the Keyvault<br>
        ![f36612b8-0299-d686-f1ce-6e72123f7282960px-Kv4.jpg](/.attachments/SME-Topics/Azure-Encryption/f36612b8-0299-d686-f1ce-6e72123f7282960px-Kv4.jpg)
    
    4.  We can also use the following PowerShell commands to retrieve the secret against the VM name:
        ```
            $rgName = "<RESOURCE GROUP>"
            $kvrgName = ‘ToTestEncryption’
            $vmName = "<VM NAME>"
            $KeyVaultName = "<KEY VAULT NAME>"
            $keyvaultkeyname = "<KEY NAME>"
            $location = "<LOCATION>"
            
            Get-AzKeyVaultSecret -VaultName $keyvaultName | where {($_.Tags.MachineName -eq "$vmName") -and ($_.ContentType -match 'BEK')}
        ```
        ![e1f41363-4fd7-5acf-ec4a-19ba2b5a9153970px-AzureKeyVaultSecret.jpg](/.attachments/SME-Topics/Azure-Encryption/e1f41363-4fd7-5acf-ec4a-19ba2b5a9153970px-AzureKeyVaultSecret.jpg)

### Conclusion

This way we can find which SECRET is being used and then proceed to the next steps to recover the BEK file from the keyvault to unlock the VHD.  


::: template /.templates/Processes/Knowledge-Management/Azure-ADE-Feedback-Template.md
:::
