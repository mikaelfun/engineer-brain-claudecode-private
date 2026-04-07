---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======11. AAD=======/11.21 [HAADJ] Configure hybrid Azure Active Direct.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# HAADJ Configuration for Mooncake Federated Domains

Step-by-step lab guide for configuring Hybrid Azure Active Directory Join with ADFS federation in Mooncake.

## Prerequisites

1. **SSL Certificate for ADFS**: Must meet ADFS SSL certificate requirements. Can use DigiCert Certificate Utility for CSR. Pay attention to Subject Alternative Names.

2. **Convert managed domain to federated domain**

3. **Enable WS-Trust endpoints in ADFS** (critical!):
   - /adfs/services/trust/2005/windowstransport
   - /adfs/services/trust/13/windowstransport
   - /adfs/services/trust/2005/usernamemixed
   - /adfs/services/trust/13/usernamemixed
   - /adfs/services/trust/2005/certificatemixed
   - /adfs/services/trust/13/certificatemixed

4. **DNS records**: Create A record for federation service and CNAME for device registration service.

## Common Pitfall: Missing Relying Party Identifier

After standard setup, HAADJ may fail with ADFS errors. The default relying party for Mooncake only contains:
- `https://login.partner.microsoftonline.cn/extSTS.srf`
- `https://login.chinacloudapi.cn/`
- `urn:federation:partner.microsoftonline.cn`

**Fix**: Manually add `https://login.partner.microsoftonline.cn` as an identifier.

After this, `dsregcmd /status` should show AzureAdPrt = YES.

## Getting EnterprisePrt (for on-prem resource SSO)

If EnterprisePrt fails:
1. Configure device writeback in AAD Connect (run manual directory sync after)
2. Initialize Device Registration Service in ADFS server
3. Enable Device Authentication in ADFS

Verify via IdP-initiated sign-on page test.

## References
- [Configure HAADJ for federated domains](https://docs.azure.cn/en-us/active-directory/devices/hybrid-azuread-join-federated-domains)
- [Configure device writeback](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-device-writeback)
- [ADFS Device Registration Service](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/configure-a-federation-server-with-device-registration-service)
