# AVD MSIX App Attach - 杂项 — 排查工作流

**来源草稿**: ado-wiki-b-msix-appattach-setup-guide.md, mslearn-app-attach-troubleshooting.md, onenote-avd-msix-app-attach-setup.md
**Kusto 引用**: msix-appattach.md
**场景数**: 18
**生成日期**: 2026-04-07

---

## Scenario 1: Create VM
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Create VM that is same version as AVD VMs.
1. Login into VM with administrator account.

## Scenario 2: Create Self Signed Certificate
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Reference: [Create a certificate for package signing](https://docs.microsoft.com/en-us/windows/msix/package/create-certificate-package-signing)
1. Open PowerShell as administrator and enter the following (replace FriendlyName):
```powershell
   New-SelfSignedCertificate -Type Custom -Subject "CN=Contoso Software, O=Contoso Corporation, C=US" -KeyUsage DigitalSignature -FriendlyName "Your friendly name goes here" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
```
1. Select Run from the Start menu and enter `certmgr.msc`.
1. Expand **Personal** > Right click on certificate > **All Tasks** > **Export**.
1. Select **Yes, export the private key**.
1. Select format options, enter a password, choose save location, and complete wizard.

## Scenario 3: Create MSIX Package
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Install **MSIX Packaging Tool** from Microsoft Store.
1. Open MSIX Packaging Tool and select **Application package**.
1. Select **Create package on this computer** > **Next**.
1. Confirm driver is installed and Windows Update/Search is disabled > **Next**.
1. Under **Choose the Installer**: browse to the MSI. Under **Signing preference**: browse to PFX. Enter PFX password.
1. Package information should populate automatically.
1. Program will be installed. Restart machine if application requires restart. Click **Next**.
1. Package will be listed > **Next**.
1. Click **Yes** to move on.
1. Review package report > **Next**.
1. Select location to save package > **Create**.

## Scenario 4: Create a VHD or VHDX Package for MSIX
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Note: Requires Hyper-V role installed.
Follow: [Create a VHD or VHDX package for MSIX](https://docs.microsoft.com/en-us/azure/virtual-desktop/app-attach-image-prep#create-a-vhd-or-vhdx-package-for-msix)

## Scenario 5: Expand MSIX Package
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Follow: [Expand MSIX](https://docs.microsoft.com/en-us/azure/virtual-desktop/app-attach-image-prep#expand-msix)
After completion, detach the VHD.

## Scenario 6: Add Package to Host Pool
> 来源: ado-wiki-b-msix-appattach-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Go to **Host Pool** > **MSIX packages** > Select **Add**.
1. Enter UNC path to VHD — details should populate.
1. Enter display name, change state to **Active**, select **Add**.

## Scenario 7: AVD App Attach Troubleshooting Guide
> 来源: mslearn-app-attach-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Source: [Troubleshoot app attach in Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-app-attach)

## Scenario 8: Steps
> 来源: mslearn-app-attach-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Install [PsExec](https://learn.microsoft.com/en-us/sysinternals/downloads/psexec) on a session host
2. Open PowerShell as admin, start SYSTEM context:
```powershell
   PsExec.exe -s -i powershell.exe
```
3. Verify context: `whoami` → should output `nt authority\system`
4. Mount MSIX image manually:
**For .vhdx format:**
```powershell
   Mount-DiskImage -ImagePath \\fileshare\msix\MyApp.vhdx
```
**For .cim format:**
```powershell
   If (!(Get-Module -ListAvailable | ? Name -eq CimDiskImage)) {
       Install-Module CimDiskImage
   }
   Import-Module CimDiskImage
   Mount-CimDiskImage -ImagePath \\fileshare\msix\MyApp.cim -DriveLetter Z:
```
5. If mount succeeds → file share access is correct
6. Dismount after testing:
   - .vhdx: `Dismount-DiskImage -ImagePath \\fileshare\msix\MyApp.vhdx`
   - .cim: `Get-CimDiskImage | Dismount-CimDiskImage`

## Scenario 9: Key Points
> 来源: mslearn-app-attach-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Must test as SYSTEM account (not user account)
   - Both .vhdx and .cim formats supported
   - CimDiskImage PowerShell module required for .cim format

## Scenario 10: MSIX App Attach Setup Guide (AVD)
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: Mooncake \u2705

### 排查步骤
> Source: OneNote - Mooncake POD Support Notebook / AVD / Feature Verification / MSIX app attach
> Status: draft

## Scenario 11: Prerequisites
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - AD DS environment (Azure AD DS is NOT supported for MSIX app attach)
   - Azure Files share with AD DS authentication
   - Self-signed or trusted code signing certificate

## Scenario 12: 1. Set Up MSIX Packaging Environment
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Follow [MSIX packaging tool quick-create VM](https://docs.microsoft.com/en-us/windows/msix/packaging-tool/quick-create-vm)

## Scenario 13: 2. Create MSIX Package
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Create a self-signed certificate:
```powershell
$cert = New-SelfSignedCertificate -CertStoreLocation Cert:\LocalMachine\My -DnsName 'yourdomainname' -Type CodeSigningCert -Verbose
$secPassword = ConvertTo-SecureString -String 'yourpassword' -Force -AsPlainText
$certPath = "Cert:\LocalMachine\My\$($Cert.Thumbprint)"
Export-PfxCertificate -Cert $certPath -FilePath 'C:\temp\CodeSigning.pfx' -Password $secPassword
```
   - Use MSI installer, select the certificate during packaging
   - Install the certificate in **Trusted People** store on all session hosts

## Scenario 14: 3. Configure Azure File Share
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Create AD DS security group, add all session host computer accounts as members
   - Sync group to Azure AD
   - Create Azure File Share (can reuse FSLogix storage account)
   - Join storage account to AD DS
   - Assign **Storage File Data SMB Share Contributor** role to AVD users and session hosts
   - Grant NTFS permissions to the AD DS group and AVD users

## Scenario 15: 4. Prepare MSIX Image (VHD)
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - On a session host:
1. Obtain MSIX package (.msix file)
2. Rename to .zip and extract
3. Create VHD with size >= extracted folder size
4. Mount VHD, initialize disk, create and format partition
5. Copy extracted content into VHD
6. Apply ACLs using MSIXMGR tool
7. Unmount VHD
   - Upload VHD to Azure File Share

## Scenario 16: 5. Add MSIX Image to Host Pool
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Azure Portal > Host Pool > MSIX packages > Add
   - Provide the UNC path to the VHD on Azure Files

## Scenario 17: 6. Publish MSIX Apps
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Create or use existing RemoteApp application group
   - Publish MSIX apps to the app group

## Scenario 18: Known Limitations
> 来源: onenote-avd-msix-app-attach-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Azure AD DS is NOT supported** - computer objects are not synced to AAD, preventing RBAC assignment
   - Multi-entry MSIX packages may launch wrong app (see known issue avd-onenote-003)
   - Disconnected session may cause MSIX app to launch Explorer instead (see known issue avd-onenote-006)

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(24h)
| where Name contains "msix" or Name contains "Msix" or Name contains "appattach"
| where HostPool == "{HostPoolName}"
| where Name contains "ProcessMsixPackage" 
    or Name contains "StageMsixPackages" 
    or Name == "RegisterMsixPackages" 
    or Name == "DeregisterMsixPackages"
| where Props !contains "\"NumExpectedPackages\":0"
| project TIMESTAMP, UserName, Name, ResType, ResSignature, ResDesc, Props
| order by TIMESTAMP desc
```
`[来源: msix-appattach.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostPool == "{HostPoolName}"
| where Name == "RegisterMsixPackages" 
| where UserName contains "{UserName}"
| where TIMESTAMP >= ago(12h)
| project TIMESTAMP, UserName, ResType, ResDesc, Props, HostInstance
| order by TIMESTAMP desc
```
`[来源: msix-appattach.md]`
