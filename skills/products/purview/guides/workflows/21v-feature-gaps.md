# Purview 21Vianet 功能差异与缺失 — 排查工作流

**来源草稿**: `onenote-21v-scc-ido-escalation-process.md`, `onenote-aip-scanner-troubleshooting.md`, `onenote-azure-rms-mooncake-operations.md`, `onenote-jarvis-scc-log-reference.md`, `onenote-mip-sdk-mooncake-setup.md`, `onenote-purview-compliance-21v-feature-gap.md`, `onenote-purview-compliance-21v-roadmap.md`, `onenote-purview-gallatin-feature-verification.md`
**Kusto 引用**: 无
**场景数**: 47
**生成日期**: 2026-04-07

---

## Scenario 1: 21V SCC/IDO BC Escalation Process
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
> Source: OneNote — 21V team SCC/IDO BC escalation process
> Status: draft (pending SYNTHESIZE review)

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 2: Overview
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
Starting from 5/6/2024, SCC/IDO topics transferred to 21V VM+SCIM team from 21V MW team.

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 3: Customer Case Creation
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: 未标注

### 排查步骤
- Portal: https://portal.partner.microsoftonline.cn/Support/SupportOverviewStatic.aspx
- Redirects to: https://officesupport.azure.cn/en-US/support/support-o365
- Select O365 IDO or SCC topic

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 4: SAP Configuration
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
| Topic | SAP Path |
|-------|----------|
| SCC (Purview Compliance) | Security > China 21Vianet > China 21Vianet Office 365 Microsoft Purview Compliance |
| IDO (Identity) | Microsoft 365 > China 21Vianet Microsoft 365 Identity |

**Critical**: Always change SAP before transferring case between MW and Mooncake queues. Direct transfer without SAP change causes VDM profile to become inactive.

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 5: Escalation Flow
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
1. 21V SE checks with CSS in chat group "21V Escalation Review - SCC/IDO"
2. 21V case reviewed by 21V SME first, tracked in tracking table
3. Regularly shared with CSS TA in weekly meeting
4. Once CSS approves, raise case using escalation template

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 6: Escalation Template
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
**Case Title Format**: Company name + 21V Case ID + Customer type + Topic + Title

**Issue Description must include**:
- Issue description (orgid, subid, tenant ID)
- Logs collected (if any)
- Troubleshooting done
- Why escalation needed
- Working hour + Escalation reviewed by

**Additional for Sev A**:
- Business Impact
- Number of impacted tenants/users
- VIP users impacted?
- New project/deployment blocked?
- Business Justification (CFL/PSI qualification required)

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 7: 21V Ops Team Escalation
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
For certain operations that go through 21V Ops Team:
1. 21V SE collects related info
2. Escalate case to CSS
3. CSS raises ICM to 21V Ops team

**Applicable scenarios**: Sign-in log/audit log, Domain removal, Quota increase

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 8: Contacts
> 来源: onenote-21v-scc-ido-escalation-process.md | 适用: Mooncake ✅

### 排查步骤
- 21V SME handling SCC/IDO: lv.lei@oe.21vianet.com
- BC Escalation TA: Chuchu Lin

`[来源: onenote-21v-scc-ido-escalation-process.md]`

---

## Scenario 9: AIP Scanner Setup & Troubleshooting (21Vianet)
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / AIP Scanner
> Status: draft (from onenote-extract)

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 10: CloudEnvType Registry Key (Required)
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
AIP Scanner on 21Vianet requires the CloudEnvType registry key:
- Path: `HKLM\SOFTWARE\Microsoft\MSIPC`
- Key: `CloudEnvType` = `6` (REG_DWORD)
- Without this, `Set-AIPAuthentication` will fail with: "Unable to authenticate and setup Microsoft Azure Information Protection"
- Reference: https://learn.microsoft.com/en-us/microsoft-365/admin/services-in-china/parity-between-azure-information-protection?view=o365-21vianet#step-4-configure-aip-apps-on-windows

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 11: Service Principals
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
- Azure Information Protection: AppId `00000012-0000-0000-c000-000000000000`
- Microsoft Information Protection Sync Service: AppId `870c4f2e-85b6-4d43-bdda-6ed9a579b725`
  - May need manual creation: `New-AzADServicePrincipal -ApplicationId 870c4f2e-85b6-4d43-bdda-6ed9a579b725`

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 12: Key PowerShell Cmdlets
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
| Cmdlet | Purpose |
|--------|---------|
| `Start-AIPScan` | Start scanning |
| `Stop-AIPScan` | Stop scanning |
| `Get-AIPScannerStatus` | Check scanner status |
| `Set-AIPScannerContentScanJob` | Configure content scan job |
| `Get-AIPScannerContentScanJob` | View content scan job |
| `Add-AIPScannerRepository` | Add repository to scan |
| `Set-AIPScannerRepository` | Configure repository |
| `Get-AIPScannerRepository` | View repository config |
| `Set-AIPScannerConfiguration` | Set scanner configuration |
| `Get-AIPScannerConfiguration` | View scanner configuration |
| `Start-AIPScannerDiagnostics` | Run scanner diagnostics |

