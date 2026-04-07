---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Test Lab & Subscriptions/Create Windows 365 Enterprise HAADJ Lab Environment"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FTest%20Lab%20%26%20Subscriptions%2FCreate%20Windows%20365%20Enterprise%20HAADJ%20Lab%20Environment"
importDate: "2026-04-05"
type: setup-guide
---

# Create Windows 365 Enterprise HAADJ Lab Environment

Step-by-step guide for setting up a Hybrid Azure AD Joined (HAADJ) Windows 365 Enterprise lab.

## 1. Create Azure Network Infrastructure and VM
- Create resource group (FirstName_RG)
- Create vNet (FirstName_vNet) with unique address space, /24 subnet
- Create DC VM (Windows Server 2022 Datacenter Azure Edition, Standard B2s v2)
- Add DNS name for RDP access

## 2. Setup Azure VM as Domain Controller with ADDS
- Server Manager → Add Roles and Features → ADDS
- Promote to domain controller → Add new forest (contoso.local)
- Server restarts after installation

## 3. Create Organizational Units
- Create OUs for Cloud PCs and Synced Users

## 4. Add M365 Domain as UPN Suffix
```powershell
Get-ADForest | Set-ADForest -UPNSuffixes @{add="initialdomain.onmicrosoft.com"}
Get-ADForest | Format-List UPNSuffixes
```

## 5. Create Enterprise Admin and ANC Service Account
- Create user under "Synced Users" OU → add to Enterprise Admin group
- Set domain suffix to M365 domain, password never expire
- Create Service Account under "Builtin" OU

## 6. Delegate Permissions for ANC
- Right click Cloud PCs OU → Delegate Control → Add Computer objects

## 7. Install Azure AD Connect
- Download: https://www.microsoft.com/en-us/download/details.aspx?id=47594
- Configure sync scope to target specific OUs

## 8. Configure HAADJ SCP
- Configure via Azure AD Connect desktop icon

## 9. Change DNS Servers on vNet
- Point vNet DNS to DC's Private IP address

## 10. Sync, License, and Provision
- Check synced account at https://portal.office.com
- Assign Windows 365 + E5 licenses
- Create ANC and provisioning policy
