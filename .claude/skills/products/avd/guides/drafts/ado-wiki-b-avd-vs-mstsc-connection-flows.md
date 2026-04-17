---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Bkup/AVD vs MSTSC Connection Flows"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/659271"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> ⚠️ **注意**: 此页面来自 Sandbox/Outdated 区域，为 RDS AAD Auth (PROTOCOL_RDSAAD) 功能的早期开发文档，内容可能已过期。

[[_TOC_]]

# Connection Flows

Differences between AVD and a regular RDP connection (AVD-specific steps highlighted in yellow in original)

## MSTSC
1. User enters the target hostname into MSTSC and clicks Connect.

1. The client sends X.224 Connection Request to the target [(MS-RDPBCGR: Negotiation-Based Approach)](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/db98be23-733a-4fd2-b086-002cd2ba02e5). If RDP file had enablerdsaadauth:i:1 property set, the client adds PROTOCOL_RDSAAD (0x10) to the list of requested protocols.

1. The target receives X.224 Connection Request and checks if it can accept RDS AAD Auth. The protocol is accepted if ALL below conditions are satisfied:
   1. RDS AAD Auth is not disabled in Group Policy (SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services\fEnableRdsAadAuth registry value is absent or set to 1).
   1. The device is AAD-Joined or Hybrid-AAD-Joined.
   1. Attempt of getting TS Nonce value from CloudAP security package succeeds.

1. The target sends X.224 Connection Confirm to the client with Selected Protocol set to PROTOCOL_RDSAAD.

1. The client generates an RSA 2048 key pair. This is done once per life of the client process and is used as a Binding Key when requesting RDP Access Token.

1. The client requests RDP Access Token from AAD using the target hostname [(ModernRdpUsingTLS)](https://msazure.visualstudio.com/One/_git/ESTS-Docs?version=GBmaster&path=/Protocols/RDP/ModernRdpUsingTLS.md&_a=preview). Together with the token the client obtains:
   1. Target's AAD Device ID.
   1. AAD Tenant's P2P root certificate.

1. The client makes a separate HTTP request to AAD and obtains an AAD Nonce value.

1. The client starts a TLS handshake with the target.

1. The target uses AAD P2P Server certificate in TLS handshake. This certificate is located in the computer's Personal certificate store and is issued by MS-Organization-P2P-Access [year].

1. When TLS handshake ends, the client validates the target's certificate by verifying that it was issued by the AAD Tenant's P2P root certificate obtained in step 6, and that certificate's subject name equals the target's AAD Device ID (also obtained in step 6).

1. The target obtains a TS Nonce from CloudAP and sends it to the client.

1. The client creates an RDP Assertion by putting together RDP Access Token, AAD Nonce and TS Nonce and signing them with the Binding Key.

1. The client sends RDP Assertion to the target.

1. The target passes RDP Assertion to CloudAP for validation. If validation succeeds CloudAP returns a Credential Blob.

1. The target performs Network Logon using the Credential Blob. If logon succeeds, the target uses the resulting NT Token to perform access check.

1. The target sends the result of logon and access check to the client.

1. If RDP Assertion validation, logon or access check failed, the target closes the connection, otherwise main RDP protocol starts.

## AVD (differences from MSTSC)
1. **[AVD only]** User clicks an AVD endpoint icon.

1. **[AVD only]** The client connects to the AVD Gateway and starts Orchestration. During Orchestration the client receives the target's AAD Device ID and server certificate.

1. The client sends X.224 Connection Request to the target. Same as MSTSC.

1. Target checks if it can accept RDS AAD Auth. Same conditions as MSTSC.

1. Target sends X.224 Connection Confirm with PROTOCOL_RDSAAD.

1. The client generates RSA 2048 key pair (Binding Key). Same as MSTSC.

1. **[AVD only]** The client requests RDP Access Token from AAD **using the Device ID received during Orchestration (step 2)** instead of hostname.

1. The client makes separate HTTP request to AAD for AAD Nonce. Same as MSTSC.

1. TLS handshake starts. Same as MSTSC.

1. **[AVD only]** The target uses a **regular RDP server certificate** in TLS handshake (not the AAD P2P cert used by MSTSC).

1. **[AVD only]** Client validates target certificate **by comparing it with the certificate received during Orchestration (step 2)** (not via AAD P2P root cert chain).

1. Target obtains TS Nonce from CloudAP and sends to client. Same as MSTSC.

1. Client creates RDP Assertion (RDP Access Token + AAD Nonce + TS Nonce, signed with Binding Key). Same as MSTSC.

1. Client sends RDP Assertion to target. Same as MSTSC.

1. Target passes RDP Assertion to CloudAP for validation → Credential Blob. Same as MSTSC.

1. Target performs Network Logon with Credential Blob. Same as MSTSC.

1. Target sends logon/access check result to client. Same as MSTSC.

1. Connection proceeds or closes based on result. Same as MSTSC.

## Key Differences Summary

| Step | MSTSC | AVD |
|------|-------|-----|
| Target discovery | User enters hostname | Gateway Orchestration provides Device ID + certificate |
| Token request | Uses hostname | Uses Device ID from Orchestration |
| TLS cert used | AAD P2P Server cert (from Personal cert store) | Regular RDP server cert |
| Cert validation | Verify against AAD P2P root cert + Device ID | Compare against cert from Orchestration |
