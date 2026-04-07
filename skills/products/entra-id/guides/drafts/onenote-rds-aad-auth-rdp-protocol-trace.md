# RDS AAD Auth (RDSTLS) Protocol Trace Analysis

> Source: OneNote — AADRDSAuth RDP
> Status: draft (pending SYNTHESIZE merge with ado-wiki-rds-aad-auth-troubleshooting-guide.md)

## Overview

RDS AAD Auth enables Entra ID authentication for RDP connections to AADJ/HAADJ VMs. The protocol uses RDSTLS (protocol bitmask `0x10`) negotiated during X.224 connection setup.

## Key References

- ADO Wiki: [RDP-RDS AAD Sign-In Support for MSTSC Client](https://dev.azure.com/Supportability/WindowsUserExperience/_wiki/wikis/WindowsUserExperience/724829/RDP-RDS-AAD-Sign-In-Support-for-MSTSC-Client)
- ESTS Docs: [ModernRdpUsingTLS.md](https://msazure.visualstudio.com/One/_git/ESTS-Docs?version=GBmaster&path=%2FProtocols%2FRDP%2FModernRdpUsingTLS.md)
- Protocol Spec: [[MS-RDPBCGR]](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdpbcgr/8f62058b-c7e5-4244-8f14-ed7d76618cb5)

## Protocol Flow (5 Steps)

### Step 1: Negotiate Protocol Version

Client sends X.224 Connection Request. Server responds with `TS_TYPE_RDP_NEG_RSP` containing `SelectedProtocols = 0x10` (RDS AAD Auth).

**Key log lines (RDClient.etl):**
```
CTSX224Filter::XTHandleNegRsp() - SelectedProtocols bitmask is 0x10
CTSX224Filter::XTHandleNegRsp() - RDS AAD Auth protocol is negotiated
```

### Step 2-3: Binding Key + Token Acquisition

Client generates or loads RSA binding key, then acquires AAD access token via WAM broker.

- ClientId: `5177bc73-fd99-4c77-a90c-76844c9b6999`
- Resource: `ms-device-service://a4a365df-50f1-4397-bc59-1a1564b8bb9c/name/{server}`
- Authority: `login.partner.microsoftonline.cn/common` (Mooncake)
- `req_cnf` contains the client binding key public part (JWK per RFC 7517)

**Key log lines (AAD/Analytic):**
```
Token broker operation request parameters
client: 5177bc73-fd99-4c77-a90c-76844c9b6999
resource: ms-device-service://...
prompt: select_account
```

**Binding key states:**
- `Generated` — first connection, no stored key
- `Stored` — subsequent connections reuse cached key

### Step 4: TLS Handshake with AAD P2P Certificate

Server presents AAD P2P certificate. Client validates it.

```
RDSAADAUTH::ValidateAadP2PCertificate()
  dwCertTrustErrorStatus = 0x0
  dwCertChainPolicyError = 0x0
```

### Step 5: Nonce Exchange + Authentication

Client requests nonce from AAD (`login.partner.microsoftonline.cn`), constructs authentication request, server validates and returns result.

```
AadNonceRequest: Successfully acquired nonce value from AAD
RdsAadAuthClient::OnAuthenticationResponseReceived() - Authentication result: 0x0
```

## Trace Collection

| Trace | Purpose |
|-------|---------|
| RDClient.etl | Client-side RDP protocol flow |
| MAN-RDClient.etl | Higher-level state machine transitions |
| Microsoft-Windows-AAD/Analytic | WAM token broker details |
| nettrace.etl | Network-level packet capture |

## State Machine Transitions (MAN-RDClient.etl)

```
RDPClient_TCP: TcpStateInitial → TcpStateConnectingTransport → TcpStateExpectingX244CC → TcpStateFrontAuth → TcpStatePreparingMcsCI → ...
RDPClient_SSL: TsSslStateDisconnected → Initializing → HandshakeStart → HandshakeInProgress → TsSslInRdsAadHandshake → HandshakeComplete
RDP_SEC_RDSAADAUTH_CLIENT: Not initialized → Waiting for Server Nonce → Processing Server Nonce → Waiting for Authentication Response → Processing Authentication Response → Handshake complete
```

## Common Failure Points

- Step 1: Server doesn't support `0x10` → falls back to CredSSP/NLA
- Step 2-3: WAM token acquisition fails (credential prompt, CA policy block)
- Step 4: AAD P2P certificate validation failure (`dwCertTrustErrorStatus != 0x0`)
- Step 5: Nonce request fails (network to login endpoint blocked), or server auth response error
