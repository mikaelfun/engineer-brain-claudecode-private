# WHFB Support Scope & Routing Reference

## Summary
Quick reference for which CSS team handles which WHFB-related scenario. Use when triaging or transferring WHFB cases.

## Routing Table

| Scenario | Support Topic | CSS Team |
|----------|--------------|----------|
| Upgrade AD Schema | Active Directory > Schema Updates | Windows Directory Services |
| Domain/Forest Functional Level | Active Directory > Functional level updates | Windows Directory Services |
| DCPromo | Active Directory > DCPromo and DC installation | Windows Directory Services |
| AD SCP (Service Connection Point) | Entra Connect Sync > Problem configuring AADConnect | AAD - Sync |
| GMSA Configuration | Active Directory > Managed Service Accounts | Windows Directory Services |
| DNS for ADFS/Device Reg | Network > DNS | Windows Networking |
| Entra Connect Sync Issues | Entra User Provisioning > Sync incorrect results | AAD - Sync |
| Entra Connect Device Write-back | Device Registration | AAD - Sync |
| Entra Connect Installation | AAD Connect installation and upgrade | AAD - Sync |
| ADFS New Deploy/Upgrade | Entra Sign-in and MFA > ADFS deployment/upgrade | AAD - Authentication |
| ADFS Configuration | Entra Sign-in and MFA > ADFS > First time config | AAD - Authentication |
| ADFS WAP | Entra Sign-in and MFA > ADFS > WAP problem | AAD - Authentication |
| ADFS Device Registration | Entra Sign-in and MFA > ADFS > deployment/upgrade | AAD - Authentication |
| ADFS Claims Config | Entra Sign-in and MFA > ADFS > Claims/CP Trust | AAD - Authentication |
| ADFS Cert Reg Authority | Entra Sign-in and MFA > ADFS > deployment/upgrade | AAD - Authentication |
| CA Deployment | PKI > ADCS | Windows Directory Services |
| Certificate Issuance | PKI > Certificate Enrollment | Windows Directory Services |
| Certificate Template | PKI > ADCS | Windows Directory Services |
| Kerberos Auth | Security > Kerberos authentication | Windows Directory Services |
| Group Policy | Group Policy > Problems applying | Windows Directory Services |
| Entra Custom Domain | Entra Domains > Verifying domain name | AAD - Authentication |
| Entra MFA | Entra Sign-in and MFA > MFA deployment | AAD - Authentication |
| MFA Server (On-Prem) | MFA Server > Settings configuration | AAD - Authentication |
| MFA Server User Portal | MFA > User portal + Phone app | AAD - Authentication |
| Entra Tenant Management | Entra Domains > Directory Management | AAD - Authentication |
| Entra Device Registration | Cloud Device Registration > AAD Join (on-prem) | AAD - Authentication |

## Key Takeaway
- **AAD - Authentication**: ADFS, MFA, Device Registration, Domain, Tenant
- **AAD - Sync**: Entra Connect, Device Write-back
- **Windows Directory Services**: AD, PKI, Kerberos, GPO, GMSA, Schema
- **Windows Networking**: DNS

## Source
- [WHFB SAP Reference](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1699847/Hello-for-Business?anchor=support-area-path-(sap))
- OneNote: Mooncake POD Support Notebook > WHFB > Scope
