# Data Box POD Support Package Analysis Guide

> Source: OneNote - Mooncake POD Support Notebook
> Status: draft (pending SYNTHESIZE review)

## Generating Support Packages

1. In the local web UI, go to **Contact Support**
2. Optionally select **Include memory dumps** (only if Support requests it - takes long time and contains sensitive data)
3. Click **Create Support package**
4. After creation, click **Download** and provide customer with DTM link workspace to upload

## Analyzing Support Packages

### Key Log Files Checklist

| # | Log File | Location | What to Check |
|---|----------|----------|---------------|
| 1 | `DiagnosticsTestResults.json` | Top-level of support package | Check test status (passed/failed). **Start here if any test failed.** |
| 2 | `Get-HcsApplianceInfo.txt` | `<Device_Logs>/SupportPackage/<Device_Name>/<Device_Serial>/cmdlets/PodCmdLets` | Device software version. If expected ≠ actual → update issue occurred. |
| 3 | `Get-HcsTimeSettings.txt` | Same as above | Time zone. If discrepancy → update via local WebUI → retry operation. |
| 4 | `Get-HcsNetInterface.txt` | Same as above | Port 'State'. Blank = not connected (OK). Non-'Up' on connected port → troubleshoot. |
| 5 | `Get-ClusterResource.txt` | Same as above | Resource 'State'. 'Offline' = by design (ignore). **'Failed' → investigate further.** |
| 6 | `hcsmgmt.Primary` | `<Device_Logs>/SupportPackage/<Device_Name>/<Device_Serial>/hcslogs` | Search for `[Err]` entries. |

### Troubleshooting Decision Tree

```
DiagnosticsTestResults.json → Any test Failed?
├── Yes → Start troubleshooting from failed test
│   ├── Check software version (Get-HcsApplianceInfo)
│   ├── Check time zone (Get-HcsTimeSettings)
│   ├── Check network ports (Get-HcsNetInterface)
│   ├── Check cluster resources (Get-ClusterResource)
│   └── Search for [Err] in hcsmgmt.Primary
└── No → Check other logs for warnings/errors
```

## References

- Support package video: https://msit.microsoftstream.com/video/e9e80840-98dc-997c-5824-f1eca3daf308
