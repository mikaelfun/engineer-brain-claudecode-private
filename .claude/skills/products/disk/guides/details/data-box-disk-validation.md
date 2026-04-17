# Disk Data Box Disk: Validation & Naming — 详细速查

**条目数**: 18 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Data Box Disk: subfolders disappear after Robocopy, dir shows empty but direct path reveals data

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Source folder contains system-protected data; after Robocopy to Data Box Disk, folders are marked hidden

**方案**: Protected files do not affect data copy. Run validate tool to confirm files are listed. Data is present but hidden in explorer.

**标签**: Data-Box-Disk, Robocopy, hidden-folders, system-protected

---

### 2. Data Box Disk validation fails: Command failed - invalid containers found (ErrorXml)

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: File or folder names do not comply with Azure naming conventions

**方案**: Check ErrorXml log. Rename non-compliant files to meet Azure naming rules or exclude them. Re-run validation.

**标签**: Data-Box-Disk, validation, naming-convention, invalid-containers

---

### 3. Data Box Disk validation error: Found user files in drive root directory

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Data files placed directly in disk root instead of required subfolders (BlockBlob/PageBlob/AzureFile/ManagedDisk)

**方案**: Move files into appropriate subfolder by target storage type. Delete stray root files. Re-run validation.

**标签**: Data-Box-Disk, validation, root-directory, folder-structure

---

### 4. Data Box Disk validation error: Option 2 already executed, reset required

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Manifest files from previous validation exist. Data modified after initial validation but old manifests remain.

**方案**: Execute Option 3 (reset) to clear manifests, then re-run Option 1 or 2. Always reset before re-validating after data changes.

**标签**: Data-Box-Disk, validation, manifest, reset

---

### 5. Data Box Disk import fails or data routes to wrong target due to incorrect folder structure

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Folder-based routing: BlockBlob/PageBlob/AzureFile/ManagedDisk subfolders map to containers/shares. Root files not allowed.

**方案**: Organize per target: subfolder = container/share. AzureFile max 5TB/share. ManagedDisk: fixed VHDs only, no duplicates. See data-box-disk-limits doc.

**标签**: Data-Box-Disk, import-logic, folder-structure, routing

---

### 6. Data Box Disk managed disk import fails: dynamic VHD, VHDX, or duplicate VHD name

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Only fixed VHDs supported. Dynamic/differencing VHDs and VHDX not supported. Names must be unique across import and target RG.

**方案**: Convert dynamic to fixed VHD (Hyper-V Edit Disk). Convert VHDX to VHD. Ensure unique names. Place in ManagedDisk/{sku} subfolder.

**标签**: Data-Box-Disk, ManagedDisk, VHD, VHDX, fixed-VHD, import

---

### 7. Data Box Disk: files copied directly to AzureFile folder root fail and are uploaded as block blobs i

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: AzureFile subfolders become file shares. Files at root have no target share and default to block blob upload.

**方案**: Create subfolders under AzureFile for each target file share. Copy data into subfolders, not root.

**标签**: data-box-disk, azure-files, folder-structure

---

### 8. Data Box Disk validation tool or Split Copy tool reports failures when file paths exceed 256 charact

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Windows default path length limit is 260 characters. If long paths not enabled on client machine and any path+filename exceeds 256 chars, DataBoxDiskValidation.cmd and DataBoxDiskSplitCopy.exe will report errors.

**方案**: Enable long path support on client: 1) Group Policy: Computer Config > Admin Templates > System > Filesystem > Enable Win32 long paths. 2) Registry: HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1. 3) Or restructure data to use shorter paths.

**标签**: data-box-disk, long-path, validation-failure, 256-chars, split-copy-tool

---

### 9. Data Box Disk managed disk import: Split Copy tool cannot be used for managed disk scenarios, and du

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Split Copy tool is not supported for managed disk imports. Only one managed disk with a given name can exist in a resource group across all precreated folders and all Data Box Disks in the order.

**方案**: Do not use Split Copy tool for managed disk scenarios. Ensure each VHD file has unique name within target resource group. If importing from multiple disks/folders, verify no naming conflicts exist across all precreated managed disk folders.

**标签**: data-box-disk, managed-disk, split-copy-tool, duplicate-name, resource-group

---

### 10. Data Box Disk upload log shows FileNotFound error for files that existed during copy but were moved 

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Customer ran validation (Option 2 checksum), then moved or deleted some source files before the disk was returned. DC-side upload fails because checksum manifest references files that no longer exist on disk.

**方案**: No Azure-side fix. Customer must reorder a new Data Box Disk and re-copy data without modifying files after validation. Advise customer to always keep source files intact until upload is confirmed complete.

**标签**: data-box-disk, FileNotFound, validation, data-copy, upload

---

