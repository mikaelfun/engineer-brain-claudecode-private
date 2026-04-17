---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: How to build your lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20How%20to%20build%20your%20lab"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows Hello for Business - How to Build Your Lab

## Deploy Hybrid Certificate Trust

Use the step-by-step guide: [Deploy your WHfB LAB (All Trusts).pptx](https://microsofteur.sharepoint.com/:p:/t/Community-StrongAuthMethods/EQ6DpcznD1hHiqnJT5dWJuIBpi6uoC1MVX1VC5b00mobpA?e=3DcXKq)

## Deploy Hybrid Azure AD Joined Key Trust with Intune

### Prerequisites

| Component | Requirement |
|-----------|-------------|
| On-premises AD | Domain/Forest functional level: Windows Server 2008 R2 minimum. Adequate number of Windows Server 2016 DCs per site. Schema upgraded to Windows2016Forest. |
| Azure AD | Azure AD tenant with custom domains added and verified (matching users' UPN) |
| PKI | Enterprise PKI as trust anchor. Key trust: no client certs needed (public key mapping via AAD Connect). Cert trust: DC certificates required. |
| Directory Sync | Azure AD Connect to sync user accounts |
| Federation | Non-federated: Password Sync or Pass-through Auth. Federated: AD FS 2012 R2+ |
| MFA | Azure MFA service or AD FS 2012 R2+ MFA adapter |
| Device Registration | Domain-joined devices must register to Azure AD |
| Intune | Intune subscription. Every user needs Intune license. |
| Client | Windows 10 build 1709 or later |

### Step-by-Step Configuration

#### 1. Enable Device Registration (Azure Portal)
- Login as Global Admin → Azure Active Directory → Devices → Device Settings
- "Users may join devices to Azure AD" → Select users/groups or ALL

#### 2. Create Service Connection Point (AAD Connect)
- Launch AAD Connect Config Wizard → Configure → Configure Device options → Next
- Enter Azure AD Global Admin credentials
- Select "Configure Hybrid Azure AD Join" → Next
- Select Forest, set Authentication Provider to Federation Service, add on-prem Enterprise Admin creds
- Check "Windows 10 or later domain-joined Devices" → Configure → Exit

#### 3. Refresh Directory Schema (if AD upgraded to 2016 after AAD Connect install)
- AAD Connect Config Wizard → Configure → Refresh Directory schema → Next
- Enter Azure AD Global Admin credentials
- Select Forest(s) → Next
- Check "Start synchronization process when configuration completes" → Configure → Exit

#### 4. AAD Connect Service Account Permissions
- Add AAD Connect service account to **KEY ADMINS** AD Security Group
- This grants read/write access to `msDS-KeyCredentialLink` attribute
- KEY ADMINS group requires PDC on Server 2016 DC
- Ref: [Key trust directory sync settings](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-key-whfb-settings-dir-sync)

#### 5. Domain Controller Certificates
- Follow: [PKI settings for key trust](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-key-whfb-settings-pki)

#### 6. Device Registration via Group Policy
- Create/edit GPO: Computer Configuration → Administrative Templates → Windows Components → MDM → Auto MDM Enrolment with AAD Token
- Target at all Windows 10 devices
- This triggers both Azure AD Device Registration AND Intune enrollment

#### 7. Intune MDM User Scope
- Azure Portal → Azure Active Directory → Mobility (MDM and MAM) → Microsoft Intune
- Configure MDM User scope: All or Some (select groups)
- Use default values for MDM URLs (Terms of use, Discovery, Compliance)

#### 8. Intune WHfB Policy
- Azure Portal → All Services → Intune → Device enrollment → Windows enrollment → Windows Hello for Business
- Configure Default settings with Name and Description
- Set desired WHfB settings under Properties
