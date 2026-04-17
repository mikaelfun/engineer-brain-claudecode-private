# VM Migration — 排查工作流

**来源草稿**: ado-wiki-b-vm-unreachable-after-migration-staticnic-grub-bls.md, ado-wiki-c-ADE-Migration-FAQ.md, onenote-fabric-maintenance-migration-check.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 1
**覆盖子主题**: vm-migration
**生成日期**: 2026-04-07

---

## Scenario 1: Fabric Maintenance Migration Check
> 来源: onenote-fabric-maintenance-migration-check.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
### 1. Get VM Tenant Info from Jarvis
- For ARM VM: Query Jarvis with VM resource info
- Result contains Cluster name and Tenant name
### 2. Check Node via Fcshell
- Login to the VM's Cluster in Fcshell
- Query the Node hosting the VM
### 3. Check Node OS Version
- Inspect the Node OS information:
  - **WS16H** = Node has been upgraded to Windows Server 2016
  - **WS12H** = Node has NOT been upgraded yet

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
