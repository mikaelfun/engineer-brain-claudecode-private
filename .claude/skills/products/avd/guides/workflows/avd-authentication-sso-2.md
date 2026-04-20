# AVD 认证与 SSO (Part 2) — Troubleshooting Workflow

**Scenario Count**: 10
**Generated**: 2026-04-18

---

## Scenario 1: Workgroup (non-AAD-joined) Windows client fails to RDP conne...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Add targetisaadjoined:i:1 as custom RDP property to the host pool to enable RDSTLS protocol fallback for non-joined clients. Alternatively, enable enablerdsaadauth:i:1 on both host pool and VM for full RDS AAD Auth SSO experience

**Root Cause**: CredSSP fallback is not supported from workgroup/non-joined clients to AADJ VMs. When RdsAADAuth is disabled on the VM, the connection attempts CredSSP which fails for non-domain-joined source machines

## Scenario 2: Windows Hello For Business (WHfB) authentication fails when ...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth issuingCA.cer
- 2
- Fix firewall rules for DC-to-CA connectivity
- 3
- Enroll Azure DCs for KDC certificates
- Ref: Hybrid Azure AD joined WHfB PKI setup

**Root Cause**: Two missing prerequisites: (1) Issuing CA certificate for KDC certificate not in NTAuth store, (2) Azure domain controllers not enrolled for KDC certificates due to missing firewall rules between DCs and Certificate Authority

## Scenario 3: All users in all host pools fail to connect to AVD session h...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Check SSL Cipher Suite Order GPO via gpresult
- 2
- Verify registry HKLM\SYSTEM\CurrentControlSet\Control\Cryptography includes AES128-SHA256
- 3
- Ensure all AVD-required ciphers (matching Azure Front Door cipher suite) are enabled
- Ref: ADO Wiki - TLS or Cipher Mismatch.

**Root Cause**: Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door for AVD connections) was disabled or removed from the session host via SSL Cipher Suite Order GPO. All AVD connections go through Azure Front Door, which requires specific TLS 1.2 ciphers.

## Scenario 4: AVD users fail to connect frequently with error 'Reverse Con...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Use Kusto DiagActivity+DiagError join to identify failed connections and error codes
- 2
- Query RDInfraTrace to find which rdgateway handles successful vs failed connections
- 3
- Verify network path to all rdgateway endpoints (rdgateway-c100/c101-cne2/cnn2-r1.wvd.azure.cn)
- 4
- Check VPN split-tunneling configuration
- 5
- Ensure ADFS endpoint reachable if federated auth is used.

**Root Cause**: Network connectivity issue between client and AVD rdgateway endpoints. VPN routes traffic differently; without VPN, client cannot reliably reach rdgateway. Packet loss observed to gateway endpoints from client network. ADFS endpoint accessibility may also be a factor.

## Scenario 5: ADFS SSO for AVD does not work in Azure AD DS (AADDS) enviro...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Use on-premises AD FS with federated authentication. Deploy AD FS server (not AADDS). Only Windows Desktop/Web client supports ADFS SSO. For AADDS, consider Azure AD SSO (Entra ID SSO) instead.

**Root Cause**: AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS, (2) Requires AD FS federated authentication, (3) Only supported on Windows Desktop client and Web client.

## Scenario 6: Users get self-signed certificate not trusted prompt via WVD...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Change RDP setting to RDP will use CredSSP from WVD portal and refresh subscriptions in MSRDC client.

**Root Cause**: CredSSP for RDP was disabled in the Azure portal (enablecredsspsupport:i:0).

## Scenario 7: Entra joined VM: 'A specified logon session does not exist. ...
> Source: MS Learn | Applicable: ❓

### Troubleshooting Steps
- Verify Kerberos server object is properly created and configured per SSO configuration guide

**Root Cause**: Kerberos server object not properly created/configured for SSO

## Scenario 8: AVD session establishes then immediately logs off. RDInfra t...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Disable NLA via Azure Portal script, restart VM
- 2) Re-enable NLA
- Issue resolved after reboot cycle
- 3) Monitor VM Insights for performance issues.

**Root Cause**: VM-level issue (suspected NLA configuration or performance problem) causing session to force logoff immediately after connection establishment.

## Scenario 9: AVD session establishes then immediately logs off. RDInfra t...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Disable NLA via Azure Portal script, restart VM
- 2) Re-enable NLA
- Issue resolved after reboot cycle
- 3) Monitor VM Insights for performance issues.

**Root Cause**: VM-level issue (suspected NLA configuration or performance problem) causing session to force logoff immediately after connection establishment.

## Scenario 10: AVD auto scaling script fails with 'The remote name could no...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Re-run the script after Log Analytics workspace is fully provisioned. Verify DNS resolution for the ODS endpoint. For Mooncake, ensure endpoint uses .azure.cn domain.

**Root Cause**: Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Workspace may not be fully provisioned yet, or network/DNS configuration blocking the endpoint.
