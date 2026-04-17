# SCCM Verbose Log Collection for Co-management Issues

> Source: OneNote — Mooncake POD Support Notebook / Co-management / Collect SCCM verbose log
> Quality: guide-draft (pending SYNTHESIZE review)

## Steps

1. **Enable verbose logging on CCM client**:
   - Open `HKLM\Software\Microsoft\CCM\Logging\@GLOBAL\LogLevel` → change from `1` to `0`
   - Change `LogMaxSize` value to `1000000` (Decimal)
   - Under `HKLM\Software\Microsoft\CCM\Logging`, create a new KEY: `DebugLogging`
   - Create a new `REG_SZ` value named `Enabled`, set data to `True`

2. **Restart SMS Agent Host service**

3. **Wait 15 minutes** for logs to accumulate

4. **Collect all logs** from `C:\Windows\CCM\Logs`

5. **Collect MDM diagnostic report**:
   ```cmd
   MdmDiagnosticsTool.exe -area DeviceEnrollment -cab c:\temp\mdmdiag.cab
   ```

## 21v Applicability

Fully applicable — same procedure for Mooncake environments.
