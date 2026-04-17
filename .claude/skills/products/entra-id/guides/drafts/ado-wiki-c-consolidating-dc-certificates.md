---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AskDS Blog Content/20240701 Consolidating Windows Active Directory Domain Controller Certificates"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAskDS%20Blog%20Content%2F20240701%20Consolidating%20Windows%20Active%20Directory%20Domain%20Controller%20Certificates"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Consolidating Domain Controller Certificates to Kerberos Authentication Template

## Why Consolidate

ADCS creates 3 default DC certificate templates:
1. **Domain Controller** (Server 2000) - EKUs: Client Auth + Server Auth only. KDC uses any cert with template name "DomainController" for smart card logon. DCs hard-coded to auto-enroll for this template without GPO.
2. **Domain Controller Authentication** (Server 2003) - EKUs: Client Auth + Server Auth + Smart Card Logon. Supports autoenrollment (V2 template).
3. **Directory Email Replication** - For AD replication over email (rarely used, RPC is standard transport).

**Problem:** Neither Domain Controller nor Domain Controller Authentication templates have the **KDC Authentication** EKU required by current Kerberos rules.

**Solution:** Use the **Kerberos Authentication** template which includes: Client Auth + Server Auth + Smart Card Logon + KDC Authentication.

## Kerberos Authentication Certificate Requirements
1. **SAN**: DNS name of DC + DNS domain name + NetBIOS domain name
2. **Key Usage**: Digital Signature + Key Encipherment
3. **EKU**: Client Authentication + Server Authentication + Smart Card Logon + KDC Authentication
4. **Certificate Template Extension**: DomainController (BMPstring encoded)
5. **Trusted CA** by both DC and client systems

## Configuration Steps

### Step 1: Configure Kerberos Authentication Template
1. CertSrv.msc > Certificate Templates > Manage
2. Open Kerberos Authentication template properties
3. Set validity/renewal periods
4. **Superseded Templates tab**: Add Domain Controller, Domain Controller Authentication, and Directory Email Replication templates
5. Apply > OK

### Step 2: Remove Old Templates from CA
Delete Domain Controller, Domain Controller Authentication, and Directory Email Replication from the CA Certificate Templates folder (removes from issuance, not from AD).

### Step 3: Replicate and Publish
1. Wait for AD replication or run: `repadmin /syncall`
2. Right-click Certificate Templates > New > Certificate Template to Issue
3. Select Kerberos Authentication template
4. Optionally restart CA service to speed up template availability

## Enrollment Network Requirements (Critical)

The Kerberos Authentication template has special flags:
- `CT_FLAG_SUBJECT_ALT_REQUIRE_DOMAIN_DNS` (0x400000)
- `CT_FLAG_SUBJECT_ALT_REQUIRE_DNS` (0x8000000)

**CA must make RPC callback to the requesting DC** using LsarOpenPolicy/LsarQueryInformationPolicy to validate DNS domain name.

**Required:**
- Ports **135 and 445** open from CA to DC
- **NTLMv2 enabled** on the DC (SMB transport used for LSAD calls)
- If NTLMv2 is disabled, enrollment will fail even if ports are open
