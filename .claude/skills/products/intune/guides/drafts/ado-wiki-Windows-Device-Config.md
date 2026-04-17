---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/Windows"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows Device Configuration Guide

## Overview
Windows uses Configuration Service Providers (CSPs) to expose device config settings via OMA-DM protocol. SyncML is the XML-based format used for data exchange.

## Configuration Methods
- **Settings catalog**: All settings in one place (CSP+ADMX)
- **Templates**: Logical grouping (device restrictions, kiosk, etc.)
- **Security baselines**: Pre-configured security settings

## Key Concepts

### CSP Scope
- **User scoped** → writes to HKCU
- **Device scoped** → writes to HKLM

### Scope + Assignment combinations
- Device scope + Device group → all users get setting
- Device scope + User group → once user signs in, all users get setting
- User scope + Device group → all users get setting
- User scope + User group → only that user
- User scope takes precedence over device scope when both apply

### Policy Exclusion
Avoid mixing users and device groups in exclusion assignments.

### Enrollment Method Impact
Bulk enrollment = user-less → user-group policies won't apply.

## Common Scenarios

**Scenario A**: Policy success in Intune, settings confirmed in MDMDiagReport/Registry, device doesn't behave as configured.
→ Check for GPO/SCCM/Scripts overriding Intune. If Intune is sole provider, submit IET assistance request.

**Scenario B**: Policy error in Intune, settings confirmed, device behaves correctly.
→ CSP doesn't support Get operation → Intune reports "remediation failed" (by design).

**Scenario C**: Policy error, settings not confirmed, device doesn't behave.
→ Verify syntax/formatting, do SyncML trace, check Kusto.

**Scenario D**: Not applicable for lock screen image on supported Windows edition.
→ Check Personalization CSP requirements.

**Scenario E**: Kiosk profile fails on HAADJ devices → -2016281112 (Remediation Failed).

**Scenario F**: "Enable remote desktop" stays off after policy deployment.

**Scenario G**: Unable to RDP after Security Baseline deployment.

**Scenario H**: Can't cast/project screen (Miracast) after Security Baseline.

**Scenario I**: Invalid regEx format for firewall ports with comma delimiter.

## Support Boundaries
- Intune = policy delivery mechanism
- Validate deployed settings match device settings
- Confirm no GPO/SCCM/third-party conflicts
- If settings delivered correctly → not an Intune problem → engage relevant Windows team
- Microsoft Intune team owns ALL Windows CSP troubleshooting (even for 3rd party MDM if policy is delivered)
- 3rd party products (e.g., Chrome ADMX) → refer to their documentation

## Service-Side Troubleshooting

### Assist365
Check: Tenant/user/device authority, device info, user info, policy info, group info.
Limitations:
- ADMX policy info not visible → use Kusto/SyncML
- GCC High → only tenant info available

### Kusto Queries

**ADMX policy troubleshooting:**
```kusto
let deviceId = 'Intune device Id';
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where ActivityId == deviceId or DeviceId == deviceId
| where ApplicationName == "GroupPolicy"
| where Col5 != 'NotApplicable'
| project env_time, ServiceName, Col1, cV
```

**CSP-based policy status:**
```kusto
PolicyDeploymentByDevice("IntunedeviceId",datetime('start'),datetime('end'),1000)
| where Applicability =="Applicable"
| project env_time,PolicyName,PolicyType,Applicability,Compliance,PolicyID,userId,ActivityId,TaskName
```

**Policy processing detail:**
```kusto
let deviceid = "IntunedeviceId";
let logicalpolicyid = "PolicyId_with_underscores";
let Processing= strcat("^Processing CI.*", logicalpolicyid, ".*");
let Postprocessing= strcat("^Post-processing CI.*", logicalpolicyid, ".*");
let compliancestate= strcat("^Compliance state for CI.*", logicalpolicyid, ".*");
IntuneEvent
| where env_time between (datetime(start)..datetime(end))
| where ActivityId == deviceid
| where Col1 != 'Pre-Processing CI general applicability'
| where Col1 matches regex Processing
    or Col1 matches regex Postprocessing
    or Col1 matches regex compliancestate
    or Col3 has 'logicalpolicyid'
| project env_time, Col1, UserId, ScenarioInstanceId
```

## Client-Side Troubleshooting

### Log Collection (priority order)
1. **One Data Collector (ODC)** - most comprehensive
2. **Diagnostic logs** - remote collection via Intune
3. **MDMDiagnostics.cab** - Settings > Accounts > Access work or school > Export

### MDMDiagReport.html
Check: OS version/SKU, last check-in, device ID, managed policies (CSP name, setting name, default/current values, source)

### Registry
Policy info in `HKLM\SOFTWARE\Microsoft\PolicyManager`:
- `Current\(device or UserSID)` - currently delivered settings
- `Providers\EnrollmentGUID\(device or UserSID)` - winning provider
- `AdmxInstalled\<EnrollmentID>` - ADMX policy values

### SyncML Trace
Use SyncML Viewer tool to see data sent from service.

### Procmon Trace
For read/write issues on local device. Use when settings fail to apply.

### MDM Trace
Next-level troubleshooting for enrollment, policy, or LOB app issues.

### Network Troubleshooting
Tools: Netsh, Fiddler, browser trace. Traffic is HTTPS-encrypted, customer must consent to decryption.
