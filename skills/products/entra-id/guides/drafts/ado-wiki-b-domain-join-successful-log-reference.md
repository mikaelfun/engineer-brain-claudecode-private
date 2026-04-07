---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Join/Workflow: Domain Join: Successful Log Reference"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Join%2FWorkflow%3A%20Domain%20Join%3A%20Successful%20Log%20Reference"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Join: Successful Log Reference

**Summary**: Reference guide showing what a successful AD domain join looks like in Netsetup.log and network trace. Use this as a baseline for comparing against failed domain join logs.

## Overview

In most AD domain join failure cases, we compare the logs of the failure scenario with those from a successful AD domain join to identify where the problem starts, then carry out further targeted troubleshooting.

Logs needed:
- `Netsetup.log` at `%windir%\debug` (enabled by default)
- Network trace from the client machine

## Sample Successful Netsetup.log

Below is a typical Netsetup.log from a successful AD domain join to domain `contoso.local`, collected from a Windows 10 24H2 VM named HOST88. Comments prefixed with `//` are explanations.

### Phase 1: Name Validation
```
NetpValidateName: checking to see if 'HOST88' is valid as type 1 name
NetpCheckNetBiosNameNotInUse for 'HOST88' [MACHINE] returned 0x0
NetpValidateName: name 'HOST88' is valid for type 1
NetpValidateName: checking to see if 'HOST88' is valid as type 5 name
NetpValidateName: name 'HOST88' is valid for type 5
```

### Phase 2: Domain Validation & DC Location
```
// At least one DC of the specified domain is located and qualified for AD join
NetpValidateName: checking to see if 'contoso.local' is valid as type 3 name
NetpCheckDomainNameIsValid [ Exists ] for 'contoso.local' returned 0x0
```

### Phase 3: Domain Join Operation (after credential provided)
```
NetpDoDomainJoin
NetpJoinDomain
  HostName: HOST88
  Domain: contoso.local
  Account: contoso\puser2
  Options: 0x25

// DC located
NetpDsGetDcName: found DC '\\DC2.contoso.local' in the specified domain
NetpJoinDomainOnDs: NetpDsGetDcName returned: 0x0

// Connected to DC
NetpJoinDomainOnDs: status of connecting to dc '\\DC2.contoso.local': 0x0
```

### Phase 4: Computer Account Check (Account Reuse Scenario)
```
// Check if computer object with same name already exists
NetpGetComputerObjectDn: Cracking account name CONTOSO\HOST88$ on \\DC2.contoso.local
NetpGetComputerObjectDn: Crack results: Account does not exist
// First attempt with options 0x25 fails with 0x534 (no existing account)
NetpJoinDomainOnDs: Function exits with status of: 0x534

// Second attempt with options 0x27 (create new account)
NetpCheckIfAccountShouldBeReused: Computer Object does not exist in OU.
NetpCheckIfAccountShouldBeReused:fReuseAllowed: TRUE, NetStatus:0x2030
```

### Phase 5: Computer Object Creation
```
// Computer object created in AD
NetpModifyComputerObjectInDs: Initial attribute values:
  objectClass = Computer
  SamAccountName = HOST88$
  userAccountControl = 0x1000
  DnsHostName = HOST88.contoso.local
  ServicePrincipalName = HOST/HOST88.contoso.local RestrictedKrbHost/HOST88.contoso.local HOST/HOST88 RestrictedKrbHost/HOST88

// SID assigned
NetpQueryAccountAttributes succeeded: got RID=0x643 objectSid=S-1-5-21-...
```

### Phase 6: Package Installation & Local Configuration
```
NetpAddPartCollectionToRegistry: Successfully initiated provisioning package installation: 4/4 part(s) installed.
NetpCompleteOfflineDomainJoin
NetpJoinDomainLocal: NetpManageMachineSecret returned: 0x0
NetpManageLocalGroupsForJoin: Adding groups for new domain
NetpJoinDomainLocal: status of setting ComputerNamePhysicalDnsDomain to 'contoso.local': 0x0
NetpCompleteOfflineDomainJoin: status: 0x0

// 0xa99 = restart needed
NetpProvContinueProvisioningPackageInstall: status: 0xa99
```

### Phase 7: Machine Name Update
```
NetpChangeMachineName: from 'HOST88' to 'HOST88' using 'contoso\puser2'
// Updates DnsHostName and SPNs on the computer object
NetpModifyComputerObjectInDs: Computer Object already exists in OU
// Final success
NetpDoDomainJoin: status: 0x0
```

## Key Status Codes Reference

| Code | Meaning |
|------|---------|
| 0x0 | Success |
| 0x534 | Account does not exist (triggers account creation path) |
| 0x525 | No DC found with specific machine account (normal for new joins) |
| 0x2030 | Account reuse check passed |
| 0xa99 | Restart needed (expected after successful join) |
