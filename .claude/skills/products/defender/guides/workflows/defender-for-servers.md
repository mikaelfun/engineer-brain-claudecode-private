# Defender Defender for Servers — 排查工作流

**来源草稿**: ado-wiki-a-endpoint-protection-support-workflow.md, ado-wiki-a-iaas-antimalware-basic-knowledge.md, ado-wiki-a-mdc-servers-plan-resources-exclusion.md, ado-wiki-b-trusted-launch-guest-attestation.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Requirements
> 来源: ado-wiki-a-endpoint-protection-support-workflow.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Check Assessment result via Event Viewer**
2. **Windows Defender (SCEP) PowerShell commands:**
3. **No real time protection with SCEP (Partial Monitoring):**
4. **No real time protection with SCEP (PowerShell issue):**
5. **On VM workspace run the query:**

### Kusto 诊断查询
**查询 1:**
```kusto
ProtectionStatus
   | where Computer has "{vmName}"
   | project Computer, ThreatStatus, ThreatStatusRank, ProtectionStatus, ProtectionStatusRank, ProtectionStatusDetails
```

**查询 2:**
```kusto
ProtectionStatus
   | where Computer contains "{vmName}" or ResourceId contains "{vmName}"
   | summarize arg_max(TimeGenerated, *) by TypeofProtection, Computer
```

### 脚本命令
```powershell
# Configure
mdatp config real-time-protection --value enabled

# Validate
mdatp health --field real_time_protection_enabled
```

---

## Scenario 2: IaaS Antimalware Basic Knowledge
> 来源: ado-wiki-a-iaas-antimalware-basic-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. What type of machines are you working with? OS version especially
2. What endpoint solution are you using?
3. Are these machines reporting heartbeat consistently to the workspace in the last 24 hours?
4. Screenshot of the deployment failure (extension status)

### 脚本命令
```powershell
az vm extension set -n IaaSAntimalware --publisher Microsoft.Azure.Security --vm-name <vm_name> -g <vm_rg> --enable-auto-upgrade false --no-auto-upgrade-minor-version true
```

---

## Scenario 3: MDC Servers Plan Resources Exclusion
> 来源: ado-wiki-a-mdc-servers-plan-resources-exclusion.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Azure Portal > Policy > Definitions
2. Search: "Configure Microsoft Defender for Servers to be disabled for resources (resource level) with the selected tag"
3. Assign to scope, specify tag name/values
4. Create Remediation Task for existing + new resources

---
