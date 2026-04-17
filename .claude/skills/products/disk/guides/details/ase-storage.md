# Disk Azure Stack Edge: Storage & Upload — 详细速查

**条目数**: 3 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Copy to Azure Stack Edge via Robocopy fails with ERROR 665 (0x00000299) - The requested operation co

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Azure Stack Edge uses ReFS internally which limits alternate data streams to 128KiB; source files with larger alternate data streams (thumbnails, metadata for images) exceed this limit

**方案**: Add /dcopy:x option to Robocopy command to skip copying alternate data streams; files should then copy successfully

**标签**: azure-stack-edge, storage-gateway, copy-error-665, refs, robocopy

---

### 2. Robocopy to Azure Stack Edge fails with ERROR 665 (0x00000299): requested operation could not be com

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Azure Stack Edge uses ReFS internally with 128kiB limit on alternate data streams; source files with large thumbnail/metadata streams exceed this limit

**方案**: Add /dcopy:x flag to Robocopy command to skip copying alternate data streams

**标签**: azure-stack-edge, storage-gateway, robocopy, error-665, refs, alternate-data-streams

---

### 3. Unable to upload files to Azure Stack Edge share; 2998 error in ManifestsPerShare Errors.xml; hcsedg

**分数**: 🟢 8.5 | **来源**: [ADO Wiki] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: The datadata folder on ASE share root has ReadOnly attribute set, blocking the writer process

**方案**: Create empty non-readonly folder on host; robocopy it to share root with /nodcopy option to reset directory attributes; wait ~15 mins for writer to retry

**标签**: azure-stack-edge, storage-gateway, upload, readonly, error-2998, datadata

---

