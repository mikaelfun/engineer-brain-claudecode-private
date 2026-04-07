# NDES SCEP Configuration End-to-End Guide

## Phase 1: NDES Server Installation

### Service Account Setup
1. Create AD service account in Active Directory Users and Computers
2. On NDES computer: add account to local **IIS_IUSRS** group (`compmgmt.msc`)
3. On Enterprise CA: add account with **Request Certificates** permission (Security tab)
4. Set SPN: `setspn -s http/<NDES-FQDN> <domain>\<service-account>`
   > **Warning**: Check [MS docs](https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/create-domain-user-account-ndes-service-account#verify-whether-its-necessary-to-set-a-service-principal-name-for-ndes) before registering SPN to avoid duplicate SPN issues.

### NDES Role Installation
1. Server Manager → Add Roles and Features → AD CS → Network Device Enrollment Service
2. Post-install: Configure NDES → select service account → connect Enterprise CA
3. **CA and NDES must be on separate servers**

## Phase 2: NDES Server Configuration

### IIS Long URL Support
1. IIS Manager → Default Website → Request Filtering → Edit Feature Settings
   - If missing: `Install-WindowsFeature Web-Filtering`
2. Set Maximum URL length and Maximum query string to high values
3. Registry: `HKLM\SYSTEM\CurrentControlSet\Services\HTTP\Parameters` — edit URL/query limits

### Azure Application Proxy (for external access)
1. Azure Portal → Enterprise Applications → Add → On-premises application
2. Internal URL = `https://<NDES-internal-FQDN>/certsrv/mscep/mscep.dll`
3. Note the generated External URL
4. **For 21v (Azure China)**: Install proxy agent with China cloud flag:
   ```cmd
   MicrosoftEntraPrivateNetworkConnectorInstaller.exe ENVIRONMENTNAME=AzureChinaCloud
   ```

### SSL Certificate
1. On CA: duplicate **Web Server** template → name "NDES SSL certificate"
2. Extensions: include Client + Server Authentication
3. Security: NDES computer account → Read + Enroll
4. Subject Name: Supply in the request
5. On NDES: Request cert with CN = internal FQDN, SAN DNS = internal + external FQDN
6. IIS → Default Web Site → Bindings → Add → HTTPS port 443 with new SSL cert

### NDES Certificate Template
1. On CA: duplicate **User** template → set display name
2. Subject Name: Supply in the request
3. Extensions: Client Authentication
4. Key Usage: un-check "Signature is proof of origin (nonrepudiation)" for iOS compatibility
5. Request Handling: do NOT allow private key export
6. Security: NDES service account → Read + Enroll
7. Cryptography: minimum key size 2048
8. Issue the template

### Registry Key Mapping
On NDES server: `HKLM\Software\Microsoft\Cryptography\MSCEP`
- **SignatureTemplate** → maps to "Digital signature" key usage in SCEP profile
- **EncryptionTemplate** → maps to "Key encipherment" key usage
- **GeneralPurposeTemplate** → maps to both (Signature and encryption)

Set the template name in the registry key matching your template's purpose.

## Phase 3: Intune Connector Installation

1. Download from: Intune Portal → Tenant Administration → Connectors and tokens → Certificate Connectors → Add
2. Run on NDES server with Admin rights, select SCEP features
3. Service account: use NDES service account (needs Admin group + "Log on as a service")
   - `Local Security Policy → Local Policies → User Rights Assignment → Log on as a service`
4. Sign in with **Global Administrator or Intune Administrator**
5. If AAD sign-in loops: turn off IE ESC (Server Manager → Local Server)
6. **Restart NDES server after installation**

## Phase 4: Intune Profile Creation

### Trusted Certificate Profile
- Export root cert: `certutil -ca.cert C:\root.cer`
- For Android: export from BOTH root CA and issuing CA
- For iOS: only root CA needed

### SCEP Certificate Profile
- Key usage must match registry template mapping
- SCEP Server URL: `https://<external-FQDN>/certsrv/mscep/mscep.dll`
- Link to Trusted Certificate profile
- Assign to target groups

---
*Source: OneNote — Support Tip - How to configure NDES for SCEP certificate deployments in Intune*
