---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Troubleshooting/ADFS - Troubleshooting ADFS Proxy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Troubleshooting%2FADFS%20-%20Troubleshooting%20ADFS%20Proxy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS Proxy (WAP) Troubleshooting Checklist

1. **Time sync**: Verify time is correct on all ADFS and WAP servers
2. **Prerequisites (2012 R2)**: Install required updates: KB2919355, KB3000850, KB3013769, KB3020773
3. **SSL Certificate binding check**:
   - Get service communication cert thumbprint: `Get-AdfsCertificate -CertificateType Service-Communications | select Thumbprint`
   - Run `netsh http show sslcert` on each ADFS server
   - Verify: hostname matches federation service name, thumbprint matches certhash, CTL Store = "AdfsTrustedDevices"
   - Check IP Port binding for 0.0.0.0:443
4. **Fix SSL binding mismatches**:
   - ADFS nodes: `Set-AdfsSslCertificate -Thumbprint <thumbprint>`
   - WAP nodes: `Set-WebApplicationProxySslCertificate -Thumbprint <thumbprint>`
   - For 0.0.0.0:443: delete and recreate with `netsh http` commands, appid='{5d89a20c-beab-4389-9447-324788eb944a}', sslctlstorename=AdfsTrustedDevices
5. **Certificate chain**: Check for non-self-signed certs in trusted root store, move to intermediate if found
6. **Replication**: Check ADFS MMC on secondary servers for sync status
7. **SPN check**: `setspn -f -q host/<federation service name>` and `setspn -f -q http/<federation service name>` - HOST should resolve to ADFS service account
8. **WAP IDP sign-in test**: Verify sign-in at AD FS IDP Initiated Sign-in Page from WAP servers
9. **Reset WAP trust**: `Install-WebApplicationProxy -FederationServiceName "sts.contoso.com" -CertificateThumbprint "<thumbprint>"`
