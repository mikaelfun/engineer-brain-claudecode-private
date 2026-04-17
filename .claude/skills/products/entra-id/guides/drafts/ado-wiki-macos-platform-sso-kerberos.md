---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Apple Devices/MacOS Platform SSO Configuring Kerberos SSO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FApple%20Devices%2FMacOS%20Platform%20SSO%20Configuring%20Kerberos%20SSO"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# MacOS Platform SSO - Configuring Kerberos SSO

## Prerequisites
- macOS with Platform SSO enabled
- Microsoft Entra Kerberos configured on on-premises resource side
- Domain Controller and on-premises resources accessible from macOS
- DNS server on macOS pointing to on-premises DC

## Configuration Steps

### 1. Create Kerberos SSO MDM Profile for On-premises AD
1. Intune admin center > Devices > macOS > Configuration > Create > New Policy
2. Profile type: Templates > Custom
3. Copy XML from MS docs, edit domain-specific values, save as .mobileconfig
4. Upload: Custom config name (any), Deployment channel: Device, upload .mobileconfig file
5. Assign to devices (Add all devices or device group)

### 2. Create Kerberos SSO MDM Profile for Microsoft Entra ID
- Same procedure but with different profile content per docs

### 3. Verify Profiles on macOS
- System Settings > Privacy & Security > Profiles
- Should see two profiles: Entra ID Cloud Kerberos + On-premises AD

### 4. Verify Kerberos Tickets
```bash
app-sso platform -s
```
- Synced users: tgt_ad (on-prem) + tgt_cloud (Entra ID)
- Cloud-only users: tgt_cloud only

### 5. SSO Experience
- Access on-prem shared folders via Finder > Connect to Server without credential prompt

> Note: "Customize Kerberos TGT setting" step is generally unnecessary - both on-prem and cloud TGTs issued by default when issuing via Entra ID.
