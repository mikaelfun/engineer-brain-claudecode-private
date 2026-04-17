# AVD 域加入 (Part 1) — 排查工作流

**来源草稿**: ado-wiki-b-domain-join-failure.md, ado-wiki-create-w365-enterprise-haadj-lab.md, ado-wiki-secure-channel-domain-trust-failed.md
**Kusto 引用**: (无)
**场景数**: 20
**生成日期**: 2026-04-07

---

## Scenario 1: Most common reasons for domain join failures
> 来源: ado-wiki-b-domain-join-failure.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Account is MFA enabled
   - Wrong Username or Password
   - Account does not have permissions to join domain
   - Wrong DNS servers in vNET
   - Account is not member of AADDS (AAD DS only)
   - User did not change password (AAD DS only)

## Scenario 2: Identify why domain join failed
> 来源: ado-wiki-b-domain-join-failure.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Option 1 - ASC
   - Go to [ASC](https://azuresupportcenter.msftcloudes.com) and enter case number
   - Go to Resource Explorer -> Switch to Resource Provider View -> Expand Microsoft.Compute -> select VM that failed to join domain
   - Select Extensions
   - Expand joindomain and will see failure reason

##### Option 2 - Collect Logs
   - Collect [Inspect IaaS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#inspect-iaas) or [WVD Collect](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#wvd-collect-powershell-script)
   - Review NetSetup.LOG which is the domain join log

##### Option 3 - PowerShell
   - Ask customer to run following commands in PowerShell
```
   Install-Module Az.Compute -Scope CurrentUser
```
```
   Connect-AzAccount -subscription <subscription id>        
```
```
   Get-AzVM -ResourceGroupName <RG of the host pool> -VMName <VM that failed to join the domain> -Status
```
<br/>
---
Once have identified why domain join failed can use following troubleshooting steps:
---
<br/>

## Scenario 3: Troubleshooting
> 来源: ado-wiki-b-domain-join-failure.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Determine if customer is hitting an issue already documented on the [AVD troubleshooting docs](https://docs.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-set-up-issues#error-your-deployment-failedhostnamejoindomain)

## Scenario 4: Confirm the account is not MFA enabled
> 来源: ado-wiki-b-domain-join-failure.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Login to ASC -> go to Tenant Explorer
1. Select User -> enter user account -> click Run
1. Select User MFA Settings. Is says enabled tell customer to disable MFA on account then try again

##### Confirm the credentials are correct
   - If credentials are incorrect will see 4625 events in Security Log.
   - Collect [Inspect IaaS](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#inspect-iaas) or [WVD Collect](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464548/WVD-Logs-and-Traces#wvd-collect-powershell-script) on DC and/or VM -> filter for event 4625
   - Another option is ask customer to RDP into VM and try to join to domain manually

##### Confirm the account has permissions to join computer to domain.
   - Ask customer what groups account is member of in AD Users and Computers
   - If user is not member of Domain Admins or Administrators groups then need to confirm account has been delegated permissions to join computers to domain.
   - By default computer objects are created in Computers OU when joined to domain
   - However customer may have specified specific OU in template by selecting Yes to "Specify domain or unit"
   - In AD Users and Computers right click on OU where computer object will be created -> Properties -> Security Tab -> Advanced -> Confirm the account has following permissions on OU
   - If doesn't have correct permissions then grant correct permissions to join computer to domain

##### Confirm Distinguished name is entered in correct format
   - customer may have specified specific OU in template by selecting Yes to "Specify domain or unit"
   - OU path is the distinguished name of OU
   - To get distinguished name of OU enable Advanced features in AD Users and Computers > Right click on OU -> Properties -> Attribute Editor -> Double click distinguishedName

##### Confirm the DNS settings on the vNET
   - Ask customer what the IP's of their domain controllers are
   - In ASC go to Resource Explorer -> Switch to Resource Provider View -> Expand Microsoft.Compute -> select VM that failed to join domain
   - Scroll down and click the link next to Virtual Network
   - Confirm with customer the DNS servers are correct
   - If DNS server(s) are wrong tell customer needs to [update](https://docs.microsoft.com/en-us/azure/virtual-network/manage-virtual-network#change-dns-servers)

##### Collaboration Request
   - If need further assistance with domain join issue open a collaboration task
   - On-prem domain join: `Windows\Windows 10\Windows 10 Enterprise multi-session\Active Directory\On-premises Active Directory domain join`
   - Azure Active Directory Domain Join: `Windows\Windows 10\Windows 10 Enterprise multi-session\Active Directory\Active Directory\Azure Active Directory (AAD) join issues`
   - Azure Active Directory Domain Services domain join: `Azure\Azure Active Directory Domain Services (VM  Domain Controllers)\Azure AD Domain Services\User sign-in-domain join issues`

## Scenario 5: Create Windows 365 Enterprise HAADJ Lab Environment
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Step-by-step guide for setting up a Hybrid Azure AD Joined (HAADJ) Windows 365 Enterprise lab.

## Scenario 6: 1. Create Azure Network Infrastructure and VM
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Create resource group (FirstName_RG)
   - Create vNet (FirstName_vNet) with unique address space, /24 subnet
   - Create DC VM (Windows Server 2022 Datacenter Azure Edition, Standard B2s v2)
   - Add DNS name for RDP access

## Scenario 7: 2. Setup Azure VM as Domain Controller with ADDS
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Server Manager → Add Roles and Features → ADDS
   - Promote to domain controller → Add new forest (contoso.local)
   - Server restarts after installation

## Scenario 8: 4. Add M365 Domain as UPN Suffix
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```powershell
Get-ADForest | Set-ADForest -UPNSuffixes @{add="initialdomain.onmicrosoft.com"}
Get-ADForest | Format-List UPNSuffixes
```

## Scenario 9: 5. Create Enterprise Admin and ANC Service Account
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Create user under "Synced Users" OU → add to Enterprise Admin group
   - Set domain suffix to M365 domain, password never expire
   - Create Service Account under "Builtin" OU

## Scenario 10: 6. Delegate Permissions for ANC
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Right click Cloud PCs OU → Delegate Control → Add Computer objects

## Scenario 11: 7. Install Azure AD Connect
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Download: https://www.microsoft.com/en-us/download/details.aspx?id=47594
   - Configure sync scope to target specific OUs

## Scenario 12: 10. Sync, License, and Provision
> 来源: ado-wiki-create-w365-enterprise-haadj-lab.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Check synced account at https://portal.office.com
   - Assign Windows 365 + E5 licenses
   - Create ANC and provisioning policy

## Scenario 13: Introduction
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Windows secure channels enable encrypted communication between Cloud PCs and domain controllers. These channels are established by the NetLogon service when a device joins a domain, creating a machine account with a password that authenticates the device each time it restarts.
For Hybrid Azure AD joined Cloud PCs, network connectivity to on-premises domain controllers is required to maintain the secure channel. When this channel breaks, health checks will report `ErrorDomainTrustFailed` or `AVD Domain trust check failed`, preventing user connections.
**Important:** Secure channel issues are handled by the **Windows Directory Services team**. Windows 365 support provides initial troubleshooting only.
If issues persist after basic checks, escalate to the Directory Services team: **SAP Path - Routing Windows V3 > Windows Security Technologies > Secure channel issues**
---

## Scenario 14: Possible Secure Channel Failure Causes
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **Network issues:** SSL inspection, blocked ports, or Network Virtual Appliances (NVAs like Zscaler) interfering with domain controller traffic
   - **DNS misconfiguration:** vNET DNS settings not correctly configured
   - **Snapshot restore:** Password reverted to old state after snapshot restore or refresh
   - **Hybrid Azure AD Join:** Missing or misconfigured Azure AD Kerberos objects in Active Directory
   - **Time synchronization:** Clock skew exceeding 5 minutes between Cloud PC and domain controller
---

## Scenario 15: Health Check Indicators
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```json
{
  "HealthCheckName": "DomainTrustCheck",
  "HealthCheckResult": "HealthCheckFailed",
  "AdditionalFailureDetails": {
    "ErrorCode": -2146233088,
    "Message": "SessionHost unhealthy: VerifyDomainTrust failed..."
  }
}
```
**System Event Log (Event ID 5719):**
```text
Log Name:      System
Source:        NETLOGON
Event ID:      5719
Level:         Error
Description:
This computer was not able to set up a secure session...
```

## Scenario 16: Network Configuration
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Verify vNET DNS server entries for the ANC point to the correct DNS servers (not public DNS)
   - Ensure SSL inspection is not in use
   - If using NVAs (Zscaler, Palo Alto, Fortinet): Configure exceptions for W365/AVD traffic
   - Ensure required ports are open on the vNET used for the ANC:
   - Port 88 (Kerberos)
   - Port 389 (LDAP)
   - Port 445 (SMB)
   - Port 135 (RPC)
   - Port 53 (DNS)

## Scenario 17: Basic Testing
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Important:** When secure channel is broken, customers typically **cannot connect** to their Cloud PC.
**If customer can still access the Cloud PC** (rare):

## Scenario 18: If returns False, attempt repair:
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Test-ComputerSecureChannel -Repair

## Scenario 19: Known Third-Party Issues
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Zscaler:**
Zscaler SSL inspection or firewall policies can block domain controller traffic. Check Zscaler tunnel logs for denied connections to domain controllers. Ensure Zscaler has proper bypass rules configured for:
   - Domain controller IP addresses/FQDNs
   - Ports: 88, 389, 445, 135, 53
   - No SSL inspection on domain authentication traffic
**Other NVAs:**
Similar issues can occur with Palo Alto, Fortinet, or other network security appliances performing deep packet inspection or SSL decryption.
---

## Scenario 20: When to Escalate
> 来源: ado-wiki-secure-channel-domain-trust-failed.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Escalate to **Windows Directory Services team** when:
   - Basic network and DNS configuration checks are confirmed correctly configured
   - Customer continues to experience secure channel issues after configuration verification
   - Event ID 5719 errors persist in Cloud PC event logs
   - Health checks continue to show `ErrorDomainTrustFailed`
**Escalation Path:**
**SAP Path - Routing Windows V3 > Windows Security Technologies > Secure channel issues**
**Ensure warm handover includes:**
   - Details of connection error or health check failure
   - Confirmation of virtual network DNS configuration (LOS to DCs)
   - Confirmation of required ports (88, 389, 445, 135, 53) are open
   - NVA/Zscaler configuration status (bypasses configured)
   - SSL inspection not enabled
   - Results of `Test-ComputerSecureChannel` tests (if accessible)
   - ASC IaaS disk logs, including details of Event ID 5719 from System event log
