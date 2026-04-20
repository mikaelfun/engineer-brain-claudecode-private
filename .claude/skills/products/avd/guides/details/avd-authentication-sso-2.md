# AVD AVD 认证与 SSO (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ContentIdea, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Workgroup (non-AAD-joined) Windows client fails to RDP connect to Azur... | CredSSP fallback is not supported from workgroup/non-joined clients to... | Add targetisaadjoined:i:1 as custom RDP property to the host pool to e... |
| Windows Hello For Business (WHfB) authentication fails when RDP to Azu... | Two missing prerequisites: (1) Issuing CA certificate for KDC certific... | 1. Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth ... |
| All users in all host pools fail to connect to AVD session hosts. RD C... | Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door fo... | 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify registry H... |
| AVD users fail to connect frequently with error 'Reverse Connect to rd... | Network connectivity issue between client and AVD rdgateway endpoints.... | 1. Use Kusto DiagActivity+DiagError join to identify failed connection... |
| ADFS SSO for AVD does not work in Azure AD DS (AADDS) environment. SSO... | AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS... | Use on-premises AD FS with federated authentication. Deploy AD FS serv... |
| Users get self-signed certificate not trusted prompt via WVD desktop c... | CredSSP for RDP was disabled in the Azure portal (enablecredsspsupport... | Change RDP setting to RDP will use CredSSP from WVD portal and refresh... |
| Entra joined VM: 'A specified logon session does not exist. It may alr... | Kerberos server object not properly created/configured for SSO | Verify Kerberos server object is properly created and configured per S... |
| AVD session establishes then immediately logs off. RDInfra trace shows... | VM-level issue (suspected NLA configuration or performance problem) ca... | 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. ... |
| AVD session establishes then immediately logs off. RDInfra trace shows... | VM-level issue (suspected NLA configuration or performance problem) ca... | 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. ... |
| AVD auto scaling script fails with 'The remote name could not be resol... | Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Wor... | Re-run the script after Log Analytics workspace is fully provisioned. ... |

### Phase 2: Detailed Investigation

#### Entry 1: Workgroup (non-AAD-joined) Windows client fails to RDP conne...
> Source: OneNote | ID: avd-onenote-010 | Score: 8.5

**Symptom**: Workgroup (non-AAD-joined) Windows client fails to RDP connect to Azure AD-joined AVD session host with your credentials did not work error, when RdsAADAuth is enabled in host pool but disabled on the VM

**Root Cause**: CredSSP fallback is not supported from workgroup/non-joined clients to AADJ VMs. When RdsAADAuth is disabled on the VM, the connection attempts CredSSP which fails for non-domain-joined source machines

**Solution**: Add targetisaadjoined:i:1 as custom RDP property to the host pool to enable RDSTLS protocol fallback for non-joined clients. Alternatively, enable enablerdsaadauth:i:1 on both host pool and VM for full RDS AAD Auth SSO experience

> 21V Mooncake: Applicable

#### Entry 2: Windows Hello For Business (WHfB) authentication fails when ...
> Source: OneNote | ID: avd-onenote-044 | Score: 8.5

**Symptom**: Windows Hello For Business (WHfB) authentication fails when RDP to Azure-hosted AVD session hosts. Face/fingerprint/PIN login fails while AD user/password works

**Root Cause**: Two missing prerequisites: (1) Issuing CA certificate for KDC certificate not in NTAuth store, (2) Azure domain controllers not enrolled for KDC certificates due to missing firewall rules between DCs and Certificate Authority

**Solution**: 1. Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth issuingCA.cer. 2. Fix firewall rules for DC-to-CA connectivity. 3. Enroll Azure DCs for KDC certificates. Ref: Hybrid Azure AD joined WHfB PKI setup

> 21V Mooncake: Applicable

#### Entry 3: All users in all host pools fail to connect to AVD session h...
> Source: OneNote | ID: avd-onenote-062 | Score: 6.5

**Symptom**: All users in all host pools fail to connect to AVD session hosts. RD Client shows TlsHandshake to CredSSPState then disconnects with ConnectionBroken(8). Session host Schannel Event ID 36874: 'An TLS 1.2 connection request was received but none of the cipher suites supported by the client are supported by the server.'

**Root Cause**: Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door for AVD connections) was disabled or removed from the session host via SSL Cipher Suite Order GPO. All AVD connections go through Azure Front Door, which requires specific TLS 1.2 ciphers.

**Solution**: 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify registry HKLM\SYSTEM\CurrentControlSet\Control\Cryptography includes AES128-SHA256. 3. Ensure all AVD-required ciphers (matching Azure Front Door cipher suite) are enabled. Ref: ADO Wiki - TLS or Cipher Mismatch.

> 21V Mooncake: Applicable