Reference: https://docs.microsoft.com/en-us/azure/information-protection/deploy-aip-scanner-configure-install#list-of-cmdlets-for-the-scanner

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 13: Standard Logs
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
```
Export-AIPLogs -File "C:\path\filename.zip"
```

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 14: Manual Log Collection
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
- If logged in as scanner account: `%localappdata%\Microsoft\MSIP` (zip entire directory)
- Otherwise: `C:\Users\{scanner_account}\AppData\Local\Microsoft\MSIP`

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 15: Enable Trace-Level Logging
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
1. Open Registry Editor as administrator
2. Navigate to `HKEY_CURRENT_USER\Software\Microsoft\MSIP`
3. Add key: `LogLevel` (REG_SZ) = `Trace`
4. Subsequent scanner runs will write detailed data to `msipscanner.iplog`

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 16: Reports Location
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
```
%localappdata%\Microsoft\MSIP\Scanner\Reports
```

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 17: Sample Files for Testing
> 来源: onenote-aip-scanner-troubleshooting.md | 适用: 未标注

### 排查步骤
Sample files with sensitive info: https://github.com/InfoProtectionTeam/Files/blob/master/Scripts/docs.zip

`[来源: onenote-aip-scanner-troubleshooting.md]`

---

## Scenario 18: Azure Subscriptions (Mooncake)
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: 未标注

### 排查步骤
| Subscription | ID | Purpose |
|--------------|----|---------|
| AADRM.PROD.MC.A | 8298715c-1e15-4a2a-87c3-e048ed1991cb | Key Vaults, Traffic Management |
| AADRM.PROD.MC.B | 6f2d2d65-e111-47de-b2d9-4c995c7e9567 | |
| AADRM.PROD.MC.Monitoring | 18729c3b-368b-4f35-93e1-e614807b9f92 | |

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 19: ICM Templates
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: 未标注

