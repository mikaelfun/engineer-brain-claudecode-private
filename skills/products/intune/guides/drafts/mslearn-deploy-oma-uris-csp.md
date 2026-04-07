# Deploying Custom OMA-URIs to Target CSP via Intune

> Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/deploy-oma-uris-to-target-csp-via-intune
> ID: intune-mslearn-091

## Overview

Custom OMA-URI profiles allow configuring Windows settings not yet available in Intune admin center UI, using Windows Configuration Service Providers (CSPs).

## Key Concepts

### CSP Scope
- **User scope**: `./User/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- **Device scope**: `./Device/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- Scope is dictated by the platform, not MDM provider
- Reference: [CSP documentation](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-configuration-service-provider)

### Architecture Flow
1. OMA-URI = payload (setting path + value)
2. Custom policy = container in Intune
3. Intune = delivery mechanism (OMA-DM protocol, XML-based SyncML)
4. CSP on client = reads and applies settings (typically registry keys)

### Built-in vs Custom
- Built-in Intune profiles use the same underlying mechanism but with friendly UI
- Use built-in settings whenever possible; custom OMA-URI only for unavailable options

## Policy Behavior Notes

- Policy changes pushed automatically to device
- **Removing policy assignment may NOT revert settings to default** (no tattoo removal)
- Exceptions: Wi-Fi, VPN, certificate, and email profiles ARE removed when unassigned
- Behavior controlled by each CSP

## Troubleshooting Custom Policies

### Common Issue Categories
1. Custom policy did not reach the client
2. Policy reached client but expected behavior not observed

### Diagnostic Steps
1. **Check MDM diagnostic logs** on the device
2. **Check Windows Event Log**: `DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
3. Both logs should reference the custom policy/OMA-URI
4. No reference = policy not delivered → verify configuration and group targeting
5. Error entries may indicate OMA-URI syntax problems

### Common Causes of Failure
- Incorrect OMA-URI string syntax
- Wrong CSP scope (user vs device)
- Policy assigned to wrong group
- CSP not supported on target Windows version

## Migration from Group Policy

- Use MDM Migration Analysis Tool (MMAT) to analyze existing GPO settings
- MMAT generates report showing MDM equivalents for each GPO
- Key mapping: Domain Controllers → MDM server (Intune), Sysvol → Intune DB, CSE → CSPs, SMB → HTTPS, .pol → SyncML
