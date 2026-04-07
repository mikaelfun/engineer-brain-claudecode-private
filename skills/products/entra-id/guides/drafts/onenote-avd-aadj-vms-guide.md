# AVD + Azure AD-Joined VMs Guide

> Source: OneNote - Azure AD-joined VMs (AVD Feature Verification)

## Supported Configurations
- **Personal desktops** with local user profiles
- **Pooled desktops** as jump box (no data saved on VM)
- **Pooled desktops/apps** where users don't save data on VM

## Known Limitations
- No external user support
- Only local user profiles (no FSLogix with AAD-only)
- Cannot access Azure Files for FSLogix or MSIX app attach (requires Kerberos)
- Windows Store client not supported
- SSO not natively supported (use AAD RDS Auth Protocol)
- Windows 10 version 2004+ required
- Intune management only in Azure Public cloud
- Don't mix domain join types in same host pool

## MFA/CA Behavior Matrix

| Client | MFA Config | AVD Client MFA Required | AVD Client Login | Desktop MFA Required | Desktop Login |
|--------|-----------|------------------------|-----------------|---------------------|--------------|
| Standard | Legacy per-user MFA | Yes | Yes | Yes | No |
| Standard | MFA via CA | Yes | Yes | No | Yes |
| AADJ | Legacy per-user MFA | No* | Yes | Yes | No |
| AADJ | MFA via CA | No* | Yes | No | Yes |

## Deployment Steps
1. Deploy Azure AD-joined VM from portal
2. Assign users:
   - `Virtual Machine User Login` role for sign-in
   - `Virtual Machine Administrator Login` role for admin access
3. Client PC requirements (one of):
   - AAD-joined to same tenant
   - Hybrid AAD-joined to same tenant
   - Windows 10 2004+ AAD-registered to same tenant
4. For non-AAD-joined clients: add `targetisaadjoined:i:1` as custom RDP property

## References
- [Deploy AAD-joined VMs](https://docs.azure.cn/en-us/virtual-desktop/deploy-azure-ad-joined-vm)
- [VM sign-in with AAD](https://docs.microsoft.com/en-us/azure/active-directory/devices/howto-vm-sign-in-azure-ad-windows)
