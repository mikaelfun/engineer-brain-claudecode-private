# Windows Autopilot ETW Trace Analysis (Level 300/400)

> Source: OneNote — MCVKB/Intune/Windows/Troubleshooting Windows AutoPilot (level 300_400)
> Status: draft

## When to Use

Advanced troubleshooting for Autopilot deployment failures when basic error codes are insufficient. Captures ETW trace for post-mortem analysis.

## Capturing the Trace

1. On first OOBE screen (language selection), press **Shift+F10** to open command prompt
2. Insert USB with `AutoPilot.wprp` file (or map network share)
3. Start trace:
   ```cmd
   wpr.exe -start <folder>\AutoPilot.wprp
   ```
4. Exit command prompt, proceed through Autopilot flow to reproduce the issue
5. Stop trace (Shift+F10 again if still in OOBE):
   ```cmd
   wpr.exe -stop C:\AutoPilot.etl
   ```

## Analyzing with Windows Performance Analyzer (WPA)

1. Open ETL file in WPA (from ADK)
2. Expand **System Activity** > double-click **Generic Events**

### Key ETW Providers

| Provider | What It Shows |
|----------|---------------|
| `Microsoft.Windows.Shell.CloudExperienceHost.Common` | Autopilot-specific events (ZTD-prefixed) |
| `Microsoft.Windows.Shell.CloudDomainJoin.Client` | AAD join, MDM enrollment, Autopilot detection |

### Key Event Names to Search

| Event | Field | Meaning |
|-------|-------|---------|
| `GetCloudAssignedAadServerData` (win:Stop) | `wasConfigured` | `True` = device registered with Autopilot |
| `LogTenantId` (win:Info) | Tenant GUID | Azure AD tenant ID |
| `LogTenantDomain` (win:Info) | Domain name | e.g. contoso.onmicrosoft.com |
| `GetCloudAssignedForceStandardUser` (win:Stop) | `forceStandardUser` | Standard user enforcement |
| `CDJUIError` | Error code | AAD join or MDM enrollment error (e.g. 801C0003, 80180018) |

### Profile Settings Bitmap

The `ZTP_GetConfigActivity` events show profile settings as a bitmap in Field 2:

| Bit | Value | Setting |
|-----|-------|---------|
| 0 | 1 | SkipCortanaOptIn |
| 1 | 2 | OobeUserNotLocalAdmin |
| 2 | 4 | SkipExpressSettings |
| 3 | 8 | SkipOemRegistration |
| 4 | 16 (0x10) | SkipEula |

Example: All enabled except OobeUserNotLocalAdmin = 1+4+8+16 = 29

## Alternative Analysis Tools

- Microsoft Network Analyzer (formerly Network Monitor)
- `TRACEFMT.EXE` — converts ETL to XML/text

## Reference

- [AutoPilot.wprp download](https://msdnshared.blob.core.windows.net/media/2017/12/AutoPilot.zip)
- SkipCortanaOptIn/SkipExpressSettings added in Win10 1703, SkipEula in 1709
