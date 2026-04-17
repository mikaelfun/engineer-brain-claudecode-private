# Azure Automation Feature Gap: Public Azure vs Mooncake

## Feature Availability Matrix

| Feature | Sub Feature | Public Azure | Mooncake |
|---------|-------------|-------------|----------|
| Configuration Management | State Configuration (DSC) | GA | GA |
| | Change Tracking & Inventory | GA | Only via Security Center FIM (Windows/Linux files, Windows registry). Not visible in Automation Account |
| Update Management | Update Management (AUMv1) | GA | GA in chinaeast2 only. Non-chinaeast2 VMs must connect to chinaeast2 Log Analytics workspace |
| | Azure Update Manager (AUMv2) | GA | Available in ChinaEast (Azure VMs only), ChinaEast2 (Azure + Arc), ChinaNorth (Azure VMs only), ChinaNorth2 (Azure + Arc), ChinaNorth3 |
| Process Automation | Runbooks & Jobs | GA | GA |
| | Runbook Gallery | GA | GA |
| | Hybrid Worker | GA | GA |
| | Watcher Tasks | Deprecated | N/A |
| Shared Resources | Modules | GA | GA (**without Modules Gallery** — manual upload only) |
| Related Resources | Log Analytics Workspace | GA | GA |
| | Event Grid | GA | GA but **not visible in Automation Account** blade |
| | Start/Stop VM solution | GA | **N/A** |
| Account Settings | Source Control | GA | GA |
| | Run As Accounts | GA (deprecated) | GA (deprecated) |
| Monitoring | Diagnostic Settings | GA | GA |

## AUM v2 Regional Availability (Mooncake)

| Region | Azure VMs | Arc VMs |
|--------|-----------|---------|
| ChinaEast | ✅ | ❌ |
| ChinaEast2 | ✅ | ✅ |
| ChinaNorth | ✅ | ❌ |
| ChinaNorth2 | ✅ | ✅ |
| ChinaNorth3 | ✅ (delayed) | TBD |

## Key Workarounds

1. **Modules Gallery unavailable** → Manually download from PSGallery, upload via portal or REST API
2. **Change Tracking not in Automation** → Use Defender for Cloud > File Integrity Monitoring
3. **UM non-chinaeast2** → Associate VM with chinaeast2 Log Analytics workspace
4. **Start/Stop VM N/A** → Implement custom runbook with schedule
5. **Event Grid not visible** → Configure via Event Grid service directly

## PG Contacts
- Azure Automation: Brian McDermott <bmcder@microsoft.com>
- Automation PM: Jaspreet Kaur <jaspkaur@microsoft.com>
- Azure Update Manager: <updatemgmtcenter@microsoft.com>, <aumpm@microsoft.com>

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Feature releasement and verification
- Last updated: 2024-09 (AUMv2 regions), 2024-04 (feature list)
