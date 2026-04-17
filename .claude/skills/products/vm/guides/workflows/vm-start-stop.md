# VM Start / Stop / Restart — 排查工作流

**来源草稿**: ado-wiki-f-startbuild-fail-avdimage-languagepack.md, mslearn-start-vm-last-known-good.md, onenote-script-vm-restart-events.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 2
**覆盖子主题**: vm-start-stop-a, vm-start-stop-b, vm-start-stop-c, vm-start-stop-d, vm-start-stop-e, vm-start-stop-f, vm-start-stop-g, vm-start-stop-h, vm-start-stop-i, vm-start-stop-j, vm-start-stop-k, vm-start-stop-l, vm-start-stop-m, vm-start-stop-n, vm-start-stop-o, vm-start-stop-p, vm-start-stop-q, vm-start-stop-r, vm-start-stop-s, vm-start-stop-t
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Notes
> 来源: ado-wiki-f-startbuild-fail-avdimage-languagepack.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting Notes
- Ensure all resource providers are registered before template submission
- Verify managed identity has correct RBAC permissions scoped to the resource group
- If using existing VNet, disable Private Link Service Network Policy on the subnet
- Check customization.log in the staging resource group for detailed error messages
- Image generation must match VM image definition (Gen1 vs Gen2)

---

## Scenario 2: Start Vm Last Known Good
> 来源: mslearn-start-vm-last-known-good.md | 适用: Mooncake \u2705

### 排查步骤
## Procedure
### Step 1: Attach OS Disk to Repair VM
1. Delete the VM (select **Keep the disks**)
2. Attach the OS disk as a data disk to a troubleshooting VM
3. Open **Computer Management** > **Disk Management**, ensure disk is online with drive letters assigned
### Step 2: Modify Registry Hive
1. Navigate to `\windows\system32\config` on attached disk — **backup all files first**
2. Open Registry Editor (regedit.exe)
3. Click `HKEY_USERS` → **File > Load Hive**
4. Navigate to `\windows\system32\config\SYSTEM`, name the hive (e.g., `ProblemSystem`)
5. Expand to `HKEY_USERS/ProblemSystem/Select` and modify values:
**Windows Server 2012 R2 and older:**
| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 3 |
**Windows 10 / Server 2016 and newer:**
| Value | Set to |
|-------|--------|
| Current | 2 |
| Default | 2 |
| Failed | 1 |
| LastKnownGood | 2 |
> **Note**: If VM was previously restarted on Last Known Good, add 1 to all values (e.g., Current=3, Default=3, Failed=2, LastKnownGood=3 or 4).
6. Select `HKEY_USERS\ProblemSystem` → **File > Unload Hive**
7. Detach repaired OS disk → create new VM from it (wait ~10 minutes for Azure to release disk)

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
