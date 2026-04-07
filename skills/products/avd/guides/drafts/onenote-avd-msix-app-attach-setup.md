# MSIX App Attach Setup Guide (AVD)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / MSIX app attach
> Status: draft

## Prerequisites
- AD DS environment (Azure AD DS is NOT supported for MSIX app attach)
- Azure Files share with AD DS authentication
- Self-signed or trusted code signing certificate

## Steps

### 1. Set Up MSIX Packaging Environment
- Follow [MSIX packaging tool quick-create VM](https://docs.microsoft.com/en-us/windows/msix/packaging-tool/quick-create-vm)

### 2. Create MSIX Package
- Create a self-signed certificate:
```powershell
$cert = New-SelfSignedCertificate -CertStoreLocation Cert:\LocalMachine\My -DnsName 'yourdomainname' -Type CodeSigningCert -Verbose
$secPassword = ConvertTo-SecureString -String 'yourpassword' -Force -AsPlainText
$certPath = "Cert:\LocalMachine\My\$($Cert.Thumbprint)"
Export-PfxCertificate -Cert $certPath -FilePath 'C:\temp\CodeSigning.pfx' -Password $secPassword
```
- Use MSI installer, select the certificate during packaging
- Install the certificate in **Trusted People** store on all session hosts

### 3. Configure Azure File Share
- Create AD DS security group, add all session host computer accounts as members
- Sync group to Azure AD
- Create Azure File Share (can reuse FSLogix storage account)
- Join storage account to AD DS
- Assign **Storage File Data SMB Share Contributor** role to AVD users and session hosts
- Grant NTFS permissions to the AD DS group and AVD users

### 4. Prepare MSIX Image (VHD)
- On a session host:
  1. Obtain MSIX package (.msix file)
  2. Rename to .zip and extract
  3. Create VHD with size >= extracted folder size
  4. Mount VHD, initialize disk, create and format partition
  5. Copy extracted content into VHD
  6. Apply ACLs using MSIXMGR tool
  7. Unmount VHD
- Upload VHD to Azure File Share

### 5. Add MSIX Image to Host Pool
- Azure Portal > Host Pool > MSIX packages > Add
- Provide the UNC path to the VHD on Azure Files

### 6. Publish MSIX Apps
- Create or use existing RemoteApp application group
- Publish MSIX apps to the app group

## Known Limitations
- **Azure AD DS is NOT supported** - computer objects are not synced to AAD, preventing RBAC assignment
- Multi-entry MSIX packages may launch wrong app (see known issue avd-onenote-003)
- Disconnected session may cause MSIX app to launch Explorer instead (see known issue avd-onenote-006)
