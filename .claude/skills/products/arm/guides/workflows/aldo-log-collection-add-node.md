# ARM ALDO 平台 (Log Collection / Add Node) — 排查工作流

**来源草稿**: ado-wiki-a-aldo-appliance-deployment-investigation.md, ado-wiki-a-introduction-to-aldo.md 等 32 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ALDO Appliance 部署排查
> 来源: ado-wiki-a-aldo-appliance-deployment-investigation.md | 适用: Mooncake ❌ / Global ✅ (Preview)

### 排查步骤
1. **日志位置**: SeedNode → C:\ProgramData\Microsoft\AzureLocalDisconnectedOperations\Logs
2. **三类日志文件**:
   - **InstallAppliance_*.txt** — 安装流程时间线
   - **Import_Appliance_*.json/txt** — 导入验证和配置
   - **ConfigureAppliance_*.json/txt** — 配置步骤详情
3. **Import Appliance 验证步骤**:
   - TestDownloadAppliance, TestApplianceHostCleanness
   - TestHostOsVersion, VerifyProcessor, VerifyPhysicalRAM
   - VerifyApplianceDiskSpace, TestApplianceRequiredVSwitches
4. **Import Appliance 部署步骤**:
   - ExpandIrvmZipFile → UpdateVmCapacity → ImportAndStartVM
   - NetworkSetupPostImport → ConfigureManagementEndpoint
5. **Configure Appliance 步骤**:
   - ConfigureIngressEndpoint → ImportExternalCertificates
   - ConfigureObservability → ConfigureExternalIdentity → WaitApplianceReady

---

## Scenario 2: ALDO 日志收集
> 来源: ALDO diagnostics 参考 | 适用: Mooncake ❌ / Global ✅ (Preview)

### 排查步骤
1. 确认 ALDO 组件状态: LCM, ECE, URP1/URP2, Health & Scheduler, ALM
2. 收集 Winfield 日志用于分析
3. 检查 Observability 和 Remote Support 组件
