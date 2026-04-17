# Windows Activation Troubleshooting on Azure VMs

Sources:
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-activation-problems
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-activation-troubleshoot-tools
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-activation-stopped-working

## KMS Endpoints by Region

| Region | KMS Endpoint |
|--------|-------------|
| Azure Global | `azkms.core.windows.net:1688` |
| Azure China 21Vianet | `kms.core.chinacloudapi.cn:1688` or `azkms.core.chinacloudapi.cn:1688` |
| Azure Germany | `kms.core.cloudapi.de:1688` |
| Azure US Gov | `kms.core.usgovcloudapi.net:1688` |

### New KMS IPs (since Oct 2022)

Global cloud now uses: `20.118.99.224` and `40.83.235.53`

## Quick Diagnostic Steps

1. Run `slmgr.vbs /ato` from elevated CMD - check error code
2. Test connectivity:
   ```powershell
   Test-NetConnection azkms.core.windows.net -Port 1688
   Test-NetConnection 20.118.99.224 -Port 1688
   Test-NetConnection 40.83.235.53 -Port 1688
   ```

## Diagnostic Tools

### 1. Windows Activation Validation Script
- Purpose: Validate activation status, detect misconfigurations
- GitHub: https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_Activation_Validation
- Run via: Azure Portal → VM → Operations → Run Command

### 2. IMDS Certificate Check Script
- Purpose: Verify IMDS certificates for activation
- GitHub: https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_IMDSValidation
- Run via: Azure Portal → VM → Operations → Run Command

## Known Error Codes

| Error Code | Issue |
|-----------|-------|
| 0xC004F074 | No KMS could be contacted |
| 0xC004FD01 | Not running on supported Hyper-V platform |
| 0xC004FD02 | Windows not activated on host machine |
| 0xC004F06C | KMS request timestamp invalid |
| 0xC004E015 | Non-core edition error |
| 0x800705B4 | Activation error (timeout-related) |
| 0x80070005 | Access denied - elevated privileges required |

## Common Causes and Fixes

### Forced Tunneling Blocking KMS
- Custom routes or firewall not allowing KMS IPs
- Fix: Add both `20.118.99.224` and `40.83.235.53` port 1688 to route table/firewall rules

### KMS IP Address Change (Post Oct 2022)
- Old custom routes/firewall rules pointed to deprecated IPs
- Fix: Update to new IPs, KMS activation valid for 180 days (renewal every 7 days)

### Duplicate Client Machine ID
- See separate article on Windows activation duplicate CMID

## Recommended Workflow

1. Run **Windows Activation Validation** tool first
2. If certificate errors → run **IMDS Certificate Check**
3. Apply fixes or escalate with error code

## 21V Applicable: Yes (use China KMS endpoint)
