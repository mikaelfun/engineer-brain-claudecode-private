---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/TSG: Group Policy Troubleshooting/Initial Troubleshooting & Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Group%20Policy/TSG%3A%20Group%20Policy%20Troubleshooting/Initial%20Troubleshooting%20%26%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Initial Troubleshooting & Scoping : Group Policy

## Scoping Questions

1. Name the setting (GPO, Registry, Permission, Configuration) which is configured via GPO which is not getting applied?
2. Name the GPO where this setting is configured?
3. If you run gpresult /h listgpo.html do you see the GPO in question in the Applied list or Denied list Or you dont see GPOs in the Applied or Denied List?
4. If the GPO is not in the Applied or denied list can confirm that the User/Computer is in the correct Hierarchy (OUs) where the GPOs is linked?
5. Is this setting/GPO getting applied to other machines or only some machines have the problem (Isolate if its an issue with all machines/Users or machines/Users)

## Troubleshooting Steps

**Step 1:** Identify if Computer Settings or User Settings are not getting applied

**Step 2:** Run the below commands based upon User or Computer settings not getting applied

```
gpupdate /force /target:Computer
```
Or
```
gpupdate /force /target:User
```

**Step 3:** Run gpresult /h ListGPO.html

Open the ListGPO.html file and identify the scenario:

## Decision Tree

### Scenario 1: GPO in Denied List
The GPO appears in the Denied list of GPOs. Follow the TSG for GPO Denied scenarios:
- WMI Filter not matching
- Inaccessible, Empty or Disabled (security filtering / Loopback Processing permissions)
- Access Denied (Security Filtering - Deny ACE or missing Read/Apply)

### Scenario 2: GPO in Applied List but Settings Missing
The GPO is in the Applied list but the expected settings are not taking effect:
- AD Replication latency/failure causing GPO version mismatch
- Another GPO or SCCM/Intune overwriting the same setting with higher precedence

### Scenario 3: GPO Not in Applied or Denied List
The GPO does not appear anywhere in gpresult:
- AD Replication broken - GPO has not replicated to the client's DC
- Scope mismatch - User/Computer not in the OU where GPO is linked
- Loopback Processing (Replace mode) changing effective scope

### Scenario 4: GPO Applied but Application Not Working
GPO settings are applied correctly (verified via registry/config) but application behavior is wrong:
- Application-side timing issue - app not re-reading updated config
- Use Procmon + gpupdate /force to verify GP writes correctly, then engage application team
