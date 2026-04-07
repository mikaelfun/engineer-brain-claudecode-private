# AVD AVD 自定义镜像 (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-custom-image-upload-failure.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| New VM created from captured image cannot join AVD host pool... | Master image was captured from a VM already joined to a host... | Always run sysprep (generalize) before capturing master imag... |
| AVD session host fails to register with error NAME_ALREADY_R... | Custom image was created from a VM that was already register... | 1) Remove the affected session host from the host pool (Azur... |
| Settings > Accounts > Windows Backup crashes on Cloud PCs pr... | Connected Devices Platform Service (cdpsvc) is disabled in t... | Re-enable the service via registry and reboot: 1) Set-ItemPr... |
| Windows 365 custom image upload fails during provisioning va... | Pre-installed antivirus solutions (e.g., Sophos) on custom i... | Remove AV solutions from the custom image before upload. Use... |
| AVD session host registration fails with NAME_ALREADY_REGIST... | Custom image was created from a VM that was already register... | Remove the session host from host pool: Azure Portal > Host ... |
| Custom image template build fails with Resource group must b... | Specified resource group for Azure Image Builder contains ex... | Delete all resources in the resource group or specify a new ... |
| Custom image template fails with Resource URI is unavailable... | Script URI is not publicly accessible or URL is incorrect | Verify script URI is publicly available |
| Custom image template fails with ContainerInstance authoriza... | Microsoft.ContainerInstance resource provider not registered | Register Microsoft.ContainerInstance resource provider on th... |

### Phase 2: Detailed Investigation

#### Kusto queries
> Source: [ado-wiki-a-custom-image-upload-failure.md](guides/drafts/ado-wiki-a-custom-image-upload-failure.md)

[Queries for custom image upload failure.](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1217077/Custom-Image-Upload-Failure.-Get-Details-and-ImageId)

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | New VM created from captured image cannot join AVD host pool. Deployment times o... | Master image was captured from a VM already joined to a host pool without runnin... | Always run sysprep (generalize) before capturing master image. Use a VM never jo... | 🟢 8.5 | OneNote |
| 2 | AVD session host fails to register with error NAME_ALREADY_REGISTERED. Event ID ... | Custom image was created from a VM that was already registered in a host pool (a... | 1) Remove the affected session host from the host pool (Azure Portal → Host Pool... | 🟢 8.0 | ADO Wiki |
| 3 | Settings > Accounts > Windows Backup crashes on Cloud PCs provisioned with Windo... | Connected Devices Platform Service (cdpsvc) is disabled in the W365 optimized im... | Re-enable the service via registry and reboot: 1) Set-ItemProperty -Name Start -... | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 custom image upload fails during provisioning validation | Pre-installed antivirus solutions (e.g., Sophos) on custom image interfere with ... | Remove AV solutions from the custom image before upload. Use Kusto queries to id... | 🔵 7.5 | ADO Wiki |
| 5 | AVD session host registration fails with NAME_ALREADY_REGISTERED error. Event ID... | Custom image was created from a VM that was already registered (agent installed ... | Remove the session host from host pool: Azure Portal > Host Pool > Session Hosts... | 🔵 7.5 | ADO Wiki |
| 6 | Custom image template build fails with Resource group must be empty error | Specified resource group for Azure Image Builder contains existing resources | Delete all resources in the resource group or specify a new empty one | 🔵 7.0 | MS Learn |
| 7 | Custom image template fails with Resource URI is unavailable error | Script URI is not publicly accessible or URL is incorrect | Verify script URI is publicly available | 🔵 7.0 | MS Learn |
| 8 | Custom image template fails with ContainerInstance authorization error | Microsoft.ContainerInstance resource provider not registered | Register Microsoft.ContainerInstance resource provider on the subscription | 🔵 7.0 | MS Learn |
| 9 | Snapshots, backups, or Azure Disk Encryption not available on ephemeral OS disk | Ephemeral OS disks do not support persistent features (snapshots, backups, encry... | Use managed OS disks instead of EOSD if persistent features like backups, snapsh... | 🔵 7.0 | MS Learn |
| 10 | WVD shows "No Healthy RDSH Available" with SxSStacklistenerNotready status on cu... | Customer has Windows 10 Pro installed from the Azure marketplace to create manag... | Scoping: 1. Check Remote Desktop Service running and RDP works. 2. Check RDAgent... | 🔵 6.5 | KB |
| 11 | Issue:&nbsp;When Stopping the VM the Health state of the Session Host goes to Un... | After  comparing the Working and Non-working Session Hosts, it was found that, a... | &nbsp;We were able to enable the&nbsp;&quot;Hyper-V Integration services&quot; a... | 🔵 6.5 | KB |
| 12 | AVD session   host deployment failing with PowerShell DSC extension error �unabl... | Default  WinRM inbound rules are missing under windows firewall | Need to perform  below changes in custom image.     Open firewall.cpl -&gt; adva... | 🔵 6.5 | KB |
| 13 | Golden image causes agent issues - agent pre-installed in image | Golden image contains pre-installed AVD agent | Never include AVD agent in golden images; install after deployment | 🔵 6.5 | MS Learn |
| 14 | User gets error 'The system administrator has restricted the types of logon (net... | Custom image had default groups (Administrators, Users, Everyone) removed from t... | Modify the 'Allow log on locally' policy (secpol.msc > Local Policies > User Rig... | 🔵 6.0 | ADO Wiki |
| 15 | Custom image template fails with Hyper-V generation mismatch between source imag... | Source image Gen1/Gen2 does not match Compute Gallery VM image definition genera... | Ensure source image generation matches VM image definition generation | 🔵 6.0 | MS Learn |
