---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Wizard and ADSync service/Troubleshooting guides/Troubleshooting RPC Errors Affecting AADConnect"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FWizard%20and%20ADSync%20service%2FTroubleshooting%20guides%2FTroubleshooting%20RPC%20Errors%20Affecting%20AADConnect"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting RPC Errors Affecting AADConnect

## Introduction

Customers may experience issues where they cannot configure AADConnect and/or enable features due to Remote Procedure Call (RPC) related errors. Features previously enabled may also stop working due to these types of errors. In the vast majority of cases, the issue is affecting AADConnect and not caused by AADConnect, so finding the exact underlying problem is crucial.

## RPC Error Examples

### Example 1 - RPC Error 1722 (The RPC server is unavailable)

**Symptom**: Password hash synchronization fails with Application Event ID 611:

```
Password hash synchronization failed for domain: contoso.local
Error: There was an error establishing a connection to the directory replication service.
RPC Error 1722 : The RPC server is unavailable. Error creating the RPC binding handle
```

**Troubleshooting**: This is a common networking related error. Investigate network traces for retransmit packets on destination port 135 (traffic on this port being blocked). Reference: [Troubleshoot TCPIP RPC Errors](https://docs.microsoft.com/en-us/windows/client-management/troubleshoot-tcpip-rpc-errors)

**Automated network trace collection**: Install Microsoft Network Monitor, then:
1. Start capture: `nmcap /network * /Capture /file c:\MSData\%Computername%_Trace.cap:500M /StopWhen /Frame (ICMP and Ipv4.TotalLength == 328) /CaptureProcesses /TimeAfter 2s`
2. Prepare a script with: `ping -l 300 -n 2 120.##.###.42`
3. Attach a task to the error event to trigger the ping command that stops the trace.

### Example 2 - RPC Error 8333 (Directory object not found)

**Symptom**: Password hash synchronization fails with Application Event ID 611:

```
RPC Error 8333 : Directory object not found.
There was an error calling _IDL_DRSGetNCChanges.
```

**Troubleshooting**: AADConnect server was not able to find the user object for which it is trying to perform Password Hash Synchronization in Active Directory. Check if the object exists and is reachable. Other infrastructure configuration issues (DNS name resolution, Authentication problems) may contribute.

### Example 3 - RPC Server Unavailable (0x6ba)

**Symptom**: Password set operation fails with Application Event ID 6329:

```
admaexport.cpp(2939): Failed to acquire user information: 0x6ba
```

**Troubleshooting**: 0x6ba translates to RPC Error 1722 (RPC Server Unavailable). Same troubleshooting steps as Example 1 apply.

### Example 4 - Access Denied (0x5)

**Symptom**: RPC call returns error 0x5 (Access Denied).

**Troubleshooting**: Can be caused by hardening group policies in Active Directory. Reference: [SSPR_0029 error with on-premises configuration](https://internal.evergreen.microsoft.com/en-us/help/4486951)

## Common RPC Error Code Reference

| Error ID | Hex | Symbolic Name | Description |
|:-:|:-:|:-:|:-:|
| 5 | 0x5 | ERROR_ACCESS_DENIED | Access is denied |
| 6 | 0x6 | ERROR_INVALID_HANDLE | The handle is invalid |
| 14 | 0xE | ERROR_OUTOFMEMORY | Not enough storage available |
| 1127 | 0x467 | ERROR_DISK_OPERATION_FAILED | Disk operation failed even after retries |
| 1130 | 0x46A | ERROR_NOT_ENOUGH_SERVER_MEMORY | Not enough server storage |
| 1331 | 0x533 | ERROR_ACCOUNT_DISABLED | Account is currently disabled |
| 1450 | 0x5AA | ERROR_NO_SYSTEM_RESOURCES | Insufficient system resources |
| 1722 | 0x6BA | RPC_S_SERVER_UNAVAILABLE | The RPC server is unavailable |
| 1723 | 0x6BB | RPC_S_SERVER_TOO_BUSY | The RPC server is too busy |
| 1726 | 0x6BE | RPC_S_CALL_FAILED | The remote procedure call failed |
| 1727 | 0x6BF | RPC_S_CALL_FAILED_DNE | The RPC failed and did not execute |
| 1728 | 0x6C0 | RPC_S_PROTOCOL_ERROR | An RPC protocol error occurred |
| 1753 | 0x6D9 | EPT_S_NOT_REGISTERED | No more endpoints from endpoint mapper |
| 1818 | 0x71A | RPC_S_CALL_CANCELLED | The RPC was cancelled |
| 1825 | 0x721 | RPC_S_SEC_PKG_ERROR | A security package specific error |
| 8333 | 0x208D | ERROR_DS_OBJ_NOT_FOUND | Directory object not found |
| 8420 | 0x20E4 | ERROR_DS_CANT_FIND_EXPECTED_NC | Naming context could not be found |
| 8439 | 0x20F7 | ERROR_DS_DRA_BAD_DN | Distinguished name is invalid |
| 8446 | 0x20FE | ERROR_DS_DRA_OUT_OF_MEM | Failed to allocate memory |
| 8451 | 0x2103 | ERROR_DS_DRA_DB_ERROR | Replication database error |
| 8453 | 0x2105 | ERROR_DS_DRA_ACCESS_DENIED | Replication access was denied |
| 8456 | 0x2108 | ERROR_DS_DRA_SOURCE_DISABLED | Source server rejecting replication |
| 8465 | 0x2111 | ERROR_DS_DRA_SOURCE_IS_PARTIAL_REPLICA | Master replica attempted sync from partial |

Reference: [System Error Codes](https://docs.microsoft.com/en-us/windows/win32/debug/system-error-codes)
