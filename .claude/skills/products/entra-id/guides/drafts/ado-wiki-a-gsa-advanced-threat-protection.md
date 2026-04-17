---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Advanced Threat Protection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FGSA%20Advanced%20Threat%20Protection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# GSA Advanced Threat Protection (ATP) & DLP

## Summary

Microsoft Global Secure Access integrates with Netskope (Syros) for third-party Advanced Threat Protection (ATP) and Data Loss Prevention (DLP). This provides advanced Secure Web Gateway (SWG) capabilities for Internet Access.

### Advanced Threat Protection (ATP)
- Signature-based antivirus, Web IPS, ML-based detection
- Policies created in Global Secure Access admin UI under "Threat Protection policies" -> "Secure"
- Config options: Destination (web categories/apps), Activity (upload/download/both), Actions (allow/alert/block per severity), Advanced settings (patient zero)
- Configs enforced on Netskope side; GSA routes matching traffic to Syros

### Data Loss Prevention (DLP)
- Reuses ATP infrastructure
- Monitors and controls data transfers to prevent breaches

## Case Routing

| Scenario | Queue | SAP |
|----------|-------|-----|
| Internet traffic | Azure Networking | Azure/Global Secure Access/Internet or M365 access/* |
| Web content filtering policy | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Web content filtering policies |
| Configure TLS Inspection | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Configure TLS Inspection |
| Manage TLS Certificate in Key Vault | Identity - Object and Principal Management | Azure/Global Secure Access/Internet or M365 access/Manage TLS Certificate in Key Vault |
| TLS Inspection policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/TLS Inspection policies |
| Advanced Threat Protection policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Advanced Threat Protection policies |
| Data Loss Prevention policies | Azure Networking | Azure/Global Secure Access/Internet or M365 access/Data Loss Prevention policies |
| GSA Policy API CRUD issues (propagation to Netskope) | Identity - Hybrid Auth Experiences | Azure/Global Secure Access/GSA Logs/Unable to view Alerts or Traffic logs |
| Alert type in Traffic logs but absent from Alerts blade (ICM to GSA Control Plane) | Identity - Hybrid Auth Experiences | Azure/Global Secure Access/GSA Logs/Unable to view Alerts or Traffic logs |
| Third party security solution onboarding from Marketplace | CSS PE Americas MSFT MPN T3 | Partner Center/Marketplace offers/* |
| Billing (Azure Marketplace) | MSaaS ASMS Billing and PI | Azure/Billing/Assistance with bill/Help understanding Marketplace charges |

## Requirements
- Azure Subscription associated with Entra tenant
- Azure Key Vault with Root CA certificate
- Windows 10/11 Entra ID Joined or Hybrid Joined devices
- Global Secure Access client installed
- Entra ID P1 license (contains Microsoft Entra Internet Access) or Microsoft Entra Suite

## Roles
- **Global Secure Access Administrator** - configure GSA settings
- **Conditional Access Administrator** - configure CA policies

## Known Issues

### Issue 0: The CA certificate has already been issued
Certificate name in CSR request conflicts with previously used name.
**Solution**: Supply unique Certificate name and Common name in TLS inspection settings.

### Issue 1: Events missing from Alerts blade
If an Action of type Alert appears in Traffic logs but is absent from the Alerts blade, file ICM to `GSA Control Plane`.