### 11. Data Box Disk portal shows 'Copy Completed' status but copy logs (XML) contain errors such as Invali

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Customer did not run validation before shipping disk. Files that do not conform to the target blob type or folder structure are moved to fallback containers (databox-invalid-pb-<jobname> or databox-<jobname>) at DC. Portal still shows 'Completed' because the copy process finished, but some files ended up in unexpected locations.

**方案**: 1. Download and review the copy log XML from portal. 2. Check for Blob Status entries like InvalidPageBlobUploadAsBlockBlob, MovedToDefaultAzureShare. 3. Verify data in the fallback containers. 4. For future orders, always run DataBoxDiskValidation.cmd (Option 2) before shipping.

**标签**: data-box-disk, copy-log, portal-status, validation, data-upload

---

### 12. Data Box Disk checksum validation (Option 2) takes extremely long time for large datasets with many 

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Validation tool processes each file individually; per-file overhead significant for many small files.

**方案**: Warn customer about long validation time. Option 1 (skip checksum) available but must independently verify in Azure. Reset tool (Option 3) between runs.

**标签**: data-box-disk, validation, checksum, performance

---

### 13. MARS offline backup with Data Box Disk: backup fails because folder name on disk does not follow fix

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: MARS expects specific fixed folder naming on Data Box Disk. Modified/incorrect folder names cause backup failure.

**方案**: Do not rename Data Box Disk folder structure. Follow exact naming convention from Azure Backup docs. Delete existing files before retrying with correct names.

**标签**: data-box-disk, mars, offline-backup, folder-name

---

### 14. Data Box Disk: files copied under PageBlob folder that do not meet page blob format (e.g., non-VHD f

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Data Box Disk validates PageBlob files during data copy at DC. Files that are not valid page blobs (must be 512-byte aligned VHD) are automatically redirected to an invalid container. Files placed directly at PageBlob root are also treated as block blobs.

**方案**: Ensure only valid fixed VHD files are placed under PageBlob subfolders. Non-VHD files should go under BlockBlob. Check the databox-invalid-pb-<jobname> container for any misplaced files and re-upload if needed.

**标签**: data-box-disk, pageblob, invalid-pb, data-copy, validation

---

### 15. Data Box Disk: when multiple disks in same order contain subfolders with same name (e.g., bc-dup on 

**分数**: 🟢 8.5 | **来源**: [MCVKB] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: Data Box Disk import creates containers/shares by folder name. When same folder name exists across multiple disks, data from all disks is merged into the same Azure container or file share. This is by design.

**方案**: Inform customer that duplicate folder names across disks will result in data merging into one container. If separate containers are needed, use unique folder names on each disk. Data is not lost but combined.

**标签**: data-box-disk, duplicate-folder, merge, container, data-copy

---

### 16. Data uploaded from Azure Data Box Disk ends up in the $root container instead of the intended contai

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Container structure in Azure Storage is determined by subfolder names under BlockBlob/PageBlob on the disk. Files placed directly under BlockBlob or PageBlob (not in a subfolder) are uploaded to the default $root container

**方案**: Create named subfolders under BlockBlob or PageBlob on the Data Box Disk matching the target container names. Structure: <BlockBlob>/<container-name>/<files>. The Data Box upload process will create/use containers matching those subfolder names in Azure Storage.

**标签**: data-box-disk, upload, container, blockblob, pageblob, root-container, storage-account

---

### 17. Data copy to Azure Files from Data Box Disk completes with status 'CompletedWithErrors' and/or 'BadR

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: File names, directory names, or share names do not comply with Azure Files naming conventions. The DataBoxDiskValidation.cmd tool cannot catch all invalid file name scenarios, so some invalid files pass validation but fail during the actual upload.

**方案**: 1) Verify all shares, directories, and file names follow Azure naming conventions (https://docs.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-shares--directories--files--and-metadata). 2) Check Drive:\DataBoxDiskImport\logs\error.xml for failed entries. 3) Decode and fix the file names per Azure conventions. 4) Use AzCopy to manually re-upload the corrected files: `azcopy copy '<local-file-path>' 'https://<storage-account>.file.core.windows.net/<file-share>/<file-name><SAS-token>'`

**标签**: data-copy-azure, azure-files, naming-convention, bad-request, completed-with-errors, azcopy, data-box-disk

---

### 18. Subfolders created inside AzureFile folder disappear on Data Box Disk during validation; Robocopy co

**分数**: 🟢 8.0 | **来源**: [ADO Wiki] | **置信度**: medium
**21V 适用**: ✅ 是

**根因**: The Data Box Disk Validation Tool may lack permissions to view the folders, or the folders are set as hidden by the system after copy.

**方案**: Navigate to the affected folder on the Data Box Disk and run dir E:\AzureFile from command prompt to verify subfolders are present. Folders may be hidden or have restricted permissions but are still intact.

**标签**: data-box-disk, validation, subfolders-missing, hidden-folders, permissions

---

