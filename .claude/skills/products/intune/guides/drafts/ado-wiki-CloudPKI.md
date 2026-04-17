---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/CloudPKI"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FCloudPKI"
importDate: "2026-04-05"
type: deployment-guide
---

# About Cloud PKI

Microsoft Cloud PKI is a cloud-based service that simplifies and automates the certificate lifecycle management for Intune managed devices. It provides a dedicated PKI infrastructure for each customer, without requiring any on-premises servers, connectors, or hardware.

Supports: Windows, Android, iOS, MacOS.

## Deployment Models

### 1. Microsoft Cloud PKI Root CA (Standalone)
- Creates 2-tier Root-Issuing CAs within a single Intune tenant
- Both Root CA and Issuing CAs are cloud-based, private to the tenant
- Issuing CA issues certificates via SCEP certificate profile

### 2. Bring Your Own CA (BYOCA)
- Issuing CA in cloud anchored to a private CA (e.g., ADCS)
- CSR created in Intune, signed by private CA
- Two signing methods: CA Web Enrollment or certreq.exe

## Creating Root CA
1. Sign in with Global Admin / Intune Service Admin / Cloud PKI CA create permissions
2. Tenant administration > Cloud PKI > Create
3. CA Type: Root CA (must create Root before Issuing)
4. Validity: 5/10/15/20/25 years (custom via Graph API)
5. EKUs: Select specific purposes; "Any Purpose" (2.5.29.37.0) NOT supported
6. Root CA EKUs are superset of Issuing CA constraints
7. Encryption: RSA-2048/SHA-256, RSA-3096/SHA-384, RSA-4096/SHA-512

## Creating Issuing CA
- Select Root CA source (Intune for standalone, BYOCA for external)
- Validity: 2/4/6/8/10 years (half of Root options)
- Key size and algorithm inherited from Root CA
- Contains SCEP URL needed for certificate profiles

## SCEP URI Format
```
https://{{CloudPKIFQDN}}/TrafficGateway/PassThroughRoutingService/CloudPki/CloudPkiService/Scep/{{AccountId}}/{{Registration_Authority_GUID}}
```

Kusto query to identify customer URL:
```kusto
HttpSubsystem
| where env_time > ago(10d)
| where url has "CloudPki" and url has "Scep"
| parse kind=relaxed url with * "/Scep/" acctId "/" caId "/" *
| where acctId == "xxxxxxxxx"
| project env_time, env_cloud_name, collectionName, httpVerb, statusCode, url, acctId, caId
```

**Firewall requirement**: Allow `*.manage.microsoft.com`

## BYOCA CSR Signing

### Method 1: CA Web Enrollment
1. Open .req file, copy content
2. Verify "Subordinate Certification Authority" template published on CA
3. Navigate to `https://<fqdn>/certsrv`
4. Submit advanced certificate request with SubCA template
5. Download signed cert (.cer) and full chain (.p7b)

### Method 2: certreq.exe
```powershell
certreq -submit -attrib "CertificateTemplate:SubCA" -config "DC01.Gotham.local\Gotham-RootCA" request.req certnew.cer FullChain.p7b
```
Use `certutil -config - -ping` to find CA server/name.

### Upload Signed Certificate
- Tenant administration > Cloud PKI > select CA with "Signing required"
- Upload signed certificate (.cer/.crt/.pem) + private CA keychain (.p7b)

## SCEP Policy Deployment Steps
1. Create Root Cloud PKI CA (standalone only)
2. Create Issuing CA
3. Create 2 Trusted certificate profiles (Root + Issuing)
4. Copy SCEP URI from Issuing CA
   - Test capabilities: append `/?operation=GetCACaps`
   - Test chain: append `/Certs.p7b?operation=GetCACert&message=MStest`
5. Create SCEP certificate profile with Root cert + SCEP URI

## Important Constraints
1. Cannot combine NDES SCEP URI with Cloud PKI SCEP URI in same policy
2. Cannot modify CA once created
3. CA limit: 6 servers per tenant
4. Requires Intune Suite or Cloud PKI Add-On standalone SKU
5. Licensed = HSM-backed keys; Trial = software-backed keys
6. 1024 key size and SHA-1 NOT supported
7. NOT supported for GCCH on GA release
8. "Any Purpose" EKU NOT supported

## Deleting Cloud PKI (Since 2407)
1. Pause CA → stop use
2. Revoke all leaf certificates (manual or bulk script)
3. Revoke CA
4. Delete CA
- Root CA cannot be deleted until all anchored Issuing CAs deleted
- Revoke and Delete are permanent/irreversible

## Troubleshooting - Kusto
```kusto
//Get All CAs
IntuneEvent
| where env_time >= ago(30d)
| where env_cloud_environment == "PE"
| where ApplicationName == "CloudPki"
| where ServiceName == "CloudPkiGraphService"
| where AccountId == "xxxx"
| where Col2 contains "Getting CaConfiguration" or Col2 contains "Getting all LeafCertificate records"
| project env_time, EventUniqueName, ServiceName, Col1, Col2, Col3, Col4, Col5, Col6, Message, ActivityId, ApplicationName, cV, BuildVersion, AccountId, ComponentName, ColMetadata
```

## SME Contacts
- ATZ: Carlos Jenkins, Jesus Santaella, Martin Kirtchayan, David Meza Umana, Manoj Kulkarni
- EMEA: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad, Ammar Tawabini, Jordi Segarra, Khalid Hussein
- APAC: Xinkun Yang, Joe Yang, Conny Cao, Gaurav Singh
- Teams channel: Device Config - Certificates, Email, VPN and Wifi
- Escalation email: CloudPKI-CSS-CXE@microsoft.com
- SME list: https://aka.ms/IntuneSMEs
