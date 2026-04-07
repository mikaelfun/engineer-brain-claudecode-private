---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/Authentication Failures when Credential Guard is enabled/Data Analysis Walkthrough"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FAuthentication%20Failures%20when%20Credential%20Guard%20is%20enabled%2FData%20Analysis%20Walkthrough"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Credential Guard - Authentication Failures Data Analysis Walkthrough

**Summary:** Step-by-step guide for troubleshooting authentication failures when Credential Guard is enabled on Windows 10. Covers NTLMv2 and Kerberos analysis using network traces and ETW traces.

## Step 1: Always check your data for known issues first

### 1. Most cases involve NTLMv2

Common error is an RPC failure caused by incompatible parameters.

Check the NTLM ETL (Event Trace Log) for:
```
[dll] ctxtcli_cxx3767 SsprHandleChallengeMessage() - SsprHandleChallengeMessage: ChallengeMessage LsaCall to get ChallengeResponse returns ProtocolStatus 0xc0020023
```

| Error Code | Dec | Symbolic Name | Error Description | Header |
|------------|-----|---------------|-------------------|--------|
| 0xc0020023 | -1073610717 | RPC_NT_INVALID_BOUND | The array bounds are invalid. | ntstatus.h |

### 2. Unconstrained delegation doesn't work with Credential Guard

When Credential Guard is enabled, unconstrained delegation is blocked by design ("Isolated mode dictates no delegation").

Reference: [Kerberos Considerations](https://docs.microsoft.com/en-us/windows/security/identity-protection/credential-guard/credential-guard-considerations)

Kerberos ETW trace shows:
```
[KERBEROS] ctxtapi_cxx818 KerbpSetDelegationIfAllowed() - Client wants Delegation, if safe
[KERBEROS] ctxtapi_cxx827 KerbpSetDelegationIfAllowed() - Isolated mode dictates no delegation
```

### 3. Check Known Issues section for a match

Review the Known Issues page for documented Credential Guard issues (IBM file servers, Cisco Connector, double BadPwdCount).

## Step 2: Check network trace and NTLM/Kerberos ETW traces

If no known issue matches, analyze network traces and ETW traces to find the failure/error code. Involve escalation team if needed.
