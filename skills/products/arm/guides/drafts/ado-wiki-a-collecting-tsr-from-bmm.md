---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/[TSG] Collecting TSR from a Bare Metal Machine (BMM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/%5BTSG%5D%20Collecting%20TSR%20from%20a%20Bare%20Metal%20Machine%20(BMM)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] Collecting TSR from a Bare Metal Machine (BMM)

## Preferred Method: Collect TSR via iDRAC (Recommended)

When iDRAC access is available and functional:
1. Log in to the server's **iDRAC9** interface
2. Navigate to **Maintenance > SupportAssist**
3. Select **Export SupportAssist Collection**
4. Choose required data sets (per Dell guidance)
5. Generate and download the TSR file
6. Share with Dell Support

**Dell KB:** [Export a SupportAssist Collection via iDRAC9](https://www.dell.com/support/kbdoc/en-us/000126308/export-a-supportassist-collection-via-idrac9)

## Alternative Method: Azure `run-data-extract`

If node is running in Azure:

```bash
az networkcloud baremetalmachine run-data-extract \
  --name "BMMNAME" --resource-group "RGNAME" \
  --subscription "SUBSCRIPTION NUMBER" \
  --commands '[{"arguments":["SysInfo","TTYLog","Debug"],"command":"hardware-support-data-collection"}]' \
  --debug --limit-time-seconds 1000
```

**Key Parameters:**
- `hardware-support-data-collection` - initiates hardware log and TSR-style data collection
- `arguments` - data sets (SysInfo, TTYLog, Debug)
- `--limit-time-seconds` - controls execution time (increase to 1000+ for large collections)

## Troubleshooting Timeouts

### 1. Increase Time Limit
Default/lower limits (e.g. 600s) may be insufficient. Increase `--limit-time-seconds` to 1000 or higher.

### 2. Validate Node and iDRAC Health
- Confirm node is responsive
- Verify iDRAC access
- Check for high CPU/disk/IO usage

### 3. Set Expectations
If both methods fail, log collection depends on node responsiveness. Document error message and timestamps, escalate if needed.
