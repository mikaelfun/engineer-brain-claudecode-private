# Monitor AMA Windows 代理排查 — 排查工作流

**来源草稿**: [ado-wiki-a-AMA-Windows-HT-Capture-Network-Trace.md], [ado-wiki-a-AMA-Windows-HT-Check-Arc-Extension-Binaries.md], [ado-wiki-a-AMA-Windows-HT-Check-Proxy-Settings.md], [ado-wiki-a-AMA-Windows-HT-Check-VM-GuestAgent-Binaries.md], [ado-wiki-a-AMA-Windows-HT-Check-VM-GuestAgent-Running.md], [ado-wiki-b-AMA-Windows-Check-AMA-Processes.md], [ado-wiki-b-AMA-Windows-Check-Arc-Extension-Install-Logs.md], [ado-wiki-b-AMA-Windows-Check-VM-GuestAgent-Install-Logs.md], ... (27 total)
**Kusto 引用**: 无
**场景数**: 9
**生成日期**: 2026-04-07

---

## Scenario 1: Use this guide when **ALL** of the following are TRUE:  
> 来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Scoping**
   [来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md]

2. **Step 1: a: What issue is being experienced?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md]

3. **Step 1: b: What event log is experiencing issues?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md]

   ```kql
   | where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))
   ```
   [来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md]

   ```kql
   | where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))
   ```
   [来源: ado-wiki-d-AMA-Windows-TSG-Collection-Windows-Event-Log.md]

---

## Scenario 2: **ALL** of the following are TRUE:
> 来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Is there a Data Collection Rule (DCR) associated?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md]

2. **Step 2: Does the Arc machine have a managed identity?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md]

3. **Step 3: Can we talk to Hybrid Azure Instance Metadata Service (HIMDS)?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md]

4. **Step 4: Can we talk to handlers?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md]

5. **Step 5: Reviewing network trace**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Arc-Machine.md]

---

## Scenario 3: **ALL** of the following are TRUE:
> 来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Is there a Data Collection Rule (DCR) associated?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md]

2. **Step 2: Does the VM have a managed identity?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md]

3. **Step 3: Can we talk to Azure Instance Metadata Service (IMDS)?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md]

4. **Step 4: Can we talk to handlers?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md]

5. **Step 5: Reviewing network trace**
   [来源: ado-wiki-d-AMA-Windows-TSG-Configuration-Azure-Virtual-Machine.md]

---

## Scenario 4: ALL of the following are TRUE:
> 来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Is the Arc machine connected?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

2. **Step 2: Does the Arc machine have a managed identity?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

3. **Step 3: Is the extension present in the Arc machine configuration?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

4. **Step 4: Did the Azure Arc Agent download the extension binaries?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

5. **Step 5: Did the Azure Arc Agent install and enable the extension?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

6. **Step 6: Did the agent processes successfully start?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Arc-Machine.md]

---

## Scenario 5: **ALL** of the following are TRUE:
> 来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Is the VM powered on?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

2. **Step 2: Does the VM have a managed identity?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

3. **Step 3: Is the extension present in the VM configuration?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

4. **Step 4: Is the VM Guest Agent running?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

5. **Step 5: Did the VM Guest Agent download the extension binaries?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

6. **Step 6: Did the VM Guest Agent install and enable the extension?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

7. **Step 7: Did the agent processes successfully start?**
   [来源: ado-wiki-d-AMA-Windows-TSG-Installation-Azure-Virtual-Machine.md]

---

## Scenario 6: ALL of the following are TRUE:
> 来源: ado-wiki-f-ama-windows-tsg-iis-logs.md | 适用: Mooncake ✅

### 排查步骤

1. **Step 1: Is there a DCR associated with IIS data source?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

2. **Step 2: Does mcsconfig.latest.xml show desired configuration?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

3. **Step 3: Does agent cache show desired counters and expected values?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

4. **Step 4: Does MAEventTable.csv show IIS-related errors?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

5. **Step 5: Does QoS table show success?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

6. **Step 6: Does ingestion pipeline show the blob type?**
   [来源: ado-wiki-f-ama-windows-tsg-iis-logs.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/agent-ama-windows.md |
