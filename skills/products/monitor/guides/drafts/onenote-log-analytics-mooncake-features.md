# Log Analytics Feature Support in Mooncake

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Log Analytics
> Status: draft (pending SYNTHESIZE review)
> Related JSONL: monitor-onenote-068

## Feature Support Matrix

| Feature | Supported | Notes |
|---------|-----------|-------|
| Windows server VM | Yes | Multihomed to two workspaces if managed by global OMS previously |
| Linux server VM | Yes | Multihomed to two workspaces if managed by global OMS previously |
| Log Analytics portal | Yes | Only via portal.azure.cn |
| Log Search | Yes | Only via portal.azure.cn |
| Alert | Yes | Portal UI was initially not updated but notifications work |
| Dashboard View | Yes | Limited for selected tables (solutions not all GA) |
| Windows Event Collection | Yes | |
| Windows Performance Data | Yes | Minimal 10 seconds interval |
| Linux Syslog Collection | Yes | |
| Custom Log Collection | Yes | REST API to insert customized log supported |
| Linux Performance Data | Yes | Minimal 10 seconds interval |
| Automation Account Integration | Yes | |
| Update Management | Yes | GA |
| Security and Compliance | Yes | |
| Inventory | Partial | Depends on Change Tracking solution GA |
| Change Tracking | Partial | Depends on solution GA |
| **Service Map** | **No** | Requires Service Map solution GA |
| **Hybrid cloud (SCOM)** | **No** | SCOM rollup package integration not working |
| Security Center integration | Yes | Security Center is GA |
| Logic App | Yes | Management solution (preview) |
| Azure Activity Log | Yes | From Azure Portal |
| OMS gateway | Yes | IcM 121610279 / Bug 4911971 |
| Application Insights | Yes | |
| **Data Export** | **No** | ETA was Aug 2022 (status may have changed) |

## Portal Access

Before 2019-02-21, required special URL with feature flags to access Log Analytics UI:
```
https://portal.azure.cn/?feature.showassettypes=Workspace,Solutions&...
```

After GA, workspaces accessible via:
- "All resources" service
- Marketplace for new workspace creation

## Key Limitations

1. **Service Map** not available
2. **SCOM hybrid cloud** not supported
3. **Data Export** had delayed availability (check current status)
4. Portal access only via portal.azure.cn (not OMS portal)
