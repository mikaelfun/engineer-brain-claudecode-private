# Intune Endpoint Security Firewall Rule Troubleshooting

> Source: OneNote — Mooncake POD Support Notebook / Intune / ## Windows TSG / How to trace and troubleshoot the Intune Endpoint Security Firewall rule creation process
> Original: https://techcommunity.microsoft.com/t5/intune-customer-success/how-to-trace-and-troubleshoot-the-intune-endpoint-security/ba-p/3261452

## Background: MDM Firewall Policy Structure
- Firewall rules are sent via SyncML in `<Atomic>` blocks
- If ANY rule in the block fails, the entire policy reports as failed
- Rules within a block are processed sequentially — a bad rule blocks subsequent rules

## Common Issue Examples

### Bad File Paths (Most Common)
- Extra space in environment variables: `%ProgramFiles(x86) %` (with trailing space)
- Custom variables not supported: `%customvariable%\folder\exe` won't work even if valid on client
- Only built-in Windows environment variables supported
- Only backslashes (`\`) supported — forward slashes (`/`) will fail
- These limitations apply to MDM, Group Policy, AND manual rule creation

### Invalid Port/IP Ranges
- Descending ranges like `65535-65534` cause errors
- TCP (6) or UDP (17) must be configured if local/remote port ranges are specified
- CSP reference: Firewall CSP Protocol node

### Blocked Policies
- When rule #2 fails, rule #3 and beyond are blocked too
- Must find and fix the FIRST failing rule to unblock the rest

## Troubleshooting Tools

### 1. MDM Diagnostic Report
```
Settings > Accounts > Access work or school > Info > Create report
# or
mdmdiagnosticstool.exe -out c:\temp
```
- Search for `FirewallRules` in the report
- Policy ID = deviceConfiguration GUID (hyphens removed)
- Rule ID = 6-char string (e.g., LAEAAA)

### 2. Windows Event Viewer
- Log: `Application and Services logs\Windows\DeviceManagement-Enterprise-Diagnostics-Provider\Admin`
- Filter on Event ID 404 + keyword "FirewallRules"
- Error example: `Result: (The parameter is incorrect.)`

### 3. Registry
```
HKLM\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\Mdm\FirewallRules
```
- Shows which rules were actually created on device
- Compare with MDM report to find which rule is blocking

### 4. PowerShell
```powershell
# List all MDM firewall rules
Get-NetFirewallRule -PolicyStore ActiveStore

# Filter by policy ID
Get-NetFirewallRule -Name "d444067ff2b74006993bf3d10bd98467*" -PolicyStore ActiveStore | Format-List DisplayName, Name
```

### 5. Graph Explorer
```
GET https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurations/{guid-with-hyphens}
```
- Convert policy ID to GUID format: `[guid] "d444067ff2b74006993bf3d10bd98467"` in PowerShell

### 6. SyncML Viewer
- GitHub: https://github.com/okieselbach/SyncMLViewer
- Search for `FirewallRules` to find the sync session
- Check CmdID to find first failing rule
- Error 0x80070057 = E_INVALIDARG = invalid parameter

## Useful Scripts
- **Test-IntuneFirewallRules**: https://github.com/markstan/Test-IntuneFirewallRules — tests all rules and reports failures
- **EndpointSecurityPolicy_Export.ps1**: exports all endpoint security policies to JSON for review
- **Get-IntuneGraphAPIObject**: resolves deviceConfiguration ID to friendly name
