# Data Box Disk Data Preparation Guide

> Source: OneNote - Data Box Disk Process Test / Prepare Data (实测记录)

## 1. Unpack & Connect

1. Open shipping box, verify 1-5 SSDs + USB cables
2. If box is tampered/damaged → contact Microsoft Support before opening
3. Save box and foam for return shipment
4. Connect disk to client PC via USB

## 2. Unlock Disk

### Windows
1. Download Data Box Disk toolset: `https://aka.ms/databoxdisktoolswin`
2. Extract toolset on the data copy machine
3. Run Command Prompt / PowerShell as Administrator
4. Optional: Run system check command to verify OS compatibility
5. Run `DataBoxDiskUnlock.exe` with passkey from Azure portal
6. Disk appears as NTFS partition after successful unlock

### Important: Re-unlock After Restart
- **After PC restart, disk requires re-unlock using DataBoxDiskUnlock tool**
- Cannot enter passkey through standard Windows BitLocker prompt
- Must run `DataBoxDiskUnlock.exe` again with the same passkey

### Linux
- Follow docs for Linux unlock procedure
- Red Hat Enterprise Linux 7.x may have unlock issues (see known-issues)

## 3. Copy Data

### Folder Structure (CRITICAL)
| Target Type | Copy To | Rule |
|-------------|---------|------|
| Block Blobs | `BlockBlob/<container-name>/` | Subfolder = container name |
| Page Blobs (VHD/VHDX) | `PageBlob/<container-name>/` | Subfolder = container name |
| Azure Files | `AzureFile/<share-name>/` | Subfolder = file share name |

**WARNING**: Files copied directly to root of `BlockBlob`/`PageBlob` → uploaded to `$root` container as block blobs  
**WARNING**: Files copied directly to `AzureFile` root → **FAIL** and uploaded as block blobs instead

### Copy Methods
- Drag and drop via File Explorer
- Robocopy: `Robocopy <source> <destination> * /MT:64 /E /R:1 /W:1 /NFL /NDL /FFT /Log:c:\RobocopyLog.txt`
- Any SMB-compatible file copy tool

### Naming Convention
- All containers, blobs, and file names must comply with Azure naming conventions
- Non-compliant names → data upload to Azure will fail

## 4. Validate Data

### Run Validation Tool
1. Run `DataBoxDiskValidation.cmd` in `Drive:\DataBoxDiskImport\` folder
2. Option 1: Validate files only (skip checksum) — faster
3. **Option 2: Validate files AND generate checksums** — recommended
4. Option 3: Reset tool (required between runs on same disk)

### Validation Notes
- Error log: `Drive:\DataBoxDiskImport\logs\error.xml`
- **Large datasets with many small (KB) files → checksum takes extremely long**
- If using Option 1 (no checksum), independently verify data integrity in Azure after upload
- Must run validation on each disk separately if using multiple disks
- **Must reset tool (Option 3) between runs** — otherwise get "Option 2 already executed" error

## 5. Pre-return Checklist

- [ ] All data copied to correct folder structure
- [ ] Validation completed without critical errors
- [ ] Error log reviewed if any warnings
- [ ] Root directory cleared of loose files/folders (move before copy)
- [ ] Return shipping label visible (clear sleeve under current label)