#### Entry 4: AVD users fail to connect frequently with error 'Reverse Con...
> Source: OneNote | ID: avd-onenote-074 | Score: 6.5

**Symptom**: AVD users fail to connect frequently with error 'Reverse Connect to rdgateway-*.wvd.azure.cn failed with error 0x80072F7D. Make sure it is reachable from your network.' Connection works when VPN is on but fails when VPN is off or after idle period.

**Root Cause**: Network connectivity issue between client and AVD rdgateway endpoints. VPN routes traffic differently; without VPN, client cannot reliably reach rdgateway. Packet loss observed to gateway endpoints from client network. ADFS endpoint accessibility may also be a factor.

**Solution**: 1. Use Kusto DiagActivity+DiagError join to identify failed connections and error codes. 2. Query RDInfraTrace to find which rdgateway handles successful vs failed connections. 3. Verify network path to all rdgateway endpoints (rdgateway-c100/c101-cne2/cnn2-r1.wvd.azure.cn). 4. Check VPN split-tunneling configuration. 5. Ensure ADFS endpoint reachable if federated auth is used.

> 21V Mooncake: Applicable

#### Entry 5: ADFS SSO for AVD does not work in Azure AD DS (AADDS) enviro...
> Source: OneNote | ID: avd-onenote-068 | Score: 6.5

**Symptom**: ADFS SSO for AVD does not work in Azure AD DS (AADDS) environment. SSO only available with federated authentication on Windows Desktop/Web client.

**Root Cause**: AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS, (2) Requires AD FS federated authentication, (3) Only supported on Windows Desktop client and Web client.

**Solution**: Use on-premises AD FS with federated authentication. Deploy AD FS server (not AADDS). Only Windows Desktop/Web client supports ADFS SSO. For AADDS, consider Azure AD SSO (Entra ID SSO) instead.

> 21V Mooncake: Applicable

#### Entry 6: Users get self-signed certificate not trusted prompt via WVD...
> Source: ContentIdea | ID: avd-contentidea-kb-028 | Score: 6.5

**Symptom**: Users get self-signed certificate not trusted prompt via WVD desktop client and cannot proceed.

**Root Cause**: CredSSP for RDP was disabled in the Azure portal (enablecredsspsupport:i:0).

**Solution**: Change RDP setting to RDP will use CredSSP from WVD portal and refresh subscriptions in MSRDC client.

> 21V Mooncake: Applicable

#### Entry 7: Entra joined VM: 'A specified logon session does not exist. ...
> Source: MS Learn | ID: avd-mslearn-027 | Score: 5.5

**Symptom**: Entra joined VM: 'A specified logon session does not exist. It may already have been terminated'

**Root Cause**: Kerberos server object not properly created/configured for SSO

**Solution**: Verify Kerberos server object is properly created and configured per SSO configuration guide

> 21V Mooncake: Not verified

#### Entry 8: AVD session establishes then immediately logs off. RDInfra t...
> Source: OneNote | ID: avd-onenote-059 | Score: 5.5

**Symptom**: AVD session establishes then immediately logs off. RDInfra trace shows RdpStackDisconnect with UserLogoff, force logoff due to critical failure (LogoffReason 12). Reproducible via direct RDP.

**Root Cause**: VM-level issue (suspected NLA configuration or performance problem) causing session to force logoff immediately after connection establishment.

**Solution**: 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. Issue resolved after reboot cycle. 3) Monitor VM Insights for performance issues.

> 21V Mooncake: Applicable

#### Entry 9: AVD session establishes then immediately logs off. RDInfra t...
> Source: OneNote | ID: avd-onenote-059 | Score: 5.5

**Symptom**: AVD session establishes then immediately logs off. RDInfra trace shows RdpStackDisconnect with UserLogoff, force logoff due to critical failure (LogoffReason 12). Reproducible via direct RDP.

**Root Cause**: VM-level issue (suspected NLA configuration or performance problem) causing session to force logoff immediately after connection establishment.

**Solution**: 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. Issue resolved after reboot cycle. 3) Monitor VM Insights for performance issues.

> 21V Mooncake: Applicable

#### Entry 10: AVD auto scaling script fails with 'The remote name could no...
> Source: OneNote | ID: avd-onenote-067 | Score: 5.5

**Symptom**: AVD auto scaling script fails with 'The remote name could not be resolved' for *.ods.opinsights.azure.com endpoint when creating Log Analytics custom log table.

**Root Cause**: Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Workspace may not be fully provisioned yet, or network/DNS configuration blocking the endpoint.

**Solution**: Re-run the script after Log Analytics workspace is fully provisioned. Verify DNS resolution for the ODS endpoint. For Mooncake, ensure endpoint uses .azure.cn domain.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
