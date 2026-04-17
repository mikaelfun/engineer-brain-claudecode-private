# NDES/SCEP Certificate Deployment Lab Setup Guide

**Source**: OneNote — Intune MISC / Lab - NDES (5 pages)
**Status**: draft

## Overview

End-to-end lab guide for setting up NDES (Network Device Enrollment Service) with SCEP certificate deployment via Intune. This is the recommended approach for on-premises certificate deployment, especially for 21v/Mooncake environments where Cloud PKI is not available.

**Reference**: [Support Tip - How to configure NDES for SCEP certificate deployments in Intune](https://techcommunity.microsoft.com/t5/intune-customer-success/support-tip-how-to-configure-ndes-for-scep-certificate/ba-p/455125)

## Prerequisites

1. **Hybrid Azure AD Join (HAADJ)** configured
2. **Intune** enrollment set up
3. **NDES Service Account**: Domain user account for running NDES service and requesting certs from CA
   - Create in AD DC (e.g., `NdesService@domain.com`)
4. **Users and Groups**: AD users synced to AAD, AAD group created, licenses assigned (users need location attribute)

## Step 1: Build and Configure CA

1. Install CA on on-premises DC
   - Recommended: [Install CA (2016+)](https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/install-the-certification-authority)
2. Configure CA for NDES per [Microsoft docs](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-scep-configure#configure-the-certification-authority)
3. Create **SCEP Certificate Template** (for device certs — signing/encryption)
4. Create **Server Certificate Template** (optional, for IIS; can use 3rd-party cert instead)
5. Set certificate permissions for NDES service account
6. Allow configurable certificate validity period:
   ```cmd
   certutil -setreg Policy\EditFlags +EDITF_ATTRIBUTEENDDATE
   net stop certsvc
   net start certsvc
   ```
7. Publish the templates in CA

## Step 2: Install and Configure NDES

**Important**: If publishing NDES to Internet, you need a valid DNS zone. If on-prem domain has different DNS suffix than Azure verified domain, add both DNS names in certificate SAN.

1. Set SPN for NDES service account:
   ```cmd
   setspn -s http/<ndes-server-fqdn> domain\NdesService
   ```
2. Add NDES role on the server
3. Install required IIS features (critical for Connector later):
   - See [Prerequisites](https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-prerequisites#general-prerequisites)
4. Configure NDES service with the service account
5. Configure IIS bindings
6. Update registry to point to correct certificate template
7. Restart NDES server
8. **Configure IIS SSL binding** with valid certificate (DigiCert or internal CA)
9. Verify: Browse `https://<server>/certsrv/mscep/mscep.dll` — should show 403 (expected) without cert warning

## Step 3: Install Certificate Connector

**Internal doc**: [Intune: New Certificate Connector tips and tricks](https://internal.evergreen.microsoft.com/en-us/topic/3364fd81-8bf3-0a5d-9d5c-aad35734d7b4)

1. Download connector: https://go.microsoft.com/fwlink/?linkid=2168535
2. Install on NDES server
3. Connector UI path: `C:\Program Files\Microsoft Intune\PFXCertificateConnector\ConnectorUI\PFXCertificateConnectorUI.exe`
   - Shortcut: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Microsoft Intune`
   - If exe not found, re-run installer to access configuration page
4. Configure with domain account (needs local admin rights)
5. Enable SCEP feature in connector

### Optional: Publish NDES to Internet

1. Create external load balancer with NDES server as backend pool
2. Create NAT rule for port 443 only
3. Add A record in DNS zone pointing to load balancer public IP
4. If VNET has NSG, allow test device IP

### Testing

```
Internal: https://<internal_DNS>/certsrv/mscep/mscep.dll?operation=GetCACaps
External: https://<external_DNS>/certsrv/mscep/mscep.dll?operation=GetCACaps
```
Valid response should return supported CA operations list.

## Step 4: Create Trusted Certificate Profile

1. Export trusted root CA certificate from CA server
   - See [Export Root CA Certificate](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/export-root-certification-authority-certificate)
2. Create Trusted Certificate Profile in Intune admin center
3. Upload the exported root CA certificate
4. Assign to target device/user groups

## Step 5: Create SCEP Certificate Profile

(Configure in Intune admin center, assign to groups)

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| NDES page shows cert warning | IIS SSL binding missing/wrong cert | Reconfigure IIS HTTPS binding |
| Connector install fails | Missing IIS features | Install prerequisites per MS docs |
| GetCACaps returns error | Binding lost after reconfig | Re-bind certificate in IIS, iisreset |
