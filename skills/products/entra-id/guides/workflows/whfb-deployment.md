# Entra ID WHfB Deployment & Trust Models — 排查工作流

**来源草稿**: ado-wiki-c-pki-ndes.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Documentation
> 来源: ado-wiki-c-pki-ndes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Launch `Regedit`.
- 2. Navigate to: `HKLM\Software\Microsoft\Cryptography\MSCEP.`
- 3. Export the key named Modules and save it as a .REG file on the users desktop.
- 4. Once the key has been backed up, delete the Modules key in the registry.
- 5. Open an elevated command prompt and type: `IISReset`.
- 6. Once testing has been completed, import the Modules key back by double-clicking on the .REG file on the users desktop.
- 7. Open an elevated command prompt and type: `IISReset`.
- 1. Save the below file as `EEoffline.inf`
- 2. Run the below command to create the request.
- 3. Run the below command to submit the request.

---
