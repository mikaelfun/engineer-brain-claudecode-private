---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Use Custom Script Extension via PowerShell_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FUse%20Custom%20Script%20Extension%20via%20PowerShell_RDP%20SSH"
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

How to leverage the feature Custom Script Extension through PowerShell if the portal is not an option.

### Reference

  - [Custom Script Extension for Windows using the classic deployment model](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-classic)

## Limitations

1.  This extension will work only if the VM has connectivity
2.  As any other extension, this extension will work if only the Azure Agent is installed and is working as expected
3.  Only the very first time the extension is used, will inject the script to execute. If you use this feature later on, the extension will identified it was already used and will not upload the new script to execute. To avoid this, you will need to ensure the extension is not installed on the VM prior to its use

## Instructions

The below scripts assume and do the following:

  - Refers to a local script file the cx has created on his local machine with contents presumably from this notebook.
  - Copies the script to a storage account of their choice, generating its own container every time.
  - Refers to this uploaded script file to then run the Custom Script Extension

  
**IMPORTANT:** Premium storage accounts cannot be specified as the script file must be uploaded as a block blob and premium storage accounts are only compatible with page blobs.

#### <u>V1 VMs</u>

<span class="small"></span>

```
    #Setup the basic variables
    $subscriptionID = "<<SUBSCRIPTION ID>>" 
    $storageAccount = "<<STORAGE ACCOUNT>>" 
    $localScript = "<<FULL PATH OF THE PS1 FILE TO EXECUTE ON THE VM>>" 
    $blobName = "file.ps1" #Name you want for the blob in the storage
    $vmName = "<<VM NAME>>" 
    $vmCloudService = "<<CLOUD SERVICE>>" #Resource group/Cloud Service where the VM is hosted. I.E.: For "demo305.cloudapp.net" the cloud service is going to be demo305
    
    #Setup the Azure Powershell module and ensure the access to the subscription
    Import-Module Azure
    Add-AzureAccount  #Ensure Login with account associated with subscription ID
    Get-AzureSubscription -SubscriptionId $subscriptionID | Select-AzureSubscription
    
    #Setup the access to the storage account and upload the script
    $storageKey = (Get-AzureStorageKey -StorageAccountName $storageAccount).Primary
    $context = New-AzureStorageContext -StorageAccountName $storageAccount -StorageAccountKey $storageKey
    $container = "cse" + (Get-Date -Format yyyyMMddhhmmss)<
    New-AzureStorageContainer -Name $container -Permission Off -Context $context
    Set-AzureStorageBlobContent -File $localScript -Container $container -Blob $blobName  -Context $context
    
    #Push the script into the VM
    $vm = Get-AzureVM -ServiceName $vmCloudService -Name $vmName
    Set-AzureVMCustomScriptExtension "CustomScriptExtension" -VM $vm -StorageAccountName $storageAccount -StorageAccountKey $storagekey -ContainerName $container -FileName $blobName -Run $blobName | Update-AzureVM
```

#### <u>V2 VMs </u>

<span class="small"></span>

```
    #Setup the basic variables
    $subscriptionID = "<<SUBSCRIPTION ID>>"
    $storageAccount = "<<STORAGE ACCOUNT>>"
    $storageRG = "<<RESOURCE GROUP OF THE STORAGE ACCOUNT>>" 
    $localScript = "<<FULL PATH OF THE PS1 FILE TO EXECUTE ON THE VM>>" 
    $blobName = "file.ps1" #Name you want for blob in storage
    $vmName = "<<VM NAME>>" 
    $vmResourceGroup = "<<RESOURCE GROUP>>"
    $vmLocation = "<<DATACENTER>>" 
     
    #Setup the Azure Powershell module and ensure the access to the subscription
    Import-Module AzureRM
    Login-AzureRmAccount #Ensure Login with account associated with subscription ID
    Get-AzureRmSubscription -SubscriptionId $subscriptionID | Select-AzureRmSubscription
    
    #Setup the access to the storage account and upload the script 
    $storageKey = (Get-AzureRmStorageAccountKey -ResourceGroupName $storageRG -Name $storageAccount).Value[0]
    $context = New-AzureStorageContext -StorageAccountName $storageAccount -StorageAccountKey $storageKey
    $container = "cse" + (Get-Date -Format yyyyMMddhhmmss)
    New-AzureStorageContainer -Name $container -Permission Off -Context $context
    Set-AzureStorageBlobContent -File $localScript -Container $container -Blob $blobName  -Context $context
    
    #Push the script into the VM
    Set-AzureRmVMCustomScriptExtension -Name "CustomScriptExtension" -ResourceGroupName $vmResourceGroup -VMName $vmName -Location $vmLocation -StorageAccountName $storageAccount -StorageAccountKey $storagekey -ContainerName $container -FileName $blobName -Run $blobName
```


::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
