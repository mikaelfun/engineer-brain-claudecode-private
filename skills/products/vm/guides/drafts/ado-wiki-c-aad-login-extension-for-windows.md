---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/TSGs/VM Responding/AAD Login Extension for Windows_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FTSGs%2FVM%20Responding%2FAAD%20Login%20Extension%20for%20Windows_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Introduction

### What is the AADLogin Extension?

The AADLoginForWindows VM extension enables Azure AD Join for Azure VMs by triggering `dsregcmd.exe`. Once the VM is Azure AD joined and the extension is successfully installed, organizations can grant managed and federated users Azure RBAC permissions to log in via RDP to Windows Server 2019 Azure VMs.

Benefits:
- Enforcing Azure AD password complexity and lifetime policies
- Reducing the need for unprotected local administrator accounts
- Enabling multi-factor authentication or conditional access policies
- Simplifying account management with Azure RBAC

> **Note:** Currently supported only on Windows Server 2019.

### AADLoginForWindows Provisioning Flow

1. VM admin deploys Windows Server 2019 VM and installs AADLoginForWindows extension
2. Extension triggers `dsregcmd.exe` to check/initiate Azure AD Join using MSI credential
3. Process queries IMDS for VM metadata and Azure AD Tenant ID, discovers ADRS endpoint
4. Using access token, performs Azure AD Join (creates asymmetric key, CSR, self-signed cert)
5. VM pulls self-signed "MS-Organization-P2P-Access [2019]" certificate
6. VM Owner assigns RBAC roles (Virtual Machine User Login / Administrator Login)

Logs: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ActiveDirectory.AADLoginForWindows\0.3.1.0\CommandExecution_*.log`

## Support Boundaries

| Scenario | Supported By | PG Escalation |
|----------|-------------|---------------|
| RDP fails for default local admin after removing AADLogin extension | IaaS Connect Vertical | IcM to CRP PG |
| Outbound network traffic from VM to Internet failing | Azure Networking POD | |
| RBAC Role assignment issues | AAD - Account Management | IcM to Policy Administration Service PG |
| New VM deployment with AADLogin fails | AAD - Authentication | IcM to Policy Administration Service PG |
| Extension install/update/removal fails (other extensions work) | AAD - Authentication | IcM to Policy Administration Service PG |
| RDP works for local admin, AAD login fails | AAD - Authentication | IcM to ESTS PG |
| Extension fails to add/remove users from local groups on RBAC change | AAD - Authentication | AAD - Authentication |
| Managed/federated users with RBAC roles fail to log in | AAD - Authentication | IcM to ESTS PG |

SAP: `Azure\Virtual Machine running Windows (or Linux)\VM Extensions not operating correctly\Azure Active Directory Login extension issue`

### Custom Image Entra ID Login Validation

Azure Portal cannot determine whether a custom image supports Entra ID login. However, it may be possible via Azure CLI, ARM templates, or Az PowerShell. The `supportsAADLogin?` property exists in Marketplace Image Definition but not for custom images.

Reference: ICM 593794159

## Bastion Host Issues

### Issues Related to Bastion Host Directly

If Bastion Host appears as failed in ASC or throws deployment errors, escalate to Azure Networking. Bastion logs are under NRP.

### Connectivity Between Bastion and VMs

1. Check if VM accepts connections on default RDP/SSH ports
2. If direct RDP/SSH fails, follow standard TSGs
3. If direct works but Bastion fails, escalate to Azure Networking

### Symptom 1: Bastion fails, VM is unhealthy
- VM screenshot shows OS issues (not booted, crashed)
- Direct RDP/SSH also fails
- **Root Cause**: VM OS-level issues (port changed, firewall, RDP/SSH app broken)
- **Mitigation**: Fix VM connectivity first (check NSGs, firewall, VM status), then retry Bastion

### Symptom 2: Bastion fails, VM is healthy, network issues
- VM reachable on other services
- Screenshot shows healthy OS
- Direct RDP/SSH works
- **Root Cause**: NSG/UDR misconfiguration between Bastion and VM
- **Mitigation**: Check NSG for ports 3389/22, fix UDR routing

### Symptom 3: Direct RDP/SSH works, only Bastion fails
- All other connectivity is fine
- **Root Cause**: Bastion-side issue
- **Mitigation**: Update case to Product: Azure\Bastion, transfer to Azure Networking POD

### CredSSP Note
Bastion Host may not be patched for CredSSP. If server forces patched client, connection will fail.

## Mitigation Flow

### How to Validate Bastion Host in Environment
1. In ASC, navigate to affected machine → Resource Explorer → note VNet
2. Go to Resource Provider → Microsoft.Networking → look for BastionHost
3. Find Bastion Host sharing same VNet as affected machine

### Mitigation 1 (VM unhealthy)
1. Test direct RDP/SSH on private IP
2. If fails: check firewall, RDP/SSH app, port configuration, CredSSP
3. If resolved, close case; if not, continue with RDP-SSH Basic Workflow

### Mitigation 2 (NSG/UDR issues)
1. Check NSG between Bastion and target VM for RDP/SSH ports
2. Open ports if needed, retry

### Mitigation 3 (Bastion-side issue)
1. Transfer case to Azure Networking POD
2. Update product to Azure\Bastion

## References
- [Azure AD Sign-In for Azure Windows VMs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?wikiVersion=GBmaster&pagePath=%2fGeneralPages%2fAAD%2fAAD+Authentication%2fAzure+AD+Sign+in+for+Azure+Windows+VMs)
