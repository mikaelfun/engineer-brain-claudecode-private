# AVD Host Pool & Session Host Setup Troubleshooting Guide

> Source: [Troubleshoot host pool creation](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-set-up-issues)

## Pre-deployment Checklist

1. **Subscription**: Active subscription with Contributor access (not MSDN/Free/Education for production)
2. **Quota**: Verify VM core quota for target SKU and region
3. **Resource Provider**: Microsoft.DesktopVirtualization registered
4. **Network**: VNet DNS set to Custom (not Default), pointing to DC IPs
5. **Domain Join Account**: No MFA, has domain join permissions, correct credentials

## ARM Template Deployment Errors

### joindomain Failure
- **Credentials wrong** → verify in portal, redeploy
- **Domain not resolvable** → check VNet peering to DC VNet, DNS settings
- **VNet DNS = Default** → set to Custom with DC IPs

### Unauthorized (Scale operation)
- MSDN/Free/Education subscriptions restricted in certain regions
- Change subscription type or region

### VMExtensionProvisioningError
- Often transient → retry
- Verify AVD environment health via PowerShell

### DSC Download Failure (catalogartifact.azureedge.net)
- Firewall/NSG/static route blocking → remove blocking rules
- Alternative: download zip manually, host in allowed location

### InvalidResourceReference
- Resource group name collision → use unique first two characters
- NIC name collision → use different host prefix

### Admin Username Not Allowed
- Forbidden: admin, administrator, root

## Post-deployment

### Cannot Delete Session Host
- Must delete session host record BEFORE deleting VM
- Sequence: drain mode → sign out users → delete session host → delete VM

## Session Host Update (Preview)

### Failed to Initiate
- No session hosts to update
- Insufficient VNet subnet or VM core quota
- Region/subscription/resource group/domain join type changed → remove inconsistent hosts

### Mid-update Failures
- First batch failures → usually parameter issues, don't retry blindly
- Later batch failures → often intermittent, retry usually works
- Ensure image has NO PowerShell DSC extension (remove C:\packages\plugin)