### 排查步骤
| Scenario | Link | Team |
|----------|------|------|
| App pre-authorization | [AzRMS-AppPreAuthz](https://aka.ms/AzRMS-AppPreAuthz) | Azure Rights Management/First Party App Pre-Authorization |
| Customer reported issues (CRI) | [AzRMS-NewCRI](https://aka.ms/AzRMS-NewCRI) | Azure Rights Management/Triage |

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 20: First-Party App List
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: 未标注

### 排查步骤
| Name | Application ID |
|------|---------------|
| Microsoft Rights Management Services | 00000012-0000-0000-c000-000000000000 |
| RMS Protection Tool | 4186465f-9980-40eb-98ca-35fea66b63e4 |
| RMS Sharing App | 6b069eef-9dde-4a29-b402-8ce866edc897 |
| Azure RMS Tracking Portal | 8ad4564c-ab19-478e-bdb4-662bbecaec2e |
| Aadrm Admin Powershell | 90f610bf-206d-4950-b61d-37fa6fd1b224 |
| Microsoft Information Protection API | 40775b29-2688-46b6-a3b5-b256bd04df9f |
| Azure Rights Management connector | 3fb71990-163e-4975-a0b1-a84d2e3149ef |

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 21: Pre-Authorized Apps
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: 未标注

### 排查步骤
| App ID | Display Name | Roles |
|--------|-------------|-------|
| 00000009-... | Power BI Service | Content.Writer |
| 00000003-0000-0ff1-ce00-... | Office 365 SharePoint Online | Content.Writer, DelegatedReader, DelegatedWriter |
| 3090ab82-... | Microsoft Cloud App Security (MCAS) | Content.Writer |

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 22: Geneva Logs (Jarvis)
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: Mooncake ✅

### 排查步骤
- **Endpoint**: CA Mooncake
- **Namespace**: RmsMds / RmsPinger
- **Env**: PROD
- **Region**: MC
- **ScaleUnit**: rmsoprodmc-a / rmsoprodmc-b
- **DataCenter**: CE2 / CN2
- **Hot Path Account**: AzRMS_MC

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 23: Kusto
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: Mooncake ✅

### 排查步骤
- **Cluster**: [https://azrmsmc.kusto.chinacloudapi.cn](https://azrmsmc.kusto.chinacloudapi.cn)
- **Security Group**: RmsMooncakeKustoUser (join via IDWEB)
- **Tables**: RequestLog, IISLog, reports

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 24: Escort / JIT Access
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: Mooncake ✅

### 排查步骤
- **Mooncake JIT**: https://jitaccess.security.core.chinacloudapi.cn/
- Use SAW + AME Account
- Tip: Use ICM incident number for auto-approval; if AME can't resolve ICM, use "OTHER"
- After requesting JIT, wait ~30 min for Teams ping with instructions

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 25: Client Side Logging
> 来源: onenote-azure-rms-mooncake-operations.md | 适用: 未标注

### 排查步骤
- Reference: [IRM Troubleshooting FAQ - OWiki](https://www.owiki.ms/index.php?title=IRM/Microsoft/Documentation/IRM_Troubleshooting_FAQ)
- Involve Office team for verification

`[来源: onenote-azure-rms-mooncake-operations.md]`

---

## Scenario 26: Jarvis SCC Log Namespaces Reference (21Vianet)
> 来源: onenote-jarvis-scc-log-reference.md | 适用: 未标注

### 排查步骤
> Source: OneNote — Jarvis logs for SCC
> Status: draft

`[来源: onenote-jarvis-scc-log-reference.md]`

---

## Scenario 27: Namespace / Events Table Reference
> 来源: onenote-jarvis-scc-log-reference.md | 适用: 未标注

### 排查步骤
| Namespace | Events Table | Usage |
|---|---|---|
| AdsAdminGal/AadServiceGal | IfxTraceEvent | Audit Events processing trace |
| NrtFrontEndGal | RecAuditEvt | Audit Log frontend |
| eDiscoveryV2Prod | ComplianceV2WorkBenchEvent | eDiscovery/Content Search jobs |
| ProtectionCenter/ProtectionCenterPrd | TraceEventLog | Compliance Portal front-end trace |
| O365PassiveGal | DLPPolicyAgentLogs | DLP policy execution logs (recent 30 days) |
| O365PassiveGal | Retentionpolicyagentlog | EXO Retention Policy execution logs (recent 30 days) |
| O365PassiveGal | UnifiedPolicyMonitoringInfoLogEvent | Data LifeCycle retention policy distribution logs |

`[来源: onenote-jarvis-scc-log-reference.md]`

---

## Scenario 28: Query Tips
> 来源: onenote-jarvis-scc-log-reference.md | 适用: 未标注

### 排查步骤
- Always filter by **Tenant ID** first
- Audit Log: Use NrtFrontEndGal → RecAuditEvt
- Compliance Portal frontend: Use ProtectionCenter saved query https://portal.microsoftgeneva.com/s/5FC1E2BE
- DLP Policy Execution: Filter by tenant ID → then by correlation ID for selected DLP events
- Note: DLP logs may show "Not Work" in some scenarios — verify with correlation ID

`[来源: onenote-jarvis-scc-log-reference.md]`

---

## Scenario 29: 21V Applicability
> 来源: onenote-jarvis-scc-log-reference.md | 适用: Mooncake ✅

### 排查步骤
All namespaces above are available in 21Vianet (Mooncake) Jarvis environment.

`[来源: onenote-jarvis-scc-log-reference.md]`

---

## Scenario 30: MIP SDK Configuration for Mooncake (21Vianet) Cloud
> 来源: onenote-mip-sdk-mooncake-setup.md | 适用: Mooncake ✅

### 排查步骤
> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / MIP SDK support
> Status: draft (from onenote-extract)

`[来源: onenote-mip-sdk-mooncake-setup.md]`

---

## Scenario 31: Overview
> 来源: onenote-mip-sdk-mooncake-setup.md | 适用: Mooncake ✅

### 排查步骤
MIP SDK supports national clouds including Azure China (Mooncake). You must explicitly set the cloud endpoint in your code.

`[来源: onenote-mip-sdk-mooncake-setup.md]`

---

## Scenario 32: C++ — Protection/Policy Engine
> 来源: onenote-mip-sdk-mooncake-setup.md | 适用: 未标注

### 排查步骤
```cpp
// Set the engine identity to the provided username
ProtectionEngine::Settings engineSettings(mip::Identity(mUsername), mAuthDelegate, "");
engineSettings.SetCloud(mip::Cloud::China_01);
```

`[来源: onenote-mip-sdk-mooncake-setup.md]`

---

## Scenario 33: C# — File Engine
> 来源: onenote-mip-sdk-mooncake-setup.md | 适用: 未标注

### 排查步骤
```csharp
var engineSettings = new FileEngineSettings(identity.Email, authDelegate, "", "en-US")
{
    Identity = identity
};
engineSettings.Cloud = (Cloud)10;  // China_01
```

`[来源: onenote-mip-sdk-mooncake-setup.md]`

---

## Scenario 34: Prerequisites — Service Principal
> 来源: onenote-mip-sdk-mooncake-setup.md | 适用: 未标注

### 排查步骤
The "Microsoft Information Protection Sync Service" (AppId: `870c4f2e-85b6-4d43-bdda-6ed9a579b725`) must exist and be enabled:

1. Create if missing: `New-AzADServicePrincipal -ApplicationId 870c4f2e-85b6-4d43-bdda-6ed9a579b725`
2. Enable if disabled:
   ```powershell
   Connect-MsolService -AzureEnvironment AzureChinaCloud
   Get-MsolServicePrincipal -AppPrincipalId 870c4f2e-85b6-4d43-bdda-6ed9a579b725 | Set-MsolServicePrincipal -AccountEnabled $true
   ```

`[来源: onenote-mip-sdk-mooncake-setup.md]`

---

## Scenario 35: Purview Compliance 21V vs Global Feature Availability
> 来源: onenote-purview-compliance-21v-feature-gap.md | 适用: 未标注

### 排查步骤
> Source: OneNote - Purview Compliance - Feature Gap
> Status: draft

`[来源: onenote-purview-compliance-21v-feature-gap.md]`

---

## Scenario 36: Feature Availability Table
> 来源: onenote-purview-compliance-21v-feature-gap.md | 适用: Mooncake ✅

### 排查步骤
| Feature | E3 | E5 | 21V (Gallatin) | Global |
|---------|----|----|----------------|--------|
| Compliance Manager (compliance score) | | | **No** | Yes |
| Alerts | | | **No** | Yes |
| eDiscovery (Standard) | | | Yes | Yes |
| eDiscovery (Premium) | | E5 | **No** | Yes |
| DLP (basic) | | | Yes | Yes |
| **DLP Alert** | | | **No** (infra not ready, ICM 673053756) | Yes |
| Communication DLP for Teams | | E5 | **No** | Yes |
| Retention Policy | | | Yes | Yes |
| Retention Label / Label Policy | | | **No** | Yes |
| SPO doc lib default label | | | **No** (PM confirmed no plan - legacy tech) | Yes |
| Audit log retention policy | | E5 | **No** (PM confirmed no plan) | Yes |
| Microsoft Purview Customer Key | | E5 | **No** | Yes |
| Information Barrier | | E5 | **No** | Yes |

`[来源: onenote-purview-compliance-21v-feature-gap.md]`

---

## Scenario 37: PM Contact
> 来源: onenote-purview-compliance-21v-feature-gap.md | 适用: 未标注

### 排查步骤
- Feature gap inquiries: **Shawn Wang**

`[来源: onenote-purview-compliance-21v-feature-gap.md]`

---

## Scenario 38: Reference Links
> 来源: onenote-purview-compliance-21v-feature-gap.md | 适用: Mooncake ✅

### 排查步骤
- [M365 operated by 21Vianet - Service Descriptions](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-operated-by-21vianet)
- [Microsoft 365 Compliance Licensing Comparison (PDF)](https://learn.microsoft.com/en-us/office365/servicedescriptions/downloads/microsoft-365-compliance-licensing-comparison.pdf)

`[来源: onenote-purview-compliance-21v-feature-gap.md]`

---

## Scenario 39: Key Takeaways
> 来源: onenote-purview-compliance-21v-feature-gap.md | 适用: Mooncake ✅

### 排查步骤
1. **Permanent gaps** (PM confirmed no plan): SPO doc lib default label, Audit log retention policy
2. **Infrastructure gaps** (may be deployed later): DLP Alert, Compliance Manager, Alerts
3. **License-gated in Global but absent in 21V**: eDiscovery Premium, Customer Key, Information Barrier, Communication DLP for Teams
4. Retention **Policies** work in 21V; Retention **Labels** do not

`[来源: onenote-purview-compliance-21v-feature-gap.md]`

---

## Scenario 40: Purview Compliance Feature Roadmap for 21Vianet
> 来源: onenote-purview-compliance-21v-roadmap.md | 适用: 未标注

### 排查步骤
> Source: OneNote - Purview Compliance feature Roadmap
> Status: draft

`[来源: onenote-purview-compliance-21v-roadmap.md]`

---

## Scenario 41: Current Status Reference
> 来源: onenote-purview-compliance-21v-roadmap.md | 适用: Mooncake ✅

### 排查步骤
- [M365 operated by 21Vianet - Purview Compliance Portal Availability](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/microsoft-365-operated-by-21vianet#microsoft-purview-compliance-portal-availability-in-office-365-operated-by-21vianet)

`[来源: onenote-purview-compliance-21v-roadmap.md]`

---

## Scenario 42: Features Planned for 21V Landing
> 来源: onenote-purview-compliance-21v-roadmap.md | 适用: Mooncake ✅

### 排查步骤
The following features were internally discussed as planned for landing in 21V (originally targeted 2024, status may have changed):

| Feature | Category | Notes |
|---------|----------|-------|
| AIP P2 - Auto Labeling | Sensitivity Labels | Automatic sensitivity label policies |
| AIP P1 - Container Labeling | Sensitivity Labels | Apply labels to M365 Groups, Sites, Teams |
| Communication DLP for Teams | DLP | DLP policy enforcement in Teams messages |
| Information Barrier | Advanced Compliance | Restrict communication between user segments |
| eDiscovery (Premium) | eDiscovery | Advanced eDiscovery capabilities |

`[来源: onenote-purview-compliance-21v-roadmap.md]`

---

## Scenario 43: Caveats
> 来源: onenote-purview-compliance-21v-roadmap.md | 适用: 未标注

### 排查步骤
- Timeline was discussed internally and may have shifted
- Always verify current availability via the official service descriptions link above
- Some features may require E5 or add-on licensing even after deployment

`[来源: onenote-purview-compliance-21v-roadmap.md]`

---

## Scenario 44: Purview Feature Verification Status in Gallatin
> 来源: onenote-purview-gallatin-feature-verification.md | 适用: Mooncake ✅

### 排查步骤
> Source: OneNote - Purview feature verified in Gallatin
> Status: draft

`[来源: onenote-purview-gallatin-feature-verification.md]`

---

## Scenario 45: Verified Working
> 来源: onenote-purview-gallatin-feature-verification.md | 适用: Mooncake ✅

### 排查步骤
| Feature | Status | Notes |
|---------|--------|-------|
| Allow overrides from M365 services | Working | Verified in Gallatin |
| Microsoft Purview Access Expiration | Working | Verified in Gallatin |
| Purview Information Protection client | Available | ICM 520698580 |
| Sensitivity labels for Groups & Sites | GA | PM confirmed, requires EnableMIPLabels PowerShell setup |
| Co-authoring with sensitivity labels | GA | PM confirmed |
| Retention Policy for Teams messages | Working | Message retention works |
| DLP for OneDrive | Working | Initially tracked, now verified works |

`[来源: onenote-purview-gallatin-feature-verification.md]`

---

## Scenario 46: Not Available / Partial
> 来源: onenote-purview-gallatin-feature-verification.md | 适用: Global-only ❌

### 排查步骤
| Feature | Status | Tracking | Notes |
|---------|--------|----------|-------|
| DLP "evaluate predicate for" | Not available | ADO 4787238 | Available in Global, missing in Gallatin |
| Retention for OneDrive | Not available | Tracking with PG | Cannot add custom ODB account; impacts Teams file retention |
| Auto-labeling | Not supported, no plan | - | Confirmed no plan for Gallatin |
| Custom Audit retention policy | Not supported | - | Confirmed not available |
| Sensitivity label SPO auto email notification | Partial | Confirmed by SPO team | Audit activity works, email notification does not |
| Retention Policy for Teams files | Partial | Tracking with PG | Files in OneDrive not covered |

`[来源: onenote-purview-gallatin-feature-verification.md]`

---

## Scenario 47: Planned / Coming
> 来源: onenote-purview-gallatin-feature-verification.md | 适用: 未标注

### 排查步骤
| Feature | Timeline | License | Notes |
|---------|----------|---------|-------|
| CMK for eDiscovery | July 2025 | E5 | ADO 4677588 |
| Teams DLP | July 2025 | E5 | ADO wiki TSG available |
| DLP Alert | Planned end June, delayed | - | Infra not ready |
| CMK (all workloads) | July 2025 | E5 | Setup guide available |
| Cross-cloud labeling | Public Preview | - | Only offline Word/Excel/PPT, no email |
| New Purview Portal | GA | - | Already landed |
| E5 IP & Governance license | July 2025 | - | New license SKU |

`[来源: onenote-purview-gallatin-feature-verification.md]`

---
