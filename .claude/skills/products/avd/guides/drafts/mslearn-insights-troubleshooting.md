# AVD Insights Troubleshooting Guide

> Source: [Troubleshoot Azure Virtual Desktop Insights](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-insights)

## Configuration & Setup Issues

### Azure Monitor Agent (Recommended)
- Enable diagnostics: Send AVD diagnostics to Log Analytics
- Install AMA extension manually if config workbook fails
- Create Log Analytics workspace if needed
- Validate Data Collection Rules in use

### Log Analytics Agent (Deprecated - migrate by Aug 2024)
- Same manual setup steps but using Log Analytics extension
- Can add custom performance counters and Windows event logs

## Data Not Displaying Properly

### Checklist
1. Verify configuration workbook setup (missing counters/events = missing data)
2. Check access permissions:
   - Read access to Azure RG with AVD resources
   - Read access to subscription RG with session hosts
   - Read access to Log Analytics workspaces
3. Open outgoing firewall ports for Azure Monitor
4. Wait 15 minutes for Azure Monitor data ingestion latency
5. If still broken → possible query or data source issue

## Known Issues & Limitations
- Custom workbook templates don't auto-adopt product group updates
- Config workbook may show "query failed" errors (refresh and reenter selection)
- Total sessions counter may overcount by small number
- Available session count doesn't reflect scaling policies
- Connection completion events can go missing (rare)
- Time to connect includes credential entry time → false peaks possible

## Customization
- Use Azure Monitor Workbooks to save/customize templates
- Custom templates won't get automatic updates from product group
