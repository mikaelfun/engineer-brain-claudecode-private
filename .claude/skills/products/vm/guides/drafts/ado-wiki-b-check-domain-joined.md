---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/How Tos/Azure Files Identity/How To Check If A Client Machine Is Domain Joined_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FHow%20Tos%2FAzure%20Files%20Identity%2FHow%20To%20Check%20If%20A%20Client%20Machine%20Is%20Domain%20Joined_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To Check If A Client Machine Is Domain Joined

Applicable scenarios: On-premises AD DS, Microsoft Entra Domain Services, Microsoft Entra Kerberos for hybrid user identities.

## Client-Side Validations

### 1. Windows Settings (Entra DS and AD DS)
1. Windows Key + I > System > About > Domain or Workgroup
2. System Properties shows Workgroup or Domain membership

### 2. Control Panel (Entra DS and AD DS)
1. Control Panel > System and Security > System > Domain or Workgroup
2. System Properties shows membership status

### 3. Command Prompt (Entra DS, AD DS, and Entra ID)
```
dsregcmd /status
```

Device state interpretation:

| AzureAdJoined | EnterpriseJoined | DomainJoined | Device state | Domain Authentication |
|---|---|---|---|---|
| YES | NO | NO | Microsoft Entra joined | Microsoft Entra Kerberos |
| NO | NO | YES | Domain Joined | On-Prem AD DS and Entra DS |
| YES | NO | YES | Microsoft Entra hybrid joined | Microsoft Entra Kerberos |

## Server-Side Validations

### 1. Active Directory Administrative Tools (Entra DS and AD DS)
1. Install RSAT (Remote Server Administration Tools)
2. Sign in as AAD DC Administrators group member
3. Start > Windows Administrative Tools > Active Directory Administrative Center
4. Check AADDC Computers container for domain-joined machines

### 2. Microsoft Entra Admin Center (Entra ID)
1. Sign in as Cloud Device Administrator
2. Identity > Devices > All devices
3. Registered = Pending means join not complete
4. Registered = date/time means join complete
