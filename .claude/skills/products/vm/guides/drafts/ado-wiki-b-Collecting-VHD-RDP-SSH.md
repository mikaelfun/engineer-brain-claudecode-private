---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Collecting a VHD_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCollecting%20a%20VHD_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collecting a Customer VHD for Internal Repro (RDP/SSH Troubleshooting)

## Summary

Occasionally, you may be asked to collect a VHD from a customer to share with other teams inside Microsoft for local repro purposes. We have an approved exception from IPG ([11486](https://ipgengagements.visualstudio.com/IPGEngage/_workitems?id=11486)) to use this process.

> **As of Summer 2024:** You can no longer import customer data into non-production subscriptions required to be in the FDPO tenant. Instead, request a new subscription temporarily provisioned on-demand for housing customer data.

## Prerequisites (REQUIRED)

1. Request your subscription: <https://microsoft.sharepoint.com/sites/ManagedEnvironment/SitePages/CSS-Customer-Data.aspx>
   - **This process must be followed for each support case requiring collection of a customer VHD.**
   - PIM access will expire in 4 hours; re-activate via PIM within the SAW as needed.

2. Assign the RBAC role **Storage Blob Data Owner** (or Storage Blob Data Contributor) to your Microsoft account in the new subscription.

3. Find the subscription in Azure Portal (Settings > Production tenant > Production subscription).

4. Modify the Storage Account's `Public network access` firewall to allow access from your network.
   > NOTE: You may need to wait up to 510 minutes for each change to propagate.

The subscription should be deleted once the case is resolved.

## Automatic Method (az CLI)

1. Go to the disk in the Azure Portal.
2. Click on **Disk export**.
3. Change the URL expiry value to `36000`.
4. Click **Generate URL** (do not leave this page until the customer copies the URL).
5. Ask the customer to put the Disk SAS URL in a `.txt` file and upload to DTM. **DO NOT** share the SAS URL through email or Teams.
6. Run the script in Az CLI on your end using Azure Cloud Shell in the production tenant:

```bash
# Set parameters
subid="c42628c8-xxxx-xxxx-xxxx-2826c38b0d44"  # Your MS internal Subscription ID
caseid="2205230060XXXXXX"                       # Case number
region="japaneast"                              # Same region as VM
sasduration="7days"
blobname="$caseid.vhd"
vhdURL="https://md-..blob.storage.azure.net/.../abcd?sv=..."  # Export URL of the Managed Disk

az account set --subscription $subid

# Create resource group
rgname="sr$caseid"
az group create -g $rgname -l $region

# Create storage account
accname=$rgname
az storage account create --kind StorageV2 --sku Standard_LRS -g $rgname -n $accname -l $region --allow-shared-key-access false

# Create container
containername=$accname
az storage container create --account-name $accname -n $containername --auth-mode login

# Start copy
az storage blob copy start --account-name $accname --destination-blob $blobname --destination-container $containername --source-uri $vhdURL --auth-mode login

# Check progress
az storage blob show --account-name $accname -c $containername -n $blobname --auth-mode login | jq '.properties.copy'
```

## Manual Method

### Step 1: Create the Storage Account

1. Create a storage account with name/resource group: `sr` + case number
2. Create a container named after the SR#.
3. Create a User Delegation SAS token (Permissions: Read, Add, Create, Write).

### Step 2: Copy the Disk (Managed Disk)

**Using AzCopy:**
```powershell
azcopy.exe copy "sourceVHDurl" "destinationSASurl" --recursive=true
```

**Using Start-AzStorageBlobCopy (PowerShell):**
```powershell
$mdName = ""        # Managed Disk name
$mdrgname = ""      # Resource Group name
$accessinterval = "3600"
$subscriptionID = ""
$DestStr = ""       # Destination Storage account
$DestStrSAS = ""    # Destination SAS token
$DestContainer = "" # Container name

Login-AzAccount
Select-AzSubscription -SubscriptionId $subscriptionID
$md = Get-AzDisk -DiskName "$mdName" -ResourceGroupName "$mdrgname"
$sasDisk = Grant-AzDiskAccess -DiskName $md.Name -ResourceGroupName $md.ResourceGroupName -Access Read -DurationInSecond $accessinterval
$destContext = New-AzStorageContext -StorageAccountName $DestStr -SasToken $DestStrSAS
Start-AzStorageBlobCopy -AbsoluteUri $sasDisk.AccessSAS -DestBlob "$mdName.vhd" -DestContainer $DestContainer -DestContext $destContext -Force
```

## Downloading the VHD

**Using AzCopy:**
```powershell
# Generate SAS (User delegation key, Read/Add/Create/Write, HTTPS only)
$osDisk = 'https://md-xxxxxxxxxxxxxxxx.blob.storage.azure.net/...'
$destination = "$($HOME)\Downloads"
& $AzCopy cp $osDisk $destination --check-md5 NoCheck
```

**Using Azure Storage Explorer:**
1. Generate a SAS with User delegation key, Read/Add/Create/Write permissions.
2. Connect via Storage Explorer using the Blob SAS URL.
3. Download the VHD. If download fails, disable MD5 check: Edit > Settings > Transfers > Check MD5 > No Check.

## Limitation

> **We are not permitted to return a copy of the customer's VHD back to the customer.** This is a legal compliance limitation under Microsoft policy.

## FAQ Highlights

- **Customer data in FDPO tenant:** Not permitted. Follow [CSS Customer Data](https://microsoft.sharepoint.com/sites/ManagedEnvironment/SitePages/CSS-Customer-Data.aspx).
- **File size limit for DTM:** Use 7-Zip to split into 700MB volumes if needed.
- **Accessing the VHD locally:** Mount via Hyper-V on CORP laptop. Do not give the Hyper-V instance DHCP access.
- **Subscription issues:** Contact [MCAPS Support](https://aka.ms/MCAPSAzureSupport).
