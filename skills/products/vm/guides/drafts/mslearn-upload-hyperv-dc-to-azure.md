# Upload On-Premises Hyper-V Domain Controller to Azure

Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/upload-existing-hyperv-dc-azure-ps)

## Prerequisites
On-premises DC must have these on **separate volumes** from OS disk:
- SYSVOL shared directory
- AD DS database
- AD DS log files

> Warning: OS disk in Azure has Writeback caching — sharing disk with AD DS files causes Jet database inconsistencies.

## Steps

### 1. Prepare On-Premises DC
1. Create Storage account
2. Create Azure VNet with site-to-site VPN
3. Create subnet + define on-premises DNS server on VNet
4. Run `diskpart san policy=onlineall`
5. Set `StopReplicationOnAutoRecovery` = 0 if exists (for DFSR auto-recovery)
6. Set IP and DNS to **Automatic (Dynamic)** before shutdown

### 2. Prepare Host
1. Install latest Azure PowerShell
2. Run `Get-AzurePublishSettingsFile` to get management cert
3. Import `.publishsettings` file

### 3. Upload VHDs
1. Set subscription and storage account
2. Upload OS VHD and Data VHD via `Add-AzureVhd`
3. Register disks via `Add-AzureDisk`
4. Create VM config with `New-AzureVMConfig`, attach data disk, set subnet
5. Deploy with `New-AzureVM`
6. Move page file to Temporary volume after boot

## Key Considerations
- Multi-DC forest: Define DNS server for VNet so DC can locate peers
- Single DC forest: Skip DNS configuration, proceed directly to upload
- Reference: [Safely virtualizing AD DS](/en-us/windows-server/identity/ad-ds/introduction-to-active-directory-domain-services-ad-ds-virtualization-level-100)
